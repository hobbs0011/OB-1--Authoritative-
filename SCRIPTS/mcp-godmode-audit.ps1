param(
    [switch]$Json
)

$ErrorActionPreference = "SilentlyContinue"

function Get-EnvStatus {
    param([string]$Name)
    $val = [Environment]::GetEnvironmentVariable($Name, "User")
    if ($val) {
        return [pscustomobject]@{ Name = $Name; Status = "SET"; Length = $val.Length }
    }
    return [pscustomobject]@{ Name = $Name; Status = "MISSING"; Length = 0 }
}

function Test-Cloudflare {
    $key = [Environment]::GetEnvironmentVariable("CLOUDFLARE_API_KEY", "User")
    $email = [Environment]::GetEnvironmentVariable("CLOUDFLARE_EMAIL", "User")
    $acct = [Environment]::GetEnvironmentVariable("CLOUDFLARE_ACCOUNT_ID", "User")

    if (-not $key -or -not $email) {
        return [pscustomobject]@{ Service = "Cloudflare"; Live = $false; Detail = "Missing CLOUDFLARE_API_KEY/CLOUDFLARE_EMAIL" }
    }

    try {
        $user = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/user" -Headers @{ "X-Auth-Key" = $key; "X-Auth-Email" = $email } -Method Get
        $accounts = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts" -Headers @{ "X-Auth-Key" = $key; "X-Auth-Email" = $email } -Method Get

        $workers = 0
        if ($acct) {
            $scripts = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$acct/workers/scripts" -Headers @{ "X-Auth-Key" = $key; "X-Auth-Email" = $email } -Method Get
            $workers = $scripts.result.Count
        }

        return [pscustomobject]@{
            Service = "Cloudflare"
            Live    = $true
            Detail  = "Accounts=$($accounts.result.Count); Workers=$workers; Email=$email"
        }
    }
    catch {
        return [pscustomobject]@{ Service = "Cloudflare"; Live = $false; Detail = "API auth failed" }
    }
}

function Test-GitHub {
    $token = [Environment]::GetEnvironmentVariable("GITHUB_TOKEN", "User")
    if (-not $token) {
        return [pscustomobject]@{ Service = "GitHub"; Live = $false; Detail = "Missing GITHUB_TOKEN" }
    }

    try {
        $resp = Invoke-WebRequest -Uri "https://api.github.com/user" -Headers @{ Authorization = "token $token"; Accept = "application/vnd.github+json" }
        $user = ($resp.Content | ConvertFrom-Json).login
        $scopes = ($resp.Headers["X-OAuth-Scopes"] -split ",").Count

        return [pscustomobject]@{ Service = "GitHub"; Live = $true; Detail = "User=$user; Scopes=$scopes" }
    }
    catch {
        return [pscustomobject]@{ Service = "GitHub"; Live = $false; Detail = "API auth failed" }
    }
}

function Test-Notion {
    $tokenNames = @("NOTION_TOKEN", "NOTION_TOKEN_2", "NOTION_TOKEN_3", "NOTION_TOKEN_4", "NOTION_TOKEN_5", "NOTION_TOKEN_6")
    $live = 0
    $details = @()

    foreach ($name in $tokenNames) {
        $token = [Environment]::GetEnvironmentVariable($name, "User")
        if (-not $token) {
            continue
        }

        try {
            $headers = @{ Authorization = "Bearer $token"; "Notion-Version" = "2022-06-28"; "Content-Type" = "application/json" }
            $me = Invoke-RestMethod -Uri "https://api.notion.com/v1/users/me" -Method Get -Headers $headers
            $search = Invoke-RestMethod -Uri "https://api.notion.com/v1/search" -Method Post -Headers $headers -Body '{"page_size":5}'
            $live++
            $details += "${name}:$($me.bot.workspace_name):results=$($search.results.Count)"
        }
        catch {
            $details += "${name}:FAIL"
        }
    }

    if ($live -gt 0) {
        return [pscustomobject]@{ Service = "Notion"; Live = $true; Detail = ($details -join "; ") }
    }

    return [pscustomobject]@{ Service = "Notion"; Live = $false; Detail = "No valid tokens" }
}

$envVars = @(
    "CLOUDFLARE_API_KEY", "CLOUDFLARE_EMAIL", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID",
    "GITHUB_TOKEN",
    "NOTION_TOKEN", "NOTION_TOKEN_2", "NOTION_TOKEN_3", "NOTION_TOKEN_4", "NOTION_TOKEN_5", "NOTION_TOKEN_6",
    "ROBLOX_API_KEY",
    "SLACK_BOT_TOKEN", "SLACK_TEAM_ID", "DISCORD_TOKEN", "BRAVE_API_KEY",
    "TELEGRAM_API_ID", "TELEGRAM_API_HASH", "TELEGRAM_PHONE",
    "LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET", "LINKEDIN_ACCESS_TOKEN",
    "GMAIL_CREDENTIALS_PATH"
)

$envStatus = $envVars | ForEach-Object { Get-EnvStatus -Name $_ }
$checks = @(
    Test-Cloudflare
    Test-GitHub
    Test-Notion
)

if ($Json) {
    [pscustomobject]@{
        Timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        Env       = $envStatus
        Checks    = $checks
    } | ConvertTo-Json -Depth 6
    exit 0
}

Write-Host "MCP GOD-MODE AUDIT"
Write-Host "Timestamp: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))"
Write-Host ""
Write-Host "ENV STATUS"
$envStatus | Format-Table -AutoSize
Write-Host ""
Write-Host "LIVE CHECKS"
$checks | Format-Table -AutoSize
