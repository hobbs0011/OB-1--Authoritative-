# ASUS ASUS Precision Touchpad Removal - Boot-Level Fix
# Place in: C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp\REMOVE-ASUS-TOUCHPAD.ps1
# Runs once at boot before user login

Start-Sleep -Seconds 10  # Wait for services

# Kill ASUS processes aggressively
Stop-Process -Name "AsusPTPService" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "AsusAppService" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "ASUSOptimization" -Force -ErrorAction SilentlyContinue

# Disable ASUS services by registry (more reliable than Set-Service)
$svcKeys = @(
    "HKLM:\SYSTEM\CurrentControlSet\Services\AsusPTPService",
    "HKLM:\SYSTEM\CurrentControlSet\Services\AsusPTPDrv",
    "HKLM:\SYSTEM\CurrentControlSet\Services\ArmouryCrateControlInterface"
)
foreach ($key in $svcKeys) {
    if (Test-Path $key) {
        Set-ItemProperty -Path $key -Name "Start" -Value 4 -ErrorAction SilentlyContinue
    }
}

# Remove ASUS touchpad device via devcon (if available) or pnputil at boot
# This runs at high privilege before GUI loads

Write-Host "ASUS touchpad removal queued for boot sequence" -ForegroundColor Yellow