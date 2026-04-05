# PROOF - ALPHA-OMEGA-Plex-10(Mastermind) MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\ALPHA-OMEGA-Plex-10(Mastermind).txt


# CONFIG
$env:AIDUT_AUTH_SCHEME = "header"
$env:AIDUT_AUTH_HEADER_NAME = "x-sovereign-key"
$env:AIDUT_APPEND_PATH = "/ledger/append"

$cfg = Get-AidutConfig
$workerUrl = Get-WorkerUrl
$headers = New-AidutHeaders -Cfg $cfg

