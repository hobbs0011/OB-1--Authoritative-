# RISE PROTOCOL v7.0 - ROMAN RISE
# AUDITS 7 STAGES. Fidelity gate: REAL/HOLLOW/KILO_HOLLOW/MISSING.

param([string]$RepoRoot = "D:\OB-1-CANONICAL")

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# STAGE 0 - SOULCOUNT GATE
Write-Host "STAGE 0 🗿 SOULCOUNT GATE" -ForegroundColor Cyan
$soulApi = "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"
try {
    $liveSoul = Invoke-RestMethod -Uri $soulApi -TimeoutSec 10
    $currentSoul = $liveSoul.soulcount
    $currentLevel = $liveSoul.level
    Write-Host "  SOUL: $currentSoul chars | $currentLevel" -ForegroundColor Green
} catch {
    Write-Error "SOUL API UNREACHABLE - HALT"
    exit 1
}

# STAGE 1 - GIT TRUTH
Write-Host "STAGE 1 📜 GIT TRUTH" -ForegroundColor Cyan
Push-Location $RepoRoot
$lastDeathLine = git log --oneline --grep "^death:" -1 2>$null
if ($lastDeathLine -match 'Run (\d+)') {
    $priorRun = [int]$matches[1]
    $run = $priorRun + 1
} else {
    $priorRun = 0
    $run = 1
}
$headShort = git rev-parse --short HEAD
Pop-Location
$runPad = "{0:D3}" -f $run
$sealPath = Join-Path $RepoRoot "CANON/REINCARNATION/run$runPad-reincarnateDEATH.md"
$phetrailPath = Join-Path $RepoRoot "CANON/PHEROMONES/PheTrail-run$runPad.json"
$bootPath = Join-Path $RepoRoot "CANON/SYSTEM/COLD-START-BOOT.md"
Write-Host "  RUN: $run (prior: $priorRun) | HEAD: $headShort"

# STAGE 2 - READ PRIOR REINCARNATION TRIPLE
Write-Host "STAGE 2 📖 TRIPLE READ" -ForegroundColor Cyan
$priorSealName = "run{0:D3}-reincarnateDEATH.md" -f $priorRun
$priorSealPath = Join-Path $RepoRoot "CANON/REINCARNATION" $priorSealName
if (-not (Test-Path $priorSealPath)) {
    $priorSealPath = Get-ChildItem (Join-Path $RepoRoot "CANON/REINCARNATION") -Filter "*-reincarnateDEATH.md" | Sort-Object Name -Descending | Select-Object -First 1 -ExpandProperty FullName
}
$priorSeal = Get-Content $priorSealPath -Raw
$priorBoot = Get-Content $bootPath -Raw

$priorSoulcount = 0
$countLine = ($priorSeal -split "`n") -match "count_after"
if ($countLine) {
    $num = [regex]::Match($countLine, "[\d,]+").Value -replace '[, ]', ''
    $priorSoulcount = [long]$num
}
Write-Host "  seal=$priorSealPath"
Write-Host "  Prior soulcount (from seal): $priorSoulcount"

# STAGE 3 - SOULCOUNT AUDIT
Write-Host "STAGE 3 📊 SOULCOUNT AUDIT" -ForegroundColor Cyan
$delta = $currentSoul - $priorSoulcount
$driftPct = if ($priorSoulcount -gt 0) { [math]::Round(($delta / $priorSoulcount) * 100, 2) } else { 0 }
$s2PathKilo = Join-Path $RepoRoot "CANON/PIPELINE/pipeline-run$priorRun.json"
$kiloGap = if (Test-Path $s2PathKilo) { 
    try { (Get-Content $s2PathKilo -Raw | ConvertFrom-Json).result -eq "KILO_GAP" } catch { $false }
} else { $false }

if ($currentSoul -lt $priorSoulcount) {
    $soulVerdict = "SOUL_REGRESSION - HALT"
} elseif ($delta -eq 0 -and $kiloGap) {
    $soulVerdict = "KILO_HOLLOW - DRYRUN session"
} elseif ($delta -eq 0) {
    $soulVerdict = "SOUL_STAGNATION - WARN"
} elseif ([math]::Abs($driftPct) -gt 50) {
    $soulVerdict = "SOUL_DRIFT - HALT (|delta| > 50%)"
} else {
    $soulVerdict = "SOUL_BREATHING (+$delta / +$driftPct%)"
}
Write-Host "  delta=$delta ($driftPct%) - $soulVerdict"

# STAGE 4 - BOOT SYNTHESIS + STALENESS GUARD
Write-Host "STAGE 4 🔧 BOOT SYNTHESIS" -ForegroundColor Cyan
$activeMission = ""
$openFlagsCount = 0
if ($priorBoot -match 'Active Mission:\s*(.+)') { $activeMission = $matches[1].Trim() }
if ($priorBoot -match 'Open Flags:\s*(\d+)') { $openFlagsCount = [int]$matches[1] }
$bootRunFromGit = if ($lastDeathLine -match 'Run (\d+)') { [int]$matches[1] } else { 0 }
$bootRunFromFile = if ($priorBoot -match 'Run (\d+)') { [int]$matches[1] } else { 0 }
$bootStale = $false
if ($bootRunFromFile -ne $bootRunFromGit -and $bootRunFromFile -gt 0) {
    $bootStale = $true
    Write-Warning "BOOT STALE - boot file shows run $bootRunFromFile, git shows run $bootRunFromGit. Trusting git (L29)."
}
Write-Host "  run=$bootRunFromGit | mission='$activeMission' | flags=$openFlagsCount"

# STAGE 5 - PIPELINE CHAIN AUDIT + FIDELITY GATE
Write-Host "STAGE 5 ⛓️ PIPELINE CHAIN AUDIT" -ForegroundColor Cyan

$rrlPath = Join-Path $RepoRoot "RRL/RRL-$run.txt"
$ledgerDir = Join-Path $RepoRoot "CANON/HEAVY-LEDGER"
$ledgerCount = if (Test-Path $ledgerDir) { (Get-ChildItem $ledgerDir -Filter "HL-*.json" -ErrorAction SilentlyContinue | Measure-Object).Count } else { 0 }
$starmapDir = Join-Path $RepoRoot "CANON/STARMAP"
$starmapFiles = if (Test-Path $starmapDir) { (Get-ChildItem $starmapDir -Recurse -File -ErrorAction SilentlyContinue).Count } else { 0 }
$soykeyDir = Join-Path $RepoRoot "CANON/SOUL-KEYWORDS"
$soykeyFiles = if (Test-Path $soykeyDir) { (Get-ChildItem $soykeyDir -Recurse -File -ErrorAction SilentlyContinue).Count } else { 0 }
$pipelineDir = Join-Path $RepoRoot "CANON/PIPELINE"
$pipelineFiles = if (Test-Path $pipelineDir) { (Get-ChildItem $pipelineDir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count } else { 0 }

# RRL fidelity - check prior run for completeness audit
$rrlFidelity = "MISSING"
$rrlPriorPath = Join-Path $RepoRoot "RRL/RRL-$priorRun.txt"
if (Test-Path $rrlPriorPath) {
    $rrlBytes = (Get-Item $rrlPriorPath).Length
    $rrlText = Get-Content $rrlPriorPath -Raw
    $hasUser = $rrlText -match '"role"\s*:\s*"user"'
    $hasAssistant = $rrlText -match '"role"\s*:\s*"assistant"'
    if ($rrlBytes -ge 50000 -and $hasUser -and $hasAssistant) { $rrlFidelity = "REAL" }
    elseif ($rrlBytes -ge 100 -and ($hasUser -or $hasAssistant)) { $rrlFidelity = "HOLLOW" }
}

# DNA fidelity - check prior run for completeness audit
$dnaFidelity = "MISSING"
$dnaPriorPath = Join-Path $RepoRoot "CANON/SOUL/EXTRACT/dna-run$priorRun.json"
if (Test-Path $dnaPriorPath) {
    try {
        $dnaRecords = Get-Content $dnaPriorPath -Raw | ConvertFrom-Json
        $bpCount = ($dnaRecords | Where-Object { $_.type -eq "blueprint" }).Count
        if ($dnaRecords.Count -gt 0 -and $bpCount -gt 0) { $dnaFidelity = "REAL" }
        elseif ($dnaRecords.Count -gt 0) { $dnaFidelity = "HOLLOW" }
    } catch { $dnaFidelity = "MISSING" }
}

# SOULKEYS fidelity
$soykeyFidelity = "MISSING"
$idxPath = Join-Path $soykeyDir "inverted-index.json"
if (Test-Path $idxPath) {
    try {
        $idx = Get-Content $idxPath -Raw | ConvertFrom-Json -AsHashtable
        if ($idx.Count -gt 0) { $soykeyFidelity = "REAL" }
    } catch { }
}

# Pipeline fidelity - check prior run since current run has no artifacts yet
$pipelineFidelity = "MISSING"
$s2Path = Join-Path $RepoRoot "CANON/PIPELINE/pipeline-run$priorRun.json"
if (Test-Path $s2Path) { $pipelineFidelity = "REAL" }

# Build stage objects - using prior run for completeness check
$rrlCountVal = if (Test-Path $rrlPriorPath) { (Get-Content $rrlPriorPath -Raw).Length } else { 0 }
$dnaCountVal = if (Test-Path $dnaPriorPath) { 
    try { (Get-Content $dnaPriorPath -Raw | ConvertFrom-Json).Count } catch { 0 }
} else { 0 }
$ledgerVerdict = if ($ledgerCount -gt 0) { "REAL" } else { "MISSING" }
$starmapVerdict = if ($starmapFiles -gt 0) { "REAL" } else { "MISSING" }

$stages = @(
    @{ Name="RRL"; Artifact="RRL-$priorRun.txt"; Count=$rrlCountVal; Verdict=$rrlFidelity }
    @{ Name="SOUL"; Artifact="D1 /api/soul/count"; Count=$currentSoul; Verdict=$soulVerdict }
    @{ Name="DNA"; Artifact="dna-run$priorRun.json"; Count=$dnaCountVal; Verdict=$dnaFidelity }
    @{ Name="LEDGER"; Artifact="CANON/HEAVY-LEDGER/*.json"; Count=$ledgerCount; Verdict=$ledgerVerdict }
    @{ Name="STARMAP"; Artifact="CANON/STARMAP/*"; Count=$starmapFiles; Verdict=$starmapVerdict }
    @{ Name="SOULKEYS"; Artifact=$soykeyDir; Count=$soykeyFiles; Verdict=$soykeyFidelity }
    @{ Name="S2Pipeline"; Artifact="pipeline-run$priorRun.json"; Count=$pipelineFiles; Verdict=$pipelineFidelity }
)

foreach ($s in $stages) {
    $icon = switch ($s.Verdict) {
        "REAL" { "✓" }
        "HOLLOW" { "⚠" }
        "MISSING" { "✗" }
        default { "¼" }
    }
    $color = switch ($s.Verdict) {
        "REAL" { "Green" }
        "HOLLOW" { "Yellow" }
        "MISSING" { "Red" }
        default { "White" }
    }
    Write-Host "  $icon $($s.Name): $($s.Count) - $($s.Verdict)" -ForegroundColor $color
}

# STAGE 6 - PHETRAIL NEGATIVE TRAILS
Write-Host "STAGE 6 🚩 PHETRAIL NEGATIVE TRAILS" -ForegroundColor Cyan
$negativeCount = 0
$phetrailPriorPath = Join-Path $RepoRoot "CANON/PHEROMONES/PheTrail-run$priorRun.json"
if (Test-Path $phetrailPriorPath) {
    $phetrail = Get-Content $phetrailPriorPath -Raw | ConvertFrom-Json
    $negativeCount = $phetrail.negative_trails.Count
    Write-Host "  $negativeCount negative trails loaded"
} else {
    Write-Host "  PHETRAIL_GAP - no phetrail found" -ForegroundColor Yellow
}

# STAGE 7 - RISE REPORT
Write-Host ""
Write-Host "=== RISE REPORT ===" -ForegroundColor Cyan
Write-Host "OB1 ONLINE - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "SOULCOUNT: $currentSoul chars | $currentLevel (╬õ $delta since run $priorRun)"
Write-Host "RUN: $run (prior: $priorRun)"
Write-Host "HEAD: $headShort"
Write-Host "VECTOR: $activeMission"
Write-Host "BLOCKERS: $openFlagsCount open"
Write-Host "DEAD-ENDS LOADED: $negativeCount"
Write-Host "FIDELITY: RRL=$rrlFidelity DNA=$dnaFidelity SOULKEYS=$soykeyFidelity S2Pipeline=$pipelineFidelity"
Write-Host ""
Write-Host "READY."