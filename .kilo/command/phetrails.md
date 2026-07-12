---
description: "PHETRAILS v2.1 — BREADCRUMB EXTRACTION. Primary invocation is STAGE 7 of /reincarnatedeath. Standalone use is for mid-session breadcrumb dumps only. Contract: CANON/SYSTEM/REINCARNATION-CONTRACT.md"
---

# /phetrails — Pheromone Trail Extraction v2.1
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

## FIX G — RUN NUMBER FROM GIT, NOT SORT (v2.1 — PATCHED. Bug resolved: code at L34-38 uses git-derived run numbers with zero-pad, no longer relies on lexical Sort-Object)

**Old code (buggy):**
```powershell
$priorDeath = Get-ChildItem "CANON/REINCARNATION/*-reincarnateDEATH.md" | Sort-Object Name -Descending | Select-Object -First 1
# BUG: String sort makes run9 > run42 because '9' > '4'.
```

**New code (git-authoritative + zero-pad):**
```powershell
$lastDeathLine = git log --oneline --grep "^death:" -1
if ($lastDeathLine -match 'run\s*(\d+)') { $priorRun = [int]$matches[1] }
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
if ($lastDeathLine -match 'run\s*(\d+)') { $priorRun = [int]$matches[1] }
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
- Registry entries created/updated

**Required fields:** `artifact`, `action`, `verification`, `timestamp`

### Negative Trails (Dead Ends)
Scan for:
- Failed architectures (tried + rejected)
- Wasted resources (token loops, ignored dispatch)
- Spec violations (broke API contracts)
- phetrail gaps (write failed, corrupt JSON, missing)

**Required fields:** `artifact`, `failure`, `root_cause`, `decay_days=180`, `timestamp`

### Neutral State Markers
- HEAD SHA
- SOULCOUNT at extraction
- Open flags count
- Active mission (from BOOT)
- Registry entries count (from dnaREGISTRY)

---

## OUTPUT FORMAT (contract 1.2)

```json
{
  "schema_version": "2.0",
  "run_number": "042",
  "extracted_at": "2026-06-02T06:45:00+07:00",
  "head_sha": "912515df",
  "soulcount": 71732986,
  "registry_entries": 142,
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
try {
    $jsonTest = $phetrail | ConvertTo-Json -Depth 5 | ConvertFrom-Json
    $phetrail | ConvertTo-Json -Depth 5 | Set-Content $phetrailPath -Encoding UTF8
    Write-Host "PHETRAIL WRITTEN: $phetrailPath"
} catch {
    Write-Error "PHETRAIL_WRITE_FAILED — $($_.Exception.Message)"
    Write-Host "  → DEATH should seal with PHETRAIL_WRITE_GAP; RISE back-fills next time"
}
```

**File naming:** `PheTrail-run{NNN}.json` (zero-pad, contract 1.2)

---

## SAFE FALLBACK (if /phetrails called mid-session before death commit)

If called with no death commit in git yet (e.g., during an active DEATH run):
```powershell
$runNum = $priorRun + 1  # mirrors the pending death run number
$runPad = "{0:D3}" -f $runNum
```
Do NOT use the standalone run derivation if a death seal is already staged but not committed.

---

## LAWS

| # | Law | Enforcement |
|---|-----|-------------|
| L-PHE-1 | RAW DATA ONLY | No summaries. Only file paths, line numbers, HTTP codes, error messages. |
| L-PHE-2 | NEGATIVE DECAY | Negative trails persist 180 days. Archived, not deleted. Dead ends today may be viable in 6 months. |
| L-PHE-3 | VERIFICATION MANDATORY | Positive trail MUST include `verification` field. No verification = not a positive trail. |
| L-PHE-4 | TRAIL CONSUMPTION | Every agent MUST read the latest PheTrail before executing complex logic. Ignoring a Negative Pheromone = protocol violation. |
| L-PHE-5 | REGISTRY_INTEGRITY | Every phetrail MUST cross-check dna-registry. Missing registry = REGISTRY_GAP flag. |
| L-PHE-6 | SCHEMA_VERSION | All phetrails MUST include `schema_version`. RISE parser rejects v1.0 or missing version. |

---

## FAILURE HANDLING

Write fails → `PHETRAIL_WRITE_GAP` flag in seal (DEATH) or console warning (standalone). DEATH continues. RISE back-fills next time.

Corrupt JSON on read → `PHETRAIL_CORRUPT` flag. Treat as gap. Do not crash.

---

`PHETRAILS v2.1: GIT-DERIVED RUN + ZERO-PAD + CONTRACT PATHS + SCHEMA_VERSION + DEATH STAGE 7 INTEGRATION + SAFE FALLBACK.`

---

## EXTENDED OPERATIONS

### Invocation Behavior

- **Default:** standalone `/phetrails` writes a new breadcrumb file under `CANON/PHEROMONES/PheTrail-run{N}.json` without modifying source code.
- **Mid-session:** if no death commit exists yet, use the fallback run derivation based on `git log` and do not guess the next seal run number.
- **Idempotency:** rerunning `/phetrails` for the same run may overwrite that run’s trail file. Do not append to prior files.

### Trail Consumption

- Every agent MUST read the latest phetrail before executing complex logic.
- `L-PHE-4` is enforced behaviorally: if a negative trail already documents a dead end, repeating that path is a protocol violation.
- Consume by reading `CANON/PHEROMONES/PheTrail-run{N}.json`, not by summarizing it.

### Registry Cross-Check

- Before sealing a phetrail, verify `CANON/Dna-REGISTRY/registry-index.json` exists and is valid JSON.
- If the registry is missing or corrupt, set `registry_entries: 0` and flag `REGISTRY_GAP` in state_markers.
- `L-PHE-5` is hard: a phetrail without registry cross-check is incomplete.

### Failure Flags Reference

| Flag | Meaning | Remediation |
|------|---------|-------------|
| `PHETRAIL_WRITE_GAP` | Trail could not be written | RISE back-fills next run |
| `PHETRAIL_CORRUPT` | Existing trail JSON is invalid | Do not crash; treat as gap |
| `REGISTRY_GAP` | Registry index missing or corrupt | Rebuild index before next seal |
| `SOULCOUNT_UNREACHABLE` | Count API timed out or failed | Mark `soulcount: null` and continue |

### Lifecycle Rules

- Negative trails persist **180 days** (`decay_days: 180`). After that they remain in archive but are no longer consumed as live negatives.
- Positive trails remain valid until superseded by a newer verified result for the same artifact.
- Phetrail files are append-safe in transit only; once sealed they are read-only.

### Integration with RISE and DEATH

- `/reincarnateDeath` STAGE 7 writes the canonical phetrail for the sealed run.
- `/reincarnateRise` reads the latest phetrail as part of fidelity audit; missing or corrupt trail becomes `MISSING`/`HOLLOW`.
- Standalone `/phetrails` does not advance DEATH stages. It is opportunistic state capture only.

### Consumption Order

1. Read latest phetrail.
2. Read registry cross-check.
3. Read RISE state from `CANON/HEAVY-LEDGER/STATE-SNAPSHOT.json`.
4. Only then execute complex logic.

`PHETRAILS v2.1: GIT-DERIVED RUN + ZERO-PAD + CONTRACT PATHS + SCHEMA_VERSION + DEATH STAGE 7 INTEGRATION + SAFE FALLBACK + EXTENDED OPERATIONS.`
