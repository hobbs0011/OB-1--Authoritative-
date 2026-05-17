# 🚑 DAY 1 HOTFIX PLAYBOOK — Survive a Brainrot

> **One document. Every launch-day fire has a plan.**
> **Run 97** | 2026-03-29 05:00 ICT | OVERNIGHT LAUNCH SPRINT Action 6/8
> **Sources:** LAUNCH-DAY-PLAYBOOK.md, FINAL-CODE-INTEGRITY-REPORT.md, MonetizationArchitectureDeepDive.md, STAGE-5-ECONOMY-BREAK-TEST.md, EconomyManager.lua, DayScaling.lua
> **Purpose:** Common Roblox launch issues, monitoring checklist, economy balance levers, emergency kill switches, rollback procedure.

---

## 📊 Launch Day Monitoring Checklist

Check these in order every 30 minutes for the first 4 hours, then hourly for 24 hours.

### Creator Dashboard (create.roblox.com)
| Metric | Where to Find | Healthy Range | Red Flag |
|---|---|---|---|
| **CCU (Concurrent Users)** | Analytics → Real Time | Trending up from share/post | Stuck at 0 after 30min = broken join |
| **Avg Session Time** | Analytics → Engagement | >3 min | <1 min = crash on join or FTUE broken |
| **Revenue** | Monetization → Revenue | Any R$ in first hour | 0 after 2h with CCU = purchase flow broken |
| **Server Crashes** | Analytics → Performance | 0 | Any = check Output logs |
| **Error Rate** | Analytics → Performance | <1% | >5% = halt and investigate |
| **Join Rate** | Analytics → Funnels | >80% success | <50% = place is broken or too large |

### In-Studio Test (keep Studio open)
| Check | How | Pass |
|---|---|---|
| Join as second player | Studio → Test → 2 Players | Both load, see each other |
| Kill enemies | Attack any SkibidiZombie | Coins appear in HUD |
| Open shop | Click shop UI | Products show with real prices |
| Buy something | Purchase cheapest dev product | Receipt processes, reward granted |
| Die and respawn | Let enemies kill you | Respawn works, data persists |
| Mobile test | Roblox app on phone → join | Touch controls work, HUD visible |

---

## 🔥 Top 10 Launch-Day Issues & Fixes

### Issue 1: "Game crashes immediately on join"
**Symptom:** Players see loading screen then get kicked.
**Cause (90%):** A `require()` path is wrong — module not in expected folder.
**Fix:**
1. Studio → Play → check Output window for red text
2. Error will say `Module not found: [ModuleName]`
3. Compare module placement against `StudioModulePlacementMap.md`
4. Move the module to the correct folder
5. Re-publish

### Issue 2: "UnifiedServer boot fails — modules not loading"
**Symptom:** Output shows `[UnifiedServer] Boot complete — 0 modules loaded` or errors during init.
**Cause:** UnifiedServer.lua needs to be a Script (.server.lua), not a ModuleScript.
**Fix:**
1. In Studio: right-click UnifiedServer → check it's under ServerScriptService
2. Make sure the file is named `UnifiedServer.server.lua` (NOT just `.lua`)
3. Same for UnifiedClient → must be `.client.lua` under StarterPlayerScripts
4. Re-publish

### Issue 3: "Players can't buy anything — purchases fail silently"
**Symptom:** Purchase prompt shows but nothing happens after buying.
**Cause:** Product IDs are still placeholder (0) or ProcessReceipt not firing.
**Fix:**
1. Open DevProductsConfig.lua → verify all `PRODUCT_ID_*` keys have real numeric IDs
2. Open GamePassConfig.lua → verify all `GamePassId` fields are real (not 0)
3. Verify ReceiptRouter.lua loads BEFORE GamePassConfig in UnifiedServer boot order
4. Studio → Output → look for `[ReceiptRouter]` log messages
5. Re-publish

### Issue 4: "Mobile controls don't work"
**Symptom:** Phone players can't attack, move, or interact.
**Cause:** MobileInputController.lua is in wrong folder or not loading.
**Fix:**
1. Confirm `MobileInputController.lua` is in StarterPlayerScripts (client-side)
2. Check Output for any `MobileInputController` errors
3. Test: join on phone → tap screen → attack animation should fire
4. If no attack: check RemoteEvent `CombatInput` exists in ReplicatedStorage/Remotes/

### Issue 5: "Enemies not spawning"
**Symptom:** Map is empty, no zombies appear.
**Cause:** WaveManager or EnemyFactory not loading, or spawn points missing.
**Fix:**
1. Output → look for `[WaveManager]` or `[EnemyFactory]` errors
2. Check that ServerStorage/Modules/ contains both files
3. Verify workspace has spawn point parts (Folder called "EnemySpawns" or equivalent)
4. Emergency: manually place a Part named "SpawnPoint1" in workspace

### Issue 6: "Data not saving between sessions"
**Symptom:** Players lose coins/progress when they rejoin.
**Cause:** DataStoreV2 STORE_NAME mismatch or DataStore service disabled.
**Fix:**
1. Game Settings → Security → Enable Studio Access to API Services = ON
2. Game Settings → Security → Enable API Services (for published) = ON
3. Check DataStoreV2.lua `STORE_NAME` matches between all modules
4. ⚠️ **NEVER change the STORE_NAME after players have saved data** — this creates a new empty store

### Issue 7: "Economy is broken — infinite coins"
**Symptom:** Players have millions of coins within minutes.
**See:** [Economy Balance Levers](#-economy-balance-levers) section below.

### Issue 8: "Server lag / frame drops"
**Symptom:** Players teleport, attacks don't register, general choppiness.
**Cause:** Too many enemies, unoptimized loops, or DataStore throttling.
**Fix:**
1. Check `MaxActiveEnemies` in WaveManager — should be 30 max
2. Check `MaxTownZombies` — should be 15 max
3. If lag with <10 CCU: check Output for DataStore throttling warnings
4. Emergency lever: reduce `MaxActiveEnemies` to 15 temporarily

### Issue 9: "Battle Pass not working"
**Symptom:** XP bar doesn't move, premium track locked even after purchase.
**Cause:** `SEASON_START` not set in BattlePass.lua.
**Fix:**
1. Open BattlePass.lua
2. Set `SEASON_START` to launch date (e.g., `"2026-03-29"`)
3. Set `SEASON_END` to 30 days later
4. Re-publish

### Issue 10: "Game works in Studio but not published"
**Symptom:** Everything fine locally, broken for real players.
**Cause:** HttpService disabled, API keys not set, or place not published to correct universe.
**Fix:**
1. Confirm game is published: File → Publish to Roblox (not Save to File)
2. Confirm place is set to Public in Creator Dashboard
3. Confirm max players > 1
4. Try joining from a different Roblox account

---

## 💰 Economy Balance Levers

These are the numbers you can tune WITHOUT touching code logic — just change the value and re-publish.

### Coin Earn Rate (EconomyManager.lua / CombatRewardsManager.lua)
| Lever | Current Value | Effect of Increase | Effect of Decrease |
|---|---|---|---|
| `BASE_KILL_REWARD` | ~5 coins | Players earn faster → less incentive to buy | Slower grind → more purchase pressure |
| `COMBO_MULTIPLIER` caps | 2x-5x at streaks | Higher combos = more coins flowing in | Tighter economy |
| `DAILY_COIN_CAP` | Varies by tier | Removes daily hard cap → inflation risk | Too tight = frustration |
| `BOSS_KILL_REWARD` | ~100 coins | Boss farming becomes lucrative | Bosses feel unrewarding |

### Coin Sink Rate (EconomyManager.lua)
| Lever | Current Value | Effect of Increase | Effect of Decrease |
|---|---|---|---|
| `MARKETPLACE_TAX` | 10% | More coins destroyed per trade → deflation | Less sink → inflation |
| Gacha pull cost (coins) | 500 Survival Coins | Main coin sink per pull | Cheaper = faster drain but less scarcity |
| Shop item prices | Varies | Higher prices = stronger sink | Lower = faster acquisition but less revenue |

### Day Scaling (DayScaling.lua)
| Lever | Description | Tune When |
|---|---|---|
| Phase multipliers (6 phases) | HP/damage/reward scaling per phase | Players dying too fast or enemies too easy |
| `spawn_weight` tables | Which enemies appear per phase | Too many hard enemies early = quit; too easy late = boredom |
| Boss HP/damage scaling | Boss difficulty per day | Bosses too easy = no challenge; too hard = rage quit |

### Emergency Economy Fix Procedure
1. **Identify:** Check if top players have >10x expected coins for their playtime
2. **Diagnose:** Is it a reward exploit (giving too many coins) or a missing sink (not consuming coins)?
3. **Patch:** Adjust the specific lever in the table above
4. **Re-publish:** File → Publish to Roblox
5. **Note:** Existing player balances are NOT affected — only future earn/spend rates change

---

## 🔴 Emergency Kill Switches

These are "break glass" actions for critical situations.

### Kill Switch 1: Disable Monetization (Revenue Emergency)
**When:** Purchases are granting wrong items, duplication exploits, or Roblox compliance issue.
**How:**
1. Creator Dashboard → Monetization → Developer Products
2. Set all product prices to 999,999 R$ (effectively disabling purchase)
3. Or: In DevProductsConfig.lua, wrap all handlers in `if false then ... end`
4. Re-publish immediately

### Kill Switch 2: Private the Game (Critical Break)
**When:** Game-breaking exploit, offensive content, or data corruption.
**How:**
1. Creator Dashboard → Game Settings → Access → set to **Private**
2. This immediately blocks ALL new joins
3. Current players remain until they leave
4. Fix the issue → re-publish → set back to Public

### Kill Switch 3: Server Shutdown (Data Emergency)
**When:** Data corruption, infinite item duplication, or economy-destroying exploit.
**How:**
1. Studio → Game → Shut Down All Servers
2. This kicks ALL players immediately
3. Fix → Re-publish → Players can rejoin

### Kill Switch 4: Disable Trading (Economy Emergency)
**When:** Duplication exploit via trading, or economy inflation spiral.
**How:**
1. In MonetizationServer.lua: find trade handler
2. Add `return` at top of trade function (rejects all trades)
3. Re-publish
4. Investigate and fix the root cause before re-enabling

### Kill Switch 5: Disable Gacha (Compliance Emergency)
**When:** Roblox flags gacha as non-compliant, or gacha is dropping wrong items.
**How:**
1. In GachaManager.lua: find crate open handler
2. Add `return` at top (blocks all crate opens)
3. Re-publish
4. Fix drop rates or compliance issue

---

## 🔄 Rollback Procedure

### Option A: Quick Rollback (Rojo/GitHub)
If using Rojo CI/CD pipeline:
1. `git log` — find the last known-good commit SHA
2. `git checkout <SHA>`
3. `rojo build default.project.json -o game.rbxl`
4. Open in Studio → Publish

### Option B: Manual Rollback (Studio)
1. Studio → File → Recent Games → select the previous published version
2. Or: Version History → select a working version → Restore
3. Re-publish the restored version

### Option C: Selective File Rollback (GitHub)
If only one module is broken:
1. Go to `hobbs0011/Phoenix-Rising-Protocol-Ultimate` on GitHub
2. Navigate to the broken file in `CANON/TRAIN-67/CODE/`
3. Click "History" → find the last working version
4. Copy the file content → paste into Studio → Re-publish

### Rollback Decision Matrix
| Situation | Action |
|---|---|
| One module broken, rest fine | Option C — selective file rollback |
| Multiple modules broken | Option A or B — full rollback |
| Data corruption | Kill Switch 3 (shutdown) → Option B → clear corrupted DataStore keys |
| Exploit discovered | Kill Switch 2 (private) → investigate → patch → re-publish |
| Economy broken but game works | Tune economy levers (no rollback needed) |

---

## 📋 Hour-by-Hour Launch Day Timeline

| Time | Action |
|---|---|
| **T+0** | Game goes Public. Share link. Monitor CCU. |
| **T+15min** | Check: any server crashes? Any error spikes? |
| **T+30min** | Check: CCU growing? Session time >3min? Any purchase attempts? |
| **T+1hr** | Full dashboard review. First revenue check. Mobile playtest. |
| **T+2hr** | Economy check: are coin balances in expected range? |
| **T+4hr** | Comprehensive review: CCU trend, revenue, error rate, player feedback |
| **T+8hr** | Set BattlePass SEASON_START if not done. Check for any exploit reports. |
| **T+12hr** | Day-half review: total revenue, peak CCU, worst bug identified |
| **T+24hr** | Full Day 1 report: CCU, revenue, error count, top 3 issues, top 3 wins |

---

## 🔗 Quick Reference Files

| Need | File | Location |
|---|---|---|
| Module placement | `StudioModulePlacementMap.md` | CANON/TRAIN-67/DOCS/ |
| Product ID guide | `ProductIDReplacementGuide.md` | CANON/TRAIN-67/DOCS/ |
| Full launch checklist | `LAUNCH-DAY-PLAYBOOK.md` | CANON/TRAIN-67/DOCS/ |
| Code integrity proof | `FINAL-CODE-INTEGRITY-REPORT.md` | CANON/TRAIN-67/DOCS/ |
| Economy break tests | `STAGE-5-ECONOMY-BREAK-TEST.md` | CANON/TRAIN-67/BATTLE-REPORT/ |
| Monetization architecture | `MonetizationArchitectureDeepDive.md` | CANON/TRAIN-67/DOCS/ |
| Rojo CI/CD guide | `RojoCICDOperationsGuide.md` | CANON/TRAIN-67/DOCS/ |
| Discord server setup | `DISCORD-SERVER-SETUP-GUIDE.md` | CANON/TRAIN-67/DOCS/ |
| Store listing copy | `STORE-LISTING-COPY.md` | CANON/TRAIN-67/DOCS/ |

---

## ⚡ TL;DR — The 3 Rules

1. **If it's broken, check Output first.** 90% of issues show a clear error message in Studio Output.
2. **If it's an exploit, go Private immediately.** Fix it offline. Better to lose 30 minutes of uptime than let an exploit spread.
3. **If the economy is wrong, tune the levers — don't panic.** Player balances from Day 1 are tiny. Adjust earn/spend rates and move on.

---

*Built by OB1 Run 97 — OVERNIGHT LAUNCH SPRINT Action 6/8*
*Phoenix Rising Gaming Division | Gospel 444 Compliant*
