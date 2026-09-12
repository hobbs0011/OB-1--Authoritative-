$body = @{pin='9999'} | ConvertTo-Json
$result = Invoke-RestMethod -Uri 'https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/parent/checkpin' -Method Post -ContentType 'application/json' -Body $body
Write-Output ($result | ConvertTo-Json)