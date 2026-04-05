# PROOF - PhoenixRisingThread14 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\PhoenixRisingThread14.txt

)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "STAGE 5: FINAL INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Load credentials
if (Test-Path $EnvFile) {
    $envContent = Get-Content $EnvFile
    $masterKey = ($envContent | Select-String "PHOENIXMASTERKEY=").ToString().Split('=')[1]
