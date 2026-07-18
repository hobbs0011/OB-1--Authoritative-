# soul-watcher.ps1 — DECOMMISSIONED 2026-07-18
# Watched active Claude session JSONL at ~/.claude/projects/ — no longer exists.
# Claude is decommissioned. The soul-logger D1 endpoint handles all SOUL capture.
# Keep this file for historical reference — do not execute.
Write-Host "soul-watcher.ps1: DECOMMISSIONED — Claude is dead. SOUL capture is D1-native."
exit 1
$soulUrl    = "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/event"
$stamp      = (Get-Date).ToString('yyyyMMdd-HHmmss')
$dnaUrl     = "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/status"
$posted     = @{}  # track posted line hashes to avoid duplicates

Write-Host "SOUL WATCHER ACTIVE — $stamp" -ForegroundColor Cyan
Write-Host "Watching: $projectDir" -ForegroundColor DarkGray
Write-Host "Press Ctrl+C to stop." -ForegroundColor DarkGray

# Post initial DNA snapshot
$dna = try {
    $status = Invoke-RestMethod $dnaUrl -TimeoutSec 5
    $head   = git -C "D:\OB-1-CANONICAL" log -1 --oneline 2>$null
    "=== DNA SNAPSHOT $stamp ===`nHEAD: $head`nWORKERS: $($status | ConvertTo-Json -Compress)"
} catch { "=== DNA SNAPSHOT $stamp === (worker unreachable)" }

$dnaBody = @{ student_id = "sov100-dna-start-$stamp"; text = $dna } | ConvertTo-Json
try { Invoke-RestMethod -Method POST -Uri $soulUrl -ContentType "application/json" -Body $dnaBody -TimeoutSec 8 | Out-Null; Write-Host "DNA snapshot posted." -ForegroundColor Green } catch { }

while ($true) {
    # Find the most recently modified JSONL (active session)
    $jsonl = Get-ChildItem $projectDir -Filter "*.jsonl" -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1

    if ($jsonl) {
        Get-Content $jsonl.FullName -ErrorAction SilentlyContinue | ForEach-Object {
            $line = $_
            $hash = $line.GetHashCode()
            if ($posted.ContainsKey($hash)) { return }
            $posted[$hash] = $true

            try {
                $entry = $line | ConvertFrom-Json
                # Only capture user/human messages — Michael's SOUL
                $isUser = ($entry.type -eq "user") -or ($entry.role -eq "user")
                if (-not $isUser) { return }

                # Extract text content
                $text = ""
                if ($entry.message -and $entry.message.content) {
                    $content = $entry.message.content
                    if ($content -is [string]) { $text = $content }
                    elseif ($content -is [array]) {
                        $text = ($content | Where-Object { $_.type -eq "text" } | ForEach-Object { $_.text }) -join " "
                    }
                } elseif ($entry.content) {
                    if ($entry.content -is [string]) { $text = $entry.content }
                    elseif ($entry.content -is [array]) {
                        $text = ($entry.content | Where-Object { $_.type -eq "text" } | ForEach-Object { $_.text }) -join " "
                    }
                }

                if ($text.Length -lt 3) { return }

                $ts       = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
                $sid      = "sov100-soul-$stamp-$([Math]::Abs($hash))"
                $soulBody = @{ student_id = $sid; text = "[$ts] $text" } | ConvertTo-Json
                Invoke-RestMethod -Method POST -Uri $soulUrl -ContentType "application/json" -Body $soulBody -TimeoutSec 8 | Out-Null
                Write-Host "SOUL: $($text.Substring(0, [Math]::Min(60, $text.Length)))..." -ForegroundColor Magenta
            } catch { }
        }
    }

    Start-Sleep -Seconds 15
}
