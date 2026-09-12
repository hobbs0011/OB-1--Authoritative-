$tests = @(
  @{url='https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/parent/checkpin'; body=@{pin='1234'}; label='Parent 1234'}
  @{url='https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/student/checkpin'; body=@{studentId='quang-bluetech'; pin='1212'}; label='Quang 1212'}
  @{url='https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/student/checkpin'; body=@{studentId='quan-bluetech'; pin='2121'}; label='Quan 2121'}
)
foreach ($t in $tests) {
  try {
    $json = $t.body | ConvertTo-Json
    $result = Invoke-RestMethod -Uri $t.url -Method Post -ContentType 'application/json' -Body $json -ErrorAction Stop
    Write-Output "OK $($t.label): `$(ok)=$($result.ok)"
  } catch {
    try { $stream = $_.Exception.Response.GetResponseStream(); $reader = New-Object System.IO.StreamReader($stream); Write-Output "FAIL $($t.label): $($reader.ReadToEnd())" } catch { Write-Output "FAIL $($t.label): $($_.Exception.Message)" }
  }
}