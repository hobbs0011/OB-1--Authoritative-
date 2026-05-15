# Battle Pass Season 1 — Design Document
**Date:** 2026-03-29 | **Auditor:** OB1 | **Pipeline Action:** #13 of 20

## Overview
Free + Premium track. 50 levels. Runs 30 days. Gospel 444 palette. NO BLUE.

## Revenue Model
- **Free track:** Keep players engaged. Enough rewards to feel progression.
- **Premium track:** 499 Robux ($5.99). Exclusive cosmetics, bonus gems, unique weapons.
- **Target:** 5-10% conversion rate on active players.

## Track Structure (50 Levels)

### Free Track Highlights
| Level | Reward | Type |
|-------|--------|------|
| 1 | 100 Coins | Currency |
| 5 | Skibidi Zombie Skin (Green) | Cosmetic |
| 10 | 500 Coins | Currency |
| 15 | Standard Crate | Gacha |
| 20 | Ohio Anomaly Skin (Blue) | Cosmetic |
| 25 | 1,000 Coins + 5 Gems | Currency |
| 30 | Premium Crate | Gacha |
| 35 | Rizz Merchant Charm | Cosmetic |
| 40 | 2,000 Coins | Currency |
| 45 | Elite Crate | Gacha |
| 50 | "Brainrot Survivor" Title + 10 Gems | Title + Currency |

### Premium Track Highlights
| Level | Reward | Type |
|-------|--------|------|
| 1 | "Season 1 OG" Title | Exclusive Title |
| 5 | Neon Katana Skin | Exclusive Weapon Skin |
| 10 | 500 Gems | Premium Currency |
| 15 | Sigma Boss Kill Animation | Exclusive |
| 20 | Void Walker Trail | Exclusive VFX |
| 25 | 1,000 Gems + Premium Crate ×3 | Currency + Gacha |
| 30 | Baron Skibidi Pet | Exclusive Pet |
| 35 | Legendary Crate | Gacha |
| 40 | "Sigma Grindset" Emote | Exclusive |
| 45 | 2,000 Gems + Mythic Crate | Currency + Gacha |
| 50 | RIZZLORD Weapon Skin (Legendary) | Exclusive Legendary |

## XP Sources (Battle Pass specific)
| Source | XP | Daily Cap |
|--------|----|-----------|
| Wave Clear | 100 | None |
| Day Complete | 250 | None |
| Boss Kill | 500 | None |
| Daily Challenge | 300 | 3/day |
| Weekly Challenge | 1,000 | 3/week |
| First Login | 200 | 1/day |

## XP Curve
- Level 1-10: 1,000 XP each (easy early hook)
- Level 11-30: 1,500 XP each (steady grind)
- Level 31-50: 2,000 XP each (hardcore)
- **Total to 50:** 82,500 XP
- **Average daily play (30 min):** ~1,500-2,500 XP/day
- **Days to complete F2P:** ~33-55 days (ensures some pressure to play daily)
- **Days to complete with premium:** Same (premium doesn't give XP boost — avoids P2W feel)

## Integration Points
- `BattlePass.lua` already exists in codebase (SHA in CODE/)
- `DataStoreV2` has `battlePassLevel`, `battlePassXP`, `battlePassPurchased` fields
- `MonetizationOrchestrator` has battle pass dep loaded but no trigger wiring
- **TODO:** Wire `CombatRewardsManager.ProcessKill` → `BattlePass.AddXP`
- **TODO:** Wire `DayScaling.GetPhase` completion → `BattlePass.AddXP`

## Gospel 444 Compliance
- All UI: Purple (#a855f7) + Gold (#f59e0b) on Dark (#0f0f1a)
- NO BLUE anywhere in Battle Pass UI
- Font: Orbitron headers, Rajdhani body
