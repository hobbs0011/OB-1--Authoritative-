# 🚀 LAUNCH STATUS — Survive a Brainrot (FINAL)

> **Generated:** 2026-03-28 21:00 ICT | **Run 89 — Pulse Engine v5**
> **Status:** 🟢 CODE COMPLETE — Awaiting Michael for Product IDs + Publish
> **Supersedes:** TURN-KEY-DEPLOY-PACKET.md (stale March 25), LAUNCH-CHECKLIST.md, RUNBOOK.md

---

## TL;DR — What Michael Needs To Do

1. **Open Roblox Creator Dashboard** → create Game Passes + Dev Products → get 21 real IDs
2. **Replace IDs** in `GamePassConfig.lua` + `DevProductsConfig.lua` (find-replace `0` → real ID)
3. **Paste all 42 scripts** into Roblox Studio (see placement map below)
4. **F5 test** → verify combat loop + shop + daily rewards
5. **File → Publish to Roblox → Set Public**

**Estimated time:** 30-60 minutes (mostly Creator Dashboard clicks)

---

## 1. Code Status Summary

| Category | Count | % | Notes |
|----------|-------|---|-------|
| ✅ CLEAN (surgically purged) | 16 | 36% | 12 surgery commits + 4 new combat modules |
| ⚪ INHERENTLY CLEAN | 15 | 34% | No ESL refs ever existed |
| 🟡 DEFERRED (ESL refs, non-blocking) | 11 | 25% | CODE COMPLETE ruling — ships as-is |
| ⚫ LEGACY (deprecated) | 2 | 5% | EnglishRewardsManager + FTUEManager — do NOT deploy |
| **TOTAL** | **44** | **100%** | **31 clean + 11 deferred + 2 deprecated** |

### Michael's CODE COMPLETE Ruling (2026-03-28 ~20:30 ICT)

The 11 DEFERRED files contain ESL references in non-player-facing code paths (comments, dead code, internal names). **Zero player-facing English remains.** Safe to ship. Post-launch cleanup in Update 1.1.

---

## 2. The 21 Product ID Problem (ONLY LAUNCH BLOCKER)

Both `GamePassConfig.lua` and `DevProductsConfig.lua` use **placeholder ID = 0**. Roblox rejects purchases with ID 0.

### Game Passes to Create (10):

| # | Name | Price (R$) |
|---|------|-----------|
| 1 | VIP Pass | 499 |
| 2 | Double XP | 199 |
| 3 | Auto-Farm | 399 |
| 4 | Extra Inventory | 149 |
| 5 | Lucky Charm | 249 |
| 6 | Fast Travel | 99 |
| 7 | Premium Crate | 349 |
| 8 | Starter Pack | 49 |
| 9 | Prestige Boost | 299 |
| 10 | Guild Creation | 199 |

### Dev Products to Create (11):

| # | Name | Price (R$) |
|---|------|-----------|
| 1 | 100 SurvivalCoins | 49 |
| 2 | 500 SurvivalCoins | 199 |
| 3 | 1000 SurvivalCoins | 349 |
| 4 | 5000 SurvivalCoins | 999 |
| 5 | Revive Token | 25 |
| 6 | Speed Boost (1hr) | 49 |
| 7 | XP Boost (1hr) | 49 |
| 8 | Loot Boost (1hr) | 49 |
| 9 | Gacha Spin ×1 | 75 |
| 10 | Gacha Spin ×10 | 675 |
| 11 | Premium Crate Key | 99 |

### Steps:
1. `create.roblox.com` → Your experience → Monetization
2. Create each Game Pass → copy ID → replace in `GamePassConfig.lua`
3. Create each Dev Product → copy ID → replace in `DevProductsConfig.lua`

---

## 3. Script Placement Map

### ServerScriptService (25 scripts)

| # | File | Size | Status |
|---|------|------|--------|
| 1 | UnifiedServer.lua | 19KB | ✅ CLEAN |
| 2 | CombatRewardsManager.lua | 52KB | ✅ NEW |
| 3 | DataStoreV2.lua | 9.4KB | ⚪ |
| 4 | ServerGateway.lua | 12KB | ⚪ |
| 5 | EconomyManager.lua | 17KB | ✅ |
| 6 | WaveManager.lua | 8.2KB | ⚪ |
| 7 | EnemyFactory.lua | 10KB | ⚪ |
| 8 | WorldBoss.lua | 13KB | ✅ |
| 9 | GuildManager.lua | 15KB | ✅ |
| 10 | BattlePass.lua | 13KB | ✅ |
| 11 | ChallengeManager.lua | 16KB | ✅ |
| 12 | DailyRewards.lua | 13KB | ⚪ |
| 13 | LeaderboardManager.lua | 15KB | ✅ |
| 14 | PrestigeManager.lua | 14KB | ✅ |
| 15 | AnomalyDetector.lua | 17KB | ⚪ |
| 16 | RewardBridge.lua | 9.1KB | ✅ |
| 17 | ReceiptRouter.lua | 26KB | ⚪ |
| 18 | MonetizationServer.lua | 9.4KB | ⚪ |
| 19 | MonetizationOrchestrator.lua | 34KB | 🟡 DEFERRED |
| 20 | EloManager.lua | 32KB | 🟡 DEFERRED |
| 21 | GachaManager.lua | 14KB | 🟡 DEFERRED |
| 22 | TradeManager.lua | 16KB | 🟡 DEFERRED |
| 23 | ReferralSystem.lua | 13KB | 🟡 DEFERRED |
| 24 | SecurityLayer.lua | 6.9KB | 🟡 DEFERRED |
| 25 | AnalyticsService.lua | 16KB | 🟡 DEFERRED |

### StarterPlayerScripts (7 scripts)

| # | File | Size | Status |
|---|------|------|--------|
| 26 | UnifiedClient.lua | 14KB | ✅ CLEAN |
| 27 | HUDController_v2.lua | 17KB | ⚪ |
| 28 | FTUEController.lua | 33KB | 🟡 DEFERRED (P1 surgery later) |
| 29 | FTUEWiring.lua | 5.8KB | ✅ |
| 30 | MobileInputController.lua | 40KB | 🟡 DEFERRED |
| 31 | CosmeticController.lua | 46KB | 🟡 PRESERVE (Michael ruling) |
| 32 | CodexClient.lua | 7.2KB | ⚪ |

### ReplicatedStorage (10 modules)

| # | File | Size | Status |
|---|------|------|--------|
| 33 | CombatSystem.lua | 44KB | ✅ NEW ENGINE |
| 34 | WeaponData.lua | 18KB | ✅ NEW |
| 35 | EnemyData.lua | 14KB | ✅ NEW |
| 36 | DayScaling.lua | 12KB | ✅ |
| 37 | GamePassConfig.lua | 15KB | ⚪ (needs IDs) |
| 38 | DevProductsConfig.lua | 10KB | 🟡 (needs IDs) |
| 39 | LedgerSchema.lua | 3.9KB | ⚪ |
| 40 | ClientBridge.lua | 6.6KB | ⚪ |
| 41 | CodexData.lua | 5.3KB | ⚪ |
| 42 | MainServer_v2.lua | 17KB | ⚪ |

### DO NOT DEPLOY

| File | Reason |
|------|--------|
| EnglishRewardsManager.lua | Replaced by CombatRewardsManager.lua |
| FTUEManager.lua | Merged into FTUEController v2.0 |
| QuestionBank.lua | KEEP for younger students (future) |
| QuestionBankV2.lua | KEEP for younger students (future) |
| GameMain_PHASE1_REVISED.lua | Superseded by MainServer_v2 |
| HUDController_PHASE1_REVISED.lua | Superseded by HUDController_v2 |

---

## 4. Pre-Publish Checklist

- [ ] Log into PhoenixRisingGames on create.roblox.com
- [ ] Create Experience: "Survive a Brainrot" | Max players = 5
- [ ] Copy Place ID + Universe ID
- [ ] Create 10 Game Passes → copy all IDs
- [ ] Create 11 Dev Products → copy all IDs
- [ ] Replace IDs in GamePassConfig.lua + DevProductsConfig.lua
- [ ] Open Roblox Studio → paste 42 scripts into correct folders
- [ ] Game Settings: Allow HTTP Requests = ON, API Services = ON
- [ ] Set Config.PlaceId and Config.UniverseId in code
- [ ] Create Open Cloud API key (DataStore + MessagingService scope)
- [ ] F5 test: spawns, combat works, enemies spawn, day counter, HUD, shop
- [ ] Multi-player test: lobby gate, guilds, leaderboards
- [ ] File → Publish to Roblox
- [ ] Game Settings → Access → Public

---

## 5. Post-Launch Surgery Roadmap (Update 1.1)

| Priority | File | Surgery | Impact |
|----------|------|---------|--------|
| P1 | FTUEController.lua | 8 ESL refs → combat (spec ready) | Better first-time experience |
| P2 | MonetizationOrchestrator.lua | English hooks → combat | Cleaner revenue path |
| P2 | EloManager.lua | English difficulty → combat Elo | Cleaner matchmaking |
| P2 | CosmeticController.lua | English Auras → combat (PRESERVE auras) | Future cosmetic integration |
| P3 | MobileInputController.lua | English UI refs → combat | Cleaner mobile UX |
| P3 | AnalyticsService.lua | English events → combat events | Accurate analytics |
| P3 | GachaManager.lua | English pools → combat-only | Clean gacha |
| P4 | TradeManager.lua | English items → combat items | Clean trading |
| P4 | ReferralSystem.lua | English bonuses → combat bonuses | Clean referrals |
| P4 | DevProductsConfig.lua | English products → combat-only | Clean monetization |
| P4 | SecurityLayer.lua | English validation → combat | Clean anti-exploit |

---

## 6. Open Rulings (Awaiting Michael)

| # | Item | Status | Blocks Launch? |
|---|------|--------|---------------|
| 1 | 21 Product IDs (Game Passes + Dev Products) | Needs Creator Dashboard | 🔴 YES |
| 2 | Rojo CI/CD setup (secret name + universeId/placeId) | Needs Michael | No (manual deploy works) |
| 3 | Discord server creation | Needs Michael | No (post-launch ok) |
| 4 | Publish trigger (exact go-live moment) | Needs Michael | 🔴 YES |
| 5 | reincarnate.js patch | Deferred | No |
| 6 | HarvestedChats transfer | Deferred | No |

---

## 7. Key Session Decisions (2026-03-28)

| Decision | Ruling |
|----------|--------|
| Game identity | Survive 99 Days + Deadrails + Brainrot meta |
| English in game | ZERO player-facing. Preserved for future younger-student integration |
| QuestionBank | KEEP (younger students later) |
| CosmeticController auras | PRESERVE |
| "SURVIVE. FIGHT. SPEND." boot msg | KEEP ("it's not a joke") |
| Repo authority | hobbs-lab/Phoenix-Rising-Protocol-Ultimate ONLY |
| Code authorship | Ne0 writes ALL code, preserve Copilot tokens |
| Copilot estimates | "Bogus" — don't quote them to Michael |
| Launch timeline | "Today, at most 48h" (from ~20:30 ICT March 28) |

---

## 8. Surgery Wave History

| Wave | Date | Files Cleaned | By |
|------|------|---------------|-----|
| Wave 1 | 2026-03-28 ~11:00 | CombatSystem, EconomyManager, BattlePass, WorldBoss, GuildManager | Copilot + Michael |
| Wave 2 | 2026-03-28 ~12:15 | RewardBridge, ChallengeManager, UnifiedServer, UnifiedClient, PrestigeManager | Copilot + Michael |
| Wave 2b | 2026-03-28 ~19:22 | FTUEWiring, LeaderboardManager | Copilot (autonomous) |
| Pulse builds | Runs 85-87 | WeaponData, EnemyData, CombatRewardsManager, DayScaling | Pulse Engine |

**Total surgery commits:** 18+ across 2 waves + pulse builds
**Total codebase:** 44 files, ~750KB Lua

---

*Generated by Pulse Engine v5 Run 89 | 2026-03-28 21:00 ICT*
*Source: Surgery Completion Tracker + Reincarnation Entry 2026-03-28 + CODE/ directory audit*
