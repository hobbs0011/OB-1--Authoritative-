# Two-Server Problem — Architecture Resolution

**Game:** Survive a Brainrot (Train 6-7)
**Date:** 2026-03-26
**Status:** DESIGN COMPLETE — Ready for implementation
**Author:** OB1 / Ne0 for SOV100

---

## The Problem

Roblox games run on TWO execution environments that cannot directly share memory:

1. **Server** (ServerScriptService) — authoritative, trusted, persistent
2. **Client** (StarterPlayerScripts / StarterGui) — untrusted, display-only, per-player

With 22 server modules and growing, the communication layer between server and client becomes the critical chokepoint. Without architecture, you get:
- Spaghetti RemoteEvents (one per action × 22 modules = 100+ remotes)
- Race conditions on client join
- No validation layer between client requests and server execution
- Duplicate state management across modules
- No clear initialization order

## The Solution: Event Bus + Gateway Pattern

### Principle: ONE door in, ONE door out

All client↔server communication goes through **two master channels**:

```
┌─────────────────────────────────────────────────────────┐
│                         SERVER                          │
│                                                         │
│  ┌─────────────┐    ┌──────────────────────────────┐    │
│  │  GATEWAY     │───▶│  MODULE ROUTER                │   │
│  │  (inbound)   │    │                                │  │
│  │              │    │  Action → Module mapping:       │  │
│  │  Validates:  │    │  "gacha:pull"  → GachaManager   │  │
│  │  - PlayerID  │    │  "trade:offer" → TradeManager   │  │
│  │  - Action    │    │  "daily:claim" → DailyRewards   │  │
│  │  - Payload   │    │  "econ:spend"  → EconomyManager │  │
│  │  - Rate      │    │  "guild:join"  → GuildManager   │  │
│  │  - Anomaly   │    │  "boss:damage" → WorldBoss      │  │
│  │              │    │  "pass:claim"  → BattlePass      │  │
│  └──────▲───────┘    │  "pres:reset"  → PrestigeManager│  │
│         │            │  "ref:invite"  → ReferralSystem  │  │
│         │            │  "lb:query"    → LeaderboardMgr  │  │
│         │            │  "chal:submit" → ChallengeMgr    │  │
│         │            │  "ftue:step"   → FTUEManager     │  │
│         │            │  "shop:buy"    → DevProductsCfg  │  │
│         │            └──────────────────────────────┘    │
│         │                                                │
│  ┌──────┴───────┐    ┌──────────────────────────────┐    │
│  │  DISPATCHER  │◀───│  MODULE OUTPUTS               │   │
│  │  (outbound)  │    │  (state changes, UI updates)  │   │
│  │              │    └──────────────────────────────┘    │
│  │  Batches:    │                                        │
│  │  - Per frame │                                        │
│  │  - Per player│                                        │
│  │  - Priority  │                                        │
│  └──────┬───────┘                                        │
│         │                                                │
├─────────┼── RemoteEvent: "ServerGateway" (client→server) ┤
├─────────┼── RemoteEvent: "ClientDispatch" (server→client) ┤
│         │                                                │
│  ┌──────▼───────┐                                        │
│  │  CLIENT HUD  │                                        │
│  │  CONTROLLER  │                                        │
│  │              │                                        │
│  │  Renders:    │                                        │
│  │  - State     │                                        │
│  │  - Never     │                                        │
│  │    computes  │                                        │
│  └──────────────┘                                        │
└─────────────────────────────────────────────────────────┘
```

### Only TWO RemoteEvents

| Remote | Direction | Purpose |
|--------|-----------|---------|
| `ServerGateway` | Client → Server | ALL client requests |
| `ClientDispatch` | Server → Client | ALL server updates |

That's it. Two remotes for the entire game. Every module routes through these.

---

## Implementation: ServerGateway.lua

New module. Lives in ServerScriptService.

```lua
-- ServerGateway.lua
-- The ONE door between client and server
-- All client requests enter here, get validated, and route to modules

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local ServerGateway = {}

-- Remote setup
local gatewayRemote = Instance.new("RemoteEvent")
gatewayRemote.Name = "ServerGateway"
gatewayRemote.Parent = ReplicatedStorage

local dispatchRemote = Instance.new("RemoteEvent")
dispatchRemote.Name = "ClientDispatch"
dispatchRemote.Parent = ReplicatedStorage

-- Module registry (populated on init)
local moduleRegistry = {}
local actionMap = {}

-- Rate limiting per player per action
local rateLimits = {}
local RATE_WINDOW = 1  -- seconds
local MAX_REQUESTS_PER_WINDOW = 10

-- AnomalyDetector reference (injected on init)
local AnomalyDetector = nil

-----------------------------------------------
-- REGISTRATION
-----------------------------------------------

function ServerGateway:RegisterModule(prefix, module, actions)
    -- prefix: string like "gacha", "trade", "daily"
    -- module: the module table
    -- actions: { actionName = handlerFunction, ... }
    moduleRegistry[prefix] = module
    for actionName, handler in pairs(actions) do
        local fullAction = prefix .. ":" .. actionName
        actionMap[fullAction] = {
            module = module,
            handler = handler,
            prefix = prefix,
        }
    end
end

function ServerGateway:SetAnomalyDetector(detector)
    AnomalyDetector = detector
end

-----------------------------------------------
-- RATE LIMITING
-----------------------------------------------

local function checkRateLimit(player, action)
    local key = player.UserId .. ":" .. action
    local now = tick()
    
    if not rateLimits[key] then
        rateLimits[key] = { count = 0, windowStart = now }
    end
    
    local record = rateLimits[key]
    
    if now - record.windowStart > RATE_WINDOW then
        record.count = 0
        record.windowStart = now
    end
    
    record.count = record.count + 1
    
    if record.count > MAX_REQUESTS_PER_WINDOW then
        if AnomalyDetector then
            AnomalyDetector:Flag(player, "RATE_LIMIT", {
                action = action,
                count = record.count,
            })
        end
        return false
    end
    
    return true
end

-----------------------------------------------
-- VALIDATION
-----------------------------------------------

local function validateRequest(player, action, payload)
    -- 1. Action exists?
    if not actionMap[action] then
        return false, "UNKNOWN_ACTION"
    end
    
    -- 2. Player still in game?
    if not player.Parent then
        return false, "PLAYER_LEFT"
    end
    
    -- 3. Rate limit
    if not checkRateLimit(player, action) then
        return false, "RATE_LIMITED"
    end
    
    -- 4. Payload is table or nil
    if payload ~= nil and typeof(payload) ~= "table" then
        return false, "INVALID_PAYLOAD"
    end
    
    -- 5. AnomalyDetector pre-check (if available)
    if AnomalyDetector and AnomalyDetector.PreCheck then
        local ok, reason = AnomalyDetector:PreCheck(player, action, payload)
        if not ok then
            return false, "ANOMALY:" .. (reason or "FLAGGED")
        end
    end
    
    return true, nil
end

-----------------------------------------------
-- INBOUND HANDLER
-----------------------------------------------

gatewayRemote.OnServerEvent:Connect(function(player, action, payload)
    -- Validate
    local ok, reason = validateRequest(player, action, payload)
    if not ok then
        -- Send error back to client
        ServerGateway:Dispatch(player, "gateway:error", {
            action = action,
            reason = reason,
        })
        return
    end
    
    -- Route to module
    local entry = actionMap[action]
    local success, result = pcall(entry.handler, entry.module, player, payload or {})
    
    if not success then
        warn("[ServerGateway] Error in", action, ":", result)
        ServerGateway:Dispatch(player, "gateway:error", {
            action = action,
            reason = "SERVER_ERROR",
        })
    end
end)

-----------------------------------------------
-- OUTBOUND DISPATCH
-----------------------------------------------

function ServerGateway:Dispatch(player, channel, data)
    -- Send a state update to a specific player
    dispatchRemote:FireClient(player, channel, data)
end

function ServerGateway:Broadcast(channel, data)
    -- Send to ALL players
    dispatchRemote:FireAllClients(channel, data)
end

function ServerGateway:DispatchBatch(player, updates)
    -- Send multiple updates in one remote call
    -- updates = { {channel, data}, {channel, data}, ... }
    dispatchRemote:FireClient(player, "batch", updates)
end

-----------------------------------------------
-- PLAYER INIT (full state sync on join)
-----------------------------------------------

function ServerGateway:SyncPlayerState(player)
    -- Each registered module provides its initial state for a player
    local initBatch = {}
    for prefix, module in pairs(moduleRegistry) do
        if module.GetPlayerState then
            local state = module:GetPlayerState(player)
            if state then
                table.insert(initBatch, { prefix .. ":init", state })
            end
        end
    end
    
    if #initBatch > 0 then
        self:DispatchBatch(player, initBatch)
    end
end

-----------------------------------------------
-- CLEANUP
-----------------------------------------------

Players.PlayerRemoving:Connect(function(player)
    -- Clean rate limits
    for key, _ in pairs(rateLimits) do
        if string.find(key, tostring(player.UserId)) then
            rateLimits[key] = nil
        end
    end
end)

return ServerGateway
```

---

## Implementation: ClientBridge.lua

New module. Lives in StarterPlayerScripts.

```lua
-- ClientBridge.lua
-- The ONE door between client and server (client side)
-- All server updates arrive here and route to UI handlers

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local ClientBridge = {}

local gatewayRemote = ReplicatedStorage:WaitForChild("ServerGateway")
local dispatchRemote = ReplicatedStorage:WaitForChild("ClientDispatch")

-- Channel handlers
local handlers = {}

-----------------------------------------------
-- REGISTRATION
-----------------------------------------------

function ClientBridge:On(channel, callback)
    -- Register a handler for a specific channel
    -- e.g. ClientBridge:On("econ:update", function(data) ... end)
    if not handlers[channel] then
        handlers[channel] = {}
    end
    table.insert(handlers[channel], callback)
end

-----------------------------------------------
-- SEND TO SERVER
-----------------------------------------------

function ClientBridge:Send(action, payload)
    -- e.g. ClientBridge:Send("gacha:pull", { banner = "standard" })
    gatewayRemote:FireServer(action, payload)
end

-----------------------------------------------
-- RECEIVE FROM SERVER
-----------------------------------------------

dispatchRemote.OnClientEvent:Connect(function(channel, data)
    -- Handle batched updates
    if channel == "batch" then
        for _, update in ipairs(data) do
            local batchChannel = update[1]
            local batchData = update[2]
            local channelHandlers = handlers[batchChannel]
            if channelHandlers then
                for _, handler in ipairs(channelHandlers) do
                    handler(batchData)
                end
            end
        end
        return
    end
    
    -- Handle single update
    local channelHandlers = handlers[channel]
    if channelHandlers then
        for _, handler in ipairs(channelHandlers) do
            handler(data)
        end
    end
end)

return ClientBridge
```

---

## Module Registration Pattern

Every server module registers with the gateway on init:

```lua
-- Example: GachaManager registration
function GachaManager:Init(gateway)
    gateway:RegisterModule("gacha", self, {
        pull = self.HandlePull,        -- "gacha:pull"
        info = self.HandleGetInfo,     -- "gacha:info"
        pity = self.HandleGetPity,     -- "gacha:pity"
    })
    self.gateway = gateway
end

-- After processing, send result back through gateway
function GachaManager:HandlePull(player, payload)
    local result = self:ExecutePull(player, payload.banner)
    self.gateway:Dispatch(player, "gacha:result", result)
end

-- Provide initial state for new joiners
function GachaManager:GetPlayerState(player)
    return {
        pityCount = self:GetPity(player),
        activeBanners = self:GetActiveBanners(),
    }
end
```

---

## Init Order (GameMain.lua)

The boot sequence matters. Modules that others depend on init first:

```lua
-- GameMain.lua init sequence
local function InitializeGame()
    -- Layer 0: Infrastructure
    local Gateway = require(ServerGateway)
    local Anomaly = require(AnomalyDetector)
    Gateway:SetAnomalyDetector(Anomaly)
    
    -- Layer 1: Data & Economy (no dependencies on other game modules)
    local Ledger = require(LedgerSchema)
    local Economy = require(EconomyManager)
    Economy:Init(Gateway, Ledger)
    
    -- Layer 2: Progression (depends on Economy)
    local FTUE = require(FTUEManager)
    local Daily = require(DailyRewards)
    local Challenge = require(ChallengeManager)
    local Pass = require(BattlePass)
    local Prestige = require(PrestigeManager)
    FTUE:Init(Gateway, Economy)
    Daily:Init(Gateway, Economy)
    Challenge:Init(Gateway, Economy)
    Pass:Init(Gateway, Economy)
    Prestige:Init(Gateway, Economy, Ledger)
    
    -- Layer 3: Monetization (depends on Economy)
    local Gacha = require(GachaManager)
    local GamePasses = require(GamePassConfig)
    local DevProducts = require(DevProductsConfig)
    local Monetization = require(MonetizationServer)
    Gacha:Init(Gateway, Economy)
    GamePasses:Init(Gateway, Economy)
    DevProducts:Init(Gateway, Economy)
    Monetization:Init(Gateway, Economy)
    
    -- Layer 4: Social (depends on Economy, may cross-reference)
    local Trade = require(TradeManager)
    local Leaderboard = require(LeaderboardManager)
    local Referral = require(ReferralSystem)
    local Guild = require(GuildManager)
    local Boss = require(WorldBoss)
    Trade:Init(Gateway, Economy, Anomaly)
    Leaderboard:Init(Gateway)
    Referral:Init(Gateway, Economy)
    Guild:Init(Gateway, Economy)
    Boss:Init(Gateway, Economy)
    
    -- Layer 5: Player join handler
    Players.PlayerAdded:Connect(function(player)
        Ledger:LoadPlayer(player)
        Anomaly:RegisterPlayer(player)
        Gateway:SyncPlayerState(player)
        FTUE:CheckNewPlayer(player)
    end)
end
```

---

## Cross-Server Communication

For features that span multiple game servers (leaderboards, guilds, world boss, trading):

```
┌──────────────┐     MessagingService      ┌──────────────┐
│  Server A    │◄─────────────────────────▶│  Server B    │
│              │                            │              │
│  WorldBoss   │  "boss:damage" channel     │  WorldBoss   │
│  Guild       │  "guild:sync" channel      │  Guild       │
│  Leaderboard │  "lb:update" channel       │  Leaderboard │
│  Trade       │  "trade:cross" channel     │  Trade       │
└──────────────┘                            └──────────────┘
         │                                          │
         └──────────┐              ┌────────────────┘
                    ▼              ▼
              ┌─────────────────────────┐
              │    DataStoreService      │
              │    (source of truth)     │
              │                         │
              │  OrderedDataStore:       │
              │  - Leaderboards         │
              │  - Guild rankings       │
              │                         │
              │  DataStore:             │
              │  - Player inventories   │
              │  - Guild rosters        │
              │  - World Boss HP pool   │
              └─────────────────────────┘
```

### Rules for Cross-Server

1. **DataStore is truth.** MessagingService is notification only.
2. **Eventual consistency.** Accept 1-3 second delay between servers.
3. **Idempotent writes.** Every cross-server message must be safe to process twice.
4. **No cross-server trading.** Trades are server-local only (prevents dupe exploits).
5. **World Boss HP stored in DataStore.** Each server reads/writes atomically via UpdateAsync.
6. **Guild roster changes** go through DataStore with version stamps to prevent conflicts.
7. **Leaderboard updates** batch every 30 seconds, not per-kill (reduces DataStore calls).

---

## Anti-Cheat Integration

The Gateway pattern gives AnomalyDetector a single chokepoint:

```
Client Request → ServerGateway → AnomalyDetector:PreCheck() → Module Handler
                                        │
                                        ▼
                                 Rate limit check
                                 Payload validation
                                 Sequence analysis
                                 Value bounds check
                                 Player state consistency
```

Every request passes through AnomalyDetector before reaching any module. No bypasses.

---

## Migration Path

Current code → Gateway pattern in 4 steps:

### Step 1: Create ServerGateway.lua + ClientBridge.lua (new files)
### Step 2: Add `:Init(gateway)` to each module, register actions
### Step 3: Update GameMain boot sequence to use init layers
### Step 4: Remove any direct RemoteEvent creation from individual modules

**Estimated effort:** 2-3 hours of refactoring. No logic changes. Just plumbing.

---

## Benefits

| Before (spaghetti) | After (gateway) |
|-|-|
| 22+ RemoteEvents | 2 RemoteEvents |
| No central validation | Every request validated |
| Race conditions on join | Batched init sync |
| Modules create own remotes | Modules register, gateway routes |
| Hard to add anomaly detection | Single chokepoint |
| No rate limiting | Built-in per-player rate limiting |
| Client can call anything | Client can only call registered actions |

---

## Files to Create

| File | Location | Purpose |
|------|----------|---------|
| ServerGateway.lua | ServerScriptService | Inbound validation + routing |
| ClientBridge.lua | StarterPlayerScripts | Outbound requests + state reception |

## Files to Modify

| File | Change |
|------|--------|
| GameMain_PHASE1_REVISED.lua | Add layered init sequence |
| Every module (15 files) | Add `:Init(gateway)` + `:GetPlayerState()` |
| HUDController_PHASE1_REVISED.lua | Use ClientBridge instead of direct remotes |
| CodexClient.lua | Use ClientBridge instead of direct remotes |

---

*This document resolves the Two-Server Problem for Train 6-7. The gateway pattern scales to any number of modules without adding RemoteEvents. Server stays authoritative. Client stays dumb. AnomalyDetector guards the single door.*
