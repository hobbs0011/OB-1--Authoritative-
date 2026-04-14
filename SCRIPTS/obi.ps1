param(
    [ValidateSet("doctor", "verify", "dev", "mcp-audit")]
    [string]$Command = "doctor"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$appPath = Join-Path $repoRoot "APPS\NET-PET-AI-merge\APPS\NET-PET-AI"
$mergeAuditScript = Join-Path $repoRoot "APPS\NET-PET-AI-merge\SCRIPTS\mcp-godmode-audit.ps1"
$canonicalEmail = "mrmichaelhobbs123@gmail.com"

function Invoke-InApp {
    param([string]$CommandText)

    Push-Location $appPath
    try {
        Invoke-Expression $CommandText
    }
    finally {
        Pop-Location
    }
}

switch ($Command) {
    "doctor" {
        $email = [Environment]::GetEnvironmentVariable("CLOUDFLARE_EMAIL", "User")
        $githubToken = [Environment]::GetEnvironmentVariable("GITHUB_TOKEN", "User")
        $cfKey = [Environment]::GetEnvironmentVariable("CLOUDFLARE_API_KEY", "User")
        $notion = [Environment]::GetEnvironmentVariable("NOTION_TOKEN", "User")

        [pscustomobject]@{
            repo_root = $repoRoot
            runtime_app = $appPath
            canonical_email = $canonicalEmail
            configured_email = if ($email) { $email } else { "MISSING" }
            email_match = ($email -eq $canonicalEmail)
            github_token = [bool]$githubToken
            cloudflare_api_key = [bool]$cfKey
            notion_token = [bool]$notion
        } | ConvertTo-Json -Depth 3
    }
    "verify" {
        Invoke-InApp "npm run verify:wrangler"
    }
    "dev" {
        Invoke-InApp "npm run dev"
    }
    "mcp-audit" {
        if (-not (Test-Path $mergeAuditScript)) {
            throw "Missing audit script: $mergeAuditScript"
        }

        & $mergeAuditScript -Json
    }
}