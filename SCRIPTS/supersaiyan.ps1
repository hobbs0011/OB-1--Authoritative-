# SUPER SAIYAN MODE - Complete System Activation
# One-shot initialization with zero friction
# Handles: venv, tools, verification, health tracking

param(
    [ValidateSet('activate', 'force-reset')]
    [string]$Mode = 'activate'
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path $PSScriptRoot -Parent
$VenvPath = "$RepoRoot\.venv"

function Write-Status {
    param([string]$Message, [string]$Type = 'info')
    $colors = @{
        'info'    = 'Cyan'
        'success' = 'Green'
        'warning' = 'Yellow'
        'error'   = 'Red'
        'title'   = 'Magenta'
    }
    Write-Host "[$Type] $Message" -ForegroundColor $colors[$Type]
}

function Test-Venv {
    if (-not (Test-Path "$VenvPath\Scripts\Activate.ps1")) {
        return $false
    }
    
    # Test if Python is actually accessible
    try {
        $output = & "$VenvPath\Scripts\python.exe" --version 2>&1
        return $output -match '\d+\.\d+'
    }
    catch {
        return $false
    }
}

function Activate-Venv {
    if (-not (Test-Path $VenvPath)) {
        Write-Status "Creating virtual environment..." 'warning'
        python -m venv $VenvPath
        if ($LASTEXITCODE -ne 0) {
            Write-Status "Failed to create venv" 'error'
            exit 1
        }
    }
    
    if (-not (Test-Venv)) {
        Write-Status "VirtualEnv corrupted, rebuilding..." 'warning'
        Remove-Item -Path $VenvPath -Recurse -Force
        python -m venv $VenvPath
        if ($LASTEXITCODE -ne 0) {
            Write-Status "Failed to create venv" 'error'
            exit 1
        }
    }
    
    # Source the activation script
    & "$VenvPath\Scripts\Activate.ps1"
    Write-Status "Virtual environment activated" 'success'
}

function Check-Dependencies {
    Write-Status "Checking system dependencies..." 'info'
    
    # Check Python
    try {
        $pyVersion = python --version 2>&1
        Write-Status "Python: $pyVersion" 'success'
    }
    catch {
        Write-Status "Python not found - required for venv" 'error'
        return $false
    }
    
    # Check Git
    try {
        $gitVersion = git --version
        Write-Status "Git: $gitVersion" 'success'
    }
    catch {
        Write-Status "Git not found - required for repo operations" 'error'
        return $false
    }
    
    # Check Node (for Wrangler)
    try {
        $nodeVersion = node --version 2>&1
        Write-Status "Node: $nodeVersion" 'success'
    }
    catch {
        Write-Status "Node not found - required for Cloudflare Workers" 'warning'
    }
    
    return $true
}

function Run-Doctor {
    Write-Status "Running system diagnostics..." 'info'
    Push-Location $RepoRoot
    try {
        $doc = pwsh -File SCRIPTS/obi.ps1 doctor | ConvertFrom-Json
        
        if ($doc.email_match -and $doc.github_token -and $doc.cloudflare_api_key) {
            Write-Status "All credentials verified ✓" 'success'
            return $true
        }
        else {
            Write-Status "Credential check incomplete" 'warning'
            return $false
        }
    }
    catch {
        Write-Status "Doctor check failed: $_" 'error'
        return $false
    }
    finally {
        Pop-Location
    }
}

function Run-Verify {
    Write-Status "Running build verification (this may take a moment)..." 'info'
    Push-Location $RepoRoot
    try {
        $output = pwsh -File SCRIPTS/obi.ps1 verify 2>&1 | Out-String
        
        if ($output -match 'dry-run: exiting now') {
            Write-Status "Build verification passed ✓" 'success'
            return $true
        }
        else {
            Write-Status "Build verification issue detected" 'warning'
            return $false
        }
    }
    catch {
        Write-Status "Verification failed: $_" 'error'
        return $false
    }
    finally {
        Pop-Location
    }
}

function Capture-Health {
    Write-Status "Capturing system state..." 'info'
    Push-Location $RepoRoot
    try {
        pwsh -File SCRIPTS/system-health.ps1 capture >$null 2>&1
        Write-Status "Health state captured ✓" 'success'
    }
    catch {
        Write-Status "Health capture failed (non-critical)" 'warning'
    }
    finally {
        Pop-Location
    }
}

function Show-Banner {
    Write-Host ""
    Write-Host "  ╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "  ║                                                                ║" -ForegroundColor Magenta
    Write-Host "  ║           ⚡  SUPER SAIYAN MODE ACTIVATED  ⚡                ║" -ForegroundColor Magenta
    Write-Host "  ║                                                                ║" -ForegroundColor Magenta
    Write-Host "  ║                   Natural English Training                      ║" -ForegroundColor Magenta
    Write-Host "  ║                     OBI (Phoenix Rising)                        ║" -ForegroundColor Magenta
    Write-Host "  ║                                                                ║" -ForegroundColor Magenta
    Write-Host "  ╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
}

function Show-ReadyState {
    Write-Host ""
    Write-Host "  ✓ Environment ready for:" -ForegroundColor Green
    Write-Host "    → Development (pwsh / SCRIPTS/obi.ps1)" -ForegroundColor Cyan
    Write-Host "    → Verification (pwsh -File SCRIPTS/obi.ps1 verify)" -ForegroundColor Cyan
    Write-Host "    → Deployment (wrangler deploy)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  📊 System Health: pwsh -File SCRIPTS/system-health.ps1 report" -ForegroundColor Yellow
    Write-Host ""
}

function Super-Saiyan-Activate {
    Set-Location $RepoRoot
    
    Show-Banner
    
    Write-Status "══════════════════════════════════════════" 'title'
    Write-Status "  PHASE 1: DEPENDENCY CHECK" 'title'
    Write-Status "══════════════════════════════════════════" 'title'
    
    if (-not (Check-Dependencies)) {
        Write-Status "Dependency check failed - cannot proceed" 'error'
        exit 1
    }
    
    Write-Status "══════════════════════════════════════════" 'title'
    Write-Status "  PHASE 2: VIRTUAL ENVIRONMENT" 'title'
    Write-Status "══════════════════════════════════════════" 'title'
    
    Activate-Venv
    
    Write-Status "══════════════════════════════════════════" 'title'
    Write-Status "  PHASE 3: SYSTEM DIAGNOSTICS" 'title'
    Write-Status "══════════════════════════════════════════" 'title'
    
    $docOk = Run-Doctor
    $verOk = Run-Verify
    
    Write-Status "══════════════════════════════════════════" 'title'
    Write-Status "  PHASE 4: HEALTH TRACKING" 'title'
    Write-Status "══════════════════════════════════════════" 'title'
    
    Capture-Health
    
    Show-Banner
    Show-ReadyState
    
    if ($docOk -and $verOk) {
        Write-Status "💪 ALL SYSTEMS OPERATIONAL - READY TO SHIP" 'success'
        exit 0
    }
    else {
        Write-Status "⚠️  Some systems need attention - review above" 'warning'
        exit 0
    }
}

# Main
if ($Mode -eq 'activate') {
    Super-Saiyan-Activate
}
elseif ($Mode -eq 'force-reset') {
    Write-Status "Force-resetting environment..." 'warning'
    if (Test-Path $VenvPath) {
        Write-Status "Removing old venv..." 'info'
        Remove-Item -Path $VenvPath -Recurse -Force
    }
    Write-Status "Reinitializing..." 'info'
    Super-Saiyan-Activate
}
