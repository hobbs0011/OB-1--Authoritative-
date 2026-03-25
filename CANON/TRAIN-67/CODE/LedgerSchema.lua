--[[
PHOENIX LEDGER v1 :: FAIL-CLOSED RECORDING
Target: Roblox DataStore + External Webhook
]]

local LedgerSchema = {}

LedgerSchema.TransactionStruct = {
	ActionID    = "UUID",       -- HttpService:GenerateGUID(false)
	Timestamp   = 0,            -- os.time()
	BotIdentity = "Agent-100",  -- "System" or PlayerName

	-- INPUT DIGEST (The "Before" State)
	InputDigest = {
		PlayerID     = 0,
		OfferItems   = {},  -- List of UUIDs
		RequestItems = {}   -- List of UUIDs
	},

	-- PLAN DIGEST (The "Value" Check)
	PlanDigest = {
		OfferValue   = 0,     -- Calculated via Value API
		RequestValue = 0,
		ValueDelta   = 0,     -- Absolute difference
		IsScamWarning = false  -- Delta > 30%
	},

	-- OUTCOME (The "After" State)
	Outcome = {
		Status     = "PENDING", -- PENDING, COMMITTED, BLOCKED
		ReasonCode = "N/A"      -- "VALUATION_DRIFT", "SUCCESS", "TIMEOUT"
	}
}

return LedgerSchema
