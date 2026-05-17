# Elo Manager + Security Layer Audit Report
**Date:** 2026-03-29 | **Auditor:** OB1 | **Pipeline Actions:** #5 (Elo) + #6 (Security) of 20

## Executive Summary
**EloManager Grade: A- — Solid Glicko-inspired adaptive difficulty. One data bug in Tiger tier boundaries.**
**SecurityLayer Grade: B+ — Good fail-closed anti-cheat. Missing edge cases.**

---

## EloManager.lua — Grade: A-
**SHA:** 5d939298 | **Status:** PRODUCTION-READY with 1 data fix needed

### Architecture
- Glicko-inspired Elo with K-factor decay (64 → 32 → 16)
- Player Elo + Question Elo dual rating system
- 5-tier mapping: Mouse → Cat → Wolf → Lion → Tiger (A/B sub-tiers)
- FTUE override: first 20 questions bypass Elo, use curated sequence
- Session momentum: streak bonus temporarily boosts effective Elo (flow state)
- Combat integration: English performance → damage multiplier (0.4x to 1.5x)

### Strengths
- **Flow state detection** — consecutive correct answers push harder questions
- **K-factor decay** — new players calibrate fast (K=64), veterans stable (K=16)
- **Combat bridge** — correct+fast = 1.5x damage, wrong = 0.6x, timeout = 0.4x
- **Mastery/struggling weights** — struggling words get 2x selection weight
- **DataStore V2→V3 migration helpers** — clean schema extension pattern

### Issues Found
| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | 🔴 | Tiger tier: `min=2301, max=2400, mid=2500` — **mid exceeds max** | Fix `mid` to 2350 OR extend `max` to 2600 |
| 2 | 🟡 | `GetEffectiveElo` reads `playerEloState` but `SelectQuestion` reads `playerData._streakBonus` — two different streak paths | Consolidate to single path |
| 3 | 🟡 | `ELO_CEILING = 2400` matches Tiger `max = 2400` — players can never reach Tiger-B | Raise ceiling to 2600 |
| 4 | 🟢 | `FilterByEloWindow` recursive — could infinite loop if <3 questions in wide window | Add base case |
| 5 | 🟢 | Question Elo cache is memory-only — resets on server restart | Need DataStore persistence. Low priority for launch. |

---

## SecurityLayer.lua — Grade: B+
**SHA:** 543fc416 | **Status:** PRODUCTION-READY for launch

### Architecture
- Per-player security state with violation tracking
- Rate limiting per event type with sliding window
- Answer speed validation (min 0.3s, streak detection)
- Currency change validation (per-action caps)
- Auto-kick at 10 violations

### Issues Found
| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | 🟡 | Uses `player` object as key (not UserId) — memory leak risk | Switch to `player.UserId` |
| 2 | 🟡 | `VIOLATION_DECAY_SECONDS = 300` defined but never used — violations never decay | Add decay logic |
| 3 | 🟡 | No rate limit for combat events (MeleeAttack, RangedAttack) | Add entries |
| 4 | 🔴 | `MAX_COINS_PER_ACTION = 200` — Day 99 boss + combo = ~2,980 coins. **FALSE POSITIVES GUARANTEED** | Make cap dynamic or exempt CombatRewardsManager |

### Critical Cross-System Finding
SecurityLayer currency cap (200) will block ALL legitimate late-game boss rewards. Day 99 Sigma Boss = 200 base × 2.98 day scale × 5.0 combo = ~2,980 coins. Fix before launch.

## Files Audited
- `EloManager.lua` — SHA: 5d939298
- `SecurityLayer.lua` — SHA: 543fc416
