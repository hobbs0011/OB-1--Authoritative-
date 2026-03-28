--[[
    WorldBoss.lua — Weekly Boss + Appointment Gaming
    Skibidi Zombie: Survive the Brainrots
    
    DESIGN LAW:
    - Mega Brainrot spawns on schedule (appointment gaming)
    - Exclusive loot table (unique items only from boss)
    - Server-wide cooperation required
    - Limited attempts per week (scarcity = value)
    - ZERO ESL. Pure combat damage. Kill to earn.
    
    Version: 1.1 — ESL PURGE
    Date: 2026-03-28
]]

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local BossStore = DataStoreService:GetDataStore("WorldBoss_v1")

local WorldBoss = {}
WorldBoss.__index = WorldBoss

-- ============================================================
-- BOSS DEFINITIONS
-- ============================================================

local BOSSES = {
    {
        id = "mega_brainrot_sigma",
        name = "Mega Brainrot Sigma",
        maxHP = 500000,
        phases = 3,
        spawnDays = { "Saturday" },
        spawnHourUTC = 14,
        durationMinutes = 30,
        maxParticipants = 50,
        minDamageForLoot = 500,
        
        phaseConfig = {
            [1] = {
                hpThreshold = 1.0,
                attackSpeed = 1.0,
                abilities = { "slam", "charge" },
                addSpawnRate = 30,
            },
            [2] = {
                hpThreshold = 0.66,
                attackSpeed = 1.5,
                abilities = { "slam", "charge", "aoe_shockwave" },
                addSpawnRate = 20,
                -- Phase 2: enrage begins, faster attacks, more adds
            },
            [3] = {
                hpThreshold = 0.33,
                attackSpeed = 2.0,
                abilities = { "slam", "charge", "aoe_shockwave", "enrage_beam" },
                addSpawnRate = 10,
                -- Phase 3: full enrage, all abilities unlocked
            },
        },
        
        lootTable = {
            guaranteed = {
                { id = "boss_token", name = "Sigma Essence", count = 5 },
            },
            random = {
                { id = "boss_rare_aura",     name = "Sigma Aura",              rarity = "Rare",      weight = 30 },
                { id = "boss_rare_pet",      name = "Mini Sigma Pet",           rarity = "Rare",      weight = 25 },
                { id = "boss_epic_skin",     name = "Sigma Slayer Skin",        rarity = "Epic",      weight = 15 },
                { id = "boss_epic_weapon",   name = "Sigma Blade",              rarity = "Epic",      weight = 12 },
                { id = "boss_legendary_aura",name = "Mega Sigma Aura",          rarity = "Legendary", weight = 5 },
                { id = "boss_legendary_pet", name = "Sigma Guardian Pet",       rarity = "Legendary", weight = 3 },
                { id = "boss_mythic",        name = "Sigma God Transformation", rarity = "Mythic",    weight = 0.5 },
            },
            mvpBonus = {
                { id = "boss_mvp_title", name = "Sigma Slayer Title" },
                guaranteedRarity = "Epic",
            },
        },
    },
}

-- ============================================================
-- CONFIGURATION — ZERO ESL
-- ============================================================

local CONFIG = {
    MAX_WEEKLY_ATTEMPTS = 3,
    RESPAWN_DELAY = 0,
    DAMAGE_LEADERBOARD_SIZE = 10,
    PARRY_DAMAGE_BONUS = 1.5,  -- 50% bonus during boss stun (replaced English bonus)
}

-- ============================================================
-- STATE
-- ============================================================

local activeBoss = nil
local participantDamage = {}
local playerWeeklyAttempts = {}

-- ============================================================
-- SCHEDULING
-- ============================================================

local function getWeekKey()
    local d = os.date("!*t", os.time())
    local dayOfYear = os.date("!%j", os.time())
    return string.format("%04dW%02d", d.year, math.ceil(tonumber(dayOfYear) / 7))
end

local function getDayName()
    local days = { "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" }
    local d = os.date("!*t", os.time())
    return days[d.wday]
end

local function shouldSpawnBoss(bossConfig)
    local currentDay = getDayName()
    local currentHour = tonumber(os.date("!%H", os.time()))
    
    for _, day in ipairs(bossConfig.spawnDays) do
        if currentDay == day and currentHour == bossConfig.spawnHourUTC then
            return true
        end
    end
    return false
end

-- ============================================================
-- BOSS LIFECYCLE
-- ============================================================

function WorldBoss.SpawnBoss(bossConfig)
    if activeBoss then
        return { success = false, error = "BOSS_ALREADY_ACTIVE" }
    end
    
    activeBoss = {
        config = bossConfig,
        currentHP = bossConfig.maxHP,
        maxHP = bossConfig.maxHP,
        phase = 1,
        spawnedAt = os.time(),
        expiresAt = os.time() + (bossConfig.durationMinutes * 60),
        defeated = false,
        participants = {},
    }
    participantDamage = {}
    
    print(string.format("[WorldBoss] %s has spawned! HP: %d", bossConfig.name, bossConfig.maxHP))
    
    task.delay(bossConfig.durationMinutes * 60, function()
        if activeBoss and not activeBoss.defeated then
            print(string.format("[WorldBoss] %s despawned (timeout)", bossConfig.name))
            WorldBoss._EndBoss(false)
        end
    end)
    
    return { success = true, bossName = bossConfig.name }
end

function WorldBoss.DealDamage(player, damage)
    if not activeBoss then
        return { success = false, error = "NO_ACTIVE_BOSS" }
    end
    
    local userId = player.UserId
    
    local attemptKey = userId .. "_" .. activeBoss.config.id .. "_" .. getWeekKey()
    local attempts = playerWeeklyAttempts[attemptKey] or 0
    if attempts >= CONFIG.MAX_WEEKLY_ATTEMPTS then
        return { success = false, error = "WEEKLY_LIMIT_REACHED" }
    end
    
    if not participantDamage[userId] then
        playerWeeklyAttempts[attemptKey] = attempts + 1
    end
    
    -- Pure combat damage — no ESL gates
    participantDamage[userId] = (participantDamage[userId] or 0) + damage
    activeBoss.currentHP = math.max(0, activeBoss.currentHP - damage)
    activeBoss.participants[tostring(userId)] = true
    
    -- Phase transitions
    local hpPercent = activeBoss.currentHP / activeBoss.maxHP
    for phase = #activeBoss.config.phaseConfig, 1, -1 do
        if hpPercent <= activeBoss.config.phaseConfig[phase].hpThreshold and phase > activeBoss.phase then
            activeBoss.phase = phase
            print(string.format("[WorldBoss] Phase %d! HP: %d/%d", phase, activeBoss.currentHP, activeBoss.maxHP))
        end
    end
    
    if activeBoss.currentHP <= 0 then
        activeBoss.defeated = true
        WorldBoss._EndBoss(true)
    end
    
    return {
        success = true,
        damageDealt = damage,
        bossHP = activeBoss.currentHP,
        bossMaxHP = activeBoss.maxHP,
        phase = activeBoss.phase,
    }
end

function WorldBoss._EndBoss(defeated)
    if not activeBoss then return end
    
    if defeated then
        print(string.format("[WorldBoss] %s DEFEATED!", activeBoss.config.name))
        WorldBoss._DistributeLoot()
    else
        print(string.format("[WorldBoss] %s escaped!", activeBoss.config.name))
    end
    
    activeBoss = nil
    participantDamage = {}
end

-- ============================================================
-- LOOT DISTRIBUTION
-- ============================================================

function WorldBoss._DistributeLoot()
    if not activeBoss then return end
    
    local lootTable = activeBoss.config.lootTable
    local EconomyManager = require(script.Parent:FindFirstChild("EconomyManager"))
    
    local sorted = {}
    for odId, dmg in pairs(participantDamage) do
        if dmg >= activeBoss.config.minDamageForLoot then
            table.insert(sorted, { userId = odId, damage = dmg })
        end
    end
    table.sort(sorted, function(a, b) return a.damage > b.damage end)
    
    for _, participant in ipairs(sorted) do
        local player = Players:GetPlayerByUserId(participant.userId)
        if player then
            for _, item in ipairs(lootTable.guaranteed) do
                print(string.format("[WorldBoss Loot] Player %d: %s x%d",
                    participant.userId, item.name, item.count))
            end
            
            local totalWeight = 0
            for _, item in ipairs(lootTable.random) do
                totalWeight = totalWeight + item.weight
            end
            
            local roll = math.random() * totalWeight
            local cumulative = 0
            for _, item in ipairs(lootTable.random) do
                cumulative = cumulative + item.weight
                if roll <= cumulative then
                    print(string.format("[WorldBoss Loot] Player %d: %s (%s)",
                        participant.userId, item.name, item.rarity))
                    break
                end
            end
        end
    end
    
    if #sorted > 0 then
        local mvp = sorted[1]
        print(string.format("[WorldBoss] MVP: Player %d with %d damage!", mvp.userId, mvp.damage))
    end
    
    if EconomyManager then
        for i, participant in ipairs(sorted) do
            local player = Players:GetPlayerByUserId(participant.userId)
            if player then
                local coinReward = math.max(500, 2000 - (i * 50))
                EconomyManager.AddCoins(player, coinReward, "world_boss_" .. activeBoss.config.id)
            end
        end
    end
end

-- ============================================================
-- CLIENT API
-- ============================================================

function WorldBoss.GetStatus()
    if not activeBoss then
        local nextSpawn = "Unknown"
        for _, boss in ipairs(BOSSES) do
            nextSpawn = string.format("%s at %d:00 UTC", boss.spawnDays[1], boss.spawnHourUTC)
        end
        return {
            active = false,
            nextSpawn = nextSpawn,
        }
    end
    
    return {
        active = true,
        name = activeBoss.config.name,
        currentHP = activeBoss.currentHP,
        maxHP = activeBoss.maxHP,
        phase = activeBoss.phase,
        maxPhases = #activeBoss.config.phaseConfig,
        timeRemaining = math.max(0, activeBoss.expiresAt - os.time()),
        participantCount = 0,
    }
end

function WorldBoss.GetDamageLeaderboard()
    local sorted = {}
    for odId, dmg in pairs(participantDamage) do
        table.insert(sorted, { userId = odId, damage = dmg })
    end
    table.sort(sorted, function(a, b) return a.damage > b.damage end)
    
    local leaderboard = {}
    for i = 1, math.min(CONFIG.DAMAGE_LEADERBOARD_SIZE, #sorted) do
        local entry = sorted[i]
        local nameSuccess, name = pcall(function()
            return Players:GetNameFromUserIdAsync(entry.userId)
        end)
        table.insert(leaderboard, {
            rank = i,
            displayName = nameSuccess and name or ("Player_" .. entry.userId),
            damage = entry.damage,
        })
    end
    return leaderboard
end

function WorldBoss.GetMyAttempts(player, bossId)
    local attemptKey = player.UserId .. "_" .. bossId .. "_" .. getWeekKey()
    return {
        used = playerWeeklyAttempts[attemptKey] or 0,
        max = CONFIG.MAX_WEEKLY_ATTEMPTS,
    }
end

-- ============================================================
-- SPAWN SCHEDULER
-- ============================================================

task.spawn(function()
    while true do
        task.wait(60)
        for _, bossConfig in ipairs(BOSSES) do
            if not activeBoss and shouldSpawnBoss(bossConfig) then
                WorldBoss.SpawnBoss(bossConfig)
            end
        end
    end
end)

-- ============================================================
-- REMOTE SETUP
-- ============================================================

local BossRemote = Instance.new("RemoteFunction")
BossRemote.Name = "WorldBossRemote"
BossRemote.Parent = ReplicatedStorage

BossRemote.OnServerInvoke = function(player, action, ...)
    if action == "GetStatus" then
        return WorldBoss.GetStatus()
    elseif action == "GetLeaderboard" then
        return WorldBoss.GetDamageLeaderboard()
    elseif action == "GetMyAttempts" then
        return WorldBoss.GetMyAttempts(player, ...)
    elseif action == "DealDamage" then
        return WorldBoss.DealDamage(player, ...)
    end
    return { success = false, error = "INVALID_ACTION" }
end

return WorldBoss
