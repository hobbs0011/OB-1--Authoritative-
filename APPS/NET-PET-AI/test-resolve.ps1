try {
  $r = Invoke-RestMethod -Uri 'https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/api/student/resolve' -Method Post -Body '{"studentId":"quy-bluetech"}' -ContentType 'application/json'
  Write-Host "resolve OK: $($r | ConvertTo-Json -Compress)"
} catch {
  Write-Host "resolve ERROR: $($_.Exception.Message)"
}
