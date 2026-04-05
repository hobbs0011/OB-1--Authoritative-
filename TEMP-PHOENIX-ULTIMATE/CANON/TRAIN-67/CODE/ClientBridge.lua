--[[
    ClientBridge.lua
    The ONE door between client and server (client side).
    All server updates arrive here and route to UI handlers.
    All client requests leave through here.
    
    Part of: Train 6-7 — Survive a Brainrot
    Architecture: Event Bus + Gateway Pattern
    See: TWO-SERVER-PROBLEM-ARCHITECTURE.md
    
    Gospel 444 Palette: Purple #a855f7 / Gold #f59e0b / Dark #0f0f1a / NO BLUE
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local ClientBridge = {}
ClientBridge.__index = ClientBridge

-----------------------------------------------
-- CONSTANTS
-----------------------------------------------

local REMOTE_TIMEOUT = 10       -- seconds to wait for remotes on init
local VERSION = "1.0.0"

-----------------------------------------------
-- STATE
-----------------------------------------------

local gatewayRemote = nil       -- client -> server
local dispatchRemote = nil      -- server -> client
local handlers = {}             -- channel -> { callback, callback, ... }
local errorHandlers = {}        -- action -> callback (for specific error handling)
local globalErrorHandler = nil  -- catch-all error handler
local initialized = false
local serverReady = false
local serverModules = {}        -- list of registered server modules
local pendingCallbacks = {}     -- for request-response pattern

-----------------------------------------------
-- CHANNEL REGISTRATION
-----------------------------------------------

function ClientBridge:On(channel, callback)
    assert(typeof(channel) == "string", "ClientBridge:On — channel must be string")
    assert(typeof(callback) == "function", "ClientBridge:On — callback must be function")
    
    if not handlers[channel] then
        handlers[channel] = {}
    end
    table.insert(handlers[channel], callback)
    
    return function()
        -- Return disconnect function
        for i, cb in ipairs(handlers[channel]) do
            if cb == callback then
                table.remove(handlers[channel], i)
                break
            end
        end
    end
end

-- Register handler for a specific action's errors
function ClientBridge:OnError(action, callback)
    errorHandlers[action] = callback
end

-- Global error handler
function ClientBridge:OnAnyError(callback)
    globalErrorHandler = callback
end

-----------------------------------------------
-- SEND TO SERVER
-----------------------------------------------

function ClientBridge:Send(action, payload)
    assert(typeof(action) == "string", "ClientBridge:Send — action must be string")
    
    if not gatewayRemote then
        warn("[ClientBridge] Not initialized — cannot send:", action)
        return false
    end
    
    gatewayRemote:FireServer(action, payload)
    return true
end

-- Send with a one-time response callback
-- The callback fires on the next message matching responseChannel
function ClientBridge:Request(action, payload, responseChannel, callback, timeout)
    timeout = timeout or 5
    
    self:Send(action, payload)
    
    -- Set up one-time listener
    local connection
    local timer
    
    connection = self:On(responseChannel, function(data)
        if connection then
            connection()  -- disconnect
            connection = nil
        end
        if timer then
            task.cancel(timer)
            timer = nil
        end
        callback(true, data)
    end)
    
    -- Timeout
    timer = task.delay(timeout, function()
        if connection then
            connection()  -- disconnect
            connection = nil
        end
        callback(false, "TIMEOUT")
    end)
end

-----------------------------------------------
-- RECEIVE FROM SERVER
-----------------------------------------------

local function processMessage(channel, data)
    local channelHandlers = handlers[channel]
    if channelHandlers then
        for _, handler in ipairs(channelHandlers) do
            local success, err = pcall(handler, data)
            if not success then
                warn("[ClientBridge] Handler error on", channel, ":", tostring(err))
            end
        end
    end
end

local function onClientEvent(channel, data)
    -- Handle batched updates
    if channel == "batch" and typeof(data) == "table" then
        for _, update in ipairs(data) do
            if typeof(update) == "table" and #update >= 2 then
                processMessage(update[1], update[2])
            end
        end
        return
    end
    
    -- Handle gateway errors
    if channel == "gateway:error" and typeof(data) == "table" then
        local action = data.action
        local reason = data.reason
        
        -- Specific error handler
        if action and errorHandlers[action] then
            pcall(errorHandlers[action], reason, data)
        end
        
        -- Global error handler
        if globalErrorHandler then
            pcall(globalErrorHandler, action, reason, data)
        end
        
        return
    end
    
    -- Handle gateway ready signal
    if channel == "gateway:ready" and typeof(data) == "table" then
        serverReady = true
        serverModules = data.modules or {}
        print("[ClientBridge] Server ready. Version:", data.version or "?", "Modules:", #serverModules)
    end
    
    -- Process normal message
    processMessage(channel, data)
end

-----------------------------------------------
-- STATE QUERIES
-----------------------------------------------

function ClientBridge:IsReady()
    return initialized and serverReady
end

function ClientBridge:GetServerModules()
    return serverModules
end

function ClientBridge:GetVersion()
    return VERSION
end

-----------------------------------------------
-- INIT
-----------------------------------------------

function ClientBridge:Init()
    if initialized then
        warn("[ClientBridge] Already initialized")
        return
    end
    
    -- Wait for remotes with timeout
    gatewayRemote = ReplicatedStorage:WaitForChild("ServerGateway", REMOTE_TIMEOUT)
    dispatchRemote = ReplicatedStorage:WaitForChild("ClientDispatch", REMOTE_TIMEOUT)
    
    if not gatewayRemote then
        warn("[ClientBridge] ServerGateway remote not found after", REMOTE_TIMEOUT, "seconds")
        return
    end
    
    if not dispatchRemote then
        warn("[ClientBridge] ClientDispatch remote not found after", REMOTE_TIMEOUT, "seconds")
        return
    end
    
    -- Connect inbound handler
    dispatchRemote.OnClientEvent:Connect(onClientEvent)
    
    initialized = true
    print("[ClientBridge] Initialized v" .. VERSION)
end

return ClientBridge
