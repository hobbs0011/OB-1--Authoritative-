param(
    [switch]$Json
)

$ErrorActionPreference = "SilentlyContinue"

$allowedOwners = @("hobbs0011", "Phoenix-Rising-Tech")
$legacyOwners = @("hobbs-lab", "mrmichaelhobbs1234-lang")

function Parse-RemoteOwner {
    param([string]$Url)
    if (-not $Url) { return $null }

    # HTTPS: https://github.com/owner/repo.git
    if ($Url -match 'github\.com[:/](?<owner>[^/]+)/(?<repo>[^/.]+)') {
        return $matches.owner
    }

    return $null
}

function Test-GitHubOwner {
    param([string]$Owner, [string]$Token)

    if (-not $Token) {
        return [pscustomobject]@{
            owner = $Owner
            reachable = $false
            status = "NO_TOKEN"
        }
    }

    try {
        $resp = Invoke-WebRequest -Uri "https://api.github.com/users/$Owner" -Headers @{ Authorization = "token $Token"; Accept = "application/vnd.github+json" }
        return [pscustomobject]@{
            owner = $Owner
            reachable = $true
            status = $resp.StatusCode
        }
    }
    catch {
        $status = "ERROR"
        try {
            $status = $_.Exception.Response.StatusCode.value__
        } catch {}

        return [pscustomobject]@{
            owner = $Owner
            reachable = $false
            status = $status
        }
    }
}

function Test-NotionToken {
    param([string]$EnvName)

    $token = [Environment]::GetEnvironmentVariable($EnvName, "User")
    if (-not $token) {
        return [pscustomobject]@{ name = $EnvName; valid = $false; status = "MISSING" }
    }

    try {
        $resp = Invoke-WebRequest -Uri "https://api.notion.com/v1/users/me" -Headers @{ Authorization = "Bearer $token"; "Notion-Version" = "2022-06-28" } -Method Get
        return [pscustomobject]@{ name = $EnvName; valid = $true; status = $resp.StatusCode }
    }
    catch {
        return [pscustomobject]@{ name = $EnvName; valid = $false; status = "FAIL" }
    }
}

$branch = (git branch --show-current)
$remoteLines = @(git remote -v)
$remoteRows = @()

foreach ($line in $remoteLines) {
    if ($line -match '^(?<name>\S+)\s+(?<url>\S+)\s+\((?<dir>fetch|push)\)$') {
        $owner = Parse-RemoteOwner -Url $matches.url
        $classification = if ($allowedOwners -contains $owner) { "ACTIVE" } elseif ($legacyOwners -contains $owner) { "LEGACY" } else { "UNKNOWN" }
        $remoteRows += [pscustomobject]@{
            remote = $matches.name
            owner = $owner
            direction = $matches.dir
            classification = $classification
            url = $matches.url
        }
    }
}

$token = [Environment]::GetEnvironmentVariable("GITHUB_TOKEN", "User")
$ownersToCheck = ($remoteRows.owner + $legacyOwners) | Where-Object { $_ } | Sort-Object -Unique
$ownerChecks = @()
foreach ($owner in $ownersToCheck) {
    $ownerChecks += Test-GitHubOwner -Owner $owner -Token $token
}

$notionTokens = @("NOTION_TOKEN", "NOTION_TOKEN_2", "NOTION_TOKEN_3", "NOTION_TOKEN_4", "NOTION_TOKEN_5", "NOTION_TOKEN_6")
$notionChecks = @()
foreach ($t in $notionTokens) {
    $notionChecks += Test-NotionToken -EnvName $t
}

$legacyRemotes = $remoteRows | Where-Object { $_.classification -eq "LEGACY" }
$invalidNotion = $notionChecks | Where-Object { -not $_.valid }

$result = [pscustomobject]@{
    timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    branch = $branch
    remotes = $remoteRows
    owners = $ownerChecks
    notion = $notionChecks
    findings = @(
        "Legacy remotes count: $($legacyRemotes.Count)",
        "Invalid/Missing Notion tokens: $($invalidNotion.Count)",
        "Active remotes count: $(($remoteRows | Where-Object { $_.classification -eq 'ACTIVE' }).Count)"
    )
}

if ($Json) {
    $result | ConvertTo-Json -Depth 6
    exit 0
}

Write-Host "CONNECTION HARDENING AUDIT"
Write-Host "Timestamp: $($result.timestamp)"
Write-Host "Branch: $branch"
Write-Host ""
Write-Host "Remotes"
$remoteRows | Format-Table -AutoSize
Write-Host ""
Write-Host "GitHub Owner Reachability"
$ownerChecks | Format-Table -AutoSize
Write-Host ""
Write-Host "Notion Token Health"
$notionChecks | Format-Table -AutoSize
Write-Host ""
Write-Host "Findings"
$result.findings | ForEach-Object { Write-Host "- $_" }
