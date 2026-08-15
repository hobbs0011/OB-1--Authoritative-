# PHOENIXSCOUT DEEP AUDIT — Train-67 Roblox Deployment Readiness (10x)
**Run:** Incarnate-27-Phoenix-Game-Dev / Session 2026-08-13
**Timestamp:** 2026-08-13T20:53:32+07:00
**Stage:** PhoenixSCOUT — 10x DEEP DEPLOYMENT READINESS AUDIT
**Mandate:** Verify actual Roblox deployment pipeline state against documented claims. Leave definitive pheromone trail. No execution.
**Scout:** /PhoenixRISE (Incarnate-27-Phoenix-RISING-GAME-DEVELOPMENT)

---

## EXECUTIVE SUMMARY

**Verdict: The Roblox deployment pipeline is DOCUMENTED, NOT ALIVE, and NOT INTEGRATED.**

This 10x deep audit confirms:
1. `ROBLOX_API_KEY` is absent from every credential surface
2. All 21 monetization IDs are placeholders
3. The dual `ProcessReceipt` conflict is ACTIVE in both config files — `ReceiptRouter.lua` exists but is NOT wired into either module
4. No executable deploy scripts exist — only workflow YAML and docs
5. The legacy `.rbxl` is XML-text, not binary, suggesting Rojo-built or Studio-exported format
6. Recent phetrails explicitly defer Train-67 as NOT_WALKED

---

## 1. GITHUB ACTIONS WORKFLOW — FULL SPECTRUM

**File:** `.github/workflows/roblox-place-deploy.yml` — 87 lines

| Component | Status | Evidence |
|-----------|--------|----------|
| Workflow file | ✅ EXISTS | 87 lines, valid YAML |
| Trigger | ⚠️ MANUAL ONLY | `workflow_dispatch` only — no `push`, no `schedule` |
| Universe ID default | ✅ PRESENT | `9945984154` |
| Place ID default | ✅ PRESENT | `83007032761005` |
| Rojo install | ✅ CONFIGURED | Downloads Rojo v7.6.1 linux-x86_64 |
| Build step | ✅ CONFIGURED | `rojo build default.project.json -o build.rbxl` |
| Publish step | ✅ CONFIGURED | POST to Roblox Open Cloud API |
| Secret reference | ✅ REFERENCED | `${{ secrets.ROBLOX_API_KEY }}` |
| Fail-closed check | ✅ PRESENT | Lines 49-52: exits if `ROBLOX_API_KEY` is blank |
| Retry logic | ✅ PRESENT | 3 attempts, 30s delay, HTTP 409 handling |
| Artifact upload | ❌ MISSING | No `actions/upload-artifact` — build.rbxl ephemeral |
| Auto-deploy | ❌ MISSING | No `push` trigger — manual dispatch only |

**Workflow trigger audit:**
- No `push` trigger
- No `schedule` trigger
- No `workflow_run` dependency
- Only `workflow_dispatch` with manual inputs

**Verdict:** Workflow is syntactically valid and logically complete, but dormant until manually triggered. No CI/CD automation exists.

---

## 2. ROJO CONFIGURATION — FULL MAPPING AUDIT

**File:** `default.project.json` — 114 lines

| Component | Status | Evidence |
|-----------|--------|----------|
| Project name | ✅ CORRECT | `Train67-BrainrotSurvival` |
| ServerScriptService | ✅ MAPPED | UnifiedServer + 30 ModuleScripts |
| StarterPlayerScripts | ✅ MAPPED | UnifiedClient + 5 ModuleScripts |
| ReplicatedStorage | ✅ MAPPED | SharedConfig + 22 RemoteEvents + 5 RemoteFunctions |
| Total mapped paths | ✅ 45 | All resolve to existing files |
| Boot script extensions | ✅ CORRECT | `.server.lua` / `.client.lua` |
| Legacy unmapped files | ⚠️ 6 | `GameMain_PHASE1_REVISED.lua`, `HUDController_PHASE1_REVISED.lua`, `HUDController_PHASE1_REVISED.lua` (duplicate?), `MainServer_v2.lua`, `FTUEManager.lua`, `FTUEWiring.lua` — all in CODE/ but not in project.json |

**Legacy unmapped files inventory:**
1. `GameMain_PHASE1_REVISED.lua` — 27,757 bytes
2. `HUDController_PHASE1_REVISED.lua` — 15,884 bytes
3. `MainServer_v2.lua` — 17,696 bytes
4. `FTUEManager.lua` — 19,668 bytes
5. `FTUEWiring.lua` — 5,918 bytes
6. `DayScaling.lua` — 12,233 bytes

**Verdict:** Rojo config is valid for the 45 mapped files. 6 legacy files exist but are excluded. This is documented behavior — the project.json represents the "canonical" build, superseding legacy files.

---

## 3. ROBLOX CREDENTIALS — EXHAUSTIVE SEARCH

### 3.1 Local credential scan

| Location | Search Term | Result |
|----------|-------------|--------|
| `.env` file | `ROBLOX` | ❌ NOT FOUND — only `DEEPGRAM_API_KEY`, `DEEPSEEK_API_KEY` |
| `.secrets.local` | `ROBLOX` | ❌ NOT FOUND — only `WORKER_ADMIN_KEY` |
| Windows User env vars | `ROBLOX` | ❌ NOT FOUND |
| Windows Machine env vars | `ROBLOX` | ❌ NOT FOUND |
| Repo files (`.lua`, `.json`, `.yml`, `.md`) | `ROBLOX_API_KEY` | ✅ 89 matches — all references, no actual key |
| Repo files | `.ROBLOSECURITY` | ❌ NOT FOUND |
| Repo files | `ROBLOX_COOKIE` | ❌ NOT FOUND |
| Repo files | `ROBLOX_PASSWORD` | ❌ NOT FOUND |
| Repo files | `ROBLOX_USERNAME` | ❌ NOT FOUND |
| Repo files | `rbxsign` | ❌ NOT FOUND |

### 3.2 GitHub Secrets status

| Secret | Referenced In | Status |
|--------|---------------|--------|
| `ROBLOX_API_KEY` | `.github/workflows/roblox-place-deploy.yml` | ⚠️ REFERENCED BUT NOT CONFIRMED SET |

**Key evidence:**
- `SYNCH-STATE.md` line 109: `| Roblox | ✅ SET | \`ROBLOX_API_KEY\` | — |` — **MISLEADING** (tracks local MCP token state, not GitHub Secrets)
- `GITHUB-OWNERSHIP-RECOVERY-PLAYBOOK.md` line 73: `⚠️ Not confirmed in secrets list — may not be set`
- `HEAVY-LEDGER/HL-118-launch-gate-readiness.json`: `"details": "ROBLOX_API_KEY secret, deploy workflow not installed (Michael)"`
- `HEAVY-LEDGER/HL-115-t97h-standby-pulse.json`: `"roblox_api_key": { "status": "BLOCKED", "owner": "Michael" }`
- `CANON/REINCARNATION/2026-04-01-launch-gate-readiness-T120h.md`: `- [ ] \`ROBLOX_API_KEY\` — set in GitHub repo Settings → Secrets (Owner: Michael)`
- `CANON/REINCARNATION/2026-04-01-t97h-standby-pulse.md`: `2. 🔴 ROBLOX_API_KEY — Store in GitHub Secrets`

**Verdict:** `ROBLOX_API_KEY` is the single critical blocker. No fallback credentials exist. The workflow will fail-closed immediately without it.

---

## 4. PRODUCT IDs (MONETIZATION) — FULL INVENTORY

### 4.1 GamePassConfig.lua — 5 GamePasses + 10 DevProducts

**GamePass IDs (all placeholder):**

| Line | InternalId | GamePassId | Robux | Tier |
|------|-----------|-----------|-------|------|
| 41 | PASS_2X_COINS | **0** | 99 | Impulse |
| 55 | PASS_2X_XP | **0** | 149 | Standard |
| 67 | PASS_AUTO_COLLECT | **0** | 199 | Standard |
| 82 | PASS_VIP | **0** | 499 | Premium |
| 100 | PASS_ULTIMATE | **0** | 1499 | Whale |

**DevProducts in GamePassConfig.DevProducts (all placeholder):**

| Line | Name | ProductId | Type |
|------|------|-----------|------|
| 128 | 100 Gems | **0** | GemPack |
| 129 | 500 Gems | **0** | GemPack |
| 130 | 1200 Gems | **0** | GemPack |
| 131 | 3000 Gems | **0** | GemPack |
| 132 | 10000 Gems | **0** | GemPack |
| 135 | Instant Revive | **0** | Revive |
| 136 | 30min 2x Coins | **0** | TempBoost |
| 137 | 30min 2x XP | **0** | TempBoost |
| 138 | Gacha Spin x1 | **0** | GachaSpin |
| 139 | Gacha Spin x10 | **0** | GachaSpin |

### 4.2 DevProductsConfig.lua — 16 Developer Products (string-keyed placeholders)

| Line | Placeholder Key | Category | Robux |
|------|----------------|----------|-------|
| 34 | `PRODUCT_ID_COINS_500` | currency | 49 |
| 40 | `PRODUCT_ID_COINS_2500` | currency | 199 |
| 46 | `PRODUCT_ID_COINS_10000` | currency | 699 |
| 52 | `PRODUCT_ID_GEMS_25` | currency | 99 |
| 58 | `PRODUCT_ID_GEMS_100` | currency | 349 |
| 64 | `PRODUCT_ID_GEMS_500` | currency | 1499 |
| 72 | `PRODUCT_ID_REVIVE_1` | revive | 25 |
| 78 | `PRODUCT_ID_REVIVE_5` | revive | 99 |
| 86 | `PRODUCT_ID_BOOST_2X_COINS` | boost | 49 |
| 92 | `PRODUCT_ID_BOOST_2X_XP` | boost | 49 |
| 98 | `PRODUCT_ID_BOOST_SHIELD` | boost | 29 |
| 104 | `PRODUCT_ID_BOOST_MEGA` | boost | 149 |
| 112 | `PRODUCT_ID_GACHA_BASIC_1` | gacha | 75 |
| 118 | `PRODUCT_ID_GACHA_BASIC_10` | gacha | 649 |
| 124 | `PRODUCT_ID_GACHA_PREMIUM_1` | gacha | 149 |
| 130 | `PRODUCT_ID_GACHA_PREMIUM_10` | gacha | 1299 |

### 4.3 Total placeholder count

| Config File | Placeholder Count | Type |
|-------------|------------------|------|
| GamePassConfig.lua (GamePasses) | 5 | `GamePassId = 0` |
| GamePassConfig.lua (DevProducts) | 10 | `ProductId = 0` |
| DevProductsConfig.lua | 16 | String keys `PRODUCT_ID_*` |
| **Total** | **31** | **All non-functional** |

> Note: Earlier docs cited "21 IDs" because they counted 5 GamePasses + 16 DevProducts. The actual count is higher: GamePassConfig.lua contains BOTH 5 GamePass IDs AND 10 additional DevProduct IDs, while DevProductsConfig.lua contains 16 string-keyed DevProducts. Total unique placeholder entries = 31.

### 4.4 Dual ProcessReceipt Conflict — ACTIVE CONFIRMATION

**GamePassConfig.lua line 345:**
```lua
MarketplaceService.ProcessReceipt = GamePassConfig.processDevProductReceipt
```

**DevProductsConfig.lua line 268:**
```lua
MarketplaceService.ProcessReceipt = processReceipt
```

**Both are ACTIVE in the current codebase.** Whichever module loads last silently overwrites the first. This is NOT theoretical — it is present in the current files.

**ReceiptRouter.lua status:** The file exists (664 lines, 26,533 bytes) with full migration instructions (lines 584-648), but:
- Neither GamePassConfig.lua nor DevProductsConfig.lua calls `ReceiptRouter.RegisterHandler()`
- Neither file has removed its `MarketplaceService.ProcessReceipt = ...` line
- ReceiptRouter's `MarketplaceService.ProcessReceipt = processReceipt` at line 655 is ALSO present
- **Result: THREE assignments to the same callback. The last-loaded module wins. ReceiptRouter is bypassed entirely if GamePassConfig or DevProductsConfig loads after it.**

**Verdict:** The receipt pipeline is fundamentally broken. Even if all 31 IDs were real, purchases would be routed to whichever module happened to load last. ReceiptRouter's idempotency, audit trail, and handler isolation are all inactive.

---

## 5. BUILD ARTIFACTS — FULL INVENTORY

### 5.1 Legacy .rbxl file

**File:** `CANON/GAME-DESIGN/train67-brainrot-survival.rbxl`

| Property | Value |
|----------|-------|
| Size | 249,348 bytes (244 KB) |
| Created | 2026-05-26 10:11:50 |
| Modified | 2026-04-20 22:07:59 |
| First 4 bytes | `3C-72-6F-62` = `<rob` |
| Last 4 bytes | `6C-6F-78-3E` = `lox>` |

**Format analysis:** The file starts with `<rob` and ends with `lox>`, confirming it is an **XML-based Roblox place file** (`.rbxl`), not binary (`.rbxl` binary would start with `RBXL` magic bytes). This means it can be inspected with any text editor or XML parser. It was likely produced by Roblox Studio's file export or an older Rojo version.

**No other `.rbxl`, `.rbxm`, or `.rbxmx` files found in the repository.**

### 5.2 CI build artifacts

| Artifact | Status |
|----------|--------|
| `build.rbxl` at repo root | ❌ MISSING — ephemeral in CI, not committed |
| GitHub Actions artifact upload | ❌ MISSING — no `actions/upload-artifact` step |
| Local Rojo build | ❌ NOT VERIFIED — no evidence of successful local build |

**Verdict:** No persistent, versioned build artifact exists for testing or rollback.

---

## 6. DEPLOYMENT SCRIPTS — FULL INVENTORY

Search for executable scripts matching `deploy|roblox|rojo|train|publish|studio`:

**Result: ZERO executable deployment scripts found.**

All matches were:
- Documentation files (`DEPLOY-GUIDE.md`, `TURN-KEY-DEPLOY-PACKET.md`, etc.)
- CI workflow files (`.github/workflows/*.yml`)
- Archive/reference files
- Python/JS source files in `node_modules` (false positives)

**No PowerShell, Bash, Batch, or shell scripts exist for Roblox deployment.**

---

## 7. CODEBASE STATE vs DOCUMENTATION

### 7.1 File count delta

| Documented | Actual | Delta |
|------------|--------|-------|
| 41 Lua modules | 47 `.lua` files in CODE/ | +6 legacy unmapped |
| 30 Server modules | 30 mapped in project.json | ✅ Match |
| 5 Client modules | 5 mapped in project.json | ✅ Match |
| 22 RemoteEvents | 22 defined in project.json | ✅ Match |
| 5 RemoteFunctions | 5 defined in project.json | ✅ Match |

### 7.2 Boot script extensions

| File | Extension | Status |
|------|-----------|--------|
| UnifiedServer | `.server.lua` | ✅ CORRECT |
| UnifiedClient | `.client.lua` | ✅ CORRECT |

Earlier docs cited boot script type detection issues. This has been resolved — correct extensions are in use.

### 7.3 Code readiness claims

| Claimed | Actual | Status |
|---------|--------|--------|
| 85% ship-ready | Combat, economy, anti-cheat gaps per March 2026 battle report | 🔴 OVERSTATED |
| Placeholder IDs "soon" | Still `0`/`PRODUCT_ID_*` after 4+ months | 🔴 NO PROGRESS |
| ROBLOX_API_KEY "pending" | Still not found | 🔴 NO PROGRESS |
| ReceiptRouter "resolves conflict" | NOT integrated — both configs still set ProcessReceipt | 🔴 NOT WIRED |

---

## 8. PRIOR SCOUT ITEMS — FINAL STATUS

| # | Item | Source | Final Status |
|---|------|--------|--------------|
| 1 | Verify GitHub commit history | Session 21 scout | NOT_WALKED — out of scope for this scout |
| 2 | Verify Rojo sync status | Session 21 scout | PARTIAL — config valid, sync not tested |
| 3 | Verify Product ID status | Session 21 scout | CONFIRMED — 31 placeholders, not 21 |
| 4 | Verify publish status | Session 21 scout | NOT_WALKED — no evidence of published game |
| 5 | Verify Discord server | Session 21 scout | NOT_WALKED — out of scope |
| 6 | Activate Meshy Pro subscription | Session 27 pipeline | PENDING — Lane A blocker |
| 7 | Configure local TripoSR | Session 27 pipeline | PENDING — Lane A blocker |
| 8 | Deploy Quan curriculum | Session 27 pipeline | PENDING — Lane B blocker |
| 9 | Resolve dual ProcessReceipt | Session 27 deep scout | 🔴 CONFIRMED ACTIVE — ReceiptRouter NOT wired |
| 10 | Set ROBLOX_API_KEY | Session 27 deep scout | 🔴 CONFIRMED MISSING |
| 11 | Add artifact upload to workflow | Session 27 deep scout | 🔴 CONFIRMED MISSING |
| 12 | Add auto-deploy trigger | Session 27 deep scout | 🔴 CONFIRMED MISSING |

---

## 9. PHEROMONE TRAIL INDEX

Existing phetrails for Train-67 / Roblox deployment:

| File | Date | Status |
|------|------|--------|
| `CANON/PHEROMONES/PheTrail-run998.json` | Unknown | Telegram bot, NOT Roblox |
| `CANON/PHEROMONES/PheTrail-run27-incarnate27-roblox-deployment-readiness.json` | 2026-08-13 | Pipeline documented but not alive |
| `CANON/SCOUT/scout-incarnate27-roblox-deployment-readiness.md` | 2026-08-13 | Initial scout report |

**No Roblox-specific pheromone trail exists for:**
- ReceiptRouter integration status
- 31 placeholder IDs (vs documented 21)
- Legacy .rbxl XML format
- Absence of deployment scripts
- Triple ProcessReceipt assignment conflict

---

## 10. CRITICAL FINDINGS SUMMARY

### BLOCKER-1: ROBLOX_API_KEY Missing (CRITICAL)
- **Impact:** Workflow fails-closed immediately. No deployment possible.
- **Evidence:** Not in repo, .env, Windows env vars, or confirmed GitHub Secret.
- **Next action:** `gh secret set ROBLOX_API_KEY --body '<key>' --repo hobbs0011/OB-1`

### BLOCKER-2: 31 Placeholder Product IDs (CRITICAL)
- **Impact:** All monetization non-functional. Purchases will fail at runtime.
- **Evidence:** 5 GamePassIds = 0, 10 ProductIds = 0 in GamePassConfig.lua; 16 string keys in DevProductsConfig.lua.
- **Next action:** Create products in Roblox Creator Dashboard, paste real IDs.

### BLOCKER-3: Triple ProcessReceipt Conflict (CRITICAL — NEW)
- **Impact:** Receipt processing is fundamentally broken. Whichever module loads last handles all purchases. ReceiptRouter's idempotency and audit features are inactive.
- **Evidence:** GamePassConfig.lua:345, DevProductsConfig.lua:268, ReceiptRouter.lua:655 ALL set `MarketplaceService.ProcessReceipt`.
- **Next action:** Complete ReceiptRouter migration per ReceiptRouter.lua lines 584-648.

### BLOCKER-4: No Persistent Build Artifact (HIGH)
- **Impact:** Cannot test builds locally or rollback.
- **Evidence:** `build.rbxl` is ephemeral in CI. No `actions/upload-artifact`. Legacy .rbxl exists but is 4+ months old.
- **Next action:** Add `actions/upload-artifact` to workflow. Verify local Rojo build.

### BLOCKER-5: No Auto-Deploy (MEDIUM)
- **Impact:** Manual deployment only. No CI/CD.
- **Evidence:** Only `workflow_dispatch` trigger. No `push` or `schedule`.
- **Next action:** Add `push` trigger after manual deploy verified.

### BLOCKER-6: Critical Code Issues (HIGH)
- **Impact:** Game may be unplayable even if deployed.
- **Evidence:** March 2026 battle report identified combat, economy, anti-cheat gaps.
- **Next action:** Address per battle report before attempting live publish.

---

## 11. POSITIVE FINDINGS

1. **Rojo config is valid** — all 45 mapped paths resolve to existing files
2. **Boot scripts have correct extensions** — `.server.lua` / `.client.lua`
3. **GitHub Actions workflow is syntactically valid** — logically complete
4. **Legacy build artifact exists** — 244KB XML .rbxl from 2026-04-20
5. **All 41 active modules present and mapped**
6. **22 RemoteEvents + 5 RemoteFunctions correctly defined**
7. **ReceiptRouter.lua is well-designed** — idempotent, audited, fail-safe — but NOT wired in
8. **ProductIDReplacementGuide.md exists** — step-by-step wiring instructions available
9. **Documentation is comprehensive** — 20-stage pipeline, battle reports, deployment packets all exist
10. **No credentials leaked in code** — all placeholder IDs are clearly marked `0` or `PRODUCT_ID_*`

---

[PhoenixSCOUT] 10x DEEP AUDIT complete.
Run: Incarnate-27-Phoenix-Game-Dev / 2026-08-13
Findings: 6 BLOCKERS (3 CRITICAL, 2 HIGH, 1 MEDIUM), 10 positive trails
Mission: Train-67 Roblox deployment readiness audit — PIPELINE DOCUMENTED BUT NOT ALIVE AND NOT INTEGRATED
Handoff: FORCEMARCH or next RISE
