# FTUE System Audit Report
**Date:** 2026-03-29 | **Auditor:** OB1 | **Pipeline Action:** #2 of 20

## Executive Summary
**Grade: C+ — Functional but fragile. Three competing modules create collision risk.**

The FTUE system has solid design (hybrid timer+step, Mouse→Tiger, solo-first) but suffers from **module duplication, wiring gaps, and missing client-side code**.

## Critical Findings

### 🔴 CRITICAL: Three Competing FTUE Modules
| Module | Version | Size | Status |
|--------|---------|------|--------|
| `FTUEController.lua` | v2.0 | 33KB | **ACTIVE** — unified hybrid timer+step |
| `FTUEManager.lua` | v1.0 | 19KB | **LEGACY** — timer-only, sequential task.wait |
| `FTUEWiring.lua` | v2.0 | 5.7KB | **LEGACY** — step-only, no timer fallback |

**Risk:** If GameMain requires both FTUEManager and FTUEController, they'll fight over player state, fire duplicate events, and double-grant rewards.

**Fix:** GameMain should ONLY require FTUEController. Remove FTUEManager and FTUEWiring from the require chain. Keep files for reference but don't load them.

### 🔴 CRITICAL: DataStore Version Mismatch
- FTUEController uses `FTUE_Completion_v2`
- FTUEManager uses `FTUE_Completion_v1`

**Risk:** A player who completed FTUE via FTUEManager (v1 store) will be treated as NEW by FTUEController (v2 store). They'll see the tutorial again.

**Fix:** FTUEController should check BOTH `v1` and `v2` DataStores in `IsNewPlayer()`:
```lua
-- Check v2 first, then fallback to v1
local store2 = DataStoreService:GetDataStore("FTUE_Completion_v2")
local store1 = DataStoreService:GetDataStore("FTUE_Completion_v1")
```

### 🔴 CRITICAL: No Client-Side FTUE Handler
All three modules fire `FTUEUpdate` RemoteEvent to the client with payloads like:
```lua
{ action = "show_overlay", prompt = "...", stepId = "welcome", ... }
```

**But there is NO client LocalScript in the CODE directory that handles these events.** The client needs an `FTUEClient.lua` (or equivalent in UnifiedClient) that:
- Listens for `FTUEUpdate` events
- Renders overlay UI (step prompt, progress bar)
- Sends `moved` signal back to server
- Handles `skip` action
- Renders VFX (purple_gold_burst)

**Without this, the entire FTUE is server-side only with no visible UI.**

### 🟡 IMPORTANT: Remote Folder Name Inconsistency
| Module | Looks for folder |
|--------|-----------------|
| FTUEController | `GameRemotes` OR `Remotes` (fallback) |
| FTUEManager | `GameRemotes` only |
| FTUEWiring | `Remotes` only |

**Risk:** If the game uses `Remotes` (as FTUEWiring expects), FTUEManager events silently fail. Vice versa.

**Fix:** Standardize on ONE folder name. FTUEController's fallback pattern is the safest — adopt it everywhere.

### 🟡 IMPORTANT: Currency Naming Inconsistency
| Module | Currency Event Field |
|--------|---------------------|
| FTUEController | `currency = "EnglishCoins"` |
| FTUEWiring | `currency = "SurvivalCoins"` |
| FTUEManager | Uses leaderstats `Coins` directly (no event) |

**Risk:** Client-side currency display may not recognize the currency name, showing wrong amounts or ignoring the update.

**Fix:** Standardize to ONE currency name. Check what EconomyManager.lua expects.

### 🟡 IMPORTANT: Step 5 (first_question) Has No Server Handler
FTUEController step 5 fires `action = "serve_tutorial_question"` to the client, but:
- No server-side code actually serves a question
- No connection to QuestionBank.lua or EnglishRewardsManager.lua
- The `SignalCorrectAnswer()` API exists but nothing calls it during FTUE

**Risk:** Step 5 will always fall through via the 15-second fallback timer. Players never actually answer a question during FTUE.

**Fix:** Either wire QuestionBank integration OR simplify step 5 to a simulated question (show question + auto-reveal answer after 3s as a teaching moment).

### 🟡 FTUEWiring Uses Player Object as Key (Not UserId)
```lua
playerFTUE[player] = { ... }  -- FTUEWiring
playerState[player.UserId] = { ... }  -- FTUEController (correct)
```

**Risk:** If FTUEWiring is active, player object references may not GC properly on disconnect. Minor memory leak risk.

**Fix:** Already fixed in FTUEController. Just don't load FTUEWiring.

### 🟢 GOOD: FTUEManager Uses Blocking task.wait Chain
FTUEManager.runFTUE() uses sequential `task.wait()` calls (1s, 3s, 4s, 22s, 15s). This means:
- If player leaves mid-FTUE, subsequent task.wait calls still execute (race window)
- Can't skip steps — must wait the full timer even if player is fast

**Already fixed in FTUEController** with hybrid timer+step approach. Just confirms FTUEManager is legacy.

## What's Working Well

| Feature | Status | Notes |
|---------|--------|-------|
| Hybrid timer+step engine | ✅ Solid | Event-driven with fallback timers — excellent pattern |
| Mouse→Tiger compliance | ✅ Good | 50% HP tutorial enemy, slower speed, close spawn |
| Solo-first design | ✅ Good | Always starts immediately, squad bonus at 2+ |
| Fallback weapon creation | ✅ Smart | Creates basic Tool if RustyPipe model missing |
| DataStore persistence | ✅ Good | pcall-wrapped, Studio-safe |
| 4Hz tick instead of per-frame | ✅ Efficient | FTUEController uses 0.25s accumulator |
| Chest auto-destroy | ✅ Good | 60s timeout prevents orphan objects |
| Player cleanup on leave | ✅ Good | PlayerRemoving clears state |
| Gospel 444 colors | ✅ Compliant | Purple/Gold/Dark/White/Red — NO BLUE |

## Recommended Fix Priority

1. **GameMain: Only require FTUEController** — remove FTUEManager/FTUEWiring from require chain
2. **Create FTUEClient.lua** — client-side handler for FTUE UI (BIGGEST GAP)
3. **Add v1 DataStore fallback** to FTUEController.IsNewPlayer()
4. **Wire Step 5** to QuestionBank or simplify to demo question
5. **Standardize remote folder name** across all modules
6. **Standardize currency name** — check EconomyManager.lua
7. **Verify GameMain_PHASE1_REVISED.lua** — which FTUE module does it actually require?

## Files Audited
- `FTUEController.lua` — SHA: 1a8475b0 (33,080 bytes)
- `FTUEManager.lua` — SHA: 33a7d165 (19,168 bytes)
- `FTUEWiring.lua` — SHA: 002378d8 (5,754 bytes)

## Next Action
Action 3: Monetization Stack Audit — `MonetizationOrchestrator.lua` + `MonetizationServer.lua` + `ReceiptRouter.lua`
