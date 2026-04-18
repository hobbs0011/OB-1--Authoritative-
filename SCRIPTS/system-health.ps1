# System Health Tracking & Logging
# Captures doctor, verify, and boot state for debugging

param(
    [ValidateSet('capture', 'report', 'init')]
    [string]$Action = 'capture'
)

$LogDir = "$PSScriptRoot/../OPERATIONS/system-health-logs"
$HealthFile = "$LogDir/system-health-$(Get-Date -Format 'yyyy-MM-dd').log"
$StateFile = "$LogDir/system-state.json"

# Ensure log directory exists
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force >$null
}

function Write-HealthLog {
    param([string]$Message, [string]$Level = 'INFO')
    $Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $LogEntry = "[$Timestamp] [$Level] $Message"
    Add-Content -Path $HealthFile -Value $LogEntry
    Write-Host $LogEntry
}

function Capture-Doctor {
    Write-HealthLog "=== DOCTOR CHECK ===" 'INFO'
    $cmd = "pwsh -File SCRIPTS/obi.ps1 doctor"
    $result = Invoke-Expression $cmd 2>&1 | Out-String
    
    if ($result -match '"repo_root"') {
        Write-HealthLog "✓ Doctor check passed" 'SUCCESS'
        $result | Add-Content -Path $HealthFile
        return $true
    }
    else {
        Write-HealthLog "✗ Doctor check failed: $result" 'ERROR'
        return $false
    }
}

function Capture-Verify {
    Write-HealthLog "=== VERIFY CHECK ===" 'INFO'
    $cmd = "pwsh -File SCRIPTS/obi.ps1 verify"
    $result = Invoke-Expression $cmd 2>&1 | Out-String
    
    if ($result -match 'dry-run: exiting now') {
        Write-HealthLog "✓ Verify check passed" 'SUCCESS'
        $result | Add-Content -Path $HealthFile
        return $true
    }
    else {
        Write-HealthLog "✗ Verify check failed" 'ERROR'
        $result | Add-Content -Path $HealthFile
        return $false
    }
}

function Capture-GitStatus {
    Write-HealthLog "=== GIT STATUS ===" 'INFO'
    Push-Location $PSScriptRoot/..
    
    $branch = git branch --show-current
    $head = git log --oneline -1
    $unchanged = (git status --short | Measure-Object | Select-Object -ExpandProperty Count) -eq 0
    
    Write-HealthLog "Branch: $branch" 'INFO'
    Write-HealthLog "HEAD: $head" 'INFO'
    Write-HealthLog "Working Tree: $(if ($unchanged) { 'CLEAN' } else { 'DIRTY' })" 'INFO'
    
    Pop-Location
}

function Capture-SoulCheck {
    # HL-140 mandate: health without Soul DNA integrity is a false positive
    Write-HealthLog "=== SOUL DNA INTEGRITY CHECK ===" 'INFO'
    $cmd = "pwsh -File SCRIPTS/obi.ps1 soul-check"
    $result = Invoke-Expression $cmd 2>&1 | Out-String

    if ($result -match '"status"\s*:\s*"SOUL_INTACT"') {
        Write-HealthLog "✓ Soul DNA integrity: INTACT" 'SUCCESS'
        $result | Add-Content -Path $HealthFile
        return $true
    }
    else {
        Write-HealthLog "✗ Soul DNA integrity: COMPROMISED" 'ERROR'
        $result | Add-Content -Path $HealthFile
        return $false
    }
}

function Capture-State {
    Write-HealthLog "--- SYSTEM STATE CAPTURE: $(Get-Date) ---" 'INFO'
    
    Push-Location $PSScriptRoot/..
    
    $doctorOk = Capture-Doctor
    $verifyOk = Capture-Verify
    Capture-GitStatus
    $soulOk = Capture-SoulCheck
    
    # Store state as JSON
    $state = @{
        timestamp = Get-Date -Format 'o'
        doctor_ok = $doctorOk
        verify_ok = $verifyOk
        soul_ok = $soulOk
        git_branch = git branch --show-current
        git_head = git log --oneline -1
    }
    
    $state | ConvertTo-Json | Set-Content -Path $StateFile
    
    Write-HealthLog "State saved to $StateFile" 'INFO'
    Write-HealthLog "" 'INFO'
    
    Pop-Location
    
    return ($doctorOk -and $verifyOk -and $soulOk)
}

function Report-Health {
    if (-not (Test-Path $StateFile)) {
        Write-Host "No system state recorded yet. Run: pwsh SCRIPTS/system-health.ps1 capture" -ForegroundColor Yellow
        return
    }
    
    $state = Get-Content $StateFile | ConvertFrom-Json
    Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║        SYSTEM HEALTH STATUS REPORT         ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    Write-Host "`n[LAST CHECK]" -ForegroundColor Green
    Write-Host "Timestamp: $($state.timestamp)"
    Write-Host "Doctor:    $(if ($state.doctor_ok) { '✓ PASS' } else { '✗ FAIL' })" -ForegroundColor $(if ($state.doctor_ok) { 'Green' } else { 'Red' })
    Write-Host "Verify:    $(if ($state.verify_ok) { '✓ PASS' } else { '✗ FAIL' })" -ForegroundColor $(if ($state.verify_ok) { 'Green' } else { 'Red' })
    Write-Host "Soul DNA:  $(if ($state.soul_ok) { '✓ INTACT' } else { '✗ COMPROMISED' })" -ForegroundColor $(if ($state.soul_ok) { 'Green' } else { 'Red' })
    
    Write-Host "`n[GIT STATE]"
    Write-Host "Branch: $($state.git_branch)"
    Write-Host "HEAD:   $($state.git_head)"
    
    Write-Host "`n[LOG FILES]"
    Write-Host "Today's log: $HealthFile"
    Write-Host "State file:  $StateFile"
    Write-Host ""
}

function Init-HealthTracking {
    Write-Host "Initializing system health tracking..." -ForegroundColor Green
    Write-Host "Log directory: $LogDir" -ForegroundColor Cyan
    
    # Create initial capture
    Capture-State
    
    Write-Host "✓ System health tracking initialized" -ForegroundColor Green
}

# Main
switch ($Action) {
    'capture' { Capture-State >$null; Report-Health }
    'report' { Report-Health }
    'init' { Init-HealthTracking }
}
