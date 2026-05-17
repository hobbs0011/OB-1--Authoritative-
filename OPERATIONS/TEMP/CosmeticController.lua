--[[
===============================================================
SURVIVE A BRAINROT — COSMETIC CONTROLLER
Module: CosmeticController.lua
Type: Server Module (ServerScriptService)
Purpose: Unified server-side authority for the Cosmetic Trinity
         (Pets, Auras, Skins). Single entry point for all cosmetic
         ownership, equip, fusion, English Aura progression, and
         integration with Gacha/BattlePass/Trade/MonetizationOrchestrator.

Version: 1.0.0
Date: 2026-03-28
Pipeline: Active Mission — 100% Roblox (Pulse Run 73)
Gospel 444 Compliant
Phoenix Rising Gaming Division

GOVERNING PRINCIPLES:
  1. English is the mechanic, money is the mission
  2. Mouse -> Tiger — cosmetics are the visible proof of mastery
  3. Every cosmetic exists to reward English and drive monetization
  4. Server-authoritative: all ownership/equip decisions server-side
  5. English Auras are unpurchaseable — the only flex money can't buy
  6. Desire drives spending: visible cosmetics create organic demand

ARCHITECTURE:
  - CosmeticCatalog: static item registry (source of truth for items)
  - CosmeticInventory: per-player ownership + equip state (DataStore)
  - PetManager: equip, unequip, fusion (English challenge gate)
  - AuraManager: equip, stacking (cosmetic + English auras)
  - SkinManager: equip, outfit presets
  - Integration bridges: Gacha, BattlePass, Trade, ERM, MO

BUILD ORDER: L3 (after DataStore, Currency, Gacha, BP, ERM)
UNIFIED SERVER BOOT: Init() called by UnifiedServer after Gacha + ERM

Cross-repo sources:
  1. CosmeticTrinityIntegrationSpec.md (SHA c91097ff)
  2. GachaManager.lua (SHA 8ed648e3)
  3. MonetizationOrchestrator.lua (SHA 2f5622b5)
  4. EnglishRewardsManager.lua (SHA 9ad9471e)
  5. BattlePass.lua (SHA 71a5c55f)
  6. TradeManager.lua (SHA 11a04441)
===============================================================
]]

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerStorage = game:GetService("ServerStorage")
local HttpService = game:GetService("HttpService")

local CosmeticController = {}

--------------------------------------------------------------------------------
-- DEPENDENCIES (lazy-loaded in Init)
--------------------------------------------------------------------------------
local Deps = {
    DataStoreV2 = nil,
    AnalyticsService = nil,
    GachaManager = nil,
    BattlePass = nil,
    TradeManager = nil,
    EnglishRewardsManager = nil,
    MonetizationOrchestrator = nil,
    EconomyManager = nil,
}

local CosmeticStore = nil -- DataStore handle

--------------------------------------------------------------------------------
-- RARITY SYSTEM — Unified 8-Tier Hierarchy (Spec §3)
-- Shared across all cosmetic categories
--------------------------------------------------------------------------------
local RARITY = {
    { tier = 1, name = "Common",    color = "White",          dropBasic = 0.40, dropPremium = 0.25, tradeTax = 0.03, pity = nil },
    { tier = 2, name = "Uncommon",  color = "Green",          dropBasic = 0.30, dropPremium = 0.25, tradeTax = 0.03, pity = nil },
    { tier = 3, name = "Rare",      color = "Blue",           dropBasic = 0.15, dropPremium = 0.20, tradeTax = 0.03, pity = nil },
    { tier = 4, name = "Epic",      color = "Purple",         dropBasic = 0.08, dropPremium = 0.15, tradeTax = 0.03, pity = 50 },
    { tier = 5, name = "Legendary", color = "Gold",           dropBasic = 0.04, dropPremium = 0.10, tradeTax = 0.05, pity = 100 },
    { tier = 6, name = "Mythic",    color = "Red/Animated",   dropBasic = 0.02, dropPremium = 0.04, tradeTax = 0.07, pity = 200 },
    { tier = 7, name = "Celestial", color = "Rainbow",        dropBasic = 0.005,dropPremium = 0.008,tradeTax = 0.10, pity = 400 },
    { tier = 8, name = "Rizzlord",  color = "Custom VFX",     dropBasic = 0.0001,dropPremium=0.0005,tradeTax = 0.15, pity = 1000 },
}

local RARITY_BY_NAME = {}
local RARITY_BY_TIER = {}
for _, r in ipairs(RARITY) do
    RARITY_BY_NAME[r.name] = r
    RARITY_BY_TIER[r.tier] = r
end

--------------------------------------------------------------------------------
-- PET ABILITY BALANCE TABLE (Spec §5.3)
--------------------------------------------------------------------------------
local PET_ABILITIES = {
    XP_BOOST = {
        [1] = 1.02, [2] = 1.05, [3] = 1.08, [4] = 1.12,
        [5] = 1.18, [6] = 1.25, [7] = 1.25, [8] = 1.25,
    },
    COIN_MAGNET = {
        [1] = 5, [2] = 8, [3] = 12, [4] = 18,
        [5] = 25, [6] = 40, [7] = 40, [8] = 40,
    },
    LUCK_BOOST = {
        [1] = 0.01, [2] = 0.02, [3] = 0.03, [4] = 0.05,
        [5] = 0.08, [6] = 0.12, [7] = 0.12, [8] = 0.12,
    },
    ENGLISH_XP_BOOST = {
        [1] = 0, [2] = 0, [3] = 0.05, [4] = 0.10,
        [5] = 0.15, [6] = 0.25, [7] = 0.25, [8] = 0.25,
    },
}

--------------------------------------------------------------------------------
-- ENGLISH AURA TIERS (Spec §14 — Gospel 444 Bridge)
-- Unpurchaseable. Earned only through English engagement.
--------------------------------------------------------------------------------
local ENGLISH_AURA_TIERS = {
    { tier = 1, name = "Spark",        rarity = 1, xpRequired = 0 },
    { tier = 2, name = "Glow",         rarity = 2, xpRequired = 500 },
    { tier = 3, name = "Flame",        rarity = 3, xpRequired = 2000 },
    { tier = 4, name = "Blaze",        rarity = 4, xpRequired = 5000 },
    { tier = 5, name = "Inferno",      rarity = 5, xpRequired = 15000 },
    { tier = 6, name = "Supernova",    rarity = 6, xpRequired = 50000 },
    { tier = 7, name = "Cosmic",       rarity = 7, xpRequired = 150000 },
    { tier = 8, name = "Transcendent", rarity = 8, xpRequired = 500000 },
}

--------------------------------------------------------------------------------
-- COSMETIC CATALOG — Static item registry (Spec §4)
-- Populated by CosmeticData or dynamically via event system
--------------------------------------------------------------------------------
local Catalog = {
    items = {},       -- [itemId] -> CosmeticItem
    byCategory = {},  -- [category] -> {CosmeticItem}
    byRarity = {},    -- [rarityTier] -> {CosmeticItem}
}

-- Item schema validation
local VALID_CATEGORIES = { Pet = true, Aura = true, Skin = true }
local VALID_SUBCATEGORIES = {
    Outfit = true, Accessory = true, Emote = true, Title = true,
    EnglishAura = true, CosmeticAura = true,
    StandardPet = true, EnglishBuddy = true, EventPet = true, MythicPet = true,
}

local function registerItem(item)
    if not item or not item.id or not item.category then
        warn("[CosmeticController] Invalid item registration:", item and item.id)
        return false
    end
    if not VALID_CATEGORIES[item.category] then
        warn("[CosmeticController] Invalid category:", item.category)
        return false
    end

    -- Defaults
    item.rarity = item.rarity or 1
    item.tradeable = (item.tradeable ~= false)
    item.purchaseable = (item.purchaseable ~= false)
    item.englishOnly = item.englishOnly or false
    item.stackable = item.stackable or false
    item.tags = item.tags or {}
    item.releaseDate = item.releaseDate or os.time()

    -- English-only items are never tradeable/purchaseable
    if item.englishOnly then
        item.tradeable = false
        item.purchaseable = false
    end

    -- Register
    Catalog.items[item.id] = item

    Catalog.byCategory[item.category] = Catalog.byCategory[item.category] or {}
    table.insert(Catalog.byCategory[item.category], item)

    Catalog.byRarity[item.rarity] = Catalog.byRarity[item.rarity] or {}
    table.insert(Catalog.byRarity[item.rarity], item)

    return true
end

-- Catalog query API
function CosmeticController.GetItem(itemId)
    return Catalog.items[itemId]
end

function CosmeticController.GetByCategory(category)
    return Catalog.byCategory[category] or {}
end

function CosmeticController.GetByRarity(rarityTier)
    return Catalog.byRarity[rarityTier] or {}
end

function CosmeticController.GetTradeable()
    local result = {}
    for _, item in pairs(Catalog.items) do
        if item.tradeable then table.insert(result, item) end
    end
    return result
end

function CosmeticController.GetEnglishOnly()
    local result = {}
    for _, item in pairs(Catalog.items) do
        if item.englishOnly then table.insert(result, item) end
    end
    return result
end

function CosmeticController.GetAvailableInGacha(crateType)
    local result = {}
    for _, item in pairs(Catalog.items) do
        if not item.englishOnly and not item.eventTag then
            table.insert(result, item)
        end
    end
    return result
end

function CosmeticController.Search(query, filters)
    local results = {}
    local lowerQuery = string.lower(query or "")
    for _, item in pairs(Catalog.items) do
        local match = false
        if lowerQuery == "" then
            match = true
        elseif string.find(string.lower(item.name or ""), lowerQuery, 1, true) then
            match = true
        elseif string.find(string.lower(item.id), lowerQuery, 1, true) then
            match = true
        else
            for _, tag in ipairs(item.tags) do
                if string.find(string.lower(tag), lowerQuery, 1, true) then
                    match = true
                    break
                end
            end
        end

        if match and filters then
            if filters.category and item.category ~= filters.category then match = false end
            if filters.minRarity and item.rarity < filters.minRarity then match = false end
            if filters.maxRarity and item.rarity > filters.maxRarity then match = false end
            if filters.tradeable ~= nil and item.tradeable ~= filters.tradeable then match = false end
        end

        if match then table.insert(results, item) end
    end
    return results
end

function CosmeticController.GetRarityInfo(tier)
    return RARITY_BY_TIER[tier]
end

function CosmeticController.GetCatalogStats()
    local stats = { total = 0, byCategory = {}, byRarity = {} }
    for _, item in pairs(Catalog.items) do
        stats.total = stats.total + 1
        stats.byCategory[item.category] = (stats.byCategory[item.category] or 0) + 1
        stats.byRarity[item.rarity] = (stats.byRarity[item.rarity] or 0) + 1
    end
    return stats
end

--------------------------------------------------------------------------------
-- PLAYER INVENTORY (Spec §8 — DataStore backed)
--------------------------------------------------------------------------------
local playerInventories = {} -- [UserId] -> InventoryData

local DEFAULT_INVENTORY = {
    owned = {},
    equippedPet = nil,
    equippedAura = nil,
    equippedEnglishAura = nil,
    equippedSkin = { outfit = nil, hat = nil, back = nil, face = nil, shoulderL = nil, shoulderR = nil },
    savedOutfits = {},
    englishAuraTier = 1,
    englishAuraXP = 0,
    fusionCooldown = nil,
    totalPulls = 0,
    totalTrades = 0,
    totalFusions = 0,
    totalRobuxSpentOnCosmetics = 0,
    firstCosmeticDate = nil,
    version = 1,
}

local function deepCopy(t)
    if type(t) ~= "table" then return t end
    local c = {}
    for k, v in pairs(t) do c[k] = deepCopy(v) end
    return c
end

local function loadInventory(userId)
    local data = deepCopy(DEFAULT_INVENTORY)
    if CosmeticStore then
        local ok, stored = pcall(function()
            return CosmeticStore:GetAsync("cosmetics_v1_" .. tostring(userId))
        end)
        if ok and stored and type(stored) == "table" then
            for k, v in pairs(stored) do
                data[k] = v
            end
        end
    end
    return data
end

local function saveInventory(userId)
    local inv = playerInventories[userId]
    if not inv or not CosmeticStore then return false end
    local ok, err = pcall(function()
        CosmeticStore:SetAsync("cosmetics_v1_" .. tostring(userId), inv)
    end)
    if not ok then
        warn("[CosmeticController] Save failed for", userId, err)
    end
    return ok
end

local function emitAnalytics(player, event, props)
    if not Deps.AnalyticsService then return end
    pcall(function()
        if type(Deps.AnalyticsService.Track) == "function" then
            Deps.AnalyticsService:Track(player, "cosmetic_" .. event, props or {})
        end
    end)
end

local function generateInstanceId()
    return HttpService:GenerateGUID(false)
end

--------------------------------------------------------------------------------
-- GRANT / REVOKE ITEMS
--------------------------------------------------------------------------------
function CosmeticController.GrantItem(player, itemId, obtainedVia)
    local userId = player.UserId
    local inv = playerInventories[userId]
    if not inv then return false, "NO_INVENTORY" end

    local item = Catalog.items[itemId]
    if not item then return false, "INVALID_ITEM" end

    local instanceId = generateInstanceId()
    inv.owned[instanceId] = {
        itemId = itemId,
        obtainedAt = os.time(),
        obtainedVia = obtainedVia or "Unknown",
        instanceId = instanceId,
        tradeable = item.tradeable,
        locked = false,
        fusionCount = 0,
    }

    if not inv.firstCosmeticDate then
        inv.firstCosmeticDate = os.time()
    end

    -- Fire desire signal to MonetizationOrchestrator
    if Deps.MonetizationOrchestrator and type(Deps.MonetizationOrchestrator.OnContextualTrigger) == "function" then
        pcall(function()
            Deps.MonetizationOrchestrator.OnContextualTrigger(player, "COSMETIC_VIEW", {
                itemId = itemId, rarity = item.rarity, category = item.category, obtained = true,
            })
        end)
    end

    emitAnalytics(player, "item_granted", {
        itemId = itemId, rarity = item.rarity, category = item.category,
        obtainedVia = obtainedVia, instanceId = instanceId,
    })

    -- Async save
    task.spawn(function() saveInventory(userId) end)

    return true, instanceId
end

function CosmeticController.RevokeItem(player, instanceId, reason)
    local userId = player.UserId
    local inv = playerInventories[userId]
    if not inv then return false, "NO_INVENTORY" end

    local entry = inv.owned[instanceId]
    if not entry then return false, "NOT_OWNED" end

    -- Unequip if currently equipped
    if inv.equippedPet == instanceId then inv.equippedPet = nil end
    if inv.equippedAura == instanceId then inv.equippedAura = nil end

    local itemId = entry.itemId
    inv.owned[instanceId] = nil

    emitAnalytics(player, "item_revoked", {
        itemId = itemId, instanceId = instanceId, reason = reason,
    })

    task.spawn(function() saveInventory(userId) end)
    return true
end

function CosmeticController.OwnsItem(player, itemId)
    local inv = playerInventories[player.UserId]
    if not inv then return false end
    for _, entry in pairs(inv.owned) do
        if entry.itemId == itemId then return true end
    end
    return false
end

function CosmeticController.GetOwnedItems(player, category)
    local inv = playerInventories[player.UserId]
    if not inv then return {} end
    local result = {}
    for instanceId, entry in pairs(inv.owned) do
        local item = Catalog.items[entry.itemId]
        if item and (not category or item.category == category) then
            table.insert(result, {
                instanceId = instanceId,
                itemId = entry.itemId,
                item = item,
                entry = entry,
            })
        end
    end
    return result
end

function CosmeticController.GetOwnedCount(player, category)
    return #CosmeticController.GetOwnedItems(player, category)
end

function CosmeticController.LockItem(player, instanceId, locked)
    local inv = playerInventories[player.UserId]
    if not inv or not inv.owned[instanceId] then return false end
    inv.owned[instanceId].locked = locked
    task.spawn(function() saveInventory(player.UserId) end)
    return true
end

--------------------------------------------------------------------------------
-- PET MANAGER (Spec §5)
--------------------------------------------------------------------------------
function CosmeticController.EquipPet(player, instanceId)
    local userId = player.UserId
    local inv = playerInventories[userId]
    if not inv then return false, "NO_INVENTORY" end

    local entry = inv.owned[instanceId]
    if not entry then return false, "NOT_OWNED" end

    local item = Catalog.items[entry.itemId]
    if not item or item.category ~= "Pet" then return false, "NOT_A_PET" end

    -- Unequip old pet abilities
    local oldPet = inv.equippedPet
    inv.equippedPet = instanceId

    -- Replicate to all clients
    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if remotes then
        local ev = remotes:FindFirstChild("CosmeticEquipped")
        if ev then
            pcall(function()
                ev:FireAllClients(userId, "Pet", entry.itemId, item.rarity)
            end)
        end
    end

    emitAnalytics(player, "pet_equipped", {
        itemId = entry.itemId, rarity = item.rarity, instanceId = instanceId,
    })

    task.spawn(function() saveInventory(userId) end)
    return true
end

function CosmeticController.UnequipPet(player)
    local inv = playerInventories[player.UserId]
    if not inv then return false end
    inv.equippedPet = nil

    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if remotes then
        local ev = remotes:FindFirstChild("CosmeticUnequipped")
        if ev then
            pcall(function() ev:FireAllClients(player.UserId, "Pet") end)
        end
    end

    task.spawn(function() saveInventory(player.UserId) end)
    return true
end

function CosmeticController.GetEquippedPet(player)
    local inv = playerInventories[player.UserId]
    if not inv or not inv.equippedPet then return nil end
    local entry = inv.owned[inv.equippedPet]
    if not entry then return nil end
    return {
        instanceId = inv.equippedPet,
        itemId = entry.itemId,
        item = Catalog.items[entry.itemId],
    }
end

function CosmeticController.GetPetAbilities(player)
    local pet = CosmeticController.GetEquippedPet(player)
    if not pet or not pet.item then return {} end

    local rarity = pet.item.rarity
    local abilities = {}
    for abilityType, tiers in pairs(PET_ABILITIES) do
        local value = tiers[rarity] or 0
        if value > 0 then
            abilities[abilityType] = value
        end
    end
    return abilities
end

-- Fusion: 3 same-rarity pets -> 1 next-rarity pet (Spec §5.2)
function CosmeticController.FusePets(player, inputInstanceIds)
    local userId = player.UserId
    local inv = playerInventories[userId]
    if not inv then return false, "NO_INVENTORY" end

    -- Validate inputs
    if #inputInstanceIds ~= 3 then return false, "NEED_3_INPUTS" end

    -- Cooldown check (60s between fusions)
    if inv.fusionCooldown and (os.time() - inv.fusionCooldown) < 60 then
        return false, "FUSION_COOLDOWN"
    end

    local inputRarity = nil
    local inputEntries = {}
    for _, instanceId in ipairs(inputInstanceIds) do
        local entry = inv.owned[instanceId]
        if not entry then return false, "NOT_OWNED:" .. tostring(instanceId) end
        if entry.locked then return false, "ITEM_LOCKED:" .. tostring(instanceId) end

        local item = Catalog.items[entry.itemId]
        if not item or item.category ~= "Pet" then return false, "NOT_A_PET:" .. tostring(instanceId) end
        if item.englishOnly then return false, "ENGLISH_ONLY_NO_FUSE" end

        if not inputRarity then
            inputRarity = item.rarity
        elseif item.rarity ~= inputRarity then
            return false, "RARITY_MISMATCH"
        end

        table.insert(inputEntries, { instanceId = instanceId, entry = entry, item = item })
    end

    -- Check rarity cap (can't fuse Rizzlord)
    if inputRarity >= 8 then return false, "MAX_RARITY" end

    local outputRarity = inputRarity + 1

    -- Find a pet of the output rarity to grant
    local outputCandidates = {}
    for _, item in pairs(Catalog.items) do
        if item.category == "Pet" and item.rarity == outputRarity and not item.englishOnly then
            table.insert(outputCandidates, item)
        end
    end
    if #outputCandidates == 0 then return false, "NO_OUTPUT_AVAILABLE" end

    -- Random selection from candidates
    local outputItem = outputCandidates[math.random(#outputCandidates)]

    -- Remove inputs
    for _, entry in ipairs(inputEntries) do
        inv.owned[entry.instanceId] = nil
    end

    -- Unequip if any input was equipped
    for _, entry in ipairs(inputEntries) do
        if inv.equippedPet == entry.instanceId then
            inv.equippedPet = nil
        end
    end

    -- Grant output
    local instanceId = generateInstanceId()
    inv.owned[instanceId] = {
        itemId = outputItem.id,
        obtainedAt = os.time(),
        obtainedVia = "Fusion",
        instanceId = instanceId,
        tradeable = outputItem.tradeable,
        locked = false,
        fusionCount = 1,
    }

    inv.totalFusions = (inv.totalFusions or 0) + 1
    inv.fusionCooldown = os.time()

    emitAnalytics(player, "pet_fused", {
        inputRarity = inputRarity, outputRarity = outputRarity,
        outputItemId = outputItem.id, outputInstanceId = instanceId,
    })

    task.spawn(function() saveInventory(userId) end)
    return true, instanceId, outputItem
end

--------------------------------------------------------------------------------
-- AURA MANAGER (Spec §6)
-- Supports stacking: cosmetic aura (inner) + English aura (outer)
--------------------------------------------------------------------------------
function CosmeticController.EquipAura(player, instanceId)
    local userId = player.UserId
    local inv = playerInventories[userId]
    if not inv then return false, "NO_INVENTORY" end

    local entry = inv.owned[instanceId]
    if not entry then return false, "NOT_OWNED" end

    local item = Catalog.items[entry.itemId]
    if not item or item.category ~= "Aura" then return false, "NOT_AN_AURA" end

    -- English auras go to a separate slot
    if item.englishOnly or item.subcategory == "EnglishAura" then
        inv.equippedEnglishAura = instanceId
    else
        inv.equippedAura = instanceId
    end

    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if remotes then
        local ev = remotes:FindFirstChild("CosmeticEquipped")
        if ev then
            local slot = (item.englishOnly or item.subcategory == "EnglishAura") and "EnglishAura" or "Aura"
            pcall(function()
                ev:FireAllClients(userId, slot, entry.itemId, item.rarity)
            end)
        end
    end

    emitAnalytics(player, "aura_equipped", {
        itemId = entry.itemId, rarity = item.rarity, isEnglish = item.englishOnly,
    })

    task.spawn(function() saveInventory(userId) end)
    return true
end

function CosmeticController.UnequipAura(player, slot)
    local inv = playerInventories[player.UserId]
    if not inv then return false end

    if slot == "English" or slot == "EnglishAura" then
        inv.equippedEnglishAura = nil
    else
        inv.equippedAura = nil
    end

    task.spawn(function() saveInventory(player.UserId) end)
    return true
end

function CosmeticController.GetEquippedAuras(player)
    local inv = playerInventories[player.UserId]
    if not inv then return nil, nil end

    local cosmetic = nil
    if inv.equippedAura then
        local entry = inv.owned[inv.equippedAura]
        if entry then
            cosmetic = { instanceId = inv.equippedAura, itemId = entry.itemId, item = Catalog.items[entry.itemId] }
        end
    end

    local english = nil
    if inv.equippedEnglishAura then
        local entry = inv.owned[inv.equippedEnglishAura]
        if entry then
            english = { instanceId = inv.equippedEnglishAura, itemId = entry.itemId, item = Catalog.items[entry.itemId] }
        end
    end

    return cosmetic, english
end

--------------------------------------------------------------------------------
-- ENGLISH AURA PROGRESSION (Spec §14 — Gospel 444 Bridge)
-- Unpurchaseable. Updated by EnglishRewardsManager callbacks.
--------------------------------------------------------------------------------
function CosmeticController.AddEnglishAuraXP(player, xpAmount, source)
    local userId = player.UserId
    local inv = playerInventories[userId]
    if not inv then return false end

    local oldTier = inv.englishAuraTier or 1
    inv.englishAuraXP = (inv.englishAuraXP or 0) + xpAmount

    -- Check for tier-up
    local newTier = 1
    for _, tierData in ipairs(ENGLISH_AURA_TIERS) do
        if inv.englishAuraXP >= tierData.xpRequired then
            newTier = tierData.tier
        end
    end

    local tierChanged = (newTier > oldTier)
    inv.englishAuraTier = newTier

    if tierChanged then
        -- Auto-grant the new English Aura item
        local auraItemId = string.format("AURA_ENGLISH_%s_%03d", string.upper(ENGLISH_AURA_TIERS[newTier].name), 1)
        local existingItem = Catalog.items[auraItemId]
        if existingItem then
            CosmeticController.GrantItem(player, auraItemId, "English")
        end

        -- Auto-equip if better than current
        -- (English Auras auto-update to highest tier)

        emitAnalytics(player, "english_aura_tierup", {
            oldTier = oldTier, newTier = newTier,
            tierName = ENGLISH_AURA_TIERS[newTier].name,
            totalXP = inv.englishAuraXP,
            source = source,
        })

        -- Server announcement for tier 7+ (Cosmic, Transcendent)
        if newTier >= 7 then
            local remotes = ReplicatedStorage:FindFirstChild("Remotes")
            if remotes then
                local ev = remotes:FindFirstChild("ServerAnnouncement")
                if ev then
                    pcall(function()
                        ev:FireAllClients("english_aura_legendary", {
                            playerName = player.DisplayName,
                            tierName = ENGLISH_AURA_TIERS[newTier].name,
                            rarity = ENGLISH_AURA_TIERS[newTier].rarity,
                        })
                    end)
                end
            end
        end
    end

    task.spawn(function() saveInventory(userId) end)
    return tierChanged, newTier
end

function CosmeticController.GetEnglishAuraProgress(player)
    local inv = playerInventories[player.UserId]
    if not inv then return nil end

    local currentTier = inv.englishAuraTier or 1
    local currentXP = inv.englishAuraXP or 0

    local nextTier = nil
    local xpToNext = nil
    if currentTier < #ENGLISH_AURA_TIERS then
        nextTier = ENGLISH_AURA_TIERS[currentTier + 1]
        xpToNext = nextTier.xpRequired - currentXP
    end

    return {
        tier = currentTier,
        tierName = ENGLISH_AURA_TIERS[currentTier] and ENGLISH_AURA_TIERS[currentTier].name or "Unknown",
        totalXP = currentXP,
        nextTierXP = nextTier and nextTier.xpRequired or nil,
        xpToNext = xpToNext,
        isMaxTier = (currentTier >= #ENGLISH_AURA_TIERS),
    }
end

--------------------------------------------------------------------------------
-- SKIN MANAGER (Spec §7)
--------------------------------------------------------------------------------
local MAX_SAVED_OUTFITS_FREE = 3
local MAX_SAVED_OUTFITS_PREMIUM = 10

function CosmeticController.EquipSkin(player, loadout)
    local userId = player.UserId
    local inv = playerInventories[userId]
    if not inv then return false, "NO_INVENTORY" end

    -- Validate all items in loadout are owned
    local slots = { "outfit", "hat", "back", "face", "shoulderL", "shoulderR" }
    for _, slot in ipairs(slots) do
        local instanceId = loadout[slot]
        if instanceId then
            local entry = inv.owned[instanceId]
            if not entry then return false, "NOT_OWNED:" .. slot end
            local item = Catalog.items[entry.itemId]
            if not item or item.category ~= "Skin" then return false, "NOT_A_SKIN:" .. slot end
        end
    end

    inv.equippedSkin = {
        outfit = loadout.outfit,
        hat = loadout.hat,
        back = loadout.back,
        face = loadout.face,
        shoulderL = loadout.shoulderL,
        shoulderR = loadout.shoulderR,
    }

    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if remotes then
        local ev = remotes:FindFirstChild("CosmeticEquipped")
        if ev then
            pcall(function()
                ev:FireAllClients(userId, "Skin", inv.equippedSkin)
            end)
        end
    end

    emitAnalytics(player, "skin_equipped", { loadout = loadout })
    task.spawn(function() saveInventory(userId) end)
    return true
end

function CosmeticController.GetEquippedSkin(player)
    local inv = playerInventories[player.UserId]
    if not inv then return nil end
    return inv.equippedSkin
end

function CosmeticController.SaveOutfitPreset(player, name, loadout)
    local userId = player.UserId
    local inv = playerInventories[userId]
    if not inv then return false, "NO_INVENTORY" end

    inv.savedOutfits = inv.savedOutfits or {}

    -- Check slot limit (TODO: check premium status)
    local count = 0
    for _ in pairs(inv.savedOutfits) do count = count + 1 end
    if count >= MAX_SAVED_OUTFITS_FREE and not inv.savedOutfits[name] then
        return false, "OUTFIT_LIMIT_REACHED"
    end

    inv.savedOutfits[name] = loadout
    task.spawn(function() saveInventory(userId) end)
    return true
end

function CosmeticController.GetSavedOutfits(player)
    local inv = playerInventories[player.UserId]
    if not inv then return {} end
    return inv.savedOutfits or {}
end

function CosmeticController.DeleteOutfitPreset(player, name)
    local inv = playerInventories[player.UserId]
    if not inv or not inv.savedOutfits then return false end
    inv.savedOutfits[name] = nil
    task.spawn(function() saveInventory(player.UserId) end)
    return true
end

--------------------------------------------------------------------------------
-- INTEGRATION: GACHA BRIDGE (Spec §9)
-- Called by GachaManager after successful pull
--------------------------------------------------------------------------------
function CosmeticController.OnGachaPull(player, itemId, crateType)
    local ok, instanceId = CosmeticController.GrantItem(player, itemId, "Gacha")
    if ok then
        local inv = playerInventories[player.UserId]
        if inv then
            inv.totalPulls = (inv.totalPulls or 0) + 1
        end
    end
    return ok, instanceId
end

--------------------------------------------------------------------------------
-- INTEGRATION: BATTLEPASS BRIDGE (Spec §10)
-- Called by BattlePass when tier reward is a cosmetic
--------------------------------------------------------------------------------
function CosmeticController.OnBattlePassReward(player, itemId, tier, isPremium)
    return CosmeticController.GrantItem(player, itemId, "BattlePass")
end

--------------------------------------------------------------------------------
-- INTEGRATION: TRADE BRIDGE (Spec §11)
-- Called by TradeManager for atomic P2P transfers
--------------------------------------------------------------------------------
function CosmeticController.TransferItem(fromPlayer, toPlayer, instanceId)
    local fromInv = playerInventories[fromPlayer.UserId]
    local toInv = playerInventories[toPlayer.UserId]
    if not fromInv or not toInv then return false, "NO_INVENTORY" end

    local entry = fromInv.owned[instanceId]
    if not entry then return false, "NOT_OWNED" end
    if entry.locked then return false, "ITEM_LOCKED" end

    local item = Catalog.items[entry.itemId]
    if not item then return false, "INVALID_ITEM" end
    if not item.tradeable then return false, "NOT_TRADEABLE" end
    if item.englishOnly then return false, "ENGLISH_ONLY" end

    -- Unequip from sender
    if fromInv.equippedPet == instanceId then fromInv.equippedPet = nil end
    if fromInv.equippedAura == instanceId then fromInv.equippedAura = nil end

    -- Atomic transfer
    fromInv.owned[instanceId] = nil
    toInv.owned[instanceId] = entry

    -- Update trade counters
    fromInv.totalTrades = (fromInv.totalTrades or 0) + 1
    toInv.totalTrades = (toInv.totalTrades or 0) + 1

    -- Save both
    task.spawn(function()
        saveInventory(fromPlayer.UserId)
        saveInventory(toPlayer.UserId)
    end)

    emitAnalytics(fromPlayer, "trade_sent", { itemId = entry.itemId, instanceId = instanceId })
    emitAnalytics(toPlayer, "trade_received", { itemId = entry.itemId, instanceId = instanceId })

    return true
end

function CosmeticController.IsItemTradeable(instanceId, player)
    local inv = playerInventories[player.UserId]
    if not inv then return false end
    local entry = inv.owned[instanceId]
    if not entry or entry.locked then return false end
    local item = Catalog.items[entry.itemId]
    if not item or not item.tradeable or item.englishOnly then return false end
    return true
end

--------------------------------------------------------------------------------
-- FULL LOADOUT QUERY (for client rendering)
--------------------------------------------------------------------------------
function CosmeticController.GetFullLoadout(player)
    local inv = playerInventories[player.UserId]
    if not inv then return nil end

    local pet = nil
    if inv.equippedPet and inv.owned[inv.equippedPet] then
        local entry = inv.owned[inv.equippedPet]
        pet = { instanceId = inv.equippedPet, itemId = entry.itemId, item = Catalog.items[entry.itemId] }
    end

    local cosmeticAura = nil
    if inv.equippedAura and inv.owned[inv.equippedAura] then
        local entry = inv.owned[inv.equippedAura]
        cosmeticAura = { instanceId = inv.equippedAura, itemId = entry.itemId, item = Catalog.items[entry.itemId] }
    end

    local englishAura = nil
    if inv.equippedEnglishAura and inv.owned[inv.equippedEnglishAura] then
        local entry = inv.owned[inv.equippedEnglishAura]
        englishAura = { instanceId = inv.equippedEnglishAura, itemId = entry.itemId, item = Catalog.items[entry.itemId] }
    end

    return {
        pet = pet,
        cosmeticAura = cosmeticAura,
        englishAura = englishAura,
        englishAuraTier = inv.englishAuraTier or 1,
        skin = inv.equippedSkin,
    }
end

--------------------------------------------------------------------------------
-- PLAYER STATS
--------------------------------------------------------------------------------
function CosmeticController.GetPlayerStats(player)
    local inv = playerInventories[player.UserId]
    if not inv then return nil end
    return {
        ownedCount = #CosmeticController.GetOwnedItems(player),
        petCount = #CosmeticController.GetOwnedItems(player, "Pet"),
        auraCount = #CosmeticController.GetOwnedItems(player, "Aura"),
        skinCount = #CosmeticController.GetOwnedItems(player, "Skin"),
        englishAuraTier = inv.englishAuraTier or 1,
        englishAuraXP = inv.englishAuraXP or 0,
        totalPulls = inv.totalPulls or 0,
        totalTrades = inv.totalTrades or 0,
        totalFusions = inv.totalFusions or 0,
    }
end

--------------------------------------------------------------------------------
-- DIAGNOSTICS
--------------------------------------------------------------------------------
function CosmeticController.GetDebugState(player)
    local inv = playerInventories[player.UserId]
    return {
        inventory = inv,
        loadout = CosmeticController.GetFullLoadout(player),
        petAbilities = CosmeticController.GetPetAbilities(player),
        englishAuraProgress = CosmeticController.GetEnglishAuraProgress(player),
        catalogStats = CosmeticController.GetCatalogStats(),
        depsLoaded = {
            DataStoreV2 = Deps.DataStoreV2 ~= nil,
            AnalyticsService = Deps.AnalyticsService ~= nil,
            GachaManager = Deps.GachaManager ~= nil,
            EnglishRewardsManager = Deps.EnglishRewardsManager ~= nil,
            MonetizationOrchestrator = Deps.MonetizationOrchestrator ~= nil,
        },
    }
end

--------------------------------------------------------------------------------
-- DEFAULT CATALOG ITEMS (Starter set — expandable via CosmeticData module)
--------------------------------------------------------------------------------
local function populateDefaultCatalog()
    -- English Aura tiers (auto-generated from ENGLISH_AURA_TIERS)
    for _, tierData in ipairs(ENGLISH_AURA_TIERS) do
        registerItem({
            id = string.format("AURA_ENGLISH_%s_%03d", string.upper(tierData.name), 1),
            category = "Aura",
            subcategory = "EnglishAura",
            name = "English " .. tierData.name,
            description = "English Learning Aura — " .. tierData.name .. " tier. Cannot be purchased.",
            rarity = tierData.rarity,
            englishOnly = true,
            tradeable = false,
            purchaseable = false,
            tags = { "english", "aura", "learning", tierData.name:lower() },
        })
    end

    -- Starter pets (placeholder set — replace with full catalog via CosmeticData.lua)
    local petNames = {
        { id = "PET_MOUSE_BASIC_001",    name = "Basic Mouse",       rarity = 1 },
        { id = "PET_CUB_STARTER_001",    name = "Starter Cub",       rarity = 2 },
        { id = "PET_DRAGON_FIRE_001",    name = "Fire Dragon",       rarity = 3 },
        { id = "PET_PHOENIX_GOLD_001",   name = "Golden Phoenix",    rarity = 5 },
        { id = "PET_ENGLISH_BUDDY_001",  name = "English Buddy",     rarity = 3, englishOnly = true },
        { id = "PET_ENGLISH_PHOENIX_001",name = "English Phoenix",   rarity = 7, englishOnly = true },
    }
    for _, p in ipairs(petNames) do
        registerItem({
            id = p.id, category = "Pet", subcategory = p.englishOnly and "EnglishBuddy" or "StandardPet",
            name = p.name, description = p.name .. " companion",
            rarity = p.rarity, englishOnly = p.englishOnly or false,
            tags = { "pet", p.name:lower() },
        })
    end

    -- Starter auras (cosmetic)
    local auraNames = {
        { id = "AURA_COSMETIC_FLAME_001",   name = "Flame Aura",    rarity = 3 },
        { id = "AURA_COSMETIC_GALAXY_001",   name = "Galaxy Aura",   rarity = 5 },
        { id = "AURA_COSMETIC_VOID_001",     name = "Void Aura",     rarity = 6 },
    }
    for _, a in ipairs(auraNames) do
        registerItem({
            id = a.id, category = "Aura", subcategory = "CosmeticAura",
            name = a.name, description = a.name .. " visual effect",
            rarity = a.rarity, tags = { "aura", a.name:lower() },
        })
    end

    -- Starter skins
    local skinNames = {
        { id = "SKIN_OUTFIT_CYBERPUNK_001",  name = "Cyberpunk Outfit",  rarity = 3, sub = "Outfit" },
        { id = "SKIN_OUTFIT_TIGER_001",      name = "Tiger Outfit",      rarity = 5, sub = "Outfit" },
        { id = "SKIN_EMOTE_VICTORY_001",     name = "Victory Emote",     rarity = 2, sub = "Emote" },
        { id = "SKIN_ENGLISH_MASTER_001",    name = "English Master Set", rarity = 5, sub = "Outfit", englishOnly = true },
    }
    for _, s in ipairs(skinNames) do
        registerItem({
            id = s.id, category = "Skin", subcategory = s.sub,
            name = s.name, description = s.name,
            rarity = s.rarity, englishOnly = s.englishOnly or false,
            tags = { "skin", s.sub:lower(), s.name:lower() },
        })
    end
end

--------------------------------------------------------------------------------
-- PLAYER LIFECYCLE
--------------------------------------------------------------------------------
local function onPlayerJoin(player)
    local userId = player.UserId
    playerInventories[userId] = loadInventory(userId)
end

local function onPlayerLeave(player)
    local userId = player.UserId
    if playerInventories[userId] then
        saveInventory(userId)
        playerInventories[userId] = nil
    end
end

--------------------------------------------------------------------------------
-- REMOTE SETUP
--------------------------------------------------------------------------------
local function setupRemotes()
    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if not remotes then
        remotes = Instance.new("Folder")
        remotes.Name = "Remotes"
        remotes.Parent = ReplicatedStorage
    end

    -- Events for replication
    for _, name in ipairs({ "CosmeticEquipped", "CosmeticUnequipped", "ServerAnnouncement" }) do
        if not remotes:FindFirstChild(name) then
            local ev = Instance.new("RemoteEvent")
            ev.Name = name
            ev.Parent = remotes
        end
    end

    -- Client query remote
    if not remotes:FindFirstChild("CosmeticQuery") then
        local rf = Instance.new("RemoteFunction")
        rf.Name = "CosmeticQuery"
        rf.Parent = remotes
        rf.OnServerInvoke = function(player, action, ...)
            if action == "GetLoadout" then
                return CosmeticController.GetFullLoadout(player)
            elseif action == "GetOwned" then
                return CosmeticController.GetOwnedItems(player, ...)
            elseif action == "GetStats" then
                return CosmeticController.GetPlayerStats(player)
            elseif action == "GetEnglishAura" then
                return CosmeticController.GetEnglishAuraProgress(player)
            elseif action == "GetCatalog" then
                return CosmeticController.GetCatalogStats()
            elseif action == "Search" then
                return CosmeticController.Search(...)
            elseif action == "GetSavedOutfits" then
                return CosmeticController.GetSavedOutfits(player)
            end
            return nil
        end
    end

    -- Client action remote
    if not remotes:FindFirstChild("CosmeticAction") then
        local rf = Instance.new("RemoteFunction")
        rf.Name = "CosmeticAction"
        rf.Parent = remotes
        rf.OnServerInvoke = function(player, action, ...)
            if action == "EquipPet" then
                return CosmeticController.EquipPet(player, ...)
            elseif action == "UnequipPet" then
                return CosmeticController.UnequipPet(player)
            elseif action == "EquipAura" then
                return CosmeticController.EquipAura(player, ...)
            elseif action == "UnequipAura" then
                return CosmeticController.UnequipAura(player, ...)
            elseif action == "EquipSkin" then
                return CosmeticController.EquipSkin(player, ...)
            elseif action == "FusePets" then
                return CosmeticController.FusePets(player, ...)
            elseif action == "SaveOutfit" then
                return CosmeticController.SaveOutfitPreset(player, ...)
            elseif action == "DeleteOutfit" then
                return CosmeticController.DeleteOutfitPreset(player, ...)
            elseif action == "LockItem" then
                return CosmeticController.LockItem(player, ...)
            end
            return false, "INVALID_ACTION"
        end
    end
end

--------------------------------------------------------------------------------
-- INIT / SHUTDOWN
--------------------------------------------------------------------------------
function CosmeticController.Init()
    -- DataStore
    pcall(function()
        CosmeticStore = DataStoreService:GetDataStore("CosmeticInventory_v1")
    end)

    -- Load optional dependencies
    local function tryLoad(name)
        local mod = ServerStorage:FindFirstChild(name) or ServerStorage:FindFirstChild(name, true)
        if mod then
            local ok, result = pcall(require, mod)
            if ok then return result end
        end
        return nil
    end

    Deps.DataStoreV2 = tryLoad("DataStoreV2")
    Deps.AnalyticsService = tryLoad("AnalyticsService")
    Deps.GachaManager = tryLoad("GachaManager")
    Deps.BattlePass = tryLoad("BattlePass")
    Deps.TradeManager = tryLoad("TradeManager")
    Deps.EnglishRewardsManager = tryLoad("EnglishRewardsManager")
    Deps.MonetizationOrchestrator = tryLoad("MonetizationOrchestrator")
    Deps.EconomyManager = tryLoad("EconomyManager")

    -- Populate default catalog
    populateDefaultCatalog()

    -- Try loading extended catalog from CosmeticData module
    local CosmeticData = tryLoad("CosmeticData")
    if CosmeticData and type(CosmeticData.GetItems) == "function" then
        for _, item in ipairs(CosmeticData.GetItems()) do
            registerItem(item)
        end
    end

    -- Setup remotes
    setupRemotes()

    -- Player lifecycle
    Players.PlayerAdded:Connect(onPlayerJoin)
    Players.PlayerRemoving:Connect(onPlayerLeave)
    for _, player in ipairs(Players:GetPlayers()) do
        task.spawn(onPlayerJoin, player)
    end

    local stats = CosmeticController.GetCatalogStats()
    print("===============================================================")
    print("[CosmeticController] v1.0 — Unified Cosmetic Trinity")
    print("English is the mechanic, cosmetics are the visible proof.")
    print(string.format("Catalog: %d items | Pets: %d | Auras: %d | Skins: %d",
        stats.total,
        stats.byCategory.Pet or 0,
        stats.byCategory.Aura or 0,
        stats.byCategory.Skin or 0))
    print("English Aura Tiers: 8 (Spark -> Transcendent)")
    print("Pipeline: Active Mission — 100% Roblox (Run 73)")
    print("===============================================================")
    return true
end

function CosmeticController.Shutdown()
    for _, player in ipairs(Players:GetPlayers()) do
        pcall(saveInventory, player.UserId)
    end
    print("[CosmeticController] Shutdown — all inventories saved")
end

return CosmeticController
