# Pre-Launch Go-Live Playbook — Skibidi Zombie: Survive the Brainrots

> **GOAL: MAKE MONEY.**
> **Artifact Class:** 🔨 BUILD
> **Run:** 79 | **Date:** 2026-03-28 11:00 ICT
> **Active Mission:** 100% Roblox — MAKE MONEY
> **Deadline:** 🔴 8 DAYS TO INCUBATOR (Apr 6, 2026)
> **Time estimate:** ~2 hours active work by Michael
> **Sources:** GO-NO-GO-Assessment.md (63/100), PublishChecklist.md, MonetizationArchitectureDeepDive.md, StudioModulePlacementMap.md, StudioIntegrationGuide.md, StudioSmokeTestScript.md, GamePageSEO.md, all 41+ Lua modules
> **Cross-repo sources:** 6 files from `hobbs0011/Phoenix-Rising-Protocol-Ultimate`

---

## 0. What This Document Is

This is Michael's **single playbook** to go from "code on GitHub" to "published game earning Robux." Every step is ordered. Every placeholder is mapped. Every config value is listed. No guessing.

**Current score: 63/100 (CONDITIONAL GO). Target: 73/100 (GO). Gap: 10 points = ~2 hours.**

---

## Phase 1: Studio Setup (30 min) → +3 points

### 1.1 Create the Game

1. Open **Roblox Studio** → New Baseplate
2. Save As → Name: `Skibidi Zombie: Survive the Brainrots`
3. Game Settings:
   - **Name:** `Skibidi Zombie: Survive the Brainrots 🧟💀`
   - **Genre:** Horror + Fighting
   - **Max Players:** 20
   - **Allow Copying:** OFF
   - **Allow Third-Party Sales:** OFF
   - **Enable Studio Access to API Services:** ON
   - **Collaborative Editing:** OFF
   - **Playable Devices:** Phone ✅ Tablet ✅ PC ✅ Xbox ✅

### 1.2 Copy All Code into Studio

Follow `StudioModulePlacementMap.md` exactly. Summary of folder structure:

```
game
├── ServerScriptService/
│   └── MainBoot.lua                    ← UnifiedServer.lua (the single server entry point)
│
├── ServerStorage/
│   ├── Modules/
│   │   ├── CombatSystem.lua
│   │   ├── QuestionBankV2.lua
│   │   ├── EnemyFactory.lua
│   │   ├── WaveManager.lua
│   │   ├── RewardBridge.lua
│   │   ├── DataStoreV2.lua
│   │   ├── EconomyManager.lua
│   │   ├── SecurityLayer.lua
│   │   ├── AnomalyDetector.lua
│   │   ├── MonetizationServer.lua
│   │   ├── GamePassConfig.lua          ← NEEDS REAL IDs (see Phase 2)
│   │   ├── DevProductsConfig.lua       ← NEEDS REAL IDs (see Phase 2)
│   │   ├── ReceiptRouter.lua
│   │   ├── GachaManager.lua
│   │   ├── BattlePass.lua
│   │   ├── DailyRewards.lua
│   │   ├── ReferralSystem.lua
│   │   ├── GuildManager.lua
│   │   ├── LeaderboardManager.lua
│   │   ├── ChallengeSystem.lua
│   │   ├── WorldBossManager.lua
│   │   ├── MonetizationOrchestrator.lua
│   │   ├── AnalyticsService.lua
│   │   ├── FTUEController.lua
│   │   ├── CosmeticController.lua
│   │   ├── EloManager.lua
│   │   ├── EnglishRewardsManager.lua
│   │   └── MobileInputController.lua
│   └── Data/
│       └── (question bank JSON files)
│
├── StarterPlayer/
│   └── StarterPlayerScripts/
│       └── ClientBoot.lua              ← UnifiedClient.lua (the single client entry point)
│
├── ReplicatedStorage/
│   ├── Remotes/                        ← Folder for RemoteEvents (auto-created by UnifiedServer)
│   ├── ClientModules/
│   │   ├── HUDController.lua
│   │   ├── MobileInputController.lua   ← Client copy
│   │   ├── FTUEClient.lua
│   │   ├── SoundManager.lua
│   │   └── CosmeticClient.lua
│   └── Shared/
│       └── GameConfig.lua              ← Shared constants
│
└── StarterGui/
    └── (UI ScreenGuis — HUD, Shop, FTUE overlay)
```

**Copy method:** Open each `.lua` file from GitHub (`CANON/TRAIN-67/CODE/`), create a ModuleScript in the correct Studio location, paste the code.

### 1.3 Create RemoteEvents Folder

In **ReplicatedStorage**, create a Folder named `Remotes`. UnifiedServer.lua auto-creates all RemoteEvents on boot, but the folder must exist.

### 1.4 Boot Test

1. Click **Play** in Studio
2. Open **Output** window (View → Output)
3. Look for: `[UnifiedServer] Boot complete — XX modules loaded`
4. Check for zero errors (red lines)
5. Check for zero "Infinite yield" warnings

**Expected:** All 28+ modules initialize. All RemoteEvents created. Clean boot.

**If errors:** Note the exact error message. Most likely causes:
- Missing module in wrong folder → check placement map
- Typo in require path → check folder names match exactly
- Missing RemoteEvent → ensure Remotes folder exists

---

## Phase 2: Roblox Creator Dashboard — Product IDs (30 min) → +3 points

**🔴 THIS IS THE #1 REVENUE BLOCKER. Zero Robux flow until this is done.**

### 2.1 Create Game Passes (5 total)

Go to: **Creator Dashboard → Your Game → Monetization → Game Passes → Create**

| # | Pass Name | Price (R$) | Description | Config Key |
|---|-----------|-----------|-------------|------------|
| 1 | 2x Coins | 99 | Double all coin earnings permanently! Stack with other boosts. | `DOUBLE_COINS` |
| 2 | 2x XP | 149 | Level up 2x faster! Battle Pass XP doubled too. | `DOUBLE_XP` |
| 3 | Auto-Collect | 199 | Auto-collect drops, loot, and rewards. Never miss a pickup. | `AUTO_COLLECT` |
| 4 | VIP Access | 499 | VIP lobby, purple name, exclusive emotes, bonus daily crate. | `VIP` |
| 5 | Ultimate Survivor Pack | 1,499 | ALL game passes + exclusive gold aura + 500 starter gems. | `ULTIMATE` |

**After creating each pass:**
1. Copy the **Game Pass ID** from the URL or dashboard
2. Open `GamePassConfig.lua` in Studio
3. Find the corresponding entry and replace `GamePassId = 0` with the real ID

```lua
-- Example: Find this line in GamePassConfig.lua
["DOUBLE_COINS"] = { GamePassId = 0, ... }
-- Replace with:
["DOUBLE_COINS"] = { GamePassId = 123456789, ... }
```

### 2.2 Create Developer Products (16 total)

Go to: **Creator Dashboard → Your Game → Monetization → Developer Products → Create**

**Currency Packs:**

| # | Product Name | Price (R$) | Config Key |
|---|-------------|-----------|------------|
| 1 | 100 Survival Coins | 49 | `COINS_100` |
| 2 | 500 Survival Coins | 199 | `COINS_500` |
| 3 | 1,500 Survival Coins | 499 | `COINS_1500` |
| 4 | 25 Brainrot Gems | 99 | `GEMS_25` |
| 5 | 100 Brainrot Gems | 349 | `GEMS_100` |
| 6 | 500 Brainrot Gems | 1,499 | `GEMS_500` |

**Consumables:**

| # | Product Name | Price (R$) | Config Key |
|---|-------------|-----------|------------|
| 7 | Instant Revive | 25 | `REVIVE_1` |
| 8 | 5x Revive Pack | 99 | `REVIVE_5` |
| 9 | 2x Coins Boost (30min) | 29 | `BOOST_COINS` |
| 10 | 2x XP Boost (30min) | 49 | `BOOST_XP` |
| 11 | Shield (60s invincibility) | 49 | `BOOST_SHIELD` |
| 12 | Mega Boost (all 3, 30min) | 149 | `BOOST_MEGA` |

**Gacha:**

| # | Product Name | Price (R$) | Config Key |
|---|-------------|-----------|------------|
| 13 | Survival Crate (1x pull) | 75 | `GACHA_BASIC_1` |
| 14 | Survival Crate (10x pull) | 649 | `GACHA_BASIC_10` |
| 15 | Brainrot Crate (1x pull) | 149 | `GACHA_PREMIUM_1` |
| 16 | Brainrot Crate (10x pull) | 1,299 | `GACHA_PREMIUM_10` |

**After creating each product:**
1. Copy the **Product ID** from the dashboard
2. Open `DevProductsConfig.lua` in Studio
3. Replace `ProductId = 0` with the real ID

```lua
-- Example: Find this line
["COINS_100"] = { ProductId = 0, ... }
-- Replace with:
["COINS_100"] = { ProductId = 987654321, ... }
```

### 2.3 Verification

After all IDs are entered:
1. Save in Studio
2. Click **Play**
3. Open Output → search for `[MonetizationServer]` or `[GamePassConfig]` log lines
4. Verify: no "ProductId 0" warnings
5. Test: use Studio's command bar to simulate a purchase prompt

---

## Phase 3: Visual Assets (20 min) → +2 points

### 3.1 Game Icon

- **Size:** 512×512 PNG
- **Content:** Main character or zombie with game title
- **Test:** Must be readable at 50×50 (mobile game grid)
- **Upload:** Creator Dashboard → Your Game → Basic Settings → Icon

### 3.2 Thumbnails

- **Size:** 1920×1080 (at least 2)
- **Content:** Gameplay screenshots or promotional art
- **Upload:** Creator Dashboard → Your Game → Basic Settings → Thumbnails

### 3.3 Game Page SEO

Copy the full description from `GamePageSEO.md`:
- Creator Dashboard → Your Game → Basic Settings → Description
- Include all keywords: skibidi, zombie, brainrot, survival, English, learn
- Add social links (Discord invite)

---

## Phase 4: Integration Test (30 min) → +2 points

Run through `StudioSmokeTestScript.md` test cases:

### Critical Path Tests (must pass for GO)

| # | Test | How | Expected | Pass? |
|---|------|-----|----------|-------|
| 1 | Clean boot | Play in Studio | "Boot complete" in Output | ⬜ |
| 2 | FTUE triggers | Join as new player | 9-step tutorial starts | ⬜ |
| 3 | Combat works | Complete FTUE, fight enemy | Question appears, answer damages enemy | ⬜ |
| 4 | Wave progresses | Kill all enemies in wave 1 | Wave 2 starts | ⬜ |
| 5 | Data saves | Play 2 min, leave, rejoin | Coins/XP persist | ⬜ |
| 6 | Economy works | Earn coins, open shop | Can spend coins | ⬜ |
| 7 | Mobile HUD | Test on mobile device or emulator | All buttons reachable with thumbs | ⬜ |
| 8 | Security active | Try duplicate request | Request blocked | ⬜ |

### Revenue Path Tests (must pass for money)

| # | Test | How | Expected | Pass? |
|---|------|-----|----------|-------|
| 9 | Game Pass prompt | Trigger purchase flow | Roblox purchase UI appears with correct price | ⬜ |
| 10 | Dev Product prompt | Die, trigger revive | Revive prompt shows 25 R$ | ⬜ |
| 11 | Receipt processes | Complete test purchase | ReceiptRouter handles without error | ⬜ |
| 12 | Battle Pass shows | Open Battle Pass UI | Season 1 with 50 tiers visible | ⬜ |

**Scoring: 8+/12 critical tests pass = GO. <8 = FIX FIRST.**

---

## Phase 5: Mobile Device Test (15 min) → +1 point

1. Publish game as **Private** first
2. Open Roblox app on phone/tablet
3. Join the private game
4. Test:
   - [ ] Game loads without crash
   - [ ] HUD elements fit screen (no overlap)
   - [ ] Touch controls work (tap to select answers)
   - [ ] Text is readable (not too small)
   - [ ] FPS stays above 30
   - [ ] FTUE works with touch only

---

## Phase 6: Publish & Go Live (10 min) → +1 point

### Pre-publish checklist (final gate)

- [ ] All Game Pass IDs are real (not 0)
- [ ] All Product IDs are real (not 0)
- [ ] Boot test passes clean
- [ ] At least 6/8 critical tests pass
- [ ] Icon uploaded
- [ ] At least 1 thumbnail uploaded
- [ ] Description filled with SEO copy
- [ ] Game name correct

### Publish

1. Studio → File → Publish to Roblox
2. Creator Dashboard → Your Game → set to **Public**
3. Verify: game appears in Roblox search

### Post-publish (first hour)

1. Join the game as a player
2. Complete FTUE
3. Verify a purchase prompt appears
4. Check Output/Developer Console for errors
5. Monitor CCU in Creator Dashboard

---

## Quick Reference: All Placeholder Values to Replace

### GamePassConfig.lua — 5 IDs needed

| Config Key | Current Value | Replace With |
|-----------|--------------|-------------|
| `DOUBLE_COINS` → `GamePassId` | `0` | Real ID from Dashboard |
| `DOUBLE_XP` → `GamePassId` | `0` | Real ID from Dashboard |
| `AUTO_COLLECT` → `GamePassId` | `0` | Real ID from Dashboard |
| `VIP` → `GamePassId` | `0` | Real ID from Dashboard |
| `ULTIMATE` → `GamePassId` | `0` | Real ID from Dashboard |

### DevProductsConfig.lua — 16 IDs needed

| Config Key | Current Value | Replace With |
|-----------|--------------|-------------|
| `COINS_100` → `ProductId` | `0` | Real ID from Dashboard |
| `COINS_500` → `ProductId` | `0` | Real ID from Dashboard |
| `COINS_1500` → `ProductId` | `0` | Real ID from Dashboard |
| `GEMS_25` → `ProductId` | `0` | Real ID from Dashboard |
| `GEMS_100` → `ProductId` | `0` | Real ID from Dashboard |
| `GEMS_500` → `ProductId` | `0` | Real ID from Dashboard |
| `REVIVE_1` → `ProductId` | `0` | Real ID from Dashboard |
| `REVIVE_5` → `ProductId` | `0` | Real ID from Dashboard |
| `BOOST_COINS` → `ProductId` | `0` | Real ID from Dashboard |
| `BOOST_XP` → `ProductId` | `0` | Real ID from Dashboard |
| `BOOST_SHIELD` → `ProductId` | `0` | Real ID from Dashboard |
| `BOOST_MEGA` → `ProductId` | `0` | Real ID from Dashboard |
| `GACHA_BASIC_1` → `ProductId` | `0` | Real ID from Dashboard |
| `GACHA_BASIC_10` → `ProductId` | `0` | Real ID from Dashboard |
| `GACHA_PREMIUM_1` → `ProductId` | `0` | Real ID from Dashboard |
| `GACHA_PREMIUM_10` → `ProductId` | `0` | Real ID from Dashboard |

### Other Config Values to Verify

| File | Key | Current | Action |
|------|-----|---------|--------|
| `DataStoreV2.lua` | `STORE_NAME` | `"SkibidiZombie_PlayerData_v2"` | Verify — do NOT change after first save |
| `BattlePass.lua` | `SEASON_START` | TBD | Set to publish date |
| `BattlePass.lua` | `SEASON_END` | TBD | Set to publish date + 30 days |
| `AnalyticsService.lua` | `GAME_KEY` | Placeholder | Set after GameAnalytics setup (Phase 2, post-launch) |
| `DiscordBot` | Webhook URL | Not set | Create Discord server first |

---

## Timeline: 8-Day Countdown to Incubator

| Day | Date | Action | Owner | Points |
|-----|------|--------|-------|--------|
| **TODAY** | Mar 28 (Sat) | Phase 1: Studio setup + code copy | Michael | +3 |
| **TODAY** | Mar 28 (Sat) | Phase 2: Create all Dashboard IDs | Michael | +3 |
| **TODAY** | Mar 28 (Sat) | Phase 3: Icon + thumbnails | Michael | +2 |
| Sun | Mar 29 | Phase 4: Integration tests + bug fixes | Michael | +2 |
| Sun | Mar 29 | Phase 5: Mobile test | Michael | +1 |
| Mon | Mar 30 | Phase 6: Publish (Public) | Michael | — |
| Mon-Tue | Mar 30-31 | Bug fixes from first 24h monitoring | Michael + Agent-99 | — |
| Wed-Fri | Apr 1-4 | Battle Pass Season 1 starts, Discord launch | Michael | — |
| **Sat** | **Apr 5** | Polish, optimize, prepare incubator pitch | Michael | — |
| **Sun** | **Apr 6** | 🔴 INCUBATOR DEADLINE | — | — |

**If Michael starts Phase 1-3 today (Saturday), the game can be live by Monday with 3 full days of player data before incubator.**

---

## GO/NO-GO Scorecard

| Category | Weight | Current | After This Playbook |
|----------|--------|---------|-------------------|
| Core Game Loop | 6/10 | Untested | 9/10 (tested) |
| Data Persistence | 6/10 | Untested | 8/10 (tested) |
| Security | 7/10 | Designed | 8/10 (runtime verified) |
| Monetization | 8/10 | IDs missing | 10/10 (live + earning) |
| User Experience | 6/10 | Untested | 8/10 (mobile tested) |
| Social & Retention | 7/10 | Built | 7/10 (no change) |
| Content | 5/10 | No assets | 7/10 (icon + thumbnails) |
| Infrastructure | 7/10 | Documented | 9/10 (deployed) |
| Testing | 3/10 | Zero executed | 6/10 (smoke tests done) |
| Marketing | 8/10 | Planned | 8/10 (no change yet) |
| **TOTAL** | **63/100** | | **80/100 → GO** |

---

*Built for Skibidi Zombie: Survive the Brainrots by Pulse Run 79.*
*GOAL: MAKE MONEY. 8 days to incubator. Every hour counts.*
