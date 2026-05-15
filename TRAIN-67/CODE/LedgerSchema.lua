--[[
PHOENIX LEDGER v1.1 :: FAIL-CLOSED RECORDING (HARDENED)
Target: Roblox DataStore + External Webhook
Version: 1.1 HARDENED
Date: Original Feb 2026 (Hardened March 25, 2026)

HARDENING LOG:
  1. BotIdentity: Agent-100 → Agent-99 (correct system naming)
  2. Added Validate() function — fail-closed schema enforcement
  3. Added missing marketplace fields (Currency, Fee, Expiry)
  4. Added status and reason constants
  5. Added CreateTransaction() factory with auto-populated defaults
]]

local HttpService = game:GetService("HttpService")

local LedgerSchema = {}

LedgerSchema.Status = {
	PENDING   = "PENDING",
	COMMITTED = "COMMITTED",
	BLOCKED   = "BLOCKED",
	EXPIRED   = "EXPIRED",
	ROLLBACK  = "ROLLBACK",
}

LedgerSchema.ReasonCode = {
	SUCCESS          = "SUCCESS",
	VALUATION_DRIFT  = "VALUATION_DRIFT",
	TIMEOUT          = "TIMEOUT",
	SCAM_BLOCKED     = "SCAM_BLOCKED",
	INSUFFICIENT     = "INSUFFICIENT",
	PLAYER_CANCEL    = "PLAYER_CANCEL",
}

LedgerSchema.TransactionStruct = {
	ActionID    = "UUID",
	Timestamp   = 0,
	BotIdentity = "Agent-99",

	InputDigest = {
		PlayerID     = 0,
		OfferItems   = {},
		RequestItems = {},
	},

	PlanDigest = {
		OfferValue     = 0,
		RequestValue   = 0,
		ValueDelta     = 0,
		IsScamWarning  = false,
		Currency       = "COINS",
		MarketplaceFee = 0,
	},

	Outcome = {
		Status     = "PENDING",
		ReasonCode = "N/A",
		ExpiresAt  = 0,
	}
}

local TRADE_TTL = 300

function LedgerSchema:CreateTransaction(playerID, offerItems, requestItems)
	assert(type(playerID) == "number", "[Ledger] PlayerID must be a number")
	assert(type(offerItems) == "table", "[Ledger] OfferItems must be a table")
	assert(type(requestItems) == "table", "[Ledger] RequestItems must be a table")
	local now = os.time()
	return {
		ActionID    = HttpService:GenerateGUID(false),
		Timestamp   = now,
		BotIdentity = "Agent-99",
		InputDigest = {
			PlayerID     = playerID,
			OfferItems   = offerItems,
			RequestItems = requestItems,
		},
		PlanDigest = {
			OfferValue     = 0,
			RequestValue   = 0,
			ValueDelta     = 0,
			IsScamWarning  = false,
			Currency       = "COINS",
			MarketplaceFee = 0,
		},
		Outcome = {
			Status     = self.Status.PENDING,
			ReasonCode = "N/A",
			ExpiresAt  = now + TRADE_TTL,
		}
	}
end

function LedgerSchema:Validate(transaction)
	if type(transaction) ~= "table" then return false, "Transaction must be a table" end
	if type(transaction.ActionID) ~= "string" or transaction.ActionID == "" then return false, "Missing or empty ActionID" end
	if type(transaction.Timestamp) ~= "number" or transaction.Timestamp <= 0 then return false, "Invalid Timestamp" end
	local input = transaction.InputDigest
	if type(input) ~= "table" then return false, "Missing InputDigest" end
	if type(input.PlayerID) ~= "number" or input.PlayerID <= 0 then return false, "Invalid PlayerID" end
	if type(input.OfferItems) ~= "table" then return false, "OfferItems must be a table" end
	if type(input.RequestItems) ~= "table" then return false, "RequestItems must be a table" end
	local plan = transaction.PlanDigest
	if type(plan) ~= "table" then return false, "Missing PlanDigest" end
	if type(plan.OfferValue) ~= "number" or type(plan.RequestValue) ~= "number" then return false, "Invalid value fields in PlanDigest" end
	local outcome = transaction.Outcome
	if type(outcome) ~= "table" then return false, "Missing Outcome" end
	local validStatus = false
	for _, s in pairs(self.Status) do
		if outcome.Status == s then validStatus = true break end
	end
	if not validStatus then return false, "Unknown Outcome.Status: " .. tostring(outcome.Status) end
	if outcome.ExpiresAt and outcome.ExpiresAt > 0 then
		if outcome.ExpiresAt < os.time() and outcome.Status == self.Status.PENDING then
			return false, "Transaction expired (PENDING past ExpiresAt)"
		end
	end
	return true, "VALID"
end

return LedgerSchema
