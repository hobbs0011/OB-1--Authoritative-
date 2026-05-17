--[[
    EnglishRewardsManager.lua — English×Rewards Bridge
    Skibidi Zombie: Survive the Brainrots

    GOAL: MAKE MONEY. English is the mechanic, money is the mission.
    This module is the bidirectional bridge between OBI's English learning
    engine and every monetization system in the game.

    Every correct answer, every streak, every lesson completion becomes
    tangible in-game rewards — making English feel rewarding, addictive,
    and intrinsically tied to progression.

    Gospel 444 Alignment:
    - Mouse → Tiger: generous early, earned later
    - Permission over Perfection: reward attempt, not just accuracy
    - Never interrupt a lesson: rewards queue until lesson ends
    - Relationship over rules: grace windows, forgiveness mechanics

    Connects:
      English Engine → EnglishRewardsManager → GachaManager
                                              → BattlePassManager
                                              → CurrencyManager (EconomyManager)
                                              → DailyRewards
                                              → MonetizationOrchestrator
                                              → AnalyticsService
                                              → CosmeticTrinity (tier-up triggers)

    Cross-repo sources:
      1. EnglishRewardsManagerSpec.md (SHA f442ac19) — full spec
      2. RewardBridge.lua (SHA 36b4f338) — combat reward patterns
      3. UnifiedServer.lua (SHA daa5aac8) — boot order, init contract
      4. AnalyticsTelemetryIntegrationSpec.md (SHA 427320695c7f) — event taxonomy
      5. MonetizationOrchestratorSpec.md (SHA 6ed43ba3) — bridge hooks
      6. FTUEImplementationSpec.md (SHA 18bee6a6) — Mouse-A/B, FTUE flow

    Build Order: L3 (after DataStore, Currency, Gacha, BattlePass)
    UnifiedServer boot: add after BattlePass, before MonetizationOrchestrator

    Architecture: ModuleScript (ServerStorage/Modules/EnglishRewardsManager)
    Version: 1.0.0
    Date: 2026-03-28
    Author: OB1 — Pulse Run 71
    Artifact Class: BUILD
    Active Mission: 100% Roblox
--]]

local ServerStorage = game:GetService("ServerStorage")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local EnglishRewardsManager = {}

--------------------------------------------------------------------------------
-- DEPENDENCIES (injected via Init)
--------------------------------------------------------------------------------

local Deps = {
    DataStoreV2 = nil,
    AnalyticsService = nil,
    EconomyManager = nil,
    GachaManager = nil,
    BattlePass = nil,
    DailyRewards = nil,
    FTUEManager = nil,
}

--------------------------------------------------------------------------------
-- CONFIG — All tunable constants in one place
--------------------------------------------------------------------------------

local CONFIG = {
    -- ═══════════════════════════════════════════════════════
    -- STREAK SYSTEM
    -- ═══════════════════════════════════════════════════════
    STREAK_MIN_DAILY_QUESTIONS = 5,      -- OR 1 lesson
    STREAK_MIN_DAILY_LESSONS = 1,
    STREAK_GRACE_HOURS = 4,              -- past midnight
    STREAK_GRACE_USES_PER_MONTH = 2,

    STREAK_MILESTONES = {
        [3]   = { freePulls = 1,  coins = 100,   gems = 0,  pityProgress = 5,  luckMult = 0,   luckSec = 0,     label = "Getting Started" },
        [5]   = { freePulls = 1,  coins = 200,   gems = 0,  pityProgress = 5,  luckMult = 1.5, luckSec = 1800,  label = "On Fire" },
        [7]   = { freePulls = 2,  coins = 500,   gems = 3,  pityProgress = 10, luckMult = 2.0, luckSec = 3600,  label = "Week Warrior" },
        [14]  = { freePulls = 3,  coins = 1000,  gems = 0,  pityProgress = 15, luckMult = 2.0, luckSec = 3600,  label = "Dedicated" },
        [30]  = { freePulls = 5,  coins = 2500,  gems = 10, pityProgress = 25, luckMult = 2.5, luckSec = 7200,  label = "Monthly Master" },
        [60]  = { freePulls = 8,  coins = 5000,  gems = 0,  pityProgress = 40, luckMult = 0,   luckSec = 0,     label = "Iron Will" },
        [90]  = { freePulls = 10, coins = 10000, gems = 0,  pityProgress = 50, luckMult = 3.0, luckSec = 14400, label = "Quarter Champion" },
        [180] = { freePulls = 15, coins = 25000, gems = 0,  pityProgress = 75, luckMult = 3.0, luckSec = 28800, label = "Half-Year Hero" },
        [365] = { freePulls = 25, coins = 50000, gems = 0,  pityProgress = 100,luckMult = 5.0, luckSec = 86400, label = "Legendary Learner" },
    },

    -- ═══════════════════════════════════════════════════════
    -- TIER PROGRESSION (Mouse-A → Tiger)
    -- ═══════════════════════════════════════════════════════
    TIERS = {
        { name = "Mouse-A", level = 1, xpRequired = 0,     multiplier = 1.0  },
        { name = "Mouse-B", level = 2, xpRequired = 500,   multiplier = 1.1  },
        { name = "Cat",     level = 3, xpRequired = 2500,  multiplier = 1.25 },
        { name = "Wolf",    level = 4, xpRequired = 10000, multiplier = 1.5  },
        { name = "Lion",    level = 5, xpRequired = 25000, multiplier = 1.75 },
        { name = "Tiger",   level = 6, xpRequired = 75000, multiplier = 2.0  },
    },

    -- ═══════════════════════════════════════════════════════
    -- XP GRANTS (Battle Pass XP)
    -- English is the BEST XP source in the game (intentional)
    -- ═══════════════════════════════════════════════════════
    XP_CORRECT_ANSWER       = 25,
    XP_WRONG_ANSWER         = 5,   -- Gospel 444: reward attempt
    XP_LESSON_COMPLETE      = 50,
    XP_PERFECT_SCORE        = 100, -- stacks with lesson complete
    XP_IN_LESSON_STREAK_5   = 150, -- 5 consecutive correct
    XP_DAILY_CHALLENGE      = 200,
    XP_STREAK_MILESTONE     = 300,
    XP_LEVEL_UP             = 500,

    -- ═══════════════════════════════════════════════════════
    -- CURRENCY GRANTS
    -- ═══════════════════════════════════════════════════════
    COINS_LESSON_COMPLETE   = 25,
    COINS_PERFECT_SCORE     = 50,
    COINS_DAILY_CHALLENGE   = 100,
    COINS_LEVEL_UP          = 1000,
    GEMS_PERFECT_SCORE      = 1,
    GEMS_DAILY_CHALLENGE    = 2,
    GEMS_LEVEL_UP           = 5,

    -- ═══════════════════════════════════════════════════════
    -- DAILY CAPS
    -- ═══════════════════════════════════════════════════════
    DAILY_CAP_COINS         = 5000,
    DAILY_CAP_GEMS          = 20,
    DAILY_CAP_FREE_PULLS    = 5,     -- Basic
    DAILY_CAP_PREMIUM_PULLS = 2,     -- Premium
    DAILY_CAP_PITY          = 20,

    -- ═══════════════════════════════════════════════════════
    -- GACHA BRIDGE
    -- ═══════════════════════════════════════════════════════
    GACHA_CORRECT_THRESHOLD = 10,    -- every 10 correct → 1 free Basic pull
    GACHA_BRIDGE_COOLDOWN   = 60,    -- seconds between free pull grants
    GACHA_FIRST_SESSION_LUCK = 2.0,
    GACHA_FIRST_SESSION_DURATION = 1800,
    GACHA_PERFECT_LUCK      = 2.0,
    GACHA_PERFECT_DURATION  = 1800,

    -- ═══════════════════════════════════════════════════════
    -- ANTI-EXPLOIT
    -- ═══════════════════════════════════════════════════════
    MIN_ANSWER_TIME         = 0.5,   -- seconds; faster = bot flag
    MAX_QUESTIONS_PER_MIN   = 20,
    MAX_LESSONS_PER_HOUR    = 10,
    ACCURACY_FLAG_THRESHOLD = 50,    -- 100% at max diff for 50+ Qs = flag

    -- ═══════════════════════════════════════════════════════
    -- REWARD HISTORY
    -- ═══════════════════════════════════════════════════════
    HISTORY_BUFFER_SIZE     = 50,
}

--------------------------------------------------------------------------------
-- PLAYER STATE (per-player, in-memory + DataStore backed)
--------------------------------------------------------------------------------

local playerData = {}        -- [UserId] = EnglishData
local pendingRewards = {}    -- [UserId] = {RewardBundle...}
local inActiveLesson = {}    -- [UserId] = bool
local rateLimitCounters = {} -- [UserId] = {questionsThisMinute, lessonsThisHour, ...}
local lastGachaBridgeTime = {} -- [UserId] = tick()

local DEFAULT_DATA = {
    streak = {
        current = 0,
        longest = 0,
        lastActivityDate = "",
        todayComplete = false,
        graceUsesThisMonth = 2,
        graceLastResetMonth = "",
    },
    tier = {
        currentTier = "Mouse-A",
        tierLevel = 1,
        totalEnglishXP = 0,
    },
    daily = {
        date = "",
        questionsAnswered = 0,
        correctAnswers = 0,
        lessonsCompleted = 0,
        xpEarned = 0,
        coinsEarned = 0,
        gemsEarned = 0,
        freePullsEarned = 0,
        pityProgressEarned = 0,
        dailyChallengeComplete = false,
    },
    cumulative = {
        totalQuestionsAnswered = 0,
        totalCorrectAnswers = 0,
        totalLessonsCompleted = 0,
        totalXPEarned = 0,
        totalCoinsEarned = 0,
        totalGemsEarned = 0,
        totalFreePulls = 0,
        totalPerfectScores = 0,
        totalDailyChallenges = 0,
        firstSessionTimestamp = 0,
        lastSessionTimestamp = 0,
    },
    rewardHistory = {},
    rewardHistoryIndex = 0,
    schemaVersion = 1,
}

--------------------------------------------------------------------------------
-- UTILITIES
--------------------------------------------------------------------------------

local function deepCopy(t)
    if type(t) ~= "table" then return t end
    local copy = {}
    for k, v in pairs(t) do
        copy[k] = deepCopy(v)
    end
    return copy
end

local function getServerDate()
    -- Returns YYYY-MM-DD in server time (UTC+7 for ICT)
    local t = os.date("!*t", os.time() + 7 * 3600)
    return string.format("%04d-%02d-%02d", t.year, t.month, t.day)
end

local function getServerMonth()
    local t = os.date("!*t", os.time() + 7 * 3600)
    return string.format("%04d-%02d", t.year, t.month)
end

local function daysBetween(dateA, dateB)
    -- Simple date diff for YYYY-MM-DD strings
    if dateA == "" or dateB == "" then return 999 end
    local yA, mA, dA = dateA:match("(%d+)-(%d+)-(%d+)")
    local yB, mB, dB = dateB:match("(%d+)-(%d+)-(%d+)")
    if not yA or not yB then return 999 end
    local tA = os.time({ year = tonumber(yA), month = tonumber(mA), day = tonumber(dA), hour = 0 })
    local tB = os.time({ year = tonumber(yB), month = tonumber(mB), day = tonumber(dB), hour = 0 })
    return math.abs(math.floor((tB - tA) / 86400))
end

local function clamp(val, lo, hi)
    if val < lo then return lo end
    if val > hi then return hi end
    return val
end

local function emitAnalytics(player, eventName, props)
    if Deps.AnalyticsService and type(Deps.AnalyticsService.Track) == "function" then
        local data = playerData[player.UserId]
        local enriched = {
            english_tier = data and data.tier.currentTier or "UNKNOWN",
            english_streak = data and data.streak.current or 0,
            english_total_xp = data and data.tier.totalEnglishXP or 0,
        }
        if props then
            for k, v in pairs(props) do enriched[k] = v end
        end
        pcall(Deps.AnalyticsService.Track, Deps.AnalyticsService, player, "english_" .. eventName, enriched)
    end
end

--------------------------------------------------------------------------------
-- DATA LOAD / SAVE
--------------------------------------------------------------------------------

local function loadPlayerData(player)
    local data = deepCopy(DEFAULT_DATA)
    if Deps.DataStoreV2 then
        local ok, stored = pcall(function()
            return Deps.DataStoreV2.GetPlayerField and Deps.DataStoreV2.GetPlayerField(player, "english_v1")
        end)
        if ok and stored and type(stored) == "table" then
            -- Merge stored into defaults (handles schema upgrades)
            for section, defaults in pairs(DEFAULT_DATA) do
                if type(defaults) == "table" and stored[section] then
                    for k, v in pairs(defaults) do
                        if stored[section][k] ~= nil then
                            data[section][k] = stored[section][k]
                        end
                    end
                elseif stored[section] ~= nil then
                    data[section] = stored[section]
                end
            end
            if stored.rewardHistory then data.rewardHistory = stored.rewardHistory end
            if stored.rewardHistoryIndex then data.rewardHistoryIndex = stored.rewardHistoryIndex end
        end
    end
    return data
end

local function savePlayerData(player)
    local data = playerData[player.UserId]
    if not data then return end
    if Deps.DataStoreV2 then
        pcall(function()
            if Deps.DataStoreV2.SetPlayerField then
                Deps.DataStoreV2.SetPlayerField(player, "english_v1", data)
            end
        end)
    end
end

--------------------------------------------------------------------------------
-- DAILY RESET
--------------------------------------------------------------------------------

local function checkDailyReset(player)
    local data = playerData[player.UserId]
    if not data then return end
    local today = getServerDate()
    if data.daily.date ~= today then
        -- Archive to cumulative
        local d = data.daily
        local c = data.cumulative
        c.totalQuestionsAnswered = c.totalQuestionsAnswered + d.questionsAnswered
        c.totalCorrectAnswers = c.totalCorrectAnswers + d.correctAnswers
        c.totalLessonsCompleted = c.totalLessonsCompleted + d.lessonsCompleted
        c.totalXPEarned = c.totalXPEarned + d.xpEarned
        c.totalCoinsEarned = c.totalCoinsEarned + d.coinsEarned
        c.totalGemsEarned = c.totalGemsEarned + d.gemsEarned
        c.totalFreePulls = c.totalFreePulls + d.freePullsEarned

        -- Reset daily
        data.daily = deepCopy(DEFAULT_DATA.daily)
        data.daily.date = today

        -- Monthly grace reset
        local thisMonth = getServerMonth()
        if data.streak.graceLastResetMonth ~= thisMonth then
            data.streak.graceUsesThisMonth = CONFIG.STREAK_GRACE_USES_PER_MONTH
            data.streak.graceLastResetMonth = thisMonth
        end
    end
end

--------------------------------------------------------------------------------
-- STREAK TRACKER
--------------------------------------------------------------------------------

local function updateStreak(player)
    local data = playerData[player.UserId]
    if not data then return end
    local today = getServerDate()
    local lastDate = data.streak.lastActivityDate

    if today == lastDate then
        -- Same day — no streak change
        return
    end

    local diff = daysBetween(lastDate, today)

    if diff == 1 then
        -- Consecutive day
        data.streak.current = data.streak.current + 1
        data.streak.todayComplete = false
    elseif diff == 2 and data.streak.graceUsesThisMonth > 0 then
        -- Missed 1 day, grace available
        data.streak.current = data.streak.current + 1
        data.streak.graceUsesThisMonth = data.streak.graceUsesThisMonth - 1
        emitAnalytics(player, "streak_grace_used", {
            streak = data.streak.current,
            graces_remaining = data.streak.graceUsesThisMonth,
        })
    elseif lastDate == "" then
        -- First ever
        data.streak.current = 1
    else
        -- Streak broken
        local oldStreak = data.streak.current
        data.streak.current = 1
        emitAnalytics(player, "streak_broken", {
            old_streak = oldStreak,
            days_missed = diff,
        })
    end

    data.streak.lastActivityDate = today
    if data.streak.current > data.streak.longest then
        data.streak.longest = data.streak.current
    end
end

local function checkStreakComplete(player)
    local data = playerData[player.UserId]
    if not data or data.streak.todayComplete then return end

    local d = data.daily
    local questionsOk = d.questionsAnswered >= CONFIG.STREAK_MIN_DAILY_QUESTIONS
    local lessonsOk = d.lessonsCompleted >= CONFIG.STREAK_MIN_DAILY_LESSONS

    if questionsOk or lessonsOk then
        data.streak.todayComplete = true
        emitAnalytics(player, "daily_requirement_met", {
            questions = d.questionsAnswered,
            lessons = d.lessonsCompleted,
            streak = data.streak.current,
        })
    end
end

local function checkStreakMilestone(player)
    local data = playerData[player.UserId]
    if not data then return nil end
    local streak = data.streak.current
    local milestone = CONFIG.STREAK_MILESTONES[streak]
    if milestone then
        emitAnalytics(player, "streak_achieved", {
            streak_days = streak,
            milestone = milestone.label,
        })
        return milestone
    end
    return nil
end

local function getNextMilestone(currentStreak)
    local milestones = { 3, 5, 7, 14, 30, 60, 90, 180, 365 }
    for _, m in ipairs(milestones) do
        if m > currentStreak then return m end
    end
    return 365
end

--------------------------------------------------------------------------------
-- TIER ENGINE
--------------------------------------------------------------------------------

local function calculateTier(totalXP)
    local result = CONFIG.TIERS[1]
    for _, tier in ipairs(CONFIG.TIERS) do
        if totalXP >= tier.xpRequired then
            result = tier
        else
            break
        end
    end
    return result
end

local function addEnglishXP(player, amount)
    local data = playerData[player.UserId]
    if not data then return false end

    local oldLevel = data.tier.tierLevel
    data.tier.totalEnglishXP = data.tier.totalEnglishXP + amount

    local newTier = calculateTier(data.tier.totalEnglishXP)
    local leveledUp = newTier.level > oldLevel

    if leveledUp then
        data.tier.currentTier = newTier.name
        data.tier.tierLevel = newTier.level
        emitAnalytics(player, "tier_up", {
            old_tier = CONFIG.TIERS[oldLevel].name,
            new_tier = newTier.name,
            total_xp = data.tier.totalEnglishXP,
        })
    end

    return leveledUp
end

local function getTierMultiplier(player)
    local data = playerData[player.UserId]
    if not data then return 1.0 end
    local tier = calculateTier(data.tier.totalEnglishXP)
    return tier.multiplier
end

--------------------------------------------------------------------------------
-- REWARD DELIVERY (respects daily caps, queues during lessons)
--------------------------------------------------------------------------------

local function makeEmptyBundle(source)
    return {
        xp = 0,
        coins = 0,
        gems = 0,
        freePulls = 0,
        pityProgress = 0,
        gachaLuckBoost = nil,
        streakBonus = false,
        tierBonus = 1.0,
        source = source or "unknown",
        displayDelay = false,
    }
end

local function capAndTrack(player, bundle)
    local data = playerData[player.UserId]
    if not data then return bundle end
    local d = data.daily

    -- Cap coins
    local coinRoom = math.max(0, CONFIG.DAILY_CAP_COINS - d.coinsEarned)
    bundle.coins = math.min(bundle.coins, coinRoom)
    d.coinsEarned = d.coinsEarned + bundle.coins

    -- Cap gems
    local gemRoom = math.max(0, CONFIG.DAILY_CAP_GEMS - d.gemsEarned)
    bundle.gems = math.min(bundle.gems, gemRoom)
    d.gemsEarned = d.gemsEarned + bundle.gems

    -- Cap pulls
    local pullRoom = math.max(0, CONFIG.DAILY_CAP_FREE_PULLS - d.freePullsEarned)
    bundle.freePulls = math.min(bundle.freePulls, pullRoom)
    d.freePullsEarned = d.freePullsEarned + bundle.freePulls

    -- Cap pity
    local pityRoom = math.max(0, CONFIG.DAILY_CAP_PITY - d.pityProgressEarned)
    bundle.pityProgress = math.min(bundle.pityProgress, pityRoom)
    d.pityProgressEarned = d.pityProgressEarned + bundle.pityProgress

    -- Track XP
    d.xpEarned = d.xpEarned + bundle.xp

    return bundle
end

local function deliverReward(player, bundle)
    -- Apply tier multiplier
    local mult = getTierMultiplier(player)
    bundle.tierBonus = mult
    bundle.xp = math.floor(bundle.xp * mult)
    bundle.coins = math.floor(bundle.coins * mult)
    -- Gems NOT multiplied (premium currency stays controlled)

    -- Apply caps
    bundle = capAndTrack(player, bundle)

    -- Grant Battle Pass XP
    if bundle.xp > 0 and Deps.BattlePass then
        pcall(function()
            if Deps.BattlePass.AddXP then
                Deps.BattlePass.AddXP(player, bundle.xp)
            end
        end)
    end

    -- Grant coins
    if bundle.coins > 0 and Deps.EconomyManager then
        pcall(function()
            if Deps.EconomyManager.AddCurrency then
                Deps.EconomyManager.AddCurrency(player, "EnglishCoins", bundle.coins)
            end
        end)
    end

    -- Grant gems
    if bundle.gems > 0 and Deps.EconomyManager then
        pcall(function()
            if Deps.EconomyManager.AddCurrency then
                Deps.EconomyManager.AddCurrency(player, "PremiumGems", bundle.gems)
            end
        end)
    end

    -- Grant free gacha pulls
    if bundle.freePulls > 0 and Deps.GachaManager then
        pcall(function()
            if Deps.GachaManager.GrantFreePulls then
                Deps.GachaManager.GrantFreePulls(player, "Basic", bundle.freePulls)
            end
        end)
    end

    -- Grant pity progress
    if bundle.pityProgress > 0 and Deps.GachaManager then
        pcall(function()
            if Deps.GachaManager.AddPityProgress then
                Deps.GachaManager.AddPityProgress(player, bundle.pityProgress)
            end
        end)
    end

    -- Apply gacha luck boost (highest wins, no stacking)
    if bundle.gachaLuckBoost and Deps.GachaManager then
        pcall(function()
            if Deps.GachaManager.SetLuckBoost then
                Deps.GachaManager.SetLuckBoost(
                    player,
                    bundle.gachaLuckBoost.multiplier,
                    bundle.gachaLuckBoost.durationSeconds
                )
            end
        end)
    end

    -- Record in history
    local data = playerData[player.UserId]
    if data then
        local entry = {
            timestamp = os.time(),
            source = bundle.source,
            xp = bundle.xp,
            coins = bundle.coins,
            gems = bundle.gems,
            freePulls = bundle.freePulls,
        }
        data.rewardHistoryIndex = (data.rewardHistoryIndex % CONFIG.HISTORY_BUFFER_SIZE) + 1
        data.rewardHistory[data.rewardHistoryIndex] = entry
    end

    -- Analytics
    emitAnalytics(player, "reward_granted", {
        source = bundle.source,
        xp = bundle.xp,
        coins = bundle.coins,
        gems = bundle.gems,
        free_pulls = bundle.freePulls,
        pity = bundle.pityProgress,
        tier_mult = bundle.tierBonus,
    })

    -- Client notification
    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if remotes then
        local ev = remotes:FindFirstChild("EnglishReward")
        if ev then
            pcall(function() ev:FireClient(player, bundle) end)
        end
    end

    return bundle
end

local function queueOrDeliver(player, bundle)
    local uid = player.UserId
    if inActiveLesson[uid] then
        bundle.displayDelay = true
        if not pendingRewards[uid] then pendingRewards[uid] = {} end
        table.insert(pendingRewards[uid], bundle)
    else
        deliverReward(player, bundle)
    end
end

--------------------------------------------------------------------------------
-- GACHA BRIDGE
--------------------------------------------------------------------------------

local function checkCumulativeCorrectBridge(player)
    local data = playerData[player.UserId]
    if not data then return end
    local uid = player.UserId

    local total = data.cumulative.totalCorrectAnswers + data.daily.correctAnswers
    local prevTotal = total - 1 -- we just incremented
    local prevPulls = math.floor(prevTotal / CONFIG.GACHA_CORRECT_THRESHOLD)
    local currPulls = math.floor(total / CONFIG.GACHA_CORRECT_THRESHOLD)
    local newPulls = currPulls - prevPulls

    if newPulls > 0 then
        -- Cooldown check
        local now = tick()
        local last = lastGachaBridgeTime[uid] or 0
        if now - last < CONFIG.GACHA_BRIDGE_COOLDOWN then return end
        lastGachaBridgeTime[uid] = now

        local bundle = makeEmptyBundle("cumulative_correct_" .. tostring(total))
        bundle.freePulls = newPulls
        queueOrDeliver(player, bundle)

        emitAnalytics(player, "gacha_bridge", {
            bridge_type = "CUMULATIVE_CORRECT",
            pull_type = "Basic",
            pulls = newPulls,
            total_correct = total,
        })
    end
end

--------------------------------------------------------------------------------
-- PUBLIC API — Core Event Handlers
--------------------------------------------------------------------------------

function EnglishRewardsManager.Init()
    -- Load optional dependencies (fail-open: English works without gacha/BP)
    local function tryLoad(name)
        local mod = ServerStorage:FindFirstChild(name) or ServerStorage:FindFirstChild(name, true)
        if mod then
            local ok, result = pcall(require, mod)
            if ok then return result end
        end
        return nil
    end

    Deps.DataStoreV2 = tryLoad("DataStoreV2")
    Deps.AnalyticsService = tryLoad("AnalyticsService")
    Deps.EconomyManager = tryLoad("EconomyManager")
    Deps.GachaManager = tryLoad("GachaManager")
    Deps.BattlePass = tryLoad("BattlePass")
    Deps.DailyRewards = tryLoad("DailyRewards")
    Deps.FTUEManager = tryLoad("FTUEManager")

    -- Player lifecycle
    Players.PlayerAdded:Connect(function(player)
        EnglishRewardsManager.RegisterPlayer(player)
    end)
    Players.PlayerRemoving:Connect(function(player)
        EnglishRewardsManager.UnregisterPlayer(player)
    end)
    for _, player in ipairs(Players:GetPlayers()) do
        task.spawn(EnglishRewardsManager.RegisterPlayer, player)
    end

    -- Setup remote events
    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if remotes and not remotes:FindFirstChild("EnglishReward") then
        local ev = Instance.new("RemoteEvent")
        ev.Name = "EnglishReward"
        ev.Parent = remotes
    end

    print("[EnglishRewardsManager] Initialized — English is the mechanic, money is the mission")
    return true
end

function EnglishRewardsManager.RegisterPlayer(player)
    local uid = player.UserId
    playerData[uid] = loadPlayerData(player)
    pendingRewards[uid] = {}
    inActiveLesson[uid] = false
    rateLimitCounters[uid] = { questionsThisMinute = 0, lastMinuteReset = tick() }
    lastGachaBridgeTime[uid] = 0

    -- Check daily reset
    checkDailyReset(player)

    -- Update streak on login
    updateStreak(player)

    -- First session check
    local data = playerData[uid]
    if data.cumulative.firstSessionTimestamp == 0 then
        data.cumulative.firstSessionTimestamp = os.time()
        -- FTUE first session gacha luck boost
        local bundle = makeEmptyBundle("first_session")
        bundle.gachaLuckBoost = {
            multiplier = CONFIG.GACHA_FIRST_SESSION_LUCK,
            durationSeconds = CONFIG.GACHA_FIRST_SESSION_DURATION,
        }
        deliverReward(player, bundle)
        emitAnalytics(player, "first_session", {})
    end

    data.cumulative.lastSessionTimestamp = os.time()
    emitAnalytics(player, "session_start", {
        tier = data.tier.currentTier,
        streak = data.streak.current,
    })
end

function EnglishRewardsManager.UnregisterPlayer(player)
    local uid = player.UserId
    emitAnalytics(player, "session_end", {
        questions = playerData[uid] and playerData[uid].daily.questionsAnswered or 0,
        xp = playerData[uid] and playerData[uid].daily.xpEarned or 0,
    })
    savePlayerData(player)
    playerData[uid] = nil
    pendingRewards[uid] = nil
    inActiveLesson[uid] = nil
    rateLimitCounters[uid] = nil
    lastGachaBridgeTime[uid] = nil
end

function EnglishRewardsManager.OnQuestionAnswered(player, result)
    local uid = player.UserId
    local data = playerData[uid]
    if not data then return nil end

    -- Rate limit
    local rl = rateLimitCounters[uid]
    if rl then
        local now = tick()
        if now - rl.lastMinuteReset > 60 then
            rl.questionsThisMinute = 0
            rl.lastMinuteReset = now
        end
        rl.questionsThisMinute = rl.questionsThisMinute + 1
        if rl.questionsThisMinute > CONFIG.MAX_QUESTIONS_PER_MIN then
            emitAnalytics(player, "rate_limited", { type = "questions_per_minute" })
            return nil
        end
    end

    -- Anti-exploit: speed check
    if result.timeSpent and result.timeSpent < CONFIG.MIN_ANSWER_TIME then
        emitAnalytics(player, "exploit_flag", {
            type = "speed",
            time_spent = result.timeSpent,
        })
        return nil -- silently reject
    end

    -- Track daily
    checkDailyReset(player)
    data.daily.questionsAnswered = data.daily.questionsAnswered + 1

    -- Build reward
    local bundle = makeEmptyBundle("question")
    if result.correct then
        data.daily.correctAnswers = data.daily.correctAnswers + 1
        bundle.xp = CONFIG.XP_CORRECT_ANSWER

        -- Check cumulative correct → gacha bridge
        checkCumulativeCorrectBridge(player)

        -- In-lesson 5-streak check
        if result.sessionQuestionIndex and result.sessionQuestionIndex > 0 then
            if result.sessionQuestionIndex % 5 == 0 then
                bundle.xp = bundle.xp + CONFIG.XP_IN_LESSON_STREAK_5
            end
        end
    else
        -- Gospel 444: reward attempt, not just accuracy
        bundle.xp = CONFIG.XP_WRONG_ANSWER
    end

    -- Add English XP (tier progression)
    local leveledUp = addEnglishXP(player, bundle.xp)

    -- Check streak
    checkStreakComplete(player)

    -- Queue or deliver
    queueOrDeliver(player, bundle)

    -- If leveled up, fire level-up reward
    if leveledUp then
        task.defer(function()
            EnglishRewardsManager.OnLevelUp(player, data.tier.tierLevel)
        end)
    end

    -- Analytics
    emitAnalytics(player, "question_answered", {
        correct = result.correct,
        difficulty = result.difficulty,
        category = result.category,
        time_spent = result.timeSpent,
    })

    return bundle
end

function EnglishRewardsManager.OnLessonComplete(player, result)
    local uid = player.UserId
    local data = playerData[uid]
    if not data then return nil end

    checkDailyReset(player)
    data.daily.lessonsCompleted = data.daily.lessonsCompleted + 1

    local bundle = makeEmptyBundle("lesson")
    bundle.xp = CONFIG.XP_LESSON_COMPLETE
    bundle.coins = CONFIG.COINS_LESSON_COMPLETE

    -- Perfect score bonus
    if result.isPerfectScore then
        bundle.xp = bundle.xp + CONFIG.XP_PERFECT_SCORE
        bundle.coins = bundle.coins + CONFIG.COINS_PERFECT_SCORE
        bundle.gems = CONFIG.GEMS_PERFECT_SCORE
        bundle.freePulls = 1
        bundle.gachaLuckBoost = {
            multiplier = CONFIG.GACHA_PERFECT_LUCK,
            durationSeconds = CONFIG.GACHA_PERFECT_DURATION,
        }
        data.cumulative.totalPerfectScores = data.cumulative.totalPerfectScores + 1
    end

    addEnglishXP(player, bundle.xp)
    checkStreakComplete(player)

    -- Lesson just ended — flush pending rewards
    inActiveLesson[uid] = false
    deliverReward(player, bundle)
    EnglishRewardsManager.FlushPendingRewards(player)

    -- Check streak milestone after activity
    local milestone = checkStreakMilestone(player)
    if milestone then
        local streakBundle = makeEmptyBundle("streak")
        streakBundle.xp = CONFIG.XP_STREAK_MILESTONE
        streakBundle.coins = milestone.coins
        streakBundle.gems = milestone.gems or 0
        streakBundle.freePulls = milestone.freePulls
        streakBundle.pityProgress = milestone.pityProgress
        streakBundle.streakBonus = true
        if milestone.luckMult > 0 then
            streakBundle.gachaLuckBoost = {
                multiplier = milestone.luckMult,
                durationSeconds = milestone.luckSec,
            }
        end
        deliverReward(player, streakBundle)
    end

    emitAnalytics(player, "lesson_complete", {
        accuracy = result.accuracy,
        total_questions = result.totalQuestions,
        correct_answers = result.correctAnswers,
        is_perfect = result.isPerfectScore,
    })

    savePlayerData(player)
    return bundle
end

function EnglishRewardsManager.OnDailyChallengeComplete(player, result)
    local uid = player.UserId
    local data = playerData[uid]
    if not data then return nil end

    checkDailyReset(player)
    if data.daily.dailyChallengeComplete then return nil end -- once per day

    data.daily.dailyChallengeComplete = true
    data.cumulative.totalDailyChallenges = data.cumulative.totalDailyChallenges + 1

    local bundle = makeEmptyBundle("challenge")
    bundle.xp = CONFIG.XP_DAILY_CHALLENGE
    bundle.coins = CONFIG.COINS_DAILY_CHALLENGE
    bundle.gems = CONFIG.GEMS_DAILY_CHALLENGE
    bundle.freePulls = 1  -- Premium pull

    addEnglishXP(player, bundle.xp)
    deliverReward(player, bundle)

    emitAnalytics(player, "daily_challenge_complete", {
        accuracy = result.accuracy,
        bonus_met = result.bonusObjectiveMet,
    })

    savePlayerData(player)
    return bundle
end

function EnglishRewardsManager.OnLevelUp(player, newLevel)
    local uid = player.UserId
    local data = playerData[uid]
    if not data then return nil end

    local bundle = makeEmptyBundle("levelup")
    bundle.xp = CONFIG.XP_LEVEL_UP
    bundle.coins = CONFIG.COINS_LEVEL_UP
    bundle.gems = CONFIG.GEMS_LEVEL_UP
    bundle.freePulls = 1  -- Premium pull for tier-up

    deliverReward(player, bundle)

    emitAnalytics(player, "level_up", {
        new_level = newLevel,
        new_tier = data.tier.currentTier,
        total_xp = data.tier.totalEnglishXP,
    })

    savePlayerData(player)
    return bundle
end

--------------------------------------------------------------------------------
-- PUBLIC API — Lesson State
--------------------------------------------------------------------------------

function EnglishRewardsManager.OnLessonStart(player)
    local uid = player.UserId
    inActiveLesson[uid] = true
    pendingRewards[uid] = pendingRewards[uid] or {}
end

function EnglishRewardsManager.OnLessonEnd(player)
    local uid = player.UserId
    inActiveLesson[uid] = false
    EnglishRewardsManager.FlushPendingRewards(player)
end

function EnglishRewardsManager.FlushPendingRewards(player)
    local uid = player.UserId
    local queued = pendingRewards[uid]
    if queued and #queued > 0 then
        for _, bundle in ipairs(queued) do
            deliverReward(player, bundle)
        end
        pendingRewards[uid] = {}
    end
end

--------------------------------------------------------------------------------
-- PUBLIC API — Query Methods
--------------------------------------------------------------------------------

function EnglishRewardsManager.GetStreak(player)
    local data = playerData[player.UserId]
    if not data then return nil end
    return {
        currentStreak = data.streak.current,
        longestStreak = data.streak.longest,
        todayComplete = data.streak.todayComplete,
        lastActivityDate = data.streak.lastActivityDate,
        graceWindowActive = false,
        nextMilestone = getNextMilestone(data.streak.current),
    }
end

function EnglishRewardsManager.GetTier(player)
    local data = playerData[player.UserId]
    if not data then return nil end
    local tier = calculateTier(data.tier.totalEnglishXP)
    local progressToNext = 0
    if tier.level < #CONFIG.TIERS then
        local next = CONFIG.TIERS[tier.level + 1]
        progressToNext = (data.tier.totalEnglishXP - tier.xpRequired) / (next.xpRequired - tier.xpRequired)
    else
        progressToNext = 1.0
    end
    return {
        currentTier = tier.name,
        tierLevel = tier.level,
        progressToNext = clamp(progressToNext, 0, 1),
        totalEnglishXP = data.tier.totalEnglishXP,
        rewardMultiplier = tier.multiplier,
    }
end

function EnglishRewardsManager.GetTodayProgress(player)
    local data = playerData[player.UserId]
    if not data then return nil end
    checkDailyReset(player)
    return {
        questionsAnswered = data.daily.questionsAnswered,
        correctAnswers = data.daily.correctAnswers,
        lessonsCompleted = data.daily.lessonsCompleted,
        xpEarned = data.daily.xpEarned,
        streakDay = data.streak.current,
        dailyChallengeComplete = data.daily.dailyChallengeComplete,
        freeGachaPullsEarned = data.daily.freePullsEarned,
        date = data.daily.date,
    }
end

function EnglishRewardsManager.GetRewardHistory(player, count)
    local data = playerData[player.UserId]
    if not data then return {} end
    count = count or 10
    local history = {}
    local idx = data.rewardHistoryIndex
    for i = 1, math.min(count, #data.rewardHistory) do
        local entry = data.rewardHistory[idx]
        if entry then table.insert(history, entry) end
        idx = idx - 1
        if idx < 1 then idx = CONFIG.HISTORY_BUFFER_SIZE end
    end
    return history
end

--------------------------------------------------------------------------------
-- PUBLIC API — MonetizationOrchestrator Bridge
--------------------------------------------------------------------------------

function EnglishRewardsManager.GetEngagementScore(player)
    -- Returns 0-100 score for MonetizationOrchestrator
    local data = playerData[player.UserId]
    if not data then return 0 end
    local streak = data.streak.current
    if streak >= 30 then return 100 end
    if streak >= 14 then return 80 end
    if streak >= 7 then return 60 end
    if streak >= 3 then return 40 end
    if streak >= 1 then return 20 end
    return 0
end

--------------------------------------------------------------------------------
-- PUBLIC API — Admin / Debug
--------------------------------------------------------------------------------

function EnglishRewardsManager.ResetStreak(player)
    local data = playerData[player.UserId]
    if not data then return end
    data.streak.current = 0
    data.streak.todayComplete = false
    savePlayerData(player)
end

function EnglishRewardsManager.GrantBonusReward(player, reward)
    deliverReward(player, reward)
end

function EnglishRewardsManager.GetDebugState(player)
    local data = playerData[player.UserId]
    if not data then return nil end
    return {
        streak = EnglishRewardsManager.GetStreak(player),
        tier = EnglishRewardsManager.GetTier(player),
        todayProgress = EnglishRewardsManager.GetTodayProgress(player),
        pendingRewards = pendingRewards[player.UserId] or {},
        lastReward = data.rewardHistory[data.rewardHistoryIndex],
        depsLoaded = {
            DataStoreV2 = Deps.DataStoreV2 ~= nil,
            AnalyticsService = Deps.AnalyticsService ~= nil,
            EconomyManager = Deps.EconomyManager ~= nil,
            GachaManager = Deps.GachaManager ~= nil,
            BattlePass = Deps.BattlePass ~= nil,
        },
    }
end

function EnglishRewardsManager.Shutdown()
    for _, player in ipairs(Players:GetPlayers()) do
        pcall(savePlayerData, player)
    end
    print("[EnglishRewardsManager] Shutdown — all data saved")
end

return EnglishRewardsManager
