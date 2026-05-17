# Server Architecture for Question Bank Scaling

> **Artifact Class:** 🔨 BUILD | **Run:** 48 | **Date:** 2026-03-27  
> **Active Mission:** 100% Roblox — MAKE MONEY  
> **Sources Mined:** QuestionBank.lua (`328e63c4`), UnifiedServer.lua (`ccd827bf`), DataStoreV2.lua (`0a870f72`), MonetizationArchitectureDeepDive.md (`63234bee`), MobileFirstEnglishInputDesign.md (`305efd84`), FTUECompressionAnalysis.md (`c47a1859`)

---

## 1. Executive Summary

The current question bank is a single hardcoded Lua table (QuestionBank.lua, 36KB, 130 questions). This architecture hits a hard ceiling at ~500 questions due to Roblox script size limits and cannot support the content scale required for monetization (MVP=500, intermediate=1,500, advanced=3,000 questions). This document maps the current state, identifies every bottleneck, and proposes a phased architecture that scales to 3,000+ questions with localization, multi-format support, analytics, and content pipeline — all within Roblox platform constraints.

**Bottom line:** The question bank is the single most critical infrastructure bottleneck between the current prototype and a revenue-generating product. Every monetization pathway (gacha, battle pass, premium content) depends on question volume and variety. Fix this first.

---

## 2. Current State Analysis

### 2.1 QuestionBank.lua — The Monolith

| Metric | Value |
|---|---|
| File size | 36KB |
| Total questions | 130 |
| Tiers | 5 (Mouse=40, Cat=30, Wolf=20, Lion=20, Tiger=20) |
| Question format | Multiple choice only (tap-select) |
| Schema per question | `{question, options={}, answer, tier}` |
| Selection algorithm | `GetQuestion()` with mastery/struggling tracking |
| Validation | Case-insensitive string matching |
| Localization | None (English only, no L1→L2 structure) |
| Difficulty within tier | Flat (no sub-tier ramp) |
| Analytics | None (no telemetry on question performance) |

**How questions are served today:**

```
Player triggers combat
  → CombatSystem fires RequestQuestion RemoteEvent
  → UnifiedServer routes to CombatSystem.ServeQuestion()
  → ServeQuestion() calls QuestionBank.GetQuestion(playerData)
  → GetQuestion() reads player tier + mastery/struggling lists
  → Selects question from tier, avoids mastered, prioritizes struggling
  → Shuffles options
  → Returns question via QuestionDelivered RemoteEvent

Player submits answer
  → SubmitAnswer RemoteEvent
  → CombatSystem.ProcessAnswer()
  → QuestionBank.ValidateAnswer() (case-insensitive match)
  → Updates mastery/struggling in player session data
  → Returns AnswerResult RemoteEvent
```

### 2.2 UnifiedServer.lua — Boot & Routing

- QuestionBank loads in Phase 2 of boot sequence (after ServerGateway, SecurityLayer, DataStoreV2)
- QuestionBank is a required module — loaded entirely into memory at server start
- No lazy loading, no chunking, no external data fetch
- Boot order is rigid: DataStoreV2 must be ready before QuestionBank (player data dependency)

### 2.3 DataStoreV2.lua — Player Data Schema

Current player data fields relevant to question bank:

```lua
playerData = {
  vocabularyMastered = {},      -- list of mastered question IDs
  vocabularyStruggling = {},    -- list of struggling question IDs
  currentTier = "Mouse",        -- current difficulty tier
  totalQuestionsAnswered = 0,
  totalCorrect = 0,
  bestCombo = 0
}
```

- Schema version: v2 (migration path from v1 exists)
- Auto-save: every 120 seconds
- Session locking with retry + exponential backoff
- **No Elo rating field** (designed in MobileFirstEnglishInputDesign.md but not implemented)
- **No per-question analytics** (no tracking of question difficulty, discrimination, or usage frequency)

---

## 3. Scaling Bottlenecks (Ranked by Severity)

### 🔴 Critical — Revenue Blockers

| # | Bottleneck | Impact | Current Limit |
|---|---|---|---|
| 1 | **Hardcoded Lua table** | Script size limit ~200KB. At ~280 bytes/question, ceiling is ~500 questions in a single ModuleScript | 130/500 max |
| 2 | **Single format only** | All questions are multiple-choice tap-select. No Word Builder, Speed Type, Listen & Choose, or Sentence Arrange formats | 1/5+ formats needed |
| 3 | **No content pipeline** | Adding questions requires code deploy (edit QuestionBank.lua, publish new version) | Developer-only |
| 4 | **No L1→L2 localization** | Thai students need Thai prompts/hints. Current schema has no L1 field. Blocks Thai market (primary market) | English-only |
| 5 | **Flat difficulty within tiers** | Mouse tier has 40 questions all at same difficulty. FTUE suffers. Need Mouse-A/Mouse-B split minimum | No sub-ramp |

### 🟡 Important — Scale & Quality Blockers

| # | Bottleneck | Impact |
|---|---|---|
| 6 | **No Elo rating system** | Designed in MobileFirstEnglishInputDesign.md but not implemented. Adaptive difficulty is primitive (tier-based only) |
| 7 | **No question analytics** | No data on: question difficulty, discrimination index, usage frequency, skip rate, time-to-answer |
| 8 | **No A/B testing** | Cannot test question variants, difficulty orderings, or format effectiveness |
| 9 | **No content tagging** | Questions lack grammar topic, vocabulary category, or skill type tags. Cannot build targeted practice |
| 10 | **Memory load at boot** | Entire question bank loaded into memory on server start. At 3,000 questions this becomes significant |

### 🟢 Future — Platform Expansion Blockers

| # | Bottleneck | Impact |
|---|---|---|
| 11 | **No offline/cache capability** | Every question requires server round-trip |
| 12 | **No question versioning** | Cannot deprecate questions gracefully |
| 13 | **No community/UGC pipeline** | No path for user-generated questions |

---

## 4. Proposed Architecture

### 4.1 Design Principles

1. **Roblox-native first** — no external HTTP dependencies in the hot question-serving path (Roblox `HttpService` has rate limits and latency)
2. **ModuleScript chunking** — split question bank into tier-specific ModuleScripts loaded on demand
3. **DataStore-backed question storage** for scale beyond ModuleScript limits
4. **Content pipeline separation** — questions authored externally, imported via Studio plugin or DataStore seeding script
5. **Schema-forward** — new schema supports all planned formats, localization, and analytics from day one
6. **Backward compatible** — migration path from current 130 questions without data loss
7. **Gospel 444 aligned** — Mouse → Tiger progression preserved. Permission over perfection.

### 4.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CONTENT PIPELINE                       │
│  (External: Google Sheets / JSON → Studio Plugin)        │
│  Author → Review → Tag → Validate → Import               │
└──────────────────────┬──────────────────────────────────┘
                       │ Import (Studio Plugin / Seed Script)
                       ▼
┌─────────────────────────────────────────────────────────┐
│              QUESTION STORAGE LAYER                       │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ ModuleScript │  │ ModuleScript │  │   DataStore     │  │
│  │ Chunk: Mouse │  │ Chunk: Cat   │  │   (Overflow +   │  │
│  │ (~150 Q)     │  │ (~150 Q)     │  │    Premium)     │  │
│  └──────┬──────┘  └──────┬──────┘  └───────┬─────────┘  │
│         └────────────────┼─────────────────┘             │
│                          ▼                                │
│              QuestionRegistry (index)                     │
│              Knows every question ID,                     │
│              tier, format, tags — but NOT                  │
│              the full question body                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              QUESTION SERVICE LAYER                       │
│                                                           │
│  QuestionService.lua (replaces QuestionBank.lua)          │
│  ┌──────────────────────────────────────────────────┐    │
│  │ GetQuestion(playerData, context)                  │    │
│  │  1. Read player Elo, mastery, tier, session state │    │
│  │  2. Query QuestionRegistry for candidates         │    │
│  │  3. Apply selection algorithm (Elo-matched)       │    │
│  │  4. Lazy-load question body from chunk/DataStore  │    │
│  │  5. Format for client (based on question type)    │    │
│  │  6. Return via RemoteEvent                        │    │
│  └──────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────┐    │
│  │ ProcessAnswer(playerId, questionId, answer, time) │    │
│  │  1. Validate answer                               │    │
│  │  2. Update Elo rating                             │    │
│  │  3. Update mastery/struggling                     │    │
│  │  4. Emit analytics event                          │    │
│  │  5. Return result via RemoteEvent                 │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              ANALYTICS & TELEMETRY LAYER                  │
│                                                           │
│  QuestionAnalytics.lua                                    │
│  - Per-question: attempts, correct%, avg_time, skip_rate  │
│  - Per-player: Elo history, tier progression, weak spots  │
│  - Aggregated: question difficulty index, discrimination  │
│  - Batch write to DataStore (not per-answer)              │
│  - Export-ready for external analysis                     │
└─────────────────────────────────────────────────────────┘
```

### 4.3 New Question Schema

```lua
QuestionSchema = {
  -- Identity
  id = "Q-MOUSE-001",              -- unique, stable, never reused
  version = 1,                      -- increment on edit, old versions archived
  status = "active",                -- active | deprecated | draft | review

  -- Classification
  tier = "Mouse",                   -- Mouse | Cat | Wolf | Lion | Tiger
  subTier = "A",                    -- A | B | C (difficulty ramp within tier)
  format = "multiple_choice",       -- multiple_choice | word_builder | speed_type |
                                    -- listen_choose | sentence_arrange | fill_blank
  skillType = "vocabulary",         -- vocabulary | grammar | reading | listening
  grammarTopic = nil,               -- "present_simple" | "articles" | etc.
  vocabCategory = "animals",        -- content tag for targeted practice
  cefrLevel = "A1",                 -- CEFR alignment

  -- Content (L1→L2 structure)
  prompt = {
    en = "What is the English word for this animal?",
    th = "คำภาษาอังกฤษของสัตว์นี้คืออะไร?",    -- Thai L1 prompt
  },
  questionBody = {
    en = "Dog",                     -- The target word/phrase
    th = "สุนัข",                   -- L1 equivalent
  },
  options = {
    { text = "Dog", isCorrect = true },
    { text = "Cat", isCorrect = false },
    { text = "Bird", isCorrect = false },
    { text = "Fish", isCorrect = false },
  },
  answer = "Dog",                   -- Primary correct answer (backward compat)
  acceptedAnswers = {"Dog", "dog", "A dog"},  -- Extended validation
  hint = {
    en = "It's a common pet that barks",
    th = "เป็นสัตว์เลี้ยงที่เห่า",
  },

  -- Media (optional)
  imageAssetId = nil,               -- Roblox asset ID for image questions
  audioAssetId = nil,               -- Roblox asset ID for listen & choose

  -- Adaptive difficulty
  baseElo = 800,                    -- Starting Elo rating for this question
  currentElo = 812,                 -- Updated by analytics (question gets harder
                                    -- if many players get it wrong)

  -- FTUE
  ftueWeight = 1.0,                 -- 0.0 = never in FTUE, 1.0 = high FTUE priority
  ftueOrder = 5,                    -- Explicit ordering within FTUE sequence

  -- Monetization
  isPremium = false,                -- Premium content gate
  packId = nil,                     -- Which content pack this belongs to

  -- Analytics (server-side, not stored in question file)
  -- These live in QuestionAnalytics DataStore:
  -- totalAttempts, correctRate, avgTimeSeconds, skipRate,
  -- discriminationIndex, lastUpdated

  -- Metadata
  author = "content_team",
  createdDate = "2026-03-15",
  lastModified = "2026-03-27",
  tags = {"ftue", "animals", "basic_vocab"},
}
```

### 4.4 ModuleScript Chunking Strategy

Split the monolithic QuestionBank.lua into tier-specific chunks:

```
QuestionBank/
  ├── QuestionRegistry.lua          -- Index only: ID, tier, subTier, format, tags, Elo
  ├── QuestionService.lua           -- Selection + validation logic (replaces QuestionBank.lua)
  ├── Chunks/
  │   ├── Mouse_A.lua               -- Mouse sub-tier A questions (easiest ~20)
  │   ├── Mouse_B.lua               -- Mouse sub-tier B questions (harder ~20)
  │   ├── Cat.lua                   -- Cat tier questions
  │   ├── Wolf.lua                  -- Wolf tier questions
  │   ├── Lion.lua                  -- Lion tier questions
  │   └── Tiger.lua                 -- Tiger tier questions
  ├── Formats/
  │   ├── MultipleChoice.lua        -- Format handler: render + validate
  │   ├── WordBuilder.lua           -- Format handler: scrambled letters
  │   ├── SpeedType.lua             -- Format handler: timed typing
  │   ├── ListenChoose.lua          -- Format handler: audio + select
  │   ├── SentenceArrange.lua       -- Format handler: word ordering
  │   └── FillBlank.lua             -- Format handler: cloze deletion
  └── Analytics/
      └── QuestionAnalytics.lua     -- Telemetry collection + batch write
```

**Lazy loading protocol:**

```lua
-- QuestionService.lua
local loadedChunks = {}

function QuestionService.GetChunk(chunkName)
  if not loadedChunks[chunkName] then
    local chunk = require(script.Parent.Chunks[chunkName])
    loadedChunks[chunkName] = chunk
    -- Memory tracking
    QuestionAnalytics.TrackChunkLoad(chunkName, #chunk)
  end
  return loadedChunks[chunkName]
end

-- Only load the chunk needed for the player's current tier
function QuestionService.GetQuestion(playerData, context)
  local tier = playerData.currentTier
  local subTier = EloService.GetSubTier(playerData.eloRating, tier)
  local chunkName = tier .. "_" .. subTier

  -- Fallback: if sub-tier chunk doesn't exist, load full tier
  local chunk = QuestionService.GetChunk(chunkName)
                or QuestionService.GetChunk(tier)

  local candidates = QuestionRegistry.GetCandidates({
    tier = tier,
    subTier = subTier,
    format = context.requestedFormat or "any",
    excludeMastered = playerData.vocabularyMastered,
    prioritizeStruggling = playerData.vocabularyStruggling,
    eloRange = { playerData.eloRating - 100, playerData.eloRating + 100 },
  })

  local selected = AdaptiveSelector.Pick(candidates, playerData)
  local questionBody = chunk[selected.id]

  return FormatService.Prepare(questionBody, context.inputMode)
end
```

### 4.5 Capacity Planning

| Phase | Questions | Storage Method | File Count | Est. Memory |
|---|---|---|---|---|
| **Current** | 130 | Single ModuleScript (36KB) | 1 | ~50KB |
| **Phase 1 (MVP)** | 500 | Chunked ModuleScripts | 6-8 chunks | ~140KB loaded |
| **Phase 2 (Intermediate)** | 1,500 | Chunks + DataStore overflow | 8 chunks + DS | ~140KB + on-demand |
| **Phase 3 (Advanced)** | 3,000+ | Chunks (core) + DataStore (bulk) | 8 chunks + DS | ~140KB + on-demand |

**ModuleScript limits:**
- Individual script: ~200KB safe limit → ~700 questions per chunk at ~280 bytes/question
- Total loaded scripts: Roblox doesn't hard-limit count, but memory matters
- Strategy: keep FTUE + core tiers in ModuleScripts (instant load), overflow to DataStore (async load with cache)

### 4.6 DataStore Overflow Architecture

For 1,500+ questions, ModuleScripts alone are insufficient or impractical to maintain. DataStore provides the overflow:

```lua
-- DataStore question storage schema
-- Key format: "Q:{questionId}" → JSON question body
-- Index key: "QINDEX:{tier}:{subTier}" → array of question IDs

local QuestionDataStore = DataStoreService:GetDataStore("QuestionBank_v1")

function DataStoreQuestionLoader.GetQuestion(questionId)
  -- L1 cache: in-memory (already loaded this session)
  if questionCache[questionId] then
    return questionCache[questionId]
  end

  -- L2: DataStore fetch (async, with retry)
  local success, data = pcall(function()
    return QuestionDataStore:GetAsync("Q:" .. questionId)
  end)

  if success and data then
    questionCache[questionId] = HttpService:JSONDecode(data)
    return questionCache[questionId]
  end

  -- L3 fallback: return from ModuleScript chunks if available
  return ChunkFallback.Get(questionId)
end
```

**Cache strategy:**
- Server-side LRU cache: 200 questions max in memory
- Pre-warm cache on player join: load questions for player's current tier
- Cache TTL: 30 minutes (questions don't change mid-session)
- DataStore budget: 60 + 10×players GetAsync/min. At 50 players = 560 reads/min. With cache, actual reads ≈ 20/min.

### 4.7 Elo Rating System Implementation

Designed in MobileFirstEnglishInputDesign.md, not yet implemented. Specification:

```lua
-- Elo constants
local K_FACTOR = 32            -- Standard K-factor
local K_FACTOR_NEW = 64        -- Higher K for new players (first 30 questions)
local DEFAULT_PLAYER_ELO = 1000
local DEFAULT_QUESTION_ELO = 1000

function EloService.UpdateRatings(playerElo, questionElo, isCorrect, isNewPlayer)
  local k = isNewPlayer and K_FACTOR_NEW or K_FACTOR

  -- Expected probability player answers correctly
  local expected = 1 / (1 + 10^((questionElo - playerElo) / 400))

  -- Actual score
  local actual = isCorrect and 1 or 0

  -- Update player Elo
  local newPlayerElo = playerElo + k * (actual - expected)

  -- Update question Elo (inverse — question gets "harder" rating if beaten)
  local newQuestionElo = questionElo + k * (expected - actual)

  return math.floor(newPlayerElo), math.floor(newQuestionElo)
end

-- Sub-tier mapping from Elo
function EloService.GetSubTier(eloRating, tier)
  local ranges = {
    Mouse = { A = {0, 900}, B = {901, 1100} },
    Cat    = { A = {1101, 1300}, B = {1301, 1500} },
    Wolf   = { A = {1501, 1700}, B = {1701, 1900} },
    Lion   = { A = {1901, 2100}, B = {2101, 2300} },
    Tiger  = { A = {2301, 2500}, B = {2501, 9999} },
  }
  local tierRanges = ranges[tier]
  for subTier, range in pairs(tierRanges) do
    if eloRating >= range[1] and eloRating <= range[2] then
      return subTier
    end
  end
  return "A" -- fallback
end
```

**Player data schema additions (DataStoreV2 migration v2→v3):**

```lua
-- New fields for v3 schema
playerData.eloRating = 1000          -- Player's current Elo
playerData.eloHistory = {}           -- Last 20 Elo snapshots for trend
playerData.questionsAnsweredForElo = 0  -- Track "new player" status
playerData.questionFormatStats = {   -- Per-format performance
  multiple_choice = { attempted = 0, correct = 0 },
  word_builder = { attempted = 0, correct = 0 },
  speed_type = { attempted = 0, correct = 0 },
  -- ...
}
playerData.weakCategories = {}       -- Auto-detected weak vocab categories
playerData.preferredFormat = nil     -- ML-inferred preferred input mode
```

### 4.8 FTUE Compression Fix

From FTUECompressionAnalysis.md: Mouse tier has flat difficulty, hurting first-time experience.

**Solution: Mouse-A / Mouse-B split with FTUE weighting:**

```lua
-- Mouse-A: First 10 minutes of play
-- - 20 questions, curated order, maximum scaffolding
-- - ftueWeight = 1.0, ftueOrder explicit
-- - Format: multiple_choice only (simplest input)
-- - Vocab: highest-frequency English words
-- - L1 Thai prompts enabled by default

-- Mouse-B: Post-FTUE Mouse tier
-- - 20 questions, adaptive order via Elo
-- - ftueWeight = 0.0
-- - Formats: multiple_choice + word_builder introduced
-- - Difficulty ramp begins

-- FTUE selection override in QuestionService:
function QuestionService.GetFTUEQuestion(playerData)
  if playerData.totalQuestionsAnswered < 20 then
    -- Force FTUE sequence
    local ftueQuestions = QuestionRegistry.GetCandidates({
      tier = "Mouse",
      subTier = "A",
      ftueWeight = { min = 0.5 },
      excludeMastered = playerData.vocabularyMastered,
    })
    table.sort(ftueQuestions, function(a, b)
      return a.ftueOrder < b.ftueOrder
    end)
    return ftueQuestions[1]
  end
  -- Fall through to normal adaptive selection
  return nil
end
```

### 4.9 Multi-Format Question Handling

Each format needs a dedicated handler on both server (validation) and client (rendering):

| Format | Input Mode | Server Validates | Client Renders |
|---|---|---|---|
| `multiple_choice` | Tap | Option index match | 4 buttons |
| `word_builder` | Drag/Tap | Letter sequence match | Scrambled letter tiles |
| `speed_type` | Keyboard | Exact string match + time | Text input + timer |
| `listen_choose` | Tap | Option index match | Audio player + 4 buttons |
| `sentence_arrange` | Drag | Word order match | Draggable word tiles |
| `fill_blank` | Keyboard | String match (fuzzy) | Sentence with gap + input |

**Format handler interface:**

```lua
-- Each format module implements:
FormatHandler = {
  -- Server-side
  ValidateAnswer = function(question, playerAnswer) → boolean, feedback,
  GenerateOptions = function(question) → shuffled options table,

  -- Client-side (RemoteEvent payload structure)
  PreparePayload = function(question) → {
    format = "word_builder",
    prompt = "Arrange the letters to spell the word",
    data = { letters = {"d","o","g"}, hint = "A pet that barks" },
    timeLimit = 30,  -- nil if untimed
  }
}
```

### 4.10 L1→L2 Localization Architecture

Primary market is Thai students learning English. Every question needs Thai support:

```lua
-- Localization service
LocalizationService = {
  defaultL1 = "th",    -- Thai as default L1
  targetL2 = "en",     -- English as target L2

  -- Get localized prompt based on player settings
  GetPrompt = function(question, playerData)
    local l1 = playerData.l1Language or "th"
    local showL1 = playerData.showL1Hints

    return {
      prompt = showL1 and question.prompt[l1] or question.prompt.en,
      hint = showL1 and question.hint[l1] or nil,
      targetWord = question.questionBody.en,
      l1Equivalent = showL1 and question.questionBody[l1] or nil,
    }
  end
}
```

**L1 hint progressive fade:**
- FTUE (questions 1-20): L1 hints always shown
- Mouse-B (questions 21-60): L1 hints on struggling only
- Cat+: L1 hints off by default, toggle in settings
- This implements Mouse → Tiger: start with full permission (Thai support), progress to independence (English only)

### 4.11 Analytics & Telemetry

```lua
QuestionAnalytics = {
  -- Buffered writes (batch to DataStore every 60s)
  buffer = {},

  RecordAnswer = function(questionId, playerId, isCorrect, timeSeconds, format)
    table.insert(QuestionAnalytics.buffer, {
      qid = questionId,
      pid = playerId,
      correct = isCorrect,
      time = timeSeconds,
      format = format,
      timestamp = os.time(),
    })
  end,

  FlushToDataStore = function()
    -- Aggregate buffer into per-question stats
    local aggregated = {}
    for _, record in ipairs(QuestionAnalytics.buffer) do
      if not aggregated[record.qid] then
        aggregated[record.qid] = { attempts = 0, correct = 0, totalTime = 0 }
      end
      local q = aggregated[record.qid]
      q.attempts += 1
      if record.correct then q.correct += 1 end
      q.totalTime += record.time
    end

    -- Merge with existing DataStore stats
    for qid, stats in pairs(aggregated) do
      local key = "QSTATS:" .. qid
      DataStoreService:GetDataStore("QuestionAnalytics"):UpdateAsync(key, function(old)
        old = old or { attempts = 0, correct = 0, totalTime = 0 }
        old.attempts += stats.attempts
        old.correct += stats.correct
        old.totalTime += stats.totalTime
        old.correctRate = old.correct / old.attempts
        old.avgTime = old.totalTime / old.attempts
        old.lastUpdated = os.time()
        return old
      end)
    end

    QuestionAnalytics.buffer = {}
  end,

  -- Question health metrics (run daily or on-demand)
  GetQuestionHealth = function(questionId)
    -- Returns: difficulty, discrimination, staleness
    -- difficulty = 1 - correctRate (0=trivial, 1=impossible)
    -- discrimination = correlation between question performance and overall player performance
    -- staleness = days since question Elo was last significantly updated
  end,
}
```

**Key metrics tracked:**

| Metric | Purpose | Action Threshold |
|---|---|---|
| `correctRate` | Question difficulty calibration | < 0.2 or > 0.95 → flag for review |
| `avgTimeSeconds` | Engagement / confusion detection | > 2× tier average → hint may be needed |
| `skipRate` | Question quality signal | > 0.3 → flag for removal |
| `discriminationIndex` | Does this question differentiate skill levels? | < 0.1 → question is noise, replace |
| `formatSuccessRate` | Per-format difficulty | Format with < 0.4 success → needs redesign |

### 4.12 A/B Testing Framework

```lua
ABTestService = {
  -- Active experiments
  experiments = {
    {
      id = "FTUE_ORDER_V2",
      description = "Test new FTUE question ordering",
      variants = { "control", "reordered" },
      allocation = 0.5,  -- 50/50 split
      metric = "ftue_completion_rate",
      startDate = "2026-04-01",
    },
  },

  GetVariant = function(playerId, experimentId)
    -- Deterministic hash-based assignment (consistent across sessions)
    local hash = HashService.Hash(playerId .. experimentId)
    local experiment = ABTestService.GetExperiment(experimentId)
    local bucket = hash % 100

    if bucket < (experiment.allocation * 100) then
      return experiment.variants[2]  -- treatment
    end
    return experiment.variants[1]    -- control
  end,

  -- Override question selection based on variant
  ApplyExperiment = function(candidates, playerId, context)
    local variant = ABTestService.GetVariant(playerId, "FTUE_ORDER_V2")
    if variant == "reordered" and context.isFTUE then
      -- Apply experimental FTUE ordering
      return ReorderFTUE(candidates)
    end
    return candidates
  end,
}
```

---

## 5. Content Pipeline

### 5.1 Authoring Workflow

```
Content Author (Google Sheets / Notion DB)
  │
  ▼
Review & QA (validate schema, check duplicates, verify translations)
  │
  ▼
Export to JSON (one file per chunk/tier)
  │
  ▼
Studio Import Plugin
  │  - Validates schema
  │  - Assigns question IDs
  │  - Updates QuestionRegistry
  │  - Places in correct chunk ModuleScript OR seeds DataStore
  │
  ▼
Version publish (no code changes needed)
```

### 5.2 Content Scale Roadmap

| Milestone | Questions | Tiers | Formats | Timeline |
|---|---|---|---|---|
| **Current** | 130 | 5 (flat) | 1 | Done |
| **MVP Launch** | 500 | 5 + sub-tiers | 2 (MC + Word Builder) | Phase 1 |
| **Monetization Ready** | 1,500 | 5 + sub-tiers | 4 formats | Phase 2 |
| **Scale** | 3,000+ | 5 + sub-tiers + premium | 5+ formats + audio | Phase 3 |

### 5.3 Question Pack Structure (Monetization)

```lua
QuestionPack = {
  id = "PACK_ANIMALS_PREMIUM",
  name = "Animal Kingdom Premium",
  description = "50 advanced animal vocabulary questions with audio",
  tier = "Wolf",
  questionCount = 50,
  price = {
    robux = 149,
    battlePassTier = 15,  -- Unlocked at BP tier 15
  },
  questions = { "Q-WOLF-201", "Q-WOLF-202", ... },
  isPremium = true,
}
```

---

## 6. Migration Plan

### Phase 0: Schema Prep (No Breaking Changes)

1. Add new fields to existing 130 questions (subTier, format, skillType, cefrLevel, ftueWeight, ftueOrder, L1 translations)
2. Update DataStoreV2 schema to v3 (add eloRating, eloHistory, questionFormatStats)
3. Write migration function in DataStoreV2.lua (v2→v3 with defaults)
4. **No behavior changes** — existing flow works exactly as before

### Phase 1: ModuleScript Chunking (MVP = 500 questions)

1. Split QuestionBank.lua into QuestionRegistry + QuestionService + Chunks/
2. Implement lazy loading in QuestionService
3. Implement Mouse-A/Mouse-B FTUE split
4. Add Word Builder format handler
5. Add L1→L2 Thai localization for all 500 questions
6. Implement basic Elo rating (update on every answer)
7. Wire QuestionAnalytics (buffer + batch write)
8. Build Studio import plugin (JSON → ModuleScript chunk)

### Phase 2: DataStore Overflow (1,500 questions)

1. Implement DataStore question storage for overflow content
2. Add LRU cache layer
3. Implement content packs (premium gating)
4. Add Speed Type + Listen & Choose format handlers
5. A/B testing framework live
6. Analytics dashboard (question health metrics)

### Phase 3: Scale & UGC (3,000+ questions)

1. Community question submission pipeline
2. Advanced analytics (discrimination index, predictive difficulty)
3. Question versioning & deprecation
4. Audio asset pipeline for listen & choose
5. Sentence Arrange format handler
6. Cross-device sync for question progress

---

## 7. UnifiedServer.lua Integration Changes

Current boot order change (Phase 2 stays but module changes):

```lua
-- Phase 2: Core Game Systems
QuestionRegistry = require(ServerModules.QuestionBank.QuestionRegistry)
QuestionService = require(ServerModules.QuestionBank.QuestionService)
EloService = require(ServerModules.QuestionBank.EloService)
QuestionAnalytics = require(ServerModules.QuestionBank.Analytics.QuestionAnalytics)

-- Initialize (replaces current QuestionBank init)
QuestionService.Init({
  registry = QuestionRegistry,
  elo = EloService,
  analytics = QuestionAnalytics,
  dataStore = DataStoreV2,
})
```

RemoteEvent changes:

```lua
-- RequestQuestion handler (updated)
RemoteEvents.RequestQuestion.OnServerEvent:Connect(function(player, context)
  local playerData = DataStoreV2.GetPlayerData(player)
  local question = QuestionService.GetQuestion(playerData, context or {})
  RemoteEvents.QuestionDelivered:FireClient(player, question)
end)

-- SubmitAnswer handler (updated — adds analytics + Elo)
RemoteEvents.SubmitAnswer.OnServerEvent:Connect(function(player, questionId, answer, timeSeconds)
  local playerData = DataStoreV2.GetPlayerData(player)
  local result = QuestionService.ProcessAnswer(playerData, questionId, answer, timeSeconds)

  -- Elo update
  local newPlayerElo, newQuestionElo = EloService.UpdateRatings(
    playerData.eloRating,
    QuestionRegistry.GetElo(questionId),
    result.isCorrect,
    playerData.questionsAnsweredForElo < 30
  )
  playerData.eloRating = newPlayerElo
  QuestionRegistry.UpdateElo(questionId, newQuestionElo)

  -- Analytics
  QuestionAnalytics.RecordAnswer(questionId, player.UserId, result.isCorrect, timeSeconds, result.format)

  RemoteEvents.AnswerResult:FireClient(player, result)
end)
```

---

## 8. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| DataStore rate limiting at scale | Medium | High | LRU cache, batch writes, pre-warm on join |
| ModuleScript memory pressure at 500+ Q | Low | Medium | Lazy loading, chunk by tier, monitor memory |
| Elo cold-start (new players mismatched) | High | Medium | K_FACTOR_NEW=64 for first 30 Q, FTUE override |
| L1 translation quality | Medium | High | Native Thai reviewer required, community feedback |
| Content pipeline bottleneck (manual import) | High | Medium | Studio plugin automates import, JSON schema validated |
| Question Elo drift (not enough data) | Medium | Low | Floor/ceiling on Elo (500-2000), regular recalibration |
| Breaking change on DataStore v2→v3 migration | Low | Critical | Backward-compatible defaults, migration tested on staging |

---

## 9. Success Metrics

| Metric | Current | MVP Target | Scale Target |
|---|---|---|---|
| Total questions | 130 | 500 | 3,000+ |
| Question formats | 1 | 2 | 5+ |
| FTUE completion rate | Unknown | > 80% | > 90% |
| Avg questions/session | Unknown | 15+ | 25+ |
| Question skip rate | Unknown | < 10% | < 5% |
| Content deploy frequency | Code push required | Weekly JSON import | Daily |
| L1 language support | 0 | 1 (Thai) | 3+ |
| Time-to-first-answer (FTUE) | Unknown | < 30 seconds | < 20 seconds |

---

## 10. Appendix: File Reference

| Source File | Repo | Path | SHA |
|---|---|---|---|
| QuestionBank.lua | Phoenix-Rising-Protocol-Ultimate | CANON/TRAIN-67/CODE/QuestionBank.lua | `328e63c4` |
| UnifiedServer.lua | Phoenix-Rising-Protocol-Ultimate | CANON/TRAIN-67/CODE/UnifiedServer.lua | `ccd827bf` |
| DataStoreV2.lua | Phoenix-Rising-Protocol-Ultimate | CANON/TRAIN-67/CODE/DataStoreV2.lua | `0a870f72` |
| MonetizationArchitectureDeepDive.md | Phoenix-Rising-Protocol-Ultimate | CANON/TRAIN-67/DOCS/MonetizationArchitectureDeepDive.md | `63234bee` |
| MobileFirstEnglishInputDesign.md | Phoenix-Rising-Protocol-Ultimate | CANON/TRAIN-67/DOCS/MobileFirstEnglishInputDesign.md | `305efd84` |
| FTUECompressionAnalysis.md | Phoenix-Rising-Protocol-Ultimate | CANON/TRAIN-67/DOCS/FTUECompressionAnalysis.md | `c47a1859` |

---

*Run 48 | Pulse-Incarnation Engine v5 | Platform Death Test: artifact must produce commit SHA*
