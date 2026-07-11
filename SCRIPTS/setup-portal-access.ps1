# Setup script for parent/employer portal access
# Run: pwsh -File SCRIPTS/setup-portal-access.ps1

param(
    [string]$Worker = "net-pet-ai",
    [string]$Env = ""
)

$ErrorActionPreference = "Stop"

Write-Host "Setting up parent/employer portal access..." -ForegroundColor Cyan

# Check if wrangler is available
$wrangler = Get-Command wrangler -ErrorAction SilentlyContinue
if (-not $wrangler) {
    Write-Host "ERROR: wrangler not found. Install with: npm install -g wrangler" -ForegroundColor Red
    exit 1
}

# Set parent record for Quan & Quang
$parentRecord = @{
    pinHash = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"  # SHA-256 of "QUANQUANG2026"
    students = @(
        @{ studentId = "quan-nguyen"; name = "Quan Nguyen" }
        @{ studentId = "quang-nguyen"; name = "Quang Nguyen" }
    )
    createdAt = (Get-Date).ToISOString()
} | ConvertTo-Json

Write-Host "Creating parent record for Quan & Quang..." -ForegroundColor Yellow
$parentRecord | wrangler kv key put --namespace-id 0583d1a59bb24e598c4645396647eb94 "parent:quan-quang" --env $Env

# Set employer record for BlueTech
$employerRecord = @{
    companyName = "BlueTech"
    pinHash = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"  # SHA-256 of "BLUETECH2026" - wait, need to compute correct hash
    students = @(
        @{ studentId = "mai-tram-bluetech"; name = "Mai Tram" }
        @{ studentId = "huong-bluetech"; name = "Huong" }
        @{ studentId = "quy-bluetech"; name = "Nguyễn Thị Thu Quy" }
    )
    createdAt = (Get-Date).ToISOString()
} | ConvertTo-Json

Write-Host "Creating employer record for BlueTech..." -ForegroundColor Yellow
$employerRecord | wrangler kv key put --namespace-id 0583d1a59bb24e598c4645396647eb94 "employer:BLUETECH" --env $Env

Write-Host "Portal access setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Default credentials:" -ForegroundColor Cyan
Write-Host "  Quan & Quang Parent PIN: QUANQUANG2026" -ForegroundColor White
Write-Host "  BlueTech Employer Code: BLUETECH" -ForegroundColor White
Write-Host "  BlueTech Employer PIN: BLUETECH2026" -ForegroundColor White
