# PHOENIXSCOUT CHECKPOINT — Train-67 Roblox Deployment Readiness
**Run:** Incarnate-27 / Session 2026-08-13
**Timestamp:** 2026-08-13T20:48:53+07:00
**Stage:** PhoenixSCOUT (Stage 2) — DEPLOYMENT READINESS AUDIT
**Mandate:** Verify actual Roblox deployment pipeline state against documented claims. Leave pheromone trail. No execution.
**Scout:** /PhoenixRISE (Incarnate-27-Phoenix-RISING-GAME-DEVELOPMENT)

---

## MISSION CONTEXT

Session 21 scouted the Train-67 legacy territory and identified the deployment pipeline as "configured but blocked on ROBLOX_API_KEY". Session 25 audited sessions 21-24 and noted the same blockers. This scout verifies the ACTUAL current state of the deployment infrastructure, not the documented state.

---

## DEPLOYMENT PIPELINE AUDIT

### 1. GitHub Actions Workflow

| Component | Status | Evidence |
|-----------|--------|----------|
| Workflow file | ✅ EXISTS | `.github/workflows/roblox-place-deploy.yml` — 87 lines, valid YAML |
| Trigger | ⚠️ MANUAL ONLY | `workflow_dispatch` — no auto-deploy on push |
| Rojo install | ✅ CONFIGURED | Downloads Rojo v7.6.1 linux-x86_64 |
| Build step | ✅ CONFIGURED | `rojo build default.project.json -o build.rbxl` |
| Publish step | ✅ CONFIGURED | POST to Roblox Open Cloud API with retry logic |
| Secret reference | ✅ REFERENCED | `${{ secrets.ROBLOX_API_KEY }}` |
| Fail-closed check | ✅ PRESENT | Lines 49-52: exits if `ROBLOX_API_KEY` is blank |
| Artifact upload | ❌ MISSING | No `actions/upload-artifact` — build.rbxl is ephemeral |
| Auto-trigger | ❌ MISSING | No `push` trigger — manual dispatch only |

**Verdict:** Workflow is syntactically valid and logically complete, but only as a manual trigger. No continuous deployment.

### 2. Rojo Configuration

| Component | Status | Evidence |
|-----------|--------|----------|
| Project file | ✅ EXISTS | `default.project.json` — 114 lines |
| Name | ✅ CORRECT | `Train67-BrainrotSurvival` |
| ServerScriptService | ✅ MAPPED | UnifiedServer + 30 ModuleScripts |
| StarterPlayerScripts | ✅ MAPPED | UnifiedClient + 5 ModuleScripts |
| ReplicatedStorage | ✅ MAPPED | SharedConfig + 22 RemoteEvents + 5 RemoteFunctions |
| Path resolution | ✅ ALL VALID | All 45 `$path` entries resolve to existing files |
| Legacy files | ⚠️ EXCLUDED | 6 legacy `.lua` files not mapped (documented superseded) |
| Boot script types | ✅ CORRECT | `UnifiedServer.server.lua` / `UnifiedClient.client.lua` — correct extensions |

**Verdict:** Rojo config is valid and complete. All mapped paths resolve. Boot script type detection issue from earlier docs has been resolved.

### 3. Roblox Credentials & Secrets

| Secret | Status | Evidence |
|--------|--------|----------|
| `ROBLOX_API_KEY` | 🔴 NOT FOUND | Not in repo, not in `.env`, not in Windows env vars |
| `.ROBLOSECURITY` | 🔴 NOT FOUND | No cookie file found |
| `ROBLOX_COOKIE` | 🔴 NOT FOUND | No cookie reference in active code |
| `ROBLOX_PASSWORD` | 🔴 NOT FOUND | Not found anywhere |
| `ROBLOX_USERNAME` | 🔴 NOT FOUND | Not found anywhere |
| `rbxsign` token | 🔴 NOT FOUND | Not found anywhere |

**Local secret scan:**
- `.env` contains `DEEPGRAM_API_KEY`, `DEEPSEEK_API_KEY` — NOT Roblox-related
- `.secrets.local` contains `WORKER_ADMIN_KEY` — Cloudflare Worker admin key, NOT Roblox
- Windows User/Machine env vars: no Roblox credentials found

**GitHub Secrets status:**
- Workflow references `${{ secrets.ROBLOX_API_KEY }}`
- `SYNCH-STATE.md` lists Roblox as "✅ SET" — **MISLEADING** (tracks local MCP tokens, not GitHub Secrets)
- `GITHUB-OWNERSHIP-RECOVERY-PLAYBOOK.md` flags it as "⚠️ Not confirmed in secrets list"
- Multiple reincarnation docs (2026-04-01) list it as pending/overdue

**Verdict:** `ROBLOX_API_KEY` is the single critical blocker. No fallback credentials exist. The workflow will fail-closed immediately without it.

### 4. Product IDs (Monetization)

| Config File | Status | Details |
|-------------|--------|---------|
| `GamePassConfig.lua` | 🔴 PLACEHOLDER | 5 GamePass IDs all = `0` |
| `DevProductsConfig.lua` | 🔴 PLACEHOLDER | 16 DevProduct IDs all = `0` |
| Total placeholder IDs | 🔴 21 | All monetization products non-functional |
| Receipt processing | ⚠️ BROKEN | `ReceiptRouter.lua` exists but products have no real IDs |
| Dual ProcessReceipt conflict | ⚠️ DOCUMENTED | `GamePassConfig.lua` and `DevProductsConfig.lua` both set `MarketplaceService.ProcessReceipt` — documented in 2026-04-01-receipt-router-migration-patch.md |

**Verdict:** Even if deployment succeeds, the game cannot process purchases. All 21 monetization IDs must be created in Roblox Creator Dashboard and wired in before launch.

### 5. Build Artifacts

| Artifact | Status | Location | Details |
|----------|--------|----------|---------|
| Legacy build | ✅ EXISTS | `CANON/GAME-DESIGN/train67-brainrot-survival.rbxl` | 244 KB, built 2026-04-20 |
| CI build artifact | ❌ MISSING | `build.rbxl` at repo root | Not committed, ephemeral in CI |
| GitHub Actions artifact | ❌ MISSING | N/A | No `actions/upload-artifact` step |
| Local build | ❌ NOT VERIFIED | N/A | No evidence of successful local Rojo build |

**Verdict:** No persistent, versioned build artifact exists. The CI build is ephemeral and not downloadable for testing.

### 6. Codebase State vs Documentation

| Documented Claim | Actual State | Delta |
|------------------|--------------|-------|
| 41 Lua modules | 47 `.lua` files | +6 legacy unmapped files |
| Boot scripts `.lua` | `.server.lua` / `.client.lua` | ✅ FIXED — correct extensions |
| Code 85% ship-ready | Critical issues remain | Combat, economy, anti-cheat gaps per March 2026 battle report |
| Placeholder IDs "soon" | Still `0` after 4+ months | 🔴 BLOCKER — no progress |
| ROBLOX_API_KEY "pending" | Still not found | 🔴 BLOCKER — no progress |

---

## OPEN ITEMS FROM PRIOR SCOUTS

| # | Item | Source | Status |
|---|------|--------|--------|
| 1 | Verify GitHub commit history | Session 21 scout | NOT_WALKED |
| 2 | Verify Rojo sync status | Session 21 scout | PARTIAL — config valid, sync not tested |
| 3 | Verify Product ID status | Session 21 scout | CONFIRMED — all 21 IDs = 0 |
| 4 | Verify publish status | Session 21 scout | NOT_WALKED — no evidence of published game |
| 5 | Verify Discord server | Session 21 scout | NOT_WALKED |
| 6 | Activate Meshy Pro subscription | Session 27 pipeline | PENDING — Lane A blocker |
| 7 | Configure local TripoSR | Session 27 pipeline | PENDING — Lane A blocker |
| 8 | Deploy Quan curriculum | Session 27 pipeline | PENDING — Lane B blocker |

---

## SCOUT VERDICT

**The Roblox deployment pipeline is DOCUMENTED, NOT ALIVE.**

Evidence:
1. `ROBLOX_API_KEY` is the single critical blocker — not found anywhere
2. All 21 Product IDs are placeholder `0` — purchases will fail at runtime
3. No persistent build artifact exists for testing
4. No auto-deploy — manual only
5. Critical code issues remain unresolved (combat, economy, anti-cheat)
6. Recent phetrails explicitly defer Train-67 as NOT_WALKED

**What works:**
- Rojo config is valid and complete
- All mapped file paths resolve
- Boot scripts have correct extensions
- GitHub Actions workflow is syntactically valid
- Legacy build artifact exists (244KB, 2026-04-20)

**What doesn't work:**
- Cannot deploy without `ROBLOX_API_KEY`
- Cannot process purchases without real Product IDs
- Cannot test locally without building `build.rbxl`
- Cannot auto-deploy on code changes

**Next actions required for alive pipeline:**
1. Set `ROBLOX_API_KEY` GitHub Secret
2. Create 21 Product IDs in Roblox Creator Dashboard
3. Wire real IDs into `GamePassConfig.lua` + `DevProductsConfig.lua`
4. Resolve dual `ProcessReceipt` conflict
5. Fix critical code issues (combat, economy, anti-cheat)
6. Add `actions/upload-artifact` to preserve `build.rbxl`
7. Add auto-deploy trigger on push to main

---

[PhoenixSCOUT] Stage 2 checkpoint complete.
Run: Incarnate-27 / 2026-08-13
Findings: 3 CRITICAL blockers, 2 HIGH warnings, 1 MEDIUM delta
Mission: Train-67 Roblox deployment readiness audit — PIPELINE DOCUMENTED BUT NOT ALIVE
Handoff: FORCEMARCH or next RISE
