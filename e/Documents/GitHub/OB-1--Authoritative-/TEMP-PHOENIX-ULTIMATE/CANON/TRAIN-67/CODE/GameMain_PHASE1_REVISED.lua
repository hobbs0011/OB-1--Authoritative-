--[[
═══════════════════════════════════════════════════════════
SURVIVE A BRAINROT — PHASE 1 DEMO (REVISED + HARDENED)
Script: GameMain_PHASE1_REVISED.lua
Type: Server Script (ServerScriptService)
Purpose: Complete Phase 1 Demo — 3-Day Train Survival
Version: 1.1 HARDENED (100-Point Audit Patches Applied)
Date: February 9, 2026 | Patched: March 25, 2026
Gospel 444 Compliant — NO BLUE
Phoenix Rising Gaming Division
═══════════════════════════════════════════════════════════
PATCHES APPLIED:
  FIX #4:  cleanupEnemies() global → local (forward declared)
  FIX #5:  Enemy cap MAX_ACTIVE_ENEMIES = 30
  FIX #6:  Town zombie cap MAX_TOWN_ZOMBIES = 15
  FIX #7:  SetPrimaryPartCFrame → PivotTo (5 locations)
  FIX #15: Damage cooldown (1s immunity frames)
  FIX #17: tick() → os.clock() (deprecated API)
═══════════════════════════════════════════════════════════
]]

-- SERVICES
local Players = game:GetService("Players")
local ServerStorage = game:GetService("ServerStorage")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")
local Workspace = game:GetService("Workspace")

-- ══════════════════════════════════════════════════════════
-- CONFIGURATION
-- ══════════════════════════════════════════════════════════
local Config = {
	Colors = {
		Purple = Color3.fromRGB(168, 85, 247),
		Gold = Color3.fromRGB(245, 158, 11),
		Dark = Color3.fromRGB(15, 15, 26),
		Rust = Color3.fromRGB(146, 64, 14),
		Copper = Color3.fromRGB(180, 83, 9),
		White = Color3.fromRGB(255, 255, 255),
		Red = Color3.fromRGB(239, 68, 68),
	},
	RequiredPlayers = 5,
	CountdownTime = 10,
	SquadBonusXP = 0.30,
	Days = 3,
	WavesPerDay = 3,
	EnemiesPerWave = 10,
	WaveDelay = 5,
	SpawnInterval = 1.5,
	MaxActiveEnemies = 30, -- FIX #5: Prevent memory exhaustion
	DamageCooldown = 1.0, -- FIX #15: Seconds of immunity after hit
	Enemies = {
		SkibidiShambler = { Health = 100, Speed = 12, Damage = 15, Scale = 1.0, XP = 10 },
		SigmaWalker = { Health = 200, Speed = 8, Damage = 25, Scale = 1.2, XP = 25 },
	},
	Boss = {
		Name = "Baron Skibidi", Title = "First Rizzlord",
		Health = 2500, Speed = 10, Damage = 50, Scale = 1.5, XP = 500,
		Attacks = {
			Charge = { Cooldown = 8, Damage = 75, Range = 50, TelegraphTime = 2, BurstSpeed = 30 },
			GroundStomp = { Cooldown = 12, Damage = 40, Range = 20 },
			SummonAdds = { Cooldown = 15, AddCount = 4 },
		},
	},
	Town = {
		TimerDuration = 300,
		RequiredBarrels = 3,
		ZombieSpawnRate = 3,
		MaxZombies = 15, -- FIX #6: Cap town zombie spawner
	},
	Train = { Speed = 30, MoveDistance = 200 },
	Cliffhanger = { Phase1Duration = 4, Phase2Duration = 4, Phase3Duration = 4, Phase4Duration = 10 },
}

-- ══════════════════════════════════════════════════════════
-- REMOTE EVENTS SETUP
-- ══════════════════════════════════════════════════════════
local RemoteEvents = {}
local eventNames = {
	"UpdateLobby", "GameStartCountdown", "GameStarted",
	"UpdateWave", "UpdateDay", "WaveComplete", "DayComplete",
	"UpdateHealth", "EnemyDied", "PlayerDamaged",
	"BossSpawned", "UpdateBossHealth", "BossDefeated",
	"TownEntered", "UpdateTownTimer", "UpdateFuelCount", "TownComplete",
	"CliffhangerPhase", "GameOver",
	"ShowNotification", "UpdateSquadBonus",
	"ScreenShake", "PurpleFlash",
}

local remoteFolder = Instance.new("Folder")
remoteFolder.Name = "GameRemotes"
remoteFolder.Parent = ReplicatedStorage

for _, name in ipairs(eventNames) do
	local remote = Instance.new("RemoteEvent")
	remote.Name = name
	remote.Parent = remoteFolder
	RemoteEvents[name] = remote
end

-- ══════════════════════════════════════════════════════════
-- GAME STATE
-- ══════════════════════════════════════════════════════════
local GameState = {
	Phase = "Lobby",
	CurrentDay = 0,
	CurrentWave = 0,
	PlayersReady = {},
	ActiveEnemies = {},
	BossInstance = nil,
	FuelCollected = 0,
	TownTimerActive = false,
	GameActive = false,
}

-- FIX #4: Forward declaration for local scoping
local cleanupEnemies

-- ══════════════════════════════════════════════════════════
-- REFERENCES
-- ══════════════════════════════════════════════════════════
local trainModel = Workspace:FindFirstChild("TrainModel")
local lobbySpawn = Workspace:FindFirstChild("Lobby") and Workspace.Lobby:FindFirstChild("SpawnPoint")
local townSpawn = Workspace:FindFirstChild("TownSpawn")
local fuelBarrels = Workspace:FindFirstChild("FuelBarrels")
local spawnPoints = Workspace:FindFirstChild("SpawnPoints")
local enemyModels = ServerStorage:FindFirstChild("EnemyModels")

-- ══════════════════════════════════════════════════════════
-- UTILITY FUNCTIONS
-- ══════════════════════════════════════════════════════════
local function fireAllClients(eventName, ...)
	if RemoteEvents[eventName] then
		RemoteEvents[eventName]:FireAllClients(...)
	end
end

local function getAlivePlayers()
	local alive = {}
	for _, player in ipairs(Players:GetPlayers()) do
		local character = player.Character
		if character then
			local humanoid = character:FindFirstChildOfClass("Humanoid")
			if humanoid and humanoid.Health > 0 then
				table.insert(alive, player)
			end
		end
	end
	return alive
end

local function getNearestPlayer(position)
	local nearest = nil
	local nearestDist = math.huge
	for _, player in ipairs(getAlivePlayers()) do
		local char = player.Character
		if char and char:FindFirstChild("HumanoidRootPart") then
			local dist = (char.HumanoidRootPart.Position - position).Magnitude
			if dist < nearestDist then
				nearest = player
				nearestDist = dist
			end
		end
	end
	return nearest, nearestDist
end

local function getRandomSpawnPoint()
	if not spawnPoints then return Vector3.new(0, 10, 50) end
	local children = spawnPoints:GetChildren()
	if #children == 0 then return Vector3.new(0, 10, 50) end
	return children[math.random(#children)].Position
end

-- ══════════════════════════════════════════════════════════
-- LOBBY SYSTEM (5-Player Gate)
-- ══════════════════════════════════════════════════════════
local function updateLobbyUI()
	local playerCount = #Players:GetPlayers()
	fireAllClients("UpdateLobby", playerCount, Config.RequiredPlayers)
end

local function checkLobbyReady()
	if GameState.Phase ~= "Lobby" then return end
	if #Players:GetPlayers() >= Config.RequiredPlayers then
		GameState.Phase = "Countdown"
		fireAllClients("ShowNotification", "\xF0\x9F\x9A\x82 FULL TRAIN! Game starting...")
		for i = Config.CountdownTime, 1, -1 do
			if #Players:GetPlayers() < Config.RequiredPlayers then
				GameState.Phase = "Lobby"
				fireAllClients("ShowNotification", "\xE2\x9A\xA0\xEF\xB8\x8F Player left! Waiting for full train...")
				updateLobbyUI()
				return
			end
			fireAllClients("GameStartCountdown", i)
			task.wait(1)
		end
		startGame()
	end
end

-- ══════════════════════════════════════════════════════════
-- ENEMY SPAWNING & AI
-- ══════════════════════════════════════════════════════════
local function createEnemy(enemyType, spawnPosition)
	-- FIX #5: Enemy cap to prevent memory exhaustion
	if #GameState.ActiveEnemies >= Config.MaxActiveEnemies then return nil end

	if not enemyModels then
		warn("[GameMain] EnemyModels folder not found in ServerStorage")
		return nil
	end
	local template = enemyModels:FindFirstChild(enemyType)
	if not template then
		warn("[GameMain] Enemy model not found: " .. enemyType)
		return nil
	end
	local stats = Config.Enemies[enemyType]
	if not stats then return nil end

	local enemy = template:Clone()
	enemy.Name = enemyType .. "_" .. tostring(os.clock()) -- FIX #17: tick() deprecated

	local humanoid = enemy:FindFirstChildOfClass("Humanoid")
	if humanoid then
		humanoid.MaxHealth = stats.Health
		humanoid.Health = stats.Health
		humanoid.WalkSpeed = stats.Speed
	end

	if stats.Scale ~= 1.0 then
		for _, part in ipairs(enemy:GetDescendants()) do
			if part:IsA("BasePart") then
				part.Size = part.Size * stats.Scale
			end
		end
	end

	-- FIX #7: PivotTo replaces deprecated SetPrimaryPartCFrame
	local rootPart = enemy:FindFirstChild("HumanoidRootPart")
	if rootPart then
		enemy:PivotTo(CFrame.new(spawnPosition))
	end

	enemy.Parent = Workspace
	table.insert(GameState.ActiveEnemies, enemy)

	-- AI: Chase nearest player
	task.spawn(function()
		while enemy.Parent and humanoid and humanoid.Health > 0 do
			local target, dist = getNearestPlayer(rootPart.Position)
			if target and target.Character then
				local targetRoot = target.Character:FindFirstChild("HumanoidRootPart")
				if targetRoot then
					humanoid:MoveTo(targetRoot.Position)
				end
				-- FIX #15: Damage cooldown (1s immunity frames)
				if dist and dist < 5 then
					local targetHumanoid = target.Character:FindFirstChildOfClass("Humanoid")
					if targetHumanoid then
						local lastHit = target.Character:GetAttribute("LastHitTime") or 0
						if (os.clock() - lastHit) >= Config.DamageCooldown then
							targetHumanoid:TakeDamage(stats.Damage)
							target.Character:SetAttribute("LastHitTime", os.clock())
							fireAllClients("PlayerDamaged", target.Name, stats.Damage)
						end
					end
				end
			end
			task.wait(0.5)
		end
	end)

	humanoid.Died:Connect(function()
		fireAllClients("EnemyDied", enemyType, stats.XP)
		task.wait(2)
		if enemy.Parent then enemy:Destroy() end
		for i, e in ipairs(GameState.ActiveEnemies) do
			if e == enemy then
				table.remove(GameState.ActiveEnemies, i)
				break
			end
		end
	end)

	return enemy
end

local function spawnWave(waveNumber, day)
	local enemyCount = Config.EnemiesPerWave + (day - 1) * 3
	local enemyTypes = {"SkibidiShambler"}
	if day >= 2 or waveNumber >= 2 then
		table.insert(enemyTypes, "SigmaWalker")
	end
	fireAllClients("ShowNotification", string.format("\xE2\x9A\xA0\xEF\xB8\x8F WAVE %d INCOMING!", waveNumber))
	task.wait(2)
	for i = 1, enemyCount do
		local enemyType = enemyTypes[math.random(#enemyTypes)]
		local spawnPos = getRandomSpawnPoint()
		createEnemy(enemyType, spawnPos)
		task.wait(Config.SpawnInterval)
	end
end

local function waitForWaveClear()
	while #GameState.ActiveEnemies > 0 do
		task.wait(0.5)
	end
end

-- ══════════════════════════════════════════════════════════
-- TRAIN MOVEMENT
-- ══════════════════════════════════════════════════════════
local function moveTrain(distance)
	if not trainModel or not trainModel.PrimaryPart then return end
	local startCF = trainModel.PrimaryPart.CFrame
	local endCF = startCF + Vector3.new(0, 0, -distance)
	local duration = distance / Config.Train.Speed
	local tweenInfo = TweenInfo.new(duration, Enum.EasingStyle.Linear)
	local tween = TweenService:Create(trainModel.PrimaryPart, tweenInfo, { CFrame = endCF })
	tween:Play()
	tween.Completed:Wait()
end

-- ══════════════════════════════════════════════════════════
-- TOWN SYSTEM — RUSTED DEPOT (Day 2)
-- ══════════════════════════════════════════════════════════
local function teleportPlayersToTown()
	if not townSpawn then warn("[GameMain] TownSpawn not found") return end
	for _, player in ipairs(Players:GetPlayers()) do
		local character = player.Character
		if character and character:FindFirstChild("HumanoidRootPart") then
			-- FIX #7: PivotTo replaces SetPrimaryPartCFrame
			character:PivotTo(CFrame.new(townSpawn.Position + Vector3.new(math.random(-10, 10), 5, math.random(-10, 10))))
		end
	end
end

local function teleportPlayersToTrain()
	if not trainModel or not trainModel.PrimaryPart then return end
	for _, player in ipairs(Players:GetPlayers()) do
		local character = player.Character
		if character and character:FindFirstChild("HumanoidRootPart") then
			-- FIX #7: PivotTo replaces SetPrimaryPartCFrame
			character:PivotTo(CFrame.new(trainModel.PrimaryPart.Position + Vector3.new(math.random(-5, 5), 5, math.random(-5, 5))))
		end
	end
end

local function setupFuelBarrels()
	GameState.FuelCollected = 0
	if not fuelBarrels then warn("[GameMain] FuelBarrels folder not found") return end
	for _, barrel in ipairs(fuelBarrels:GetChildren()) do
		local prompt = barrel:FindFirstChildOfClass("ProximityPrompt")
		if prompt then
			prompt.Enabled = true
			if barrel:GetAttribute("Connected") then continue end
			barrel:SetAttribute("Connected", true)
			prompt.Triggered:Connect(function(player)
				if not prompt.Enabled then return end
				prompt.Enabled = false
				barrel.Transparency = 0.8
				GameState.FuelCollected = GameState.FuelCollected + 1
				fireAllClients("UpdateFuelCount", GameState.FuelCollected, Config.Town.RequiredBarrels)
				fireAllClients("ShowNotification",
					string.format("\xE2\x9B\xBD %s collected barrel %d/%d!",
						player.Name, GameState.FuelCollected, Config.Town.RequiredBarrels))
				if GameState.FuelCollected >= Config.Town.RequiredBarrels then
					GameState.TownTimerActive = false
					fireAllClients("TownComplete", true)
					fireAllClients("ShowNotification", "\xE2\x9C\x85 ALL FUEL COLLECTED! Boss incoming...")
					task.wait(3)
					spawnBoss()
				end
			end)
		end
	end
end

local function runTownPhase()
	GameState.Phase = "Town"
	fireAllClients("TownEntered")
	fireAllClients("ShowNotification", "\xF0\x9F\x8F\x9A\xEF\xB8\x8F RUSTED DEPOT \xE2\x80\x94 Collect 3 fuel barrels!")
	teleportPlayersToTown()
	setupFuelBarrels()

	GameState.TownTimerActive = true
	local timeRemaining = Config.Town.TimerDuration

	-- FIX #6: Town zombie spawner with cap
	task.spawn(function()
		local townZombieCount = 0
		while GameState.TownTimerActive and GameState.Phase == "Town" do
			if townSpawn and townZombieCount < Config.Town.MaxZombies then
				local spawnPos = townSpawn.Position + Vector3.new(math.random(-30, 30), 0, math.random(-30, 30))
				local enemy = createEnemy("SkibidiShambler", spawnPos)
				if enemy then townZombieCount = townZombieCount + 1 end
			end
			task.wait(Config.Town.ZombieSpawnRate)
		end
	end)

	while timeRemaining > 0 and GameState.TownTimerActive do
		fireAllClients("UpdateTownTimer", timeRemaining)
		task.wait(1)
		timeRemaining = timeRemaining - 1
	end

	if GameState.FuelCollected < Config.Town.RequiredBarrels then
		GameState.TownTimerActive = false
		fireAllClients("TownComplete", false)
		fireAllClients("ShowNotification", "\xE2\x8F\xB0 TIME UP! Leaving with reduced supplies...")
		task.wait(3)
		cleanupEnemies()
		teleportPlayersToTrain()
	end
end

-- ══════════════════════════════════════════════════════════
-- BOSS SYSTEM — BARON SKIBIDI (First Rizzlord)
-- ══════════════════════════════════════════════════════════
local function spawnBoss()
	GameState.Phase = "Boss"
	local bossConfig = Config.Boss
	if not enemyModels then return end
	local bossTemplate = enemyModels:FindFirstChild("SigmaWalker")
	if not bossTemplate then warn("[GameMain] SigmaWalker template not found for boss") return end

	local boss = bossTemplate:Clone()
	boss.Name = "BaronSkibidi"
	for _, part in ipairs(boss:GetDescendants()) do
		if part:IsA("BasePart") then
			part.Size = part.Size * bossConfig.Scale
			part.Color = Config.Colors.Purple
		end
	end

	local humanoid = boss:FindFirstChildOfClass("Humanoid")
	if humanoid then
		humanoid.MaxHealth = bossConfig.Health
		humanoid.Health = bossConfig.Health
		humanoid.WalkSpeed = bossConfig.Speed
	end

	local spawnPos = townSpawn and townSpawn.Position + Vector3.new(40, 5, 0) or Vector3.new(240, 5, 0)
	-- FIX #7: PivotTo replaces SetPrimaryPartCFrame
	boss:PivotTo(CFrame.new(spawnPos))
	boss.Parent = Workspace
	GameState.BossInstance = boss

	fireAllClients("BossSpawned", bossConfig.Name, bossConfig.Title, bossConfig.Health)
	fireAllClients("ShowNotification", "\xF0\x9F\x91\x91 BARON SKIBIDI \xE2\x80\x94 FIRST RIZZLORD HAS ARRIVED!")

	local lastCharge = 0
	local lastStomp = 0
	local lastSummon = 0
	local rootPart = boss:FindFirstChild("HumanoidRootPart")

	task.spawn(function()
		while boss.Parent and humanoid and humanoid.Health > 0 do
			local now = os.clock() -- FIX #17: tick() deprecated
			-- FIX #16: nil guard on rootPart
			if not rootPart or not rootPart.Parent then break end
			local target, dist = getNearestPlayer(rootPart.Position)

			if target and target.Character then
				local targetRoot = target.Character:FindFirstChild("HumanoidRootPart")

				-- CHARGE ATTACK
				if dist and dist < bossConfig.Attacks.Charge.Range
					and (now - lastCharge) >= bossConfig.Attacks.Charge.Cooldown then
					lastCharge = now
					fireAllClients("ShowNotification", "\xE2\x9A\xA1 BARON SKIBIDI CHARGES!")
					fireAllClients("PurpleFlash")
					task.wait(bossConfig.Attacks.Charge.TelegraphTime)
					humanoid.WalkSpeed = bossConfig.Attacks.Charge.BurstSpeed
					if targetRoot then humanoid:MoveTo(targetRoot.Position) end
					task.wait(1)
					humanoid.WalkSpeed = bossConfig.Speed
					for _, p in ipairs(getAlivePlayers()) do
						local pc = p.Character
						if pc and pc:FindFirstChild("HumanoidRootPart") then
							local pDist = (pc.HumanoidRootPart.Position - rootPart.Position).Magnitude
							if pDist < 10 then
								local ph = pc:FindFirstChildOfClass("Humanoid")
								if ph then ph:TakeDamage(bossConfig.Attacks.Charge.Damage) end
							end
						end
					end

				-- GROUND STOMP
				elseif dist and dist < bossConfig.Attacks.GroundStomp.Range
					and (now - lastStomp) >= bossConfig.Attacks.GroundStomp.Cooldown then
					lastStomp = now
					fireAllClients("ShowNotification", "\xF0\x9F\x92\xA5 GROUND STOMP!")
					fireAllClients("ScreenShake", 0.5)
					for _, p in ipairs(getAlivePlayers()) do
						local pc = p.Character
						if pc and pc:FindFirstChild("HumanoidRootPart") then
							local pDist = (pc.HumanoidRootPart.Position - rootPart.Position).Magnitude
							if pDist < bossConfig.Attacks.GroundStomp.Range then
								local ph = pc:FindFirstChildOfClass("Humanoid")
								if ph then ph:TakeDamage(bossConfig.Attacks.GroundStomp.Damage) end
								local direction = (pc.HumanoidRootPart.Position - rootPart.Position).Unit
								pc.HumanoidRootPart.Velocity = direction * 50 + Vector3.new(0, 30, 0)
							end
						end
					end

				-- SUMMON ADDS
				elseif (now - lastSummon) >= bossConfig.Attacks.SummonAdds.Cooldown then
					lastSummon = now
					fireAllClients("ShowNotification", "\xF0\x9F\xA7\x9F BARON SUMMONS REINFORCEMENTS!")
					for i = 1, bossConfig.Attacks.SummonAdds.AddCount do
						local angle = (i / bossConfig.Attacks.SummonAdds.AddCount) * math.pi * 2
						local offset = Vector3.new(math.cos(angle) * 10, 0, math.sin(angle) * 10)
						createEnemy("SkibidiShambler", rootPart.Position + offset)
					end
				else
					if targetRoot then humanoid:MoveTo(targetRoot.Position) end
				end
			end

			fireAllClients("UpdateBossHealth", humanoid.Health, humanoid.MaxHealth)
			task.wait(0.3)
		end
	end)

	humanoid.Died:Connect(function()
		GameState.BossInstance = nil
		fireAllClients("BossDefeated", bossConfig.Name)
		fireAllClients("ShowNotification", "\xF0\x9F\x8F\x86 BARON SKIBIDI DEFEATED! +" .. bossConfig.XP .. " XP")
		cleanupEnemies()
		task.wait(5)
		teleportPlayersToTrain()
		GameState.Phase = "Playing"
	end)
end

-- ══════════════════════════════════════════════════════════
-- CLEANUP — FIX #4: local (forward declared)
-- ══════════════════════════════════════════════════════════
cleanupEnemies = function()
	for _, enemy in ipairs(GameState.ActiveEnemies) do
		if enemy.Parent then enemy:Destroy() end
	end
	GameState.ActiveEnemies = {}
end

-- ══════════════════════════════════════════════════════════
-- CLIFFHANGER SYSTEM (Day 3 End)
-- ══════════════════════════════════════════════════════════
local function runCliffhanger()
	GameState.Phase = "Cliffhanger"
	local CH = Config.Cliffhanger

	fireAllClients("CliffhangerPhase", 1,
		"Three days survived... But this is only the beginning.", CH.Phase1Duration)
	task.wait(CH.Phase1Duration)

	fireAllClients("ScreenShake", 2)
	fireAllClients("CliffhangerPhase", 2,
		"The ground trembles... Something MASSIVE approaches from the west...", CH.Phase2Duration)
	task.wait(CH.Phase2Duration)

	fireAllClients("PurpleFlash")
	fireAllClients("CliffhangerPhase", 3,
		"A shadow blocks out the sun. The smell of corn and decay fills the air...", CH.Phase3Duration)
	task.wait(CH.Phase3Duration)

	fireAllClients("CliffhangerPhase", 4,
		"\240\159\140\189 BARON CORN KING AWAKENS \240\159\140\189\n\nTO BE CONTINUED...\n99 days to Sanctuary. Can you survive?",
		CH.Phase4Duration)
	task.wait(CH.Phase4Duration)

	GameState.Phase = "Complete"
	fireAllClients("GameOver", true)
end

-- ══════════════════════════════════════════════════════════
-- MAIN GAME LOOP
-- ══════════════════════════════════════════════════════════
function startGame()
	GameState.Phase = "Playing"
	GameState.GameActive = true
	fireAllClients("GameStarted")
	fireAllClients("UpdateSquadBonus", true, Config.SquadBonusXP)
	fireAllClients("ShowNotification", "\xF0\x9F\x9A\x82 TRAIN 6-7 DEPARTING! Survive the Brain-Rot!")

	for day = 1, Config.Days do
		GameState.CurrentDay = day
		fireAllClients("UpdateDay", day, Config.Days)
		fireAllClients("ShowNotification", string.format("\xE2\x98\x80\xEF\xB8\x8F DAY %d BEGINS", day))
		task.wait(3)

		for wave = 1, Config.WavesPerDay do
			GameState.CurrentWave = wave
			fireAllClients("UpdateWave", wave, Config.WavesPerDay)
			spawnWave(wave, day)
			waitForWaveClear()
			fireAllClients("WaveComplete", wave)
			fireAllClients("ShowNotification", string.format("\xE2\x9C\x85 Wave %d cleared!", wave))
			task.wait(Config.WaveDelay)
		end

		fireAllClients("DayComplete", day)

		if day == 2 then
			fireAllClients("ShowNotification", "\xF0\x9F\x9B\x91 Train stopping at Rusted Depot...")
			task.wait(3)
			runTownPhase()
			while GameState.Phase == "Boss" or GameState.Phase == "Town" do
				task.wait(0.5)
			end
			fireAllClients("ShowNotification", "\xF0\x9F\x9A\x82 Back on the train! Day 3 ahead...")
			task.wait(3)
		end

		if day == 3 then
			runCliffhanger()
			return
		end

		if day < Config.Days then
			moveTrain(Config.Train.MoveDistance)
			task.wait(2)
		end
	end
end

-- ══════════════════════════════════════════════════════════
-- PLAYER CONNECTIONS
-- ══════════════════════════════════════════════════════════
Players.PlayerAdded:Connect(function(player)
	updateLobbyUI()
	if GameState.Phase == "Lobby" then checkLobbyReady() end
	player.CharacterAdded:Connect(function(character)
		local humanoid = character:WaitForChild("Humanoid")
		humanoid.Died:Connect(function()
			fireAllClients("ShowNotification", "\xF0\x9F\x92\x80 " .. player.Name .. " was eliminated!")
			task.wait(5)
			player:LoadCharacter()
		end)
	end)
end)

Players.PlayerRemoving:Connect(function(player)
	updateLobbyUI()
end)

-- ══════════════════════════════════════════════════════════
-- INITIALIZATION
-- ══════════════════════════════════════════════════════════
print("══════════════════════════════════════════════")
print("\xF0\x9F\x9A\x82 TRAIN 6-7: SURVIVE A BRAINROT")
print("Phase 1 Demo — REVISED + HARDENED v1.1")
print("Waiting for " .. Config.RequiredPlayers .. " players...")
print("Gospel 444 Compliant | NO BLUE | Fail-Closed")
print("Phoenix Rising Gaming Division")
print("══════════════════════════════════════════════")

GameState.Phase = "Lobby"
updateLobbyUI()
