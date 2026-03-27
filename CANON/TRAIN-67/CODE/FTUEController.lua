--[[
═══════════════════════════════════════════════════════════════════════════════
SURVIVE A BRAINROT — FTUE CONTROLLER (Unified Hybrid Timer+Step)
Script: FTUEController.lua
Type: Server Module (ServerScriptService)
Purpose: First Time User Experience — Unified 90-Second Hook + Step Progression
Version: 2.0
Date: March 27, 2026
Pipeline: Stage 1 of 20 — Train 6-7 Launch Pipeline
Gospel 444 Compliant — NO BLUE
Phoenix Rising Gaming Division

ARCHITECTURE — HYBRID TIMER+STEP:
  Merges two prior modules into one unified controller:
    - FTUEManager.lua (SHA: 33a7d165) — timer-gated 90s hook system
    - FTUEWiring.lua  (SHA: 5adf3afd) — step-based 9-step progression

  Design principle: Steps advance by EVENTS (kill, answer, collect).
  Timers act as FALLBACK advancement when players stall.
  Fast players blaze through. Slow players still get guided. Nobody gets stuck.

  8-Step Hybrid Flow:
    Step 1 — WELCOME        (0s)    Show overlay → auto-advance after 2s
    Step 2 — WEAPON_EQUIP   (1s)    Auto-equip starter weapon → advance immediately
    Step 3 — MOVEMENT       (3s)    Highlight move area → advance on movement or 5s timer
    Step 4 — FIRST_ENEMY    (8s)    Spawn tutorial enemy → advance on kill or 20s timer
    Step 5 — FIRST_QUESTION (kill)  English question prompt → advance on correct or 15s timer
    Step 6 — POWER_UP       (30s)   English Power-Up mechanic → advance after 8s display
    Step 7 — WAVE_CLEAR     (45s)   Chest drop + rewards → advance on collect or 20s timer
    Step 8 — COMPLETE        (~50s)  Mark done, unlock full game, show daily reward teaser

SOLO-FIRST:
  Game is fully playable with 1 player.
  Squad bonus (30% XP) activates at 2+ players.
  Difficulty scales by player count.

MAKE MONEY:
  Every second of confusion = lost revenue.
  FTUE converts visitors into players into payers.
  English is the mechanic, money is the mission.

CROSS-REPO SOURCES:
  FTUEManager.lua      — hobbs-lab/Phoenix-Rising-Protocol-Ultimate CANON/TRAIN-67/CODE/
  FTUEWiring.lua       — hobbs-lab/Phoenix-Rising-Protocol-Ultimate CANON/TRAIN-67/CODE/
  CombatEnglishBridge  — hobbs-lab/Phoenix-Rising-Protocol-Ultimate CANON/TRAIN-67/ §10
═══════════════════════════════════════════════════════════════════════════════
]]

local FTUEController = {}

-- ═══════════════════════════════════════════════════════════
-- SERVICES
-- ═══════════════════════════════════════════════════════════
local Players = game:GetService("Players")
local ServerStorage = game:GetService("ServerStorage")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")
local RunService = game:GetService("RunService")

-- ═══════════════════════════════════════════════════════════
-- STEP DEFINITIONS — Hybrid Timer+Step
-- advanceOn: "timer" = auto-advance after duration
--            "event" = advance when game event fires (timer is fallback)
-- timerGate: seconds after FTUE start — fallback advancement ceiling
-- fallbackTimeout: seconds to wait for event before forcing advance
-- ═══════════════════════════════════════════════════════════
local STEPS = {
    {
        id = "welcome",
        prompt = "Welcome to Skibidi Zombie! 🧟 Survive the Brainrots!",
        action = "show_overlay",
        advanceOn = "timer",
        duration = 2,
        fallbackTimeout = 3,
    },
    {
        id = "weapon_equip",
        prompt = "⚔️ RUSTY PIPE equipped! TAP to swing!",
        action = "equip_weapon",
        advanceOn = "timer",
        duration = 1.5,
        fallbackTimeout = 3,
    },
    {
        id = "movement",
        prompt = "Use WASD or tap to move around!",
        action = "highlight_area",
        advanceOn = "event",      -- player moves
        duration = 0,
        fallbackTimeout = 5,
    },
    {
        id = "first_enemy",
        prompt = "⚠️ BRAINROT INCOMING! Swing your weapon!",
        action = "spawn_tutorial_enemy",
        advanceOn = "event",      -- enemy killed
        duration = 0,
        fallbackTimeout = 20,
    },
    {
        id = "first_question",
        prompt = "⚡ ANSWER THIS TO CHARGE YOUR WEAPON!",
        action = "serve_tutorial_question",
        advanceOn = "event",      -- correct answer
        duration = 0,
        fallbackTimeout = 15,
    },
    {
        id = "power_up",
        prompt = "Fill the Power-Up bar → unleash English Power! 🔥",
        action = "highlight_ui",
        advanceOn = "timer",
        duration = 6,
        fallbackTimeout = 8,
    },
    {
        id = "wave_clear",
        prompt = "✅ WAVE CLEARED! Chest incoming...",
        action = "spawn_chest",
        advanceOn = "event",      -- chest collected
        duration = 0,
        fallbackTimeout = 20,
    },
    {
        id = "complete",
        prompt = "Tutorial complete! You're ready to survive! 💀",
        action = "show_overlay",
        advanceOn = "timer",
        duration = 3,
        fallbackTimeout = 4,
    },
}

-- ═══════════════════════════════════════════════════════════
-- CONFIGURATION
-- ═══════════════════════════════════════════════════════════
local CONFIG = {
    -- Tutorial enemy (weaker than normal)
    TutorialEnemy = {
        Type = "SkibidiShambler",
        DisplayName = "Baby Skibidi",
        HealthMultiplier = 0.5,      -- 50% HP
        SpeedMultiplier = 0.7,       -- slower, less scary
        SpawnDistance = 25,           -- close enough to notice
        Tier = 1,
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
    WaveClearReward = {
        Coins = 50,
        XP = 30,
    },
    CompletionReward = {
        Coins = 25,
    },

    -- Starter weapon
    StarterWeapon = "RustyPipe",

    -- Skip: auto-skip entire FTUE if player stalls too long
    MaxTotalDuration = 90,
    SkipAfterSeconds = 60,

    -- Difficulty scaling by player count (from FTUEManager)
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
        Purple = Color3.fromRGB(168, 85, 247),   -- #a855f7 Soul Purple
        Gold   = Color3.fromRGB(245, 158, 11),   -- #f59e0b Imperial Gold
        Dark   = Color3.fromRGB(15, 15, 26),     -- #0f0f1a Void
        White  = Color3.fromRGB(255, 255, 255),
        Red    = Color3.fromRGB(239, 68, 68),
    },

    -- Prompt templates
    Prompts = {
        FirstKill = "🎉 FIRST KILL! +%d Coins +%d XP",
        DailyReward = "🎁 DAILY REWARD! Come back tomorrow for more!",
        ChestOpen = "🎁 STARTER CRATE OPENED! +%d Coins!",
        SquadBonus = "👥 SQUAD BONUS! +30%% XP with friends!",
    },
}

-- ═══════════════════════════════════════════════════════════
-- STATE
-- ═══════════════════════════════════════════════════════════
-- Per-player FTUE state: tracks step, timing, events, completion
-- Key: Player.UserId
local playerState = {}
local ftueDataStore = nil

-- Lazy-init DataStore (pcall for Studio safety)
local function getFTUEStore()
    if ftueDataStore then return ftueDataStore end
    local ok, store = pcall(function()
        return DataStoreService:GetDataStore("FTUE_Completion_v2")
    end)
    if ok then ftueDataStore = store end
    return ftueDataStore
end

-- ═══════════════════════════════════════════════════════════
-- REMOTE EVENTS
-- Unified remote pattern: single "FTUEUpdate" RemoteEvent
-- carries step data, prompts, and action payloads to client
-- ═══════════════════════════════════════════════════════════
local ftueRemote = nil

local function ensureRemote()
    if ftueRemote then return ftueRemote end
    local remotes = ReplicatedStorage:FindFirstChild("GameRemotes")
        or ReplicatedStorage:FindFirstChild("Remotes")
    if not remotes then
        remotes = Instance.new("Folder")
        remotes.Name = "GameRemotes"
        remotes.Parent = ReplicatedStorage
    end
    ftueRemote = remotes:FindFirstChild("FTUEUpdate")
    if not ftueRemote then
        ftueRemote = Instance.new("RemoteEvent")
        ftueRemote.Name = "FTUEUpdate"
        ftueRemote.Parent = remotes
    end
    return ftueRemote
end

local function fireClient(player, payload)
    local remote = ensureRemote()
    if remote and player.Parent then
        remote:FireClient(player, payload)
    end
end

--- Fire a simple notification via the existing GameRemotes system
local function fireNotification(player, message)
    local remotes = ReplicatedStorage:FindFirstChild("GameRemotes")
        or ReplicatedStorage:FindFirstChild("Remotes")
    if remotes then
        local ev = remotes:FindFirstChild("ShowNotification")
        if ev then
            ev:FireClient(player, message)
            return
        end
    end
    -- Fallback: use FTUE remote with notification action
    fireClient(player, { action = "notification", prompt = message })
end

-- ═══════════════════════════════════════════════════════════
-- PERSISTENCE — DataStore check + mark
-- ═══════════════════════════════════════════════════════════

--- Check if player has completed FTUE before (persistent)
function FTUEController.IsNewPlayer(player)
    -- Fast path: session cache
    local state = playerState[player.UserId]
    if state and state.completed then
        return false
    end

    -- Check DataStore
    local store = getFTUEStore()
    if store then
        local ok, completed = pcall(function()
            return store:GetAsync("ftue_" .. tostring(player.UserId))
        end)
        if ok and completed then
            playerState[player.UserId] = { completed = true }
            return false
        end
    end

    return true
end

--- Mark FTUE as complete (persistent)
local function markComplete(player)
    local state = playerState[player.UserId]
    if state then
        state.completed = true
        state.step = #STEPS
    end
    player:SetAttribute("FTUECompleted", true)
    player:SetAttribute("FTUECompletedTime", os.time())

    local store = getFTUEStore()
    if store then
        pcall(function()
            store:SetAsync("ftue_" .. tostring(player.UserId), {
                completed = true,
                timestamp = os.time(),
                version = "2.0",
            })
        end)
    end
end

-- ═══════════════════════════════════════════════════════════
-- DIFFICULTY SCALING (from FTUEManager)
-- ═══════════════════════════════════════════════════════════

function FTUEController.GetScaling()
    local count = #Players:GetPlayers()
    return CONFIG.Scaling[count] or CONFIG.DefaultScaling
end

function FTUEController.GetScaledEnemyCount(baseCount)
    local scaling = FTUEController.GetScaling()
    return math.max(1, math.floor(baseCount * scaling.countMult))
end

function FTUEController.GetScaledHealth(baseHealth)
    local scaling = FTUEController.GetScaling()
    return math.max(10, math.floor(baseHealth * scaling.hpMult))
end

function FTUEController.GetScaledSpawnRate()
    return FTUEController.GetScaling().spawnRate
end

-- ═══════════════════════════════════════════════════════════
-- SQUAD BONUS
-- ═══════════════════════════════════════════════════════════

function FTUEController.GetSquadBonusMultiplier()
    if #Players:GetPlayers() >= 2 then
        return 1.30 -- 30% XP bonus
    end
    return 1.0
end

function FTUEController.HasSquadBonus()
    return #Players:GetPlayers() >= 2
end

function FTUEController.ShouldStartImmediately()
    return true -- Solo-first: always start immediately
end

-- ═══════════════════════════════════════════════════════════
-- STEP EXECUTORS — concrete game actions per step
-- ═══════════════════════════════════════════════════════════

--- Equip starter weapon (from FTUEManager.giveStarterWeapon)
local function executeWeaponEquip(player)
    local character = player.Character
    if not character then return false end

    local backpack = player:FindFirstChild("Backpack")
    local weaponName = CONFIG.StarterWeapon

    -- Already have it?
    if backpack and backpack:FindFirstChild(weaponName) then return true end
    if character:FindFirstChild(weaponName) then return true end

    -- Clone from ServerStorage/Weapons
    local weapons = ServerStorage:FindFirstChild("Weapons")
    if weapons then
        local template = weapons:FindFirstChild(weaponName)
        if template then
            local weapon = template:Clone()
            weapon.Parent = backpack or character
            return true
        end
    end

    -- Fallback: create basic melee tool so FTUE always works
    local tool = Instance.new("Tool")
    tool.Name = weaponName
    tool.RequiresHandle = false
    tool.CanBeDropped = false
    tool.ToolTip = "Swing to attack brainrots!"
    tool.Parent = backpack or character
    warn("[FTUEController] Fallback weapon created — " .. weaponName .. " model not in ServerStorage/Weapons")
    return true
end

--- Spawn tutorial enemy near player (from FTUEManager.spawnTutorialEnemy)
--- @param player Player
--- @param createEnemyFn function|nil — GameMain's createEnemy if available
--- @return Instance|nil enemy
local function spawnTutorialEnemy(player, createEnemyFn)
    local character = player.Character
    if not character then return nil end

    local rootPart = character:FindFirstChild("HumanoidRootPart")
    if not rootPart then return nil end

    local cfg = CONFIG.TutorialEnemy
    local spawnDir = character:GetPivot().LookVector
    local spawnPos = rootPart.Position + (spawnDir * cfg.SpawnDistance)

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

            -- Tag for tracking
            enemy:SetAttribute("IsTutorial", true)
            enemy:SetAttribute("FTUEPlayer", player.UserId)
            enemy:SetAttribute("DisplayName", cfg.DisplayName)

            return enemy
        end
    end

    warn("[FTUEController] Could not spawn tutorial enemy — createEnemyFn missing or failed")
    return nil
end

--- Trigger reward burst VFX + currency (from FTUEManager.triggerRewardBurst)
local function grantRewards(player, rewards)
    -- Notify client
    if rewards.ShowBurst then
        fireNotification(player,
            string.format(CONFIG.Prompts.FirstKill, rewards.Coins or 0, rewards.XP or 0))
        fireClient(player, { action = "vfx", effect = "purple_gold_burst" })
    end

    -- Grant currency via leaderstats (placeholder until EconomyManager ships)
    local leaderstats = player:FindFirstChild("leaderstats")
    if leaderstats then
        local coins = leaderstats:FindFirstChild("Coins")
        if coins then coins.Value = coins.Value + (rewards.Coins or 0) end
        local xp = leaderstats:FindFirstChild("XP")
        if xp then xp.Value = xp.Value + (rewards.XP or 0) end
    end

    -- Also fire CurrencyUpdate for systems that listen to it
    local remotes = ReplicatedStorage:FindFirstChild("GameRemotes")
        or ReplicatedStorage:FindFirstChild("Remotes")
    if remotes then
        local currEv = remotes:FindFirstChild("CurrencyUpdate")
        if currEv then
            currEv:FireClient(player, {
                currency = "EnglishCoins",
                amount = rewards.Coins or 0,
                reason = "FTUE",
            })
        end
    end
end

--- Spawn first chest near player (from FTUEManager.spawnFirstChest)
--- @return Instance|nil chest
local function spawnChest(player)
    local character = player.Character
    if not character then return nil end

    local rootPart = character:FindFirstChild("HumanoidRootPart")
    if not rootPart then return nil end

    local chest = Instance.new("Part")
    chest.Name = "FTUEChest"
    chest.Size = Vector3.new(3, 2.5, 2)
    chest.Color = CONFIG.Colors.Gold
    chest.Material = Enum.Material.Metal
    chest.Anchored = true
    chest.Position = rootPart.Position + Vector3.new(5, 0, 5)
    chest.Parent = workspace

    local prompt = Instance.new("ProximityPrompt")
    prompt.ObjectText = "Starter Crate"
    prompt.ActionText = "Open"
    prompt.HoldDuration = 0.5
    prompt.MaxActivationDistance = 10
    prompt.Parent = chest

    -- Track collection for step advancement
    prompt.Triggered:Connect(function(triggerPlayer)
        if triggerPlayer == player then
            grantRewards(player, CONFIG.FirstChestReward)
            fireNotification(player,
                string.format(CONFIG.Prompts.ChestOpen, CONFIG.FirstChestReward.Coins))
            chest:Destroy()

            -- Signal chest collected for step advancement
            local state = playerState[player.UserId]
            if state then
                state.chestCollected = true
            end

            -- Daily reward teaser
            task.delay(2, function()
                if player.Parent then
                    fireNotification(player, CONFIG.Prompts.DailyReward)
                end
            end)
        end
    end)

    -- Auto-destroy after 60s if uncollected
    task.delay(60, function()
        if chest.Parent then
            chest:Destroy()
            -- Force advance if chest expired
            local state = playerState[player.UserId]
            if state then state.chestCollected = true end
        end
    end)

    return chest
end

-- ═══════════════════════════════════════════════════════════
-- STEP ADVANCEMENT ENGINE
-- The core hybrid: event-driven with timer fallback
-- ═══════════════════════════════════════════════════════════

--- Send step data to client
local function sendStepToClient(player, stepIndex)
    local step = STEPS[stepIndex]
    if not step then return end
    fireClient(player, {
        action = step.action,
        prompt = step.prompt,
        stepId = step.id,
        stepNumber = stepIndex,
        totalSteps = #STEPS,
        duration = step.duration,
    })
end

--- Check if an event-driven step's condition is met
local function isStepEventSatisfied(player, stepIndex)
    local step = STEPS[stepIndex]
    if not step then return true end

    local state = playerState[player.UserId]
    if not state then return true end

    if step.id == "movement" then
        return state.hasMoved == true
    elseif step.id == "first_enemy" then
        return state.firstKillDone == true
    elseif step.id == "first_question" then
        return state.firstAnswerCorrect == true
    elseif step.id == "wave_clear" then
        return state.chestCollected == true
    end

    return true -- timer-based steps always satisfy
end

--- Advance to next step (called by event or timer)
local function advanceStep(player)
    local state = playerState[player.UserId]
    if not state or state.completed then return end

    state.currentStep = state.currentStep + 1
    state.stepStartTime = os.clock()

    if state.currentStep > #STEPS then
        -- FTUE complete
        state.completed = true
        markComplete(player)

        -- Grant completion reward
        grantRewards(player, CONFIG.CompletionReward)

        -- Squad bonus notification if applicable
        if FTUEController.HasSquadBonus() then
            task.delay(1, function()
                if player.Parent then
                    fireNotification(player, CONFIG.Prompts.SquadBonus)
                end
            end)
        end

        local elapsed = os.clock() - state.ftueStartTime
        print(string.format("[FTUEController] FTUE complete for %s in %.1fs (%d steps)",
            player.Name, elapsed, #STEPS))
        return
    end

    -- Send new step to client
    sendStepToClient(player, state.currentStep)

    -- Execute step-specific server action
    local step = STEPS[state.currentStep]
    if step.id == "weapon_equip" then
        executeWeaponEquip(player)
    elseif step.id == "first_enemy" then
        local enemy = spawnTutorialEnemy(player, state.createEnemyFn)
        if enemy then
            state.tutorialEnemy = enemy
            local humanoid = enemy:FindFirstChildOfClass("Humanoid")
            if humanoid then
                humanoid.Died:Connect(function()
                    if not state.firstKillDone then
                        state.firstKillDone = true
                        grantRewards(player, CONFIG.FirstKillReward)
                        -- Event-advance: kill triggers next step
                        advanceStep(player)
                    end
                end)
            end
        end
    elseif step.id == "wave_clear" then
        spawnChest(player)
    end
end

-- ═══════════════════════════════════════════════════════════
-- TICK — Timer fallback loop
-- Runs every frame via Heartbeat. Checks if event-driven
-- steps have timed out and forces advancement.
-- ═══════════════════════════════════════════════════════════

local tickConnection = nil

local function onTick()
    local now = os.clock()
    for userId, state in pairs(playerState) do
        if not state.completed and state.currentStep > 0 then
            local player = Players:GetPlayerByUserId(userId)
            if not player then
                playerState[userId] = nil
            else
                -- Global FTUE timeout
                if now - state.ftueStartTime > CONFIG.SkipAfterSeconds then
                    state.completed = true
                    markComplete(player)
                    fireClient(player, { action = "skip" })
                    print("[FTUEController] FTUE auto-skipped for " .. player.Name .. " (timeout)")
                else
                    -- Per-step fallback timeout
                    local step = STEPS[state.currentStep]
                    if step then
                        local stepElapsed = now - state.stepStartTime
                        if step.advanceOn == "timer" then
                            if stepElapsed >= step.duration then
                                advanceStep(player)
                            end
                        elseif step.advanceOn == "event" then
                            -- Check if event already fired
                            if isStepEventSatisfied(player, state.currentStep) then
                                advanceStep(player)
                            -- Fallback: force advance if timer exceeded
                            elseif stepElapsed >= step.fallbackTimeout then
                                print(string.format(
                                    "[FTUEController] Fallback advance: %s step '%s' (%.1fs timeout)",
                                    player.Name, step.id, stepElapsed))
                                advanceStep(player)
                            end
                        end
                    end
                end
            end
        end
    end
end

-- ═══════════════════════════════════════════════════════════
-- PUBLIC API — External event signals
-- Other systems call these to signal FTUE events
-- ═══════════════════════════════════════════════════════════

--- Signal that the player moved (called by movement detection system)
function FTUEController.SignalPlayerMoved(player)
    local state = playerState[player.UserId]
    if state and not state.completed then
        state.hasMoved = true
    end
end

--- Signal correct English answer (called by QuestionManager)
function FTUEController.SignalCorrectAnswer(player)
    local state = playerState[player.UserId]
    if state and not state.completed then
        state.firstAnswerCorrect = true
    end
end

--- Signal chest collected (called by chest proximity prompt — auto-wired above)
function FTUEController.SignalChestCollected(player)
    local state = playerState[player.UserId]
    if state and not state.completed then
        state.chestCollected = true
    end
end

--- Skip FTUE for a player (called by skip button or admin)
function FTUEController.SkipFTUE(player)
    local state = playerState[player.UserId]
    if not state then return end
    state.completed = true
    state.skipped = true
    markComplete(player)
    fireClient(player, { action = "skip" })
end

--- Check if player's FTUE is complete
function FTUEController.IsComplete(player)
    local state = playerState[player.UserId]
    return state and state.completed or false
end

--- Get current step info for a player
function FTUEController.GetCurrentStep(player)
    local state = playerState[player.UserId]
    if not state then return nil end
    return {
        stepIndex = state.currentStep,
        stepId = STEPS[state.currentStep] and STEPS[state.currentStep].id or "none",
        completed = state.completed,
        elapsed = os.clock() - state.ftueStartTime,
    }
end

--- Get tutorial enemy config (for external spawners)
function FTUEController.GetTutorialEnemyConfig()
    return CONFIG.TutorialEnemy
end

-- ═══════════════════════════════════════════════════════════
-- MAIN ENTRY POINT — Run FTUE for a player
-- ═══════════════════════════════════════════════════════════

--- Start the full FTUE for a new player.
--- @param player Player
--- @param createEnemyFn function|nil — GameMain's enemy spawner
--- @return boolean started — true if FTUE was started
function FTUEController.RunFTUE(player, createEnemyFn)
    if not FTUEController.IsNewPlayer(player) then
        return false
    end

    -- Wait for character if needed
    local character = player.Character
    if not character then
        character = player.CharacterAdded:Wait()
    end
    if not player.Parent then return false end

    -- Initialize state
    local now = os.clock()
    playerState[player.UserId] = {
        ftueStartTime = now,
        stepStartTime = now,
        currentStep = 0,
        completed = false,
        skipped = false,
        -- Event flags
        hasMoved = false,
        firstKillDone = false,
        firstAnswerCorrect = false,
        chestCollected = false,
        -- References
        createEnemyFn = createEnemyFn,
        tutorialEnemy = nil,
    }

    -- Set player attributes for other systems to read
    player:SetAttribute("InFTUE", true)
    player:SetAttribute("FTUECompleted", false)

    -- Start the step engine
    advanceStep(player)

    print("[FTUEController] FTUE started for " .. player.Name)
    return true
end

-- ═══════════════════════════════════════════════════════════
-- INIT — Module setup
-- ═══════════════════════════════════════════════════════════

function FTUEController.Init()
    -- Ensure remote exists
    ensureRemote()

    -- Start tick loop for timer fallbacks
    if not tickConnection then
        -- Use 4Hz tick instead of every frame (performance)
        local accumulator = 0
        tickConnection = RunService.Heartbeat:Connect(function(dt)
            accumulator = accumulator + dt
            if accumulator >= 0.25 then
                accumulator = 0
                onTick()
            end
        end)
    end

    -- Listen for client-side skip requests
    local remote = ensureRemote()
    if remote then
        remote.OnServerEvent:Connect(function(player, data)
            if type(data) == "table" and data.action == "skip" then
                FTUEController.SkipFTUE(player)
            elseif type(data) == "table" and data.action == "moved" then
                FTUEController.SignalPlayerMoved(player)
            end
        end)
    end

    -- Cleanup on player leave
    Players.PlayerRemoving:Connect(function(player)
        playerState[player.UserId] = nil
    end)

    print("══════════════════════════════════════════════")
    print("⚡ FTUEController v2.0 — Hybrid Timer+Step")
    print("  Merged: FTUEManager + FTUEWiring")
    print("  Solo-first | Gospel 444 | NO BLUE")
    print("  8 Steps | 90s Max | Event+Fallback")
    print("  Pipeline: Stage 1 of 20 — Train 6-7")
    print("══════════════════════════════════════════════")

    return true
end

-- ═══════════════════════════════════════════════════════════
-- CLEANUP
-- ═══════════════════════════════════════════════════════════

function FTUEController.Shutdown()
    if tickConnection then
        tickConnection:Disconnect()
        tickConnection = nil
    end
    playerState = {}
end

return FTUEController
