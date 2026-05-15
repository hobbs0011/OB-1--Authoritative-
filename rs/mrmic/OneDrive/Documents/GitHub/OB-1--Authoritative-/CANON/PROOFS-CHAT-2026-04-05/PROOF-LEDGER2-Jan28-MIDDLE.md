# PROOF - LEDGER2-Jan28 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\LEDGER2-Jan28.txt

# AUTHORITY: AGENT-100 (SOVEREIGN)
# EXECUTOR: AGENT-97 (OB1 AUDITOR)
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

# HARD FAIL if env missing (prevents silent placeholder drift)
if (-not $env:WORKER_URL -or $env:WORKER_URL -match "YOUR_" -or $env:WORKER_URL -notmatch "^https?://") {
  Write-Host "FATAL: WORKER_URL not set to a real https:// URL"; exit 1
}
if (-not $env:KEY -or $env:KEY -match "YOUR_" -or $env:KEY.Length -lt 32) {
  Write-Host "FATAL: KEY not set (PHOENIXMASTERKEY, 32+ chars)"; exit 1
