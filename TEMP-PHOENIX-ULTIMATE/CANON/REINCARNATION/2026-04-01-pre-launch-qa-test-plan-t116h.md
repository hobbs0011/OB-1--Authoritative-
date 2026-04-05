# 2026-04-01 — Pre-Launch QA Test Plan — Survive a Brainrot (T-116h)

> **Pulse:** :15 | **Agent:** Anakin (Agent-98) | **Mode:** BUILD
> **Genesis Anchor:** Game Bible + CANON/TRAIN-67/CODE/ (48 files @ HEAD `d65fe12`)
> **Date:** 2026-04-01 20:15 ICT

---

## Mission
Produce the exact Studio QA test plan Michael runs after wiring 21 Product IDs — every test is concrete, pass/fail, references exact module names and expected output.

## Prerequisites (Must Be Done First)
- [ ] All 21 Product IDs created in Creator Dashboard (see `2026-04-01-product-id-creation-checklist-t119h.md`)
- [ ] Product IDs wired into `GamePassConfig.lua` and `DevProductsConfig.lua` (all `0` placeholders replaced)
- [ ] ReceiptRouter migration patch applied (see `2026-04-01-receipt-router-migration-patch.md`)

---

## PHASE 1: Boot Sequence Validation (5 min)

### Test 1.1 — Server Boot (No Errors)
1. Open Studio → Run (Server + Client)
2. Watch Output window for **red errors** in first 10 seconds
3. **PASS:** Zero red errors in Output
4. **Expected green lines:**
   - `[UnifiedServer] Phase 1: Services initialized`
   - `[UnifiedServer] Phase 2: Config modules loaded`
   - `[ReceiptRouter] Active — single ProcessReceipt handler`
   - `[DataStoreV2] Ready`

### Test 1.2 — Client Boot
1. Check client Output for:
   - `[UnifiedClient] Connected`
   - `[HUDController] Initialized`
   - `[MobileInputController] Touch controls active` (if testing on mobile emulator)
2. **PASS:** HUD visible, no script errors

### Test 1.3 — ReceiptRouter Diagnostics
1. Check Output for `📡 RECEIPT ROUTER DIAGNOSTICS`
2. Confirm: `Registered products: 16` (dev products)
3. Confirm: `Registered game passes: 5`
4. Confirm: `⚠️ CONFLICT` count = 0
5. **PASS:** All products registered, zero conflicts

---

## PHASE 2: Core Gameplay Loop (10 min)

### Test 2.1 — Wave System Start
1. Join game, wait for wave 1 to begin
2. **Expected:** `WaveManager` spawns enemies via `EnemyFactory`
3. **PASS:** Enemies spawn, health bars visible, wave counter shows "Wave 1"

### Test 2.2 — Combat (Kill → Coins → Combo)
1. Attack and kill an enemy
2. **Expected:**
   - `CombatSystem` registers hit/kill
   - `CombatRewardsManager` awards coins
   - HUD coin counter increments
   - Combo counter appears if chaining kills
3. **PASS:** Coins awarded on kill, combo multiplier visible after 2+ rapid kills

### Test 2.3 — Enemy Types Match EnemyData
1. Play through waves 1-3
2. **Expected:** Enemy names/types match `EnemyData.lua` definitions for stages 1-3
3. **PASS:** Correct enemies spawn per stage, no placeholder or missing models

### Test 2.4 — Boss Wave (Wave 5)
1. Survive to wave 5
2. **Expected:** `WorldBoss` spawns with unique attack pattern
3. **PASS:** Boss appears, has distinct mechanics, drops loot on defeat

### Test 2.5 — Day Scaling
1. Check `DayScaling.lua` effect — difficulty should ramp
2. **PASS:** Enemy HP/damage visibly higher in wave 5 vs wave 1

---

## PHASE 3: Economy & Monetization (15 min)

### Test 3.1 — Game Pass Purchase Flow (Each Pass)
For EACH of the 5 game passes:

| Pass | Test Action | Expected Result |
|------|------------|-----------------|
| 2x Coins | Buy → kill enemy | Coin reward is 2x base |
| 2x XP | Buy → kill enemy | XP reward is 2x base |
| Auto-Collect | Buy → drops appear | Drops auto-collected without touching |
| VIP Access | Buy → check area | VIP area accessible + daily gems |
| Ultimate Survivor | Buy → check all | All above + exclusive aura visible |

**PASS:** Each pass activates immediately, persists across rejoin

### Test 3.2 — Dev Product Purchase Flow (Sample 4)
Test at minimum these 4 products:

| Product | Test Action | Expected Result |
|---------|------------|-----------------|
| 500 Coins | Purchase | Coin balance +500, receipt processed |
| 25 Gems | Purchase | Gem balance +25, receipt processed |
| Instant Revive | Die → purchase | Player revives at current wave |
| 1x Survival Crate | Purchase | Crate opening UI appears, item granted |

**PASS:** ReceiptRouter logs `[ReceiptRouter] Processed:` for each, balances update

### Test 3.3 — No Dual ProcessReceipt
1. After any purchase, check Output
2. **FAIL IF:** You see `ProcessReceipt` called twice for same receipt
3. **PASS:** Exactly one `[ReceiptRouter] Processed:` per purchase

### Test 3.4 — EconomyManager Coin Flow
1. Earn coins from kills
2. Spend coins in Train Shop
3. **PASS:** Balance decreases correctly, item/upgrade applied

### Test 3.5 — SecurityLayer Validation
1. Open Output, look for `[SecurityLayer]` messages
2. **PASS:** No exploit warnings during normal play

---

## PHASE 4: Progression Systems (10 min)

### Test 4.1 — DataStore Save/Load
1. Play for 2+ minutes, earn coins/XP
2. Leave game → Rejoin
3. **PASS:** Coins, XP, level, inventory all persist via `DataStoreV2`

### Test 4.2 — Daily Rewards
1. Join game, check daily reward prompt
2. **PASS:** `DailyRewards` UI appears, rewards granted on claim

### Test 4.3 — Battle Pass
1. Check Battle Pass UI
2. Play, earn XP, check if BP tier advances
3. **PASS:** `BattlePass.lua` tier progress visible, rewards claimable

### Test 4.4 — Leaderboard
1. Check leaderboard display
2. **PASS:** `LeaderboardManager` shows player stats (coins, wave, etc.)

### Test 4.5 — Prestige (if reachable)
1. If max level reachable in test, trigger prestige
2. **PASS:** `PrestigeManager` resets progress, grants prestige rewards

---

## PHASE 5: Client Systems (5 min)

### Test 5.1 — FTUE (First Time User Experience)
1. Join as NEW player (clear DataStore or use alt account)
2. **PASS:** `FTUEController` / `FTUEManager` shows tutorial sequence
3. Tutorial completes without errors

### Test 5.2 — Mobile Controls
1. Enable mobile emulator in Studio
2. **PASS:** `MobileInputController` touch buttons appear, responsive

### Test 5.3 — Gacha/Crate Opening
1. Purchase or earn a crate
2. Open crate
3. **PASS:** `GachaManager` animation plays, item added to inventory

### Test 5.4 — Cosmetic Equip
1. Open inventory/cosmetic UI
2. Equip a cosmetic
3. **PASS:** `CosmeticController` applies visual change to character

---

## PHASE 6: Analytics & Monitoring (2 min)

### Test 6.1 — Analytics Events Firing
1. Check Output for `[AnalyticsService]` log lines during gameplay
2. **PASS:** Events logged for: join, kill, purchase, wave_complete, death

### Test 6.2 — Anomaly Detector
1. Check Output for `[AnomalyDetector]` warnings
2. **PASS:** No false positives during normal play

---

## PHASE 7: Publish Gate Checklist

- [ ] Phase 1: Boot — ZERO red errors
- [ ] Phase 2: Gameplay — waves spawn, combat works, bosses appear
- [ ] Phase 3: Monetization — all 5 passes work, 16 products process, no dual receipts
- [ ] Phase 4: Progression — save/load works, daily rewards, battle pass, leaderboard
- [ ] Phase 5: Client — FTUE completes, mobile works, gacha works, cosmetics work
- [ ] Phase 6: Analytics — events fire, no false anomalies
- [ ] Store listing uploaded (see `2026-04-01-store-listing-copy-spec.md`)
- [ ] Thumbnail + icon uploaded
- [ ] Game set to Public
- [ ] AllowThirdPartySales = true

**If ALL boxes checked → PUBLISH.**

---

## Known Module Versioning (48 files, not 41)
These are versioned duplicates — confirm which is active in `UnifiedServer.server.lua`:
- `HUDController_PHASE1_REVISED.lua` vs `HUDController_v2.lua`
- `QuestionBank.lua` vs `QuestionBankV2.lua`
- `GameMain_PHASE1_REVISED.lua` vs `MainServer_v2.lua`

**Action:** Check `require()` paths in UnifiedServer/UnifiedClient. Dead files should be removed before publish to avoid confusion.

---

## Acceptance Test
- [x] Every test item is concrete with exact pass/fail criteria
- [x] Module names match actual repo files (48 files verified)
- [x] Tests reference exact expected Output log messages
- [x] Checklist is copy-pasteable and executable in Studio
- [x] Zero drift from Game Bible and repo HEAD

## Source Evidence
- Repo HEAD: `d65fe12`
- Files counted: 48 in `CANON/TRAIN-67/CODE/`
- Game Bible: Survive a Brainrot — Complete Game Bible (Human-Readable)
- Cold Start: SHA `bc70200`
