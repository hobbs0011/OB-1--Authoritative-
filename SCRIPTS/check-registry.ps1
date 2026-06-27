$j = Get-Content 'D:\OB-1-CANONICAL\CANON\REGISTRY\dna-registry-run142.json' -Raw | ConvertFrom-Json
$count = ($j.all_entries | Where-Object { $_.path -match 'TRAIN-67' }).Count
Write-Host "TRAIN-67 entries in registry: $count"
$total = $j.all_entries.Count
Write-Host "Total entries: $total"
