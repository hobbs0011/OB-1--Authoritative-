--[[
    GachaManager.lua — Train 6-7: Survival English
    Stage 9: Gacha Crate System
    
    DESIGN LAW:
    - Visible drop rates (Roblox policy compliant)
    - Pity counter guarantees rare within N pulls
    - No loot boxes that hide odds
    - Gospel 444 palette: Purple #a855f7, Gold #f59e0b
    
    ARCHITECTURE:
    - Server-authoritative (no client trust)
    - Atomic transactions (no partial pulls)
    - Rate-limited (anti-macro)
    - Full audit trail to DataStore
]]

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local HttpService = game:GetService("HttpService")

local GachaStore = DataStoreService:GetDataStore("GachaStore_v1")

local GachaManager = {}
GachaManager.__index = GachaManager

-- ============================================================
-- CRATE DEFINITIONS
-- ============================================================
local CRATE_TYPES = {
    ["BasicCrate"] = {
        displayName = "Survival Crate",
        cost = { currency = "SurvivalCoins", amount = 500 },
        cooldownSeconds = 10,
        pityThreshold = 50,
        drops = {
            { id = "common_skin_01",   rarity = "Common",     weight = 50,  category = "Skin" },
            { id = "common_skin_02",   rarity = "Common",     weight = 50,  category = "Skin" },
            { id = "uncommon_aura_01", rarity = "Uncommon",   weight = 25,  category = "Aura" },
            { id = "uncommon_pet_01",  rarity = "Uncommon",   weight = 25,  category = "Pet" },
            { id = "rare_skin_01",     rarity = "Rare",       weight = 8,   category = "Skin" },
            { id = "rare_aura_01",     rarity = "Rare",       weight = 7,   category = "Aura" },
            { id = "epic_pet_01",      rarity = "Epic",       weight = 3,   category = "Pet" },
            { id = "legendary_skin_01",rarity = "Legendary",  weight = 1,   category = "Skin" },
        },
    },
    ["PremiumCrate"] = {
        displayName = "Brainrot Crate",
        cost = { currency = "BrainrotGems", amount = 50 },
        cooldownSeconds = 5,
        pityThreshold = 30,
        drops = {
            { id = "uncommon_skin_03", rarity = "Uncommon",   weight = 40,  category = "Skin" },
            { id = "uncommon_aura_02", rarity = "Uncommon",   weight = 30,  category = "Aura" },
            { id = "rare_pet_02",      rarity = "Rare",       weight = 15,  category = "Pet" },
            { id = "rare_skin_02",     rarity = "Rare",       weight = 10,  category = "Skin" },
            { id = "epic_aura_02",     rarity = "Epic",       weight = 5,   category = "Aura" },
            { id = "epic_pet_02",      rarity = "Epic",       weight = 4,   category = "Pet" },
            { id = "legendary_pet_01", rarity = "Legendary",  weight = 2,   category = "Pet" },
            { id = "mythic_skin_01",   rarity = "Mythic",     weight = 0.5, category = "Skin" },
        },
    },
}

-- Rarity tiers for pity system
local RARITY_TIERS = {
    Common = 1,
    Uncommon = 2,
    Rare = 3,
    Epic = 4,
    Legendary = 5,
    Mythic = 6,
}

local PITY_GUARANTEED_RARITY = "Rare" -- Pity guarantees at least this rarity

-- Rate limit: max pulls per minute per player
local MAX_PULLS_PER_MINUTE = 10
local playerPullTimestamps = {} -- [userId] = {timestamps}

-- ============================================================
-- UTILITY
-- ============================================================

local function getTotalWeight(drops)
    local total = 0
    for _, drop in ipairs(drops) do
        total = total + drop.weight
    end
    return total
end

local function getVisibleDropRates(crateId)
    local crate = CRATE_TYPES[crateId]
    if not crate then return nil end
    
    local totalWeight = getTotalWeight(crate.drops)
    local rates = {}
    for _, drop in ipairs(crate.drops) do
        table.insert(rates, {
            id = drop.id,
            rarity = drop.rarity,
            category = drop.category,
            percentage = math.floor((drop.weight / totalWeight) * 10000) / 100, -- 2 decimal places
        })
    end
    return rates
end

local function isRateLimited(userId)
    local now = os.clock()
    local timestamps = playerPullTimestamps[userId]
    if not timestamps then
        playerPullTimestamps[userId] = {}
        return false
    end
    
    -- Prune old timestamps (older than 60s)
    local pruned = {}
    for _, ts in ipairs(timestamps) do
        if now - ts < 60 then
            table.insert(pruned, ts)
        end
    end
    playerPullTimestamps[userId] = pruned
    
    return #pruned >= MAX_PULLS_PER_MINUTE
end

local function recordPullTimestamp(userId)
    if not playerPullTimestamps[userId] then
        playerPullTimestamps[userId] = {}
    end
    table.insert(playerPullTimestamps[userId], os.clock())
end

-- ============================================================
-- WEIGHTED RANDOM SELECTION
-- ============================================================

local function selectDrop(drops, forcePity)
    local totalWeight = getTotalWeight(drops)
    
    if forcePity then
        -- Filter to only drops at or above pity rarity
        local pityDrops = {}
        local pityTier = RARITY_TIERS[PITY_GUARANTEED_RARITY] or 3
        for _, drop in ipairs(drops) do
            local tier = RARITY_TIERS[drop.rarity] or 1
            if tier >= pityTier then
                table.insert(pityDrops, drop)
            end
        end
        if #pityDrops > 0 then
            drops = pityDrops
            totalWeight = getTotalWeight(drops)
        end
    end
    
    local roll = math.random() * totalWeight
    local cumulative = 0
    for _, drop in ipairs(drops) do
        cumulative = cumulative + drop.weight
        if roll <= cumulative then
            return drop
        end
    end
    
    -- Fallback: return last drop (should never reach here)
    return drops[#drops]
end

-- ============================================================
-- PLAYER DATA (pity counters, inventory, cooldowns)
-- ============================================================

local playerGachaData = {} -- [userId] = { pity = {}, inventory = {}, lastPull = {} }

local function getPlayerData(userId)
    if playerGachaData[userId] then
        return playerGachaData[userId]
    end
    
    local success, data = pcall(function()
        return GachaStore:GetAsync("player_" .. tostring(userId))
    end)
    
    if success and data then
        playerGachaData[userId] = data
    else
        playerGachaData[userId] = {
            pity = {},       -- [crateId] = pullsSinceRare
            inventory = {},  -- [itemId] = count
            lastPull = {},   -- [crateId] = timestamp
            totalPulls = 0,
            totalSpent = { SurvivalCoins = 0, BrainrotGems = 0 },
        }
    end
    
    return playerGachaData[userId]
end

local function savePlayerData(userId)
    local data = playerGachaData[userId]
    if not data then return false end
    
    local success, err = pcall(function()
        GachaStore:SetAsync("player_" .. tostring(userId), data)
    end)
    
    if not success then
        warn("[GachaManager] Failed to save data for", userId, err)
    end
    return success
end

-- ============================================================
-- CORE PULL LOGIC
-- ============================================================

function GachaManager.Pull(player, crateId)
    local userId = player.UserId
    
    -- Validate crate exists
    local crate = CRATE_TYPES[crateId]
    if not crate then
        return { success = false, error = "INVALID_CRATE" }
    end
    
    -- Rate limit check
    if isRateLimited(userId) then
        return { success = false, error = "RATE_LIMITED" }
    end
    
    -- Cooldown check
    local data = getPlayerData(userId)
    local now = os.time()
    local lastPull = data.lastPull[crateId] or 0
    if (now - lastPull) < crate.cooldownSeconds then
        return { success = false, error = "COOLDOWN", remaining = crate.cooldownSeconds - (now - lastPull) }
    end
    
    -- Currency check (delegate to EconomyManager)
    local EconomyManager = require(script.Parent:FindFirstChild("EconomyManager"))
    if not EconomyManager then
        return { success = false, error = "ECONOMY_UNAVAILABLE" }
    end
    
    local canAfford = EconomyManager.GetBalance(player, crate.cost.currency) >= crate.cost.amount
    if not canAfford then
        return { success = false, error = "INSUFFICIENT_FUNDS" }
    end
    
    -- Deduct currency FIRST (fail-closed: money leaves before item arrives)
    local deducted = EconomyManager.Deduct(player, crate.cost.currency, crate.cost.amount, "gacha_pull_" .. crateId)
    if not deducted then
        return { success = false, error = "DEDUCTION_FAILED" }
    end
    
    -- Pity check
    local pityCount = data.pity[crateId] or 0
    local forcePity = (pityCount + 1) >= crate.pityThreshold
    
    -- Roll
    local drop = selectDrop(crate.drops, forcePity)
    
    -- Update pity counter
    local dropTier = RARITY_TIERS[drop.rarity] or 1
    local pityTier = RARITY_TIERS[PITY_GUARANTEED_RARITY] or 3
    if dropTier >= pityTier then
        data.pity[crateId] = 0 -- Reset pity
    else
        data.pity[crateId] = (data.pity[crateId] or 0) + 1
    end
    
    -- Add to inventory
    data.inventory[drop.id] = (data.inventory[drop.id] or 0) + 1
    
    -- Update tracking
    data.lastPull[crateId] = now
    data.totalPulls = (data.totalPulls or 0) + 1
    data.totalSpent[crate.cost.currency] = (data.totalSpent[crate.cost.currency] or 0) + crate.cost.amount
    
    -- Record rate limit timestamp
    recordPullTimestamp(userId)
    
    -- Save (async, non-blocking for gameplay)
    task.spawn(function()
        savePlayerData(userId)
    end)
    
    -- Audit trail
    print(string.format("[GACHA] Player %d pulled %s (%s) from %s | Pity: %d/%d | ForcedPity: %s",
        userId, drop.id, drop.rarity, crateId,
        data.pity[crateId], crate.pityThreshold,
        tostring(forcePity)
    ))
    
    return {
        success = true,
        item = {
            id = drop.id,
            rarity = drop.rarity,
            category = drop.category,
        },
        pityProgress = {
            current = data.pity[crateId],
            threshold = crate.pityThreshold,
        },
        isNew = (data.inventory[drop.id] == 1),
    }
end

-- ============================================================
-- MULTI-PULL (10x)
-- ============================================================

function GachaManager.Pull10(player, crateId)
    local results = {}
    for i = 1, 10 do
        local result = GachaManager.Pull(player, crateId)
        table.insert(results, result)
        if not result.success then
            break -- Stop on first failure (funds, rate limit, etc.)
        end
    end
    return results
end

-- ============================================================
-- CLIENT API
-- ============================================================

function GachaManager.GetDropRates(crateId)
    return getVisibleDropRates(crateId)
end

function GachaManager.GetAllCrates()
    local crates = {}
    for id, crate in pairs(CRATE_TYPES) do
        crates[id] = {
            displayName = crate.displayName,
            cost = crate.cost,
            cooldownSeconds = crate.cooldownSeconds,
            pityThreshold = crate.pityThreshold,
            dropRates = getVisibleDropRates(id),
        }
    end
    return crates
end

function GachaManager.GetPityProgress(player, crateId)
    local data = getPlayerData(player.UserId)
    local crate = CRATE_TYPES[crateId]
    if not crate then return nil end
    
    return {
        current = data.pity[crateId] or 0,
        threshold = crate.pityThreshold,
        guaranteed = PITY_GUARANTEED_RARITY,
    }
end

function GachaManager.GetInventory(player)
    local data = getPlayerData(player.UserId)
    return data.inventory or {}
end

function GachaManager.GetStats(player)
    local data = getPlayerData(player.UserId)
    return {
        totalPulls = data.totalPulls or 0,
        totalSpent = data.totalSpent or {},
    }
end

-- ============================================================
-- CLEANUP
-- ============================================================

Players.PlayerRemoving:Connect(function(player)
    local userId = player.UserId
    if playerGachaData[userId] then
        savePlayerData(userId)
        playerGachaData[userId] = nil
    end
    playerPullTimestamps[userId] = nil
end)

-- ============================================================
-- REMOTE SETUP
-- ============================================================

local GachaRemote = Instance.new("RemoteFunction")
GachaRemote.Name = "GachaRemote"
GachaRemote.Parent = ReplicatedStorage

GachaRemote.OnServerInvoke = function(player, action, ...)
    if action == "Pull" then
        return GachaManager.Pull(player, ...)
    elseif action == "Pull10" then
        return GachaManager.Pull10(player, ...)
    elseif action == "GetDropRates" then
        return GachaManager.GetDropRates(...)
    elseif action == "GetAllCrates" then
        return GachaManager.GetAllCrates()
    elseif action == "GetPityProgress" then
        return GachaManager.GetPityProgress(player, ...)
    elseif action == "GetInventory" then
        return GachaManager.GetInventory(player)
    elseif action == "GetStats" then
        return GachaManager.GetStats(player)
    end
    return { success = false, error = "INVALID_ACTION" }
end

return GachaManager
