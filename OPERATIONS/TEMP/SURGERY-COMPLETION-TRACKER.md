# 🔪 Surgery Completion Tracker — Train-67 ESL Purge
> **Generated:** 2026-03-28 19:00 ICT | **Last Updated:** 2026-03-28 20:00 ICT (Run 88)
> **Mission:** 100% Roblox — ZERO ESL. Real combat engine LIVE.

## Summary

| Metric | Count |
|--------|-------|
| Total CODE files | 44 |
| ✅ CLEAN (surgically purged or combat-native) | 16 |
| ⚪ INHERENTLY CLEAN (no ESL refs) | 15 |
| 🔴 NEEDS SURGERY (confirmed English refs) | 11 |
| ⚫ LEGACY (deprecated, replaced) | 2 |

**Surgery completion: ~70% (31/44 clean)** ← up from 66% (Run 87)

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
| 11 | **FTUEWiring.lua** | `1c9f78c` | **NEW (Run 88)** — Replace ESL tutorial with combat tutorial, strip English prompts |
| 12 | **LeaderboardManager.lua** | `84e0b98` | **NEW (Run 88)** — Replace English Word leaderboards with Combat/Combo boards |

## ✅ NEW COMBAT MODULES (built clean, zero ESL)

| # | File | Built By | Notes |
|---|------|----------|-------|
| 13 | WeaponData.lua (17.7KB) | Pulse Run 85 | 12 weapons, 5 tiers, rarity system |
| 14 | EnemyData.lua (14KB) | Pulse Run 85 | Enemy catalog with combat stats |
| 15 | CombatRewardsManager.lua (52KB) | Pulse Run 86 | ENRICHED v2.0 — daily challenges, combo milestones, gacha bridge |
| 16 | DayScaling.lua (11.9KB) | Pre-existing | 99-day difficulty curve, 6 phases, depot stops, prestige scaling |

## ⚪ INHERENTLY CLEAN (no English references detected)

| # | File | Size | Notes |
|---|------|------|-------|
| 17 | DataStoreV2.lua | 9.4KB | Data persistence — pure infrastructure |
| 18 | LedgerSchema.lua | 3.9KB | Schema definitions |
| 19 | ClientBridge.lua | 6.6KB | Client-server bridge |
| 20 | ServerGateway.lua | 12.2KB | Server gateway |
| 21 | WaveManager.lua | 8.2KB | Wave spawning system |
| 22 | EnemyFactory.lua | 10.4KB | Enemy instantiation |
| 23 | CodexClient.lua | 7.2KB | Codex UI client |
| 24 | CodexData.lua | 5.3KB | Codex data definitions |
| 25 | DailyRewards.lua | 13KB | Daily login rewards |
| 26 | GamePassConfig.lua | 14.7KB | Game pass definitions |
| 27 | GameMain_PHASE1_REVISED.lua | 27KB | Main game loop |
| 28 | HUDController_PHASE1_REVISED.lua | 15.6KB | HUD v1 |
| 29 | HUDController_v2.lua | 17.2KB | HUD v2 |
| 30 | MainServer_v2.lua | 17.3KB | Main server loop |
| 31 | AnomalyDetector.lua | 16.8KB | Anti-cheat / anomaly detection |

## 🔴 NEEDS SURGERY (confirmed English references remain)

**Priority order:** Impact × Size × Dependency count

| Priority | File | Size | Why It Matters | Surgery Scope |
|----------|------|------|---------------|---------------|
| 🔴 P1 | **FTUEController.lua** | 33KB | First-time user experience — players SEE this first. 8 ESL refs identified (see spec below) | Strip English tutorial steps, replace with combat tutorial flow |
| 🔴 P2 | **MonetizationOrchestrator.lua** | 34.1KB | Revenue path — English reward hooks = broken monetization | Replace English reward triggers with combat reward triggers |
| 🔴 P2 | **EloManager.lua** | 32.2KB | Matchmaking/ranking — English difficulty refs | Strip English difficulty modifiers, pure combat Elo |
| 🔴 P2 | **CosmeticController.lua** | 46KB | Cosmetics/skins — English Aura tier refs | Replace English Aura tiers with combat achievement tiers |
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
| 43 | EnglishRewardsManager.lua | 41.4KB | → CombatRewardsManager.lua (Run 86). Keep for reference until all consumers migrated. |
| 44 | **FTUEManager.lua** | 19.2KB | **DEPRECATED (Run 88)** — Merged into FTUEController.lua v2.0 (Run 58). Separate surgery unnecessary. |

---

## 🔬 SURGERY SPECIFICATION: FTUEController.lua (P1)

**File:** `CANON/TRAIN-67/CODE/FTUEController.lua` (33KB, SHA: `1a8475b`)
**Current Version:** 2.0 (merged FTUEManager + FTUEWiring)
**Target Version:** 3.0 (combat-only FTUE)
**Analysis Run:** 88 (2026-03-28 20:00 ICT)

### ESL References Found (8 total)

| # | Location | Current (ESL) | Target (Combat) | Type |
|---|----------|--------------|-----------------|------|
| 1 | Header comment line | "English is the mechanic, money is the mission" | "Combat is the mechanic, money is the mission" | Comment |
| 2 | Header CROSS-REPO | "CombatEnglishBridge" | "CombatRewardsManager" | Comment |
| 3 | Step 5 header comment | "FIRST_QUESTION (kill) English question prompt" | "FIRST_COMBO (kill) Combo challenge" | Comment |
| 4 | Step 6 header comment | "English Power-Up mechanic" | "Rage Power-Up mechanic" | Comment |
| 5 | STEPS[5] (first_question) | `id="first_question"`, `prompt="ANSWER THIS TO CHARGE YOUR WEAPON"`, `action="serve_tutorial_question"` | `id="first_combo"`, `prompt="CHAIN 3 HITS! Execute a combo to power up!"`, `action="combo_challenge"` | Code |
| 6 | STEPS[6] (power_up) | `prompt="Fill the Power-Up bar → unleash English Power! 🔥"` | `prompt="Fill the Power-Up bar → unleash RAGE MODE! 🔥"` | Code |
| 7 | grantRewards() | `currency = "EnglishCoins"` | `currency = "SurvivalCoins"` | Code |
| 8 | Public API | `SignalCorrectAnswer()` + `firstAnswerCorrect` state flag | `SignalComboComplete()` + `firstComboComplete` state flag | Code (API change) |

### Additional Issues (non-ESL)

| # | Issue | Fix |
|---|-------|-----|
| A1 | HTML entities: `&gt;` (14+ instances) | Replace with `>` |
| A2 | HTML entities: `&lt;` (if any) | Replace with `<` |
| A3 | Step 5 isStepEventSatisfied check | Update from `"first_question"` / `firstAnswerCorrect` to `"first_combo"` / `firstComboComplete` |
| A4 | RunFTUE state init | `firstAnswerCorrect = false` → `firstComboComplete = false` |
| A5 | Add CONFIG.ComboChallenge | `{ RequiredHits = 3, TimeWindow = 10 }` |
| A6 | Add CONFIG.ComboReward | `{ Coins = 15, XP = 10, ShowBurst = true }` |

### Surgery Execution Plan

1. Apply all 8 ESL reference changes
2. Fix HTML entity sanitization (A1, A2)
3. Update step event satisfaction logic (A3)
4. Update state initialization (A4)
5. Add combo config entries (A5, A6)
6. Bump version header to 3.0, date to March 28, 2026
7. Verify: zero remaining references to "English", "ESL", "question", "answer" in gameplay context
8. Push as `FTUEController.lua` v3.0

---

## Surgery Wave History

| Wave | Date | Commits | Files Cleaned | By |
|------|------|---------|---------------|-----|
| Wave 1 | 2026-03-28 ~11:00 | 5 commits | CombatSystem, EconomyManager, BattlePass, WorldBoss, GuildManager | Copilot + Michael |
| Wave 2 | 2026-03-28 ~12:15 | 5 commits | RewardBridge, ChallengeManager, UnifiedServer, UnifiedClient, PrestigeManager | Copilot + Michael |
| Wave 2b | 2026-03-28 ~19:22 | 2 commits | FTUEWiring, LeaderboardManager | Copilot (autonomous) |
| Pulse builds | Runs 85-87 | 3 commits | WeaponData, EnemyData, CombatRewardsManager | Pulse Engine |

## Recommended Next Surgery Wave (Wave 3)

**Target: FTUEController.lua (P1) — surgery spec ready above**

1. FTUEController.lua — execute surgery spec (8 ESL refs + 6 additional fixes)
2. ~~FTUEManager.lua~~ — **DEPRECATED** (merged into FTUEController v2.0)
3. ~~FTUEWiring.lua~~ — **DONE** (commit `1c9f78c`)

**After FTUEController:** MonetizationOrchestrator.lua (P2) — revenue path must be clean for combat-only monetization.

---

## Metrics

- **Total ESL purge progress:** 70% (31/44 files clean) ← up from 66%
- **Remaining surgery volume:** ~227KB across 11 files (down from ~275KB across 14)
- **Estimated surgery time:** 2-3 more Copilot surgery waves
- **Target:** 100% clean by end of weekend (2026-03-30)
- **QuestionBank decision needed:** Keep, strip, or archive? (Ruling for Michael)
- **FTUEController surgery spec:** READY — 8 ESL refs + 6 fixes documented
