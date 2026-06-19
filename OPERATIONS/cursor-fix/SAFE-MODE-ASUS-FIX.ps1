
# ASUS CURSOR FIX — SAFE MODE REQUIRED
# File: SAFE-MODE-ASUS-FIX.ps1
# Run this from Safe Mode (SYSTEM level access)

Write-Host "ASUS Precision Touchpad removal - Safe Mode execution" -ForegroundColor Red

# Disable ASUS Precision Touchpad
Get-PnpDevice | Where-Object { $_.FriendlyName -eq "ASUS Precision Touchpad" } | ForEach-Object {
    Write-Host "Disabling: $($_.InstanceId)"
    Disable-PnpDevice -InstanceId $_.InstanceId -Confirm:$false
}

# Remove ASUS mouse drivers (ROGMS)
pnputil /delete-driver oem26.inf /uninstall /force
pnputil /delete-driver oem100.inf /uninstall /force

# Remove ASUS touchpad filter drivers
pnputil /delete-driver oem190.inf /uninstall /force
pnputil /delete-driver oem205.inf /uninstall /force

# Kill ASUS processes
Stop-Process -Name "AsusPTPService" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "AsusAppService" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "ASUSOptimization" -Force -ErrorAction SilentlyContinue

Write-Host "Reboot required after Safe Mode execution" -ForegroundColor Yellow