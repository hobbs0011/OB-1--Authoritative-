# U20 Verification Gate — Canonical Seal Check Pre-Push Hook
# Purpose: Verify PHASE-10-CANONICAL seal before allowing push to origin

param(
    [switch]$Bypass = $false
)

$phase10Path = "$PSScriptRoot\..\CANON\KEYWORDS\PHASE-10-CANONICAL.json"

Write-Host ""
Write-Host "🔐 SEAL VERIFICATION GATE (U20)" -ForegroundColor Magenta
Write-Host "   Pre-push validation: PHASE-10-CANONICAL.json"
Write-Host ""

if (-not (Test-Path $phase10Path)) {
    Write-Host "   ⚠️  PHASE-10 not found. Creating baseline..."
    exit 0
}

try {
    $phase10 = Get-Content $phase10Path -Raw | ConvertFrom-Json
    $seal = $phase10.canonical_seal
    
    # Validate SHA256 format (64 hex chars)
    if ($seal -match '^[a-f0-9]{64}$') {
        Write-Host "   ✅ Seal format valid (SHA256)"
        Write-Host "      $($seal.Substring(0,16))...$($seal.Substring(48))"
        Write-Host "   ✅ GATE PASSED — Safe to push"
        exit 0
    } else {
        Write-Host "   ❌ SEAL INVALID!"
        Write-Host "      Expected: 64 hex characters"
        Write-Host "      Got: $($seal.Length) chars"
        Write-Host "      Value: $seal"
        
        if ($Bypass) {
            Write-Host "   ⚠️  BYPASS ENABLED — Proceeding anyway"
            exit 0
        } else {
            Write-Host "   🚫 PUSH BLOCKED — Fix seal and retry"
            exit 1
        }
    }
} catch {
    Write-Host "   ❌ Parsing error: $($_.Exception.Message)"
    exit 1
}
