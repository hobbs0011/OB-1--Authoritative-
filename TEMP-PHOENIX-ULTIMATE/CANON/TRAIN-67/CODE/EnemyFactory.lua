--[[
    EnemyFactory.lua — 5 Brainrot Enemy Types + Spawn Logic
    Skibidi Zombie: Survive the Brainrots
    
    GOAL: MAKE MONEY. Enemies are the engagement loop.
    More enemies = more questions = more play time = more revenue.
    
    Enemy Types:
    1. Skibidi Zombie (basic) — slow, low HP, Tier 1 questions
    2. Sigma Boss — tanky, Tier 3+ questions, big rewards
    3. Ohio Anomaly — fast, erratic movement, Tier 2 questions
    4. Rizz Merchant — charming, heals other enemies, Tier 2 questions
    5. Brainrot Mutant — splits on death, Tier 4+ questions
    
    Architecture: ModuleScript (ServerStorage)
    Version: 1.0.0
    Date: 2026-03-26
--]]

local EnemyFactory = {}

local CONFIG = {
    ENEMY_TEMPLATES = {
        skibidi_zombie = {
            name = "Skibidi Zombie",
            baseHealth = 30,
            speed = 8,
            damage = 5,
            questionTier = 1,
            isBoss = false,
            spawnWeight = 40,
            coinReward = 10,
            description = "The basic shuffler. Toilet head. Slow but relentless.",
        },
        sigma_boss = {
            name = "Sigma Boss",
            baseHealth = 200,
            speed = 6,
            damage = 20,
            questionTier = 3,
            isBoss = true,
            spawnWeight = 5,
            coinReward = 50,
            description = "Lone wolf energy. Doesn't need a pack. Needs 3 correct answers to kill.",
            bossQuestionCount = 3,
        },
        ohio_anomaly = {
            name = "Ohio Anomaly",
            baseHealth = 20,
            speed = 16,
            damage = 8,
            questionTier = 2,
            isBoss = false,
            spawnWeight = 25,
            coinReward = 15,
            description = "Only in Ohio. Erratic zigzag movement. Fast but fragile.",
            movementPattern = "zigzag",
        },
        rizz_merchant = {
            name = "Rizz Merchant",
            baseHealth = 40,
            speed = 10,
            damage = 3,
            questionTier = 2,
            isBoss = false,
            spawnWeight = 15,
            coinReward = 20,
            description = "Charms nearby enemies, healing them. Kill first to break the aura.",
            healRadius = 20,
            healAmount = 2,
            healInterval = 3.0,
        },
        brainrot_mutant = {
            name = "Brainrot Mutant",
            baseHealth = 60,
            speed = 10,
            damage = 12,
            questionTier = 4,
            isBoss = false,
            spawnWeight = 10,
            coinReward = 30,
            description = "Splits into 2 mini-mutants on death. Maximum brainrot.",
            splitsOnDeath = true,
            splitCount = 2,
            splitHealthRatio = 0.3,
        },
    },
    MAX_ENEMIES_ALIVE = 30,
    SPAWN_INTERVAL_BASE = 3.0,
    SPAWN_INTERVAL_MIN = 0.8,
    DIFFICULTY_SCALE_PER_WAVE = 0.1,
    HEALTH_SCALE_PER_WAVE = 0.15,
}

local activeEnemies = {}
local nextEnemyId = 1
local currentWave = 1

function EnemyFactory.Init()
    activeEnemies = {}
    nextEnemyId = 1
    currentWave = 1
    print("[EnemyFactory] Initialized — 5 brainrot types loaded")
    return true
end

function EnemyFactory.SpawnEnemy(templateKey, position, waveNumber)
    if EnemyFactory.GetAliveCount() >= CONFIG.MAX_ENEMIES_ALIVE then
        return nil
    end
    
    local template = CONFIG.ENEMY_TEMPLATES[templateKey]
    if not template then
        warn("[EnemyFactory] Unknown template: " .. tostring(templateKey))
        return nil
    end
    
    local wave = waveNumber or currentWave
    local healthScale = 1 + (wave - 1) * CONFIG.HEALTH_SCALE_PER_WAVE
    
    local enemy = {
        id = nextEnemyId,
        templateKey = templateKey,
        name = template.name,
        health = math.floor(template.baseHealth * healthScale),
        maxHealth = math.floor(template.baseHealth * healthScale),
        speed = template.speed,
        damage = template.damage,
        questionTier = template.questionTier,
        isBoss = template.isBoss,
        coinReward = template.coinReward,
        position = position or Vector3.new(0, 5, 0),
        isAlive = true,
        spawnTime = tick(),
        wave = wave,
        movementPattern = template.movementPattern or "direct",
        bossQuestionCount = template.bossQuestionCount,
        bossQuestionsAnswered = 0,
        -- Special abilities
        splitsOnDeath = template.splitsOnDeath or false,
        splitCount = template.splitCount or 0,
        splitHealthRatio = template.splitHealthRatio or 0,
        healRadius = template.healRadius,
        healAmount = template.healAmount,
        healInterval = template.healInterval,
        lastHealTime = 0,
        -- Model reference (set by spawner)
        model = nil,
    }
    
    nextEnemyId = nextEnemyId + 1
    activeEnemies[enemy.id] = enemy
    return enemy
end

function EnemyFactory.SpawnWaveEnemies(waveNumber, spawnPositions)
    currentWave = waveNumber
    local spawned = {}
    local totalWeight = 0
    
    for _, template in pairs(CONFIG.ENEMY_TEMPLATES) do
        totalWeight = totalWeight + template.spawnWeight
    end
    
    local enemyCount = math.min(5 + waveNumber * 2, 20)
    
    -- Boss every 5 waves
    local includeBoss = (waveNumber % 5 == 0)
    
    if includeBoss then
        local bossPos = spawnPositions and spawnPositions[1] or Vector3.new(math.random(-50,50), 5, math.random(-50,50))
        local boss = EnemyFactory.SpawnEnemy("sigma_boss", bossPos, waveNumber)
        if boss then table.insert(spawned, boss) end
        enemyCount = enemyCount - 1
    end
    
    for i = 1, enemyCount do
        local roll = math.random() * totalWeight
        local cumulative = 0
        local selectedKey = "skibidi_zombie"
        
        for key, template in pairs(CONFIG.ENEMY_TEMPLATES) do
            if not template.isBoss then
                cumulative = cumulative + template.spawnWeight
                if roll <= cumulative then
                    selectedKey = key
                    break
                end
            end
        end
        
        local pos = spawnPositions and spawnPositions[((i-1) % #spawnPositions) + 1]
            or Vector3.new(math.random(-80,80), 5, math.random(-80,80))
        local enemy = EnemyFactory.SpawnEnemy(selectedKey, pos, waveNumber)
        if enemy then table.insert(spawned, enemy) end
    end
    
    return spawned
end

function EnemyFactory.DamageEnemy(enemyId, damage)
    local enemy = activeEnemies[enemyId]
    if not enemy or not enemy.isAlive then return nil end
    
    enemy.health = enemy.health - damage
    
    if enemy.health <= 0 then
        enemy.isAlive = false
        local result = {
            killed = true,
            enemyId = enemyId,
            coinReward = enemy.coinReward,
            isBoss = enemy.isBoss,
            splits = {},
        }
        
        -- Split on death
        if enemy.splitsOnDeath and enemy.splitCount > 0 then
            for s = 1, enemy.splitCount do
                local miniHealth = math.floor(enemy.maxHealth * enemy.splitHealthRatio)
                local offset = Vector3.new(math.random(-5,5), 0, math.random(-5,5))
                local mini = {
                    id = nextEnemyId,
                    templateKey = enemy.templateKey .. "_mini",
                    name = "Mini " .. enemy.name,
                    health = miniHealth,
                    maxHealth = miniHealth,
                    speed = enemy.speed * 1.3,
                    damage = math.floor(enemy.damage * 0.5),
                    questionTier = math.max(1, enemy.questionTier - 1),
                    isBoss = false,
                    coinReward = math.floor(enemy.coinReward * 0.3),
                    position = enemy.position + offset,
                    isAlive = true,
                    spawnTime = tick(),
                    wave = enemy.wave,
                    movementPattern = "direct",
                    splitsOnDeath = false,
                    splitCount = 0,
                    splitHealthRatio = 0,
                    model = nil,
                }
                nextEnemyId = nextEnemyId + 1
                activeEnemies[mini.id] = mini
                table.insert(result.splits, mini)
            end
        end
        
        return result
    end
    
    return { killed = false, enemyId = enemyId, remainingHealth = enemy.health }
end

function EnemyFactory.GetEnemy(enemyId)
    return activeEnemies[enemyId]
end

function EnemyFactory.GetAliveCount()
    local count = 0
    for _, e in pairs(activeEnemies) do
        if e.isAlive then count = count + 1 end
    end
    return count
end

function EnemyFactory.GetAllAlive()
    local alive = {}
    for _, e in pairs(activeEnemies) do
        if e.isAlive then table.insert(alive, e) end
    end
    return alive
end

function EnemyFactory.CleanDead()
    local removed = 0
    for id, e in pairs(activeEnemies) do
        if not e.isAlive and (tick() - e.spawnTime) > 5 then
            activeEnemies[id] = nil
            removed = removed + 1
        end
    end
    return removed
end

function EnemyFactory.Tick(dt)
    local now = tick()
    -- Rizz Merchant heal aura
    for _, e in pairs(activeEnemies) do
        if e.isAlive and e.healRadius and e.healAmount then
            if now - (e.lastHealTime or 0) >= (e.healInterval or 3) then
                e.lastHealTime = now
                for _, other in pairs(activeEnemies) do
                    if other.isAlive and other.id ~= e.id then
                        local dist = (other.position - e.position).Magnitude
                        if dist <= e.healRadius then
                            other.health = math.min(other.maxHealth, other.health + e.healAmount)
                        end
                    end
                end
            end
        end
    end
    -- Periodic cleanup
    if math.random() < 0.05 then
        EnemyFactory.CleanDead()
    end
end

function EnemyFactory.SetWave(wave)
    currentWave = wave
end

function EnemyFactory.GetSpawnInterval()
    return math.max(CONFIG.SPAWN_INTERVAL_MIN, CONFIG.SPAWN_INTERVAL_BASE - (currentWave - 1) * 0.15)
end

function EnemyFactory.GetTemplates()
    return CONFIG.ENEMY_TEMPLATES
end

return EnemyFactory
