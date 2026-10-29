--[[
	EnemyData.lua v1.0 — Enemy Types, Stats & Scaling Registry
	Replaces: QuestionBankV2.lua (ESL grammar bank → enemy data)
	Purpose: Single source of truth for ALL enemy types, stats, scaling, spawn weights.
	Used by: CombatSystem, WaveManager, EnemyFactory, AnalyticsService, HUDController
	Architecture: Server-authoritative. Client reads display data only.
	Generated: 2026-03-28 Run 85 | Source: COMBAT-REPLACEMENT-SPEC.md + GAME-BIBLE-HUMAN-READABLE.md
	Platform Death Test: PASS (pure data module, no logic dependencies)
]]

local EnemyData = {}

-------------------------------------------------------------------------------
-- ENEMY TYPE ENUM
-------------------------------------------------------------------------------
EnemyData.Type = {
	SkibidiZombie  = "SkibidiZombie",
	OhioAnomaly    = "OhioAnomaly",
	RizzMerchant   = "RizzMerchant",
	BrainrotMutant = "BrainrotMutant",
	SigmaBoss      = "SigmaBoss",
}

-------------------------------------------------------------------------------
-- BASE ENEMY DEFINITIONS
-- These are Day 1 base stats. Actual stats = base * dayScaling multiplier.
-------------------------------------------------------------------------------
EnemyData.Enemies = {
	{
		id           = "skibidi_zombie",
		type         = "SkibidiZombie",
		name         = "Skibidi Zombie",
		emoji        = "\xF0\x9F\xA7\x9F",
		description  = "The basic shuffler. Toilet head. Weak alone, deadly in hordes.",
		baseHP       = 30,
		baseDamage   = 5,
		baseSpeed    = 8,  -- studs/sec (WalkSpeed)
		attackRange  = 5,  -- studs
		attackRate   = 1.0, -- attacks/sec
		spawnWeight  = 40,  -- % of standard spawn pool
		xpReward     = 10,
		coinReward   = 10,
		gemChance    = 0,   -- % chance to drop 1 gem
		specialAbility = nil,
		codexEntry   = "A single Shambler is a joke. A horde of them is a funeral.",
	},
	{
		id           = "ohio_anomaly",
		type         = "OhioAnomaly",
		name         = "Ohio Anomaly",
		emoji        = "\xE2\x9A\xA1",
		description  = "Erratic zigzag movement. Fast but fragile. Only in Ohio.",
		baseHP       = 20,
		baseDamage   = 8,
		baseSpeed    = 18,
		attackRange  = 4,
		attackRate   = 1.5,
		spawnWeight  = 25,
		xpReward     = 15,
		coinReward   = 15,
		gemChance    = 0,
		specialAbility = "Zigzag",  -- erratic movement pattern
		codexEntry   = "Only in Ohio. Impossible to predict. Fast but one good hit drops it.",
	},
	{
		id           = "rizz_merchant",
		type         = "RizzMerchant",
		name         = "Rizz Merchant",
		emoji        = "\xF0\x9F\x92\x96",
		description  = "Healer. Charms nearby enemies, healing them. Kill first to break the aura.",
		baseHP       = 40,
		baseDamage   = 3,
		baseSpeed    = 10,
		attackRange  = 6,
		attackRate   = 0.8,
		spawnWeight  = 15,
		xpReward     = 25,
		coinReward   = 25,
		gemChance    = 5,
		specialAbility = "HealAura",  -- heals nearby enemies 3hp/sec in 10-stud radius
		healAuraRadius  = 10,
		healAuraRate    = 3,  -- hp/sec healed to nearby allies
		codexEntry   = "The Rizz Merchant doesn't fight — it keeps everyone else alive. Kill it first.",
	},
	{
		id           = "brainrot_mutant",
		type         = "BrainrotMutant",
		name         = "Brainrot Mutant",
		emoji        = "\xF0\x9F\xA7\xAC",
		description  = "Splits into 2 mini-mutants on death. Maximum brainrot.",
		baseHP       = 60,
		baseDamage   = 12,
		baseSpeed    = 10,
		attackRange  = 6,
		attackRate   = 0.7,
		spawnWeight  = 10,
		xpReward     = 35,
		coinReward   = 35,
		gemChance    = 8,
		specialAbility = "Split",  -- splits into 2 mini-mutants on death
		splitCount     = 2,
		splitHPRatio   = 0.4,  -- each mini-mutant has 40% of parent HP
		splitDmgRatio  = 0.5,  -- each mini-mutant has 50% of parent damage
		codexEntry   = "You killed it? Good. Now kill the two smaller ones it just became.",
	},
}

-------------------------------------------------------------------------------
-- BOSS DEFINITIONS
-- Bosses appear on Day 11, 22, 33, 44, 55, 66, 77, 88, 99
-------------------------------------------------------------------------------
EnemyData.Bosses = {
	{
		id              = "sigma_boss_standard",
		type            = "SigmaBoss",
		name            = "Sigma Boss",
		emoji           = "\xF0\x9F\x92\x80",
		description     = "BOSS. Telegraphed attacks, parry window, damage phase. Exclusive drops.",
		baseHP          = 200,
		baseDamage      = 20,
		baseSpeed       = 6,
		attackRange     = 8,
		xpReward        = 200,
		coinReward      = 200,
		gemReward       = 5,
		codexEntry      = "The Sigma Boss doesn't negotiate. Dodge. Parry. Strike. Or die.",

		-- Boss-specific fields
		telegraphTime   = 1.5,  -- seconds of wind-up animation
		stunDuration    = 3.0,  -- seconds stunned after successful parry
		parryWindow     = 0.5,  -- seconds (same as Combat Warriors)
		enrageTimer     = 120,  -- seconds until enrage (can't kite forever)
		enrageDmgMult   = 1.5,  -- damage multiplier when enraged
		enrageSpeedMult = 1.3,  -- speed multiplier when enraged
		playerHPScale   = 0.5,  -- additional HP per extra player (e.g. 5 players = base * (1 + 4*0.5) = 3x HP)

		-- Attack patterns (ordered sequence, loops)
		attackPatterns = {
			{
				name   = "GroundSlam",
				type   = "AoE",
				damage = 25,
				radius = 12,
				parryable = true,
			},
			{
				name   = "Charge",
				type   = "Linear",
				damage = 30,
				range  = 30,
				parryable = true,
			},
			{
				name   = "ProjectileBarrage",
				type   = "Ranged",
				damage = 15,
				count  = 5,
				parryable = false,  -- must dodge
			},
		},
	},
	{
		id              = "baron_skibidi",
		type            = "SigmaBoss",
		name            = "Baron Skibidi",
		emoji           = "\xF0\x9F\x91\x91",
		description     = "RIZZLORD TIER. Rules the Rusted Depot. Three attacks. No mercy.",
		baseHP          = 2500,
		baseDamage      = 50,
		baseSpeed       = 10,
		attackRange     = 10,
		xpReward        = 500,
		coinReward      = 500,
		gemReward       = 15,
		codexEntry      = "Baron Skibidi rules the Rusted Depot. Three attacks. No mercy.",
		telegraphTime   = 1.5,
		stunDuration    = 3.0,
		parryWindow     = 0.5,
		enrageTimer     = 180,
		enrageDmgMult   = 2.0,
		enrageSpeedMult = 1.5,
		playerHPScale   = 0.5,
		attackPatterns = {
			{ name = "Charge",       type = "Linear",  damage = 60, range = 30, parryable = true },
			{ name = "GroundStomp",  type = "AoE",     damage = 40, radius = 15, parryable = true },
			{ name = "Summon",       type = "Summon",   summonType = "skibidi_zombie", summonCount = 4, parryable = false },
		},
	},
}

-------------------------------------------------------------------------------
-- DAY SCALING
-- Multipliers applied to base stats per day. Linear + step increases.
-- Formula: stat = baseStat * (1 + (dayNumber - 1) * scalingRate)
-- Plus phase multipliers at difficulty thresholds
-------------------------------------------------------------------------------
EnemyData.DayScaling = {
	-- Per-day linear scaling rates
	hpScalePerDay     = 0.03,   -- +3% HP per day
	damageScalePerDay = 0.02,   -- +2% damage per day
	speedScalePerDay  = 0.005,  -- +0.5% speed per day (subtle)

	-- Phase multipliers (applied ON TOP of linear scaling)
	phaseMultipliers = {
		{ dayStart = 1,  dayEnd = 5,  hpMult = 1.0, dmgMult = 1.0, label = "Tutorial" },
		{ dayStart = 6,  dayEnd = 15, hpMult = 1.0, dmgMult = 1.0, label = "Early" },
		{ dayStart = 16, dayEnd = 30, hpMult = 1.3, dmgMult = 1.2, label = "Mid" },
		{ dayStart = 31, dayEnd = 50, hpMult = 1.6, dmgMult = 1.4, label = "Hard" },
		{ dayStart = 51, dayEnd = 75, hpMult = 2.0, dmgMult = 1.7, label = "Hell" },
		{ dayStart = 76, dayEnd = 99, hpMult = 2.5, dmgMult = 2.0, label = "Endgame" },
	},

	-- Spawn count scaling
	baseSpawnCount      = 4,    -- enemies per wave on Day 1
	maxSpawnCount       = 12,   -- hard cap (performance budget)
	spawnCountPerDay    = 0.1,  -- +0.1 enemies per day (Day 50 = ~9 enemies)

	-- Boss HP scaling per day
	bossHPScalePerDay   = 0.05, -- +5% boss HP per day appearance

	-- Wave count per day
	baseWavesPerDay     = 3,
	maxWavesPerDay      = 8,
	wavesPerDayScale    = 0.05, -- +0.05 waves/day
}

-- Boss days (every 11th day)
EnemyData.BossDays = { 11, 22, 33, 44, 55, 66, 77, 88, 99 }

-------------------------------------------------------------------------------
-- SPAWN WEIGHTS BY PHASE
-- Different enemy mix as difficulty increases
-------------------------------------------------------------------------------
EnemyData.SpawnWeightsByPhase = {
	Tutorial = {
		SkibidiZombie  = 80,
		OhioAnomaly    = 20,
		RizzMerchant   = 0,
		BrainrotMutant = 0,
	},
	Early = {
		SkibidiZombie  = 50,
		OhioAnomaly    = 30,
		RizzMerchant   = 15,
		BrainrotMutant = 5,
	},
	Mid = {
		SkibidiZombie  = 40,
		OhioAnomaly    = 25,
		RizzMerchant   = 20,
		BrainrotMutant = 15,
	},
	Hard = {
		SkibidiZombie  = 30,
		OhioAnomaly    = 25,
		RizzMerchant   = 20,
		BrainrotMutant = 25,
	},
	Hell = {
		SkibidiZombie  = 25,
		OhioAnomaly    = 25,
		RizzMerchant   = 25,
		BrainrotMutant = 25,
	},
	Endgame = {
		SkibidiZombie  = 20,
		OhioAnomaly    = 25,
		RizzMerchant   = 25,
		BrainrotMutant = 30,
	},
}

-------------------------------------------------------------------------------
-- REWARD SCALING
-- Coin/XP rewards scale with day for inflation control
-------------------------------------------------------------------------------
EnemyData.RewardScaling = {
	coinScalePerDay = 0.01,  -- +1% coins per day
	xpScalePerDay   = 0.02,  -- +2% XP per day (encourages progression)
	gemScalePerDay  = 0.005, -- gem chance increases slowly

	-- Combo multiplier (consecutive kills without taking damage)
	comboMultiplier = {
		[5]  = 1.5,  -- 5-kill combo = 1.5x coins
		[10] = 2.0,  -- 10-kill = 2x
		[15] = 2.5,  -- 15-kill = 2.5x
		[20] = 3.0,  -- 20-kill = 3x
		[30] = 4.0,  -- 30-kill = 4x (rare)
		[50] = 5.0,  -- 50-kill = 5x (god mode)
	},
}

-------------------------------------------------------------------------------
-- UTILITY FUNCTIONS
-------------------------------------------------------------------------------
local _enemyById = {}
local _bossById = {}

local function _buildIndex()
	for _, e in ipairs(EnemyData.Enemies) do
		_enemyById[e.id] = e
	end
	for _, b in ipairs(EnemyData.Bosses) do
		_bossById[b.id] = b
	end
end

_buildIndex()

--- Get enemy definition by ID
function EnemyData.GetEnemy(enemyId: string)
	return _enemyById[enemyId] or _bossById[enemyId]
end

--- Get boss definition by ID
function EnemyData.GetBoss(bossId: string)
	return _bossById[bossId]
end

--- Is this day a boss day?
function EnemyData.IsBossDay(dayNumber: number): boolean
	for _, d in ipairs(EnemyData.BossDays) do
		if d == dayNumber then return true end
	end
	return false
end

--- Get the current phase label for a day
function EnemyData.GetPhaseForDay(dayNumber: number): string
	for _, phase in ipairs(EnemyData.DayScaling.phaseMultipliers) do
		if dayNumber >= phase.dayStart and dayNumber <= phase.dayEnd then
			return phase.label
		end
	end
	return "Endgame"
end

--- Calculate scaled HP for an enemy on a given day
function EnemyData.GetScaledHP(enemyId: string, dayNumber: number): number
	local e = _enemyById[enemyId]
	if not e then return 0 end
	local linearScale = 1 + (dayNumber - 1) * EnemyData.DayScaling.hpScalePerDay
	local phaseMult = 1.0
	for _, phase in ipairs(EnemyData.DayScaling.phaseMultipliers) do
		if dayNumber >= phase.dayStart and dayNumber <= phase.dayEnd then
			phaseMult = phase.hpMult
			break
		end
	end
	return math.floor(e.baseHP * linearScale * phaseMult)
end

--- Calculate scaled damage for an enemy on a given day
function EnemyData.GetScaledDamage(enemyId: string, dayNumber: number): number
	local e = _enemyById[enemyId]
	if not e then return 0 end
	local linearScale = 1 + (dayNumber - 1) * EnemyData.DayScaling.damageScalePerDay
	local phaseMult = 1.0
	for _, phase in ipairs(EnemyData.DayScaling.phaseMultipliers) do
		if dayNumber >= phase.dayStart and dayNumber <= phase.dayEnd then
			phaseMult = phase.dmgMult
			break
		end
	end
	return math.floor(e.baseDamage * linearScale * phaseMult)
end

--- Calculate boss HP for a given day with player scaling
function EnemyData.GetBossHP(bossId: string, dayNumber: number, playerCount: number): number
	local b = _bossById[bossId]
	if not b then return 0 end
	local dayScale = 1 + (dayNumber - 1) * EnemyData.DayScaling.bossHPScalePerDay
	local playerScale = 1 + (math.max(playerCount, 1) - 1) * b.playerHPScale
	return math.floor(b.baseHP * dayScale * playerScale)
end

--- Get spawn count for a day (capped at maxSpawnCount)
function EnemyData.GetSpawnCount(dayNumber: number): number
	local scaling = EnemyData.DayScaling
	local count = scaling.baseSpawnCount + (dayNumber - 1) * scaling.spawnCountPerDay
	return math.min(math.floor(count), scaling.maxSpawnCount)
end

--- Get waves per day
function EnemyData.GetWavesPerDay(dayNumber: number): number
	local scaling = EnemyData.DayScaling
	local waves = scaling.baseWavesPerDay + (dayNumber - 1) * scaling.wavesPerDayScale
	return math.min(math.floor(waves), scaling.maxWavesPerDay)
end

--- Get spawn weights for a day (returns table of enemy type → weight)
function EnemyData.GetSpawnWeights(dayNumber: number)
	local phase = EnemyData.GetPhaseForDay(dayNumber)
	return EnemyData.SpawnWeightsByPhase[phase] or EnemyData.SpawnWeightsByPhase["Endgame"]
end

--- Get combo multiplier for a kill streak count
function EnemyData.GetComboMultiplier(comboCount: number): number
	local best = 1.0
	for threshold, mult in pairs(EnemyData.RewardScaling.comboMultiplier) do
		if comboCount >= threshold and mult > best then
			best = mult
		end
	end
	return best
end

--- Get scaled coin reward for an enemy kill on a given day with combo
function EnemyData.GetCoinReward(enemyId: string, dayNumber: number, comboCount: number): number
	local e = _enemyById[enemyId]
	if not e then return 0 end
	local dayScale = 1 + (dayNumber - 1) * EnemyData.RewardScaling.coinScalePerDay
	local comboMult = EnemyData.GetComboMultiplier(comboCount or 0)
	return math.floor(e.coinReward * dayScale * comboMult)
end

return EnemyData
