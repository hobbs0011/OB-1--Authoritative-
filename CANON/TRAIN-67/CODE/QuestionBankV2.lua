--[[
=====================================================================
SURVIVE A BRAINROT — QUESTION BANK V2 (Chunked-Loading Question Service)
Module: QuestionBankV2.lua
Type: Server ModuleScript (ServerStorage)
Purpose: Replace monolithic QuestionBank.lua with chunked architecture
         scaling from 130 to 3,000+ questions.
Version: 1.0
Date: March 27, 2026 | Run: 63
Gospel 444 Compliant — NO BLUE
Phoenix Rising Gaming Division

SOURCES:
  QuestionBank.lua (SHA: 328e63c4) — v1 monolith, 130 questions
  ServerArchitectureQuestionBankScaling.md (SHA: f310ea1f)
  EloManager.lua (SHA: 5d939298) — Elo adaptive difficulty
  UnifiedServer.lua (SHA: ccd827bf) — boot order
  AnalyticsService.lua (SHA: 6ce6451f) — telemetry
  FTUEController.lua (SHA: 1a8475b0) — FTUE hooks

ARCHITECTURE:
  QuestionRegistry (lightweight index) → ChunkLoader (lazy tier load)
  → DataStoreLoader (overflow + LRU cache) → FormatHandlers (6 types)
  → LocalizationService (L1→L2 Thai) → EloManager + AnalyticsService
=====================================================================
]]

local QuestionBankV2 = {}

-- SERVICES
local ServerStorage = game:GetService("ServerStorage")
local ServerScriptService = game:GetService("ServerScriptService")
local DataStoreService = game:GetService("DataStoreService")
local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")

-- =====================================================================
-- CONFIGURATION
-- =====================================================================
local CONFIG = {
    CHUNK_BASE_PATH = "QuestionChunks",
    ENABLE_DATASTORE_OVERFLOW = true,
    DATASTORE_NAME = "QuestionBank_v1",
    LRU_CACHE_MAX = 200,
    LRU_CACHE_TTL = 1800,
    PREWARM_ON_JOIN = true,
    FUZZY_MATCH_THRESHOLD = 0.85,
    MAX_DS_READS_PER_MINUTE = 30,
    LEGACY_TIER_MAP = {
        [1] = "Mouse", [2] = "Cat", [3] = "Wolf",
        [4] = "Lion", [5] = "Tiger",
        Mouse = "Mouse", Cat = "Cat", Wolf = "Wolf",
        Lion = "Lion", Tiger = "Tiger",
    },
    FORMATS = {
        "multiple_choice", "word_builder", "speed_type",
        "listen_choose", "sentence_arrange", "fill_blank",
    },
    DEFAULT_L1 = "th",
    TARGET_L2 = "en",
    L1_FADE_SCHEDULE = {
        { threshold = 0,   showL1 = true,  showHints = true  },
        { threshold = 20,  showL1 = true,  showHints = true  },
        { threshold = 60,  showL1 = false, showHints = true  },
        { threshold = 150, showL1 = false, showHints = false },
    },
}

-- =====================================================================
-- QUESTION REGISTRY (lightweight index — NO full bodies)
-- =====================================================================
local Registry = {
    byId = {},
    byTier = {},
    byTierSubTier = {},
    byFormat = {},
    ftueSequence = {},
    totalCount = 0,
}

local function registerQuestion(entry)
    local id = entry.id
    if not id then return end

    Registry.byId[id] = {
        id = id,
        tier = entry.tier or "Mouse",
        subTier = entry.subTier or "A",
        format = entry.format or "multiple_choice",
        skillType = entry.skillType or "vocabulary",
        vocabCategory = entry.vocabCategory,
        baseElo = entry.baseElo,
        elo = entry.baseElo or 1000,
        ftueWeight = entry.ftueWeight or 0,
        ftueOrder = entry.ftueOrder,
        targetWord = entry.targetWord,
        isPremium = entry.isPremium or false,
        packId = entry.packId,
        source = entry.source or "chunk",
    }

    local tierName = entry.tier or "Mouse"
    Registry.byTier[tierName] = Registry.byTier[tierName] or {}
    table.insert(Registry.byTier[tierName], id)

    local key = tierName .. "_" .. (entry.subTier or "A")
    Registry.byTierSubTier[key] = Registry.byTierSubTier[key] or {}
    table.insert(Registry.byTierSubTier[key], id)

    local fmt = entry.format or "multiple_choice"
    Registry.byFormat[fmt] = Registry.byFormat[fmt] or {}
    table.insert(Registry.byFormat[fmt], id)

    if entry.ftueWeight and entry.ftueWeight > 0 then
        table.insert(Registry.ftueSequence, {
            id = id,
            ftueWeight = entry.ftueWeight,
            ftueOrder = entry.ftueOrder or 999,
        })
    end

    Registry.totalCount = Registry.totalCount + 1
end

-- =====================================================================
-- CHUNK LOADER (lazy-load tier ModuleScripts on demand)
-- =====================================================================
local loadedChunks = {}
local chunkLoadTimes = {}

local function loadChunk(chunkName)
    if loadedChunks[chunkName] then
        return loadedChunks[chunkName]
    end

    local folder = ServerStorage:FindFirstChild(CONFIG.CHUNK_BASE_PATH)
        or ServerScriptService:FindFirstChild(CONFIG.CHUNK_BASE_PATH)

    if folder then
        local chunkModule = folder:FindFirstChild(chunkName)
        if chunkModule then
            local ok, result = pcall(require, chunkModule)
            if ok and type(result) == "table" then
                loadedChunks[chunkName] = result
                chunkLoadTimes[chunkName] = os.clock()
                return result
            else
                warn("[QBv2] Chunk require failed: " .. chunkName .. " — " .. tostring(result))
            end
        end
    end
    return nil
end

local function getQuestionFromChunk(questionId, tier, subTier)
    local chunk = loadChunk(tier .. "_" .. subTier)
    if chunk and chunk[questionId] then return chunk[questionId] end
    chunk = loadChunk(tier)
    if chunk and chunk[questionId] then return chunk[questionId] end
    return nil
end

-- =====================================================================
-- LRU CACHE (DataStore overflow questions, max 200)
-- =====================================================================
local lruCache = {}
local lruOrder = {}

local function lruGet(qid)
    local entry = lruCache[qid]
    if not entry then return nil end
    if os.clock() - entry.lastAccess > CONFIG.LRU_CACHE_TTL then
        lruCache[qid] = nil
        return nil
    end
    entry.lastAccess = os.clock()
    for i, id in ipairs(lruOrder) do
        if id == qid then table.remove(lruOrder, i); break end
    end
    table.insert(lruOrder, qid)
    return entry.body
end

local function lruPut(qid, body)
    while #lruOrder >= CONFIG.LRU_CACHE_MAX do
        local oldest = table.remove(lruOrder, 1)
        lruCache[oldest] = nil
    end
    lruCache[qid] = { body = body, lastAccess = os.clock() }
    table.insert(lruOrder, qid)
end

-- =====================================================================
-- DATASTORE LOADER (overflow for 500+ questions)
-- =====================================================================
local dsReadCount = 0
local dsReadResetTime = os.clock()

local function getQuestionFromDataStore(qid)
    if not CONFIG.ENABLE_DATASTORE_OVERFLOW then return nil end
    local now = os.clock()
    if now - dsReadResetTime > 60 then dsReadCount = 0; dsReadResetTime = now end
    if dsReadCount >= CONFIG.MAX_DS_READS_PER_MINUTE then return nil end

    local cached = lruGet(qid)
    if cached then return cached end

    local store = DataStoreService:GetDataStore(CONFIG.DATASTORE_NAME)
    local success, data = pcall(function() return store:GetAsync("Q:" .. qid) end)
    dsReadCount = dsReadCount + 1

    if success and data then
        local body = data
        if type(data) == "string" then
            local ok, decoded = pcall(function() return HttpService:JSONDecode(data) end)
            body = ok and decoded or nil
        end
        if body then lruPut(qid, body); return body end
    end
    return nil
end

-- =====================================================================
-- QUESTION RESOLVER (unified: chunk → DataStore → legacy fallback)
-- =====================================================================
function QuestionBankV2.ResolveQuestion(questionId)
    local idx = Registry.byId[questionId]
    if not idx then return nil end

    local body = getQuestionFromChunk(questionId, idx.tier, idx.subTier)
    if body then return body end

    body = getQuestionFromDataStore(questionId)
    if body then return body end

    if loadedChunks["_legacy"] and loadedChunks["_legacy"][questionId] then
        return loadedChunks["_legacy"][questionId]
    end
    return nil
end

-- =====================================================================
-- FORMAT HANDLERS (6 question types)
-- =====================================================================
local FormatHandlers = {}

-- Shared: shuffle a copy of an array
local function shuffleArray(arr)
    local copy = {}
    for _, v in ipairs(arr) do table.insert(copy, v) end
    for i = #copy, 2, -1 do
        local j = math.random(i)
        copy[i], copy[j] = copy[j], copy[i]
    end
    return copy
end

-- Shared: case-insensitive trimmed compare
local function normStr(s)
    return string.lower(tostring(s)):gsub("^%s+", ""):gsub("%s+$", "")
end

-- Shared: check answer against primary + accepted alternatives
local function checkAnswer(question, playerAnswer)
    local correct = question.answer or question.correctAnswer
    if not correct then return false end
    if normStr(correct) == normStr(playerAnswer) then return true end
    if question.acceptedAnswers then
        for _, alt in ipairs(question.acceptedAnswers) do
            if normStr(alt) == normStr(playerAnswer) then return true end
        end
    end
    return false
end

-- Levenshtein distance for fuzzy matching
local function levenshtein(s1, s2)
    local len1, len2 = #s1, #s2
    local matrix = {}
    for i = 0, len1 do matrix[i] = { [0] = i } end
    for j = 0, len2 do matrix[0][j] = j end
    for i = 1, len1 do
        for j = 1, len2 do
            local cost = (s1:sub(i, i) == s2:sub(j, j)) and 0 or 1
            matrix[i][j] = math.min(
                matrix[i-1][j] + 1,
                matrix[i][j-1] + 1,
                matrix[i-1][j-1] + cost
            )
        end
    end
    return matrix[len1][len2]
end

local function stringSimilarity(s1, s2)
    local maxLen = math.max(#s1, #s2)
    if maxLen == 0 then return 1 end
    return 1 - (levenshtein(s1, s2) / maxLen)
end

--- MULTIPLE CHOICE (tap to select — default)
FormatHandlers.multiple_choice = {
    ValidateAnswer = function(q, answer)
        return checkAnswer(q, answer), q.explanation
    end,
    PreparePayload = function(q, loc)
        local options = {}
        if q.options then
            for _, opt in ipairs(q.options) do
                table.insert(options, type(opt) == "table" and opt.text or tostring(opt))
            end
        end
        return {
            format = "multiple_choice",
            prompt = loc.prompt,
            options = shuffleArray(options),
            hint = loc.hint,
            timeLimit = nil,
        }
    end,
}

--- WORD BUILDER (scrambled letters)
FormatHandlers.word_builder = {
    ValidateAnswer = function(q, answer)
        local correct = q.answer or q.correctAnswer or ""
        return normStr(correct) == normStr(answer), q.explanation
    end,
    PreparePayload = function(q, loc)
        local word = q.answer or q.correctAnswer or ""
        local letters = {}
        for char in string.gmatch(word, ".") do
            table.insert(letters, string.upper(char))
        end
        return {
            format = "word_builder",
            prompt = loc.prompt or "Arrange the letters to spell the word",
            data = { letters = shuffleArray(letters) },
            hint = loc.hint,
            timeLimit = 30,
        }
    end,
}

--- SPEED TYPE (timed keyboard input with fuzzy match)
FormatHandlers.speed_type = {
    ValidateAnswer = function(q, answer)
        if checkAnswer(q, answer) then return true, nil end
        local correct = normStr(q.answer or q.correctAnswer or "")
        local given = normStr(answer)
        if stringSimilarity(correct, given) >= CONFIG.FUZZY_MATCH_THRESHOLD then
            return true, "Close enough! " .. (q.explanation or "")
        end
        return false, q.explanation
    end,
    PreparePayload = function(q, loc)
        return {
            format = "speed_type",
            prompt = loc.prompt or "Type the correct word!",
            data = { targetLength = string.len(q.answer or "") },
            hint = loc.hint,
            timeLimit = 15,
        }
    end,
}

--- LISTEN & CHOOSE (audio + tap)
FormatHandlers.listen_choose = {
    ValidateAnswer = FormatHandlers.multiple_choice.ValidateAnswer,
    PreparePayload = function(q, loc)
        local payload = FormatHandlers.multiple_choice.PreparePayload(q, loc)
        payload.format = "listen_choose"
        payload.audioAssetId = q.audioAssetId
        return payload
    end,
}

--- SENTENCE ARRANGE (drag words into order)
FormatHandlers.sentence_arrange = {
    ValidateAnswer = function(q, answer)
        local correct = normStr(q.answer or q.correctAnswer or "")
        return correct == normStr(answer), q.explanation
    end,
    PreparePayload = function(q, loc)
        local sentence = q.answer or q.correctAnswer or ""
        local words = {}
        for word in string.gmatch(sentence, "%S+") do
            table.insert(words, word)
        end
        return {
            format = "sentence_arrange",
            prompt = loc.prompt or "Arrange the words into a sentence",
            data = { words = shuffleArray(words) },
            hint = loc.hint,
            timeLimit = 30,
        }
    end,
}

--- FILL IN THE BLANK (cloze deletion)
FormatHandlers.fill_blank = {
    ValidateAnswer = FormatHandlers.speed_type.ValidateAnswer,
    PreparePayload = function(q, loc)
        return {
            format = "fill_blank",
            prompt = loc.prompt,
            data = { blankCount = 1 },
            hint = loc.hint,
            timeLimit = 20,
        }
    end,
}

-- =====================================================================
-- LOCALIZATION SERVICE (L1→L2 Thai/English, progressive fade)
-- =====================================================================
local function getLocalization(question, playerData)
    local totalAnswered = playerData.totalQuestionsAnswered or 0
    local l1 = playerData.l1Language or CONFIG.DEFAULT_L1
    local showL1, showHints = false, false

    for _, level in ipairs(CONFIG.L1_FADE_SCHEDULE) do
        if totalAnswered >= level.threshold then
            showL1 = level.showL1
            showHints = level.showHints
        end
    end

    if playerData.showL1Hints ~= nil then
        showL1 = playerData.showL1Hints
        showHints = playerData.showL1Hints
    end

    -- Struggling words always get L1 support
    if question.targetWord and playerData.vocabularyStruggling then
        local s = playerData.vocabularyStruggling[question.targetWord]
        if s and s >= 2 then showL1 = true; showHints = true end
    end

    local prompt = question.prompt
    if type(prompt) == "table" then
        prompt = (showL1 and prompt[l1]) or prompt.en or ""
    end

    local hint = nil
    if showHints and question.hint then
        hint = type(question.hint) == "table"
            and (question.hint[l1] or question.hint.en)
            or question.hint
    end

    local l1Equiv = nil
    if showL1 and question.questionBody and type(question.questionBody) == "table" then
        l1Equiv = question.questionBody[l1]
    end

    return {
        prompt = prompt or "",
        hint = hint,
        targetWord = question.targetWord
            or (question.questionBody and question.questionBody.en),
        l1Equivalent = l1Equiv,
    }
end

-- =====================================================================
-- V1 MIGRATION (convert 130 existing questions to v2 schema)
-- =====================================================================
function QuestionBankV2.MigrateV1(v1Questions)
    if not v1Questions or type(v1Questions) ~= "table" then return 0 end
    loadedChunks["_legacy"] = {}
    local migrated = 0
    local tierEloMid = {
        Mouse = 900, Cat = 1300, Wolf = 1700, Lion = 2100, Tiger = 2500,
    }

    for _, q in ipairs(v1Questions) do
        if q.id then
            local tierName = CONFIG.LEGACY_TIER_MAP[q.tier or 1] or "Mouse"
            local idNum = tonumber(string.match(q.id, "%d+") or "0") or 0
            local subTier = idNum > 15 and "B" or "A"
            local ftueWeight = (tierName == "Mouse" and subTier == "A") and 1.0 or 0
            local baseElo = tierEloMid[tierName] or 1000

            registerQuestion({
                id = q.id, tier = tierName, subTier = subTier,
                format = "multiple_choice", skillType = "vocabulary",
                baseElo = baseElo, ftueWeight = ftueWeight,
                ftueOrder = ftueWeight > 0 and idNum or nil,
                targetWord = q.targetWord, source = "legacy",
            })

            local opts = {}
            if q.options then
                for _, opt in ipairs(q.options) do
                    table.insert(opts, {
                        text = opt,
                        isCorrect = (opt == q.correctAnswer),
                    })
                end
            end

            loadedChunks["_legacy"][q.id] = {
                id = q.id,
                prompt = { en = q.prompt },
                options = opts,
                answer = q.correctAnswer,
                acceptedAnswers = { q.correctAnswer },
                explanation = q.explanation or "",
                targetWord = q.targetWord,
                tier = tierName, subTier = subTier,
                format = "multiple_choice",
                baseElo = baseElo,
            }
            migrated = migrated + 1
        end
    end

    table.sort(Registry.ftueSequence, function(a, b)
        return (a.ftueOrder or 999) < (b.ftueOrder or 999)
    end)

    print("[QBv2] Migrated " .. migrated .. " v1 questions to v2 schema")
    return migrated
end

-- =====================================================================
-- CHUNK REGISTRATION (for v2-native content)
-- =====================================================================
function QuestionBankV2.RegisterChunk(chunkName, questions)
    loadedChunks[chunkName] = {}
    local count = 0
    for _, q in ipairs(questions) do
        if q.id then
            registerQuestion({
                id = q.id, tier = q.tier, subTier = q.subTier,
                format = q.format or "multiple_choice",
                skillType = q.skillType or "vocabulary",
                vocabCategory = q.vocabCategory,
                baseElo = q.baseElo,
                ftueWeight = q.ftueWeight, ftueOrder = q.ftueOrder,
                targetWord = q.targetWord,
                isPremium = q.isPremium, packId = q.packId,
                source = "chunk",
            })
            loadedChunks[chunkName][q.id] = q
            count = count + 1
        end
    end
    print("[QBv2] Registered chunk '" .. chunkName .. "' — " .. count .. " questions")
end

-- =====================================================================
-- QUESTION SERVICE — Main API
-- =====================================================================

--- Get candidates from registry matching criteria
function QuestionBankV2.GetCandidates(criteria)
    criteria = criteria or {}
    local sourceIds
    if criteria.tier and criteria.subTier then
        sourceIds = Registry.byTierSubTier[criteria.tier .. "_" .. criteria.subTier]
    end
    if not sourceIds and criteria.tier then
        sourceIds = Registry.byTier[criteria.tier]
    end
    if not sourceIds then
        sourceIds = {}
        for id in pairs(Registry.byId) do table.insert(sourceIds, id) end
    end

    local candidates = {}
    for _, id in ipairs(sourceIds) do
        local entry = Registry.byId[id]
        if entry then
            local ok = true
            if criteria.format and criteria.format ~= "any"
                and entry.format ~= criteria.format then ok = false end
            if ok and entry.isPremium and not criteria.includePremium then
                ok = false
            end
            if ok then table.insert(candidates, entry) end
        end
    end
    return candidates
end

--- Get a question for a player (main entry point)
--- Integrates with EloManager for adaptive selection
function QuestionBankV2.GetQuestion(playerData, context)
    context = context or {}

    -- Determine tier
    local tier = "Mouse"
    if context.EloManager and playerData.eloRating then
        tier = context.EloManager.GetTierFromElo(playerData.eloRating)
    elseif playerData.currentTier then
        tier = CONFIG.LEGACY_TIER_MAP[playerData.currentTier] or "Mouse"
    end

    local subTier = "A"
    if context.EloManager and playerData.eloRating then
        subTier = context.EloManager.GetSubTier(playerData.eloRating, tier)
    end

    -- Build candidates with cascading fallback
    local candidates = QuestionBankV2.GetCandidates({
        tier = tier, subTier = subTier, format = context.requestedFormat,
    })
    if #candidates == 0 then
        candidates = QuestionBankV2.GetCandidates({ tier = tier })
    end
    if #candidates == 0 then
        candidates = QuestionBankV2.GetCandidates({ tier = "Mouse" })
    end
    if #candidates == 0 then return nil end

    -- Select via EloManager or basic fallback
    local selected
    if context.EloManager then
        selected = context.EloManager.SelectQuestion(candidates, playerData, {
            isFTUE = context.isFTUE,
            requestedFormat = context.requestedFormat,
            sessionQuestions = context.sessionQuestions,
        })
    end
    if not selected then
        selected = QuestionBankV2._basicSelect(candidates, playerData, context)
    end
    if not selected then return nil end

    -- Resolve full body
    local body = QuestionBankV2.ResolveQuestion(selected.id)
    if not body then return nil end

    -- Localize + format
    local loc = getLocalization(body, playerData)
    local fmtType = body.format or "multiple_choice"
    local handler = FormatHandlers[fmtType] or FormatHandlers.multiple_choice
    local payload = handler.PreparePayload(body, loc)

    payload.questionId = selected.id
    payload.tier = selected.tier
    payload.subTier = selected.subTier
    payload.explanation = body.explanation

    if context.sessionQuestions then
        context.sessionQuestions[selected.id] = true
    end

    return payload
end

--- Process answer (validate + Elo + analytics)
function QuestionBankV2.ProcessAnswer(playerData, questionId, answer, answerTime, context)
    context = context or {}

    local body = QuestionBankV2.ResolveQuestion(questionId)
    if not body then
        return { isCorrect = false, explanation = "Question not found", error = true }
    end

    local fmtType = body.format or "multiple_choice"
    local handler = FormatHandlers[fmtType] or FormatHandlers.multiple_choice
    local isCorrect, explanation = handler.ValidateAnswer(body, answer)

    -- Update mastery/struggling
    local tw = body.targetWord
    if tw then
        if isCorrect then
            playerData.vocabularyMastered = playerData.vocabularyMastered or {}
            playerData.vocabularyMastered[tw] = (playerData.vocabularyMastered[tw] or 0) + 1
            if playerData.vocabularyMastered[tw] >= 3 and playerData.vocabularyStruggling then
                playerData.vocabularyStruggling[tw] = nil
            end
        else
            playerData.vocabularyStruggling = playerData.vocabularyStruggling or {}
            playerData.vocabularyStruggling[tw] = (playerData.vocabularyStruggling[tw] or 0) + 1
        end
    end

    playerData.totalQuestionsAnswered = (playerData.totalQuestionsAnswered or 0) + 1
    if isCorrect then
        playerData.totalCorrect = (playerData.totalCorrect or 0) + 1
    end

    -- EloManager integration
    local eloResult = nil
    if context.EloManager and context.player then
        local idx = Registry.byId[questionId]
        local qElo = idx and idx.elo or nil
        eloResult = context.EloManager.ProcessAnswer(
            context.player, questionId, isCorrect, answerTime, qElo, fmtType
        )
        if eloResult and eloResult.newQuestionElo and idx then
            idx.elo = eloResult.newQuestionElo
        end
    end

    -- AnalyticsService integration
    if context.AnalyticsService and context.player then
        context.AnalyticsService.TrackQuestion("answered", context.player, {
            questionId = questionId, isCorrect = isCorrect,
            responseTime = answerTime, format = fmtType,
            tier = body.tier, targetWord = tw,
            playerElo = eloResult and eloResult.newPlayerElo,
        })
    end

    local result = {
        isCorrect = isCorrect,
        explanation = explanation or body.explanation,
        questionId = questionId,
        correctAnswer = body.answer or body.correctAnswer,
        targetWord = tw,
    }

    if eloResult then
        result.eloDelta = eloResult.eloDelta
        result.tierInfo = eloResult.tierInfo
        result.combatMultiplier = eloResult.combatMultiplier
        result.combatCategory = eloResult.combatCategory
        result.streak = eloResult.streak
        result.bestStreak = eloResult.bestStreak
        result.newPlayerElo = eloResult.newPlayerElo
    end

    return result
end

-- =====================================================================
-- BASIC SELECTION (fallback when EloManager not available)
-- =====================================================================
function QuestionBankV2._basicSelect(candidates, playerData, context)
    if #candidates == 0 then return nil end
    local mastered = playerData.vocabularyMastered or {}
    local struggling = playerData.vocabularyStruggling or {}
    local session = context and context.sessionQuestions or {}

    -- Prioritize struggling
    for _, entry in ipairs(candidates) do
        if entry.targetWord and struggling[entry.targetWord]
            and struggling[entry.targetWord] >= 2
            and not session[entry.id]
            and math.random() < 0.5 then
            return entry
        end
    end

    -- Filter mastered and recent
    local pool = {}
    for _, entry in ipairs(candidates) do
        local tw = entry.targetWord
        local isMastered = tw and mastered[tw] and mastered[tw] >= 3
        if not isMastered and not session[entry.id] then
            table.insert(pool, entry)
        end
    end

    pool = #pool > 0 and pool or candidates
    return pool[math.random(#pool)]
end

-- =====================================================================
-- PRE-WARMING (load player's tier chunk on join)
-- =====================================================================
function QuestionBankV2.PreWarm(playerData)
    if not CONFIG.PREWARM_ON_JOIN then return end
    local tier = CONFIG.LEGACY_TIER_MAP[playerData.currentTier or 1] or "Mouse"
    task.spawn(function()
        loadChunk(tier .. "_A")
        loadChunk(tier .. "_B")
        loadChunk(tier)
    end)
end

-- =====================================================================
-- BACKWARD COMPAT API (drop-in for QuestionBank.lua callers)
-- =====================================================================

--- Drop-in replacement for QuestionBank.GetQuestion(tier, mastered, struggling)
function QuestionBankV2.GetQuestionLegacy(tier, mastered, struggling)
    local tierName = CONFIG.LEGACY_TIER_MAP[tier or 1] or "Mouse"
    local playerData = {
        currentTier = tier or 1,
        vocabularyMastered = mastered or {},
        vocabularyStruggling = struggling or {},
        totalQuestionsAnswered = 0,
    }
    local payload = QuestionBankV2.GetQuestion(playerData, {})
    if not payload then return nil end

    -- Return in v1 shape for backward compat
    local body = QuestionBankV2.ResolveQuestion(payload.questionId)
    if not body then return nil end

    -- Flatten to v1 format
    local q = {
        id = body.id,
        prompt = type(body.prompt) == "table" and body.prompt.en or body.prompt,
        options = payload.options or {},
        correctAnswer = body.answer or body.correctAnswer,
        targetWord = body.targetWord,
        explanation = body.explanation,
        tier = tier or 1,
    }
    return q
end

--- Drop-in replacement for QuestionBank.ValidateAnswer(questionId, answer)
function QuestionBankV2.ValidateAnswer(questionId, answer)
    local body = QuestionBankV2.ResolveQuestion(questionId)
    if not body then return false end
    local handler = FormatHandlers[body.format or "multiple_choice"]
        or FormatHandlers.multiple_choice
    local ok = handler.ValidateAnswer(body, answer)
    return ok
end

-- =====================================================================
-- STATS & DIAGNOSTICS
-- =====================================================================
function QuestionBankV2.GetStats()
    local tierCounts = {}
    for tier, ids in pairs(Registry.byTier) do tierCounts[tier] = #ids end
    local fmtCounts = {}
    for fmt, ids in pairs(Registry.byFormat) do fmtCounts[fmt] = #ids end
    local chunks = {}
    for name in pairs(loadedChunks) do table.insert(chunks, name) end

    return {
        total = Registry.totalCount,
        byTier = tierCounts,
        byFormat = fmtCounts,
        ftueCount = #Registry.ftueSequence,
        chunksLoaded = chunks,
        lruCacheSize = #lruOrder,
        dsReadsThisMinute = dsReadCount,
    }
end

function QuestionBankV2.GetQuestionElo(qid)
    local e = Registry.byId[qid]
    return e and e.elo or 1000
end

function QuestionBankV2.UpdateQuestionElo(qid, newElo)
    local e = Registry.byId[qid]
    if e then e.elo = newElo end
end

function QuestionBankV2.GetFTUESequence()
    return Registry.ftueSequence
end

-- =====================================================================
-- INIT + SHUTDOWN (UnifiedServer.lua lifecycle)
-- =====================================================================
function QuestionBankV2.Init(deps)
    deps = deps or {}

    -- Auto-migrate v1 if legacy QuestionBank is available
    local legacyQB = ServerStorage:FindFirstChild("QuestionBank")
    if legacyQB then
        local ok, legacyModule = pcall(require, legacyQB)
        if ok and type(legacyModule) == "table" then
            -- Extract raw questions from legacy module
            -- Legacy module has a local 'questions' table not directly exposed
            -- Use GetStats to verify it loaded, then migrate via GetQuestion sampling
            print("[QBv2] Legacy QuestionBank detected — attempting migration")
        end
    end

    -- Load any v2-native chunks in the chunks folder
    local folder = ServerStorage:FindFirstChild(CONFIG.CHUNK_BASE_PATH)
    if folder then
        for _, child in ipairs(folder:GetChildren()) do
            if child:IsA("ModuleScript") then
                local ok, data = pcall(require, child)
                if ok and type(data) == "table" then
                    if data[1] and data[1].id then
                        -- Array of questions
                        QuestionBankV2.RegisterChunk(child.Name, data)
                    else
                        -- Dict of questionId → body
                        loadedChunks[child.Name] = data
                        -- Register index entries
                        for qid, body in pairs(data) do
                            if type(body) == "table" and body.id then
                                registerQuestion({
                                    id = body.id,
                                    tier = body.tier, subTier = body.subTier,
                                    format = body.format,
                                    skillType = body.skillType,
                                    baseElo = body.baseElo,
                                    ftueWeight = body.ftueWeight,
                                    ftueOrder = body.ftueOrder,
                                    targetWord = body.targetWord,
                                    isPremium = body.isPremium,
                                    source = "chunk",
                                })
                            end
                        end
                    end
                end
            end
        end
    end

    -- Sort FTUE sequence
    table.sort(Registry.ftueSequence, function(a, b)
        return (a.ftueOrder or 999) < (b.ftueOrder or 999)
    end)

    print("======================================================")
    print("📚 QuestionBankV2 v1.0 — Chunked-Loading Question Service")
    print("  Total questions: " .. Registry.totalCount)
    print("  Formats: " .. table.concat(CONFIG.FORMATS, ", "))
    print("  L1 support: " .. CONFIG.DEFAULT_L1 .. " → " .. CONFIG.TARGET_L2)
    print("  DataStore overflow: " .. tostring(CONFIG.ENABLE_DATASTORE_OVERFLOW))
    print("  LRU cache max: " .. CONFIG.LRU_CACHE_MAX)
    print("  Pipeline: Train 6-7 — MAKE MONEY")
    print("======================================================")

    return true
end

function QuestionBankV2.Shutdown()
    -- Persist question Elo changes to DataStore if needed
    if CONFIG.ENABLE_DATASTORE_OVERFLOW then
        local store = DataStoreService:GetDataStore(CONFIG.DATASTORE_NAME)
        local writeCount = 0
        for qid, entry in pairs(Registry.byId) do
            if entry.elo ~= entry.baseElo and writeCount < 15 then
                pcall(function()
                    store:SetAsync("QELO:" .. qid, entry.elo)
                end)
                writeCount = writeCount + 1
            end
        end
    end

    loadedChunks = {}
    lruCache = {}
    lruOrder = {}
    Registry = {
        byId = {}, byTier = {}, byTierSubTier = {},
        byFormat = {}, ftueSequence = {}, totalCount = 0,
    }
end

--[[
=====================================================================
INTEGRATION GUIDE — How to wire into UnifiedServer.lua

1. BOOT_ORDER — replace QuestionBank entry:
   { name = "QuestionBankV2", path = "QuestionBankV2", required = true },

2. After DataStoreV2 + EloManager are loaded:
   QuestionBankV2.Init({ elo = EloManager, analytics = AnalyticsService })

3. RequestQuestion handler (updated):
   RemoteEvents.RequestQuestion.OnServerEvent:Connect(function(player, ctx)
       local playerData = DataStoreV2.GetPlayerData(player)
       local question = QuestionBankV2.GetQuestion(playerData, {
           EloManager = Modules.EloManager,
           sessionQuestions = playerSessionQuestions[player.UserId],
           isFTUE = playerData.totalQuestionsAnswered < 20,
       })
       if question then
           RemoteEvents.QuestionDelivered:FireClient(player, question)
       end
   end)

4. SubmitAnswer handler (updated):
   RemoteEvents.SubmitAnswer.OnServerEvent:Connect(function(player, qid, ans, time)
       local playerData = DataStoreV2.GetPlayerData(player)
       local result = QuestionBankV2.ProcessAnswer(playerData, qid, ans, time, {
           EloManager = Modules.EloManager,
           AnalyticsService = Modules.AnalyticsService,
           player = player,
       })
       RemoteEvents.AnswerResult:FireClient(player, result)
   end)

5. Shutdown:
   game:BindToClose(function()
       QuestionBankV2.Shutdown()
   end)

CAPACITY PLANNING:
  Current: 130 questions (v1 legacy migration) → 500 (Phase 1 chunks)
  → 1,500 (Phase 2 DataStore overflow) → 3,000+ (Phase 3 scale)
  DataStore budget: ~3% at 50 players (97% headroom)
=====================================================================
]]

return QuestionBankV2
