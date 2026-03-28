# 🔪 Surgery Completion Tracker — Train-67 ESL Purge
> **Generated:** 2026-03-28 19:00 ICT | **Run 87** | Artifact Class: 🔨 BUILD
> **Mission:** 100% Roblox — ZERO ESL. Real combat engine LIVE.

## Summary

| Metric | Count |
|--------|-------|
| Total CODE files | 44 |
| ✅ CLEAN (surgically purged or combat-native) | 14 |
| ⚪ INHERENTLY CLEAN (no ESL refs) | 15 |
| 🔴 NEEDS SURGERY (confirmed English refs) | 14 |
| ⚫ LEGACY (deprecated, replaced) | 1 |

**Surgery completion: ~66% (29/44 clean)**

---

## ✅ SURGICALLY CLEANED (confirmed by commit)

| # | File | Surgery Commit | Surgery Type |
|---|------|---------------|-------------|
| 1 | CombatSystem.lua | `8acd858` (Copilot) | FULL REPLACEMENT — new combat engine |
| 2 | EconomyManager.lua | `8acd858` era | Purge + bridge to combat economy |
| 3 | BattlePass.lua | `8acd858` era | Strip ESL BP tiers |
| 4 | WorldBoss.lua | `9639416` | Remove englishChallenge phase gates, ENGLISH_DAMAGE_BONUS |
| 5 | GuildManager.lua | `3200d8e` | English quests → combat quests (combo kills, boss kills, headshots, parries) |
| 6 | RewardBridge.lua | `4e4fbd9` | EnglishCoins → SurvivalCoins, strip ESL XP |
| 7 | ChallengeManager.lua | `08f57e5` | English challenges → combat challenges |
| 8 | UnifiedServer.lua | `6a524fa` | Swap EnglishRewardsManager → CombatRewardsManager, strip ESL wiring |
| 9 | UnifiedClient.lua | `0f0afaf` | Strip ALL English references, combat-only client wiring |
| 10 | PrestigeManager.lua | `852ad92` | Rename englishWords → combatMastery, strip ESL prestige path |

## ✅ NEW COMBAT MODULES (built clean, zero ESL)

| # | File | Built By | Notes |
|---|------|----------|-------|
| 11 | WeaponData.lua (17.7KB) | Pulse Run 85 | 12 weapons, 5 tiers, rarity system |
| 12 | EnemyData.lua (14KB) | Pulse Run 85 | Enemy catalog with combat stats |
| 13 | CombatRewardsManager.lua (52KB) | Pulse Run 86 | ENRICHED v2.0 — daily challenges, combo milestones, gacha bridge |
| 14 | DayScaling.lua (11.9KB) | Pre-existing | 99-day difficulty curve, 6 phases, depot stops, prestige scaling |

## ⚪ INHERENTLY CLEAN (no English references detected)

| # | File | Size | Notes |
|---|------|------|-------|
| 15 | DataStoreV2.lua | 9.4KB | Data persistence — pure infrastructure |
| 16 | LedgerSchema.lua | 3.9KB | Schema definitions |
| 17 | ClientBridge.lua | 6.6KB | Client-server bridge |
| 18 | ServerGateway.lua | 12.2KB | Server gateway |
| 19 | WaveManager.lua | 8.2KB | Wave spawning system |
| 20 | EnemyFactory.lua | 10.4KB | Enemy instantiation |
| 21 | CodexClient.lua | 7.2KB | Codex UI client |
| 22 | CodexData.lua | 5.3KB | Codex data definitions |
| 23 | DailyRewards.lua | 13KB | Daily login rewards |
| 24 | GamePassConfig.lua | 14.7KB | Game pass definitions |
| 25 | GameMain_PHASE1_REVISED.lua | 27KB | Main game loop |
| 26 | HUDController_PHASE1_REVISED.lua | 15.6KB | HUD v1 |
| 27 | HUDController_v2.lua | 17.2KB | HUD v2 |
| 28 | MainServer_v2.lua | 17.3KB | Main server loop |
| 29 | AnomalyDetector.lua | 16.8KB | Anti-cheat / anomaly detection |

## 🔴 NEEDS SURGERY (confirmed English references remain)

**Priority order:** Impact × Size × Dependency count

| Priority | File | Size | Why It Matters | Surgery Scope |
|----------|------|------|---------------|---------------|
| 🔴 P1 | **FTUEController.lua** | 33KB | First-time user experience — players SEE this first. English tutorial refs = broken onboarding | Strip English tutorial steps, replace with combat tutorial flow |
| 🔴 P1 | **FTUEManager.lua** | 19.2KB | Server-side FTUE orchestration | Strip English FTUE steps, combat onboarding only |
| 🔴 P1 | **FTUEWiring.lua** | 5.7KB | Wires FTUE events | Small file, quick cleanup |
| 🔴 P2 | **MonetizationOrchestrator.lua** | 34.1KB | Revenue path — English reward hooks = broken monetization | Replace English reward triggers with combat reward triggers |
| 🔴 P2 | **EloManager.lua** | 32.2KB | Matchmaking/ranking — English difficulty refs | Strip English difficulty modifiers, pure combat Elo |
| 🔴 P2 | **CosmeticController.lua** | 46KB | Cosmetics/skins — English Aura tier refs | Replace English Aura tiers with combat achievement tiers |
| 🔴 P3 | **LeaderboardManager.lua** | 15.6KB | Leaderboards — English score categories | Replace English categories with combat categories |
| 🔴 P3 | **MobileInputController.lua** | 39.5KB | Mobile controls — English UI refs | Strip English input mode references |
| 🔴 P3 | **AnalyticsService.lua** | 15.9KB | Event tracking — English analytics events | Replace English event names with combat event names |
| 🔴 P3 | **GachaManager.lua** | 13.6KB | Gacha system — English reward pool refs | Strip English reward pools, combat-only gacha |
| 🔴 P4 | **TradeManager.lua** | 16.5KB | Player trading — English item refs | Strip English tradeable items |
| 🔴 P4 | **ReferralSystem.lua** | 12.5KB | Referral rewards — English bonus refs | Replace English referral bonuses with combat bonuses |
| 🔴 P4 | **DevProductsConfig.lua** | 10.3KB | Robux products — English product refs | Strip English products, combat-only products |
| 🔴 P4 | **SecurityLayer.lua** | 6.9KB | Anti-exploit — English validation refs | Strip English validation rules |

## ⚫ LEGACY (deprecated — do NOT surgery, archive instead)

| # | File | Size | Replacement |
|---|------|------|-------------|
| 44 | EnglishRewardsManager.lua | 41.4KB | → CombatRewardsManager.lua (Run 86). Keep for reference until all consumers migrated. |

## 🔍 QUESTIONABLE FILES (need manual review)

| File | Size | Question |
|------|------|----------|
| QuestionBank.lua | 36.1KB | ESL question bank — is this still needed for ANY feature? |
| QuestionBankV2.lua | 22.7KB | ESL question bank v2 — same question. UnifiedServer now marks as optional. |
| MonetizationServer.lua | 9.4KB | May have English monetization hooks — needs spot check |
| ReceiptRouter.lua | 25.9KB | Receipt processing — may reference English products |

---

## Surgery Wave History

| Wave | Date | Commits | Files Cleaned | By |
|------|------|---------|---------------|-----|
| Wave 1 | 2026-03-28 ~11:00 | 5 commits | CombatSystem, EconomyManager, BattlePass, WorldBoss, GuildManager | Copilot + Michael |
| Wave 2 | 2026-03-28 ~12:15 | 5 commits | RewardBridge, ChallengeManager, UnifiedServer, UnifiedClient, PrestigeManager | Copilot + Michael |
| Pulse builds | Runs 85-87 | 3 commits | WeaponData, EnemyData, CombatRewardsManager | Pulse Engine |

## Recommended Next Surgery Wave (Wave 3)

**Target: FTUE stack (P1) — 3 files, ~58KB total**

1. FTUEController.lua — strip English tutorial, combat tutorial flow
2. FTUEManager.lua — strip English FTUE steps
3. FTUEWiring.lua — strip English event wiring

**Why:** Players see FTUE first. Broken onboarding = lost players = lost revenue. This is the highest-impact remaining surgery.

**After FTUE:** MonetizationOrchestrator.lua (P2) — revenue path must be clean for combat-only monetization to work.

---

## Metrics

- **Total ESL purge progress:** 66% (29/44 files clean)
- **Remaining surgery volume:** ~275KB across 14 files
- **Estimated surgery time:** 3-4 more Copilot surgery waves
- **Target:** 100% clean by end of weekend (2026-03-30)
- **QuestionBank decision needed:** Keep, strip, or archive? (Ruling for Michael)
