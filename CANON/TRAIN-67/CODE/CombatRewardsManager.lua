--[[
    CombatRewardsManager.lua — REPLACES EnglishRewardsManager
    Pure combat-based reward distribution. No ESL. No questions. Kill = reward.
    Train-67: Survive a Brainrot
    Server-authoritative module
    
    ZERO ESL REFERENCES.
]]

local RunService = game:GetService("RunService")

local CombatRewardsManager = {}
CombatRewardsManager.__index = CombatRewardsManager

------------------------------------------------------
-- DEPENDENCIES (injected via constructor)
------------------------------------------------------
-- EconomyManager: handles currency transactions
-- WeaponData: weapon stats, mutation rolling
-- EnemyData: enemy reward values, combo multipliers
-- AnalyticsService: tracks reward events

------------------------------------------------------
-- REWARD TABLES
------------------------------------------------------

-- Base kill rewards (before multipliers)
CombatRewardsManager.KillRewards = {
    -- Standard enemies
    SkibidiZombie  = { coins = 10, gems = 0, xp = 10,  gemChance = 0.00 },
    OhioAnomaly    = { coins = 15, gems = 0, xp = 15,  gemChance = 0.00 },
    RizzMerchant   = { coins = 25, gems = 0, xp = 20,  gemChance = 0.05 },
    BrainrotMutant = { coins = 30, gems = 0, xp = 25,  gemChance = 0.08 },
    BrainrotMini   = { coins = 10, gems = 0, xp = 10,  gemChance = 0.00 },
    
    -- Elite modifier bonus (added on top)
    EliteBonus     = { coins = 40, gems = 1, xp = 30,  gemChance = 1.00 },
    
    -- Boss rewards (flat, not per-type — bosses scale by day)
    Boss           = { coins = 200, gems = 5, xp = 100, gemChance = 1.00 },
}

-- Combo kill multipliers (consecutive kills without taking damage)
CombatRewardsManager.ComboMultipliers = {
    { threshold = 5,   mult = 1.5 },
    { threshold = 10,  mult = 2.0 },
    { threshold = 20,  mult = 3.0 },
    { threshold = 50,  mult = 5.0 },
    { threshold = 100, mult = 10.0 },
}

-- Boss gacha spin rewards (post-kill spin)
CombatRewardsManager.BossGachaSpin = {
    -- Weights must sum to 100
    { name = "Coins x2",       weight = 30, type = "COIN_MULT",   value = 2 },
    { name = "Coins x5",       weight = 10, type = "COIN_MULT",   value = 5 },
    { name = "Rare Crate",     weight = 20, type = "CRATE",       rarity = "Rare" },
    { name = "Epic Crate",     weight = 10, type = "CRATE",       rarity = "Epic" },
    { name = "Legendary Crate",weight = 3,  type = "CRATE",       rarity = "Legendary" },
    { name = "10 Gems",        weight = 15, type = "GEMS",        value = 10 },
    { name = "25 Gems",        weight = 7,  type = "GEMS",        value = 25 },
    { name = "XP Boost 30min", weight = 5,  type = "BUFF",        buffId = "xp_boost_30" },
}

-- Day survival bonus (awarded at end of each day)
CombatRewardsManager.DaySurvivalBonus = {
    baseCoins = 50,
    baseXP = 25,
    perDayMultiplier = 0.02, -- +2% per day number
}

-- Wave completion bonus
CombatRewardsManager.WaveCompletionBonus = {
    baseCoins = 20,
    baseXP = 15,
    noHitBonus = 1.5, -- 50% extra if wave completed without taking damage
}

-- Milestone rewards
CombatRewardsManager.MilestoneRewards = {
    { day = 10,  coins = 500,  gems = 10, item = nil,          title = nil },
    { day = 25,  coins = 1000, gems = 25, item = nil,          title = nil },
    { day = 50,  coins = 2500, gems = 50, item = "rare_crate", title = "Halfway Hero" },
    { day = 75,  coins = 5000, gems = 75, item = "epic_crate", title = "Hell Survivor" },
    { day = 99,  coins = 10000,gems = 100,item = "legendary_crate", title = "The Sigma" },
}

------------------------------------------------------
-- CONSTRUCTOR
------------------------------------------------------

function CombatRewardsManager.new(deps)
    local self = setmetatable({}, CombatRewardsManager)
    
    self._economy = deps.EconomyManager
    self._weaponData = deps.WeaponData
    self._enemyData = deps.EnemyData
    self._analytics = deps.AnalyticsService
    self._dayScaling = deps.DayScaling
    
    -- Per-player state (keyed by Player.UserId)
    self._playerState = {}
    
    return self
end

------------------------------------------------------
-- PLAYER STATE MANAGEMENT
------------------------------------------------------

function CombatRewardsManager:InitPlayer(player)
    self._playerState[player.UserId] = {
        comboCount = 0,
        totalKills = 0,
        totalCoinsEarned = 0,
        totalGemsEarned = 0,
        totalXPEarned = 0,
        waveKills = 0,
        waveDamageTaken = false,
        highestCombo = 0,
        bossesKilled = 0,
        elitesKilled = 0,
    }
end

function CombatRewardsManager:CleanupPlayer(player)
    self._playerState[player.UserId] = nil
end

function CombatRewardsManager:GetPlayerState(player)
    return self._playerState[player.UserId]
end

------------------------------------------------------
-- COMBO SYSTEM
------------------------------------------------------

function CombatRewardsManager:GetComboMultiplier(comboCount)
    local mult = 1.0
    for _, entry in ipairs(self.ComboMultipliers) do
        if comboCount >= entry.threshold then
            mult = entry.mult
        end
    end
    return mult
end

function CombatRewardsManager:IncrementCombo(player)
    local state = self._playerState[player.UserId]
    if not state then return 1 end
    
    state.comboCount = state.comboCount + 1
    if state.comboCount > state.highestCombo then
        state.highestCombo = state.comboCount
    end
    
    return state.comboCount
end

function CombatRewardsManager:BreakCombo(player)
    local state = self._playerState[player.UserId]
    if not state then return end
    
    local brokeAt = state.comboCount
    state.comboCount = 0
    state.waveDamageTaken = true
    
    return brokeAt
end

------------------------------------------------------
-- KILL REWARD PROCESSING
------------------------------------------------------

function CombatRewardsManager:ProcessKill(player, enemyType, isElite, isBoss, dayNumber, prestigeLevel)
    local state = self._playerState[player.UserId]
    if not state then return nil end
    
    -- Get base rewards
    local baseReward
    if isBoss then
        baseReward = self.KillRewards.Boss
    else
        baseReward = self.KillRewards[enemyType]
        if not baseReward then
            baseReward = self.KillRewards.SkibidiZombie -- fallback
        end
    end
    
    -- Increment combo
    local comboCount = self:IncrementCombo(player)
    local comboMult = self:GetComboMultiplier(comboCount)
    
    -- Day scaling multiplier
    local dayMult = 1.0 + (dayNumber - 1) * 0.015
    
    -- Prestige bonus
    local prestigeMult = 1.0 + (prestigeLevel or 0) * 0.05
    
    -- Calculate final rewards
    local finalCoins = math.floor(baseReward.coins * comboMult * dayMult * prestigeMult)
    local finalXP = math.floor(baseReward.xp * dayMult * prestigeMult)
    local finalGems = baseReward.gems
    
    -- Elite bonus
    if isElite and not isBoss then
        local eliteBonus = self.KillRewards.EliteBonus
        finalCoins = finalCoins + eliteBonus.coins
        finalGems = finalGems + eliteBonus.gems
        finalXP = finalXP + eliteBonus.xp
        state.elitesKilled = state.elitesKilled + 1
    end
    
    -- Gem chance roll
    if finalGems == 0 and baseReward.gemChance > 0 then
        if math.random() < baseReward.gemChance then
            finalGems = 1
        end
    end
    
    -- Apply to player economy
    if self._economy then
        self._economy:AddCoins(player, finalCoins, "combat_kill")
        if finalGems > 0 then
            self._economy:AddGems(player, finalGems, "combat_kill")
        end
        self._economy:AddXP(player, finalXP, "combat_kill")
    end
    
    -- Update state
    state.totalKills = state.totalKills + 1
    state.totalCoinsEarned = state.totalCoinsEarned + finalCoins
    state.totalGemsEarned = state.totalGemsEarned + finalGems
    state.totalXPEarned = state.totalXPEarned + finalXP
    state.waveKills = state.waveKills + 1
    
    if isBoss then
        state.bossesKilled = state.bossesKilled + 1
    end
    
    -- Analytics
    if self._analytics then
        self._analytics:TrackKill(player, {
            enemyType = enemyType,
            isElite = isElite,
            isBoss = isBoss,
            dayNumber = dayNumber,
            comboCount = comboCount,
            coinsEarned = finalCoins,
            gemsEarned = finalGems,
            xpEarned = finalXP,
        })
    end
    
    -- Build reward packet (sent to client for UI display)
    local rewardPacket = {
        coins = finalCoins,
        gems = finalGems,
        xp = finalXP,
        comboCount = comboCount,
        comboMult = comboMult,
        isElite = isElite,
        isBoss = isBoss,
        enemyType = enemyType,
    }
    
    return rewardPacket
end

------------------------------------------------------
-- BOSS GACHA SPIN
------------------------------------------------------

function CombatRewardsManager:RollBossGacha(player, dayNumber)
    local totalWeight = 0
    for _, entry in ipairs(self.BossGachaSpin) do
        totalWeight = totalWeight + entry.weight
    end
    
    local roll = math.random() * totalWeight
    local cumulative = 0
    
    for _, entry in ipairs(self.BossGachaSpin) do
        cumulative = cumulative + entry.weight
        if roll <= cumulative then
            -- Apply the reward
            self:_applyGachaReward(player, entry, dayNumber)
            return entry
        end
    end
    
    -- Fallback
    return self.BossGachaSpin[1]
end

function CombatRewardsManager:_applyGachaReward(player, entry, dayNumber)
    if not self._economy then return end
    
    if entry.type == "COIN_MULT" then
        local baseCoins = self.KillRewards.Boss.coins
        local bonusCoins = math.floor(baseCoins * entry.value)
        self._economy:AddCoins(player, bonusCoins, "boss_gacha")
        
    elseif entry.type == "GEMS" then
        self._economy:AddGems(player, entry.value, "boss_gacha")
        
    elseif entry.type == "CRATE" then
        self._economy:GrantCrate(player, entry.rarity, "boss_gacha")
        
    elseif entry.type == "BUFF" then
        self._economy:ApplyBuff(player, entry.buffId, "boss_gacha")
    end
end

------------------------------------------------------
-- WAVE / DAY COMPLETION REWARDS
------------------------------------------------------

function CombatRewardsManager:ProcessWaveComplete(player, dayNumber, waveIndex, prestigeLevel)
    local state = self._playerState[player.UserId]
    if not state then return nil end
    
    local bonus = self.WaveCompletionBonus
    local dayMult = 1.0 + (dayNumber - 1) * 0.02
    local prestigeMult = 1.0 + (prestigeLevel or 0) * 0.05
    
    local coins = math.floor(bonus.baseCoins * dayMult * prestigeMult)
    local xp = math.floor(bonus.baseXP * dayMult * prestigeMult)
    
    -- No-hit bonus
    if not state.waveDamageTaken then
        coins = math.floor(coins * bonus.noHitBonus)
        xp = math.floor(xp * bonus.noHitBonus)
    end
    
    if self._economy then
        self._economy:AddCoins(player, coins, "wave_complete")
        self._economy:AddXP(player, xp, "wave_complete")
    end
    
    -- Reset wave state
    local waveKills = state.waveKills
    local noHit = not state.waveDamageTaken
    state.waveKills = 0
    state.waveDamageTaken = false
    
    return {
        coins = coins,
        xp = xp,
        noHitBonus = noHit,
        waveKills = waveKills,
    }
end

function CombatRewardsManager:ProcessDayComplete(player, dayNumber, prestigeLevel)
    local state = self._playerState[player.UserId]
    if not state then return nil end
    
    local bonus = self.DaySurvivalBonus
    local dayMult = 1.0 + dayNumber * bonus.perDayMultiplier
    local prestigeMult = 1.0 + (prestigeLevel or 0) * 0.05
    
    local coins = math.floor(bonus.baseCoins * dayMult * prestigeMult)
    local xp = math.floor(bonus.baseXP * dayMult * prestigeMult)
    
    if self._economy then
        self._economy:AddCoins(player, coins, "day_complete")
        self._economy:AddXP(player, xp, "day_complete")
    end
    
    -- Check milestones
    local milestoneReward = nil
    for _, milestone in ipairs(self.MilestoneRewards) do
        if milestone.day == dayNumber then
            milestoneReward = milestone
            if self._economy then
                self._economy:AddCoins(player, milestone.coins, "milestone")
                self._economy:AddGems(player, milestone.gems, "milestone")
                if milestone.item then
                    self._economy:GrantCrate(player, milestone.item, "milestone")
                end
                if milestone.title then
                    self._economy:GrantTitle(player, milestone.title, "milestone")
                end
            end
            break
        end
    end
    
    return {
        coins = coins,
        xp = xp,
        dayNumber = dayNumber,
        milestone = milestoneReward,
    }
end

------------------------------------------------------
-- GAME PASS / VIP MULTIPLIERS
------------------------------------------------------

CombatRewardsManager.GamePassMultipliers = {
    VIP           = { coinMult = 2.0, xpMult = 2.0,  gemMult = 1.0 },
    MutationBoost = { coinMult = 1.0, xpMult = 1.0,  gemMult = 1.0, mutationChanceMult = 1.5 },
    AutoFarm      = { coinMult = 0.5, xpMult = 0.5,  gemMult = 0.0 }, -- reduced rates for AFK
}

function CombatRewardsManager:GetGamePassMultiplier(player, passId)
    local mult = self.GamePassMultipliers[passId]
    if not mult then return { coinMult = 1.0, xpMult = 1.0, gemMult = 1.0 } end
    return mult
end

------------------------------------------------------
-- DEATH PENALTY
------------------------------------------------------

CombatRewardsManager.DeathPenalty = {
    coinLossPercent = 0.10, -- lose 10% of coins on hand
    maxCoinLoss = 500,      -- cap at 500 coins lost
    comboReset = true,      -- combo always resets on death
    xpLoss = 0,             -- no XP loss (too punishing)
}

function CombatRewardsManager:ProcessDeath(player)
    local state = self._playerState[player.UserId]
    if not state then return nil end
    
    -- Break combo
    local brokeCombo = self:BreakCombo(player)
    
    -- Coin penalty
    local penalty = self.DeathPenalty
    local coinLoss = 0
    if self._economy and penalty.coinLossPercent > 0 then
        local currentCoins = self._economy:GetCoins(player) or 0
        coinLoss = math.min(
            math.floor(currentCoins * penalty.coinLossPercent),
            penalty.maxCoinLoss
        )
        if coinLoss > 0 then
            self._economy:RemoveCoins(player, coinLoss, "death_penalty")
        end
    end
    
    return {
        coinLoss = coinLoss,
        comboBroken = brokeCombo,
    }
end

------------------------------------------------------
-- LOOT DROP PROCESSING
------------------------------------------------------

function CombatRewardsManager:RollLootDrop(enemyType, dayNumber, isElite, isBoss, luckBonus)
    -- Base drop chance
    local dropChance = 0.15 -- 15% base
    if isElite then dropChance = 0.40 end
    if isBoss then dropChance = 1.00 end -- bosses always drop
    
    -- Luck bonus (from game pass, prestige, etc)
    dropChance = dropChance * (1.0 + (luckBonus or 0))
    
    if math.random() > dropChance then
        return nil -- no drop
    end
    
    -- Roll rarity based on day scaling
    local dayBoost = dayNumber * 0.005
    local rarityRoll = math.random()
    
    local rarity
    if isBoss then
        -- Boss guaranteed Rare+
        if rarityRoll < 0.005 + dayBoost then
            rarity = "RIZZLORD"
        elseif rarityRoll < 0.03 + dayBoost then
            rarity = "Legendary"
        elseif rarityRoll < 0.15 + dayBoost then
            rarity = "Epic"
        else
            rarity = "Rare"
        end
    elseif isElite then
        -- Elite guaranteed Uncommon+
        if rarityRoll < 0.01 then
            rarity = "Legendary"
        elseif rarityRoll < 0.08 then
            rarity = "Epic"
        elseif rarityRoll < 0.30 then
            rarity = "Rare"
        else
            rarity = "Uncommon"
        end
    else
        -- Standard drop
        if rarityRoll < 0.005 then
            rarity = "Epic"
        elseif rarityRoll < 0.05 then
            rarity = "Rare"
        elseif rarityRoll < 0.25 then
            rarity = "Uncommon"
        else
            rarity = "Common"
        end
    end
    
    return {
        rarity = rarity,
        source = isBoss and "boss_kill" or (isElite and "elite_kill" or "standard_kill"),
        dayNumber = dayNumber,
    }
end

------------------------------------------------------
-- SESSION SUMMARY
------------------------------------------------------

function CombatRewardsManager:GetSessionSummary(player)
    local state = self._playerState[player.UserId]
    if not state then return nil end
    
    return {
        totalKills = state.totalKills,
        totalCoins = state.totalCoinsEarned,
        totalGems = state.totalGemsEarned,
        totalXP = state.totalXPEarned,
        highestCombo = state.highestCombo,
        bossesKilled = state.bossesKilled,
        elitesKilled = state.elitesKilled,
    }
end

return CombatRewardsManager
