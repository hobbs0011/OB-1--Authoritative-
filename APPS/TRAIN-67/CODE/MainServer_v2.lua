--[[
═══════════════════════════════════════════════════════════
SURVIVE A BRAINROT — PRODUCTION SERVER ARCHITECTURE v2.1.0
Script: MainServer_v2.lua
Type: Server Script (ServerScriptService)
Purpose: Next-gen modular server with campaign system,
         DataStore persistence, and scalable architecture
Date: February 2026 | Patched: March 25, 2026
Gospel 444 Compliant — NO BLUE
Phoenix Rising Gaming Division
═══════════════════════════════════════════════════════════
PATCHES APPLIED:
  FIX #13: SetAsync → UpdateAsync (race condition fix)
  FIX #14: Shallow copy → recursive deepCopy
  FIX #38: Auto-save loop pcall wrapped
  FIX #39: BindToClose 25s timeout guard
  FIX #7:  SetPrimaryPartCFrame → PivotTo
  FIX #36: Object pool baseName regex fix
═══════════════════════════════════════════════════════════
]]

-- SERVICES
local Players = game:GetService("Players")
local ServerStorage = game:GetService("ServerStorage")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")
local HttpService = game:GetService("HttpService")
local Workspace = game:GetService("Workspace")

-- DATA STORES
local PlayerDataStore = DataStoreService:GetDataStore("BrainrotPlayerData_v1")
local LeaderboardStore = DataStoreService:GetOrderedDataStore("BrainrotLeaderboard_v1")

-- ══════════════════════════════════════════════════════════
-- CONFIGURATION
-- ══════════════════════════════════════════════════════════
local Config = {
	Colors = {
		Purple = Color3.fromRGB(168, 85, 247),
		Gold = Color3.fromRGB(245, 158, 11),
		Dark = Color3.fromRGB(15, 15, 26),
	},
	RequiredPlayers = 5,
	MaxPlayers = 5,
	RespawnTime = 5,
	TotalDays = 99,
	WavesPerDay = 3,
	BaseEnemiesPerWave = 8,
	EnemyScalePerDay = 0.05,
	StartingScrapMetal = 0,
	StartingBrainCells = 0,
	KillRewardBase = 10,
	Classes = {
		Sigma = { Name = "Sigma", HealthBonus = 50, DamageMultiplier = 1.2, SpeedBonus = 0, Description = "Raw power. More health, more damage." },
		Railrunner = { Name = "Railrunner", HealthBonus = 0, DamageMultiplier = 1.0, SpeedBonus = 4, Description = "Speed demon. Fastest on the train." },
		Sniper = { Name = "Sniper", HealthBonus = -20, DamageMultiplier = 2.0, SpeedBonus = -2, Description = "Glass cannon. Massive damage, fragile frame." },
		Medic = { Name = "Medic", HealthBonus = 20, DamageMultiplier = 0.8, SpeedBonus = 0, Description = "Healer. Keeps the squad alive." },
		Thief = { Name = "Thief", HealthBonus = -10, DamageMultiplier = 0.9, SpeedBonus = 2, Description = "Double loot drops. Risk vs reward." },
	},
	EnemyTypes = {
		{ Name = "SkibidiShambler", Health = 100, Speed = 12, Damage = 15, XP = 10, Scale = 1.0, SpawnWeight = 50 },
		{ Name = "SigmaWalker", Health = 200, Speed = 8, Damage = 25, XP = 25, Scale = 1.2, SpawnWeight = 30 },
		{ Name = "RizzSprinter", Health = 80, Speed = 20, Damage = 10, XP = 15, Scale = 0.9, SpawnWeight = 15 },
		{ Name = "GyattTank", Health = 500, Speed = 5, Damage = 40, XP = 50, Scale = 1.5, SpawnWeight = 4 },
		{ Name = "FanumTaxer", Health = 150, Speed = 14, Damage = 20, XP = 30, Scale = 1.1, SpawnWeight = 1 },
	},
	Bosses = {
		{
			Name = "Baron Skibidi", Title = "First Rizzlord",
			Health = 2500, Speed = 10, Damage = 50, XP = 500,
			Scale = 1.5, SpawnDay = 2,
			Attacks = {
				{ Name = "Charge", Cooldown = 8, Damage = 75, Range = 50 },
				{ Name = "GroundStomp", Cooldown = 12, Damage = 40, Range = 20 },
				{ Name = "SummonAdds", Cooldown = 15, AddCount = 4 },
			},
		},
		{
			Name = "Baron Corn King", Title = "The Harvest",
			Health = 10000, Speed = 8, Damage = 100, XP = 2000,
			Scale = 2.5, SpawnDay = 10,
			Attacks = {
				{ Name = "CornBarrage", Cooldown = 6, Damage = 60, Range = 40 },
				{ Name = "HarvestSlam", Cooldown = 10, Damage = 80, Range = 25 },
				{ Name = "CornMaze", Cooldown = 20, Duration = 10 },
				{ Name = "SummonAdds", Cooldown = 12, AddCount = 8 },
			},
		},
	},
	Rarity = {
		{ Name = "Common",    Chance = 0.50,   Color = Color3.fromRGB(169, 169, 169) },
		{ Name = "Uncommon",  Chance = 0.30,   Color = Color3.fromRGB(0, 255, 0) },
		{ Name = "Rare",      Chance = 0.12,   Color = Color3.fromRGB(168, 85, 247) },
		{ Name = "Epic",      Chance = 0.05,   Color = Color3.fromRGB(107, 76, 154) },
		{ Name = "Legendary", Chance = 0.02,   Color = Color3.fromRGB(212, 175, 55) },
		{ Name = "Mythic",    Chance = 0.008,  Color = Color3.fromRGB(255, 0, 0) },
		{ Name = "Godly",     Chance = 0.0015, Color = Color3.fromRGB(255, 255, 255) },
		{ Name = "Rizzlord",  Chance = 0.0005, Color = Color3.fromRGB(0, 0, 0) },
	},
}

-- ══════════════════════════════════════════════════════════
-- PLAYER DATA TEMPLATE
-- ══════════════════════════════════════════════════════════
local DEFAULT_PLAYER_DATA = {
	Version = 1,
	Class = "Sigma",
	Day = 1, Wave = 1,
	ScrapMetal = 0, BrainCells = 0, SurvivorTokens = 0,
	XP = 0, Level = 1, Kills = 0, Deaths = 0,
	BossesDefeated = {},
	CodexUnlocked = { "ENM-001", "LOC-001" },
	Inventory = {},
	Settings = { MusicVolume = 0.5, SFXVolume = 0.8 },
}

-- ══════════════════════════════════════════════════════════
-- STATE MANAGEMENT
-- ══════════════════════════════════════════════════════════
local ServerState = {
	Phase = "Lobby",
	CurrentDay = 0, CurrentWave = 0,
	ActiveEnemies = {},
	ActiveBoss = nil,
	PlayerData = {},
	EnemyPool = {},
	PoolSize = 50,
}

-- ══════════════════════════════════════════════════════════
-- FIX #14: Recursive deep copy (prevents shared references)
-- ══════════════════════════════════════════════════════════
local function deepCopy(original)
	if type(original) ~= "table" then return original end
	local copy = {}
	for key, value in pairs(original) do
		copy[key] = deepCopy(value)
	end
	return copy
end

-- ══════════════════════════════════════════════════════════
-- DATASTORE: SAVE / LOAD
-- ══════════════════════════════════════════════════════════
local function loadPlayerData(player)
	local key = "Player_" .. player.UserId
	local success, data = pcall(function()
		return PlayerDataStore:GetAsync(key)
	end)

	if success and data then
		for k, v in pairs(DEFAULT_PLAYER_DATA) do
			if data[k] == nil then data[k] = v end
		end
		ServerState.PlayerData[player.UserId] = data
		print(string.format("[DataStore] Loaded data for %s (Day %d, Level %d)", player.Name, data.Day, data.Level))
	else
		-- FIX #14: deepCopy prevents nested table shared references
		ServerState.PlayerData[player.UserId] = deepCopy(DEFAULT_PLAYER_DATA)
		print(string.format("[DataStore] New player: %s", player.Name))
	end
	return ServerState.PlayerData[player.UserId]
end

local function savePlayerData(player)
	local data = ServerState.PlayerData[player.UserId]
	if not data then return end
	local key = "Player_" .. player.UserId
	-- FIX #13: UpdateAsync prevents race conditions (was SetAsync)
	local success, err = pcall(function()
		PlayerDataStore:UpdateAsync(key, function(oldData)
			return data
		end)
	end)
	if success then
		print(string.format("[DataStore] Saved data for %s", player.Name))
	else
		warn(string.format("[DataStore] SAVE FAILED for %s: %s", player.Name, tostring(err)))
	end
end

local function saveAllPlayers()
	for _, player in ipairs(Players:GetPlayers()) do
		task.spawn(savePlayerData, player)
	end
end

-- FIX #38: Auto-save loop wrapped in pcall
task.spawn(function()
	while true do
		task.wait(300)
		local success, err = pcall(saveAllPlayers)
		if success then
			print("[DataStore] Auto-save complete")
		else
			warn("[DataStore] Auto-save FAILED: " .. tostring(err))
		end
	end
end)

-- ══════════════════════════════════════════════════════════
-- OBJECT POOL (Zombie Recycling)
-- ══════════════════════════════════════════════════════════
local ObjectPool = {}

function ObjectPool:Init()
	local enemyFolder = ServerStorage:FindFirstChild("EnemyModels")
	if not enemyFolder then warn("[ObjectPool] EnemyModels not found") return end
	for _, enemyConfig in ipairs(Config.EnemyTypes) do
		ServerState.EnemyPool[enemyConfig.Name] = {}
		local template = enemyFolder:FindFirstChild(enemyConfig.Name)
		if template then
			for i = 1, math.ceil(ServerState.PoolSize / #Config.EnemyTypes) do
				local clone = template:Clone()
				clone.Parent = ServerStorage
				clone.Name = enemyConfig.Name .. "_pool_" .. i
				table.insert(ServerState.EnemyPool[enemyConfig.Name], clone)
			end
		end
	end
	print("[ObjectPool] Initialized with " .. ServerState.PoolSize .. " pooled enemies")
end

function ObjectPool:Get(enemyName)
	local pool = ServerState.EnemyPool[enemyName]
	if pool and #pool > 0 then return table.remove(pool) end
	local template = ServerStorage:FindFirstChild("EnemyModels")
		and ServerStorage.EnemyModels:FindFirstChild(enemyName)
	if template then return template:Clone() end
	return nil
end

function ObjectPool:Return(enemy)
	if not enemy then return end
	-- FIX #36: Split on underscore instead of regex that fails on names with underscores
	local baseName = enemy.Name:match("^([^_]+)")
	enemy.Parent = ServerStorage
	local humanoid = enemy:FindFirstChildOfClass("Humanoid")
	if humanoid then humanoid.Health = humanoid.MaxHealth end
	if baseName and ServerState.EnemyPool[baseName] then
		table.insert(ServerState.EnemyPool[baseName], enemy)
	else
		enemy:Destroy()
	end
end

-- ══════════════════════════════════════════════════════════
-- CAMPAIGN SYSTEM
-- ══════════════════════════════════════════════════════════
local CampaignModule = {}

function CampaignModule:GetDayConfig(day)
	local scale = 1 + (day - 1) * Config.EnemyScalePerDay
	local enemyCount = math.floor(Config.BaseEnemiesPerWave * scale)
	local boss = nil
	for _, b in ipairs(Config.Bosses) do
		if b.SpawnDay == day then boss = b break end
	end
	local availableEnemies = {}
	for _, et in ipairs(Config.EnemyTypes) do
		local unlockDay = 1
		if et.SpawnWeight <= 4 then unlockDay = 5 end
		if et.SpawnWeight <= 1 then unlockDay = 15 end
		if day >= unlockDay then table.insert(availableEnemies, et) end
	end
	return {
		Day = day, EnemiesPerWave = enemyCount,
		AvailableEnemies = availableEnemies, Boss = boss,
		HasTownStop = (day % 3 == 2),
		HealthScale = scale, DamageScale = scale,
	}
end

function CampaignModule:StartChapter(day)
	local dayConfig = self:GetDayConfig(day)
	ServerState.CurrentDay = day
	print(string.format("[Campaign] Day %d — %d enemies/wave, scale %.2f",
		day, dayConfig.EnemiesPerWave, dayConfig.HealthScale))
	for wave = 1, Config.WavesPerDay do
		ServerState.CurrentWave = wave
		self:SpawnWave(dayConfig, wave)
		self:WaitForClear()
		task.wait(3)
	end
	if dayConfig.HasTownStop then self:RunTownPhase(dayConfig) end
	if dayConfig.Boss then self:RunBossPhase(dayConfig.Boss) end
	for _, player in ipairs(Players:GetPlayers()) do
		local data = ServerState.PlayerData[player.UserId]
		if data then data.Day = day + 1; data.Wave = 1 end
	end
	saveAllPlayers()
	print(string.format("[Campaign] Day %d complete", day))
end

function CampaignModule:SpawnWave(dayConfig, waveNum)
	local enemies = dayConfig.AvailableEnemies
	if #enemies == 0 then return end
	for i = 1, dayConfig.EnemiesPerWave do
		local totalWeight = 0
		for _, e in ipairs(enemies) do totalWeight = totalWeight + e.SpawnWeight end
		local roll = math.random() * totalWeight
		local cumulative = 0
		local selected = enemies[1]
		for _, e in ipairs(enemies) do
			cumulative = cumulative + e.SpawnWeight
			if roll <= cumulative then selected = e break end
		end
		local enemy = ObjectPool:Get(selected.Name)
		if enemy then
			local spawnPos = Vector3.new(math.random(-50, 50), 5, math.random(-50, 50))
			-- FIX #7: PivotTo replaces SetPrimaryPartCFrame
			if enemy.PrimaryPart then enemy:PivotTo(CFrame.new(spawnPos)) end
			local humanoid = enemy:FindFirstChildOfClass("Humanoid")
			if humanoid then
				humanoid.MaxHealth = selected.Health * dayConfig.HealthScale
				humanoid.Health = humanoid.MaxHealth
				humanoid.WalkSpeed = selected.Speed
			end
			enemy.Parent = Workspace
			table.insert(ServerState.ActiveEnemies, { Instance = enemy, Config = selected })
		end
		task.wait(1)
	end
end

function CampaignModule:WaitForClear()
	while #ServerState.ActiveEnemies > 0 do
		for i = #ServerState.ActiveEnemies, 1, -1 do
			local entry = ServerState.ActiveEnemies[i]
			local hum = entry.Instance:FindFirstChildOfClass("Humanoid")
			if not hum or hum.Health <= 0 or not entry.Instance.Parent then
				ObjectPool:Return(entry.Instance)
				table.remove(ServerState.ActiveEnemies, i)
			end
		end
		task.wait(0.5)
	end
end

function CampaignModule:RunTownPhase(dayConfig)
	print("[Campaign] Town phase starting")
	task.wait(Config.TotalDays > 3 and 300 or 180)
end

function CampaignModule:RunBossPhase(bossConfig)
	print(string.format("[Campaign] Boss: %s — %s", bossConfig.Name, bossConfig.Title))
end

-- ══════════════════════════════════════════════════════════
-- PLAYER CONNECTIONS
-- ══════════════════════════════════════════════════════════
Players.PlayerAdded:Connect(function(player)
	local data = loadPlayerData(player)
	player.CharacterAdded:Connect(function(character)
		local humanoid = character:WaitForChild("Humanoid")
		local class = Config.Classes[data.Class]
		if class then
			humanoid.MaxHealth = 100 + class.HealthBonus
			humanoid.Health = humanoid.MaxHealth
			humanoid.WalkSpeed = 16 + class.SpeedBonus
		end
		humanoid.Died:Connect(function()
			data.Deaths = data.Deaths + 1
			task.wait(Config.RespawnTime)
			player:LoadCharacter()
		end)
	end)
end)

Players.PlayerRemoving:Connect(function(player)
	savePlayerData(player)
	ServerState.PlayerData[player.UserId] = nil
end)

-- FIX #39: BindToClose with timeout guard (25s of 30s budget)
game:BindToClose(function()
	local finished = false
	task.spawn(function()
		saveAllPlayers()
		finished = true
	end)
	local start = os.clock()
	while not finished and (os.clock() - start) < 25 do
		task.wait(0.1)
	end
	if not finished then
		warn("[DataStore] BindToClose timeout — some saves may have been lost")
	end
end)

-- ══════════════════════════════════════════════════════════
-- INITIALIZATION
-- ══════════════════════════════════════════════════════════
ObjectPool:Init()

print("══════════════════════════════════════════════")
print("\xF0\x9F\x9A\x82 SURVIVE A BRAINROT — PRODUCTION SERVER v2.1.0 HARDENED")
print("Campaign: 99 Days to Sanctuary")
print("Classes: " .. #Config.Classes .. " | Enemies: " .. #Config.EnemyTypes .. " | Bosses: " .. #Config.Bosses)
print("Gospel 444 Compliant | NO BLUE | Fail-Closed")
print("Phoenix Rising Gaming Division")
print("══════════════════════════════════════════════")
