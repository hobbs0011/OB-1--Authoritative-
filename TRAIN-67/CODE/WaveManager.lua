--[[
    WaveManager.lua — Wave Progression System
    Skibidi Zombie: Survive the Brainrots
    
    GOAL: MAKE MONEY. Waves create tension → engagement → spending.
    
    Controls: wave number, enemy count scaling, boss waves,
    intermission timing, difficulty curve, wave rewards.
    
    Architecture: ModuleScript (ServerStorage)
    Version: 1.0.0
    Date: 2026-03-26
--]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerStorage = game:GetService("ServerStorage")

local WaveManager = {}

local EnemyFactory = nil
local CombatSystem = nil

local CONFIG = {
    INTERMISSION_DURATION = 8,
    MIN_INTERMISSION = 4,
    ENEMIES_BASE = 5,
    ENEMIES_PER_WAVE = 2,
    ENEMIES_MAX = 25,
    BOSS_WAVE_INTERVAL = 5,
    WAVE_CLEAR_COINS = 50,
    BOSS_WAVE_BONUS_COINS = 100,
    MAX_WAVE = 999,
    SPAWN_RADIUS = 60,
    SPAWN_HEIGHT = 5,
    DIFFICULTY_TIERS = {
        { wave = 1,  tier = 1, label = "Mouse Waves" },
        { wave = 5,  tier = 2, label = "Cat Waves" },
        { wave = 10, tier = 3, label = "Wolf Waves" },
        { wave = 20, tier = 4, label = "Lion Waves" },
        { wave = 35, tier = 5, label = "Tiger Waves" },
    },
}

local state = {
    currentWave = 0,
    phase = "idle",  -- idle | intermission | active | boss | complete
    phaseStartTime = 0,
    enemiesSpawned = 0,
    enemiesKilled = 0,
    enemiesTarget = 0,
    spawnQueue = {},
    spawnTimer = 0,
    highestWave = 0,
}

function WaveManager.Init()
    local ok1, ef = pcall(require, ServerStorage:FindFirstChild("EnemyFactory"))
    if ok1 then EnemyFactory = ef end
    local ok2, cs = pcall(require, ServerStorage:FindFirstChild("CombatSystem"))
    if ok2 then CombatSystem = cs end
    state.currentWave = 0
    state.phase = "idle"
    print("[WaveManager] Initialized — infinite wave system ready")
    return true
end

function WaveManager.StartGame()
    state.currentWave = 0
    state.phase = "intermission"
    state.phaseStartTime = tick()
    WaveManager._broadcastWaveUpdate()
    return true
end

function WaveManager.Tick(dt)
    if state.phase == "idle" then
        -- Check if we have players and should auto-start
        if #Players:GetPlayers() > 0 and state.currentWave == 0 then
            WaveManager.StartGame()
        end
        return
    end
    
    if state.phase == "intermission" then
        local elapsed = tick() - state.phaseStartTime
        local duration = math.max(CONFIG.MIN_INTERMISSION, CONFIG.INTERMISSION_DURATION - state.currentWave * 0.2)
        if elapsed >= duration then
            WaveManager._startNextWave()
        end
        return
    end
    
    if state.phase == "active" or state.phase == "boss" then
        -- Spawn enemies from queue
        state.spawnTimer = state.spawnTimer + dt
        local interval = EnemyFactory and EnemyFactory.GetSpawnInterval() or 2.0
        if state.spawnTimer >= interval and #state.spawnQueue > 0 then
            state.spawnTimer = 0
            local templateKey = table.remove(state.spawnQueue, 1)
            local pos = WaveManager._getSpawnPosition()
            if EnemyFactory then
                local enemy = EnemyFactory.SpawnEnemy(templateKey, pos, state.currentWave)
                if enemy then
                    state.enemiesSpawned = state.enemiesSpawned + 1
                    WaveManager._broadcastEnemySpawn(enemy)
                end
            end
        end
        
        -- Check wave clear
        if EnemyFactory and state.enemiesSpawned >= state.enemiesTarget then
            local alive = EnemyFactory.GetAliveCount()
            if alive == 0 then
                WaveManager._onWaveClear()
            end
        end
        return
    end
end

function WaveManager._startNextWave()
    state.currentWave = state.currentWave + 1
    if state.currentWave > state.highestWave then
        state.highestWave = state.currentWave
    end
    
    local isBoss = (state.currentWave % CONFIG.BOSS_WAVE_INTERVAL == 0)
    state.phase = isBoss and "boss" or "active"
    state.phaseStartTime = tick()
    state.enemiesSpawned = 0
    state.enemiesKilled = 0
    state.spawnTimer = 0
    
    -- Calculate enemy count
    local count = math.min(CONFIG.ENEMIES_MAX, CONFIG.ENEMIES_BASE + (state.currentWave - 1) * CONFIG.ENEMIES_PER_WAVE)
    state.enemiesTarget = count
    
    -- Build spawn queue
    state.spawnQueue = WaveManager._buildSpawnQueue(count, isBoss)
    
    if EnemyFactory then
        EnemyFactory.SetWave(state.currentWave)
    end
    
    WaveManager._broadcastWaveUpdate()
end

function WaveManager._buildSpawnQueue(count, isBoss)
    local queue = {}
    if isBoss then
        table.insert(queue, "sigma_boss")
        count = count - 1
    end
    
    local templates = { "skibidi_zombie", "ohio_anomaly", "rizz_merchant", "brainrot_mutant" }
    local weights = { 40, 25, 15, 10 }
    
    -- Shift weights based on wave (more dangerous at higher waves)
    if state.currentWave >= 10 then
        weights = { 30, 25, 20, 15 }
    end
    if state.currentWave >= 20 then
        weights = { 20, 25, 25, 20 }
    end
    
    local totalWeight = 0
    for _, w in ipairs(weights) do totalWeight = totalWeight + w end
    
    for i = 1, count do
        local roll = math.random() * totalWeight
        local cum = 0
        local pick = templates[1]
        for j, key in ipairs(templates) do
            cum = cum + weights[j]
            if roll <= cum then
                pick = key
                break
            end
        end
        table.insert(queue, pick)
    end
    
    return queue
end

function WaveManager._onWaveClear()
    local isBoss = (state.currentWave % CONFIG.BOSS_WAVE_INTERVAL == 0)
    local reward = isBoss and (CONFIG.WAVE_CLEAR_COINS + CONFIG.BOSS_WAVE_BONUS_COINS) or CONFIG.WAVE_CLEAR_COINS
    
    -- Reward all players
    for _, player in ipairs(Players:GetPlayers()) do
        if CombatSystem then
            CombatSystem.OnWaveCleared(player)
        end
    end
    
    state.phase = "intermission"
    state.phaseStartTime = tick()
    
    WaveManager._broadcastWaveUpdate()
end

function WaveManager.OnEnemyKilled(enemyId)
    state.enemiesKilled = state.enemiesKilled + 1
end

function WaveManager._getSpawnPosition()
    local angle = math.random() * math.pi * 2
    local radius = CONFIG.SPAWN_RADIUS + math.random(-10, 10)
    return Vector3.new(
        math.cos(angle) * radius,
        CONFIG.SPAWN_HEIGHT,
        math.sin(angle) * radius
    )
end

function WaveManager._broadcastWaveUpdate()
    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if remotes then
        local ev = remotes:FindFirstChild("WaveUpdate")
        if ev then
            local tierLabel = "Mouse Waves"
            for _, t in ipairs(CONFIG.DIFFICULTY_TIERS) do
                if state.currentWave >= t.wave then
                    tierLabel = t.label
                end
            end
            ev:FireAllClients({
                wave = state.currentWave,
                phase = state.phase,
                enemiesTarget = state.enemiesTarget,
                enemiesKilled = state.enemiesKilled,
                isBoss = state.phase == "boss",
                tierLabel = tierLabel,
                highestWave = state.highestWave,
            })
        end
    end
end

function WaveManager._broadcastEnemySpawn(enemy)
    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if remotes then
        local ev = remotes:FindFirstChild("EnemySpawned")
        if ev then
            ev:FireAllClients({
                id = enemy.id,
                name = enemy.name,
                health = enemy.health,
                maxHealth = enemy.maxHealth,
                isBoss = enemy.isBoss,
                position = enemy.position,
            })
        end
    end
end

function WaveManager.GetState()
    return {
        currentWave = state.currentWave,
        phase = state.phase,
        enemiesTarget = state.enemiesTarget,
        enemiesKilled = state.enemiesKilled,
        highestWave = state.highestWave,
    }
end

function WaveManager.GetCurrentWave()
    return state.currentWave
end

return WaveManager
