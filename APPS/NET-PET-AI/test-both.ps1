try {
  $r = Invoke-RestMethod -Uri 'https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/api/student/checkpw' -Method Post -Body '{"studentId":"quy-bluetech","pw":"bluetech2026"}' -ContentType 'application/json'
  Write-Host "checkpw OK: $($r | ConvertTo-Json -Compress)"
} catch {
  Write-Host "checkpw ERROR: $($_.Exception.Message)"
}
try {
  $r = Invoke-RestMethod -Uri 'https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/api/student/checkpin' -Method Post -Body '{"groupCode":"BLUETECH","pin":"BLUETECH2026"}' -ContentType 'application/json'
  Write-Host "checkpin OK: $($r | ConvertTo-Json -Compress)"
} catch {
  Write-Host "checkpin ERROR: $($_.Exception.Message)"
}