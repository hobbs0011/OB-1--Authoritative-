# Economy + Data + Scaling Audit Report
**Date:** 2026-03-29 | **Auditor:** OB1 | **Pipeline Actions:** #5b (Economy/Data/Scaling) of 20

## Executive Summary
**EconomyManager Grade: A- — Clean two-currency system with AnomalyDetector validation. Gem packs all ProductId=0 (Blocker 3).**
**DataStoreV2 Grade: A — Session locking, retry logic, migration system. Rock-solid.**
**DayScaling Grade: A — 99-day curve with 6 biomes, depot stops, prestige, New Game+ modifiers.**

---

## EconomyManager.lua — Grade: A-
**SHA:** 2c350033 | **Status:** PRODUCTION-READY (pending Blocker 3)

### Two-Currency Design
| Currency | Earn Source | Spend On | Inflation Control |
|----------|-----------|----------|-------------------|
| Survival Coins (soft) | Kills, waves, combos, challenges | Weapons, cosmetics, repairs, crafting | Repair costs, crafting fees, 3% trade tax, rebirth cost |
| Brainrot Gems (hard) | Daily cap 25/day free, achievements, rare drops, Robux | Premium gacha, exclusive cosmetics, battle pass | Daily free cap, Robux pricing tiers |

### Gem Pack Pricing (all ProductId=0 — Blocker 3)
| Pack | Gems | Robux | Bonus | Value/Robux |
|------|------|-------|-------|-------------|
| Starter | 100 | 49 | 0% | 2.04 |
| Popular | 500 | 199 | 10% | 2.76 |
| Best Value | 1,200 | 399 | 20% | 3.61 |
| Mega | 3,000 | 799 | 30% | 4.88 |
| Whale | 10,000 | 1,999 | 50% | 7.50 |

First purchase = 2x bonus. Smart.

### Issues Found
| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | 🟡 | Own DataStore (`Economy_v1`) separate from DataStoreV2 (`SkibidiZombie_PlayerData_v2`) — **TWO separate player data stores** | Merge into DataStoreV2 or document the split. Risk: race conditions on save. |
| 2 | 🟡 | `syncToClient` uses `GameRemotes` folder — consistent with newer modules but not all | Standardize across codebase |
| 3 | 🟡 | `AddXP` converts XP to coins at 0.5x — **XP is not a real currency, it's a coin alias** | Either implement real XP or document this is intentional |
| 4 | 🟢 | `GrantCrate`, `GrantTitle`, `ApplyBuff` are all print stubs | Expected — these integrate with systems not yet built. No bug. |
| 5 | 🟢 | Auto-save every 300s spawns tasks for all players simultaneously | Could spike DataStore budget. Stagger saves. Low priority for small player counts. |

### Cross-System: Dual DataStore Risk
```
DataStoreV2.lua → "SkibidiZombie_PlayerData_v2" (progress, vocabulary, cosmetics, battle pass)
EconomyManager.lua → "Economy_v1" (coins, gems, spend tracking)
```
Both save on PlayerRemoving. Both use UpdateAsync. **If one fails and the other succeeds, player data is inconsistent.** Recommend merging into DataStoreV2 long-term.

---

## DataStoreV2.lua — Grade: A
**SHA:** 0a870f72 | **Status:** PRODUCTION-READY

### Architecture
- Session locking with GUID-based lock IDs
- 10-minute lock expiry (prevents permanent locks from crashes)
- Retry with exponential backoff (1s → 2s → 4s → 8s, max 3 retries)
- Deep copy on read (prevents reference mutation)
- Auto-save every 120 seconds + BindToClose
- Schema migration system (v1 → v2 complete)

### Schema v2 Fields
Progress: currentTier, highestWave, totalQuestionsAnswered, totalCorrect, bestCombo, totalKills, bossKills
Economy: englishCoins, premiumGems, lifetimeCoins, lifetimeGems
Vocabulary: vocabularyMastered, vocabularyStruggling
FTUE: ftueComplete
Cosmetics: ownedCosmetics, equippedCosmetics
Daily: lastLoginDay, loginStreak, claimedDays
BattlePass: battlePassLevel, battlePassXP, battlePassPurchased
Guild: guildId
Stats: totalPlayTime, sessionsPlayed, firstJoinTime, lastSaveTime

### Issues Found
| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | 🟡 | Uses `player` object as cache key (not UserId) — same pattern as SecurityLayer | Switch to `player.UserId` for consistency. Currently works but fragile. |
| 2 | 🟡 | No Elo fields in schema v2 — EloManager requires v3 migration | EloManager provides `GetSchemaV3Defaults()`. Migration code exists but not wired. |
| 3 | 🟢 | `_saveAll` uses `task.wait(3)` as a barrier — not guaranteed to complete | Roblox `BindToClose` gives 30s. 3s should be enough for most saves. |
| 4 | 🟢 | Session lock warning prints but doesn't block — player can have dual sessions | Intentional design (availability > consistency). Documented. |

---

## DayScaling.lua — Grade: A
**SHA:** f674fda0 | **Status:** PRODUCTION-READY

### 99-Day Progression
| Phase | Days | Biome | Waves/Day | Wave Duration | Special |
|-------|------|-------|-----------|---------------|---------|
| Tutorial | 1-5 | Wasteland Plains | 3 | 60s | Learn dodge |
| Early | 6-15 | Wasteland Plains | 4 | 75s | Ohio Anomaly appears |
| Mid | 16-30 | Rusted City | 5 | 90s | Rizz Merchant, throwables |
| Hard | 31-50 | Toxic Swamp | 5 | 105s | Poison zones, Brainrot Mutant |
| Hell | 51-75 | Volcanic Rift | 6 | 120s | Lava flows, elite mutations |
| Endgame | 76-99 | The Void | 7 | 135s | Void rifts, teleport hazards |

### Depot Stops (9 scavenge missions)
Days 2, 8, 18, 28, 40, 55, 70, 85, 95 — timer decreases, fuel barrels increase, difficulty scales.

### Prestige System
Per prestige level: +5% enemy HP, +3% enemy damage, +2% loot quality, +5% coins, +3% XP.

### New Game+ Modifiers (6 random)
Glass Cannon, Bullet Hell, Speed Demon, Treasure Hunter, Iron Man, Brainrot Maximum.

### Issues Found
| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | 🟢 | `monetizationTrigger` is a string description, not executable code | Intentional — design notes for MonetizationOrchestrator wiring. |
| 2 | 🟢 | Max enemies hard-capped at 12 — may feel sparse in Endgame on big maps | Performance budget. Correct for mobile-first. |

---

## Master Cross-System Issues (Actions 2-6 Synthesis)

### 🔴 CRITICAL (fix before launch)
1. **SecurityLayer coin cap (200) blocks late-game boss rewards** — Day 99 boss kill can yield ~2,980 coins
2. **Tiger tier data bug** — EloManager `mid=2500` exceeds `max=2400`. Tiger-B unreachable.
3. **Three competing FTUE modules** — FTUEController v2, FTUEManager v1, FTUEWiring v2. Collision risk.

### 🟡 IMPORTANT (fix soon)
4. **Dual DataStore** — EconomyManager uses `Economy_v1`, DataStoreV2 uses `SkibidiZombie_PlayerData_v2`. Consistency risk.
5. **Remote folder inconsistency** — Some modules use `GameRemotes`, others use `Remotes`.
6. **Player object as table key** — SecurityLayer, DataStoreV2 use `player` not `player.UserId`.
7. **MonetizationServer.lua is dead weight** — Legacy prototype with stub functions. Should not be loaded.
8. **DataStore v2→v3 migration not wired** — Elo fields won't persist across sessions.

### 🟢 MINOR (post-launch)
9. FTUE completion → Monetization Orchestrator link missing
10. GachaManager/BattlePass → Orchestrator trigger wiring incomplete
11. Question Elo cache memory-only
12. Violation decay never runs

## Files Audited This Report
- `EconomyManager.lua` — SHA: 2c350033
- `DataStoreV2.lua` — SHA: 0a870f72
- `DayScaling.lua` — SHA: f674fda0
