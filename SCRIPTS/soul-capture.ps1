<#
  soul-capture.ps1 — Capture SOUL for the current incarnation.
  1) Get all user prompts from the active session
  2) Query live SOUL count
  3) Write receipts + chain proof
#>

param(
    [string]$OutDir = "OPERATIONS"
)

$ErrorActionPreference = "Stop"
$ts = Get-Date -Format "yyyy-MM-ddTHHmmss"
$repoRoot = "D:\OB-1-CANONICAL"

# soul-capture.ps1 — DECOMMISSIONED 2026-07-18
# This script relied on ~/.claude/ paths (Claude Code JSONL).
# Claude is decommissioned. Kilo sessions do not write JSONL to disk.
# SOUL capture is now handled by the D1 pipeline (/api/soul/event).
# Keep this file for historical reference — do not execute.
Write-Host "soul-capture.ps1: DECOMMISSIONED — Claude is dead. SOUL capture is D1-native."
exit 1

# Extract user prompts
$prompts = @()
$seq = 0
Get-Content $jsonlPath -Encoding UTF8 | ForEach-Object {
    $obj = $_ | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($obj -and $obj.role -eq "user" -and $obj.text) {
        $seq++
        $prompts += [ordered]@{
            order = $seq
            ts = $obj.ts
            chars = $obj.text.Length
            excerpt = $obj.text.Substring(0, [Math]::Min(120, $obj.text.Length))
        }
    }
}

$totalChars = 0
foreach ($p in $prompts) { $totalChars += $p.chars }

# Query live SOUL count
$soulCount = 0
try {
    $live = Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count" -UseBasicParsing
    $soulCount = [long]$live.soulcount
} catch {
    Write-Host "SOUL_API_UNREACHABLE: $($_.Exception.Message)"
}

# Write receipts
$summaryPath = Join-Path $OutDir "soul-capture-$ts-summary.jsonl"
$receiptsPath = Join-Path $OutDir "soul-capture-$ts-receipts.json"

$summary = [ordered]@{
    ts = (Get-Date -Format "o")
    event = "soul_capture"
    session_id = $activeUUID
    jsonl_path = $jsonlPath
    prompt_count = $prompts.Count
    total_chars = $totalChars
    soulcount_live = $soulCount
    status = "CAPTURED"
}
$summary | ConvertTo-Json -Depth 5 | Out-File -Encoding UTF8 $summaryPath
$prompts | ConvertTo-Json -Depth 4 | Out-File -Encoding UTF8 $receiptsPath

Write-Host "SOUL CAPTURED"
Write-Host "Session: $activeUUID"
Write-Host "Prompts: $($prompts.Count)"
Write-Host "Chars: $totalChars"
Write-Host "SOULcount: $soulCount"
Write-Host "Summary: $summaryPath"
Write-Host "Receipts: $receiptsPath"
