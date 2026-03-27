--[[
═══════════════════════════════════════════════════════════════════════════════
SURVIVE A BRAINROT — ELO MANAGER (Adaptive Difficulty Engine)
Script: EloManager.lua
Type: Server Module (ServerScriptService)
Purpose: Elo-based adaptive difficulty — match questions to player skill
Version: 1.0
Date: March 27, 2026
Pipeline: Train 6-7 Launch Pipeline
Gospel 444 Compliant — NO BLUE
Phoenix Rising Gaming Division

ARCHITECTURE:
  Glicko-inspired Elo system adapted for educational games:
    - Player Elo: tracks overall English skill level (default 1000)
    - Question Elo: tracks question difficulty (calibrated by player responses)
    - Sub-tier mapping: Mouse-A/Mouse-B → Tiger-A/Tiger-B within 5 main tiers
    - K-factor decay: high volatility for new players, stabilizes over time
    - FTUE override: first 20 questions bypass Elo, use curated sequence
    - Session momentum: hot streaks boost difficulty faster (flow state)

  MAKE MONEY principle: Better matching = longer sessions = more revenue.
  A player who's bored (too easy) or frustrated (too hard) churns.
  Elo keeps them in the flow zone.

CROSS-REPO SOURCES:
  ServerArchitectureQuestionBankScaling.md §4.7 (SHA: f310ea1f) — Elo design
  DataStoreV2.lua (SHA: 0a870f72) — player data schema (v2, no Elo fields)
  QuestionBank.lua (SHA: 328e63c4) — 5-tier structure, 130 questions
  CombatEnglishBridgeSpec.md (SHA: e29bbd30) — combat×English damage multipliers
  FTUEController.lua (SHA: 1a8475b0) — FTUE flow, where Elo hooks in
  MobileFirstEnglishInputDesign.md (SHA: 305efd84) — Elo concept origin
═══════════════════════════════════════════════════════════════════════════════
]]

local EloManager = {}

-- ═══════════════════════════════════════════════════════════
-- SERVICES
-- ═══════════════════════════════════════════════════════════
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

-- ═══════════════════════════════════════════════════════════
-- CONFIGURATION
-- ═══════════════════════════════════════════════════════════
local CONFIG = {
    -- Elo defaults
    DEFAULT_PLAYER_ELO = 1000,
    DEFAULT_QUESTION_ELO = 1000,

    -- Elo boundaries (prevent runaway ratings)
    ELO_FLOOR = 400,
    ELO_CEILING = 2400,

    -- K-factor (controls rating volatility)
    -- Higher K = bigger swings per answer
    K_FACTOR_NEW_PLAYER = 64,       -- First 30 questions: big swings (fast calibration)
    K_FACTOR_STANDARD = 32,         -- Normal play: moderate swings
    K_FACTOR_VETERAN = 16,          -- 500+ questions: small swings (stable rating)
    NEW_PLAYER_THRESHOLD = 30,      -- Questions answered before K drops
    VETERAN_THRESHOLD = 500,        -- Questions answered before K drops again

    -- Matching window: how far from player Elo to search for questions
    ELO_MATCH_WINDOW = 150,         -- ±150 Elo points
    ELO_MATCH_WINDOW_WIDE = 300,    -- Fallback if narrow window has no candidates

    -- FTUE override
    FTUE_QUESTION_COUNT = 20,       -- First N questions use curated sequence

    -- Session momentum (flow state detection)
    STREAK_BOOST_THRESHOLD = 3,     -- Consecutive correct to trigger boost
    STREAK_BOOST_ELO_BUMP = 25,     -- Temporary Elo boost per streak step
    STREAK_BOOST_MAX = 100,         -- Maximum streak Elo bonus
    STREAK_RESET_ON_WRONG = true,   -- Reset streak on incorrect answer

    -- Tier boundaries (Elo ranges per tier)
    -- Each tier has A (lower) and B (upper) sub-tiers
    TIER_BOUNDARIES = {
        Mouse = { min = 400,  mid = 900,  max = 1100 },
        Cat   = { min = 1101, mid = 1300, max = 1500 },
        Wolf  = { min = 1501, mid = 1700, max = 1900 },
        Lion  = { min = 1901, mid = 2100, max = 2300 },
        Tiger = { min = 2301, mid = 2500, max = 2400 },
    },

    -- Tier name to number mapping (for QuestionBank compatibility)
    TIER_NUMBER = {
        Mouse = 1,
        Cat   = 2,
        Wolf  = 3,
        Lion  = 4,
        Tiger = 5,
    },

    -- Combat integration: English performance → damage multiplier
    -- From CombatEnglishBridgeSpec §5 damage calculation
    COMBAT_MULTIPLIERS = {
        PERFECT_ANSWER   = 1.5,    -- Correct + fast (< 5s)
        CORRECT_ANSWER   = 1.2,    -- Correct at normal speed
        SLOW_ANSWER      = 1.0,    -- Correct but slow (> 15s)
        WRONG_ANSWER     = 0.6,    -- Incorrect answer
        TIMEOUT          = 0.4,    -- No answer given
    },
    FAST_ANSWER_THRESHOLD = 5,      -- Seconds for "fast" bonus
    SLOW_ANSWER_THRESHOLD = 15,     -- Seconds for "slow" penalty

    -- Elo history tracking
    ELO_HISTORY_MAX = 20,           -- Keep last N snapshots

    -- Analytics batch interval
    ANALYTICS_FLUSH_INTERVAL = 60,  -- Seconds between DataStore writes

    -- Gospel 444 Colors (for UI hints — NO BLUE)
    Colors = {
        Purple = Color3.fromRGB(168, 85, 247),   -- #a855f7
        Gold   = Color3.fromRGB(245, 158, 11),   -- #f59e0b
        Dark   = Color3.fromRGB(15, 15, 26),     -- #0f0f1a
    },
}

-- ═══════════════════════════════════════════════════════════
-- STATE
-- ═══════════════════════════════════════════════════════════
-- Per-player Elo state (mirrors DataStoreV2 + session-only fields)
-- Key: Player.UserId
local playerEloState = {}

-- Per-question Elo cache (loaded from QuestionRegistry/DataStore)
-- Key: questionId → { elo, attempts, correctRate }
local questionEloCache = {}

-- Analytics buffer
local analyticsBuffer = {}

-- ═══════════════════════════════════════════════════════════
-- CORE ELO MATH
-- Standard Elo with K-factor decay
-- ═══════════════════════════════════════════════════════════

--- Calculate expected probability that player answers correctly
--- @param playerElo number
--- @param questionElo number
--- @return number probability (0-1)
function EloManager.ExpectedScore(playerElo, questionElo)
    return 1 / (1 + 10 ^ ((questionElo - playerElo) / 400))
end

--- Get K-factor based on player experience level
--- @param questionsAnswered number
--- @return number kFactor
function EloManager.GetKFactor(questionsAnswered)
    if questionsAnswered < CONFIG.NEW_PLAYER_THRESHOLD then
        return CONFIG.K_FACTOR_NEW_PLAYER
    elseif questionsAnswered < CONFIG.VETERAN_THRESHOLD then
        return CONFIG.K_FACTOR_STANDARD
    else
        return CONFIG.K_FACTOR_VETERAN
    end
end

--- Update both player and question Elo ratings after an answer
--- @param playerElo number Current player Elo
--- @param questionElo number Current question Elo
--- @param isCorrect boolean Whether the answer was correct
--- @param questionsAnswered number Total questions this player has answered
--- @return number newPlayerElo, number newQuestionElo
function EloManager.UpdateRatings(playerElo, questionElo, isCorrect, questionsAnswered)
    local k = EloManager.GetKFactor(questionsAnswered)
    local expected = EloManager.ExpectedScore(playerElo, questionElo)
    local actual = isCorrect and 1 or 0

    -- Player Elo update
    local newPlayerElo = playerElo + k * (actual - expected)

    -- Question Elo update (inverse: question gets "harder" if beaten often)
    -- Question K-factor is always standard (questions stabilize based on population)
    local questionK = CONFIG.K_FACTOR_STANDARD
    local newQuestionElo = questionElo + questionK * (expected - actual)

    -- Clamp to boundaries
    newPlayerElo = math.max(CONFIG.ELO_FLOOR, math.min(CONFIG.ELO_CEILING, math.floor(newPlayerElo)))
    newQuestionElo = math.max(CONFIG.ELO_FLOOR, math.min(CONFIG.ELO_CEILING, math.floor(newQuestionElo)))

    return newPlayerElo, newQuestionElo
end

-- ═══════════════════════════════════════════════════════════
-- TIER & SUB-TIER MAPPING
-- Maps Elo rating → tier name + sub-tier (A/B)
-- ═══════════════════════════════════════════════════════════

--- Get tier name from Elo rating
--- @param eloRating number
--- @return string tierName (Mouse, Cat, Wolf, Lion, Tiger)
function EloManager.GetTierFromElo(eloRating)
    for tierName, bounds in pairs(CONFIG.TIER_BOUNDARIES) do
        if eloRating >= bounds.min and eloRating <= bounds.max then
            return tierName
        end
    end
    -- Edge cases
    if eloRating < CONFIG.TIER_BOUNDARIES.Mouse.min then
        return "Mouse"
    end
    return "Tiger"
end

--- Get tier number (1-5) from Elo rating (for QuestionBank compatibility)
--- @param eloRating number
--- @return number tierNumber (1-5)
function EloManager.GetTierNumber(eloRating)
    local tierName = EloManager.GetTierFromElo(eloRating)
    return CONFIG.TIER_NUMBER[tierName] or 1
end

--- Get sub-tier (A=lower half, B=upper half) within a tier
--- @param eloRating number
--- @param tierName string|nil (auto-detected if nil)
--- @return string subTier ("A" or "B")
function EloManager.GetSubTier(eloRating, tierName)
    tierName = tierName or EloManager.GetTierFromElo(eloRating)
    local bounds = CONFIG.TIER_BOUNDARIES[tierName]
    if not bounds then return "A" end

    if eloRating >= bounds.mid then
        return "B"
    end
    return "A"
end

--- Get full tier info for a player
--- @param eloRating number
--- @return table { tier, subTier, tierNumber, eloInTier, tierProgress }
function EloManager.GetTierInfo(eloRating)
    local tierName = EloManager.GetTierFromElo(eloRating)
    local bounds = CONFIG.TIER_BOUNDARIES[tierName]
    local subTier = EloManager.GetSubTier(eloRating, tierName)

    local tierRange = bounds.max - bounds.min
    local eloInTier = eloRating - bounds.min
    local tierProgress = tierRange > 0 and (eloInTier / tierRange) or 0

    return {
        tier = tierName,
        subTier = subTier,
        tierNumber = CONFIG.TIER_NUMBER[tierName] or 1,
        eloInTier = eloInTier,
        tierProgress = math.max(0, math.min(1, tierProgress)),
    }
end

-- ═══════════════════════════════════════════════════════════
-- SESSION MOMENTUM (STREAK SYSTEM)
-- Consecutive correct answers temporarily boost effective Elo
-- This keeps players in flow state: streaks = harder questions
-- ═══════════════════════════════════════════════════════════

--- Get effective Elo (player Elo + streak bonus)
--- @param player Player
--- @return number effectiveElo
function EloManager.GetEffectiveElo(player)
    local state = playerEloState[player.UserId]
    if not state then return CONFIG.DEFAULT_PLAYER_ELO end

    local baseElo = state.eloRating or CONFIG.DEFAULT_PLAYER_ELO
    local streak = state.currentStreak or 0

    if streak >= CONFIG.STREAK_BOOST_THRESHOLD then
        local streakBonus = math.min(
            CONFIG.STREAK_BOOST_MAX,
            (streak - CONFIG.STREAK_BOOST_THRESHOLD + 1) * CONFIG.STREAK_BOOST_ELO_BUMP
        )
        return baseElo + streakBonus
    end

    return baseElo
end

--- Update streak after an answer
--- @param player Player
--- @param isCorrect boolean
local function updateStreak(player, isCorrect)
    local state = playerEloState[player.UserId]
    if not state then return end

    if isCorrect then
        state.currentStreak = (state.currentStreak or 0) + 1
        state.bestStreak = math.max(state.bestStreak or 0, state.currentStreak)
    else
        if CONFIG.STREAK_RESET_ON_WRONG then
            state.currentStreak = 0
        end
    end
end

-- ═══════════════════════════════════════════════════════════
-- QUESTION MATCHING
-- Find the best question for a player's current skill level
-- ═══════════════════════════════════════════════════════════

--- Filter question candidates by Elo window
--- @param candidates table Array of { id, elo } entries from QuestionRegistry
--- @param targetElo number Player's effective Elo
--- @param window number|nil Elo window (default: CONFIG.ELO_MATCH_WINDOW)
--- @return table Filtered candidates sorted by Elo proximity
function EloManager.FilterByEloWindow(candidates, targetElo, window)
    window = window or CONFIG.ELO_MATCH_WINDOW

    local matched = {}
    for _, q in ipairs(candidates) do
        local qElo = q.elo or q.baseElo or CONFIG.DEFAULT_QUESTION_ELO
        if math.abs(qElo - targetElo) <= window then
            table.insert(matched, q)
        end
    end

    -- If narrow window returned too few, widen
    if #matched < 3 then
        return EloManager.FilterByEloWindow(candidates, targetElo, CONFIG.ELO_MATCH_WINDOW_WIDE)
    end

    -- Sort by proximity to target Elo (closest first)
    table.sort(matched, function(a, b)
        local aElo = a.elo or a.baseElo or CONFIG.DEFAULT_QUESTION_ELO
        local bElo = b.elo or b.baseElo or CONFIG.DEFAULT_QUESTION_ELO
        return math.abs(aElo - targetElo) < math.abs(bElo - targetElo)
    end)

    return matched
end

--- Select best question for player (Elo-adaptive with mastery/struggling weights)
--- @param candidates table Array of question index entries
--- @param playerData table Player data from DataStoreV2
--- @param context table { isFTUE, requestedFormat, sessionQuestions }
--- @return table|nil Selected question candidate
function EloManager.SelectQuestion(candidates, playerData, context)
    context = context or {}

    -- FTUE override: bypass Elo for first N questions
    local totalAnswered = playerData.totalQuestionsAnswered or 0
    if totalAnswered < CONFIG.FTUE_QUESTION_COUNT then
        -- FTUE: pick from curated Mouse-A sequence
        local ftueCandidates = {}
        for _, q in ipairs(candidates) do
            if q.ftueWeight and q.ftueWeight > 0 then
                table.insert(ftueCandidates, q)
            end
        end
        if #ftueCandidates > 0 then
            table.sort(ftueCandidates, function(a, b)
                return (a.ftueOrder or 999) < (b.ftueOrder or 999)
            end)
            -- Pick next unmastered FTUE question
            local mastered = playerData.vocabularyMastered or {}
            for _, q in ipairs(ftueCandidates) do
                if not mastered[q.id] or (mastered[q.id] or 0) < 3 then
                    return q
                end
            end
        end
        -- Fallthrough: no FTUE questions left, use normal selection
    end

    -- Get effective Elo (includes streak bonus)
    local effectiveElo = playerData.eloRating or CONFIG.DEFAULT_PLAYER_ELO
    if playerData._streakBonus then
        effectiveElo = effectiveElo + playerData._streakBonus
    end

    -- Filter by Elo window
    local matched = EloManager.FilterByEloWindow(candidates, effectiveElo)

    -- Remove recently served questions (avoid repeats within session)
    local sessionQuestions = context.sessionQuestions or {}
    local fresh = {}
    for _, q in ipairs(matched) do
        if not sessionQuestions[q.id] then
            table.insert(fresh, q)
        end
    end
    if #fresh > 0 then matched = fresh end

    -- Weight by struggling (struggling words get 2× weight)
    local struggling = playerData.vocabularyStruggling or {}
    local weighted = {}
    for _, q in ipairs(matched) do
        local weight = 1
        if q.targetWord and struggling[q.targetWord] and struggling[q.targetWord] >= 2 then
            weight = 2
        end
        for i = 1, weight do
            table.insert(weighted, q)
        end
    end

    -- Deprioritize mastered
    local mastered = playerData.vocabularyMastered or {}
    local unmastered = {}
    for _, q in ipairs(weighted) do
        if not mastered[q.targetWord] or (mastered[q.targetWord] or 0) < 3 then
            table.insert(unmastered, q)
        end
    end

    local pool = #unmastered > 0 and unmastered or weighted
    if #pool == 0 then pool = matched end
    if #pool == 0 then return nil end

    -- Pick with slight randomness (top 5 candidates, weighted random)
    local topN = math.min(5, #pool)
    local idx = math.random(topN)
    return pool[idx]
end

-- ═══════════════════════════════════════════════════════════
-- COMBAT INTEGRATION
-- English performance → damage/reward multiplier
-- From CombatEnglishBridgeSpec §5
-- ═══════════════════════════════════════════════════════════

--- Get combat multiplier based on answer result and timing
--- @param isCorrect boolean
--- @param answerTimeSeconds number
--- @param timedOut boolean
--- @return number multiplier, string category
function EloManager.GetCombatMultiplier(isCorrect, answerTimeSeconds, timedOut)
    if timedOut then
        return CONFIG.COMBAT_MULTIPLIERS.TIMEOUT, "TIMEOUT"
    end

    if not isCorrect then
        return CONFIG.COMBAT_MULTIPLIERS.WRONG_ANSWER, "WRONG"
    end

    if answerTimeSeconds <= CONFIG.FAST_ANSWER_THRESHOLD then
        return CONFIG.COMBAT_MULTIPLIERS.PERFECT_ANSWER, "PERFECT"
    elseif answerTimeSeconds >= CONFIG.SLOW_ANSWER_THRESHOLD then
        return CONFIG.COMBAT_MULTIPLIERS.SLOW_ANSWER, "SLOW"
    else
        return CONFIG.COMBAT_MULTIPLIERS.CORRECT_ANSWER, "CORRECT"
    end
end

-- ═══════════════════════════════════════════════════════════
-- PLAYER STATE MANAGEMENT
-- Init, update, and persist Elo state
-- ═══════════════════════════════════════════════════════════

--- Initialize Elo state for a player (call after DataStoreV2.LoadPlayer)
--- @param player Player
--- @param playerData table Data from DataStoreV2
function EloManager.InitPlayer(player, playerData)
    playerEloState[player.UserId] = {
        eloRating = playerData.eloRating or CONFIG.DEFAULT_PLAYER_ELO,
        eloHistory = playerData.eloHistory or {},
        questionsAnsweredForElo = playerData.questionsAnsweredForElo or
            (playerData.totalQuestionsAnswered or 0),
        currentStreak = 0,
        bestStreak = 0,
        sessionStartElo = playerData.eloRating or CONFIG.DEFAULT_PLAYER_ELO,
        sessionQuestionsAnswered = 0,
        sessionCorrect = 0,
        formatStats = playerData.questionFormatStats or {},
        weakCategories = playerData.weakCategories or {},
    }

    print(string.format(
        "[EloManager] Player %s initialized — Elo: %d, Tier: %s-%s, Questions: %d",
        player.Name,
        playerEloState[player.UserId].eloRating,
        EloManager.GetTierFromElo(playerEloState[player.UserId].eloRating),
        EloManager.GetSubTier(playerEloState[player.UserId].eloRating),
        playerEloState[player.UserId].questionsAnsweredForElo
    ))
end

--- Process an answer: update Elo, streak, analytics
--- @param player Player
--- @param questionId string
--- @param isCorrect boolean
--- @param answerTimeSeconds number
--- @param questionElo number|nil Current question Elo (nil = use cache/default)
--- @param format string|nil Question format type
--- @return table result { newPlayerElo, newQuestionElo, eloDelta, tierInfo, combatMultiplier, ... }
function EloManager.ProcessAnswer(player, questionId, isCorrect, answerTimeSeconds, questionElo, format)
    local state = playerEloState[player.UserId]
    if not state then
        warn("[EloManager] No state for " .. player.Name .. " — call InitPlayer first")
        return nil
    end

    local oldElo = state.eloRating
    questionElo = questionElo
        or (questionEloCache[questionId] and questionEloCache[questionId].elo)
        or CONFIG.DEFAULT_QUESTION_ELO

    -- Core Elo update
    local newPlayerElo, newQuestionElo = EloManager.UpdateRatings(
        oldElo, questionElo, isCorrect, state.questionsAnsweredForElo
    )

    -- Update player state
    state.eloRating = newPlayerElo
    state.questionsAnsweredForElo = state.questionsAnsweredForElo + 1
    state.sessionQuestionsAnswered = state.sessionQuestionsAnswered + 1
    if isCorrect then
        state.sessionCorrect = state.sessionCorrect + 1
    end

    -- Elo history snapshot (keep last N)
    table.insert(state.eloHistory, {
        elo = newPlayerElo,
        time = os.time(),
        questionId = questionId,
        correct = isCorrect,
    })
    while #state.eloHistory > CONFIG.ELO_HISTORY_MAX do
        table.remove(state.eloHistory, 1)
    end

    -- Update streak
    updateStreak(player, isCorrect)

    -- Update question Elo cache
    if not questionEloCache[questionId] then
        questionEloCache[questionId] = { elo = newQuestionElo, attempts = 0, correct = 0 }
    end
    local qCache = questionEloCache[questionId]
    qCache.elo = newQuestionElo
    qCache.attempts = qCache.attempts + 1
    if isCorrect then qCache.correct = qCache.correct + 1 end

    -- Update format stats
    if format then
        if not state.formatStats[format] then
            state.formatStats[format] = { attempted = 0, correct = 0 }
        end
        state.formatStats[format].attempted = state.formatStats[format].attempted + 1
        if isCorrect then
            state.formatStats[format].correct = state.formatStats[format].correct + 1
        end
    end

    -- Combat multiplier
    local combatMult, combatCategory = EloManager.GetCombatMultiplier(
        isCorrect, answerTimeSeconds, false
    )

    -- Tier info
    local tierInfo = EloManager.GetTierInfo(newPlayerElo)

    -- Buffer analytics event
    table.insert(analyticsBuffer, {
        playerId = player.UserId,
        questionId = questionId,
        playerEloBefore = oldElo,
        playerEloAfter = newPlayerElo,
        questionEloBefore = questionElo,
        questionEloAfter = newQuestionElo,
        isCorrect = isCorrect,
        answerTime = answerTimeSeconds,
        format = format,
        streak = state.currentStreak,
        timestamp = os.time(),
    })

    return {
        newPlayerElo = newPlayerElo,
        newQuestionElo = newQuestionElo,
        eloDelta = newPlayerElo - oldElo,
        tierInfo = tierInfo,
        combatMultiplier = combatMult,
        combatCategory = combatCategory,
        streak = state.currentStreak,
        bestStreak = state.bestStreak,
        kFactor = EloManager.GetKFactor(state.questionsAnsweredForElo),
        isNewPlayer = state.questionsAnsweredForElo <= CONFIG.NEW_PLAYER_THRESHOLD,
        sessionAccuracy = state.sessionQuestionsAnswered > 0
            and (state.sessionCorrect / state.sessionQuestionsAnswered)
            or 0,
    }
end

-- ═══════════════════════════════════════════════════════════
-- DATASTORE V2→V3 MIGRATION HELPERS
-- Provide the schema additions needed for EloManager
-- ═══════════════════════════════════════════════════════════

--- Get the fields that need to be added to DataStoreV2 DEFAULT_DATA
--- Call this from DataStoreV2.migrateData() for v2→v3
--- @return table Additional default fields for schema v3
function EloManager.GetSchemaV3Defaults()
    return {
        eloRating = CONFIG.DEFAULT_PLAYER_ELO,
        eloHistory = {},
        questionsAnsweredForElo = 0,
        questionFormatStats = {},
        weakCategories = {},
        preferredFormat = nil,
    }
end

--- Get fields to persist back to DataStoreV2 on save
--- @param player Player
--- @return table|nil Fields to merge into player data
function EloManager.GetPersistFields(player)
    local state = playerEloState[player.UserId]
    if not state then return nil end

    return {
        eloRating = state.eloRating,
        eloHistory = state.eloHistory,
        questionsAnsweredForElo = state.questionsAnsweredForElo,
        questionFormatStats = state.formatStats,
        weakCategories = state.weakCategories,
    }
end

-- ═══════════════════════════════════════════════════════════
-- QUESTION ELO MANAGEMENT
-- Seed and update question-level Elo ratings
-- ═══════════════════════════════════════════════════════════

--- Seed question Elo for a batch of questions (call on init)
--- @param questions table Array of { id, tier, baseElo }
function EloManager.SeedQuestionElos(questions)
    for _, q in ipairs(questions) do
        local tierName = q.tier
        local bounds = CONFIG.TIER_BOUNDARIES[tierName]
        local baseElo = q.baseElo

        if not baseElo and bounds then
            -- Auto-assign based on tier midpoint
            baseElo = bounds.mid or CONFIG.DEFAULT_QUESTION_ELO
        end

        questionEloCache[q.id] = {
            elo = baseElo or CONFIG.DEFAULT_QUESTION_ELO,
            attempts = 0,
            correct = 0,
        }
    end
    print("[EloManager] Seeded Elo for " .. tostring(#questions) .. " questions")
end

--- Get current Elo for a question
--- @param questionId string
--- @return number elo
function EloManager.GetQuestionElo(questionId)
    local cached = questionEloCache[questionId]
    return cached and cached.elo or CONFIG.DEFAULT_QUESTION_ELO
end

--- Update question Elo externally (e.g., from analytics recalibration)
--- @param questionId string
--- @param newElo number
function EloManager.SetQuestionElo(questionId, newElo)
    newElo = math.max(CONFIG.ELO_FLOOR, math.min(CONFIG.ELO_CEILING, newElo))
    if not questionEloCache[questionId] then
        questionEloCache[questionId] = { elo = newElo, attempts = 0, correct = 0 }
    else
        questionEloCache[questionId].elo = newElo
    end
end

-- ═══════════════════════════════════════════════════════════
-- DIAGNOSTICS & PUBLIC API
-- ═══════════════════════════════════════════════════════════

--- Get player's current Elo state (for UI display, other systems)
--- @param player Player
--- @return table|nil { eloRating, tier, subTier, streak, sessionStats, ... }
function EloManager.GetPlayerState(player)
    local state = playerEloState[player.UserId]
    if not state then return nil end

    local tierInfo = EloManager.GetTierInfo(state.eloRating)
    return {
        eloRating = state.eloRating,
        effectiveElo = EloManager.GetEffectiveElo(player),
        tier = tierInfo.tier,
        subTier = tierInfo.subTier,
        tierNumber = tierInfo.tierNumber,
        tierProgress = tierInfo.tierProgress,
        currentStreak = state.currentStreak,
        bestStreak = state.bestStreak,
        sessionStartElo = state.sessionStartElo,
        sessionDelta = state.eloRating - state.sessionStartElo,
        sessionQuestionsAnswered = state.sessionQuestionsAnswered,
        sessionAccuracy = state.sessionQuestionsAnswered > 0
            and (state.sessionCorrect / state.sessionQuestionsAnswered)
            or 0,
        kFactor = EloManager.GetKFactor(state.questionsAnsweredForElo),
        isNewPlayer = state.questionsAnsweredForElo < CONFIG.NEW_PLAYER_THRESHOLD,
        formatStats = state.formatStats,
    }
end

--- Check if player should tier up (for notification/VFX triggers)
--- @param player Player
--- @param previousElo number
--- @return boolean tierChanged, string|nil newTier, string|nil previousTier
function EloManager.CheckTierChange(player, previousElo)
    local state = playerEloState[player.UserId]
    if not state then return false end

    local prevTier = EloManager.GetTierFromElo(previousElo)
    local newTier = EloManager.GetTierFromElo(state.eloRating)

    if prevTier ~= newTier then
        return true, newTier, prevTier
    end
    return false
end

--- Get analytics buffer (for external flush)
--- @return table buffer
function EloManager.GetAnalyticsBuffer()
    return analyticsBuffer
end

--- Clear analytics buffer (after successful flush)
function EloManager.ClearAnalyticsBuffer()
    analyticsBuffer = {}
end

--- Get question stats from cache
--- @param questionId string
--- @return table|nil { elo, attempts, correctRate }
function EloManager.GetQuestionStats(questionId)
    local cached = questionEloCache[questionId]
    if not cached then return nil end
    return {
        elo = cached.elo,
        attempts = cached.attempts,
        correctRate = cached.attempts > 0 and (cached.correct / cached.attempts) or 0,
    }
end

-- ═══════════════════════════════════════════════════════════
-- INIT & CLEANUP
-- ═══════════════════════════════════════════════════════════

function EloManager.Init()
    -- Cleanup on player leave
    Players.PlayerRemoving:Connect(function(player)
        playerEloState[player.UserId] = nil
    end)

    print("══════════════════════════════════════════════")
    print("🧠 EloManager v1.0 — Adaptive Difficulty Engine")
    print("  Default Elo: " .. CONFIG.DEFAULT_PLAYER_ELO)
    print("  K-factors: " .. CONFIG.K_FACTOR_NEW_PLAYER .. "/" .. CONFIG.K_FACTOR_STANDARD .. "/" .. CONFIG.K_FACTOR_VETERAN)
    print("  Match window: ±" .. CONFIG.ELO_MATCH_WINDOW)
    print("  FTUE override: first " .. CONFIG.FTUE_QUESTION_COUNT .. " questions")
    print("  Tiers: Mouse → Cat → Wolf → Lion → Tiger (A/B sub-tiers)")
    print("  Pipeline: Train 6-7 — MAKE MONEY")
    print("══════════════════════════════════════════════")

    return true
end

function EloManager.Shutdown()
    playerEloState = {}
    questionEloCache = {}
    analyticsBuffer = {}
end

return EloManager
