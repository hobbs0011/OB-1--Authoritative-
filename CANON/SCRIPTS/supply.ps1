param(
    [Parameter(Mandatory=$true)] [string]$Run,
    [Parameter(Mandatory=$true)] [string]$IlogSource,
    [string]$SessionName,
    [string]$SessionTitle,
    [string]$SoulArtifact,
    [string]$RiseDir = "CANON/REINCARNATION",
    [string]$IlogDir = "I-LOG-UNAUDITED",
    [string]$NextStage = "ENGINEER"
)

$ErrorActionPreference = 'Stop'
$safeName = if ($SessionName) {
    $SessionName -replace '[\\/:*?"<>|&\(\)\s]+', '-' -replace '-+', '-' -replace '^-|-$', ''
} else {
    "Run$Run"
}

Write-Host "=== SUPPLY (Stage 5) - Run $Run ===" -ForegroundColor Cyan

# 1) EMIT SUPPLY PHEROMONE
$stage = "SUPPLY"
$finding = "SUPPLY initiated for Run $Run. Pipeline artifacts being routed."
& "$PSScriptRoot\phetrails.ps1" -SessionId $safeName -Run $Run -Stage $stage -Finding $finding -Strength 1 -Category "stage" -Severity "info" -Path "CANON/SCRIPTS/supply.ps1"

# 2) VERIFY SOUL ARTIFACT EXISTS
if (-not (Test-Path $SoulArtifact)) {
    Write-Warning "SOUL artifact not found: $SoulArtifact. Proceeding with standalone SUPPLY."
}

# 3) ROUTE PIPELINE ARTIFACTS
Write-Host "Routing pipeline artifacts..." -ForegroundColor Yellow

$artifacts = @{
    "I-LOG" = $IlogSource
    "COLORIZED" = Join-Path $IlogDir "I-LOG-$safeName-COLORIZED.md"
    "STATS" = Join-Path $IlogDir "I-LOG-$safeName-STATS.json"
    "PIPELINE" = Join-Path $RiseDir "pipeline-$safeName.json"
    "HANDOFF" = Join-Path $RiseDir "handoff-$safeName-to-NEXT.json"
}

$routed = @{}
foreach ($artifact in $artifacts.GetEnumerator() | Sort-Object Name) {
    if (Test-Path $artifact.Value) {
        $routed[$artifact.Name] = "PRESENT"
        Write-Host "  [$($artifact.Name)] $($artifact.Value)" -ForegroundColor Green
    } else {
        $routed[$artifact.Name] = "MISSING"
        Write-Host "  [$($artifact.Name)] MISSING" -ForegroundColor Yellow
    }
}

# 4) CREATE SUPPLY ARTIFACT
$supplyDir = "CANON/SUPPLY"
if (-not (Test-Path $supplyDir)) { New-Item -ItemType Directory -Path $supplyDir -Force | Out-Null }

$timestamp = Get-Date -Format "yyyyMMddTHHmmss"
$supplyFile = Join-Path $supplyDir "supply-$safeName-$timestamp.md"

$supplyContent = @"
# SUPPLY Checkpoint — $safeName

**Stage:** SUPPLY (Stage 5)
**Run:** $Run
**Timestamp:** $(Get-Date -Format "o")
**SOUL Artifact:** $SoulArtifact

## Artifact Routing
| Artifact | Status |
|----------|--------|
"@

foreach ($artifact in $artifacts.GetEnumerator() | Sort-Object Name) {
    $supplyContent += "| $($artifact.Name) | $($routed[$artifact.Name]) |`n"
}

$supplyContent += @"
## Findings
- Pipeline artifacts routed
- $(if ($routed.Values -contains "MISSING") { "Some artifacts missing - review needed" } else { "All artifacts present" })
- Ready for ENGINEER

## Handoff
- **To:** $NextStage
- **Artifact:** $supplyFile
"@

$supplyContent | Set-Content $supplyFile -Encoding UTF8
Write-Host "SUPPLY artifact created: $supplyFile" -ForegroundColor Green

# 5) EMIT SUPPLY COMPLETE PHEROMONE
$completeFinding = "SUPPLY complete for Run $Run. Artifacts routed: $($artifacts.Count) checked. Handoff to $NextStage."
& "$PSScriptRoot\phetrails.ps1" -SessionId $safeName -Run $Run -Stage $stage -Finding $completeFinding -Strength 2 -Category "stage" -Severity "info" -Path $supplyFile

Write-Host "SUPPLY COMPLETE. Run $Run ready for $NextStage." -ForegroundColor Green
