param(
    [string]$WorkspaceRoot = "C:\Users\mrmic\Desktop\OB-1"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Set-UserEnv {
    param(
        [string]$Name,
        [string]$Value
    )

    if (-not [string]::IsNullOrWhiteSpace($Value)) {
        [Environment]::SetEnvironmentVariable($Name, $Value, "User")
        Write-Host "Set user environment variable: $Name"
    }
}

Write-Host "Operation Omniscient Phase 1 Activation"
Write-Host "Provide God Mode MCP endpoint and token. Values will be stored in USER environment variables."

$godModeUrl = Read-Host "GOD_MODE_MCP_URL"
$godModeTokenSecure = Read-Host "GOD_MODE_MCP_TOKEN" -AsSecureString
$godModeTokenPlain = [System.Net.NetworkCredential]::new("", $godModeTokenSecure).Password

Set-UserEnv -Name "GOD_MODE_MCP_URL" -Value $godModeUrl
Set-UserEnv -Name "GOD_MODE_MCP_TOKEN" -Value $godModeTokenPlain

$scanScript = Join-Path $WorkspaceRoot "SCRIPTS\operation-omniscient-phase1.ps1"
& $scanScript -WorkspaceRoot $WorkspaceRoot

Write-Host "Activation complete. Restart VS Code MCP host/session to reload env values."
