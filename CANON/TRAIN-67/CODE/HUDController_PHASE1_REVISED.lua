--[[
═══════════════════════════════════════════════════════════
SURVIVE A BRAINROT — PHASE 1 DEMO (REVISED)
Script: HUDController_PHASE1_REVISED.lua
Type: LocalScript (StarterPlayerScripts)
Purpose: Complete Client HUD — Gospel 444 Glassmorphism
Version: 1.0 REVISED
Date: February 9, 2026
Gospel 444 Compliant — NO BLUE
Phoenix Rising Gaming Division
═══════════════════════════════════════════════════════════
]]

-- ══════════════════════════════════════════════════════════
-- SERVICES
-- ══════════════════════════════════════════════════════════
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- ══════════════════════════════════════════════════════════
-- GOSPEL 444 COLORS (LAW — NO BLUE EVER)
-- ══════════════════════════════════════════════════════════
local Colors = {
	Purple = Color3.fromRGB(168, 85, 247),     -- #a855f7
	Gold = Color3.fromRGB(245, 158, 11),        -- #f59e0b
	Dark = Color3.fromRGB(15, 15, 26),          -- #0f0f1a
	Glass = Color3.fromRGB(26, 26, 38),         -- rgba(26,26,38,0.7)
	White = Color3.fromRGB(255, 255, 255),
	Red = Color3.fromRGB(239, 68, 68),
	Green = Color3.fromRGB(34, 197, 94),
}
local GLASS_TRANSPARENCY = 0.3
local FONT = Enum.Font.GothamBold
local CORNER_RADIUS = UDim.new(0, 8)

-- ══════════════════════════════════════════════════════════
-- REMOTE EVENTS
-- ══════════════════════════════════════════════════════════
local remoteFolder = ReplicatedStorage:WaitForChild("GameRemotes")
local function getRemote(name)
	return remoteFolder:WaitForChild(name)
end

-- ══════════════════════════════════════════════════════════
-- UI CREATION HELPERS
-- ══════════════════════════════════════════════════════════
local function createScreenGui(name)
	local gui = Instance.new("ScreenGui")
	gui.Name = name
	gui.ResetOnSpawn = false
	gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
	gui.Parent = playerGui
	return gui
end

local function addCorner(parent)
	local corner = Instance.new("UICorner")
	corner.CornerRadius = CORNER_RADIUS
	corner.Parent = parent
	return corner
end

local function addStroke(parent, color, thickness)
	local stroke = Instance.new("UIStroke")
	stroke.Color = color or Colors.Purple
	stroke.Thickness = thickness or 2
	stroke.Parent = parent
	return stroke
end

local function createPanel(parent, size, position, anchorPoint)
	local frame = Instance.new("Frame")
	frame.Size = size
	frame.Position = position
	frame.AnchorPoint = anchorPoint or Vector2.new(0, 0)
	frame.BackgroundColor3 = Colors.Dark
	frame.BackgroundTransparency = GLASS_TRANSPARENCY
	frame.BorderSizePixel = 0
	frame.Parent = parent
	addCorner(frame)
	addStroke(frame, Colors.Purple)
	return frame
end

local function createLabel(parent, text, size, position, textColor, textSize)
	local label = Instance.new("TextLabel")
	label.Size = size or UDim2.new(1, 0, 1, 0)
	label.Position = position or UDim2.new(0, 0, 0, 0)
	label.BackgroundTransparency = 1
	label.Text = text or ""
	label.TextColor3 = textColor or Colors.White
	label.TextSize = textSize or 18
	label.Font = FONT
	label.TextWrapped = true
	label.Parent = parent
	return label
end

-- ══════════════════════════════════════════════════════════
-- MAIN HUD SCREEN
-- ══════════════════════════════════════════════════════════
local mainGui = createScreenGui("BrainrotHUD")

-- ══════════════════════════════════════════════════════════
-- LOBBY UI
-- ══════════════════════════════════════════════════════════
local lobbyFrame = createPanel(mainGui,
	UDim2.new(0, 400, 0, 200),
	UDim2.new(0.5, 0, 0.4, 0),
	Vector2.new(0.5, 0.5))
lobbyFrame.Name = "LobbyPanel"
addStroke(lobbyFrame, Colors.Gold, 3)

local lobbyTitle = createLabel(lobbyFrame,
	"\240\159\154\130 SURVIVE A BRAINROT",
	UDim2.new(1, 0, 0, 40),
	UDim2.new(0, 0, 0, 10),
	Colors.Gold, 24)

local lobbyStatus = createLabel(lobbyFrame,
	"WAITING FOR FULL TRAIN...",
	UDim2.new(1, 0, 0, 30),
	UDim2.new(0, 0, 0, 55),
	Colors.Purple, 18)

local lobbyCount = createLabel(lobbyFrame,
	"Players: 0/5",
	UDim2.new(1, 0, 0, 40),
	UDim2.new(0, 0, 0, 90),
	Colors.White, 28)

local lobbyBonus = createLabel(lobbyFrame,
	"\226\154\161 FULL TRAIN BONUS: +30% XP",
	UDim2.new(1, 0, 0, 25),
	UDim2.new(0, 0, 0, 140),
	Colors.Gold, 16)

local lobbyCountdown = createLabel(lobbyFrame,
	"",
	UDim2.new(1, 0, 0, 35),
	UDim2.new(0, 0, 0, 165),
	Colors.Green, 22)

-- ══════════════════════════════════════════════════════════
-- SQUAD BONUS UI (Always Visible)
-- ══════════════════════════════════════════════════════════
local squadFrame = createPanel(mainGui,
	UDim2.new(0, 300, 0, 40),
	UDim2.new(1, -10, 0, 10),
	Vector2.new(1, 0))
squadFrame.Name = "SquadBonus"
squadFrame.Visible = false
addStroke(squadFrame, Colors.Gold, 2)

local squadLabel = createLabel(squadFrame,
	"\240\159\154\130 FULL TRAIN (5/5) | \226\154\161 +30% XP",
	UDim2.new(1, -10, 1, 0),
	UDim2.new(0, 5, 0, 0),
	Colors.Gold, 16)

-- ══════════════════════════════════════════════════════════
-- WAVE / DAY DISPLAY
-- ══════════════════════════════════════════════════════════
local waveFrame = createPanel(mainGui,
	UDim2.new(0, 250, 0, 60),
	UDim2.new(0.5, 0, 0, 10),
	Vector2.new(0.5, 0))
waveFrame.Name = "WaveDisplay"
waveFrame.Visible = false

local dayLabel = createLabel(waveFrame,
	"DAY 1/3",
	UDim2.new(1, 0, 0, 25),
	UDim2.new(0, 0, 0, 5),
	Colors.Gold, 20)

local waveLabel = createLabel(waveFrame,
	"WAVE 1/3",
	UDim2.new(1, 0, 0, 25),
	UDim2.new(0, 0, 0, 30),
	Colors.Purple, 16)

-- ══════════════════════════════════════════════════════════
-- HEALTH BAR
-- ══════════════════════════════════════════════════════════
local healthFrame = createPanel(mainGui,
	UDim2.new(0, 250, 0, 30),
	UDim2.new(0, 10, 1, -50),
	Vector2.new(0, 1))
healthFrame.Name = "HealthBar"
healthFrame.Visible = false

local healthFill = Instance.new("Frame")
healthFill.Name = "Fill"
healthFill.Size = UDim2.new(1, -4, 1, -4)
healthFill.Position = UDim2.new(0, 2, 0, 2)
healthFill.BackgroundColor3 = Colors.Purple
healthFill.BorderSizePixel = 0
healthFill.Parent = healthFrame
addCorner(healthFill)

local healthText = createLabel(healthFrame,
	"100/100",
	UDim2.new(1, 0, 1, 0),
	UDim2.new(0, 0, 0, 0),
	Colors.White, 14)
healthText.ZIndex = 5

-- ══════════════════════════════════════════════════════════
-- TOWN TIMER UI
-- ══════════════════════════════════════════════════════════
local townFrame = createPanel(mainGui,
	UDim2.new(0, 300, 0, 80),
	UDim2.new(0.5, 0, 0, 80),
	Vector2.new(0.5, 0))
townFrame.Name = "TownUI"
townFrame.Visible = false

local townTimer = createLabel(townFrame,
	"5:00",
	UDim2.new(1, 0, 0, 35),
	UDim2.new(0, 0, 0, 5),
	Colors.Purple, 28)

local fuelCount = createLabel(townFrame,
	"\226\155\189 FUEL BARRELS: 0/3",
	UDim2.new(1, 0, 0, 30),
	UDim2.new(0, 0, 0, 42),
	Colors.Gold, 20)

-- ══════════════════════════════════════════════════════════
-- BOSS HEALTH BAR
-- ══════════════════════════════════════════════════════════
local bossFrame = createPanel(mainGui,
	UDim2.new(0, 500, 0, 55),
	UDim2.new(0.5, 0, 0, 10),
	Vector2.new(0.5, 0))
bossFrame.Name = "BossBar"
bossFrame.Visible = false
addStroke(bossFrame, Colors.Gold, 3)

local bossTitle = createLabel(bossFrame,
	"\240\159\145\145 BARON SKIBIDI",
	UDim2.new(1, 0, 0, 20),
	UDim2.new(0, 0, 0, 2),
	Colors.Gold, 16)

local bossBarBg = Instance.new("Frame")
bossBarBg.Name = "BarBg"
bossBarBg.Size = UDim2.new(1, -20, 0, 20)
bossBarBg.Position = UDim2.new(0, 10, 0, 25)
bossBarBg.BackgroundColor3 = Colors.Dark
bossBarBg.BorderSizePixel = 0
bossBarBg.Parent = bossFrame
addCorner(bossBarBg)

local bossFill = Instance.new("Frame")
bossFill.Name = "Fill"
bossFill.Size = UDim2.new(1, 0, 1, 0)
bossFill.BackgroundColor3 = Colors.Purple
bossFill.BorderSizePixel = 0
bossFill.Parent = bossBarBg
addCorner(bossFill)

local bossHPText = createLabel(bossBarBg,
	"2500 / 2500",
	UDim2.new(1, 0, 1, 0),
	UDim2.new(0, 0, 0, 0),
	Colors.White, 12)
bossHPText.ZIndex = 5

-- ══════════════════════════════════════════════════════════
-- NOTIFICATION SYSTEM
-- ══════════════════════════════════════════════════════════
local notifGui = createScreenGui("NotificationGui")

local function showNotification(text)
	local notif = createPanel(notifGui,
		UDim2.new(0, 400, 0, 50),
		UDim2.new(0.5, 0, 0.15, 0),
		Vector2.new(0.5, 0.5))
	notif.BackgroundTransparency = 0.2

	createLabel(notif, text,
		UDim2.new(1, -10, 1, 0),
		UDim2.new(0, 5, 0, 0),
		Colors.Gold, 16)

	-- Fade in
	notif.Position = UDim2.new(0.5, 0, 0.1, 0)
	local tweenIn = TweenService:Create(notif,
		TweenInfo.new(0.3, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
		{Position = UDim2.new(0.5, 0, 0.15, 0)})
	tweenIn:Play()

	-- Auto-remove
	task.delay(3, function()
		local tweenOut = TweenService:Create(notif,
			TweenInfo.new(0.5),
			{BackgroundTransparency = 1})
		tweenOut:Play()
		tweenOut.Completed:Wait()
		notif:Destroy()
	end)
end

-- ══════════════════════════════════════════════════════════
-- CLIFFHANGER OVERLAY
-- ══════════════════════════════════════════════════════════
local cliffGui = createScreenGui("CliffhangerGui")

local function showCliffhangerPhase(phase, text, duration)
	-- Full screen overlay
	local overlay = Instance.new("Frame")
	overlay.Size = UDim2.new(1, 0, 1, 0)
	overlay.BackgroundColor3 = Colors.Dark
	overlay.BackgroundTransparency = 0.1
	overlay.BorderSizePixel = 0
	overlay.Parent = cliffGui

	local textColor = Colors.White
	if phase == 2 then textColor = Colors.Purple end
	if phase == 3 then textColor = Colors.Gold end
	if phase == 4 then textColor = Colors.Gold end

	local textLabel = createLabel(overlay, text,
		UDim2.new(0.8, 0, 0.5, 0),
		UDim2.new(0.1, 0, 0.25, 0),
		textColor, phase == 4 and 36 or 28)

	-- Fade in
	overlay.BackgroundTransparency = 1
	TweenService:Create(overlay, TweenInfo.new(0.5), {BackgroundTransparency = 0.1}):Play()

	task.delay(duration - 0.5, function()
		TweenService:Create(overlay, TweenInfo.new(0.5), {BackgroundTransparency = 1}):Play()
		task.wait(0.6)
		overlay:Destroy()
	end)
end

-- ══════════════════════════════════════════════════════════
-- SCREEN EFFECTS
-- ══════════════════════════════════════════════════════════
local function doScreenShake(duration)
	local camera = Workspace.CurrentCamera
	if not camera then return end

	local startTime = tick()
	local connection
	connection = RunService.RenderStepped:Connect(function()
		if tick() - startTime > duration then
			connection:Disconnect()
			return
		end
		local intensity = 2 * (1 - (tick() - startTime) / duration)
		camera.CFrame = camera.CFrame * CFrame.new(
			math.random() * intensity - intensity/2,
			math.random() * intensity - intensity/2,
			0
		)
	end)
end

local function doPurpleFlash()
	local flash = Instance.new("Frame")
	flash.Size = UDim2.new(1, 0, 1, 0)
	flash.BackgroundColor3 = Colors.Purple
	flash.BackgroundTransparency = 0
	flash.BorderSizePixel = 0
	flash.ZIndex = 100
	flash.Parent = mainGui

	TweenService:Create(flash, TweenInfo.new(0.8), {BackgroundTransparency = 1}):Play()
	task.delay(1, function()
		flash:Destroy()
	end)
end

-- ══════════════════════════════════════════════════════════
-- REMOTE EVENT CONNECTIONS
-- ══════════════════════════════════════════════════════════

-- Lobby
getRemote("UpdateLobby").OnClientEvent:Connect(function(current, required)
	lobbyCount.Text = string.format("Players: %d/%d", current, required)
	if current >= required then
		lobbyStatus.Text = "FULL TRAIN! Starting soon..."
		lobbyStatus.TextColor3 = Colors.Green
	else
		lobbyStatus.Text = "WAITING FOR FULL TRAIN..."
		lobbyStatus.TextColor3 = Colors.Purple
	end
end)

getRemote("GameStartCountdown").OnClientEvent:Connect(function(seconds)
	lobbyCountdown.Text = string.format("Starting in %d...", seconds)
end)

getRemote("GameStarted").OnClientEvent:Connect(function()
	lobbyFrame.Visible = false
	waveFrame.Visible = true
	healthFrame.Visible = true
end)

-- Squad Bonus
getRemote("UpdateSquadBonus").OnClientEvent:Connect(function(active, bonus)
	squadFrame.Visible = active
end)

-- Wave/Day
getRemote("UpdateWave").OnClientEvent:Connect(function(wave, total)
	waveLabel.Text = string.format("WAVE %d/%d", wave, total)
end)

getRemote("UpdateDay").OnClientEvent:Connect(function(day, total)
	dayLabel.Text = string.format("DAY %d/%d", day, total)
end)

-- Town
getRemote("TownEntered").OnClientEvent:Connect(function()
	waveFrame.Visible = false
	townFrame.Visible = true
end)

getRemote("UpdateTownTimer").OnClientEvent:Connect(function(seconds)
	local mins = math.floor(seconds / 60)
	local secs = seconds % 60
	townTimer.Text = string.format("%d:%02d", mins, secs)
	-- Color: purple normally, red when < 60s
	if seconds < 60 then
		townTimer.TextColor3 = Colors.Red
	else
		townTimer.TextColor3 = Colors.Purple
	end
end)

getRemote("UpdateFuelCount").OnClientEvent:Connect(function(collected, total)
	fuelCount.Text = string.format("\226\155\189 FUEL BARRELS: %d/%d", collected, total)
end)

getRemote("TownComplete").OnClientEvent:Connect(function(success)
	townFrame.Visible = false
end)

-- Boss
getRemote("BossSpawned").OnClientEvent:Connect(function(name, title, maxHP)
	townFrame.Visible = false
	bossFrame.Visible = true
	bossTitle.Text = string.format("\240\159\145\145 %s", string.upper(name))
	bossHPText.Text = string.format("%d / %d", maxHP, maxHP)
	bossFill.Size = UDim2.new(1, 0, 1, 0)
end)

getRemote("UpdateBossHealth").OnClientEvent:Connect(function(hp, maxHP)
	local ratio = math.clamp(hp / maxHP, 0, 1)
	TweenService:Create(bossFill, TweenInfo.new(0.3), {
		Size = UDim2.new(ratio, 0, 1, 0)
	}):Play()

	bossHPText.Text = string.format("%d / %d", math.ceil(hp), maxHP)

	-- Color transitions: Purple > Gold > Red
	if ratio > 0.5 then
		bossFill.BackgroundColor3 = Colors.Purple
	elseif ratio > 0.25 then
		bossFill.BackgroundColor3 = Colors.Gold
	else
		bossFill.BackgroundColor3 = Colors.Red
	end
end)

getRemote("BossDefeated").OnClientEvent:Connect(function(name)
	bossFrame.Visible = false
	waveFrame.Visible = true
end)

-- Cliffhanger
getRemote("CliffhangerPhase").OnClientEvent:Connect(function(phase, text, duration)
	waveFrame.Visible = false
	showCliffhangerPhase(phase, text, duration)
end)

-- Effects
getRemote("ScreenShake").OnClientEvent:Connect(function(duration)
	doScreenShake(duration)
end)

getRemote("PurpleFlash").OnClientEvent:Connect(function()
	doPurpleFlash()
end)

-- Notifications
getRemote("ShowNotification").OnClientEvent:Connect(function(text)
	showNotification(text)
end)

-- Game Over
getRemote("GameOver").OnClientEvent:Connect(function(survived)
	waveFrame.Visible = false
	bossFrame.Visible = false
	healthFrame.Visible = false
	squadFrame.Visible = false
end)

-- ══════════════════════════════════════════════════════════
-- HEALTH BAR UPDATE LOOP
-- ══════════════════════════════════════════════════════════
RunService.RenderStepped:Connect(function()
	local character = player.Character
	if not character then return end

	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not humanoid then return end

	local hp = humanoid.Health
	local maxHP = humanoid.MaxHealth
	local ratio = math.clamp(hp / maxHP, 0, 1)

	healthFill.Size = UDim2.new(ratio, -4, 1, -4)
	healthText.Text = string.format("%d/%d", math.ceil(hp), maxHP)

	-- Color based on health
	if ratio > 0.5 then
		healthFill.BackgroundColor3 = Colors.Purple
	elseif ratio > 0.25 then
		healthFill.BackgroundColor3 = Colors.Gold
	else
		healthFill.BackgroundColor3 = Colors.Red
	end
end)

-- ══════════════════════════════════════════════════════════
-- INITIALIZATION
-- ══════════════════════════════════════════════════════════
print("[HUD] Gospel 444 HUD loaded — NO BLUE")
print("[HUD] Phoenix Rising Gaming Division")
