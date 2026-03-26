--[[
    CombatSystem.lua — THE Core Game Loop
    Skibidi Zombie: Survive the Brainrots
    
    PURPOSE: Player answers English questions → damage enemies.
    Wrong answer = take damage. Boss fights = harder questions.
    
    MISSION: Teach English naturally through play.
    NOT ESL. NOT about money. Natural English Training.
    
    Teaching Law: Mouse → Tiger (permission over perfection)
    
    Architecture: ServerScript (ServerScriptService)
    Dependencies: ServerGateway, QuestionBank, EnemyFactory, EconomyManager
    Version: 1.0.0
    Date: 2026-03-26
--]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")
local ServerStorage = game:GetService("ServerStorage")
local RunService = game:GetService("RunService")

-- Module requires (lazy-loaded for boot order safety)
local ServerGateway = nil
local QuestionBank = nil
local EnemyFactory = nil
local EconomyManager = nil

local CombatSystem = {}
CombatSystem.__index = CombatSystem

--------------------------------------------------------------------------------
-- CONSTANTS
--------------------------------------------------------------------------------

local CONFIG = {
    -- Difficulty tiers (Mouse → Tiger progression)
    TIERS = {
        { name = "Mouse",    tier = 1, damageMultiplier = 1.0, timeLimit = 15 },
        { name = "Cat",      tier = 2, damageMultiplier = 1.2, timeLimit = 12 },
        { name = "Wolf",     tier = 3, damageMultiplier = 1.5, timeLimit = 10 },
        { name = "Lion",     tier = 4, damageMultiplier = 2.0, timeLimit = 8  },
        { name = "Tiger",    tier = 5, damageMultiplier = 3.0, timeLimit = 6  },
    },
    
    -- Combat tuning
    BASE_PLAYER_HEALTH = 100,
    BASE_PLAYER_DAMAGE = 10,
    WRONG_ANSWER_DAMAGE = 15,          -- damage TO player on wrong answer
    COMBO_BONUS_PER_STREAK = 0.1,       -- +10% damage per streak
    MAX_COMBO_MULTIPLIER = 3.0,         -- cap at 3x
    BOSS_HEALTH_MULTIPLIER = 5.0,       -- bosses have 5x health
    BOSS_QUESTION_COUNT = 3,            -- boss fights require 3 correct answers
    
    -- Timing
    QUESTION_COOLDOWN = 1.0,            -- seconds between questions
    COMBAT_TICK_RATE = 0.5,             -- seconds between enemy AI ticks
    ENEMY_ATTACK_INTERVAL = 3.0,        -- seconds between enemy auto-attacks
    
    -- Rewards (coins are a teaching metric, not monetization)
    CORRECT_ANSWER_COINS = 5,
    BOSS_KILL_COINS = 25,
    WAVE_CLEAR_COINS = 50,
    COMBO_BONUS_COINS = 2,              -- per streak level
    
    -- English Power-Up
    POWER_UP_CHARGE_PER_CORRECT = 20,   -- 5 correct = full charge
    POWER_UP_MAX_CHARGE = 100,
    POWER_UP_DAMAGE_MULTIPLIER = 5.0,   -- massive burst on activation
    POWER_UP_DURATION = 5.0,            -- seconds of powered-up state
}

--------------------------------------------------------------------------------
-- PLAYER COMBAT STATE
--------------------------------------------------------------------------------

local playerStates = {} -- [Player] = CombatState

local function createCombatState(player)
    return {
        player = player,
        health = CONFIG.BASE_PLAYER_HEALTH,
        maxHealth = CONFIG.BASE_PLAYER_HEALTH,
        currentTier = 1,                -- starts at Mouse
        combo = 0,                      -- current answer streak
        bestCombo = 0,                  -- session best
        totalCorrect = 0,
        totalWrong = 0,
        totalKills = 0,
        bossKills = 0,
        currentQuestion = nil,          -- active question data
        questionStartTime = 0,
        isInCombat = false,
        targetEnemy = nil,              -- current enemy being fought
        powerUpCharge = 0,
        isPoweredUp = false,
        poweredUpUntil = 0,
        lastQuestionTime = 0,
        isAlive = true,
        wavesCleared = 0,
        
        -- Teaching metrics (the REAL purpose)
        questionsAnswered = 0,
        averageResponseTime = 0,
        totalResponseTime = 0,
        vocabularyMastered = {},        -- words answered correctly 3+ times
        vocabularyStruggling = {},      -- words answered wrong 2+ times
        tierProgressHistory = {},       -- track tier changes over time
    }
end

--------------------------------------------------------------------------------
-- CORE COMBAT LOOP
--------------------------------------------------------------------------------

--[[
    The combat loop:
    1. Enemy appears (from WaveManager/EnemyFactory)
    2. Player gets an English question matched to their tier
    3. Player answers:
       - CORRECT → deal damage to enemy, advance combo, gain coins
       - WRONG → take damage, reset combo, track struggling word
    4. If enemy dies → next enemy or wave complete
    5. If player dies → respawn with encouragement (Mouse → Tiger)
    6. Boss fights → 3 questions, harder tier, bigger reward
--]]

function CombatSystem.Init()
    -- Lazy-load dependencies
    local ok1, gw = pcall(require, ServerStorage:FindFirstChild("ServerGateway"))
    if ok1 then ServerGateway = gw end
    
    local ok2, qb = pcall(require, ServerStorage:FindFirstChild("QuestionBank"))
    if ok2 then QuestionBank = qb end
    
    local ok3, ef = pcall(require, ServerStorage:FindFirstChild("EnemyFactory"))
    if ok3 then EnemyFactory = ef end
    
    local ok4, em = pcall(require, ServerStorage:FindFirstChild("EconomyManager"))
    if ok4 then EconomyManager = em end
    
    -- Player lifecycle
    Players.PlayerAdded:Connect(function(player)
        playerStates[player] = createCombatState(player)
    end)
    
    Players.PlayerRemoving:Connect(function(player)
        -- Save teaching metrics before cleanup
        CombatSystem._saveTeachingMetrics(player)
        playerStates[player] = nil
    end)
    
    -- Initialize existing players (late join safety)
    for _, player in ipairs(Players:GetPlayers()) do
        if not playerStates[player] then
            playerStates[player] = createCombatState(player)
        end
    end
    
    print("[CombatSystem] Initialized — Mouse → Tiger ready")
    return true
end

--------------------------------------------------------------------------------
-- QUESTION DELIVERY
--------------------------------------------------------------------------------

function CombatSystem.ServeQuestion(player, enemy)
    local state = playerStates[player]
    if not state then return nil end
    if not state.isAlive then return nil end
    
    -- Cooldown check
    local now = tick()
    if now - state.lastQuestionTime < CONFIG.QUESTION_COOLDOWN then
        return nil
    end
    
    -- Get question from QuestionBank matched to player's tier
    local tierConfig = CONFIG.TIERS[state.currentTier] or CONFIG.TIERS[1]
    local isBoss = enemy and enemy.isBoss
    local questionTier = isBoss and math.min(state.currentTier + 1, 5) or state.currentTier
    
    local question = nil
    if QuestionBank then
        question = QuestionBank.GetQuestion(questionTier, state.vocabularyMastered, state.vocabularyStruggling)
    else
        -- Fallback: hardcoded starter questions (for testing without QuestionBank)
        question = CombatSystem._getFallbackQuestion(questionTier)
    end
    
    if not question then
        warn("[CombatSystem] No question available for tier " .. questionTier)
        return nil
    end
    
    -- Set active question state
    state.currentQuestion = question
    state.questionStartTime = now
    state.lastQuestionTime = now
    state.targetEnemy = enemy
    
    -- Return question data for client UI
    return {
        questionId = question.id,
        prompt = question.prompt,
        options = question.options,        -- nil for free-type, array for multiple choice
        tier = tierConfig.name,
        timeLimit = tierConfig.timeLimit,
        isBoss = isBoss,
        enemyName = enemy and enemy.name or "Unknown",
        combo = state.combo,
        powerUpCharge = state.powerUpCharge,
    }
end

--------------------------------------------------------------------------------
-- ANSWER PROCESSING (SERVER-SIDE VALIDATION ONLY)
--------------------------------------------------------------------------------

function CombatSystem.ProcessAnswer(player, answerId)
    local state = playerStates[player]
    if not state then return { success = false, reason = "NO_STATE" } end
    if not state.currentQuestion then return { success = false, reason = "NO_QUESTION" } end
    if not state.isAlive then return { success = false, reason = "DEAD" } end
    
    local question = state.currentQuestion
    local now = tick()
    local responseTime = now - state.questionStartTime
    local tierConfig = CONFIG.TIERS[state.currentTier] or CONFIG.TIERS[1]
    
    -- Time limit check
    if responseTime > tierConfig.timeLimit then
        return CombatSystem._handleWrongAnswer(state, question, responseTime, "TIME_UP")
    end
    
    -- Validate answer (SERVER-SIDE — never trust client)
    local isCorrect = false
    if QuestionBank then
        isCorrect = QuestionBank.ValidateAnswer(question.id, answerId)
    else
        isCorrect = (answerId == question.correctAnswer)
    end
    
    -- Clear current question
    state.currentQuestion = nil
    state.questionsAnswered = state.questionsAnswered + 1
    state.totalResponseTime = state.totalResponseTime + responseTime
    state.averageResponseTime = state.totalResponseTime / state.questionsAnswered
    
    if isCorrect then
        return CombatSystem._handleCorrectAnswer(state, question, responseTime)
    else
        return CombatSystem._handleWrongAnswer(state, question, responseTime, "WRONG")
    end
end

--------------------------------------------------------------------------------
-- CORRECT ANSWER
--------------------------------------------------------------------------------

function CombatSystem._handleCorrectAnswer(state, question, responseTime)
    local tierConfig = CONFIG.TIERS[state.currentTier] or CONFIG.TIERS[1]
    
    -- Advance combo
    state.combo = state.combo + 1
    state.totalCorrect = state.totalCorrect + 1
    if state.combo > state.bestCombo then
        state.bestCombo = state.combo
    end
    
    -- Calculate damage
    local comboMultiplier = math.min(
        1.0 + (state.combo * CONFIG.COMBO_BONUS_PER_STREAK),
        CONFIG.MAX_COMBO_MULTIPLIER
    )
    local damage = CONFIG.BASE_PLAYER_DAMAGE * tierConfig.damageMultiplier * comboMultiplier
    
    -- Power-Up bonus
    if state.isPoweredUp and tick() < state.poweredUpUntil then
        damage = damage * CONFIG.POWER_UP_DAMAGE_MULTIPLIER
    end
    
    -- Charge Power-Up
    state.powerUpCharge = math.min(
        state.powerUpCharge + CONFIG.POWER_UP_CHARGE_PER_CORRECT,
        CONFIG.POWER_UP_MAX_CHARGE
    )
    
    -- Apply damage to enemy
    local enemyKilled = false
    local enemy = state.targetEnemy
    if enemy then
        enemy.health = (enemy.health or 0) - damage
        if enemy.health <= 0 then
            enemyKilled = true
            state.totalKills = state.totalKills + 1
            if enemy.isBoss then
                state.bossKills = state.bossKills + 1
            end
        end
    end
    
    -- Track vocabulary mastery
    local word = question.targetWord
    if word then
        state.vocabularyMastered[word] = (state.vocabularyMastered[word] or 0) + 1
        -- Remove from struggling if mastered (3+ correct)
        if state.vocabularyMastered[word] >= 3 and state.vocabularyStruggling[word] then
            state.vocabularyStruggling[word] = nil
        end
    end
    
    -- Reward coins (teaching metric, not monetization)
    local coins = CONFIG.CORRECT_ANSWER_COINS + (state.combo * CONFIG.COMBO_BONUS_COINS)
    if enemyKilled and enemy and enemy.isBoss then
        coins = coins + CONFIG.BOSS_KILL_COINS
    elseif enemyKilled then
        coins = coins + 10
    end
    
    if EconomyManager then
        EconomyManager.AddCurrency(state.player, "EnglishCoins", coins)
    end
    
    -- Tier progression check (every 10 correct answers, consider tier up)
    if state.totalCorrect % 10 == 0 and state.totalCorrect > 0 then
        CombatSystem._checkTierProgression(state)
    end
    
    -- Build response
    return {
        success = true,
        correct = true,
        damage = math.floor(damage),
        combo = state.combo,
        coins = coins,
        enemyKilled = enemyKilled,
        powerUpCharge = state.powerUpCharge,
        powerUpReady = state.powerUpCharge >= CONFIG.POWER_UP_MAX_CHARGE,
        tier = tierConfig.name,
        responseTime = math.floor(responseTime * 100) / 100,
        -- Teaching feedback
        encouragement = CombatSystem._getEncouragement(state.combo, enemyKilled),
        vocabularyProgress = state.vocabularyMastered[question.targetWord] or 0,
    }
end

--------------------------------------------------------------------------------
-- WRONG ANSWER
--------------------------------------------------------------------------------

function CombatSystem._handleWrongAnswer(state, question, responseTime, reason)
    -- Reset combo (but preserve teaching data)
    local lostCombo = state.combo
    state.combo = 0
    state.totalWrong = state.totalWrong + 1
    
    -- Player takes damage
    local damage = CONFIG.WRONG_ANSWER_DAMAGE
    state.health = math.max(0, state.health - damage)
    
    -- Track struggling vocabulary
    local word = question.targetWord
    if word then
        state.vocabularyStruggling[word] = (state.vocabularyStruggling[word] or 0) + 1
    end
    
    -- Check death
    local died = false
    if state.health <= 0 then
        died = true
        state.isAlive = false
        -- Respawn after delay (Mouse → Tiger: encourage, don't punish)
        task.delay(3.0, function()
            if state and state.player and state.player.Parent then
                CombatSystem.Respawn(state.player)
            end
        end)
    end
    
    -- Tier regression check (if accuracy drops below 40%, step down)
    if state.questionsAnswered > 5 then
        local accuracy = state.totalCorrect / state.questionsAnswered
        if accuracy < 0.4 and state.currentTier > 1 then
            state.currentTier = state.currentTier - 1
            table.insert(state.tierProgressHistory, {
                time = tick(),
                tier = state.currentTier,
                reason = "accuracy_drop",
                accuracy = accuracy,
            })
        end
    end
    
    local tierConfig = CONFIG.TIERS[state.currentTier] or CONFIG.TIERS[1]
    
    return {
        success = true,
        correct = false,
        reason = reason,
        damageTaken = damage,
        health = state.health,
        maxHealth = state.maxHealth,
        died = died,
        lostCombo = lostCombo,
        tier = tierConfig.name,
        correctAnswer = question.correctAnswer,
        explanation = question.explanation or "",
        -- Teaching feedback (Mouse → Tiger: show the right answer, encourage retry)
        encouragement = died 
            and "You'll get stronger! Every answer teaches you something new." 
            or "Almost! The answer was: " .. tostring(question.correctAnswer),
    }
end

--------------------------------------------------------------------------------
-- ENGLISH POWER-UP
--------------------------------------------------------------------------------

function CombatSystem.ActivatePowerUp(player)
    local state = playerStates[player]
    if not state then return false end
    if state.powerUpCharge < CONFIG.POWER_UP_MAX_CHARGE then return false end
    if state.isPoweredUp then return false end
    
    state.isPoweredUp = true
    state.poweredUpUntil = tick() + CONFIG.POWER_UP_DURATION
    state.powerUpCharge = 0
    
    -- Auto-deactivate after duration
    task.delay(CONFIG.POWER_UP_DURATION, function()
        if state then
            state.isPoweredUp = false
        end
    end)
    
    return true
end

--------------------------------------------------------------------------------
-- TIER PROGRESSION (Mouse → Tiger)
--------------------------------------------------------------------------------

function CombatSystem._checkTierProgression(state)
    local accuracy = state.totalCorrect / math.max(1, state.questionsAnswered)
    local avgTime = state.averageResponseTime
    local currentTier = state.currentTier
    
    -- Tier up conditions: >70% accuracy AND improving speed
    if accuracy > 0.7 and currentTier < 5 then
        local tierConfig = CONFIG.TIERS[currentTier]
        if avgTime < tierConfig.timeLimit * 0.6 then  -- answering in <60% of time limit
            state.currentTier = currentTier + 1
            table.insert(state.tierProgressHistory, {
                time = tick(),
                tier = state.currentTier,
                reason = "mastery",
                accuracy = accuracy,
                avgTime = avgTime,
            })
        end
    end
end

--------------------------------------------------------------------------------
-- RESPAWN (Mouse → Tiger: Encourage, Don't Punish)
--------------------------------------------------------------------------------

function CombatSystem.Respawn(player)
    local state = playerStates[player]
    if not state then return end
    
    state.health = state.maxHealth
    state.isAlive = true
    state.combo = 0
    -- NOTE: Do NOT reset tier, vocabulary, or teaching progress on death
    -- Death is a learning moment, not a punishment
    
    -- Notify client
    if ServerGateway then
        ServerGateway.SendToPlayer(player, "Respawn", {
            health = state.health,
            tier = CONFIG.TIERS[state.currentTier].name,
            message = "Back in the fight! You've learned " 
                .. tostring(CombatSystem._countMastered(state)) 
                .. " words so far!",
        })
    end
end

--------------------------------------------------------------------------------
-- TEACHING METRICS
--------------------------------------------------------------------------------

function CombatSystem._saveTeachingMetrics(player)
    local state = playerStates[player]
    if not state then return end
    
    -- This data feeds back into the teaching system
    -- NOT for monetization — for understanding how the player learns
    local metrics = {
        totalQuestions = state.questionsAnswered,
        accuracy = state.questionsAnswered > 0 
            and (state.totalCorrect / state.questionsAnswered) or 0,
        averageResponseTime = state.averageResponseTime,
        wordsLearned = CombatSystem._countMastered(state),
        wordsStruggling = CombatSystem._countStruggling(state),
        highestTier = state.currentTier,
        bestCombo = state.bestCombo,
        wavesCleared = state.wavesCleared,
        tierHistory = state.tierProgressHistory,
    }
    
    -- TODO: Persist to DataStoreV2
    print(string.format(
        "[CombatSystem] Player %s session: %d questions, %.0f%% accuracy, %d words learned, tier %s",
        player.Name,
        metrics.totalQuestions,
        metrics.accuracy * 100,
        metrics.wordsLearned,
        CONFIG.TIERS[state.currentTier].name
    ))
end

function CombatSystem._countMastered(state)
    local count = 0
    for _, v in pairs(state.vocabularyMastered) do
        if v >= 3 then count = count + 1 end
    end
    return count
end

function CombatSystem._countStruggling(state)
    local count = 0
    for _ in pairs(state.vocabularyStruggling) do
        count = count + 1
    end
    return count
end

--------------------------------------------------------------------------------
-- ENCOURAGEMENT SYSTEM (Mouse → Tiger tone)
--------------------------------------------------------------------------------

function CombatSystem._getEncouragement(combo, enemyKilled)
    if enemyKilled and combo >= 10 then
        return "TIGER MODE! " .. combo .. " streak! You're unstoppable!"
    elseif enemyKilled and combo >= 5 then
        return "Wolf pack energy! " .. combo .. " answers straight!"
    elseif enemyKilled then
        return "Enemy defeated! Keep hunting!"
    elseif combo >= 10 then
        return "🔥 " .. combo .. " STREAK! You're on fire!"
    elseif combo >= 5 then
        return "Nice streak! " .. combo .. " in a row!"
    elseif combo >= 3 then
        return "Building momentum! " .. combo .. " correct!"
    elseif combo == 1 then
        return "Good start!"
    else
        return "Let's go!"
    end
end

--------------------------------------------------------------------------------
-- FALLBACK QUESTIONS (for testing without QuestionBank module)
--------------------------------------------------------------------------------

function CombatSystem._getFallbackQuestion(tier)
    local fallbackQuestions = {
        -- Tier 1: Mouse (super easy, build confidence)
        { id = "fb_1", prompt = "What does 'Hello' mean?", correctAnswer = "greeting", 
          options = {"greeting", "goodbye", "thank you", "sorry"}, targetWord = "hello",
          explanation = "'Hello' is a friendly greeting!", tier = 1 },
        { id = "fb_2", prompt = "Choose the correct word: 'I ___ happy'", correctAnswer = "am",
          options = {"am", "is", "are", "be"}, targetWord = "am",
          explanation = "'I am' — first person singular!", tier = 1 },
        -- Tier 2: Cat
        { id = "fb_3", prompt = "What's the opposite of 'big'?", correctAnswer = "small",
          options = {"small", "tall", "wide", "long"}, targetWord = "opposite",
          explanation = "Big ↔ Small — they're opposites!", tier = 2 },
        -- Tier 3: Wolf  
        { id = "fb_4", prompt = "Which sentence is correct?", correctAnswer = "She has been waiting",
          options = {"She has been waiting", "She have been waiting", "She has be waiting", "She been has waiting"},
          targetWord = "present_perfect_continuous", 
          explanation = "Present perfect continuous: has/have + been + -ing", tier = 3 },
        -- Tier 4: Lion
        { id = "fb_5", prompt = "What does 'ubiquitous' mean?", correctAnswer = "found everywhere",
          options = {"found everywhere", "very rare", "extremely loud", "quite small"},
          targetWord = "ubiquitous",
          explanation = "'Ubiquitous' means present, appearing, or found everywhere.", tier = 4 },
        -- Tier 5: Tiger
        { id = "fb_6", prompt = "Identify the literary device: 'The wind whispered through the trees'",
          correctAnswer = "personification",
          options = {"personification", "simile", "metaphor", "alliteration"},
          targetWord = "personification",
          explanation = "Personification gives human qualities to non-human things.", tier = 5 },
    }
    
    -- Filter by tier and return random
    local tierQuestions = {}
    for _, q in ipairs(fallbackQuestions) do
        if q.tier <= tier then
            table.insert(tierQuestions, q)
        end
    end
    
    if #tierQuestions == 0 then
        return fallbackQuestions[1]
    end
    
    return tierQuestions[math.random(#tierQuestions)]
end

--------------------------------------------------------------------------------
-- PUBLIC API
--------------------------------------------------------------------------------

function CombatSystem.GetPlayerState(player)
    return playerStates[player]
end

function CombatSystem.GetConfig()
    return CONFIG
end

function CombatSystem.SetPlayerInCombat(player, inCombat)
    local state = playerStates[player]
    if state then
        state.isInCombat = inCombat
    end
end

function CombatSystem.OnWaveCleared(player)
    local state = playerStates[player]
    if not state then return end
    state.wavesCleared = state.wavesCleared + 1
    if EconomyManager then
        EconomyManager.AddCurrency(state.player, "EnglishCoins", CONFIG.WAVE_CLEAR_COINS)
    end
end

return CombatSystem
