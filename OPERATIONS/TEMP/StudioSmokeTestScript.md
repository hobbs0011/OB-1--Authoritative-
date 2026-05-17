# Studio Smoke Test Script — UnifiedServer + AnalyticsService + QuestionBankV2

**Purpose:** Fast, fail-closed checklist for Roblox Studio to verify the latest shipped modules are actually runnable.

## Preconditions
- You have a working place file open in **Roblox Studio**.
- You can paste ModuleScripts into **ServerScriptService**.
- You have these files locally (copy from GitHub):
	- `CANON/TRAIN-67/CODE/UnifiedServer.lua`
	- `CANON/TRAIN-67/CODE/AnalyticsService.lua`
	- `CANON/TRAIN-67/CODE/QuestionBankV2.lua`

## Folder Placement (minimum viable)
1. In **ServerScriptService**, create a folder: `Server`
2. Inside `Server`, create ModuleScripts:
	- `UnifiedServer`
	- `AnalyticsService`
	- `QuestionBankV2`
3. Paste each file’s contents into its matching ModuleScript.

## Required Studio Objects
1. In **ReplicatedStorage**, create a folder: `Remotes`
2. Create RemoteEvent(s) if `UnifiedServer` expects them.
	- If you do not know the names yet, run once and capture the error.

## Smoke Test Harness (single Script)
Create a **Script** in `ServerScriptService` named `SmokeTest.server.lua`:

```lua
-- SmokeTest.server.lua
-- Fail-closed: if any require() or init fails, surface the error immediately.

local ServerScriptService = game:GetService("ServerScriptService")
local ServerFolder = ServerScriptService:WaitForChild("Server")

local function req(name)
	local m = ServerFolder:WaitForChild(name)
	local ok, mod = pcall(require, m)
	if not ok then
		error("REQUIRE_FAILED: " .. name .. " :: " .. tostring(mod))
	end
	return mod
end

print("[SMOKE] require modules...")
local UnifiedServer = req("UnifiedServer")
local AnalyticsService = req("AnalyticsService")
local QuestionBankV2 = req("QuestionBankV2")

print("[SMOKE] init order...")
-- If UnifiedServer owns init, prefer that.
-- Otherwise, init dependencies directly in a safe order.

if type(AnalyticsService.Init) == "function" then
	local ok, err = pcall(function()
		AnalyticsService:Init()
	end)
	if not ok then
		error("INIT_FAILED: AnalyticsService :: " .. tostring(err))
	end
end

if type(QuestionBankV2.Init) == "function" then
	local ok, err = pcall(function()
		QuestionBankV2:Init()
	end)
	if not ok then
		error("INIT_FAILED: QuestionBankV2 :: " .. tostring(err))
	end
end

if type(UnifiedServer.Init) == "function" then
	local ok, err = pcall(function()
		UnifiedServer:Init()
	end)
	if not ok then
		error("INIT_FAILED: UnifiedServer :: " .. tostring(err))
	end
end

print("[SMOKE] PASS — modules required and Init() calls did not throw")
```

## Expected Outcomes
- **PASS:** Output shows `\[SMOKE\] PASS`.
- **FAIL:** Roblox output shows `REQUIRE_FAILED` or `INIT_FAILED` with a stack trace.

## Fast Triage (if FAIL)
- **Syntax error:** usually indicates a paste problem or remaining HTML entities.
- **Missing object error:** create the missing Folder/Remote/Event with the exact name.
- **Nil method error:** module returned a table but does not expose `Init()` as expected — adjust smoke harness to call the actual exported function.

## Notes
- This harness intentionally avoids “best guess” wiring. It is built to force the *first real error* to show up quickly so patches can be minimal and targeted.
