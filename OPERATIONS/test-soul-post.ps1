$text = Get-Content "RRL/RRL-0.txt" -Raw
$D1 = "https://soul-logger.mrmichaelhobbs123.workers.dev"

Write-Host "=== TEST A: ${($text.Substring(0,100))}... ==="
Write-Host ""

# Use single-quoted body to avoid $expansion, explicitly convert to JSON body via ConvertTo-Json
bodyA = @{
    student_id = "sov100-michael"
    session_id = "sov100-run0-rise-500"
    role = "user"
    text = $text.Substring(0, [Math]::Min(500, $text.Length))
} | ConvertTo-Json -Depth 3 -Compress

try {
    $r = Invoke-RestMethod -Uri "$D1/api/soul/event" -Method Post -Body bodyA -ContentType "application/json; charset=utf-8" -TimeoutSec 15
    Write-Host "TEST A 500-CHARS: OK event_id=$($r.event_id) bytes=$($r.byte_count)"
} catch {
    Write-Host "TEST A FAILED: $($_.Exception.Message)"
    # Try getting response body
    try { Write-Host "Response: " $_.Exception.Response.StatusCode.value__ } catch {}
}

Write-Host ""

# Direct .NET HttpClient test (bypassing PowerShell serialization)
Add-Type -AssemblyName System.Net.Http
$client = New-Object System.Net.Http.HttpClient
$client.Timeout = [TimeSpan]::FromSeconds(30)
$client.DefaultRequestHeaders.Add("Accept", "application/json")

$bytes = [System.Text.Encoding]::UTF8.GetBytes($text.Substring(0, [Math]::Min(500, $text.Length)))
$content = New-Object System.Net.Http.ByteArrayContent($bytes)
$content.Headers.ContentType = New-Object System.Net.Http.Headers.MediaTypeHeaderValue("application/json")

try {
    $response = $client.PostAsync("$D1/api/soul/event", $content).Result
    $respBody = $response.Content.ReadAsStringAsync().Result
    Write-Host "TEST A-DOTNET 500-CHARS: $($response.StatusCode) $respBody"
} catch {
    Write-Host "TEST A-DOTNET FAILED: $($_.Exception.Message)"
}
