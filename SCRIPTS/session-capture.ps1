# session-capture.ps1 — Auto-fires on Claude session stop
# THE FIX: Copy JSONL verbatim. Pipeline handles extraction. No parsing here.
# DO NOT DELETE — wired in stop hook

$ErrorActionPreference = "Continue"
$repo      = "D:\OB-1-CANONICAL"
$rrlDir    = "$repo\RRL"
$jsonlBase = "$env:USERPROFILE\.claude\projects\d--OB-1-CANONICAL"

Set-Location $repo

# ── Find latest JSONL ────────────────────────────────────────────────────────
$jsonlFile = Get-ChildItem $jsonlBase -Filter "*.jsonl" -ErrorAction SilentlyContinue |
             Sort-Object LastWriteTime -Descending | Select-Object -First 1

if (-not $jsonlFile) {
    Write-Error "FATAL: No JSONL found in $jsonlBase"
    exit 1
}

Write-Host "SOURCE: $($jsonlFile.Name) — $($jsonlFile.Length) bytes"

# ── Derive run number ────────────────────────────────────────────────────────
$run = 0
$lastDeath = git log --oneline --grep "death:" -1 2>$null
if ($lastDeath -match '(?i)run\s*(\d+)') { $run = [int]$matches[1] + 1 }

$rrlPath = "$rrlDir\RRL-$run.txt"

# ── Copy JSONL VERBATIM. No parsing. No filtering. No reconstruction. ────────
Copy-Item $jsonlFile.FullName $rrlPath -Force
$rrlBytes = (Get-Item $rrlPath).Length
Write-Host "RRL WRITTEN: $rrlPath — $rrlBytes bytes (verbatim JSONL copy)"

# ── Invoke pipeline (SOUL→DNA→LEDGER→STARMAP→SOULKEYS→S2Pipeline) ───────────
$pipeline = "$repo\SCRIPTS\rrl-pipeline.ps1"
if (Test-Path $pipeline) {
    Write-Host "INVOKING PIPELINE..."
    pwsh -File $pipeline -RRLFile $rrlPath -RunNumber $run
} else {
    Write-Host "WARN: $pipeline not found"
}

Write-Host ""
Write-Host "SESSION CAPTURE COMPLETE — Run $run"
