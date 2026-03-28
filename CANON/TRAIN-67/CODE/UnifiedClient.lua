--[[
    UnifiedClient.lua — Single Entry Point Client Script
    Skibidi Zombie: Survive the Brainrots

    RESOLVES: Fragmented client scripts (5 independent LocalScripts with no
    unified boot, no dependency injection, no lifecycle coordination).
    This is THE one client script.

    GOAL: MAKE MONEY. English is the game mechanic.
    Boot order: UnifiedClient -> ClientBridge -> all client modules

    Architecture: LocalScript (StarterPlayerScripts) — THE entry point
    Version: 1.0.0
    Date: 2026-03-28
    Cross-repo sources:
      - UnifiedServer.lua (d965f1cf) — client module registry, remote events
      - ClientBridge.lua (8fa07a6f) — event bus + gateway pattern
      - HUDController_v2.lua (f2f6bda5) — mobile-first HUD, Init() lifecycle
      - MobileInputController.lua (1b5efced) — 4-mode English input, new(config)
      - CodexClient.lua (8717a013) — vocabulary codex UI, self-init pattern
      - CombatEnglishBridgeSpec.md (e29bbd30) — Answer-to-Attack loop
      - FTUEImplementationSpec.md (18bee6a6) — 60s compressed FTUE flow

    Run 77 | 2026-03-28 09:00 ICT | Active Mission: 100% Roblox
--]]

local Players            = game:GetService("Players")
local ReplicatedStorage  = game:GetService("ReplicatedStorage")
local StarterPlayer      = game:GetService("StarterPlayer")
local UserInputService   = game:GetService("UserInputService")
local RunService         = game:GetService("RunService")
local TweenService       = game:GetService("TweenService")

local player    = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

--------------------------------------------------------------------------------
-- CLIENT BOOT ORDER (dependency-ordered)
-- Mirrors UnifiedServer.lua's boot table pattern.
-- All modules live in ReplicatedStorage/ClientModules or StarterPlayerScripts.
--------------------------------------------------------------------------------

local CLIENT_BOOT_ORDER = {
    -- Phase 1: Communication layer (REQUIRED — nothing works without this)
    { name = "ClientBridge",          path = "ClientBridge",          required = true,  initStyle = "method" },

    -- Phase 2: Core display (HUD is needed before gameplay hooks)
    { name = "HUDController",         path = "HUDController_v2",     required = true,  initStyle = "function" },

    -- Phase 3: Shared data modules (ReplicatedStorage)
    { name = "CodexData",             path = "CodexData",            required = false, initStyle = "none", storage = "replicated" },

    -- Phase 4: Interactive client systems
    { name = "CodexClient",           path = "CodexClient",          required = false, initStyle = "self" },
    { name = "MobileInputController", path = "MobileInputController",required = false, initStyle = "constructor" },

    -- Phase 5: Future client modules (placeholders for Studio wiring)
    -- { name = "ShopUI",             path = "ShopUI",               required = false, initStyle = "function" },
    -- { name = "SettingsUI",         path = "SettingsUI",            required = false, initStyle = "function" },
    -- { name = "SocialUI",           path = "SocialUI",              required = false, initStyle = "function" },
}

--[[
    SERVER MODULE REGISTRY (not booted here — wired in ServerScriptService)
    These modules live on the server and communicate via RemoteEvents:
      - UnifiedServer.lua       — server boot sequence (28 modules)
      - ServerGateway.lua       — client->server action router
      - All 28 server modules   — see UnifiedServer.lua BOOT_ORDER

    CONFIG MODULES (loaded by client modules, not booted independently):
      - CodexData.lua           — shared codex entries (ReplicatedStorage)
      - LedgerSchema.lua        — economy field definitions (ReplicatedStorage)

    REMOTE EVENTS (created by UnifiedServer.lua, consumed here):
      Core: RequestQuestion, SubmitAnswer, ActivatePowerUp, QuestionDelivered,
            AnswerResult, PlayerDied, PlayerRespawned, WaveUpdate, EnemySpawned,
            EnemyDied, ComboUpdate, PowerUpReady, PowerUpActivated, TierChanged
      Economy: CurrencyUpdate, TeachingMilestone
      English: StreakUpdate, RewardClaimed, TierProgression
      Cosmetics: CosmeticEquipped, CosmeticUnlocked, FusionResult
      Input: InputModeChanged, WordSubmitted
      Monetization: OfferPresented, OfferDismissed, PurchaseComplete
]]

--------------------------------------------------------------------------------
-- STATE
--------------------------------------------------------------------------------

local Modules   = {}          -- loaded client modules (name -> module)
local BootLog   = {}          -- boot telemetry
local bootStart = tick()
local isMobile  = UserInputService.TouchEnabled and not UserInputService.KeyboardEnabled

local function log(level, msg)
    local ts = string.format("%.2f", tick() - bootStart)
    print(string.format("[UnifiedClient][%ss][%s] %s", ts, level, msg))
end

--------------------------------------------------------------------------------
-- MODULE LOADER
--------------------------------------------------------------------------------

local function findModule(entry)
    -- Check multiple standard locations (Studio may place them differently)
    local locations = {}

    if entry.storage == "replicated" then
        -- ReplicatedStorage root
        table.insert(locations, ReplicatedStorage)
    else
        -- StarterPlayerScripts children
        local sps = StarterPlayer:FindFirstChild("StarterPlayerScripts")
        if sps then table.insert(locations, sps) end
        -- ReplicatedStorage/ClientModules (organized layout)
        local cm = ReplicatedStorage:FindFirstChild("ClientModules")
        if cm then table.insert(locations, cm) end
        -- ReplicatedStorage root (flat layout)
        table.insert(locations, ReplicatedStorage)
    end

    -- Also check script parent (if modules are siblings in StarterPlayerScripts)
    local scriptParent = script.Parent
    if scriptParent and not table.find(locations, scriptParent) then
        table.insert(locations, 1, scriptParent)
    end

    for _, container in ipairs(locations) do
        local found = container:FindFirstChild(entry.path)
        if found then return found end
    end

    -- Recursive search as last resort
    for _, container in ipairs(locations) do
        local found = container:FindFirstChild(entry.path, true)
        if found then return found end
    end

    return nil
end

local function loadModule(entry)
    local name = entry.name

    -- CodexClient is self-initializing — it's a LocalScript, not a ModuleScript
    -- We skip it in the module loader and let it run on its own
    if entry.initStyle == "self" then
        log("OK", name .. " -- self-initializing (separate LocalScript)")
        table.insert(BootLog, { name = name, status = "SELF", time = tick() - bootStart })
        return true
    end

    local moduleScript = findModule(entry)
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

    -- Initialize based on module pattern
    if entry.initStyle == "method" then
        -- ClientBridge pattern: module:Init()
        if type(result) == "table" and type(result.Init) == "function" then
            local initOk, initErr = pcall(result.Init, result)
            if not initOk then
                if entry.required then
                    log("FATAL", name .. " -- INIT FAILED: " .. tostring(initErr))
                    return false
                else
                    log("WARN", name .. " -- init failed: " .. tostring(initErr))
                end
            end
        end
    elseif entry.initStyle == "function" then
        -- HUDController pattern: module.Init()
        if type(result) == "table" and type(result.Init) == "function" then
            local initOk, initErr = pcall(result.Init)
            if not initOk then
                if entry.required then
                    log("FATAL", name .. " -- INIT FAILED: " .. tostring(initErr))
                    return false
                else
                    log("WARN", name .. " -- init failed: " .. tostring(initErr))
                end
            end
        end
    elseif entry.initStyle == "constructor" then
        -- MobileInputController pattern: module.new(config)
        -- Deferred — constructed after all modules are loaded (needs DI)
        log("INFO", name .. " -- loaded (constructor deferred)")
        table.insert(BootLog, { name = name, status = "DEFERRED", time = tick() - bootStart })
        return true
    elseif entry.initStyle == "none" then
        -- Data modules: no init needed
        log("OK", name .. " -- loaded (data module)")
    end

    log("OK", name .. " -- loaded")
    table.insert(BootLog, { name = name, status = "OK", time = tick() - bootStart })
    return true
end

--------------------------------------------------------------------------------
-- DEPENDENCY INJECTION (post-boot wiring)
-- MobileInputController.new(config) needs references to other loaded modules.
-- This runs after all modules are loaded.
--------------------------------------------------------------------------------

local function wireConstructorModules()
    -- MobileInputController: inject loaded modules
    local MIC = Modules.MobileInputController
    if MIC and type(MIC.new) == "function" then
        local config = {
            -- Client-side module references (some are server-only and nil here)
            questionBank   = nil,  -- Questions come from server via RemoteEvents
            eloManager     = nil,  -- Elo is server-authoritative
            rewardsManager = nil,  -- Rewards are server-authoritative
            analytics      = nil,  -- Analytics is server-side (AnalyticsService)
            combatSystem   = nil,  -- Combat is server-authoritative
            hudController  = Modules.HUDController or nil,
        }

        local ok, instance = pcall(MIC.new, config)
        if ok and instance then
            Modules.MobileInputInstance = instance
            log("OK", "MobileInputController -- constructed with DI")
        else
            log("WARN", "MobileInputController -- construction failed: " .. tostring(instance))
        end
    end
end

--------------------------------------------------------------------------------
-- CLIENT BRIDGE WIRING
-- After ClientBridge is initialized, wire all client modules to server events.
-- This is the client-side equivalent of UnifiedServer's setupRemoteEvents().
--------------------------------------------------------------------------------

local function wireClientBridge()
    local bridge = Modules.ClientBridge
    if not bridge then
        log("WARN", "ClientBridge not available -- using direct remote connections")
        return
    end

    -- Wire HUD updates through ClientBridge channels
    if bridge.On then
        -- Question delivery (server -> client)
        bridge:On("question:serve", function(data)
            if Modules.HUDController then
                Modules.HUDController.ShowQuestion(data)
            end
            if Modules.MobileInputInstance then
                Modules.MobileInputInstance:showQuestion(data)
            end
        end)

        -- Answer result (server -> client)
        bridge:On("answer:result", function(data)
            if Modules.HUDController then
                Modules.HUDController.ShowAnswerResult(data.selectedIndex, data.isCorrect)
            end
        end)

        -- Currency update (server -> client)
        bridge:On("economy:update", function(data)
            if Modules.HUDController then
                Modules.HUDController.UpdateCoins(data.coins or 0, data.gems or 0)
            end
        end)

        -- Combo update (server -> client)
        bridge:On("combat:combo", function(data)
            if Modules.HUDController then
                Modules.HUDController.UpdateCombo(data.streak or 0)
            end
        end)

        -- Wave update (server -> client)
        bridge:On("wave:update", function(data)
            if Modules.HUDController then
                Modules.HUDController.UpdateWave(data)
            end
        end)

        -- Reward notification (server -> client)
        bridge:On("reward:popup", function(data)
            if Modules.HUDController then
                Modules.HUDController.ShowRewardPopup(data.text or "+reward")
            end
        end)

        -- English rewards events (streak, tier progression)
        bridge:On("english:streak", function(data)
            if Modules.HUDController then
                Modules.HUDController.ShowRewardPopup("🔥 " .. (data.days or 0) .. "-day streak!")
            end
        end)

        bridge:On("english:tier", function(data)
            if Modules.HUDController then
                Modules.HUDController.ShowRewardPopup("⬆️ " .. (data.tier or "?") .. " tier!")
            end
        end)

        -- Monetization offers (server -> client)
        bridge:On("monetization:offer", function(data)
            -- Future: ShopUI.ShowOffer(data)
            log("INFO", "Offer received: " .. tostring(data.offerType))
        end)

        -- Cosmetic events
        bridge:On("cosmetic:equip", function(data)
            -- Future: CosmeticUI.OnEquip(data)
            log("INFO", "Cosmetic equipped: " .. tostring(data.itemId))
        end)

        -- Gateway ready signal
        bridge:On("gateway:ready", function(data)
            log("OK", "Server gateway ready — " .. tostring(data.version))
        end)

        log("OK", "ClientBridge channels wired (" .. 10 .. " handlers)")
    end
end

--------------------------------------------------------------------------------
-- DIRECT REMOTE EVENT FALLBACK
-- If ClientBridge is not available (or for events that bypass the bridge),
-- wire directly to RemoteEvents created by UnifiedServer.lua.
--------------------------------------------------------------------------------

local function wireDirectRemotes()
    local remotes = ReplicatedStorage:WaitForChild("Remotes", 15)
    if not remotes then
        log("WARN", "Remotes folder not found -- server may not be ready")
        return
    end

    local function safeConnect(eventName, callback)
        local ev = remotes:FindFirstChild(eventName)
        if ev and ev:IsA("RemoteEvent") then
            ev.OnClientEvent:Connect(function(...)
                local ok, err = pcall(callback, ...)
                if not ok then
                    warn("[UnifiedClient] Remote handler error on " .. eventName .. ": " .. tostring(err))
                end
            end)
            return true
        end
        return false
    end

    local connected = 0

    -- Core gameplay
    if safeConnect("QuestionDelivered", function(data)
        if Modules.HUDController then
            Modules.HUDController.ShowQuestion(data)
        end
    end) then connected = connected + 1 end

    if safeConnect("AnswerResult", function(data)
        if Modules.HUDController then
            Modules.HUDController.ShowAnswerResult(data.selectedIndex, data.isCorrect)
        end
        if data.correct and data.combo and data.combo >= 3 then
            if Modules.HUDController then
                Modules.HUDController.UpdateCombo(data.combo)
            end
        end
    end) then connected = connected + 1 end

    if safeConnect("ComboUpdate", function(data)
        if Modules.HUDController then
            Modules.HUDController.UpdateCombo(data.combo or data.streak or 0)
        end
    end) then connected = connected + 1 end

    if safeConnect("WaveUpdate", function(data)
        if Modules.HUDController then
            Modules.HUDController.UpdateWave(data)
        end
    end) then connected = connected + 1 end

    if safeConnect("CurrencyUpdate", function(data)
        if Modules.HUDController then
            local coins = data.total or data.coins or 0
            Modules.HUDController.UpdateCoins(coins, data.gems or 0)
        end
    end) then connected = connected + 1 end

    if safeConnect("PowerUpReady", function(data)
        if Modules.HUDController then
            Modules.HUDController.UpdatePowerUp(data.charge or 0, data.maxCharge or 100)
        end
    end) then connected = connected + 1 end

    if safeConnect("PowerUpActivated", function(data)
        if Modules.HUDController then
            Modules.HUDController.ShowRewardPopup("⚡ ENGLISH POWER ACTIVATED!")
        end
    end) then connected = connected + 1 end

    if safeConnect("TierChanged", function(data)
        if Modules.HUDController then
            Modules.HUDController.ShowRewardPopup("🐅 " .. (data.tier or "?"))
        end
    end) then connected = connected + 1 end

    -- English rewards
    if safeConnect("StreakUpdate", function(data)
        if Modules.HUDController then
            Modules.HUDController.ShowRewardPopup("🔥 " .. (data.days or 0) .. "-day streak!")
        end
    end) then connected = connected + 1 end

    if safeConnect("RewardClaimed", function(data)
        if Modules.HUDController then
            Modules.HUDController.ShowRewardPopup("🎁 +" .. (data.amount or 0) .. " " .. (data.currency or "coins"))
        end
    end) then connected = connected + 1 end

    if safeConnect("TierProgression", function(data)
        if Modules.HUDController then
            Modules.HUDController.ShowRewardPopup("⬆️ " .. (data.newTier or "?") .. " tier!")
        end
    end) then connected = connected + 1 end

    -- Cosmetics
    if safeConnect("CosmeticEquipped", function(data)
        log("INFO", "Cosmetic equipped: " .. tostring(data.itemId or data.name))
    end) then connected = connected + 1 end

    if safeConnect("CosmeticUnlocked", function(data)
        if Modules.HUDController then
            Modules.HUDController.ShowRewardPopup("🎉 Unlocked: " .. (data.name or "item"))
        end
    end) then connected = connected + 1 end

    -- Monetization
    if safeConnect("OfferPresented", function(data)
        log("INFO", "Offer presented: " .. tostring(data.offerType))
    end) then connected = connected + 1 end

    if safeConnect("PurchaseComplete", function(data)
        if Modules.HUDController then
            Modules.HUDController.ShowRewardPopup("✅ Purchase complete!")
        end
    end) then connected = connected + 1 end

    -- Player lifecycle
    if safeConnect("PlayerDied", function(data)
        log("INFO", "Player died")
    end) then connected = connected + 1 end

    if safeConnect("PlayerRespawned", function(data)
        log("INFO", "Player respawned")
    end) then connected = connected + 1 end

    if safeConnect("EnemySpawned", function(data)
        -- Future: enemy indicator on HUD
    end) then connected = connected + 1 end

    if safeConnect("EnemyDied", function(data)
        -- Future: kill feed UI
    end) then connected = connected + 1 end

    log("OK", "Direct remotes: " .. connected .. " connected")
end

--------------------------------------------------------------------------------
-- MOBILE INPUT TRIGGER WIRING
-- Connect MobileInputController trigger points to combat/FTUE events.
--------------------------------------------------------------------------------

local function wireMobileInputTriggers()
    local mic = Modules.MobileInputInstance
    if not mic then return end

    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if not remotes then return end

    local function safeConnect(eventName, callback)
        local ev = remotes:FindFirstChild(eventName)
        if ev and ev:IsA("RemoteEvent") then
            ev.OnClientEvent:Connect(function(...)
                pcall(callback, ...)
            end)
        end
    end

    -- Wire kill streak trigger -> English question
    local killCount = 0
    safeConnect("EnemyDied", function(data)
        if data and data.killer == player.Name then
            killCount = killCount + 1
            mic:onKillStreak(killCount)
        end
    end)

    -- Wire player death -> reset kill streak
    safeConnect("PlayerDied", function()
        killCount = 0
    end)

    -- Wire power-up ready -> English question opportunity
    safeConnect("PowerUpReady", function(data)
        if not mic:isActive() then
            mic:showQuestion({ trigger = "power_up_ready" })
        end
    end)

    log("OK", "MobileInput trigger points wired")
end

--------------------------------------------------------------------------------
-- KEYBOARD SHORTCUTS (client-side global keybinds)
--------------------------------------------------------------------------------

local function setupKeybinds()
    UserInputService.InputBegan:Connect(function(input, processed)
        if processed then return end

        -- Tab: Toggle Codex (handled by CodexClient directly)
        -- We don't duplicate it here since CodexClient is self-initializing

        -- F: Full screen (toggle)
        -- (Roblox handles this natively)

        -- P: Toggle power-up (if ready)
        if input.KeyCode == Enum.KeyCode.P then
            local remotes = ReplicatedStorage:FindFirstChild("Remotes")
            if remotes then
                local ev = remotes:FindFirstChild("ActivatePowerUp")
                if ev then ev:FireServer() end
            end
        end
    end)

    log("OK", "Keybinds configured")
end

--------------------------------------------------------------------------------
-- CLIENT HEARTBEAT (lightweight client-side tick)
--------------------------------------------------------------------------------

local CLIENT_TICK_INTERVAL = 1.0  -- 1 second (client doesn't need high frequency)
local lastClientTick = 0

local function onClientHeartbeat(dt)
    local now = tick()
    if now - lastClientTick < CLIENT_TICK_INTERVAL then return end
    lastClientTick = now

    -- Check MobileInputController state for auto-trigger logic
    -- (Future: FTUE timer, idle detection, engagement tracking)
end

--------------------------------------------------------------------------------
-- MAIN BOOT
--------------------------------------------------------------------------------

log("BOOT", "=== SKIBIDI ZOMBIE: SURVIVE THE BRAINROTS ===")
log("BOOT", "=== GOAL: MAKE MONEY ===")
log("BOOT", "=== UnifiedClient v1.0 — client boot sequence ===")
log("BOOT", "Platform: " .. (isMobile and "MOBILE" or "DESKTOP"))
log("BOOT", "Starting boot sequence...")

local bootFailed = false
for i, entry in ipairs(CLIENT_BOOT_ORDER) do
    log("BOOT", string.format("[%d/%d] %s...", i, #CLIENT_BOOT_ORDER, entry.name))
    if not loadModule(entry) then
        bootFailed = true
        log("FATAL", "Boot aborted at " .. entry.name)
        break
    end
end

if bootFailed then
    log("FATAL", "=== CLIENT BOOT FAILED ===")
    return
end

-- Phase 6: Post-boot wiring (dependency injection + event connections)
log("BOOT", "Post-boot wiring...")
wireConstructorModules()
wireClientBridge()
wireDirectRemotes()
wireMobileInputTriggers()
setupKeybinds()

-- Connect heartbeat
RunService.Heartbeat:Connect(onClientHeartbeat)

-- Boot summary
local bootTime = tick() - bootStart
local moduleCount = 0
for _ in pairs(Modules) do moduleCount = moduleCount + 1 end

log("BOOT", string.format("=== BOOT COMPLETE — %d modules in %.2fs ===", moduleCount, bootTime))
log("BOOT", "Client modules loaded:")
for _, entry in ipairs(BootLog) do
    log("BOOT", string.format("  [%s] %s (%.2fs)", entry.status, entry.name, entry.time))
end

-- Announce readiness to server
local bridge = Modules.ClientBridge
if bridge and type(bridge.Send) == "function" then
    bridge:Send("client:ready", {
        version = "1.0.0",
        platform = isMobile and "MOBILE" or "DESKTOP",
        moduleCount = moduleCount,
        bootTime = bootTime,
    })
end

log("BOOT", "=== ENGLISH IS THE MECHANIC. MONEY IS THE MISSION. ===")

return Modules
