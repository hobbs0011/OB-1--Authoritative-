# EnglishRewardsManager — Implementation Spec

> **Document:** `CANON/TRAIN-67/DOCS/EnglishRewardsManagerSpec.md`
> **Version:** 1.0.0
> **Date:** 2026-03-27
> **Author:** Ne0 / OB1 — Pulse Run 53
> **Status:** SPEC COMPLETE — Ready for implementation
> **Artifact Class:** 🔨 BUILD
> **Active Mission:** 100% Roblox — English × Gacha Bridge

---

## Table of Contents

1. [Purpose & Gospel 444 Alignment](#1-purpose--gospel-444-alignment)
2. [Architecture Overview](#2-architecture-overview)
3. [Module API — EnglishRewardsManager](#3-module-api--englishrewardsmanager)
4. [English Streak System](#4-english-streak-system)
5. [English → Gacha Bridge](#5-english--gacha-bridge)
6. [English → Battle Pass XP](#6-english--battle-pass-xp)
7. [English → Currency Rewards](#7-english--currency-rewards)
8. [English Tier Progression](#8-english-tier-progression)
9. [DataStore Schema](#9-datastore-schema)
10. [Analytics & Telemetry Integration](#10-analytics--telemetry-integration)
11. [Integration Points & Dependency Map](#11-integration-points--dependency-map)
12. [FTUE English Onboarding Flow](#12-ftue-english-onboarding-flow)
13. [Edge Cases & Fail-Closed Behavior](#13-edge-cases--fail-closed-behavior)
14. [Build Priority & Implementation Order](#14-build-priority--implementation-order)

---

## 1. Purpose & Gospel 444 Alignment

### The Core Equation

**English is the mechanic. Money is the mission.**

EnglishRewardsManager is the bidirectional bridge between OBI's English learning engine and its monetization systems. It transforms every correct answer, every streak, every lesson completion into tangible in-game rewards — making English feel rewarding, addictive, and intrinsically tied to progression.

> *"OBI IS Gospel 444 at scale. The AI teacher that teaches English the way we teach our students — permission over perfection, relationship over rules, Mouse → Tiger."*
> — Gospel-444-Revenue-Bridge.md §3

### Gospel 444 Principles Governing This Module

| # | Principle | Implementation Rule |
|---|-----------|-------------------|
| 1 | **Mouse → Tiger** | Start with generous rewards (Mouse tier). Gradually shift ratio as player proves engagement (Tiger tier). Never punish early learners. |
| 2 | **Permission over Perfection** | Reward attempt, not just accuracy. Partial credit exists. Wrong answers still give XP (reduced). |
| 3 | **Never interrupt a lesson** | Reward popups queue until lesson complete. No mid-lesson gacha animations. No currency pop during active question. |
| 4 | **English is the mechanic, money is the mission** | Every reward path ultimately feeds monetization. Free pulls → gacha engagement → spending. XP → Battle Pass → premium tier purchase. Streaks → retention → LTV. |
| 5 | **The teacher is the product** | OBI's personality delivers rewards with encouragement. "Nice streak! Here's a free pull!" Not cold system messages. |
| 6 | **Relationship over rules** | If a player barely misses a streak (by minutes), grace window applies. Forgiveness mechanics build loyalty. |

### What This Module Does NOT Do

- Does NOT handle lesson content, question selection, or difficulty scaling (that's the English Engine)
- Does NOT directly modify gacha rates or pull mechanics (that's GachaManager)
- Does NOT manage Battle Pass tier logic (that's BattlePassManager)
- Does NOT process payments or manage Robux (that's MonetizationOrchestrator)
- **DOES** translate every English learning event into rewards, progression, and monetization hooks

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    EnglishRewardsManager                        │
│                                                                 │
│  ┌───────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐ │
│  │  Streak    │  │  Reward  │  │   Tier    │  │  Analytics   │ │
│  │  Tracker   │  │  Router  │  │  Engine   │  │  Emitter     │ │
│  └─────┬─────┘  └────┬─────┘  └─────┬─────┘  └──────┬───────┘ │
│        │              │              │               │          │
└────────┼──────────────┼──────────────┼───────────────┼──────────┘
         │              │              │               │
    ┌────▼────┐    ┌────▼────┐   ┌────▼────┐    ┌────▼─────┐
    │DataStore│    │Gacha    │   │ FTUE    │    │Analytics │
    │Manager  │    │Manager  │   │Controller│   │Service   │
    └─────────┘    │BattlePass│   └─────────┘    └──────────┘
                   │DailyRwds │
                   └──────────┘
```

### Data Flow

```
English Engine Events                    Monetization Systems
─────────────────────                    ────────────────────
QUESTION_ANSWERED ──┐                ┌── GachaManager (free pulls, pity)
LESSON_COMPLETE ────┤                ├── BattlePassManager (XP grants)
STREAK_ACHIEVED ────┼──► ERM ───────┼── CurrencyManager (coins/gems)
LEVEL_UP ───────────┤   (bridge)    ├── DailyRewardsManager (streak bonus)
PERFECT_SCORE ──────┤                ├── CosmeticTrinity (unlock triggers)
DAILY_CHALLENGE ────┘                └── MonetizationOrchestrator (hooks)
```

---

## 3. Module API — EnglishRewardsManager

### 3.1 ModuleScript Structure

```
ServerScriptService/
└── Modules/
    └── EnglishRewardsManager/
        ├── init.lua              -- Main module, public API
        ├── StreakTracker.lua      -- Streak detection & persistence
        ├── RewardRouter.lua      -- Maps events → reward types
        ├── TierEngine.lua        -- Mouse→Tiger progression
        ├── Config.lua            -- All tunable constants
        └── Types.lua             -- Type definitions
```

### 3.2 Public API

```lua
local EnglishRewardsManager = {}

-- Initialize the module (called once at server start)
function EnglishRewardsManager:Init(dependencies: Dependencies): ()

-- Core event handlers (called by English Engine)
function EnglishRewardsManager:OnQuestionAnswered(player: Player, result: QuestionResult): RewardBundle
function EnglishRewardsManager:OnLessonComplete(player: Player, result: LessonResult): RewardBundle
function EnglishRewardsManager:OnDailyChallengeComplete(player: Player, result: ChallengeResult): RewardBundle
function EnglishRewardsManager:OnLevelUp(player: Player, newLevel: number): RewardBundle

-- Query methods
function EnglishRewardsManager:GetStreak(player: Player): StreakData
function EnglishRewardsManager:GetTier(player: Player): TierData
function EnglishRewardsManager:GetTodayProgress(player: Player): DailyProgress
function EnglishRewardsManager:GetRewardHistory(player: Player, count: number?): {RewardEntry}

-- Admin / debug
function EnglishRewardsManager:ResetStreak(player: Player): ()
function EnglishRewardsManager:GrantBonusReward(player: Player, reward: RewardBundle): ()
function EnglishRewardsManager:GetDebugState(player: Player): DebugState

return EnglishRewardsManager
```

### 3.3 Type Definitions

```lua
-- Types.lua

export type Dependencies = {
    MonetizationOrchestrator: any,
    GachaManager: any,
    BattlePassManager: any,
    CurrencyManager: any,
    DailyRewardsManager: any,
    DataStoreManager: any,
    AnalyticsService: any,
    FTUEController: any,
}

export type QuestionResult = {
    questionId: string,
    correct: boolean,
    timeSpent: number,        -- seconds
    difficulty: number,       -- 1-10
    category: string,         -- "grammar", "vocabulary", "listening", "speaking"
    isFirstAttempt: boolean,
    lessonId: string,
    sessionQuestionIndex: number,  -- nth question this session
}

export type LessonResult = {
    lessonId: string,
    totalQuestions: number,
    correctAnswers: number,
    accuracy: number,          -- 0.0 to 1.0
    isPerfectScore: boolean,
    timeSpent: number,
    category: string,
    difficulty: number,
    xpEarned: number,          -- base XP before multipliers
}

export type ChallengeResult = {
    challengeId: string,
    challengeType: "daily" | "weekly" | "special",
    completed: boolean,
    accuracy: number,
    timeSpent: number,
    bonusObjectiveMet: boolean,  -- e.g., "complete in under 2 minutes"
}

export type StreakData = {
    currentStreak: number,      -- consecutive days
    longestStreak: number,
    todayComplete: boolean,
    lastActivityDate: string,   -- YYYY-MM-DD in player's local time
    graceWindowActive: boolean,
    streakMilestones: {number},  -- [3, 5, 7, 14, 30, 60, 90, 180, 365]
    nextMilestone: number,
}

export type TierData = {
    currentTier: string,        -- "Mouse-A" | "Mouse-B" | "Cat" | "Wolf" | "Lion" | "Tiger"
    tierLevel: number,          -- 1-6
    progressToNext: number,     -- 0.0 to 1.0
    totalEnglishXP: number,
    rewardMultiplier: number,   -- tier-based multiplier
}

export type RewardBundle = {
    xp: number,                 -- Battle Pass XP
    coins: number,              -- soft currency
    gems: number,               -- premium currency (rare)
    freePulls: number,          -- gacha free pulls earned
    pityProgress: number,       -- gacha pity counter advancement
    gachaLuckBoost: {multiplier: number, durationSeconds: number}?,
    streakBonus: boolean,
    tierBonus: number,          -- multiplier from tier
    source: string,             -- "question" | "lesson" | "challenge" | "streak" | "levelup"
    displayDelay: boolean,      -- true = queue until lesson ends (Gospel 444: never interrupt)
}

export type DailyProgress = {
    questionsAnswered: number,
    correctAnswers: number,
    lessonsCompleted: number,
    xpEarned: number,
    streakDay: number,
    dailyChallengeComplete: boolean,
    freeGachaPullsEarned: number,
    date: string,
}

export type RewardEntry = {
    timestamp: number,
    source: string,
    reward: RewardBundle,
}

export type DebugState = {
    streak: StreakData,
    tier: TierData,
    todayProgress: DailyProgress,
    pendingRewards: {RewardBundle},
    lastReward: RewardEntry?,
}
```

---

## 4. English Streak System

### 4.1 Streak Rules

| Rule | Value | Notes |
|------|-------|-------|
| Minimum daily activity | 1 lesson OR 5 questions | Whichever comes first |
| Streak reset time | 00:00 player local time | Server converts via timezone offset |
| Grace window | 4 hours past midnight | Gospel 444: forgiveness > punishment |
| Grace uses per month | 2 | Prevents abuse while staying forgiving |
| Streak freeze (premium) | Available via Battle Pass | 1 freeze/week at Tier 3+ |

### 4.2 Streak Milestones & Rewards

```lua
-- Config.lua (streak section)
local STREAK_MILESTONES = {
    [3]   = { freePulls = 1, coins = 100,  pityProgress = 5,  gachaLuck = nil,                          label = "Getting Started" },
    [5]   = { freePulls = 1, coins = 200,  pityProgress = 5,  gachaLuck = {multiplier = 1.5, duration = 1800}, label = "On Fire" },
    [7]   = { freePulls = 2, coins = 500,  pityProgress = 10, gachaLuck = {multiplier = 2.0, duration = 3600}, label = "Week Warrior" },
    [14]  = { freePulls = 3, coins = 1000, pityProgress = 15, gachaLuck = {multiplier = 2.0, duration = 3600}, label = "Dedicated" },
    [30]  = { freePulls = 5, coins = 2500, pityProgress = 25, gachaLuck = {multiplier = 2.5, duration = 7200}, label = "Monthly Master" },
    [60]  = { freePulls = 8, coins = 5000, pityProgress = 40, gachaLuck = nil,                          label = "Iron Will" },
    [90]  = { freePulls = 10,coins = 10000,pityProgress = 50, gachaLuck = {multiplier = 3.0, duration = 14400},label = "Quarter Champion" },
    [180] = { freePulls = 15,coins = 25000,pityProgress = 75, gachaLuck = {multiplier = 3.0, duration = 28800},label = "Half-Year Hero" },
    [365] = { freePulls = 25,coins = 50000,pityProgress = 100,gachaLuck = {multiplier = 5.0, duration = 86400},label = "Legendary Learner" },
}
```

### 4.3 Streak Scoring Integration

From MonetizationOrchestrator §4.2, `englishStreakDays` feeds into the monetization scoring formula:

```lua
-- How streak feeds MonetizationOrchestrator scoring
local function getEnglishStreakScore(streakDays: number): number
    if streakDays >= 30 then return 100 end
    if streakDays >= 14 then return 80 end
    if streakDays >= 7 then return 60 end
    if streakDays >= 3 then return 40 end
    if streakDays >= 1 then return 20 end
    return 0
end
-- This score feeds into playerEngagementScore in MonetizationOrchestrator
-- Higher engagement = better offer targeting = higher conversion
```

### 4.4 StreakTracker Implementation

```lua
-- StreakTracker.lua (core logic)
local StreakTracker = {}

function StreakTracker:CheckAndUpdateStreak(player: Player, currentTime: number): StreakData
    local data = self:LoadStreakData(player)
    local playerDate = self:GetPlayerLocalDate(player, currentTime)
    local lastDate = data.lastActivityDate

    if playerDate == lastDate then
        -- Same day, no streak change
        return data
    end

    local daysDiff = self:DaysBetween(lastDate, playerDate)

    if daysDiff == 1 then
        -- Consecutive day — streak continues
        data.currentStreak += 1
        data.todayComplete = false
    elseif daysDiff == 2 and self:CanUseGraceWindow(player, data) then
        -- Missed by 1 day but grace window available
        data.currentStreak += 1
        data.graceWindowActive = true
        data.graceUsesThisMonth -= 1
        self:EmitAnalytics(player, "STREAK_GRACE_USED", {streak = data.currentStreak})
    else
        -- Streak broken
        local oldStreak = data.currentStreak
        data.currentStreak = 1
        data.graceWindowActive = false
        self:EmitAnalytics(player, "STREAK_BROKEN", {
            oldStreak = oldStreak,
            daysMissed = daysDiff
        })
    end

    data.lastActivityDate = playerDate
    if data.currentStreak > data.longestStreak then
        data.longestStreak = data.currentStreak
    end
    data.nextMilestone = self:GetNextMilestone(data.currentStreak)

    self:SaveStreakData(player, data)
    return data
end

function StreakTracker:GetNextMilestone(currentStreak: number): number
    local milestones = {3, 5, 7, 14, 30, 60, 90, 180, 365}
    for _, m in ipairs(milestones) do
        if m > currentStreak then return m end
    end
    return 365 -- cap
end

return StreakTracker
```

---

## 5. English → Gacha Bridge

### 5.1 Bridge Hook Definitions

From MonetizationOrchestrator §10, these are the formal bridge points:

| English Event | Bridge Hook | Gacha Action | Condition |
|---------------|-------------|--------------|-----------|
| `LESSON_COMPLETE` | `ENGLISH_MILESTONE` | Award free Basic pull | Every 10 correct answers cumulative |
| `STREAK_3` | `ENGLISH_STREAK` | +5 pity progress | 3-day streak reached |
| `STREAK_5` | `ENGLISH_STREAK` | +5 pity progress + 1.5x luck 30min | 5-day streak reached |
| `STREAK_7` | `ENGLISH_STREAK` | +10 pity progress + 2x luck 60min | 7-day streak reached |
| `LEVEL_UP` | `ENGLISH_MILESTONE` | Award 1 free Premium pull | Level up in English tier |
| `PERFECT_SCORE` | `ENGLISH_MILESTONE` | Award 1 free Basic pull + 2x luck 30min | 100% accuracy on lesson |
| `DAILY_CHALLENGE` | `ENGLISH_MILESTONE` | Award 1 free Premium pull | Daily challenge complete |
| `FIRST_SESSION` | `ENGLISH_FTUE` | 2x gacha luck 30min | First-ever English session |

### 5.2 Bridge Implementation

```lua
-- RewardRouter.lua (gacha bridge section)

local GACHA_BRIDGE = {
    CORRECT_ANSWER_THRESHOLD = 10,  -- every 10 correct → 1 free Basic pull

    LESSON_COMPLETE = function(result: LessonResult): GachaBridgeAction
        local actions = {}

        -- Perfect score bonus
        if result.isPerfectScore then
            table.insert(actions, {
                type = "FREE_PULL",
                pullType = "Basic",
                count = 1,
                source = "PERFECT_SCORE",
            })
            table.insert(actions, {
                type = "GACHA_LUCK",
                multiplier = 2.0,
                durationSeconds = 1800,
                source = "PERFECT_SCORE",
            })
        end

        return actions
    end,

    CUMULATIVE_CORRECT = function(totalCorrect: number, previousTotal: number): GachaBridgeAction?
        -- Check if we crossed a 10-answer threshold
        local previousPulls = math.floor(previousTotal / 10)
        local currentPulls = math.floor(totalCorrect / 10)
        local newPulls = currentPulls - previousPulls

        if newPulls > 0 then
            return {
                type = "FREE_PULL",
                pullType = "Basic",
                count = newPulls,
                source = "CUMULATIVE_CORRECT_" .. tostring(totalCorrect),
            }
        end
        return nil
    end,

    DAILY_CHALLENGE = function(result: ChallengeResult): GachaBridgeAction
        if result.completed then
            return {
                type = "FREE_PULL",
                pullType = "Premium",
                count = 1,
                source = "DAILY_CHALLENGE",
            }
        end
        return nil
    end,

    FIRST_SESSION = function(): GachaBridgeAction
        return {
            type = "GACHA_LUCK",
            multiplier = 2.0,
            durationSeconds = 1800,
            source = "FIRST_ENGLISH_SESSION",
        }
    end,
}
```

### 5.3 Gacha Bridge Limits (Anti-Exploit)

| Limit | Value | Rationale |
|-------|-------|-----------|
| Max free Basic pulls / day | 5 | Keeps gacha economy healthy |
| Max free Premium pulls / day | 2 | Premium stays premium |
| Max pity progress / day from English | 20 | Pity isn't farmable to infinity |
| Gacha luck boost stacking | NO — highest active wins | Prevents multiplicative exploit |
| Cooldown between free pull grants | 60 seconds | Prevents rapid-fire farming |

---

## 6. English → Battle Pass XP

### 6.1 XP Grant Table

From MonetizationArchitectureDeepDive §6.2, English is designed as the **best XP source** in the game:

| English Action | Base XP | Tier Multiplier Applied | Notes |
|----------------|---------|------------------------|-------|
| Correct answer | 25 | Yes | Best per-action XP in game |
| Wrong answer (attempted) | 5 | Yes | Gospel 444: reward attempt |
| Lesson complete | 50 | Yes | Bonus on top of per-question XP |
| Perfect score lesson | 100 | Yes | Stacks with lesson complete |
| 5-question streak (in-lesson) | 150 | Yes | Consecutive correct answers |
| Daily challenge complete | 200 | Yes | Once per day |
| Streak milestone hit | 300 | Yes | Per milestone |
| Level up | 500 | Yes | Per tier advancement |

### 6.2 XP Delivery

```lua
function EnglishRewardsManager:GrantBattlePassXP(player: Player, amount: number, source: string)
    local tier = self:GetTier(player)
    local multiplied = math.floor(amount * tier.rewardMultiplier)

    self.dependencies.BattlePassManager:AddXP(player, multiplied, {
        source = "english",
        detail = source,
        baseAmount = amount,
        multiplier = tier.rewardMultiplier,
        tierAtGrant = tier.currentTier,
    })

    self:EmitAnalytics(player, "ENGLISH_XP_GRANTED", {
        base = amount,
        multiplied = multiplied,
        source = source,
        tier = tier.currentTier,
    })
end
```

### 6.3 Why English = Best XP Source

This is **intentional design**, not an accident:

1. **Retention driver** — Players who do English daily are the most retained players
2. **Monetization correlation** — English engagement correlates with Battle Pass purchase (need XP → buy premium tier)
3. **Gospel 444 alignment** — English IS the product. Making it the best XP source makes it the center of the game loop
4. **Mouse → Tiger** — Generous XP early (Mouse) keeps new players engaged. As they reach Tiger tier, they're hooked on the loop

---

## 7. English → Currency Rewards

### 7.1 Currency Grant Table

| English Action | Coins | Gems | Condition |
|----------------|-------|------|-----------|
| Lesson complete | 25 | 0 | Always |
| Perfect score | 50 | 1 | 100% accuracy |
| Daily challenge | 100 | 2 | Challenge complete |
| Streak 3 | 100 | 0 | Milestone |
| Streak 7 | 500 | 3 | Milestone |
| Streak 30 | 2500 | 10 | Milestone |
| Level up | 1000 | 5 | Tier advancement |

### 7.2 Currency Delivery

```lua
function EnglishRewardsManager:GrantCurrency(player: Player, coins: number, gems: number, source: string)
    local tier = self:GetTier(player)
    local coinMultiplied = math.floor(coins * tier.rewardMultiplier)
    -- Gems are NOT multiplied by tier (premium currency stays controlled)

    if coinMultiplied > 0 then
        self.dependencies.CurrencyManager:AddCoins(player, coinMultiplied, "english:" .. source)
    end
    if gems > 0 then
        self.dependencies.CurrencyManager:AddGems(player, gems, "english:" .. source)
    end
end
```

### 7.3 Daily Currency Caps

| Currency | Daily Cap from English | Rationale |
|----------|----------------------|-----------|
| Coins | 5,000 | Prevents inflation from extreme grinding |
| Gems | 20 | Premium currency stays scarce |

---

## 8. English Tier Progression

### 8.1 Tier Definitions

From FTUEImplementationSpec §5 (Mouse-A/Mouse-B split) extended to full progression:

| Tier | Level | XP Required | Reward Multiplier | Unlock |
|------|-------|-------------|-------------------|--------|
| **Mouse-A** | 1 | 0 | 1.0x | First session (observation mode) |
| **Mouse-B** | 2 | 500 | 1.1x | Completes FTUE English module |
| **Cat** | 3 | 2,500 | 1.25x | Consistent 3-day streak |
| **Wolf** | 4 | 10,000 | 1.5x | Demonstrates engagement pattern |
| **Lion** | 5 | 25,000 | 1.75x | Power user territory |
| **Tiger** | 6 | 75,000 | 2.0x | Mastery — the destination |

### 8.2 Tier Progression Logic

```lua
-- TierEngine.lua
local TIERS = {
    {name = "Mouse-A", level = 1, xpRequired = 0,     multiplier = 1.0},
    {name = "Mouse-B", level = 2, xpRequired = 500,   multiplier = 1.1},
    {name = "Cat",     level = 3, xpRequired = 2500,  multiplier = 1.25},
    {name = "Wolf",    level = 4, xpRequired = 10000, multiplier = 1.5},
    {name = "Lion",    level = 5, xpRequired = 25000, multiplier = 1.75},
    {name = "Tiger",   level = 6, xpRequired = 75000, multiplier = 2.0},
}

function TierEngine:AddXP(player: Player, amount: number): (TierData, boolean)
    local data = self:LoadTierData(player)
    data.totalEnglishXP += amount

    local oldTier = data.tierLevel
    local newTier = self:CalculateTier(data.totalEnglishXP)

    if newTier.level > oldTier then
        -- LEVEL UP!
        data.currentTier = newTier.name
        data.tierLevel = newTier.level
        data.rewardMultiplier = newTier.multiplier

        self:EmitAnalytics(player, "ENGLISH_TIER_UP", {
            oldTier = TIERS[oldTier].name,
            newTier = newTier.name,
            totalXP = data.totalEnglishXP,
        })

        self:SaveTierData(player, data)
        return data, true  -- true = leveled up
    end

    -- Calculate progress to next tier
    if newTier.level < #TIERS then
        local nextTier = TIERS[newTier.level + 1]
        data.progressToNext = (data.totalEnglishXP - newTier.xpRequired) /
                              (nextTier.xpRequired - newTier.xpRequired)
    else
        data.progressToNext = 1.0  -- Max tier
    end

    self:SaveTierData(player, data)
    return data, false
end
```

### 8.3 Mouse → Tiger Design Philosophy

The tier system embodies Gospel 444's Mouse → Tiger principle:

- **Mouse-A** (observation): Player watches, absorbs, gets generous rewards just for showing up. Zero pressure. Permission to explore.
- **Mouse-B** (activation): Player has completed FTUE, starts answering questions. Still generous — wrong answers still earn XP.
- **Cat** (curiosity): Player is coming back daily. Reward multiplier starts climbing. The hook is set.
- **Wolf** (hunger): Player actively seeks English content. Multiplier rewards the behavior loop.
- **Lion** (confidence): Player is a power user. Premium rewards unlock. English is central to their game identity.
- **Tiger** (mastery): 2x multiplier on everything. This player will never churn. They ARE the game.

---

## 9. DataStore Schema

### 9.1 Player English Data

Extends MonetizationOrchestrator §8 DataStore schema:

```lua
-- DataStore key: "english_v1_" .. player.UserId
local DEFAULT_ENGLISH_DATA = {
    -- Streak
    streak = {
        current = 0,
        longest = 0,
        lastActivityDate = "",      -- "YYYY-MM-DD"
        todayComplete = false,
        graceUsesThisMonth = 2,
        graceLastResetMonth = "",   -- "YYYY-MM"
    },

    -- Tier
    tier = {
        currentTier = "Mouse-A",
        tierLevel = 1,
        totalEnglishXP = 0,
    },

    -- Daily Progress (resets daily)
    daily = {
        date = "",                  -- "YYYY-MM-DD"
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

    -- Cumulative (never resets)
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

    -- Reward History (circular buffer, last 50)
    rewardHistory = {},            -- {RewardEntry}
    rewardHistoryIndex = 0,

    -- Schema version for migration
    schemaVersion = 1,
}
```

### 9.2 DataStore Operations

```lua
-- All DataStore operations go through DataStoreManager
-- EnglishRewardsManager NEVER calls DataStoreService directly

function EnglishRewardsManager:LoadPlayerData(player: Player): EnglishData
    return self.dependencies.DataStoreManager:GetPlayerData(
        player,
        "english_v1",
        DEFAULT_ENGLISH_DATA
    )
end

function EnglishRewardsManager:SavePlayerData(player: Player, data: EnglishData)
    self.dependencies.DataStoreManager:SetPlayerData(player, "english_v1", data)
end
```

### 9.3 Daily Reset Logic

```lua
function EnglishRewardsManager:CheckDailyReset(player: Player, data: EnglishData): EnglishData
    local today = self:GetPlayerLocalDate(player)
    if data.daily.date ~= today then
        -- Archive yesterday's data to cumulative
        data.cumulative.totalQuestionsAnswered += data.daily.questionsAnswered
        data.cumulative.totalCorrectAnswers += data.daily.correctAnswers
        data.cumulative.totalLessonsCompleted += data.daily.lessonsCompleted
        data.cumulative.totalXPEarned += data.daily.xpEarned
        data.cumulative.totalCoinsEarned += data.daily.coinsEarned
        data.cumulative.totalGemsEarned += data.daily.gemsEarned
        data.cumulative.totalFreePulls += data.daily.freePullsEarned

        -- Reset daily
        data.daily = table.clone(DEFAULT_ENGLISH_DATA.daily)
        data.daily.date = today

        -- Check grace window monthly reset
        local thisMonth = today:sub(1, 7) -- "YYYY-MM"
        if data.streak.graceLastResetMonth ~= thisMonth then
            data.streak.graceUsesThisMonth = 2
            data.streak.graceLastResetMonth = thisMonth
        end
    end
    return data
end
```

---

## 10. Analytics & Telemetry Integration

### 10.1 Event Taxonomy

From AnalyticsTelemetryIntegrationSpec §3.2, English events follow the standard taxonomy:

| Event Name | Category | Trigger | Key Properties |
|------------|----------|---------|---------------|
| `english_question_answered` | engagement | Every question | `correct`, `difficulty`, `category`, `timeSpent`, `streakInLesson` |
| `english_lesson_complete` | engagement | Lesson finish | `accuracy`, `totalQuestions`, `correctAnswers`, `isPerfect`, `xpEarned` |
| `english_daily_challenge_complete` | engagement | Challenge done | `accuracy`, `bonusObjectiveMet`, `freePullEarned` |
| `english_streak_achieved` | retention | Milestone hit | `streakDays`, `milestone`, `rewardsGranted` |
| `english_streak_broken` | retention | Streak lost | `oldStreak`, `daysMissed`, `graceAvailable` |
| `english_streak_grace_used` | retention | Grace used | `streakPreserved`, `gracesRemaining` |
| `english_tier_up` | progression | Tier change | `oldTier`, `newTier`, `totalXP` |
| `english_reward_granted` | economy | Any reward | `rewardType`, `amount`, `source`, `tierMultiplier` |
| `english_gacha_bridge` | monetization | Gacha action | `bridgeType`, `pullType`, `pityProgress`, `luckBoost` |
| `english_xp_granted` | progression | XP grant | `base`, `multiplied`, `source`, `tier` |
| `english_elo_updated` | progression | Skill change | `oldElo`, `newElo`, `category`, `questionCount` |
| `english_first_session` | acquisition | First ever | `ftueStep`, `timeToFirstQuestion` |
| `english_session_start` | engagement | Session begin | `tier`, `streak`, `lastSessionGap` |
| `english_session_end` | engagement | Session end | `duration`, `questionsAnswered`, `xpEarned` |

### 10.2 Analytics Emitter

```lua
-- All analytics go through the centralized AnalyticsService
function EnglishRewardsManager:EmitAnalytics(player: Player, eventName: string, properties: {[string]: any})
    self.dependencies.AnalyticsService:Track(player, "english_" .. eventName:lower(), {
        -- Standard English context (auto-attached to every English event)
        english_tier = self:GetTier(player).currentTier,
        english_streak = self:GetStreak(player).currentStreak,
        english_total_xp = self:GetTier(player).totalEnglishXP,
        -- Event-specific properties
        unpack(properties),
    })
end
```

---

## 11. Integration Points & Dependency Map

### 11.1 Integration Matrix

| System | Direction | What EnglishRewardsManager Sends | What It Receives |
|--------|-----------|----------------------------------|-----------------|
| **MonetizationOrchestrator** | ↔ Bidirectional | `englishStreakDays`, `englishTier`, engagement score | Offer eligibility flags, monetization hooks |
| **GachaManager** | → Outbound | Free pull grants, pity progress, luck boosts | Pull results (for analytics correlation) |
| **BattlePassManager** | → Outbound | XP grants with source tracking | Current tier/level (for UI display) |
| **CurrencyManager** | → Outbound | Coin/gem grants with source | Balance (for UI) |
| **DailyRewardsManager** | ↔ Bidirectional | Streak data, bonus qualification | Daily login status |
| **FTUEController** | ← Inbound | - | FTUE completion signals, tier unlock triggers |
| **DataStoreManager** | ↔ Bidirectional | English data writes | English data reads |
| **AnalyticsService** | → Outbound | All English events | - |
| **English Engine** | ← Inbound | - | Question results, lesson results, challenge results |
| **CosmeticTrinity** | → Outbound | Tier-up unlock triggers | - |

### 11.2 MonetizationOrchestrator Bridge Hooks (Formal Contract)

From MonetizationOrchestrator §10:

```lua
-- These are the hooks EnglishRewardsManager calls on MonetizationOrchestrator
MonetizationOrchestrator:OnEnglishMilestone(player, {
    milestoneType = "LESSON_COMPLETE" | "PERFECT_SCORE" | "LEVEL_UP" | "DAILY_CHALLENGE",
    data = { ... milestone-specific data ... },
})

MonetizationOrchestrator:OnEnglishStreak(player, {
    streakType = "STREAK_3" | "STREAK_5" | "STREAK_7" | "STREAK_14" | "STREAK_30",
    currentStreak = number,
    rewards = RewardBundle,
})

-- These are the hooks MonetizationOrchestrator calls on EnglishRewardsManager
EnglishRewardsManager:GetEngagementScore(player) -> number  -- 0-100
EnglishRewardsManager:GetStreak(player) -> StreakData
EnglishRewardsManager:GetTier(player) -> TierData
```

### 11.3 Dependency Graph

```
Build Order (bottom-up):
─────────────────────────
L0: DataStoreManager, AnalyticsService          (no game dependencies)
L1: CurrencyManager                              (depends on L0)
L2: GachaManager, BattlePassManager              (depends on L0, L1)
L3: EnglishRewardsManager ← YOU ARE HERE         (depends on L0, L1, L2)
L4: MonetizationOrchestrator                     (depends on L0-L3)
L5: FTUEController                               (depends on L0-L4)
```

**Critical path:** EnglishRewardsManager MUST be initialized AFTER GachaManager and BattlePassManager, but BEFORE MonetizationOrchestrator.

---

## 12. FTUE English Onboarding Flow

### 12.1 First Session Sequence

From FTUEImplementationSpec §5-6:

```
Player enters game
    │
    ▼
FTUEController detects new player
    │
    ▼
Mouse-A phase: Observation (no English questions yet)
    │ Player watches OBI interact, explores world
    │ Weight: ftueWeight = 1.0 (maximum guidance)
    │
    ▼
First English prompt (after ~3 min exploration)
    │ "Hey! Want to try a quick English question?"
    │ Gospel 444: Permission, not pressure
    │
    ▼
Player answers first question
    │
    ├─ Correct → 🎉 OBI celebration + bonus coins + "You're a natural!"
    │              EnglishRewardsManager:OnQuestionAnswered() fires
    │              FIRST_SESSION gacha luck boost (2x, 30min)
    │
    └─ Wrong → 👍 OBI encourages + still gives XP + "Nice try! Let's try another"
                  Gospel 444: Permission over perfection
    │
    ▼
3 questions answered → Mouse-B transition unlocked
    │ EnglishRewardsManager:OnLevelUp(player, 2) fires
    │ Free Premium pull awarded
    │ "Welcome to Mouse-B! You're learning fast!"
    │
    ▼
FTUE English module complete → Full reward loop active
```

### 12.2 Reward Queue (Never Interrupt)

```lua
-- Rewards earned during an active lesson are QUEUED, not delivered immediately
-- This is Gospel 444: Never interrupt a lesson

local pendingRewards = {}  -- per player

function EnglishRewardsManager:QueueReward(player: Player, reward: RewardBundle)
    if self:IsInActiveLesson(player) then
        reward.displayDelay = true
        table.insert(pendingRewards[player.UserId], reward)
    else
        self:DeliverReward(player, reward)
    end
end

function EnglishRewardsManager:OnLessonEnd(player: Player)
    local queued = pendingRewards[player.UserId]
    if queued and #queued > 0 then
        -- Deliver all queued rewards with a celebration sequence
        self:DeliverRewardBatch(player, queued)
        pendingRewards[player.UserId] = {}
    end
end
```

---

## 13. Edge Cases & Fail-Closed Behavior

### 13.1 Fail-Closed Rules

| Scenario | Behavior | Rationale |
|----------|----------|-----------|
| DataStore read fails | Use cached data, retry 3x, then block rewards (not English content) | Never lose player progress |
| DataStore write fails | Queue write, retry on exponential backoff, cap at 5 retries | Data integrity > speed |
| GachaManager unavailable | Queue free pulls, deliver when available | English works without gacha |
| BattlePassManager unavailable | Queue XP, deliver when available | English works without BP |
| Analytics fails | Silent drop — never block gameplay for telemetry | Analytics is fire-and-forget |
| Streak date conflict | Use server time as truth, grace window as buffer | Consistent across timezones |
| Daily cap exceeded | Silently cap, log analytics event | Player doesn't see the cap |
| Negative XP/currency (bug) | Clamp to 0, fire alert event | Never take from player |
| Concurrent session | Last-write-wins with session lock | Rare edge case |

### 13.2 Rate Limiting

```lua
local RATE_LIMITS = {
    questionsPerMinute = 20,      -- Prevents bot farming
    lessonsPerHour = 10,           -- Reasonable human limit
    rewardsPerMinute = 30,         -- Prevents reward spam
    gachaBridgePerHour = 15,       -- Gacha bridge calls
}
```

### 13.3 Anti-Exploit Measures

- **Answer speed check:** Questions answered in < 0.5 seconds flag for review (bots)
- **Accuracy anomaly:** 100% accuracy at max difficulty for > 50 questions → flag
- **Streak manipulation:** Client clock is NEVER trusted. All streak logic uses server time with timezone offset
- **Reward duplication:** Idempotency key per reward grant (questionId + timestamp)

---

## 14. Build Priority & Implementation Order

### 14.1 Implementation Phases

| Phase | Component | Estimated LOC | Dependencies | Priority |
|-------|-----------|---------------|-------------|----------|
| **P1** | Types.lua + Config.lua | ~200 | None | 🔴 Critical |
| **P1** | StreakTracker.lua | ~300 | DataStoreManager | 🔴 Critical |
| **P1** | TierEngine.lua | ~200 | DataStoreManager | 🔴 Critical |
| **P2** | RewardRouter.lua | ~400 | GachaManager, BattlePassManager, CurrencyManager | 🔴 Critical |
| **P2** | init.lua (main module) | ~350 | All submodules | 🔴 Critical |
| **P3** | Analytics integration | ~150 | AnalyticsService | 🟡 Important |
| **P3** | FTUE hooks | ~100 | FTUEController | 🟡 Important |
| **P3** | Anti-exploit layer | ~200 | None | 🟡 Important |
| **P4** | CosmeticTrinity triggers | ~100 | CosmeticTrinity spec | 🟢 Normal |
| **P4** | Admin/debug tooling | ~150 | None | 🟢 Normal |

**Total estimated:** ~2,150 lines of Lua

### 14.2 Testing Checklist

- [ ] Streak increments correctly on consecutive days
- [ ] Streak breaks after missed day (no grace)
- [ ] Grace window preserves streak within limits
- [ ] Grace monthly reset works
- [ ] Tier XP accumulates and triggers level-ups
- [ ] Reward multiplier applies at each tier
- [ ] Free gacha pulls granted at correct thresholds
- [ ] Pity progress advances on streak milestones
- [ ] Gacha luck boosts apply and expire correctly
- [ ] Daily caps enforced (coins, gems, pulls, pity)
- [ ] Battle Pass XP grants with correct multiplier
- [ ] Currency grants with daily cap
- [ ] Perfect score bonus stacks correctly
- [ ] Daily challenge rewards deliver once per day
- [ ] Reward queue works during active lessons
- [ ] Queued rewards deliver on lesson end
- [ ] FTUE first session triggers all correct rewards
- [ ] DataStore persistence survives server restart
- [ ] Rate limiting blocks bot behavior
- [ ] All analytics events fire with correct properties
- [ ] MonetizationOrchestrator bridge hooks work bidirectionally

---

## Cross-Reference

| Related Spec | Location | Key Sections |
|-------------|----------|-------------|
| MonetizationOrchestrator | `CANON/TRAIN-67/DOCS/MonetizationOrchestratorSpec.md` | §4.2, §8, §10, §13.1 |
| Monetization Deep Dive | `CANON/TRAIN-67/DOCS/MonetizationArchitectureDeepDive.md` | §5.4, §6.2, §8.4 |
| FTUE Implementation | `CANON/TRAIN-67/DOCS/FTUEImplementationSpec.md` | §5, §6 |
| Analytics & Telemetry | `CANON/TRAIN-67/DOCS/AnalyticsTelemetryIntegrationSpec.md` | §3.2 |
| Gospel 444 Revenue | `CANON/GOSPEL-444-TEACHING-METHODS/Gospel-444-Revenue-Bridge.md` | §1, §3 |

---

> **Platform Death Test:** This document is a permanent BUILD artifact on GitHub.
> If Notion dies tomorrow, the EnglishRewardsManager spec survives at:
> `hobbs-lab/Phoenix-Rising-Protocol-Ultimate/CANON/TRAIN-67/DOCS/EnglishRewardsManagerSpec.md`
>
> **Run 53 | Artifact Class: 🔨 BUILD | Active Mission: 100% Roblox**
