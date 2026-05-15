# Studio Module Placement Map — All 41 CODE Modules

> **Generated:** 2026-03-28 10:00 ICT (Run 78)
> **Source:** Cross-repo synthesis from UnifiedServer.lua (`23a22a95`), UnifiedClient.lua (`23a22a95`), all 41 CODE modules
> **Purpose:** Tells Michael exactly where to put every file in Roblox Studio, in what order, with what dependencies.

---

## Quick Reference — Studio Folder Structure

```
game
├── ServerScriptService/
│   ├── UnifiedServer.lua          ← BOOT SCRIPT (Script, runs first)
│   └── Modules/                   ← All server ModuleScripts
│       ├── DataStoreV2.lua
│       ├── SecurityLayer.lua
│       ├── LedgerSchema.lua
│       ├── EconomyManager.lua
│       ├── AnalyticsService.lua
│       ├── QuestionBankV2.lua
│       ├── EloManager.lua
│       ├── CombatSystem.lua
│       ├── WaveManager.lua
│       ├── EnemyFactory.lua
│       ├── RewardBridge.lua
│       ├── DailyRewards.lua
│       ├── AnomalyDetector.lua
│       ├── MonetizationServer.lua
│       ├── GamePassConfig.lua
│       ├── DevProductsConfig.lua
│       ├── GachaManager.lua
│       ├── BattlePass.lua
│       ├── TradeManager.lua
│       ├── ChallengeManager.lua
│       ├── LeaderboardManager.lua
│       ├── GuildManager.lua
│       ├── WorldBoss.lua
│       ├── PrestigeManager.lua
│       ├── ReferralSystem.lua
│       ├── ReceiptRouter.lua
│       ├── MonetizationOrchestrator.lua
│       ├── EnglishRewardsManager.lua
│       ├── FTUEController.lua
│       ├── CosmeticController.lua
│       └── ServerGateway.lua
│
├── StarterPlayer/
│   └── StarterPlayerScripts/
│       ├── UnifiedClient.lua      ← CLIENT BOOT (LocalScript, runs on join)
│       └── Modules/               ← All client ModuleScripts
│           ├── ClientBridge.lua
│           ├── HUDController_v2.lua
│           ├── MobileInputController.lua
│           ├── CodexClient.lua
│           └── CodexData.lua
│
├── ReplicatedStorage/
│   ├── QuestionChunks/            ← QuestionBankV2 overflow chunks
│   │   ├── Chunk_001.lua          ← ModuleScript returning question table
│   │   ├── Chunk_002.lua
│   │   └── ...
│   └── SharedConstants.lua        ← (optional) shared config both sides read
│
├── ServerStorage/
│   └── (empty — all modules use ServerScriptService)
│
└── Workspace/
    └── (game world objects — maps, spawns, NPCs)
```

---

## Section 1: Server Boot Order (UnifiedServer.lua)

UnifiedServer.lua is a **Script** in ServerScriptService. It `require()`s all 28+ server modules in dependency order. The boot sequence:

| Order | Module | Size | Role |
|-------|--------|------|------|
| 1 | DataStoreV2 | 9.4KB | Player data persistence, session locking |
| 2 | SecurityLayer | 6.9KB | Rate limiting, exploit detection |
| 3 | LedgerSchema | 3.9KB | DataStore schema definitions |
| 4 | EconomyManager | 17.4KB | Currency, transactions, inflation tracking |
| 5 | AnalyticsService | 15.9KB | Dual-channel analytics (Roblox + DataStore) |
| 6 | QuestionBankV2 | 22.7KB | Chunked question loading, registration |
| 7 | EloManager | 32.2KB | Adaptive difficulty, Elo rating |
| 8 | CombatSystem | 23.8KB | Server-authoritative combat |
| 9 | WaveManager | 8.2KB | Enemy wave orchestration |
| 10 | EnemyFactory | 10.4KB | Enemy spawning, type definitions |
| 11 | RewardBridge | 8.1KB | English→reward pipeline |
| 12 | DailyRewards | 13.0KB | Daily login rewards |
| 13 | AnomalyDetector | 16.8KB | Anti-exploit, anomaly flagging |
| 14 | MonetizationServer | 9.4KB | Core monetization logic |
| 15 | GamePassConfig | 14.7KB | Game pass definitions + ownership |
| 16 | DevProductsConfig | 10.3KB | Developer product definitions |
| 17 | GachaManager | 13.6KB | Gacha/crate system, pity |
| 18 | BattlePass | 13.4KB | Season pass, tier progression |
| 19 | TradeManager | 16.5KB | Player trading, auction house |
| 20 | ChallengeManager | 14.8KB | Daily/weekly challenges |
| 21 | LeaderboardManager | 15.6KB | Leaderboards, OrderedDataStore |
| 22 | GuildManager | 15.6KB | Guild system, guild wars |
| 23 | WorldBoss | 14.0KB | World boss encounters |
| 24 | PrestigeManager | 15.1KB | Prestige/rebirth system |
| 25 | ReferralSystem | 12.5KB | Referral codes, rewards |
| 26 | ReceiptRouter | 25.9KB | Unified ProcessReceipt callback |
| 27 | MonetizationOrchestrator | 34.1KB | Offer engine, spend tracking |
| 28 | EnglishRewardsManager | 41.4KB | English×Rewards bridge, streaks |
| 29 | FTUEController | 33.1KB | First-time user experience |
| 30 | CosmeticController | 46.1KB | Pets, auras, skins, fusion |
| 31 | ServerGateway | 12.2KB | Two-server gateway pattern |

**Total server code: ~533KB across 31 ModuleScripts + 1 boot Script**

---

## Section 2: Client Boot Order (UnifiedClient.lua)

UnifiedClient.lua is a **LocalScript** in StarterPlayerScripts. It `require()`s 5 client modules:

| Order | Module | Size | Role |
|-------|--------|------|------|
| 1 | ClientBridge | 6.6KB | Channel-based client↔server messaging |
| 2 | HUDController_v2 | 17.2KB | All UI: health, coins, English, combo |
| 3 | MobileInputController | 39.5KB | 4-mode English input (Tap/Word/Speed/Quick) |
| 4 | CodexClient | 7.2KB | Codex/collection UI |
| 5 | CodexData | 5.3KB | Codex item definitions |

**Total client code: ~100KB across 5 ModuleScripts + 1 boot LocalScript**

---

## Section 3: RemoteEvents & RemoteFunctions Required

These must exist in `ReplicatedStorage` before the game starts. UnifiedServer.lua creates them on boot, but if you see errors, create them manually:

### RemoteEvents (Server→Client and Client→Server)
```
ReplicatedStorage/
└── RemoteEvents/          ← Folder
    ├── AnswerQuestion
    ├── QuestionResult
    ├── ShowQuestion
    ├── DismissQuestion
    ├── UpdateHUD
    ├── ComboUpdate
    ├── KillStreakUpdate
    ├── PlayerDied
    ├── PlayerRespawned
    ├── EnemySpawned
    ├── EnemyDied
    ├── WaveStarted
    ├── WaveEnded
    ├── DamageDealt
    ├── RewardGranted
    ├── FTUEStep
    ├── FTUEComplete
    ├── GachaResult
    ├── TradeRequest
    ├── TradeComplete
    ├── ChatMessage
    └── SystemNotification
```

### RemoteFunctions (Client→Server with return)
```
ReplicatedStorage/
└── RemoteFunctions/       ← Folder
    ├── GetPlayerData
    ├── GetQuestion
    ├── PurchaseItem
    ├── GetLeaderboard
    └── GetGuildInfo
```

---

## Section 4: Legacy Modules (DO NOT USE)

These files exist in CODE/ but are **superseded**. Do NOT place them in Studio:

| File | Superseded By | Reason |
|------|--------------|--------|
| GameMain_PHASE1_REVISED.lua | UnifiedServer.lua | Old boot script |
| HUDController_PHASE1_REVISED.lua | HUDController_v2.lua | Old HUD |
| MainServer_v2.lua | UnifiedServer.lua | Old server script |
| FTUEManager.lua | FTUEController.lua | Merged into unified controller |
| FTUEWiring.lua | FTUEController.lua | Merged into unified controller |
| QuestionBank.lua | QuestionBankV2.lua | Monolithic, no chunking |

---

## Section 5: Step-by-Step Studio Setup

### Step 1: Create Folder Structure
1. Open Roblox Studio → your game place
2. In ServerScriptService: Create folder `Modules`
3. In StarterPlayer → StarterPlayerScripts: Create folder `Modules`
4. In ReplicatedStorage: Create folder `QuestionChunks`
5. In ReplicatedStorage: Create folders `RemoteEvents` and `RemoteFunctions`

### Step 2: Place Server Code
1. Create a new **Script** in ServerScriptService named `UnifiedServer`
2. Paste content of `UnifiedServer.lua` into it
3. For each server module (DataStoreV2 through ServerGateway):
   - Create a new **ModuleScript** in `ServerScriptService/Modules/`
   - Name it exactly as listed (without .lua extension)
   - Paste the file content
4. Update `require()` paths in UnifiedServer if needed:
   ```lua
   local Modules = script.Parent:WaitForChild("Modules")
   local DataStoreV2 = require(Modules:WaitForChild("DataStoreV2"))
   ```

### Step 3: Place Client Code
1. Create a new **LocalScript** in StarterPlayerScripts named `UnifiedClient`
2. Paste content of `UnifiedClient.lua`
3. For each client module:
   - Create a new **ModuleScript** in `StarterPlayerScripts/Modules/`
   - Paste content
4. Update `require()` paths in UnifiedClient if needed

### Step 4: Create RemoteEvents
1. In ReplicatedStorage/RemoteEvents, create one **RemoteEvent** instance for each name listed in Section 3
2. In ReplicatedStorage/RemoteFunctions, create one **RemoteFunction** instance for each name listed

### Step 5: Smoke Test
1. Click **Play** in Studio (F5)
2. Open Output window (View → Output)
3. Check for:
   - `[UnifiedServer] Boot sequence complete` — server OK
   - `[UnifiedClient] Client boot complete` — client OK
   - No red error lines
4. If you see `Module not found` errors → check the module name matches exactly
5. If you see `RemoteEvent not found` warnings → create the missing RemoteEvent

### Step 6: QuestionBank Chunks (Optional, for scaling)
If QuestionBankV2 reports chunk loading issues:
1. In `ReplicatedStorage/QuestionChunks/`
2. Create ModuleScripts named `Chunk_001`, `Chunk_002`, etc.
3. Each chunk returns a table of questions
4. See `QuestionBankV2-Studio-Chunking-Notes.md` for format

---

## Section 6: Known Issues & Workarounds

| Issue | Symptom | Fix |
|-------|---------|-----|
| HTML entities in Lua | `&gt;=` in code → syntax error | All files sanitized as of commit `6b49d3c3`. If you see `&gt;` or `&lt;`, replace with `>` or `<` |
| ProcessReceipt conflict | Two modules both set ProcessReceipt | ReceiptRouter.lua handles this — only ReceiptRouter touches MarketplaceService.ProcessReceipt |
| Product IDs = 0 | All GamePass/DevProduct IDs are placeholder 0 | Replace with real Roblox product IDs in GamePassConfig.lua and DevProductsConfig.lua before publishing |
| FTUE not firing | Player joins but no tutorial | Ensure FTUEController is in boot order AND RemoteEvent `FTUEStep` exists |
| Mobile input not showing | Tap-select buttons missing | Ensure MobileInputController is loaded by UnifiedClient AND platform detection returns "mobile" on mobile devices |

---

## Section 7: Module Inventory Summary

| Category | Count | Total Size |
|----------|-------|------------|
| Server modules | 31 | ~533KB |
| Client modules | 5 | ~100KB |
| Boot scripts | 2 | ~43KB |
| Legacy (skip) | 6 | ~83KB |
| **Active total** | **38** | **~676KB** |
| DOCS specs | 29 | ~450KB |

**CODE directory total: 41 files, ~759KB (including 6 legacy)**

---

## Section 8: Critical Path to Playable

Priority order for getting a playable build:

1. ✅ UnifiedServer.lua + DataStoreV2 + SecurityLayer + EconomyManager
2. ✅ QuestionBankV2 + EloManager (English questions work)
3. ✅ CombatSystem + WaveManager + EnemyFactory (combat works)
4. ✅ RewardBridge + EnglishRewardsManager (English→rewards pipeline)
5. ✅ UnifiedClient.lua + HUDController_v2 + ClientBridge (player sees UI)
6. ✅ MobileInputController (mobile players can answer questions)
7. ✅ FTUEController (new player tutorial)
8. ⬜ Replace placeholder Product IDs with real ones
9. ⬜ Studio smoke test — play through full loop
10. ⬜ Mobile device test — touch inputs work

**🔴 9 DAYS TO INCUBATOR (Apr 6)**
