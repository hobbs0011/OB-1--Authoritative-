# U4: MCP Rate-Limit Monitoring
# Purpose: Track invocation rate per agent; alert if >100req/min

param(
    [string]$MetricsFile = "$PSScriptRoot\..\CANON\AUDIT\mcp-metrics.jsonl",
    [int]$RateLimitPerMin = 100,
    [int]$WindowMinutes = 5
)

Write-Host ""
Write-Host "📊 MCP RATE-LIMIT MONITORING (U4)" -ForegroundColor Cyan
Write-Host "   Limit: $RateLimitPerMin/min | Window: $WindowMinutes min"
Write-Host ""

if (Test-Path $MetricsFile) {
    $metrics = @(Get-Content $MetricsFile | ConvertFrom-Json -ErrorAction SilentlyContinue)
    
    $now = Get-Date
    $windowStart = $now.AddMinutes(-$WindowMinutes)
    
    $recentCalls = $metrics | Where-Object {
        $callTime = [datetime]::Parse($_.timestamp)
        $callTime -gt $windowStart
    }
    
    $callCount = $recentCalls.Count
    $callsPerMin = [math]::Round($callCount / $WindowMinutes, 2)
    
    Write-Host "   Calls in last $WindowMinutes min: $callCount"
    Write-Host "   Rate: $callsPerMin/min"
    Write-Host "   Status: $(if ($callsPerMin -gt $RateLimitPerMin) { "⚠️ OVER LIMIT" } else { "✅ OK" })"
    
    # Group by agent
    $byAgent = $recentCalls | Group-Object agent
    Write-Host ""
    Write-Host "   By agent:"
    foreach ($group in $byAgent) {
        $agentRate = [math]::Round($group.Count / $WindowMinutes, 2)
        Write-Host "     - $($group.Name): $($group.Count) calls ($agentRate/min)"
    }
} else {
    Write-Host "   📄 No metrics yet. Metrics will be logged on next MCP invocation."
}

Write-Host ""
