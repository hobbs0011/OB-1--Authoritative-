<#
   telegram-command-router.ps1 — Free Telegram interface to OB-1 pipeline
   No dashboard required. Uses bot token directly against Telegram API.
   KiloClaw dashboard = optional enhancement, not dependency.
#>
param(
    [string]$BotToken = "8603251036:AAGykOKDjx2KtZYb534oRtRkqt52HIS_88s",
    [string]$ChatId,
    [string]$Command,
    [string]$Message,
    [int]$TimeoutSec = 30
)

$ErrorActionPreference = "Stop"
$repoRoot = "D:\OB-1-CANONICAL"
$D1      = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$telegramApi = "https://api.telegram.org/bot$BotToken"

function Send-Telegram {
    param([string]$ChatId,[string]$Text)
    if (-not $ChatId) { return }
    try {
        Invoke-RestMethod "$telegramApi/sendMessage" -Method Post -Body @{ chat_id=$ChatId; text=$Text; parse_mode='Markdown' } -TimeoutSec $TimeoutSec | Out-Null
    } catch {}
}

function Get-Updates {
    param([int]$Offset,[int]$Limit=100)
    try {
        Invoke-RestMethod "$telegramApi/getUpdates?offset=$Offset&limit=$Limit&timeout=$TimeoutSec" -TimeoutSec $TimeoutSec
    } catch { $null }
}

function Resolve-ChatId {
    param([string]$Identifier)
    if ($Identifier -match '^\d+$') { return $Identifier }
    try {
        $r = Invoke-RestMethod "$telegramApi/getUpdates?limit=100&timeout=$TimeoutSec" -TimeoutSec $TimeoutSec
        foreach ($u in $r.result) {
            if ($u.message.chat.username -eq $Identifier.TrimStart('@')) {
                return $u.message.chat.id.ToString()
            }
        }
    } catch {}
    return $null
}

# Interactive shell mode
if (-not $Command -and -not $Message) {
    Write-Host "=== TELEGRAM COMMAND ROUTER (interactive) ===" -ForegroundColor Cyan
    Write-Host "Commands: status | scout | fingerprint | process | verify | garrison | telegram-reconnect | help"
    Write-Host "Type 'exit' to quit.`n"

    $lastOffset = 0
    while ($true) {
        $updates = Get-Updates -Offset $lastOffset
        if ($updates -and $updates.result) {
            foreach ($msg in $updates.result) {
                $lastOffset = [math]::Max($lastOffset, $msg.update_id + 1)
                $chatId = $msg.message.chat.id
                $text = $msg.message.text.Trim()
                if (-not $text) { continue }

                Write-Host "[$chatId] $text"
                $reply = Process-Command -ChatId $chatId -Command $text
                if ($reply) {
                    Send-Telegram -ChatId $chatId -Text $reply
                    Write-Host "  -> $reply"
                }
            }
        }
        Start-Sleep -Seconds 2
    }
    return
}

# Single command mode
if ($Command -and -not $ChatId) {
    $ChatId = Resolve-ChatId -Identifier $Command
    if (-not $ChatId) { Write-Host "Could not resolve chat for: $Command"; exit 1 }
}

if ($Command) {
    $reply = Process-Command -ChatId $ChatId -Command $Command
    if ($reply) { Send-Telegram -ChatId $ChatId -Text $reply }
    Write-Host $reply
    return
}

if ($Message -and $ChatId) {
    $reply = Process-Command -ChatId $ChatId -Command $Message
    if ($reply) { Send-Telegram -ChatId $ChatId -Text $reply }
    Write-Host $reply
    return
}

function Process-Command {
    param([string]$ChatId,[string]$Command)

    $cmd = $Command.ToLower().Split(' ')[0]
    $arg = ($Command.Split(' ') | Select-Object -Skip 1) -join ' '

    switch ($cmd) {
        'status' {
            return @"
OB-1 SUPPLY LINES STATUS
HEAD: $(git -C $repoRoot rev-parse --short HEAD)
SOULCOUNT: $((Invoke-RestMethod $D1/api/soul/count -TimeoutSec 15 -ErrorAction SilentlyContinue).soulcount)

HEAVY-LEDGER: $((Get-ChildItem -LiteralPath (Join-Path $repoRoot 'CANON\HEAVY-LEDGER') -Filter '*.json').Count) files
PHEROMONES: $((Get-ChildItem -LiteralPath (Join-Path $repoRoot 'CANON\PHEROMONES') -Filter 'PheTrail-run*.json').Count) trails
STARMAP: $((Get-ChildItem -LiteralPath (Join-Path $repoRoot 'CANON\STARMAP') -Filter 'starmap-run*.json').Count) files
PIPELINE: $((Get-ChildItem -LiteralPath (Join-Path $repoRoot 'CANON\PIPELINE') -Filter 'pipeline-run*.json').Count) files
"@
        }
        'help' {
            return @"
OB-1 COMMANDS:
status — supply chain status
scout — run scout on zone
fingerprint — DNA crunch
process — skeleton/SSM
verify — truth + shadow
garrison — merkle + apex
telegram-reconnect — audit telegram path
help — this message
"@
        }
        default {
            return "Unknown command: $cmd. Send 'help' for options."
        }
    }
}
