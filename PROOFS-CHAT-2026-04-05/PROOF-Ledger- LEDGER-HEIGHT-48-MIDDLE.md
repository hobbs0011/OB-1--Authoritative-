# PROOF - Ledger- LEDGER-HEIGHT-48 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\Ledger- LEDGER-HEIGHT-48.txt

$env:KEY        = $env:KEY
```

**Replace with:**

```powershell
# HARD FAIL if env missing (prevents silent placeholder drift)
if (-not $env:WORKER_URL -or $env:WORKER_URL -match "YOUR_" -or $env:WORKER_URL -notmatch "^https?://") {
  Write-Host "FATAL: WORKER_URL not set to a real https:// URL"; exit 1
}
