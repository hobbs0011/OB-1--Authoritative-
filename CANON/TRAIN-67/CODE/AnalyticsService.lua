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

Version: 1.0
Date: 2026-03-27
Run: 62
Sources:
  - AnalyticsTelemetryIntegrationSpec.md (SHA: 427320695c7f)
  - UnifiedServer.lua (SHA: ccd827bf)
  - ReceiptRouter.lua (SHA: 11303d4c)
  - FTUEController.lua (SHA: 1a8475b0)
  - MonetizationArchitectureDeepDive.md (SHA: 63234bee)
  - ServerArchitectureQuestionBankScaling.md (SHA: f310ea1f)

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

-- ═══════════════════════════════════════════════════════
-- CONFIGURATION
-- ═══════════════════════════════════════════════════════

local CONFIG = {
    -- Buffer
    MAX_BUFFER_SIZE = 500,          -- events before oldest dropped
    FLUSH_INTERVAL = 60,            -- seconds between DataStore writes

    -- Channels
    ENABLE_ROBLOX_ANALYTICS = true, -- Roblox Creator Dashboard
    ENABLE_DATASTORE = true,        -- In-game aggregated stats

    -- Rate limiting (DataStore budget protection)
    -- Budget: 60 + 10*players per minute for Get/Set
    -- At 50 players = 560/min. We use ~17/min = 97% headroom.
    MAX_WRITES_PER_FLUSH = 15,      -- DataStore writes per flush cycle

    -- Debug
    DEBUG_MODE = RunService:IsStudio(),
    LOG_EVENTS = false,             -- print every event (very noisy)
}

-- ═══════════════════════════════════════════════════════
-- IN-MEMORY STATE
-- ═══════════════════════════════════════════════════════

-- Event buffer (ring buffer — oldest dropped when full)
local eventBuffer = {}

-- Per-player session aggregates (flushed on disconnect)
local playerSessions = {}
-- Structure: playerSessions[userId] = {
--   startTime, platform, questionsAnswered, questionsCorrect,
--   robuxSpent, deathCount, ftueCompleted, highestTier,
--   offersShown, offersPurchased, gachaPulls, combatWins,
--   englishStreakBest, currencyEarned, currencySpent
-- }

-- Per-question aggregates (flushed periodically)
local questionAggregates = {}
-- Structure: questionAggregates[questionId] = {
--   attempts, correct, totalResponseTime, skips
-- }

-- Economy snapshot (flushed every 10 minutes)
local economySnapshot = {
    coinsEarned = 0,
    coinsSpent = 0,
    gemsEarned = 0,
    gemsSpent = 0,
    tradesCompleted = 0,
    tradeTaxCollected = 0,
    totalRobuxSpent = 0,
}

-- Flush loop references (for cleanup)
local flushLoopRunning = false

-- ═══════════════════════════════════════════════════════
-- INTERNAL: AGGREGATION ENGINE
-- Updates in-memory summaries for DataStore flush
-- ═══════════════════════════════════════════════════════

local function aggregateEvent(eventName, props, player)
    local userId = player and player.UserId

    -- Player session aggregates
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

    -- Question aggregates
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

    -- Economy aggregates
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

-- ═══════════════════════════════════════════════════════
-- DATASTORE FLUSH ENGINE
-- Batched writes to stay within budget
-- ═══════════════════════════════════════════════════════

--- Flush a single player's session summary to DataStore
local function flushPlayerSession(userId, session)
    if not CONFIG.ENABLE_DATASTORE then return end

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

--- Flush question aggregates to DataStore
local function flushQuestionAggregates()
    if not CONFIG.ENABLE_DATASTORE then return end

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
                    -- Derived metrics
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

    -- Clear flushed aggregates
    questionAggregates = {}
end

--- Flush economy snapshot (every 10 minutes)
local function flushEconomySnapshot()
    if not CONFIG.ENABLE_DATASTORE then return end

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
            -- Derived: inflation indicators
            old.coinInflation = old.coinsEarned - old.coinsSpent
            old.gemInflation = old.gemsEarned - old.gemsSpent
            old.lastUpdated = os.time()
            return old
        end)
    end)

    -- Reset snapshot
    economySnapshot = {
        coinsEarned = 0, coinsSpent = 0, gemsEarned = 0, gemsSpent = 0,
        tradesCompleted = 0, tradeTaxCollected = 0, totalRobuxSpent = 0,
    }
end

-- ═══════════════════════════════════════════════════════
-- CORE PUBLIC API
-- ═══════════════════════════════════════════════════════

--- Track an event. This is the ONLY function other modules call.
--- Event naming: {domain}_{action}_{detail}
--- Examples: ftue_started, monetization_purchase_completed, question_answered
--- @param eventName string
--- @param properties table — event-specific key-value pairs
--- @param player Player|nil — the player this event relates to (nil for system events)
function Analytics.Track(eventName, properties, player)
    properties = properties or {}

    -- Enrich with standard fields
    properties._timestamp = os.time()
    properties._serverJobId = game.JobId
    if player then
        properties._userId = player.UserId
        properties._displayName = player.DisplayName
    end

    -- Channel 1: Roblox AnalyticsService (real-time, free, unlimited)
    -- This fires to the Roblox Creator Dashboard Custom Events tab
    if CONFIG.ENABLE_ROBLOX_ANALYTICS then
        local success, err = pcall(function()
            if player then
                AnalyticsServiceRoblox:FireCustomEvent(player, eventName, properties)
            else
                -- System events: fire for first connected player as proxy
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

    -- Channel 2: Buffer for DataStore aggregation
    if CONFIG.ENABLE_DATASTORE then
        if #eventBuffer >= CONFIG.MAX_BUFFER_SIZE then
            table.remove(eventBuffer, 1) -- drop oldest (ring buffer)
        end
        table.insert(eventBuffer, {
            event = eventName,
            props = properties,
            time = os.time(),
        })
    end

    -- Update in-memory aggregates (for periodic DataStore flush)
    aggregateEvent(eventName, properties, player)

    if CONFIG.LOG_EVENTS then
        print(string.format("[AnalyticsService] %s | %s",
            eventName, player and player.Name or "SYSTEM"))
    end
end

-- ═══════════════════════════════════════════════════════
-- SESSION LIFECYCLE
-- Called by UnifiedServer.lua in onPlayerAdded/onPlayerRemoving
-- ═══════════════════════════════════════════════════════

--- Initialize player session tracking
function Analytics.StartSession(player)
    local userId = player.UserId
    playerSessions[userId] = {
        startTime = os.time(),
        platform = "unknown", -- updated by client RemoteEvent
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

    -- Check if returning player (from DataStore)
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

--- End player session and flush to DataStore
function Analytics.EndSession(player)
    local userId = player.UserId
    local session = playerSessions[userId]
    if not session then return end

    session.duration = os.time() - session.startTime

    -- Fire session_ended event
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

    -- Flush player session to DataStore
    flushPlayerSession(userId, session)

    -- Clean up
    playerSessions[userId] = nil
end

--- Update player platform (called from client RemoteEvent)
function Analytics.SetPlayerPlatform(player, platform)
    local userId = player.UserId
    if playerSessions[userId] then
        playerSessions[userId].platform = platform
    end
end

-- ═══════════════════════════════════════════════════════
-- CONVENIENCE TRACKING METHODS
-- Pre-built wrappers for common event domains
-- ═══════════════════════════════════════════════════════

--- Track FTUE funnel step
--- Usage: Analytics.TrackFTUE("started", player, { platform = "mobile" })
function Analytics.TrackFTUE(step, player, props)
    props = props or {}
    Analytics.Track("ftue_" .. step, props, player)
end

--- Track monetization event
--- Usage: Analytics.TrackMonetization("purchase_completed", player, { price = 99 })
function Analytics.TrackMonetization(action, player, props)
    props = props or {}
    Analytics.Track("monetization_" .. action, props, player)
end

--- Track question/English event
--- Usage: Analytics.TrackQuestion("answered", player, { isCorrect = true })
function Analytics.TrackQuestion(action, player, props)
    props = props or {}
    Analytics.Track("question_" .. action, props, player)
end

--- Track economy event
--- Usage: Analytics.TrackEconomy("currency_earned", player, { amount = 100 })
function Analytics.TrackEconomy(action, player, props)
    props = props or {}
    Analytics.Track("economy_" .. action, props, player)
end

--- Track combat event
--- Usage: Analytics.TrackCombat("ended", player, { won = true })
function Analytics.TrackCombat(action, player, props)
    props = props or {}
    Analytics.Track("combat_" .. action, props, player)
end

-- ═══════════════════════════════════════════════════════
-- QUERY API (for in-game adaptive systems)
-- EloManager, MonetizationOrchestrator, QuestionService
-- can call these to read aggregated stats
-- ═══════════════════════════════════════════════════════

--- Get question health stats from DataStore
--- Returns: { attempts, correct, correctRate, avgTime, skipRate, ... } or nil
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

--- Get player's daily aggregated stats from DataStore
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

--- Get current session stats (in-memory, no DataStore hit)
function Analytics.GetCurrentSession(userId)
    return playerSessions[userId]
end

--- Get today's economy snapshot (in-memory, no DataStore hit)
function Analytics.GetEconomySnapshot()
    return economySnapshot
end

-- ═══════════════════════════════════════════════════════
-- DIAGNOSTICS API
-- ═══════════════════════════════════════════════════════

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

function Analytics.PrintDiagnostics()
    local d = Analytics.GetDiagnostics()
    print("══════════════════════════════════════════════════")
    print("📊 ANALYTICS SERVICE DIAGNOSTICS")
    print("══════════════════════════════════════════════════")
    print(string.format("Active Sessions:    %d", d.activeSessions))
    print(string.format("Event Buffer:       %d / %d", d.eventBufferSize, d.maxBufferSize))
    print(string.format("Tracked Questions:  %d", d.trackedQuestions))
    print(string.format("Economy — Coins:    +%d / -%d (net %d)",
        d.economySnapshot.coinsEarned, d.economySnapshot.coinsSpent,
        d.economySnapshot.coinsEarned - d.economySnapshot.coinsSpent))
    print(string.format("Economy — Robux:    %d R$ total", d.economySnapshot.totalRobuxSpent))
    print(string.format("Channels:           Roblox=%s DataStore=%s",
        tostring(d.robloxAnalyticsEnabled), tostring(d.dataStoreEnabled)))
    print("══════════════════════════════════════════════════")
end

-- ═══════════════════════════════════════════════════════
-- INIT (called by UnifiedServer.lua boot sequence)
-- ═══════════════════════════════════════════════════════

function Analytics.Init()
    if flushLoopRunning then return end
    flushLoopRunning = true

    -- Question aggregate flush (every FLUSH_INTERVAL seconds)
    task.spawn(function()
        while flushLoopRunning do
            task.wait(CONFIG.FLUSH_INTERVAL)
            flushQuestionAggregates()
        end
    end)

    -- Economy snapshot flush (every 10 minutes)
    task.spawn(function()
        while flushLoopRunning do
            task.wait(600)
            flushEconomySnapshot()
        end
    end)

    -- Session heartbeat (every 60 seconds, fires session_heartbeat for active players)
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

-- ═══════════════════════════════════════════════════════
-- SHUTDOWN (called by game:BindToClose in UnifiedServer)
-- ═══════════════════════════════════════════════════════

function Analytics.Shutdown()
    flushLoopRunning = false

    -- Flush all remaining player sessions
    for userId, session in pairs(playerSessions) do
        local player = Players:GetPlayerByUserId(userId)
        if player then
            Analytics.EndSession(player)
        else
            -- Player already gone, just flush data
            session.duration = os.time() - session.startTime
            flushPlayerSession(userId, session)
        end
    end

    -- Final flushes
    flushQuestionAggregates()
    flushEconomySnapshot()

    if CONFIG.DEBUG_MODE then
        print("[AnalyticsService] Shutdown complete — all data flushed")
    end
end

--[[
═══════════════════════════════════════════════════════════
INTEGRATION GUIDE — How to wire this into existing modules
═══════════════════════════════════════════════════════════

1. UnifiedServer.lua BOOT_ORDER — add after DataStoreV2:
   { name = "AnalyticsService", path = "AnalyticsService", required = false },

2. UnifiedServer.lua onPlayerAdded — add:
   if Modules.AnalyticsService then
       Modules.AnalyticsService.StartSession(player)
   end

3. UnifiedServer.lua onPlayerRemoving — add BEFORE DataStoreV2.SavePlayer:
   if Modules.AnalyticsService then
       Modules.AnalyticsService.EndSession(player)
   end

4. UnifiedServer.lua game:BindToClose — add:
   if Modules.AnalyticsService then
       Modules.AnalyticsService.Shutdown()
   end

5. In any module that wants to track events:
   local Analytics = require(path.to.AnalyticsService)
   Analytics.Track("event_name", { key = value }, player)

   Or use convenience methods:
   Analytics.TrackFTUE("completed", player, { totalTime = 58 })
   Analytics.TrackMonetization("purchase_completed", player, { price = 99 })
   Analytics.TrackQuestion("answered", player, { isCorrect = true })
   Analytics.TrackEconomy("currency_earned", player, { amount = 100 })

COMPLETE EVENT TAXONOMY: See AnalyticsTelemetryIntegrationSpec.md §3
═══════════════════════════════════════════════════════════
]]

return Analytics
