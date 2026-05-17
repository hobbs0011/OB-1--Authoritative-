--[[
    DayScaling.lua — REPLACES DifficultyTiers
    99-day difficulty curve, phase management, wave configuration, biome transitions
    Train-67: Survive a Brainrot
    Server module
    
    ZERO ESL. Pure survival difficulty scaling.
]]

local DayScaling = {}

------------------------------------------------------
-- PHASE DEFINITIONS
------------------------------------------------------
DayScaling.Phases = {
    {
        name = "Tutorial",
        icon = "🟢",
        dayStart = 1,
        dayEnd = 5,
        biome = "Wasteland Plains",
        biomeStyle = "Flat, dry, open sightlines",
        specialMechanic = "Tutorial zone. Easy enemies. Learn dodge.",
        
        -- Enemy config for this phase
        enemyTypesActive = { "SkibidiZombie" },
        maxEnemiesOverride = nil, -- uses formula default
        
        -- Wave config
        wavesPerDay = 3,
        waveDurationSec = 60,
        restPhaseSec = 30, -- shop time between waves
        
        -- Monetization
        monetizationTrigger = nil, -- no pressure yet, pure hook
    },
    {
        name = "Early",
        icon = "🟢",
        dayStart = 6,
        dayEnd = 15,
        biome = "Wasteland Plains",
        biomeStyle = "Open with scattered cover",
        specialMechanic = "First depot stop. Ohio Anomaly appears.",
        
        enemyTypesActive = { "SkibidiZombie", "OhioAnomaly" },
        
        wavesPerDay = 4,
        waveDurationSec = 75,
        restPhaseSec = 25,
        
        monetizationTrigger = "First crate drops at Day 10. Show player what they COULD have.",
    },
    {
        name = "Mid",
        icon = "🟡",
        dayStart = 16,
        dayEnd = 30,
        biome = "Rusted City",
        biomeStyle = "Collapsed buildings, tight corridors",
        specialMechanic = "Ambush zones. Rizz Merchant appears. Throwables unlock.",
        
        enemyTypesActive = { "SkibidiZombie", "OhioAnomaly", "RizzMerchant" },
        
        wavesPerDay = 5,
        waveDurationSec = 90,
        restPhaseSec = 20,
        
        monetizationTrigger = "DIFFICULTY SPIKE Day 15. Players start dying. Revive offer triggers.",
    },
    {
        name = "Hard",
        icon = "🟠",
        dayStart = 31,
        dayEnd = 50,
        biome = "Toxic Swamp",
        biomeStyle = "Green fog, limited visibility",
        specialMechanic = "Poison zones. Brainrot Mutant appears. Armored elites.",
        
        enemyTypesActive = { "SkibidiZombie", "OhioAnomaly", "RizzMerchant", "BrainrotMutant" },
        
        wavesPerDay = 5,
        waveDurationSec = 105,
        restPhaseSec = 20,
        
        monetizationTrigger = "DIFFICULTY SPIKE Day 30. Gem purchases spike. Gacha feels necessary.",
        
        -- Environmental hazard
        hazard = {
            type = "POISON_ZONE",
            damagePerSec = 3,
            warningTime = 2.0,
            activeTime = 5.0,
            cooldown = 15.0,
        },
    },
    {
        name = "Hell",
        icon = "🔴",
        dayStart = 51,
        dayEnd = 75,
        biome = "Volcanic Rift",
        biomeStyle = "Lava flows, dark skies, fire",
        specialMechanic = "Environmental hazards. Elite mutations. Night variants.",
        
        enemyTypesActive = { "SkibidiZombie", "OhioAnomaly", "RizzMerchant", "BrainrotMutant" },
        
        wavesPerDay = 6,
        waveDurationSec = 120,
        restPhaseSec = 15,
        
        monetizationTrigger = "DIFFICULTY SPIKE Day 50. Premium players pull ahead. FOMO kicks in.",
        
        hazard = {
            type = "LAVA_FLOW",
            damagePerSec = 8,
            warningTime = 3.0,
            activeTime = 8.0,
            cooldown = 20.0,
        },
    },
    {
        name = "Endgame",
        icon = "🟣",
        dayStart = 76,
        dayEnd = 99,
        biome = "The Void",
        biomeStyle = "Neon, glitch effects, reality breaking",
        specialMechanic = "Max difficulty. Elite mutations common. Void-Touched enemies. RIZZLORD drops possible.",
        
        enemyTypesActive = { "SkibidiZombie", "OhioAnomaly", "RizzMerchant", "BrainrotMutant" },
        
        wavesPerDay = 7,
        waveDurationSec = 135,
        restPhaseSec = 15,
        
        monetizationTrigger = "Day 75 + Day 99 Final Boss. Maximum spend motivation.",
        
        hazard = {
            type = "VOID_RIFT",
            damagePerSec = 5,
            warningTime = 1.5,
            activeTime = 4.0,
            cooldown = 12.0,
            special = "TELEPORT_RANDOM", -- randomly teleports players
        },
    },
}

------------------------------------------------------
-- BOSS SCHEDULE
------------------------------------------------------
-- Boss every 11th day
DayScaling.BossDays = { 11, 22, 33, 44, 55, 66, 77, 88, 99 }

function DayScaling.IsBossDay(dayNumber)
    for _, d in ipairs(DayScaling.BossDays) do
        if d == dayNumber then return true end
    end
    return false
end

------------------------------------------------------
-- WAVE CONFIGURATION
------------------------------------------------------

function DayScaling.GetPhase(dayNumber)
    for _, phase in ipairs(DayScaling.Phases) do
        if dayNumber >= phase.dayStart and dayNumber <= phase.dayEnd then
            return phase
        end
    end
    return DayScaling.Phases[#DayScaling.Phases] -- default to last phase
end

function DayScaling.GetWaveConfig(dayNumber, waveIndex)
    local phase = DayScaling.GetPhase(dayNumber)
    
    -- Enemy count per wave scales within the day
    local baseEnemies = 4 + math.floor(dayNumber / 5) -- +1 every 5 days
    baseEnemies = math.min(baseEnemies, 12) -- hard cap
    
    -- Each wave within a day gets slightly harder
    local waveEscalation = 1.0 + (waveIndex - 1) * 0.1 -- +10% per wave
    local enemyCount = math.min(math.floor(baseEnemies * waveEscalation), 12)
    
    -- Spawn rate (seconds between spawns)
    local spawnInterval = math.max(0.5, 3.0 - (dayNumber * 0.02))
    
    return {
        phase = phase,
        dayNumber = dayNumber,
        waveIndex = waveIndex,
        totalWaves = phase.wavesPerDay,
        enemyCount = enemyCount,
        spawnInterval = spawnInterval,
        waveDuration = phase.waveDurationSec,
        restDuration = phase.restPhaseSec,
        isBossWave = DayScaling.IsBossDay(dayNumber) and waveIndex == phase.wavesPerDay,
        hazard = phase.hazard,
    }
end

------------------------------------------------------
-- DIFFICULTY MULTIPLIERS
------------------------------------------------------

-- Global difficulty multiplier that increases with day
function DayScaling.GetDifficultyMult(dayNumber)
    -- Smooth curve: starts at 1.0, reaches ~4.0 at day 99
    return 1.0 + (dayNumber - 1) * 0.03
end

-- Loot quality increases with difficulty
function DayScaling.GetLootQualityMult(dayNumber)
    -- Better loot at higher days incentivizes pushing further
    return 1.0 + (dayNumber - 1) * 0.01
end

-- XP multiplier (higher days = more XP per action)
function DayScaling.GetXPMult(dayNumber)
    return 1.0 + (dayNumber - 1) * 0.02
end

-- Coin multiplier (higher days = more coins)
function DayScaling.GetCoinMult(dayNumber)
    return 1.0 + (dayNumber - 1) * 0.015
end

------------------------------------------------------
-- DEPOT STOPS (Scavenge Missions)
------------------------------------------------------
DayScaling.DepotStops = {
    { day = 2,  name = "Rusted Depot",        timerSec = 300, fuelBarrels = 3, difficulty = 1 },
    { day = 8,  name = "Abandoned Station",    timerSec = 270, fuelBarrels = 3, difficulty = 2 },
    { day = 18, name = "City Ruins Depot",     timerSec = 240, fuelBarrels = 4, difficulty = 3 },
    { day = 28, name = "Swamp Crossing",       timerSec = 240, fuelBarrels = 4, difficulty = 4 },
    { day = 40, name = "Toxic Refinery",       timerSec = 210, fuelBarrels = 5, difficulty = 5 },
    { day = 55, name = "Volcanic Outpost",     timerSec = 210, fuelBarrels = 5, difficulty = 6 },
    { day = 70, name = "Rift Station",         timerSec = 180, fuelBarrels = 6, difficulty = 7 },
    { day = 85, name = "Void Terminal",        timerSec = 180, fuelBarrels = 6, difficulty = 8 },
    { day = 95, name = "Final Approach Depot", timerSec = 150, fuelBarrels = 7, difficulty = 9 },
}

function DayScaling.GetDepotForDay(dayNumber)
    for _, depot in ipairs(DayScaling.DepotStops) do
        if depot.day == dayNumber then
            return depot
        end
    end
    return nil
end

function DayScaling.IsDepotDay(dayNumber)
    return DayScaling.GetDepotForDay(dayNumber) ~= nil
end

------------------------------------------------------
-- SESSION MANAGEMENT
------------------------------------------------------

-- Average session target: 15-30 minutes (3-8 waves)
DayScaling.Session = {
    targetMinMinutes = 15,
    targetMaxMinutes = 30,
    saveOnWaveComplete = true, -- auto-save after each wave
    saveOnDayComplete = true,  -- auto-save after each day
    canResumeAtDay = true,     -- players can quit and resume at their current day
}

-- Estimated time per day (for session length prediction)
function DayScaling.EstimateMinutesPerDay(dayNumber)
    local phase = DayScaling.GetPhase(dayNumber)
    local waveTime = phase.wavesPerDay * (phase.waveDurationSec + phase.restPhaseSec)
    
    -- Add boss time if boss day (~3 minutes for boss fight)
    if DayScaling.IsBossDay(dayNumber) then
        waveTime = waveTime + 180
    end
    
    -- Add depot time if depot day
    local depot = DayScaling.GetDepotForDay(dayNumber)
    if depot then
        waveTime = waveTime + depot.timerSec
    end
    
    return waveTime / 60
end

------------------------------------------------------
-- PRESTIGE SCALING
------------------------------------------------------
-- Each prestige level adds modifiers to the difficulty
DayScaling.PrestigeModifiers = {
    enemyHPMult = 0.05,      -- +5% enemy HP per prestige level
    enemyDamageMult = 0.03,  -- +3% enemy damage per prestige level
    lootQualityMult = 0.02,  -- +2% better loot per prestige level
    coinBonusMult = 0.05,    -- +5% more coins per prestige level
    xpBonusMult = 0.03,      -- +3% more XP per prestige level
}

function DayScaling.GetPrestigeScaling(prestigeLevel)
    return {
        enemyHPMult = 1.0 + (prestigeLevel * DayScaling.PrestigeModifiers.enemyHPMult),
        enemyDamageMult = 1.0 + (prestigeLevel * DayScaling.PrestigeModifiers.enemyDamageMult),
        lootQualityMult = 1.0 + (prestigeLevel * DayScaling.PrestigeModifiers.lootQualityMult),
        coinBonusMult = 1.0 + (prestigeLevel * DayScaling.PrestigeModifiers.coinBonusMult),
        xpBonusMult = 1.0 + (prestigeLevel * DayScaling.PrestigeModifiers.xpBonusMult),
    }
end

------------------------------------------------------
-- NEW GAME+ RANDOM MODIFIERS (per prestige run)
------------------------------------------------------
DayScaling.NewGamePlusModifiers = {
    { name = "Glass Cannon",    description = "2x player damage, 2x enemy damage",    playerDamageMult = 2.0, enemyDamageMult = 2.0 },
    { name = "Bullet Hell",     description = "50% more enemies, 25% less HP each",   enemyCountMult = 1.5, enemyHPMult = 0.75 },
    { name = "Speed Demon",     description = "All enemies 30% faster",                enemySpeedMult = 1.3 },
    { name = "Treasure Hunter",  description = "2x loot quality, 50% fewer coins",    lootQualityMult = 2.0, coinMult = 0.5 },
    { name = "Iron Man",        description = "No revives. Die = restart day.",         noRevives = true },
    { name = "Brainrot Maximum",description = "All enemies can be elite. Double RNG.", eliteChanceMult = 3.0, mutationChanceMult = 2.0 },
}

function DayScaling.RollNewGamePlusModifier()
    return DayScaling.NewGamePlusModifiers[math.random(#DayScaling.NewGamePlusModifiers)]
end

return DayScaling
