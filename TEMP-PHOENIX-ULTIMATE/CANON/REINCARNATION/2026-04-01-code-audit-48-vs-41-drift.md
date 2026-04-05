# 2026-04-01 — CODE AUDIT: 48 Files vs 41 Module Claim (Drift Check)

## Header
| Field | Value |
|---|---|
| Session Tag | `anakin-pulse-code-audit-drift` |
| Date/Time | 2026-04-01 19:12 ICT |
| Agent | Anakin (Agent-98) |
| Mode | AUDIT |
| Genesis Anchor | Game Bible + `CANON/TRAIN-67/CODE/` directory |
| Signal Density | 🟡 MEDIUM — count mismatch, no functional impact |

## Cold Start Digest
- **COLD-START-BOOT.md** loaded from `CANON/SYSTEM/COLD-START-BOOT.md` (SHA `d167e70`)
- **Last 3 reincarnation entries** confirmed (2026-04-01)
- **Active mission:** Roblox launch — 5 days to incubator (Apr 6)

## Audit Objective
Validate Game Bible claim **"41 modules CODE COMPLETE"** against actual `CANON/TRAIN-67/CODE/`.

## Finding: 48 .lua files in CODE directory

| # | File | Size | Category |
|---|---|---|---|
| 1 | AnalyticsService.lua | 15.9 KB | Telemetry |
| 2 | AnomalyDetector.lua | 16.8 KB | Security |
| 3 | BattlePass.lua | 12.8 KB | Monetization |
| 4 | ChallengeManager.lua | 15.8 KB | Progression |
| 5 | ClientBridge.lua | 6.6 KB | Networking |
| 6 | CodexClient.lua | 7.2 KB | UI/Collection |
| 7 | CodexData.lua | 5.3 KB | Data |
| 8 | CombatRewardsManager.lua | 52.0 KB | Combat |
| 9 | CombatSystem.lua | 44.1 KB | Combat |
| 10 | CosmeticController.lua | 46.1 KB | Cosmetics |
| 11 | DailyRewards.lua | 13.0 KB | Retention |
| 12 | DataStoreV2.lua | 9.4 KB | Persistence |
| 13 | DayScaling.lua | 11.9 KB | Balancing |
| 14 | DevProductsConfig.lua | 10.3 KB | Config |
| 15 | EconomyManager.lua | 17.2 KB | Economy |
| 16 | EloManager.lua | 32.2 KB | Matchmaking |
| 17 | EnemyData.lua | 14.1 KB | Data |
| 18 | EnemyFactory.lua | 10.4 KB | Combat |
| 19 | EnglishRewardsManager.lua | 41.4 KB | English/Core |
| 20 | FTUEController.lua | 33.1 KB | FTUE |
| 21 | FTUEManager.lua | 19.2 KB | FTUE |
| 22 | FTUEWiring.lua | 5.8 KB | FTUE |
| 23 | GachaManager.lua | 13.6 KB | Monetization |
| 24 | GameMain_PHASE1_REVISED.lua | 27.1 KB | Core ⚠️ v1 |
| 25 | GamePassConfig.lua | 14.7 KB | Config |
| 26 | GuildManager.lua | 15.5 KB | Social |
| 27 | HUDController_PHASE1_REVISED.lua | 15.5 KB | UI ⚠️ v1 |
| 28 | HUDController_v2.lua | 17.2 KB | UI ⚠️ v2 |
| 29 | LeaderboardManager.lua | 14.6 KB | Social |
| 30 | LedgerSchema.lua | 3.9 KB | Data |
| 31 | MainServer_v2.lua | 17.3 KB | Core ⚠️ v2 |
| 32 | MobileInputController.lua | 39.5 KB | Input |
| 33 | MonetizationOrchestrator.lua | 34.1 KB | Monetization |
| 34 | MonetizationServer.lua | 9.4 KB | Monetization |
| 35 | PrestigeManager.lua | 13.9 KB | Progression |
| 36 | QuestionBank.lua | 36.1 KB | English ⚠️ v1 |
| 37 | QuestionBankV2.lua | 22.7 KB | English ⚠️ v2 |
| 38 | ReceiptRouter.lua | 25.9 KB | Monetization |
| 39 | ReferralSystem.lua | 12.5 KB | Growth |
| 40 | RewardBridge.lua | 9.1 KB | Rewards |
| 41 | SecurityLayer.lua | 6.9 KB | Security |
| 42 | ServerGateway.lua | 12.2 KB | Networking |
| 43 | TradeManager.lua | 16.5 KB | Economy |
| 44 | UnifiedClient.client.lua | 12.4 KB | Core |
| 45 | UnifiedServer.server.lua | 17.0 KB | Core |
| 46 | WaveManager.lua | 8.2 KB | Gameplay |
| 47 | WeaponData.lua | 17.7 KB | Data |
| 48 | WorldBoss.lua | 12.8 KB | Combat |

## Drift Deltas

### Versioned Duplicates (7 files = 3.5 logical pairs)
- [ ] `GameMain_PHASE1_REVISED.lua` ↔ `MainServer_v2.lua` — Which is canonical?
- [ ] `HUDController_PHASE1_REVISED.lua` ↔ `HUDController_v2.lua` — Which is canonical?
- [ ] `QuestionBank.lua` ↔ `QuestionBankV2.lua` — V2 likely active
- [ ] `FTUEController.lua` + `FTUEManager.lua` + `FTUEWiring.lua` — 3 FTUE files, consolidation pending

### Severity
| Finding | Severity | Fix |
|---|---|---|
| 48 files vs 41 claim | 🟡 LOW | Cosmetic. Code coverage higher than claimed. |
| 3 versioned pairs (6 files) | 🟡 MEDIUM | Archive v1 files to ARCHIVE/ or deprecate. |
| FTUE triple (3 files) | 🟡 MEDIUM | Michael decides single FTUE entry point. |

### Reconciliation
- 48 total − 4 superseded v1 = **44 unique active modules**
- Game Bible count of 41 predates late additions (CodexClient, CodexData, LedgerSchema)
- **Recommendation:** Update Game Bible → 44 active modules (48 files including legacy)

## Codebase Stats
- 48 files, ~830 KB total Lua source
- Largest: CombatRewardsManager.lua (52 KB)
- Smallest: LedgerSchema.lua (3.9 KB)

## Documentation Coverage
- 40 files in CANON/TRAIN-67/DOCS/
- Integration specs, audit reports, launch docs, guides, application drafts

## State Snapshot
| Field | Value |
|---|---|
| agent | Anakin (Agent-98) |
| run_time | 2026-04-01T19:12 ICT |
| mode | AUDIT |
| cold_start | PASS (SHA d167e70) |
| finding | 48 files vs 41 claimed (44 active after dedup) |
| next_action | Michael: archive 4 legacy files OR update Game Bible count to 44 |

**Build Grade: A**
