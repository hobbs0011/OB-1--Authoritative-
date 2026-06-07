# session-capture.ps1 - Auto-fires on Claude session stop
# THE FIX: Copy JSONL verbatim. Pipeline handles extraction. No parsing here.
# DO NOT DELETE - wired in stop hook
#
# CRITICAL CHANGE (2026-06-05): Use ACTIVE SESSION UUID as source of truth.
# Previous behavior: Sort JSONL files by LastWriteTime descending, pick first.
# PROBLEM: Wrong file picked when multiple sessions recently active.
# NEW behavior: Read active session UUID from history.jsonl, match exact UUID.
# This ensures ONLY the current session's transcript is captured.

$ErrorActionPreference = "Continue"
$repo      = "D:\OB-1-CANONICAL"
$rrlDir    = "$repo\RRL"
$jsonlBase = "$env:USERPROFILE\.claude\projects\d--OB-1-CANONICAL"
$historyPath = "$env:USERPROFILE\.claude\history.jsonl"

Set-Location $repo

# 1. Read ACTIVE session UUID from history.jsonl (last line = current session)
$activeSessionId = $null
if (Test-Path $historyPath) {
    try {
        $historyLines = [System.IO.File]::ReadAllLines($historyPath, [System.Text.Encoding]::UTF8)
        $lastLine = $historyLines[-1]
        if ($lastLine -match '"sessionId"\s*:\s*"([^"]+)"') {
            $activeSessionId = $matches[1]
        }
    } catch {
        Write-Warning "Could not read history.jsonl: $($_.Exception.Message)"
    }
}

if (-not $activeSessionId) {
    Write-Error "FATAL: Could not determine active session UUID from history.jsonl"
    exit 1
}

Write-Host "ACTIVE SESSION: $activeSessionId"

# 2. Find JSONL matching ACTIVE session UUID (exact match, no timestamp guesswork)
$jsonlFile = Get-ChildItem $jsonlBase -Filter "*.jsonl" -ErrorAction SilentlyContinue |
             Where-Object { $_.BaseName -eq $activeSessionId } |
             Select-Object -First 1

# Fallback: search broader paths if not in projects dir
if (-not $jsonlFile) {
    $jsonlFile = Get-ChildItem "$env:USERPROFILE\.claude" -Filter "$activeSessionId.jsonl" -ErrorAction SilentlyContinue |
                 Select-Object -First 1
}

# Kilo-specific paths (Kilo stores JSONL separately from Claude Code projects)
if (-not $jsonlFile) {
    $kiloPaths = @(
        "$repo\.kilo\sessions",
        "$repo\.kilo",
        "$env:LOCALAPPDATA\kilo\sessions",
        "$env:APPDATA\kilo\sessions",
        "$repo\.kilo\worktrees"
    )
    foreach ($kp in $kiloPaths) {
        if (Test-Path $kp) {
            $jsonlFile = Get-ChildItem $kp -Recurse -Filter "*.jsonl" -ErrorAction SilentlyContinue |
                         Sort-Object LastWriteTime -Descending |
                         Select-Object -First 1
            if ($jsonlFile) { break }
        }
    }
}

# Last resort: history.jsonl itself IS the source
if (-not $jsonlFile) {
    Write-Warning "JSONL file not found by UUID, copying history.jsonl as RRL"
    $jsonlFile = Get-Item $historyPath
}

# RECOVERY: if we fell back to history.jsonl, try to find the actual session JSONL
# by LastWriteTime (most recently modified jsonl in known dirs)
if ($jsonlFile.Name -eq "history.jsonl") {
    $candidate = Get-ChildItem @("$jsonlBase", "$env:USERPROFILE\.claude", "$repo\.kilo") -Recurse -Filter "*.jsonl" -ErrorAction SilentlyContinue |
                 Sort-Object LastWriteTime -Descending |
                 Select-Object -First 1
    if ($candidate -and $candidate.Length -gt 1000) {
        Write-Host "RECOVERY: using most-recent JSONL by timestamp: $($candidate.FullName)"
        $jsonlFile = $candidate
    }
}

if (-not (Test-Path $jsonlFile.FullName)) {
    Write-Error "FATAL: JSONL source not found for session $activeSessionId"
    exit 1
}

Write-Host "SOURCE: $($jsonlFile.Name) - $($jsonlFile.Length) bytes"

# 3. Derive run number
$run = 0
$lastDeath = git log --oneline --grep "death:" -1 2>$null
if ($lastDeath -match '(?i)run\s*(\d+)') { $run = [int]$matches[1] + 1 }

$rrlPath = "$rrlDir\RRL-$run.txt"

# 4. Copy JSONL VERBATIM. No parsing. No filtering. No reconstruction.
Copy-Item $jsonlFile.FullName $rrlPath -Force
$rrlBytes = (Get-Item $rrlPath).Length
Write-Host "RRL WRITTEN: $rrlPath - $rrlBytes bytes (verbatim JSONL copy)"

# 5. Invoke pipeline (SOUL->DNA->LEDGER->STARMAP->SOULKEYS->S2Pipeline)
$pipeline = "$repo\SCRIPTS\rrl-pipeline.ps1"
if (Test-Path $pipeline) {
    Write-Host "INVOKING PIPELINE..."
    pwsh -File $pipeline -RRLFile $rrlPath -RunNumber $run
} else {
    Write-Host "WARN: $pipeline not found"
}

Write-Host ""
Write-Host "SESSION CAPTURE COMPLETE - Run $run"
