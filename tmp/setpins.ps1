$headers = @{
  "Content-Type" = "application/json"
  "X-Admin-Key" = "N00OmpWXSORzWsWw9LcLXsmTnKILzHQKFT5WAtISH1s="
}
$bodies = @(
  @{url="https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/admin/parent/setpin"; body=@{pin="1234"}}
  @{url="https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/admin/student/setpin"; body=@{pin="1212"; studentId="quang-bluetech"}}
  @{url="https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/admin/student/setpin"; body=@{pin="2121"; studentId="quan-bluetech"}}
)
foreach ($item in $bodies) {
  try {
    $json = $item.body | ConvertTo-Json
    $result = Invoke-RestMethod -Uri $item.url -Method Post -ContentType "application/json" -Headers $headers -Body $json -ErrorAction Stop
    Write-Output "OK: $($item.url) → $($result | ConvertTo-Json)"
  } catch {
    Write-Output "FAIL: $($item.url) → $($_.Exception.Message)"
  }
}