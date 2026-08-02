try {
  $response = Invoke-RestMethod -Uri 'https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/api/student/checkpin' -Method Post -Body '{"groupCode":"BLUETECH","pin":"BLUETECH2026"}' -ContentType 'application/json'
  Write-Host "Status: 200"
  Write-Host "Response: $($response | ConvertTo-Json -Compress)"
} catch {
  Write-Host "Error: $($_.Exception.Message)"
  if ($_.Exception.Response) {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Body: $($reader.ReadToEnd())"
  }
}
