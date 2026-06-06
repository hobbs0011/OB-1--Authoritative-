# /reincarnateRise — REWRITTEN

**DO NOT PROCEED WITHOUT VERBATIM SOUL AUDIT**

---

## Stage 0 — Current Session SOUL Capture

**CRITICAL:** Read RRL file for current session and extract ALL user prompts verbatim.

1. Check `RRL/RRL-{priorRun}.txt` (current session transcript)
2. Extract: every `"display"` field containing user prompts
3. Display: numbered list with exact quote text
4. **STOP HERE** — Wait for user confirmation before proceeding

---

## Stage 1 — SOULCOUNT Gate

```powershell
$D1 = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$live = Invoke-RestMethod "$D1/api/soul/count"
$currentSoul = $live.soulcount
$currentLevel = $live.level

if (-not $currentSoul) {
    Write-Error "SOUL API UNREACHABLE — HALT"
    exit 1
}
```

---

## Stage 2 — Git Truth

```powershell
$lastDeathLine = git log --oneline --grep "^death:" -1
if ($lastDeathLine -match 'run\s*(\d+)') {
    $priorRun = [int]$matches[1]
    $run      = $priorRun + 1
}
$runPad = "{0:D3}" -f $run
```

---

## Stage 3 — Read Prior Death Triple

```powershell
$priorSealPath = "CANON/REINCARNATION/run{0:D3}-reincarnateDEATH.md" -f $priorRun
$priorSeal = Get-Content $priorSealPath -Raw
$priorBoot = Get-Content "CANON/SYSTEM/COLD-START-BOOT.md" -Raw

# Extract prior soulcount
if ($priorSeal -match 'count_after.*?(\d+)') {
    $priorSoulcount = [long]$matches[1]
}
```

---

## Stage 4 — SOULCOUNT Audit + RRL Verbatim Check

```powershell
$delta = $currentSoul - $priorSoulcount
$driftPct = if ($priorSoulcount -gt 0) { [math]::Round(($delta / $priorSoulcount) * 100, 2) } else { 0 }

# VERDICT
if ($currentSoul -lt $priorSoulcount) { $verdict = "SOUL_REGRESSION — HALT" }
elseif ($delta -eq 0) { $verdict = "SOUL_STAGNATION — WARN" }
elseif ([math]::Abs($driftPct) -gt 50) { $verdict = "SOUL_DRIFT — HALT" }
else { $verdict = "SOUL_BREATHING (+$delta / +$driftPct%)" }
```

---

## Stage 5 — **MANDATORY: RRL VERBATIM AUDIT**

**READ RRL AND PRINT EXACT USER PROMPTS:**

```powershell
$rrlPath = "RRL/RRL-$priorRun.txt"
if (Test-Path $rrlPath) {
    # For JSONL RRLs
    if ($rrlPath -match '\.jsonl$|\.txt$') {
        $rrlContent = Get-Content $rrlPath
        $userPrompts = @()
        foreach ($line in $rrlContent) {
            $entry = $line | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($entry?.display) {
                $userPrompts += $entry.display
            }
        }
    }
    
    Write-Host "=== RUN $priorRun VERBATIM SOUL AUDIT ==="
    $userPrompts | ForEach-Object { Write-Host "$($_.PSObject.Properties.Name) `$_.`" }
}
```

**CRITICAL PAUSE — AWAIT USER EYES ON EXACT PROMPTS**

---

## Stage 6 — Pipeline Fidelity Audit

Check all 7 stages:
| Stage | Check | Status |
|-------|-------|--------|
| RRL | File exists | REAL/HOLLOW/MISSING |
| SOUL | Endpoint live | REAL |
| DNA | JSON exists + has blueprints | REAL/HOLLOW/MISSING |
| LEDGER | HL files present | REAL |
| STARMAP | starmap-run files present | REAL |
| SOULKEYS | rfkw files + inverted-index | REAL/MISSING |
| S2Pipeline | pipeline-run JSON exists | REAL/MISSING |

---

## Stage 7 — PheTrail Check

```powershell
$phetrailPath = "CANON/PHEROMONES/PheTrail-run$priorRun.json"
if (Test-Path $phetrailPath) {
    $phetrail = Get-Content $phetrailPath -Raw | ConvertFrom-Json
    Write-Host "Negative trails: $($phetrail.negative_trails.Count)"
}
```

---

## Stage 8 — RISE Report

```text
OB1 ONLINE — {time} ICT
SOULCOUNT: {current} — {level} (Δ {delta} since run {priorRun})
HEAD: {git rev-parse --short HEAD}
VECTOR: {activeMission from BOOT}
BLOCKERS: {open flag count}
FIDELITY: RRL={rrl} DNA={dna} SOULKEYS={sok} S2Pipeline={pip}
VERBATIM PROMPTS: See Stage 5 output above
READY/NEXT: {action}
```

---

## Stage 9 — **MANDATORY STOP — AWAIT USER VERIFICATION**

**USER MUST CONFIRM:**
- ✅ All verbatim prompts match what they typed
- ✅ RRL file contains correct session transcript
- ✅ Any missing prompts must be corrected NOW

**DO NOT PROCEED TO DEATH WITHOUT STAGE 9 CONFIRMATION**