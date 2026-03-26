--[[
    ChallengeManager.lua — Train 6-7: Survival English
    Stage 12: Daily Challenge System
    
    DESIGN LAW:
    - 3 rotating daily challenges per player
    - Server-authoritative progress tracking
    - Streak multiplier rewards consistency
    - Challenges reset at midnight UTC
    - Gospel 444 integration: English challenges bonus XP
    
    CHALLENGE TYPES:
    1. Kill challenges (kill X enemies)
    2. Survival challenges (survive X minutes)
    3. Collection challenges (collect X items)
    4. English challenges (answer X questions correctly) — BONUS REWARDS
    5. Social challenges (trade X times, revive X teammates)
    6. Economy challenges (earn X coins, spend X coins)
]]

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local ChallengeStore = DataStoreService:GetDataStore("DailyChallenges_v1")

local ChallengeManager = {}
ChallengeManager.__index = ChallengeManager

-- ============================================================
-- CHALLENGE POOL
-- ============================================================

local CHALLENGE_POOL = {
    -- KILL CHALLENGES
    { id = "kill_10",       type = "kill",       target = 10,  name = "Exterminator",        description = "Kill 10 enemies",                reward = { coins = 200 } },
    { id = "kill_25",       type = "kill",       target = 25,  name = "Slayer",              description = "Kill 25 enemies",                reward = { coins = 500 } },
    { id = "kill_50",       type = "kill",       target = 50,  name = "Massacre",            description = "Kill 50 enemies",                reward = { coins = 1000, gems = 5 } },
    { id = "kill_boss",     type = "kill_boss",  target = 1,   name = "Boss Hunter",         description = "Defeat a boss enemy",            reward = { coins = 750, gems = 10 } },
    
    -- SURVIVAL CHALLENGES
    { id = "survive_5",     type = "survive",    target = 300,  name = "Survivor",           description = "Survive 5 minutes",              reward = { coins = 150 } },
    { id = "survive_10",    type = "survive",    target = 600,  name = "Endurance",          description = "Survive 10 minutes",             reward = { coins = 400 } },
    { id = "survive_20",    type = "survive",    target = 1200, name = "Iron Will",          description = "Survive 20 minutes",             reward = { coins = 800, gems = 5 } },
    { id = "no_damage_60",  type = "no_damage",  target = 60,   name = "Untouchable",       description = "Take no damage for 60 seconds",  reward = { coins = 600, gems = 3 } },
    
    -- COLLECTION CHALLENGES
    { id = "collect_coins_500",  type = "collect_coins",  target = 500,   name = "Coin Collector",    description = "Earn 500 Survival Coins",    reward = { coins = 250 } },
    { id = "collect_coins_2000", type = "collect_coins",  target = 2000,  name = "Gold Rush",         description = "Earn 2,000 Survival Coins", reward = { coins = 500, gems = 3 } },
    { id = "collect_items_5",    type = "collect_items",  target = 5,     name = "Scavenger",         description = "Collect 5 items",            reward = { coins = 200 } },
    
    -- ENGLISH CHALLENGES (Gospel 444 — bonus rewards)
    { id = "english_5",     type = "english",    target = 5,   name = "Word Warrior",        description = "Answer 5 English questions correctly",   reward = { coins = 300, gems = 5 },  isEnglish = true },
    { id = "english_15",    type = "english",    target = 15,  name = "Vocabulary Master",   description = "Answer 15 English questions correctly",  reward = { coins = 750, gems = 15 }, isEnglish = true },
    { id = "english_streak_5", type = "english_streak", target = 5, name = "Perfect Streak",  description = "Get 5 correct answers in a row",        reward = { coins = 500, gems = 10 }, isEnglish = true },
    
    -- SOCIAL CHALLENGES
    { id = "trade_1",       type = "trade",      target = 1,   name = "Trader",              description = "Complete 1 trade",               reward = { coins = 300 } },
    { id = "revive_ally_1", type = "revive_ally", target = 1,  name = "Medic",               description = "Revive a teammate",              reward = { coins = 200, gems = 2 } },
    
    -- ECONOMY CHALLENGES
    { id = "spend_1000",    type = "spend",      target = 1000, name = "Big Spender",        description = "Spend 1,000 coins",              reward = { coins = 300 } },
    { id = "gacha_3",       type = "gacha_pull", target = 3,    name = "Lucky Draw",         description = "Open 3 crates",                  reward = { coins = 400, gems = 5 } },
}

-- ============================================================
-- CONFIGURATION
-- ============================================================

local CONFIG = {
    CHALLENGES_PER_DAY = 3,
    STREAK_BONUS_MULTIPLIER = 0.1,   -- +10% per streak day
    MAX_STREAK_MULTIPLIER = 2.0,     -- Cap at 2x
    ENGLISH_CHALLENGE_BONUS = 1.5,   -- 50% bonus on English challenges
    REFRESH_HOUR_UTC = 0,            -- Reset at midnight UTC
}

-- ============================================================
-- STATE
-- ============================================================

local playerChallenges = {} -- [userId] = { challenges, streak, lastCompleteDate }

-- ============================================================
-- DATE UTILITY
-- ============================================================

local function getTodayKey()
    local utcTime = os.time()
    local date = os.date("!*t", utcTime)
    return string.format("%04d-%02d-%02d", date.year, date.month, date.day)
end

local function getYesterdayKey()
    local utcTime = os.time() - 86400
    local date = os.date("!*t", utcTime)
    return string.format("%04d-%02d-%02d", date.year, date.month, date.day)
end

-- ============================================================
-- CHALLENGE SELECTION (Deterministic per player per day)
-- ============================================================

local function selectDailyChallenges(userId)
    -- Seed RNG with userId + dayKey for deterministic selection
    local dayKey = getTodayKey()
    local seed = userId
    for i = 1, #dayKey do
        seed = seed + string.byte(dayKey, i) * i
    end
    
    local rng = Random.new(seed)
    
    -- Ensure at least 1 English challenge per day (Gospel 444 integration)
    local englishChallenges = {}
    local otherChallenges = {}
    for _, challenge in ipairs(CHALLENGE_POOL) do
        if challenge.isEnglish then
            table.insert(englishChallenges, challenge)
        else
            table.insert(otherChallenges, challenge)
        end
    end
    
    local selected = {}
    
    -- Pick 1 English challenge
    if #englishChallenges > 0 then
        local idx = rng:NextInteger(1, #englishChallenges)
        table.insert(selected, {
            definition = englishChallenges[idx],
            progress = 0,
            completed = false,
            claimed = false,
        })
    end
    
    -- Pick remaining from other pool
    local shuffled = {}
    for _, c in ipairs(otherChallenges) do
        table.insert(shuffled, c)
    end
    -- Fisher-Yates shuffle
    for i = #shuffled, 2, -1 do
        local j = rng:NextInteger(1, i)
        shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
    end
    
    local remaining = CONFIG.CHALLENGES_PER_DAY - #selected
    for i = 1, math.min(remaining, #shuffled) do
        table.insert(selected, {
            definition = shuffled[i],
            progress = 0,
            completed = false,
            claimed = false,
        })
    end
    
    return selected
end

-- ============================================================
-- PLAYER DATA
-- ============================================================

local function loadPlayerChallenges(userId)
    if playerChallenges[userId] and playerChallenges[userId].dayKey == getTodayKey() then
        return playerChallenges[userId]
    end
    
    -- Try loading from DataStore
    local success, stored = pcall(function()
        return ChallengeStore:GetAsync("challenges_" .. tostring(userId))
    end)
    
    local todayKey = getTodayKey()
    local yesterdayKey = getYesterdayKey()
    
    if success and stored and stored.dayKey == todayKey then
        playerChallenges[userId] = stored
        return stored
    end
    
    -- Need new challenges for today
    local streak = 0
    if stored and stored.lastCompleteDate == yesterdayKey and stored.allCompleted then
        streak = (stored.streak or 0) + 1
    elseif stored and stored.lastCompleteDate == todayKey then
        streak = stored.streak or 0
    end
    
    local newData = {
        dayKey = todayKey,
        challenges = selectDailyChallenges(userId),
        streak = streak,
        allCompleted = false,
        lastCompleteDate = stored and stored.lastCompleteDate or nil,
    }
    
    playerChallenges[userId] = newData
    return newData
end

local function savePlayerChallenges(userId)
    local data = playerChallenges[userId]
    if not data then return end
    
    pcall(function()
        ChallengeStore:SetAsync("challenges_" .. tostring(userId), data)
    end)
end

-- ============================================================
-- PROGRESS TRACKING
-- ============================================================

function ChallengeManager.ReportProgress(player, challengeType, amount)
    local userId = player.UserId
    local data = loadPlayerChallenges(userId)
    
    local updated = false
    for _, challenge in ipairs(data.challenges) do
        if not challenge.completed and challenge.definition.type == challengeType then
            challenge.progress = math.min(challenge.progress + amount, challenge.definition.target)
            if challenge.progress >= challenge.definition.target then
                challenge.completed = true
                print(string.format("[Challenge] Player %d completed: %s", userId, challenge.definition.name))
            end
            updated = true
        end
    end
    
    if updated then
        -- Check if all completed
        local allDone = true
        for _, challenge in ipairs(data.challenges) do
            if not challenge.completed then
                allDone = false
                break
            end
        end
        if allDone then
            data.allCompleted = true
            data.lastCompleteDate = getTodayKey()
        end
        
        task.spawn(function()
            savePlayerChallenges(userId)
        end)
    end
    
    return updated
end

-- ============================================================
-- CLAIM REWARDS
-- ============================================================

function ChallengeManager.ClaimReward(player, challengeIndex)
    local userId = player.UserId
    local data = loadPlayerChallenges(userId)
    
    local challenge = data.challenges[challengeIndex]
    if not challenge then
        return { success = false, error = "INVALID_INDEX" }
    end
    if not challenge.completed then
        return { success = false, error = "NOT_COMPLETED" }
    end
    if challenge.claimed then
        return { success = false, error = "ALREADY_CLAIMED" }
    end
    
    -- Calculate rewards with streak multiplier
    local streakMultiplier = math.min(
        1 + (data.streak * CONFIG.STREAK_BONUS_MULTIPLIER),
        CONFIG.MAX_STREAK_MULTIPLIER
    )
    
    -- English challenge bonus
    local englishMultiplier = challenge.definition.isEnglish and CONFIG.ENGLISH_CHALLENGE_BONUS or 1
    
    local totalMultiplier = streakMultiplier * englishMultiplier
    
    local reward = challenge.definition.reward
    local grantedCoins = math.floor((reward.coins or 0) * totalMultiplier)
    local grantedGems = math.floor((reward.gems or 0) * totalMultiplier)
    
    -- Grant rewards via EconomyManager
    local EconomyManager = require(script.Parent:FindFirstChild("EconomyManager"))
    if EconomyManager then
        if grantedCoins > 0 then
            EconomyManager.AddBalance(player, "SurvivalCoins", grantedCoins, "daily_challenge_" .. challenge.definition.id)
        end
        if grantedGems > 0 then
            EconomyManager.AddBalance(player, "BrainrotGems", grantedGems, "daily_challenge_" .. challenge.definition.id)
        end
    end
    
    challenge.claimed = true
    
    task.spawn(function()
        savePlayerChallenges(userId)
    end)
    
    return {
        success = true,
        granted = {
            coins = grantedCoins,
            gems = grantedGems,
        },
        multiplier = totalMultiplier,
        streak = data.streak,
    }
end

-- ============================================================
-- CLIENT API
-- ============================================================

function ChallengeManager.GetChallenges(player)
    local data = loadPlayerChallenges(player.UserId)
    local challenges = {}
    for i, challenge in ipairs(data.challenges) do
        table.insert(challenges, {
            index = i,
            id = challenge.definition.id,
            name = challenge.definition.name,
            description = challenge.definition.description,
            type = challenge.definition.type,
            isEnglish = challenge.definition.isEnglish or false,
            progress = challenge.progress,
            target = challenge.definition.target,
            completed = challenge.completed,
            claimed = challenge.claimed,
            reward = challenge.definition.reward,
        })
    end
    return {
        challenges = challenges,
        streak = data.streak,
        allCompleted = data.allCompleted,
        streakMultiplier = math.min(
            1 + (data.streak * CONFIG.STREAK_BONUS_MULTIPLIER),
            CONFIG.MAX_STREAK_MULTIPLIER
        ),
    }
end

-- ============================================================
-- CLEANUP
-- ============================================================

Players.PlayerRemoving:Connect(function(player)
    local userId = player.UserId
    if playerChallenges[userId] then
        savePlayerChallenges(userId)
        playerChallenges[userId] = nil
    end
end)

-- ============================================================
-- REMOTE SETUP
-- ============================================================

local ChallengeRemote = Instance.new("RemoteFunction")
ChallengeRemote.Name = "ChallengeRemote"
ChallengeRemote.Parent = ReplicatedStorage

ChallengeRemote.OnServerInvoke = function(player, action, ...)
    if action == "GetChallenges" then
        return ChallengeManager.GetChallenges(player)
    elseif action == "ClaimReward" then
        return ChallengeManager.ClaimReward(player, ...)
    end
    return { success = false, error = "INVALID_ACTION" }
end

return ChallengeManager
