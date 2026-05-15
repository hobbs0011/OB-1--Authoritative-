--[[
    RewardBridge.lua — Connect Combat Rewards to Economy
    Skibidi Zombie: Survive the Brainrots
    
    GOAL: MAKE MONEY. This module is the dopamine pipeline.
    Every kill, combo, and wave clear feeds coins into the player's hands.
    Coins in hands → shop visits → purchases → revenue.
    
    Connects: CombatSystem → EconomyManager → DataStoreV2
    Handles: kill rewards, combo multipliers, wave bonuses, boss drops,
             daily bonus multipliers, battle pass XP, first-kill bonuses.
    
    Architecture: ModuleScript (ServerStorage)
    Version: 1.1.0 — ESL PURGE (combat rewards only)
    Date: 2026-03-28
--]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerStorage = game:GetService("ServerStorage")

local RewardBridge = {}

local EconomyManager = nil
local DataStoreV2 = nil
local CombatSystem = nil

local CONFIG = {
    -- Kill rewards
    BASE_KILL_COINS = 10,
    BOSS_KILL_MULTIPLIER = 5,
    FIRST_KILL_BONUS = 25,
    -- Combo rewards
    COMBO_COIN_BONUS_PER_STREAK = 2,
    MAX_COMBO_COIN_BONUS = 30,
    -- Wave rewards
    WAVE_CLEAR_BASE = 50,
    WAVE_CLEAR_PER_WAVE = 10,
    BOSS_WAVE_BONUS = 100,
    -- Battle Pass XP
    XP_PER_KILL = 5,
    XP_PER_COMBO_KILL = 8,
    XP_PER_WAVE_CLEAR = 20,
    XP_PER_BOSS_KILL = 50,
    XP_PER_HEADSHOT = 10,
    XP_PER_PARRY = 7,
    -- Multipliers
    DAILY_FIRST_GAME_MULTIPLIER = 1.5,
    STREAK_BONUS_PER_DAY = 0.1,
    MAX_STREAK_MULTIPLIER = 2.0,
    PREMIUM_MULTIPLIER = 2.0,  -- Game pass holder
    -- Gem drops (rare)
    GEM_DROP_CHANCE = 0.02,
    GEM_DROP_AMOUNT = 1,
    BOSS_GEM_DROP_CHANCE = 0.15,
    BOSS_GEM_DROP_AMOUNT = 3,
}

local playerRewardState = {} -- [Player] = { firstKillDone, totalCoinsThisSession, totalXPThisSession }

function RewardBridge.Init()
    local ok1, em = pcall(require, ServerStorage:FindFirstChild("EconomyManager"))
    if ok1 then EconomyManager = em end
    local ok2, ds = pcall(require, ServerStorage:FindFirstChild("DataStoreV2"))
    if ok2 then DataStoreV2 = ds end
    local ok3, cs = pcall(require, ServerStorage:FindFirstChild("CombatSystem"))
    if ok3 then CombatSystem = cs end
    print("[RewardBridge] Initialized — dopamine pipeline active")
    return true
end

function RewardBridge.RegisterPlayer(player)
    playerRewardState[player] = {
        firstKillDone = false,
        totalCoinsThisSession = 0,
        totalXPThisSession = 0,
        gamesPlayedToday = 0,
    }
end

function RewardBridge.UnregisterPlayer(player)
    playerRewardState[player] = nil
end

function RewardBridge.OnEnemyKilled(player, enemyData, comboStreak)
    local state = playerRewardState[player]
    if not state then return 0, 0 end
    
    comboStreak = comboStreak or 0
    local coins = 0
    local xp = 0
    local gems = 0
    local breakdown = {}
    
    -- Base kill reward
    local baseCoins = enemyData.coinReward or CONFIG.BASE_KILL_COINS
    coins = coins + baseCoins
    table.insert(breakdown, {type = "kill", amount = baseCoins})
    
    -- Boss multiplier
    if enemyData.isBoss then
        local bossBonus = baseCoins * (CONFIG.BOSS_KILL_MULTIPLIER - 1)
        coins = coins + bossBonus
        table.insert(breakdown, {type = "boss_bonus", amount = bossBonus})
        xp = xp + CONFIG.XP_PER_BOSS_KILL
        -- Boss gem drop
        if math.random() < CONFIG.BOSS_GEM_DROP_CHANCE then
            gems = gems + CONFIG.BOSS_GEM_DROP_AMOUNT
            table.insert(breakdown, {type = "boss_gem_drop", amount = CONFIG.BOSS_GEM_DROP_AMOUNT})
        end
    else
        xp = xp + CONFIG.XP_PER_KILL
        -- Regular gem drop
        if math.random() < CONFIG.GEM_DROP_CHANCE then
            gems = gems + CONFIG.GEM_DROP_AMOUNT
            table.insert(breakdown, {type = "gem_drop", amount = CONFIG.GEM_DROP_AMOUNT})
        end
    end
    
    -- First kill bonus
    if not state.firstKillDone then
        state.firstKillDone = true
        coins = coins + CONFIG.FIRST_KILL_BONUS
        table.insert(breakdown, {type = "first_kill", amount = CONFIG.FIRST_KILL_BONUS})
    end
    
    -- Combo bonus
    if comboStreak > 1 then
        local comboBonus = math.min(CONFIG.MAX_COMBO_COIN_BONUS, comboStreak * CONFIG.COMBO_COIN_BONUS_PER_STREAK)
        coins = coins + comboBonus
        xp = xp + CONFIG.XP_PER_COMBO_KILL
        table.insert(breakdown, {type = "combo", amount = comboBonus, streak = comboStreak})
    end
    
    -- Apply multipliers
    local multiplier = RewardBridge._getMultiplier(player)
    coins = math.floor(coins * multiplier)
    
    -- Deliver rewards
    RewardBridge._grantCoins(player, coins)
    if gems > 0 then
        RewardBridge._grantGems(player, gems)
    end
    RewardBridge._grantXP(player, xp)
    
    -- Update state
    state.totalCoinsThisSession = state.totalCoinsThisSession + coins
    state.totalXPThisSession = state.totalXPThisSession + xp
    
    -- Fire client notification
    RewardBridge._notifyClient(player, {
        type = "kill_reward",
        coins = coins,
        gems = gems,
        xp = xp,
        breakdown = breakdown,
        multiplier = multiplier,
    })
    
    return coins, xp
end

function RewardBridge.OnComboKill(player, comboStreak)
    local xp = CONFIG.XP_PER_COMBO_KILL
    RewardBridge._grantXP(player, xp)
    return xp
end

function RewardBridge.OnHeadshot(player)
    local xp = CONFIG.XP_PER_HEADSHOT
    RewardBridge._grantXP(player, xp)
    return xp
end

function RewardBridge.OnParry(player)
    local xp = CONFIG.XP_PER_PARRY
    RewardBridge._grantXP(player, xp)
    return xp
end

function RewardBridge.OnWaveCleared(player, waveNumber, isBoss)
    local coins = CONFIG.WAVE_CLEAR_BASE + (waveNumber - 1) * CONFIG.WAVE_CLEAR_PER_WAVE
    local xp = CONFIG.XP_PER_WAVE_CLEAR
    
    if isBoss then
        coins = coins + CONFIG.BOSS_WAVE_BONUS
        xp = xp * 2
    end
    
    local multiplier = RewardBridge._getMultiplier(player)
    coins = math.floor(coins * multiplier)
    
    RewardBridge._grantCoins(player, coins)
    RewardBridge._grantXP(player, xp)
    
    RewardBridge._notifyClient(player, {
        type = "wave_reward",
        coins = coins,
        xp = xp,
        wave = waveNumber,
        isBoss = isBoss,
    })
    
    return coins, xp
end

function RewardBridge._getMultiplier(player)
    local mult = 1.0
    if DataStoreV2 then
        local data = DataStoreV2.GetPlayerData(player)
        if data then
            -- Daily first game
            local today = os.date("%j", os.time())
            if tostring(data.lastLoginDay) ~= today then
                mult = mult * CONFIG.DAILY_FIRST_GAME_MULTIPLIER
            end
            -- Login streak
            local streakBonus = math.min(CONFIG.MAX_STREAK_MULTIPLIER - 1, (data.loginStreak or 0) * CONFIG.STREAK_BONUS_PER_DAY)
            mult = mult + streakBonus
            -- Premium pass
            if data.battlePassPurchased then
                mult = mult * CONFIG.PREMIUM_MULTIPLIER
            end
        end
    end
    return mult
end

function RewardBridge._grantCoins(player, amount)
    if EconomyManager then
        if type(EconomyManager.AddCoins) == "function" then
            EconomyManager.AddCoins(player, amount, "combat_reward")
        elseif type(EconomyManager.AddCurrency) == "function" then
            EconomyManager.AddCurrency(player, "SurvivalCoins", amount)
        end
    elseif DataStoreV2 then
        DataStoreV2.IncrementField(player, "survivalCoins", amount)
        DataStoreV2.IncrementField(player, "lifetimeCoins", amount)
    end
end

function RewardBridge._grantGems(player, amount)
    if EconomyManager then
        if type(EconomyManager.AddGems) == "function" then
            EconomyManager.AddGems(player, amount, "combat_reward")
        elseif type(EconomyManager.AddCurrency) == "function" then
            EconomyManager.AddCurrency(player, "PremiumGems", amount)
        end
    elseif DataStoreV2 then
        DataStoreV2.IncrementField(player, "premiumGems", amount)
        DataStoreV2.IncrementField(player, "lifetimeGems", amount)
    end
end

function RewardBridge._grantXP(player, amount)
    if EconomyManager then
        if type(EconomyManager.AddXP) == "function" then
            EconomyManager.AddXP(player, amount, "combat_reward")
            return
        end
    end
    if DataStoreV2 then
        DataStoreV2.IncrementField(player, "battlePassXP", amount)
    end
end

function RewardBridge._notifyClient(player, rewardData)
    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if remotes then
        local ev = remotes:FindFirstChild("RewardNotification")
        if not ev then
            ev = Instance.new("RemoteEvent")
            ev.Name = "RewardNotification"
            ev.Parent = remotes
        end
        ev:FireClient(player, rewardData)
    end
end

function RewardBridge.GetSessionStats(player)
    local state = playerRewardState[player]
    if not state then return nil end
    return {
        totalCoins = state.totalCoinsThisSession,
        totalXP = state.totalXPThisSession,
    }
end

return RewardBridge
