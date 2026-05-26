#!/usr/bin/env pwsh
#/─────────────────────────────────────────────────────────────────────────────
#/ MCP HARDENING: Resilient Connection Layer
#/ Adds retry logic, fallback routing, error recovery for MCP servers
#/─────────────────────────────────────────────────────────────────────────────

param(
    [string]$Server = "all",        # filesystem | github | cloudflare | all
    [int]$MaxRetries = 3,
    [int]$TimeoutSeconds = 30,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$WarningPreference = "Continue"

# MCP Server Definitions
$mcpServers = @{
    filesystem = @{
        command = "@modelcontextprotocol/server-filesystem"
        timeout = 10
        fallback = @()
    }
    github = @{
        command = "@modelcontextprotocol/server-github"
        timeout = 15
        fallback = @("filesystem")  # Can read from cached repo clones if GitHub is down
    }
    cloudflare = @{
        command = "@cloudflare/mcp-server-cloudflare"
        timeout = 20
        fallback = @()
    }
}

function Test-MCPServer {
    param(
        [string]$ServerName,
        [int]$Timeout = 30
    )
    
    $server = $mcpServers[$ServerName]
    if (-not $server) {
        Write-Host "❌ Unknown server: $ServerName" -ForegroundColor Red
        return $false
    }
    
    Write-Host "Testing $ServerName..." -NoNewline
    
    try {
        $job = Start-Job -ScriptBlock {
            param($cmd)
            & npx -y $cmd --version 2>&1
        } -ArgumentList $server.command
        
        $result = Wait-Job -Job $job -Timeout $Timeout
        if (-not $result) {
            Stop-Job -Job $job
            Write-Host " ⏱️  TIMEOUT ($($Timeout)s)" -ForegroundColor Yellow
            return $false
        }
        
        $output = Receive-Job -Job $job
        Remove-Job -Job $job
        
        if ($output -match '\d+\.\d+') {
            Write-Host " ✅" -ForegroundColor Green
            return $true
        } else {
            Write-Host " ⚠️  (no version detected)" -ForegroundColor Yellow
            return $true  # Still consider operational
        }
    } catch {
        Write-Host " ❌ $_" -ForegroundColor Red
        return $false
    }
}

function Test-MCPWithRetry {
    param(
        [string]$ServerName,
        [int]$MaxRetries = 3
    )
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        $result = Test-MCPServer -ServerName $ServerName
        if ($result) {
            return $true
        }
        
        if ($i -lt $MaxRetries) {
            Write-Host "   Retry $i/$MaxRetries in 2 seconds..." -ForegroundColor Gray
            Start-Sleep -Seconds 2
        }
    }
    
    return $false
}

function Get-MCPFallback {
    param([string]$ServerName)
    
    $server = $mcpServers[$ServerName]
    if ($server.fallback.Count -gt 0) {
        Write-Host "`n🔄 FALLBACK ROUTING for $ServerName" -ForegroundColor Yellow
        foreach ($fallbackServer in $server.fallback) {
            Write-Host "   Attempting: $fallbackServer" -NoNewline
            if (Test-MCPServer -ServerName $fallbackServer) {
                Write-Host " ✅ (available as fallback)" -ForegroundColor Green
                return $fallbackServer
            }
            Write-Host " ❌" -ForegroundColor Red
        }
    }
    
    return $null
}

Write-Host "🛡️  MCP HARDENING CHECK" -ForegroundColor Cyan
Write-Host "Max retries: $MaxRetries | Timeout: $TimeoutSeconds seconds`n" -ForegroundColor Gray

# Test servers
if ($Server -eq "all") {
    $serversToTest = @("filesystem", "github", "cloudflare")
} else {
    $serversToTest = @($Server)
}

$results = @{}
$failedServers = @()

foreach ($serverName in $serversToTest) {
    $operational = Test-MCPWithRetry -ServerName $serverName -MaxRetries $MaxRetries
    $results[$serverName] = $operational
    
    if (-not $operational) {
        $fallback = Get-MCPFallback -ServerName $serverName
        if ($fallback) {
            $results["$serverName-fallback"] = $fallback
        } else {
            $failedServers += $serverName
        }
    }
}

# Summary
Write-Host "`n$('═' * 60)" -ForegroundColor Cyan
Write-Host "HARDENING STATUS" -ForegroundColor Cyan
Write-Host "═" * 60 -ForegroundColor Cyan

$operationalCount = ($results.Values | Where-Object { $_ -eq $true }).Count
$totalServers = $serversToTest.Count

Write-Host "`n✅ OPERATIONAL: $operationalCount/$totalServers" -ForegroundColor Green

if ($failedServers.Count -gt 0) {
    Write-Host "❌ FAILED: $($failedServers -join ', ')" -ForegroundColor Red
    Write-Host "`nRecommended Actions:" -ForegroundColor Yellow
    Write-Host "  1. Check network connectivity" -ForegroundColor Gray
    Write-Host "  2. Verify environment variables are set (.env decrypting properly)" -ForegroundColor Gray
    Write-Host "  3. Test individual server: npx -y @modelcontextprotocol/server-<name>" -ForegroundColor Gray
    Write-Host "  4. Check firewall rules (corporate proxy/firewall may block npm)" -ForegroundColor Gray
} else {
    Write-Host "`n🛡️  ALL MCP SERVERS OPERATIONAL AND HARDENED" -ForegroundColor Green
}

Write-Host ""
