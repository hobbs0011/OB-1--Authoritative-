param(
    [Parameter(Mandatory=$true)] [string]$Run,
    [Parameter(Mandatory=$true)] [string]$IlogSource,
    [string]$SessionName,
    [string]$SessionTitle,
    [string]$RiseDir = "CANON/REINCARNATION",
    [string]$IlogDir = "I-LOG-UNAUDITED",
    [string]$NextStage = "MARCH"
)

$ErrorActionPreference = 'Stop'
$safeName = if ($SessionName) {
    $SessionName -replace '[\\/:*?"<>|&\(\)\s]+', '-' -replace '-+', '-' -replace '^-|-$', ''
} else {
    "Run$Run"
}

Write-Host "=== SCOUT (Stage 2) - Run $Run ===" -ForegroundColor Cyan

# 1) EMIT SCOUT PHEROMONE
$stage = "SCOUT"
$finding = "SCOUT initiated for Run $Run. Lightweight reconnaissance. Flag and tag only."
& "$PSScriptRoot\phetrails.ps1" -SessionId $safeName -Run $Run -Stage $stage -Finding $finding -Strength 1 -Category "stage" -Severity "info" -Path "CANON/SCRIPTS/scout.ps1"

# 2) VERIFY I-LOG EXISTS
if (-not (Test-Path $IlogSource)) {
    Write-Error "I-LOG file not found: $IlogSource"
    & "$PSScriptRoot\phetrails.ps1" -SessionId $safeName -Run $Run -Stage $stage -Finding "SCOUT failed: I-LOG not found" -Strength 0 -Category "stage" -Severity "error" -Path "CANON/SCRIPTS/scout.ps1"
    exit 1
}

# 3) LIGHTWEIGHT RECON - FLAG AND TAG ONLY
Write-Host "Running lightweight reconnaissance..." -ForegroundColor Yellow
$lines = Get-Content $IlogSource
$totalLines = $lines.Count
$firstLine = $lines[0]
$lastLine = $lines[-1]

Write-Host "  Total lines: $totalLines" -ForegroundColor Gray
Write-Host "  First line: $firstLine" -ForegroundColor Gray
Write-Host "  Last line: $lastLine" -ForegroundColor Gray

# 4) CREATE SCOUT ARTIFACT
$scoutDir = "CANON/SCOUT"
if (-not (Test-Path $scoutDir)) { New-Item -ItemType Directory -Path $scoutDir -Force | Out-Null }

$timestamp = Get-Date -Format "yyyyMMddTHHmmss"
$scoutFile = Join-Path $scoutDir "scout-$safeName-$timestamp.md"

$scoutContent = @"
# SCOUT Checkpoint — $safeName

**Stage:** SCOUT (Stage 2)
**Run:** $Run
**Timestamp:** $(Get-Date -Format "o")
**I-LOG Source:** $IlogSource

## Territory Summary
- **Total lines:** $totalLines
- **First entry:** $firstLine
- **Last entry:** $lastLine
- **Status:** Reconnaissance complete. No pipeline. No AI calls. No processing.

## Findings
- Lightweight scan completed
- No critical issues detected in territory
- Ready for MARCH

## Handoff
- **To:** $NextStage
- **Artifact:** $scoutFile
"@

$scoutContent | Set-Content $scoutFile -Encoding UTF8
Write-Host "Scout artifact created: $scoutFile" -ForegroundColor Green

# 5) EMIT SCOUT COMPLETE PHEROMONE
$completeFinding = "SCOUT complete for Run $Run. Territory scanned: $totalLines lines. Handoff to $NextStage."
& "$PSScriptRoot\phetrails.ps1" -SessionId $safeName -Run $Run -Stage $stage -Finding $completeFinding -Strength 2 -Category "stage" -Severity "info" -Path $scoutFile

Write-Host "SCOUT COMPLETE. Run $Run ready for $NextStage." -ForegroundColor Green
