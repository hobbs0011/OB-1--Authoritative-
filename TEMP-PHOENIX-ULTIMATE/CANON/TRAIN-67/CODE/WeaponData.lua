--[[
	WeaponData.lua v1.0 — Weapon Stats & Rarity Registry
	Replaces: QuestionBank.lua (ESL vocab bank → weapon data)
	Purpose: Single source of truth for ALL weapon stats, rarities, abilities.
	Used by: CombatSystem, GachaManager, EconomyManager, HUDController, CosmeticController
	Architecture: Server-authoritative. Client reads display data only.
	Generated: 2026-03-28 Run 85 | Source: COMBAT-REPLACEMENT-SPEC.md + GAME-BIBLE-HUMAN-READABLE.md
	Platform Death Test: PASS (pure data module, no logic dependencies)
]]

local WeaponData = {}

-------------------------------------------------------------------------------
-- RARITY TIERS
-- Global rarity system shared across weapons, pets, auras, skins, loot
-------------------------------------------------------------------------------
WeaponData.Rarity = {
	Common     = { tier = 1, name = "Common",     color = Color3.fromRGB(200, 200, 200), dropRate = 0.45, powerMult = 1.0, label = "⚪" },
	Uncommon   = { tier = 2, name = "Uncommon",   color = Color3.fromRGB(76, 175, 80),   dropRate = 0.30, powerMult = 1.3, label = "🟢" },
	Rare       = { tier = 3, name = "Rare",       color = Color3.fromRGB(33, 150, 243),  dropRate = 0.15, powerMult = 1.6, label = "🔵" },
	Epic       = { tier = 4, name = "Epic",       color = Color3.fromRGB(168, 85, 247),  dropRate = 0.07, powerMult = 2.0, label = "🟣" },
	Legendary  = { tier = 5, name = "Legendary",  color = Color3.fromRGB(245, 158, 11),  dropRate = 0.025, powerMult = 2.5, label = "🟠" },
	Rizzlord   = { tier = 6, name = "RIZZLORD",   color = Color3.fromRGB(239, 68, 68),   dropRate = 0.005, powerMult = 3.0, label = "🔴" },
}

-- Ordered list for iteration
WeaponData.RarityOrder = { "Common", "Uncommon", "Rare", "Epic", "Legendary", "Rizzlord" }

-------------------------------------------------------------------------------
-- WEAPON TYPES
-------------------------------------------------------------------------------
WeaponData.WeaponType = {
	Melee     = "Melee",
	Ranged    = "Ranged",
	Throwable = "Throwable",
}

-------------------------------------------------------------------------------
-- SPEED TIERS (attacks per second reference)
-------------------------------------------------------------------------------
WeaponData.SpeedTier = {
	VerySlow  = { name = "Very Slow",  attacksPerSec = 0.5,  label = "Very Slow" },
	Slow      = { name = "Slow",       attacksPerSec = 0.8,  label = "Slow" },
	Medium    = { name = "Medium",     attacksPerSec = 1.2,  label = "Medium" },
	Fast      = { name = "Fast",       attacksPerSec = 1.8,  label = "Fast" },
	VeryFast  = { name = "Very Fast",  attacksPerSec = 2.5,  label = "Very Fast" },
}

-------------------------------------------------------------------------------
-- ABILITY COOLDOWNS (by rarity — Rare+ weapons have abilities)
-------------------------------------------------------------------------------
WeaponData.AbilityCooldown = {
	Rare      = 8,   -- seconds
	Epic      = 12,
	Legendary = 15,
	Rizzlord  = 20,
}

-------------------------------------------------------------------------------
-- MELEE WEAPONS
-- Fields: id, name, rarity, damage, speed, range (studs), ability, abilityDesc,
--         knockback, comboHits, source (how to obtain), dayUnlock
-------------------------------------------------------------------------------
WeaponData.Melee = {
	{
		id          = "melee_rusty_pipe",
		name        = "Rusty Pipe",
		rarity      = "Common",
		damage      = 10,
		speed       = "Fast",
		range       = 6,
		ability     = nil,
		abilityDesc = nil,
		knockback   = 5,
		comboHits   = 3,
		source      = "Starter",
		dayUnlock   = 1,
	},
	{
		id          = "melee_wooden_bat",
		name        = "Wooden Bat",
		rarity      = "Common",
		damage      = 12,
		speed       = "Fast",
		range       = 7,
		ability     = nil,
		abilityDesc = nil,
		knockback   = 8,
		comboHits   = 3,
		source      = "Shop",
		dayUnlock   = 1,
	},
	{
		id          = "melee_machete",
		name        = "Machete",
		rarity      = "Uncommon",
		damage      = 18,
		speed       = "Medium",
		range       = 7,
		ability     = "Bleed",
		abilityDesc = "Applies bleed DoT: 3 damage/sec for 4 seconds",
		knockback   = 6,
		comboHits   = 3,
		source      = "Shop",
		dayUnlock   = 5,
	},
	{
		id          = "melee_fire_axe",
		name        = "Fire Axe",
		rarity      = "Uncommon",
		damage      = 22,
		speed       = "Slow",
		range       = 8,
		ability     = "Cleave",
		abilityDesc = "Hits up to 2 enemies in arc",
		knockback   = 12,
		comboHits   = 3,
		source      = "Shop",
		dayUnlock   = 10,
	},
	{
		id          = "melee_katana",
		name        = "Katana",
		rarity      = "Rare",
		damage      = 28,
		speed       = "Fast",
		range       = 8,
		ability     = "DashSlash",
		abilityDesc = "Dash forward 15 studs, slashing all enemies in path",
		knockback   = 8,
		comboHits   = 3,
		source      = "Crate",
		dayUnlock   = 20,
	},
	{
		id          = "melee_chainsaw",
		name        = "Chainsaw",
		rarity      = "Epic",
		damage      = 35,
		speed       = "Medium",
		range       = 6,
		ability     = "Shred",
		abilityDesc = "Rapid hits for 2 seconds: 5 damage per tick (10 ticks total)",
		knockback   = 3,
		comboHits   = 3,
		source      = "Crate",
		dayUnlock   = 30,
	},
	{
		id          = "melee_skibidi_blade",
		name        = "Skibidi Blade",
		rarity      = "Legendary",
		damage      = 45,
		speed       = "Fast",
		range       = 10,
		ability     = "ToiletTornado",
		abilityDesc = "AoE spin attack: 30 damage to all enemies within 12 studs",
		knockback   = 15,
		comboHits   = 3,
		source      = "Gacha",
		dayUnlock   = 50,
	},
	{
		id          = "melee_sigma_fist",
		name        = "Sigma Fist",
		rarity      = "Rizzlord",
		damage      = 55,
		speed       = "VeryFast",
		range       = 5,
		ability     = "OnePunch",
		abilityDesc = "Massive knockback + screen distortion VFX. One-shot common enemies.",
		knockback   = 30,
		comboHits   = 3,
		source      = "Gacha",
		dayUnlock   = 76,
	},
}

-------------------------------------------------------------------------------
-- RANGED WEAPONS
-- Additional fields: fireRate (shots/sec), magazineSize, reloadTime, aimAssist
-------------------------------------------------------------------------------
WeaponData.Ranged = {
	{
		id           = "ranged_slingshot",
		name         = "Slingshot",
		rarity       = "Common",
		damage       = 8,
		speed        = "Slow",
		range        = 40,
		fireRate     = 0.8,
		magazineSize = 1,
		reloadTime   = 0.8,
		aimAssist    = true,
		ability      = nil,
		abilityDesc  = nil,
		source       = "Starter",
		dayUnlock    = 1,
	},
	{
		id           = "ranged_9mm_pistol",
		name         = "9mm Pistol",
		rarity       = "Common",
		damage       = 12,
		speed        = "Medium",
		range        = 50,
		fireRate     = 1.5,
		magazineSize = 12,
		reloadTime   = 1.5,
		aimAssist    = true,
		ability      = nil,
		abilityDesc  = nil,
		source       = "Shop",
		dayUnlock    = 3,
	},
	{
		id           = "ranged_shotgun",
		name         = "Shotgun",
		rarity       = "Uncommon",
		damage       = 25,
		speed        = "Slow",
		range        = 20,
		fireRate     = 0.7,
		magazineSize = 6,
		reloadTime   = 2.5,
		aimAssist    = true,
		ability      = "Spread",
		abilityDesc  = "Close-range AoE cone: hits all enemies in 10-stud cone",
		source       = "Shop",
		dayUnlock    = 10,
	},
	{
		id           = "ranged_ar15",
		name         = "AR-15",
		rarity       = "Rare",
		damage       = 15,
		speed        = "Fast",
		range        = 60,
		fireRate     = 3.0,
		magazineSize = 30,
		reloadTime   = 2.0,
		aimAssist    = true,
		ability      = "BurstFire",
		abilityDesc  = "3-round burst: fires 3 shots in 0.2 seconds",
		source       = "Crate",
		dayUnlock    = 25,
	},
	{
		id           = "ranged_sniper",
		name         = "Sniper",
		rarity       = "Epic",
		damage       = 60,
		speed        = "VerySlow",
		range        = 100,
		fireRate     = 0.4,
		magazineSize = 5,
		reloadTime   = 3.0,
		aimAssist    = false,
		ability      = "Headshot",
		abilityDesc  = "2x critical hit damage on precision shots",
		source       = "Crate",
		dayUnlock    = 40,
	},
	{
		id           = "ranged_ohio_cannon",
		name         = "Ohio Cannon",
		rarity       = "Legendary",
		damage       = 50,
		speed        = "Slow",
		range        = 35,
		fireRate     = 0.5,
		magazineSize = 3,
		reloadTime   = 3.5,
		aimAssist    = true,
		ability      = "Explosion",
		abilityDesc  = "Explosion on impact: 30 damage AoE + knockback in 15-stud radius",
		source       = "Gacha",
		dayUnlock    = 50,
	},
	{
		id           = "ranged_rizz_ray",
		name         = "Rizz Ray",
		rarity       = "Rizzlord",
		damage       = 40,
		speed        = "Medium",
		range        = 45,
		fireRate     = 1.0,
		magazineSize = 8,
		reloadTime   = 2.0,
		aimAssist    = true,
		ability      = "CharmBeam",
		abilityDesc  = "Charm beam: hit zombies fight each other for 5 seconds",
		source       = "Gacha",
		dayUnlock    = 76,
	},
}

-------------------------------------------------------------------------------
-- THROWABLE ITEMS
-- Additional fields: aoeRadius (studs), duration (seconds)
-------------------------------------------------------------------------------
WeaponData.Throwables = {
	{
		id          = "throw_rock",
		name        = "Rock",
		rarity      = "Common",
		damage      = 5,
		aoeRadius   = 0,
		duration    = 0,
		effect      = "Stagger",
		effectDesc  = "Staggers target for 0.5 seconds",
		source      = "GroundPickup",
		dayUnlock   = 1,
		stackMax    = 5,
	},
	{
		id          = "throw_molotov",
		name        = "Molotov",
		rarity      = "Uncommon",
		damage      = 15, -- per second
		aoeRadius   = 8,
		duration    = 3,
		effect      = "FireZone",
		effectDesc  = "Creates fire zone: 15 damage/sec for 3 seconds in 8-stud radius",
		source      = "Shop",
		dayUnlock   = 5,
		stackMax    = 3,
	},
	{
		id          = "throw_frag_grenade",
		name        = "Frag Grenade",
		rarity      = "Rare",
		damage      = 40,
		aoeRadius   = 12,
		duration    = 0,
		effect      = "Explosion",
		effectDesc  = "Instant explosion: 40 damage in 12-stud radius",
		source      = "Shop",
		dayUnlock   = 15,
		stackMax    = 2,
	},
	{
		id          = "throw_brainrot_bomb",
		name        = "Brainrot Bomb",
		rarity      = "Epic",
		damage      = 30,
		aoeRadius   = 15,
		duration    = 5,
		effect      = "Confuse",
		effectDesc  = "Zombies wander aimlessly for 5 seconds in 15-stud radius",
		source      = "Crate",
		dayUnlock   = 25,
		stackMax    = 1,
	},
}

-------------------------------------------------------------------------------
-- STARTER LOADOUT
-- What players begin with on Day 1 (and after Rebirth)
-------------------------------------------------------------------------------
WeaponData.StarterLoadout = {
	melee    = "melee_rusty_pipe",
	ranged   = "ranged_slingshot",
	throwable = nil, -- rocks are ground pickups
}

-------------------------------------------------------------------------------
-- SHOP UNLOCK SCHEDULE
-- Weapons available in the between-wave shop, keyed by minimum day
-------------------------------------------------------------------------------
WeaponData.ShopSchedule = {
	[1]  = { "melee_rusty_pipe", "melee_wooden_bat", "ranged_slingshot" },
	[3]  = { "ranged_9mm_pistol" },
	[5]  = { "melee_machete", "throw_molotov" },
	[10] = { "melee_fire_axe", "ranged_shotgun" },
	[15] = { "throw_frag_grenade" },
}

-- Shop prices (Survival Coins)
WeaponData.ShopPrices = {
	melee_wooden_bat    = 50,
	melee_machete       = 200,
	melee_fire_axe      = 400,
	ranged_9mm_pistol   = 150,
	ranged_shotgun      = 500,
	throw_molotov       = 100,
	throw_frag_grenade  = 250,
}

-------------------------------------------------------------------------------
-- GACHA CRATE POOLS
-- Referenced by GachaManager for crate contents
-------------------------------------------------------------------------------
WeaponData.CratePools = {
	SurvivalCrate = {
		cost     = { currency = "Coins", amount = 500 },
		pityAt   = 50,
		contents = {
			{ id = "melee_wooden_bat",     weight = 40 },
			{ id = "melee_machete",        weight = 25 },
			{ id = "melee_fire_axe",       weight = 15 },
			{ id = "melee_katana",         weight = 10 },
			{ id = "ranged_ar15",          weight = 10 },
			{ id = "melee_chainsaw",       weight = 5 },
			{ id = "ranged_sniper",        weight = 5 },
			{ id = "melee_skibidi_blade",  weight = 2 },
			{ id = "ranged_ohio_cannon",   weight = 2 },
		},
	},
	BrainrotCrate = {
		cost     = { currency = "Gems", amount = 50 },
		pityAt   = 30,
		contents = {
			{ id = "melee_machete",        weight = 20 },
			{ id = "melee_fire_axe",       weight = 15 },
			{ id = "melee_katana",         weight = 15 },
			{ id = "ranged_ar15",          weight = 15 },
			{ id = "melee_chainsaw",       weight = 12 },
			{ id = "ranged_sniper",        weight = 12 },
			{ id = "melee_skibidi_blade",  weight = 5 },
			{ id = "ranged_ohio_cannon",   weight = 5 },
			{ id = "melee_sigma_fist",     weight = 0.5 },
			{ id = "ranged_rizz_ray",      weight = 0.5 },
		},
	},
}

-------------------------------------------------------------------------------
-- BOSS DROP TABLES
-- Boss-exclusive drops (in addition to standard loot)
-------------------------------------------------------------------------------
WeaponData.BossDrops = {
	-- Day 11 boss
	[11] = {
		{ id = "melee_katana",    chance = 0.15 },
		{ id = "ranged_ar15",     chance = 0.10 },
	},
	-- Day 22 boss
	[22] = {
		{ id = "melee_chainsaw",  chance = 0.10 },
		{ id = "ranged_sniper",   chance = 0.08 },
	},
	-- Day 33+ bosses have higher-rarity drops
	[33] = {
		{ id = "melee_chainsaw",       chance = 0.12 },
		{ id = "ranged_sniper",        chance = 0.10 },
		{ id = "melee_skibidi_blade",  chance = 0.03 },
	},
	[44] = {
		{ id = "melee_skibidi_blade",  chance = 0.05 },
		{ id = "ranged_ohio_cannon",   chance = 0.05 },
	},
	[55] = {
		{ id = "melee_skibidi_blade",  chance = 0.08 },
		{ id = "ranged_ohio_cannon",   chance = 0.08 },
	},
	[66] = {
		{ id = "melee_skibidi_blade",  chance = 0.10 },
		{ id = "ranged_ohio_cannon",   chance = 0.10 },
		{ id = "melee_sigma_fist",     chance = 0.01 },
		{ id = "ranged_rizz_ray",      chance = 0.01 },
	},
	[77] = {
		{ id = "melee_sigma_fist",     chance = 0.02 },
		{ id = "ranged_rizz_ray",      chance = 0.02 },
	},
	[88] = {
		{ id = "melee_sigma_fist",     chance = 0.03 },
		{ id = "ranged_rizz_ray",      chance = 0.03 },
	},
	-- Day 99 Final Boss: guaranteed Legendary+, RIZZLORD chance
	[99] = {
		{ id = "melee_skibidi_blade",  chance = 0.25 },
		{ id = "ranged_ohio_cannon",   chance = 0.25 },
		{ id = "melee_sigma_fist",     chance = 0.05 },
		{ id = "ranged_rizz_ray",      chance = 0.05 },
	},
}

-------------------------------------------------------------------------------
-- UTILITY: Lookup tables (built at module load)
-------------------------------------------------------------------------------
local _allWeapons = {}
local _weaponById = {}

local function _buildIndex()
	for _, w in ipairs(WeaponData.Melee) do
		w.weaponType = "Melee"
		table.insert(_allWeapons, w)
		_weaponById[w.id] = w
	end
	for _, w in ipairs(WeaponData.Ranged) do
		w.weaponType = "Ranged"
		table.insert(_allWeapons, w)
		_weaponById[w.id] = w
	end
	for _, w in ipairs(WeaponData.Throwables) do
		w.weaponType = "Throwable"
		table.insert(_allWeapons, w)
		_weaponById[w.id] = w
	end
end

_buildIndex()

--- Get weapon by ID
function WeaponData.GetWeapon(weaponId: string)
	return _weaponById[weaponId]
end

--- Get all weapons of a type
function WeaponData.GetWeaponsByType(weaponType: string)
	local result = {}
	for _, w in ipairs(_allWeapons) do
		if w.weaponType == weaponType then
			table.insert(result, w)
		end
	end
	return result
end

--- Get all weapons of a rarity
function WeaponData.GetWeaponsByRarity(rarityName: string)
	local result = {}
	for _, w in ipairs(_allWeapons) do
		if w.rarity == rarityName then
			table.insert(result, w)
		end
	end
	return result
end

--- Get all weapons available in shop by day
function WeaponData.GetShopWeaponsForDay(dayNumber: number)
	local available = {}
	for day, weapons in pairs(WeaponData.ShopSchedule) do
		if dayNumber >= day then
			for _, weaponId in ipairs(weapons) do
				table.insert(available, {
					weapon = _weaponById[weaponId],
					price  = WeaponData.ShopPrices[weaponId] or 0,
				})
			end
		end
	end
	return available
end

--- Get boss drop table for a specific day
function WeaponData.GetBossDrops(dayNumber: number)
	return WeaponData.BossDrops[dayNumber]
end

--- Get rarity info by name
function WeaponData.GetRarity(rarityName: string)
	return WeaponData.Rarity[rarityName]
end

--- Get ability cooldown for a weapon (by rarity)
function WeaponData.GetAbilityCooldown(weaponId: string): number
	local w = _weaponById[weaponId]
	if not w or not w.ability then
		return 0
	end
	return WeaponData.AbilityCooldown[w.rarity] or 0
end

--- Get effective DPS for a weapon (damage * attacks-per-second * rarity multiplier)
function WeaponData.GetEffectiveDPS(weaponId: string): number
	local w = _weaponById[weaponId]
	if not w then return 0 end
	local speedInfo = WeaponData.SpeedTier[w.speed]
	if not speedInfo then return 0 end
	local rarityInfo = WeaponData.Rarity[w.rarity]
	if not rarityInfo then return 0 end
	return w.damage * speedInfo.attacksPerSec * rarityInfo.powerMult
end

--- Get all weapon IDs (for inventory/DataStore)
function WeaponData.GetAllWeaponIds(): {string}
	local ids = {}
	for _, w in ipairs(_allWeapons) do
		table.insert(ids, w.id)
	end
	return ids
end

--- Weapon count
function WeaponData.GetWeaponCount(): number
	return #_allWeapons
end

return WeaponData
