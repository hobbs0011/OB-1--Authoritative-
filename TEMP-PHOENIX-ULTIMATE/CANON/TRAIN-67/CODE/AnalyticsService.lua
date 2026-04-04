--[[
═══════════════════════════════════════════════════════════
SURVIVE A BRAINROT — ANALYTICS SERVICE
Module: AnalyticsService.lua
Type: Server ModuleScript (ServerStorage)
Purpose: Centralized analytics hub — all game telemetry
         flows through this single module.
         Every module calls Analytics.Track() and this
         service handles dual-channel routing:
         Channel 1: Roblox AnalyticsService (real-time, free, dashboard)
         Channel 2: DataStore (aggregated, in-game adaptive systems)

Version: 1.0.2
Date: 2026-03-27
Patch: HTML entity sanitize (Studio-safe)

Active Mission: 100% Roblox — MAKE MONEY is the only goal
Gospel 444 Compliant — NO BLUE
Phoenix Rising Gaming Division
═══════════════════════════════════════════════════════════
]]

local Analytics = {}

-- SERVICES
local AnalyticsServiceRoblox = game:GetService("AnalyticsService")
local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

-- DATASTORES (aggregated data only — raw events go to Roblox AnalyticsService)
local PlayerStatsStore = DataStoreService:GetDataStore("PlayerAnalytics_v1")
local QuestionStatsStore = DataStoreService:GetDataStore("QuestionAnalytics_v1")
local EconomySnapshotStore = DataStoreService:GetDataStore("EconomySnapshots_v1")

local CONFIG = {
    MAX_BUFFER_SIZE = 500,
    FLUSH_INTERVAL = 60,
    ENABLE_ROBLOX_ANALYTICS = true,
    ENABLE_DATASTORE = true,
    MAX_WRITES_PER_FLUSH = 15,
    DEBUG_MODE = RunService:IsStudio(),
    LOG_EVENTS = false,
}

local eventBuffer = {}
local playerSessions = {}
local questionAggregates = {}
local economySnapshot = {
    coinsEarned = 0,
    coinsSpent = 0,
    gemsEarned = 0,
    gemsSpent = 0,
    tradesCompleted = 0,
    tradeTaxCollected = 0,
    totalRobuxSpent = 0,
}

local flushLoopRunning = false

local function aggregateEvent(eventName, props, player)
    local userId = player and player.UserId

    if userId and playerSessions[userId] then
        local s = playerSessions[userId]

        if eventName == "question_answered" then
            s.questionsAnswered = s.questionsAnswered + 1
            if props.isCorrect then
                s.questionsCorrect = s.questionsCorrect + 1
            end
        elseif eventName == "monetization_purchase_completed" then
            s.robuxSpent = s.robuxSpent + (props.price or 0)
            s.offersPurchased = s.offersPurchased + 1
        elseif eventName == "monetization_offer_shown" then
            s.offersShown = s.offersShown + 1
        elseif eventName == "player_death" then
            s.deathCount = s.deathCount + 1
        elseif eventName == "ftue_completed" then
            s.ftueCompleted = true
        elseif eventName == "monetization_gacha_pull" then
            s.gachaPulls = s.gachaPulls + 1
        elseif eventName == "combat_ended" and props.won then
            s.combatWins = s.combatWins + 1
        elseif eventName == "question_streak" then
            s.englishStreakBest = math.max(s.englishStreakBest, props.streakCount or 0)
        elseif eventName == "economy_currency_earned" then
            s.currencyEarned = s.currencyEarned + (props.amount or 0)
        elseif eventName == "economy_currency_spent" then
            s.currencySpent = s.currencySpent + (props.amount or 0)
        elseif eventName == "tier_promoted" then
            s.highestTier = props.toTier or s.highestTier
        end
    end

    if eventName == "question_answered" and props.questionId then
        local qid = tostring(props.questionId)
        if not questionAggregates[qid] then
            questionAggregates[qid] = { attempts = 0, correct = 0, totalResponseTime = 0, skips = 0 }
        end
        local q = questionAggregates[qid]
        q.attempts = q.attempts + 1
        if props.isCorrect then q.correct = q.correct + 1 end
        q.totalResponseTime = q.totalResponseTime + (props.responseTime or 0)
    elseif eventName == "question_skipped" and props.questionId then
        local qid = tostring(props.questionId)
        if not questionAggregates[qid] then
            questionAggregates[qid] = { attempts = 0, correct = 0, totalResponseTime = 0, skips = 0 }
        end
        questionAggregates[qid].skips = questionAggregates[qid].skips + 1
    end

    if eventName == "economy_currency_earned" then
        if props.currencyType == "coins" then
            economySnapshot.coinsEarned = economySnapshot.coinsEarned + (props.amount or 0)
        elseif props.currencyType == "gems" then
            economySnapshot.gemsEarned = economySnapshot.gemsEarned + (props.amount or 0)
        end
    elseif eventName == "economy_currency_spent" then
        if props.currencyType == "coins" then
            economySnapshot.coinsSpent = economySnapshot.coinsSpent + (props.amount or 0)
        elseif props.currencyType == "gems" then
            economySnapshot.gemsSpent = economySnapshot.gemsSpent + (props.amount or 0)
        end
    elseif eventName == "economy_trade_completed" then
        economySnapshot.tradesCompleted = economySnapshot.tradesCompleted + 1
        economySnapshot.tradeTaxCollected = economySnapshot.tradeTaxCollected + (props.taxAmount or 0)
    elseif eventName == "monetization_purchase_completed" then
        economySnapshot.totalRobuxSpent = economySnapshot.totalRobuxSpent + (props.price or 0)
    end
end

local function flushPlayerSession(userId, session)
    local key = "PSESSION:" .. tostring(userId) .. ":" .. os.date("%Y%m%d")
    pcall(function()
        PlayerStatsStore:UpdateAsync(key, function(old)
            old = old or {
                sessions = 0, totalTime = 0, totalQuestions = 0,
                totalCorrect = 0, totalSpent = 0, totalDeaths = 0
            }
            old.sessions = old.sessions + 1
            old.totalTime = old.totalTime + (session.duration or 0)
            old.totalQuestions = old.totalQuestions + session.questionsAnswered
            old.totalCorrect = old.totalCorrect + session.questionsCorrect
            old.totalSpent = old.totalSpent + session.robuxSpent
            old.totalDeaths = old.totalDeaths + session.deathCount
            old.lastSession = os.time()
            old.ftueCompleted = old.ftueCompleted or session.ftueCompleted
            old.highestTier = session.highestTier or old.highestTier
            old.bestStreak = math.max(old.bestStreak or 0, session.englishStreakBest)
            return old
        end)
    end)
end

local function flushQuestionAggregates()
    local writeCount = 0
    for qid, stats in pairs(questionAggregates) do
        if writeCount >= CONFIG.MAX_WRITES_PER_FLUSH then break end
        if stats.attempts > 0 then
            local key = "QSTATS:" .. tostring(qid)
            pcall(function()
                QuestionStatsStore:UpdateAsync(key, function(old)
                    old = old or { attempts = 0, correct = 0, totalTime = 0, skips = 0 }
                    old.attempts = old.attempts + stats.attempts
                    old.correct = old.correct + stats.correct
                    old.totalTime = old.totalTime + stats.totalResponseTime
                    old.skips = old.skips + stats.skips
                    old.correctRate = old.attempts > 0 and (old.correct / old.attempts) or 0
                    old.avgTime = old.attempts > 0 and (old.totalTime / old.attempts) or 0
                    old.skipRate = (old.attempts + old.skips) > 0
                        and (old.skips / (old.attempts + old.skips)) or 0
                    old.lastUpdated = os.time()
                    return old
                end)
            end)
            writeCount = writeCount + 1
        end
    end

    questionAggregates = {}
end

local function flushEconomySnapshot()
    local key = "ECON:" .. os.date("%Y%m%d")
    pcall(function()
        EconomySnapshotStore:UpdateAsync(key, function(old)
            old = old or {
                coinsEarned = 0, coinsSpent = 0, gemsEarned = 0,
                gemsSpent = 0, trades = 0, tax = 0, robux = 0
            }
            old.coinsEarned = old.coinsEarned + economySnapshot.coinsEarned
            old.coinsSpent = old.coinsSpent + economySnapshot.coinsSpent
            old.gemsEarned = old.gemsEarned + economySnapshot.gemsEarned
            old.gemsSpent = old.gemsSpent + economySnapshot.gemsSpent
            old.trades = old.trades + economySnapshot.tradesCompleted
            old.tax = old.tax + economySnapshot.tradeTaxCollected
            old.robux = old.robux + economySnapshot.totalRobuxSpent
            old.coinInflation = old.coinsEarned - old.coinsSpent
            old.gemInflation = old.gemsEarned - old.gemsSpent
            old.lastUpdated = os.time()
            return old
        end)
    end)

    economySnapshot = {
        coinsEarned = 0, coinsSpent = 0, gemsEarned = 0, gemsSpent = 0,
        tradesCompleted = 0, tradeTaxCollected = 0, totalRobuxSpent = 0,
    }
end

function Analytics.Track(eventName, properties, player)
    properties = properties or {}

    properties._timestamp = os.time()
    properties._serverJobId = game.JobId
    if player then
        properties._userId = player.UserId
        properties._displayName = player.DisplayName
    end

    if CONFIG.ENABLE_ROBLOX_ANALYTICS then
        local success, err = pcall(function()
            if player then
                AnalyticsServiceRoblox:FireCustomEvent(player, eventName, properties)
            else
                local anyPlayer = Players:GetPlayers()[1]
                if anyPlayer then
                    AnalyticsServiceRoblox:FireCustomEvent(anyPlayer, eventName, properties)
                end
            end
        end)
        if not success and CONFIG.DEBUG_MODE then
            warn("[AnalyticsService] Roblox event failed:", eventName, err)
        end
    end

    if CONFIG.ENABLE_DATASTORE then
        if #eventBuffer >= CONFIG.MAX_BUFFER_SIZE then
            table.remove(eventBuffer, 1)
        end
        table.insert(eventBuffer, {
            event = eventName,
            props = properties,
            time = os.time(),
        })
    end

    aggregateEvent(eventName, properties, player)
end

function Analytics.StartSession(player)
    local userId = player.UserId
    playerSessions[userId] = {
        startTime = os.time(),
        platform = "unknown",
        questionsAnswered = 0,
        questionsCorrect = 0,
        robuxSpent = 0,
        deathCount = 0,
        ftueCompleted = false,
        highestTier = "Mouse",
        offersShown = 0,
        offersPurchased = 0,
        gachaPulls = 0,
        combatWins = 0,
        englishStreakBest = 0,
        currencyEarned = 0,
        currencySpent = 0,
    }

    local isReturning = false
    local dailyStats = Analytics.GetPlayerDailyStats(userId)
    if dailyStats and dailyStats.sessions and dailyStats.sessions > 0 then
        isReturning = true
    end

    Analytics.Track("session_started", {
        platform = playerSessions[userId].platform,
        isReturning = isReturning,
        totalSessions = dailyStats and dailyStats.sessions or 0,
    }, player)
end

function Analytics.EndSession(player)
    local userId = player.UserId
    local session = playerSessions[userId]
    if not session then return end

    session.duration = os.time() - session.startTime

    Analytics.Track("session_ended", {
        sessionDuration = session.duration,
        questionsAnswered = session.questionsAnswered,
        questionsCorrect = session.questionsCorrect,
        correctRate = session.questionsAnswered > 0
            and (session.questionsCorrect / session.questionsAnswered) or 0,
        robuxSpent = session.robuxSpent,
        deathCount = session.deathCount,
        ftueCompleted = session.ftueCompleted,
        highestTier = session.highestTier,
        offersShown = session.offersShown,
        offersPurchased = session.offersPurchased,
        conversionRate = session.offersShown > 0
            and (session.offersPurchased / session.offersShown) or 0,
        combatWins = session.combatWins,
        englishStreakBest = session.englishStreakBest,
        platform = session.platform,
    }, player)

    flushPlayerSession(userId, session)
    playerSessions[userId] = nil
end

function Analytics.SetPlayerPlatform(player, platform)
    local userId = player.UserId
    if playerSessions[userId] then
        playerSessions[userId].platform = platform
    end
end

function Analytics.GetQuestionStats(questionId)
    local key = "QSTATS:" .. tostring(questionId)
    local success, data = pcall(function()
        return QuestionStatsStore:GetAsync(key)
    end)
    if success and data then
        return data
    end
    return nil
end

function Analytics.GetPlayerDailyStats(userId)
    local key = "PSESSION:" .. tostring(userId) .. ":" .. os.date("%Y%m%d")
    local success, data = pcall(function()
        return PlayerStatsStore:GetAsync(key)
    end)
    if success and data then
        return data
    end
    return nil
end

function Analytics.GetCurrentSession(userId)
    return playerSessions[userId]
end

function Analytics.GetEconomySnapshot()
    return economySnapshot
end

function Analytics.GetDiagnostics()
    local activeSessions = 0
    for _ in pairs(playerSessions) do activeSessions = activeSessions + 1 end

    local trackedQuestions = 0
    for _ in pairs(questionAggregates) do trackedQuestions = trackedQuestions + 1 end

    return {
        activeSessions = activeSessions,
        eventBufferSize = #eventBuffer,
        maxBufferSize = CONFIG.MAX_BUFFER_SIZE,
        trackedQuestions = trackedQuestions,
        economySnapshot = economySnapshot,
        flushInterval = CONFIG.FLUSH_INTERVAL,
        robloxAnalyticsEnabled = CONFIG.ENABLE_ROBLOX_ANALYTICS,
        dataStoreEnabled = CONFIG.ENABLE_DATASTORE,
        debugMode = CONFIG.DEBUG_MODE,
    }
end

function Analytics.Init()
    if flushLoopRunning then return end
    flushLoopRunning = true

    task.spawn(function()
        while flushLoopRunning do
            task.wait(CONFIG.FLUSH_INTERVAL)
            flushQuestionAggregates()
        end
    end)

    task.spawn(function()
        while flushLoopRunning do
            task.wait(600)
            flushEconomySnapshot()
        end
    end)

    task.spawn(function()
        while flushLoopRunning do
            task.wait(60)
            for userId, session in pairs(playerSessions) do
                local player = Players:GetPlayerByUserId(userId)
                if player then
                    Analytics.Track("session_heartbeat", {
                        currentTier = session.highestTier,
                        questionsAnswered = session.questionsAnswered,
                        sessionDuration = os.time() - session.startTime,
                    }, player)
                end
            end
        end
    end)

    if CONFIG.DEBUG_MODE then
        print("[AnalyticsService] Init complete — flush loops started")
    end
end

function Analytics.Shutdown()
    flushLoopRunning = false

    for userId, session in pairs(playerSessions) do
        local player = Players:GetPlayerByUserId(userId)
        if player then
            Analytics.EndSession(player)
        else
            session.duration = os.time() - session.startTime
            flushPlayerSession(userId, session)
        end
    end

    flushQuestionAggregates()
    flushEconomySnapshot()

    if CONFIG.DEBUG_MODE then
        print("[AnalyticsService] Shutdown complete — all data flushed")
    end
end

return Analytics
