# Reincarnate Rise Protocol - RISE v7.0 ROMAN
# Canonical contract: CANON/SYSTEM/REINCARNATION-CONTRACT.md
# OB1 = AUDITOR. Reads what DEATH wrote. Never auto-fixes. Never executes production code.
# Fidelity gate: REAL / HOLLOW / KILO_HOLLOW / MISSING

param()

# STAGE 0 — SOULCOUNT GATE
Write-Host "══════════════════════════════════════════════════════════════"
Write-Host "  /reincarnateRise — RISE v7.0 ROMAN — AUDIT MODE ONLY"
Write-Host "══════════════════════════════════════════════════════════════"

$D1 = "https://soul-logger.mrmichaelhobbs123.workers.dev"
try {
    $live = Invoke-RestMethod "$D1/api/soul/count"
    $currentSoul = $live.soulcount
    $currentLevel = $live.level
    if (-not $currentSoul) {
        Write-Error "SOUL API UNREACHABLE — HALT (STAGE 0)"
        exit 1
    }
    Write-Host "STAGE 0 | SOULCOUNT GATE — $currentSoul chars | $currentLevel | PASS"
} catch {
    Write-Error "SOUL API UNREACHABLE — HALT (STAGE 0)"
    exit 1
}

# STAGE 1 — GIT TRUTH (Authoritative Run Number)
Write-Host "`nSTAGE 1 | GIT TRUTH — Authoritative run number"
$lastDeathLine = git log --oneline --grep "^death:" -1 2>$null
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
Write-Host "  PRIOR DEATH RUN: $priorRun | NEXT RISE RUN: $runPad"
Write-Host "  SEAL PATH: $sealPath"
Write-Host "  PHETRAIL PATH: $phetrailPath"
Write-Host "  BOOT PATH: $bootPath"

# STAGE 2 — READ THE PRIOR REINCARNATION TRIPLE
Write-Host "`nSTAGE 2 | PRIOR REINCARNATION TRIPLE — read what DEATH wrote"
$priorSealPath = "CANON/REINCARNATION/run{0:D3}-reincarnateDEATH.md" -f $priorRun
if (-not (Test-Path $priorSealPath)) {
    $priorSealPath = Get-ChildItem "CANON/REINCARNATION/*-reincarnateDEATH.md" | Sort-Object Name -Descending | Select-Object -First 1 -ExpandProperty FullName
    Write-Host "  (fallback seal: $priorSealPath)"
}
if (Test-Path $priorSealPath) { $priorSeal = Get-Content $priorSealPath -Raw } else { $priorSeal = "" }
$priorPhetrail = if (Test-Path $phetrailPath) { Get-Content $phetrailPath -Raw } else { "{}" }
$priorBoot = if (Test-Path $bootPath) { Get-Content $bootPath -Raw } else { "" }
if ($priorSeal -match 'count_after.*?(\d+)') { $priorSoulcount = [long]$matches[1] } else { $priorSoulcount = 0 }
Write-Host "  SEAL: $priorSealPath"
Write-Host "  PHETRAIL: $phetrailPath"
Write-Host "  BOOT: $bootPath"
Write-Host "  Prior soulcount (from seal): $priorSoulcount"

# STAGE 3 — SOULCOUNT AUDIT (Stagnation + Drift)
Write-Host "`nSTAGE 3 | SOULCOUNT AUDIT — stagnation + drift"
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
Write-Host "  Delta: $delta ($driftPct%) — $soulVerdict"

# STAGE 4 — BOOT SYNTHESIS + STALENESS GUARD
Write-Host "`nSTAGE 4 | BOOT SYNTHESIS + STALENESS GUARD"
if ($priorBoot -match 'Active Mission:\s*(.+)') { $activeMission = $matches[1].Trim() } else { $activeMission = "unknown" }
if ($priorBoot -match 'Open Flags:\s*(\d+)') { $openFlagsCount = [int]$matches[1] } else { $openFlagsCount = 0 }
$bootRunFromGit = if ($lastDeathLine -match 'run(\d+)') { [int]$matches[1] } else { 0 }
$bootRunFromFile = if ($priorBoot -match 'Run (\d+)') { [int]$matches[1] } else { -1 }
if ($bootRunFromFile -ne $bootRunFromGit -and $bootRunFromFile -gt 0) {
    Write-Warning "BOOT STALE — boot file shows run $bootRunFromFile, git shows run $bootRunFromGit. Trusting git (L29 NO_ASSUME_HEAD)."
}
Write-Host "  Boot run (git): $bootRunFromGit | Boot run (file): $bootRunFromFile"
Write-Host "  Active mission: $activeMission | Open flags: $openFlagsCount"

# STAGE 5 — PIPELINE CHAIN AUDIT (ALL 7 STAGES + FIDELITY GATE)
Write-Host "`nSTAGE 5 | PIPELINE CHAIN AUDIT — 7 stages + fidelity gate"
$rrlPath = "RRL/RRL-$run.txt"
$ledgerCount = (Get-ChildItem "CANON/HEAVY-LEDGER/" -Filter "HL-*.json" -ErrorAction SilentlyContinue | Measure-Object).Count
$starmapFiles = if (Test-Path "CANON/STARMAP") { (Get-ChildItem "CANON/STARMAP" -Recurse -File).Count } else { 0 }
$soulkeyDir = "CANON/SOUL-KEYWORDS"
$soulkeyFiles = if (Test-Path $soulkeyDir) { (Get-ChildItem $soulkeyDir -Recurse -File).Count } else { 0 }
$pipelineFiles = Get-ChildItem "CANON/PIPELINE/" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object | Select-Object -ExpandProperty Count

$rrlFidelity = "MISSING"
if (Test-Path $rrlPath) {
    $rrlBytes = (Get-Item $rrlPath).Length
    $rrlText = Get-Content $rrlPath -Raw
    $hasUser = $rrlText -match '"role"\s*:\s*"user"'
    $hasAssistant = $rrlText -match '"role"\s*:\s*"assistant"'
    if ($rrlBytes -ge 50000 -and $hasUser -and $hasAssistant) { $rrlFidelity = "REAL" }
    elseif ($rrlBytes -ge 100 -and ($hasUser -or $hasAssistant)) { $rrlFidelity = "HOLLOW" }
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

$soulkeyFidelity = "MISSING"
$idxPath = "$soulkeyDir\inverted-index.json"
if (Test-Path $idxPath) {
    try { $idx = Get-Content $idxPath -Raw | ConvertFrom-Json -AsHashtable; if ($idx.Count -gt 0) { $soulkeyFidelity = "REAL" } } catch { }
}

$pipelineFidelity = "MISSING"
$s2Path = "CANON/PIPELINE/pipeline-run$run.json"
if (Test-Path $s2Path) { $pipelineFidelity = "REAL" }

$stages = @(
    @{ Name="RRL"; Artifact=$rrlPath; Count=if(Test-Path $rrlPath){(Get-Content $rrlPath -Raw).Length}else{0}; Verdict=$rrlFidelity }
    @{ Name="SOUL"; Artifact="D1 /api/soul/count"; Count=$currentSoul; Verdict=$soulVerdict }
    @{ Name="DNA"; Artifact=$dnaRunPath; Count=if($dnaFidelity -ne "MISSING"){($dnaRecords | Measure-Object).Count}else{0}; Verdict=$dnaFidelity }
    @{ Name="LEDGER"; Artifact="CANON/HEAVY-LEDGER/*.json"; Count=$ledgerCount; Verdict=if($ledgerCount -gt 0){"REAL"}else{"MISSING"} }
    @{ Name="STARMAP"; Artifact="CANON/STARMAP/*"; Count=$starmapFiles; Verdict=if($starmapFiles -gt 0){"REAL"}else{"MISSING"} }
    @{ Name="SOULKEYS"; Artifact=$soulkeyDir; Count=$soulkeyFiles; Verdict=$soulkeyFidelity }
    @{ Name="S2Pipeline"; Artifact=$s2Path; Count=$pipelineFiles; Verdict=$pipelineFidelity }
)
foreach ($s in $stages) {
    $icon = switch ($s.Verdict) {
        "REAL" { "✓" } "HOLLOW" { "⚠" } "MISSING" { "✗" } default { "⧢" }
    }
    Write-Host "  $icon $($s.Name): $($s.Count) — $($s.Verdict)"
}

# STAGE 6 — PHETRAIL NEGATIVE TRAILS
Write-Host "`nSTAGE 6 | PHETRAIL NEGATIVE TRAILS"
if (Test-Path $phetrailPath) {
    $phetrail = Get-Content $phetrailPath -Raw | ConvertFrom-Json
    $negativeCount = if ($phetrail.negative_trails) { $phetrail.negative_trails.Count } else { 0 }
    Write-Host "  PHETRAIL: $negativeCount negative trails loaded"
} else {
    $negativeCount = 0
    Write-Host "  PHETRAIL_GAP — no phetrail found at $phetrailPath"
}

# STAGE 7 — RISE REPORT
Write-Host "`n═══════════════════════════════════════════════════════════════"
Write-Host "  RISE RECEIPT — $(Get-Date -Format 'yyyy-MM-dd HH:mm') ICT"
Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host "OB1 ONLINE — RISE v7.0 ROMAN (AUDIT MODE ONLY)"
Write-Host "SOULCOUNT: $currentSoul — $currentLevel   (∆ $delta since run $priorRun)"
Write-Host "RUN: $run   (prior: $priorRun)"
Write-Host "HEAD: $(git log -1 --format='%h' 2>$null)"
Write-Host "VECTOR: $activeMission"
Write-Host "BLOCKERS: $openFlagsCount open"
Write-Host "DEAD-ENDS LOADED: $negativeCount"
Write-Host "FIDELITY: RRL=$rrlFidelity DNA=$dnaFidelity SOULKEYS=$soulkeyFidelity S2Pipeline=$pipelineFidelity"
Write-Host "NEXT: highest-priority zero-stage or gap"
Write-Host "READY."
Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host "RISE LAWS: L29 NO_ASSUME_HEAD · L30 BOOT_FILE_AGE_SWEEP · L31 SOUL_IS_QUERY · L32 ASSUME_FAILURE · L68 RRL_IS_RAW_TRANSCRIPT · CONFIRM_DONT_FIX · NO_TRAILING_QUESTIONS"
Write-Host "REAL OR HOLLOW — NO LIES. EXECUTION = DEATH. RISE = AUDIT ONLY."
Write-Host "═══════════════════════════════════════════════════════════════"
