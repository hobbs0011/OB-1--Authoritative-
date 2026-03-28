# 🚀 LAUNCH DAY PLAYBOOK — Survive a Brainrot

> **One document. 30 minutes. Game goes live.**
> **Run 94** | 2026-03-29 02:00 ICT | OVERNIGHT LAUNCH SPRINT Action 3/8
> **Sources:** PreLaunchGoLivePlaybook.md, ProductIDReplacementGuide.md, GAME-BIBLE-DEPLOY-STATUS-FINAL.md, FINAL-CODE-INTEGRITY-REPORT.md, StudioModulePlacementMap.md, RojoCICDOperationsGuide.md

---

## ✅ What's Already Done (Overnight Sprint)

- [x] **41 Lua modules** — CODE COMPLETE (48 files, ~720KB, zero HTML entities, zero broken requires)
- [x] All ESL references stripped — real tap-to-attack combat live
- [x] 19 weapons, 5 enemy types, 99-day scaling, gacha pity, 50-tier Battle Pass
- [x] Server-authoritative architecture, anti-cheat, fail-closed monetization
- [x] Code Integrity Report: LAUNCH-READY (`660bbddf`)
- [x] Game Bible updated to final state (`a32d7a94`)

## 🔴 What Michael Does This Morning (30 min)

### Step 1: Create 5 Game Passes (~10 min)

Open: **[create.roblox.com](https://create.roblox.com) → Your Experience → Monetization → Passes**

| Pass | Price | Create → Copy ID |
|------|-------|-------------------|
| **2x Coins** | 99 R$ | → paste into `GamePassConfig.lua` line ~38 |
| **2x XP** | 149 R$ | → paste into `GamePassConfig.lua` line ~49 |
| **Auto-Collect** | 199 R$ | → paste into `GamePassConfig.lua` line ~58 |
| **VIP Access** | 499 R$ | → paste into `GamePassConfig.lua` line ~69 |
| **Ultimate Survivor Pack** | 1,499 R$ | → paste into `GamePassConfig.lua` line ~83 |

**How:** Find `GamePassId = 0` → replace `0` with the real ID number.

### Step 2: Create 16 Developer Products (~10 min)

Open: **Same page → Developer Products → Create**

**Currency (6):**

| Product | Price | Placeholder Key |
|---------|-------|-----------------|
| 500 Survival Coins | 49 R$ | `PRODUCT_ID_COINS_500` |
| 2,500 Coins (+25% Bonus) | 199 R$ | `PRODUCT_ID_COINS_2500` |
| 10,000 Coins (+50% Bonus) | 699 R$ | `PRODUCT_ID_COINS_10000` |
| 25 Brainrot Gems | 99 R$ | `PRODUCT_ID_GEMS_25` |
| 100 Gems (+20% Bonus) | 349 R$ | `PRODUCT_ID_GEMS_100` |
| 500 Gems (+40% Bonus) | 1,499 R$ | `PRODUCT_ID_GEMS_500` |

**Consumables (6):**

| Product | Price | Placeholder Key |
|---------|-------|-----------------|
| Instant Revive | 25 R$ | `PRODUCT_ID_REVIVE_1` |
| 5x Revive Pack | 99 R$ | `PRODUCT_ID_REVIVE_5` |
| 2x Coins Boost (30min) | 49 R$ | `PRODUCT_ID_BOOST_2X_COINS` |
| 2x XP Boost (30min) | 49 R$ | `PRODUCT_ID_BOOST_2X_XP` |
| Shield (5min) | 29 R$ | `PRODUCT_ID_BOOST_SHIELD` |
| MEGA Boost (all, 60min) | 149 R$ | `PRODUCT_ID_BOOST_MEGA` |

**Gacha (4):**

| Product | Price | Placeholder Key |
|---------|-------|-----------------|
| 1x Survival Crate | 75 R$ | `PRODUCT_ID_GACHA_BASIC_1` |
| 10x Survival Crate (+1 Free) | 649 R$ | `PRODUCT_ID_GACHA_BASIC_10` |
| 1x Brainrot Crate | 149 R$ | `PRODUCT_ID_GACHA_PREMIUM_1` |
| 10x Brainrot Crate (+1 Free) | 1,299 R$ | `PRODUCT_ID_GACHA_PREMIUM_10` |

**How:** Open `DevProductsConfig.lua`. Find each placeholder key (e.g. `"PRODUCT_ID_COINS_500"`) → replace with the numeric Product ID as a string (e.g. `"123456789"`).

### Step 3: Get Code Into Studio (~5 min)

**Option A — Rojo (if configured):**
```bash
rojo build default.project.json -o game.rbxl
```
Then open `game.rbxl` in Studio.

**Option B — Manual paste:**
Follow `StudioModulePlacementMap.md` — copy each `.lua` file from `CANON/TRAIN-67/CODE/` into the correct Studio location:
- `UnifiedServer.lua` → ServerScriptService (rename to `.server.lua`)
- `UnifiedClient.lua` → StarterPlayerScripts (rename to `.client.lua`)
- All other modules → ServerStorage/Modules/
- Create `ReplicatedStorage/Remotes/` folder (empty — auto-populated on boot)

### Step 4: Boot Test (~2 min)

1. Studio → **Play**
2. Open Output (View → Output)
3. Look for: `[UnifiedServer] Boot complete — XX modules loaded`
4. Zero red error lines = PASS
5. If errors: check file placement matches `StudioModulePlacementMap.md`

### Step 5: Publish (~3 min)

1. Studio → File → **Publish to Roblox**
2. Game Settings:
   - Name: `Skibidi Zombie: Survive the Brainrots 🧟💀`
   - Genre: Horror + Fighting
   - Max Players: 20
   - Playable Devices: Phone ✅ Tablet ✅ PC ✅ Xbox ✅
3. Creator Dashboard → set game to **Public**

### Step 6: Visual Assets (~5 min)

1. **Game Icon:** Upload 512×512 PNG (zombie/character with title)
2. **Thumbnails:** Upload at least 1 screenshot (1920×1080)
3. **Description:** Copy from `STORE-LISTING-COPY.md` (Action 4 will build this)

### Step 7: Verify Live (~2 min)

1. Open Roblox app on phone
2. Search for game name
3. Join → complete FTUE → kill enemies → verify coins earned
4. Open shop → verify purchase prompts show correct prices
5. ✅ LIVE AND EARNING

---

## ⚠️ Known Issues (Non-Blocking)

| Issue | Impact | When to Fix |
|-------|--------|-------------|
| MonetizationOrchestrator 8 offers have `productId = 0` | Smart offers won't trigger (basic shop still works) | After products created, update offer table |
| ProcessReceipt conflict between GamePassConfig + DevProductsConfig | ReceiptRouter handles it if loaded first in UnifiedServer boot | Verify boot order |
| BattlePass `SEASON_START` not set | Battle Pass won't activate | Set to launch date after publish |
| No Discord server yet | No community hub | Build this week (Action 5 has the guide) |

---

## 💰 What Happens After Launch

| Timeframe | Action |
|-----------|--------|
| **Hour 1** | Monitor Creator Dashboard for CCU and revenue |
| **Day 1** | Fix any crash bugs from real player data |
| **Day 2-3** | Set BattlePass SEASON_START, activate daily challenges |
| **Day 4-5** | Discord server live, first community event |
| **Day 7** | First weekly World Boss event |
| **Apr 6** | 🔴 Roblox Incubator application deadline |

---

## Emergency Contacts

- **Game crashes on join:** Check Output for the exact error line + file. Most likely a missing module or wrong folder.
- **No monetization:** Verify Product IDs are numeric (not placeholder strings). Check ReceiptRouter loads before GamePassConfig.
- **Data not saving:** Check DataStoreV2 `STORE_NAME` matches. Don't change the store name after first save.
- **Mobile broken:** Check MobileInputController is in StarterPlayerScripts, not ServerStorage.

---

## File Quick Reference

| Need | File | Location |
|------|------|----------|
| All Product IDs | `ProductIDReplacementGuide.md` | CANON/TRAIN-67/DOCS/ |
| Module placement | `StudioModulePlacementMap.md` | CANON/TRAIN-67/DOCS/ |
| Full pre-launch detail | `PreLaunchGoLivePlaybook.md` | CANON/TRAIN-67/DOCS/ |
| Rojo CI/CD | `RojoCICDOperationsGuide.md` | CANON/TRAIN-67/DOCS/ |
| Code integrity proof | `FINAL-CODE-INTEGRITY-REPORT.md` | CANON/TRAIN-67/DOCS/ |
| Game stats/features | `GAME-BIBLE-DEPLOY-STATUS-FINAL.md` | CANON/TRAIN-67/DOCS/ |

---

*30 minutes. 7 steps. Game goes live. MAKE MONEY.*
*Built by OB1 Run 94 — OVERNIGHT LAUNCH SPRINT Action 3/8*
