param(
    [Parameter(Mandatory=$true)] [string]$Run,
    [Parameter(Mandatory=$true)] [string]$IlogSource,
    [string]$SessionName,
    [string]$SessionTitle,
    [string]$MarchArtifact,
    [string]$RiseDir = "CANON/REINCARNATION",
    [string]$IlogDir = "I-LOG-UNAUDITED",
    [string]$NextStage = "SUPPLY"
)

$ErrorActionPreference = 'Stop'
$safeName = if ($SessionName) {
    $SessionName -replace '[\\/:*?"<>|&\(\)\s]+', '-' -replace '-+', '-' -replace '^-|-$', ''
} else {
    "Run$Run"
}

Write-Host "=== SOULSCHOLARS (Stage 4) - Run $Run ===" -ForegroundColor Cyan

# 1) EMIT SOULSCHOLARS PHEROMONE
$stage = "SOULSCHOLARS"
$finding = "SOULSCHOLARS initiated for Run $Run. Pattern extraction and analysis."
& "$PSScriptRoot\phetrails.ps1" -SessionId $safeName -Run $Run -Stage $stage -Finding $finding -Strength 1 -Category "stage" -Severity "info" -Path "CANON/SCRIPTS/soulscholars.ps1"

# 2) VERIFY MARCH ARTIFACT EXISTS
if (-not (Test-Path $MarchArtifact)) {
    Write-Warning "March artifact not found: $MarchArtifact. Proceeding with standalone SOULSCHOLARS."
}

# 3) PATTERN EXTRACTION
Write-Host "Extracting SOUL/DNA patterns..." -ForegroundColor Yellow

if (-not (Test-Path $IlogSource)) {
    Write-Error "I-LOG file not found: $IlogSource"
    & "$PSScriptRoot\phetrails.ps1" -SessionId $safeName -Run $Run -Stage $stage -Finding "SOULSCHOLARS failed: I-LOG not found" -Strength 0 -Category "stage" -Severity "error" -Path "CANON/SCRIPTS/soulscholars.ps1"
    exit 1
}

$lines = Get-Content $IlogSource
$totalLines = $lines.Count
$soulCount = 0
$dnaCount = 0
$reasonCount = 0

foreach ($line in $lines) {
    if ($line -match '"role":\s*"user"') { $soulCount++ }
    elseif ($line -match '"role":\s*"assistant"') {
        $dnaCount++
        if ($line -match '"type":\s*"reasoning"') { $reasonCount++ }
    }
}

Write-Host "  SOUL (user): $soulCount" -ForegroundColor Magenta
Write-Host "  DNA (assistant): $dnaCount" -ForegroundColor Red
Write-Host "  REASON (reasoning): $reasonCount" -ForegroundColor Yellow

# 4) CREATE SOULSCHOLARS ARTIFACT
$soulDir = "CANON/SOUL"
if (-not (Test-Path $soulDir)) { New-Item -ItemType Directory -Path $soulDir -Force | Out-Null }

$timestamp = Get-Date -Format "yyyyMMddTHHmmss"
$soulFile = Join-Path $soulDir "soulscholars-$safeName-$timestamp.md"

$soulContent = @"
# SOULSCHOLARS Checkpoint — $safeName

**Stage:** SOULSCHOLARS (Stage 4)
**Run:** $Run
**Timestamp:** $(Get-Date -Format "o")
**March Artifact:** $MarchArtifact

## Pattern Extraction Results
| Metric | Count |
|--------|-------|
| SOUL (user) | $soulCount |
| DNA (assistant) | $dnaCount |
| REASON (reasoning) | $reasonCount |
| Total lines | $totalLines |

## Findings
- Pattern extraction complete
- $(if ($reasonCount -gt 0) { "Reasoning detected: $reasonCount instances" } else { "No reasoning blocks detected" })
- Ready for SUPPLY

## Handoff
- **To:** $NextStage
- **Artifact:** $soulFile
"@

$soulContent | Set-Content $soulFile -Encoding UTF8
Write-Host "SOULSCHOLARS artifact created: $soulFile" -ForegroundColor Green

# 5) EMIT SOULSCHOLARS COMPLETE PHEROMONE
$completeFinding = "SOULSCHOLARS complete for Run $Run. Patterns extracted: SOUL=$soulCount DNA=$dnaCount REASON=$reasonCount. Handoff to $NextStage."
& "$PSScriptRoot\phetrails.ps1" -SessionId $safeName -Run $Run -Stage $stage -Finding $completeFinding -Strength 2 -Category "stage" -Severity "info" -Path $soulFile -SoulCount $soulCount -DnaCount $dnaCount -ReasonCount $reasonCount

Write-Host "SOULSCHOLARS COMPLETE. Run $Run ready for $NextStage." -ForegroundColor Green
