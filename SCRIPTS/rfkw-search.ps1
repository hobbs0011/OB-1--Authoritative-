<#
.SYNOPSIS
rfkw-search.ps1 — query the SOULKEYS inverted index.
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Query,
    [int]$Top = 8,
    [switch]$Raw
)

Set-Location -Path "D:\OB-1-CANONICAL"
$IndexPath = "CANON/SOUL-KEYWORDS/inverted-index.json"
if (-not (Test-Path -LiteralPath $IndexPath)) {
    Write-Error "Missing index: $IndexPath — run build-soulkeys.ps1 first."
    return
}

$index = Get-Content -LiteralPath $IndexPath -Encoding UTF8 | ConvertFrom-Json

# Normalize query terms
$terms = [regex]::Matches($Query, '\b[a-zA-Z]{3,}\b') | ForEach-Object { $_.Value.ToLower() }
$terms = $terms | Where-Object { $_ -notin @('the','and','that','for','with','this','but','not','you','can','had','its') } | Sort-Object -Unique
if ($terms.Count -eq 0) { Write-Host "No searchable terms in query."; return }

$scores = @{}
$items  = @{}
foreach ($term in $terms) {
    if (-not $index.PSObject.Properties[$term]) { continue }
    foreach ($entry in $index.$term) {
        $k = "$($entry.run)|$($entry.category)"
        $scores[$k] = ($scores[$k] + [int]$entry.weight)
        $items[$k]  = $entry
    }
}

$results = $scores.GetEnumerator() | Sort-Object { $_.Value } -Descending | Select-Object -First $Top
if ($results.Count -eq 0) { Write-Host "No matches."; return }

foreach ($r in $results) {
    $runId  = $r.Key.Split('|')[0]
    $entry  = $items[$r.Key]
    $rrl    = "RRL/RRL-${runId}.txt"
    $rfkw   = "CANON/SOUL-KEYWORDS/rfkw-run${runId}.txt"
    $exists = if (Test-Path -LiteralPath $rrl) { "RRL" } else { "NO_RRL" }
    if ($Raw) {
        [PSCustomObject]@{
            run       = $runId
            category  = $entry.category
            weight    = $r.Value
            rrl       = $rrl
            rfkw      = $rfkw
            status    = $exists
        } | ConvertTo-Json -Compress
    } else {
        Write-Output ("Run {0} | {1} | score={2} | {3} | {4}" -f $runId, $entry.category, $r.Value, $rrl, $exists)
    }
}
