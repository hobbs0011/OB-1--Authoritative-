--[[
═══════════════════════════════════════════════════════════
SURVIVE A BRAINROT — GAME PASS CONFIGURATION
Script: GamePassConfig.lua
Type: Server Module (ServerScriptService)
Purpose: 5 tiered game passes with perks and server validation
Version: 1.0
Date: March 26, 2026
Pipeline: Stage 5 of 20 — Train 6-7 Launch Pipeline
Gospel 444 Compliant — NO BLUE
Phoenix Rising Gaming Division
═══════════════════════════════════════════════════════════
RESEARCH BASIS (Q5 + Q14):
  - 2x Money pass is #1 purchased pass type on Roblox
  - VIP passes with exclusive access drive aspirational spending
  - Tiered pricing captures all wallet sizes
  - Game passes are ONE-TIME purchases (permanent)
  - Developer Products are REPEATABLE (consumables)
  - Never sell power directly. Sell speed + convenience + cosmetics.
═══════════════════════════════════════════════════════════
]]

local GamePassConfig = {}

-- SERVICES
local MarketplaceService = game:GetService("MarketplaceService")
local Players = game:GetService("Players")

-- ══════════════════════════════════════════════════════════
-- PASS DEFINITIONS
-- ══════════════════════════════════════════════════════════

-- Pass IDs are set to 0 until created in Roblox Creator Dashboard
-- Replace with actual IDs after creation

GamePassConfig.Passes = {
    -- TIER 1: IMPULSE BUY (low barrier)
    {
        Name = "2x Coins",
        InternalId = "PASS_2X_COINS",
        GamePassId = 0, -- SET AFTER CREATION
        Robux = 99,
        Tier = "Impulse",
        Description = "Double ALL Survival Coin earnings forever!",
        Perks = {
            CoinMultiplier = 2.0,
        },
        Priority = 1, -- highest purchase rate
    },
    
    -- TIER 2: STANDARD (core value)
    {
        Name = "2x XP",
        InternalId = "PASS_2X_XP",
        GamePassId = 0,
        Robux = 149,
        Tier = "Standard",
        Description = "Level up 2x faster! Double ALL XP earned.",
        Perks = {
            XPMultiplier = 2.0,
        },
        Priority = 2,
    },
    {
        Name = "Auto-Collect",
        InternalId = "PASS_AUTO_COLLECT",
        GamePassId = 0,
        Robux = 199,
        Tier = "Standard",
        Description = "Automatically collect drops, coins, and loot. Never miss a pickup!",
        Perks = {
            AutoCollect = true,
            CollectRadius = 30, -- studs
        },
        Priority = 3,
    },
    
    -- TIER 3: PREMIUM (dedicated players)
    {
        Name = "VIP Access",
        InternalId = "PASS_VIP",
        GamePassId = 0,
        Robux = 499,
        Tier = "Premium",
        Description = "VIP badge + exclusive VIP zone + 5 bonus daily gems + VIP chat tag",
        Perks = {
            VIPBadge = true,
            VIPZoneAccess = true,
            DailyBonusGems = 5,
            ChatTag = "[VIP]",
            ChatTagColor = Color3.fromRGB(168, 85, 247), -- Purple
        },
        Priority = 4,
    },
    
    -- TIER 4: WHALE (all-in supporters)
    {
        Name = "Ultimate Survivor Pack",
        InternalId = "PASS_ULTIMATE",
        GamePassId = 0,
        Robux = 1499,
        Tier = "Whale",
        Description = "ALL passes included + exclusive Brainrot Immune aura + 10 daily gems + priority server join",
        Perks = {
            IncludesAllPasses = true,
            CoinMultiplier = 2.0,
            XPMultiplier = 2.0,
            AutoCollect = true,
            CollectRadius = 30,
            VIPBadge = true,
            VIPZoneAccess = true,
            DailyBonusGems = 10,
            ChatTag = "[ULTIMATE]",
            ChatTagColor = Color3.fromRGB(245, 158, 11), -- Gold
            ExclusiveAura = "BrainrotImmune",
            PriorityJoin = true,
        },
        Priority = 5,
    },
}

-- ══════════════════════════════════════════════════════════
-- DEVELOPER PRODUCTS (repeatable purchases)
-- ══════════════════════════════════════════════════════════

GamePassConfig.DevProducts = {
    -- Gem packs (map to EconomyManager.Config.GemPacks)
    { Name = "100 Gems",   ProductId = 0, Type = "GemPack", GemPackIndex = 1 },
    { Name = "500 Gems",   ProductId = 0, Type = "GemPack", GemPackIndex = 2 },
    { Name = "1200 Gems",  ProductId = 0, Type = "GemPack", GemPackIndex = 3 },
    { Name = "3000 Gems",  ProductId = 0, Type = "GemPack", GemPackIndex = 4 },
    { Name = "10000 Gems", ProductId = 0, Type = "GemPack", GemPackIndex = 5 },
    
    -- Consumables
    { Name = "Instant Revive",  ProductId = 0, Type = "Revive",    Robux = 25 },
    { Name = "30min 2x Coins",  ProductId = 0, Type = "TempBoost", BoostType = "Coins", Multiplier = 2.0, Duration = 1800 },
    { Name = "30min 2x XP",     ProductId = 0, Type = "TempBoost", BoostType = "XP",    Multiplier = 2.0, Duration = 1800 },
    { Name = "Gacha Spin x1",   ProductId = 0, Type = "GachaSpin", Spins = 1, Robux = 75 },
    { Name = "Gacha Spin x10",  ProductId = 0, Type = "GachaSpin", Spins = 10, Robux = 650 }, -- ~13% discount
}

-- ══════════════════════════════════════════════════════════
-- PASS OWNERSHIP CACHE
-- ══════════════════════════════════════════════════════════

local passCache = {} -- [UserId] = { [InternalId] = true/false }

--- Check if player owns a pass (cached)
function GamePassConfig.hasPass(player, internalId)
    local userId = player.UserId
    if not passCache[userId] then
        passCache[userId] = {}
    end
    
    -- Check cache first
    if passCache[userId][internalId] ~= nil then
        return passCache[userId][internalId]
    end
    
    -- Find the pass
    local pass = nil
    for _, p in ipairs(GamePassConfig.Passes) do
        if p.InternalId == internalId then
            pass = p
            break
        end
    end
    
    if not pass or pass.GamePassId == 0 then
        passCache[userId][internalId] = false
        return false
    end
    
    -- Query Roblox
    local ok, owns = pcall(function()
        return MarketplaceService:UserOwnsGamePassAsync(userId, pass.GamePassId)
    end)
    
    local result = ok and owns or false
    passCache[userId][internalId] = result
    
    -- Ultimate pass includes all others
    if passCache[userId]["PASS_ULTIMATE"] then
        passCache[userId][internalId] = true
        return true
    end
    
    return result
end

--- Get all perks for a player (merges all owned passes)
function GamePassConfig.getActivePerks(player)
    local perks = {
        CoinMultiplier = 1.0,
        XPMultiplier = 1.0,
        AutoCollect = false,
        CollectRadius = 0,
        VIPBadge = false,
        VIPZoneAccess = false,
        DailyBonusGems = 0,
        ChatTag = nil,
        ChatTagColor = nil,
        ExclusiveAura = nil,
        PriorityJoin = false,
    }
    
    for _, pass in ipairs(GamePassConfig.Passes) do
        if GamePassConfig.hasPass(player, pass.InternalId) then
            local p = pass.Perks
            if p.CoinMultiplier then
                perks.CoinMultiplier = math.max(perks.CoinMultiplier, p.CoinMultiplier)
            end
            if p.XPMultiplier then
                perks.XPMultiplier = math.max(perks.XPMultiplier, p.XPMultiplier)
            end
            if p.AutoCollect then
                perks.AutoCollect = true
                perks.CollectRadius = math.max(perks.CollectRadius, p.CollectRadius or 0)
            end
            if p.VIPBadge then perks.VIPBadge = true end
            if p.VIPZoneAccess then perks.VIPZoneAccess = true end
            if p.DailyBonusGems then
                perks.DailyBonusGems = math.max(perks.DailyBonusGems, p.DailyBonusGems)
            end
            if p.ChatTag then
                perks.ChatTag = p.ChatTag
                perks.ChatTagColor = p.ChatTagColor
            end
            if p.ExclusiveAura then perks.ExclusiveAura = p.ExclusiveAura end
            if p.PriorityJoin then perks.PriorityJoin = true end
        end
    end
    
    return perks
end

--- Load pass ownership on join (batch check)
function GamePassConfig.loadPlayerPasses(player)
    passCache[player.UserId] = {}
    
    -- Check Ultimate first (includes all)
    if GamePassConfig.hasPass(player, "PASS_ULTIMATE") then
        for _, pass in ipairs(GamePassConfig.Passes) do
            passCache[player.UserId][pass.InternalId] = true
        end
        return
    end
    
    -- Check each pass
    for _, pass in ipairs(GamePassConfig.Passes) do
        GamePassConfig.hasPass(player, pass.InternalId)
    end
end

-- ══════════════════════════════════════════════════════════
-- PURCHASE HANDLING
-- ══════════════════════════════════════════════════════════

--- Handle game pass purchase callback
function GamePassConfig.onGamePassPurchase(player, gamePassId, wasPurchased)
    if not wasPurchased then return end
    
    -- Find which pass was purchased
    for _, pass in ipairs(GamePassConfig.Passes) do
        if pass.GamePassId == gamePassId then
            -- Update cache
            if not passCache[player.UserId] then
                passCache[player.UserId] = {}
            end
            passCache[player.UserId][pass.InternalId] = true
            
            -- If Ultimate, unlock all
            if pass.InternalId == "PASS_ULTIMATE" then
                for _, p in ipairs(GamePassConfig.Passes) do
                    passCache[player.UserId][p.InternalId] = true
                end
            end
            
            print(string.format(
                "[GamePassConfig] %s purchased %s (%s, %d R$)",
                player.Name, pass.Name, pass.Tier, pass.Robux
            ))
            break
        end
    end
end

--- Handle developer product purchase
function GamePassConfig.processDevProductReceipt(receiptInfo)
    local userId = receiptInfo.PlayerId
    local productId = receiptInfo.ProductId
    
    local player = Players:GetPlayerByUserId(userId)
    if not player then
        return Enum.ProductPurchaseDecision.NotProcessedYet
    end
    
    -- Find the product
    for _, product in ipairs(GamePassConfig.DevProducts) do
        if product.ProductId == productId then
            local ok = pcall(function()
                if product.Type == "GemPack" then
                    -- Delegate to EconomyManager
                    -- EconomyManager.processGemPurchase(player, product.GemPackIndex)
                    print("[GamePassConfig] Gem pack purchased: " .. product.Name)
                elseif product.Type == "Revive" then
                    player:SetAttribute("HasRevive", true)
                    print("[GamePassConfig] Revive granted to " .. player.Name)
                elseif product.Type == "TempBoost" then
                    player:SetAttribute("Boost_" .. product.BoostType, product.Multiplier)
                    player:SetAttribute("BoostExpiry_" .. product.BoostType,
                        os.clock() + product.Duration)
                    print("[GamePassConfig] Temp boost granted: " .. product.Name)
                elseif product.Type == "GachaSpin" then
                    player:SetAttribute("PendingGachaSpins",
                        (player:GetAttribute("PendingGachaSpins") or 0) + product.Spins)
                    print("[GamePassConfig] Gacha spins granted: " .. product.Spins)
                end
            end)
            
            if ok then
                return Enum.ProductPurchaseDecision.PurchaseGranted
            else
                return Enum.ProductPurchaseDecision.NotProcessedYet
            end
        end
    end
    
    return Enum.ProductPurchaseDecision.NotProcessedYet
end

-- ══════════════════════════════════════════════════════════
-- CLEANUP
-- ══════════════════════════════════════════════════════════
Players.PlayerRemoving:Connect(function(player)
    passCache[player.UserId] = nil
end)

-- ══════════════════════════════════════════════════════════
-- INIT
-- ══════════════════════════════════════════════════════════

-- Register callbacks
MarketplaceService.PromptGamePassPurchaseFinished:Connect(GamePassConfig.onGamePassPurchase)
MarketplaceService.ProcessReceipt = GamePassConfig.processDevProductReceipt

-- Load passes for existing players
for _, player in ipairs(Players:GetPlayers()) do
    task.spawn(function()
        GamePassConfig.loadPlayerPasses(player)
    end)
end

Players.PlayerAdded:Connect(function(player)
    task.spawn(function()
        GamePassConfig.loadPlayerPasses(player)
    end)
end)

print("══════════════════════════════════════════════════")
print("🎮 GamePassConfig v1.0 — 5 Tiered Passes + Dev Products")
print("Impulse → Standard → Premium → Whale")
print("Gospel 444 Compliant | NO BLUE")
print("Pipeline: Stage 5 of 20")
print("══════════════════════════════════════════════════")

return GamePassConfig
