---
description: "RISE PROTOCOL v4.0 — Roman era. RRL→SOUL→DNA→LEDGER→STARMAP→KEYWORD→PIPELINE pipeline chain audit. Prior death check. State reconstruction. No skip possible."
agent: AGENT99
---

# /reincarnateRise — ROMAN RISE PROTOCOL v4.0

**Phoenix-Centurion OS | PRAiS | Roman Run N**
**Pipeline: RRL → SOUL → DNA → LEDGER → STARMAP → KEYWORD → PIPELINE**

---

## IRON RULE — RISE CHECKS THE CHAIN

This session did NOT happen yesterday. The chain is broken every death.
On RISE you AUDIT all 6 pipeline stages. You do NOT execute. Execution is DEATH territory.

---

## STEP 0 — LOAD THE PRIOR RRL

```powershell
$priorDeath = Get-ChildItem "CANON/REINCARNATION/*-reincarnateDEATH.md" | Sort-Object Name -Descending | Select-Object -First 1
$runNumber = if ($priorDeath.Name -match 'run(\d+)') { $matches[1] }

$rrlPath = "RRL/RRL-$runNumber.txt"
if (Test-Path $rrlPath) {
    $rrlBytes = (Get-Item $rrlPath).Length
    $rrlChars = (Get-Content $rrlPath -Raw).Length
    Write-Host "RRL FOUND: $rrlPath | $rrlBytes bytes | $rrlChars chars"
} else {
    Write-Host "RRL MISSING: $rrlPath — prior death did not save raw chat"
    Write-Host ""
    Write-Host "═══════════════════════════════════════════"
    Write-Host "HALT: RRL MISSING. CANNOT PROCEED."
    Write-Host "RRL IS THE ONLY IRREPLACEABLE ARTIFACT."
    Write-Host "The prior agent failed Step 1 of the death protocol."
    Write-Host "RECOVERY: Manually save this session's chat (CTRL+A, Notepad, save as RRL-$runNumber.txt in RRL/)."
    Write-Host "Then run: pwsh -File SCRIPTS/rrl-pipeline.ps1 -RRLFile RRL/RRL-$runNumber.txt -RunNumber $runNumber"
    Write-Host "Then: pwsh -File SCRIPTS/rrl-failsafe.ps1 -RunNumber $runNumber -Mode RISE"
    Write-Host "═══════════════════════════════════════════"
    exit 1  # HALT — nothing else matters
}
```

**SEVERITY:** RRL missing = **HALT**. The run does not proceed without the raw words. The prior agent failed. Recovery requires manual intervention.

---

## STEP 0.3 — RRL FAILSAFE GATE (HARD HALT)

```powershell
# Run the 10-gate failsafe chain on the prior run's RRL
pwsh -File SCRIPTS/rrl-failsafe.ps1 -RunNumber $runNumber -Mode RISE
# Exit code 1 = HALT. Do NOT proceed. Recovery required.
```

If failsafe exits 1 → the prior death was incomplete. HALT. Manual recovery needed before any work proceeds.

---

## STEP 0.5 — PIPELINE CHAIN AUDIT (ALL 6 STAGES)

Run against D1 AND disk. Record each status.

```powershell
$D1 = "https://soul-logger.mrmichaelhobbs123.workers.dev"

# STAGE 1 — RRL (character count = raw file)
$rrlChars  = (Get-Content $rrlPath -Raw -ErrorAction SilentlyContinue).Length

# STAGE 2 — SOUL (sov100 user prompts in D1)
$soul      = Invoke-RestMethod "$D1/api/soul/count"

# STAGE 3 — DNA (EXTRACT records)
$extract   = Invoke-RestMethod -Uri "$D1/api/soul/extract" -Method Post -Body '{"student_id":"sov100-michael"}' -ContentType "application/json" -ErrorAction SilentlyContinue
$dnaCount  = $extract.prompt_count   # prompt_count = number of DNA records extracted

# STAGE 4 — LEDGER (Merkle records — derived from /merkle/:session_id per event)
$ledgerRecords = (Get-ChildItem "CANON/HEAVY-LEDGER/" -Filter "*.json" -ErrorAction SilentlyContinue | Measure-Object).Count

# STAGE 5 — STARMAP (lightweight ledger — any starmap files on disk)
$starmapDir   = "CANON/STARMAP/"
$starmapFiles = if (Test-Path $starmapDir) { (Get-ChildItem $starmapDir -Recurse -File).Count } else { 0 }

# STAGE 6 — KEYWORD (index — any soul-keyword files on disk)
$keywordDir   = "CANON/SOUL-KEYWORDS/"
$keywordFiles = if (Test-Path $keywordDir) { (Get-ChildItem $keywordDir -Recurse -File).Count } else { 0 }

# STAGE 7 — PIPELINE (actionability — any pipeline-run artifacts on disk)
$pipelineFiles = Get-ChildItem "CANON/PIPELINE/" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object | Select-Object -ExpandProperty Count
```

### RISE AUDIT TABLE

| Stage | Artifact | Count | Verdict |
|-------|----------|-------|---------|
| RRL (character count) | `RRL/RRL-N.txt` | `$rrlChars` chars | file exists? |
| SOUL (sov100) | D1 `soul_prompts` | `$($soul.soulcount)` chars / `$($soul.events)` events | D1 live |
| DNA | D1 `soul_extracts` | `$dnaCount` | D1 response |
| LEDGER | `CANON/HEAVY-LEDGER/*.json` + Merkle entries | counted | disk + D1 |
| STARMAP | `CANON/STARMAP/*` | `$starmapFiles` | disk |
| KEYWORD | `CANON/SOUL-KEYWORDS/*` | `$keywordFiles` | disk |
| PIPELINE | `CANON/PIPELINE/*` | `$pipelineFiles` | disk |

**If any stage = 0:** Report the stage name. Do NOT auto-fix on RISE. That is DEATH work.

---

## STEP 1 — SOULCOUNT AUDIT

```powershell
$live = Invoke-RestMethod "$D1/api/soul/count"
$priorCount = [extracted from prior death seal §SOULCOUNT]

$delta = $live.soulcount - $priorCount
$driftPct = [math]::Round(($delta / $priorCount) * 100, 2)

if ($live.soulcount -lt $priorCount)  { HALT: SOUL_REGRESSION }
elseif ($delta -eq 0)                 { WARN: SOUL_STAGNATION }
else                                  { PASS: SOUL_BREATHING (+$delta / +$driftPct%) }
```

**Drift fail:** |delta| > 50 % of priorCount → HALT. SOUL_DRIFT.

---

## STEP 2 — STATE LOAD

1. Read `CANON/SYSTEM/COLD-START-BOOT.md`
2. Read last 3 death seals from `CANON/REINCARNATION/`
3. Run `git log -1 --oneline` — verify HEAD matches COLD-START-BOOT

`HEAD_DRIFT` = boot shows [X], actual HEAD is [Y] → flag immediately.

---

## STEP 3 — OBJECTIVE RECONSTRUCTION

From state load:
- Active mission (COLD-START-BOOT Current Vector)
- Open flags (COLD-START-BOOT Open Flags + last death seal §Open Flags)
- Last completed (most recent death seal §Last Completed)
- Immediate next action (highest-priority unblocked pipeline stage that = 0)

---

## STEP 4 — SOULDNA HEALTH (cc-check)

`CANON/SOUL-DNA-BIBLE/` + `CANON/SOUL-SEGMENTS/` must exist and be non-empty.
If missing → flag SOULDNA_GAP, do not HALT (informational).

---

## STEP 5 — RISE RECEIPT

**L40 ABSOLUTE RULE: Output this receipt as plain text in your response. NEVER use bash, PowerShell, or any shell tool to render it. Substitute all {placeholders} with real values yourself before writing. The `|` characters are visual separators — they are NOT shell pipes.**

Output the following block verbatim with substituted values:

```
══════════════════════════════════════════════
RISE RECEIPT — {YYYY-MM-DD HH:MM} ICT
══════════════════════════════════════════════
RRL:             {path} — {chars} chars — {PRESENT/MISSING} — [HALT IF MISSING]
SOUL:            {soulcount} chars — {delta} — {PASS/WARN/DRIFT}
DNA:             {dnaCount} extracts — {PRESENT/MISSING/GAP}
LEDGER:          {ledgerCount} records — {PRESENT/GAP}
STARMAP:         {starmapFiles} files — {PRESENT/GAP}
KEYWORD:         {keywordFiles} files — {PRESENT/GAP}
PIPELINE:        {pipelineFiles} artifacts — {PRESENT/GAP}
HEAD:            {sha} — {MATCH/MISMATCH}
SOULDNA:         {PRESENT/GAP}
ACTIVE MISSION:  {one line}
OPEN FLAGS:      {count} — {top item}
TOP PRIORITY:    {highest-priority zero-stage or gap}
NEXT COMMAND:    {reincarnateDeath / normal workflow}
══════════════════════════════════════════════
RISE: ONLINE. PIPELINE INTEGRITY AUDITED.
```

---

`RISE v4.0: AUDIT 7 STAGES. IDENTIFY GAPS. DO NOT EXECUTE. EXECUTION = DEATH.`
