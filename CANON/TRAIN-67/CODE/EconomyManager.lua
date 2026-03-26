--[[
═══════════════════════════════════════════════════════════════
SURVIVE A BRAINROT — ECONOMY MANAGER (TWO-CURRENCY SYSTEM)
Script: EconomyManager.lua
Type: Server Module (ServerScriptService)
Purpose: Survival Coins (soft) + Brainrot Gems (hard) economy
Version: 1.0
Date: March 26, 2026
Pipeline: Stage 4 of 20 — Train 6-7 Launch Pipeline
Gospel 444 Compliant — NO BLUE
Phoenix Rising Gaming Division
═══════════════════════════════════════════════════════════════
DESIGN:
  Two-currency economy prevents inflation while monetizing:
  
  SURVIVAL COINS (soft currency):
    - Earned through gameplay (kills, waves, challenges, English)
    - Spent on: standard weapons, basic cosmetics, repairs, crafting
    - Inflationary sinks: repair costs, crafting fees, trade tax
    
  BRAINROT GEMS (hard currency):
    - Earned sparingly (daily login day 7, achievements, rare drops)
    - Purchased with Robux via Developer Products
    - Spent on: premium gacha, exclusive cosmetics, battle pass
    - Hard cap on free earning to preserve value

  ALL transactions validated through AnomalyDetector (Stage 3)
═══════════════════════════════════════════════════════════════
]]

local EconomyManager = {}

-- SERVICES
local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- DEPENDENCIES
-- AnomalyDetector must be loaded before EconomyManager
local AnomalyDetector = nil -- set via init()

-- ══════════════════════════════════════════════════════════════
-- CONFIGURATION
-- ══════════════════════════════════════════════════════════════
EconomyManager.Config = {
    -- Starting balances
    StartingCoins = 100,
    StartingGems = 10,
    
    -- Currency earn rates (per action)
    EarnRates = {
        EnemyKill = { Coins = 10, Gems = 0 },
        EliteKill = { Coins = 50, Gems = 1 },
        BossKill = { Coins = 200, Gems = 5 },
        WaveClear = { Coins = 50, Gems = 0 },
        DayComplete = { Coins = 100, Gems = 2 },
        EnglishCorrect = { Coins = 15, Gems = 0 },
        EnglishStreak5 = { Coins = 100, Gems = 1 },
        DailyChallenge = { Coins = 200, Gems = 3 },
        Achievement = { Coins = 500, Gems = 10 },
    },
    
    -- Economy sinks (prevent inflation)
    Sinks = {
        WeaponRepairCost = 0.1,          -- 10% of weapon value
        CraftingFee = 0.15,              -- 15% of material value
        TradeTaxPercent = 3,             -- 3% tax on all trades
        RebirthCostMultiplier = 1.5,     -- each rebirth costs more
    },
    
    -- Hard currency (Gems) daily free cap
    DailyFreeGemCap = 25,
    
    -- Robux → Gems conversion (Developer Products)
    GemPacks = {
        { ProductId = 0, Gems = 100,   Robux = 49,   BonusPercent = 0,  Label = "Starter" },
        { ProductId = 0, Gems = 500,   Robux = 199,  BonusPercent = 10, Label = "Popular" },
        { ProductId = 0, Gems = 1200,  Robux = 399,  BonusPercent = 20, Label = "Best Value" },
        { ProductId = 0, Gems = 3000,  Robux = 799,  BonusPercent = 30, Label = "Mega" },
        { ProductId = 0, Gems = 10000, Robux = 1999, BonusPercent = 50, Label = "Whale" },
    },
    
    -- First purchase bonus
    FirstPurchaseBonus = 2.0, -- 2x gems on first ever purchase
    
    -- Gospel 444 Colors (NO BLUE)
    CoinColor = Color3.fromRGB(245, 158, 11),   -- Gold #f59e0b
    GemColor = Color3.fromRGB(168, 85, 247),     -- Purple #a855f7
}

-- ══════════════════════════════════════════════════════════════
-- DATA STORE
-- ══════════════════════════════════════════════════════════════
local economyStore = nil

local function getStore()
    if economyStore then return economyStore end
    local ok, store = pcall(function()
        return DataStoreService:GetDataStore("Economy_v1")
    end)
    if ok then economyStore = store end
    return economyStore
end

local function defaultEconomyData()
    return {
        Coins = EconomyManager.Config.StartingCoins,
        Gems = EconomyManager.Config.StartingGems,
        TotalCoinsEarned = 0,
        TotalGemsEarned = 0,
        TotalCoinsSpent = 0,
        TotalGemsSpent = 0,
        DailyGemsEarned = 0,
        LastDailyReset = 0,
        FirstPurchaseDone = false,
        TotalRobuxSpent = 0,
        RebirthCount = 0,
    }
end

-- In-memory cache
local playerEconomy = {} -- [UserId] = economy data

-- ══════════════════════════════════════════════════════════════
-- DATA MANAGEMENT
-- ══════════════════════════════════════════════════════════════

function EconomyManager.loadPlayerData(player)
    local store = getStore()
    if store then
        local ok, data = pcall(function()
            return store:GetAsync("eco_" .. tostring(player.UserId))
        end)
        if ok and data then
            playerEconomy[player.UserId] = data
            return data
        end
    end
    
    local data = defaultEconomyData()
    playerEconomy[player.UserId] = data
    return data
end

function EconomyManager.savePlayerData(player)
    local data = playerEconomy[player.UserId]
    if not data then return false end
    
    local store = getStore()
    if not store then return false end
    
    local ok = pcall(function()
        store:UpdateAsync("eco_" .. tostring(player.UserId), function(old)
            -- Merge with server data to prevent overwrite races
            if not old then return data end
            -- Take the higher values for totals (append-first)
            data.TotalCoinsEarned = math.max(data.TotalCoinsEarned, old.TotalCoinsEarned or 0)
            data.TotalGemsEarned = math.max(data.TotalGemsEarned, old.TotalGemsEarned or 0)
            return data
        end)
    end)
    return ok
end

function EconomyManager.getData(player)
    return playerEconomy[player.UserId] or defaultEconomyData()
end

-- ══════════════════════════════════════════════════════════════
-- BALANCE QUERIES
-- ══════════════════════════════════════════════════════════════

function EconomyManager.getCoins(player)
    local data = EconomyManager.getData(player)
    return data.Coins
end

function EconomyManager.getGems(player)
    local data = EconomyManager.getData(player)
    return data.Gems
end

function EconomyManager.getBalance(player)
    local data = EconomyManager.getData(player)
    return { Coins = data.Coins, Gems = data.Gems }
end

-- ══════════════════════════════════════════════════════════════
-- CURRENCY OPERATIONS (all validated through AnomalyDetector)
-- ══════════════════════════════════════════════════════════════

--- Grant currency to player (validated)
function EconomyManager.grant(player, currency, amount, source)
    if amount <= 0 then return false, "Amount must be positive" end
    
    local data = EconomyManager.getData(player)
    
    -- Daily gem cap check
    if currency == "Gems" then
        local today = math.floor(os.time() / 86400)
        if data.LastDailyReset < today then
            data.DailyGemsEarned = 0
            data.LastDailyReset = today
        end
        
        -- Don't cap Robux purchases, only free gems
        if source ~= "purchase" then
            local remaining = EconomyManager.Config.DailyFreeGemCap - data.DailyGemsEarned
            if remaining <= 0 then
                return false, "Daily free gem cap reached"
            end
            amount = math.min(amount, remaining)
        end
    end
    
    -- Validate through AnomalyDetector
    if AnomalyDetector then
        local result = AnomalyDetector.validateTransaction(player, {
            txnId = AnomalyDetector.generateTxnId(),
            currency = currency,
            amount = amount,
            direction = "grant",
            source = source or "unknown",
            currentBalance = currency == "Coins" and data.Coins or data.Gems,
        })
        
        if not result.allowed then
            return false, result.reason
        end
    end
    
    -- Apply
    if currency == "Coins" then
        data.Coins = data.Coins + amount
        data.TotalCoinsEarned = data.TotalCoinsEarned + amount
    elseif currency == "Gems" then
        data.Gems = data.Gems + amount
        data.TotalGemsEarned = data.TotalGemsEarned + amount
        if source ~= "purchase" then
            data.DailyGemsEarned = data.DailyGemsEarned + amount
        end
    end
    
    -- Notify client
    EconomyManager.syncToClient(player)
    
    return true, amount
end

--- Spend currency (validated, atomic check-and-subtract)
function EconomyManager.spend(player, currency, amount, source)
    if amount <= 0 then return false, "Amount must be positive" end
    
    local data = EconomyManager.getData(player)
    local balance = currency == "Coins" and data.Coins or data.Gems
    
    -- Validate through AnomalyDetector
    if AnomalyDetector then
        local result = AnomalyDetector.validateTransaction(player, {
            txnId = AnomalyDetector.generateTxnId(),
            currency = currency,
            amount = amount,
            direction = "spend",
            source = source or "unknown",
            currentBalance = balance,
        })
        
        if not result.allowed then
            return false, result.reason
        end
    end
    
    -- Atomic check-and-subtract
    if balance < amount then
        return false, "Insufficient " .. currency
    end
    
    if currency == "Coins" then
        data.Coins = data.Coins - amount
        data.TotalCoinsSpent = data.TotalCoinsSpent + amount
    elseif currency == "Gems" then
        data.Gems = data.Gems - amount
        data.TotalGemsSpent = data.TotalGemsSpent + amount
    end
    
    -- Notify client
    EconomyManager.syncToClient(player)
    
    return true, data[currency]
end

--- Reward player for a game action (uses EarnRates config)
function EconomyManager.reward(player, action)
    local rates = EconomyManager.Config.EarnRates[action]
    if not rates then
        warn("[EconomyManager] Unknown action: " .. tostring(action))
        return false
    end
    
    local results = {}
    
    if rates.Coins and rates.Coins > 0 then
        local ok, amt = EconomyManager.grant(player, "Coins", rates.Coins, action)
        results.Coins = ok and amt or 0
    end
    
    if rates.Gems and rates.Gems > 0 then
        local ok, amt = EconomyManager.grant(player, "Gems", rates.Gems, action)
        results.Gems = ok and amt or 0
    end
    
    return true, results
end

--- Process trade tax (3% tax sink)
function EconomyManager.calculateTradeTax(coinAmount)
    local taxRate = EconomyManager.Config.Sinks.TradeTaxPercent / 100
    return math.floor(coinAmount * taxRate)
end

--- Process Robux gem purchase
function EconomyManager.processGemPurchase(player, packIndex)
    local pack = EconomyManager.Config.GemPacks[packIndex]
    if not pack then return false, "Invalid pack" end
    
    local data = EconomyManager.getData(player)
    local gems = pack.Gems
    
    -- Apply bonus
    gems = gems + math.floor(gems * pack.BonusPercent / 100)
    
    -- First purchase bonus
    if not data.FirstPurchaseDone then
        gems = math.floor(gems * EconomyManager.Config.FirstPurchaseBonus)
        data.FirstPurchaseDone = true
    end
    
    data.TotalRobuxSpent = data.TotalRobuxSpent + pack.Robux
    
    -- Grant gems (bypasses daily cap for purchases)
    local ok, amount = EconomyManager.grant(player, "Gems", gems, "purchase")
    
    return ok, amount
end

-- ══════════════════════════════════════════════════════════════
-- CLIENT SYNC
-- ══════════════════════════════════════════════════════════════

function EconomyManager.syncToClient(player)
    local data = EconomyManager.getData(player)
    local remote = ReplicatedStorage:FindFirstChild("GameRemotes")
        and ReplicatedStorage.GameRemotes:FindFirstChild("UpdateCurrency")
    
    if remote then
        remote:FireClient(player, {
            Coins = data.Coins,
            Gems = data.Gems,
        })
    end
    
    -- Also update leaderstats for compatibility
    local leaderstats = player:FindFirstChild("leaderstats")
    if leaderstats then
        local coins = leaderstats:FindFirstChild("Coins")
        if coins then coins.Value = data.Coins end
        local gems = leaderstats:FindFirstChild("Gems")
        if gems then gems.Value = data.Gems end
    end
end

-- ══════════════════════════════════════════════════════════════
-- ECONOMY STATS (for analytics/admin)
-- ══════════════════════════════════════════════════════════════

function EconomyManager.getStats(player)
    local data = EconomyManager.getData(player)
    return {
        Coins = data.Coins,
        Gems = data.Gems,
        TotalCoinsEarned = data.TotalCoinsEarned,
        TotalGemsEarned = data.TotalGemsEarned,
        TotalCoinsSpent = data.TotalCoinsSpent,
        TotalGemsSpent = data.TotalGemsSpent,
        DailyGemsEarned = data.DailyGemsEarned,
        DailyFreeGemCap = EconomyManager.Config.DailyFreeGemCap,
        FirstPurchaseDone = data.FirstPurchaseDone,
        TotalRobuxSpent = data.TotalRobuxSpent,
        RebirthCount = data.RebirthCount,
        NetCoinFlow = data.TotalCoinsEarned - data.TotalCoinsSpent,
        NetGemFlow = data.TotalGemsEarned - data.TotalGemsSpent,
    }
end

-- ══════════════════════════════════════════════════════════════
-- LIFECYCLE
-- ══════════════════════════════════════════════════════════════

function EconomyManager.init(anomalyDetectorModule)
    AnomalyDetector = anomalyDetectorModule
    print("[EconomyManager] Initialized with AnomalyDetector")
end

Players.PlayerAdded:Connect(function(player)
    EconomyManager.loadPlayerData(player)
    EconomyManager.syncToClient(player)
end)

Players.PlayerRemoving:Connect(function(player)
    EconomyManager.savePlayerData(player)
    playerEconomy[player.UserId] = nil
end)

-- Auto-save every 5 minutes
task.spawn(function()
    while true do
        task.wait(300)
        for _, player in ipairs(Players:GetPlayers()) do
            pcall(function()
                EconomyManager.savePlayerData(player)
            end)
        end
    end
end)

-- ══════════════════════════════════════════════════════════════
-- INIT
-- ══════════════════════════════════════════════════════════════
print("══════════════════════════════════════════════════")
print("💰 EconomyManager v1.0 — Two-Currency System")
print("Survival Coins (Gold) + Brainrot Gems (Purple)")
print("Gospel 444 Compliant | NO BLUE")
print("Pipeline: Stage 4 of 20")
print("══════════════════════════════════════════════════")

return EconomyManager
