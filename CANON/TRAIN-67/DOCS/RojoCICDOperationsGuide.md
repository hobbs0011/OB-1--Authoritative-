# Rojo + GitHub Actions CI/CD Operations Guide

> **Generated:** 2026-03-28 13:00 ICT (Run 81)  
> **Artifact class:** 🔨 BUILD  
> **Source:** Cross-repo synthesis — workflow `bb4bd8a`, project `06e9dab`, StudioModulePlacementMap `4309fcd3`, all 41 CODE modules  
> **Purpose:** Complete operations guide for the hands-off GitHub → Roblox deploy pipeline Michael built.

---

## Pipeline Overview

```
GitHub repo (source of truth)
    ↓  push / merge to main
    ↓
GitHub Actions (workflow_dispatch or auto-trigger)
    ↓
  1. Checkout repo
  2. Install Rojo 7.6.1
  3. rojo build default.project.json → build.rbxl
  4. POST build.rbxl to Roblox Open Cloud API
    ↓
Roblox place updated (published version)
```

**No more Studio copy/paste. Code lives in GitHub, deploys to Roblox automatically.**

---

## Architecture: What Lives Where

| Component | Location | Purpose |
|-----------|----------|---------|
| `default.project.json` | Repo root | Rojo tree mapping: which files → which Roblox services |
| `.github/workflows/roblox-place-deploy.yml` | Repo `.github/workflows/` | GitHub Actions workflow — build + publish |
| `CANON/TRAIN-67/CODE/*.lua` | Repo | All 41 Lua modules (38 active + 3 legacy) |
| `ROBLOX_API_KEY` | GitHub Secrets | Roblox Open Cloud API key (secret, never in code) |
| Universe `9945984154` | Roblox | Game universe ID |
| Place `83007032761005` | Roblox | Game place ID |

---

## Current Project Structure (default.project.json)

The enhanced project.json maps all 38 active modules into the correct Roblox services:

### ServerScriptService (31 modules)
- **UnifiedServer.lua** — Server boot script (requires all server modules)
- **Modules/** folder — 30 ModuleScripts in dependency order:
  - DataStoreV2, SecurityLayer, LedgerSchema, EconomyManager, AnalyticsService
  - QuestionBankV2, EloManager, CombatSystem, WaveManager, EnemyFactory
  - RewardBridge, DailyRewards, AnomalyDetector, MonetizationServer
  - GamePassConfig, DevProductsConfig, GachaManager, BattlePass
  - TradeManager, ChallengeManager, LeaderboardManager, GuildManager
  - WorldBoss, PrestigeManager, ReferralSystem, ReceiptRouter
  - MonetizationOrchestrator, EnglishRewardsManager, FTUEController
  - CosmeticController, ServerGateway

### StarterPlayerScripts (6 modules)
- **UnifiedClient.lua** — Client boot script (LocalScript)
- **Modules/** folder — 5 ModuleScripts:
  - ClientBridge, HUDController_v2, MobileInputController, CodexClient, CodexData

### ReplicatedStorage
- **SharedConfig/** — QuestionBank.lua (shared data both sides can read)
- **RemoteEvents/** — 22 pre-created RemoteEvent instances
- **RemoteFunctions/** — 5 pre-created RemoteFunction instances

### Legacy Modules (EXCLUDED from project.json)
These files exist in CODE/ but are NOT mapped:

| File | Superseded By |
|------|---------------|
| GameMain_PHASE1_REVISED.lua | UnifiedServer.lua |
| HUDController_PHASE1_REVISED.lua | HUDController_v2.lua |
| MainServer_v2.lua | UnifiedServer.lua |
| FTUEManager.lua | FTUEController.lua |
| FTUEWiring.lua | FTUEController.lua |

---

## 🔧 Required Setup (One-Time)

### 1. Roblox Open Cloud API Key
1. Go to https://create.roblox.com/credentials
2. Create a new API key with:
   - **Name:** `github-deploy` (or any descriptive name)
   - **Permissions:** `universe.place:write` for Universe `9945984154`
   - **IP Allowlist:** Leave blank (GitHub Actions IPs rotate)
   - **Expiration:** Set appropriately
3. Copy the generated key

### 2. GitHub Secret
1. Go to repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. **Name:** `ROBLOX_API_KEY`
4. **Value:** Paste the Open Cloud API key from step 1
5. Save

### 3. Verify IDs
- **Universe ID:** `9945984154` (set as default in workflow)
- **Place ID:** `83007032761005` (set as default in workflow)
- If these change, update the defaults in `.github/workflows/roblox-place-deploy.yml`

---

## 🚀 How to Deploy

### Manual Deploy (workflow_dispatch)
1. Go to repo → Actions → "Roblox Place Deploy"
2. Click "Run workflow"
3. Confirm Universe ID and Place ID (defaults pre-filled)
4. Click "Run workflow" (green button)
5. Watch the job — ~1-2 minutes to complete
6. On success: place is live on Roblox

### Auto Deploy (future enhancement)
To deploy on every push to main, add this trigger to the workflow:
```yaml
on:
  push:
    branches: [main]
    paths:
      - 'CANON/TRAIN-67/CODE/**'
      - 'default.project.json'
  workflow_dispatch:
    # ... existing inputs
```

**⚠️ Only enable auto-deploy after confirming manual deploy works correctly.**

---

## ⚠️ Known Issues & Fixes

### Script Type Detection
Rojo determines script type by file extension:
- `.lua` → **ModuleScript** (default)
- `.server.lua` → **Script** (server boot)
- `.client.lua` → **LocalScript** (client boot)

**Current state:** UnifiedServer.lua and UnifiedClient.lua are `.lua` files, so Rojo maps them as ModuleScripts. This means the boot scripts won't auto-run.

**Fix (choose one):**

**Option A — Rename files (recommended):**
```bash
git mv CANON/TRAIN-67/CODE/UnifiedServer.lua CANON/TRAIN-67/CODE/UnifiedServer.server.lua
git mv CANON/TRAIN-67/CODE/UnifiedClient.lua CANON/TRAIN-67/CODE/UnifiedClient.client.lua
```
Then update `default.project.json` paths accordingly.

**Option B — Init file wrappers:**
Create `CANON/TRAIN-67/CODE/ServerBoot/init.server.lua`:
```lua
require(script.Parent:WaitForChild("UnifiedServer"))
```
And map the directory in project.json.

**Option A is simpler and cleaner.**

### HTML Entity Artifacts
All `&gt;` / `&lt;` / `&amp;` entities were sanitized in commit `6b49d3c3`. If you see new ones after editing, run:
```bash
find CANON/TRAIN-67/CODE -name '*.lua' -exec grep -l '&gt;\|&lt;\|&amp;' {} \;
```

### Placeholder Product IDs
All GamePass and DevProduct IDs in `GamePassConfig.lua` and `DevProductsConfig.lua` are set to `0`. Before publishing:
1. Create real products in Roblox Creator Dashboard
2. Replace the `0` IDs with real ones
3. Commit and deploy

### Rate Limits
Roblox Open Cloud API has rate limits:
- **Place publishing:** ~10 requests per minute per universe
- If deploy fails with 429, wait and retry
- The workflow does NOT currently auto-retry on rate limits

---

## 🔍 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `ROBLOX_API_KEY secret is not set` | Secret not configured in GitHub | Add secret per setup instructions |
| `universeId or placeId is blank` | Inputs cleared | Use default values or enter correct IDs |
| HTTP 401 on publish | API key expired or wrong permissions | Regenerate key with `universe.place:write` |
| HTTP 403 on publish | IP not allowed or wrong universe | Check API key IP allowlist; verify universe ID |
| HTTP 404 on publish | Wrong place ID | Verify place ID in Creator Dashboard |
| `rojo build` fails | Missing module referenced in project.json | Check all `$path` entries point to existing files |
| Build succeeds but game broken | Script types wrong (ModuleScript vs Script) | Rename boot scripts to `.server.lua` / `.client.lua` |
| `Rojo not found` | Install step failed | Check Rojo release URL, may need version bump |

---

## 📋 Deploy Checklist (Pre-First-Deploy)

- [ ] Roblox Open Cloud API key created with `universe.place:write`
- [ ] `ROBLOX_API_KEY` secret added to GitHub repo
- [ ] Universe ID confirmed: `9945984154`
- [ ] Place ID confirmed: `83007032761005`
- [ ] Boot scripts renamed: `UnifiedServer.server.lua`, `UnifiedClient.client.lua`
- [ ] `default.project.json` paths updated after rename
- [ ] Placeholder product IDs replaced (GamePassConfig, DevProductsConfig)
- [ ] Manual workflow_dispatch test run — confirm green ✅
- [ ] Open Roblox Studio → play test the published place
- [ ] Mobile device test — touch inputs work

---

## 📊 Module Inventory

| Category | Active | Legacy | Total Size |
|----------|--------|--------|-----------|
| Server modules | 31 | 3 | ~533KB active |
| Client modules | 6 | 1 | ~100KB active |
| Shared (ReplicatedStorage) | 1 | 1 | ~36KB active |
| RemoteEvents | 22 | — | (Rojo-created) |
| RemoteFunctions | 5 | — | (Rojo-created) |
| **Totals** | **38 + 27 instances** | **5** | **~669KB active** |

---

## 🔄 Local Development Workflow

### Install Rojo locally
```bash
# macOS/Linux
curl -sL -o rojo.zip https://github.com/rojo-rbx/rojo/releases/download/v7.6.1/rojo-7.6.1-linux-x86_64.zip
unzip rojo.zip -d ~/.local/bin
chmod +x ~/.local/bin/rojo

# Or via aftman (recommended)
aftman add rojo-rbx/rojo@7.6.1
```

### Build locally
```bash
rojo build default.project.json -o build.rbxl
```

### Live sync to Studio
```bash
rojo serve default.project.json
```
Then in Studio: Plugins → Rojo → Connect. Changes sync live.

### Test before deploy
1. `rojo build` locally — confirm no errors
2. Open `build.rbxl` in Studio — verify tree structure
3. Play test in Studio — confirm boot sequence
4. Then push to GitHub → run workflow → publish to Roblox

---

## 🔮 Future Enhancements

1. **Auto-deploy on push** — trigger on `main` branch pushes to `CANON/TRAIN-67/CODE/**`
2. **Staging place** — deploy to a separate staging place ID first, then promote to production
3. **Version tagging** — tag releases with version numbers, deploy specific versions
4. **Luau type checking** — add `selene` or `luau-lsp` linting to the workflow
5. **Test runner** — add automated Lua tests before deploy
6. **Multi-place** — extend workflow for multiple places (lobby, main game)

---

*Cross-repo sources: Phoenix-Rising-Protocol-Ultimate (workflow, project.json, 41 CODE modules, StudioModulePlacementMap). No content found in Phoenix-Rise-Immortalize- or NET-Ai-EcoSystem-CommandStation for this artifact.*
