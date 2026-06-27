$reg = Get-Content 'D:\OB-1-CANONICAL\CANON\REGISTRY\dna-registry-run142.json' -Raw | ConvertFrom-Json
$train67 = $reg.all_entries | Where-Object { $_.path -match 'TRAIN-67' }
Write-Host "TRAIN-67 entries: $($train67.Count)"
$train67 | Select-Object -First 10 | ForEach-Object { Write-Host $_.path }
