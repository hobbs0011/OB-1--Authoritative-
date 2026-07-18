try {
  $r = Invoke-RestMethod -Uri 'https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/api/health' -Method Get
  Write-Host "health OK: $($r | ConvertTo-Json -Compress)"
} catch {
  Write-Host "health ERROR: $($_.Exception.Message)"
}
