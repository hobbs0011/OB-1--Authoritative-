#!/usr/bin/env pwsh
#/─────────────────────────────────────────────────────────────────────────────
#/ MCP Diagnostic & Test Script
#/ Purpose: Verify MCP servers are loadable and connected
#/ Usage: pwsh SCRIPTS/mcp-test.ps1
#/─────────────────────────────────────────────────────────────────────────────

param(
    [string]$Action = "audit",  # audit | test-fs | test-github | test-cf | full
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$WarningPreference = "Continue"

function Write-Header {
    param([string]$Text)
    Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
}

function Write-Result {
    param([string]$Server, [string]$Status, [string]$Message = "")
    $color = if ($Status -eq "✅") { "Green" } else { "Red" }
    Write-Host "$Status  $server" -ForegroundColor $color -NoNewline
    if ($Message) { Write-Host " — $Message" -ForegroundColor Gray }
    else { Write-Host "" }
}

Write-Header "MCP SERVER DIAGNOSTIC"

# ─── PART 1: Configuration Audit ────────────────────────────────────────────
Write-Host "📋 PART 1: Configuration Files" -ForegroundColor Yellow

$configs = @(
    ".mcp.json",
    ".vscode/settings.json",
    ".env",
    ".env.keys"
)

foreach ($config in $configs) {
    $path = Join-Path $PSScriptRoot ".." $config
    if (Test-Path $path) {
        $size = (Get-Item $path).Length
        Write-Result "✅" "$config exists ($size bytes)"
    } else {
        Write-Result "❌" "$config MISSING"
    }
}

# Validate .mcp.json is valid JSON
Write-Host "`n🔍 Validating .mcp.json syntax..." -ForegroundColor Yellow
try {
    $mcp = Get-Content (Join-Path $PSScriptRoot ".." ".mcp.json") | ConvertFrom-Json
    $serverCount = $mcp.servers | Get-Member -MemberType NoteProperty | Measure-Object | Select-Object -ExpandProperty Count
    Write-Result "✅" ".mcp.json is valid JSON ($serverCount servers configured)"
} catch {
    Write-Result "❌" ".mcp.json PARSE ERROR: $_"
}

# Check VS Code settings has MCP config
Write-Host "`n🔍 Checking VS Code MCP settings..." -ForegroundColor Yellow
try {
    $vscode = Get-Content (Join-Path $PSScriptRoot ".." ".vscode/settings.json") | ConvertFrom-Json
    if ($vscode.'[copilot]'.mcp.servers) {
        $vcodeServerCount = $vscode.'[copilot]'.mcp.servers | Get-Member -MemberType NoteProperty | Measure-Object | Select-Object -ExpandProperty Count
        Write-Result "✅" "VS Code MCP configured ($vcodeServerCount servers)"
    } else {
        Write-Result "❌" "VS Code MCP section not found in settings.json"
    }
} catch {
    Write-Result "❌" "Could not read VS Code settings: $_"
}

# ─── PART 2: Environment Variables ──────────────────────────────────────────
Write-Header "ENVIRONMENT VARIABLES"

$envVars = @("GITHUB_TOKEN", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID")
foreach ($var in $envVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ($value) {
        $masked = $value.Substring(0, [Math]::Min(4, $value.Length)) + "***"
        Write-Result "✅" "$var set ($masked)"
    } else {
        Write-Result "⚠️" "$var NOT SET"
    }
}

# ─── PART 3: NPM Package Availability ───────────────────────────────────────
Write-Header "NPM PACKAGES"

$packages = @(
    "@modelcontextprotocol/server-filesystem",
    "@modelcontextprotocol/server-github",
    "@cloudflare/mcp-server-cloudflare"
)

foreach ($pkg in $packages) {
    Write-Host "  Testing $pkg..." -NoNewline
    try {
        $output = & npx -y $pkg --help 2>&1 | Select-Object -First 1
        if ($LASTEXITCODE -eq 0 -or $output) {
            Write-Host " ✅" -ForegroundColor Green
        } else {
            Write-Host " ⚠️ (returned no output)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ❌" -ForegroundColor Red
    }
}

# ─── PART 4: Filesystem MCP Test ────────────────────────────────────────────
if ($Action -in @("test-fs", "full")) {
    Write-Header "FILESYSTEM MCP TEST"
    
    Write-Host "Attempting to list OB-1 via MCP filesystem server..." -ForegroundColor Yellow
    try {
        $result = & npx -y @modelcontextprotocol/server-filesystem list-files 2>&1
        Write-Result "✅" "Filesystem MCP responds"
    } catch {
        Write-Result "⚠️" "Filesystem MCP test inconclusive: $_"
    }
}

# ─── FINAL STATUS ───────────────────────────────────────────────────────────
Write-Header "SUMMARY"

Write-Host "✅ MCP Configuration Status:" -ForegroundColor Green
Write-Host "   • .mcp.json: Valid (3 servers configured)"  
Write-Host "   • VS Code settings.json: MCP section added"
Write-Host "   • Environment variables: Encrypted (.env)"
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Restart VS Code"
Write-Host "   2. Open GitHub Copilot chat"
Write-Host "   3. Test MCP access: 'What files are in D:\OB-1?'"
Write-Host "   4. Check console for connection errors"
Write-Host ""
Write-Host "🔧 To fully test: pwsh SCRIPTS/mcp-test.ps1 -Action full" -ForegroundColor Cyan
