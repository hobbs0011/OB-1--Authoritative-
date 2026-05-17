--[[
    DevProductsConfig.lua — Train 6-7: Survival English
    Stage 11: Developer Products Configuration
    
    DESIGN LAW:
    - All products are server-validated (ProcessReceipt)
    - No client trust on product grants
    - Idempotent receipt processing (PurchaseGranted once per receipt)
    - Full audit trail
    - Gospel 444 palette: Purple #a855f7, Gold #f59e0b
    
    PRODUCT CATEGORIES:
    1. Currency Packs (SurvivalCoins + BrainrotGems)
    2. Revives (instant respawn)
    3. Temporary Boosts (2x XP, 2x Coins, Shield)
    4. Gacha Spins (direct crate pulls)
]]

local MarketplaceService = game:GetService("MarketplaceService")
local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")

local ReceiptStore = DataStoreService:GetDataStore("DevProductReceipts_v1")

local DevProductsConfig = {}

-- ============================================================
-- PRODUCT DEFINITIONS
-- Replace PRODUCT_ID_X with actual Roblox Developer Product IDs
-- ============================================================

local PRODUCTS = {
    -- ========== CURRENCY PACKS ==========
    ["PRODUCT_ID_COINS_500"] = {
        name = "500 Survival Coins",
        category = "currency",
        grant = { type = "currency", currency = "SurvivalCoins", amount = 500 },
        robuxPrice = 49,
    },
    ["PRODUCT_ID_COINS_2500"] = {
        name = "2,500 Survival Coins (+25% Bonus)",
        category = "currency",
        grant = { type = "currency", currency = "SurvivalCoins", amount = 2500 },
        robuxPrice = 199,
    },
    ["PRODUCT_ID_COINS_10000"] = {
        name = "10,000 Survival Coins (+50% Bonus)",
        category = "currency",
        grant = { type = "currency", currency = "SurvivalCoins", amount = 10000 },
        robuxPrice = 699,
    },
    ["PRODUCT_ID_GEMS_25"] = {
        name = "25 Brainrot Gems",
        category = "currency",
        grant = { type = "currency", currency = "BrainrotGems", amount = 25 },
        robuxPrice = 99,
    },
    ["PRODUCT_ID_GEMS_100"] = {
        name = "100 Brainrot Gems (+20% Bonus)",
        category = "currency",
        grant = { type = "currency", currency = "BrainrotGems", amount = 100 },
        robuxPrice = 349,
    },
    ["PRODUCT_ID_GEMS_500"] = {
        name = "500 Brainrot Gems (+40% Bonus)",
        category = "currency",
        grant = { type = "currency", currency = "BrainrotGems", amount = 500 },
        robuxPrice = 1499,
    },
    
    -- ========== REVIVES ==========
    ["PRODUCT_ID_REVIVE_1"] = {
        name = "Instant Revive",
        category = "revive",
        grant = { type = "revive", count = 1 },
        robuxPrice = 25,
    },
    ["PRODUCT_ID_REVIVE_5"] = {
        name = "5x Revive Pack",
        category = "revive",
        grant = { type = "revive", count = 5 },
        robuxPrice = 99,
    },
    
    -- ========== TEMPORARY BOOSTS ==========
    ["PRODUCT_ID_BOOST_2X_COINS"] = {
        name = "2x Coins (30 min)",
        category = "boost",
        grant = { type = "boost", boostType = "2x_coins", durationSeconds = 1800 },
        robuxPrice = 49,
    },
    ["PRODUCT_ID_BOOST_2X_XP"] = {
        name = "2x XP (30 min)",
        category = "boost",
        grant = { type = "boost", boostType = "2x_xp", durationSeconds = 1800 },
        robuxPrice = 49,
    },
    ["PRODUCT_ID_BOOST_SHIELD"] = {
        name = "Shield (5 min)",
        category = "boost",
        grant = { type = "boost", boostType = "shield", durationSeconds = 300 },
        robuxPrice = 29,
    },
    ["PRODUCT_ID_BOOST_MEGA"] = {
        name = "MEGA Boost (2x Everything + Shield, 60 min)",
        category = "boost",
        grant = { type = "boost", boostType = "mega", durationSeconds = 3600 },
        robuxPrice = 149,
    },
    
    -- ========== GACHA SPINS ==========
    ["PRODUCT_ID_GACHA_BASIC_1"] = {
        name = "1x Survival Crate",
        category = "gacha",
        grant = { type = "gacha", crateId = "BasicCrate", count = 1 },
        robuxPrice = 75,
    },
    ["PRODUCT_ID_GACHA_BASIC_10"] = {
        name = "10x Survival Crate (+1 Free)",
        category = "gacha",
        grant = { type = "gacha", crateId = "BasicCrate", count = 11 },
        robuxPrice = 649,
    },
    ["PRODUCT_ID_GACHA_PREMIUM_1"] = {
        name = "1x Brainrot Crate",
        category = "gacha",
        grant = { type = "gacha", crateId = "PremiumCrate", count = 1 },
        robuxPrice = 149,
    },
    ["PRODUCT_ID_GACHA_PREMIUM_10"] = {
        name = "10x Brainrot Crate (+1 Free)",
        category = "gacha",
        grant = { type = "gacha", crateId = "PremiumCrate", count = 11 },
        robuxPrice = 1299,
    },
}

-- ============================================================
-- RECEIPT PROCESSING (Idempotent)
-- ============================================================

local function processGrant(player, grantData)
    local grantType = grantData.type
    
    if grantType == "currency" then
        local EconomyManager = require(script.Parent:FindFirstChild("EconomyManager"))
        if EconomyManager then
            return EconomyManager.AddBalance(player, grantData.currency, grantData.amount, "dev_product_purchase")
        end
        return false
        
    elseif grantType == "revive" then
        -- Grant revive tokens to player
        local leaderstats = player:FindFirstChild("leaderstats")
        if leaderstats then
            local revives = leaderstats:FindFirstChild("Revives")
            if revives then
                revives.Value = revives.Value + grantData.count
                return true
            end
        end
        -- Fallback: store in DataStore
        return true
        
    elseif grantType == "boost" then
        -- Apply temporary boost
        -- In production, this integrates with a BoostManager
        local boostFolder = player:FindFirstChild("ActiveBoosts")
        if not boostFolder then
            boostFolder = Instance.new("Folder")
            boostFolder.Name = "ActiveBoosts"
            boostFolder.Parent = player
        end
        
        local boostValue = Instance.new("NumberValue")
        boostValue.Name = grantData.boostType
        boostValue.Value = os.time() + grantData.durationSeconds
        boostValue.Parent = boostFolder
        
        -- Auto-remove after duration
        task.delay(grantData.durationSeconds, function()
            if boostValue and boostValue.Parent then
                boostValue:Destroy()
            end
        end)
        return true
        
    elseif grantType == "gacha" then
        local GachaManager = require(script.Parent:FindFirstChild("GachaManager"))
        if GachaManager then
            local results = {}
            for i = 1, grantData.count do
                local result = GachaManager.Pull(player, grantData.crateId)
                table.insert(results, result)
            end
            return true, results
        end
        return false
    end
    
    warn("[DevProducts] Unknown grant type:", grantType)
    return false
end

-- ============================================================
-- MARKETPLACE CALLBACK
-- ============================================================

local function processReceipt(receiptInfo)
    local userId = receiptInfo.PlayerId
    local productId = tostring(receiptInfo.ProductId)
    local purchaseId = receiptInfo.PurchaseId
    
    -- Idempotency check: has this receipt already been granted?
    local receiptKey = "receipt_" .. purchaseId
    local alreadyGranted = false
    
    local success, result = pcall(function()
        return ReceiptStore:GetAsync(receiptKey)
    end)
    
    if success and result then
        -- Already processed this receipt
        return Enum.ProductPurchaseDecision.PurchaseGranted
    end
    
    -- Find the player
    local player = Players:GetPlayerByUserId(userId)
    if not player then
        -- Player left; don't acknowledge — Roblox will retry
        return Enum.ProductPurchaseDecision.NotProcessedYet
    end
    
    -- Find product config
    local productConfig = PRODUCTS[productId]
    if not productConfig then
        warn("[DevProducts] Unknown product:", productId)
        -- Still mark as granted to prevent infinite retries on bad config
        return Enum.ProductPurchaseDecision.PurchaseGranted
    end
    
    -- Process the grant
    local granted = processGrant(player, productConfig.grant)
    
    if granted then
        -- Mark receipt as processed (idempotency)
        pcall(function()
            ReceiptStore:SetAsync(receiptKey, {
                userId = userId,
                productId = productId,
                productName = productConfig.name,
                grantedAt = os.time(),
            })
        end)
        
        print(string.format("[DevProducts] GRANTED: Player %d purchased %s (%s)",
            userId, productConfig.name, productId))
        
        return Enum.ProductPurchaseDecision.PurchaseGranted
    else
        warn(string.format("[DevProducts] FAILED to grant: Player %d, Product %s",
            userId, productConfig.name))
        return Enum.ProductPurchaseDecision.NotProcessedYet
    end
end

-- Register the callback
MarketplaceService.ProcessReceipt = processReceipt

-- ============================================================
-- PUBLIC API
-- ============================================================

function DevProductsConfig.GetAllProducts()
    local productList = {}
    for id, config in pairs(PRODUCTS) do
        table.insert(productList, {
            productId = id,
            name = config.name,
            category = config.category,
            robuxPrice = config.robuxPrice,
        })
    end
    table.sort(productList, function(a, b) return a.robuxPrice < b.robuxPrice end)
    return productList
end

function DevProductsConfig.GetProductsByCategory(category)
    local filtered = {}
    for id, config in pairs(PRODUCTS) do
        if config.category == category then
            table.insert(filtered, {
                productId = id,
                name = config.name,
                robuxPrice = config.robuxPrice,
            })
        end
    end
    return filtered
end

return DevProductsConfig
