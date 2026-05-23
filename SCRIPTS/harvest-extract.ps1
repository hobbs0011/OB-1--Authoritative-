$CONTAMINATION_THRESHOLD = 100000
$harvested = Get-ChildItem "RRL/HarvestedChats/*.txt" | Sort-Object Name
$counter = 7
$skipped = 0
foreach ($file in $harvested) {
    $counter++
    $fileBytes = $file.Length
    if ($fileBytes -gt $CONTAMINATION_THRESHOLD) {
        Write-Host "[SKIP] $($file.Name) — $fileBytes bytes exceeds 100KB contamination threshold. Use -AllowContaminated explicitly."
        $skipped++
        $counter--
        continue
    }
    Write-Host "EXTRACTING: $($file.Name) ($fileBytes bytes) -> Run $counter"
    & "pwsh" -File "SCRIPTS/rrl-pipeline.ps1" -RRLFile $file.FullName -RunNumber $counter
    Start-Sleep -Seconds 2
}
Write-Host "HARVEST COMPLETE - Processed: $($counter - 7) | Skipped (contamination): $skipped"