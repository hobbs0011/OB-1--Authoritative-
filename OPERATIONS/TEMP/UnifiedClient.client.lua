--[[
===============================================================
SURVIVE A BRAINROT -- PRODUCTION CLIENT ARCHITECTURE v2.2.0
Script: UnifiedClient.client.lua
Type: Local Script (StarterPlayerScripts)
Purpose: Client boot + event bridge. Combat-only UI wiring.
         Zero ESL. Zero English. Pure survival combat.
Date: February 2026 | Patched: March 28, 2026
Version: 2.2.0 -- ESL PURGE (combat-only client)
Phoenix Rising Gaming Division
===============================================================
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local StarterPlayer = game:GetService("StarterPlayer")
local UserInputService = game:GetService("UserInputService")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")

local LocalPlayer = Players.LocalPlayer
local PlayerGui = LocalPlayer:WaitForChild("PlayerGui")

--------------------------------------------------------------------------------
-- CLIENT MODULE REGISTRY
--------------------------------------------------------------------------------

local CLIENT_MODULES = {
    { name = "ClientBridge",         path = "ClientBridge",         required = true  },
    { name = "HUDController",        path = "HUDController_v2",     required = true  },
    { name = "MobileInputController", path = "MobileInputController", required = false },
    { name = "CosmeticRenderer",     path = "CosmeticRenderer",     required = false },
    { name = "SoundManager",         path = "SoundManager",         required = false },
    { name = "FTUEClient",           path = "FTUEClient",           required = false },
}

local Modules = {}
local bootStart = tick()

local function log(level, msg)
    local ts = string.format("%.2f", tick() - bootStart)
    print(string.format("[UnifiedClient][%ss][%s] %s", ts, level, msg))
end

local function loadClientModule(entry)
    local name = entry.name
    local moduleScript = ReplicatedStorage:FindFirstChild(entry.path)
        or StarterPlayer:FindFirstChild("StarterPlayerScripts") and StarterPlayer.StarterPlayerScripts:FindFirstChild(entry.path)
        or ReplicatedStorage:FindFirstChild(entry.path, true)

    if not moduleScript then
        if entry.required then
            log("FATAL", name .. " -- NOT FOUND (REQUIRED)")
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
    log("OK", name .. " -- loaded")
    return true
end

--------------------------------------------------------------------------------
-- REMOTE EVENTS BRIDGE (v2.2 -- combat only, zero ESL)
--------------------------------------------------------------------------------

local function wireRemoteEvents()
    local remotes = ReplicatedStorage:WaitForChild("Remotes", 10)
    if not remotes then
        log("FATAL", "Remotes folder not found")
        return false
    end

    -- COMBAT FEEDBACK (server -> client)
    local attackResult = remotes:FindFirstChild("AttackResult")
    if attackResult then
        attackResult.OnClientEvent:Connect(function(result)
            if Modules.HUDController then
                if result.hit then Modules.HUDController.ShowDamageNumber(result.damage, result.position, result.isCritical) end
                if result.killType then Modules.HUDController.ShowKillFeed(result.killType, result.enemyName) end
            end
            if Modules.SoundManager then
                if result.hit then Modules.SoundManager.Play(result.isCritical and "CriticalHit" or "Hit") end
            end
        end)
    end

    local comboUpdate = remotes:FindFirstChild("ComboUpdate")
    if comboUpdate then
        comboUpdate.OnClientEvent:Connect(function(comboData)
            if Modules.HUDController then Modules.HUDController.UpdateCombo(comboData.count, comboData.multiplier, comboData.timeLeft) end
        end)
    end

    local waveUpdate = remotes:FindFirstChild("WaveUpdate")
    if waveUpdate then
        waveUpdate.OnClientEvent:Connect(function(waveData)
            if Modules.HUDController then Modules.HUDController.UpdateWave(waveData.day, waveData.wave, waveData.enemiesLeft, waveData.totalEnemies) end
        end)
    end

    local tierChanged = remotes:FindFirstChild("TierChanged")
    if tierChanged then
        tierChanged.OnClientEvent:Connect(function(tierData)
            if Modules.HUDController then Modules.HUDController.ShowTierUp(tierData.newTier, tierData.reward) end
        end)
    end

    local playerDied = remotes:FindFirstChild("PlayerDied")
    if playerDied then
        playerDied.OnClientEvent:Connect(function(deathData)
            if Modules.HUDController then Modules.HUDController.ShowDeathScreen(deathData) end
        end)
    end

    local playerRespawned = remotes:FindFirstChild("PlayerRespawned")
    if playerRespawned then
        playerRespawned.OnClientEvent:Connect(function()
            if Modules.HUDController then Modules.HUDController.HideDeathScreen() end
        end)
    end

    -- ECONOMY FEEDBACK (server -> client)
    local currencyUpdate = remotes:FindFirstChild("CurrencyUpdate")
    if currencyUpdate then
        currencyUpdate.OnClientEvent:Connect(function(data)
            if Modules.HUDController then Modules.HUDController.UpdateCurrency(data.currency, data.amount, data.delta) end
        end)
    end

    local combatMilestone = remotes:FindFirstChild("CombatMilestone")
    if combatMilestone then
        combatMilestone.OnClientEvent:Connect(function(data)
            if Modules.HUDController then Modules.HUDController.ShowMilestone(data.name, data.description, data.reward) end
        end)
    end

    local rewardNotification = remotes:FindFirstChild("RewardNotification")
    if rewardNotification then
        rewardNotification.OnClientEvent:Connect(function(data)
            if Modules.HUDController then Modules.HUDController.ShowRewardPopup(data.coins, data.gems, data.source) end
        end)
    end

    local killStreakUpdate = remotes:FindFirstChild("KillStreakUpdate")
    if killStreakUpdate then
        killStreakUpdate.OnClientEvent:Connect(function(data)
            if Modules.HUDController then Modules.HUDController.ShowKillStreak(data.count, data.title) end
        end)
    end

    -- COSMETIC FEEDBACK (server -> client)
    local cosmeticEquipped = remotes:FindFirstChild("CosmeticEquipped")
    if cosmeticEquipped then
        cosmeticEquipped.OnClientEvent:Connect(function(data)
            if Modules.CosmeticRenderer then Modules.CosmeticRenderer.OnEquipped(data) end
        end)
    end

    local cosmeticUnlocked = remotes:FindFirstChild("CosmeticUnlocked")
    if cosmeticUnlocked then
        cosmeticUnlocked.OnClientEvent:Connect(function(data)
            if Modules.HUDController then Modules.HUDController.ShowUnlock(data.name, data.rarity, data.icon) end
        end)
    end

    local fusionResult = remotes:FindFirstChild("FusionResult")
    if fusionResult then
        fusionResult.OnClientEvent:Connect(function(data)
            if Modules.HUDController then Modules.HUDController.ShowFusionResult(data) end
        end)
    end

    -- MONETIZATION FEEDBACK (server -> client)
    local offerPresented = remotes:FindFirstChild("OfferPresented")
    if offerPresented then
        offerPresented.OnClientEvent:Connect(function(offerData)
            if Modules.HUDController then Modules.HUDController.ShowOffer(offerData) end
        end)
    end

    local purchaseComplete = remotes:FindFirstChild("PurchaseComplete")
    if purchaseComplete then
        purchaseComplete.OnClientEvent:Connect(function(data)
            if Modules.HUDController then Modules.HUDController.ShowPurchaseConfirm(data.productName, data.success) end
            if Modules.SoundManager and data.success then Modules.SoundManager.Play("PurchaseSuccess") end
        end)
    end

    -- CLIENT -> SERVER INPUTS
    if Modules.MobileInputController then
        local meleeRemote = remotes:FindFirstChild("MeleeAttack")
        local rangedRemote = remotes:FindFirstChild("RangedShot")
        local dodgeRemote = remotes:FindFirstChild("DodgeRoll")
        local parryRemote = remotes:FindFirstChild("ParryAttempt")
        local switchRemote = remotes:FindFirstChild("WeaponSwitch")

        Modules.MobileInputController.OnMeleeAttack = function(data) if meleeRemote then meleeRemote:FireServer(data) end end
        Modules.MobileInputController.OnRangedShot = function(data) if rangedRemote then rangedRemote:FireServer(data) end end
        Modules.MobileInputController.OnDodgeRoll = function() if dodgeRemote then dodgeRemote:FireServer() end end
        Modules.MobileInputController.OnParryAttempt = function(data) if parryRemote then parryRemote:FireServer(data) end end
        Modules.MobileInputController.OnWeaponSwitch = function(slotIndex) if switchRemote then switchRemote:FireServer(slotIndex) end end
    end

    -- Keyboard fallback for PC players
    if not UserInputService.TouchEnabled then
        local meleeRemote = remotes:FindFirstChild("MeleeAttack")
        local rangedRemote = remotes:FindFirstChild("RangedShot")
        local dodgeRemote = remotes:FindFirstChild("DodgeRoll")
        local parryRemote = remotes:FindFirstChild("ParryAttempt")
        local switchRemote = remotes:FindFirstChild("WeaponSwitch")

        UserInputService.InputBegan:Connect(function(input, processed)
            if processed then return end
            if input.UserInputType == Enum.UserInputType.MouseButton1 then
                if meleeRemote then meleeRemote:FireServer({}) end
            elseif input.UserInputType == Enum.UserInputType.MouseButton2 then
                if rangedRemote then rangedRemote:FireServer({}) end
            elseif input.KeyCode == Enum.KeyCode.Space then
                if dodgeRemote then dodgeRemote:FireServer() end
            elseif input.KeyCode == Enum.KeyCode.F then
                if parryRemote then parryRemote:FireServer({}) end
            elseif input.KeyCode == Enum.KeyCode.One then
                if switchRemote then switchRemote:FireServer(1) end
            elseif input.KeyCode == Enum.KeyCode.Two then
                if switchRemote then switchRemote:FireServer(2) end
            elseif input.KeyCode == Enum.KeyCode.Three then
                if switchRemote then switchRemote:FireServer(3) end
            end
        end)
    end

    log("OK", "All remote events wired (combat-only)")
    return true
end

--------------------------------------------------------------------------------
-- MAIN BOOT
--------------------------------------------------------------------------------

log("BOOT", "=== SURVIVE THE BRAINROTS -- CLIENT v2.2 ===")
log("BOOT", "=== COMBAT ENGINE ONLINE ===")
log("BOOT", "Starting client boot...")

local bootFailed = false
for i, entry in ipairs(CLIENT_MODULES) do
    log("BOOT", string.format("[%d/%d] %s...", i, #CLIENT_MODULES, entry.name))
    if not loadClientModule(entry) then
        bootFailed = true
        break
    end
end

if bootFailed then
    log("FATAL", "=== CLIENT BOOT FAILED ===")
    return
end

if not wireRemoteEvents() then
    log("FATAL", "=== REMOTE WIRING FAILED ===")
    return
end

if Modules.HUDController and type(Modules.HUDController.Init) == "function" then pcall(Modules.HUDController.Init, PlayerGui) end
if Modules.MobileInputController and UserInputService.TouchEnabled then
    if type(Modules.MobileInputController.Init) == "function" then pcall(Modules.MobileInputController.Init, PlayerGui) end
end
if Modules.SoundManager and type(Modules.SoundManager.Init) == "function" then pcall(Modules.SoundManager.Init) end

local bootTime = tick() - bootStart
local moduleCount = 0
for _ in pairs(Modules) do moduleCount = moduleCount + 1 end
log("BOOT", string.format("=== CLIENT READY -- %d modules in %.2fs ===", moduleCount, bootTime))
log("BOOT", "SURVIVE. FIGHT. SPEND.")

return Modules
