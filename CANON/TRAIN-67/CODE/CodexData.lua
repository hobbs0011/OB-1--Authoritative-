--[[
═══════════════════════════════════════════════════════════
SURVIVAL CODEX // DATABASE
Module: CodexData.lua
Type: ModuleScript (ReplicatedStorage)
Purpose: Encyclopedia data for Survive a Brainrot
Gospel 444 Compliant — NO BLUE
Phoenix Rising Gaming Division
═══════════════════════════════════════════════════════════
]]

local CodexData = {}

-- ══════════════════════════════════════════════════════════
-- CODEX ENTRIES
-- ══════════════════════════════════════════════════════════
CodexData.Entries = {
	-- ENEMIES
	{
		id = "ENM-001",
		title = "Skibidi Shambler",
		category = "Enemies",
		rarity = "Common",
		description = "The base-tier Brain-Rot zombie. Slow, dumb, and relentless. What they lack in intelligence they make up for in sheer volume. A single Shambler is a joke. A horde of them is a funeral.",
		stats = { HP = 100, Speed = 12, Damage = 15, XP = 10 },
		unlockCondition = "Survive Day 1",
		icon = "\240\159\167\159",
	},
	{
		id = "ENM-002",
		title = "Sigma Walker",
		category = "Enemies",
		rarity = "Uncommon",
		description = "Bigger. Meaner. Doesn't flinch. The Sigma Walker absorbs damage like a sponge and hits like a freight train. Appears from Day 2 onward. Travel in pairs. Target the weak link.",
		stats = { HP = 200, Speed = 8, Damage = 25, XP = 25 },
		unlockCondition = "Reach Day 2",
		icon = "\240\159\146\128",
	},
	{
		id = "BOSS-001",
		title = "Baron Skibidi",
		category = "Enemies",
		rarity = "Rizzlord",
		description = "The First Rizzlord. Baron Skibidi rules the Rusted Depot with an iron fist and a corn-scented aura of pure dread. Three attacks. No mercy. The only thing standing between your squad and Day 3.",
		stats = { HP = 2500, Speed = 10, Damage = 50, XP = 500 },
		unlockCondition = "Collect 3 Fuel Barrels at Rusted Depot",
		icon = "\240\159\145\145",
	},

	-- LOCATIONS
	{
		id = "LOC-001",
		title = "The Train",
		category = "Locations",
		rarity = "Legendary",
		description = "Your moving fortress. Your home. Your coffin if you're not careful. The Train carries a squad of 5 through 99 days of Brain-Rot wasteland. Engine up front, Shield Car in the middle, Living Quarters in the back. Defend it with everything you've got.",
		stats = {},
		unlockCondition = "Start a game",
		icon = "\240\159\154\130",
	},
	{
		id = "LOC-002",
		title = "Rusted Depot",
		category = "Locations",
		rarity = "Rare",
		description = "An abandoned train station on Day 2. Smells like rust, regret, and something else you can't identify. 3 fuel barrels are hidden among the wreckage. You have 5 minutes. The zombies don't stop. The clock doesn't care.",
		stats = {},
		unlockCondition = "Complete Day 1",
		icon = "\240\159\143\154",
	},
}

-- ══════════════════════════════════════════════════════════
-- CATEGORIES
-- ══════════════════════════════════════════════════════════
CodexData.Categories = {
	"Enemies",
	"Locations",
	"Survival",
	"Lore",
	"Equipment",
}

-- ══════════════════════════════════════════════════════════
-- RARITY COLORS (Gospel 444)
-- ══════════════════════════════════════════════════════════
CodexData.RarityColors = {
	Common    = Color3.fromRGB(169, 169, 169),
	Uncommon  = Color3.fromRGB(0, 255, 0),
	Rare      = Color3.fromRGB(168, 85, 247),   -- Purple (NOT blue)
	Epic      = Color3.fromRGB(168, 85, 247),   -- Gospel 444 Purple
	Legendary = Color3.fromRGB(245, 158, 11),   -- Gospel 444 Gold
	Mythic    = Color3.fromRGB(239, 68, 68),
	Godly     = Color3.fromRGB(255, 255, 255),
	Rizzlord  = Color3.fromRGB(0, 0, 0),
}

-- ══════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ══════════════════════════════════════════════════════════
function CodexData:GetEntry(id)
	for _, entry in ipairs(self.Entries) do
		if entry.id == id then
			return entry
		end
	end
	return nil
end

function CodexData:GetByCategory(category)
	local results = {}
	for _, entry in ipairs(self.Entries) do
		if entry.category == category then
			table.insert(results, entry)
		end
	end
	return results
end

function CodexData:GetRarityColor(rarity)
	return self.RarityColors[rarity] or Color3.fromRGB(169, 169, 169)
end

return CodexData
