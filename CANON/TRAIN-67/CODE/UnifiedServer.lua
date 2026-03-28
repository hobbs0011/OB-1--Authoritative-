--[[
    UnifiedServer.lua — Single Entry Point Server Script
    Skibidi Zombie: Survive the Brainrots

    RESOLVES: The Two-Server Problem (GameMain + MainServer_v2 collision)
    This is THE one server script.

    GOAL: MAKE MONEY. Combat is the game mechanic.
    Boot order: UnifiedServer -> ServerGateway -> all server modules

    Architecture: Script (ServerScriptService) — THE entry point
    Version: 3.0.0
    Date: 2026-03-28
    Changes v3.0 (Combat Replacement):
      - Replaced QuestionBankV2 -> WeaponData + EnemyData + DayScaling
      - Replaced EnglishRewardsManager -> CombatRewardsManager
      - Wired CombatRewardsManager into player lifecycle hooks
      - Removed all ESL/English quiz remote event handlers
      - CombatSystem v2.0 now uses EventBus + ClientDispatch (2 RemoteEvents)
      - Boot order updated: 30 modules total
--]]

local ServerScriptService = game:GetService("ServerScriptService")
local ServerStorage = game:GetService("ServerStorage")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local MarketplaceService = game:GetService("MarketplaceService")

--------------------------------------------------------------------------------
-- BOOT SEQUENCE (28 server modules, dependency-ordered)
--------------------------------------------------------------------------------

local BOOT_ORDER = {
    -- Phase 1: Core infrastructure (REQUIRED — boot fails without these)
    { name = "ServerGateway",          path = "ServerGateway",          required = true  },
    { name = "SecurityLayer",          path = "SecurityLayer",          required = true  },
    { name = "DataStoreV2",            path = "DataStoreV2",            required = true  },
    { name = "AnalyticsService",       path = "AnalyticsService",       required = false },

    -- Phase 2: Core gameplay (combat + weapons + enemies + progression)
    { name = "WeaponData",             path = "WeaponData",             required = true  },
    { name = "EnemyData",              path = "EnemyData",              required = true  },
    { name = "DayScaling",             path = "DayScaling",             required = true  },
    { name = "EloManager",             path = "EloManager",             required = false },
    { name = "EnemyFactory",           path = "EnemyFactory",           required = true  },
    { name = "CombatSystem",           path = "CombatSystem",           required = true  },
    { name = "WaveManager",            path = "WaveManager",            required = true  },

    -- Phase 3: Economy, monetization & rewards
    { name = "EconomyManager",         path = "EconomyManager",         required = false },
    { name = "ReceiptRouter",          path = "ReceiptRouter",          required = false },
    { name = "MonetizationServer",     path = "MonetizationServer",     required = false },
    { name = "MonetizationOrchestrator", path = "MonetizationOrchestrator", required = false },
    { name = "CombatRewardsManager",   path = "CombatRewardsManager",   required = false },
    { name = "DailyRewards",           path = "DailyRewards",           required = false },
    { name = "BattlePass",             path = "BattlePass",             required = false },
    { name = "GachaManager",           path = "GachaManager",           required = false },

    -- Phase 4: Social, cosmetics & meta
    { name = "LeaderboardManager",     path = "LeaderboardManager",     required = false },
    { name = "GuildManager",           path = "GuildManager",           required = false },
    { name = "ReferralSystem",         path = "ReferralSystem",         required = false },
    { name = "TradeManager",           path = "TradeManager",           required = false },
    { name = "ChallengeManager",       path = "ChallengeManager",       required = false },
    { name = "CosmeticController",     path = "CosmeticController",     required = false },

    -- Phase 5: Advanced systems
    { name = "PrestigeManager",        path = "PrestigeManager",        required = false },
    { name = "WorldBoss",              path = "WorldBoss",              required = false },
    { name = "AnomalyDetector",        path = "AnomalyDetector",        required = false },
    { name = "FTUEManager",            path = "FTUEManager",            required = false },
    { name = "FTUEController",         path = "FTUEController",         required = false },
}

--[[
    CLIENT MODULE REGISTRY (not booted here — wired in StarterPlayerScripts)
    These modules live in ReplicatedStorage or StarterPlayerScripts:
      - ClientBridge.lua          — client->server event dispatcher (EventBus)
      - HUDController_v2.lua      — heads-up display (health, combo, wave, ammo)
      - MobileInputController.lua — 4 action buttons: Attack, Dodge, Ability, Interact

    CONFIG MODULES (loaded by other modules, not booted independently):
      - DevProductsConfig.lua   — developer product ID registry
      - GamePassConfig.lua      — game pass ID registry
      - LedgerSchema.lua        — economy ledger field definitions
      - WeaponData.lua          — weapon stats (also used by GachaManager, HUD)
      - EnemyData.lua           — enemy types and scaling
      - DayScaling.lua          — 99-day difficulty curve
]]

local Modules = {}
local BootLog = {}
local bootStart = tick()

local function log(level, msg)
    local ts = string.format("%.2f", tick() - bootStart)
    print(string.format("[UnifiedServer][%ss][%s] %s", ts, level, msg))
end

local function loadModule(entry)
    local name = entry.name
    local moduleScript = ServerStorage:FindFirstChild(entry.path)
        or ServerScriptService:FindFirstChild(entry.path)
        or ServerStorage:FindFirstChild(entry.path, true)

    if not moduleScript then
        if entry.required then
            log("FATAL", name .. " -- MODULE NOT FOUND (REQUIRED)")
            return false
        else
            log("WARN", name .. " -- not found (optional, skipping)")
            return true
        end
    end

    local ok, result = pcall(require, moduleScript)
    if not ok then
        if entry.required then
            log("FATAL", name .. " -- REQUIRE FAILED: " .. tostring(result))
            return false
        else
            log("WARN", name .. " -- require failed: " .. tostring(result))
            return true
        end
    end

    Modules[name] = result

    if type(result) == "table" and type(result.Init) == "function" then
        local initOk, initErr = pcall(result.Init)
        if not initOk then
            if entry.required then
                log("FATAL", name .. " -- INIT FAILED: " .. tostring(initErr))
                return false
            else
                log("WARN", name .. " -- init failed: " .. tostring(initErr))
                return true
            end
        end
    end

    log("OK", name .. " -- loaded")
    table.insert(BootLog, { name = name, status = "OK", time = tick() - bootStart })
    return true
end

--------------------------------------------------------------------------------
-- PLAYER LIFECYCLE (enhanced v2.0)
--------------------------------------------------------------------------------

local function onPlayerAdded(player)
    log("INFO", "Player joined: " .. player.Name)

    -- Core data load
    if Modules.DataStoreV2 then
        Modules.DataStoreV2.LoadPlayer(player)
    end

    -- Analytics session
    if Modules.AnalyticsService then
        Modules.AnalyticsService.StartSession(player)
    end

    -- Elo initialization (load or create rating)
    if Modules.EloManager and type(Modules.EloManager.LoadPlayer) == "function" then
        pcall(Modules.EloManager.LoadPlayer, player)
    end

    -- Combat rewards session init
    if Modules.CombatRewardsManager and type(Modules.CombatRewardsManager.OnPlayerJoin) == "function" then
        pcall(Modules.CombatRewardsManager.OnPlayerJoin, player)
    end

    -- Cosmetic load (pets, auras, skins)
    if Modules.CosmeticController and type(Modules.CosmeticController.LoadPlayer) == "function" then
        pcall(Modules.CosmeticController.LoadPlayer, player)
    end

    -- FTUE check
    if Modules.FTUEManager then
        local data = Modules.DataStoreV2 and Modules.DataStoreV2.GetPlayerData(player)
        if data and not data.ftueComplete then
            Modules.FTUEManager.StartFTUE(player)
        end
    end

    -- Daily rewards check-in
    if Modules.DailyRewards then
        Modules.DailyRewards.CheckIn(player)
    end

    -- Monetization: contextual trigger for session start
    if Modules.MonetizationOrchestrator and type(Modules.MonetizationOrchestrator.OnSessionStart) == "function" then
        pcall(Modules.MonetizationOrchestrator.OnSessionStart, player)
    end
end

local function onPlayerRemoving(player)
    log("INFO", "Player leaving: " .. player.Name)

    -- Analytics session end
    if Modules.AnalyticsService then
        Modules.AnalyticsService.EndSession(player)
    end

    -- Elo save
    if Modules.EloManager and type(Modules.EloManager.SavePlayer) == "function" then
        pcall(Modules.EloManager.SavePlayer, player)
    end

    -- Combat rewards save
    if Modules.CombatRewardsManager and type(Modules.CombatRewardsManager.OnPlayerLeave) == "function" then
        pcall(Modules.CombatRewardsManager.OnPlayerLeave, player)
    end

    -- Cosmetic save
    if Modules.CosmeticController and type(Modules.CosmeticController.SavePlayer) == "function" then
        pcall(Modules.CosmeticController.SavePlayer, player)
    end

    -- Core data save (last — captures all module state)
    if Modules.DataStoreV2 then
        local ok, err = pcall(function() Modules.DataStoreV2.SavePlayer(player) end)
        if not ok then
            warn("[UnifiedServer] CRITICAL: Save failed " .. player.Name .. ": " .. tostring(err))
        end
    end
end

--------------------------------------------------------------------------------
-- REMOTE EVENTS
--------------------------------------------------------------------------------

local function setupRemoteEvents()
    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if not remotes then
        remotes = Instance.new("Folder")
        remotes.Name = "Remotes"
        remotes.Parent = ReplicatedStorage
    end

    -- Core 2-remote combat bus (EventBus + ClientDispatch created by CombatSystem.Init)
    -- Additional named remotes for non-combat systems:
    local events = {
        -- Player lifecycle
        "PlayerDied", "PlayerRespawned",
        -- Wave / world
        "WaveUpdate", "EnemySpawned", "EnemyDied",
        -- Economy
        "CurrencyUpdate",
        -- Cosmetics
        "CosmeticEquipped", "CosmeticUnlocked", "FusionResult",
        -- Monetization
        "OfferPresented", "OfferDismissed", "PurchaseComplete",
    }

    for _, eventName in ipairs(events) do
        if not remotes:FindFirstChild(eventName) then
            local re = Instance.new("RemoteEvent")
            re.Name = eventName
            re.Parent = remotes
        end
    end

    -- CombatSystem v2.0 manages its own EventBus + ClientDispatch remotes.
    -- No additional wiring needed here for combat actions.

    log("OK", "Remote events: " .. #events .. " configured (combat handled by CombatSystem)")
end

--------------------------------------------------------------------------------
-- RECEIPT PROCESSING (v2.0 — unified through ReceiptRouter)
--------------------------------------------------------------------------------

local function setupReceiptProcessing()
    if Modules.ReceiptRouter and type(Modules.ReceiptRouter.ProcessReceipt) == "function" then
        MarketplaceService.ProcessReceipt = function(receiptInfo)
            return Modules.ReceiptRouter.ProcessReceipt(receiptInfo)
        end
        log("OK", "ProcessReceipt wired through ReceiptRouter")
    elseif Modules.MonetizationServer and type(Modules.MonetizationServer.ProcessReceipt) == "function" then
        -- Fallback to legacy monetization server
        MarketplaceService.ProcessReceipt = function(receiptInfo)
            return Modules.MonetizationServer.ProcessReceipt(receiptInfo)
        end
        log("OK", "ProcessReceipt wired through MonetizationServer (legacy fallback)")
    else
        log("WARN", "No ProcessReceipt handler available -- purchases will fail")
    end
end

--------------------------------------------------------------------------------
-- HEARTBEAT
--------------------------------------------------------------------------------

local TICK_INTERVAL = 0.5
local lastTick = 0

local function onHeartbeat(dt)
    local now = tick()
    if now - lastTick < TICK_INTERVAL then return end
    lastTick = now
    if Modules.WaveManager then Modules.WaveManager.Tick(dt) end
    if Modules.EnemyFactory then Modules.EnemyFactory.Tick(dt) end
    if Modules.AnomalyDetector then Modules.AnomalyDetector.Tick(dt) end
end

--------------------------------------------------------------------------------
-- SHUTDOWN (enhanced v2.0 — flush all stateful modules)
--------------------------------------------------------------------------------

local function onShutdown()
    log("SHUTDOWN", "Server closing -- flushing all modules...")

    -- Flush receipt queue first (money > everything)
    if Modules.ReceiptRouter and type(Modules.ReceiptRouter.Drain) == "function" then
        pcall(Modules.ReceiptRouter.Drain)
    end

    -- Save all player data
    for _, player in ipairs(Players:GetPlayers()) do
        if Modules.EloManager and type(Modules.EloManager.SavePlayer) == "function" then
            pcall(Modules.EloManager.SavePlayer, player)
        end
        if Modules.CombatRewardsManager and type(Modules.CombatRewardsManager.OnPlayerLeave) == "function" then
            pcall(Modules.CombatRewardsManager.OnPlayerLeave, player)
        end
        if Modules.CosmeticController and type(Modules.CosmeticController.SavePlayer) == "function" then
            pcall(Modules.CosmeticController.SavePlayer, player)
        end
        if Modules.DataStoreV2 then
            pcall(function() Modules.DataStoreV2.SavePlayer(player) end)
        end
    end

    -- Flush analytics buffer
    if Modules.AnalyticsService then
        pcall(Modules.AnalyticsService.Shutdown)
    end

    -- Flush economy ledger
    if Modules.EconomyManager and type(Modules.EconomyManager.FlushLedger) == "function" then
        pcall(Modules.EconomyManager.FlushLedger)
    end

    log("SHUTDOWN", "All modules flushed.")
end

--------------------------------------------------------------------------------
-- MAIN BOOT
--------------------------------------------------------------------------------

log("BOOT", "=== SKIBIDI ZOMBIE: SURVIVE THE BRAINROTS ===")
log("BOOT", "=== GOAL: MAKE MONEY ===")
log("BOOT", "=== UnifiedServer v3.0 — Combat Replacement — 30 modules ===")
log("BOOT", "Starting boot sequence...")

local bootFailed = false
for i, entry in ipairs(BOOT_ORDER) do
    log("BOOT", string.format("[%d/%d] %s...", i, #BOOT_ORDER, entry.name))
    if not loadModule(entry) then
        bootFailed = true
        log("FATAL", "Boot aborted at " .. entry.name)
        break
    end
end

if bootFailed then
    log("FATAL", "=== SERVER BOOT FAILED ===")
    return
end

setupRemoteEvents()
setupReceiptProcessing()

Players.PlayerAdded:Connect(onPlayerAdded)
Players.PlayerRemoving:Connect(onPlayerRemoving)
for _, player in ipairs(Players:GetPlayers()) do
    task.spawn(onPlayerAdded, player)
end
RunService.Heartbeat:Connect(onHeartbeat)

game:BindToClose(onShutdown)

local bootTime = tick() - bootStart
local moduleCount = 0
for _ in pairs(Modules) do moduleCount = moduleCount + 1 end
log("BOOT", string.format("=== BOOT COMPLETE — %d/%d modules in %.2fs ===", moduleCount, #BOOT_ORDER, bootTime))

-- Boot summary
log("BOOT", "Server modules loaded:")
for _, entry in ipairs(BootLog) do
    log("BOOT", string.format("  [OK] %s (%.2fs)", entry.name, entry.time))
end

return Modules
