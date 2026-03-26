--[[
    WorldBoss.lua — Train 6-7: Survival English
    Stage 19: Weekly Boss + Appointment Gaming
    
    DESIGN LAW:
    - Mega Brainrot spawns on schedule (appointment gaming)
    - Exclusive loot table (unique items only from boss)
    - Server-wide cooperation required
    - English Challenge integration (Gospel 444)
    - Limited attempts per week (scarcity = value)
    
    ARCHITECTURE:
    - Server-authoritative boss state
    - Phase-based boss mechanics
    - Damage tracking for loot distribution
    - Scheduled spawns using os.time()
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
        spawnDays = { "Saturday" },  -- Weekly on Saturday
        spawnHourUTC = 14,           -- 2 PM UTC = 9 PM ICT
        durationMinutes = 30,
        maxParticipants = 50,
        minDamageForLoot = 500,      -- Must deal 500+ damage to qualify
        
        phaseConfig = {
            [1] = {
                hpThreshold = 1.0,
                attackSpeed = 1.0,
                abilities = { "slam", "charge" },
                addSpawnRate = 30,    -- seconds between add spawns
            },
            [2] = {
                hpThreshold = 0.66,
                attackSpeed = 1.5,
                abilities = { "slam", "charge", "aoe_shockwave" },
                addSpawnRate = 20,
                englishChallenge = true, -- Gospel 444: English phase
            },
            [3] = {
                hpThreshold = 0.33,
                attackSpeed = 2.0,
                abilities = { "slam", "charge", "aoe_shockwave", "enrage_beam" },
                addSpawnRate = 10,
                englishChallenge = true,
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
                guaranteedRarity = "Epic", -- MVP gets guaranteed Epic+ drop
            },
        },
    },
}

-- ============================================================
-- CONFIGURATION
-- ============================================================

local CONFIG = {
    MAX_WEEKLY_ATTEMPTS = 3,       -- Per player per boss per week
    RESPAWN_DELAY = 0,             -- Boss spawns immediately at scheduled time
    ENGLISH_DAMAGE_BONUS = 1.5,    -- 50% more damage during English challenge phase
    ENGLISH_QUESTIONS_PER_PHASE = 3,
    DAMAGE_LEADERBOARD_SIZE = 10,
}

-- ============================================================
-- STATE
-- ============================================================

local activeBoss = nil             -- Current boss instance
local participantDamage = {}       -- [userId] = totalDamage
local playerWeeklyAttempts = {}    -- [userId_bossId_weekKey] = attempts
local bossSpawnScheduled = false

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
    
    -- Auto-despawn timer
    task.delay(bossConfig.durationMinutes * 60, function()
        if activeBoss and not activeBoss.defeated then
            print(string.format("[WorldBoss] %s despawned (timeout)", bossConfig.name))
            WorldBoss._EndBoss(false) -- Not defeated, timed out
        end
    end)
    
    return { success = true, bossName = bossConfig.name }
end

function WorldBoss.DealDamage(player, damage)
    if not activeBoss then
        return { success = false, error = "NO_ACTIVE_BOSS" }
    end
    
    local userId = player.UserId
    
    -- Weekly attempt check
    local attemptKey = userId .. "_" .. activeBoss.config.id .. "_" .. getWeekKey()
    local attempts = playerWeeklyAttempts[attemptKey] or 0
    if attempts >= CONFIG.MAX_WEEKLY_ATTEMPTS then
        return { success = false, error = "WEEKLY_LIMIT_REACHED" }
    end
    
    -- Track first hit as an attempt
    if not participantDamage[userId] then
        playerWeeklyAttempts[attemptKey] = attempts + 1
    end
    
    -- English challenge bonus
    local currentPhase = activeBoss.config.phaseConfig[activeBoss.phase]
    if currentPhase and currentPhase.englishChallenge then
        damage = math.floor(damage * CONFIG.ENGLISH_DAMAGE_BONUS)
    end
    
    -- Apply damage
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
    
    -- Check defeat
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
    
    -- Sort participants by damage for MVP
    local sorted = {}
    for odId, dmg in pairs(participantDamage) do
        if dmg >= activeBoss.config.minDamageForLoot then
            table.insert(sorted, { userId = odId, damage = dmg })
        end
    end
    table.sort(sorted, function(a, b) return a.damage > b.damage end)
    
    -- Distribute guaranteed loot to all qualifying participants
    for _, participant in ipairs(sorted) do
        local player = Players:GetPlayerByUserId(participant.userId)
        if player then
            -- Guaranteed rewards
            for _, item in ipairs(lootTable.guaranteed) do
                print(string.format("[WorldBoss Loot] Player %d: %s x%d",
                    participant.userId, item.name, item.count))
            end
            
            -- Random loot roll
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
    
    -- MVP bonus
    if #sorted > 0 then
        local mvp = sorted[1]
        print(string.format("[WorldBoss] MVP: Player %d with %d damage!", mvp.userId, mvp.damage))
    end
    
    -- Grant boss currency to top participants
    if EconomyManager then
        for i, participant in ipairs(sorted) do
            local player = Players:GetPlayerByUserId(participant.userId)
            if player then
                local coinReward = math.max(500, 2000 - (i * 50)) -- Diminishing by rank
                EconomyManager.AddBalance(player, "SurvivalCoins", coinReward, "world_boss_" .. activeBoss.config.id)
            end
        end
    end
end

-- ============================================================
-- CLIENT API
-- ============================================================

function WorldBoss.GetStatus()
    if not activeBoss then
        -- Find next spawn time
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
        participantCount = 0, -- Count from participants table
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
        task.wait(60) -- Check every minute
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
