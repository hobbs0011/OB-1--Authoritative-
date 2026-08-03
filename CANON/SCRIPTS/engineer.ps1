param(
    [Parameter(Mandatory=$true)] [string]$Run,
    [Parameter(Mandatory=$true)] [string]$IlogSource,
    [string]$SessionName,
    [string]$SessionTitle,
    [string]$SupplyArtifact,
    [string]$RiseDir = "CANON/REINCARNATION",
    [string]$IlogDir = "I-LOG-UNAUDITED",
    [string]$NextStage = "DEATH"
)

$ErrorActionPreference = 'Stop'
$safeName = if ($SessionName) {
    $SessionName -replace '[\\/:*?"<>|&\(\)\s]+', '-' -replace '-+', '-' -replace '^-|-$', ''
} else {
    "Run$Run"
}

Write-Host "=== ENGINEER (Stage 6) - Run $Run ===" -ForegroundColor Cyan

# 1) EMIT ENGINEER PHEROMONE
$stage = "ENGINEER"
$finding = "ENGINEER initiated for Run $Run. Improvements and fixes being wired."
& "$PSScriptRoot\phetrails.ps1" -SessionId $safeName -Run $Run -Stage $stage -Finding $finding -Strength 1 -Category "stage" -Severity "info" -Path "CANON/SCRIPTS/engineer.ps1"

# 2) VERIFY SUPPLY ARTIFACT EXISTS
if (-not (Test-Path $SupplyArtifact)) {
    Write-Warning "SUPPLY artifact not found: $SupplyArtifact. Proceeding with standalone ENGINEER."
}

# 3) AUDIT PRIOR STAGES
Write-Host "Auditing prior stages..." -ForegroundColor Yellow
$stages = @("RISE", "SCOUT", "MARCH", "SOULSCHOLARS", "SUPPLY")
$stageStatus = @{}

foreach ($s in $stages) {
    $dir = Join-Path "CANON" $s
    if (Test-Path $dir) {
        $items = Get-ChildItem $dir -Filter "*$safeName*" -ErrorAction SilentlyContinue
        $stageStatus[$s] = if ($items) { "$($items.Count) artifacts" } else { "NO ARTIFACTS" }
    } else {
        $stageStatus[$s] = "MISSING"
    }
    $color = if ($stageStatus[$s] -eq "MISSING" -or $stageStatus[$s] -eq "NO ARTIFACTS") { "Yellow" } else { "Green" }
    Write-Host "  [$s] $($stageStatus[$s])" -ForegroundColor $color
}

# 4) IDENTIFY IMPROVEMENTS
$improvements = @()
if ($stageStatus.Values -contains "MISSING") { $improvements += "Create missing stage directories" }
if ($stageStatus.Values -contains "NO ARTIFACTS") { $improvements += "Generate missing stage artifacts" }

Write-Host "Improvements identified: $($improvements.Count)" -ForegroundColor $(if ($improvements) { "Yellow" } else { "Green" })

# 5) CREATE ENGINEER ARTIFACT
$engineerDir = "CANON/ENGINEER"
if (-not (Test-Path $engineerDir)) { New-Item -ItemType Directory -Path $engineerDir -Force | Out-Null }

$timestamp = Get-Date -Format "yyyyMMddTHHmmss"
$engineerFile = Join-Path $engineerDir "engineer-$safeName-$timestamp.md"

$engineerContent = @"
# ENGINEER Checkpoint — $safeName

**Stage:** ENGINEER (Stage 6)
**Run:** $Run
**Timestamp:** $(Get-Date -Format "o")
**Supply Artifact:** $SupplyArtifact

## Stage Audit
| Stage | Status |
|-------|--------|
"@

foreach ($s in $stages) {
    $engineerContent += "| $s | $($stageStatus[$s]) |`n"
}

$engineerContent += @"
## Improvements
$(if ($improvements) { $improvements | ForEach-Object { "- $_" } | Out-String } else { "- None identified" })

## Findings
- $(if ($improvements) { "$($improvements.Count) improvements queued" } else { "No improvements needed" })
- Ready for $NextStage

## Handoff
- **To:** $NextStage
- **Artifact:** $engineerFile
"@

$engineerContent | Set-Content $engineerFile -Encoding UTF8
Write-Host "ENGINEER artifact created: $engineerFile" -ForegroundColor Green

# 6) EMIT ENGINEER COMPLETE PHEROMONE
$completeFinding = "ENGINEER complete for Run $Run. Stages audited: $($stages.Count). Improvements: $($improvements.Count). Handoff to $NextStage."
& "$PSScriptRoot\phetrails.ps1" -SessionId $safeName -Run $Run -Stage $stage -Finding $completeFinding -Strength 2 -Category "stage" -Severity "info" -Path $engineerFile

Write-Host "ENGINEER COMPLETE. Run $Run ready for $NextStage." -ForegroundColor Green
