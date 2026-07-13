<#
  soulaudit.ps1 — Per-session SOUL audit
  Counts exact user-prompt characters for a session.
  Writes chronological prompt receipts to OPERATIONS/.
  Does not use or display global aggregate SOULCOUNT.
#>
param(
    [string]$SessionId,
    [string]$SessionFile,
    [string]$OutDir = "OPERATIONS",
    [int]$MaxPrompts = 500
)

$ErrorActionPreference = "Stop"
$ts = Get-Date -Format "yyyy-MM-ddTHHmmss"
$receiptsPath = Join-Path $OutDir "soulaudit-${ts}-receipts.json"
$summaryPath = Join-Path $OutDir "soulaudit-${ts}-summary.jsonl"

function Write-Receipt { param([string]$Path,[object]$Obj); $Obj | ConvertTo-Json -Depth 5 | Out-File -Append -Encoding UTF8 $Path }

$prompts = @()
$source = "unknown"

if ($SessionFile -and (Test-Path $SessionFile)) {
    $source = $SessionFile
    $lines = [System.IO.File]::ReadAllLines($SessionFile)
    $seq = 0
    foreach ($line in $lines) {
        $obj = $line | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($obj -and $obj.role -eq "user" -and $obj.text) {
            $seq++
            $prompts += [pscustomobject]@{
                order = $seq
                ts = $obj.ts
                char_count = $obj.text.Length
                excerpt = $obj.text.Substring(0, [Math]::Min(120, $obj.text.Length))
                source = "$SessionFile#$seq"
            }
        }
    }
}

if (-not $prompts) {
    $source = "active-context-fallback"
    $seq = 0
    $context = Get-History -ErrorAction SilentlyContinue | Select-Object -First $MaxPrompts
    if ($context) {
        foreach ($entry in $context) {
            $seq++
            $text = $entry.CommandLine
            if ($text) {
                $prompts += [pscustomobject]@{
                    order = $seq
                    ts = Get-Date -Format "o"
                    char_count = $text.Length
                    excerpt = $text.Substring(0, [Math]::Min(120, $text.Length))
                    source = "active-context"
                }
            }
        }
    }
}

$totalChars = 0
foreach ($p in $prompts) { $totalChars += $p.char_count }
$deltaVerified = $totalChars

$summaryObj = [ordered]@{
    ts = (Get-Date -Format "o")
    event = "soulaudit"
    session_id = $SessionId
    source = $source
    total_characters = $totalChars
    prompts = $prompts.Count
    delta_accepted = $deltaVerified
    status = "AUDITED"
    note = "Per-session SOUL only. Global aggregate retired."
}

$summaryObj | ConvertTo-Json -Depth 5 | Out-File -Encoding UTF8 $summaryPath
foreach ($p in $prompts) { $p | ConvertTo-Json -Depth 4 | Out-File -Append -Encoding UTF8 $receiptsPath }

Write-Host "SOULAUDIT: session=$SessionId source=$source prompts=$($prompts.Count) chars=$totalChars"
Write-Host "Summary: $summaryPath"
Write-Host "Receipts: $receiptsPath"
