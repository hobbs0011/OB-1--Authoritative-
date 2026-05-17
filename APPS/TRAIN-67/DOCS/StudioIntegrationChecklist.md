# TRAIN-67 — Studio Integration Checklist (UnifiedServer + AnalyticsService + QuestionBankV2)

**Purpose:** A tight, Studio-first checklist so Michael can wire the generated modules into Roblox Studio without guessing.

## 0) Pre-flight (do this before touching code)
- Confirm **no HTML entities** exist in these files:
	- `CANON/TRAIN-67/CODE/UnifiedServer.lua`
	- `CANON/TRAIN-67/CODE/AnalyticsService.lua`
	- `CANON/TRAIN-67/CODE/QuestionBankV2.lua`
- In Studio, open the Output window and keep it visible.
- Decide where code lives:
	- **ServerScriptService** for server modules
	- **ReplicatedStorage** for RemoteEvents / shared tables

## 1) Drop-in locations (recommended)
### A) ServerScriptService
Create this structure:
- `ServerScriptService/Server`
	- `UnifiedServer.lua` (ModuleScript)
	- `AnalyticsService.lua` (ModuleScript)
	- `QuestionBankV2.lua` (ModuleScript)
	- `QuestionChunks/` (Folder)
		- `chunk_001.lua` (ModuleScript)
		- `chunk_002.lua` (ModuleScript)
		- ...

### B) ReplicatedStorage
- `ReplicatedStorage/Remotes/` (Folder)
	- `UnifiedRemote` (RemoteEvent)
	- (optional) `TelemetryRemote` (RemoteEvent) — only if you want client→server telemetry later

## 2) UnifiedServer boot order (minimum viable)
**Goal:** one server entrypoint that initializes modules deterministically.

### A) Create a server runner script
- `ServerScriptService/ServerMain.server.lua` (Script)

Suggested content:
```lua
local ServerScriptService = game:GetService("ServerScriptService")
local Server = ServerScriptService:WaitForChild("Server")

local UnifiedServer = require(Server:WaitForChild("UnifiedServer"))

UnifiedServer.Init({
	Debug = true,
})
```

### B) Inside UnifiedServer.Init()
Verify it calls, in this order:
1. Remote wiring (creates/validates RemoteEvent)
2. AnalyticsService.Init()
3. QuestionBankV2.Init() (or equivalent load/registry step)

If any module is optional, it must fail-closed with a clear warning, not a silent skip.

## 3) AnalyticsService wiring (server-only)
**Goal:** events fire without blocking gameplay.

### A) Confirm AnalyticsService has lifecycle
- `Init()` called once
- `Track(...)` callable anytime
- `Shutdown()` (optional) flushes buffer

### B) Minimum event smoke test
In Studio Command Bar (server), run:
```lua
local ServerScriptService = game:GetService("ServerScriptService")
local Server = ServerScriptService:WaitForChild("Server")

local AnalyticsService = require(Server:WaitForChild("AnalyticsService"))
AnalyticsService.Init({ Debug = true })

AnalyticsService.Track(nil, "session_start", { source = "studio_smoke_test" })
```
Expected outcome:
- No errors
- One debug print confirming event accepted (or buffered)

### C) DataStore budget safety
If DataStore writes are enabled:
- Ensure flush cadence is not more frequent than specified (questions every ~60s, economy every ~10m).
- If Studio test uses API services disabled, AnalyticsService must gracefully degrade.

## 4) QuestionBankV2 chunk loading (critical)
**Goal:** support 500–3000+ questions without a single giant Lua table.

### A) Chunk folder contract
- Folder name: `QuestionChunks`
- Module naming: `chunk_001`, `chunk_002`, etc.
- Each chunk returns an array/table of questions.

### B) Registry contract
QuestionBankV2 must produce:
- An index of question IDs → chunk
- A lazy loader: load chunk only when needed

### C) Studio smoke test
In Studio Command Bar (server):
```lua
local ServerScriptService = game:GetService("ServerScriptService")
local Server = ServerScriptService:WaitForChild("Server")

local QB = require(Server:WaitForChild("QuestionBankV2"))
QB.Init({ Debug = true })

local q = QB.GetQuestion("any")
print(q)
```
Expected outcome:
- No errors
- Either a question object or a clear "no question" response (not nil crash)

## 5) RemoteEvent contract (client↔server)
**Goal:** one RemoteEvent path for gameplay messages.

- RemoteEvent name: `UnifiedRemote`
- Parent: `ReplicatedStorage/Remotes/`

Server must:
- Validate payload shape (type checks)
- Rate limit per player if accepting client messages

## 6) If something breaks (fast triage)
- **Syntax error** at load time → almost always operator corruption or missing `end`.
- **Infinite yield** → `WaitForChild` points at wrong path.
- **Attempt to index nil** → module contract mismatch (rename fields vs spec).

## 7) Definition of DONE
- Studio boots with no red errors.
- UnifiedServer.Init() runs once.
- AnalyticsService accepts a test event.
- QuestionBankV2 loads at least one chunk and can return a question.

---
*Note:* This file is a Studio execution checklist, not a design spec. Keep it short, runnable, and fail-closed.
