param(
    [string]$WorkspaceRoot = "C:\Users\mrmic\Desktop\OB-1",
    [string]$ReportPath = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ReportPath)) {
    $ReportPath = Join-Path $WorkspaceRoot "OPERATIONS\OMNISCIENT-PHASE1-REPORT.json"
}

function Test-Pattern {
    param(
        [string]$Content,
        [string]$Pattern
    )
    return [bool]([regex]::Match($Content, $Pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase).Success)
}

function Get-EnvValue {
    param([string]$Name)
    $value = [Environment]::GetEnvironmentVariable($Name, "Process")
    if ([string]::IsNullOrWhiteSpace($value)) {
        $value = [Environment]::GetEnvironmentVariable($Name, "User")
    }
    if ([string]::IsNullOrWhiteSpace($value)) {
        $value = [Environment]::GetEnvironmentVariable($Name, "Machine")
    }
    return $value
}

$vscodeMcpPath = Join-Path $WorkspaceRoot ".vscode\mcp.json"
$rootMcpPath = Join-Path $WorkspaceRoot ".mcp.json"

if (-not (Test-Path $vscodeMcpPath)) {
    throw "Missing file: $vscodeMcpPath"
}
if (-not (Test-Path $rootMcpPath)) {
    throw "Missing file: $rootMcpPath"
}

$vscodeMcp = Get-Content -Raw -Path $vscodeMcpPath
$rootMcp = Get-Content -Raw -Path $rootMcpPath

$checks = [ordered]@{
    timestamp_utc = (Get-Date).ToUniversalTime().ToString("o")
    workspace_root = $WorkspaceRoot
    phase = "Operation Omniscient Phase 1"
    checks = [ordered]@{
        vscode_god_mode_server = Test-Pattern -Content $vscodeMcp -Pattern '"god-mode"\s*:\s*\{'
        vscode_god_mode_url_input = Test-Pattern -Content $vscodeMcp -Pattern '"god_mode_mcp_url"'
        vscode_god_mode_token_input = Test-Pattern -Content $vscodeMcp -Pattern '"god_mode_mcp_token"'
        vscode_scoped_filesystem = Test-Pattern -Content $vscodeMcp -Pattern '"filesystem-net-pet-ai"\s*:\s*\{'
        vscode_github_dual_env = (
            (Test-Pattern -Content $vscodeMcp -Pattern '"GITHUB_PERSONAL_ACCESS_TOKEN"\s*:\s*"\$\{input:github_token\}"') -and
            (Test-Pattern -Content $vscodeMcp -Pattern '"GITHUB_TOKEN"\s*:\s*"\$\{input:github_token\}"')
        )
        root_god_mode_server = Test-Pattern -Content $rootMcp -Pattern '"god-mode"\s*:\s*\{'
        root_god_mode_env = (
            (Test-Pattern -Content $rootMcp -Pattern 'GOD_MODE_MCP_URL') -and
            (Test-Pattern -Content $rootMcp -Pattern 'GOD_MODE_MCP_TOKEN')
        )
        root_scoped_filesystem = Test-Pattern -Content $rootMcp -Pattern '"filesystem-net-pet-ai"\s*:\s*\{'
        root_github_dual_env = (
            (Test-Pattern -Content $rootMcp -Pattern '"GITHUB_TOKEN"') -and
            (Test-Pattern -Content $rootMcp -Pattern '"GITHUB_PERSONAL_ACCESS_TOKEN"')
        )
    }
    environment = [ordered]@{
        GOD_MODE_MCP_URL = -not [string]::IsNullOrWhiteSpace((Get-EnvValue -Name "GOD_MODE_MCP_URL"))
        GOD_MODE_MCP_TOKEN = -not [string]::IsNullOrWhiteSpace((Get-EnvValue -Name "GOD_MODE_MCP_TOKEN"))
        GITHUB_TOKEN = -not [string]::IsNullOrWhiteSpace((Get-EnvValue -Name "GITHUB_TOKEN"))
        GITHUB_PERSONAL_ACCESS_TOKEN = -not [string]::IsNullOrWhiteSpace((Get-EnvValue -Name "GITHUB_PERSONAL_ACCESS_TOKEN"))
        CLOUDFLARE_API_TOKEN = -not [string]::IsNullOrWhiteSpace((Get-EnvValue -Name "CLOUDFLARE_API_TOKEN"))
    }
}

$allStaticChecks = $checks.checks.GetEnumerator() | ForEach-Object { [bool]$_.Value }
$allEnvChecks = @(
    $checks.environment.GOD_MODE_MCP_URL,
    $checks.environment.GOD_MODE_MCP_TOKEN
)

$checks.overall = [ordered]@{
    static_config_ready = ($allStaticChecks -notcontains $false)
    god_mode_credentials_ready = ($allEnvChecks -notcontains $false)
    phase1_ready = (($allStaticChecks -notcontains $false) -and ($allEnvChecks -notcontains $false))
}

$reportDir = Split-Path -Parent $ReportPath
if (-not (Test-Path $reportDir)) {
    New-Item -Path $reportDir -ItemType Directory -Force | Out-Null
}

$checks | ConvertTo-Json -Depth 10 | Set-Content -Path $ReportPath -Encoding UTF8

Write-Host "[Operation Omniscient Phase 1] Report written: $ReportPath"
Write-Host "Static Config Ready: $($checks.overall.static_config_ready)"
Write-Host "God Mode Credentials Ready: $($checks.overall.god_mode_credentials_ready)"
Write-Host "Phase 1 Ready: $($checks.overall.phase1_ready)"
