# Analytics & Telemetry Integration Spec — Survive a Brainrot

> **Artifact Class:** 🔨 BUILD
> **Run:** 50 | **Date:** 2026-03-27 05:00 ICT
> **Active Mission:** 100% Roblox — MAKE MONEY is the only goal
> **Sources:** MonetizationArchitectureDeepDive.md (`63234bee`), ServerArchitectureQuestionBankScaling.md (`f310ea1f`), FTUECompressionAnalysis.md (`c47a1859`), ReceiptRouter.lua (`11303d4c`), MobileFirstEnglishInputDesign.md (`305efd84`)
> **Cross-repo sources:** 5 files from `hobbs0011/Phoenix-Rising-Protocol-Ultimate`

---

## 1. Executive Summary

**The game has zero analytics.** No conversion tracking, no funnel visibility, no ARPU calculation, no question performance data, no FTUE drop-off measurement. You can't optimize what you can't measure, and you can't make money from what you can't optimize.

This spec defines the **complete analytics and telemetry layer** for Survive a Brainrot — every event to track, the technical architecture within Roblox constraints, the DataStore schema, dashboard metrics, and integration points with all existing modules. It bridges the gap identified in MonetizationArchitectureDeepDive (Gap #5) and ServerArchitectureQuestionBankScaling (§4.11).

**Bottom line:** Analytics is not a nice-to-have. Without it, every monetization decision is a guess. With it, Michael can see exactly where money is being left on the table and fix it.

---

## 2. What We Need to Measure (The Money Questions)

Every metric exists to answer a revenue question:

| Question | Metric | Module |
|---|---|---|
| Are players staying? | Session length, return rate, D1/D7/D30 retention | SessionAnalytics |
| Are players paying? | Conversion rate, ARPU, ARPPU, time-to-first-purchase | MonetizationAnalytics |
| Where do players drop off in FTUE? | FTUE funnel (start → Q1 → Q3 → chest → complete) | FTUEAnalytics |
| Which offers convert? | Offer shown vs purchased, per-offer conversion rate | MonetizationAnalytics |
| Is English driving revenue? | English activity → gacha pull correlation, BP XP from English | EngagementAnalytics |
| Which questions are broken? | Question correctRate, avgTime, skipRate, discriminationIndex | QuestionAnalytics |
| Is the economy healthy? | Currency sinks vs faucets, inflation rate, marketplace volume | EconomyAnalytics |
| What's the whale profile? | Spending distribution, top spender behavior, LTV prediction | MonetizationAnalytics |

---

## 3. Event Taxonomy

### 3.1 Event Naming Convention

All events follow: `{domain}_{action}_{detail}`

Examples:
- `ftue_started` / `ftue_completed` / `ftue_abandoned`
- `monetization_offer_shown` / `monetization_purchase_completed`
- `question_answered_correct` / `question_answered_incorrect`
- `session_started` / `session_ended`

### 3.2 Master Event List

#### Session Events

| Event | Fires When | Properties |
|---|---|---|
| `session_started` | Player joins server | `{userId, platform, isReturning, daysSinceLastSession, totalSessions}` |
| `session_ended` | Player leaves or disconnect | `{userId, sessionDuration, questionsAnswered, robuxSpent, deathCount}` |
| `session_heartbeat` | Every 60 seconds | `{userId, currentArea, currentTier, isInCombat, isInFTUE}` |

#### FTUE Events

| Event | Fires When | Properties |
|---|---|---|
| `ftue_started` | FTUE sequence begins | `{userId, platform, isFirstEver}` |
| `ftue_question_shown` | Question displayed in FTUE | `{userId, questionId, questionNumber, tier, timeInFTUE}` |
| `ftue_question_answered` | Player answers FTUE question | `{userId, questionId, isCorrect, responseTime, questionNumber}` |
| `ftue_chest_spawned` | Chest appears (3 correct) | `{userId, timeInFTUE, questionsAnswered, correctCount}` |
| `ftue_chest_opened` | Player opens chest | `{userId, timeInFTUE, rewardType, rewardAmount}` |
| `ftue_premium_tease_shown` | Premium tease displayed (s42-48) | `{userId, teaseType, timeInFTUE}` |
| `ftue_premium_tease_tapped` | Player taps premium tease | `{userId, teaseType, timeInFTUE}` |
| `ftue_completed` | FTUE sequence ends | `{userId, totalTime, questionsAnswered, correctRate, tierReached, platform}` |
| `ftue_abandoned` | Player leaves during FTUE | `{userId, abandonPhase, timeInFTUE, lastQuestionNumber}` |

#### Monetization Events

| Event | Fires When | Properties |
|---|---|---|
| `monetization_offer_shown` | Any purchase prompt displayed | `{userId, offerId, offerType, price, context, timeSinceLastOffer}` |
| `monetization_offer_dismissed` | Player closes offer without buying | `{userId, offerId, offerType, dismissTime}` |
| `monetization_purchase_started` | Player initiates Robux purchase | `{userId, productId, productType, price}` |
| `monetization_purchase_completed` | Receipt processed successfully | `{userId, productId, productType, price, handlerName, isFirstPurchase}` |
| `monetization_purchase_failed` | Receipt processing failed | `{userId, productId, error, willRetry}` |
| `monetization_gamepass_checked` | Ownership check performed | `{userId, passId, passName, ownsPass}` |
| `monetization_battlepass_purchased` | BP bought | `{userId, seasonId, price}` |
| `monetization_battlepass_tier_reached` | BP tier unlocked | `{userId, seasonId, tierNumber, isPremiumTrack}` |
| `monetization_gacha_pull` | Crate opened | `{userId, crateType, resultRarity, isPityGuaranteed, pullNumber}` |
| `monetization_spending_milestone` | Total spend crosses threshold | `{userId, milestone, totalSpent, daysSinceFirst}` |

#### Question & English Events

| Event | Fires When | Properties |
|---|---|---|
| `question_served` | Question sent to player | `{userId, questionId, tier, subTier, format, eloGap}` |
| `question_answered` | Player submits answer | `{userId, questionId, isCorrect, responseTime, format, inputMode}` |
| `question_skipped` | Player skips without answering | `{userId, questionId, tier, format, timeBeforeSkip}` |
| `question_streak` | Correct answer streak milestone | `{userId, streakCount, tier, xpAwarded}` |
| `english_daily_challenge_started` | Daily challenge begun | `{userId, challengeId, challengeType}` |
| `english_daily_challenge_completed` | Daily challenge finished | `{userId, challengeId, isSuccess, timeToComplete, xpAwarded}` |
| `elo_updated` | Player Elo changes | `{userId, oldElo, newElo, questionId, isCorrect}` |
| `tier_promoted` | Player advances tier | `{userId, fromTier, toTier, questionsAtOldTier, timeAtOldTier}` |

#### Economy Events

| Event | Fires When | Properties |
|---|---|---|
| `economy_currency_earned` | Player earns coins/gems | `{userId, currencyType, amount, source}` |
| `economy_currency_spent` | Player spends coins/gems | `{userId, currencyType, amount, destination}` |
| `economy_trade_completed` | Marketplace trade | `{userId, buyerId, sellerId, itemId, price, taxAmount}` |
| `economy_daily_reward_claimed` | Daily login reward | `{userId, dayStreak, rewardType, rewardAmount}` |

#### Combat & Gameplay Events

| Event | Fires When | Properties |
|---|---|---|
| `combat_started` | Combat encounter begins | `{userId, enemyType, playerTier}` |
| `combat_ended` | Combat resolves | `{userId, won, enemyType, questionsInCombat, correctRate, duration}` |
| `player_death` | Player dies | `{userId, deathCause, hadRevive, usedRevive, sessionDeaths}` |
| `revive_prompt_shown` | Revive purchase prompt | `{userId, deathCount, hasRevivePass}` |
| `revive_purchased` | Player buys revive | `{userId, productId, price, deathCount}` |

---

## 4. Technical Architecture

### 4.1 Design Constraints (Roblox Platform)

| Constraint | Value | Impact |
|---|---|---|
| DataStore GetAsync rate | 60 + 10×players per minute | Must batch writes aggressively |
| DataStore SetAsync rate | 60 + 10×players per minute | Same |
| DataStore key size | 50 characters max | Use compact key format |
| DataStore value size | 4MB max per key | Aggregate, don't store raw events |
| HttpService rate | 500 requests/min | External analytics possible but rate-limited |
| AnalyticsService (Roblox) | Built-in, free, unlimited | Primary telemetry channel |
| Custom events | Via `AnalyticsService:FireCustomEvent()` | Up to 120 unique event names |
| Memory | Server-side ~500MB ceiling | Buffer size matters |

### 4.2 Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    EVENT PRODUCERS                             │
│  FTUEManager │ MonetizationOrchestrator │ QuestionService     │
│  CombatSystem │ EconomyManager │ BattlePass │ ReceiptRouter   │
│  DailyRewards │ GachaManager │ ReferralSystem │ SessionMgr    │
│                                                                │
│  Each module calls: Analytics.Track(eventName, properties)     │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                    ANALYTICS CORE (AnalyticsService.lua)       │
│                                                                │
│  ┌────────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │ Event Buffer    │  │ Aggregator    │  │ Flush Engine    │  │
│  │ In-memory ring  │  │ Per-player    │  │ Batch writes    │  │
│  │ Max 500 events  │  │ Per-question  │  │ Every 60s       │  │
│  │ Overflow = drop  │  │ Per-session   │  │ + on disconnect │  │
│  │ oldest          │  │ summaries     │  │                 │  │
│  └───────┬────────┘  └──────┬────────┘  └────────┬────────┘  │
│          │                   │                     │           │
│          ▼                   ▼                     ▼           │
│  ┌──────────────────────────────────────────────────────┐     │
│  │              DUAL OUTPUT CHANNELS                     │     │
│  │                                                       │     │
│  │  Channel 1: Roblox AnalyticsService                   │     │
│  │    → FireCustomEvent() for all events                 │     │
│  │    → Free, unlimited, appears in Creator Dashboard    │     │
│  │    → Real-time, no DataStore budget impact            │     │
│  │    → Primary channel for funnel analysis              │     │
│  │                                                       │     │
│  │  Channel 2: DataStore (aggregated)                    │     │
│  │    → Per-player session summaries                     │     │
│  │    → Per-question performance stats                   │     │
│  │    → Daily/weekly economy snapshots                   │     │
│  │    → Used for in-game adaptive systems                │     │
│  │    → Budget-conscious: batch writes only              │     │
│  └──────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

### 4.3 Why Dual Channels?

| Channel | Roblox AnalyticsService | DataStore |
|---|---|---|
| Purpose | External dashboard, funnel analysis, trends | In-game adaptive systems, Elo, question health |
| Rate limit | Unlimited | 60 + 10×players/min |
| Data access | Roblox Creator Dashboard (web) | Server-side Lua only |
| Retention | Roblox manages (90 days) | Permanent (until deleted) |
| Cost | Free | Free (within budget) |
| Granularity | Per-event | Aggregated summaries |
| Use case | "How many players completed FTUE?" | "What's this question's correctRate?" |

**Rule:** Every event fires to Roblox AnalyticsService (free, real-time). Only aggregated summaries write to DataStore (budget-constrained, for in-game use).

---

## 5. Module Implementation — AnalyticsService.lua

```lua
--[[
═══════════════════════════════════════════════════════════
SURVIVE A BRAINROT — ANALYTICS SERVICE
Module: AnalyticsService.lua
Type: Server Module (ServerScriptService)
Purpose: Centralized analytics hub — all game telemetry
         flows through this single module
Version: 1.0
Date: March 27, 2026
Pipeline: Active Mission — 100% Roblox (Pulse Run 50)
Gospel 444 Compliant
Phoenix Rising Gaming Division
═══════════════════════════════════════════════════════════
]]

local Analytics = {}

-- SERVICES
local AnalyticsServiceRoblox = game:GetService("AnalyticsService")
local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

-- DATASTORES (aggregated data only)
local PlayerStatsStore = DataStoreService:GetDataStore("PlayerAnalytics_v1")
local QuestionStatsStore = DataStoreService:GetDataStore("QuestionAnalytics_v1")
local EconomySnapshotStore = DataStoreService:GetDataStore("EconomySnapshots_v1")
local DailyMetricsStore = DataStoreService:GetDataStore("DailyMetrics_v1")

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
    MAX_WRITES_PER_FLUSH = 15,      -- DataStore writes per flush cycle
    
    -- Debug
    DEBUG_MODE = RunService:IsStudio(),
    LOG_EVENTS = false,             -- print every event (noisy)
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

-- Economy snapshot (flushed daily)
local economySnapshot = {
    coinsEarned = 0,
    coinsSpent = 0,
    gemsEarned = 0,
    gemsSpent = 0,
    tradesCompleted = 0,
    tradeTaxCollected = 0,
    totalRobuxSpent = 0,
}

-- ═══════════════════════════════════════════════════════
-- CORE API
-- ═══════════════════════════════════════════════════════

--- Track an event. This is the ONLY function other modules call.
--- @param eventName string — follows {domain}_{action}_{detail} convention
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
    
    -- Channel 1: Roblox AnalyticsService (real-time, free)
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
            warn("[Analytics] Roblox event failed:", eventName, err)
        end
    end
    
    -- Channel 2: Buffer for DataStore aggregation
    if CONFIG.ENABLE_DATASTORE then
        if #eventBuffer >= CONFIG.MAX_BUFFER_SIZE then
            table.remove(eventBuffer, 1) -- drop oldest
        end
        table.insert(eventBuffer, {
            event = eventName,
            props = properties,
            time = os.time(),
        })
    end
    
    -- Update in-memory aggregates
    aggregateEvent(eventName, properties, player)
    
    if CONFIG.LOG_EVENTS then
        print(string.format("[Analytics] %s | %s", eventName, 
            player and player.Name or "SYSTEM"))
    end
end

-- ═══════════════════════════════════════════════════════
-- AGGREGATION ENGINE
-- Updates in-memory summaries for DataStore flush
-- ═══════════════════════════════════════════════════════

function aggregateEvent(eventName, props, player)
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
        end
    end

    -- Question aggregates
    if eventName == "question_answered" and props.questionId then
        local qid = props.questionId
        if not questionAggregates[qid] then
            questionAggregates[qid] = { attempts = 0, correct = 0, totalResponseTime = 0, skips = 0 }
        end
        local q = questionAggregates[qid]
        q.attempts = q.attempts + 1
        if props.isCorrect then q.correct = q.correct + 1 end
        q.totalResponseTime = q.totalResponseTime + (props.responseTime or 0)
    elseif eventName == "question_skipped" and props.questionId then
        local qid = props.questionId
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
-- SESSION LIFECYCLE
-- ═══════════════════════════════════════════════════════

--- Initialize player session tracking (call on PlayerAdded)
function Analytics.StartSession(player)
    local userId = player.UserId
    playerSessions[userId] = {
        startTime = os.time(),
        platform = Analytics.DetectPlatform(player),
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

    Analytics.Track("session_started", {
        platform = playerSessions[userId].platform,
        isReturning = false, -- DataStore check needed
    }, player)
end

--- End player session (call on PlayerRemoving)
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
        offersShown = session.offersShown,
        offersPurchased = session.offersPurchased,
        conversionRate = session.offersShown > 0 
            and (session.offersPurchased / session.offersShown) or 0,
        platform = session.platform,
    }, player)

    -- Flush player session to DataStore
    flushPlayerSession(userId, session)

    -- Clean up
    playerSessions[userId] = nil
end

--- Detect player platform
function Analytics.DetectPlatform(player)
    -- Roblox doesn't expose platform directly in server scripts
    -- Use UserInputService on client and send via RemoteEvent
    -- Default to "unknown" until client reports
    return "unknown"
end

-- ═══════════════════════════════════════════════════════
-- DATASTORE FLUSH ENGINE
-- Batched writes to stay within budget
-- ═══════════════════════════════════════════════════════

--- Flush a single player's session summary to DataStore
function flushPlayerSession(userId, session)
    if not CONFIG.ENABLE_DATASTORE then return end

    local key = "PSESSION:" .. tostring(userId) .. ":" .. os.date("%Y%m%d")
    pcall(function()
        PlayerStatsStore:UpdateAsync(key, function(old)
            old = old or { sessions = 0, totalTime = 0, totalQuestions = 0, 
                           totalCorrect = 0, totalSpent = 0, totalDeaths = 0 }
            old.sessions = old.sessions + 1
            old.totalTime = old.totalTime + (session.duration or 0)
            old.totalQuestions = old.totalQuestions + session.questionsAnswered
            old.totalCorrect = old.totalCorrect + session.questionsCorrect
            old.totalSpent = old.totalSpent + session.robuxSpent
            old.totalDeaths = old.totalDeaths + session.deathCount
            old.lastSession = os.time()
            old.ftueCompleted = old.ftueCompleted or session.ftueCompleted
            return old
        end)
    end)
end

--- Flush question aggregates to DataStore
function flushQuestionAggregates()
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

--- Flush economy snapshot (daily)
function flushEconomySnapshot()
    if not CONFIG.ENABLE_DATASTORE then return end

    local key = "ECON:" .. os.date("%Y%m%d")
    pcall(function()
        EconomySnapshotStore:UpdateAsync(key, function(old)
            old = old or { coinsEarned = 0, coinsSpent = 0, gemsEarned = 0, 
                           gemsSpent = 0, trades = 0, tax = 0, robux = 0 }
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

    -- Reset snapshot
    economySnapshot = {
        coinsEarned = 0, coinsSpent = 0, gemsEarned = 0, gemsSpent = 0,
        tradesCompleted = 0, tradeTaxCollected = 0, totalRobuxSpent = 0,
    }
end

-- Periodic flush
task.spawn(function()
    while true do
        task.wait(CONFIG.FLUSH_INTERVAL)
        flushQuestionAggregates()
    end
end)

-- Economy flush every 10 minutes
task.spawn(function()
    while true do
        task.wait(600)
        flushEconomySnapshot()
    end
end)

-- ═══════════════════════════════════════════════════════
-- PLAYER LIFECYCLE HOOKS
-- ═══════════════════════════════════════════════════════

Players.PlayerAdded:Connect(function(player)
    Analytics.StartSession(player)
end)

Players.PlayerRemoving:Connect(function(player)
    Analytics.EndSession(player)
end)

-- Server shutdown: flush all remaining sessions
game:BindToClose(function()
    for userId, session in pairs(playerSessions) do
        local player = Players:GetPlayerByUserId(userId)
        if player then
            Analytics.EndSession(player)
        end
    end
    flushQuestionAggregates()
    flushEconomySnapshot()
end)

-- ═══════════════════════════════════════════════════════
-- CONVENIENCE METHODS
-- Pre-built tracking for common patterns
-- ═══════════════════════════════════════════════════════

--- Track FTUE funnel step
function Analytics.TrackFTUE(step, player, props)
    props = props or {}
    Analytics.Track("ftue_" .. step, props, player)
end

--- Track monetization event
function Analytics.TrackMonetization(action, player, props)
    props = props or {}
    Analytics.Track("monetization_" .. action, props, player)
end

--- Track question event
function Analytics.TrackQuestion(action, player, props)
    props = props or {}
    Analytics.Track("question_" .. action, props, player)
end

--- Track economy event  
function Analytics.TrackEconomy(action, player, props)
    props = props or {}
    Analytics.Track("economy_" .. action, props, player)
end

-- ═══════════════════════════════════════════════════════
-- QUERY API (for in-game adaptive systems)
-- ═══════════════════════════════════════════════════════

--- Get question health stats (from DataStore)
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

--- Get player's daily stats
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

-- ═══════════════════════════════════════════════════════
-- DIAGNOSTICS
-- ═══════════════════════════════════════════════════════

function Analytics.GetDiagnostics()
    local activeSessions = 0
    for _ in pairs(playerSessions) do activeSessions = activeSessions + 1 end
    
    local trackedQuestions = 0
    for _ in pairs(questionAggregates) do trackedQuestions = trackedQuestions + 1 end

    return {
        activeSessions = activeSessions,
        eventBufferSize = #eventBuffer,
        trackedQuestions = trackedQuestions,
        economySnapshot = economySnapshot,
        config = CONFIG,
    }
end

function Analytics.PrintDiagnostics()
    local d = Analytics.GetDiagnostics()
    print("══════════════════════════════════════════════════")
    print("📊 ANALYTICS SERVICE DIAGNOSTICS")
    print("══════════════════════════════════════════════════")
    print(string.format("Active Sessions:    %d", d.activeSessions))
    print(string.format("Event Buffer:       %d / %d", d.eventBufferSize, CONFIG.MAX_BUFFER_SIZE))
    print(string.format("Tracked Questions:  %d", d.trackedQuestions))
    print(string.format("Economy — Coins:    +%d / -%d (net %d)", 
        d.economySnapshot.coinsEarned, d.economySnapshot.coinsSpent,
        d.economySnapshot.coinsEarned - d.economySnapshot.coinsSpent))
    print(string.format("Economy — Robux:    %d R$ total", d.economySnapshot.totalRobuxSpent))
    print("══════════════════════════════════════════════════")
end

return Analytics
```

---

## 6. Integration Points — Module-by-Module Wiring

### 6.1 ReceiptRouter.lua Integration

ReceiptRouter already has an audit trail. Replace its standalone audit with Analytics calls:

```lua
-- In ReceiptRouter.lua processReceipt(), after granting:
local Analytics = require(path.to.AnalyticsService)

-- After successful grant (step 5):
Analytics.TrackMonetization("purchase_completed", player, {
    productId = productId,
    productType = handlerConfig.module,
    price = receiptInfo.CurrencySpent or 0,
    handlerName = handlerConfig.name,
    route = routeType,
    isFirstPurchase = (playerSession.offersPurchased == 0),
})

-- After failure:
Analytics.TrackMonetization("purchase_failed", player, {
    productId = productId,
    error = handlerError or "handler returned false",
    willRetry = true,
})
```

### 6.2 FTUEManager.lua Integration

```lua
local Analytics = require(path.to.AnalyticsService)

-- On FTUE start:
Analytics.TrackFTUE("started", player, { platform = platform, isFirstEver = isFirst })

-- On each question shown:
Analytics.TrackFTUE("question_shown", player, {
    questionId = qid, questionNumber = num, tier = tier, timeInFTUE = elapsed
})

-- On question answered:
Analytics.TrackFTUE("question_answered", player, {
    questionId = qid, isCorrect = correct, responseTime = rt, questionNumber = num
})

-- On premium tease (the money moment):
Analytics.TrackFTUE("premium_tease_shown", player, { teaseType = "golden_chest", timeInFTUE = elapsed })

-- On FTUE complete:
Analytics.TrackFTUE("completed", player, {
    totalTime = elapsed, questionsAnswered = count, correctRate = rate, tierReached = tier
})

-- On FTUE abandon:
Analytics.TrackFTUE("abandoned", player, {
    abandonPhase = phase, timeInFTUE = elapsed, lastQuestionNumber = num
})
```

### 6.3 QuestionService.lua Integration

```lua
local Analytics = require(path.to.AnalyticsService)

-- On question served:
Analytics.TrackQuestion("served", player, {
    questionId = q.id, tier = q.tier, subTier = q.subTier,
    format = q.format, eloGap = math.abs(playerElo - questionElo)
})

-- On answer processed:
Analytics.TrackQuestion("answered", player, {
    questionId = q.id, isCorrect = result, responseTime = timeSeconds,
    format = q.format, inputMode = context.inputMode
})

-- On skip:
Analytics.TrackQuestion("skipped", player, {
    questionId = q.id, tier = q.tier, format = q.format, timeBeforeSkip = elapsed
})

-- On streak:
Analytics.TrackQuestion("streak", player, {
    streakCount = streak, tier = currentTier, xpAwarded = xp
})
```

### 6.4 MonetizationOrchestrator.lua Integration (when built)

```lua
local Analytics = require(path.to.AnalyticsService)

-- On offer shown:
Analytics.TrackMonetization("offer_shown", player, {
    offerId = offer.id, offerType = offer.type, price = offer.price,
    context = context, -- "death", "ftue", "near_miss", "daily"
    timeSinceLastOffer = elapsed
})

-- On offer dismissed:
Analytics.TrackMonetization("offer_dismissed", player, {
    offerId = offer.id, offerType = offer.type, dismissTime = viewDuration
})
```

### 6.5 CombatSystem.lua Integration

```lua
-- On combat end:
Analytics.Track("combat_ended", {
    won = playerWon, enemyType = enemy.type,
    questionsInCombat = questionCount, correctRate = rate, duration = elapsed
}, player)

-- On death:
Analytics.Track("player_death", {
    deathCause = cause, hadRevive = hasRevive, usedRevive = used,
    sessionDeaths = deathCount
}, player)
```

---

## 7. Key Dashboard Metrics (Roblox Creator Dashboard)

These are the metrics Michael should monitor daily via Roblox Creator Dashboard Custom Events:

### 7.1 Revenue Metrics

| Metric | Calculation | Target |
|---|---|---|
| **ARPU** (Avg Revenue Per User) | Total Robux / Total DAU | > 5 R$/DAU |
| **ARPPU** (Avg Revenue Per Paying User) | Total Robux / Paying Users | > 100 R$/payer |
| **Conversion Rate** | Paying Users / Total Users | > 2% |
| **Time to First Purchase** | Avg time from session_started to first purchase_completed | < 15 min |
| **Offer Conversion Rate** | offer_purchased / offer_shown per type | > 3% |

### 7.2 Engagement Metrics

| Metric | Calculation | Target |
|---|---|---|
| **D1 Retention** | Users returning next day / DAU | > 40% |
| **D7 Retention** | Users returning after 7 days / WAU | > 20% |
| **Session Length** | Avg session_ended.duration | > 10 min |
| **Questions/Session** | Avg session_ended.questionsAnswered | > 15 |
| **Correct Rate** | Avg session_ended.correctRate | 60-80% (sweet spot) |

### 7.3 FTUE Metrics (Critical)

| Metric | Calculation | Target |
|---|---|---|
| **FTUE Start Rate** | ftue_started / session_started | > 95% |
| **FTUE Completion Rate** | ftue_completed / ftue_started | > 80% |
| **FTUE Drop-off Point** | Last ftue_question_shown before ftue_abandoned | Identify |
| **FTUE Duration** | Avg ftue_completed.totalTime | < 60s |
| **FTUE → First Purchase** | purchase within 24h of ftue_completed | > 5% |

### 7.4 Content Health Metrics

| Metric | Calculation | Target |
|---|---|---|
| **Question Skip Rate** | question_skipped / (question_served) per question | < 10% |
| **Question Difficulty** | 1 - correctRate per question | 0.2 - 0.8 |
| **Discrimination Index** | Correlation: question performance vs player Elo | > 0.1 |
| **Format Success Rate** | correctRate per format type | > 40% |

### 7.5 Economy Health

| Metric | Calculation | Target |
|---|---|---|
| **Coin Inflation** | coinsEarned - coinsSpent (daily) | Near zero |
| **Gem Inflation** | gemsEarned - gemsSpent (daily) | Slightly negative |
| **Marketplace Volume** | tradesCompleted (daily) | Trending up |
| **Tax Revenue** | tradeTaxCollected (daily) | > 10% of volume |

---

## 8. Implementation Priority

| # | Task | Module | Effort | Dependencies |
|---|---|---|---|---|
| 1 | **Create AnalyticsService.lua** | New module | 3hr | None |
| 2 | **Wire session tracking** | UnifiedServer + Analytics | 30min | #1 |
| 3 | **Wire FTUE events** | FTUEManager + Analytics | 1hr | #1 |
| 4 | **Wire ReceiptRouter events** | ReceiptRouter + Analytics | 30min | #1 |
| 5 | **Wire question events** | QuestionBank/Service + Analytics | 1hr | #1 |
| 6 | **Wire combat/death events** | CombatSystem + Analytics | 30min | #1 |
| 7 | **Wire economy events** | EconomyManager + Analytics | 30min | #1 |
| 8 | **Platform detection (client)** | New RemoteEvent | 30min | #1 |
| 9 | **Studio integration test** | Test harness | 1hr | #1-8 |
| 10 | **Custom Dashboard setup** | Roblox Creator Dashboard | 30min | Events flowing |

**Total estimated effort:** ~8.5 hours

**Critical path:** #1 → #2 (session lifecycle first, everything else can parallelize after)

---

## 9. DataStore Budget Analysis

With 50 concurrent players (target server capacity):

| Operation | Budget (60 + 10×50) | Actual Usage | Headroom |
|---|---|---|---|
| GetAsync/min | 560 | ~20 (question stats queries) | 96% free |
| SetAsync/min | 560 | ~15 (flush cycle) + ~2 (player disconnect) = ~17 | 97% free |

**Verdict:** Analytics fits comfortably within DataStore budget. The dual-channel strategy (Roblox AnalyticsService for events, DataStore only for aggregates) ensures we never hit rate limits.

---

## 10. Future Enhancements

| Phase | Enhancement | Value |
|---|---|---|
| V1.1 | Client-side platform detection RemoteEvent | Accurate mobile vs desktop split |
| V1.2 | Retention calculation (D1/D7/D30) via DataStore player history | Retention dashboard |
| V2.0 | A/B test result tracking (variant → metric correlation) | Data-driven optimization |
| V2.1 | Whale detection (spending velocity alerts) | VIP treatment triggers |
| V2.2 | Question auto-retirement (flag questions below health thresholds) | Self-healing content |
| V3.0 | External analytics pipeline (HttpService → webhook → dashboard) | Custom BI |

---

## 11. Cross-Reference Map

| Source | Location | Key Content Used |
|---|---|---|
| MonetizationArchitectureDeepDive.md | `CANON/TRAIN-67/DOCS/` (SHA `63234bee`) | Gap #5: No Analytics, monetization events needed |
| ServerArchitectureQuestionBankScaling.md | `CANON/TRAIN-67/DOCS/` (SHA `f310ea1f`) | §4.11 QuestionAnalytics design, Elo tracking |
| FTUECompressionAnalysis.md | `CANON/TRAIN-67/DOCS/` (SHA `c47a1859`) | FTUE funnel steps, drop-off tracking |
| ReceiptRouter.lua | `CANON/TRAIN-67/CODE/` (SHA `11303d4c`) | Existing audit trail, integration point |
| MobileFirstEnglishInputDesign.md | `CANON/TRAIN-67/DOCS/` (SHA `305efd84`) | Input mode tracking, format analytics |

---

## 12. Summary Verdict

**Without analytics, every monetization decision is a guess. With this spec implemented, Michael can see:**

1. **Where money is lost** — FTUE drop-off funnel shows exactly where players leave
2. **Which offers work** — per-offer conversion rates reveal what to promote and what to kill
3. **Which questions are broken** — question health metrics flag bad content automatically
4. **Whether English drives revenue** — English activity → spending correlation proves the Gospel 444 thesis
5. **If the economy is healthy** — inflation tracking prevents currency collapse

**The AnalyticsService.lua module is the single integration point.** Every module calls `Analytics.Track()` and the service handles routing to both Roblox AnalyticsService (real-time dashboard) and DataStore (in-game adaptive systems).

**Total effort: ~8.5 hours.** Zero external dependencies. Zero platform risk. Pure Roblox-native.

---

*Artifact produced by Pulse Run 50 | Active Mission: 100% Roblox | Platform Death Test: PASS (if commit succeeds)*
