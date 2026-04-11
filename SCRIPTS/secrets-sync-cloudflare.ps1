# ============================================
# PHOENIX-COMMAND — Cloudflare Secrets Sync
# Pushes secrets from .env → Cloudflare Workers via wrangler
# Usage: .\SCRIPTS\secrets-sync-cloudflare.ps1
# ============================================

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent

# Worker directories with wrangler.toml
$workers = @(
    @{ Name = "net-pet-ai"; Path = Join-Path $repoRoot "APPS\NET-PET-AI" }
    @{ Name = "net-obi-api"; Path = Join-Path $repoRoot "WORKERS" }
    @{ Name = "net-core"; Path = Join-Path $repoRoot "WORKERS\net-core" }
)

# Secrets each worker needs (map worker → required env vars)
$workerSecrets = @{
    "net-pet-ai"  = @(
        "DEEPSEEK_API_KEY",
        "DEEPGRAM_API_KEY",
        "SOVEREIGN_KEY"
    )
    "net-obi-api" = @(
        "DEEPSEEK_API_KEY",
        "DEEPGRAM_API_KEY"
    )
    "net-core"    = @(
        "DEEPSEEK_API_KEY"
    )
}

# Decrypt secrets
Write-Host "Decrypting .env..." -ForegroundColor Cyan
$decrypted = & dotenvx get --all --plain-text 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "FATAL: dotenvx decrypt failed" -ForegroundColor Red
    exit 1
}

# Parse into hashtable
$secrets = @{}
foreach ($line in $decrypted -split "`n") {
    if ($line.Trim() -match '^([A-Z_]+)=(.*)$') {
        $key = $Matches[1]
        $val = $Matches[2] -replace '^"(.*)"$', '$1'
        $secrets[$key] = $val
    }
}

# Push to each worker
foreach ($worker in $workers) {
    $name = $worker.Name
    $path = $worker.Path
    
    if (-not (Test-Path (Join-Path $path "wrangler.toml"))) {
        Write-Host "SKIP $name — no wrangler.toml at $path" -ForegroundColor Yellow
        continue
    }
    
    $required = $workerSecrets[$name]
    if (-not $required) {
        Write-Host "SKIP $name — no secrets mapped" -ForegroundColor Yellow
        continue
    }
    
    Write-Host ""
    Write-Host "=== $name ===" -ForegroundColor Cyan
    
    Push-Location $path
    foreach ($key in $required) {
        if ($secrets.ContainsKey($key)) {
            Write-Host "  Pushing $key..." -ForegroundColor Gray -NoNewline
            $secrets[$key] | npx wrangler secret put $key 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host " OK" -ForegroundColor Green
            }
            else {
                Write-Host " FAILED" -ForegroundColor Red
            }
        }
        else {
            Write-Host "  MISSING $key in .env" -ForegroundColor Yellow
        }
    }
    Pop-Location
}

Write-Host ""
Write-Host "Cloudflare secrets sync complete." -ForegroundColor Cyan
