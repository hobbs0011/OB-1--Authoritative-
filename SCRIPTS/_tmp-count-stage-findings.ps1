$files = @(
    "D:\OB-1-CANONICAL\CANON\SCOUT\scout-incarnate10-consolidated-pheromone-spray-20260803T033200.md",
    "D:\OB-1-CANONICAL\CANON\MARCH\forcemarch-incarnate10-1000-findings-20260803T062500.md",
    "D:\OB-1-CANONICAL\CANON\SOUL\soulscholars-incarnate10-20260803T062800.md",
    "D:\OB-1-CANONICAL\CANON\SUPPLY\supplylines-incarnate10-20260803T063000.md",
    "D:\OB-1-CANONICAL\CANON\ENGINEER\engineer-incarnate10-20260803T063200.md"
)
$total = 0
foreach ($f in $files) {
    if (Test-Path $f) {
        $c = (Get-Content $f | Select-String -Pattern "^\s*\d+\.\s*\[" -CaseSensitive).Count
        $total += $c
        Write-Host ("{0}: {1}" -f (Split-Path $f -Leaf), $c)
    }
}
Write-Host ("STAGE TOTAL: {0}" -f $total)
