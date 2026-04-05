--[[
	DayScaling.lua v1.0
	Game: Survive a Brainrot
	Replaces: DifficultyTiers.lua (ESL tier system)

	Purpose: Single source of truth for all 99-day progression.
	         Determines spawn counts, difficulty phases, boss days,
	         and monetization spike thresholds.

	6 Difficulty Phases:
	  Tutorial  (Days  1-5)  -- slow walkers, hook player
	  Early     (Days  6-15) -- faster, some runners
	  Mid       (Days 16-30) -- armored, spitters
	  Hard      (Days 31-50) -- brutes, mini-bosses
	  Hell      (Days 51-75) -- mutants, night specials
	  Endgame   (Days 76-99) -- max density, elite mutations

	Boss days: every 11th day (11,22,33,44,55,66,77,88,99)
	Spawn: starts at 4, +1 per 5 days, cap 12

	Used by: WaveManager, EnemyFactory, CombatSystem, EconomyManager,
	         MonetizationOrchestrator, WorldBoss
	Architecture: Pure data module (no Roblox service dependencies at load)
	Version: 1.0.0
	Date: 2026-03-28
]]

local DayScaling = {}

------------------------------------------------------------------------
-- PHASE DEFINITIONS
------------------------------------------------------------------------

DayScaling.Phases = {
	{
		name       = "Tutorial",
		dayStart   = 1,
		dayEnd     = 5,
		hpMult     = 1.0,
		dmgMult    = 1.0,
		speedMult  = 1.0,
		coinMult   = 1.0,
		-- Which enemy types are active (subset of full pool)
		EnemyMix   = { SkibidiZombie = 80, OhioAnomaly = 20 },
		monetizationSpike = false,
		notes      = "Hook the player. Easy kills, confidence building.",
	},
	{
		name       = "Early",
		dayStart   = 6,
		dayEnd     = 15,
		hpMult     = 1.0,
		dmgMult    = 1.0,
		speedMult  = 1.1,
		coinMult   = 1.0,
		EnemyMix   = { SkibidiZombie = 50, OhioAnomaly = 30, RizzMerchant = 15, BrainrotMutant = 5 },
		monetizationSpike = false,
		notes      = "First crate unlocks Day 10. Introduce special enemies.",
	},
	{
		name       = "Mid",
		dayStart   = 16,
		dayEnd     = 30,
		hpMult     = 1.3,
		dmgMult    = 1.2,
		speedMult  = 1.2,
		coinMult   = 1.1,
		EnemyMix   = { SkibidiZombie = 40, OhioAnomaly = 25, RizzMerchant = 20, BrainrotMutant = 15 },
		monetizationSpike = true, -- spike at Day 15 (see MonetizationSpikeDays)
		notes      = "First real difficulty wall. Day 15 frustration -> purchase.",
	},
	{
		name       = "Hard",
		dayStart   = 31,
		dayEnd     = 50,
		hpMult     = 1.6,
		dmgMult    = 1.4,
		speedMult  = 1.3,
		coinMult   = 1.2,
		EnemyMix   = { SkibidiZombie = 30, OhioAnomaly = 25, RizzMerchant = 20, BrainrotMutant = 25 },
		monetizationSpike = true, -- Day 30 spike
		notes      = "Brutes, mini-bosses. Day 30 wall. Tier 3 weapons needed.",
	},
	{
		name       = "Hell",
		dayStart   = 51,
		dayEnd     = 75,
		hpMult     = 2.0,
		dmgMult    = 1.7,
		speedMult  = 1.4,
		coinMult   = 1.5,
		EnemyMix   = { SkibidiZombie = 25, OhioAnomaly = 25, RizzMerchant = 25, BrainrotMutant = 25 },
		monetizationSpike = true, -- Day 50 spike
		notes      = "Night specials, mutations. Casual players hit wall here.",
	},
	{
		name       = "Endgame",
		dayStart   = 76,
		dayEnd     = 99,
		hpMult     = 2.5,
		dmgMult    = 2.0,
		speedMult  = 1.5,
		coinMult   = 2.0,
		EnemyMix   = { SkibidiZombie = 20, OhioAnomaly = 25, RizzMerchant = 25, BrainrotMutant = 30 },
		monetizationSpike = true, -- Day 75 + Day 99 Final Boss
		notes      = "Elite mutations. RIZZLORD drops. Day 99 Final Boss.",
	},
}

------------------------------------------------------------------------
-- BOSS DAYS
------------------------------------------------------------------------

DayScaling.BossDays = { 11, 22, 33, 44, 55, 66, 77, 88, 99 }

------------------------------------------------------------------------
-- SPAWN SCALING
------------------------------------------------------------------------

DayScaling.SpawnConfig = {
	baseCount      = 4,   -- enemies per wave on Day 1
	maxCount       = 12,  -- hard cap (performance: $100 Android target)
	growthPerDay   = 0.2, -- additive per day (+0.2 = 1 new enemy per 5 days)
}

-- Waves per day
DayScaling.WaveConfig = {
	baseWaves   = 3,
	maxWaves    = 8,
	growthRate  = 0.05, -- +0.05 waves per day
}

------------------------------------------------------------------------
-- LINEAR PER-DAY SCALING (applied before phase multiplier)
-- Formula: stat = enemyBase * (1 + (day-1) * rate) * phaseMult
--   enemyBase = enemy's baseHP/baseDamage/etc from EnemyData.lua
--   rate      = one of the fields below (e.g. hpPerDay = 0.03)
--   phaseMult = hpMult/dmgMult/etc from the matching Phases entry above
------------------------------------------------------------------------

DayScaling.LinearRates = {
	hpPerDay     = 0.03,  -- +3% HP per day
	dmgPerDay    = 0.02,  -- +2% damage per day
	speedPerDay  = 0.005, -- +0.5% speed per day
	coinPerDay   = 0.01,  -- +1% coin reward per day
}

------------------------------------------------------------------------
-- MONETIZATION SPIKE DAYS (for MonetizationOrchestrator triggers)
------------------------------------------------------------------------

DayScaling.MonetizationSpikeDays = { 15, 30, 50, 75, 99 }

------------------------------------------------------------------------
-- UTILITY FUNCTIONS
------------------------------------------------------------------------

--- Get the phase table for a given day number.
function DayScaling.GetPhase(dayNumber)
	for _, phase in ipairs(DayScaling.Phases) do
		if dayNumber >= phase.dayStart and dayNumber <= phase.dayEnd then
			return phase
		end
	end
	return DayScaling.Phases[#DayScaling.Phases] -- fallback to Endgame
end

--- Get phase name string for a day.
function DayScaling.GetPhaseName(dayNumber)
	local phase = DayScaling.GetPhase(dayNumber)
	return phase and phase.name or "Endgame"
end

--- Is this day a boss day?
function DayScaling.IsBossDay(dayNumber)
	for _, d in ipairs(DayScaling.BossDays) do
		if d == dayNumber then return true end
	end
	return false
end

--- Get boss index (1st boss = 1, 2nd boss = 2, ..., Day 99 = 9)
function DayScaling.GetBossIndex(dayNumber)
	for i, d in ipairs(DayScaling.BossDays) do
		if d == dayNumber then return i end
	end
	return nil
end

--- Get spawn count for a day (capped at maxCount).
function DayScaling.GetSpawnCount(dayNumber)
	local cfg   = DayScaling.SpawnConfig
	local count = cfg.baseCount + (dayNumber - 1) * cfg.growthPerDay
	return math.min(math.floor(count), cfg.maxCount)
end

--- Get waves per day.
function DayScaling.GetWavesPerDay(dayNumber)
	local cfg  = DayScaling.WaveConfig
	local waves = cfg.baseWaves + (dayNumber - 1) * cfg.growthRate
	return math.min(math.floor(waves), cfg.maxWaves)
end

--- Get HP multiplier for an enemy on a given day.
function DayScaling.GetHPMult(dayNumber)
	local linear = 1 + (dayNumber - 1) * DayScaling.LinearRates.hpPerDay
	local phase  = DayScaling.GetPhase(dayNumber)
	return linear * (phase and phase.hpMult or 1.0)
end

--- Get damage multiplier for an enemy on a given day.
function DayScaling.GetDamageMult(dayNumber)
	local linear = 1 + (dayNumber - 1) * DayScaling.LinearRates.dmgPerDay
	local phase  = DayScaling.GetPhase(dayNumber)
	return linear * (phase and phase.dmgMult or 1.0)
end

--- Get speed multiplier for an enemy on a given day.
function DayScaling.GetSpeedMult(dayNumber)
	local linear = 1 + (dayNumber - 1) * DayScaling.LinearRates.speedPerDay
	local phase  = DayScaling.GetPhase(dayNumber)
	return linear * (phase and phase.speedMult or 1.0)
end

--- Get coin reward multiplier for a given day.
function DayScaling.GetCoinMult(dayNumber)
	local linear = 1 + (dayNumber - 1) * DayScaling.LinearRates.coinPerDay
	local phase  = DayScaling.GetPhase(dayNumber)
	return linear * (phase and phase.coinMult or 1.0)
end

--- Get enemy spawn weight table for a day (returned as a raw table).
function DayScaling.GetEnemyMix(dayNumber)
	local phase = DayScaling.GetPhase(dayNumber)
	return phase and phase.EnemyMix or { SkibidiZombie = 100 }
end

--- Is this day a monetization spike day?
function DayScaling.IsMonetizationSpike(dayNumber)
	for _, d in ipairs(DayScaling.MonetizationSpikeDays) do
		if d == dayNumber then return true end
	end
	return false
end

--- Summarise the full scaling context for a day (used by WaveManager).
function DayScaling.GetDayContext(dayNumber)
	local phase   = DayScaling.GetPhase(dayNumber)
	return {
		day             = dayNumber,
		phase           = phase.name,
		isBossDay       = DayScaling.IsBossDay(dayNumber),
		bossIndex       = DayScaling.GetBossIndex(dayNumber),
		spawnCount      = DayScaling.GetSpawnCount(dayNumber),
		wavesPerDay     = DayScaling.GetWavesPerDay(dayNumber),
		hpMult          = DayScaling.GetHPMult(dayNumber),
		damageMult      = DayScaling.GetDamageMult(dayNumber),
		speedMult       = DayScaling.GetSpeedMult(dayNumber),
		coinMult        = DayScaling.GetCoinMult(dayNumber),
		enemyMix        = DayScaling.GetEnemyMix(dayNumber),
		monetizationSpike = DayScaling.IsMonetizationSpike(dayNumber),
	}
end

return DayScaling
