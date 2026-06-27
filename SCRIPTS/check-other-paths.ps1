$reg = Get-Content 'D:\OB-1-CANONICAL\CANON\REGISTRY\dna-registry-run142.json' -Raw | ConvertFrom-Json
$phe = $reg.all_entries | Where-Object { $_.path -match 'PheTrail' }
Write-Host "PheTrail entries: $($phe.Count)"
$phe | Select-Object -First 5 | ForEach-Object { Write-Host "$($_.path) | $($_.category)" }

$rl = $reg.all_entries | Where-Object { $_.path -match 'RRL' }
Write-Host "RRL entries: $($rl.Count)"
$rl | Select-Object -First 5 | ForEach-Object { Write-Host "$($_.path) | $($_.category)" }

$soulkw = $reg.all_entries | Where-Object { $_.path -match 'soul-keys|inverted-index' }
Write-Host "SOUL-KEYWORDS entries: $($soulkw.Count)"
