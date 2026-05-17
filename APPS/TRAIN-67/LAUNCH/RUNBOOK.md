# Train 6-7 (TRAIN-67) — Launch Runbook

This is the **no-secrets** runbook for getting the TRAIN-67 Roblox experience into a clean, repeatable launch posture.

## 0) Guardrails

- No API keys, tokens, or private endpoints in this repo.
- If anything requires secrets, it goes into a separate secure channel and is referenced here as **`UNKNOWN`** until provided.

## 1) Local prerequisites

- Roblox Studio (latest stable)
- A test place/universe you can publish to

## 2) Source of truth (code)

- Entry: `CANON/TRAIN-67/CODE/UnifiedServer.lua`
- Modules:
	- `CANON/TRAIN-67/CODE/AnalyticsService.lua`
	- `CANON/TRAIN-67/CODE/QuestionBankV2.lua`

## 3) Studio import (minimal)

1. Open Roblox Studio.
2. Create/open the target place.
3. Insert scripts/modules to match your expected tree (ServerScriptService / ReplicatedStorage, etc.).
4. Paste the code from the files above.

## 4) Smoke test (5 minutes)

- Server boots without syntax errors.
- `UnifiedServer.lua` executes and requires modules cleanly.
- No `&lt;` / `&gt;` entity artifacts present (these break Lua).

## 5) QA gates

- No output spam in console.
- No infinite loops.
- Basic gameplay loop runs end-to-end.

## 6) Publish

- Publish to Roblox as a new version.
- Record the resulting place/universe identifiers in the Notion state store.

## 7) Post-launch monitoring

- Crash rate
- Session length
- Funnel completion

## 8) Next missing inputs

- Roblox place/universe ID(s): `UNKNOWN`
- Any API configuration: intentionally deferred
