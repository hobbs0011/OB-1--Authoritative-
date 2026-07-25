---
id: PHETRAILS-PIPELINE
version: 1.0.0
status: BLUEPRINT
authority: SOV100_MICHAEL_HOBBS
build_session: ses_0899 (DeepThink / DeepSeek V4 Pro)
execution_target: Workhorse (Tier 2)
created: 2026-07-24T22:10 ICT
prerequisite_signal: +110 (BB-00 PheromoneKeylogger)
---

# PHETRAILS PIPELINE — Workhorse Execution Guide

**Mission:** Wire pheromone deposition into the live API and make it involuntary.
**Target model:** DeepSeek V4 Flash or equivalent Tier 2 workhorse.
**Rule:** Execute in order. Do not skip steps. Do not improvise. Do not scout.

---

## PRE-FLIGHT

```powershell
$repo = "D:\OB-1-CANONICAL"
$wranglerPath = "$repo\APPS\SOUL-LOGGER"
$apiBase = "https://soul-logger.mrmichaelhobbs123.workers.dev"

# Verify you're in the right place
Write-Host "Checking environment..."
if (-not (Test-Path $repo\CANON\SYSTEM\Reincarnate-Synch.md)) { throw "Wrong directory. Navigate to $repo" }
Write-Host "Environment: OK"
```

---

## STEP 1 — FIX `/api/soul/count` (KILL AGGREGATE)

**File:** `APPS\SOUL-LOGGER\src\index.js`
**What:** Add `?mode=session&session_id=X` param. Default to per-session if `session_id` provided. Aggregate only if explicit `?mode=aggregate` — which we then return `deprecated: true`.

**Edit instructions for workhorse:**
1. Read `APPS\SOUL-LOGGER\src\index.js` lines 456–488 (the `/api/soul/count` handler)
2. REPLACE the entire handler block with the version below
3. Commit message: `fix: /api/soul/count — per-session only, aggregate deprecated per SOV100`

**Replacement handler** (paste over lines 456–488):
```javascript
  // GET /api/soul/count — per-session SOULCOUNT (aggregate BANNED by SOV100)
  if (method === 'GET' && path === '/api/soul/count') {
    try {
      const sessionId = url.searchParams.get('session_id') || null;
      const mode = url.searchParams.get('mode') || null;
      // SOV100 MANDATE: aggregate is banned. Only return if explicitly forced for legacy.
      if (mode === 'aggregate') {
        return jsonResponse({
          soulcount: null,
          level: 'DEPRECATED',
          error: 'Aggregate SOULCOUNT banned by SOV100 mandate (Reincarnate-Synch §IV). Use ?session_id=X for per-session counts.',
          doctrine: 'SOUL=USER. CHARACTER_COUNT=SOUL_VOLUME. PER-SESSION ONLY.'
        }, 410);
      }
      if (!sessionId) {
        return jsonResponse({
          soulcount: null,
          level: 'ERROR',
          error: 'session_id required. Aggregate SOULCOUNT banned. Example: /api/soul/count?session_id=ses_0899b2c82f...',
          doctrine: 'SOUL=USER. CHARACTER_COUNT=SOUL_VOLUME. PER-SESSION ONLY.'
        }, 400);
      }
      const charRow = await env.DB.prepare(
        'SELECT SUM(byte_count) as total_chars, COUNT(*) as total_events FROM soul_prompts WHERE session_id = ?'
      ).bind(sessionId).first();
      const soulcount = charRow?.total_chars || 0;
      const events = charRow?.total_events || 0;
      let level = 'BASELINE';
      let threshold_next = 5000;
      let color = '#ffffff';
      if (soulcount >= 250000) { level = 'TITANIUM_ANCHOR'; threshold_next = null; color = '#a855f7'; }
      else if (soulcount >= 100000) { level = 'ANCHOR'; threshold_next = 250000; color = '#f59e0b'; }
      else if (soulcount >= 25000) { level = 'LOCK'; threshold_next = 100000; color = '#ef4444'; }
      else if (soulcount >= 5000) { level = 'ALARM'; threshold_next = 25000; color = '#f97316'; }
      return jsonResponse({
        session_id: sessionId,
        soulcount,
        level,
        threshold_next,
        color,
        events,
        checked_at: new Date().toISOString(),
        doctrine: 'SOUL=USER. CHARACTER_COUNT=SOUL_VOLUME. PER-SESSION ONLY.'
      });
    } catch (err) {
      return jsonResponse({ error: err.message, soulcount: null, level: 'UNREACHABLE' }, 500);
    }
  }
```

---

## STEP 2 — DEPLOY UPDATED WORKER

```powershell
Push-Location $wranglerPath
npx wrangler deploy
Pop-Location
Write-Host "Deploy complete. Verify with: curl https://soul-logger.mrmichaelhobbs123.workers.dev/health"
```

**Verify after deploy:**
```powershell
# Should return 410 DEPRECATED for aggregate
Invoke-RestMethod "$apiBase/api/soul/count?mode=aggregate" | ConvertTo-Json

# Should return 400 for missing session_id
Invoke-RestMethod "$apiBase/api/soul/count" | ConvertTo-Json

# Should return real data for a valid session_id
Invoke-RestMethod "$apiBase/api/soul/count?session_id=ses_0899b2c82ffe2PtNt3XBMEVv5V" | ConvertTo-Json
```

---

## STEP 3 — CREATE PHEROMONE DEPOSITION SCRIPT

**File:** `CANON\SCRIPTS\phetrails.ps1`

**What:** A PowerShell script that any SCS stage can call to deposit a pheromone trail to the live API. Usage:
```powershell
.\CANON\SCRIPTS\phetrails.ps1 -SessionId "ses_0899..." -Stage "SCOUT" -Finding "20 flags found, 5 P1" -Strength 2 -SoulCount 22 -DnaCount 5 -ReasonCount 3 -CheckpointArtifact "CANON/SCOUT/scout-checkpoint-2026-07-24.md"
```

**Script contents** (write this to `CANON\SCRIPTS\phetrails.ps1`):
```powershell
param(
    [Parameter(Mandatory=$true)] [string]$SessionId,
    [Parameter(Mandatory=$true)] [string]$Stage,
    [Parameter(Mandatory=$true)] [string]$Finding,
    [string]$Run = "",
    [string]$Category = "",
    [string]$Severity = "",
    [string]$Path = "",
    [int]$Strength = 0,
    [int]$SoulCount = 0,
    [int]$DnaCount = 0,
    [int]$ReasonCount = 0,
    [string]$CheckpointArtifact = ""
)

$apiBase = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$body = @{
    session_id = $SessionId
    run = $Run
    stage = $Stage
    category = $Category
    severity = $Severity
    path = $Path
    finding = $Finding
    strength = $Strength
    soulcount = $SoulCount
    dnacount = $DnaCount
    reasoncount = $ReasonCount
    checkpoint_artifact = $CheckpointArtifact
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$apiBase/api/pheromone/deposit" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "PHETRAIL DEPOSITED: $($response.deposit_id) | stage=$Stage | strength=$Strength | soul=$SoulCount dna=$DnaCount reason=$ReasonCount"
    return $response
} catch {
    Write-Warning "PHETRAIL FAILED: $_"
}
```

---

## STEP 4 — VERIFY END-TO-END

### 4a — Deposit a test trail
```powershell
.\CANON\SCRIPTS\phetrails.ps1 -SessionId "workhorse-test-2026-07-24" -Stage "SCOUT" -Finding "Pipeline verification: testing end-to-end pheromone deposition" -Strength 2 -SoulCount 10 -DnaCount 3 -ReasonCount 2
```

### 4b — Query trends (confirm deposit appeared)
```powershell
Invoke-RestMethod "$apiBase/api/pheromone/trends?days=1" | ConvertTo-Json -Depth 5
# Should show stage=SCOUT with deposits>=1
```

### 4c — Query SOULCOUNT per-session (confirm fix)
```powershell
Invoke-RestMethod "$apiBase/api/soul/count?session_id=ses_0899b2c82ffe2PtNt3XBMEVv5V" | ConvertTo-Json
# Should return per-session data, not "DEPRECATED"
```

### 4d — Verify aggregate is dead
```powershell
Invoke-RestMethod "$apiBase/api/soul/count?mode=aggregate" | ConvertTo-Json
# Should return 410 with "Aggregate SOULCOUNT banned"
```

---

## STEP 5 — WIRE INTO SCS EXECUTION FLOW

Every SCS checkpoint must conclude with a call to `phetrails.ps1`. Each stage's checkpoint document should include:

```markdown
## §N — Reincarnate-Synch Upload

Pheromone deposited via `CANON/SCRIPTS/phetrails.ps1`:
- Stage: `SCOUT` | `MARCH` | `SCHOLAR` | `SUPPLY` | `ENGINEER` | `DEATH`
- Session: `ses_XXXXX`
- soulcount: N | dnacount: N | reasoncount: N
- Deposit ID: `XXXXX` (from API response)
- Confirmed in §IX-A of `CANON/SYSTEM/Reincarnate-Synch.md`
```

### Wire into each agent spec:
The 7 SCS agent specs at `CANON/SYSTEM/*.md` must include a step:
```
8. DEPOSIT PHEROMONE: Run `.\CANON\SCRIPTS\phetrails.ps1 -SessionId "ses_XXXXX" -Stage "SCOUT" ...`
   Record deposit ID. Append to Reincarnate-Synch §IX-A.
```

---

## STEP 6 — UPDATE REINCARNATE-SYNCH §IX-A

Append the workhorse verification row and update §IX-A docstring to reference the API endpoint:

```markdown
| 2026-07-24T22:20 | workhorse-pipeline-verify | PHEROMONE PIPELINE VERIFY | 10 | 3 | 2 | `CANON/SCRIPTS/phetrails.ps1` verified |
```

And update §IX-A header:
```markdown
## IX-A. Stage-Count Index — Append-Only Communication Bus (API-Backed)

*Every SCS stage appends one row here AND deposits to `POST /api/pheromone/deposit`. 
This section is the markdown mirror. The D1 `pheromone_deposits` table is the canonical record. 
Query trends via `GET /api/pheromone/trends?stage=SCOUT&days=7`.*
```

---

## STEP 7 — COMMIT + PUSH

```powershell
git add APPS/SOUL-LOGGER/src/index.js
git add CANON/SYSTEM/phetrails.md
git add CANON/SCRIPTS/phetrails.ps1
git add CANON/SYSTEM/Reincarnate-Synch.md
git commit -m "pipeline: phetrails — wire BB-00 PheromoneKeylogger to live API. Fix /api/soul/count to per-session."
git push origin canon
```

---

## FAILURE RECOVERY

| Symptom | Diagnosis | Fix |
|---------|-----------|-----|
| `wrangler deploy` fails | Not logged into Cloudflare | `npx wrangler login` |
| `Invoke-RestMethod` timeout | Worker overloaded or D1 locked | Wait 30s, retry |
| Deposit returns error | D1 table missing | Table created inline on first deposit — check API response |
| `/api/soul/count` still returns aggregate | Deploy didn't take | Re-run `npx wrangler deploy`, clear worker cache if needed |
| Trends empty after deposit | Race condition | Wait 5s between deposit and trends query |

---

## SEAL

*Pipeline composed by DeepThink session (DeepSeek V4 Pro) at 2026-07-24T22:10 ICT.*
*Execution target: Workhorse model (Tier 2).*
*BB-00 PheromoneKeylogger: from blueprint to involuntary biology.*

**Wax Seal:** PENDING — impressed upon workhorse verification