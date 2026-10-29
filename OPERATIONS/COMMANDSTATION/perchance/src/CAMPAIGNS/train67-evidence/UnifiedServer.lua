--[[
===============================================================
SURVIVE A BRAINROT -- PRODUCTION SERVER ARCHITECTURE v2.2.0
Script: UnifiedServer.server.lua
Type: Server Script (ServerScriptService)
Purpose: Single entry point. GOAL: MAKE MONEY.
         Combat is the mechanic. Monetize everything.
         Boot order: UnifiedServer -> ServerGateway -> all server modules
Date: February 2026 | Patched: March 28, 2026
Version: 2.2.0 -- ESL PURGE (combat-only wiring)
Changes v2.2:
  - Replaced EnglishRewardsManager with CombatRewardsManager
  - QuestionBankV2 downgraded from required to optional
  - Added DayScaling + RewardBridge to boot order
  - Replaced ESL quiz remotes with combat action remotes
  - Stripped all English lifecycle hooks
  - Combat-first player lifecycle
  - Sanitized all operators (Studio-safe)
Phoenix Rising Gaming Division
===============================================================
]]

local ServerScriptService = game:GetService("ServerScriptService")
local ServerStorage = game:GetService("ServerStorage")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local MarketplaceService = game:GetService("MarketplaceService")

--------------------------------------------------------------------------------
-- BOOT SEQUENCE (30 server modules, dependency-ordered)
--------------------------------------------------------------------------------

local BOOT_ORDER = {
    -- Phase 1: Core infrastructure (REQUIRED -- boot fails without these)
    { name = "ServerGateway",          path = "ServerGateway",          required = true  },
    { name = "SecurityLayer",          path = "SecurityLayer",          required = true  },
    { name = "DataStoreV2",            path = "DataStoreV2",            required = true  },
    { name = "AnalyticsService",       path = "AnalyticsService",       required = false },

    -- Phase 2: Core gameplay (combat + progression)
    { name = "QuestionBankV2",         path = "QuestionBankV2",         required = false },
    { name = "EloManager",             path = "EloManager",             required = false },
    { name = "EnemyFactory",           path = "EnemyFactory",           required = true  },
    { name = "CombatSystem",           path = "CombatSystem",           required = true  },
    { name = "WaveManager",            path = "WaveManager",            required = true  },
    { name = "DayScaling",             path = "DayScaling",             required = false },

    -- Phase 3: Economy, monetization & rewards
    { name = "EconomyManager",         path = "EconomyManager",         required = false },
    { name = "CombatRewardsManager",   path = "CombatRewardsManager",   required = false },
    { name = "RewardBridge",           path = "RewardBridge",           required = false },
    { name = "ReceiptRouter",          path = "ReceiptRouter",          required = false },
    { name = "MonetizationServer",     path = "MonetizationServer",     required = false },
    { name = "MonetizationOrchestrator", path = "MonetizationOrchestrator", required = false },
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
    { name = "FTUEController",         path = "FTUEController",         required = false },
}

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
-- PLAYER LIFECYCLE (v2.2 -- combat-first, zero ESL)
--------------------------------------------------------------------------------

local function onPlayerAdded(player)
    log("INFO", "Player joined: " .. player.Name)
    if Modules.DataStoreV2 then Modules.DataStoreV2.LoadPlayer(player) end
    if Modules.AnalyticsService then Modules.AnalyticsService.StartSession(player) end
    if Modules.EloManager and type(Modules.EloManager.LoadPlayer) == "function" then pcall(Modules.EloManager.LoadPlayer, player) end
    if Modules.CombatRewardsManager and type(Modules.CombatRewardsManager.OnPlayerJoin) == "function" then pcall(Modules.CombatRewardsManager.OnPlayerJoin, player) end
    if Modules.RewardBridge and type(Modules.RewardBridge.RegisterPlayer) == "function" then pcall(Modules.RewardBridge.RegisterPlayer, player) end
    if Modules.CosmeticController and type(Modules.CosmeticController.LoadPlayer) == "function" then pcall(Modules.CosmeticController.LoadPlayer, player) end
    if Modules.FTUEController then
        local data = Modules.DataStoreV2 and Modules.DataStoreV2.GetPlayerData(player)
        if data and not data.ftueComplete then pcall(Modules.FTUEController.StartFTUE, player) end
    end
    if Modules.DailyRewards then pcall(Modules.DailyRewards.CheckIn, player) end
    if Modules.MonetizationOrchestrator and type(Modules.MonetizationOrchestrator.OnSessionStart) == "function" then pcall(Modules.MonetizationOrchestrator.OnSessionStart, player) end
end

local function onPlayerRemoving(player)
    log("INFO", "Player leaving: " .. player.Name)
    if Modules.AnalyticsService then pcall(Modules.AnalyticsService.EndSession, player) end
    if Modules.EloManager and type(Modules.EloManager.SavePlayer) == "function" then pcall(Modules.EloManager.SavePlayer, player) end
    if Modules.CombatRewardsManager and type(Modules.CombatRewardsManager.OnPlayerLeave) == "function" then pcall(Modules.CombatRewardsManager.OnPlayerLeave, player) end
    if Modules.RewardBridge and type(Modules.RewardBridge.UnregisterPlayer) == "function" then pcall(Modules.RewardBridge.UnregisterPlayer, player) end
    if Modules.CosmeticController and type(Modules.CosmeticController.SavePlayer) == "function" then pcall(Modules.CosmeticController.SavePlayer, player) end
    if Modules.DataStoreV2 then
        local ok, err = pcall(function() Modules.DataStoreV2.SavePlayer(player) end)
        if not ok then warn("[UnifiedServer] CRITICAL: Save failed " .. player.Name .. ": " .. tostring(err)) end
    end
end

--------------------------------------------------------------------------------
-- REMOTE EVENTS (v2.2 -- combat actions, zero ESL quiz flow)
--------------------------------------------------------------------------------

local function setupRemoteEvents()
    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if not remotes then
        remotes = Instance.new("Folder")
        remotes.Name = "Remotes"
        remotes.Parent = ReplicatedStorage
    end

    local events = {
        "MeleeAttack", "RangedShot", "DodgeRoll", "ParryAttempt", "WeaponSwitch",
        "AttackResult", "DamageDealt", "PlayerDied", "PlayerRespawned",
        "WaveUpdate", "EnemySpawned", "EnemyDied", "ComboUpdate", "TierChanged",
        "CurrencyUpdate", "CombatMilestone", "RewardNotification",
        "KillStreakUpdate", "RewardClaimed",
        "CosmeticEquipped", "CosmeticUnlocked", "FusionResult",
        "OfferPresented", "OfferDismissed", "PurchaseComplete",
    }

    for _, eventName in ipairs(events) do
        if not remotes:FindFirstChild(eventName) then
            local re = Instance.new("RemoteEvent")
            re.Name = eventName
            re.Parent = remotes
        end
    end

    -- Wire combat action handlers
    local melee = remotes:FindFirstChild("MeleeAttack")
    if melee and Modules.CombatSystem and Modules.SecurityLayer then
        melee.OnServerEvent:Connect(function(player, data)
            if not Modules.SecurityLayer.CheckRateLimit(player, "MeleeAttack") then return end
            if Modules.CombatSystem.OnMeleeAttack then
                local result = Modules.CombatSystem.OnMeleeAttack(player, data)
                if result then remotes.AttackResult:FireClient(player, result) end
            end
        end)
    end

    local ranged = remotes:FindFirstChild("RangedShot")
    if ranged and Modules.CombatSystem and Modules.SecurityLayer then
        ranged.OnServerEvent:Connect(function(player, data)
            if not Modules.SecurityLayer.CheckRateLimit(player, "RangedShot") then return end
            if Modules.CombatSystem.OnRangedShot then
                local result = Modules.CombatSystem.OnRangedShot(player, data)
                if result then remotes.AttackResult:FireClient(player, result) end
            end
        end)
    end

    local dodge = remotes:FindFirstChild("DodgeRoll")
    if dodge and Modules.CombatSystem and Modules.SecurityLayer then
        dodge.OnServerEvent:Connect(function(player)
            if not Modules.SecurityLayer.CheckRateLimit(player, "DodgeRoll") then return end
            if Modules.CombatSystem.OnDodgeRoll then Modules.CombatSystem.OnDodgeRoll(player) end
        end)
    end

    local parry = remotes:FindFirstChild("ParryAttempt")
    if parry and Modules.CombatSystem and Modules.SecurityLayer then
        parry.OnServerEvent:Connect(function(player, data)
            if not Modules.SecurityLayer.CheckRateLimit(player, "ParryAttempt") then return end
            if Modules.CombatSystem.OnParryAttempt then
                local result = Modules.CombatSystem.OnParryAttempt(player, data)
                if result then remotes.AttackResult:FireClient(player, result) end
            end
        end)
    end

    local weaponSwitch = remotes:FindFirstChild("WeaponSwitch")
    if weaponSwitch and Modules.CombatSystem and Modules.SecurityLayer then
        weaponSwitch.OnServerEvent:Connect(function(player, slotIndex)
            if not Modules.SecurityLayer.CheckRateLimit(player, "WeaponSwitch") then return end
            if Modules.CombatSystem.OnWeaponSwitch then Modules.CombatSystem.OnWeaponSwitch(player, slotIndex) end
        end)
    end

    log("OK", "Remote events: " .. #events .. " configured (combat-only)")
end

--------------------------------------------------------------------------------
-- RECEIPT PROCESSING (v2.0 -- unified through ReceiptRouter)
--------------------------------------------------------------------------------

local function setupReceiptProcessing()
    if Modules.ReceiptRouter and type(Modules.ReceiptRouter.ProcessReceipt) == "function" then
        MarketplaceService.ProcessReceipt = function(receiptInfo)
            return Modules.ReceiptRouter.ProcessReceipt(receiptInfo)
        end
        log("OK", "ProcessReceipt wired through ReceiptRouter")
    elseif Modules.MonetizationServer and type(Modules.MonetizationServer.ProcessReceipt) == "function" then
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
-- SHUTDOWN (v2.2 -- combat rewards, zero ESL)
--------------------------------------------------------------------------------

local function onShutdown()
    log("SHUTDOWN", "Server closing -- flushing all modules...")
    if Modules.ReceiptRouter and type(Modules.ReceiptRouter.Drain) == "function" then pcall(Modules.ReceiptRouter.Drain) end
    for _, player in ipairs(Players:GetPlayers()) do
        if Modules.EloManager and type(Modules.EloManager.SavePlayer) == "function" then pcall(Modules.EloManager.SavePlayer, player) end
        if Modules.CombatRewardsManager and type(Modules.CombatRewardsManager.OnPlayerLeave) == "function" then pcall(Modules.CombatRewardsManager.OnPlayerLeave, player) end
        if Modules.CosmeticController and type(Modules.CosmeticController.SavePlayer) == "function" then pcall(Modules.CosmeticController.SavePlayer, player) end
        if Modules.DataStoreV2 then pcall(function() Modules.DataStoreV2.SavePlayer(player) end) end
    end
    if Modules.AnalyticsService then pcall(Modules.AnalyticsService.Shutdown) end
    if Modules.EconomyManager and type(Modules.EconomyManager.FlushLedger) == "function" then pcall(Modules.EconomyManager.FlushLedger) end
    log("SHUTDOWN", "All modules flushed.")
end

--------------------------------------------------------------------------------
-- MAIN BOOT
--------------------------------------------------------------------------------

log("BOOT", "=== SKIBIDI ZOMBIE: SURVIVE THE BRAINROTS ===")
log("BOOT", "=== GOAL: MAKE MONEY ===")
log("BOOT", "=== UnifiedServer v2.2 -- 30 modules -- COMBAT ONLY ===")
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
log("BOOT", string.format("=== BOOT COMPLETE -- %d/%d modules in %.2fs ===", moduleCount, #BOOT_ORDER, bootTime))

log("BOOT", "Server modules loaded:")
for _, entry in ipairs(BootLog) do
    log("BOOT", string.format("  [OK] %s (%.2fs)", entry.name, entry.time))
end

return Modules
