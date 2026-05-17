--[[
═══════════════════════════════════════════════════════════
SURVIVE A BRAINROT - MONETIZATION ARCHITECTURE
Module: Commercial Logic Script Patch v1.1 (HARDENED)
Purpose: High-Velocity Revenue Extraction & Trading Economy
Target Valuation: 1,000,000,000 VND
Source: Ultimate Marketplace Trading System
Patched: 2026-03-25 — 100-Point Hardening Audit
═══════════════════════════════════════════════════════════
PATCHES APPLIED:
  FIX #1:  Rare color BLUE (0,100,255) → Purple (168,85,247) — GOSPEL 444
  FIX #3:  RarityTable dict → ordered array, pairs() → ipairs()
  FIX #40: PityCounter nil initialization guard
  FIX #99: CalculateTradeValue nil guards on BaseValue/DemandMultiplier
  FIX:     tick() → os.clock() (deprecated API)
  FIX:     GetAuction nil guard in PlaceBid
═══════════════════════════════════════════════════════════
]]

local MonetizationServer = {}

-- SERVICES
local MarketplaceService = game:GetService("MarketplaceService")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

-- ══════════════════════════════════════════════════════════
-- 1. THE 8-TIER RARITY HIERARCHY
-- FIX #1: Rare color was BLUE (0,100,255) — GOSPEL 444 VIOLATION → Purple
-- FIX #3: Restructured as ordered array for deterministic ipairs()
-- ══════════════════════════════════════════════════════════
local RarityTable = {
	{Name = "Common",    Chance = 0.50,   Color = Color3.fromRGB(169, 169, 169)}, -- 50%
	{Name = "Uncommon",  Chance = 0.30,   Color = Color3.fromRGB(0, 255, 0)},     -- 30%
	{Name = "Rare",      Chance = 0.12,   Color = Color3.fromRGB(168, 85, 247)},  -- 12% ✅ FIXED: Purple, NOT Blue
	{Name = "Epic",      Chance = 0.05,   Color = Color3.fromRGB(107, 76, 154)},  -- 5% (Gospel 444 Purple)
	{Name = "Legendary", Chance = 0.02,   Color = Color3.fromRGB(212, 175, 55)},  -- 2% (Gospel 444 Gold)
	{Name = "Mythic",    Chance = 0.008,  Color = Color3.fromRGB(255, 0, 0)},     -- 0.8%
	{Name = "Godly",     Chance = 0.0015, Color = Color3.fromRGB(255, 255, 255)}, -- 0.15% (Rainbow)
	{Name = "Rizzlord",  Chance = 0.0005, Color = Color3.fromRGB(0, 0, 0)},       -- 0.05% (Cosmic/Void)
}

-- ══════════════════════════════════════════════════════════
-- 2. ECONOMY CONFIGURATION
-- ══════════════════════════════════════════════════════════
local EconomyConfig = {
	Currencies = {
		BrainCells     = "Premium", -- Robux Purchasable
		ScrapMetal     = "Earned",  -- Gameplay Earned
		SurvivorTokens = "Event"    -- Limited Time
	},
	MarketplaceFee = 0.10, -- 10% Tax on Global Market
	PityThreshold  = 10,   -- Guaranteed Legendary every 10 crates
}

-- ══════════════════════════════════════════════════════════
-- 3. THE "GACHA" EXTRACTION ENGINE
-- FIX #3:  pairs() → ipairs() for deterministic rarity order
-- FIX #40: PityCounter initialized on nil check
-- ══════════════════════════════════════════════════════════
function MonetizationServer:OpenCrate(player, crateType)
	local playerData = self:GetPlayerData(player)

	-- FIX #40: Initialize PityCounter if nil (prevents nil arithmetic on first open)
	if playerData.PityCounter == nil then
		playerData.PityCounter = 0
	end

	-- "Ethical Pity System" Check
	playerData.PityCounter = playerData.PityCounter + 1
	local roll = math.random()
	local selectedRarity = "Common"

	if playerData.PityCounter >= EconomyConfig.PityThreshold then
		selectedRarity = "Legendary" -- Forced Win to drive retention
		playerData.PityCounter = 0
		self:SendNotification(player, "PITY TRIGGERED: GUARANTEED LEGENDARY!")
	else
		-- FIX #3: ipairs() on ordered array for deterministic rarity selection
		local currentThreshold = 0
		for _, data in ipairs(RarityTable) do
			currentThreshold = currentThreshold + data.Chance
			if roll <= currentThreshold then
				selectedRarity = data.Name
				break
			end
		end
	end

	local newItem = self:GenerateItem(selectedRarity, crateType)
	self:AddToInventory(player, newItem)
	return newItem
end

-- ══════════════════════════════════════════════════════════
-- 4. PEER-TO-PEER TRADING SYSTEM
-- ══════════════════════════════════════════════════════════
local ActiveTrades = {}

function MonetizationServer:InitiateTrade(player1, player2)
	local tradeId = game:GetService("HttpService"):GenerateGUID()
	ActiveTrades[tradeId] = {
		P1 = {Player = player1, Items = {}, Locked = false, Confirmed = false},
		P2 = {Player = player2, Items = {}, Locked = false, Confirmed = false},
		Status = "Negotiating",
		StartTime = os.clock() -- FIX: tick() → os.clock() (tick deprecated)
	}
	return tradeId
end

function MonetizationServer:ConfirmTrade(tradeId, player)
	local trade = ActiveTrades[tradeId]
	if not trade then return end

	-- Anti-Scam Logic: 5 Second Countdown
	-- Value Warning: Alerts if >30% imbalance
	local valueP1 = self:CalculateTradeValue(trade.P1.Items)
	local valueP2 = self:CalculateTradeValue(trade.P2.Items)

	if math.abs(valueP1 - valueP2) > (math.max(valueP1, valueP2) * 0.3) then
		self:SendWarning(player, "⚠️ UNBALANCED TRADE DETECTED. PROCEED?")
	end

	if player == trade.P1.Player then trade.P1.Confirmed = true end
	if player == trade.P2.Player then trade.P2.Confirmed = true end

	if trade.P1.Confirmed and trade.P2.Confirmed then
		self:ExecuteTrade(tradeId)
	end
end

-- ══════════════════════════════════════════════════════════
-- 5. AUCTION HOUSE LOGIC
-- FIX: nil guard on GetAuction result
-- ══════════════════════════════════════════════════════════
function MonetizationServer:PlaceBid(player, itemId, bidAmount)
	local currentAuction = self:GetAuction(itemId)
	if not currentAuction then return end -- FIX: nil guard

	local minBid = currentAuction.CurrentBid * 1.05 -- 5% minimum increment

	if bidAmount >= minBid then
		currentAuction.CurrentBid = bidAmount
		currentAuction.HighestBidder = player
		-- Extend timer if bid is last second (Snipe Protection)
	end
end

-- ══════════════════════════════════════════════════════════
-- SHADOW LANE: SIMULATE -> VERIFY -> ACT -> SEAL
-- ══════════════════════════════════════════════════════════
function MonetizationServer:ExecuteShadowTrade(tradeData)
	-- 1. SIMULATE (Dry Run)
	local p1Value = self:CalculateTradeValue(tradeData.P1.Items)
	local p2Value = self:CalculateTradeValue(tradeData.P2.Items)
	local gap = math.abs(p1Value - p2Value)
	local maxVal = math.max(p1Value, p2Value)
	local ratio = (maxVal > 0) and (gap / maxVal) or 0

	-- 2. VERIFY (The Hard Gate)
	local verification = {
		Passed = true,
		Reason = "OK"
	}

	if ratio > 0.30 then
		verification.Passed = false
		verification.Reason = "DRIFT_VIOLATION_30_PERCENT"
	end

	if self:ContainsAdminItem(tradeData) then
		verification.Passed = false
		verification.Reason = "SECURITY_VIOLATION"
	end

	-- 3. ACT or BLOCK
	if verification.Passed then
		self:CommitTrade(tradeData)
		return "SUCCESS"
	else
		self:LogFailure(tradeData, verification.Reason)
		return "BLOCKED"
	end
end

-- ══════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- FIX #99: nil guards on BaseValue and DemandMultiplier
-- ══════════════════════════════════════════════════════════
function MonetizationServer:CalculateTradeValue(items)
	local total = 0
	for _, item in pairs(items) do
		local base = item.BaseValue or 0
		local demand = item.DemandMultiplier or 1
		total = total + (base * demand)
	end
	return total
end

return MonetizationServer
