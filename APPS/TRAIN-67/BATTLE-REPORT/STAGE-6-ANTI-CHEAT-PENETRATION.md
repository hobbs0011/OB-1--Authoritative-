# BATTLE STAGE 6 — ANTI-CHEAT PENETRATION TEST

**Date:** 2026-03-26
**Auditor:** Ne0 (CHAT 000)
**Scope:** All client-server trust boundaries across 24 modules

---

## ROBLOX EXPLOIT LANDSCAPE

Roblox exploiters can:
- Execute arbitrary Lua on the client
- Fire any RemoteEvent/RemoteFunction to the server
- Read all client-side code (LocalScripts)
- Modify any client-side Instance
- Spoof any client-sent data
- Teleport their character
- Speed hack (modify WalkSpeed/JumpPower)
- Fly (modify physics)
- ESP (read all workspace positions)

Roblox exploiters CANNOT:
- Execute code on the server
- Read ServerScriptService or ServerStorage directly
- Modify server-side Instances
- Spoof MarketplaceService callbacks
- Bypass DataStore access controls

---

## ATTACK SURFACE MAP

### VECTOR 1: RemoteEvent Abuse (GameMain)

GameMain creates 22 RemoteEvents but **never listens to any client→server events**. All remotes are FireAllClients only. No OnServerEvent connections.

**Attack:** Client fires fake events TO other clients? NO — RemoteEvent:FireServer() would hit nothing. RemoteEvent:FireAllClients() is server-only.

**RESULT:** ✅ SAFE — GameMain has no client→server remotes to exploit. But also means clients can't do ANYTHING (no input handling, no actions).

### VECTOR 2: RemoteEvent Abuse (ServerGateway)

ServerGateway creates a "ServerGateway" RemoteEvent and connects OnServerEvent.

**Defenses in place:**
1. ✅ Action must be string
2. ✅ Action must exist in registry
3. ✅ Player must still be in game
4. ✅ Rate limiting (10 req/s per action)
5. ✅ Payload depth validation (max 3 levels)
6. ✅ Payload size validation (max 50 keys)
7. ✅ Type checking (no functions, userdata, threads)
8. ✅ AnomalyDetector pre-check hook
9. ✅ pcall around handler execution

**Attack:** Send 11 requests in 1 second → rate limited → AnomalyDetector flags

**RESULT:** ✅ STRONG — ServerGateway is well-defended. Best anti-cheat layer in the codebase. **BUT** it's never initialized, so all this protection does nothing.

### VECTOR 3: Character Manipulation

| Attack | Defense | Verdict |
|--------|---------|--------|
| Speed hack (WalkSpeed = 100) | ❌ No server-side speed validation | 🔴 VULNERABLE |
| Teleport hack (CFrame) | ❌ No server-side position validation | 🔴 VULNERABLE |
| Fly hack (BodyVelocity) | ❌ No physics validation | 🔴 VULNERABLE |
| God mode (Health = math.huge) | ⚠️ Server sets health but doesn't re-validate | 🟡 PARTIAL |
| Noclip (CanCollide = false) | ❌ No collision validation | 🔴 VULNERABLE |

**Notes on God Mode:** GameMain's damage system reads `humanoid.Health` and calls `TakeDamage()`. If client sets Health to max constantly, the server's TakeDamage still fires but client overwrites. However, Humanoid.Health is replicated from server to client in Roblox's default setup. If the server calls TakeDamage, it SHOULD replicate. An exploiter would need to use a local script to constantly heal, which would fight the server replication.

**Practical exploit level:** Speed + teleport + fly are trivially exploitable. God mode requires more sophistication but is achievable.

### VECTOR 4: AnomalyDetector Analysis

AnomalyDetector.lua (16KB) — the dedicated anti-cheat module.

**Checks it performs:**
1. Speed validation (WalkSpeed anomaly)
2. Teleport detection (position delta per tick)
3. Damage output validation (damage vs weapon stats)
4. Kill rate anomaly (too many kills too fast)
5. Currency gain rate anomaly
6. Request frequency anomaly
7. Payload structure anomaly

**Problem:** AnomalyDetector is a ModuleScript that must be:
1. Required by a server script
2. Connected to ServerGateway via `SetAnomalyDetector()`
3. Fed player data continuously

**Current status:** DISCONNECTED. All 7 checks exist but none execute.

### VECTOR 5: Enemy Kill Spoofing

**Current flow:**
```
Server: enemy humanoid dies → fires EnemyDied to all clients
Client: receives EnemyDied → shows VFX + XP popup
Server: ??? → no XP/currency tracking
```

**Attack:** Not needed. There's nothing to spoof because XP/currency aren't tracked server-side.

**When economy activates:** If XP/currency are granted on the server in the Died callback, an exploiter can't fake kills. But if currency is granted based on client reports, it's trivially exploitable.

### VECTOR 6: DataStore Manipulation

DataStores are server-only. Clients cannot directly read or write. ✅ SAFE by Roblox architecture.

But: if ServerGateway were active and a module handler did `playerData[field] = payload.value` without validating the field name or value type, an exploiter could set arbitrary data.

**Example exploit:**
```lua
-- Client sends:
gatewayRemote:FireServer("economy:setBalance", { amount = 999999 })
-- If handler blindly trusts payload...
```

**Defense:** EconomyManager should validate all mutations. Never trust payload values for currency amounts.

### VECTOR 7: Fuel Barrel Speed Exploit

Town phase barrels use ProximityPrompt (server-authoritative). Exploiter teleports to each barrel → collects all 3 instantly → boss spawns in <1 second.

**Impact:** Minor — barrel collection has no negative consequence for being fast. Actually beneficial for the team.

**If this matters:** Add a minimum time between barrel collections.

### VECTOR 8: Boss Phase Exploit

Boss takes damage via `humanoid:TakeDamage()` which respects Roblox's damage system. But the game has no weapon system — there's no code for players to deal damage. The demo likely expects players to use default Roblox tools or a weapon system that doesn't exist yet.

**CRITICAL FINDING:** Players cannot damage enemies or bosses. There's no attack/weapon script in the codebase.

---

## EXPLOIT SEVERITY MATRIX

| # | Exploit | Severity | Active? | Fix |
|---|---------|----------|---------|-----|
| E1 | Speed hack | 🔴 HIGH | YES (when game runs) | AnomalyDetector activation |
| E2 | Teleport hack | 🔴 HIGH | YES | Position validation |
| E3 | Fly hack | 🟡 MEDIUM | YES | Physics validation |
| E4 | God mode | 🟡 MEDIUM | PARTIAL | Server-auth health |
| E5 | Currency fabrication | 🔴 HIGH | NO (economy not active) | Server-side economy |
| E6 | No player attack system | 🔴 CRITICAL | YES | Build weapon system |
| E7 | Noclip | 🟡 MEDIUM | YES | Collision validation |

---

## CRITICAL FINDING: NO COMBAT SYSTEM

**The game spawns enemies that chase and damage players. But players have NO WAY to fight back.** There is no:
- Weapon tool/script
- Attack RemoteEvent
- Damage dealing from player to enemy
- Click/tap to attack mechanic

FTUEManager references a "RustyPipe" weapon but the weapon script/tool doesn't exist in the codebase. The FTUE creates a Tool instance with `RequiresHandle = false` as a **fallback placeholder** that does nothing.

The game is unplayable not because of 5-player gate, but because **players cannot kill enemies.**

---

## VERDICT

**The anti-cheat layer (AnomalyDetector + ServerGateway) is the best-designed system in the codebase — and the most disconnected.** If wired, it would provide solid protection against common Roblox exploits.

**The bigger problem: players can't fight.** Anti-cheat is irrelevant when there's no combat system to exploit.

---

*Stage 6 Complete. Artifact class: 🏦 VAULT*
