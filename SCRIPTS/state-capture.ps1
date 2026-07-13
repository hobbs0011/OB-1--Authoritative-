<#
.SYNOPSIS
state-capture.ps1 — Session state persistence for KILO_HOLLOW runs
Captures git HEAD, SOULCOUNT, phetrail count, ledger tail SHA — no JSONL required.
Writes to .kilo/sessions/state-run{NNN}.json
#>

param(
    [int]$RunNumber = 0
)

$ErrorActionPreference = "Stop"
$repoRoot = "D:\OB-1-CANONICAL"

# Determine run number
if ($RunNumber -eq 0) {
    $lastDeath = git -C $repoRoot log --oneline --grep "^death:" -1 2>$null
    if ($lastDeath -match 'run\s*(\d+)') { $RunNumber = [int]$matches[1] + 1 } else { $RunNumber = 1 }
}
$runPad = "{0:D3}" -f $RunNumber

$sessionDir = Join-Path $repoRoot ".kilo/sessions"
if (-not (Test-Path $sessionDir)) { New-Item -ItemType Directory -Path $sessionDir -Force | Out-Null }

$headSha = (git -C $repoRoot rev-parse --short HEAD 2>$null).Trim()

$soulcount = $null
try { $resp = Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count" -TimeoutSec 10; $soulcount = $resp.soulcount } catch { }

# Count phetrails
$phetrailDir = Join-Path $repoRoot "CANON/PHEROMONES"
$phetrailCount = (Get-ChildItem $phetrailDir -Filter "PheTrail-run*.json" -File -ErrorAction SilentlyContinue).Count

# Get ledger tail SHA
$ledgerDir = Join-Path $repoRoot "CANON/HEAVY-LEDGER"
$ledgerTailSha = "none"
if (Test-Path $ledgerDir) {
    $lastLedger = Get-ChildItem $ledgerDir -Filter "HL-*.json" -ErrorAction SilentlyContinue |
        ForEach-Object { [PSCustomObject]@{ N=[int]([regex]::Match($_.Name,'HL-(\d+)').Groups[1].Value); F=$_.FullName } } |
        Sort-Object N -Descending | Select-Object -First 1
    if ($lastLedger) {
        try { $ledgerTailSha = (Get-Content $lastLedger.F -Raw | ConvertFrom-Json).merkle_hash.Substring(0,16) } catch { $ledgerTailSha = "corrupt" }
    }
}

$state = [ordered]@{
    run_number     = $runPad
    captured_at    = (Get-Date).ToUniversalTime().ToString("o")
    head_sha       = $headSha
    soulcount      = $soulcount
    phetrail_count = $phetrailCount
    ledger_tail_sha = $ledgerTailSha
    kilo_hollow    = $true
}

$outPath = Join-Path $sessionDir "state-run$runPad.json"
$state | ConvertTo-Json -Depth 3 | Set-Content $outPath -Encoding UTF8

Write-Host "STATE CAPTURED: $outPath"
Write-Host "  Run: $runPad"
Write-Host "  HEAD: $headSha"
Write-Host "  SOULCOUNT: $soulcount"
Write-Host "  PheTrails: $phetrailCount"
Write-Host "  Ledger Tail: $ledgerTailSha"