# BATTLE STAGE 7 — DATA PERSISTENCE TORTURE TEST

**Date:** 2026-03-26
**Auditor:** Ne0 (CHAT 000)
**Scope:** All DataStore usage across 24 modules

---

## DATASTORE INVENTORY

| Store Name | Type | Used By | Active? |
|-----------|------|---------|--------|
| `BrainrotPlayerData_v1` | DataStore | MainServer_v2 | ⚠️ Reads/writes but game doesn't use data |
| `BrainrotLeaderboard_v1` | OrderedDataStore | MainServer_v2 (declared) | ❌ Never used |
| `FTUE_Completion_v1` | DataStore | FTUEManager | ❌ FTUEManager never initialized |
| `DailyRewards_v1` | DataStore | DailyRewards | ❌ DailyRewards never initialized |
| `Economy_v1` | DataStore | EconomyManager | ❌ EconomyManager never initialized |
| `BattlePass_v1` | DataStore | BattlePass | ❌ Never initialized |
| `Guilds_v1` | DataStore | GuildManager | ❌ Never initialized |
| `Referrals_v1` | DataStore | ReferralSystem | ❌ Never initialized |
| `Leaderboard_v1` | OrderedDataStore | LeaderboardManager | ❌ Never initialized |
| `Challenges_v1` | DataStore | ChallengeManager | ❌ Never initialized |
| `Prestige_v1` | DataStore | PrestigeManager | ❌ Never initialized |
| `Trades_v1` | DataStore | TradeManager | ❌ Never initialized |

**12 DataStores declared. 1 active (partially). 11 dormant.**

---

## TORTURE TEST: BrainrotPlayerData_v1

This is the ONLY active DataStore. Let's break it.

### TEST 1: Data Schema Migration

```lua
local DEFAULT_PLAYER_DATA = {
    Version = 1,
    Class = "Sigma",
    Day = 1, Wave = 1,
    ScrapMetal = 0, BrainCells = 0, SurvivorTokens = 0,
    XP = 0, Level = 1, Kills = 0, Deaths = 0,
    BossesDefeated = {},
    CodexUnlocked = { "ENM-001", "LOC-001" },
    Inventory = {},
    Settings = { MusicVolume = 0.5, SFXVolume = 0.8 },
}
```

**Migration path:** When loading, `for k, v in pairs(DEFAULT_PLAYER_DATA)` backfills missing keys. ✅ New fields auto-populate.

**BUT:** What about removed/renamed fields? If Version 2 removes `SurvivorTokens` and adds `Tokens`, the old `SurvivorTokens` persists forever as dead weight. No cleanup mechanism.

**AND:** What about type changes? If `Kills` changes from number to table (e.g., per-enemy-type tracking), the backfill silently keeps the old number. No type validation.

**VERDICT:** 🟡 Backfill works for additions. No handling for removals or type changes.

### TEST 2: Concurrent Session Data Corruption

**Scenario:** Player joins Server A. Player joins Server B (same Roblox account, different game server).

```
Time 0: Player joins Server A → loads data from DataStore
Time 1: Player joins Server B → loads SAME data from DataStore
Time 2: Server A saves (Kills = 10)
Time 3: Server B saves (Kills = 5) → OVERWRITES Server A's save
```

**Defense:** MainServer_v2 uses `UpdateAsync` with a callback. BUT the callback is:
```lua
PlayerDataStore:UpdateAsync(key, function(oldData)
    return data  -- ALWAYS overwrites with session data
end)
```

This is effectively SetAsync with extra steps. The UpdateAsync callback should MERGE, not replace.

**RESULT:** 🔴 CRITICAL — Multi-server data loss. Last writer wins.

**Fix:** Use UpdateAsync properly:
```lua
PlayerDataStore:UpdateAsync(key, function(oldData)
    if not oldData then return data end
    -- Merge: take the higher values
    oldData.Kills = math.max(oldData.Kills or 0, data.Kills or 0)
    oldData.Day = math.max(oldData.Day or 1, data.Day or 1)
    -- etc.
    return oldData
end)
```

### TEST 3: Data Size Limits

Roblox DataStore limit: **4 MB per key.**

Current schema estimate:
- Base data: ~500 bytes
- Inventory (empty): ~50 bytes
- Inventory (full, 500 items): ~25 KB
- CodexUnlocked (all ~200 entries): ~2 KB
- BossesDefeated (all bosses): ~500 bytes

**Total estimated max: ~30 KB — well within limits.** ✅ SAFE.

But: If `Inventory` stores full item objects instead of IDs, size could explode. Current schema uses empty table, so format is undefined.

### TEST 4: BindToClose Reliability

```lua
game:BindToClose(function()
    local finished = false
    task.spawn(function()
        saveAllPlayers()
        finished = true
    end)
    local start = os.clock()
    while not finished and (os.clock() - start) < 25 do
        task.wait(0.1)
    end
end)
```

**Analysis:**
- ✅ 25s timeout (Roblox gives 30s)
- ✅ Spawns save in parallel
- ⚠️ `saveAllPlayers()` spawns individual saves — if one hangs, others still run
- ⚠️ No logging of which saves completed vs timed out

**VERDICT:** 🟢 ADEQUATE — The implementation is reasonable. Could add per-player completion tracking.

### TEST 5: GetAsync Failure on Join

```lua
local success, data = pcall(function()
    return PlayerDataStore:GetAsync(key)
end)

if success and data then
    -- load existing
else
    -- create new (deepCopy)
end
```

**Scenario:** DataStore is throttled or down. `success = false`.

**Result:** Player gets DEFAULT_PLAYER_DATA. If they play and then the save succeeds, their previous progress is OVERWRITTEN with fresh data.

**VERDICT:** 🔴 CRITICAL — DataStore failure = progress wipe. Should:
1. Retry GetAsync 2-3 times with backoff
2. If all retries fail, put player in read-only mode
3. Never save default data on top of existing data without confirmation

### TEST 6: Auto-Save During Server Lag

Auto-save runs every 300s (5 minutes). If server is lagging heavily:
- DataStore calls may time out
- Multiple auto-saves could queue up
- No dedup mechanism

**Current defense:** pcall around saveAllPlayers. If it fails, it warns and continues.

**VERDICT:** 🟢 ADEQUATE — Failures are caught and logged. No cascading risk.

---

## CROSS-MODULE DATA CONFLICTS

If all 12 DataStores were active simultaneously:

| Module A | Module B | Shared Data | Conflict Risk |
|----------|----------|-------------|---------------|
| MainServer | EconomyManager | Currency balances | 🔴 Both could write |
| MainServer | BattlePass | XP totals | 🔴 Both could write |
| MainServer | PrestigeManager | Level/Day | 🔴 Both could write |
| EconomyManager | GachaManager | Currency | 🟡 Sequential if designed right |
| EconomyManager | TradeManager | Inventory | 🟡 Needs atomic transactions |

**The root problem:** Multiple modules write to different DataStore keys for data that should be in ONE canonical player record.

**Fix:** Single `PlayerData` DataStore. All modules read/write through a centralized PlayerDataManager. No module directly touches DataStore.

---

## FAILURE MATRIX

| # | Failure | Severity | Fix |
|---|---------|----------|-----|
| D1 | UpdateAsync overwrites instead of merging | 🔴 CRITICAL | Merge logic in callback |
| D2 | GetAsync failure → progress wipe | 🔴 CRITICAL | Retry + read-only fallback |
| D3 | No schema migration for removed/renamed fields | 🟡 HIGH | Version-based migration |
| D4 | 12 separate DataStores, no central authority | 🟡 HIGH | Unified PlayerDataManager |
| D5 | ProcessReceipt data loss (from Stage 5) | 🔴 CRITICAL | Confirm save before PurchaseGranted |
| D6 | Leaderboard OrderedDataStore never written | 🟢 LOW | Wire when leaderboard ships |
| D7 | No data backup/export mechanism | 🟡 HIGH | Periodic backup to alternate key |

---

## VERDICT

**The DataStore layer has the bones right (pcall, UpdateAsync, BindToClose, deepCopy) but the implementation has 2 critical flaws that will cause real player data loss:**

1. Multi-server overwrites (UpdateAsync used incorrectly)
2. DataStore-down = progress wipe (no retry, no protection)

Both are fixable with <50 lines of code each.

---

*Stage 7 Complete. Artifact class: 🏦 VAULT*
