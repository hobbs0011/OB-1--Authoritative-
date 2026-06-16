param($seed = "FORCEAWARENESS")
$bodyObj = @{ seed_keyword = $seed }
$body = $bodyObj | ConvertTo-Json -Compress
$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
$headers = @{ 'Content-Type'='application/json'; 'x-pa-auth'='ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=' }
$result = Invoke-RestMethod -Uri 'https://phoenix-pcc-1.mrmichaelhobbs123.workers.dev/api/scout' -Method POST -Headers $headers -Body $bytes
Write-Host "RESPONSE: $($result | ConvertTo-Json -Depth 3)"