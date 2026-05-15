--[[
═══════════════════════════════════════════════════════════════
SURVIVE A BRAINROT — COMBAT REWARDS MANAGER v2.0
Script: CombatRewardsManager.lua
Type: Server Module (ServerScriptService)
Purpose: All combat reward logic — kills, combos, waves, bosses, dailies, death penalties.
Version: 2.0 — ENRICHED replacement of v1.0 (ESL PURGE complete)
Date: March 28, 2026
ZERO ESL REFERENCES. This game is about killing zombies and MAKING MONEY.
═══════════════════════════════════════════════════════════════
ARCHITECTURE:
  CombatSystem.lua calls into this module for ALL reward events.
  This module calls EconomyManager bridge methods for currency grants.
  Battle Pass XP, gacha crate drops, and analytics all flow through here.

  API CONTRACT (called by CombatSystem.lua):
    :InitPlayer(player)
    :CleanupPlayer(player)
    :ProcessKill(player, enemyType, isElite, isBoss, dayNumber, prestigeLevel)
    :ProcessWaveClear(player, waveNumber, dayNumber, enemiesKilled, timeSeconds)
    :ProcessDayClear(player, dayNumber, totalKills, totalDeaths, elapsedSeconds)
    :ProcessDeath(player)
    :BreakCombo(player)
    :RecordHeadshot(player)
    :RecordParry(player)
    :GetPlayerStats(player)
    :GetDailyChallenges(player)

  DEPENDENCIES:
    EconomyManager — AddCoins, AddGems, AddXP, RemoveCoins, GetCoins, GrantCrate, GrantTitle, ApplyBuff
    EnemyData — GetComboMultiplier, reward scaling constants
    WeaponData — rarity tiers (for loot quality checks)
    BattlePassManager — AddXP (optional, fail-open)
    GachaManager — AddPityProgress, GrantFreePulls, SetLuckBoost (optional, fail-open)
    AnalyticsService — Track (optional, fail-open)
    DataStoreV2 — GetPlayerField, SetPlayerField (optional, fail-open)

  CROSS-REPO SOURCES:
    1. CombatSystem.lua (SHA ff0b7563) — API contract, kill/death flow
    2. EconomyManager.lua (SHA 2c350033) — bridge methods, earn rates
    3. EnemyData.lua (SHA 3f4a3d5c) — combo multipliers, reward scaling
    4. WeaponData.lua (SHA 48564689) — rarity tiers
    5. EnglishRewardsManager.lua (SHA 9ad9471e) — monetization patterns (preserved)
    6. CombatRewardsManager.lua v1.0 (SHA cfddc04c) — original combat rewards (enriched)

  Build Order: L3 (after DataStore, EconomyManager, EnemyData, WeaponData)
  Generated: 2026-03-28 Run 86 | OB1 Pulse Engine v5
  Artifact Class: BUILD
  Active Mission: 100% Roblox — MAKE MONEY
  Platform Death Test: PASS
═══════════════════════════════════════════════════════════════
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local CombatRewardsManager = {}
CombatRewardsManager.__index = CombatRewardsManager

--------------------------------------------------------------------------------
-- DEPENDENCIES (injected via :Init or constructor)
--------------------------------------------------------------------------------

local Deps = {
    EconomyManager = nil,
    EnemyData = nil,
    WeaponData = nil,
    BattlePass = nil,
    GachaManager = nil,
    AnalyticsService = nil,
    AnomalyDetector = nil,
    DataStoreV2 = nil,
    DayScaling = nil,
}

--------------------------------------------------------------------------------
-- CONFIGURATION — All tunable constants in one place
--------------------------------------------------------------------------------

local CONFIG = {
    -- ═══════════════════════════════════════════════════════
    -- KILL REWARDS (base values — scaled by day + combo + prestige)
    -- ═══════════════════════════════════════════════════════
    KILL_REWARDS = {
        SkibidiZombie  = { coins = 10, xp = 10, gemChance = 0.00 },
        OhioAnomaly    = { coins = 15, xp = 15, gemChance = 0.00 },
        RizzMerchant   = { coins = 25, xp = 25, gemChance = 0.05 },
        BrainrotMutant = { coins = 35, xp = 35, gemChance = 0.08 },
        BrainrotMini   = { coins = 10, xp = 10, gemChance = 0.00 },
        SigmaBoss      = { coins = 200, xp = 200, gemChance = 1.00 },
    },

    -- Elite enemy multiplier (stacks with other multipliers)
    ELITE_COIN_MULT = 2.0,
    ELITE_XP_MULT = 2.0,
    ELITE_GEM_CHANCE_BONUS = 0.10,
    ELITE_BONUS_COINS = 40,
    ELITE_BONUS_GEMS = 1,
    ELITE_BONUS_XP = 30,

    -- Boss gem rewards (flat, not chance-based)
    BOSS_GEM_REWARD = 5,
    BOSS_GEM_REWARD_BARON = 15,

    -- ═══════════════════════════════════════════════════════
    -- COMBO SYSTEM (kill streaks without taking damage)
    -- ═══════════════════════════════════════════════════════
    COMBO_THRESHOLDS = {
        { kills = 5,   mult = 1.5,  label = "COMBO x5",    announcer = "NICE COMBO!" },
        { kills = 10,  mult = 2.0,  label = "COMBO x10",   announcer = "UNSTOPPABLE!" },
        { kills = 15,  mult = 2.5,  label = "COMBO x15",   announcer = "DOMINATING!" },
        { kills = 20,  mult = 3.0,  label = "COMBO x20",   announcer = "MEGA KILL!" },
        { kills = 30,  mult = 4.0,  label = "COMBO x30",   announcer = "GOD MODE!" },
        { kills = 50,  mult = 5.0,  label = "COMBO x50",   announcer = "LEGENDARY!" },
        { kills = 100, mult = 10.0, label = "COMBO x100",  announcer = "IMPOSSIBLE!" },
    },

    -- Combo milestone rewards (one-time per combo run)
    COMBO_MILESTONE_REWARDS = {
        [10]  = { coins = 100,  gems = 0, freePulls = 0, pity = 5 },
        [20]  = { coins = 250,  gems = 1, freePulls = 1, pity = 10 },
        [50]  = { coins = 500,  gems = 3, freePulls = 2, pity = 20 },
        [100] = { coins = 1000, gems = 5, freePulls = 3, pity = 30 },
    },

    -- ═══════════════════════════════════════════════════════
    -- BOSS GACHA SPIN (post-kill reward spinner)
    -- ═══════════════════════════════════════════════════════
    BOSS_GACHA_SPIN = {
        { name = "Coins x2",        weight = 30, type = "COIN_MULT",   value = 2 },
        { name = "Coins x5",        weight = 10, type = "COIN_MULT",   value = 5 },
        { name = "Rare Crate",      weight = 20, type = "CRATE",       rarity = "Rare" },
        { name = "Epic Crate",      weight = 10, type = "CRATE",       rarity = "Epic" },
        { name = "Legendary Crate", weight = 3,  type = "CRATE",       rarity = "Legendary" },
        { name = "10 Gems",         weight = 15, type = "GEMS",        value = 10 },
        { name = "25 Gems",         weight = 7,  type = "GEMS",        value = 25 },
        { name = "XP Boost 30min",  weight = 5,  type = "BUFF",        buffId = "xp_boost_30" },
    },

    -- ═══════════════════════════════════════════════════════
    -- WAVE CLEAR BONUSES
    -- ═══════════════════════════════════════════════════════
    WAVE_CLEAR_BASE_COINS = 50,
    WAVE_CLEAR_BASE_XP = 50,
    WAVE_CLEAR_SPEED_BONUS_THRESHOLD = 30,
    WAVE_CLEAR_SPEED_BONUS_MULT = 1.5,
    WAVE_CLEAR_NO_HIT_BONUS_MULT = 1.5,

    -- ═══════════════════════════════════════════════════════
    -- DAY COMPLETION BONUSES
    -- ═══════════════════════════════════════════════════════
    DAY_CLEAR_BASE_COINS = 100,
    DAY_CLEAR_BASE_XP = 100,
    DAY_CLEAR_BASE_GEMS = 2,
    DAY_CLEAR_NO_DEATH_BONUS_COINS = 200,
    DAY_CLEAR_NO_DEATH_BONUS_GEMS = 3,
    DAY_CLEAR_SPEED_THRESHOLDS = {
        { maxSeconds = 120, label = "S-Rank", coinMult = 3.0, xpMult = 3.0 },
        { maxSeconds = 180, label = "A-Rank", coinMult = 2.0, xpMult = 2.0 },
        { maxSeconds = 240, label = "B-Rank", coinMult = 1.5, xpMult = 1.5 },
    },
    BOSS_DAY_BONUS_COINS = 300,
    BOSS_DAY_BONUS_GEMS = 5,
    BOSS_DAY_CRATE_DROP = true,

    -- Day milestones (one-time awards)
    DAY_MILESTONES = {
        { day = 10,  coins = 500,   gems = 10,  item = nil,              title = nil },
        { day = 25,  coins = 1000,  gems = 25,  item = nil,              title = nil },
        { day = 50,  coins = 2500,  gems = 50,  item = "rare_crate",     title = "Halfway Hero" },
        { day = 75,  coins = 5000,  gems = 75,  item = "epic_crate",     title = "Hell Survivor" },
        { day = 99,  coins = 10000, gems = 100, item = "legendary_crate",title = "The Sigma" },
    },

    -- Boss days
    BOSS_DAYS = { 11, 22, 33, 44, 55, 66, 77, 88, 99 },

    -- ═══════════════════════════════════════════════════════
    -- DAILY COMBAT CHALLENGES (3 random per day)
    -- ═══════════════════════════════════════════════════════
    DAILY_CHALLENGES = {
        { id = "kills_50",      desc = "Kill 50 enemies",            target = 50,  stat = "kills",       coins = 200, gems = 3,  xp = 200 },
        { id = "combo_20",      desc = "Reach a 20-kill combo",      target = 20,  stat = "bestCombo",   coins = 300, gems = 5,  xp = 300 },
        { id = "boss_kill",     desc = "Kill a boss",                target = 1,   stat = "bossKills",   coins = 500, gems = 10, xp = 500 },
        { id = "no_death_day",  desc = "Clear a day with 0 deaths",  target = 1,   stat = "noDeathDays", coins = 400, gems = 5,  xp = 400 },
        { id = "headshots_10",  desc = "Get 10 headshots",           target = 10,  stat = "headshots",   coins = 200, gems = 2,  xp = 200 },
        { id = "parries_5",     desc = "Land 5 parries",             target = 5,   stat = "parries",     coins = 300, gems = 3,  xp = 300 },
    },
    DAILY_CHALLENGE_COUNT = 3,

    -- ═══════════════════════════════════════════════════════
    -- DEATH PENALTY
    -- ═══════════════════════════════════════════════════════
    DEATH_COIN_PENALTY_PERCENT = 5,
    DEATH_COIN_PENALTY_MAX = 500,
    DEATH_COMBO_RESET = true,
    DEATH_XP_PENALTY = 0,

    -- ═══════════════════════════════════════════════════════
    -- PRESTIGE / REBIRTH SCALING
    -- ═══════════════════════════════════════════════════════
    PRESTIGE_COIN_MULT_PER_LEVEL = 0.10,
    PRESTIGE_XP_MULT_PER_LEVEL = 0.05,
    PRESTIGE_GEM_BONUS_PER_LEVEL = 0.02,

    -- ═══════════════════════════════════════════════════════
    -- DAY SCALING (mirrors EnemyData.RewardScaling)
    -- ═══════════════════════════════════════════════════════
    COIN_SCALE_PER_DAY = 0.01,
    XP_SCALE_PER_DAY = 0.02,
    GEM_SCALE_PER_DAY = 0.005,

    -- ═══════════════════════════════════════════════════════
    -- GACHA BRIDGE (combat progression -> gacha)
    -- ═══════════════════════════════════════════════════════
    GACHA_KILLS_PER_FREE_PULL = 100,
    GACHA_BOSS_KILL_PITY = 10,
    GACHA_COMBO_50_LUCK_MULT = 2.0,
    GACHA_COMBO_50_LUCK_DURATION = 1800,

    -- ═══════════════════════════════════════════════════════
    -- BATTLE PASS XP RATES
    -- ═══════════════════════════════════════════════════════
    BP_XP_PER_KILL = 5,
    BP_XP_PER_ELITE_KILL = 15,
    BP_XP_PER_BOSS_KILL = 100,
    BP_XP_PER_WAVE_CLEAR = 25,
    BP_XP_PER_DAY_CLEAR = 50,
    BP_XP_PER_COMBO_MILESTONE = 75,
    BP_XP_DAILY_CHALLENGE = 200,

    -- ═══════════════════════════════════════════════════════
    -- GAME PASS MULTIPLIERS
    -- ═══════════════════════════════════════════════════════
    GAME_PASS_MULTS = {
        VIP           = { coinMult = 2.0, xpMult = 2.0, gemMult = 1.0 },
        MutationBoost = { coinMult = 1.0, xpMult = 1.0, gemMult = 1.0, mutationChanceMult = 1.5 },
        AutoFarm      = { coinMult = 0.5, xpMult = 0.5, gemMult = 0.0 },
    },

    -- ═══════════════════════════════════════════════════════
    -- LOOT DROP CONFIG
    -- ═══════════════════════════════════════════════════════
    LOOT_DROP_CHANCE_BASE = 0.15,
    LOOT_DROP_CHANCE_ELITE = 0.40,
    LOOT_DROP_CHANCE_BOSS = 1.00,
    LOOT_DAY_RARITY_BOOST = 0.005,

    -- ═══════════════════════════════════════════════════════
    -- ANTI-EXPLOIT
    -- ═══════════════════════════════════════════════════════
    MAX_KILLS_PER_MINUTE = 60,
    MAX_REWARDS_PER_MINUTE = 40,
    MIN_KILL_INTERVAL = 0.1,

    -- ═══════════════════════════════════════════════════════
    -- REWARD HISTORY
    -- ═══════════════════════════════════════════════════════
    HISTORY_BUFFER_SIZE = 100,
}

--------------------------------------------------------------------------------
-- PLAYER STATE (per-player, server-authoritative)
--------------------------------------------------------------------------------

local playerStates = {}

local function createRewardsState()
    return {
        -- Combo tracking
        currentCombo = 0,
        highestCombo = 0,
        lastKillTime = 0,
        comboMilestonesHit = {},

        -- Session stats
        sessionKills = 0,
        sessionEliteKills = 0,
        sessionBossKills = 0,
        sessionDeaths = 0,
        sessionCoinsEarned = 0,
        sessionGemsEarned = 0,
        sessionXPEarned = 0,
        sessionWavesCleared = 0,
        sessionDaysCleared = 0,
        sessionHeadshots = 0,
        sessionParries = 0,
        sessionNoDeathDays = 0,

        -- Wave state
        waveKills = 0,
        waveDamageTaken = false,

        -- Daily challenge tracking
        dailyDate = "",
        dailyChallenges = {},
        dailyChallengeProgress = {},
        dailyChallengesComplete = 0,

        -- Cumulative (DataStore-backed)
        totalKills = 0,
        totalCoinsEarned = 0,
        totalGemsEarned = 0,
        totalBossKills = 0,
        totalDeaths = 0,
        totalDaysCleared = 0,
        totalWavesCleared = 0,
        gachaKillAccumulator = 0,

        -- Rate limiting
        killsThisMinute = 0,
        rewardsThisMinute = 0,
        lastMinuteReset = 0,
        lastKillTimestamp = 0,

        -- Reward history ring buffer
        rewardHistory = {},
        rewardHistoryIndex = 0,
    }
end

--------------------------------------------------------------------------------
-- UTILITIES
--------------------------------------------------------------------------------

local function getServerDate()
    local t = os.date("!*t", os.time() + 7 * 3600)
    return string.format("%04d-%02d-%02d", t.year, t.month, t.day)
end

local function getComboMultiplier(comboCount)
    local best = 1.0
    for _, tier in ipairs(CONFIG.COMBO_THRESHOLDS) do
        if comboCount >= tier.kills then
            best = tier.mult
        else
            break
        end
    end
    return best
end

local function getComboAnnouncer(comboCount)
    local label = nil
    for _, tier in ipairs(CONFIG.COMBO_THRESHOLDS) do
        if comboCount >= tier.kills then
            label = tier.announcer
        else
            break
        end
    end
    return label
end

local function getDayScaleMult(dayNumber, ratePerDay)
    return 1 + (math.max(dayNumber, 1) - 1) * ratePerDay
end

local function getPrestigeMult(prestigeLevel, ratePerLevel)
    return 1 + math.max(prestigeLevel or 0, 0) * ratePerLevel
end

local function isBossDay(dayNumber)
    for _, bd in ipairs(CONFIG.BOSS_DAYS) do
        if dayNumber == bd then return true end
    end
    return false
end

local function emitAnalytics(player, eventName, props)
    if not Deps.AnalyticsService then return end
    pcall(function()
        if Deps.AnalyticsService.Track then
            Deps.AnalyticsService:Track(player, "combat_" .. eventName, props or {})
        elseif Deps.AnalyticsService.TrackKill and eventName == "kill" then
            Deps.AnalyticsService:TrackKill(player, props or {})
        end
    end)
end

local function grantBattlePassXP(player, amount, source)
    if not Deps.BattlePass or amount <= 0 then return end
    pcall(function()
        if Deps.BattlePass.AddXP then
            Deps.BattlePass.AddXP(player, amount, source)
        end
    end)
end

local function addPityProgress(player, amount)
    if not Deps.GachaManager or amount <= 0 then return end
    pcall(function()
        if Deps.GachaManager.AddPityProgress then
            Deps.GachaManager.AddPityProgress(player, amount)
        end
    end)
end

local function grantFreePulls(player, poolName, count)
    if not Deps.GachaManager or count <= 0 then return end
    pcall(function()
        if Deps.GachaManager.GrantFreePulls then
            Deps.GachaManager.GrantFreePulls(player, poolName, count)
        end
    end)
end

local function setLuckBoost(player, mult, duration)
    if not Deps.GachaManager then return end
    pcall(function()
        if Deps.GachaManager.SetLuckBoost then
            Deps.GachaManager.SetLuckBoost(player, mult, duration)
        end
    end)
end

local function recordReward(state, source, coins, gems, xp)
    state.rewardHistoryIndex = (state.rewardHistoryIndex % CONFIG.HISTORY_BUFFER_SIZE) + 1
    state.rewardHistory[state.rewardHistoryIndex] = {
        timestamp = os.time(),
        source = source,
        coins = coins,
        gems = gems,
        xp = xp,
    }
end

local function sendClientReward(player, rewardPacket)
    local remotes = ReplicatedStorage:FindFirstChild("GameRemotes")
    if not remotes then return end
    local ev = remotes:FindFirstChild("CombatReward")
    if ev then
        pcall(function() ev:FireClient(player, rewardPacket) end)
    end
end

--------------------------------------------------------------------------------
-- RATE LIMITING
--------------------------------------------------------------------------------

local function checkRateLimit(state)
    local now = tick()
    if now - state.lastMinuteReset > 60 then
        state.killsThisMinute = 0
        state.rewardsThisMinute = 0
        state.lastMinuteReset = now
    end

    if state.killsThisMinute >= CONFIG.MAX_KILLS_PER_MINUTE then
        return false, "RATE_LIMIT_KILLS"
    end
    if state.rewardsThisMinute >= CONFIG.MAX_REWARDS_PER_MINUTE then
        return false, "RATE_LIMIT_REWARDS"
    end

    return true, nil
end

--------------------------------------------------------------------------------
-- DAILY CHALLENGE SYSTEM
--------------------------------------------------------------------------------

local function assignDailyChallenges(state)
    local today = getServerDate()
    if state.dailyDate == today then return end

    state.dailyDate = today
    state.dailyChallenges = {}
    state.dailyChallengeProgress = {}
    state.dailyChallengesComplete = 0

    -- Deterministic shuffle using date seed
    local seed = 0
    for c in today:gmatch(".") do seed = seed + string.byte(c) end
    math.randomseed(seed)

    local pool = {}
    for i = 1, #CONFIG.DAILY_CHALLENGES do
        table.insert(pool, i)
    end

    local picked = 0
    while picked < CONFIG.DAILY_CHALLENGE_COUNT and #pool > 0 do
        local idx = math.random(1, #pool)
        local challengeIdx = pool[idx]
        table.remove(pool, idx)

        local challenge = CONFIG.DAILY_CHALLENGES[challengeIdx]
        table.insert(state.dailyChallenges, challenge)
        state.dailyChallengeProgress[challenge.id] = 0
        picked = picked + 1
    end

    math.randomseed(os.time())
end

local function updateDailyChallenge(player, state, statName, value)
    for _, challenge in ipairs(state.dailyChallenges) do
        if challenge.stat == statName then
            local progress = state.dailyChallengeProgress[challenge.id] or 0
            if progress < challenge.target then
                progress = progress + value
                state.dailyChallengeProgress[challenge.id] = progress

                if progress >= challenge.target then
                    state.dailyChallengesComplete = state.dailyChallengesComplete + 1

                    if Deps.EconomyManager then
                        Deps.EconomyManager.AddCoins(player, challenge.coins, "daily_challenge_" .. challenge.id)
                        if challenge.gems > 0 then
                            Deps.EconomyManager.AddGems(player, challenge.gems, "daily_challenge_" .. challenge.id)
                        end
                    end

                    state.sessionCoinsEarned = state.sessionCoinsEarned + challenge.coins
                    state.sessionGemsEarned = state.sessionGemsEarned + challenge.gems

                    grantBattlePassXP(player, CONFIG.BP_XP_DAILY_CHALLENGE, "daily_challenge")
                    recordReward(state, "daily_challenge_" .. challenge.id, challenge.coins, challenge.gems, challenge.xp)

                    sendClientReward(player, {
                        type = "DAILY_CHALLENGE_COMPLETE",
                        challengeId = challenge.id,
                        description = challenge.desc,
                        coins = challenge.coins,
                        gems = challenge.gems,
                    })

                    emitAnalytics(player, "daily_challenge_complete", {
                        challenge_id = challenge.id,
                        total_complete = state.dailyChallengesComplete,
                    })
                end
            end
        end
    end
end

--------------------------------------------------------------------------------
-- CORE API: InitPlayer / CleanupPlayer
--------------------------------------------------------------------------------

function CombatRewardsManager:InitPlayer(player)
    local uid = player.UserId
    local state = createRewardsState()

    -- Load persistent data from DataStore
    if Deps.DataStoreV2 then
        local ok, stored = pcall(function()
            return Deps.DataStoreV2.GetPlayerField and Deps.DataStoreV2.GetPlayerField(player, "combat_rewards_v1")
        end)
        if ok and stored and type(stored) == "table" then
            state.totalKills = stored.totalKills or 0
            state.totalCoinsEarned = stored.totalCoinsEarned or 0
            state.totalGemsEarned = stored.totalGemsEarned or 0
            state.totalBossKills = stored.totalBossKills or 0
            state.totalDeaths = stored.totalDeaths or 0
            state.totalDaysCleared = stored.totalDaysCleared or 0
            state.totalWavesCleared = stored.totalWavesCleared or 0
            state.gachaKillAccumulator = stored.gachaKillAccumulator or 0
        end
    end

    assignDailyChallenges(state)
    playerStates[uid] = state

    emitAnalytics(player, "rewards_init", {
        total_kills = state.totalKills,
        total_boss_kills = state.totalBossKills,
    })
end

function CombatRewardsManager:CleanupPlayer(player)
    local uid = player.UserId
    local state = playerStates[uid]
    if not state then return end

    -- Save persistent data
    if Deps.DataStoreV2 then
        pcall(function()
            if Deps.DataStoreV2.SetPlayerField then
                Deps.DataStoreV2.SetPlayerField(player, "combat_rewards_v1", {
                    totalKills = state.totalKills + state.sessionKills,
                    totalCoinsEarned = state.totalCoinsEarned + state.sessionCoinsEarned,
                    totalGemsEarned = state.totalGemsEarned + state.sessionGemsEarned,
                    totalBossKills = state.totalBossKills + state.sessionBossKills,
                    totalDeaths = state.totalDeaths + state.sessionDeaths,
                    totalDaysCleared = state.totalDaysCleared + state.sessionDaysCleared,
                    totalWavesCleared = state.totalWavesCleared + state.sessionWavesCleared,
                    gachaKillAccumulator = state.gachaKillAccumulator,
                })
            end
        end)
    end

    emitAnalytics(player, "session_end", {
        session_kills = state.sessionKills,
        session_coins = state.sessionCoinsEarned,
        session_gems = state.sessionGemsEarned,
        highest_combo = state.highestCombo,
        deaths = state.sessionDeaths,
    })

    playerStates[uid] = nil
end

--------------------------------------------------------------------------------
-- CORE API: ProcessKill
-- Called by CombatSystem:_applyDamageToEnemy when enemy.health <= 0
--------------------------------------------------------------------------------

function CombatRewardsManager:ProcessKill(player, enemyType, isElite, isBoss, dayNumber, prestigeLevel)
    local uid = player.UserId
    local state = playerStates[uid]
    if not state then return nil end

    -- Rate limit check
    local allowed, reason = checkRateLimit(state)
    if not allowed then
        emitAnalytics(player, "rate_limited", { reason = reason })
        return nil
    end

    local now = tick()
    if now - state.lastKillTimestamp < CONFIG.MIN_KILL_INTERVAL then
        return nil
    end
    state.lastKillTimestamp = now
    state.killsThisMinute = state.killsThisMinute + 1
    state.rewardsThisMinute = state.rewardsThisMinute + 1

    -- Look up base rewards
    local baseReward = CONFIG.KILL_REWARDS[enemyType]
    if not baseReward then
        baseReward = CONFIG.KILL_REWARDS["SkibidiZombie"]
    end

    -- Update combo
    state.currentCombo = state.currentCombo + 1
    state.lastKillTime = now
    state.waveKills = state.waveKills + 1
    if state.currentCombo > state.highestCombo then
        state.highestCombo = state.currentCombo
    end

    -- Calculate multipliers
    local comboMult = getComboMultiplier(state.currentCombo)
    local dayMult_coins = getDayScaleMult(dayNumber, CONFIG.COIN_SCALE_PER_DAY)
    local dayMult_xp = getDayScaleMult(dayNumber, CONFIG.XP_SCALE_PER_DAY)
    local prestigeMult_coins = getPrestigeMult(prestigeLevel, CONFIG.PRESTIGE_COIN_MULT_PER_LEVEL)
    local prestigeMult_xp = getPrestigeMult(prestigeLevel, CONFIG.PRESTIGE_XP_MULT_PER_LEVEL)

    -- Calculate final rewards
    local coins = math.floor(baseReward.coins * comboMult * dayMult_coins * prestigeMult_coins)
    local xp = math.floor(baseReward.xp * dayMult_xp * prestigeMult_xp)
    local gems = 0

    -- Elite bonus (additive, on top)
    if isElite and not isBoss then
        coins = coins + CONFIG.ELITE_BONUS_COINS
        xp = xp + CONFIG.ELITE_BONUS_XP
        gems = gems + CONFIG.ELITE_BONUS_GEMS
        state.sessionEliteKills = state.sessionEliteKills + 1
    end

    -- Gem calculation
    if isBoss then
        if enemyType == "SigmaBoss" and dayNumber >= 44 then
            gems = CONFIG.BOSS_GEM_REWARD_BARON
        else
            gems = CONFIG.BOSS_GEM_REWARD
        end
    else
        local gemChance = baseReward.gemChance
            + (dayNumber - 1) * CONFIG.GEM_SCALE_PER_DAY
            + (isElite and CONFIG.ELITE_GEM_CHANCE_BONUS or 0)
            + ((prestigeLevel or 0) * CONFIG.PRESTIGE_GEM_BONUS_PER_LEVEL)
        if gemChance > 0 and math.random() < gemChance then
            gems = gems + 1
        end
    end

    -- Grant currency through EconomyManager
    if Deps.EconomyManager then
        local source = isBoss and "boss_kill" or (isElite and "elite_kill" or "kill")
        Deps.EconomyManager.AddCoins(player, coins, source)
        if gems > 0 then
            Deps.EconomyManager.AddGems(player, gems, source)
        end
        Deps.EconomyManager.AddXP(player, xp, source)
    end

    -- Battle Pass XP
    local bpXP = CONFIG.BP_XP_PER_KILL
    if isElite then bpXP = CONFIG.BP_XP_PER_ELITE_KILL end
    if isBoss then bpXP = CONFIG.BP_XP_PER_BOSS_KILL end
    grantBattlePassXP(player, bpXP, "combat_kill")

    -- Boss kill: pity progress + gacha spin
    if isBoss then
        addPityProgress(player, CONFIG.GACHA_BOSS_KILL_PITY)
        state.sessionBossKills = state.sessionBossKills + 1
    end

    -- Track stats
    state.sessionKills = state.sessionKills + 1
    state.sessionCoinsEarned = state.sessionCoinsEarned + coins
    state.sessionGemsEarned = state.sessionGemsEarned + gems
    state.sessionXPEarned = state.sessionXPEarned + xp

    -- Gacha kill accumulator
    state.gachaKillAccumulator = state.gachaKillAccumulator + 1
    if state.gachaKillAccumulator >= CONFIG.GACHA_KILLS_PER_FREE_PULL then
        state.gachaKillAccumulator = state.gachaKillAccumulator - CONFIG.GACHA_KILLS_PER_FREE_PULL
        grantFreePulls(player, "SurvivalCrate", 1)
    end

    -- Check combo milestones
    local comboMilestone = CONFIG.COMBO_MILESTONE_REWARDS[state.currentCombo]
    if comboMilestone and not state.comboMilestonesHit[state.currentCombo] then
        state.comboMilestonesHit[state.currentCombo] = true

        if Deps.EconomyManager then
            Deps.EconomyManager.AddCoins(player, comboMilestone.coins, "combo_milestone_" .. state.currentCombo)
            if comboMilestone.gems > 0 then
                Deps.EconomyManager.AddGems(player, comboMilestone.gems, "combo_milestone_" .. state.currentCombo)
            end
        end
        if comboMilestone.freePulls > 0 then
            grantFreePulls(player, "SurvivalCrate", comboMilestone.freePulls)
        end
        if comboMilestone.pity > 0 then
            addPityProgress(player, comboMilestone.pity)
        end

        grantBattlePassXP(player, CONFIG.BP_XP_PER_COMBO_MILESTONE, "combo_milestone")
        state.sessionCoinsEarned = state.sessionCoinsEarned + comboMilestone.coins
        state.sessionGemsEarned = state.sessionGemsEarned + comboMilestone.gems

        if state.currentCombo >= 50 then
            setLuckBoost(player, CONFIG.GACHA_COMBO_50_LUCK_MULT, CONFIG.GACHA_COMBO_50_LUCK_DURATION)
        end

        sendClientReward(player, {
            type = "COMBO_MILESTONE",
            combo = state.currentCombo,
            coins = comboMilestone.coins,
            gems = comboMilestone.gems,
            freePulls = comboMilestone.freePulls,
        })
    end

    -- Update daily challenges
    updateDailyChallenge(player, state, "kills", 1)
    if state.currentCombo > (state.dailyChallengeProgress["combo_20"] or 0) then
        state.dailyChallengeProgress["combo_20"] = state.currentCombo
        updateDailyChallenge(player, state, "bestCombo", 0)
    end
    if isBoss then
        updateDailyChallenge(player, state, "bossKills", 1)
    end

    recordReward(state, isBoss and "boss_kill" or "kill", coins, gems, xp)

    -- Client notification
    local comboAnnounce = getComboAnnouncer(state.currentCombo)
    sendClientReward(player, {
        type = "KILL_REWARD",
        enemyType = enemyType,
        isElite = isElite,
        isBoss = isBoss,
        coins = coins,
        gems = gems,
        xp = xp,
        combo = state.currentCombo,
        comboMult = comboMult,
        comboAnnounce = comboAnnounce,
    })

    -- Analytics
    emitAnalytics(player, "kill", {
        enemyType = enemyType,
        isElite = isElite,
        isBoss = isBoss,
        dayNumber = dayNumber,
        comboCount = state.currentCombo,
        coinsEarned = coins,
        gemsEarned = gems,
        xpEarned = xp,
    })

    return {
        coins = coins,
        gems = gems,
        xp = xp,
        comboCount = state.currentCombo,
        comboMult = comboMult,
        isElite = isElite,
        isBoss = isBoss,
        enemyType = enemyType,
    }
end

--------------------------------------------------------------------------------
-- BOSS GACHA SPIN (post-kill bonus spin)
--------------------------------------------------------------------------------

function CombatRewardsManager:RollBossGacha(player, dayNumber)
    local totalWeight = 0
    for _, entry in ipairs(CONFIG.BOSS_GACHA_SPIN) do
        totalWeight = totalWeight + entry.weight
    end

    local roll = math.random() * totalWeight
    local cumulative = 0

    for _, entry in ipairs(CONFIG.BOSS_GACHA_SPIN) do
        cumulative = cumulative + entry.weight
        if roll <= cumulative then
            self:_applyGachaReward(player, entry, dayNumber)
            return entry
        end
    end

    return CONFIG.BOSS_GACHA_SPIN[1]
end

function CombatRewardsManager:_applyGachaReward(player, entry, dayNumber)
    if not Deps.EconomyManager then return end

    if entry.type == "COIN_MULT" then
        local baseCoins = CONFIG.KILL_REWARDS.SigmaBoss.coins
        local bonusCoins = math.floor(baseCoins * entry.value)
        Deps.EconomyManager.AddCoins(player, bonusCoins, "boss_gacha")

    elseif entry.type == "GEMS" then
        Deps.EconomyManager.AddGems(player, entry.value, "boss_gacha")

    elseif entry.type == "CRATE" then
        Deps.EconomyManager.GrantCrate(player, entry.rarity, "boss_gacha")

    elseif entry.type == "BUFF" then
        Deps.EconomyManager.ApplyBuff(player, entry.buffId, "boss_gacha")
    end
end

--------------------------------------------------------------------------------
-- CORE API: ProcessWaveClear
--------------------------------------------------------------------------------

function CombatRewardsManager:ProcessWaveClear(player, waveNumber, dayNumber, enemiesKilled, timeSeconds)
    local uid = player.UserId
    local state = playerStates[uid]
    if not state then return nil end

    local dayMult = getDayScaleMult(dayNumber, CONFIG.COIN_SCALE_PER_DAY)
    local coins = math.floor(CONFIG.WAVE_CLEAR_BASE_COINS * dayMult)
    local xp = math.floor(CONFIG.WAVE_CLEAR_BASE_XP * getDayScaleMult(dayNumber, CONFIG.XP_SCALE_PER_DAY))

    -- Speed bonus
    if timeSeconds > 0 and timeSeconds <= CONFIG.WAVE_CLEAR_SPEED_BONUS_THRESHOLD then
        coins = math.floor(coins * CONFIG.WAVE_CLEAR_SPEED_BONUS_MULT)
        xp = math.floor(xp * CONFIG.WAVE_CLEAR_SPEED_BONUS_MULT)
    end

    -- No-hit wave bonus
    local noHit = not state.waveDamageTaken
    if noHit then
        coins = math.floor(coins * CONFIG.WAVE_CLEAR_NO_HIT_BONUS_MULT)
        xp = math.floor(xp * CONFIG.WAVE_CLEAR_NO_HIT_BONUS_MULT)
    end

    if Deps.EconomyManager then
        Deps.EconomyManager.AddCoins(player, coins, "wave_clear")
        Deps.EconomyManager.AddXP(player, xp, "wave_clear")
    end

    grantBattlePassXP(player, CONFIG.BP_XP_PER_WAVE_CLEAR, "wave_clear")

    state.sessionWavesCleared = state.sessionWavesCleared + 1
    state.sessionCoinsEarned = state.sessionCoinsEarned + coins
    state.sessionXPEarned = state.sessionXPEarned + xp

    -- Reset wave state
    local waveKills = state.waveKills
    state.waveKills = 0
    state.waveDamageTaken = false

    recordReward(state, "wave_clear", coins, 0, xp)

    sendClientReward(player, {
        type = "WAVE_CLEAR",
        wave = waveNumber,
        coins = coins,
        xp = xp,
        speedBonus = timeSeconds <= CONFIG.WAVE_CLEAR_SPEED_BONUS_THRESHOLD,
        noHitBonus = noHit,
        waveKills = waveKills,
    })

    return { coins = coins, xp = xp, noHitBonus = noHit, waveKills = waveKills }
end

--------------------------------------------------------------------------------
-- CORE API: ProcessDayClear
--------------------------------------------------------------------------------

function CombatRewardsManager:ProcessDayClear(player, dayNumber, totalKills, totalDeaths, elapsedSeconds)
    local uid = player.UserId
    local state = playerStates[uid]
    if not state then return nil end

    local dayMult = getDayScaleMult(dayNumber, CONFIG.COIN_SCALE_PER_DAY)
    local coins = math.floor(CONFIG.DAY_CLEAR_BASE_COINS * dayMult)
    local xp = math.floor(CONFIG.DAY_CLEAR_BASE_XP * getDayScaleMult(dayNumber, CONFIG.XP_SCALE_PER_DAY))
    local gems = CONFIG.DAY_CLEAR_BASE_GEMS

    -- No-death bonus
    local noDeathBonus = totalDeaths == 0
    if noDeathBonus then
        coins = coins + CONFIG.DAY_CLEAR_NO_DEATH_BONUS_COINS
        gems = gems + CONFIG.DAY_CLEAR_NO_DEATH_BONUS_GEMS
        state.sessionNoDeathDays = state.sessionNoDeathDays + 1
        updateDailyChallenge(player, state, "noDeathDays", 1)
    end

    -- Speed rank
    local rankLabel = "C-Rank"
    for _, threshold in ipairs(CONFIG.DAY_CLEAR_SPEED_THRESHOLDS) do
        if elapsedSeconds <= threshold.maxSeconds then
            coins = math.floor(coins * threshold.coinMult)
            xp = math.floor(xp * threshold.xpMult)
            rankLabel = threshold.label
            break
        end
    end

    -- Boss day bonus
    local bossDay = isBossDay(dayNumber)
    if bossDay then
        coins = coins + CONFIG.BOSS_DAY_BONUS_COINS
        gems = gems + CONFIG.BOSS_DAY_BONUS_GEMS
        if CONFIG.BOSS_DAY_CRATE_DROP and Deps.EconomyManager then
            Deps.EconomyManager.GrantCrate(player, "SurvivalCrate", "boss_day_clear")
        end
    end

    -- Day milestones
    local milestoneReward = nil
    for _, milestone in ipairs(CONFIG.DAY_MILESTONES) do
        if milestone.day == dayNumber then
            milestoneReward = milestone
            if Deps.EconomyManager then
                Deps.EconomyManager.AddCoins(player, milestone.coins, "milestone_day_" .. dayNumber)
                Deps.EconomyManager.AddGems(player, milestone.gems, "milestone_day_" .. dayNumber)
                if milestone.item then
                    Deps.EconomyManager.GrantCrate(player, milestone.item, "milestone")
                end
                if milestone.title then
                    Deps.EconomyManager.GrantTitle(player, milestone.title, "milestone")
                end
            end
            coins = coins + milestone.coins
            gems = gems + milestone.gems
            break
        end
    end

    -- Grant rewards
    if Deps.EconomyManager then
        Deps.EconomyManager.AddCoins(player, coins, "day_clear")
        Deps.EconomyManager.AddGems(player, gems, "day_clear")
        Deps.EconomyManager.AddXP(player, xp, "day_clear")
    end

    grantBattlePassXP(player, CONFIG.BP_XP_PER_DAY_CLEAR, "day_clear")

    state.sessionDaysCleared = state.sessionDaysCleared + 1
    state.sessionCoinsEarned = state.sessionCoinsEarned + coins
    state.sessionGemsEarned = state.sessionGemsEarned + gems
    state.sessionXPEarned = state.sessionXPEarned + xp
    recordReward(state, "day_clear", coins, gems, xp)

    sendClientReward(player, {
        type = "DAY_CLEAR",
        day = dayNumber,
        coins = coins,
        gems = gems,
        xp = xp,
        rank = rankLabel,
        noDeathBonus = noDeathBonus,
        isBossDay = bossDay,
        totalKills = totalKills,
        milestone = milestoneReward,
    })

    emitAnalytics(player, "day_clear", {
        day = dayNumber,
        kills = totalKills,
        deaths = totalDeaths,
        elapsed = elapsedSeconds,
        rank = rankLabel,
        no_death = noDeathBonus,
        is_boss_day = bossDay,
    })

    return { coins = coins, gems = gems, xp = xp, rank = rankLabel, milestone = milestoneReward }
end

--------------------------------------------------------------------------------
-- CORE API: ProcessDeath
--------------------------------------------------------------------------------

function CombatRewardsManager:ProcessDeath(player)
    local uid = player.UserId
    local state = playerStates[uid]
    if not state then return end

    state.sessionDeaths = state.sessionDeaths + 1

    -- Coin penalty
    local coinLoss = 0
    if Deps.EconomyManager and CONFIG.DEATH_COIN_PENALTY_PERCENT > 0 then
        local currentCoins = 0
        if Deps.EconomyManager.GetCoins then
            currentCoins = Deps.EconomyManager.GetCoins(player) or 0
        end
        coinLoss = math.min(
            math.floor(currentCoins * CONFIG.DEATH_COIN_PENALTY_PERCENT / 100),
            CONFIG.DEATH_COIN_PENALTY_MAX
        )
        if coinLoss > 0 then
            Deps.EconomyManager.RemoveCoins(player, coinLoss, "death_penalty")
        end
    end

    -- Break combo on death
    local brokeCombo = 0
    if CONFIG.DEATH_COMBO_RESET then
        brokeCombo = state.currentCombo
        self:BreakCombo(player)
    end

    sendClientReward(player, {
        type = "DEATH_PENALTY",
        coinLost = coinLoss,
        comboBroken = brokeCombo,
    })

    emitAnalytics(player, "death", {
        total_deaths = state.sessionDeaths,
        combo_at_death = brokeCombo,
        coin_loss = coinLoss,
    })

    return { coinLoss = coinLoss, comboBroken = brokeCombo }
end

--------------------------------------------------------------------------------
-- CORE API: BreakCombo
--------------------------------------------------------------------------------

function CombatRewardsManager:BreakCombo(player)
    local uid = player.UserId
    local state = playerStates[uid]
    if not state then return end

    if state.currentCombo > 0 then
        emitAnalytics(player, "combo_broken", {
            combo = state.currentCombo,
            highest = state.highestCombo,
        })
        state.currentCombo = 0
        state.comboMilestonesHit = {}
        state.waveDamageTaken = true
    end
end

--------------------------------------------------------------------------------
-- CORE API: RecordHeadshot / RecordParry
--------------------------------------------------------------------------------

function CombatRewardsManager:RecordHeadshot(player)
    local state = playerStates[player.UserId]
    if not state then return end
    state.sessionHeadshots = state.sessionHeadshots + 1
    updateDailyChallenge(player, state, "headshots", 1)
end

function CombatRewardsManager:RecordParry(player)
    local state = playerStates[player.UserId]
    if not state then return end
    state.sessionParries = state.sessionParries + 1
    updateDailyChallenge(player, state, "parries", 1)
end

--------------------------------------------------------------------------------
-- LOOT DROP PROCESSING
--------------------------------------------------------------------------------

function CombatRewardsManager:RollLootDrop(enemyType, dayNumber, isElite, isBoss2, luckBonus)
    local dropChance = CONFIG.LOOT_DROP_CHANCE_BASE
    if isElite then dropChance = CONFIG.LOOT_DROP_CHANCE_ELITE end
    if isBoss2 then dropChance = CONFIG.LOOT_DROP_CHANCE_BOSS end
    dropChance = dropChance * (1.0 + (luckBonus or 0))

    if math.random() > dropChance then
        return nil
    end

    local dayBoost = dayNumber * CONFIG.LOOT_DAY_RARITY_BOOST
    local rarityRoll = math.random()
    local rarity

    if isBoss2 then
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
        source = isBoss2 and "boss_kill" or (isElite and "elite_kill" or "standard_kill"),
        dayNumber = dayNumber,
    }
end

--------------------------------------------------------------------------------
-- CORE API: GetPlayerStats / GetDailyChallenges / GetSessionSummary
--------------------------------------------------------------------------------

function CombatRewardsManager:GetPlayerStats(player)
    local state = playerStates[player.UserId]
    if not state then return nil end

    return {
        currentCombo = state.currentCombo,
        highestCombo = state.highestCombo,
        sessionKills = state.sessionKills,
        sessionEliteKills = state.sessionEliteKills,
        sessionBossKills = state.sessionBossKills,
        sessionDeaths = state.sessionDeaths,
        sessionCoinsEarned = state.sessionCoinsEarned,
        sessionGemsEarned = state.sessionGemsEarned,
        sessionWavesCleared = state.sessionWavesCleared,
        sessionDaysCleared = state.sessionDaysCleared,
        totalKills = state.totalKills + state.sessionKills,
        totalBossKills = state.totalBossKills + state.sessionBossKills,
        dailyChallengesComplete = state.dailyChallengesComplete,
    }
end

function CombatRewardsManager:GetDailyChallenges(player)
    local state = playerStates[player.UserId]
    if not state then return {} end
    assignDailyChallenges(state)

    local result = {}
    for _, challenge in ipairs(state.dailyChallenges) do
        table.insert(result, {
            id = challenge.id,
            description = challenge.desc,
            target = challenge.target,
            progress = state.dailyChallengeProgress[challenge.id] or 0,
            complete = (state.dailyChallengeProgress[challenge.id] or 0) >= challenge.target,
            coins = challenge.coins,
            gems = challenge.gems,
        })
    end
    return result
end

function CombatRewardsManager:GetSessionSummary(player)
    local state = playerStates[player.UserId]
    if not state then return nil end

    return {
        totalKills = state.sessionKills,
        totalCoins = state.sessionCoinsEarned,
        totalGems = state.sessionGemsEarned,
        totalXP = state.sessionXPEarned,
        highestCombo = state.highestCombo,
        bossesKilled = state.sessionBossKills,
        elitesKilled = state.sessionEliteKills,
        deaths = state.sessionDeaths,
        wavesCleared = state.sessionWavesCleared,
        daysCleared = state.sessionDaysCleared,
        dailyChallengesComplete = state.dailyChallengesComplete,
    }
end

function CombatRewardsManager:GetGamePassMultiplier(passId)
    return CONFIG.GAME_PASS_MULTS[passId] or { coinMult = 1.0, xpMult = 1.0, gemMult = 1.0 }
end

--------------------------------------------------------------------------------
-- INITIALIZATION (two patterns: constructor or :Init)
--------------------------------------------------------------------------------

-- Constructor pattern (used by CombatSystem.new)
function CombatRewardsManager.new(deps)
    local self = setmetatable({}, CombatRewardsManager)
    if deps then
        Deps.EconomyManager = deps.EconomyManager
        Deps.EnemyData = deps.EnemyData
        Deps.WeaponData = deps.WeaponData
        Deps.AnalyticsService = deps.AnalyticsService
        Deps.DayScaling = deps.DayScaling
        Deps.BattlePass = deps.BattlePass
        Deps.GachaManager = deps.GachaManager
        Deps.DataStoreV2 = deps.DataStoreV2
    end
    return self
end

-- Init pattern (standalone boot)
function CombatRewardsManager:Init(deps)
    if deps then
        Deps.EconomyManager = deps.EconomyManager
        Deps.EnemyData = deps.EnemyData
        Deps.WeaponData = deps.WeaponData
        Deps.BattlePass = deps.BattlePass
        Deps.GachaManager = deps.GachaManager
        Deps.AnalyticsService = deps.AnalyticsService
        Deps.AnomalyDetector = deps.AnomalyDetector
        Deps.DataStoreV2 = deps.DataStoreV2
        Deps.DayScaling = deps.DayScaling
    end

    local remotes = ReplicatedStorage:FindFirstChild("GameRemotes")
    if remotes and not remotes:FindFirstChild("CombatReward") then
        local ev = Instance.new("RemoteEvent")
        ev.Name = "CombatReward"
        ev.Parent = remotes
    end

    print("==================================================")
    print("  CombatRewardsManager v2.0 - Combat Reward Engine")
    print("  Kills, Combos, Waves, Bosses, Dailies, Death")
    print("  ZERO ESL | Pure Combat | MAKE MONEY")
    print("==================================================")

    return true
end

--------------------------------------------------------------------------------
-- PERIODIC SAVE
--------------------------------------------------------------------------------

function CombatRewardsManager:SaveAll()
    for _, player in ipairs(Players:GetPlayers()) do
        pcall(function()
            local state = playerStates[player.UserId]
            if state and Deps.DataStoreV2 and Deps.DataStoreV2.SetPlayerField then
                Deps.DataStoreV2.SetPlayerField(player, "combat_rewards_v1", {
                    totalKills = state.totalKills + state.sessionKills,
                    totalCoinsEarned = state.totalCoinsEarned + state.sessionCoinsEarned,
                    totalGemsEarned = state.totalGemsEarned + state.sessionGemsEarned,
                    totalBossKills = state.totalBossKills + state.sessionBossKills,
                    totalDeaths = state.totalDeaths + state.sessionDeaths,
                    totalDaysCleared = state.totalDaysCleared + state.sessionDaysCleared,
                    totalWavesCleared = state.totalWavesCleared + state.sessionWavesCleared,
                    gachaKillAccumulator = state.gachaKillAccumulator,
                })
            end
        end)
    end
end

return CombatRewardsManager
