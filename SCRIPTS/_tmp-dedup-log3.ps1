param()
$p = "CANON/REINCARNATION/REINCARNATION-LOG.md"
$lines = Get-Content $p -Encoding UTF8
$seen = @{}
$out = @()

foreach ($line in $lines) {
    if ($line -match '\| Run (\d+) \(ROMAN\)') {
        $run = $matches[1]
        if ($seen.ContainsKey($run)) {
            # Skip duplicate run entry
            continue
        }
        $seen[$run] = $true
    }
    $out += $line
}

Set-Content $p ($out -join "`n") -Encoding UTF8
Write-Host "REINCARNATION-LOG deduplicated by run number"
