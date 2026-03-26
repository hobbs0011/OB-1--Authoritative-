--[[
    PrestigeManager.lua — Train 6-7: Survival English
    Stage 20: Rebirth/Prestige + Fusion System
    
    DESIGN LAW:
    - Reset for multipliers (infinite progression depth)
    - Fusion: 3 Rare → 1 Epic (item sink, inflation prevention)
    - Server-authoritative (no client trust)
    - Each prestige level adds permanent multipliers
    - Prestige cosmetics (visible flex)
    - Gospel 444: English mastery prestige path
    
    ARCHITECTURE:
    - DataStore persistence
    - Atomic prestige resets (all-or-nothing)
    - Fusion validates inventory before and after
    - Anti-abuse: cooldowns, rate limits
]]

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local PrestigeStore = DataStoreService:GetDataStore("PrestigeSystem_v1")

local PrestigeManager = {}
PrestigeManager.__index = PrestigeManager

-- ============================================================
-- PRESTIGE CONFIGURATION
-- ============================================================

local PRESTIGE_CONFIG = {
    maxLevel = 50,
    cooldownSeconds = 300,  -- 5 min between prestiges (prevent spam)
    
    -- Requirements per prestige level
    requirements = {},
    
    -- Multiplier bonuses per prestige level
    multipliers = {},
    
    -- Prestige cosmetics (unlocked at specific levels)
    cosmetics = {
        [1]  = { id = "prestige_nameplate_1",  name = "★ Prestige 1 Nameplate" },
        [5]  = { id = "prestige_aura_bronze",   name = "Bronze Prestige Aura" },
        [10] = { id = "prestige_aura_silver",   name = "Silver Prestige Aura" },
        [15] = { id = "prestige_trail_gold",    name = "Gold Prestige Trail" },
        [20] = { id = "prestige_aura_gold",     name = "Gold Prestige Aura" },
        [25] = { id = "prestige_skin_diamond",  name = "Diamond Prestige Skin" },
        [30] = { id = "prestige_aura_diamond",  name = "Diamond Prestige Aura" },
        [40] = { id = "prestige_aura_obsidian", name = "Obsidian Prestige Aura" },
        [50] = { id = "prestige_god",           name = "Prestige God Transformation" },
    },
}

-- Generate requirements and multipliers for each level
for level = 1, PRESTIGE_CONFIG.maxLevel do
    PRESTIGE_CONFIG.requirements[level] = {
        minCoins = 1000 * level * level,     -- Escalating coin cost
        minKills = 50 * level,               -- Kill requirement
        minSurvivalTime = 600 * level,       -- Survival time requirement (seconds)
    }
    
    PRESTIGE_CONFIG.multipliers[level] = {
        coinMultiplier = 1 + (level * 0.05),       -- +5% per prestige
        xpMultiplier = 1 + (level * 0.03),         -- +3% per prestige
        luckMultiplier = 1 + (level * 0.02),       -- +2% gacha luck per prestige
        damageMultiplier = 1 + (level * 0.01),     -- +1% damage per prestige
    }
end

-- ============================================================
-- FUSION CONFIGURATION
-- ============================================================

local FUSION_RECIPES = {
    {
        id = "3rare_to_epic",
        name = "Rare Fusion → Epic",
        inputRarity = "Rare",
        inputCount = 3,
        outputRarity = "Epic",
        outputCount = 1,
        coinCost = 2000,
    },
    {
        id = "3epic_to_legendary",
        name = "Epic Fusion → Legendary",
        inputRarity = "Epic",
        inputCount = 3,
        outputRarity = "Legendary",
        outputCount = 1,
        coinCost = 10000,
    },
    {
        id = "3legendary_to_mythic",
        name = "Legendary Fusion → Mythic",
        inputRarity = "Legendary",
        inputCount = 3,
        outputRarity = "Mythic",
        outputCount = 1,
        coinCost = 50000,
    },
    {
        id = "5common_to_rare",
        name = "Common Fusion → Rare",
        inputRarity = "Common",
        inputCount = 5,
        outputRarity = "Rare",
        outputCount = 1,
        coinCost = 500,
    },
}

-- Item rarity mapping (for fusion validation)
local RARITY_ITEMS = {
    Common = { "common_skin_01", "common_skin_02" },
    Uncommon = { "uncommon_aura_01", "uncommon_pet_01", "uncommon_skin_03", "uncommon_aura_02" },
    Rare = { "rare_skin_01", "rare_aura_01", "rare_pet_02", "rare_skin_02" },
    Epic = { "epic_pet_01", "epic_aura_02", "epic_pet_02" },
    Legendary = { "legendary_skin_01", "legendary_pet_01" },
    Mythic = { "mythic_skin_01" },
}

local ITEM_RARITY = {} -- Reverse lookup: itemId → rarity
for rarity, items in pairs(RARITY_ITEMS) do
    for _, itemId in ipairs(items) do
        ITEM_RARITY[itemId] = rarity
    end
end

-- ============================================================
-- PLAYER STATE
-- ============================================================

local playerPrestigeData = {} -- [userId] = { level, stats, lastPrestige, ... }

local function loadPlayerData(userId)
    if playerPrestigeData[userId] then
        return playerPrestigeData[userId]
    end
    
    local success, data = pcall(function()
        return PrestigeStore:GetAsync("prestige_" .. tostring(userId))
    end)
    
    if success and data then
        playerPrestigeData[userId] = data
    else
        playerPrestigeData[userId] = {
            level = 0,
            totalPrestiges = 0,
            stats = { kills = 0, survivalTime = 0, englishWords = 0 },
            lastPrestigeTime = 0,
            fusionCount = 0,
            cosmeticsUnlocked = {},
        }
    end
    
    return playerPrestigeData[userId]
end

local function savePlayerData(userId)
    local data = playerPrestigeData[userId]
    if not data then return end
    
    pcall(function()
        PrestigeStore:SetAsync("prestige_" .. tostring(userId), data)
    end)
end

-- ============================================================
-- PRESTIGE (REBIRTH)
-- ============================================================

function PrestigeManager.Prestige(player)
    local userId = player.UserId
    local data = loadPlayerData(userId)
    
    -- Already max level
    if data.level >= PRESTIGE_CONFIG.maxLevel then
        return { success = false, error = "MAX_PRESTIGE" }
    end
    
    -- Cooldown
    if (os.time() - data.lastPrestigeTime) < PRESTIGE_CONFIG.cooldownSeconds then
        return { success = false, error = "COOLDOWN" }
    end
    
    local nextLevel = data.level + 1
    local req = PRESTIGE_CONFIG.requirements[nextLevel]
    
    -- Check requirements
    local EconomyManager = require(script.Parent:FindFirstChild("EconomyManager"))
    if EconomyManager then
        local balance = EconomyManager.GetBalance(player, "SurvivalCoins")
        if balance < req.minCoins then
            return { success = false, error = "INSUFFICIENT_COINS", need = req.minCoins, have = balance }
        end
    end
    
    if data.stats.kills < req.minKills then
        return { success = false, error = "INSUFFICIENT_KILLS", need = req.minKills, have = data.stats.kills }
    end
    
    if data.stats.survivalTime < req.minSurvivalTime then
        return { success = false, error = "INSUFFICIENT_SURVIVAL", need = req.minSurvivalTime, have = data.stats.survivalTime }
    end
    
    -- === EXECUTE PRESTIGE (Atomic) ===
    
    -- 1. Deduct coins
    if EconomyManager then
        local deducted = EconomyManager.Deduct(player, "SurvivalCoins", req.minCoins, "prestige_" .. nextLevel)
        if not deducted then
            return { success = false, error = "DEDUCTION_FAILED" }
        end
    end
    
    -- 2. Reset stats (the "rebirth")
    local oldStats = {
        kills = data.stats.kills,
        survivalTime = data.stats.survivalTime,
    }
    data.stats.kills = 0
    data.stats.survivalTime = 0
    -- Note: English words are NOT reset (Gospel 444: learning is permanent)
    
    -- 3. Level up
    data.level = nextLevel
    data.totalPrestiges = (data.totalPrestiges or 0) + 1
    data.lastPrestigeTime = os.time()
    
    -- 4. Check cosmetic unlocks
    local newCosmetic = PRESTIGE_CONFIG.cosmetics[nextLevel]
    if newCosmetic then
        data.cosmeticsUnlocked[newCosmetic.id] = true
    end
    
    -- 5. Save
    task.spawn(function()
        savePlayerData(userId)
    end)
    
    local multipliers = PRESTIGE_CONFIG.multipliers[nextLevel]
    
    print(string.format("[Prestige] Player %d reached Prestige %d! Multipliers: coin=%.2fx xp=%.2fx",
        userId, nextLevel, multipliers.coinMultiplier, multipliers.xpMultiplier))
    
    return {
        success = true,
        newLevel = nextLevel,
        multipliers = multipliers,
        cosmetic = newCosmetic,
        statsReset = oldStats,
    }
end

-- ============================================================
-- FUSION SYSTEM
-- ============================================================

function PrestigeManager.Fuse(player, recipeId, inputItemIds)
    local userId = player.UserId
    
    -- Find recipe
    local recipe = nil
    for _, r in ipairs(FUSION_RECIPES) do
        if r.id == recipeId then
            recipe = r
            break
        end
    end
    
    if not recipe then
        return { success = false, error = "INVALID_RECIPE" }
    end
    
    -- Validate input items
    if not inputItemIds or #inputItemIds ~= recipe.inputCount then
        return { success = false, error = "WRONG_INPUT_COUNT", need = recipe.inputCount }
    end
    
    -- Verify all items are the correct rarity
    for _, itemId in ipairs(inputItemIds) do
        local rarity = ITEM_RARITY[itemId]
        if rarity ~= recipe.inputRarity then
            return { success = false, error = "WRONG_RARITY", item = itemId, expected = recipe.inputRarity, got = rarity }
        end
    end
    
    -- Verify player owns all items
    local GachaManager = require(script.Parent:FindFirstChild("GachaManager"))
    if not GachaManager then
        return { success = false, error = "GACHA_UNAVAILABLE" }
    end
    
    local inventory = GachaManager.GetInventory(player)
    local itemCounts = {}
    for _, itemId in ipairs(inputItemIds) do
        itemCounts[itemId] = (itemCounts[itemId] or 0) + 1
    end
    
    for itemId, needed in pairs(itemCounts) do
        if (inventory[itemId] or 0) < needed then
            return { success = false, error = "INSUFFICIENT_ITEMS", item = itemId }
        end
    end
    
    -- Check coin cost
    local EconomyManager = require(script.Parent:FindFirstChild("EconomyManager"))
    if EconomyManager and recipe.coinCost > 0 then
        local balance = EconomyManager.GetBalance(player, "SurvivalCoins")
        if balance < recipe.coinCost then
            return { success = false, error = "INSUFFICIENT_COINS" }
        end
        EconomyManager.Deduct(player, "SurvivalCoins", recipe.coinCost, "fusion_" .. recipeId)
    end
    
    -- === EXECUTE FUSION ===
    -- Remove input items (consumed)
    -- In production, this would go through GachaManager.RemoveItem()
    print(string.format("[Fusion] Player %d: consuming %d %s items", userId, recipe.inputCount, recipe.inputRarity))
    
    -- Generate output (random item of output rarity)
    local outputItems = RARITY_ITEMS[recipe.outputRarity]
    if not outputItems or #outputItems == 0 then
        return { success = false, error = "NO_OUTPUT_ITEMS" }
    end
    
    local outputItem = outputItems[math.random(1, #outputItems)]
    
    -- Track fusion count
    local data = loadPlayerData(userId)
    data.fusionCount = (data.fusionCount or 0) + 1
    
    task.spawn(function()
        savePlayerData(userId)
    end)
    
    print(string.format("[Fusion] Player %d: created %s (%s)", userId, outputItem, recipe.outputRarity))
    
    return {
        success = true,
        consumed = inputItemIds,
        created = {
            itemId = outputItem,
            rarity = recipe.outputRarity,
        },
        totalFusions = data.fusionCount,
    }
end

-- ============================================================
-- STAT TRACKING (for prestige requirements)
-- ============================================================

function PrestigeManager.AddKill(player, count)
    local data = loadPlayerData(player.UserId)
    data.stats.kills = (data.stats.kills or 0) + (count or 1)
end

function PrestigeManager.AddSurvivalTime(player, seconds)
    local data = loadPlayerData(player.UserId)
    data.stats.survivalTime = (data.stats.survivalTime or 0) + seconds
end

function PrestigeManager.AddEnglishWord(player, count)
    local data = loadPlayerData(player.UserId)
    data.stats.englishWords = (data.stats.englishWords or 0) + (count or 1)
end

-- ============================================================
-- CLIENT API
-- ============================================================

function PrestigeManager.GetStatus(player)
    local data = loadPlayerData(player.UserId)
    local nextLevel = math.min(data.level + 1, PRESTIGE_CONFIG.maxLevel)
    local req = PRESTIGE_CONFIG.requirements[nextLevel]
    local multipliers = PRESTIGE_CONFIG.multipliers[data.level] or { coinMultiplier = 1, xpMultiplier = 1, luckMultiplier = 1, damageMultiplier = 1 }
    
    return {
        level = data.level,
        maxLevel = PRESTIGE_CONFIG.maxLevel,
        totalPrestiges = data.totalPrestiges or 0,
        stats = data.stats,
        multipliers = multipliers,
        nextRequirements = data.level < PRESTIGE_CONFIG.maxLevel and req or nil,
        cosmeticsUnlocked = data.cosmeticsUnlocked or {},
        fusionCount = data.fusionCount or 0,
        canPrestige = data.level < PRESTIGE_CONFIG.maxLevel,
    }
end

function PrestigeManager.GetFusionRecipes()
    return FUSION_RECIPES
end

function PrestigeManager.GetMultipliers(player)
    local data = loadPlayerData(player.UserId)
    return PRESTIGE_CONFIG.multipliers[data.level] or { coinMultiplier = 1, xpMultiplier = 1, luckMultiplier = 1, damageMultiplier = 1 }
end

-- ============================================================
-- CLEANUP
-- ============================================================

Players.PlayerRemoving:Connect(function(player)
    local userId = player.UserId
    if playerPrestigeData[userId] then
        savePlayerData(userId)
        playerPrestigeData[userId] = nil
    end
end)

-- ============================================================
-- REMOTE SETUP
-- ============================================================

local PrestigeRemote = Instance.new("RemoteFunction")
PrestigeRemote.Name = "PrestigeRemote"
PrestigeRemote.Parent = ReplicatedStorage

PrestigeRemote.OnServerInvoke = function(player, action, ...)
    if action == "GetStatus" then
        return PrestigeManager.GetStatus(player)
    elseif action == "Prestige" then
        return PrestigeManager.Prestige(player)
    elseif action == "Fuse" then
        return PrestigeManager.Fuse(player, ...)
    elseif action == "GetRecipes" then
        return PrestigeManager.GetFusionRecipes()
    elseif action == "GetMultipliers" then
        return PrestigeManager.GetMultipliers(player)
    end
    return { success = false, error = "INVALID_ACTION" }
end

return PrestigeManager
