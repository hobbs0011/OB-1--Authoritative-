# U7: MCP Audit Logging
# Purpose: Capture all MCP invocations (agent, timestamp, args, result) to CANON/AUDIT/mcp-invocations.jsonl

function Log-MCPInvocation {
    param(
        [string]$Agent,
        [hashtable]$Args = @{},
        [object]$Result = $null,
        [string]$Status = "SUCCESS",
        [string]$Error = $null,
        [int]$DurationMs = 0
    )
    
    $logFile = "$PSScriptRoot\..\CANON\AUDIT\mcp-invocations.jsonl"
    
    # Ensure directory exists
    if (-not (Test-Path (Split-Path $logFile))) {
        New-Item -ItemType Directory -Path (Split-Path $logFile) -Force | Out-Null
    }
    
    $logEntry = @{
        timestamp = [datetime]::UtcNow.ToString("o")
        agent = $Agent
        args = $Args
        status = $Status
        duration_ms = $DurationMs
        error = $Error
        session_id = $env:GITHUB_RUN_ID ?? "LOCAL"
    }
    
    try {
        $logEntry | ConvertTo-Json -Compress | Add-Content -Path $logFile -Encoding UTF8
    } catch {
        Write-Host "⚠️  Failed to log MCP invocation: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📋 MCP AUDIT LOGGING (U7)" -ForegroundColor Cyan
Write-Host "   Log file: CANON/AUDIT/mcp-invocations.jsonl"
Write-Host "   Format: JSONL (line-delimited JSON)"
Write-Host ""

# Example usage (commented out)
# $result = SomeCommand
# Log-MCPInvocation -Agent "RISE" -Args @{ action = "deploy" } -Result $result -Status "SUCCESS" -DurationMs 1250
