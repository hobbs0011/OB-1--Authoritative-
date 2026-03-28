--[[
    BattlePass.lua — Survivor Pass System
    Skibidi Zombie: Survive the Brainrots
    
    DESIGN LAW:
    - 299 R$, 30-day season, free + premium tracks
    - COSMETIC ONLY — no pay-to-win
    - 50 tiers per season
    - XP-based progression (play more = progress more)
    - ZERO ESL. Combat XP only.
    - Auto-claim: offline players get rewards on next login
    
    Version: 1.1 — ESL PURGE
    Date: 2026-03-28
]]

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local MarketplaceService = game:GetService("MarketplaceService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local BattlePassStore = DataStoreService:GetDataStore("BattlePass_v1")

local BattlePass = {}
BattlePass.__index = BattlePass

-- ============================================================
-- SEASON CONFIGURATION
-- ============================================================

local CURRENT_SEASON = {
    id = "S1_BRAINROT_ORIGINS",
    name = "Season 1: Brainrot Origins",
    startDate = os.time({year=2026, month=4, day=1, hour=0}),
    endDate = os.time({year=2026, month=4, day=30, hour=23, min=59}),
    maxTier = 50,
    premiumGamePassId = "BATTLEPASS_GAMEPASS_ID",
    premiumPrice = 299,
    xpPerTier = 1000,
    rewards = {},
}

-- Generate tier rewards
for tier = 1, CURRENT_SEASON.maxTier do
    local freeReward = nil
    local premiumReward = nil
    
    if tier % 10 == 0 then
        freeReward = { type = "crate", crateId = "BasicCrate", count = 1 }
    elseif tier % 5 == 0 then
        freeReward = { type = "currency", currency = "BrainrotGems", amount = 5 * math.ceil(tier / 10) }
    else
        freeReward = { type = "currency", currency = "SurvivalCoins", amount = 100 * math.ceil(tier / 10) }
    end
    
    if tier == 50 then
        premiumReward = { type = "exclusive", itemId = "bp_s1_legendary_aura", name = "Brainrot Origins Legendary Aura" }
    elseif tier == 40 then
        premiumReward = { type = "exclusive", itemId = "bp_s1_epic_pet", name = "Sigma Phoenix Pet" }
    elseif tier == 30 then
        premiumReward = { type = "exclusive", itemId = "bp_s1_epic_skin", name = "Brainrot Commander Skin" }
    elseif tier == 20 then
        premiumReward = { type = "exclusive", itemId = "bp_s1_rare_aura", name = "Origins Flame Aura" }
    elseif tier == 10 then
        premiumReward = { type = "exclusive", itemId = "bp_s1_rare_skin", name = "Recruit Outfit" }
    elseif tier % 5 == 0 then
        premiumReward = { type = "crate", crateId = "PremiumCrate", count = 1 }
    elseif tier % 3 == 0 then
        premiumReward = { type = "currency", currency = "BrainrotGems", amount = 10 * math.ceil(tier / 10) }
    else
        premiumReward = { type = "currency", currency = "SurvivalCoins", amount = 200 * math.ceil(tier / 10) }
    end
    
    CURRENT_SEASON.rewards[tier] = {
        free = freeReward,
        premium = premiumReward,
    }
end

-- ============================================================
-- XP SOURCES — COMBAT ONLY, ZERO ESL
-- ============================================================

local XP_SOURCES = {
    kill = 10,
    elite_kill = 25,
    survive_minute = 20,
    daily_challenge_complete = 200,
    combo_kill_5 = 50,
    combo_kill_10 = 100,
    combo_kill_20 = 200,
    headshot_kill = 20,
    parry_success = 30,
    dodge_master = 15,
    trade_complete = 50,
    boss_kill = 100,
    boss_parry = 75,
    login = 50,
    gacha_pull = 15,
    referral_qualified = 500,
    wave_clear = 25,
    day_complete = 75,
    no_hit_wave = 50,
}

-- ============================================================
-- PLAYER STATE
-- ============================================================

local playerBPData = {}

local function loadPlayerData(userId)
    if playerBPData[userId] then
        if playerBPData[userId].seasonId == CURRENT_SEASON.id then
            return playerBPData[userId]
        end
    end
    
    local success, data = pcall(function()
        return BattlePassStore:GetAsync("bp_" .. tostring(userId))
    end)
    
    if success and data and data.seasonId == CURRENT_SEASON.id then
        playerBPData[userId] = data
    else
        playerBPData[userId] = {
            seasonId = CURRENT_SEASON.id,
            tier = 0,
            xp = 0,
            isPremium = false,
            claimedFree = {},
            claimedPremium = {},
            totalXPEarned = 0,
        }
    end
    
    return playerBPData[userId]
end

local function savePlayerData(userId)
    local data = playerBPData[userId]
    if not data then return end
    
    pcall(function()
        BattlePassStore:SetAsync("bp_" .. tostring(userId), data)
    end)
end

-- ============================================================
-- XP + TIER PROGRESSION
-- ============================================================

function BattlePass.AddXP(player, source, multiplier)
    local userId = player.UserId
    local data = loadPlayerData(userId)
    
    local now = os.time()
    if now < CURRENT_SEASON.startDate or now > CURRENT_SEASON.endDate then
        return { success = false, error = "SEASON_INACTIVE" }
    end
    
    local baseXP = XP_SOURCES[source] or 0
    if baseXP == 0 then
        return { success = false, error = "INVALID_SOURCE" }
    end
    
    local totalXP = math.floor(baseXP * (multiplier or 1))
    data.xp = data.xp + totalXP
    data.totalXPEarned = (data.totalXPEarned or 0) + totalXP
    
    local tieredUp = false
    local oldTier = data.tier
    while data.xp >= CURRENT_SEASON.xpPerTier and data.tier < CURRENT_SEASON.maxTier do
        data.xp = data.xp - CURRENT_SEASON.xpPerTier
        data.tier = data.tier + 1
        tieredUp = true
    end
    
    if data.tier >= CURRENT_SEASON.maxTier then
        data.tier = CURRENT_SEASON.maxTier
        data.xp = 0
    end
    
    task.spawn(function()
        savePlayerData(userId)
    end)
    
    return {
        success = true,
        xpGained = totalXP,
        currentXP = data.xp,
        currentTier = data.tier,
        xpToNextTier = CURRENT_SEASON.xpPerTier - data.xp,
        tieredUp = tieredUp,
        tiersGained = data.tier - oldTier,
    }
end

-- ============================================================
-- PREMIUM UPGRADE
-- ============================================================

function BattlePass.UpgradeToPremium(player)
    local userId = player.UserId
    local data = loadPlayerData(userId)
    
    if data.isPremium then
        return { success = false, error = "ALREADY_PREMIUM" }
    end
    
    local owns = false
    pcall(function()
        owns = MarketplaceService:UserOwnsGamePassAsync(userId, tonumber(CURRENT_SEASON.premiumGamePassId) or 0)
    end)
    
    if owns then
        data.isPremium = true
        task.spawn(function()
            savePlayerData(userId)
        end)
        return { success = true }
    end
    
    return { success = false, error = "GAMEPASS_NOT_OWNED" }
end

-- ============================================================
-- CLAIM REWARDS
-- ============================================================

function BattlePass.ClaimReward(player, tier, track)
    local userId = player.UserId
    local data = loadPlayerData(userId)
    
    if tier < 1 or tier > CURRENT_SEASON.maxTier then
        return { success = false, error = "INVALID_TIER" }
    end
    
    if data.tier < tier then
        return { success = false, error = "TIER_NOT_REACHED" }
    end
    
    local reward = CURRENT_SEASON.rewards[tier]
    if not reward then
        return { success = false, error = "NO_REWARD" }
    end
    
    if track == "free" then
        if data.claimedFree[tostring(tier)] then
            return { success = false, error = "ALREADY_CLAIMED" }
        end
        data.claimedFree[tostring(tier)] = true
        BattlePass._GrantReward(player, reward.free)
    elseif track == "premium" then
        if not data.isPremium then
            return { success = false, error = "NOT_PREMIUM" }
        end
        if data.claimedPremium[tostring(tier)] then
            return { success = false, error = "ALREADY_CLAIMED" }
        end
        data.claimedPremium[tostring(tier)] = true
        BattlePass._GrantReward(player, reward.premium)
    else
        return { success = false, error = "INVALID_TRACK" }
    end
    
    task.spawn(function()
        savePlayerData(userId)
    end)
    
    return { success = true, tier = tier, track = track }
end

function BattlePass._GrantReward(player, reward)
    if not reward then return end
    
    if reward.type == "currency" then
        local EconomyManager = require(script.Parent:FindFirstChild("EconomyManager"))
        if EconomyManager then
            if reward.currency == "SurvivalCoins" then
                EconomyManager.AddCoins(player, reward.amount, "battle_pass")
            elseif reward.currency == "BrainrotGems" then
                EconomyManager.AddGems(player, reward.amount, "battle_pass")
            end
        end
    elseif reward.type == "crate" then
        local GachaManager = require(script.Parent:FindFirstChild("GachaManager"))
        if GachaManager then
            for i = 1, (reward.count or 1) do
                GachaManager.Pull(player, reward.crateId)
            end
        end
    elseif reward.type == "exclusive" then
        print(string.format("[BattlePass] Granted exclusive: %s to Player %d", reward.itemId, player.UserId))
    end
end

-- ============================================================
-- AUTO-CLAIM
-- ============================================================

function BattlePass.AutoClaimAll(player)
    local userId = player.UserId
    local data = loadPlayerData(userId)
    local claimed = { free = {}, premium = {} }
    
    for tier = 1, data.tier do
        if not data.claimedFree[tostring(tier)] then
            data.claimedFree[tostring(tier)] = true
            local reward = CURRENT_SEASON.rewards[tier]
            if reward then
                BattlePass._GrantReward(player, reward.free)
                table.insert(claimed.free, tier)
            end
        end
        if data.isPremium and not data.claimedPremium[tostring(tier)] then
            data.claimedPremium[tostring(tier)] = true
            local reward = CURRENT_SEASON.rewards[tier]
            if reward then
                BattlePass._GrantReward(player, reward.premium)
                table.insert(claimed.premium, tier)
            end
        end
    end
    
    if #claimed.free > 0 or #claimed.premium > 0 then
        task.spawn(function()
            savePlayerData(userId)
        end)
    end
    
    return { success = true, claimed = claimed }
end

-- ============================================================
-- CLIENT API
-- ============================================================

function BattlePass.GetStatus(player)
    local data = loadPlayerData(player.UserId)
    local now = os.time()
    
    return {
        seasonId = CURRENT_SEASON.id,
        seasonName = CURRENT_SEASON.name,
        isActive = (now >= CURRENT_SEASON.startDate and now <= CURRENT_SEASON.endDate),
        daysRemaining = math.max(0, math.ceil((CURRENT_SEASON.endDate - now) / 86400)),
        tier = data.tier,
        xp = data.xp,
        xpPerTier = CURRENT_SEASON.xpPerTier,
        maxTier = CURRENT_SEASON.maxTier,
        isPremium = data.isPremium,
        totalXPEarned = data.totalXPEarned or 0,
    }
end

function BattlePass.GetRewards()
    local rewards = {}
    for tier = 1, CURRENT_SEASON.maxTier do
        rewards[tier] = CURRENT_SEASON.rewards[tier]
    end
    return rewards
end

-- ============================================================
-- CLEANUP
-- ============================================================

Players.PlayerRemoving:Connect(function(player)
    local userId = player.UserId
    if playerBPData[userId] then
        savePlayerData(userId)
        playerBPData[userId] = nil
    end
end)

-- ============================================================
-- REMOTE SETUP
-- ============================================================

local BPRemote = Instance.new("RemoteFunction")
BPRemote.Name = "BattlePassRemote"
BPRemote.Parent = ReplicatedStorage

BPRemote.OnServerInvoke = function(player, action, ...)
    if action == "GetStatus" then
        return BattlePass.GetStatus(player)
    elseif action == "GetRewards" then
        return BattlePass.GetRewards()
    elseif action == "ClaimReward" then
        return BattlePass.ClaimReward(player, ...)
    elseif action == "AutoClaimAll" then
        return BattlePass.AutoClaimAll(player)
    elseif action == "AddXP" then
        return { success = false, error = "SERVER_ONLY" }
    end
    return { success = false, error = "INVALID_ACTION" }
end

return BattlePass
