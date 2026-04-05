--[[
	CombatRewardsManager.lua v1.0
	Game: Survive a Brainrot
	Replaces: EnglishRewardsManager.lua (ESL rewards bridge)

	Purpose: Distribute coins, gems, and post-kill bonuses for
	         combat actions. No ESL/English references anywhere.

	Reward tables (per spec):
	  Skibidi Zombie      10 coins
	  Elite (Rare spawn)  50 coins + 1 gem
	  Boss               200 coins + 5 gems
	  Wave clear          25 coins bonus per player

	Combo multipliers applied to all coin drops (from CombatSystem).

	Connects:
	  CombatSystem    -> OnEnemyKilled, OnWaveClear
	  EconomyManager  -> AddCurrency
	  GachaManager    -> TriggerBossGacha (post-boss spin)
	  BattlePass      -> NotifyKill (challenge progress)
	  AnalyticsService-> TrackEvent

	Architecture: ModuleScript (ServerStorage)
	Boot order: after EconomyManager, before CombatSystem
	Version: 1.0.0
	Date: 2026-03-28
]]

local ServerStorage = game:GetService("ServerStorage")

local CombatRewardsManager = {}

------------------------------------------------------------------------
-- DEPENDENCIES (lazy-loaded via Init)
------------------------------------------------------------------------

local EconomyManager   = nil
local GachaManager     = nil
local BattlePass       = nil
local AnalyticsService = nil

------------------------------------------------------------------------
-- REWARD CONFIG
------------------------------------------------------------------------

local REWARDS = {
	-- Base coin rewards per enemy type
	enemyCoins = {
		skibidi_zombie    = 10,
		ohio_anomaly      = 15,
		rizz_merchant     = 25,
		brainrot_mutant   = 35,
	},

	-- Boss rewards
	bossCoins = 200,
	bossGems  = 5,

	-- Elite (Rare enemy) bonus
	eliteThreshold = 50, -- coins >= this = elite bonus
	eliteGems      = 1,

	-- Wave clear bonus per player
	waveClearCoins = 25,

	-- Boss phase multipliers (each successive boss day is worth more)
	-- Applied on top of base boss reward
	bossDayMultiplier = 0.05, -- +5% per boss day number (Day 22 boss = 1.1x, Day 99 = ~4.5x)
}

------------------------------------------------------------------------
-- ANALYTICS HELPER
------------------------------------------------------------------------

local function trackEvent(eventName, data)
	if AnalyticsService and type(AnalyticsService.TrackEvent) == "function" then
		pcall(AnalyticsService.TrackEvent, eventName, data)
	end
end

------------------------------------------------------------------------
-- ECONOMY HELPER
------------------------------------------------------------------------

local function addCoins(player, amount)
	if not player or amount <= 0 then return end
	if EconomyManager and type(EconomyManager.AddCurrency) == "function" then
		pcall(EconomyManager.AddCurrency, player, "Coins", amount)
	end
end

local function addGems(player, amount)
	if not player or amount <= 0 then return end
	if EconomyManager and type(EconomyManager.AddCurrency) == "function" then
		pcall(EconomyManager.AddCurrency, player, "Gems", amount)
	end
end

------------------------------------------------------------------------
-- BATTLE PASS NOTIFICATION
------------------------------------------------------------------------

local function notifyBattlePass(player, eventType, data)
	if BattlePass and type(BattlePass.NotifyKill) == "function" and eventType == "kill" then
		pcall(BattlePass.NotifyKill, player, data)
	end
end

------------------------------------------------------------------------
-- ON ENEMY DEFEATED (called by CombatSystem._defeatEnemy)
--
-- data = {
--   enemyId   : string  -- e.g. "skibidi_zombie"
--   isBoss    : bool
--   dayNumber : number
--   comboMult : number  -- from CombatSystem combo counter
-- }
------------------------------------------------------------------------

function CombatRewardsManager.OnEnemyKilled(player, data)
	if not player or type(data) ~= "table" then return end

	local enemyId   = data.enemyId   or "skibidi_zombie"
	local isBoss    = data.isBoss    or false
	local dayNumber = data.dayNumber or 1
	local comboMult = data.comboMult or 1.0

	local coins = 0
	local gems  = 0

	if isBoss then
		-- Boss reward: scales by boss number (Day 11=1st boss=1.05x, Day 22=2nd=1.1x, etc.)
		local bossNumber = math.floor(dayNumber / 11)
		local bossMult   = 1 + (bossNumber * REWARDS.bossDayMultiplier)
		coins = math.floor(REWARDS.bossCoins * bossMult * comboMult)
		gems  = REWARDS.bossGems

		-- Trigger boss gacha spin via GachaManager
		if GachaManager and type(GachaManager.TriggerBossGacha) == "function" then
			pcall(GachaManager.TriggerBossGacha, player, { bossId = enemyId, day = dayNumber })
		end

	else
		-- Standard enemy reward
		local base = REWARDS.enemyCoins[enemyId] or 10
		coins = math.floor(base * comboMult)

		-- Elite bonus: if base reward >= elite threshold, award a gem
		if base >= REWARDS.eliteThreshold then
			gems = REWARDS.eliteGems
		end
	end

	addCoins(player, coins)
	if gems > 0 then addGems(player, gems) end

	-- Battle Pass progress
	notifyBattlePass(player, "kill", {
		enemyId   = enemyId,
		isBoss    = isBoss,
		dayNumber = dayNumber,
	})

	-- Analytics
	trackEvent("EnemyRewarded", {
		player    = player.Name,
		enemyId   = enemyId,
		isBoss    = isBoss,
		day       = dayNumber,
		coins     = coins,
		gems      = gems,
		comboMult = comboMult,
	})
end

------------------------------------------------------------------------
-- ON WAVE CLEAR (called by CombatSystem.OnWaveClear)
------------------------------------------------------------------------

function CombatRewardsManager.OnWaveClear(dayNumber, waveNumber)
	local Players = game:GetService("Players")
	local allPlayers = Players:GetPlayers()

	for _, player in ipairs(allPlayers) do
		addCoins(player, REWARDS.waveClearCoins)
	end

	trackEvent("WaveCleared", {
		day       = dayNumber,
		wave      = waveNumber,
		players   = #allPlayers,
		coinsEach = REWARDS.waveClearCoins,
	})
end

------------------------------------------------------------------------
-- PLAYER JOIN / LEAVE (boot contract)
------------------------------------------------------------------------

function CombatRewardsManager.OnPlayerJoin(player)
	-- No per-session state needed; rewards are stateless per event.
	trackEvent("SessionStart", { player = player.Name })
end

function CombatRewardsManager.OnPlayerLeave(player)
	trackEvent("SessionEnd", { player = player.Name })
end

------------------------------------------------------------------------
-- INIT
------------------------------------------------------------------------

function CombatRewardsManager.Init()
	local function tryRequire(name)
		local m = ServerStorage:FindFirstChild(name)
		if not m then return nil end
		local ok, result = pcall(require, m)
		return ok and result or nil
	end

	EconomyManager   = tryRequire("EconomyManager")
	GachaManager     = tryRequire("GachaManager")
	BattlePass       = tryRequire("BattlePass")
	AnalyticsService = tryRequire("AnalyticsService")

	print("[CombatRewardsManager] v1.0 ready.")
	return true
end

return CombatRewardsManager
