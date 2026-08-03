param(
    [Parameter(Mandatory=$true)] [string]$Run,
    [Parameter(Mandatory=$true)] [string]$IlogSource,
    [string]$SessionName,
    [string]$SessionTitle,
    [string]$ScoutArtifact,
    [string]$RiseDir = "CANON/REINCARNATION",
    [string]$IlogDir = "I-LOG-UNAUDITED",
    [string]$NextStage = "SOULSCHOLARS"
)

$ErrorActionPreference = 'Stop'
$safeName = if ($SessionName) {
    $SessionName -replace '[\\/:*?"<>|&\(\)\s]+', '-' -replace '-+', '-' -replace '^-|-$', ''
} else {
    "Run$Run"
}

Write-Host "=== MARCH (Stage 3) - Run $Run ===" -ForegroundColor Cyan

# 1) EMIT MARCH PHEROMONE
$stage = "MARCH"
$finding = "MARCH initiated for Run $Run. Full sweep of all zones."
& "$PSScriptRoot\phetrails.ps1" -SessionId $safeName -Run $Run -Stage $stage -Finding $finding -Strength 1 -Category "stage" -Severity "info" -Path "CANON/SCRIPTS/march.ps1"

# 2) VERIFY SCOUT ARTIFACT EXISTS
if (-not (Test-Path $ScoutArtifact)) {
    Write-Warning "Scout artifact not found: $ScoutArtifact. Proceeding with standalone MARCH."
}

# 3) FULL SWEEP - WALK ALL ZONES
Write-Host "Marching through all zones..." -ForegroundColor Yellow
$zones = @("SCOUT", "SOUL", "DNA", "SUPPLY", "ENGINEER", "DEATH")
$zoneStatus = @{}

foreach ($zone in $zones) {
    $zonePath = Join-Path "CANON" $zone
    if (Test-Path $zonePath) {
        $items = Get-ChildItem $zonePath -ErrorAction SilentlyContinue
        $zoneStatus[$zone] = "$($items.Count) items"
        Write-Host "  [$zone] $($items.Count) items" -ForegroundColor Gray
    } else {
        $zoneStatus[$zone] = "MISSING"
        Write-Host "  [$zone] MISSING" -ForegroundColor Red
    }
}

# 4) IDENTIFY PIPELINE GAPS
$gaps = $zoneStatus.GetEnumerator() | Where-Object { $_.Value -eq "MISSING" }
if ($gaps) {
    $gapNames = $gaps | ForEach-Object { $_.Name } | Join-String -Separator ", "
    Write-Warning "Pipeline gaps detected: $gapNames"
} else {
    Write-Host "No pipeline gaps detected." -ForegroundColor Green
}

# 5) CREATE MARCH ARTIFACT
$marchDir = "CANON/MARCH"
if (-not (Test-Path $marchDir)) { New-Item -ItemType Directory -Path $marchDir -Force | Out-Null }

$timestamp = Get-Date -Format "yyyyMMddTHHmmss"
$marchFile = Join-Path $marchDir "march-$safeName-$timestamp.md"

$marchContent = @"
# MARCH Checkpoint — $safeName

**Stage:** MARCH (Stage 3)
**Run:** $Run
**Timestamp:** $(Get-Date -Format "o")
**Scout Artifact:** $ScoutArtifact

## Zone Sweep Results
| Zone | Status |
|------|--------|
"@

foreach ($zone in $zones) {
    $marchContent += "| $zone | $($zoneStatus[$zone]) |`n"
}

$marchContent += @"
## Pipeline Gaps
$($gaps | ForEach-Object { "- $($_.Name): $($_.Value)" } | Out-String)

## Findings
- Full sweep completed
- $(if ($gaps) { "Gaps identified: $($gaps.Count)" } else { "No gaps identified" })
- Ready for SOULSCHOLARS

## Handoff
- **To:** $NextStage
- **Artifact:** $marchFile
"@

$marchContent | Set-Content $marchFile -Encoding UTF8
Write-Host "March artifact created: $marchFile" -ForegroundColor Green

# 6) EMIT MARCH COMPLETE PHEROMONE
$completeFinding = "MARCH complete for Run $Run. Zones swept: $($zones.Count). Gaps: $($gaps.Count). Handoff to $NextStage."
& "$PSScriptRoot\phetrails.ps1" -SessionId $safeName -Run $Run -Stage $stage -Finding $completeFinding -Strength 2 -Category "stage" -Severity "info" -Path $marchFile

Write-Host "MARCH COMPLETE. Run $Run ready for $NextStage." -ForegroundColor Green
