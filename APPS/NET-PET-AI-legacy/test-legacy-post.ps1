try {
  $r = Invoke-RestMethod -Uri 'https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/api/student/create' -Method Post -Body '{"studentId":"quy-bluetech","fullName":"Quy","englishLevel":"A1"}' -ContentType 'application/json'
  Write-Host "create OK: $($r | ConvertTo-Json -Compress)"
} catch {
  Write-Host "create ERROR: $($_.Exception.Message)"
}
try {
  $r = Invoke-RestMethod -Uri 'https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/api/chat' -Method Post -Body '{"studentId":"quy-bluetech","message":"hi"}' -ContentType 'application/json'
  Write-Host "chat OK: $($r | ConvertTo-Json -Compress)"
} catch {
  Write-Host "chat ERROR: $($_.Exception.Message)"
}
