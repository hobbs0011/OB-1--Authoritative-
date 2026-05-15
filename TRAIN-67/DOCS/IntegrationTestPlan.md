# Integration Test Plan — Skibidi Zombie: Survive the Brainrots

**GOAL: MAKE MONEY.** Bugs = player churn = lost revenue. Test before launch.

## Test Environment
- Roblox Studio (local testing)
- Private Roblox server (multi-player testing)
- Mobile device (real device testing)

## Critical Path Tests (MUST PASS before launch)

### T1: Boot Sequence
| # | Test | Expected | Status |
|---|------|----------|--------|
| 1.1 | Start game in Studio | All modules print Init success | ⬜ |
| 1.2 | No errors in Output | Zero red errors on boot | ⬜ |
| 1.3 | Remotes folder created | All RemoteEvents exist | ⬜ |
| 1.4 | Player joins | PlayerAdded fires, data loads | ⬜ |
| 1.5 | Player leaves + rejoins | Data persists across sessions | ⬜ |

### T2: FTUE (First-Time User Experience)
| # | Test | Expected | Status |
|---|------|----------|--------|
| 2.1 | New player sees tutorial | Welcome overlay appears | ⬜ |
| 2.2 | Tutorial progresses | Steps advance on completion | ⬜ |
| 2.3 | Tutorial enemy spawns | Baby Skibidi appears | ⬜ |
| 2.4 | First question served | Question UI visible | ⬜ |
| 2.5 | Correct answer advances | Damage dealt, tutorial progresses | ⬜ |
| 2.6 | Tutorial skip (30s) | Auto-skip after timeout | ⬜ |
| 2.7 | Completion reward | 25 coins granted | ⬜ |
| 2.8 | Returning player skips | No FTUE on second join | ⬜ |

### T3: Combat Loop
| # | Test | Expected | Status |
|---|------|----------|--------|
| 3.1 | Enemy spawns | Visible in workspace | ⬜ |
| 3.2 | Question served on encounter | Question UI appears | ⬜ |
| 3.3 | Correct answer = damage | Enemy health decreases | ⬜ |
| 3.4 | Wrong answer = player damage | Player health decreases by 15 | ⬜ |
| 3.5 | Combo system works | Streak counter visible, damage scales | ⬜ |
| 3.6 | Combo breaks on wrong | Counter resets to 0 | ⬜ |
| 3.7 | Power-Up charges | 5 correct = full charge | ⬜ |
| 3.8 | Power-Up activates | Big damage on activation | ⬜ |
| 3.9 | Enemy dies on 0 HP | Removed from game, coins awarded | ⬜ |
| 3.10 | Boss requires 3 answers | Sigma Boss needs 3 correct | ⬜ |

### T4: Enemy Types
| # | Test | Expected | Status |
|---|------|----------|--------|
| 4.1 | Skibidi Zombie | Slow, low HP, Tier 1 questions | ⬜ |
| 4.2 | Sigma Boss | Tanky, Tier 3 questions, 3-hit | ⬜ |
| 4.3 | Ohio Anomaly | Fast zigzag movement | ⬜ |
| 4.4 | Rizz Merchant | Heals nearby enemies | ⬜ |
| 4.5 | Brainrot Mutant | Splits into 2 mini-mutants on death | ⬜ |
| 4.6 | Difficulty scales per wave | Health/speed increase | ⬜ |

### T5: Wave System
| # | Test | Expected | Status |
|---|------|----------|--------|
| 5.1 | Wave 1 starts | 7 enemies spawn | ⬜ |
| 5.2 | Intermission between waves | 8s countdown visible | ⬜ |
| 5.3 | Wave clear rewards | Coins awarded to all players | ⬜ |
| 5.4 | Boss every 5 waves | Wave 5, 10, 15... has Sigma Boss | ⬜ |
| 5.5 | Difficulty ramp | Wave 20 noticeably harder than Wave 1 | ⬜ |
| 5.6 | Max enemies cap | Never more than 30 alive | ⬜ |

### T6: Economy
| # | Test | Expected | Status |
|---|------|----------|--------|
| 6.1 | Coins awarded on kill | Amount matches enemy reward | ⬜ |
| 6.2 | Combo bonus coins | Higher streak = more coins | ⬜ |
| 6.3 | Wave clear bonus | 50 + 10 per wave coins | ⬜ |
| 6.4 | Gem drops (rare) | ~2% chance on regular, ~15% on boss | ⬜ |
| 6.5 | Daily multiplier | First game of day = 1.5x | ⬜ |
| 6.6 | Premium multiplier | Battle Pass owner = 2x | ⬜ |
| 6.7 | Coins persist | Rejoin shows same coin count | ⬜ |

### T7: Data Persistence
| # | Test | Expected | Status |
|---|------|----------|--------|
| 7.1 | Save on leave | Data saved when player leaves | ⬜ |
| 7.2 | Auto-save every 2 min | Background saves running | ⬜ |
| 7.3 | Server shutdown save | BindToClose saves all | ⬜ |
| 7.4 | Session locking | No data overwrite on multi-device | ⬜ |
| 7.5 | Schema migration | v1 data upgrades to v2 cleanly | ⬜ |
| 7.6 | Retry on failure | Failed saves retry 3x with backoff | ⬜ |

### T8: Security
| # | Test | Expected | Status |
|---|------|----------|--------|
| 8.1 | Rate limiting | >10 events/sec from one player = blocked | ⬜ |
| 8.2 | Speed validation | Answer in <0.5s = flagged | ⬜ |
| 8.3 | Currency bounds | Cannot set coins to negative | ⬜ |
| 8.4 | String sanitization | Long/malicious strings truncated | ⬜ |
| 8.5 | Auto-kick | 10 violations = kick | ⬜ |

### T9: HUD (Mobile)
| # | Test | Expected | Status |
|---|------|----------|--------|
| 9.1 | Health bar visible | Top center, updates in real-time | ⬜ |
| 9.2 | Combo counter | Appears on streak >1, shakes at 5+ | ⬜ |
| 9.3 | Power-Up gauge | Fills with correct answers | ⬜ |
| 9.4 | Coin display | Top right, updates on earn | ⬜ |
| 9.5 | Wave indicator | Top left, shows wave + tier label | ⬜ |
| 9.6 | Question UI | Bottom center, 4 answer buttons | ⬜ |
| 9.7 | Answer buttons thumb-size | ≥60px height on mobile | ⬜ |
| 9.8 | Shop button | Visible, opens shop | ⬜ |
| 9.9 | Reward popups | Float up and fade on earn | ⬜ |
| 9.10 | Works on phone | Full test on real mobile device | ⬜ |

### T10: Multi-Player
| # | Test | Expected | Status |
|---|------|----------|--------|
| 10.1 | 2+ players in same server | Both see enemies, HUD works | ⬜ |
| 10.2 | Independent combat | Each player fights own enemies | ⬜ |
| 10.3 | Wave rewards shared | All players get wave clear coins | ⬜ |
| 10.4 | Player join mid-wave | Joins smoothly, gets current state | ⬜ |
| 10.5 | Player leave doesn't break | Remaining players continue | ⬜ |

## Test Execution Order

1. T1 (Boot) — if this fails, nothing else works
2. T7 (Data) — if data doesn't save, no progression
3. T3 (Combat) — core loop
4. T2 (FTUE) — first impression
5. T5 (Waves) — engagement loop
6. T4 (Enemies) — variety
7. T6 (Economy) — monetization
8. T8 (Security) — protection
9. T9 (HUD) — UX
10. T10 (Multi-Player) — social

## GO/NO-GO Criteria

**GO (70+ score):**
- T1 all pass (boot works)
- T7.1-7.3 pass (data saves)
- T3.1-3.6 pass (combat works)
- T9.1-9.7 pass (HUD works on mobile)
- No crash bugs
- No data loss bugs

**NO-GO:**
- Any T1 failure
- Any T7 data loss
- Crash on mobile
- Economy exploit found

---
*Built for Skibidi Zombie: Survive the Brainrots. GOAL: MAKE MONEY.*
