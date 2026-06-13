# Invoke-PCClaw.ps1 — PCClaw wrapper with auto BB routing on failure
# Usage: .\Invoke-PCClaw.ps1 -Task "write translate.js handler" [-MaxTokens 4096] [-Context "..."]
# On quality fail: auto-logs to /api/backburner

param(
    [Parameter(Mandatory=$true)][string]$Task,
    [int]$MaxTokens = 4096,
    [string]$Context = "",
    [string]$PA_AUTH = "ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="
)

$fullMessage = if ($Context) { "$Task`n`nCONTEXT:`n$Context" } else { $Task }

$body = @{
    model = "kilo-auto/free"
    max_tokens = $MaxTokens
    messages = @(@{ role = "user"; content = $fullMessage })
} | ConvertTo-Json -Depth 5 -Compress

$start = Get-Date
try {
    $result = Invoke-RestMethod `
        -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/v1/chat/completions" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $PA_AUTH" } `
        -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) `
        -TimeoutSec 60
    $ms = [int]((Get-Date) - $start).TotalMilliseconds
    $content = $result.choices[0].message.content

    # AUDIT: quality check
    $isEmpty = [string]::IsNullOrWhiteSpace($content)
    $isTooShort = $content.Length -lt 50
    $isError = $content -match "^(Error|I cannot|I'm unable|I don't|Sorry)"
    $passed = -not ($isEmpty -or $isTooShort -or $isError)

    # Log metrics regardless of pass/fail
    $metricsBody = @{
        task_preview  = $Task.Substring(0, [Math]::Min(120, $Task.Length))
        task_length   = $Task.Length
        model         = "kilo-auto/free"
        duration_ms   = $ms
        output_length = $content.Length
        passed        = $passed
        fail_reason   = if (-not $passed) { if ($isEmpty) { "empty" } elseif ($isTooShort) { "too_short" } else { "refusal" } } else { "" }
    } | ConvertTo-Json -Compress
    try {
        Invoke-RestMethod `
            -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/metrics/pcc" `
            -Method POST `
            -ContentType "application/json" `
            -Headers @{ "x-pa-auth" = $PA_AUTH } `
            -Body ([System.Text.Encoding]::UTF8.GetBytes($metricsBody)) | Out-Null
    } catch { <# non-blocking #> }

    if ($passed) {
        Write-Host "PCCLAW OK — ${ms}ms — $($content.Length) chars"
        return $content
    } else {
        $reason = if ($isEmpty) { "empty" } elseif ($isTooShort) { "too short ($($content.Length) chars)" } else { "refusal/error pattern" }
        Write-Warning "PCCLAW AUDIT FAIL — $reason — routing to BB"

        # Log to backburner
        $bbBody = @{
            title       = "PCClaw failed: $($Task.Substring(0, [Math]::Min(80, $Task.Length)))"
            description = "Reason: $reason`nOutput: $($content.Substring(0, [Math]::Min(200, $content.Length)))"
            source      = "pcclaw"
            priority    = "!"
            metadata    = @{ task = $Task; ms = $ms; reason = $reason } | ConvertTo-Json -Compress
        } | ConvertTo-Json -Compress
        try {
            Invoke-RestMethod `
                -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/backburner" `
                -Method POST `
                -ContentType "application/json" `
                -Headers @{ "x-pa-auth" = $PA_AUTH } `
                -Body ([System.Text.Encoding]::UTF8.GetBytes($bbBody)) | Out-Null
            Write-Host "BB ENTRY CREATED for failed PCClaw task"
        } catch {
            Write-Warning "BB logging also failed: $($_.Exception.Message)"
        }
        return $null
    }
} catch {
    $ms = [int]((Get-Date) - $start).TotalMilliseconds
    Write-Warning "PCCLAW EXCEPTION — ${ms}ms — $($_.Exception.Message)"

    # Log exception metrics
    $exMetrics = @{
        task_preview  = $Task.Substring(0, [Math]::Min(120, $Task.Length))
        task_length   = $Task.Length
        model         = "kilo-auto/free"
        duration_ms   = $ms
        output_length = 0
        passed        = $false
        fail_reason   = "exception"
    } | ConvertTo-Json -Compress
    try {
        Invoke-RestMethod `
            -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/metrics/pcc" `
            -Method POST `
            -ContentType "application/json" `
            -Headers @{ "x-pa-auth" = $PA_AUTH } `
            -Body ([System.Text.Encoding]::UTF8.GetBytes($exMetrics)) | Out-Null
    } catch { <# non-blocking #> }

    $bbBody = @{
        title       = "PCClaw exception: $($Task.Substring(0, [Math]::Min(80, $Task.Length)))"
        description = $_.Exception.Message
        source      = "pcclaw"
        priority    = "!!"
        metadata    = @{ task = $Task; ms = $ms } | ConvertTo-Json -Compress
    } | ConvertTo-Json -Compress
    try {
        Invoke-RestMethod `
            -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/backburner" `
            -Method POST `
            -ContentType "application/json" `
            -Headers @{ "x-pa-auth" = $PA_AUTH } `
            -Body ([System.Text.Encoding]::UTF8.GetBytes($bbBody)) | Out-Null
    } catch {}
    return $null
}
