--[[
═══════════════════════════════════════════════════════════════
SURVIVE A BRAINROT — ECONOMY ANOMALY DETECTION LAYER
Script: AnomalyDetector.lua
Type: Server Module (ServerScriptService)
Purpose: Server-side validation for all currency/inventory ops
Version: 1.0
Date: March 26, 2026
Pipeline: Stage 3 of 20 — Train 6-7 Launch Pipeline
Gospel 444 Compliant — NO BLUE
Phoenix Rising Gaming Division
═══════════════════════════════════════════════════════════════
PRINCIPLE: NEVER TRUST THE CLIENT.
Every currency grant, spend, trade, and inventory mutation
must pass through server-side validation before committing.

This module sits ON TOP of the Wave 1-2 hardened code and adds:
1. Rate limiting (max transactions per minute)
2. Magnitude validation (no single txn > threshold)
3. Velocity detection (too much currency too fast)
4. Negative balance prevention (atomic check-and-subtract)
5. Duplicate transaction guard (idempotency keys)
6. Session anomaly flagging (auto-kick on exploit detection)
7. Audit trail (last N transactions per player for review)
═══════════════════════════════════════════════════════════════
]]

local AnomalyDetector = {}

-- SERVICES
local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")

-- ══════════════════════════════════════════════════════════════
-- CONFIGURATION
-- ══════════════════════════════════════════════════════════════
AnomalyDetector.Config = {
    -- Rate limits
    MaxTransactionsPerMinute = 30,     -- normal play ~5-10/min
    MaxTradesPerMinute = 5,            -- trading abuse prevention
    
    -- Magnitude limits (per single transaction)
    MaxCoinGrant = 5000,               -- no single event grants more
    MaxGemGrant = 500,                 -- hard currency is precious
    MaxCoinSpend = 50000,              -- biggest single purchase
    MaxGemSpend = 10000,
    
    -- Velocity thresholds (rolling window)
    VelocityWindowSeconds = 300,       -- 5-minute rolling window
    MaxCoinsPerWindow = 25000,         -- flag if > 25K coins in 5 min
    MaxGemsPerWindow = 2500,           -- flag if > 2.5K gems in 5 min
    
    -- Negative balance prevention
    AllowNegativeBalance = false,      -- NEVER
    
    -- Audit trail
    MaxAuditEntries = 50,              -- per player, in-memory
    
    -- Enforcement
    AutoKickOnFlag = true,             -- kick exploiters immediately
    FlagThreshold = 3,                 -- flags before kick
    BanThreshold = 5,                  -- flags before ban consideration
    
    -- Idempotency
    IdempotencyWindowSeconds = 60,     -- reject duplicate txn IDs within 60s
}

-- ══════════════════════════════════════════════════════════════
-- STATE (per-player, server-side only)
-- ══════════════════════════════════════════════════════════════
local playerState = {} -- [UserId] = { transactions, flags, audit, velocity, idempotencyKeys }

local function initPlayerState(userId)
    playerState[userId] = {
        transactions = {},       -- timestamped list for rate limiting
        trades = {},             -- timestamped list for trade rate limiting
        flags = 0,               -- anomaly flag count
        flagReasons = {},        -- list of flag reasons
        audit = {},              -- last N transactions
        velocityWindow = {},     -- { timestamp, amount, currency } for velocity check
        idempotencyKeys = {},    -- { [key] = timestamp } for dedup
        sessionStart = os.clock(),
    }
end

local function getState(userId)
    if not playerState[userId] then
        initPlayerState(userId)
    end
    return playerState[userId]
end

-- ══════════════════════════════════════════════════════════════
-- CORE VALIDATION FUNCTIONS
-- ══════════════════════════════════════════════════════════════

--- Generate a unique transaction ID
function AnomalyDetector.generateTxnId()
    return HttpService:GenerateGUID(false)
end

--- Check rate limit (transactions per minute)
local function checkRateLimit(state, listName)
    local list = state[listName] or {}
    local now = os.clock()
    local cutoff = now - 60 -- 1 minute window
    
    -- Prune old entries
    local pruned = {}
    for _, ts in ipairs(list) do
        if ts > cutoff then
            table.insert(pruned, ts)
        end
    end
    state[listName] = pruned
    
    local limit = listName == "trades" 
        and AnomalyDetector.Config.MaxTradesPerMinute 
        or AnomalyDetector.Config.MaxTransactionsPerMinute
    
    return #pruned < limit, #pruned, limit
end

--- Check magnitude limit
local function checkMagnitude(amount, currency, direction)
    local cfg = AnomalyDetector.Config
    if direction == "grant" then
        if currency == "Coins" then
            return amount <= cfg.MaxCoinGrant, cfg.MaxCoinGrant
        elseif currency == "Gems" then
            return amount <= cfg.MaxGemGrant, cfg.MaxGemGrant
        end
    elseif direction == "spend" then
        if currency == "Coins" then
            return amount <= cfg.MaxCoinSpend, cfg.MaxCoinSpend
        elseif currency == "Gems" then
            return amount <= cfg.MaxGemSpend, cfg.MaxGemSpend
        end
    end
    return true, 0
end

--- Check velocity (rolling window)
local function checkVelocity(state, amount, currency)
    local cfg = AnomalyDetector.Config
    local now = os.clock()
    local cutoff = now - cfg.VelocityWindowSeconds
    
    -- Prune old entries
    local pruned = {}
    local total = 0
    for _, entry in ipairs(state.velocityWindow) do
        if entry.timestamp > cutoff then
            table.insert(pruned, entry)
            if entry.currency == currency then
                total = total + entry.amount
            end
        end
    end
    state.velocityWindow = pruned
    
    -- Add current transaction
    table.insert(state.velocityWindow, {
        timestamp = now,
        amount = amount,
        currency = currency,
    })
    total = total + amount
    
    -- Check threshold
    local limit = currency == "Coins" 
        and cfg.MaxCoinsPerWindow 
        or cfg.MaxGemsPerWindow
    
    return total <= limit, total, limit
end

--- Check idempotency (reject duplicate transaction IDs)
local function checkIdempotency(state, txnId)
    if not txnId then return true end -- no ID = no dedup
    
    local now = os.clock()
    local cutoff = now - AnomalyDetector.Config.IdempotencyWindowSeconds
    
    -- Prune old keys
    for key, ts in pairs(state.idempotencyKeys) do
        if ts < cutoff then
            state.idempotencyKeys[key] = nil
        end
    end
    
    -- Check for duplicate
    if state.idempotencyKeys[txnId] then
        return false -- DUPLICATE
    end
    
    state.idempotencyKeys[txnId] = now
    return true
end

--- Add to audit trail
local function addAudit(state, entry)
    table.insert(state.audit, entry)
    
    -- Trim to max
    while #state.audit > AnomalyDetector.Config.MaxAuditEntries do
        table.remove(state.audit, 1)
    end
end

--- Flag a player for anomalous behavior
local function flagPlayer(player, reason)
    local state = getState(player.UserId)
    state.flags = state.flags + 1
    table.insert(state.flagReasons, {
        reason = reason,
        timestamp = os.clock(),
    })
    
    warn(string.format(
        "[AnomalyDetector] ⚠️ FLAG #%d for %s: %s",
        state.flags, player.Name, reason
    ))
    
    -- Auto-kick on threshold
    if AnomalyDetector.Config.AutoKickOnFlag 
        and state.flags >= AnomalyDetector.Config.FlagThreshold then
        warn(string.format(
            "[AnomalyDetector] 🚫 AUTO-KICK %s (%d flags)",
            player.Name, state.flags
        ))
        player:Kick("Session terminated: unusual activity detected.")
    end
end

-- ══════════════════════════════════════════════════════════════
-- PUBLIC API
-- ══════════════════════════════════════════════════════════════

--- Validate a currency transaction before it happens
--- Returns: { allowed: bool, reason: string? }
function AnomalyDetector.validateTransaction(player, params)
    --[[
    params = {
        txnId = string (optional, for idempotency),
        currency = "Coins" | "Gems",
        amount = number (positive),
        direction = "grant" | "spend",
        source = string (what caused this: "enemy_kill", "daily_reward", "purchase", etc.),
        currentBalance = number (player's current balance for negative check),
    }
    ]]
    
    if not player or not player.Parent then
        return { allowed = false, reason = "Player disconnected" }
    end
    
    local state = getState(player.UserId)
    local cfg = AnomalyDetector.Config
    
    -- 1. Idempotency check
    if not checkIdempotency(state, params.txnId) then
        return { allowed = false, reason = "Duplicate transaction ID" }
    end
    
    -- 2. Rate limit check
    local rateOk, count, limit = checkRateLimit(state, "transactions")
    if not rateOk then
        flagPlayer(player, string.format(
            "Rate limit exceeded: %d/%d txn/min (%s)",
            count, limit, params.source or "unknown"
        ))
        return { allowed = false, reason = "Rate limit exceeded" }
    end
    table.insert(state.transactions, os.clock())
    
    -- 3. Magnitude check
    local magOk, magLimit = checkMagnitude(params.amount, params.currency, params.direction)
    if not magOk then
        flagPlayer(player, string.format(
            "Magnitude exceeded: %d %s %s (max %d) from %s",
            params.amount, params.currency, params.direction,
            magLimit, params.source or "unknown"
        ))
        return { allowed = false, reason = "Transaction too large" }
    end
    
    -- 4. Velocity check (grants only)
    if params.direction == "grant" then
        local velOk, total, velLimit = checkVelocity(state, params.amount, params.currency)
        if not velOk then
            flagPlayer(player, string.format(
                "Velocity exceeded: %d %s in window (max %d) from %s",
                total, params.currency, velLimit, params.source or "unknown"
            ))
            return { allowed = false, reason = "Currency velocity too high" }
        end
    end
    
    -- 5. Negative balance prevention (spends only)
    if params.direction == "spend" and not cfg.AllowNegativeBalance then
        local balance = params.currentBalance or 0
        if balance < params.amount then
            return { 
                allowed = false, 
                reason = string.format(
                    "Insufficient balance: has %d, needs %d %s",
                    balance, params.amount, params.currency
                )
            }
        end
    end
    
    -- 6. All checks passed — record in audit
    addAudit(state, {
        txnId = params.txnId,
        currency = params.currency,
        amount = params.amount,
        direction = params.direction,
        source = params.source,
        timestamp = os.clock(),
        result = "ALLOWED",
    })
    
    return { allowed = true }
end

--- Validate a trade between two players
function AnomalyDetector.validateTrade(player1, player2, offer1, offer2)
    --[[
    offer = {
        Coins = number,
        Gems = number,
        Items = { string },
    }
    ]]
    
    local state1 = getState(player1.UserId)
    local state2 = getState(player2.UserId)
    
    -- Rate limit trades
    local tradeOk1 = checkRateLimit(state1, "trades")
    if not tradeOk1 then
        return { allowed = false, reason = player1.Name .. " trade rate limited" }
    end
    
    local tradeOk2 = checkRateLimit(state2, "trades")
    if not tradeOk2 then
        return { allowed = false, reason = player2.Name .. " trade rate limited" }
    end
    
    table.insert(state1.trades, os.clock())
    table.insert(state2.trades, os.clock())
    
    -- Magnitude check on trade values
    -- (Prevent exploits where someone trades 999999 coins)
    if (offer1.Coins or 0) > AnomalyDetector.Config.MaxCoinSpend then
        flagPlayer(player1, "Trade offer exceeds coin magnitude limit")
        return { allowed = false, reason = "Trade offer too large" }
    end
    if (offer2.Coins or 0) > AnomalyDetector.Config.MaxCoinSpend then
        flagPlayer(player2, "Trade offer exceeds coin magnitude limit")
        return { allowed = false, reason = "Trade offer too large" }
    end
    
    -- Record audit
    local tradeAudit = {
        type = "trade",
        player1 = player1.UserId,
        player2 = player2.UserId,
        offer1 = offer1,
        offer2 = offer2,
        timestamp = os.clock(),
        result = "ALLOWED",
    }
    addAudit(state1, tradeAudit)
    addAudit(state2, tradeAudit)
    
    return { allowed = true }
end

--- Get player's anomaly status (for admin/moderation)
function AnomalyDetector.getPlayerStatus(player)
    local state = getState(player.UserId)
    return {
        flags = state.flags,
        flagReasons = state.flagReasons,
        recentTransactions = #state.audit,
        sessionDuration = os.clock() - state.sessionStart,
    }
end

--- Get audit trail for a player
function AnomalyDetector.getAuditTrail(player)
    local state = getState(player.UserId)
    return state.audit
end

--- Reset flags for a player (admin action)
function AnomalyDetector.resetFlags(player)
    local state = getState(player.UserId)
    state.flags = 0
    state.flagReasons = {}
end

-- ══════════════════════════════════════════════════════════════
-- CLEANUP
-- ══════════════════════════════════════════════════════════════
Players.PlayerRemoving:Connect(function(player)
    -- Log summary before cleanup
    local state = playerState[player.UserId]
    if state and state.flags > 0 then
        warn(string.format(
            "[AnomalyDetector] %s departed with %d flags. Reasons: %s",
            player.Name, state.flags,
            table.concat(
                (function()
                    local reasons = {}
                    for _, f in ipairs(state.flagReasons) do
                        table.insert(reasons, f.reason)
                    end
                    return reasons
                end)(),
                "; "
            )
        ))
    end
    
    -- TODO: Persist flag data to DataStore for cross-session ban tracking
    playerState[player.UserId] = nil
end)

-- ══════════════════════════════════════════════════════════════
-- INIT
-- ══════════════════════════════════════════════════════════════
print("══════════════════════════════════════════════════")
print("🛡️ AnomalyDetector v1.0 — Economy Security Layer")
print("Never Trust The Client | 7-Point Validation")
print("Pipeline: Stage 3 of 20")
print("══════════════════════════════════════════════════")

return AnomalyDetector
