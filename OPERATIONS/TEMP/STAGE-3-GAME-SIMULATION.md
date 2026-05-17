# BATTLE STAGE 3 — ROBLOX GAME SIMULATION
## Run Every Player Path to Failure

**Date:** 2026-03-26
**Auditor:** Ne0 (CHAT 000)
**Scope:** All 24 Lua modules in CANON/TRAIN-67/CODE/
**Method:** Static simulation — trace every player path from join → leave, identify every failure point

---

## THE TWO GAMES PROBLEM

Before simulating paths, there's a **critical architecture split**:

| System | Server Script | Client Script | Status |
|--------|--------------|---------------|--------|
| **Phase 1 Demo** | `GameMain_PHASE1_REVISED.lua` | `HUDController_PHASE1_REVISED.lua` | Playable but limited |
| **Production v2** | `MainServer_v2.lua` + `ServerGateway.lua` | `ClientBridge.lua` | Modular but incomplete |
| **FTUE** | `FTUEManager.lua` | (none — uses GameMain remotes) | Module, not wired |

**⚠️ CRITICAL: These two systems are NOT connected.** GameMain creates its own RemoteEvents in a "GameRemotes" folder. ServerGateway creates separate "ServerGateway" + "ClientDispatch" remotes. A player joining the game hits ONE of these systems, not both.

**Decision needed:** Which system boots? Right now, both scripts would run simultaneously in ServerScriptService, creating duplicate logic and conflicting game loops.

---

## PATH SIMULATIONS

### PATH 1: Solo Player Joins (Phase 1 Demo — GameMain)

```
STEP   | WHAT HAPPENS                          | RESULT
-------|---------------------------------------|--------
1      | Player joins                          | ✅ PlayerAdded fires, updateLobbyUI called
2      | checkLobbyReady()                     | ❌ BLOCKED — RequiredPlayers = 5, only 1 player
3      | Player sees lobby UI                  | ✅ "Players: 1/5" displayed
4      | Player waits...                       | ⏳ INFINITE WAIT — solo play impossible
5      | Player leaves                         | ❌ LOST — game never started
```

**FAILURE:** Solo players cannot play. RequiredPlayers = 5 is a hard gate with no bypass. FTUEManager has `shouldStartImmediately()` returning `true`, but **nobody calls it** — FTUEManager is never required or initialized by GameMain.

**FIX PRIORITY:** 🔴 CRITICAL — This kills 95%+ of first sessions. Most Roblox games get 1-2 concurrent players at launch.

---

### PATH 2: 5 Players Join (Phase 1 Demo — Happy Path)

```
STEP   | WHAT HAPPENS                          | RESULT
-------|---------------------------------------|--------
1      | Players 1-4 join                      | ✅ Lobby updates each time
2      | Player 5 joins, checkLobbyReady fires | ✅ Countdown begins (10s)
3      | Countdown: player leaves mid-count    | ✅ HANDLED — resets to Lobby
4      | All 5 stay, startGame() fires         | ✅ Phase = "Playing"
5      | Day 1, Waves 1-3 spawn enemies        | ⚠️ PARTIAL — see enemy path
6      | Day 1 complete, train moves           | ✅ moveTrain() tweens model
7      | Day 2, Waves 1-3                      | ✅ SigmaWalker unlocks at wave 2
8      | Day 2 complete → Town Phase           | ✅ teleportPlayersToTown()
9      | Town: collect 3 fuel barrels           | ✅ ProximityPrompt system works
10     | Town: timer expires, fuel < 3          | ✅ HANDLED — "reduced supplies"
11     | Town: fuel = 3 → Boss spawns           | ✅ spawnBoss() fires
12     | Boss: Baron Skibidi fight              | ⚠️ See boss path
13     | Boss defeated → back to train          | ✅ teleportPlayersToTrain()
14     | Day 3, Waves 1-3                       | ✅ Standard wave combat
15     | Day 3 complete → Cliffhanger           | ✅ 4-phase cinematic plays
16     | Game Over (survived = true)            | ✅ GameOver event fired
17     | ...then what?                          | ❌ DEAD END — no restart, no menu, no lobby reset
```

**FAILURE:** After the cliffhanger, the game is STUCK. Phase = "Complete", no code resets to Lobby. Players must rejoin the server.

**FIX PRIORITY:** 🔴 CRITICAL — Post-game loop is broken.

---

### PATH 3: Player Dies During Combat

```
STEP   | WHAT HAPPENS                          | RESULT
-------|---------------------------------------|--------
1      | Humanoid.Health reaches 0             | ✅ Died event fires
2      | "💀 PlayerName was eliminated!"        | ✅ Notification sent
3      | task.wait(5)                          | ✅ 5s respawn delay
4      | player:LoadCharacter()                | ✅ Player respawns
5      | Where do they spawn?                  | ⚠️ DEFAULT SPAWN — not train location
6      | Player spawns at SpawnLocation         | ❌ WRONG LOCATION if game is mid-wave
```

**FAILURE:** LoadCharacter() uses the default SpawnLocation. During combat/town/boss phases, the player respawns at the lobby spawn, not at the current game area. They're stranded.

**FIX PRIORITY:** 🟡 HIGH — Needs character teleport after respawn.

---

### PATH 4: Enemy AI Loop

```
STEP   | WHAT HAPPENS                          | RESULT
-------|---------------------------------------|--------
1      | createEnemy() called                  | ✅ Cap check (30 max)
2      | Template cloned from ServerStorage    | ⚠️ DEPENDS on EnemyModels folder existing
3      | Scale applied to all BaseParts        | ⚠️ Scales Size but not mass/density
4      | PivotTo spawn position                | ✅ Fixed from SetPrimaryPartCFrame
5      | AI loop starts (task.spawn)           | ✅ Chases nearest player
6      | getNearestPlayer() called             | ✅ Works if players alive
7      | All players dead → getNearestPlayer   | ⚠️ Returns nil — humanoid:MoveTo(nil) = silent error
8      | Enemy reaches player, deals damage    | ✅ DamageCooldown prevents spam
9      | Enemy killed → Died fires             | ✅ XP event fired, 2s decay, Destroy
10     | Remove from ActiveEnemies             | ✅ ipairs scan + table.remove
11     | Table.remove during iteration?         | ❌ NOT DURING — Died is async, safe
12     | 30 enemies active, new spawn blocked   | ✅ Cap works
13     | Enemy falls off map                   | ❌ ZOMBIE LEAK — no Y-position cleanup
```

**FAILURE:** Enemies that fall off the map (no kill plane) stay in ActiveEnemies forever. waitForWaveClear() never completes → game freezes at "waiting for wave clear."

**FIX PRIORITY:** 🔴 CRITICAL — Add kill plane check (Y < -100 → destroy).

---

### PATH 5: Boss Fight — Baron Skibidi

```
STEP   | WHAT HAPPENS                          | RESULT
-------|---------------------------------------|--------
1      | spawnBoss() — uses SigmaWalker as base| ⚠️ No dedicated boss model
2      | Scale 1.5x applied to all parts       | ✅ Visual but no collision resize
3      | Boss AI loop starts                   | ✅ 3 attacks on cooldowns
4      | Charge Attack: telegraph 2s → burst   | ✅ Speed boost + AoE damage
5      | Ground Stomp: AoE + knockback         | ⚠️ Velocity set directly (deprecated)
6      | Summon Adds: 4 SkibidiShamblers       | ⚠️ Ignores MaxActiveEnemies cap
7      | Boss health updated to all clients    | ✅ Every 0.3s
8      | rootPart destroyed mid-fight          | ✅ HANDLED — nil guard breaks loop
9      | All players die during boss           | ⚠️ Boss AI continues, players respawn at lobby
10     | Boss killed → BossDefeated event      | ✅ Cleanup + teleport back
11     | Boss killed during town timer active  | ⚠️ TownTimerActive still true, zombie spawner keeps going
```

**FAILURES:**
- Boss summon bypasses enemy cap → can exceed 30 active enemies
- `Velocity` property is deprecated for knockback (should use `ApplyImpulse` or `VectorForce`)
- If boss dies while town timer loop is still running, zombie spawner continues spawning into nothing
- All players dead = no game-over check during boss phase

**FIX PRIORITY:** 🟡 HIGH (summon cap), 🟢 LOW (Velocity deprecation)

---

### PATH 6: Town Phase — Edge Cases

```
STEP   | WHAT HAPPENS                          | RESULT
-------|---------------------------------------|--------
1      | Fuel barrel collected twice           | ✅ HANDLED — prompt.Enabled = false
2      | All barrels have Connected attribute  | ✅ Prevents double-connect
3      | Player collects barrel 3 → boss       | ✅ TownTimerActive = false stops timer
4      | Timer expires with 0 barrels          | ✅ "reduced supplies" message
5      | Timer expires with 2 barrels          | ✅ Same path
6      | Player disconnects during town        | ⚠️ townZombieCount never decrements
7      | Boss spawns, town zombies still spawn | ⚠️ Phase check: Phase == "Town" but spawnBoss sets Phase = "Boss"
```

**PARTIAL FIX:** The zombie spawner checks `GameState.Phase == "Town"`, so when spawnBoss sets Phase to "Boss", the loop SHOULD stop. But there's a race condition — the zombie spawner checks at the top of the while loop, and if it's mid-`task.wait(3)` when Phase changes, it spawns one more zombie before detecting the change. Minor but real.

---

### PATH 7: FTUEManager (DISCONNECTED)

```
STEP   | WHAT HAPPENS                          | RESULT
-------|---------------------------------------|--------
1      | Module loaded by...?                  | ❌ NOBODY — not required by any script
2      | runFTUE() called by...?               | ❌ NOBODY
3      | Solo start logic available            | ❌ DEAD CODE — never executes
4      | Difficulty scaling available           | ❌ DEAD CODE — never executes
5      | Starter weapon system available       | ❌ DEAD CODE — never executes
```

**FAILURE:** FTUEManager is a complete module but has ZERO integration points. It was built for Stage 1 of the pipeline but never wired into GameMain or MainServer_v2.

**FIX PRIORITY:** 🔴 CRITICAL — This is the solo-play enabler. Must be wired in.

---

### PATH 8: Production Server (MainServer_v2) — Parallel Boot

```
STEP   | WHAT HAPPENS                          | RESULT
-------|---------------------------------------|--------
1      | Script boots in ServerScriptService   | ✅ ObjectPool:Init() runs
2      | PlayerDataStore loads on PlayerAdded  | ✅ DataStore with deepCopy
3      | Auto-save every 300s                  | ✅ pcall wrapped
4      | BindToClose saves all players         | ✅ 25s timeout guard
5      | CampaignModule:StartChapter(day)      | ❌ NEVER CALLED — no game start trigger
6      | ServerGateway:Init()                  | ❌ NEVER CALLED — no initialization chain
7      | All 14 pipeline modules (Stages 1-20) | ❌ NEVER REGISTERED with ServerGateway
```

**FAILURE:** MainServer_v2 boots, loads player data, but never starts the game. No orchestrator calls `CampaignModule:StartChapter()`. The ServerGateway is never initialized, so no modules register their actions.

**FIX PRIORITY:** 🔴 CRITICAL — Need a bootstrap/orchestrator script that:
1. Calls `ServerGateway:Init()`
2. Registers all modules with the gateway
3. Starts the campaign when ready

---

### PATH 9: Client-Side Communication

```
STEP   | WHAT HAPPENS                          | RESULT
-------|---------------------------------------|--------
1      | HUDController connects to "GameRemotes" | ✅ Works with GameMain
2      | ClientBridge connects to "ServerGateway" | ✅ Works with ServerGateway
3      | Both run simultaneously                  | ⚠️ TWO separate remote systems
4      | HUDController shows Phase 1 UI           | ✅ Lobby, waves, boss, town, cliffhanger
5      | ClientBridge shows...?                    | ❌ NOTHING — no UI modules registered
6      | CodexClient loads CodexData               | ⚠️ WaitForChild with 10s timeout
7      | Tab to open Codex                         | ✅ Works if CodexData loaded
8      | Codex entries from...?                     | ⚠️ Hardcoded in CodexData, not from server
```

**FAILURE:** The two client systems (HUDController + ClientBridge) coexist but don't talk to each other. HUDController handles all Phase 1 UI. ClientBridge sits idle waiting for ServerGateway messages that never come.

---

### PATH 10: Data Persistence

```
STEP   | WHAT HAPPENS                          | RESULT
-------|---------------------------------------|--------
1      | Player joins → loadPlayerData         | ✅ GetAsync with defaults backfill
2      | New player → deepCopy of template     | ✅ No shared reference bugs
3      | Player kills enemies → data.Kills++   | ❌ NEVER HAPPENS — GameMain doesn't touch MainServer data
4      | Player progresses days                 | ❌ NEVER HAPPENS — GameMain has no persistence
5      | Player leaves → savePlayerData         | ✅ UpdateAsync (safe)
6      | Server shuts down → BindToClose        | ✅ 25s timeout guard
7      | DataStore throttling                   | ⚠️ No retry logic on GetAsync failure
8      | FTUE completion → DataStore            | ✅ In FTUEManager but never called
```

**FAILURE:** GameMain (the system that actually runs) has ZERO persistence. All progress resets on rejoin. MainServer_v2 (which has persistence) never runs the game. The two halves of the system don't share state.

**FIX PRIORITY:** 🔴 CRITICAL — Players lose all progress every session.

---

### PATH 11: Economy Flow

```
STEP   | WHAT HAPPENS                          | RESULT
-------|---------------------------------------|--------
1      | Player earns XP from enemy kill       | ⚠️ Client-only via EnemyDied event, no server validation
2      | EconomyManager module exists           | ✅ Full two-currency system (Scrap Metal + Brain Cells)
3      | EconomyManager registered with...?    | ❌ NOBODY — not wired to ServerGateway
4      | Player earns coins in FTUE            | ❌ Uses leaderstats (placeholder), not EconomyManager
5      | GachaManager spends currency           | ❌ Calls EconomyManager but neither is initialized
6      | TradeManager transfers items           | ❌ Same — not initialized
```

**FAILURE:** Complete economy system exists in code but zero integration. Currency is purely cosmetic client-side numbers that don't persist.

---

### PATH 12: Monetization

```
STEP   | WHAT HAPPENS                          | RESULT
-------|---------------------------------------|--------
1      | MonetizationServer processes purchase  | ❌ Never initialized
2      | GamePassConfig checks ownership        | ❌ Never initialized  
3      | DevProductsConfig handles products     | ❌ Never initialized
4      | BattlePass tracks XP                   | ❌ Never initialized
5      | Player tries to buy Robux item         | ❌ No purchase prompts exist in UI
```

**FAILURE:** Zero monetization is functional. All modules exist but none are wired.

---

## SIMULATION SUMMARY

### Player Experience Timeline (Current State)

```
0:00  — Join server. See lobby. "Players: 1/5"
0:01  — Wait for 4 more players...
0:30  — Still waiting...
2:00  — Leave server. Never played.
```

**ACTUAL PLAYABLE PATH (if 5 players show up):**
```
0:00  — Join, lobby fills
0:10  — Countdown, game starts
0:15  — Day 1 waves spawn. Combat works.
3:00  — Day 1 cleared. Train moves.
3:05  — Day 2 waves.
6:00  — Town phase. Collect barrels.
8:00  — Boss fight. Baron Skibidi.
10:00 — Day 3 waves.
12:00 — Cliffhanger cinematic.
12:30 — "TO BE CONTINUED..." — game is stuck forever.
```

---

## FAILURE MATRIX

| # | Failure | Severity | Category | Fix Complexity |
|---|---------|----------|----------|----------------|
| F1 | Solo play impossible (5-player gate) | 🔴 CRITICAL | Gameplay | LOW — FTUEManager integration |
| F2 | Post-game dead end (no restart) | 🔴 CRITICAL | Gameplay | LOW — reset to Lobby |
| F3 | FTUEManager disconnected | 🔴 CRITICAL | Integration | MEDIUM — wire to GameMain |
| F4 | MainServer_v2 never starts game | 🔴 CRITICAL | Integration | HIGH — need orchestrator |
| F5 | Zero data persistence in playable path | 🔴 CRITICAL | Persistence | HIGH — bridge GameMain ↔ DataStore |
| F6 | Enemy fall-off-map leak | 🔴 CRITICAL | Gameplay | LOW — Y-check in AI loop |
| F7 | Respawn at wrong location | 🟡 HIGH | Gameplay | LOW — teleport after respawn |
| F8 | Boss summon bypasses enemy cap | 🟡 HIGH | Balance | LOW — check cap in summon |
| F9 | Economy modules disconnected | 🟡 HIGH | Integration | MEDIUM — ServerGateway registration |
| F10 | Monetization modules disconnected | 🟡 HIGH | Integration | MEDIUM — ServerGateway registration |
| F11 | XP is client-only, no server validation | 🟡 HIGH | Security | MEDIUM — server-side XP tracking |
| F12 | Velocity deprecation in boss knockback | 🟢 LOW | API | LOW — ApplyImpulse swap |
| F13 | No kill/death tracking persisted | 🟡 HIGH | Persistence | MEDIUM — wire to MainServer data |
| F14 | No game-over when all players die | 🟡 HIGH | Gameplay | MEDIUM — TPK detection |
| F15 | Two parallel remote systems (wasteful) | 🟢 LOW | Architecture | HIGH — unify to Gateway |

---

## INTEGRATION DEPENDENCY MAP

```
WHAT MUST BE WIRED FOR MINIMUM VIABLE GAME:

GameMain ──requires──→ FTUEManager (solo play + FTUE)
GameMain ──requires──→ DataStore (progress persistence)  
GameMain ──requires──→ Kill plane (enemy cleanup)
GameMain ──requires──→ Post-game reset (lobby return)
GameMain ──requires──→ Respawn teleport (correct location)

WHAT MUST BE WIRED FOR MONETIZABLE GAME:

ServerGateway ──registers──→ EconomyManager
ServerGateway ──registers──→ MonetizationServer
ServerGateway ──registers──→ GamePassConfig
ServerGateway ──registers──→ GachaManager
ServerGateway ──registers──→ TradeManager
ServerGateway ──registers──→ BattlePass
ServerGateway ──registers──→ DailyRewards
ServerGateway ──registers──→ ChallengeManager
ServerGateway ──registers──→ LeaderboardManager
ServerGateway ──registers──→ ReferralSystem
ServerGateway ──registers──→ GuildManager
ServerGateway ──registers──→ PrestigeManager
ServerGateway ──registers──→ WorldBoss
ServerGateway ──registers──→ AnomalyDetector

Orchestrator script ──calls──→ ServerGateway:Init()
                    ──calls──→ All module registrations
                    ──calls──→ CampaignModule:StartChapter()
```

---

## VERDICT

**The game has 24 well-written modules and ZERO integration glue.**

It's like having every organ for a human body laid out on a table — heart, lungs, brain, liver — all individually functional, but no circulatory system connecting them.

### The 5 fixes that make this a playable game:
1. **Kill the 5-player gate** — integrate FTUEManager, start at 1 player
2. **Add post-game reset** — return to Lobby after cliffhanger
3. **Add kill plane** — enemies below Y=-100 get destroyed
4. **Add respawn teleport** — players respawn at current game area
5. **Wire DataStore** — persist day/kills/XP through GameMain

### The 1 fix that makes this a monetizable game:
6. **Build the orchestrator** — a single BootServer.lua that initializes ServerGateway, registers all 14 modules, and bridges GameMain's event system to the Gateway pattern.

---

*Stage 3 Complete. Artifact class: 🏦 VAULT*
*Next: Stage 4 — Two-Server Architecture Stress Test*
