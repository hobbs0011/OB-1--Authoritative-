---
description: "RISE PROTOCOL v7.0 — AUDITS 7 STAGES. Fidelity gate: REAL/HOLLOW/KILO_HOLLOW/MISSING. Contract: CANON/SYSTEM/REINCARNATION-CONTRACT.md"
agent: AGENT99
---

# /reincarnateRise — v7.0 ROMAN RISE

**OB1 = AUDITOR. Reads what DEATH wrote. Never auto-fixes. Never executes production code.**

**Canonical contract:** `CANON/SYSTEM/REINCARNATION-CONTRACT.md`
**Run number authority:** `git log --oneline --grep "^death:"` (L29 NO_ASSUME_HEAD)

## STAGE 0 — SOULCOUNT GATE

```powershell
$D1 = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$live = Invoke-RestMethod "$D1/api/soul/count"
$currentSoul = $live.soulcount
$currentLevel = $live.level
if (-not $currentSoul) {
    Write-Error "SOUL API UNREACHABLE — HALT"
    exit 1
}
Write-Host "STAGE 0 | SOUL: $currentSoul chars | $currentLevel"
```

Unreachable = SHUTDOWN. Do not proceed.

## STAGE 1 — GIT TRUTH (Authoritative Run Number)

```powershell
git log --oneline -5
git status --short
$lastDeathLine = git log --oneline --grep "^death:" -1
if ($lastDeathLine -match 'run(\d+)') {
    $priorRun = [int]$matches[1]
    $run = $priorRun + 1
} else {
    $priorRun = 0
    $run = 1
}
$runPad = "{0:D3}" -f $run
$sealPath = "CANON/REINCARNATION/run$runPad-reincarnateDEATH.md"
$phetrailPath = "CANON/PHEROMONES/PheTrail-run$runPad.json"
$bootPath = "CANON/SYSTEM/COLD-START-BOOT.md"
```

**L29: `git log -1` is authoritative. Never seed state from prior reincarnation records.**

## STAGE 2 — READ THE PRIOR REINCARNATION TRIPLE

RISE must read what the last DEATH wrote. All three files, always.

```powershell
$priorSealPath = "CANON/REINCARNATION/run{0:D3}-reincarnateDEATH.md" -f $priorRun
if (-not (Test-Path $priorSealPath)) {
    $priorSealPath = Get-ChildItem "CANON/REINCARNATION/*-reincarnateDEATH.md" | Sort-Object Name -Descending | Select-Object -First 1 -ExpandProperty FullName
}
$priorSeal = Get-Content $priorSealPath -Raw
$priorPhetrail = if (Test-Path $phetrailPath) { Get-Content $phetrailPath -Raw } else { "{}" }
$priorBoot = Get-Content $bootPath -Raw
if ($priorSeal -match 'count_after.*?(\d+)') {
    $priorSoulcount = [long]$matches[1]
} else {
    $priorSoulcount = 0
}
Write-Host "STAGE 2 | TRIPLE READ: seal=$priorSealPath | phetrail=$phetrailPath | boot=$bootPath"
Write-Host "  Prior soulcount (from º³): $priorSoulcount"
```

## STAGE 3 — SOULCOUNT AUDIT (Stagnation + Drift)

```powershell
$delta = $currentSoul - $priorSoulcount
$driftPct = if ($priorSoulcount -gt 0) { [math]::Round(($delta / $priorSoulcount) * 100, 2) } else { 0 }
$s2PathKilo = "CANON/PIPELINE/pipeline-run$priorRun.json"
$kiloGap = if (Test-Path $s2PathKilo) { try { (Get-Content $s2PathKilo -Raw | ConvertFrom-Json).result -eq "KILO_GAP" } catch { $false } } else { $false }
if ($currentSoul -lt $priorSoulcount) {
    $soulVerdict = "SOUL_REGRESSION — HALT"
} elseif ($delta -eq 0 -and $kiloGap) {
    $soulVerdict = "KILO_HOLLOW — DRYRUN session (expected, no alarm)"
} elseif ($delta -eq 0) {
    $soulVerdict = "SOUL_STAGNATION — WARN"
} elseif ([math]::Abs($driftPct) -gt 50) {
    $soulVerdict = "SOUL_DRIFT — HALT (|delta| > 50% of prior)"
} else {
    $soulVerdict = "SOUL_BREATHING (+$delta / +$driftPct%)"
}
Write-Host "STAGE 3 | SOUL AUDIT: delta=$delta ($driftPct%) — $soulVerdict"
```

**L32 ASSUME_FAILURE: cross-validate with 3 independent receipts. No trust in any single mechanism.**

## STAGE 4 — BOOT SYNTHESIS + STALENESS GUARD

```powershell
if ($priorBoot -match 'Active Mission:\s*(.+)') { $activeMission = $matches[1].Trim() }
if ($priorBoot -match 'Open Flags:\s*(\d+)') { $openFlagsCount = [int]$matches[1] }
$bootRunFromGit = if ($lastDeathLine -match 'run(\d+)') { [int]$matches[1] } else { 0 }
$bootRunFromFile = if ($priorBoot -match 'Run (\d+)') { [int]$matches[1] } else { -1 }
if ($bootRunFromFile -ne $bootRunFromGit -and $bootRunFromFile -gt 0) {
    Write-Warning "BOOT STALE — boot file shows run $bootRunFromFile, git shows run $bootRunFromGit. Trusting git (L29)."
}
Write-Host "STAGE 4 | BOOT: run=$bootRunFromGit | mission=$activeMission | flags=$openFlagsCount"
```

**L30 BOOT_FILE_AGE_SWEEP:** fires at ANY mismatch.

## STAGE 5 — PIPELINE CHAIN AUDIT (ALL 7 STAGES + FIDELITY GATE)

```powershell
$rrlPath = "RRL/RRL-$run.txt"
$ledgerCount = (Get-ChildItem "CANON/HEAVY-LEDGER/" -Filter "HL-*.json" -ErrorAction SilentlyContinue | Measure-Object).Count
$starmapFiles = if (Test-Path "CANON/STARMAP") { (Get-ChildItem "CANON/STARMAP" -Recurse -File).Count } else { 0 }
$soykeyDir = "CANON/SOUL-KEYWORDS"
$soykeyFiles = if (Test-Path $soykeyDir) { (Get-ChildItem $soykeyDir -Recurse -File).Count } else { 0 }
$pipelineFiles = Get-ChildItem "CANON/PIPELINE/" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object | Select-Object -ExpandProperty Count

$rrlFidelity = "MISSING"
if (Test-Path $rrlPath) {
    $rrlBytes = (Get-Item $rrlPath).Length
    $rrlText = Get-Content $rrlPath -Raw
    $hasUser = $rrlText -match '"role"\s*:\s*"user"'
    $hasAssistant = $rrlText -match '"role"\s*:\s*"assistant"'
    if ($rrlBytes -ge 50000 -and $hasUser -and $hasAssistant) {
        $rrlFidelity = "REAL"
    } elseif ($rrlBytes -ge 100 -and ($hasUser -or $hasAssistant)) {
        $rrlFidelity = "HOLLOW"
    }
}

$dnaFidelity = "MISSING"
$dnaRunPath = "CANON/SOUL/EXTRACT/dna-run$run.json"
if (Test-Path $dnaRunPath) {
    try {
        $dnaRecords = Get-Content $dnaRunPath -Raw | ConvertFrom-Json
        $bpCount = ($dnaRecords | Where-Object { $_.type -eq "blueprint" }).Count
        if ($dnaRecords.Count -gt 0 -and $bpCount -gt 0) { $dnaFidelity = "REAL" }
        elseif ($dnaRecords.Count -gt 0) { $dnaFidelity = "HOLLOW" }
    } catch { $dnaFidelity = "MISSING" }
}

$soykeyFidelity = "MISSING"
$idxPath = "$soykeyDir\\inverted-index.json"
if (Test-Path $idxPath) {
    try {
        $idx = Get-Content $idxPath -Raw | ConvertFrom-Json -AsHashtable
        if ($idx.Count -gt 0) { $soykeyFidelity = "REAL" }
    } catch { }
}

$pipelineFidelity = "MISSING"
$s2Path = "CANON/PIPELINE/pipeline-run$run.json"
if (Test-Path $s2Path) {
    $pipelineFidelity = "REAL"
}

$stages = @(
    @{ Name="RRL"; Artifact=$rrlPath; Count=(if(Test-Path $rrlPath){(Get-Content $rrlPath -Raw).Length}else{0}); Verdict=$rrlFidelity }
    @{ Name="SOUL"; Artifact="D1 /api/soul/count"; Count=$currentSoul; Verdict=$soulVerdict }
    @{ Name="DNA"; Artifact=$dnaRunPath; Count=if($dnaFidelity -ne "MISSING"){($dnaRecords | Measure-Object).Count}else{0}; Verdict=$dnaFidelity }
    @{ Name="LEDGER"; Artifact="CANON/HEAVY-LEDGER/*.json"; Count=$ledgerCount; Verdict=if($ledgerCount -gt 0){"REAL"}else{"MISSING"} }
    @{ Name="STARMAP"; Artifact="CANON/STARMAP/*"; Count=$starmapFiles; Verdict=if($starmapFiles -gt 0){"REAL"}else{"MISSING"} }
    @{ Name="SOULKEYS"; Artifact=$soykeyDir; Count=$soykeyFiles; Verdict=$soykeyFidelity }
    @{ Name="S2Pipeline"; Artifact=$s2Path; Count=$pipelineFiles; Verdict=$pipelineFidelity }
)
foreach ($s in $stages) {
    $icon = switch ($s.Verdict) {
        "REAL" { "✓" }
        "HOLLOW" { "⚠" }
        "MISSING" { "✗" }
        default { "⧢" }
    }
    Write-Host "  $icon $($s.Name): $($s.Count) — $($s.Verdict)"
}
```

**Fidelity Gate:** A stage is REAL only if it contains both sides. HOLLOW means it exists but is one-sided/incomplete.

## STAGE 6 — PHETRAIL NEGATIVE TRAILS

```powershell
if (Test-Path $phetrailPath) {
    $phetrail = Get-Content $phetrailPath -Raw | ConvertFrom-Json
    $negativeCount = $phetrail.negative_trails.Count
    Write-Host "STAGE 6 | PHETRAIL: $negativeCount negative trails loaded"
} else {
    $negativeCount = 0
    Write-Host "STAGE 6 ⚠ PHETRAIL_GAP — no phetrail found"
}
```

## STAGE 7 — RISE REPORT

```text
OB1 ONLINE — {datetime ICT}
SOULCOUNT: {n} — {level}   (∆ {delta} since run {priorRun})
RUN: {run}  (prior: {priorRun})
HEAD: {git rev-parse --short HEAD}
VECTOR: {activeMission}
BLOCKERS: {openFlagsCount} open
DEAD-ENDS LOADED: {negativeCount}
FIDELITY: RRL={rrl_fidelity} DNA={dna_fidelity} SOULKEYS={soykeyFidelity} S2Pipeline={pipelineFidelity}
NEXT: {highest-priority zero-stage or gap}
READY.
```

## RISE LAWS

- **L29 NO_ASSUME_HEAD** — `git log -1` is authoritative; never trust stale docs
- **L30 BOOT_FILE_AGE_SWEEP** — fires at ANY mismatch, not just >10 behind
- **L31 SOUL_IS_QUERY** — soulcount IS `SUM(byte_count) FROM soul_prompts WHERE session_id LIKE 'sov100%'`
- **L32 ASSUME_FAILURE** — every prior checkpoint is assumed FAILED. Cross-validate with 3 receipts.
- **L68 RRL_IS_RAW_TRANSCRIPT** — RRL = both sides verbatim. If RRL is hollow, the whole chain is hollow.
- **L69 SEARCH_FIRST** — when asked where anything is, SoulSearch (`/SoulSearch <term>`) is the FIRST tool touched. Never grep the archive first.
- **CONFIRM_DONT_FIX** — RISE audits. DEATH executes. Never reverse these roles.
- **READ_OWN_OUTPUT** — before giving the next step, read what you just said.
- **NO_TRAILING_QUESTIONS** — never end with "What do you want to do?" Canon tells the next action.

`RISE v6.1: AUDIT 7 STAGES + FIDELITY GATE. IDENTIFY GAPS. DO NOT EXECUTE. EXECUTION = DEATH. REAL OR HOLLOW — NO LIES.`