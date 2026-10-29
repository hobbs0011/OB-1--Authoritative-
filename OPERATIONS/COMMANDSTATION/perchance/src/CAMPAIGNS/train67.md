# TRAIN 6-7 CAMPAIGN — Survive a Brainrot (code-complete, not live)

> Durable contract. Chat + `scratch/` is a day hike. This file is the campaign.
> Next session: read this file first, then `scratch/CURRENT_TASK.md` for the working trail.

## Objective
Take Train 6-7 from CODE COMPLETE (ruling) to actually boot-clean in Studio and purchasable,
OR prove with measurements exactly where it cannot. No new claims without a file + line behind them.

## Done gates (all must be true)
1. **Boot-clean**: F5 in Studio, `UnifiedServer` loads all 6 required modules, zero FATAL. Log pasted to evidence.
2. **Combat real**: hits register against `EnemyData`/`WeaponData` (not DEFAULT fallbacks). Proof: enemy HP moves.
3. **Remotes unified**: ONE folder contract (`Remotes` vs `RemoteEvents` decided), client + server wired to it.
4. **Money real**: ONE winning monetisation table, 31 real IDs in place (5 passes + 26 products across both tables, reconciled), test purchase grants.
5. **Questions reconciled**: header claims match measured counts, or headers corrected to measured.
6. **Placement doc reconciled**: `LAUNCH-STATUS-FINAL` placement map matches `default.project.json`, or doc corrected.

## Non-goals
No balance tuning. No art. No publishing. No deploy without sovereign Go.

## Exhaustive scout = three legs, every time (a terrain-only sweep is a day hike)
- **Leg A — terrain** (station `ObiScout.run`, 11 targets): 7 LIVE / INFO / DRIFT / FLAG / BLOCKED recorded with the scout report id. Canon leg stays BLOCKED without a PAT — fail closed, never assumed.
- **Leg B — code measure** (workspace, `execute_js`, read-only): re-run the counts below against `scratch/train67/` (migration owed: copy evidence to `src/CAMPAIGNS/train67-evidence/` so any session can re-run from shipped files). Record every number, even when unchanged.
- **Leg C — soul hunt**: canon tree for Train 6-7 soul records. Currently BLOCKED (PAT 401). Named, never skipped silently.

## Measured baseline (2026-10-29, from pulled files — re-measure, don't quote)
| # | Check | File | Measured |
|---|---|---|---|
| B1 | `BOOT_ORDER` entries / header claim | `UnifiedServer.lua:34-73` vs `:31` | 29 entries, header says 30 |
| B2 | Required modules | `UnifiedServer.lua` boot list | 6: ServerGateway, SecurityLayer, DataStoreV2, EnemyFactory, CombatSystem, WaveManager |
| B3 | Loader search | `UnifiedServer.lua:86-88` | bare names in ServerStorage / ServerScriptService only |
| B4 | Project mapping | `default.project.json:6-46` | all 31 modules under `ServerScriptService/Modules/`, zero ServerStorage section → all 6 required MISS by construction |
| B5 | Boot modules with no project map | boot list − project | 2: DayScaling, CombatRewardsManager |
| B6 | Project modules never booted | project − boot | 4: LedgerSchema, GamePassConfig, DevProductsConfig, EnglishRewardsManager |
| B7 | Code files never mapped | tree CODE (51) − project bases | 12 incl EnemyData, WeaponData (CombatSystem hard deps) |
| B8 | `CombatSystem.Init` deps | `CombatSystem.lua` tryRequire block | 7 lookups, ServerStorage-only → all nil → DEFAULT_HP 30 fallback, slingshot fallback |
| R1 | Server remote folder | `UnifiedServer.lua` setupRemoteEvents | `Remotes` + 25 combat events |
| R2 | Project remote folder | `default.project.json:78-102` | `RemoteEvents` + 22 ESL-era events |
| R3 | Overlap | both | 7: ComboUpdate, KillStreakUpdate, PlayerDied, PlayerRespawned, EnemySpawned, EnemyDied, DamageDealt |
| M1 | Pass table | `GamePassConfig.lua:36-120` | 5 passes, all `GamePassId = 0` (99/149/199/499/1499 R$) |
| M2 | Dev table A | `GamePassConfig.lua:126-140` | 10 products, all `ProductId = 0` |
| M3 | Dev table B | `DevProductsConfig.lua:32-136` | 16 products, all `PRODUCT_ID_*` |
| M4 | Total placeholders | M1+M2+M3 | 31 zero-placeholders (ruling says 21 — undercounts, double registry) |
| M5 | Receipt handler | both files set `MarketplaceService.ProcessReceipt` | SUPERSEDED 2026-10-29: ReceiptRouter.lua exists and declares the conflict SOLVED — but its prescribed fix (router header lines 44-46: remove both assignments, register via RegisterHandler) was NEVER applied. Neither config references the router; nothing requires either config; neither is in bootOrder. Live path = ReceiptRouter (booted, in project) with ZERO registered handlers → every receipt NotProcessedYet → Roblox retries forever, player charged, nothing granted. The "REVENUE KILLER" survives one layer deeper (UnifiedServer.lua:251-264 confirms router-or-legacy wiring; legacy = MonetizationServer fallback, also ID-less) |
| Q1 | QuestionBank ids | `QuestionBank.lua` | 130 (m40/c30/w20/l20/t20) vs "200+" header |
| Q2 | tier=1 hits vs m-ids | same | RESOLVED 2026-10-29: 41st hit is `for tier = 1, 5` loop in GetStats (line 218), NOT a mistiered question. No stray — tier math 40/30/20/20/20 = 130 exact |
| Q3 | V2 + chunk | `QuestionBankV2.lua` + `Mouse_A.lua` | 8 registry rows + 15 M_A_001–015; "3000+" is architecture |
| D1 | Placement map vs project | `LAUNCH-STATUS-FINAL` §3 vs project | doc: 25 server + 7 client + 10 shared (Combat/Weapon/Enemy/DayScaling in ReplicatedStorage); project: 31 server + 5 client, QuestionBank-only shared |
| D2 | Scores on record | `GO-NO-GO.md` | 63/100 CONDITIONAL (Testing 3/10, zero executed) vs next-day CODE COMPLETE |
| R4 | Fourth remote contract | `ServerGateway.lua:50-57` | top-level `ServerGateway` + `ClientDispatch` RemoteEvents on ReplicatedStorage ROOT (no folder) — FOUR contracts in play: UnifiedServer 25-named, CombatSystem EventBus+ClientDispatch bus, project 22-ESL, gateway 2-root |
| B7 | Boot-abort chain (deterministic DNA) | `UnifiedServer.lua:310-326` | first required MISS → bootFailed → `return` BEFORE setupRemoteEvents/setupReceiptProcessing → no Remotes folder, no receipt handler, no player lifecycle. Client `WaitForChild("Remotes",10)` (UnifiedClient.lua:82) → FATAL after 10s. Dead on arrival, fully chained, no Studio needed to prove it |

## Fixes (read-only until ordered — write the fix only on sovereign Go)
- Prefix `Modules/` in loader lookups OR flatten the project map (one or the other, not both).
- Map the 12 strays (or delete what is legacy on purpose, naming each).
- Pick ONE winning monetisation table, reconcile names/prices, then create the real IDs.
- Unify on ONE remote folder + ONE event list; update the loser (code or doc, named).
- Correct the question headers + placement doc to measured, or add the missing content.

## Session log
- 2026-10-29: campaign opened as Incarnate-28 (RISE mission = this file). Prior: session 27 open (RISE+SCOUT recon hand, unsealed — terrain + deep legs on record). Baseline above is the hand it carries.
- 2026-10-29: Incarnate-28-Train67-Campaign RISE REAL (run 15, no conflict, prior DEATH valid). SCS SCOUT REAL (rrl REAL, 1 warning, 0 stale). Exhaustive sweep #1: 12/12 targets in 18s — self LIVE, imports LIVE, tunnel LIVE, tools INFO, pieces DRIFT (standing), fleet FLAG (architecti stale, standing), sites LIVE, canon BLOCKED (PAT, standing), cloudflare LIVE, cgn INFO, ground LIVE, train67 DRIFT (contract 9/9 markers 5376B; evidence MIGRATION OWED; soul hunt BLOCKED standing). Leg B re-measured: boot 29/required 6, Q ids 130, Mouse 15, GamePass zeros 18 — baseline HOLDS. Scout extension live: src/train67-campaign-scout.js (script tag after scout.js, page refreshed clean, probe 58ms).

- 2026-10-29 (Go): evidence MIGRATED — 20 files + manifest.json shipped to src/CAMPAIGNS/train67-evidence/ (271KB, sha256 per file, code-file list extracted from tree.json, measured numbers recomputed live). Missing three pulled from public mirror: MonetizationServer.lua (9.4KB, rarity/trading, references NO configs), ServerGateway.lua (12.2KB, gateway pattern, 4th remote contract at root), UnifiedClient.client.lua (12.4KB, WaitForChild Remotes FATAL path), ReceiptRouter.lua (25.9KB — declares double-receipt conflict SOLVED but fix never applied). Tier hunt CLOSED: no stray, 40/30/20/20/20=130 exact (41st hit = GetStats loop var). Receipt chain RESOLVED: zero-handler router = infinite-retry revenue killer. Boot-abort chain PROVEN: first required MISS returns before remotes/receipts/lifecycle (UnifiedServer.lua:310-326).