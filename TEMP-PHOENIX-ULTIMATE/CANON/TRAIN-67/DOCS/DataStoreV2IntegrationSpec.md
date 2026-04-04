# DataStoreV2 Integration Specification — TRAIN-67 Roblox Experience
## Version: 1.0 | Artifact Class: 🔨 BUILD | Run: 60 | Date: 2026-03-27

---

> **Canon Source:** Synthesized from 8 cross-repo source files:
> - `DataStoreV2.lua` (SHA `0a870f72`) — Current v2 schema + session locking + migration system
> - `EloManager.lua` (SHA `5d939298`) — v2→v3 migration helpers, Elo persistence fields
> - `CombatEnglishBridgeSpec.md` (SHA `e29bbd30`) — Combat stats requiring persistence
> - `CosmeticTrinityIntegrationSpec.md` (SHA `c91097ff`) — Cosmetic/Aura persistence model
> - `EnglishRewardsManagerSpec.md` (SHA `f442ac19`) — English XP/streak persistence
> - `GuildManagerIntegrationSpec.md` (SHA `79c01d2e`) — Guild war stats persistence
> - `FTUEController.lua` (SHA `1a8475b0`) — FTUE completion state persistence
> - `ServerArchitectureQuestionBankScaling.md` (SHA `f310ea1f`) — DataStore budget analysis
>
> **Law:** If data is lost, players leave. Players leaving = lost revenue. DataStore is the STONE layer.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Current Schema — v2](#2-current-schema--v2)
3. [Target Schema — v3](#3-target-schema--v3)
4. [Migration: v2 → v3](#4-migration-v2--v3)
5. [Per-System Integration Map](#5-per-system-integration-map)
6. [Read/Write Patterns per Module](#6-readwrite-patterns-per-module)
7. [Session Lock Architecture](#7-session-lock-architecture)
8. [DataStore Budget & Throttle Management](#8-datastore-budget--throttle-management)
9. [Serialization Rules](#9-serialization-rules)
10. [Failure Modes & Recovery](#10-failure-modes--recovery)
11. [Testing Matrix](#11-testing-matrix)
12. [Cross-Reference Index](#12-cross-reference-index)

---

## 1. System Overview

DataStoreV2 is the **single source of truth** for all persistent player state in "Survive a Brainrot." Every system that needs to persist data between sessions routes through DataStoreV2 — there is NO secondary data layer.

### Design Principles

1. **Session-locked writes** — Only the owning server can write. Prevents duplication exploits.
2. **Read-modify-write via UpdateAsync** — Never use SetAsync. Always merge.
3. **Deep copy on read** — No reference mutation. All reads return clones.
4. **Retry with exponential backoff** — Max 3 retries, 1s→2s→4s→8s cap.
5. **Schema migration on load** — Every load runs `migrateData()`. Old data auto-upgrades.
6. **Auto-save every 120s** — Plus save on player leave + server shutdown.
7. **Cumulative stats merge on save** — `math.max()` for lifetime totals prevents rollback exploits.

### Data Flow

```
Player Joins → DataStoreV2.LoadPlayer() → migrateData() → deep copy to cache
                                                              ↓
              ┌─── EloManager.InitPlayer() ←──────────────── cache read
              ├─── EnglishRewardsManager.Init() ←──────────── cache read
              ├─── CosmeticManager.LoadInventory() ←────────── cache read
              ├─── GuildManager.LoadMembership() ←──────────── cache read
              ├─── BattlePass.LoadProgress() ←──────────────── cache read
              └─── DailyRewards.CheckLogin() ←──────────────── cache read
                                                              ↓
              (gameplay: modules write to cache via SetPlayerField/IncrementField)
                                                              ↓
              Auto-save tick (120s) → DataStoreV2.SavePlayer() → UpdateAsync → DataStore
              Player leaves → SavePlayer() + CleanupPlayer()
              Server shutdown → _saveAll() → BindToClose
```

---

## 2. Current Schema — v2

Source: `DataStoreV2.lua` DEFAULT_DATA (SHA `0a870f72`)

```lua
DEFAULT_DATA = {
    schemaVersion = 2,
    -- Progress
    currentTier = 1,              -- int (1-5, Mouse→Tiger)
    highestWave = 0,              -- int
    totalQuestionsAnswered = 0,   -- int
    totalCorrect = 0,             -- int
    bestCombo = 0,                -- int
    totalKills = 0,               -- int
    bossKills = 0,                -- int
    -- Economy
    englishCoins = 0,             -- int (soft currency)
    premiumGems = 0,              -- int (hard currency)
    lifetimeCoins = 0,            -- int (cumulative, never decreases)
    lifetimeGems = 0,             -- int (cumulative, never decreases)
    -- Vocabulary
    vocabularyMastered = {},      -- { [wordId] = masteryCount }
    vocabularyStruggling = {},    -- { [wordId] = failCount }
    -- FTUE
    ftueComplete = false,         -- bool
    -- Cosmetics
    ownedCosmetics = {},          -- { [cosmeticId] = true }
    equippedCosmetics = {},       -- { [slot] = cosmeticId }
    -- Daily Rewards
    lastLoginDay = 0,             -- int (day number)
    loginStreak = 0,              -- int
    claimedDays = {},             -- { [dayNumber] = true }
    -- Battle Pass
    battlePassLevel = 0,          -- int
    battlePassXP = 0,             -- int
    battlePassPurchased = false,  -- bool
    -- Guild
    guildId = "",                 -- string (guild identifier)
    -- Stats
    totalPlayTime = 0,            -- int (seconds)
    sessionsPlayed = 0,           -- int
    firstJoinTime = 0,            -- int (os.time)
    lastSaveTime = 0,             -- int (os.time)
    -- Session Lock
    sessionLockId = "",           -- GUID
    sessionLockTime = 0,          -- int (os.time)
}
```

**v2 size estimate:** ~1.2KB base, up to ~8KB with full vocabulary maps (4MB DataStore limit per key = safe).

---

## 3. Target Schema — v3

v3 adds fields required by EloManager, CombatEnglishBridge, CosmeticTrinity (English Auras), and GuildManager.

### New Fields (v3 additions)

```lua
-- EloManager fields (from EloManager.GetSchemaV3Defaults())
eloRating = 1000,                -- int (player Elo rating, 400-2400 range)
eloHistory = {},                 -- array of { elo, time, questionId, correct }
questionsAnsweredForElo = 0,     -- int (K-factor decay counter)
questionFormatStats = {},        -- { [format] = { attempted, correct } }
weakCategories = {},             -- { [category] = failCount }
preferredFormat = nil,           -- string|nil (auto-detected preference)

-- English Aura fields (from CosmeticTrinityIntegrationSpec §5)
englishAuraTier = 0,             -- int (0-6, earned through English XP)
englishAuraXP = 0,               -- int (XP towards next aura tier)
lifetimeEnglishXP = 0,           -- int (cumulative, never decreases)

-- English Streak (expanded from DailyRewards)
englishStreak = 0,               -- int (consecutive days with English activity)
lastEnglishActivityDay = 0,      -- int (day number of last English engagement)
bestEnglishStreak = 0,           -- int (all-time best streak)

-- Combat Stats (from CombatEnglishBridgeSpec §14)
totalCombatVictories = 0,        -- int
totalCombatDefeats = 0,          -- int
bestBossTime = {},               -- { [bossId] = bestTimeSeconds }
combatCorrectRate = 0,           -- float (rolling average, last 50 combats)
highestCombatCombo = 0,          -- int
totalFreeRevivesUsed = 0,        -- int
totalFreeRevivesEarned = 0,      -- int

-- Guild War Stats (from GuildManagerIntegrationSpec §8)
guildWarParticipations = 0,      -- int
guildWarWins = 0,                -- int
guildWarMVPCount = 0,            -- int
lifetimeGuildWarEnglishScore = 0,-- int

-- Referral (from ReferralSystem.lua)
referralCode = "",               -- string (player's referral code)
referredBy = "",                 -- string (referral code of inviter)
referralRewardsClaimed = {},     -- { [milestone] = true }

-- Monetization (from MonetizationOrchestratorSpec)
totalRobuxSpent = 0,             -- int (server-tracked purchase total)
purchaseHistory = {},            -- array of { productId, time, robux }
lastPurchaseTime = 0,            -- int (os.time)
revivesPurchased = 0,            -- int
```

### Full v3 DEFAULT_DATA

```lua
local DEFAULT_DATA_V3 = {
    schemaVersion = 3,

    -- === PROGRESS (v2) ===
    currentTier = 1,
    highestWave = 0,
    totalQuestionsAnswered = 0,
    totalCorrect = 0,
    bestCombo = 0,
    totalKills = 0,
    bossKills = 0,

    -- === ECONOMY (v2) ===
    englishCoins = 0,
    premiumGems = 0,
    lifetimeCoins = 0,
    lifetimeGems = 0,

    -- === VOCABULARY (v2) ===
    vocabularyMastered = {},
    vocabularyStruggling = {},

    -- === FTUE (v2, expanded) ===
    ftueComplete = false,
    ftueStep = 0,             -- NEW v3: last completed FTUE step (0-8)
    ftueStartTime = 0,        -- NEW v3: when FTUE began

    -- === COSMETICS (v2) ===
    ownedCosmetics = {},
    equippedCosmetics = {},

    -- === DAILY REWARDS (v2) ===
    lastLoginDay = 0,
    loginStreak = 0,
    claimedDays = {},

    -- === BATTLE PASS (v2) ===
    battlePassLevel = 0,
    battlePassXP = 0,
    battlePassPurchased = false,

    -- === GUILD (v2) ===
    guildId = "",

    -- === STATS (v2) ===
    totalPlayTime = 0,
    sessionsPlayed = 0,
    firstJoinTime = 0,
    lastSaveTime = 0,

    -- === SESSION LOCK (v2) ===
    sessionLockId = "",
    sessionLockTime = 0,

    -- === ELO (NEW v3) ===
    eloRating = 1000,
    eloHistory = {},
    questionsAnsweredForElo = 0,
    questionFormatStats = {},
    weakCategories = {},
    preferredFormat = "",

    -- === ENGLISH AURA (NEW v3) ===
    englishAuraTier = 0,
    englishAuraXP = 0,
    lifetimeEnglishXP = 0,

    -- === ENGLISH STREAK (NEW v3) ===
    englishStreak = 0,
    lastEnglishActivityDay = 0,
    bestEnglishStreak = 0,

    -- === COMBAT STATS (NEW v3) ===
    totalCombatVictories = 0,
    totalCombatDefeats = 0,
    bestBossTime = {},
    combatCorrectRate = 0,
    highestCombatCombo = 0,
    totalFreeRevivesUsed = 0,
    totalFreeRevivesEarned = 0,

    -- === GUILD WAR (NEW v3) ===
    guildWarParticipations = 0,
    guildWarWins = 0,
    guildWarMVPCount = 0,
    lifetimeGuildWarEnglishScore = 0,

    -- === REFERRAL (NEW v3) ===
    referralCode = "",
    referredBy = "",
    referralRewardsClaimed = {},

    -- === MONETIZATION (NEW v3) ===
    totalRobuxSpent = 0,
    purchaseHistory = {},
    lastPurchaseTime = 0,
    revivesPurchased = 0,
}
```

**v3 size estimate:** ~2KB base, up to ~15KB with full maps. Well within 4MB limit.

---

## 4. Migration: v2 → v3

```lua
local function migrateData(data)
    if not data then return deepCopy(DEFAULT_DATA_V3) end
    local version = data.schemaVersion or 1

    -- v1 → v2 (existing, unchanged)
    if version < 2 then
        data.battlePassLevel = data.battlePassLevel or 0
        data.battlePassXP = data.battlePassXP or 0
        data.battlePassPurchased = data.battlePassPurchased or false
        data.guildId = data.guildId or ""
        data.ownedCosmetics = data.ownedCosmetics or {}
        data.equippedCosmetics = data.equippedCosmetics or {}
        data.lifetimeCoins = data.lifetimeCoins or data.englishCoins or 0
        data.lifetimeGems = data.lifetimeGems or data.premiumGems or 0
        data.schemaVersion = 2
    end

    -- v2 → v3 (NEW)
    if version < 3 then
        -- EloManager fields
        local eloDefaults = EloManager.GetSchemaV3Defaults()
        for key, val in pairs(eloDefaults) do
            if data[key] == nil then data[key] = deepCopy(val) end
        end

        -- Backfill: if player already answered questions, seed Elo from totalCorrect
        if (data.totalQuestionsAnswered or 0) > 0 then
            data.questionsAnsweredForElo = data.totalQuestionsAnswered
            -- Estimate starting Elo from correct rate
            local rate = (data.totalCorrect or 0) / data.totalQuestionsAnswered
            if rate > 0.8 then
                data.eloRating = 1500 -- Cat-B
            elseif rate > 0.6 then
                data.eloRating = 1200 -- Cat-A
            else
                data.eloRating = 1000 -- Mouse-B (default)
            end
        end

        -- English Aura (from CosmeticTrinity — backfill from tier)
        data.englishAuraTier = data.englishAuraTier or 0
        data.englishAuraXP = data.englishAuraXP or 0
        data.lifetimeEnglishXP = data.lifetimeEnglishXP or 0

        -- English Streak (inherit from loginStreak if available)
        data.englishStreak = data.englishStreak or data.loginStreak or 0
        data.lastEnglishActivityDay = data.lastEnglishActivityDay or data.lastLoginDay or 0
        data.bestEnglishStreak = data.bestEnglishStreak or data.loginStreak or 0

        -- Combat Stats
        data.totalCombatVictories = data.totalCombatVictories or 0
        data.totalCombatDefeats = data.totalCombatDefeats or 0
        data.bestBossTime = data.bestBossTime or {}
        data.combatCorrectRate = data.combatCorrectRate or 0
        data.highestCombatCombo = data.highestCombatCombo or data.bestCombo or 0
        data.totalFreeRevivesUsed = data.totalFreeRevivesUsed or 0
        data.totalFreeRevivesEarned = data.totalFreeRevivesEarned or 0

        -- Guild War
        data.guildWarParticipations = data.guildWarParticipations or 0
        data.guildWarWins = data.guildWarWins or 0
        data.guildWarMVPCount = data.guildWarMVPCount or 0
        data.lifetimeGuildWarEnglishScore = data.lifetimeGuildWarEnglishScore or 0

        -- FTUE expanded
        data.ftueStep = data.ftueStep or (data.ftueComplete and 8 or 0)
        data.ftueStartTime = data.ftueStartTime or 0

        -- Referral
        data.referralCode = data.referralCode or ""
        data.referredBy = data.referredBy or ""
        data.referralRewardsClaimed = data.referralRewardsClaimed or {}

        -- Monetization
        data.totalRobuxSpent = data.totalRobuxSpent or 0
        data.purchaseHistory = data.purchaseHistory or {}
        data.lastPurchaseTime = data.lastPurchaseTime or 0
        data.revivesPurchased = data.revivesPurchased or 0

        data.schemaVersion = 3
    end

    -- Fill any missing keys from defaults
    for key, defaultVal in pairs(DEFAULT_DATA_V3) do
        if data[key] == nil then
            data[key] = deepCopy(defaultVal)
        end
    end

    return data
end
```

### Migration Safety Rules

1. **Never delete v2 fields** — Only add. Old clients still read old fields.
2. **Backfill from existing data** — Don't leave zeros when better estimates exist.
3. **One-shot migration** — `schemaVersion` check ensures migration runs once per player.
4. **Atomic via UpdateAsync** — Migration + session lock in single UpdateAsync call.
5. **Tested rollback path** — If v3 code is reverted, v2 code ignores unknown fields (safe).

---

## 5. Per-System Integration Map

| System | Reads (on load) | Writes (during play) | Writes (on save) |
|--------|-----------------|---------------------|-------------------|
| **EloManager** | `eloRating`, `eloHistory`, `questionsAnsweredForElo`, `questionFormatStats`, `weakCategories` | Updates via `ProcessAnswer()` → mutates cache fields | `GetPersistFields()` → merge into cache |
| **EnglishRewardsManager** | `englishAuraTier`, `englishAuraXP`, `englishStreak`, `lastEnglishActivityDay`, `lifetimeEnglishXP` | Increments XP/streak on correct answers | Direct field writes via `SetPlayerField` |
| **CombatController** | `highestCombatCombo`, `bestBossTime` | `IncrementField` on victories/defeats/kills | Best-time merge on boss kill |
| **CosmeticManager** | `ownedCosmetics`, `equippedCosmetics`, `englishAuraTier` | Add/equip on purchase/unlock | Inventory writes |
| **GuildManager** | `guildId`, `guildWarParticipations`, `guildWarWins` | Increment on war events | Stats writes |
| **BattlePass** | `battlePassLevel`, `battlePassXP`, `battlePassPurchased` | XP increments (50 per correct, 25 per wave) | Level/XP writes |
| **DailyRewards** | `lastLoginDay`, `loginStreak`, `claimedDays` | Claim reward → mark day | Streak + claimed writes |
| **FTUEController** | `ftueComplete`, `ftueStep` | Step progression events | `ftueComplete = true` on completion |
| **MonetizationOrchestrator** | `totalRobuxSpent`, `purchaseHistory` | Purchase recording | Receipt-verified writes only |
| **ReferralSystem** | `referralCode`, `referredBy`, `referralRewardsClaimed` | Code generation, milestone claims | Code + claim writes |

---

## 6. Read/Write Patterns per Module

### 6.1 EloManager Integration

```lua
-- On player join (after DataStoreV2.LoadPlayer)
local playerData = DataStoreV2.GetPlayerData(player)
EloManager.InitPlayer(player, playerData)

-- After each question answered
local result = EloManager.ProcessAnswer(player, questionId, isCorrect, responseTime)
-- result.newPlayerElo → combat damage multiplier
-- result.tierInfo → UI tier display

-- On player save (before DataStoreV2.SavePlayer)
local eloFields = EloManager.GetPersistFields(player)
if eloFields then
    for field, value in pairs(eloFields) do
        DataStoreV2.SetPlayerField(player, field, value)
    end
end
```

### 6.2 English Rewards Manager Integration

```lua
-- On correct answer in any context (combat, practice, quiz)
DataStoreV2.IncrementField(player, "lifetimeEnglishXP", xpAmount)
DataStoreV2.IncrementField(player, "englishAuraXP", xpAmount)

-- Check aura tier threshold
local data = DataStoreV2.GetPlayerData(player)
if data.englishAuraXP >= AURA_TIER_THRESHOLDS[data.englishAuraTier + 1] then
    DataStoreV2.IncrementField(player, "englishAuraTier", 1)
    DataStoreV2.SetPlayerField(player, "englishAuraXP", 0) -- Reset XP for next tier
end

-- Daily English streak (on first English activity of the day)
local today = getDayNumber()
if data.lastEnglishActivityDay ~= today then
    if data.lastEnglishActivityDay == today - 1 then
        DataStoreV2.IncrementField(player, "englishStreak", 1)
    else
        DataStoreV2.SetPlayerField(player, "englishStreak", 1) -- Reset
    end
    DataStoreV2.SetPlayerField(player, "lastEnglishActivityDay", today)
    -- Update best streak
    local current = DataStoreV2.GetPlayerData(player)
    if current.englishStreak > current.bestEnglishStreak then
        DataStoreV2.SetPlayerField(player, "bestEnglishStreak", current.englishStreak)
    end
end
```

### 6.3 Combat Stats Integration

```lua
-- Post-combat (from CombatController via RewardBridge)
DataStoreV2.IncrementField(player, "totalCombatVictories", 1)
DataStoreV2.IncrementField(player, "totalKills", context.killsThisFight)

-- Best combo update
local data = DataStoreV2.GetPlayerData(player)
if context.maxComboThisFight > data.highestCombatCombo then
    DataStoreV2.SetPlayerField(player, "highestCombatCombo", context.maxComboThisFight)
end
if context.maxComboThisFight > data.bestCombo then
    DataStoreV2.SetPlayerField(player, "bestCombo", context.maxComboThisFight)
end

-- Boss time record
if context.enemy.isBoss and context.won then
    local bossId = context.enemy.type
    local fightTime = context.combatDuration
    local bestTimes = data.bestBossTime or {}
    if not bestTimes[bossId] or fightTime < bestTimes[bossId] then
        bestTimes[bossId] = fightTime
        DataStoreV2.SetPlayerField(player, "bestBossTime", bestTimes)
    end
end

-- Rolling combat correct rate (exponential moving average)
local alpha = 0.05 -- smoothing factor
local combatRate = context.questionsCorrect / math.max(1, context.questionsAnswered)
local oldRate = data.combatCorrectRate or 0
local newRate = alpha * combatRate + (1 - alpha) * oldRate
DataStoreV2.SetPlayerField(player, "combatCorrectRate", newRate)
```

### 6.4 Monetization Integration (Server-Authoritative)

```lua
-- ONLY called from ReceiptRouter after Roblox receipt verification
function MonetizationOrchestrator:RecordPurchase(player, productId, robuxAmount)
    DataStoreV2.IncrementField(player, "totalRobuxSpent", robuxAmount)
    DataStoreV2.IncrementField(player, "lastPurchaseTime", os.time())

    -- Append to purchase history (capped at 100 entries to control size)
    local data = DataStoreV2.GetPlayerData(player)
    local history = data.purchaseHistory or {}
    table.insert(history, {
        productId = productId,
        time = os.time(),
        robux = robuxAmount,
    })
    -- Cap at 100 entries (FIFO)
    while #history > 100 do
        table.remove(history, 1)
    end
    DataStoreV2.SetPlayerField(player, "purchaseHistory", history)

    if productId == "revive_75" or productId == "premium_revive_125" then
        DataStoreV2.IncrementField(player, "revivesPurchased", 1)
    end
end
```

---

## 7. Session Lock Architecture

### Current Design (v2, unchanged for v3)

```
Server A: LoadPlayer → UpdateAsync → set sessionLockId = GUID_A
Server B: LoadPlayer → UpdateAsync → sees GUID_A lock
    If lock age < 600s: warn but proceed (teleport/rejoin case)
    If lock age >= 600s: override lock (abandoned session)
Server A: SavePlayer → UpdateAsync → checks sessionLockId == GUID_A → saves
Server B: SavePlayer → UpdateAsync → checks sessionLockId == GUID_B → saves
```

### Why Session Locking Matters for v3

With EloManager and combat stats, **duplication exploits** become more dangerous:
- Duplicate Elo inflation could let players access Tiger-tier questions they shouldn't see
- Duplicate coin grants break economy
- Duplicate purchase history could trigger false refund flags

**Rule:** UpdateAsync ALWAYS checks `sessionLockId` before writing. If another session owns the lock and it's fresh (< 600s), write is ABORTED.

---

## 8. DataStore Budget & Throttle Management

Source: `ServerArchitectureQuestionBankScaling.md` §4.7

### Roblox DataStore Limits

| Limit | Value | Impact |
|-------|-------|--------|
| Request rate | 60 + 10×players req/min | ~200 req/min at 14 players |
| Data per key | 4MB | v3 max ~15KB = safe |
| SetAsync/UpdateAsync | 6s cooldown per key | Auto-save at 120s = well within |
| GetAsync | No cooldown | Used only on join |

### Budget Allocation per Player

| Operation | Frequency | Requests/min |
|-----------|-----------|-------------|
| Auto-save (UpdateAsync) | Every 120s | 0.5/player |
| Load (UpdateAsync) | On join | One-time |
| Emergency save (leave/shutdown) | On event | Burst |

At 50 players: 25 req/min for auto-save vs ~560 available = **4.5% utilization**.

### Analytics Batching (from EloManager)

EloManager buffers analytics events and flushes every 60s (configurable). This prevents per-question DataStore writes:

```
Question answered → buffer event in memory
Every 60s → flush buffer to DataStore (single write with all events)
```

**Rule:** NO module writes directly to DataStore on every question/answer. All high-frequency events buffer and batch.

---

## 9. Serialization Rules

### Table Fields (vocabularyMastered, purchaseHistory, etc.)

- **Max entries:** 1000 for vocabulary maps, 100 for purchase history
- **FIFO pruning:** When max exceeded, remove oldest entries
- **Keys:** Always strings (Roblox JSON serializer requirement)
- **Values:** Primitives only (no nested tables beyond 2 levels)

### Elo History

- **Max entries:** 20 (CONFIG.ELO_HISTORY_MAX in EloManager)
- **Entry structure:** `{ elo = int, time = int, questionId = string, correct = bool }`
- **Size per entry:** ~60 bytes → 20 entries = ~1.2KB

### Best Boss Times

- **Keys:** boss type string (e.g., "brainrot_overlord")
- **Values:** integer (seconds)
- **Max entries:** bounded by boss count (< 20)

---

## 10. Failure Modes & Recovery

| Failure | Detection | Recovery | Data Risk |
|---------|-----------|----------|-----------|
| DataStore unavailable (outage) | `pcall` returns false on Init | Cache operates in memory, warn player, retry saves | **High** — session data lost if server crashes |
| Save fails (throttle) | Retry returns false after 3 attempts | Log CRITICAL, continue caching, retry on next auto-save | **Medium** — max 120s of data at risk |
| Load fails (corruption) | `migrateData` returns nil | Create fresh DEFAULT_DATA, log incident | **Low** — player starts fresh but no data loss for others |
| Session lock conflict | Lock check in UpdateAsync | Log warning, proceed with override if lock > 600s | **Low** — brief dupe window possible |
| Schema migration error | `pcall` around migration | Return unmigrated data with missing fields filled from defaults | **Low** — degraded but functional |
| Server crash (no BindToClose) | Auto-save didn't run | Last auto-save is recovery point, max 120s data loss | **Medium** — bounded by auto-save interval |

### Critical Rule: Never Lose Purchase Data

Monetization writes (`totalRobuxSpent`, `purchaseHistory`) use **immediate save** — they don't wait for auto-save:

```lua
function MonetizationOrchestrator:RecordPurchase(player, ...)
    -- ... record fields ...
    -- IMMEDIATE SAVE — don't wait for auto-save timer
    task.spawn(function()
        DataStoreV2.SavePlayer(player)
    end)
end
```

---

## 11. Testing Matrix

| Test | Scope | Method |
|------|-------|--------|
| v2 → v3 migration (new player) | No existing data → full defaults | Unit test |
| v2 → v3 migration (existing v2 player) | All v2 fields preserved, v3 fields added | Unit test |
| v2 → v3 Elo backfill (high correct rate) | Player with 80%+ correct → Elo 1500 | Unit test |
| v2 → v3 Elo backfill (low correct rate) | Player with < 60% correct → Elo 1000 | Unit test |
| Session lock prevents dual-write | Two servers load same player | Integration test |
| Vocabulary map pruning at 1000 | Add 1001st entry → oldest removed | Unit test |
| Purchase history FIFO at 100 | Add 101st purchase → oldest removed | Unit test |
| Auto-save under throttle | Simulate DataStore throttle, verify retry | Integration test |
| BindToClose saves all players | Simulate server shutdown with 50 players | Load test |
| EloManager GetPersistFields round-trip | Save → Load → compare Elo state | Integration test |
| Schema forward compatibility | v3 data loaded by v2 code → no crash | Regression test |
| Size budget check at max data | Full vocab (1000) + full history + all fields < 4MB | Unit test |

---

## 12. Cross-Reference Index

### 12.1 Related Specs

| Spec | Path | Relevance |
|------|------|-----------|
| CombatEnglishBridgeSpec | `CANON/TRAIN-67/DOCS/CombatEnglishBridgeSpec.md` | §12: Reward pipeline writes, §14: Combat analytics events |
| EnglishRewardsManagerSpec | `CANON/TRAIN-67/DOCS/EnglishRewardsManagerSpec.md` | §3: XP persistence, §4: Streak persistence |
| CosmeticTrinityIntegrationSpec | `CANON/TRAIN-67/DOCS/CosmeticTrinityIntegrationSpec.md` | §5: English Aura tier, §10: BattlePass XP |
| GuildManagerIntegrationSpec | `CANON/TRAIN-67/DOCS/GuildManagerIntegrationSpec.md` | §6-8: Guild war stats |
| FTUEImplementationSpec | `CANON/TRAIN-67/DOCS/FTUEImplementationSpec.md` | §3: FTUE completion state |
| MonetizationOrchestratorSpec | `CANON/TRAIN-67/DOCS/MonetizationOrchestratorSpec.md` | §4: Purchase recording |
| ServerArchitectureQuestionBankScaling | `CANON/TRAIN-67/DOCS/ServerArchitectureQuestionBankScaling.md` | §4.7: DataStore budget |

### 12.2 Related Code

| Module | Path | DataStore Integration |
|--------|------|----------------------|
| DataStoreV2.lua | `CANON/TRAIN-67/CODE/DataStoreV2.lua` | Core persistence module (this spec's target) |
| EloManager.lua | `CANON/TRAIN-67/CODE/EloManager.lua` | `GetSchemaV3Defaults()`, `GetPersistFields()`, `InitPlayer()` |
| RewardBridge.lua | `CANON/TRAIN-67/CODE/RewardBridge.lua` | Post-combat reward writes to DataStore |
| FTUEController.lua | `CANON/TRAIN-67/CODE/FTUEController.lua` | `ftueComplete`, `ftueStep` writes |
| GuildManager.lua | `CANON/TRAIN-67/CODE/GuildManager.lua` | Guild membership + war stats writes |
| BattlePass.lua | `CANON/TRAIN-67/CODE/BattlePass.lua` | Level/XP writes |
| DailyRewards.lua | `CANON/TRAIN-67/CODE/DailyRewards.lua` | Login streak + claimed day writes |

---

*Generated by Pulse-Incarnation Engine v5 — Run 60*
*Cross-repo synthesis: 8 source files from Phoenix-Rising-Protocol-Ultimate*
*Artifact class: 🔨 BUILD | Platform Death Test: PASS*
