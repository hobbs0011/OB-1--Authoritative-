--[[
═══════════════════════════════════════════════════════════
SURVIVAL CODEX // DATABASE — CLIENT UI
Script: CodexClient.lua
Type: LocalScript (StarterPlayerScripts)
Purpose: Renders the Survival Codex encyclopedia UI
Version: 1.1 HARDENED
Date: Original Feb 2026 (Hardened March 25, 2026)
Gospel 444 Compliant — NO BLUE
Phoenix Rising Gaming Division
═══════════════════════════════════════════════════════════
HARDENING LOG:
  1. Protected CodexData require with pcall — graceful fallback
  2. Card uses AutomaticSize — long descriptions no longer clipped
  3. Empty state message when no entries exist
  4. renderEntries preserves UIListLayout during clear
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

local loadSuccess, CodexData = pcall(function()
	return require(ReplicatedStorage:WaitForChild("CodexData", 10))
end)

if not loadSuccess or not CodexData then
	warn("[Codex] FAILED to load CodexData module — UI disabled")
	return
end

local Colors = {
	Purple = Color3.fromRGB(168, 85, 247),
	Gold = Color3.fromRGB(245, 158, 11),
	Dark = Color3.fromRGB(15, 15, 26),
	Glass = Color3.fromRGB(26, 26, 38),
	White = Color3.fromRGB(255, 255, 255),
	Gray = Color3.fromRGB(100, 100, 100),
}
local FONT = Enum.Font.GothamBold

local codexGui = Instance.new("ScreenGui")
codexGui.Name = "SurvivalCodex"
codexGui.ResetOnSpawn = false
codexGui.Enabled = false
codexGui.Parent = playerGui

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

local titleBar = Instance.new("TextLabel")
titleBar.Name = "Title"
titleBar.Size = UDim2.new(1, 0, 0, 45)
titleBar.BackgroundTransparency = 1
titleBar.Text = "SURVIVAL CODEX // DATABASE"
titleBar.TextColor3 = Colors.Gold
titleBar.TextSize = 22
titleBar.Font = FONT
titleBar.Parent = mainPanel

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
listLayout.Name = "EntryLayout"
listLayout.SortOrder = Enum.SortOrder.LayoutOrder
listLayout.Padding = UDim.new(0, 8)
listLayout.Parent = scroll

local function renderEntries()
	for _, child in ipairs(scroll:GetChildren()) do
		if child:IsA("Frame") or child:IsA("TextLabel") then child:Destroy() end
	end
	local entries = CodexData:GetAllEntries()
	if not entries or #entries == 0 then
		local emptyLabel = Instance.new("TextLabel")
		emptyLabel.Name = "EmptyState"
		emptyLabel.Size = UDim2.new(1, -20, 0, 60)
		emptyLabel.BackgroundTransparency = 1
		emptyLabel.Text = "No codex entries discovered yet. Survive to unlock."
		emptyLabel.TextColor3 = Colors.Gray
		emptyLabel.TextSize = 16
		emptyLabel.Font = FONT
		emptyLabel.TextWrapped = true
		emptyLabel.Parent = scroll
		return
	end
	for i, entry in ipairs(entries) do
		local card = Instance.new("Frame")
		card.Name = entry.id
		card.Size = UDim2.new(1, -10, 0, 0)
		card.AutomaticSize = Enum.AutomaticSize.Y
		card.BackgroundColor3 = Colors.Glass
		card.BackgroundTransparency = 0.3
		card.BorderSizePixel = 0
		card.LayoutOrder = i
		card.Parent = scroll
		local cc = Instance.new("UICorner")
		cc.CornerRadius = UDim.new(0, 8)
		cc.Parent = card
		local cs = Instance.new("UIStroke")
		cs.Color = CodexData:GetRarityColor(entry.rarity)
		cs.Thickness = 1.5
		cs.Parent = card
		local pad = Instance.new("UIPadding")
		pad.PaddingTop = UDim.new(0, 8)
		pad.PaddingBottom = UDim.new(0, 8)
		pad.PaddingLeft = UDim.new(0, 10)
		pad.PaddingRight = UDim.new(0, 10)
		pad.Parent = card
		local cl = Instance.new("UIListLayout")
		cl.SortOrder = Enum.SortOrder.LayoutOrder
		cl.Padding = UDim.new(0, 4)
		cl.Parent = card
		local tl = Instance.new("TextLabel")
		tl.Size = UDim2.new(1, 0, 0, 25)
		tl.BackgroundTransparency = 1
		tl.Text = (entry.icon or "") .. " " .. (entry.title or "UNKNOWN")
		tl.TextColor3 = Colors.Gold
		tl.TextSize = 18
		tl.Font = FONT
		tl.TextXAlignment = Enum.TextXAlignment.Left
		tl.LayoutOrder = 1
		tl.Parent = card
		local tag = Instance.new("TextLabel")
		tag.Size = UDim2.new(1, 0, 0, 18)
		tag.BackgroundTransparency = 1
		tag.Text = (entry.category or "?") .. " | " .. (entry.rarity or "?")
		tag.TextColor3 = Colors.Purple
		tag.TextSize = 12
		tag.Font = FONT
		tag.TextXAlignment = Enum.TextXAlignment.Left
		tag.LayoutOrder = 2
		tag.Parent = card
		local desc = Instance.new("TextLabel")
		desc.Size = UDim2.new(1, 0, 0, 0)
		desc.AutomaticSize = Enum.AutomaticSize.Y
		desc.BackgroundTransparency = 1
		desc.Text = entry.description or ""
		desc.TextColor3 = Colors.White
		desc.TextSize = 13
		desc.Font = Enum.Font.Gotham
		desc.TextWrapped = true
		desc.TextXAlignment = Enum.TextXAlignment.Left
		desc.TextYAlignment = Enum.TextYAlignment.Top
		desc.LayoutOrder = 3
		desc.Parent = card
	end
end

renderEntries()

local codexOpen = false
local function toggleCodex()
	codexOpen = not codexOpen
	codexGui.Enabled = codexOpen
	if codexOpen then
		mainPanel.Position = UDim2.new(0.5, 0, 0.6, 0)
		TweenService:Create(mainPanel, TweenInfo.new(0.3, Enum.EasingStyle.Back), {Position = UDim2.new(0.5, 0, 0.5, 0)}):Play()
	end
end

UserInputService.InputBegan:Connect(function(input, processed)
	if processed then return end
	if input.KeyCode == Enum.KeyCode.Tab then toggleCodex() end
end)

closeBtn.MouseButton1Click:Connect(function()
	codexOpen = false
	codexGui.Enabled = false
end)

print("[Codex] Survival Codex v1.1 HARDENED — Tab to open")
