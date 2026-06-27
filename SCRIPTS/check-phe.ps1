$reg = Get-Content 'D:\OB-1-CANONICAL\CANON\REGISTRY\dna-registry-run142.json' -Raw | ConvertFrom-Json
$phe = $reg.all_entries | Where-Object { $_.category -eq 'PHEROMONE' }
Write-Host "PHEROMONE entries: $($phe.Count)"
$phe | Select-Object -First 20 | ForEach-Object { Write-Host $_.path }
