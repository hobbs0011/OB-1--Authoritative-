$json = @{pin='1234'} | ConvertTo-Json
try {
  $result = Invoke-RestMethod -Uri 'https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/parent/checkpin' -Method Post -ContentType 'application/json' -Body $json -ErrorAction Stop
  Write-Output "RESULT: $($result | ConvertTo-Json)"
} catch {
  Write-Output "ERROR STATUS: $($_.Exception.Response.StatusCode.value__)"
  $stream = $_.Exception.Response.GetResponseStream()
  $reader = New-Object System.IO.StreamReader($stream)
  Write-Output "BODY: $($reader.ReadToEnd())"
}