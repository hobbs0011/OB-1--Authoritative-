$outPath = "D:\OB-1-CANONICAL\CANON\REGISTRY\dna-registry-run142.json"
$before = Get-Item $outPath | Select-Object -ExpandProperty LastWriteTime
$content = Get-Content $outPath -Raw
$test = $content | ConvertFrom-Json
$test | ConvertTo-Json -Depth 6 | Set-Content $outPath -Encoding UTF8
$after = Get-Item $outPath | Select-Object -ExpandProperty LastWriteTime
Write-Host "Before: $before"
Write-Host "After:  $after"
