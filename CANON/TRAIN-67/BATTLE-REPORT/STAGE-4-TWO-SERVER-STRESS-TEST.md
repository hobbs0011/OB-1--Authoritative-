# BATTLE STAGE 4 — TWO-SERVER ARCHITECTURE STRESS TEST

**Date:** 2026-03-26
**Auditor:** Ne0 (CHAT 000)
**Scope:** GameMain (Phase 1) vs MainServer_v2 (Production) + ServerGateway/ClientBridge

---

## THE PROBLEM

Two complete server architectures exist in the same codebase. Both would boot in ServerScriptService simultaneously. They do NOT share state, remotes, or game loop control.

### Architecture A: Phase 1 Demo
```
GameMain_PHASE1_REVISED.lua (Server)
  ├── Creates "GameRemotes" folder (22 RemoteEvents)
  ├── Manages GameState directly (monolith)
  ├── Spawns enemies, runs waves, boss, town, cliffhanger
  └── HUDController_PHASE1_REVISED.lua (Client) listens to GameRemotes
```

### Architecture B: Production v2
```
MainServer_v2.lua (Server)
  ├── DataStore persistence
  ├── Object pool system
  ├── Campaign system (99 days)
  ├── Class system (5 classes)
  └── NEVER starts the game (no trigger)

ServerGateway.lua (Server)
  ├── Creates "ServerGateway" + "ClientDispatch" RemoteEvents
  ├── Rate limiting, payload validation, anomaly detection
  ├── Module registration system
  └── NEVER initialized (no Init() call)

ClientBridge.lua (Client)
  ├── Listens to "ClientDispatch" remote
  ├── Channel-based message routing
  └── RECEIVES NOTHING (ServerGateway never sends)
```

---

## STRESS TEST SCENARIOS

### SCENARIO 1: Both Scripts in ServerScriptService

| Event | GameMain | MainServer_v2 | Conflict? |
|-------|----------|---------------|----------|
| PlayerAdded | updateLobbyUI() | loadPlayerData() | ⚠️ Both fire, no conflict but wasteful |
| PlayerRemoving | updateLobbyUI() | savePlayerData() | ⚠️ Both fire, MainServer saves data nobody uses |
| BindToClose | (none) | saveAllPlayers() | ✅ Only MainServer binds |
| Auto-save loop | (none) | Every 300s | ⚠️ Saves data nobody uses |
| RemoteEvents | 22 in GameRemotes | 2 (Gateway+Dispatch) | ✅ Different folders, no name collision |
| ObjectPool:Init() | (none) | Clones enemies to pool | ⚠️ Clones enemies GameMain also clones |

**VERDICT:** No hard crashes, but MainServer_v2 is a phantom — running DataStore ops, pooling objects, and saving data that the actual game (GameMain) never touches. Wasted memory, wasted DataStore budget.

### SCENARIO 2: Memory Impact

| System | Estimated Memory |
|--------|------------------|
| GameMain enemy spawning (up to 30 active) | ~15-30 MB |
| MainServer_v2 ObjectPool (50 pre-cloned) | ~25-50 MB |
| Both running simultaneously | ~40-80 MB WASTED on unused pool |

Roblox server memory budget: ~1-2 GB. Not fatal, but 50 pooled enemies sitting in ServerStorage unused is pure waste.

### SCENARIO 3: DataStore Budget Impact

| Operation | Source | Rate |
|-----------|--------|------|
| GetAsync on join | MainServer_v2 | 1 per player join |
| UpdateAsync on leave | MainServer_v2 | 1 per player leave |
| SetAsync for FTUE | FTUEManager | 1 per new player (never fires) |
| Auto-save | MainServer_v2 | All players every 300s |

Roblox DataStore limits: 60 + (10 × players) requests per minute. With 5 players, that's 110/min budget. Auto-save of 5 players every 300s = 5 UpdateAsync calls = trivial. **BUT** the data saved is never read by the game that runs.

### SCENARIO 4: Remote Event Collision Analysis

**GameMain creates these remotes:**
```
UpdateLobby, GameStartCountdown, GameStarted,
UpdateWave, UpdateDay, WaveComplete, DayComplete,
UpdateHealth, EnemyDied, PlayerDamaged,
BossSpawned, UpdateBossHealth, BossDefeated,
TownEntered, UpdateTownTimer, UpdateFuelCount, TownComplete,
CliffhangerPhase, GameOver,
ShowNotification, UpdateSquadBonus,
ScreenShake, PurpleFlash
```

**ServerGateway creates these remotes:**
```
ServerGateway, ClientDispatch
```

**Collision:** NONE. Different names, different folders.

### SCENARIO 5: Pipeline Module Isolation

The 14 pipeline modules (Stages 1-20) are all ModuleScripts that return tables:

| Module | Depends On | Current State |
|--------|-----------|---------------|
| FTUEManager | GameMain's createEnemy, GameRemotes | DISCONNECTED |
| DailyRewards | DataStore, RemoteEvents | STANDALONE |
| AnomalyDetector | ServerGateway reference | STANDALONE |
| EconomyManager | DataStore | STANDALONE |
| GamePassConfig | MarketplaceService | STANDALONE |
| GachaManager | EconomyManager | CHAIN DEPENDENCY |
| TradeManager | EconomyManager | CHAIN DEPENDENCY |
| DevProductsConfig | MarketplaceService | STANDALONE |
| ChallengeManager | DataStore, player events | STANDALONE |
| LeaderboardManager | OrderedDataStore | STANDALONE |
| ReferralSystem | DataStore | STANDALONE |
| BattlePass | DataStore, XP events | STANDALONE |
| GuildManager | DataStore, MemoryStore | STANDALONE |
| PrestigeManager | DataStore, EconomyManager | CHAIN DEPENDENCY |
| WorldBoss | Enemy system, player events | CHAIN DEPENDENCY |

**CHAIN DEPENDENCIES:**
- GachaManager → EconomyManager → DataStore
- TradeManager → EconomyManager → DataStore
- PrestigeManager → EconomyManager → DataStore
- WorldBoss → Enemy spawning system

All chains are broken because EconomyManager is never initialized.

---

## RESOLUTION PATH

### Option A: Evolve GameMain (RECOMMENDED for launch)
1. Keep GameMain as the running server
2. Add `require()` calls for: FTUEManager, DailyRewards, EconomyManager, AnomalyDetector
3. Add DataStore persistence directly into GameMain
4. Remove RequiredPlayers gate (use FTUEManager.shouldStartImmediately())
5. Add post-game reset
6. Disable MainServer_v2 (rename to .lua.disabled or move out of ServerScriptService)

**Effort:** ~200 lines of integration code
**Risk:** LOW — GameMain works, just needs modules plugged in

### Option B: Build the Orchestrator (RECOMMENDED for production)
1. Create `BootServer.lua` — single entry point
2. BootServer calls ServerGateway:Init()
3. BootServer registers all modules with Gateway
4. BootServer bridges GameMain's event system to Gateway
5. Retire GameMain's direct remote creation
6. All communication flows through ServerGateway → ClientBridge

**Effort:** ~500 lines of orchestration code
**Risk:** MEDIUM — rewires the entire communication layer

### Option C: Hybrid (RECOMMENDED overall)
1. Phase 1 launch: Option A (GameMain + essential modules)
2. Post-launch: Migrate to Option B incrementally
3. Each module gets a Gateway registration without breaking GameMain

---

## VERDICT

**The two-server architecture is not a bug — it's an evolution gap.** GameMain is the v1 monolith that works. MainServer_v2 is the v2 modular architecture that's ready but unwired. The path forward is clear: wire the essentials into GameMain for launch, then migrate to the Gateway pattern for scale.

**No crashes. No data corruption. Just wasted resources and unrealized potential.**

---

*Stage 4 Complete. Artifact class: 🏦 VAULT*
