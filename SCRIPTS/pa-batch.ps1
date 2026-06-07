param([array]$Tasks, [int]$GlobalTier=1)
$body = @{tasks = @(); global_tier = $GlobalTier}
foreach ($task in $Tasks) {
    $body.tasks += @{
        task = $task.task
        tier = if ($task.tier) { $task.tier } else { $GlobalTier }
        context = if ($task.context) { $task.context } else { "" }
        targetfile = if ($task.targetfile) { $task.targetfile } else { "" }
    }
}
$resp = Invoke-RestMethod -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/batch" -Method POST -Headers @{"x-pa-auth" = "ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="} -Body (ConvertTo-Json $body -Depth 5) -ContentType "application/json"
Write-Host "BATCH $($resp.batch_id) | count=$($resp.count) | all_verified=$($resp.all_verified)"
foreach ($result in $resp.results) {
    Write-Host "[$($result.index)] $($result.model) | verified=$($result.verified) | ms=$($result.ms)"
    Write-Host "PATCH: $($result.patch.Substring(0, [Math]::Min(120, $result.patch.Length)))..."
    Write-Host "---"
}
return $resp.results
