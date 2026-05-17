# 🚀 MASTER LAUNCH PLAYBOOK — Skibidi Zombie: Survive the Brainrots

> **One document. Everything launch. GitHub is truth.**
> **Merged from:** LAUNCH-DAY-PLAYBOOK.md, PreLaunchGoLivePlaybook.md, MASTER-LAUNCH-READINESS-PACKET.md, GO-NO-GO-Assessment.md, 10DayLaunchSprintAssessment.md, DAY1-HOTFIX-PLAYBOOK.md, LaunchAnnouncementPack.md, PostLaunchMonitorPlan.md
> **Date:** 2026-03-29 | **Author:** OB1 | **Artifact class:** 🔨 BUILD

---

## Executive Summary

**Code: 85% ship-ready. Content: 95% ready. GO/NO-GO Score: 63/100 → 80/100 after Michael's Studio work.**

| What | Status |
|------|--------|
| 41 Lua modules | ✅ CODE COMPLETE |
| 46 Product IDs | ❌ ALL PLACEHOLDERS — #1 revenue blocker |
| 3 critical code fixes | ❌ Studio required |
| Visual assets | ❌ Need icon + thumbnails |
| Launch docs | ✅ 11 docs validated |
| Discord server | ❌ Not deployed yet |

---

## 🔴 PART 1: THREE CRITICAL CODE FIXES (Studio Only)

### Fix 1: SecurityLayer Currency Cap
**File:** `SecurityLayer.lua` | **Time:** 5 min
**Bug:** `MAX_COINS_PER_ACTION = 200` — Day 99 boss + combo = ~2,980 coins. Every late-game boss kill flagged as exploit.
**Fix:** Make cap scale with difficulty:
```lua
CONFIG.MAX_COINS_PER_ACTION = function(dayNumber)
    local mult = DayScaling.GetDifficultyMult(dayNumber) or 1
    return math.floor(200 * mult)
end
```

### Fix 2: Tiger Tier Data Bug
**File:** `EloManager.lua` | **Time:** 2 min
**Bug:** `Tiger = { min = 2301, mid = 2500, max = 2400 }` — mid exceeds max. Tiger-B unreachable.
**Fix:**
```lua
Tiger = { min = 2301, mid = 2450, max = 2600 }
-- Also: ELO_CEILING = 2600
```

### Fix 3: FTUE Module Conflict
**Files:** FTUEController.lua, FTUEManager.lua, FTUEWiring.lua | **Time:** 5 min
**Bug:** Three modules compete for same DataStore keys and RemoteEvents.
**Fix:** Boot sequence loads ONLY `FTUEController.lua`. Remove `FTUEManager` and `FTUEWiring` from any require chain.

---

## 🔴 PART 2: 46 PRODUCT IDs (Creator Dashboard → Studio)

**🔴 ZERO ROBUX FLOW UNTIL THIS IS DONE.**

### Step 1: Create 5 Game Passes (~10 min)

**Creator Dashboard → Your Experience → Monetization → Passes**

| Pass | Price | Config Key in GamePassConfig.lua |
|------|-------|----------------------------------|
| 2x Coins | 99 R$ | `DOUBLE_COINS` → `GamePassId = 0` → replace with real ID |
| 2x XP | 149 R$ | `DOUBLE_XP` |
| Auto-Collect | 199 R$ | `AUTO_COLLECT` |
| VIP Access | 499 R$ | `VIP` |
| Ultimate Survivor Pack | 1,499 R$ | `ULTIMATE` |

### Step 2: Create 16 Developer Products (~10 min)

**Currency (6):**

| Product | Price | Config Key in DevProductsConfig.lua |
|---------|-------|-------------------------------------|
| 500 Survival Coins | 49 R$ | `PRODUCT_ID_COINS_500` |
| 2,500 Coins (+25% Bonus) | 199 R$ | `PRODUCT_ID_COINS_2500` |
| 10,000 Coins (+50% Bonus) | 699 R$ | `PRODUCT_ID_COINS_10000` |
| 25 Brainrot Gems | 99 R$ | `PRODUCT_ID_GEMS_25` |
| 100 Gems (+20% Bonus) | 349 R$ | `PRODUCT_ID_GEMS_100` |
| 500 Gems (+40% Bonus) | 1,499 R$ | `PRODUCT_ID_GEMS_500` |

**Consumables (6):**

| Product | Price | Config Key |
|---------|-------|------------|
| Instant Revive | 25 R$ | `PRODUCT_ID_REVIVE_1` |
| 5x Revive Pack | 99 R$ | `PRODUCT_ID_REVIVE_5` |
| 2x Coins Boost (30min) | 49 R$ | `PRODUCT_ID_BOOST_2X_COINS` |
| 2x XP Boost (30min) | 49 R$ | `PRODUCT_ID_BOOST_2X_XP` |
| Shield (5min) | 29 R$ | `PRODUCT_ID_BOOST_SHIELD` |
| MEGA Boost (all, 60min) | 149 R$ | `PRODUCT_ID_BOOST_MEGA` |

**Gacha (4):**

| Product | Price | Config Key |
|---------|-------|------------|
| 1x Survival Crate | 75 R$ | `PRODUCT_ID_GACHA_BASIC_1` |
| 10x Survival Crate (+1 Free) | 649 R$ | `PRODUCT_ID_GACHA_BASIC_10` |
| 1x Brainrot Crate | 149 R$ | `PRODUCT_ID_GACHA_PREMIUM_1` |
| 10x Brainrot Crate (+1 Free) | 1,299 R$ | `PRODUCT_ID_GACHA_PREMIUM_10` |

### Step 3: Remaining ~25 MonetizationOrchestrator + EconomyManager IDs

See `ProductIDReplacementGuide.md` for the full mapping of all remaining placeholder IDs.

---

## 🟡 PART 3: STUDIO INTEGRATION (30 min)

### Get Code Into Studio

**Option A — Rojo:** `rojo build default.project.json -o game.rbxl`

**Option B — Manual paste:** Follow `StudioModulePlacementMap.md`:

```
ServerScriptService/
  └── UnifiedServer.lua (.server.lua)
ServerStorage/Modules/
  └── [28+ modules]
StarterPlayerScripts/
  └── UnifiedClient.lua (.client.lua)
ReplicatedStorage/
  ├── Remotes/ (empty folder — auto-populated)
  ├── ClientModules/ (HUD, mobile, FTUE, sound, cosmetic)
  └── Shared/GameConfig.lua
```

### Boot Test
1. Studio → **Play** → Open Output
2. Look for: `[UnifiedServer] Boot complete — XX modules loaded`
3. Zero red error lines = PASS

---

## 🟡 PART 4: PUBLISH (10 min)

### Pre-publish checklist
- [ ] All Game Pass IDs are real (not 0)
- [ ] All Product IDs are real (not 0)
- [ ] Boot test passes clean
- [ ] Icon uploaded (512×512 PNG)
- [ ] At least 1 thumbnail uploaded (1920×1080)
- [ ] Description filled (copy from `STORE-LISTING-COPY.md`)

### Publish
1. Studio → File → **Publish to Roblox**
2. Game Settings: Name `Skibidi Zombie: Survive the Brainrots 🧟💀`, Genre Horror+Fighting, Max 20, All devices ✅
3. Creator Dashboard → set game to **Public**

### Verify Live
1. Open Roblox app on phone → search → join
2. Complete FTUE → kill enemies → verify coins earned
3. Open shop → verify purchase prompts show correct prices
4. ✅ LIVE AND EARNING

---

## 🟢 PART 5: LAUNCH DAY OPS

### Hour-by-Hour Timeline

| Time | Action |
|------|--------|
| T+0 | Game goes Public. Share link. Monitor CCU. |
| T+15min | Check: server crashes? Error spikes? |
| T+30min | Check: CCU growing? Session >3min? Purchase attempts? |
| T+1hr | Full dashboard review. First revenue check. Mobile playtest. |
| T+2hr | Economy check: coin balances in expected range? |
| T+4hr | Comprehensive: CCU trend, revenue, error rate, player feedback |
| T+8hr | Set BattlePass SEASON_START. Check exploit reports. |
| T+24hr | Full Day 1 report: CCU, revenue, errors, top 3 issues & wins |

### Key Metrics

| Metric | Target | 🔴 Alert |
|--------|--------|----------|
| Peak CCU | 10+ Day 1 | <3 |
| Error rate | <1% | >3% |
| FTUE completion | >70% | <40% |
| Avg session | >5 min | <2 min |
| D1 retention | >20% | <10% |

---

## 🟢 PART 6: LAUNCH ANNOUNCEMENTS

### Discord — #announcements
```
🚀🧟 SKIBIDI ZOMBIE: SURVIVE THE BRAINROTS IS LIVE! 🧟🚀

The brainrots have arrived. Your only weapon? ENGLISH POWER.

⚔️ Fight 5 types of brainrot enemies
🧠 Answer English questions to deal damage
🔥 Build combos for MASSIVE multipliers
💰 Earn coins, gems, and exclusive cosmetics
🏆 Compete on global leaderboards

Play NOW: [game link]

🎁 LAUNCH GIVEAWAY: Like this message for 500 Premium Gems!
```

### Twitter/X
```
🧟 IT'S HERE.
Skibidi Zombie: Survive the Brainrots is LIVE on Roblox.
Fight brainrot zombies with English power. Build combos. Survive infinite waves. 💰
🎮 Play free: [link]
RT for 500 gems 💎
#Roblox #SkibidiZombie #Brainrot #Gaming
```

### Launch Week Giveaways

| Day | Prize | Platform | Condition |
|-----|-------|----------|-----------|
| 1 | 500 Premium Gems | Discord | Like announcement |
| 3 | Exclusive cosmetic | Twitter | RT + Follow |
| 5 | 1000 Coins | Discord | Post screenshot |
| 7 | "Brainrot Lord" title | Discord | Highest wave |

---

## 🔴 PART 7: EMERGENCY PLAYBOOK

### Top 5 Launch-Day Fires

| Issue | Fix |
|-------|-----|
| **Game crashes on join** | Output → find red error → module in wrong folder → `StudioModulePlacementMap.md` |
| **Purchases fail silently** | Product IDs still `0`, or ReceiptRouter not loading first |
| **Mobile controls don't work** | MobileInputController in wrong folder → move to StarterPlayerScripts |
| **Enemies not spawning** | WaveManager/EnemyFactory missing from ServerStorage/Modules/ |
| **Data not saving** | Game Settings → Enable API Services = ON. NEVER change STORE_NAME after first save |

### Emergency Kill Switches

| Switch | When | How |
|--------|------|-----|
| **Disable Monetization** | Duplication exploit, compliance | Set all prices to 999,999 R$ |
| **Private the Game** | Game-breaking exploit | Dashboard → Access → Private |
| **Server Shutdown** | Data corruption | Studio → Shut Down All Servers |
| **Disable Gacha** | Compliance emergency | Add `return` at top of crate open handler |

### Economy Balance Levers (No Code Logic Changes)

| Lever | File | Effect |
|-------|------|--------|
| `BASE_KILL_REWARD` | EconomyManager.lua | ↑ = faster earn, ↓ = more purchase pressure |
| `COMBO_MULTIPLIER` caps | CombatSystem.lua | ↑ = more coins flowing, ↓ = tighter economy |
| `BOSS_KILL_REWARD` | EconomyManager.lua | ↑ = boss farming lucrative, ↓ = bosses unrewarding |
| Phase multipliers | DayScaling.lua | Tune HP/damage/reward per phase |

---

## 📊 GO/NO-GO Scorecard

| Category | Current | After Studio Work |
|----------|---------|-------------------|
| Core Game Loop | 6/10 | 9/10 |
| Data Persistence | 6/10 | 8/10 |
| Security | 7/10 | 8/10 |
| Monetization | 8/10 | 10/10 |
| User Experience | 6/10 | 8/10 |
| Social & Retention | 7/10 | 7/10 |
| Content | 5/10 | 7/10 |
| Infrastructure | 7/10 | 9/10 |
| Testing | 3/10 | 6/10 |
| Marketing | 8/10 | 8/10 |
| **TOTAL** | **63/100** | **80/100 → GO** |

---

## 📋 Quick Reference Files

| Need | File | Path |
|------|------|------|
| Module placement | StudioModulePlacementMap.md | CANON/TRAIN-67/DOCS/ |
| All Product IDs | ProductIDReplacementGuide.md | CANON/TRAIN-67/DOCS/ |
| Code integrity proof | FINAL-CODE-INTEGRITY-REPORT.md | CANON/TRAIN-67/DOCS/ |
| Economy break tests | STAGE-5-ECONOMY-BREAK-TEST.md | CANON/TRAIN-67/BATTLE-REPORT/ |
| Rojo CI/CD | RojoCICDOperationsGuide.md | CANON/TRAIN-67/DOCS/ |
| Discord setup | DISCORD-SERVER-SETUP-GUIDE.md | CANON/TRAIN-67/DOCS/ |
| Store listing | STORE-LISTING-COPY.md | CANON/TRAIN-67/DOCS/ |
| Week 1 calendar | WEEK1-CONTENT-CALENDAR.md | CANON/TRAIN-67/DOCS/ |
| Day 1 hotfix detail | DAY1-HOTFIX-PLAYBOOK.md | CANON/TRAIN-67/DOCS/ |
| Post-launch monitoring | PostLaunchMonitorPlan.md | CANON/TRAIN-67/DOCS/ |

---

## Source Documents Merged

| Document | Size | Key Content |
|----------|------|-------------|
| LAUNCH-DAY-PLAYBOOK.md | 7KB | 7-step launch procedure |
| PreLaunchGoLivePlaybook.md | 15KB | 6-phase comprehensive checklist |
| MASTER-LAUNCH-READINESS-PACKET.md | 11KB | System health dashboard, code grades |
| GO-NO-GO-Assessment.md | 3KB | 63/100 scoring, path to 70+ |
| 10DayLaunchSprintAssessment.md | 15KB | Full sprint calendar, risk register |
| DAY1-HOTFIX-PLAYBOOK.md | 13KB | Top 10 issues, kill switches, economy levers |
| LaunchAnnouncementPack.md | 2KB | Discord, Twitter, TikTok, Reddit templates |
| PostLaunchMonitorPlan.md | 2KB | Monitoring schedule, metrics, incident response |

---

*GOAL: MAKE MONEY. 30 minutes of Studio work → game goes live → revenue starts.*
*Built by OB1 — Deferred Pipeline Execution, 2026-03-29*
