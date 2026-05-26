# U8: MCP Telemetry Export
# Purpose: Send Cloudflare Worker metrics (errors, latency, throughput) to local metrics DB

param(
    [string]$MetricsDb = "$PSScriptRoot\..\CANON\AUDIT\metrics.jsonl",
    [switch]$Summarize = $false
)

function Export-MCPTelemetry {
    param(
        [string]$Metric,
        [double]$Value,
        [hashtable]$Tags = @{}
    )
    
    $entry = @{
        timestamp = [datetime]::UtcNow.ToString("o")
        metric = $Metric
        value = $Value
        tags = $Tags
    }
    
    $entry | ConvertTo-Json -Compress | Add-Content -Path $MetricsDb -Encoding UTF8
}

function Get-MCPMetricsSummary {
    if (-not (Test-Path $MetricsDb)) {
        Write-Host "⚠️  No metrics recorded yet"
        return @{
            error_count = 0
            total_requests = 0
            avg_latency_ms = 0
            throughput_per_min = 0
        }
    }
    
    $metrics = @(Get-Content $MetricsDb | ConvertFrom-Json -ErrorAction SilentlyContinue)
    
    $errors = @($metrics | Where-Object { $_.metric -eq "error" })
    $latencies = @($metrics | Where-Object { $_.metric -eq "latency_ms" })
    $requests = @($metrics | Where-Object { $_.metric -eq "request_count" })
    
    $timespan = 1  # minutes (simplified)
    
    return @{
        error_count = $errors.Count
        total_requests = $requests | Measure-Object -Sum | Select-Object -ExpandProperty Sum
        avg_latency_ms = if ($latencies) { [math]::Round(($latencies | Measure-Object -Average | Select-Object -ExpandProperty Average), 2) } else { 0 }
        throughput_per_min = if ($requests) { [math]::Round(($requests | Measure-Object -Sum | Select-Object -ExpandProperty Sum) / $timespan, 2) } else { 0 }
        from = ($metrics | Select-Object -First 1 | Select-Object -ExpandProperty timestamp)
        to = ($metrics | Select-Object -Last 1 | Select-Object -ExpandProperty timestamp)
    }
}

Write-Host ""
Write-Host "📊 MCP TELEMETRY EXPORT (U8)" -ForegroundColor Cyan
Write-Host "   Metrics DB: $MetricsDb"
Write-Host ""

if ($Summarize) {
    $summary = Get-MCPMetricsSummary
    Write-Host "   Errors: $($summary.error_count)"
    Write-Host "   Requests: $($summary.total_requests)"
    Write-Host "   Avg Latency: $($summary.avg_latency_ms)ms"
    Write-Host "   Throughput: $($summary.throughput_per_min)/min"
    Write-Host "   Period: $($summary.from) → $($summary.to)"
}

Write-Host ""

# Example usage (commented out)
# Export-MCPTelemetry -Metric "error" -Value 1 -Tags @{ agent = "RISE"; error_code = "TIMEOUT" }
# Export-MCPTelemetry -Metric "latency_ms" -Value 1250 -Tags @{ agent = "RISE" }
