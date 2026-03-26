--[[
    SecurityLayer.lua — Server-Side Validation & Anti-Cheat
    Skibidi Zombie: Survive the Brainrots
    
    GOAL: MAKE MONEY. Protect the revenue.
    
    Blocks: client-side currency fabrication, RemoteEvent spam,
    answer speed hacking, score manipulation, duplicate exploits.
    
    Architecture: ModuleScript (ServerStorage)
    Version: 1.0.0
    Date: 2026-03-26
--]]

local Players = game:GetService("Players")
local SecurityLayer = {}

local CONFIG = {
    RATE_LIMITS = {
        RequestQuestion  = { maxRequests = 5,  windowSeconds = 3  },
        SubmitAnswer     = { maxRequests = 5,  windowSeconds = 3  },
        ActivatePowerUp  = { maxRequests = 2,  windowSeconds = 10 },
        PurchaseItem     = { maxRequests = 3,  windowSeconds = 5  },
        TradeRequest     = { maxRequests = 2,  windowSeconds = 10 },
        DEFAULT          = { maxRequests = 10, windowSeconds = 5  },
    },
    MIN_ANSWER_TIME = 0.3,
    SUSPICIOUS_SPEED_THRESHOLD = 3,
    MAX_COINS_PER_ACTION = 200,
    MAX_PREMIUM_PER_ACTION = 50,
    MAX_VIOLATIONS_BEFORE_KICK = 10,
    VIOLATION_DECAY_SECONDS = 300,
}

local playerSecurity = {}

local function createSecurityState(player)
    return {
        player = player,
        requestLog = {},
        violations = {},
        violationCount = 0,
        fastAnswerStreak = 0,
        lastAnswerTime = 0,
        isFlagged = false,
        isBanned = false,
        currencyChanges = {},
        sessionEarned = { EnglishCoins = 0, PremiumGems = 0 },
    }
end

function SecurityLayer.Init()
    Players.PlayerAdded:Connect(function(player)
        playerSecurity[player] = createSecurityState(player)
    end)
    Players.PlayerRemoving:Connect(function(player)
        local state = playerSecurity[player]
        if state and state.isFlagged then
            warn(string.format("[SecurityLayer] FLAGGED player leaving: %s — %d violations", player.Name, state.violationCount))
        end
        playerSecurity[player] = nil
    end)
    for _, player in ipairs(Players:GetPlayers()) do
        if not playerSecurity[player] then
            playerSecurity[player] = createSecurityState(player)
        end
    end
    print("[SecurityLayer] Initialized — fail-closed, server-authoritative")
    return true
end

function SecurityLayer._recordViolation(state, violationType, details)
    state.violationCount = state.violationCount + 1
    table.insert(state.violations, {
        time = tick(),
        type = violationType,
        details = details,
    })
    if #state.violations > 50 then
        table.remove(state.violations, 1)
    end
    if state.violationCount >= CONFIG.MAX_VIOLATIONS_BEFORE_KICK then
        state.isBanned = true
        if state.player and state.player.Parent then
            state.player:Kick("[Anti-Cheat] Suspicious activity detected.")
        end
    end
    if CONFIG.LOG_ALL_VIOLATIONS ~= false then
        warn(string.format("[SecurityLayer] VIOLATION: %s — %s — %s",
            state.player and state.player.Name or "?",
            violationType,
            tostring(details and details.event or "")
        ))
    end
end

function SecurityLayer.CheckRateLimit(player, eventName)
    local state = playerSecurity[player]
    if not state then return false end
    if state.isBanned then return false end
    
    local now = tick()
    local limit = CONFIG.RATE_LIMITS[eventName] or CONFIG.RATE_LIMITS.DEFAULT
    
    if not state.requestLog[eventName] then
        state.requestLog[eventName] = {}
    end
    
    local log = state.requestLog[eventName]
    local cutoff = now - limit.windowSeconds
    local cleaned = {}
    for _, ts in ipairs(log) do
        if ts > cutoff then table.insert(cleaned, ts) end
    end
    state.requestLog[eventName] = cleaned
    
    if #cleaned >= limit.maxRequests then
        SecurityLayer._recordViolation(state, "RATE_LIMIT", { event = eventName, count = #cleaned })
        return false
    end
    
    table.insert(cleaned, now)
    return true
end

function SecurityLayer.ValidateAnswerSpeed(player, questionServedTime)
    local state = playerSecurity[player]
    if not state then return false end
    
    local responseTime = tick() - questionServedTime
    if responseTime < CONFIG.MIN_ANSWER_TIME then
        state.fastAnswerStreak = state.fastAnswerStreak + 1
        if state.fastAnswerStreak >= CONFIG.SUSPICIOUS_SPEED_THRESHOLD then
            SecurityLayer._recordViolation(state, "SPEED_HACK", { responseTime = responseTime, streak = state.fastAnswerStreak })
            state.isFlagged = true
        end
        return false
    else
        state.fastAnswerStreak = 0
    end
    state.lastAnswerTime = tick()
    return true
end

function SecurityLayer.ValidateCurrencyChange(player, currencyType, amount, reason)
    local state = playerSecurity[player]
    if not state then return false end
    
    local maxPerAction = currencyType == "PremiumGems" and CONFIG.MAX_PREMIUM_PER_ACTION or CONFIG.MAX_COINS_PER_ACTION
    
    if amount > maxPerAction then
        SecurityLayer._recordViolation(state, "CURRENCY_OVERFLOW", { currency = currencyType, amount = amount, max = maxPerAction })
        return false
    end
    
    if amount < 0 and reason ~= "ADMIN" and reason ~= "PURCHASE" and reason ~= "TRADE" then
        SecurityLayer._recordViolation(state, "NEGATIVE_CURRENCY", { currency = currencyType, amount = amount })
        return false
    end
    
    table.insert(state.currencyChanges, { time = tick(), currency = currencyType, amount = amount, reason = reason })
    if #state.currencyChanges > 50 then table.remove(state.currencyChanges, 1) end
    if state.sessionEarned[currencyType] then
        state.sessionEarned[currencyType] = state.sessionEarned[currencyType] + amount
    end
    return true
end

function SecurityLayer.ValidateScore(player, field, value)
    local state = playerSecurity[player]
    if not state then return false end
    if type(value) ~= "number" or value < 0 or value ~= math.floor(value) then
        SecurityLayer._recordViolation(state, "SCORE_INVALID", { field = field, value = value })
        return false
    end
    local bounds = { combo = 500, wavesCleared = 1000, totalKills = 100000, totalCorrect = 100000 }
    local maxVal = bounds[field]
    if maxVal and value > maxVal then
        SecurityLayer._recordViolation(state, "SCORE_OUT_OF_BOUNDS", { field = field, value = value, max = maxVal })
        return false
    end
    return true
end

function SecurityLayer.SanitizeString(input, maxLength)
    if type(input) ~= "string" then return nil end
    maxLength = maxLength or 200
    if #input > maxLength then
        input = string.sub(input, 1, maxLength)
    end
    -- Strip control characters
    input = input:gsub("%c", "")
    return input
end

function SecurityLayer.GetPlayerSecurityState(player)
    return playerSecurity[player]
end

return SecurityLayer
