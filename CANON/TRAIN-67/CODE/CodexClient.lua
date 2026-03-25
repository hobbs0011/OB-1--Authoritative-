--[[
═══════════════════════════════════════════════════════════
SURVIVAL CODEX // DATABASE — CLIENT UI
Script: CodexClient.lua
Type: LocalScript (StarterPlayerScripts)
Purpose: Renders the Survival Codex encyclopedia UI
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
local UserInputService = game:GetService("UserInputService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- ══════════════════════════════════════════════════════════
-- LOAD CODEX DATA
-- ══════════════════════════════════════════════════════════
local CodexData = require(ReplicatedStorage:WaitForChild("CodexData"))

-- ══════════════════════════════════════════════════════════
-- GOSPEL 444 COLORS (LAW — NO BLUE EVER)
-- ══════════════════════════════════════════════════════════
local Colors = {
	Purple = Color3.fromRGB(168, 85, 247),
	Gold = Color3.fromRGB(245, 158, 11),
	Dark = Color3.fromRGB(15, 15, 26),
	Glass = Color3.fromRGB(26, 26, 38),
	White = Color3.fromRGB(255, 255, 255),
	Gray = Color3.fromRGB(100, 100, 100),
}
local FONT = Enum.Font.GothamBold

-- ══════════════════════════════════════════════════════════
-- CREATE CODEX UI
-- ══════════════════════════════════════════════════════════
local codexGui = Instance.new("ScreenGui")
codexGui.Name = "SurvivalCodex"
codexGui.ResetOnSpawn = false
codexGui.Enabled = false
codexGui.Parent = playerGui

-- Main panel
local mainPanel = Instance.new("Frame")
mainPanel.Name = "CodexPanel"
mainPanel.Size = UDim2.new(0, 600, 0, 450)
mainPanel.Position = UDim2.new(0.5, 0, 0.5, 0)
mainPanel.AnchorPoint = Vector2.new(0.5, 0.5)
mainPanel.BackgroundColor3 = Colors.Dark
mainPanel.BackgroundTransparency = 0.1
mainPanel.BorderSizePixel = 0
mainPanel.Parent = codexGui

local mainCorner = Instance.new("UICorner")
mainCorner.CornerRadius = UDim.new(0, 12)
mainCorner.Parent = mainPanel

local mainStroke = Instance.new("UIStroke")
mainStroke.Color = Colors.Purple
mainStroke.Thickness = 3
mainStroke.Parent = mainPanel

-- Title bar
local titleBar = Instance.new("TextLabel")
titleBar.Name = "Title"
titleBar.Size = UDim2.new(1, 0, 0, 45)
titleBar.BackgroundTransparency = 1
titleBar.Text = "SURVIVAL CODEX // DATABASE"
titleBar.TextColor3 = Colors.Gold
titleBar.TextSize = 22
titleBar.Font = FONT
titleBar.Parent = mainPanel

-- Close button
local closeBtn = Instance.new("TextButton")
closeBtn.Name = "Close"
closeBtn.Size = UDim2.new(0, 35, 0, 35)
closeBtn.Position = UDim2.new(1, -40, 0, 5)
closeBtn.BackgroundColor3 = Colors.Dark
closeBtn.Text = "X"
closeBtn.TextColor3 = Colors.Purple
closeBtn.TextSize = 18
closeBtn.Font = FONT
closeBtn.BorderSizePixel = 0
closeBtn.Parent = mainPanel

local closeBtnCorner = Instance.new("UICorner")
closeBtnCorner.CornerRadius = UDim.new(0, 6)
closeBtnCorner.Parent = closeBtn

-- Scrolling frame for entries
local scroll = Instance.new("ScrollingFrame")
scroll.Name = "EntryList"
scroll.Size = UDim2.new(1, -20, 1, -55)
scroll.Position = UDim2.new(0, 10, 0, 50)
scroll.BackgroundTransparency = 1
scroll.ScrollBarThickness = 6
scroll.ScrollBarImageColor3 = Colors.Purple
scroll.BorderSizePixel = 0
scroll.CanvasSize = UDim2.new(0, 0, 0, 0)
scroll.AutomaticCanvasSize = Enum.AutomaticSize.Y
scroll.Parent = mainPanel

local listLayout = Instance.new("UIListLayout")
listLayout.SortOrder = Enum.SortOrder.LayoutOrder
listLayout.Padding = UDim.new(0, 8)
listLayout.Parent = scroll

-- ══════════════════════════════════════════════════════════
-- RENDER CODEX ENTRIES
-- ══════════════════════════════════════════════════════════
local function renderEntries()
	-- Clear existing
	for _, child in ipairs(scroll:GetChildren()) do
		if child:IsA("Frame") then child:Destroy() end
	end

	for i, entry in ipairs(CodexData.Entries) do
		local card = Instance.new("Frame")
		card.Name = entry.id
		card.Size = UDim2.new(1, -10, 0, 90)
		card.BackgroundColor3 = Colors.Glass
		card.BackgroundTransparency = 0.3
		card.BorderSizePixel = 0
		card.LayoutOrder = i
		card.Parent = scroll

		local cardCorner = Instance.new("UICorner")
		cardCorner.CornerRadius = UDim.new(0, 8)
		cardCorner.Parent = card

		local cardStroke = Instance.new("UIStroke")
		cardStroke.Color = CodexData:GetRarityColor(entry.rarity)
		cardStroke.Thickness = 1.5
		cardStroke.Parent = card

		-- Icon + Title
		local titleLabel = Instance.new("TextLabel")
		titleLabel.Size = UDim2.new(0.7, 0, 0, 25)
		titleLabel.Position = UDim2.new(0, 10, 0, 5)
		titleLabel.BackgroundTransparency = 1
		titleLabel.Text = entry.icon .. " " .. entry.title
		titleLabel.TextColor3 = Colors.Gold
		titleLabel.TextSize = 18
		titleLabel.Font = FONT
		titleLabel.TextXAlignment = Enum.TextXAlignment.Left
		titleLabel.Parent = card

		-- Category tag
		local catTag = Instance.new("TextLabel")
		catTag.Size = UDim2.new(0.25, 0, 0, 20)
		catTag.Position = UDim2.new(0.73, 0, 0, 7)
		catTag.BackgroundColor3 = Colors.Dark
		catTag.BackgroundTransparency = 0.5
		catTag.Text = entry.category
		catTag.TextColor3 = Colors.Purple
		catTag.TextSize = 12
		catTag.Font = FONT
		catTag.BorderSizePixel = 0
		catTag.Parent = card

		local catCorner = Instance.new("UICorner")
		catCorner.CornerRadius = UDim.new(0, 4)
		catCorner.Parent = catTag

		-- Description
		local desc = Instance.new("TextLabel")
		desc.Size = UDim2.new(1, -20, 0, 50)
		desc.Position = UDim2.new(0, 10, 0, 32)
		desc.BackgroundTransparency = 1
		desc.Text = entry.description
		desc.TextColor3 = Colors.White
		desc.TextSize = 13
		desc.Font = Enum.Font.Gotham
		desc.TextWrapped = true
		desc.TextXAlignment = Enum.TextXAlignment.Left
		desc.TextYAlignment = Enum.TextYAlignment.Top
		desc.Parent = card
	end
end

renderEntries()

-- ══════════════════════════════════════════════════════════
-- TOGGLE CODEX (Tab key)
-- ══════════════════════════════════════════════════════════
local codexOpen = false

local function toggleCodex()
	codexOpen = not codexOpen
	codexGui.Enabled = codexOpen

	if codexOpen then
		mainPanel.Position = UDim2.new(0.5, 0, 0.6, 0)
		TweenService:Create(mainPanel, TweenInfo.new(0.3, Enum.EasingStyle.Back), {
			Position = UDim2.new(0.5, 0, 0.5, 0)
		}):Play()
	end
end

UserInputService.InputBegan:Connect(function(input, processed)
	if processed then return end
	if input.KeyCode == Enum.KeyCode.Tab then
		toggleCodex()
	end
end)

closeBtn.MouseButton1Click:Connect(function()
	codexOpen = false
	codexGui.Enabled = false
end)

print("[Codex] Survival Codex loaded — Tab to open")
