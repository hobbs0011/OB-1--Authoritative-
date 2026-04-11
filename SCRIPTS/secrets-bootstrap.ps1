# ============================================
# PHOENIX-COMMAND — Secrets Bootstrap
# Restores encrypted .env → Windows User env vars
# Requires: .env.keys in repo root (gitignored)
# Usage: .\SCRIPTS\secrets-bootstrap.ps1
# ============================================

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent

# Verify .env.keys exists
$keysFile = Join-Path $repoRoot ".env.keys"
if (-not (Test-Path $keysFile)) {
    Write-Host "FATAL: .env.keys not found at $keysFile" -ForegroundColor Red
    Write-Host "This file is gitignored. Copy it from a secure backup." -ForegroundColor Yellow
    exit 1
}

# Decrypt and extract key=value pairs
Write-Host "Decrypting .env..." -ForegroundColor Cyan
$decrypted = & dotenvx get --all --plain-text 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "FATAL: dotenvx decrypt failed. Is .env.keys valid?" -ForegroundColor Red
    Write-Host $decrypted
    exit 1
}

$count = 0
foreach ($line in $decrypted -split "`n") {
    $line = $line.Trim()
    if ($line -match '^([A-Z_]+)=(.*)$') {
        $key = $Matches[1]
        $val = $Matches[2]
        # Strip surrounding quotes
        $val = $val -replace '^"(.*)"$', '$1'
        $val = $val -replace "^'(.*)'$", '$1'
        
        # Skip dotenvx internal keys
        if ($key -eq "DOTENV_PUBLIC_KEY") { continue }
        
        # Set as Windows User env var (persistent)
        [System.Environment]::SetEnvironmentVariable($key, $val, "User")
        # Set in current session
        Set-Item -Path "Env:\$key" -Value $val
        Write-Host "  SET $key" -ForegroundColor Green
        $count++
    }
}

Write-Host ""
Write-Host "$count secrets restored to Windows User environment." -ForegroundColor Cyan
Write-Host "Restart terminals/apps to pick up new values." -ForegroundColor Yellow
