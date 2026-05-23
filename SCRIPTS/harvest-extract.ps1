$harvested = Get-ChildItem "RRL/HarvestedChats/*.txt" | Sort-Object Name
$counter = 7
foreach ($file in $harvested) {
    $counter++
    Write-Host "EXTRACTING: $($file.Name) -> Run $counter"
    & "pwsh" -File "SCRIPTS/rrl-pipeline.ps1" -RRLFile $file.FullName -RunNumber $counter
    Start-Sleep -Seconds 2
}
Write-Host "HARVEST COMPLETE - Total runs: $counter"