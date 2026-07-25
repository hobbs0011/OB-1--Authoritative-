# PHEROMONE TRAIL DEPOSITION SCRIPT
# Canonical path: CANON/SCRIPTS/phetrails.ps1
# Purpose: Hit POST /api/pheromone/deposit on soul-logger worker
# Called by: Every SCS stage checkpoint (SCOUT, MARCH, SCHOLAR, SUPPLY, ENGINEER, DEATH)
# BB-00: PheromoneKeylogger — involuntary deposition

param(
    [Parameter(Mandatory=$true)] [string]$SessionId,
    [Parameter(Mandatory=$true)] [string]$Stage,
    [Parameter(Mandatory=$true)] [string]$Finding,
    [string]$Run = "",
    [string]$Category = "",
    [string]$Severity = "",
    [string]$Path = "",
    [int]$Strength = 0,
    [int]$SoulCount = 0,
    [int]$DnaCount = 0,
    [int]$ReasonCount = 0,
    [string]$CheckpointArtifact = ""
)

$apiBase = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$body = @{
    session_id = $SessionId
    run = $Run
    stage = $Stage
    category = $Category
    severity = $Severity
    path = $Path
    finding = $Finding
    strength = $Strength
    soulcount = $SoulCount
    dnacount = $DnaCount
    reasoncount = $ReasonCount
    checkpoint_artifact = $CheckpointArtifact
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$apiBase/api/pheromone/deposit" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "PHETRAIL DEPOSITED: $($response.deposit_id) | stage=$Stage | strength=$Strength | soul=$SoulCount dna=$DnaCount reason=$ReasonCount"
    return $response
} catch {
    Write-Warning "PHETRAIL FAILED: $_"
}

# ── COLORIZE RRL (optional — only if an RRL path is provided) ──
if ($CheckpointArtifact -and $CheckpointArtifact -match 'RRL\\(.+)') {
    $rrlPath = $CheckpointArtifact
    if (Test-Path $rrlPath) {
        Write-Host "Colorizing RRL: $rrlPath" -ForegroundColor Magenta
        & "CANON/SCRIPTS/rrl-colorize.ps1" -InputFile $rrlPath -StatsOnly
        Write-Host "RRL colorized: $(Split-Path $rrlPath)\$([System.IO.Path]::GetFileNameWithoutExtension($rrlPath))-COLORIZED.md" -ForegroundColor Green
    }
}