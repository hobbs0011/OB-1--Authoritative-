# MonetizationOrchestrator — Implementation Spec

> **Project:** TRAIN-67 (Galaxy English Trainer — Roblox)
> **Artifact Class:** 🔨 BUILD
> **Status:** SPEC — Pre-Implementation
> **Author:** Ne0 (Run 52, Pulse-Incarnation Engine v5)
> **Date:** 2026-03-27
> **Cross-repo sources:** MonetizationArchitectureDeepDive.md (`63234bee`), ReceiptRouter.lua (`11303d4c`), FTUEImplementationSpec.md (`18bee6a6`), AnalyticsTelemetryIntegrationSpec.md (`f182ccfd`), STAGE-15-COSMETIC-TRINITY-SPEC.md (`9d53b3de`), STAGE-5-ECONOMY-BREAK-TEST.md (`d06ba7cc`), STAGE-3-GAME-SIMULATION.md (`46e13965`), UnifiedServer.lua (`ccd827bf`), RobloxLaunchIntelligence-March2026.md (`74c0ff5b`)

---

## Table of Contents

1. [Purpose & Governing Principles](#1-purpose--governing-principles)
2. [Architecture Overview](#2-architecture-overview)
3. [Player Spending State Machine](#3-player-spending-state-machine)
4. [Offer Decision Engine](#4-offer-decision-engine)
5. [Contextual Trigger System](#5-contextual-trigger-system)
6. [Annoyance Guard System](#6-annoyance-guard-system)
7. [ReceiptRouter Integration](#7-receiptrouter-integration)
8. [DataStore Schema](#8-datastore-schema)
9. [Offer Catalog](#9-offer-catalog)
10. [English × Gacha Bridge Hooks](#10-english--gacha-bridge-hooks)
11. [Analytics Events](#11-analytics-events)
12. [Gospel 444 Alignment](#12-gospel-444-alignment)
13. [Implementation Priority & Dependencies](#13-implementation-priority--dependencies)
14. [Testing & Economy Break Scenarios](#14-testing--economy-break-scenarios)

---

## 1. Purpose & Governing Principles

### 1.1 Purpose

The **MonetizationOrchestrator** is the single server-side authority that decides **what to offer, when to offer it, and how aggressively to offer it** to each player. It replaces ad-hoc offer logic scattered across FTUE, GamePass, and DevProduct systems with a unified decision engine.

**Core problem it solves:** The MonetizationArchitectureDeepDive (§7.2) identified that offer timing, sequencing, and fatigue management are handled by 5+ disconnected systems. The Orchestrator centralizes this into one module with a clean API surface.

### 1.2 Governing Principles

| # | Principle | Source |
|---|-----------|--------|
| 1 | **English is the mechanic, money is the mission** | Michael — Living Reincarnation State |
| 2 | **Mouse → Tiger** — permission over perfection, gentle first contact | Gospel 444 teaching law |
| 3 | **Assume we don't know what we don't know** — instrument everything | Michael — active principle |
| 4 | **No dark patterns** — every offer must provide genuine value | MonetizationDeepDive §1 |
| 5 | **Annoyance kills retention** — aggressive monetization = player churn | LaunchIntelligence §4 |
| 6 | **First purchase is the hardest** — optimize the path to first spend | MonetizationDeepDive §5 |
| 7 | **Whales self-select** — don't push whale pricing on dolphins | Economy Break Test §3 |

### 1.3 Non-Negotiables

- **Server-authoritative.** All offer decisions happen server-side. Client renders what the server tells it to.
- **Idempotent.** Duplicate offer triggers produce identical results. No double-prompts.
- **Auditable.** Every offer shown, dismissed, or purchased is logged with full context.
- **Graceful degradation.** If the Orchestrator errors, the player sees NO offers — not broken ones. Fail-closed.
- **ReceiptRouter is the only purchase handler.** The Orchestrator decides offers; ReceiptRouter handles fulfillment. Clean separation.

---

## 2. Architecture Overview

### 2.1 System Position

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT (Roblox)                     │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐  │
│  │ ShopUI   │  │ OfferUI  │  │ ContextualPromptUI │  │
│  └────┬─────┘  └────┬─────┘  └────────┬───────────┘  │
│       │              │                 │               │
│       └──────────────┼─────────────────┘               │
│                      │ RemoteFunction: GetActiveOffers  │
│                      │ RemoteEvent: OfferDismissed      │
│                      │ RemoteEvent: PurchaseInitiated   │
├──────────────────────┼───────────────────────────────── │
│                    SERVER                               │
│                      ▼                                  │
│  ┌──────────────────────────────────────┐              │
│  │      MonetizationOrchestrator        │              │
│  │  ┌─────────────┐ ┌───────────────┐  │              │
│  │  │ SpendState  │ │ OfferDecision │  │              │
│  │  │   Machine   │ │    Engine     │  │              │
│  │  └──────┬──────┘ └───────┬───────┘  │              │
│  │         │                │           │              │
│  │  ┌──────┴──────┐ ┌──────┴────────┐  │              │
│  │  │ Annoyance   │ │  Contextual   │  │              │
│  │  │   Guard     │ │  Trigger Sys  │  │              │
│  │  └─────────────┘ └───────────────┘  │              │
│  └──────────────┬───────────────────────┘              │
│                 │                                       │
│    ┌────────────┼────────────┐                         │
│    ▼            ▼            ▼                          │
│ ┌──────┐  ┌──────────┐  ┌───────────────┐             │
│ │ Data │  │ Receipt  │  │ Analytics     │             │
│ │Store │  │ Router   │  │ (Telemetry)   │             │
│ └──────┘  └──────────┘  └───────────────┘             │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Module Interface

```lua
-- MonetizationOrchestrator.lua (ServerScriptService)

local MonetizationOrchestrator = {}

-- Core API
MonetizationOrchestrator.Init(playerDataStore, receiptRouter, analyticsManager)
MonetizationOrchestrator.OnPlayerJoin(player)
MonetizationOrchestrator.OnPlayerLeave(player)
MonetizationOrchestrator.GetActiveOffers(player) → OfferList
MonetizationOrchestrator.OnOfferDismissed(player, offerId, reason)
MonetizationOrchestrator.OnPurchaseComplete(player, productId, receiptInfo)
MonetizationOrchestrator.OnContextualTrigger(player, triggerType, context)

-- State queries (for other modules)
MonetizationOrchestrator.GetSpendTier(player) → SpendTier
MonetizationOrchestrator.GetLifetimeSpend(player) → number
MonetizationOrchestrator.HasPurchased(player, productId) → boolean
MonetizationOrchestrator.GetOfferHistory(player) → OfferHistoryList

return MonetizationOrchestrator
```

### 2.3 Dependencies

| Dependency | Direction | Purpose |
|------------|-----------|---------|
| **ReceiptRouter** | Orchestrator → Router | Purchase fulfillment delegation |
| **PlayerDataStore** | Orchestrator ↔ DataStore | Persist spend state, offer history |
| **AnalyticsManager** | Orchestrator → Analytics | Event tracking for all offer lifecycle |
| **FTUEManager** | FTUE → Orchestrator | Post-FTUE handoff triggers |
| **EnglishRewardsManager** | Bidirectional | English × Gacha bridge hooks |
| **GachaManager** | Gacha → Orchestrator | Pull result context for upsell |
| **DailyRewardsManager** | Daily → Orchestrator | Return-visit offer triggers |
| **CosmeticTrinity** | Trinity → Orchestrator | Cosmetic desire signals |

---

## 3. Player Spending State Machine

### 3.1 Spend Tiers

Derived from MonetizationArchitectureDeepDive §5 (Player Spending Journey) and Economy Break Test §3:

```
┌──────────┐    first_purchase    ┌──────────┐   cumulative > 500   ┌──────────┐
│  NEVER   │ ─────────────────► │  MINNOW  │ ──────────────────► │ DOLPHIN  │
│  SPENT   │                     │ (1-499R$)│                     │(500-4999)│
└──────────┘                     └──────────┘                     └─────┬────┘
     │                                                                   │
     │               cumulative > 5000                                   │
     │         ┌──────────────────────────────────────────────────────────┘
     │         ▼
     │    ┌──────────┐
     │    │  WHALE   │
     │    │ (5000+)  │
     │    └──────────┘
     │
     │    ┌──────────┐
     └──► │  LAPSED  │  (no purchase in 30 days after first purchase)
          └──────────┘
```

### 3.2 Tier Definitions

| Tier | Criteria | Offer Strategy | Max Offers/Session |
|------|----------|----------------|--------------------|
| **NEVER_SPENT** | 0 lifetime Robux | Soft tease only. Premium preview. No hard prompts. | 2 |
| **MINNOW** | 1–499 R$ lifetime | Value reinforcement. Show what purchase unlocked. Suggest next tier. | 3 |
| **DOLPHIN** | 500–4,999 R$ lifetime | Bundle offers. Exclusive content tease. Social proof. | 4 |
| **WHALE** | 5,000+ R$ lifetime | White-glove. Exclusive drops. Early access. Never annoy. | 5 |
| **LAPSED** | No purchase in 30 days (post-first-purchase only) | Win-back offers. Discounted bundles. "We missed you." | 2 |

### 3.3 State Tracking (per player)

```lua
SpendState = {
    tier = "NEVER_SPENT",           -- current tier enum
    lifetimeSpendRobux = 0,         -- cumulative
    sessionSpendRobux = 0,          -- current session only
    firstPurchaseTimestamp = nil,    -- epoch or nil
    lastPurchaseTimestamp = nil,     -- epoch or nil
    purchaseCount = 0,              -- total transactions
    purchaseHistory = {},           -- last 50 purchases: {productId, amount, timestamp}
    tierPromotionTimestamp = nil,    -- when they last changed tier
}
```

### 3.4 Tier Transition Logic

```lua
function MonetizationOrchestrator._evaluateTierTransition(player)
    local state = spendStates[player.UserId]
    if not state then return end

    local oldTier = state.tier
    local spend = state.lifetimeSpendRobux
    local lastPurchase = state.lastPurchaseTimestamp

    -- Promotion logic (can only go up, never demote except to LAPSED)
    if spend >= 5000 then
        state.tier = "WHALE"
    elseif spend >= 500 then
        state.tier = "DOLPHIN"
    elseif spend > 0 then
        state.tier = "MINNOW"
    end

    -- Lapsed detection (overlay — a lapsed whale is still tier WHALE but flagged)
    if state.purchaseCount > 0 and lastPurchase then
        local daysSince = (os.time() - lastPurchase) / 86400
        if daysSince > 30 then
            state.isLapsed = true
        else
            state.isLapsed = false
        end
    end

    if state.tier ~= oldTier then
        state.tierPromotionTimestamp = os.time()
        analyticsManager:Track("monetization_tier_change", {
            player = player.UserId,
            oldTier = oldTier,
            newTier = state.tier,
            lifetimeSpend = spend,
        })
    end
end
```

---

## 4. Offer Decision Engine

### 4.1 Decision Flow

The Offer Decision Engine runs every time `GetActiveOffers()` is called (on shop open, contextual trigger, or periodic poll). It evaluates the player's full state and returns a ranked list of eligible offers.

```
GetActiveOffers(player)
    │
    ├─► Load SpendState
    ├─► Load OfferHistory (shown/dismissed/purchased)
    ├─► Load AnnoyanceState (cooldowns, fatigue)
    ├─► Load ContextualState (what just happened in gameplay)
    │
    ▼
┌──────────────────────────┐
│  1. Filter by Tier       │  Remove offers not eligible for this spend tier
├──────────────────────────┤
│  2. Filter by History    │  Remove already-purchased one-time offers
├──────────────────────────┤
│  3. Filter by Cooldown   │  Remove recently dismissed offers
├──────────────────────────┤
│  4. Filter by Annoyance  │  Enforce session/daily offer caps
├──────────────────────────┤
│  5. Score & Rank         │  Context relevance × conversion probability
├──────────────────────────┤
│  6. Cap to tier limit    │  Max N offers per tier
└──────────────────────────┘
    │
    ▼
  OfferList (ordered, capped)
```

### 4.2 Scoring Formula

```lua
-- Each offer gets a composite score
function scoreOffer(offer, player, context)
    local score = offer.baseScore or 50  -- catalog-defined base (0-100)

    -- Context relevance bonus
    if offer.contextTriggers and context.triggerType then
        if table.find(offer.contextTriggers, context.triggerType) then
            score = score + 25
        end
    end

    -- Tier alignment bonus
    if offer.targetTier == spendState.tier then
        score = score + 15
    end

    -- Recency penalty (recently shown = less relevant)
    local lastShown = offerHistory:GetLastShown(offer.id)
    if lastShown then
        local hoursSince = (os.time() - lastShown) / 3600
        if hoursSince < 24 then
            score = score - (24 - hoursSince)  -- up to -24
        end
    end

    -- Lapsed bonus (win-back urgency)
    if spendState.isLapsed and offer.isWinBack then
        score = score + 20
    end

    -- English engagement bonus (English × Gacha bridge)
    if context.englishStreakDays and context.englishStreakDays >= 3 then
        if offer.englishBonus then
            score = score + 10
        end
    end

    return math.clamp(score, 0, 100)
end
```

### 4.3 Offer Lifecycle States

```
ELIGIBLE → SHOWN → DISMISSED | PURCHASED | EXPIRED
                      │
                      ▼
                   COOLDOWN (N hours based on dismiss reason)
                      │
                      ▼
                   ELIGIBLE (re-enters pool)
```

---

## 5. Contextual Trigger System

### 5.1 Trigger Types

Derived from MonetizationDeepDive §7.2 (contextual offer triggers) and FTUEImplementationSpec §6:

| Trigger | When | Offer Type | Priority |
|---------|------|------------|----------|
| `FTUE_COMPLETE` | Player finishes FTUE flow | First premium tease, starter pack | HIGH |
| `POST_FTUE_MINUTES` | 5 min after FTUE (delayed soft sell) | Starter bundle, cosmetic preview | MEDIUM |
| `DEATH_STREAK` | 3+ deaths in 5 minutes | Power-up, shield, revive token | MEDIUM |
| `NEAR_MISS` | Almost won but lost (close score) | Boost item, retry token | HIGH |
| `SOCIAL_PROOF` | Saw another player's premium item | Same or similar cosmetic | HIGH |
| `GACHA_NEAR_PITY` | Within 5 pulls of pity counter | Pull bundle, guaranteed premium | HIGH |
| `GACHA_DUP` | Got duplicate from gacha | Duplicate protection token | MEDIUM |
| `ENGLISH_STREAK` | 3+ day English practice streak | Streak reward amplifier | MEDIUM |
| `ENGLISH_MILESTONE` | Completed English level/unit | Celebration bundle | LOW |
| `DAILY_RETURN` | Logged in for 3+ consecutive days | Daily login premium bonus | LOW |
| `SESSION_TIME` | Played 20+ minutes this session | Session reward bundle | LOW |
| `BATTLE_PASS_NEARING` | Close to next BP tier | BP level skip, XP boost | MEDIUM |
| `COSMETIC_VIEW` | Previewed cosmetic in shop | Discount on viewed item | HIGH |
| `INVENTORY_FULL` | Inventory at capacity | Expansion token | MEDIUM |

### 5.2 Trigger Registration

```lua
-- Other modules register triggers with the Orchestrator
function MonetizationOrchestrator.OnContextualTrigger(player, triggerType, context)
    -- Validate trigger type
    if not VALID_TRIGGERS[triggerType] then
        warn("[MonetizationOrchestrator] Unknown trigger:", triggerType)
        return
    end

    -- Check annoyance guard FIRST
    if not annoyanceGuard:CanShowOffer(player) then
        analyticsManager:Track("monetization_trigger_suppressed", {
            player = player.UserId,
            trigger = triggerType,
            reason = "annoyance_guard",
        })
        return
    end

    -- Build context-enriched offer request
    local enrichedContext = {
        triggerType = triggerType,
        timestamp = os.time(),
        gameState = context,
        spendTier = spendStates[player.UserId].tier,
        englishStreakDays = englishRewardsManager:GetStreakDays(player),
    }

    -- Get top contextual offer
    local offers = offerDecisionEngine:GetContextualOffers(player, enrichedContext, 1)
    if #offers > 0 then
        -- Fire to client
        remotes.ShowContextualOffer:FireClient(player, offers[1])
        -- Record
        offerHistory:RecordShown(player, offers[1].id, enrichedContext)
        analyticsManager:Track("monetization_contextual_offer_shown", {
            player = player.UserId,
            offerId = offers[1].id,
            trigger = triggerType,
            spendTier = enrichedContext.spendTier,
        })
    end
end
```

### 5.3 FTUE → Orchestrator Handoff

Per FTUEImplementationSpec §6 (Premium Tease Sequence, steps 42–48):

```lua
-- Called by FTUEManager when FTUE completes
function MonetizationOrchestrator.OnFTUEComplete(player, ftueData)
    -- Record FTUE completion context
    local context = {
        ftueCompletionTime = ftueData.totalTime,
        englishLevelReached = ftueData.englishLevel,
        starsEarned = ftueData.starsEarned,
        premiumPreviewSeen = ftueData.sawPremiumPreview,
        tutorialSkipped = ftueData.skippedTutorial,
    }

    -- Immediate: mark player as FTUE-complete for offer eligibility
    spendStates[player.UserId].ftueComplete = true
    spendStates[player.UserId].ftueCompletedAt = os.time()

    -- Delayed trigger: soft sell after 5 minutes of free play
    task.delay(300, function()
        if player.Parent then  -- still in game
            MonetizationOrchestrator.OnContextualTrigger(
                player,
                "POST_FTUE_MINUTES",
                context
            )
        end
    end)

    analyticsManager:Track("monetization_ftue_handoff", {
        player = player.UserId,
        context = context,
    })
end
```

---

## 6. Annoyance Guard System

### 6.1 Purpose

The Annoyance Guard is the **hard limiter** that overrides all other logic. If the guard says no, no offer is shown. Period. This is the primary retention protection mechanism.

Source: MonetizationDeepDive §6 ("Annoyance kills retention faster than bad offers"), LaunchIntelligence §4 (Roblox player tolerance thresholds).

### 6.2 Guard Rules

```lua
AnnoyanceConfig = {
    -- Session limits (hard caps)
    maxOffersPerSession = {
        NEVER_SPENT = 2,
        MINNOW = 3,
        DOLPHIN = 4,
        WHALE = 5,
        -- LAPSED uses base tier limit
    },

    -- Time-based cooldowns
    minSecondsBetweenOffers = 180,        -- 3 min minimum between any offers
    minSecondsBetweenContextual = 300,    -- 5 min between contextual popups
    minSecondsAfterPurchase = 600,        -- 10 min grace after purchase (no upsell pressure)
    minSecondsAfterDismiss = 900,         -- 15 min after explicit dismiss

    -- Daily limits
    maxOffersPerDay = 8,                  -- across all sessions
    maxContextualPerDay = 4,              -- popup-style only
    maxDismissesBeforeCooldown = 3,       -- 3 dismisses → 2 hour cooldown
    dismissCooldownSeconds = 7200,        -- 2 hours

    -- Session start grace period
    noOffersFirstSeconds = 120,           -- 2 min of gameplay before any offer

    -- Special protections
    noOffersAfterDisconnect = 60,         -- 1 min grace after reconnect
    noOffersDuringEnglishLesson = true,   -- NEVER interrupt English practice
    noOffersDuringBattle = true,          -- NEVER interrupt active gameplay
}
```

### 6.3 Guard Implementation

```lua
local AnnoyanceGuard = {}

function AnnoyanceGuard:CanShowOffer(player, offerType)
    local state = annoyanceStates[player.UserId]
    if not state then return false end

    local now = os.time()
    local tier = spendStates[player.UserId].tier

    -- Session start grace
    if (now - state.sessionStartTime) < AnnoyanceConfig.noOffersFirstSeconds then
        return false, "SESSION_GRACE"
    end

    -- Session cap
    local sessionCap = AnnoyanceConfig.maxOffersPerSession[tier] or 2
    if state.offersShownThisSession >= sessionCap then
        return false, "SESSION_CAP"
    end

    -- Daily cap
    if state.offersShownToday >= AnnoyanceConfig.maxOffersPerDay then
        return false, "DAILY_CAP"
    end

    -- Time between offers
    if state.lastOfferShownTime then
        local elapsed = now - state.lastOfferShownTime
        if elapsed < AnnoyanceConfig.minSecondsBetweenOffers then
            return false, "TIME_COOLDOWN"
        end
    end

    -- Post-purchase grace
    if state.lastPurchaseTime then
        local elapsed = now - state.lastPurchaseTime
        if elapsed < AnnoyanceConfig.minSecondsAfterPurchase then
            return false, "POST_PURCHASE_GRACE"
        end
    end

    -- Dismiss fatigue
    if state.recentDismissCount >= AnnoyanceConfig.maxDismissesBeforeCooldown then
        if state.dismissCooldownUntil and now < state.dismissCooldownUntil then
            return false, "DISMISS_COOLDOWN"
        else
            state.recentDismissCount = 0  -- cooldown expired, reset
        end
    end

    -- Activity protection
    if AnnoyanceConfig.noOffersDuringEnglishLesson and state.inEnglishLesson then
        return false, "IN_ENGLISH_LESSON"
    end
    if AnnoyanceConfig.noOffersDuringBattle and state.inBattle then
        return false, "IN_BATTLE"
    end

    return true, "OK"
end
```

---

## 7. ReceiptRouter Integration

### 7.1 Separation of Concerns

- **MonetizationOrchestrator** decides WHAT to offer and WHEN
- **ReceiptRouter** handles HOW purchases are fulfilled (idempotent, audited)

The Orchestrator **never** calls `MarketplaceService:PromptProductPurchase` directly. It provides offer data to the client, and the client initiates the Roblox purchase flow. ReceiptRouter's `ProcessReceipt` callback handles fulfillment.

### 7.2 Integration Points

```lua
-- 1. Orchestrator registers a completion callback with ReceiptRouter
ReceiptRouter:RegisterCompletionCallback(function(player, productId, receiptInfo)
    MonetizationOrchestrator.OnPurchaseComplete(player, productId, receiptInfo)
end)

-- 2. OnPurchaseComplete updates spend state
function MonetizationOrchestrator.OnPurchaseComplete(player, productId, receiptInfo)
    local state = spendStates[player.UserId]
    if not state then return end

    local robuxAmount = PRODUCT_PRICES[productId] or 0

    -- Update spend state
    state.lifetimeSpendRobux = state.lifetimeSpendRobux + robuxAmount
    state.sessionSpendRobux = state.sessionSpendRobux + robuxAmount
    state.lastPurchaseTimestamp = os.time()
    state.purchaseCount = state.purchaseCount + 1
    state.isLapsed = false

    -- Record in history
    table.insert(state.purchaseHistory, 1, {
        productId = productId,
        amount = robuxAmount,
        timestamp = os.time(),
    })
    -- Cap history at 50
    while #state.purchaseHistory > 50 do
        table.remove(state.purchaseHistory)
    end

    -- Record first purchase
    if state.purchaseCount == 1 then
        state.firstPurchaseTimestamp = os.time()
        analyticsManager:Track("monetization_first_purchase", {
            player = player.UserId,
            productId = productId,
            amount = robuxAmount,
            timeSinceFTUE = os.time() - (state.ftueCompletedAt or os.time()),
        })
    end

    -- Evaluate tier transition
    self._evaluateTierTransition(player)

    -- Update annoyance state (post-purchase grace)
    annoyanceStates[player.UserId].lastPurchaseTime = os.time()

    -- Mark offer as purchased in history
    offerHistory:RecordPurchased(player, productId)

    -- Persist
    playerDataStore:SaveSpendState(player, state)

    -- Analytics
    analyticsManager:Track("monetization_purchase_complete", {
        player = player.UserId,
        productId = productId,
        amount = robuxAmount,
        lifetimeSpend = state.lifetimeSpendRobux,
        tier = state.tier,
        purchaseCount = state.purchaseCount,
    })
end
```

### 7.3 ReceiptRouter Handler Registration

Per ReceiptRouter.lua (`11303d4c`) handler registry pattern:

```lua
-- Register Orchestrator-managed products with ReceiptRouter
for productId, config in pairs(OFFER_CATALOG) do
    if config.productType == "DevProduct" then
        ReceiptRouter:RegisterHandler(productId, function(player, receiptInfo)
            -- Fulfill the specific product
            return fulfillHandlers[config.fulfillType](player, config, receiptInfo)
        end)
    end
end
```

---

## 8. DataStore Schema

### 8.1 Player Monetization Data

Stored under key: `monetization_v1_{userId}`

```lua
MonetizationData = {
    version = 1,

    -- Spend state
    spend = {
        tier = "NEVER_SPENT",
        lifetimeSpendRobux = 0,
        firstPurchaseTimestamp = nil,
        lastPurchaseTimestamp = nil,
        purchaseCount = 0,
        purchaseHistory = {},        -- last 50 {productId, amount, timestamp}
        isLapsed = false,
    },

    -- Offer history (persistent across sessions)
    offers = {
        shown = {},                  -- {offerId: {count, lastShown, lastDismissed}}
        purchased = {},              -- {offerId: timestamp}
        dismissed = {},              -- {offerId: {count, lastDismissed, reasons}}
    },

    -- Daily state (reset at midnight UTC)
    daily = {
        date = "2026-03-27",         -- YYYY-MM-DD
        offersShown = 0,
        contextualShown = 0,
        dismissCount = 0,
    },

    -- FTUE context
    ftue = {
        completed = false,
        completedAt = nil,
        premiumPreviewSeen = false,
    },

    -- English × Monetization bridge
    english = {
        streakDays = 0,
        lastLessonDate = nil,
        lessonsPurchasedThisWeek = 0,
    },
}
```

### 8.2 Data Lifecycle

- **On join:** Load from DataStore. Validate version. Migrate if needed.
- **On purchase:** Immediate save (critical data — no deferred writes).
- **On leave:** Final save with session state merged.
- **Daily reset:** Check `daily.date` on join. If stale, reset daily counters.
- **Migration:** Version field enables forward-compatible schema evolution.

---

## 9. Offer Catalog

### 9.1 Catalog Structure

```lua
OFFER_CATALOG = {
    -- Starter Pack (first purchase optimization)
    starter_pack_1 = {
        id = "starter_pack_1",
        name = "Galaxy Starter Pack",
        description = "500 Stars + Rare Cosmetic + 3-Day Premium",
        robuxPrice = 99,
        productType = "DevProduct",
        productId = 0,               -- Roblox DevProduct ID (set on deployment)
        fulfillType = "BUNDLE",
        contents = {
            { type = "currency", id = "stars", amount = 500 },
            { type = "cosmetic", id = "starter_helmet_rare", tier = "rare" },
            { type = "premium", durationDays = 3 },
        },
        -- Targeting
        targetTier = "NEVER_SPENT",
        minLevel = 1,
        requireFTUEComplete = true,
        isOneTime = true,            -- can only be purchased once
        -- Contextual
        contextTriggers = { "FTUE_COMPLETE", "POST_FTUE_MINUTES" },
        baseScore = 80,
        -- Display
        iconAssetId = "rbxassetid://0",
        badgeText = "BEST VALUE",
        isHighlighted = true,
    },

    -- Death streak power-up
    death_streak_revive = {
        id = "death_streak_revive",
        name = "Phoenix Revive",
        description = "Instant revive + 30s shield",
        robuxPrice = 25,
        productType = "DevProduct",
        productId = 0,
        fulfillType = "CONSUMABLE",
        contents = {
            { type = "revive", count = 1 },
            { type = "buff", id = "shield_30s" },
        },
        targetTier = "ALL",
        contextTriggers = { "DEATH_STREAK" },
        baseScore = 60,
        cooldownHours = 1,           -- don't re-offer for 1 hour after dismiss
    },

    -- Gacha near-pity bundle
    gacha_pity_bundle = {
        id = "gacha_pity_bundle",
        name = "Lucky Pull Bundle",
        description = "10 Pulls + Guaranteed Rare",
        robuxPrice = 299,
        productType = "DevProduct",
        productId = 0,
        fulfillType = "GACHA_PULLS",
        contents = {
            { type = "gacha_pulls", count = 10 },
            { type = "gacha_guarantee", minTier = "rare" },
        },
        targetTier = "MINNOW",
        contextTriggers = { "GACHA_NEAR_PITY", "GACHA_DUP" },
        baseScore = 75,
    },

    -- English streak amplifier
    english_streak_boost = {
        id = "english_streak_boost",
        name = "Scholar's Boost",
        description = "2x English XP for 24 hours",
        robuxPrice = 49,
        productType = "DevProduct",
        productId = 0,
        fulfillType = "BUFF",
        contents = {
            { type = "buff", id = "english_xp_2x", durationHours = 24 },
        },
        targetTier = "ALL",
        contextTriggers = { "ENGLISH_STREAK", "ENGLISH_MILESTONE" },
        baseScore = 55,
        englishBonus = true,
    },

    -- Win-back bundle (lapsed players)
    winback_bundle = {
        id = "winback_bundle",
        name = "Welcome Back Bundle",
        description = "1000 Stars + Premium Cosmetic + 7-Day Premium",
        robuxPrice = 199,
        productType = "DevProduct",
        productId = 0,
        fulfillType = "BUNDLE",
        contents = {
            { type = "currency", id = "stars", amount = 1000 },
            { type = "cosmetic", id = "winback_exclusive", tier = "epic" },
            { type = "premium", durationDays = 7 },
        },
        targetTier = "LAPSED",
        isWinBack = true,
        isOneTime = true,
        baseScore = 85,
    },
}
```

### 9.2 Catalog Management

- **Static at launch.** Catalog is a Lua table, not a remote config. Simplicity first.
- **Future:** Move to remote config when A/B testing is needed.
- **Price validation:** All prices validated against Roblox DevProduct/GamePass IDs on server init.
- **Content validation:** All fulfillment types must have registered handlers in ReceiptRouter.

---

## 10. English × Gacha Bridge Hooks

### 10.1 Design Philosophy

English practice is the **core mechanic that generates monetization surface area.** Players who engage with English content create more opportunities for contextual offers. This is the "English is the mechanic, money is the mission" principle in code.

### 10.2 Bridge Points

| English Event | Monetization Response | Offer Type |
|---------------|----------------------|------------|
| Completed English lesson | Stars bonus + offer surface | English milestone offer |
| 3-day English streak | Streak amplifier available | Scholar's Boost (buff) |
| 7-day English streak | Premium content unlock | Exclusive cosmetic offer |
| English level-up | Celebration moment | Celebration bundle |
| Perfect score on lesson | Bonus gacha pull earned | Gacha pull bundle upsell |
| Daily English login | Enhanced daily reward | Premium daily upgrade |

### 10.3 Integration with EnglishRewardsManager

```lua
-- EnglishRewardsManager calls into Orchestrator
function MonetizationOrchestrator.OnEnglishEvent(player, eventType, data)
    local mapping = {
        LESSON_COMPLETE = "ENGLISH_MILESTONE",
        STREAK_3 = "ENGLISH_STREAK",
        STREAK_7 = "ENGLISH_STREAK",
        LEVEL_UP = "ENGLISH_MILESTONE",
        PERFECT_SCORE = "ENGLISH_MILESTONE",
    }

    local triggerType = mapping[eventType]
    if triggerType then
        MonetizationOrchestrator.OnContextualTrigger(player, triggerType, {
            englishEvent = eventType,
            englishStreakDays = data.streakDays,
            englishLevel = data.level,
        })
    end
end
```

### 10.4 Gospel 444 Alignment in English Bridge

- **Mouse → Tiger:** First English offers are gentle (free stars, small buffs). Only after demonstrated engagement do premium offers appear.
- **Permission over perfection:** Player opts into English content. Monetization follows engagement, never leads it.
- **Never interrupt the lesson.** `noOffersDuringEnglishLesson = true` in Annoyance Guard is non-negotiable.

---

## 11. Analytics Events

### 11.1 Event Taxonomy

All events prefixed with `monetization_` for clean namespace. Integrated with AnalyticsTelemetryIntegrationSpec (`f182ccfd`).

| Event | Trigger | Key Properties |
|-------|---------|---------------|
| `monetization_offer_shown` | Offer displayed to player | offerId, trigger, spendTier, score |
| `monetization_offer_dismissed` | Player closes/ignores offer | offerId, reason, timeShown, spendTier |
| `monetization_offer_clicked` | Player clicks offer CTA | offerId, trigger, spendTier |
| `monetization_purchase_complete` | Purchase fulfilled | productId, amount, lifetimeSpend, tier, purchaseCount |
| `monetization_first_purchase` | First-ever purchase | productId, amount, timeSinceFTUE, trigger |
| `monetization_tier_change` | Player changes spend tier | oldTier, newTier, lifetimeSpend |
| `monetization_trigger_suppressed` | Annoyance guard blocked offer | trigger, reason, spendTier |
| `monetization_contextual_offer_shown` | Contextual popup displayed | offerId, trigger, spendTier |
| `monetization_ftue_handoff` | FTUE completion → Orchestrator | ftueTime, englishLevel, premiumPreviewSeen |
| `monetization_english_bridge` | English event → monetization | englishEvent, streakDays, offerShown |
| `monetization_session_summary` | Player leaves game | sessionSpend, offersShown, offersDismissed, tier |
| `monetization_annoyance_state` | Periodic annoyance state dump | cooldownActive, dismissCount, capsHit |

### 11.2 Funnel Tracking

Primary funnel (per offer):
```
ELIGIBLE → SHOWN → CLICKED → PURCHASE_INITIATED → PURCHASE_COMPLETE
```

Conversion metrics:
- **Show-to-click rate** (offer quality signal)
- **Click-to-purchase rate** (pricing signal)
- **Trigger-to-show rate** (annoyance guard impact)
- **First-purchase conversion** (FTUE handoff effectiveness)
- **Tier transition velocity** (how fast players move up)

---

## 12. Gospel 444 Alignment

### 12.1 Teaching Philosophy → Monetization Design

| Gospel 444 Principle | Monetization Application |
|---------------------|------------------------|
| **Mouse → Tiger** | Start with soft teases (NEVER_SPENT tier). Graduate to direct offers only after engagement proof. |
| **Permission over perfection** | Player always initiates purchase. No forced prompts. No dark patterns. |
| **Celebrate the attempt** | Every purchase = celebration moment. Visual + audio feedback. |
| **Build confidence first** | FTUE gives free premium preview. Player feels powerful BEFORE being asked to pay. |
| **Repetition without boredom** | Offer catalog rotates. Same player never sees identical offer sequence. |
| **The teacher never judges** | No shame mechanics. No "your friends bought this." Only positive social proof. |
| **Meet them where they are** | Spend tiers match offers to player's demonstrated willingness. |

### 12.2 Anti-Patterns (Explicitly Banned)

- ❌ Countdown timers that create artificial urgency
- ❌ "Your friends bought this" shame mechanics
- ❌ Pay-to-win items that make non-payers feel inferior
- ❌ Hiding free alternatives behind premium offers
- ❌ Interrupting gameplay for purchase prompts
- ❌ Punishing players who dismiss offers
- ❌ Loot boxes without transparent odds (pity system is mandatory)

---

## 13. Implementation Priority & Dependencies

### 13.1 Build Order

| Phase | Component | Depends On | Effort |
|-------|-----------|------------|--------|
| **P0** | SpendState tracking + DataStore | PlayerDataStore | 2 days |
| **P0** | AnnoyanceGuard core | SpendState | 1 day |
| **P0** | ReceiptRouter integration | ReceiptRouter (exists) | 1 day |
| **P1** | OfferDecisionEngine | SpendState + AnnoyanceGuard | 3 days |
| **P1** | Offer Catalog (static) | OfferDecisionEngine | 1 day |
| **P1** | Analytics events | AnalyticsManager (exists) | 1 day |
| **P2** | ContextualTriggerSystem | OfferDecisionEngine + AnnoyanceGuard | 2 days |
| **P2** | FTUE → Orchestrator handoff | FTUEManager + ContextualTriggers | 1 day |
| **P3** | English × Gacha bridge | EnglishRewardsManager (spec pending) | 2 days |
| **P3** | Client UI (ShopUI, OfferUI) | All server components | 3 days |

**Total estimate:** ~17 dev-days for full implementation.

### 13.2 Dependency Graph

```
PlayerDataStore ──► SpendState ──┬──► OfferDecisionEngine ──► ContextualTriggers
                                 │                                    │
ReceiptRouter ───────────────────┤                                    │
                                 │                                    ▼
                    AnnoyanceGuard ◄──────────────────── FTUE Handoff
                                                              │
AnalyticsManager ◄───── All Components                        ▼
                                                    EnglishRewardsManager
                                                              │
                                                              ▼
                                                    English × Gacha Bridge
```

### 13.3 File Structure (Target)

```
CANON/TRAIN-67/
├── DOCS/
│   ├── MonetizationOrchestratorSpec.md    ← THIS FILE
│   ├── MonetizationArchitectureDeepDive.md
│   ├── FTUEImplementationSpec.md
│   ├── AnalyticsTelemetryIntegrationSpec.md
│   └── EnglishRewardsManagerSpec.md       ← NEXT (Run 53)
└── SRC/
    ├── MonetizationOrchestrator.lua       ← FUTURE CODE ARTIFACT
    ├── OfferDecisionEngine.lua
    ├── AnnoyanceGuard.lua
    ├── OfferCatalog.lua
    ├── SpendStateManager.lua
    └── ContextualTriggerSystem.lua
```

---

## 14. Testing & Economy Break Scenarios

Per STAGE-5-ECONOMY-BREAK-TEST (`d06ba7cc`):

### 14.1 Break Scenarios to Test

| Scenario | Test | Expected Result |
|----------|------|-----------------|
| **Whale spam** | Player buys every offer max times | Annoyance guard caps. No infinite loop. |
| **Dismiss spam** | Player dismisses 50 offers in a row | Cooldown activates. Offers stop. |
| **Rapid purchase** | 10 purchases in 1 minute | ReceiptRouter dedup. SpendState updates once per unique receipt. |
| **Reconnect exploit** | Disconnect + reconnect to reset session caps | Session state persisted in DataStore. Caps survive reconnect. |
| **Tier rollback** | Refund/chargeback reduces lifetime spend | Tiers only go UP. Lapsed flag handles behavior change. |
| **English bypass** | Skip English, still get English-gated offers | English bridge offers require `streakDays >= 3`. Server-validated. |
| **Concurrent offers** | Two triggers fire simultaneously | Annoyance guard serializes. Only one offer shown. |
| **DataStore failure** | DataStore read fails on join | Fail-closed: default to NEVER_SPENT with zero offers. No purchase possible without loaded state. |

### 14.2 Economy Health Metrics

- **ARPDAU** (Average Revenue Per Daily Active User)
- **First purchase rate** (% of players who ever spend)
- **Time to first purchase** (minutes from FTUE complete)
- **Offer conversion rate** (shown → purchased, by offer type)
- **Annoyance guard activation rate** (% of triggers suppressed)
- **Tier distribution** (% of players in each spend tier)
- **English engagement → purchase correlation** (core KPI for the bridge)

---

## Appendix A: Cross-Repo Source Map

| Source | Repo | SHA | Contribution |
|--------|------|-----|-------------|
| MonetizationArchitectureDeepDive.md | Phoenix-Rising-Protocol-Ultimate | `63234bee` | Revenue streams, integration gaps, Orchestrator pseudocode |
| ReceiptRouter.lua | NET-Ai-EcoSystem-CommandStation | `11303d4c` | Handler registry pattern, idempotent dedup, audit trail |
| FTUEImplementationSpec.md | Phoenix-Rising-Protocol-Ultimate | `18bee6a6` | FTUE→monetization handoff, premium tease sequence |
| AnalyticsTelemetryIntegrationSpec.md | Phoenix-Rising-Protocol-Ultimate | `f182ccfd` | Analytics event taxonomy, funnel tracking patterns |
| STAGE-15-COSMETIC-TRINITY-SPEC.md | Phoenix-Rising-Protocol-Ultimate | `9d53b3de` | Cosmetic desire signals, social proof triggers |
| STAGE-5-ECONOMY-BREAK-TEST.md | Phoenix-Rising-Protocol-Ultimate | `d06ba7cc` | Economy break scenarios, whale behavior modeling |
| STAGE-3-GAME-SIMULATION.md | Phoenix-Rising-Protocol-Ultimate | `46e13965` | Gameplay loop integration points |
| UnifiedServer.lua | NET-Ai-EcoSystem-CommandStation | `ccd827bf` | Server architecture, module init pattern |
| RobloxLaunchIntelligence-March2026.md | Phoenix-Rising-Protocol-Ultimate | `74c0ff5b` | Player tolerance thresholds, market context |

---

> **Platform Death Test:** This file is the permanent artifact. If Notion dies, this spec survives on GitHub.
> **Artifact class:** 🔨 BUILD — student-facing deliverable spec that directly advances the product.
> **Next:** EnglishRewardsManager spec (Run 53) to close the English × Gacha bridge.
