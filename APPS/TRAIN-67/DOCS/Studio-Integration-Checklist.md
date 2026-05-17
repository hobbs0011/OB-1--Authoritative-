# Roblox Studio Integration Checklist (TRAIN-67)

**Purpose:** Convert the overnight specs and CODE artifacts into a clean, deterministic Studio wiring sequence.

## 0) Preflight
- Confirm the place you are pasting from is **raw text** (no HTML entities like `&gt;` / `&lt;`).
- Ensure **ServerScriptService** has a single main entry script (recommended: `UnifiedServer.server.lua`).

## 1) Folder layout (recommended)
Create these containers:
- `ReplicatedStorage/Remotes/` (Folder)
- `ServerScriptService/ServerModules/` (Folder)
- `ServerScriptService/ServerModules/QuestionChunks/` (Folder)
- `ServerStorage/` (optional: server-only configs)

## 2) Install modules
Place these ModuleScripts in `ServerScriptService/ServerModules/`:
- `UnifiedServer.lua`
- `AnalyticsService.lua`
- `QuestionBankV2.lua`

(If you already have older versions in other folders, **delete or rename** to avoid shadow-loading the wrong module.)

## 3) UnifiedServer boot order (minimum deterministic)
In `UnifiedServer.lua`, enforce this boot order:
1. **Remotes setup** (create/find RemoteEvents in `ReplicatedStorage/Remotes`)
2. **DataStore / persistent modules** (if any)
3. **QuestionBankV2.Init()**
4. **AnalyticsService.Init()**
5. Any gameplay loop modules

### Expected lifecycle API
- `module.Init()` should be safe to call once.
- `module.Shutdown()` optional.

## 4) Wire AnalyticsService into UnifiedServer
**Goal:** every major gameplay event calls `AnalyticsService.Track(player, eventName, payload)`.

Minimum events to wire first:
- `session_start`, `session_end`
- `ftue_start`, `ftue_step`, `ftue_complete`
- `question_served`, `question_answered`, `question_skipped`
- `purchase_prompted`, `purchase_completed`

## 5) QuestionBankV2 chunk loading: canonical behavior
**Goal:** remove the monolith question table and support scalable chunks.

### Chunk rule
- Each chunk is a ModuleScript in `ServerModules/QuestionChunks/`
- Naming: `Chunk_001.lua`, `Chunk_002.lua`, …
- Each chunk returns an array/table of question objects.

### Registry rule
`QuestionBankV2.Init()` should:
1. `GetChildren()` from `QuestionChunks`
2. Sort by name
3. `require()` each chunk
4. Validate minimal schema per question:
	- `id` (string)
	- `tier` (number)
	- `prompt` (string)
	- `answers` (table)
5. Build a fast index: `byId`, `byTier`, optional `byTag`

## 6) Fast “does it run” test (5 minutes)
Create a temporary `ServerScriptService/TestBoot.server.lua`:
```lua
local UnifiedServer = require(script.Parent.ServerModules.UnifiedServer)
print("BOOT: starting")
UnifiedServer.Init()
print("BOOT: ok")
```

Run Play:
- If you see `BOOT: ok`, the core wiring is alive.
- If you get `attempt to call nil` or module not found:
	- you have a duplicate module shadowing the correct one
	- or the ModuleScript names do not match `require()` paths

## 7) Common failure signatures
- **Syntax error near '>'** → you pasted HTML entities somewhere (should now be fixed in the GitHub versions).
- **Module not found** → wrong folder, wrong ModuleScript name, or duplicate shadows.
- **RemoteEvent nil** → create remotes in UnifiedServer before any other module touches them.

## 8) Next build targets (post-checklist)
- Confirm `AnalyticsService.Flush()` runs on interval without DataStore budget blowouts.
- Add a small in-game admin command to dump last 20 analytics events for sanity.

---
**Linked artifacts (GitHub):**
- `CANON/TRAIN-67/CODE/UnifiedServer.lua`
- `CANON/TRAIN-67/CODE/AnalyticsService.lua`
- `CANON/TRAIN-67/CODE/QuestionBankV2.lua`
