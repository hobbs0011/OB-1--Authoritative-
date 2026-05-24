# session-capture.ps1 — Auto-fires on Claude Stop hook
# Posts session marker + RRL path to soul-archive D1 via soul-logger
# DO NOT DELETE — wired in .claude/settings.json Stop hook

$ts = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$sessionId = "sov100-claude-session-$((Get-Date).ToString('yyyyMMdd-HHmmss'))"
$rrlDir = "D:\OB-1-CANONICAL\RRL"
$rrlFile = "$rrlDir\RRL-SESSION-$((Get-Date).ToString('yyyyMMdd-HHmmss')).txt"

# Write session marker file so RRL exists even if user doesn't copy-paste
$marker = @"
SESSION MARKER — Auto-captured by session-capture.ps1
Timestamp: $ts
Session ID: $sessionId
HEAD: $(Set-Location D:\OB-1-CANONICAL; git log -1 --oneline 2>$null)
NOTE: Full conversation must be copy-pasted by operator into this file as RRL.
"@

if (!(Test-Path $rrlDir)) { New-Item -ItemType Directory -Force -Path $rrlDir | Out-Null }
$marker | Out-File -FilePath $rrlFile -Encoding utf8

# Post marker to soul-logger
$body = @{
    student_id = $sessionId
    text = $marker
} | ConvertTo-Json

try {
    Invoke-RestMethod -Method POST -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/event" `
        -ContentType "application/json" -Body $body -TimeoutSec 8 | Out-Null
} catch { }

Write-Host "SESSION CAPTURED: $rrlFile"
