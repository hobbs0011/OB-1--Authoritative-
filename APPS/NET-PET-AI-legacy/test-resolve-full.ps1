try {
  $resp = Invoke-WebRequest -Uri 'https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev/api/student/resolve' -Method Post -Body '{"studentId":"quy-bluetech"}' -ContentType 'application/json' -UseBasicParsing
  Write-Host "status: $($resp.StatusCode)"
  Write-Host "body: $($resp.Content)"
  Write-Host "headers:"
  $resp.Headers | Format-List
} catch {
  $ex = $_.Exception
  if ($ex.Response) {
    Write-Host "status: $($ex.Response.StatusCode)"
    $stream = $ex.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "body: $($reader.ReadToEnd())"
  } else {
    Write-Host "ERROR: $($ex.Message)"
  }
}
