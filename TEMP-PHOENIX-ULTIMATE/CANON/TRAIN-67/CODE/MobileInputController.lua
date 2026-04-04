--[[
    MobileInputController.lua v1.0
    ================================
    Four-mode English input system for Natural English Training (Roblox)
    Mobile-first design: 70% of Roblox players are on mobile.

    Modes: TAP_SELECT | WORD_BUILDER | SPEED_TYPE | QUICK_REACT
    Law: English ENHANCES combat, never GATES it.
    Teaching: Mouse -> Tiger. Permission over perfection.
    Revenue: English is the mechanic. Money is the mission.

    Spec: CANON/TRAIN-67/DOCS/MobileFirstEnglishInputDesign.md
    Dependencies: QuestionBankV2, EloManager, EnglishRewardsManager,
                  AnalyticsService, CombatSystem, HUDController_v2
    Run 74 | 2026-03-28 06:00 ICT | Active Mission: 100% Roblox
]]

local MobileInputController = {}
MobileInputController.__index = MobileInputController

---------------------------------------------------------------------------
-- Services
---------------------------------------------------------------------------
local Players            = game:GetService("Players")
local UserInputService   = game:GetService("UserInputService")
local TweenService       = game:GetService("TweenService")
local HapticService      = game:GetService("HapticService")
local RunService         = game:GetService("RunService")
local GuiService         = game:GetService("GuiService")

---------------------------------------------------------------------------
-- Constants
---------------------------------------------------------------------------
local INPUT_MODES = {
    TAP_SELECT   = "TAP_SELECT",
    WORD_BUILDER = "WORD_BUILDER",
    SPEED_TYPE   = "SPEED_TYPE",
    QUICK_REACT  = "QUICK_REACT",
}

local REWARD_TABLE = {
    TAP_SELECT_2  = 10,   -- 2-option easy
    TAP_SELECT_4  = 20,   -- 4-option standard
    WORD_BUILDER  = 35,   -- construction = more effort
    SPEED_TYPE    = 50,   -- full production = max reward
    QUICK_REACT   = 5,    -- per word (fast + frequent)
}

local TIMER_DEFAULTS = {
    [INPUT_MODES.TAP_SELECT]   = 5,
    [INPUT_MODES.WORD_BUILDER] = 10,
    [INPUT_MODES.SPEED_TYPE]   = 12,
    [INPUT_MODES.QUICK_REACT]  = 3,
}

-- FTUE progression curve (first session)
local FTUE_STAGES = {
    { elapsed = 0,   options = 2, timer = 10, rewardMult = 5 },
    { elapsed = 30,  options = 3, timer = 8,  rewardMult = 3 },
    { elapsed = 60,  options = 4, timer = 6,  rewardMult = 2 },
    { elapsed = 120, options = 4, timer = 5,  rewardMult = 1 },
}

local BUTTON_MIN_HEIGHT      = 60   -- exceeds Apple 44pt guideline
local QUICK_REACT_MIN_SIZE   = 56   -- larger for moving targets
local MAX_QUICK_REACT_WORDS  = 6
local QUESTION_REPEAT_GUARD  = 20
local SLIDE_TWEEN_TIME       = 0.2
local WRONG_SHAKE_TIME       = 0.3
local HINT_DELAY_SEC         = 5
local MAX_LEVENSHTEIN_ACCEPT = 1    -- fuzzy match tolerance

-- Word-type colors for Word Builder tiles
local WORD_COLORS = {
    noun    = Color3.fromRGB(255, 215, 0),
    verb    = Color3.fromRGB(76, 175, 80),
    article = Color3.fromRGB(158, 158, 158),
    adj     = Color3.fromRGB(100, 181, 246),
    prep    = Color3.fromRGB(206, 147, 216),
    default = Color3.fromRGB(224, 224, 224),
}

---------------------------------------------------------------------------
-- Constructor
---------------------------------------------------------------------------
function MobileInputController.new(config)
    local self = setmetatable({}, MobileInputController)

    -- External module references (injected)
    self._questionBank   = config.questionBank       -- QuestionBankV2
    self._eloManager     = config.eloManager         -- EloManager
    self._rewardsManager = config.rewardsManager     -- EnglishRewardsManager
    self._analytics      = config.analytics          -- AnalyticsService
    self._combatSystem   = config.combatSystem       -- CombatSystem
    self._hudController  = config.hudController      -- HUDController_v2

    -- State
    self._currentMode    = nil   -- set by detectPlatform()
    self._activeQuestion = nil
    self._isShowing      = false
    self._isFTUE         = true
    self._sessionStart   = os.clock()
    self._questionsAsked = 0
    self._recentIds      = {}    -- dedup ring buffer
    self._comboCount     = 0
    self._playerSettings = {
        inputMode       = "AUTO",
        difficulty      = "NORMAL",
        quickReactSpeed = "NORMAL",
        showHints       = true,
        mobileKeyboard  = false,
    }

    -- UI references (created lazily)
    self._screenGui      = nil
    self._questionFrame  = nil
    self._timerBar       = nil
    self._timerTween     = nil

    -- Detect platform and set default mode
    self:_detectPlatform()

    return self
end

---------------------------------------------------------------------------
-- Platform Detection (spec section: PLATFORM DETECTION)
---------------------------------------------------------------------------
function MobileInputController:_detectPlatform()
    local touch    = UserInputService.TouchEnabled
    local keyboard = UserInputService.KeyboardEnabled
    local gamepad  = UserInputService.GamepadEnabled

    if touch and not keyboard then
        self._platform = "MOBILE"
        self._currentMode = INPUT_MODES.TAP_SELECT
    elseif touch and keyboard then
        self._platform = "TABLET"
        self._currentMode = INPUT_MODES.TAP_SELECT
    elseif gamepad then
        self._platform = "CONSOLE"
        self._currentMode = INPUT_MODES.TAP_SELECT
    else
        self._platform = "DESKTOP"
        self._currentMode = INPUT_MODES.SPEED_TYPE
    end

    if self._analytics then
        self._analytics:trackEvent("platform_detected", {
            platform = self._platform,
            defaultMode = self._currentMode,
        })
    end
end

function MobileInputController:getInputMode()
    if self._playerSettings.inputMode ~= "AUTO" then
        return self._playerSettings.inputMode
    end
    return self._currentMode
end

function MobileInputController:setInputMode(mode)
    if INPUT_MODES[mode] then
        self._playerSettings.inputMode = mode
        self._currentMode = mode
    end
end

---------------------------------------------------------------------------
-- FTUE Logic (spec: THE 10-SECOND ENGLISH HOOK)
---------------------------------------------------------------------------
function MobileInputController:_getFTUEStage()
    if not self._isFTUE then
        return nil
    end

    local elapsed = os.clock() - self._sessionStart
    local stage = FTUE_STAGES[1]
    for _, s in ipairs(FTUE_STAGES) do
        if elapsed >= s.elapsed then
            stage = s
        end
    end
    return stage
end

function MobileInputController:_exitFTUE()
    self._isFTUE = false
    if self._analytics then
        self._analytics:trackEvent("ftue_complete", {
            questionsAnswered = self._questionsAsked,
            elapsed = os.clock() - self._sessionStart,
        })
    end
end

---------------------------------------------------------------------------
-- Question Selection (dedup + difficulty)
---------------------------------------------------------------------------
function MobileInputController:_selectQuestion(triggerContext)
    if not self._questionBank then
        warn("[MobileInputController] No QuestionBank — cannot select question")
        return nil
    end

    local mode = self:getInputMode()
    local ftueStage = self:_getFTUEStage()
    local optionCount = ftueStage and ftueStage.options or 4
    local difficulty = nil

    if self._eloManager then
        local player = Players.LocalPlayer
        if player then
            local rating = self._eloManager:getPlayerRating(player.UserId)
            difficulty = rating or 1000
        end
    end

    local question = self._questionBank:getQuestion({
        mode = mode,
        optionCount = optionCount,
        difficulty = difficulty,
        excludeIds = self._recentIds,
        triggerContext = triggerContext,
    })

    if question then
        -- Update dedup ring buffer
        table.insert(self._recentIds, question.id)
        if #self._recentIds > QUESTION_REPEAT_GUARD then
            table.remove(self._recentIds, 1)
        end
    end

    return question
end

---------------------------------------------------------------------------
-- Timer System
---------------------------------------------------------------------------
function MobileInputController:_getTimerDuration()
    local mode = self:getInputMode()
    local base = TIMER_DEFAULTS[mode] or 5
    local ftueStage = self:_getFTUEStage()
    if ftueStage then
        return ftueStage.timer
    end
    return base
end

function MobileInputController:_startTimer(duration, onExpire)
    if self._timerTween then
        self._timerTween:Cancel()
    end

    if not self._timerBar then return end

    self._timerBar.Size = UDim2.new(1, 0, 1, 0)
    self._timerBar.BackgroundColor3 = Color3.fromRGB(76, 175, 80)

    local info = TweenInfo.new(duration, Enum.EasingStyle.Linear)
    self._timerTween = TweenService:Create(self._timerBar, info, {
        Size = UDim2.new(0, 0, 1, 0),
    })

    -- Color shift: green -> yellow -> red
    local colorTween = TweenService:Create(self._timerBar,
        TweenInfo.new(duration, Enum.EasingStyle.Linear),
        { BackgroundColor3 = Color3.fromRGB(244, 67, 54) }
    )

    self._timerTween:Play()
    colorTween:Play()

    self._timerTween.Completed:Connect(function(state)
        if state == Enum.PlaybackState.Completed then
            if onExpire then onExpire() end
        end
    end)
end

function MobileInputController:_stopTimer()
    if self._timerTween then
        self._timerTween:Cancel()
        self._timerTween = nil
    end
end

---------------------------------------------------------------------------
-- Reward Calculation
---------------------------------------------------------------------------
function MobileInputController:_calculateReward(correct, mode, partialCredit)
    if not correct and not partialCredit then
        return 0
    end

    local mode = mode or self:getInputMode()
    local ftueStage = self:_getFTUEStage()
    local multiplier = ftueStage and ftueStage.rewardMult or 1
    local base = 0

    if mode == INPUT_MODES.TAP_SELECT then
        local ftue = self:_getFTUEStage()
        local opts = ftue and ftue.options or 4
        base = (opts <= 2) and REWARD_TABLE.TAP_SELECT_2 or REWARD_TABLE.TAP_SELECT_4
    elseif mode == INPUT_MODES.WORD_BUILDER then
        base = REWARD_TABLE.WORD_BUILDER
        if partialCredit and partialCredit < 1 then
            base = math.floor(base * partialCredit)
        end
    elseif mode == INPUT_MODES.SPEED_TYPE then
        base = REWARD_TABLE.SPEED_TYPE
    elseif mode == INPUT_MODES.QUICK_REACT then
        base = REWARD_TABLE.QUICK_REACT
    end

    return math.floor(base * multiplier)
end

---------------------------------------------------------------------------
-- Answer Validation
---------------------------------------------------------------------------
function MobileInputController:_levenshtein(a, b)
    local la, lb = #a, #b
    if la == 0 then return lb end
    if lb == 0 then return la end

    local matrix = {}
    for i = 0, la do
        matrix[i] = { [0] = i }
    end
    for j = 0, lb do
        matrix[0][j] = j
    end

    for i = 1, la do
        for j = 1, lb do
            local cost = (a:sub(i, i) == b:sub(j, j)) and 0 or 1
            matrix[i][j] = math.min(
                matrix[i-1][j] + 1,
                matrix[i][j-1] + 1,
                matrix[i-1][j-1] + cost
            )
        end
    end
    return matrix[la][lb]
end

function MobileInputController:_validateTypedAnswer(input, correct)
    local normInput   = input:lower():gsub("^%s+", ""):gsub("%s+$", "")
    local normCorrect = correct:lower():gsub("^%s+", ""):gsub("%s+$", "")

    if normInput == normCorrect then
        return true, 1.0
    end

    local dist = self:_levenshtein(normInput, normCorrect)
    if dist <= MAX_LEVENSHTEIN_ACCEPT then
        return true, 0.9  -- partial credit for typo
    end

    return false, 0
end

function MobileInputController:_validateWordBuilder(placed, correct)
    if #placed ~= #correct then
        return false, #placed > 0 and (#placed / #correct) or 0
    end

    local matches = 0
    for i, word in ipairs(placed) do
        if word == correct[i] then
            matches = matches + 1
        end
    end

    local ratio = matches / #correct
    return ratio >= 1.0, ratio
end

---------------------------------------------------------------------------
-- Combo System (Quick React integration)
---------------------------------------------------------------------------
function MobileInputController:_onCorrectAnswer(mode)
    self._comboCount = self._comboCount + 1

    if self._comboCount >= 3 and self._combatSystem then
        self._combatSystem:triggerSuperAttack()
        self._comboCount = 0
        if self._analytics then
            self._analytics:trackEvent("super_attack_from_english")
        end
    end

    -- Haptic feedback on mobile
    if self._platform == "MOBILE" or self._platform == "TABLET" then
        pcall(function()
            HapticService:SetMotor(Enum.UserInputType.Gamepad1,
                Enum.VibrationMotor.Small, 0.5)
            task.delay(0.15, function()
                HapticService:SetMotor(Enum.UserInputType.Gamepad1,
                    Enum.VibrationMotor.Small, 0)
            end)
        end)
    end
end

function MobileInputController:_onWrongAnswer()
    self._comboCount = 0
end

---------------------------------------------------------------------------
-- UI Construction (Mobile-First Layout)
---------------------------------------------------------------------------
function MobileInputController:_ensureUI()
    if self._screenGui then return end

    local player = Players.LocalPlayer
    if not player then return end

    local gui = Instance.new("ScreenGui")
    gui.Name = "MobileInputUI"
    gui.ResetOnSpawn = false
    gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
    gui.DisplayOrder = 10
    gui.Parent = player.PlayerGui

    -- Main question frame: bottom 40% of screen, above controls
    local frame = Instance.new("Frame")
    frame.Name = "QuestionPanel"
    frame.Size = UDim2.new(0.9, 0, 0.35, 0)
    frame.Position = UDim2.new(0.05, 0, 1.1, 0) -- starts off-screen
    frame.AnchorPoint = Vector2.new(0, 1)
    frame.BackgroundColor3 = Color3.fromRGB(30, 30, 40)
    frame.BackgroundTransparency = 0.15
    frame.BorderSizePixel = 0
    frame.Parent = gui

    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 12)
    corner.Parent = frame

    local stroke = Instance.new("UIStroke")
    stroke.Color = Color3.fromRGB(100, 100, 140)
    stroke.Thickness = 1
    stroke.Parent = frame

    -- Prompt label
    local prompt = Instance.new("TextLabel")
    prompt.Name = "Prompt"
    prompt.Size = UDim2.new(1, -20, 0, 40)
    prompt.Position = UDim2.new(0, 10, 0, 8)
    prompt.BackgroundTransparency = 1
    prompt.Font = Enum.Font.GothamBold
    prompt.TextSize = 18
    prompt.TextColor3 = Color3.fromRGB(255, 255, 255)
    prompt.TextXAlignment = Enum.TextXAlignment.Left
    prompt.TextWrapped = true
    prompt.Parent = frame

    -- Timer bar container
    local timerContainer = Instance.new("Frame")
    timerContainer.Name = "TimerContainer"
    timerContainer.Size = UDim2.new(1, -20, 0, 6)
    timerContainer.Position = UDim2.new(0, 10, 1, -14)
    timerContainer.BackgroundColor3 = Color3.fromRGB(60, 60, 70)
    timerContainer.BorderSizePixel = 0
    timerContainer.Parent = frame

    local timerCorner = Instance.new("UICorner")
    timerCorner.CornerRadius = UDim.new(0, 3)
    timerCorner.Parent = timerContainer

    local timerFill = Instance.new("Frame")
    timerFill.Name = "Fill"
    timerFill.Size = UDim2.new(1, 0, 1, 0)
    timerFill.BackgroundColor3 = Color3.fromRGB(76, 175, 80)
    timerFill.BorderSizePixel = 0
    timerFill.Parent = timerContainer

    local timerFillCorner = Instance.new("UICorner")
    timerFillCorner.CornerRadius = UDim.new(0, 3)
    timerFillCorner.Parent = timerFill

    -- Answer container (populated per mode)
    local answers = Instance.new("Frame")
    answers.Name = "AnswerContainer"
    answers.Size = UDim2.new(1, -20, 1, -70)
    answers.Position = UDim2.new(0, 10, 0, 52)
    answers.BackgroundTransparency = 1
    answers.Parent = frame

    self._screenGui = gui
    self._questionFrame = frame
    self._promptLabel = prompt
    self._timerBar = timerFill
    self._answerContainer = answers
end

function MobileInputController:_slideIn()
    if not self._questionFrame then return end
    local target = UDim2.new(0.05, 0, 0.82, 0)
    local info = TweenInfo.new(SLIDE_TWEEN_TIME, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
    local tween = TweenService:Create(self._questionFrame, info, { Position = target })
    tween:Play()
end

function MobileInputController:_slideOut(callback)
    if not self._questionFrame then
        if callback then callback() end
        return
    end
    local target = UDim2.new(0.05, 0, 1.1, 0)
    local info = TweenInfo.new(SLIDE_TWEEN_TIME, Enum.EasingStyle.Quad, Enum.EasingDirection.In)
    local tween = TweenService:Create(self._questionFrame, info, { Position = target })
    tween:Play()
    tween.Completed:Connect(function()
        if callback then callback() end
    end)
end

function MobileInputController:_clearAnswers()
    if not self._answerContainer then return end
    for _, child in ipairs(self._answerContainer:GetChildren()) do
        child:Destroy()
    end
end

---------------------------------------------------------------------------
-- Mode 1: TAP SELECT (Primary Mobile)
---------------------------------------------------------------------------
function MobileInputController:_showTapSelect(question)
    self:_clearAnswers()

    local options = { question.correct }
    local ftueStage = self:_getFTUEStage()
    local count = ftueStage and ftueStage.options or 4

    -- Fill distractors
    for _, d in ipairs(question.distractors or {}) do
        if #options < count then
            table.insert(options, d)
        end
    end

    -- Shuffle options
    for i = #options, 2, -1 do
        local j = math.random(1, i)
        options[i], options[j] = options[j], options[i]
    end

    -- Grid layout
    local layout = Instance.new("UIGridLayout")
    layout.CellSize = UDim2.new(0.48, 0, 0, BUTTON_MIN_HEIGHT)
    layout.CellPadding = UDim2.new(0.04, 0, 0, 8)
    layout.HorizontalAlignment = Enum.HorizontalAlignment.Center
    layout.Parent = self._answerContainer

    for _, text in ipairs(options) do
        local btn = Instance.new("TextButton")
        btn.Name = "Option_" .. text
        btn.Text = text
        btn.Font = Enum.Font.GothamBold
        btn.TextSize = 16
        btn.TextColor3 = Color3.fromRGB(255, 255, 255)
        btn.BackgroundColor3 = Color3.fromRGB(55, 55, 75)
        btn.BorderSizePixel = 0
        btn.AutoButtonColor = true
        btn.Parent = self._answerContainer

        local btnCorner = Instance.new("UICorner")
        btnCorner.CornerRadius = UDim.new(0, 8)
        btnCorner.Parent = btn

        btn.Activated:Connect(function()
            self:_stopTimer()
            local correct = (text == question.correct)
            self:_handleAnswer(correct, question, text)
        end)
    end
end

---------------------------------------------------------------------------
-- Mode 2: WORD BUILDER (Tap-to-Place)
---------------------------------------------------------------------------
function MobileInputController:_showWordBuilder(question)
    self:_clearAnswers()

    local correctWords = question.correctSequence or {}
    local allWords = {}
    for _, w in ipairs(correctWords) do
        table.insert(allWords, w)
    end
    for _, w in ipairs(question.distractorWords or {}) do
        table.insert(allWords, w)
    end

    -- Shuffle word bank
    for i = #allWords, 2, -1 do
        local j = math.random(1, i)
        allWords[i], allWords[j] = allWords[j], allWords[i]
    end

    local placed = {}
    local slotCount = #correctWords

    -- Slot area (top half)
    local slotFrame = Instance.new("Frame")
    slotFrame.Name = "Slots"
    slotFrame.Size = UDim2.new(1, 0, 0.4, 0)
    slotFrame.BackgroundTransparency = 1
    slotFrame.Parent = self._answerContainer

    local slotLayout = Instance.new("UIListLayout")
    slotLayout.FillDirection = Enum.FillDirection.Horizontal
    slotLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center
    slotLayout.Padding = UDim.new(0, 6)
    slotLayout.Parent = slotFrame

    local slots = {}
    for i = 1, slotCount do
        local slot = Instance.new("TextButton")
        slot.Name = "Slot_" .. i
        slot.Text = "___"
        slot.Size = UDim2.new(0, 70, 0, 40)
        slot.Font = Enum.Font.GothamBold
        slot.TextSize = 14
        slot.TextColor3 = Color3.fromRGB(180, 180, 180)
        slot.BackgroundColor3 = Color3.fromRGB(45, 45, 60)
        slot.BorderSizePixel = 0
        slot.Parent = slotFrame

        local sc = Instance.new("UICorner")
        sc.CornerRadius = UDim.new(0, 6)
        sc.Parent = slot

        slots[i] = slot

        -- Tap slot to return word to bank
        slot.Activated:Connect(function()
            if placed[i] then
                placed[i] = nil
                slot.Text = "___"
                slot.TextColor3 = Color3.fromRGB(180, 180, 180)
            end
        end)
    end

    -- Word bank (bottom half)
    local bankFrame = Instance.new("Frame")
    bankFrame.Name = "WordBank"
    bankFrame.Size = UDim2.new(1, 0, 0.5, 0)
    bankFrame.Position = UDim2.new(0, 0, 0.45, 0)
    bankFrame.BackgroundTransparency = 1
    bankFrame.Parent = self._answerContainer

    local bankLayout = Instance.new("UIGridLayout")
    bankLayout.CellSize = UDim2.new(0, 80, 0, 36)
    bankLayout.CellPadding = UDim2.new(0, 6, 0, 6)
    bankLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center
    bankLayout.Parent = bankFrame

    for _, word in ipairs(allWords) do
        local tile = Instance.new("TextButton")
        tile.Name = "Word_" .. word
        tile.Text = word
        tile.Font = Enum.Font.GothamBold
        tile.TextSize = 13
        tile.TextColor3 = Color3.fromRGB(20, 20, 20)

        local wordType = question.wordTypes and question.wordTypes[word]
        tile.BackgroundColor3 = WORD_COLORS[wordType] or WORD_COLORS.default
        tile.BorderSizePixel = 0
        tile.Parent = bankFrame

        local tc = Instance.new("UICorner")
        tc.CornerRadius = UDim.new(0, 6)
        tc.Parent = tile

        tile.Activated:Connect(function()
            -- Find first empty slot
            for i = 1, slotCount do
                if not placed[i] then
                    placed[i] = word
                    slots[i].Text = word
                    slots[i].TextColor3 = Color3.fromRGB(255, 255, 255)
                    tile.Visible = false
                    break
                end
            end

            -- Auto-submit if all slots filled
            local allFilled = true
            for i = 1, slotCount do
                if not placed[i] then allFilled = false; break end
            end

            if allFilled then
                self:_stopTimer()
                local ok, ratio = self:_validateWordBuilder(placed, correctWords)
                self:_handleAnswer(ok, question, placed, ratio)
            end
        end)
    end
end

---------------------------------------------------------------------------
-- Mode 3: SPEED TYPE (Desktop Primary)
---------------------------------------------------------------------------
function MobileInputController:_showSpeedType(question)
    self:_clearAnswers()

    local textBox = Instance.new("TextBox")
    textBox.Name = "TypeInput"
    textBox.Size = UDim2.new(1, 0, 0, 44)
    textBox.Position = UDim2.new(0, 0, 0, 0)
    textBox.PlaceholderText = question.hint or "Type your answer..."
    textBox.Text = ""
    textBox.Font = Enum.Font.Gotham
    textBox.TextSize = 16
    textBox.TextColor3 = Color3.fromRGB(255, 255, 255)
    textBox.BackgroundColor3 = Color3.fromRGB(45, 45, 60)
    textBox.ClearTextOnFocus = false
    textBox.BorderSizePixel = 0
    textBox.Parent = self._answerContainer

    local tbCorner = Instance.new("UICorner")
    tbCorner.CornerRadius = UDim.new(0, 8)
    tbCorner.Parent = textBox

    -- Submit button (mobile fallback)
    local submitBtn = Instance.new("TextButton")
    submitBtn.Name = "Submit"
    submitBtn.Text = "SUBMIT"
    submitBtn.Size = UDim2.new(0.4, 0, 0, 40)
    submitBtn.Position = UDim2.new(0.3, 0, 0, 52)
    submitBtn.Font = Enum.Font.GothamBold
    submitBtn.TextSize = 14
    submitBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
    submitBtn.BackgroundColor3 = Color3.fromRGB(76, 175, 80)
    submitBtn.BorderSizePixel = 0
    submitBtn.Parent = self._answerContainer

    local sbCorner = Instance.new("UICorner")
    sbCorner.CornerRadius = UDim.new(0, 8)
    sbCorner.Parent = submitBtn

    -- Progressive hint after HINT_DELAY_SEC
    if self._playerSettings.showHints then
        task.delay(HINT_DELAY_SEC, function()
            if self._isShowing and textBox.Text == "" and textBox.Parent then
                local firstLetter = question.correct:sub(1, 1)
                textBox.PlaceholderText = firstLetter .. "..."
            end
        end)
    end

    local function submit()
        self:_stopTimer()
        local ok, credit = self:_validateTypedAnswer(textBox.Text, question.correct)
        self:_handleAnswer(ok, question, textBox.Text, credit)
    end

    submitBtn.Activated:Connect(submit)
    textBox.FocusLost:Connect(function(enterPressed)
        if enterPressed then submit() end
    end)

    -- Reposition UI above keyboard when focused (mobile)
    if self._platform == "MOBILE" or self._platform == "TABLET" then
        textBox.Focused:Connect(function()
            if self._questionFrame then
                local raised = UDim2.new(0.05, 0, 0.45, 0)
                local info = TweenInfo.new(0.2)
                TweenService:Create(self._questionFrame, info, { Position = raised }):Play()
            end
        end)
        textBox.FocusLost:Connect(function()
            if self._questionFrame then
                local normal = UDim2.new(0.05, 0, 0.82, 0)
                local info = TweenInfo.new(0.2)
                TweenService:Create(self._questionFrame, info, { Position = normal }):Play()
            end
        end)
    end
end

---------------------------------------------------------------------------
-- Mode 4: QUICK REACT (Combat Reflex)
---------------------------------------------------------------------------
function MobileInputController:_showQuickReact(question)
    self:_clearAnswers()

    local targetCategory = question.category or "unknown"
    local words = { question.correct }
    for _, d in ipairs(question.distractors or {}) do
        if #words < MAX_QUICK_REACT_WORDS then
            table.insert(words, d)
        end
    end

    -- Shuffle
    for i = #words, 2, -1 do
        local j = math.random(1, i)
        words[i], words[j] = words[j], words[i]
    end

    -- Instruction label
    local instruction = Instance.new("TextLabel")
    instruction.Name = "Instruction"
    instruction.Text = string.format('Tap the %s!', targetCategory:upper())
    instruction.Size = UDim2.new(1, 0, 0, 30)
    instruction.BackgroundTransparency = 1
    instruction.Font = Enum.Font.GothamBold
    instruction.TextSize = 16
    instruction.TextColor3 = Color3.fromRGB(255, 215, 0)
    instruction.Parent = self._answerContainer

    -- Spawn floating word buttons
    local speed = 1.0
    if self._playerSettings.quickReactSpeed == "SLOW" then speed = 0.7
    elseif self._playerSettings.quickReactSpeed == "FAST" then speed = 1.4 end

    -- Slow down slightly on mobile (touch less precise than click)
    if self._platform == "MOBILE" then speed = speed * 0.85 end

    for i, word in ipairs(words) do
        task.delay((i - 1) * 0.4, function()
            if not self._isShowing then return end
            if not self._answerContainer or not self._answerContainer.Parent then return end

            local btn = Instance.new("TextButton")
            btn.Name = "React_" .. word
            btn.Text = word
            btn.Size = UDim2.new(0, QUICK_REACT_MIN_SIZE + #word * 8, 0, QUICK_REACT_MIN_SIZE)
            btn.Font = Enum.Font.GothamBold
            btn.TextSize = 14
            btn.TextColor3 = Color3.fromRGB(255, 255, 255)
            btn.BackgroundColor3 = Color3.fromRGB(70, 70, 90)
            btn.BorderSizePixel = 0
            btn.AutoButtonColor = true
            btn.Parent = self._answerContainer

            local bc = Instance.new("UICorner")
            bc.CornerRadius = UDim.new(0, QUICK_REACT_MIN_SIZE / 2)
            bc.Parent = btn

            -- Random start position
            local startY = math.random(30, 80) / 100
            btn.Position = UDim2.new(-0.2, 0, startY, 0)

            -- Float across screen
            local duration = 3 / speed
            local moveTween = TweenService:Create(btn,
                TweenInfo.new(duration, Enum.EasingStyle.Linear),
                { Position = UDim2.new(1.2, 0, startY + math.random(-10, 10) / 100, 0) }
            )
            moveTween:Play()
            moveTween.Completed:Connect(function()
                if btn.Parent then btn:Destroy() end
            end)

            btn.Activated:Connect(function()
                local isCorrect = (word == question.correct)
                btn:Destroy()
                if isCorrect then
                    self:_onCorrectAnswer(INPUT_MODES.QUICK_REACT)
                    local reward = self:_calculateReward(true, INPUT_MODES.QUICK_REACT)
                    if self._rewardsManager then
                        self._rewardsManager:grantReward(Players.LocalPlayer, reward, "quick_react")
                    end
                else
                    self:_onWrongAnswer()
                    -- 0.5s stun effect (brief)
                end

                if self._analytics then
                    self._analytics:trackEvent("quick_react_tap", {
                        word = word,
                        correct = isCorrect,
                        combo = self._comboCount,
                    })
                end
            end)
        end)
    end
end

---------------------------------------------------------------------------
-- Answer Handler (unified across modes)
---------------------------------------------------------------------------
function MobileInputController:_handleAnswer(correct, question, answer, partialCredit)
    local mode = self:getInputMode()
    self._questionsAsked = self._questionsAsked + 1

    if correct then
        self:_onCorrectAnswer(mode)
        self:_showFeedback(true)
    else
        self:_onWrongAnswer()
        self:_showFeedback(false)
    end

    -- Calculate and grant reward
    local reward = self:_calculateReward(correct, mode, partialCredit)
    if reward > 0 and self._rewardsManager then
        local player = Players.LocalPlayer
        if player then
            self._rewardsManager:grantReward(player, reward, mode:lower())
        end
    end

    -- Combat damage boost on correct
    if correct and self._combatSystem then
        local boost = (mode == INPUT_MODES.SPEED_TYPE) and 2.0 or 1.5
        self._combatSystem:applyDamageBoost(boost, 5) -- 5 seconds
    end

    -- Update Elo
    if self._eloManager and question then
        local player = Players.LocalPlayer
        if player then
            self._eloManager:updateRating(player.UserId, {
                correct = correct,
                difficulty = question.difficulty or 5,
                mode = mode,
            })
        end
    end

    -- Analytics
    if self._analytics then
        self._analytics:trackEvent("english_answer", {
            mode = mode,
            correct = correct,
            questionId = question and question.id,
            reward = reward,
            combo = self._comboCount,
            ftue = self._isFTUE,
            platform = self._platform,
            partialCredit = partialCredit,
        })
    end

    -- Auto-dismiss after brief feedback
    task.delay(correct and 0.8 or 1.2, function()
        self:dismiss()
    end)

    -- Check FTUE exit
    if self._isFTUE and self._questionsAsked >= 4 then
        self:_exitFTUE()
    end
end

function MobileInputController:_showFeedback(correct)
    if not self._questionFrame then return end

    local color = correct
        and Color3.fromRGB(76, 175, 80)
        or Color3.fromRGB(244, 67, 54)

    local flash = TweenService:Create(self._questionFrame,
        TweenInfo.new(0.15, Enum.EasingStyle.Quad),
        { BackgroundColor3 = color }
    )
    flash:Play()

    task.delay(0.3, function()
        if self._questionFrame and self._questionFrame.Parent then
            TweenService:Create(self._questionFrame,
                TweenInfo.new(0.2),
                { BackgroundColor3 = Color3.fromRGB(30, 30, 40) }
            ):Play()
        end
    end)

    if not correct and self._questionFrame then
        -- Shake animation
        local orig = self._questionFrame.Position
        for i = 1, 3 do
            task.delay(i * 0.05, function()
                if self._questionFrame and self._questionFrame.Parent then
                    local offset = (i % 2 == 0) and 5 or -5
                    self._questionFrame.Position = UDim2.new(
                        orig.X.Scale, orig.X.Offset + offset,
                        orig.Y.Scale, orig.Y.Offset
                    )
                end
            end)
        end
        task.delay(0.2, function()
            if self._questionFrame and self._questionFrame.Parent then
                self._questionFrame.Position = orig
            end
        end)
    end
end

---------------------------------------------------------------------------
-- Public API
---------------------------------------------------------------------------

-- Show a question (called by combat triggers, FTUE, etc.)
function MobileInputController:showQuestion(triggerContext)
    if self._isShowing then return false end

    local question = self:_selectQuestion(triggerContext)
    if not question then
        warn("[MobileInputController] No question available")
        return false
    end

    self._isShowing = true
    self._activeQuestion = question
    self:_ensureUI()

    -- Set prompt text
    if self._promptLabel then
        self._promptLabel.Text = question.prompt or "Answer the question:"
    end

    -- Render mode-specific UI
    local mode = self:getInputMode()
    if mode == INPUT_MODES.TAP_SELECT then
        self:_showTapSelect(question)
    elseif mode == INPUT_MODES.WORD_BUILDER then
        self:_showWordBuilder(question)
    elseif mode == INPUT_MODES.SPEED_TYPE then
        self:_showSpeedType(question)
    elseif mode == INPUT_MODES.QUICK_REACT then
        self:_showQuickReact(question)
        -- Quick React manages its own timing
        self:_slideIn()
        return true
    end

    self:_slideIn()

    -- Start timer
    local duration = self:_getTimerDuration()
    self:_startTimer(duration, function()
        -- Timeout = wrong answer
        self:_handleAnswer(false, question, nil, 0)
    end)

    return true
end

-- Dismiss the question UI
function MobileInputController:dismiss()
    if not self._isShowing then return end
    self._isShowing = false
    self._activeQuestion = nil
    self:_stopTimer()
    self:_slideOut(function()
        self:_clearAnswers()
    end)
end

-- Check if a question is currently showing
function MobileInputController:isActive()
    return self._isShowing
end

-- Update player settings
function MobileInputController:updateSettings(settings)
    for k, v in pairs(settings) do
        if self._playerSettings[k] ~= nil then
            self._playerSettings[k] = v
        end
    end

    -- Re-detect mode if auto
    if settings.inputMode == "AUTO" then
        self:_detectPlatform()
    elseif settings.inputMode and INPUT_MODES[settings.inputMode] then
        self._currentMode = settings.inputMode
    end

    -- Enable/disable mobile keyboard
    if settings.mobileKeyboard ~= nil then
        if settings.mobileKeyboard and self._platform == "MOBILE" then
            self._currentMode = INPUT_MODES.SPEED_TYPE
        elseif not settings.mobileKeyboard and self._platform == "MOBILE" then
            self._currentMode = INPUT_MODES.TAP_SELECT
        end
    end
end

-- Get current state for analytics/debugging
function MobileInputController:getState()
    return {
        platform       = self._platform,
        currentMode    = self._currentMode,
        isShowing      = self._isShowing,
        isFTUE         = self._isFTUE,
        questionsAsked = self._questionsAsked,
        comboCount     = self._comboCount,
        settings       = self._playerSettings,
    }
end

-- Cleanup
function MobileInputController:destroy()
    self:_stopTimer()
    if self._screenGui then
        self._screenGui:Destroy()
        self._screenGui = nil
    end
    self._questionFrame = nil
    self._timerBar = nil
    self._answerContainer = nil
    self._promptLabel = nil
end

---------------------------------------------------------------------------
-- Trigger Points Integration
-- Called by CombatSystem/FTUEController/etc at defined trigger points
---------------------------------------------------------------------------

-- Combat trigger: every 3rd kill streak
function MobileInputController:onKillStreak(streakCount)
    if streakCount % 3 == 0 and not self._isShowing then
        self:showQuestion({ trigger = "kill_streak", streak = streakCount })
    end
end

-- Boss phase transition
function MobileInputController:onBossPhase(bossName, phase)
    if not self._isShowing then
        local prevMode = self._currentMode
        if self._platform ~= "DESKTOP" then
            self._currentMode = INPUT_MODES.WORD_BUILDER
        end
        self:showQuestion({ trigger = "boss_phase", boss = bossName, phase = phase })
        self._currentMode = prevMode
    end
end

-- Treasure/loot trigger
function MobileInputController:onTreasure()
    if not self._isShowing then
        self:showQuestion({ trigger = "treasure" })
    end
end

-- PvP arena trigger
function MobileInputController:onPvPRound()
    if not self._isShowing then
        local prevMode = self._currentMode
        self._currentMode = INPUT_MODES.QUICK_REACT
        self:showQuestion({ trigger = "pvp" })
        self._currentMode = prevMode
    end
end

-- FTUE first question (called by FTUEController at second 5)
function MobileInputController:onFTUETrigger()
    self._isFTUE = true
    self._sessionStart = os.clock()
    self:showQuestion({ trigger = "ftue" })
end

-- Daily challenge
function MobileInputController:onDailyChallenge()
    if not self._isShowing then
        local prevMode = self._currentMode
        if self._platform == "DESKTOP" then
            self._currentMode = INPUT_MODES.SPEED_TYPE
        else
            self._currentMode = INPUT_MODES.WORD_BUILDER
        end
        self:showQuestion({ trigger = "daily_challenge" })
        self._currentMode = prevMode
    end
end

return MobileInputController
