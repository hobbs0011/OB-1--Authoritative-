--[[
═══════════════════════════════════════════════════════════
SURVIVE A BRAINROT — FTUE MANAGER
Script: FTUEManager.lua
Type: Server Module (ServerScriptService)
Purpose: First Time User Experience — 90-Second Hook
Version: 1.0
Date: March 26, 2026
Pipeline: Stage 1 of 20 — Train 6-7 Launch Pipeline
Gospel 444 Compliant — NO BLUE
Phoenix Rising Gaming Division
═══════════════════════════════════════════════════════════
DESIGN:
  Every new player gets a guided 90-second experience:
  0-5s:   Spawn + auto-equip starter weapon
  5-10s:  Tutorial prompt ("SWING to attack!")
  10-20s: Tutorial enemy spawns nearby (50% HP)
  20-25s: First kill → reward burst (coins + XP + VFX)
  25-35s: 2-3 more enemies, player is in the loop
  30-35s: First English Power-Up prompt
  45-60s: Wave clear → chest drop + daily reward popup
  60-90s: Day transition, difficulty escalates

SOLO-FIRST:
  Game is fully playable with 1 player.
  Squad bonus (30% XP) activates at 2+ players.
  Difficulty scales by player count.
═══════════════════════════════════════════════════════════
]]

local FTUEManager = {}

-- SERVICES
local Players = game:GetService("Players")
local ServerStorage = game:GetService("ServerStorage")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")

-- ══════════════════════════════════════════════════════════
-- CONFIGURATION
-- ══════════════════════════════════════════════════════════
FTUEManager.Config = {
    -- Timing (seconds after spawn)
    WeaponEquipDelay = 1.0,
    TutorialPromptDelay = 4.0,
    FirstEnemyDelay = 8.0,
    EnglishPromptDelay = 30.0,
    FirstChestDelay = 45.0,

    -- Tutorial enemy (weaker than normal)
    TutorialEnemy = {
        Type = "SkibidiShambler",
        HealthMultiplier = 0.5,    -- 50 HP instead of 100
        SpeedMultiplier = 0.7,     -- slower, less scary
        SpawnDistance = 25,        -- close enough to notice
    },

    -- Rewards
    FirstKillReward = {
        Coins = 25,
        XP = 15,
        ShowBurst = true,
    },
    FirstChestReward = {
        Coins = 100,
        XP = 50,
        Item = "StarterCrate",
    },

    -- Wave clear reward
    WaveClearReward = {
        Coins = 50,
        XP = 30,
    },

    -- Starter weapon
    StarterWeapon = "RustyPipe",

    -- Difficulty scaling by player count
    Scaling = {
        [1] = { hpMult = 0.5, countMult = 0.5, spawnRate = 2.0 },
        [2] = { hpMult = 0.75, countMult = 0.75, spawnRate = 1.5 },
        [3] = { hpMult = 0.75, countMult = 0.75, spawnRate = 1.5 },
        [4] = { hpMult = 1.0, countMult = 1.0, spawnRate = 1.5 },
        [5] = { hpMult = 1.0, countMult = 1.0, spawnRate = 1.5 },
    },
    DefaultScaling = { hpMult = 1.25, countMult = 1.5, spawnRate = 1.0 },

    -- Gospel 444 Colors (NO BLUE)
    Colors = {
        Purple = Color3.fromRGB(168, 85, 247),  -- #a855f7
        Gold = Color3.fromRGB(245, 158, 11),     -- #f59e0b
        Dark = Color3.fromRGB(15, 15, 26),       -- #0f0f1a
        White = Color3.fromRGB(255, 255, 255),
        Red = Color3.fromRGB(239, 68, 68),
    },

    -- Tutorial prompts
    Prompts = {
        WeaponEquipped = "⚔️ RUSTY PIPE equipped! TAP to swing!",
        FirstEnemy = "⚠️ BRAINROT INCOMING! Swing your weapon!",
        FirstKill = "🎉 FIRST KILL! +%d Coins +%d XP",
        EnglishPowerUp = "⚡ ANSWER THIS TO CHARGE YOUR WEAPON!",
        WaveClear = "✅ WAVE CLEARED! Chest incoming...",
        DailyReward = "🎁 DAILY REWARD! Come back tomorrow for more!",
    },
}

-- ══════════════════════════════════════════════════════════
-- STATE
-- ══════════════════════════════════════════════════════════
local playerFTUEState = {} -- [Player.UserId] = { started, step, completed }
local ftueDataStore = nil

-- Lazy-init DataStore (wraps in pcall for Studio testing)
local function getFTUEStore()
    if ftueDataStore then return ftueDataStore end
    local ok, store = pcall(function()
        return DataStoreService:GetDataStore("FTUE_Completion_v1")
    end)
    if ok then ftueDataStore = store end
    return ftueDataStore
end

-- ══════════════════════════════════════════════════════════
-- REMOTE EVENTS (created by GameMain, referenced here)
-- ══════════════════════════════════════════════════════════
local function getRemote(name)
    local folder = ReplicatedStorage:FindFirstChild("GameRemotes")
    if folder then
        return folder:FindFirstChild(name)
    end
    return nil
end

local function fireClient(player, eventName, ...)
    local remote = getRemote(eventName)
    if remote then
        remote:FireClient(player, ...)
    end
end

local function fireAllClients(eventName, ...)
    local remote = getRemote(eventName)
    if remote then
        remote:FireAllClients(...)
    end
end

-- ══════════════════════════════════════════════════════════
-- CORE FUNCTIONS
-- ══════════════════════════════════════════════════════════

--- Check if player has completed FTUE before (persistent)
function FTUEManager.isNewPlayer(player)
    -- Fast path: check session cache
    local state = playerFTUEState[player.UserId]
    if state and state.completed then
        return false
    end

    -- Check DataStore for persistent completion
    local store = getFTUEStore()
    if store then
        local ok, completed = pcall(function()
            return store:GetAsync("ftue_" .. tostring(player.UserId))
        end)
        if ok and completed then
            playerFTUEState[player.UserId] = { completed = true }
            return false
        end
    end

    return true
end

--- Mark FTUE as complete (persistent)
function FTUEManager.markComplete(player)
    playerFTUEState[player.UserId] = { completed = true }
    player:SetAttribute("FTUECompleted", true)

    local store = getFTUEStore()
    if store then
        pcall(function()
            store:SetAsync("ftue_" .. tostring(player.UserId), true)
        end)
    end
end

--- Get difficulty scaling for current player count
function FTUEManager.getScaling()
    local count = #Players:GetPlayers()
    local cfg = FTUEManager.Config.Scaling
    return cfg[count] or FTUEManager.Config.DefaultScaling
end

--- Get scaled enemy count for a wave
function FTUEManager.getScaledEnemyCount(baseCount)
    local scaling = FTUEManager.getScaling()
    return math.max(1, math.floor(baseCount * scaling.countMult))
end

--- Get scaled enemy health
function FTUEManager.getScaledHealth(baseHealth)
    local scaling = FTUEManager.getScaling()
    return math.max(10, math.floor(baseHealth * scaling.hpMult))
end

--- Get scaled spawn rate
function FTUEManager.getScaledSpawnRate()
    local scaling = FTUEManager.getScaling()
    return scaling.spawnRate
end

--- Equip starter weapon to player
function FTUEManager.giveStarterWeapon(player)
    local character = player.Character
    if not character then return false end

    -- Check if player already has the weapon
    local backpack = player:FindFirstChild("Backpack")
    if backpack and backpack:FindFirstChild(FTUEManager.Config.StarterWeapon) then
        return true -- already equipped
    end
    if character:FindFirstChild(FTUEManager.Config.StarterWeapon) then
        return true -- already holding
    end

    -- Try to clone from ServerStorage/Weapons
    local weapons = ServerStorage:FindFirstChild("Weapons")
    if weapons then
        local template = weapons:FindFirstChild(FTUEManager.Config.StarterWeapon)
        if template then
            local weapon = template:Clone()
            weapon.Parent = backpack or character
            return true
        end
    end

    -- Fallback: create a basic melee tool
    -- This ensures FTUE works even without the asset
    local tool = Instance.new("Tool")
    tool.Name = FTUEManager.Config.StarterWeapon
    tool.RequiresHandle = false
    tool.CanBeDropped = false
    tool.ToolTip = "Swing to attack brainrots!"
    tool.Parent = backpack or character

    warn("[FTUEManager] Created fallback weapon — RustyPipe model not found in ServerStorage/Weapons")
    return true
end

--- Spawn a tutorial enemy near the player (weaker stats)
function FTUEManager.spawnTutorialEnemy(player, createEnemyFn)
    local character = player.Character
    if not character then return nil end

    local rootPart = character:FindFirstChild("HumanoidRootPart")
    if not rootPart then return nil end

    local cfg = FTUEManager.Config.TutorialEnemy
    local spawnDir = character:GetPivot().LookVector
    local spawnPos = rootPart.Position + (spawnDir * cfg.SpawnDistance)

    -- Use GameMain's createEnemy if provided, with modified stats
    if createEnemyFn then
        local enemy = createEnemyFn(cfg.Type, spawnPos)
        if enemy then
            -- Weaken the tutorial enemy
            local humanoid = enemy:FindFirstChildOfClass("Humanoid")
            if humanoid then
                local newHP = math.floor(humanoid.MaxHealth * cfg.HealthMultiplier)
                humanoid.MaxHealth = newHP
                humanoid.Health = newHP
                humanoid.WalkSpeed = humanoid.WalkSpeed * cfg.SpeedMultiplier
            end

            -- Tag as tutorial enemy for tracking
            enemy:SetAttribute("IsTutorial", true)
            enemy:SetAttribute("FTUEPlayer", player.UserId)

            return enemy
        end
    end

    warn("[FTUEManager] Could not spawn tutorial enemy — createEnemyFn missing or failed")
    return nil
end

--- Trigger reward burst VFX + currency
function FTUEManager.triggerRewardBurst(player, rewards)
    -- Fire reward event to client
    fireClient(player, "ShowNotification",
        string.format(FTUEManager.Config.Prompts.FirstKill,
            rewards.Coins or 0, rewards.XP or 0))

    -- Fire gold flash effect
    fireClient(player, "PurpleFlash") -- reuse existing VFX

    -- Add currency (integrate with EconomyManager when Stage 4 ships)
    -- For now, use leaderstats as placeholder
    local leaderstats = player:FindFirstChild("leaderstats")
    if leaderstats then
        local coins = leaderstats:FindFirstChild("Coins")
        if coins then
            coins.Value = coins.Value + (rewards.Coins or 0)
        end
        local xp = leaderstats:FindFirstChild("XP")
        if xp then
            xp.Value = xp.Value + (rewards.XP or 0)
        end
    end
end

--- Spawn a chest near the player after wave clear
function FTUEManager.spawnFirstChest(player)
    local character = player.Character
    if not character then return end

    local rootPart = character:FindFirstChild("HumanoidRootPart")
    if not rootPart then return end

    -- Create a simple chest part (visual placeholder)
    local chest = Instance.new("Part")
    chest.Name = "FTUEChest"
    chest.Size = Vector3.new(3, 2.5, 2)
    chest.Color = FTUEManager.Config.Colors.Gold
    chest.Material = Enum.Material.Metal
    chest.Anchored = true
    chest.Position = rootPart.Position + Vector3.new(5, 0, 5)
    chest.Parent = workspace

    -- Add proximity prompt for collection
    local prompt = Instance.new("ProximityPrompt")
    prompt.ObjectText = "Starter Crate"
    prompt.ActionText = "Open"
    prompt.HoldDuration = 0.5
    prompt.MaxActivationDistance = 10
    prompt.Parent = chest

    prompt.Triggered:Connect(function(triggerPlayer)
        if triggerPlayer == player then
            -- Grant rewards
            local rewards = FTUEManager.Config.FirstChestReward
            FTUEManager.triggerRewardBurst(player, rewards)
            fireClient(player, "ShowNotification",
                "🎁 STARTER CRATE OPENED! +" .. rewards.Coins .. " Coins!")

            -- Destroy chest
            chest:Destroy()

            -- Show daily reward teaser
            task.wait(2)
            fireClient(player, "ShowNotification",
                FTUEManager.Config.Prompts.DailyReward)
        end
    end)

    -- Auto-destroy after 60 seconds if uncollected
    task.delay(60, function()
        if chest.Parent then chest:Destroy() end
    end)

    fireClient(player, "ShowNotification",
        FTUEManager.Config.Prompts.WaveClear)
end

-- ══════════════════════════════════════════════════════════
-- MAIN FTUE ORCHESTRATOR
-- ══════════════════════════════════════════════════════════

--- Run the full 90-second FTUE for a new player
--- @param player Player
--- @param createEnemyFn function — GameMain's createEnemy function
--- @param startGameFn function — GameMain's startGame function (for solo start)
function FTUEManager.runFTUE(player, createEnemyFn, startGameFn)
    if not FTUEManager.isNewPlayer(player) then
        return false -- not a new player, skip FTUE
    end

    -- Initialize FTUE state
    playerFTUEState[player.UserId] = {
        started = os.clock(),
        step = "weapon",
        completed = false,
        firstKillDone = false,
    }

    local character = player.Character
    if not character then
        player.CharacterAdded:Wait()
        character = player.Character
    end

    -- STEP 1: Auto-equip weapon (1s after spawn)
    task.wait(FTUEManager.Config.WeaponEquipDelay)
    if not player.Parent then return false end -- player left

    local weaponGiven = FTUEManager.giveStarterWeapon(player)
    if weaponGiven then
        fireClient(player, "ShowNotification",
            FTUEManager.Config.Prompts.WeaponEquipped)
    end

    -- STEP 2: Tutorial prompt (4s after spawn)
    task.wait(FTUEManager.Config.TutorialPromptDelay - FTUEManager.Config.WeaponEquipDelay)
    if not player.Parent then return false end

    -- STEP 3: Spawn tutorial enemy (8s after spawn)
    task.wait(FTUEManager.Config.FirstEnemyDelay - FTUEManager.Config.TutorialPromptDelay)
    if not player.Parent then return false end

    fireClient(player, "ShowNotification",
        FTUEManager.Config.Prompts.FirstEnemy)

    local tutorialEnemy = FTUEManager.spawnTutorialEnemy(player, createEnemyFn)

    if tutorialEnemy then
        -- Watch for first kill
        local humanoid = tutorialEnemy:FindFirstChildOfClass("Humanoid")
        if humanoid then
            humanoid.Died:Connect(function()
                local state = playerFTUEState[player.UserId]
                if state and not state.firstKillDone then
                    state.firstKillDone = true
                    state.step = "post_first_kill"

                    -- REWARD BURST
                    FTUEManager.triggerRewardBurst(player,
                        FTUEManager.Config.FirstKillReward)
                end
            end)
        end
    end

    -- STEP 4: English Power-Up prompt (30s after spawn)
    task.wait(FTUEManager.Config.EnglishPromptDelay - FTUEManager.Config.FirstEnemyDelay)
    if not player.Parent then return false end

    fireClient(player, "ShowNotification",
        FTUEManager.Config.Prompts.EnglishPowerUp)

    -- STEP 5: First chest after wave clear (45s after spawn)
    task.wait(FTUEManager.Config.FirstChestDelay - FTUEManager.Config.EnglishPromptDelay)
    if not player.Parent then return false end

    FTUEManager.spawnFirstChest(player)

    -- Mark FTUE complete
    FTUEManager.markComplete(player)
    playerFTUEState[player.UserId].step = "complete"
    playerFTUEState[player.UserId].completed = true

    print("[FTUEManager] FTUE completed for " .. player.Name
        .. " in " .. string.format("%.1f", os.clock() - playerFTUEState[player.UserId].started) .. "s")

    return true
end

-- ══════════════════════════════════════════════════════════
-- SOLO MODE — IMMEDIATE GAME START
-- ══════════════════════════════════════════════════════════

--- Check if game should start immediately (solo mode)
function FTUEManager.shouldStartImmediately()
    return true -- Always start immediately, solo-first design
end

--- Get squad bonus multiplier
function FTUEManager.getSquadBonusMultiplier()
    local count = #Players:GetPlayers()
    if count >= 2 then
        return 1.30 -- 30% XP bonus
    end
    return 1.0 -- no bonus for solo
end

--- Check if squad bonus should be shown
function FTUEManager.hasSquadBonus()
    return #Players:GetPlayers() >= 2
end

-- ══════════════════════════════════════════════════════════
-- CLEANUP
-- ══════════════════════════════════════════════════════════

Players.PlayerRemoving:Connect(function(player)
    playerFTUEState[player.UserId] = nil
end)

-- ══════════════════════════════════════════════════════════
-- INIT
-- ══════════════════════════════════════════════════════════
print("══════════════════════════════════════════════")
print("⚡ FTUEManager v1.0 — 90-Second Hook System")
print("Solo-first | Gospel 444 Compliant | NO BLUE")
print("Pipeline: Stage 1 of 20")
print("══════════════════════════════════════════════")

return FTUEManager
