$headers = @{ 'x-pa-auth' = 'ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=' }
$r = Invoke-RestMethod -Uri 'https://phoenix-pcc-1.mrmichaelhobbs123.workers.dev/api/scout/status' -Headers $headers
Write-Host "ok:$($r.ok) error:$($r.error) status:$($r.status)"