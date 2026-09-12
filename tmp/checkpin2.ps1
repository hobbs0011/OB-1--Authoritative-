$body = @{pin='1234'} | ConvertTo-Json
try {
    $result = Invoke-RestMethod -Uri 'https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/parent/checkpin' -Method Post -ContentType 'application/json' -Body $body -ErrorAction Stop
    Write-Output "SUCCESS:"
    Write-Output ($result | ConvertTo-Json -Depth 5)
} catch {
    Write-Output "ERROR: $($_.Exception.Response.StatusCode.value__)"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Output "BODY: $($reader.ReadToEnd())"
}