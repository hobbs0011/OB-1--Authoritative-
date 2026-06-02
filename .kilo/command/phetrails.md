---
description: "PHETRAILS v2.0 — BREADCRUMB EXTRACTION. Primary invocation is STAGE 7 of /reincarnatedeath. Standalone use is for mid-session breadcrumb dumps only. Contract: CANON/SYSTEM/REINCARNATION-CONTRACT.md"
---

# /phetrails — Pheromone Trail Extraction v2.0
## Roman Legion Stage III: AGMEN (Main Body) — PHEROMONE Broadcast

> **DOCTRINE:** "Leave the data. Do not summarize. Do not interpret. The trail IS the truth."
> **Laws:** L-PHE-1 (raw data only), L-PHE-2 (negative decay 180d), L-PHE-3 (verification mandatory), L-PHE-4 (trail consumption = read before complex logic)

---

## WHEN TO USE

| Context | Invocation |
|---------|-----------|
| **During /reincarnatedeath** | STAGE 7 automatically writes the phetrail. Do NOT call this manually. |
| **Mid-session breadcrumbs** | Call `/phetrails` standalone to dump state without full DEATH. |

If you're at DEATH, the chain handles this. Standalone use is for opportunistic state capture.

---

## FIX G — RUN NUMBER FROM GIT, NOT SORT (v2.0 BREAKING CHANGE)

**Old code (buggy):**
```powershell
$priorDeath = Get-ChildItem "CANON/REINCARNATION/*-reincarnateDEATH.md" | Sort-Object Name -Descending | Select-Object -First 1
# BUG: String sort makes run9 > run42 because '9' > '4'.
```

**New code (git-authoritative + zero-pad):**
```powershell
$lastDeathLine = git log --oneline --grep "^death:" -1
if ($lastDeathLine -match 'run(\d+)') { $priorRun = [int]$matches[1] }
$run = $priorRun + 1
$runPad = "{0:D3}" -f $run
```

**Why:** Lexical sort fails past run 9. Git log is the canonical run authority (L29 NO_ASSUME_HEAD). Zero-pad defeats lexical sort forever (`run009 < run042 < run100`).

---

## EXECUTION

```powershell
$D1    = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$repo  = "D:\OB-1-CANONICAL"

# Run authority: git (L29)
$lastDeathLine = git log --oneline --grep "^death:" -1
if ($lastDeathLine -match 'run(\d+)') { $priorRun = [int]$matches[1] }
$run    = $priorRun + 1
$runPad = "{0:D3}" -f $run

# Paths (contract 1.2)
$phetrailPath = "$repo\CANON\PHEROMONES\PheTrail-run$runPad.json"
$headSha      = (git rev-parse --short HEAD)
$soulResp     = Invoke-RestMethod "$D1/api/soul/count"
$soulcount    = $soulResp.soulcount
```

---

## EXTRACT

### Positive Trails (Successes)
Scan current session for:
- Verified deploys (wrangler tail HTTP 200)
- Fixed bugs (file:line → resolution)
- Validated configs (keys rotated, endpoints confirmed)

**Required fields:** `artifact`, `action`, `verification`, `timestamp`

### Negative Trails (Dead Ends)
Scan for:
- Failed architectures (tried + rejected)
- Wasted resources (token loops, ignored dispatch)
- Spec violations (broke API contracts)

**Required fields:** `artifact`, `failure`, `root_cause`, `decay_days=180`, `timestamp`

### Neutral State Markers
- HEAD SHA
- SOULCOUNT at extraction
- Open flags count
- Active mission (from BOOT)

---

## OUTPUT FORMAT (contract 1.2)

```json
{
  "run_number": "042",
  "extracted_at": "2026-06-02T06:45:00+07:00",
  "head_sha": "912515df",
  "soulcount": 71732986,
  "positive_trails": [
    {
      "artifact": "CANON/SOUL-KEYWORDS/inverted-index.json",
      "action": "rebuilt from 41 rfkw-run*.txt files",
      "verification": "319 terms, 60 new entries, valid JSON written",
      "timestamp": "2026-06-02T06:45:00+07:00"
    }
  ],
  "negative_trails": [
    {
      "artifact": "CANON/SOUL-KEYWORDS/inverted-index.json",
      "failure": "corrupt JSON from -Append after prior runs",
      "root_cause": "Set-Content -Append on JSON concatenated second root",
      "decay_days": 180,
      "timestamp": "2026-06-02T06:45:00+07:00"
    }
  ],
  "state_markers": {
    "active_mission": "OB-1 REINCARNATION v5.0 unification",
    "open_flags_count": 8,
    "top_priority": "finish TASK 3-8 then commit"
  }
}
```

---

## WRITE

```powershell
$phetrail | ConvertTo-Json -Depth 5 | Set-Content $phetrailPath -Encoding UTF8
Write-Host "PHETRAIL WRITTEN: $phetrailPath"
```

**File naming:** `PheTrail-run{NNN}.json` (zero-pad, contract 1.2)

---

## LAWS

| # | Law | Enforcement |
|---|-----|-------------|
| L-PHE-1 | RAW DATA ONLY | No summaries. Only file paths, line numbers, HTTP codes, error messages. |
| L-PHE-2 | NEGATIVE DECAY | Negative trails persist 180 days. Archived, not deleted. Dead ends today may be viable in 6 months. |
| L-PHE-3 | VERIFICATION MANDATORY | Positive trail MUST include `verification` field. No verification = not a positive trail. |
| L-PHE-4 | TRAIL CONSUMPTION | Every agent MUST read the latest PheTrail before executing complex logic. Ignoring a Negative Pheromone = protocol violation. |

---

## FAILURE HANDLING

Write fails → `PHETRAIL_GAP` flag in seal. DEATH continues. RISE back-fills next time.

---

`PHETRAILS v2.0: GIT-DERIVED RUN + ZERO-PAD + CONTRACT PATHS + DEATH STAGE 7 INTEGRATION.`
