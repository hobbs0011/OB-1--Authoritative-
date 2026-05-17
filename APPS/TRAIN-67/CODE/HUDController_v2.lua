--[[
    HUDController_v2.lua — Mobile-First Game HUD
    Skibidi Zombie: Survive the Brainrots
    
    GOAL: MAKE MONEY. The HUD is the player's window to spending.
    Clear, responsive, thumb-friendly. 83% of Roblox players are mobile.
    
    Handles: health bar, combo counter, power-up gauge, question UI,
             wave indicator, coin display, reward popups, shop button.
    
    Architecture: LocalScript (StarterPlayerScripts)
    Version: 2.0.0
    Date: 2026-03-26
--]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

local HUDController = {}

local CONFIG = {
    COLORS = {
        health_full = Color3.fromRGB(76, 175, 80),
        health_mid = Color3.fromRGB(255, 193, 7),
        health_low = Color3.fromRGB(244, 67, 54),
        combo_text = Color3.fromRGB(255, 215, 0),
        power_up = Color3.fromRGB(0, 188, 212),
        coin = Color3.fromRGB(255, 193, 7),
        gem = Color3.fromRGB(156, 39, 176),
        correct = Color3.fromRGB(76, 175, 80),
        wrong = Color3.fromRGB(244, 67, 54),
        bg_dark = Color3.fromRGB(20, 20, 30),
        bg_glass = Color3.fromRGB(30, 30, 50),
    },
    MOBILE_BUTTON_SIZE = UDim2.new(0, 80, 0, 80),
    ANSWER_BUTTON_HEIGHT = 60,
    MAX_ANSWER_OPTIONS = 4,
    POPUP_DURATION = 1.5,
    COMBO_SHAKE_THRESHOLD = 5,
}

local screenGui = nil
local elements = {}
local isMobile = UserInputService.TouchEnabled and not UserInputService.KeyboardEnabled

function HUDController.Init()
    HUDController._createScreenGui()
    HUDController._createHealthBar()
    HUDController._createComboCounter()
    HUDController._createPowerUpGauge()
    HUDController._createCoinDisplay()
    HUDController._createWaveIndicator()
    HUDController._createQuestionUI()
    HUDController._createRewardPopup()
    HUDController._createShopButton()
    HUDController._connectRemotes()
    print("[HUDController_v2] Initialized — mobile-first, thumb-friendly")
    return true
end

function HUDController._createScreenGui()
    screenGui = Instance.new("ScreenGui")
    screenGui.Name = "SkibidiHUD"
    screenGui.ResetOnSpawn = false
    screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
    screenGui.IgnoreGuiInset = true
    screenGui.Parent = playerGui
end

function HUDController._createHealthBar()
    local container = Instance.new("Frame")
    container.Name = "HealthBar"
    container.Size = isMobile and UDim2.new(0.6, 0, 0, 24) or UDim2.new(0.4, 0, 0, 20)
    container.Position = UDim2.new(0.5, 0, 0, 50)
    container.AnchorPoint = Vector2.new(0.5, 0)
    container.BackgroundColor3 = CONFIG.COLORS.bg_dark
    container.BorderSizePixel = 0
    container.Parent = screenGui
    
    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 12)
    corner.Parent = container
    
    local fill = Instance.new("Frame")
    fill.Name = "Fill"
    fill.Size = UDim2.new(1, 0, 1, 0)
    fill.BackgroundColor3 = CONFIG.COLORS.health_full
    fill.BorderSizePixel = 0
    fill.Parent = container
    
    local fillCorner = Instance.new("UICorner")
    fillCorner.CornerRadius = UDim.new(0, 12)
    fillCorner.Parent = fill
    
    local label = Instance.new("TextLabel")
    label.Name = "Label"
    label.Size = UDim2.new(1, 0, 1, 0)
    label.BackgroundTransparency = 1
    label.Text = "100/100"
    label.TextColor3 = Color3.new(1, 1, 1)
    label.Font = Enum.Font.GothamBold
    label.TextSize = 14
    label.Parent = container
    
    elements.healthBar = { container = container, fill = fill, label = label }
end

function HUDController._createComboCounter()
    local label = Instance.new("TextLabel")
    label.Name = "ComboCounter"
    label.Size = UDim2.new(0, 200, 0, 50)
    label.Position = UDim2.new(0.5, 0, 0, 80)
    label.AnchorPoint = Vector2.new(0.5, 0)
    label.BackgroundTransparency = 1
    label.Text = ""
    label.TextColor3 = CONFIG.COLORS.combo_text
    label.Font = Enum.Font.GothamBlack
    label.TextSize = isMobile and 28 or 24
    label.TextStrokeTransparency = 0.5
    label.Visible = false
    label.Parent = screenGui
    elements.comboCounter = label
end

function HUDController._createPowerUpGauge()
    local container = Instance.new("Frame")
    container.Name = "PowerUpGauge"
    container.Size = UDim2.new(0, 200, 0, 16)
    container.Position = UDim2.new(0.5, 0, 0, 135)
    container.AnchorPoint = Vector2.new(0.5, 0)
    container.BackgroundColor3 = CONFIG.COLORS.bg_dark
    container.BorderSizePixel = 0
    container.Parent = screenGui
    
    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 8)
    corner.Parent = container
    
    local fill = Instance.new("Frame")
    fill.Name = "Fill"
    fill.Size = UDim2.new(0, 0, 1, 0)
    fill.BackgroundColor3 = CONFIG.COLORS.power_up
    fill.BorderSizePixel = 0
    fill.Parent = container
    
    local fillCorner = Instance.new("UICorner")
    fillCorner.CornerRadius = UDim.new(0, 8)
    fillCorner.Parent = fill
    
    local label = Instance.new("TextLabel")
    label.Name = "Label"
    label.Size = UDim2.new(1, 0, 1, 0)
    label.BackgroundTransparency = 1
    label.Text = "⚡ ENGLISH POWER"
    label.TextColor3 = Color3.new(1, 1, 1)
    label.Font = Enum.Font.GothamBold
    label.TextSize = 10
    label.Parent = container
    
    elements.powerUpGauge = { container = container, fill = fill, label = label }
end

function HUDController._createCoinDisplay()
    local frame = Instance.new("Frame")
    frame.Name = "CoinDisplay"
    frame.Size = UDim2.new(0, 160, 0, 40)
    frame.Position = UDim2.new(1, -20, 0, 50)
    frame.AnchorPoint = Vector2.new(1, 0)
    frame.BackgroundColor3 = CONFIG.COLORS.bg_glass
    frame.BackgroundTransparency = 0.3
    frame.BorderSizePixel = 0
    frame.Parent = screenGui
    
    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 10)
    corner.Parent = frame
    
    local coinLabel = Instance.new("TextLabel")
    coinLabel.Name = "CoinLabel"
    coinLabel.Size = UDim2.new(1, -10, 0.5, 0)
    coinLabel.Position = UDim2.new(0, 10, 0, 0)
    coinLabel.BackgroundTransparency = 1
    coinLabel.Text = "🪙 0"
    coinLabel.TextColor3 = CONFIG.COLORS.coin
    coinLabel.Font = Enum.Font.GothamBold
    coinLabel.TextSize = 16
    coinLabel.TextXAlignment = Enum.TextXAlignment.Left
    coinLabel.Parent = frame
    
    local gemLabel = Instance.new("TextLabel")
    gemLabel.Name = "GemLabel"
    gemLabel.Size = UDim2.new(1, -10, 0.5, 0)
    gemLabel.Position = UDim2.new(0, 10, 0.5, 0)
    gemLabel.BackgroundTransparency = 1
    gemLabel.Text = "💎 0"
    gemLabel.TextColor3 = CONFIG.COLORS.gem
    gemLabel.Font = Enum.Font.GothamBold
    gemLabel.TextSize = 14
    gemLabel.TextXAlignment = Enum.TextXAlignment.Left
    gemLabel.Parent = frame
    
    elements.coinDisplay = { frame = frame, coinLabel = coinLabel, gemLabel = gemLabel }
end

function HUDController._createWaveIndicator()
    local label = Instance.new("TextLabel")
    label.Name = "WaveIndicator"
    label.Size = UDim2.new(0, 200, 0, 30)
    label.Position = UDim2.new(0, 20, 0, 50)
    label.BackgroundTransparency = 1
    label.Text = "WAVE 1"
    label.TextColor3 = Color3.new(1, 1, 1)
    label.Font = Enum.Font.GothamBlack
    label.TextSize = isMobile and 22 or 18
    label.TextXAlignment = Enum.TextXAlignment.Left
    label.TextStrokeTransparency = 0.5
    label.Parent = screenGui
    elements.waveIndicator = label
end

function HUDController._createQuestionUI()
    local container = Instance.new("Frame")
    container.Name = "QuestionUI"
    container.Size = isMobile and UDim2.new(0.9, 0, 0, 280) or UDim2.new(0.6, 0, 0, 250)
    container.Position = UDim2.new(0.5, 0, 1, -20)
    container.AnchorPoint = Vector2.new(0.5, 1)
    container.BackgroundColor3 = CONFIG.COLORS.bg_glass
    container.BackgroundTransparency = 0.15
    container.BorderSizePixel = 0
    container.Visible = false
    container.Parent = screenGui
    
    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 16)
    corner.Parent = container
    
    -- Question text
    local questionLabel = Instance.new("TextLabel")
    questionLabel.Name = "QuestionText"
    questionLabel.Size = UDim2.new(1, -20, 0, 60)
    questionLabel.Position = UDim2.new(0, 10, 0, 10)
    questionLabel.BackgroundTransparency = 1
    questionLabel.Text = "What does 'rizz' mean?"
    questionLabel.TextColor3 = Color3.new(1, 1, 1)
    questionLabel.Font = Enum.Font.GothamBold
    questionLabel.TextSize = isMobile and 20 or 18
    questionLabel.TextWrapped = true
    questionLabel.Parent = container
    
    -- Answer buttons
    local answerFrame = Instance.new("Frame")
    answerFrame.Name = "Answers"
    answerFrame.Size = UDim2.new(1, -20, 1, -80)
    answerFrame.Position = UDim2.new(0, 10, 0, 75)
    answerFrame.BackgroundTransparency = 1
    answerFrame.Parent = container
    
    local layout = Instance.new("UIListLayout")
    layout.FillDirection = Enum.FillDirection.Vertical
    layout.Padding = UDim.new(0, 8)
    layout.Parent = answerFrame
    
    local answerButtons = {}
    for i = 1, CONFIG.MAX_ANSWER_OPTIONS do
        local btn = Instance.new("TextButton")
        btn.Name = "Answer" .. i
        btn.Size = UDim2.new(1, 0, 0, CONFIG.ANSWER_BUTTON_HEIGHT)
        btn.BackgroundColor3 = Color3.fromRGB(40, 40, 65)
        btn.BorderSizePixel = 0
        btn.Text = "Option " .. i
        btn.TextColor3 = Color3.new(1, 1, 1)
        btn.Font = Enum.Font.GothamBold
        btn.TextSize = isMobile and 18 or 16
        btn.AutoButtonColor = true
        btn.Parent = answerFrame
        
        local btnCorner = Instance.new("UICorner")
        btnCorner.CornerRadius = UDim.new(0, 10)
        btnCorner.Parent = btn
        
        btn.Activated:Connect(function()
            HUDController._onAnswerSelected(i)
        end)
        
        answerButtons[i] = btn
    end
    
    -- Timer bar
    local timer = Instance.new("Frame")
    timer.Name = "Timer"
    timer.Size = UDim2.new(1, 0, 0, 4)
    timer.Position = UDim2.new(0, 0, 0, 68)
    timer.BackgroundColor3 = CONFIG.COLORS.power_up
    timer.BorderSizePixel = 0
    timer.Parent = container
    
    elements.questionUI = {
        container = container,
        questionLabel = questionLabel,
        answerFrame = answerFrame,
        answerButtons = answerButtons,
        timer = timer,
    }
end

function HUDController._createRewardPopup()
    local label = Instance.new("TextLabel")
    label.Name = "RewardPopup"
    label.Size = UDim2.new(0, 300, 0, 40)
    label.Position = UDim2.new(0.5, 0, 0.4, 0)
    label.AnchorPoint = Vector2.new(0.5, 0.5)
    label.BackgroundTransparency = 1
    label.Text = ""
    label.TextColor3 = CONFIG.COLORS.coin
    label.Font = Enum.Font.GothamBlack
    label.TextSize = 24
    label.TextStrokeTransparency = 0.3
    label.Visible = false
    label.Parent = screenGui
    elements.rewardPopup = label
end

function HUDController._createShopButton()
    local btn = Instance.new("TextButton")
    btn.Name = "ShopButton"
    btn.Size = isMobile and UDim2.new(0, 70, 0, 70) or UDim2.new(0, 50, 0, 50)
    btn.Position = UDim2.new(1, -20, 1, -100)
    btn.AnchorPoint = Vector2.new(1, 1)
    btn.BackgroundColor3 = CONFIG.COLORS.bg_glass
    btn.BackgroundTransparency = 0.2
    btn.Text = "🛍️"
    btn.TextSize = isMobile and 32 or 24
    btn.BorderSizePixel = 0
    btn.Parent = screenGui
    
    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0.5, 0)
    corner.Parent = btn
    
    btn.Activated:Connect(function()
        HUDController._openShop()
    end)
    
    elements.shopButton = btn
end

-- UPDATE FUNCTIONS
function HUDController.UpdateHealth(current, max)
    local hp = elements.healthBar
    if not hp then return end
    local ratio = math.clamp(current / max, 0, 1)
    local color = ratio > 0.6 and CONFIG.COLORS.health_full
        or ratio > 0.3 and CONFIG.COLORS.health_mid
        or CONFIG.COLORS.health_low
    TweenService:Create(hp.fill, TweenInfo.new(0.3), { Size = UDim2.new(ratio, 0, 1, 0), BackgroundColor3 = color }):Play()
    hp.label.Text = math.floor(current) .. "/" .. math.floor(max)
end

function HUDController.UpdateCombo(streak)
    local label = elements.comboCounter
    if not label then return end
    if streak > 1 then
        label.Visible = true
        label.Text = streak .. "x COMBO 🔥"
        if streak >= CONFIG.COMBO_SHAKE_THRESHOLD then
            label.TextSize = isMobile and 34 or 30
        else
            label.TextSize = isMobile and 28 or 24
        end
    else
        label.Visible = false
    end
end

function HUDController.UpdatePowerUp(charge, maxCharge)
    local gauge = elements.powerUpGauge
    if not gauge then return end
    local ratio = math.clamp(charge / maxCharge, 0, 1)
    TweenService:Create(gauge.fill, TweenInfo.new(0.3), { Size = UDim2.new(ratio, 0, 1, 0) }):Play()
    if ratio >= 1 then
        gauge.label.Text = "⚡ ENGLISH POWER — READY!"
    else
        gauge.label.Text = "⚡ ENGLISH POWER"
    end
end

function HUDController.UpdateCoins(coins, gems)
    local display = elements.coinDisplay
    if not display then return end
    display.coinLabel.Text = "🪙 " .. tostring(coins)
    display.gemLabel.Text = "💎 " .. tostring(gems)
end

function HUDController.UpdateWave(waveData)
    local label = elements.waveIndicator
    if not label then return end
    local prefix = waveData.isBoss and "⚠️ BOSS " or ""
    label.Text = prefix .. "WAVE " .. waveData.wave .. " — " .. (waveData.tierLabel or "")
end

function HUDController.ShowQuestion(questionData)
    local ui = elements.questionUI
    if not ui then return end
    ui.container.Visible = true
    ui.questionLabel.Text = questionData.question or "???"
    for i, btn in ipairs(ui.answerButtons) do
        if questionData.options and questionData.options[i] then
            btn.Visible = true
            btn.Text = questionData.options[i]
            btn.BackgroundColor3 = Color3.fromRGB(40, 40, 65)
        else
            btn.Visible = false
        end
    end
end

function HUDController.HideQuestion()
    local ui = elements.questionUI
    if ui then ui.container.Visible = false end
end

function HUDController.ShowAnswerResult(index, isCorrect)
    local ui = elements.questionUI
    if not ui then return end
    local btn = ui.answerButtons[index]
    if btn then
        btn.BackgroundColor3 = isCorrect and CONFIG.COLORS.correct or CONFIG.COLORS.wrong
    end
    task.delay(0.8, function()
        HUDController.HideQuestion()
    end)
end

function HUDController.ShowRewardPopup(text)
    local label = elements.rewardPopup
    if not label then return end
    label.Text = text
    label.Visible = true
    label.Position = UDim2.new(0.5, 0, 0.4, 0)
    label.TextTransparency = 0
    TweenService:Create(label, TweenInfo.new(CONFIG.POPUP_DURATION), {
        Position = UDim2.new(0.5, 0, 0.3, 0),
        TextTransparency = 1,
    }):Play()
    task.delay(CONFIG.POPUP_DURATION, function()
        label.Visible = false
        label.TextTransparency = 0
    end)
end

-- EVENTS
function HUDController._onAnswerSelected(index)
    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if remotes then
        local ev = remotes:FindFirstChild("SubmitAnswer")
        if ev then ev:FireServer(index) end
    end
end

function HUDController._openShop()
    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if remotes then
        local ev = remotes:FindFirstChild("OpenShop")
        if ev then ev:FireServer() end
    end
end

function HUDController._connectRemotes()
    local remotes = ReplicatedStorage:WaitForChild("Remotes", 10)
    if not remotes then return end
    
    local function safeConnect(name, callback)
        local ev = remotes:FindFirstChild(name)
        if ev then ev.OnClientEvent:Connect(callback) end
    end
    
    safeConnect("HealthUpdate", function(data)
        HUDController.UpdateHealth(data.current, data.max)
    end)
    safeConnect("ComboUpdate", function(data)
        HUDController.UpdateCombo(data.streak)
    end)
    safeConnect("PowerUpUpdate", function(data)
        HUDController.UpdatePowerUp(data.charge, data.maxCharge)
    end)
    safeConnect("CurrencyUpdate", function(data)
        if data.currency == "EnglishCoins" then
            HUDController.UpdateCoins(data.total, nil)
        end
    end)
    safeConnect("WaveUpdate", function(data)
        HUDController.UpdateWave(data)
    end)
    safeConnect("ServeQuestion", function(data)
        HUDController.ShowQuestion(data)
    end)
    safeConnect("AnswerResult", function(data)
        HUDController.ShowAnswerResult(data.selectedIndex, data.isCorrect)
    end)
    safeConnect("RewardNotification", function(data)
        HUDController.ShowRewardPopup("+" .. data.coins .. " 🪙")
    end)
end

return HUDController
