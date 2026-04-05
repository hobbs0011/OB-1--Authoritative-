--[[
===============================================================
SURVIVE A BRAINROT — MONETIZATION ORCHESTRATOR
Module: MonetizationOrchestrator.lua
Type: Server Module (ServerScriptService)
Purpose: SINGLE server-side authority for offer decisions.
         Decides WHAT to offer, WHEN, and HOW aggressively per player.
         Centralizes ad-hoc offer logic from FTUE/GamePass/DevProduct
         into one unified decision engine.

Version: 1.0.0
Date: 2026-03-28
Pipeline: Active Mission — 100% Roblox (Pulse Run 72)
Gospel 444 Compliant
Phoenix Rising Gaming Division

GOVERNING PRINCIPLES:
  1. English is the mechanic, money is the mission
  2. Mouse -> Tiger — permission over perfection
  3. Assume we don't know what we don't know — instrument everything
  4. No dark patterns — every offer provides genuine value
  5. Annoyance kills retention
  6. First purchase is the hardest — optimize path to first spend
  7. Whales self-select — don't push whale pricing on dolphins

NON-NEGOTIABLES:
  - Server-authoritative: all offer decisions server-side
  - Idempotent: duplicate triggers produce identical results
  - Auditable: every offer shown/dismissed/purchased is logged
  - Fail-closed: if Orchestrator errors, NO offers shown
  - ReceiptRouter is the only purchase handler (clean separation)

Cross-repo sources:
  1. MonetizationOrchestratorSpec.md (SHA 6ed43ba3)
  2. ReceiptRouter.lua (SHA 11303d4c)
  3. EnglishRewardsManager.lua (SHA 9ad9471e)
  4. GachaManager.lua (SHA 8ed648e3)
  5. MonetizationServer.lua (SHA 02fc92ef)

Build Order: L4 (after DataStore, Currency, Gacha, BP, ERM, RR)
UnifiedServer boot: add LAST in monetization chain
===============================================================
]]

local ServerStorage = game:GetService("ServerStorage")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")

local MonetizationOrchestrator = {}

--------------------------------------------------------------------------------
-- DEPENDENCIES (lazy-loaded in Init)
--------------------------------------------------------------------------------
local Deps = {
    DataStoreV2 = nil,
    AnalyticsService = nil,
    ReceiptRouter = nil,
    EnglishRewardsManager = nil,
    GachaManager = nil,
    BattlePass = nil,
    FTUEManager = nil,
    EconomyManager = nil,
}

--------------------------------------------------------------------------------
-- SPEND TIER DEFINITIONS (Spec §3)
--------------------------------------------------------------------------------
local SPEND_TIERS = {
    NEVER_SPENT = { order = 1, label = "Never Spent",  maxOffersPerSession = 2 },
    MINNOW      = { order = 2, label = "Minnow",       maxOffersPerSession = 3 },
    DOLPHIN     = { order = 3, label = "Dolphin",       maxOffersPerSession = 4 },
    WHALE       = { order = 4, label = "Whale",         maxOffersPerSession = 5 },
}

local TIER_THRESHOLDS = { MINNOW = 1, DOLPHIN = 500, WHALE = 5000 }
local LAPSED_DAYS = 30

--------------------------------------------------------------------------------
-- ANNOYANCE GUARD CONFIG (Spec §6)
-- The hard limiter. If guard says no, no offer shown. Period.
--------------------------------------------------------------------------------
local ANNOYANCE = {
    minSecsBetweenOffers     = 180,
    minSecsBetweenContextual = 300,
    minSecsAfterPurchase     = 600,
    minSecsAfterDismiss      = 900,
    maxOffersPerDay          = 8,
    maxContextualPerDay      = 4,
    maxDismissesBeforeCool   = 3,
    dismissCooldownSecs      = 7200,
    noOffersFirstSecs        = 120,
    noOffersAfterDisconnect  = 60,
    noOffersDuringLesson     = true,
    noOffersDuringBattle     = true,
}

--------------------------------------------------------------------------------
-- VALID CONTEXTUAL TRIGGERS (Spec §5)
--------------------------------------------------------------------------------
local VALID_TRIGGERS = {
    FTUE_COMPLETE       = true, POST_FTUE_MINUTES   = true,
    DEATH_STREAK        = true, NEAR_MISS            = true,
    SOCIAL_PROOF        = true, GACHA_NEAR_PITY      = true,
    GACHA_DUP           = true, ENGLISH_STREAK       = true,
    ENGLISH_MILESTONE   = true, DAILY_RETURN         = true,
    SESSION_TIME        = true, BATTLE_PASS_NEARING  = true,
    COSMETIC_VIEW       = true, INVENTORY_FULL       = true,
}

--------------------------------------------------------------------------------
-- OFFER CATALOG (Static at launch — Spec §9)
--------------------------------------------------------------------------------
local OFFER_CATALOG = {
    starter_pack_1 = {
        id = "starter_pack_1",
        name = "Galaxy Starter Pack",
        desc = "500 Stars + Rare Cosmetic + 3-Day Premium",
        robuxPrice = 99, productId = 0, fulfillType = "BUNDLE",
        contents = {
            { type = "currency", id = "stars", amount = 500 },
            { type = "cosmetic", id = "starter_helmet_rare", tier = "rare" },
            { type = "premium", durationDays = 3 },
        },
        targetTier = "NEVER_SPENT", requireFTUE = true, isOneTime = true,
        contextTriggers = { "FTUE_COMPLETE", "POST_FTUE_MINUTES" },
        baseScore = 80, badgeText = "BEST VALUE", isHighlighted = true,
    },
    death_streak_revive = {
        id = "death_streak_revive",
        name = "Phoenix Revive",
        desc = "Instant revive + 30s shield",
        robuxPrice = 25, productId = 0, fulfillType = "CONSUMABLE",
        contents = {
            { type = "revive", count = 1 },
            { type = "buff", id = "shield_30s" },
        },
        targetTier = "ALL",
        contextTriggers = { "DEATH_STREAK" },
        baseScore = 60, cooldownHours = 1,
    },
    gacha_pity_bundle = {
        id = "gacha_pity_bundle",
        name = "Lucky Pull Bundle",
        desc = "10 Pulls + Guaranteed Rare",
        robuxPrice = 299, productId = 0, fulfillType = "GACHA_PULLS",
        contents = {
            { type = "gacha_pulls", count = 10 },
            { type = "gacha_guarantee", minTier = "rare" },
        },
        targetTier = "MINNOW",
        contextTriggers = { "GACHA_NEAR_PITY", "GACHA_DUP" },
        baseScore = 75,
    },
    english_streak_boost = {
        id = "english_streak_boost",
        name = "Scholar's Boost",
        desc = "2x English XP for 24 hours",
        robuxPrice = 49, productId = 0, fulfillType = "BUFF",
        contents = { { type = "buff", id = "english_xp_2x", durationHours = 24 } },
        targetTier = "ALL", englishBonus = true,
        contextTriggers = { "ENGLISH_STREAK", "ENGLISH_MILESTONE" },
        baseScore = 55,
    },
    bp_level_skip = {
        id = "bp_level_skip",
        name = "Level Skip",
        desc = "Skip to next Battle Pass tier",
        robuxPrice = 75, productId = 0, fulfillType = "BP_SKIP",
        contents = { { type = "bp_skip", levels = 1 } },
        targetTier = "MINNOW",
        contextTriggers = { "BATTLE_PASS_NEARING" },
        baseScore = 50, cooldownHours = 4,
    },
    winback_bundle = {
        id = "winback_bundle",
        name = "Welcome Back Bundle",
        desc = "1000 Stars + Premium Cosmetic + 7-Day Premium",
        robuxPrice = 199, productId = 0, fulfillType = "BUNDLE",
        contents = {
            { type = "currency", id = "stars", amount = 1000 },
            { type = "cosmetic", id = "winback_exclusive", tier = "epic" },
            { type = "premium", durationDays = 7 },
        },
        targetTier = "LAPSED", isWinBack = true, isOneTime = true,
        baseScore = 85,
    },
    xp_boost_1h = {
        id = "xp_boost_1h",
        name = "XP Surge",
        desc = "2x XP for 1 hour",
        robuxPrice = 35, productId = 0, fulfillType = "BUFF",
        contents = { { type = "buff", id = "xp_2x", durationHours = 1 } },
        targetTier = "ALL",
        contextTriggers = { "SESSION_TIME", "NEAR_MISS" },
        baseScore = 45, cooldownHours = 2,
    },
    inventory_expand = {
        id = "inventory_expand",
        name = "Vault Expansion",
        desc = "+50 inventory slots",
        robuxPrice = 149, productId = 0, fulfillType = "EXPANSION",
        contents = { { type = "inventory_slots", amount = 50 } },
        targetTier = "DOLPHIN",
        contextTriggers = { "INVENTORY_FULL" },
        baseScore = 65,
    },
}

-- Price lookup for spend tracking
local PRODUCT_PRICES = {}
for _, offer in pairs(OFFER_CATALOG) do
    if offer.productId and offer.productId > 0 then
        PRODUCT_PRICES[offer.productId] = offer.robuxPrice
    end
end

--------------------------------------------------------------------------------
-- PER-PLAYER STATE
--------------------------------------------------------------------------------
local spendStates = {}     -- [UserId] = SpendState
local annoyanceStates = {} -- [UserId] = AnnoyanceState
local offerHistories = {}  -- [UserId] = OfferHistory
local MonetizationStore = nil

--------------------------------------------------------------------------------
-- UTILITIES
--------------------------------------------------------------------------------
local function deepCopy(t)
    if type(t) ~= "table" then return t end
    local c = {}
    for k, v in pairs(t) do c[k] = deepCopy(v) end
    return c
end

local function getServerDate()
    local t = os.date("!*t", os.time() + 7 * 3600) -- ICT = UTC+7
    return string.format("%04d-%02d-%02d", t.year, t.month, t.day)
end

local function emitAnalytics(player, event, props)
    if not Deps.AnalyticsService then return end
    pcall(function()
        if type(Deps.AnalyticsService.Track) == "function" then
            Deps.AnalyticsService:Track(player, "monetization_" .. event, props or {})
        end
    end)
end

--------------------------------------------------------------------------------
-- DATA LAYER
--------------------------------------------------------------------------------
local function loadPlayerMonetization(userId)
    local data = {
        spend = {
            tier = "NEVER_SPENT", lifetimeRobux = 0, sessionRobux = 0,
            firstPurchaseAt = nil, lastPurchaseAt = nil, purchaseCount = 0,
            purchaseHistory = {}, isLapsed = false,
            ftueComplete = false, ftueCompletedAt = nil,
        },
        offers = { shown = {}, purchased = {}, dismissed = {} },
        daily = { date = "", offersShown = 0, contextualShown = 0, dismissCount = 0 },
        version = 1,
    }
    if MonetizationStore then
        local ok, stored = pcall(function()
            return MonetizationStore:GetAsync("monet_v1_" .. tostring(userId))
        end)
        if ok and stored and type(stored) == "table" then
            -- Merge stored into defaults
            if stored.spend then
                for k, v in pairs(stored.spend) do data.spend[k] = v end
            end
            if stored.offers then data.offers = stored.offers end
            if stored.daily then data.daily = stored.daily end
        end
    end
    return data
end

local function savePlayerMonetization(userId)
    local ss = spendStates[userId]
    local oh = offerHistories[userId]
    if not ss or not MonetizationStore then return end
    local saveData = {
        spend = ss, offers = oh or {}, daily = annoyanceStates[userId] and {
            date = annoyanceStates[userId].dailyDate or "",
            offersShown = annoyanceStates[userId].offersShownToday or 0,
            contextualShown = annoyanceStates[userId].contextualShownToday or 0,
            dismissCount = annoyanceStates[userId].recentDismissCount or 0,
        } or {},
        version = 1,
    }
    pcall(function()
        MonetizationStore:SetAsync("monet_v1_" .. tostring(userId), saveData)
    end)
end

--------------------------------------------------------------------------------
-- SPEND TIER ENGINE (Spec §3)
--------------------------------------------------------------------------------
local function evaluateTier(userId)
    local ss = spendStates[userId]
    if not ss then return end
    local oldTier = ss.tier
    local spend = ss.lifetimeRobux

    if spend >= 5000 then ss.tier = "WHALE"
    elseif spend >= 500 then ss.tier = "DOLPHIN"
    elseif spend > 0 then ss.tier = "MINNOW"
    end

    -- Lapsed detection (overlay — doesn't demote tier)
    if ss.purchaseCount > 0 and ss.lastPurchaseAt then
        local daysSince = (os.time() - ss.lastPurchaseAt) / 86400
        ss.isLapsed = (daysSince > LAPSED_DAYS)
    end

    if ss.tier ~= oldTier then
        ss.tierPromotedAt = os.time()
    end
    return ss.tier ~= oldTier
end

--------------------------------------------------------------------------------
-- ANNOYANCE GUARD (Spec §6)
-- The hard limiter that overrides ALL other logic.
--------------------------------------------------------------------------------
local function canShowOffer(userId, isContextual)
    local as = annoyanceStates[userId]
    local ss = spendStates[userId]
    if not as or not ss then return false, "NO_STATE" end

    local now = os.time()
    local tier = ss.tier

    -- Daily reset
    local today = getServerDate()
    if as.dailyDate ~= today then
        as.dailyDate = today
        as.offersShownToday = 0
        as.contextualShownToday = 0
        as.recentDismissCount = 0
        as.dismissCooldownUntil = nil
    end

    -- Session start grace
    if as.sessionStartTime and (now - as.sessionStartTime) < ANNOYANCE.noOffersFirstSecs then
        return false, "SESSION_GRACE"
    end

    -- Session cap
    local sessionCap = SPEND_TIERS[tier] and SPEND_TIERS[tier].maxOffersPerSession or 2
    if as.offersShownThisSession >= sessionCap then
        return false, "SESSION_CAP"
    end

    -- Daily cap
    if as.offersShownToday >= ANNOYANCE.maxOffersPerDay then
        return false, "DAILY_CAP"
    end

    -- Contextual daily cap
    if isContextual and as.contextualShownToday >= ANNOYANCE.maxContextualPerDay then
        return false, "CONTEXTUAL_DAILY_CAP"
    end

    -- Time between offers
    if as.lastOfferShownTime and (now - as.lastOfferShownTime) < ANNOYANCE.minSecsBetweenOffers then
        return false, "TIME_COOLDOWN"
    end

    -- Contextual spacing
    if isContextual and as.lastContextualTime and (now - as.lastContextualTime) < ANNOYANCE.minSecsBetweenContextual then
        return false, "CONTEXTUAL_COOLDOWN"
    end

    -- Post-purchase grace
    if as.lastPurchaseTime and (now - as.lastPurchaseTime) < ANNOYANCE.minSecsAfterPurchase then
        return false, "POST_PURCHASE_GRACE"
    end

    -- Dismiss fatigue
    if as.recentDismissCount >= ANNOYANCE.maxDismissesBeforeCool then
        if as.dismissCooldownUntil and now < as.dismissCooldownUntil then
            return false, "DISMISS_COOLDOWN"
        else
            as.recentDismissCount = 0
        end
    end

    -- Activity protection
    if ANNOYANCE.noOffersDuringLesson and as.inEnglishLesson then
        return false, "IN_ENGLISH_LESSON"
    end
    if ANNOYANCE.noOffersDuringBattle and as.inBattle then
        return false, "IN_BATTLE"
    end

    return true, "OK"
end

--------------------------------------------------------------------------------
-- OFFER DECISION ENGINE (Spec §4)
--------------------------------------------------------------------------------
local function scoreOffer(offer, ss, oh, context)
    local score = offer.baseScore or 50

    -- Context relevance bonus
    if offer.contextTriggers and context and context.triggerType then
        for _, trigger in ipairs(offer.contextTriggers) do
            if trigger == context.triggerType then
                score = score + 25
                break
            end
        end
    end

    -- Tier alignment bonus
    if offer.targetTier == ss.tier then
        score = score + 15
    end

    -- Recency penalty
    if oh and oh.shown and oh.shown[offer.id] then
        local lastShown = oh.shown[offer.id].lastShown
        if lastShown then
            local hoursSince = (os.time() - lastShown) / 3600
            if hoursSince < 24 then
                score = score - math.floor(24 - hoursSince)
            end
        end
    end

    -- Lapsed bonus
    if ss.isLapsed and offer.isWinBack then
        score = score + 20
    end

    -- English engagement bonus
    if context and context.englishStreakDays and context.englishStreakDays >= 3 then
        if offer.englishBonus then
            score = score + 10
        end
    end

    return math.max(0, math.min(100, score))
end

local function getActiveOffers(player, context)
    local userId = player.UserId
    local ss = spendStates[userId]
    local oh = offerHistories[userId]
    if not ss then return {} end

    local eligible = {}
    for _, offer in pairs(OFFER_CATALOG) do
        local dominated = true

        -- Filter by tier
        if offer.targetTier ~= "ALL" and offer.targetTier ~= "LAPSED" and offer.targetTier ~= ss.tier then
            dominated = false
        end
        if offer.targetTier == "LAPSED" and not ss.isLapsed then
            dominated = false
        end

        -- Filter already-purchased one-time offers
        if offer.isOneTime and oh and oh.purchased and oh.purchased[offer.id] then
            dominated = false
        end

        -- Filter by FTUE requirement
        if offer.requireFTUE and not ss.ftueComplete then
            dominated = false
        end

        -- Cooldown check
        if offer.cooldownHours and oh and oh.dismissed and oh.dismissed[offer.id] then
            local lastDismiss = oh.dismissed[offer.id].lastDismissed
            if lastDismiss and (os.time() - lastDismiss) < (offer.cooldownHours * 3600) then
                dominated = false
            end
        end

        if dominated then
            local sc = scoreOffer(offer, ss, oh, context)
            table.insert(eligible, { offer = offer, score = sc })
        end
    end

    -- Sort by score descending
    table.sort(eligible, function(a, b) return a.score > b.score end)

    -- Cap to tier limit
    local cap = SPEND_TIERS[ss.tier] and SPEND_TIERS[ss.tier].maxOffersPerSession or 2
    local result = {}
    for i = 1, math.min(#eligible, cap) do
        table.insert(result, eligible[i].offer)
    end
    return result
end

--------------------------------------------------------------------------------
-- CONTEXTUAL TRIGGER SYSTEM (Spec §5)
--------------------------------------------------------------------------------
function MonetizationOrchestrator.OnContextualTrigger(player, triggerType, context)
    if not VALID_TRIGGERS[triggerType] then
        warn("[MonetizationOrchestrator] Unknown trigger:", triggerType)
        return
    end

    local userId = player.UserId
    local allowed, reason = canShowOffer(userId, true)
    if not allowed then
        emitAnalytics(player, "trigger_suppressed", {
            trigger = triggerType, reason = reason, tier = spendStates[userId] and spendStates[userId].tier,
        })
        return
    end

    -- Enrich context
    local enriched = context or {}
    enriched.triggerType = triggerType
    enriched.timestamp = os.time()
    enriched.spendTier = spendStates[userId] and spendStates[userId].tier

    -- Get English streak if available
    if Deps.EnglishRewardsManager and type(Deps.EnglishRewardsManager.GetStreak) == "function" then
        local streak = Deps.EnglishRewardsManager.GetStreak(player)
        if streak then enriched.englishStreakDays = streak.currentStreak end
    end

    -- Get top contextual offer
    local offers = getActiveOffers(player, enriched)
    if #offers > 0 then
        local topOffer = offers[1]
        -- Fire to client
        local remotes = ReplicatedStorage:FindFirstChild("Remotes")
        if remotes then
            local ev = remotes:FindFirstChild("ShowContextualOffer")
            if ev then
                pcall(function() ev:FireClient(player, topOffer) end)
            end
        end

        -- Record shown
        local as = annoyanceStates[userId]
        if as then
            as.offersShownThisSession = (as.offersShownThisSession or 0) + 1
            as.offersShownToday = (as.offersShownToday or 0) + 1
            as.contextualShownToday = (as.contextualShownToday or 0) + 1
            as.lastOfferShownTime = os.time()
            as.lastContextualTime = os.time()
        end

        local oh = offerHistories[userId]
        if oh then
            oh.shown = oh.shown or {}
            oh.shown[topOffer.id] = oh.shown[topOffer.id] or { count = 0 }
            oh.shown[topOffer.id].count = oh.shown[topOffer.id].count + 1
            oh.shown[topOffer.id].lastShown = os.time()
        end

        emitAnalytics(player, "contextual_offer_shown", {
            offerId = topOffer.id, trigger = triggerType,
            spendTier = enriched.spendTier, score = scoreOffer(topOffer, spendStates[userId], oh, enriched),
        })
    end
end

--------------------------------------------------------------------------------
-- FTUE HANDOFF (Spec §5.3)
--------------------------------------------------------------------------------
function MonetizationOrchestrator.OnFTUEComplete(player, ftueData)
    local userId = player.UserId
    local ss = spendStates[userId]
    if not ss then return end

    ss.ftueComplete = true
    ss.ftueCompletedAt = os.time()

    local context = {
        ftueCompletionTime = ftueData and ftueData.totalTime,
        englishLevelReached = ftueData and ftueData.englishLevel,
        premiumPreviewSeen = ftueData and ftueData.sawPremiumPreview,
    }

    -- Delayed trigger: soft sell after 5 min of free play
    task.delay(300, function()
        if player.Parent then
            MonetizationOrchestrator.OnContextualTrigger(player, "POST_FTUE_MINUTES", context)
        end
    end)

    emitAnalytics(player, "ftue_handoff", { player = userId, context = context })
end

--------------------------------------------------------------------------------
-- ENGLISH x MONETIZATION BRIDGE (Spec §10)
--------------------------------------------------------------------------------
function MonetizationOrchestrator.OnEnglishEvent(player, eventType, data)
    local mapping = {
        LESSON_COMPLETE = "ENGLISH_MILESTONE",
        STREAK_3        = "ENGLISH_STREAK",
        STREAK_7        = "ENGLISH_STREAK",
        LEVEL_UP        = "ENGLISH_MILESTONE",
        PERFECT_SCORE   = "ENGLISH_MILESTONE",
    }
    local triggerType = mapping[eventType]
    if triggerType then
        MonetizationOrchestrator.OnContextualTrigger(player, triggerType, {
            englishEvent = eventType,
            englishStreakDays = data and data.streakDays or 0,
            englishLevel = data and data.level or 0,
        })
    end
end

--------------------------------------------------------------------------------
-- PURCHASE COMPLETION (Spec §7)
-- Called by ReceiptRouter after successful fulfillment
--------------------------------------------------------------------------------
function MonetizationOrchestrator.OnPurchaseComplete(player, productId, receiptInfo)
    local userId = player.UserId
    local ss = spendStates[userId]
    if not ss then return end

    local robuxAmount = PRODUCT_PRICES[productId] or 0

    -- Update spend state
    ss.lifetimeRobux = (ss.lifetimeRobux or 0) + robuxAmount
    ss.sessionRobux = (ss.sessionRobux or 0) + robuxAmount
    ss.lastPurchaseAt = os.time()
    ss.purchaseCount = (ss.purchaseCount or 0) + 1
    ss.isLapsed = false

    -- Purchase history (cap at 50)
    ss.purchaseHistory = ss.purchaseHistory or {}
    table.insert(ss.purchaseHistory, 1, {
        productId = productId, amount = robuxAmount, timestamp = os.time(),
    })
    while #ss.purchaseHistory > 50 do table.remove(ss.purchaseHistory) end

    -- First purchase tracking
    if ss.purchaseCount == 1 then
        ss.firstPurchaseAt = os.time()
        emitAnalytics(player, "first_purchase", {
            productId = productId, amount = robuxAmount,
            timeSinceFTUE = os.time() - (ss.ftueCompletedAt or os.time()),
        })
    end

    -- Evaluate tier transition
    local changed = evaluateTier(userId)
    if changed then
        emitAnalytics(player, "tier_change", {
            newTier = ss.tier, lifetimeSpend = ss.lifetimeRobux,
        })
    end

    -- Update annoyance state (post-purchase grace)
    local as = annoyanceStates[userId]
    if as then as.lastPurchaseTime = os.time() end

    -- Mark offer as purchased
    local oh = offerHistories[userId]
    if oh then
        oh.purchased = oh.purchased or {}
        -- Find which offer this product belongs to
        for _, offer in pairs(OFFER_CATALOG) do
            if offer.productId == productId then
                oh.purchased[offer.id] = os.time()
            end
        end
    end

    -- Persist immediately (critical data)
    task.spawn(function() savePlayerMonetization(userId) end)

    emitAnalytics(player, "purchase_complete", {
        productId = productId, amount = robuxAmount,
        lifetimeSpend = ss.lifetimeRobux, tier = ss.tier,
        purchaseCount = ss.purchaseCount,
    })
end

--------------------------------------------------------------------------------
-- OFFER DISMISSED
--------------------------------------------------------------------------------
function MonetizationOrchestrator.OnOfferDismissed(player, offerId, reason)
    local userId = player.UserId
    local as = annoyanceStates[userId]
    local oh = offerHistories[userId]

    if as then
        as.recentDismissCount = (as.recentDismissCount or 0) + 1
        as.lastDismissTime = os.time()
        if as.recentDismissCount >= ANNOYANCE.maxDismissesBeforeCool then
            as.dismissCooldownUntil = os.time() + ANNOYANCE.dismissCooldownSecs
        end
    end

    if oh then
        oh.dismissed = oh.dismissed or {}
        oh.dismissed[offerId] = oh.dismissed[offerId] or { count = 0, reasons = {} }
        oh.dismissed[offerId].count = oh.dismissed[offerId].count + 1
        oh.dismissed[offerId].lastDismissed = os.time()
        table.insert(oh.dismissed[offerId].reasons, reason or "unknown")
    end

    emitAnalytics(player, "offer_dismissed", {
        offerId = offerId, reason = reason,
        tier = spendStates[userId] and spendStates[userId].tier,
    })
end

--------------------------------------------------------------------------------
-- ACTIVITY STATE (for Annoyance Guard protections)
--------------------------------------------------------------------------------
function MonetizationOrchestrator.SetInEnglishLesson(player, isInLesson)
    local as = annoyanceStates[player.UserId]
    if as then as.inEnglishLesson = isInLesson end
end

function MonetizationOrchestrator.SetInBattle(player, isInBattle)
    local as = annoyanceStates[player.UserId]
    if as then as.inBattle = isInBattle end
end

--------------------------------------------------------------------------------
-- PUBLIC QUERY API
--------------------------------------------------------------------------------
function MonetizationOrchestrator.GetActiveOffers(player)
    local userId = player.UserId
    local allowed, reason = canShowOffer(userId, false)
    if not allowed then return {} end
    return getActiveOffers(player, {})
end

function MonetizationOrchestrator.GetSpendTier(player)
    local ss = spendStates[player.UserId]
    return ss and ss.tier or "NEVER_SPENT"
end

function MonetizationOrchestrator.GetLifetimeSpend(player)
    local ss = spendStates[player.UserId]
    return ss and ss.lifetimeRobux or 0
end

function MonetizationOrchestrator.HasPurchased(player, productId)
    local oh = offerHistories[player.UserId]
    if not oh or not oh.purchased then return false end
    for _, offer in pairs(OFFER_CATALOG) do
        if offer.productId == productId and oh.purchased[offer.id] then
            return true
        end
    end
    return false
end

function MonetizationOrchestrator.GetOfferHistory(player)
    return offerHistories[player.UserId] or {}
end

--------------------------------------------------------------------------------
-- DIAGNOSTICS
--------------------------------------------------------------------------------
function MonetizationOrchestrator.GetDebugState(player)
    local userId = player.UserId
    return {
        spendState = spendStates[userId],
        annoyanceState = annoyanceStates[userId],
        offerHistory = offerHistories[userId],
        activeOffers = getActiveOffers(player, {}),
        depsLoaded = {
            DataStoreV2 = Deps.DataStoreV2 ~= nil,
            AnalyticsService = Deps.AnalyticsService ~= nil,
            ReceiptRouter = Deps.ReceiptRouter ~= nil,
            EnglishRewardsManager = Deps.EnglishRewardsManager ~= nil,
            GachaManager = Deps.GachaManager ~= nil,
        },
    }
end

--------------------------------------------------------------------------------
-- PLAYER LIFECYCLE
--------------------------------------------------------------------------------
local function onPlayerJoin(player)
    local userId = player.UserId
    local data = loadPlayerMonetization(userId)

    spendStates[userId] = data.spend
    offerHistories[userId] = data.offers
    annoyanceStates[userId] = {
        sessionStartTime = os.time(),
        offersShownThisSession = 0,
        offersShownToday = data.daily.offersShown or 0,
        contextualShownToday = data.daily.contextualShown or 0,
        lastOfferShownTime = nil,
        lastContextualTime = nil,
        lastPurchaseTime = nil,
        lastDismissTime = nil,
        recentDismissCount = data.daily.dismissCount or 0,
        dismissCooldownUntil = nil,
        inEnglishLesson = false,
        inBattle = false,
        dailyDate = data.daily.date or getServerDate(),
    }

    -- Evaluate tier on join
    evaluateTier(userId)

    emitAnalytics(player, "session_start", {
        tier = spendStates[userId].tier,
        lifetimeSpend = spendStates[userId].lifetimeRobux,
        isLapsed = spendStates[userId].isLapsed,
    })
end

local function onPlayerLeave(player)
    local userId = player.UserId

    -- Session summary analytics
    local as = annoyanceStates[userId]
    emitAnalytics(player, "session_summary", {
        sessionSpend = spendStates[userId] and spendStates[userId].sessionRobux or 0,
        offersShown = as and as.offersShownThisSession or 0,
        tier = spendStates[userId] and spendStates[userId].tier,
    })

    -- Final save
    savePlayerMonetization(userId)

    -- Cleanup
    spendStates[userId] = nil
    annoyanceStates[userId] = nil
    offerHistories[userId] = nil
end

--------------------------------------------------------------------------------
-- INIT
--------------------------------------------------------------------------------
function MonetizationOrchestrator.Init()
    -- DataStore
    pcall(function()
        MonetizationStore = DataStoreService:GetDataStore("MonetizationOrchestrator_v1")
    end)

    -- Load optional dependencies (fail-open)
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
    Deps.ReceiptRouter = tryLoad("ReceiptRouter")
    Deps.EnglishRewardsManager = tryLoad("EnglishRewardsManager")
    Deps.GachaManager = tryLoad("GachaManager")
    Deps.BattlePass = tryLoad("BattlePass")
    Deps.FTUEManager = tryLoad("FTUEManager")
    Deps.EconomyManager = tryLoad("EconomyManager")

    -- Register completion callback with ReceiptRouter
    if Deps.ReceiptRouter and type(Deps.ReceiptRouter.RegisterCompletionCallback) == "function" then
        Deps.ReceiptRouter.RegisterCompletionCallback(function(player, productId, receiptInfo)
            MonetizationOrchestrator.OnPurchaseComplete(player, productId, receiptInfo)
        end)
    end

    -- Player lifecycle
    Players.PlayerAdded:Connect(onPlayerJoin)
    Players.PlayerRemoving:Connect(onPlayerLeave)
    for _, player in ipairs(Players:GetPlayers()) do
        task.spawn(onPlayerJoin, player)
    end

    -- Setup remote events
    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if remotes then
        if not remotes:FindFirstChild("ShowContextualOffer") then
            local ev = Instance.new("RemoteEvent")
            ev.Name = "ShowContextualOffer"
            ev.Parent = remotes
        end
        if not remotes:FindFirstChild("GetActiveOffers") then
            local rf = Instance.new("RemoteFunction")
            rf.Name = "GetActiveOffers"
            rf.Parent = remotes
            rf.OnServerInvoke = function(player)
                return MonetizationOrchestrator.GetActiveOffers(player)
            end
        end
        if not remotes:FindFirstChild("OfferDismissed") then
            local ev = Instance.new("RemoteEvent")
            ev.Name = "OfferDismissed"
            ev.Parent = remotes
            ev.OnServerEvent:Connect(function(player, offerId, reason)
                MonetizationOrchestrator.OnOfferDismissed(player, offerId, reason)
            end)
        end
    end

    print("===============================================================")
    print("[MonetizationOrchestrator] v1.0 — Unified Offer Decision Engine")
    print("English is the mechanic, money is the mission.")
    print("Annoyance Guard: ACTIVE | Spend Tiers: 4 | Offers: " .. tostring(#OFFER_CATALOG))
    print("Pipeline: Active Mission — 100% Roblox (Run 72)")
    print("===============================================================")
    return true
end

function MonetizationOrchestrator.Shutdown()
    for _, player in ipairs(Players:GetPlayers()) do
        pcall(savePlayerMonetization, player.UserId)
    end
    print("[MonetizationOrchestrator] Shutdown — all data saved")
end

return MonetizationOrchestrator
