--[[
    ServerGateway.lua
    The ONE door between client and server.
    All client requests enter here, get validated, and route to modules.
    
    Part of: Train 6-7 — Survive a Brainrot
    Architecture: Event Bus + Gateway Pattern
    See: TWO-SERVER-PROBLEM-ARCHITECTURE.md
    
    Gospel 444 Palette: Purple #a855f7 / Gold #f59e0b / Dark #0f0f1a / NO BLUE
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local ServerGateway = {}
ServerGateway.__index = ServerGateway

-----------------------------------------------
-- CONSTANTS
-----------------------------------------------

local RATE_WINDOW = 1           -- seconds
local MAX_REQUESTS_PER_WINDOW = 10
local MAX_PAYLOAD_DEPTH = 3     -- prevent deeply nested exploit payloads
local MAX_PAYLOAD_SIZE = 50     -- max keys in payload table
local BATCH_INTERVAL = 0.1      -- seconds between dispatch batches
local VERSION = "1.0.0"

-----------------------------------------------
-- STATE
-----------------------------------------------

local gatewayRemote = nil
local dispatchRemote = nil
local moduleRegistry = {}       -- prefix -> module
local actionMap = {}            -- "prefix:action" -> { module, handler, prefix }
local rateLimits = {}           -- "userId:action" -> { count, windowStart }
local pendingDispatches = {}    -- playerId -> { {channel, data}, ... }
local AnomalyDetector = nil
local initialized = false

-----------------------------------------------
-- REMOTE SETUP
-----------------------------------------------

local function setupRemotes()
    -- Create or find remotes
    gatewayRemote = ReplicatedStorage:FindFirstChild("ServerGateway")
    if not gatewayRemote then
        gatewayRemote = Instance.new("RemoteEvent")
        gatewayRemote.Name = "ServerGateway"
        gatewayRemote.Parent = ReplicatedStorage
    end
    
    dispatchRemote = ReplicatedStorage:FindFirstChild("ClientDispatch")
    if not dispatchRemote then
        dispatchRemote = Instance.new("RemoteEvent")
        dispatchRemote.Name = "ClientDispatch"
        dispatchRemote.Parent = ReplicatedStorage
    end
end

-----------------------------------------------
-- PAYLOAD VALIDATION
-----------------------------------------------

local function validatePayloadDepth(tbl, depth)
    if depth > MAX_PAYLOAD_DEPTH then
        return false
    end
    
    local keyCount = 0
    for k, v in pairs(tbl) do
        keyCount = keyCount + 1
        if keyCount > MAX_PAYLOAD_SIZE then
            return false
        end
        
        -- Keys must be strings or numbers
        if typeof(k) ~= "string" and typeof(k) ~= "number" then
            return false
        end
        
        -- Reject functions, userdata, threads
        local vType = typeof(v)
        if vType == "function" or vType == "userdata" or vType == "thread" then
            return false
        end
        
        -- Recurse into tables
        if vType == "table" then
            if not validatePayloadDepth(v, depth + 1) then
                return false
            end
        end
    end
    
    return true
end

-----------------------------------------------
-- RATE LIMITING
-----------------------------------------------

local function checkRateLimit(player, action)
    local key = tostring(player.UserId) .. ":" .. action
    local now = tick()
    
    if not rateLimits[key] then
        rateLimits[key] = { count = 0, windowStart = now }
    end
    
    local record = rateLimits[key]
    
    -- Reset window if expired
    if now - record.windowStart > RATE_WINDOW then
        record.count = 0
        record.windowStart = now
    end
    
    record.count = record.count + 1
    
    if record.count > MAX_REQUESTS_PER_WINDOW then
        if AnomalyDetector and AnomalyDetector.Flag then
            pcall(function()
                AnomalyDetector:Flag(player, "RATE_LIMIT", {
                    action = action,
                    count = record.count,
                    window = RATE_WINDOW,
                })
            end)
        end
        return false
    end
    
    return true
end

-----------------------------------------------
-- REQUEST VALIDATION
-----------------------------------------------

local function validateRequest(player, action, payload)
    -- 1. Action must be a string
    if typeof(action) ~= "string" then
        return false, "INVALID_ACTION_TYPE"
    end
    
    -- 2. Action exists in registry?
    if not actionMap[action] then
        return false, "UNKNOWN_ACTION"
    end
    
    -- 3. Player still in game?
    if not player or not player.Parent then
        return false, "PLAYER_LEFT"
    end
    
    -- 4. Rate limit
    if not checkRateLimit(player, action) then
        return false, "RATE_LIMITED"
    end
    
    -- 5. Payload validation
    if payload ~= nil then
        if typeof(payload) ~= "table" then
            return false, "INVALID_PAYLOAD_TYPE"
        end
        if not validatePayloadDepth(payload, 1) then
            return false, "INVALID_PAYLOAD_STRUCTURE"
        end
    end
    
    -- 6. AnomalyDetector pre-check
    if AnomalyDetector and AnomalyDetector.PreCheck then
        local ok, reason = pcall(function()
            return AnomalyDetector:PreCheck(player, action, payload)
        end)
        if ok and reason == false then
            return false, "ANOMALY_FLAGGED"
        end
    end
    
    return true, nil
end

-----------------------------------------------
-- MODULE REGISTRATION
-----------------------------------------------

function ServerGateway:RegisterModule(prefix, module, actions)
    assert(typeof(prefix) == "string", "Gateway: prefix must be string")
    assert(typeof(actions) == "table", "Gateway: actions must be table")
    
    moduleRegistry[prefix] = module
    
    for actionName, handler in pairs(actions) do
        local fullAction = prefix .. ":" .. actionName
        if actionMap[fullAction] then
            warn("[ServerGateway] Overwriting existing action:", fullAction)
        end
        actionMap[fullAction] = {
            module = module,
            handler = handler,
            prefix = prefix,
        }
    end
    
    print("[ServerGateway] Registered module:", prefix, "(", self:CountActions(prefix), "actions)")
end

function ServerGateway:CountActions(prefix)
    local count = 0
    for action, _ in pairs(actionMap) do
        if string.sub(action, 1, #prefix + 1) == prefix .. ":" then
            count = count + 1
        end
    end
    return count
end

function ServerGateway:SetAnomalyDetector(detector)
    AnomalyDetector = detector
end

-----------------------------------------------
-- INBOUND HANDLER
-----------------------------------------------

local function onServerEvent(player, action, payload)
    -- Validate the request
    local ok, reason = validateRequest(player, action, payload)
    if not ok then
        -- Send error back to client
        ServerGateway:Dispatch(player, "gateway:error", {
            action = action,
            reason = reason,
        })
        return
    end
    
    -- Route to module handler
    local entry = actionMap[action]
    local success, result = pcall(entry.handler, entry.module, player, payload or {})
    
    if not success then
        warn("[ServerGateway] Error in", action, ":", tostring(result))
        ServerGateway:Dispatch(player, "gateway:error", {
            action = action,
            reason = "SERVER_ERROR",
        })
        
        -- Log to AnomalyDetector
        if AnomalyDetector and AnomalyDetector.LogError then
            pcall(function()
                AnomalyDetector:LogError(player, action, tostring(result))
            end)
        end
    end
end

-----------------------------------------------
-- OUTBOUND DISPATCH
-----------------------------------------------

function ServerGateway:Dispatch(player, channel, data)
    if not player or not player.Parent then return end
    dispatchRemote:FireClient(player, channel, data)
end

function ServerGateway:Broadcast(channel, data)
    dispatchRemote:FireAllClients(channel, data)
end

function ServerGateway:DispatchBatch(player, updates)
    if not player or not player.Parent then return end
    if #updates == 0 then return end
    
    -- Single update? Send directly
    if #updates == 1 then
        dispatchRemote:FireClient(player, updates[1][1], updates[1][2])
        return
    end
    
    -- Multiple updates? Batch them
    dispatchRemote:FireClient(player, "batch", updates)
end

-- Queue a dispatch for batched sending (reduces remote calls per frame)
function ServerGateway:QueueDispatch(player, channel, data)
    local playerId = player.UserId
    if not pendingDispatches[playerId] then
        pendingDispatches[playerId] = {}
    end
    table.insert(pendingDispatches[playerId], { channel, data })
end

-- Flush all pending dispatches (called on heartbeat)
local function flushDispatches()
    for playerId, updates in pairs(pendingDispatches) do
        if #updates > 0 then
            local player = Players:GetPlayerByUserId(playerId)
            if player then
                ServerGateway:DispatchBatch(player, updates)
            end
        end
    end
    pendingDispatches = {}
end

-----------------------------------------------
-- PLAYER STATE SYNC (on join)
-----------------------------------------------

function ServerGateway:SyncPlayerState(player)
    local initBatch = {}
    
    for prefix, module in pairs(moduleRegistry) do
        if module.GetPlayerState then
            local success, state = pcall(module.GetPlayerState, module, player)
            if success and state then
                table.insert(initBatch, { prefix .. ":init", state })
            elseif not success then
                warn("[ServerGateway] GetPlayerState failed for", prefix, ":", tostring(state))
            end
        end
    end
    
    if #initBatch > 0 then
        self:DispatchBatch(player, initBatch)
    end
    
    -- Confirm sync complete
    self:Dispatch(player, "gateway:ready", {
        version = VERSION,
        modules = self:GetModuleList(),
    })
end

function ServerGateway:GetModuleList()
    local list = {}
    for prefix, _ in pairs(moduleRegistry) do
        table.insert(list, prefix)
    end
    table.sort(list)
    return list
end

-----------------------------------------------
-- CLEANUP
-----------------------------------------------

local function onPlayerRemoving(player)
    local userId = tostring(player.UserId)
    
    -- Clean rate limits for this player
    local keysToRemove = {}
    for key, _ in pairs(rateLimits) do
        if string.sub(key, 1, #userId + 1) == userId .. ":" then
            table.insert(keysToRemove, key)
        end
    end
    for _, key in ipairs(keysToRemove) do
        rateLimits[key] = nil
    end
    
    -- Clean pending dispatches
    pendingDispatches[player.UserId] = nil
end

-----------------------------------------------
-- DIAGNOSTICS
-----------------------------------------------

function ServerGateway:GetStats()
    local actionCount = 0
    for _ in pairs(actionMap) do
        actionCount = actionCount + 1
    end
    
    local moduleCount = 0
    for _ in pairs(moduleRegistry) do
        moduleCount = moduleCount + 1
    end
    
    return {
        version = VERSION,
        modules = moduleCount,
        actions = actionCount,
        rateLimitEntries = 0,  -- approximate
    }
end

-----------------------------------------------
-- INIT
-----------------------------------------------

function ServerGateway:Init()
    if initialized then
        warn("[ServerGateway] Already initialized")
        return
    end
    
    setupRemotes()
    
    -- Connect inbound handler
    gatewayRemote.OnServerEvent:Connect(onServerEvent)
    
    -- Connect player cleanup
    Players.PlayerRemoving:Connect(onPlayerRemoving)
    
    -- Heartbeat flush for batched dispatches
    RunService.Heartbeat:Connect(flushDispatches)
    
    initialized = true
    print("[ServerGateway] Initialized v" .. VERSION)
end

return ServerGateway
