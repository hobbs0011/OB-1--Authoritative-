--[[
    FTUEWiring.lua — First-Time User Experience Integration
    Skibidi Zombie: Survive the Brainrots
    
    GOAL: MAKE MONEY. FTUE converts visitors into players into payers.
    Every second of confusion = lost revenue.
    
    Wires FTUEManager into UnifiedServer boot sequence.
    Handles: tutorial triggers, UI prompts, skip detection, completion tracking.
    
    Architecture: ModuleScript (ServerStorage)
    Version: 2.0.0 — Combat FTUE (ESL PURGED)
    Date: 2026-03-28
--]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local FTUEWiring = {}

local CONFIG = {
    STEPS = {
        { id = "welcome",        prompt = "Welcome to Skibidi Zombie! 🧟",                action = "show_overlay",   duration = 3 },
        { id = "movement",       prompt = "Use WASD or tap to move!",                      action = "highlight_area", duration = 0 },
        { id = "first_enemy",    prompt = "A zombie appeared! Tap to attack! 👊",           action = "spawn_tutorial_enemy", duration = 0 },
        { id = "melee_attack",   prompt = "Nice hit! 🔥 Keep slashing!",                   action = "show_overlay",   duration = 2 },
        { id = "combo",          prompt = "Get 3 kills in a row for a COMBO bonus!",       action = "show_overlay",   duration = 2 },
        { id = "dodge",          prompt = "Swipe or press SPACE to dodge roll!",            action = "highlight_ui",   duration = 3 },
        { id = "weapon_switch",  prompt = "You found a weapon! Tap to equip it! ⚔️",       action = "highlight_ui",   duration = 3 },
        { id = "coins",          prompt = "Coins drop from kills. Spend them in the shop!", action = "highlight_ui",   duration = 2 },
        { id = "complete",       prompt = "Tutorial complete! You're ready to survive! 💀", action = "show_overlay",   duration = 3 },
    },
    TUTORIAL_ENEMY = {
        name = "Baby Skibidi",
        health = 20,
        isBoss = false,
        tier = 1,
    },
    SKIP_AFTER_SECONDS = 30,
    REWARD_COINS = 25,
}

local playerFTUE = {}

function FTUEWiring.Init()
    Players.PlayerAdded:Connect(function(player)
        playerFTUE[player] = {
            currentStep = 0,
            startTime = tick(),
            completed = false,
            skipped = false,
        }
    end)
    Players.PlayerRemoving:Connect(function(player)
        playerFTUE[player] = nil
    end)
    for _, p in ipairs(Players:GetPlayers()) do
        if not playerFTUE[p] then
            playerFTUE[p] = { currentStep = 0, startTime = tick(), completed = false, skipped = false }
        end
    end
    print("[FTUEWiring] Initialized — convert visitors into payers")
    return true
end

function FTUEWiring.StartFTUE(player)
    local state = playerFTUE[player]
    if not state then return false end
    if state.completed or state.skipped then return false end
    state.currentStep = 1
    state.startTime = tick()
    FTUEWiring._sendStep(player, 1)
    return true
end

function FTUEWiring.AdvanceStep(player)
    local state = playerFTUE[player]
    if not state then return false end
    if state.completed or state.skipped then return false end
    
    state.currentStep = state.currentStep + 1
    if state.currentStep > #CONFIG.STEPS then
        state.completed = true
        FTUEWiring._onComplete(player)
        return true
    end
    
    FTUEWiring._sendStep(player, state.currentStep)
    return true
end

function FTUEWiring.SkipFTUE(player)
    local state = playerFTUE[player]
    if not state then return end
    state.skipped = true
    state.completed = true
    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if remotes then
        local ev = remotes:FindFirstChild("FTUEUpdate")
        if ev then ev:FireClient(player, { action = "skip" }) end
    end
end

function FTUEWiring.IsComplete(player)
    local state = playerFTUE[player]
    return state and state.completed or false
end

function FTUEWiring._sendStep(player, stepIndex)
    local step = CONFIG.STEPS[stepIndex]
    if not step then return end
    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if remotes then
        local ev = remotes:FindFirstChild("FTUEUpdate")
        if not ev then
            ev = Instance.new("RemoteEvent")
            ev.Name = "FTUEUpdate"
            ev.Parent = remotes
        end
        ev:FireClient(player, {
            action = step.action,
            prompt = step.prompt,
            stepId = step.id,
            stepNumber = stepIndex,
            totalSteps = #CONFIG.STEPS,
            duration = step.duration,
        })
    end
end

function FTUEWiring._onComplete(player)
    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if remotes then
        local ev = remotes:FindFirstChild("FTUEUpdate")
        if ev then
            ev:FireClient(player, {
                action = "complete",
                prompt = "Tutorial complete! You're ready to survive! 💀",
                rewardCoins = CONFIG.REWARD_COINS,
            })
        end
        local currEv = remotes:FindFirstChild("CurrencyUpdate")
        if currEv then
            currEv:FireClient(player, { currency = "SurvivalCoins", amount = CONFIG.REWARD_COINS, reason = "FTUE_COMPLETE" })
        end
    end
end

function FTUEWiring.GetTutorialEnemy()
    return CONFIG.TUTORIAL_ENEMY
end

function FTUEWiring.Tick(dt)
    local now = tick()
    for player, state in pairs(playerFTUE) do
        if not state.completed and not state.skipped and state.currentStep > 0 then
            if now - state.startTime > CONFIG.SKIP_AFTER_SECONDS then
                FTUEWiring.SkipFTUE(player)
            end
        end
    end
end

return FTUEWiring
