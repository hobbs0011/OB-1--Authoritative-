<#
  legion-garrison.ps1 — Legion Garrison / Command Station
  Builds and maintains the permanent Cloudflare legion settlement.
#>
param(
    [ValidateSet("build","status","update","assign","history","full")]
    [string]$Command = "status",
    [string]$Legion,
    [string]$Assignment,
    [string]$Notes,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$repoRoot = "D:\OB-1-CANONICAL"
$garrisonDir = Join-Path $repoRoot "CANON\GARRISON"
$garrisonFile = Join-Path $garrisonDir "legion-garrison.json"
$historyFile = Join-Path $garrisonDir "legion-history.jsonl"

if (-not (Test-Path $garrisonDir)) { New-Item -ItemType Directory -Path $garrisonDir -Force | Out-Null }

function Read-Garrison {
    if (Test-Path $garrisonFile) {
        return Get-Content $garrisonFile -Raw | ConvertFrom-Json
    }
    return [pscustomobject]@{
        version = "1.0.0"
        built_at = (Get-Date -Format "o")
        legions = @{}
        assignments = @{}
        status = "ACTIVE"
    }
}

function Write-Garrison {
    param([object]$Data)
    if (-not $DryRun) {
        $Data | ConvertTo-Json -Depth 5 | Set-Content $garrisonFile -Encoding UTF8
    }
}

function Add-History {
    param([string]$Cmd,[string]$Legion,[string]$Assignment,[string]$Msg)
    $entry = [pscustomobject]@{
        ts = (Get-Date -Format "o")
        cmd = $Cmd
        legion = $Legion
        assignment = $Assignment
        message = $Msg
    }
    ($entry | ConvertTo-Json -Compress) | Out-File -Append -Encoding UTF8 $historyFile
}

# ── CLOUDFLARE LEGION INVENTORY ────────────────────────────────────────────────
function Get-LegionInventory {
    param([string]$Account,[string]$Key,[string]$Email)
    $h = @{ "X-Auth-Key"=$Key; "X-Auth-Email"=$Email; "Content-Type"="application/json" }

    $workers = @()
    try {
        $wResp = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$Account/workers/scripts" -Headers $h
        $workers = @($wResp.result | ForEach-Object {
            [pscustomobject]@{
                name = $_.id
                type = "worker"
                source = $_.source
                health = "UNKNOWN"
                last_modified = $_.modified_on
            }
        })
    } catch {}

    $pages = @()
    try {
        $pResp = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$Account/pages/projects" -Headers $h
        $pages = @($pResp.result | ForEach-Object {
            [pscustomobject]@{
                name = $_.name
                type = "pages"
                source = "pages"
                health = "UNKNOWN"
                last_modified = $_.production_branch
            }
        })
    } catch {}

    return @($workers) + @($pages)
}

# ── HEALTH CHECK ───────────────────────────────────────────────────────────────
function Test-LegionHealth {
    param([string]$Name,[string]$Url)
    try {
        $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 6 -ErrorAction Stop
        return [int]$r.StatusCode
    } catch {
        if ($_.Exception.Response) {
            return [int]$_.Exception.Response.StatusCode
        }
        return "ERR"
    }
}

# ── BUILD COMMAND ──────────────────────────────────────────────────────────────
function Invoke-Build {
    param([object]$Garrison)
    Write-Host "`nLEGION GARRISON — BUILD" -ForegroundColor Cyan
    Write-Host "  Surveying Cloudflare legions..." -ForegroundColor Gray

    $account = "3c7b1766bd8fdc9e01211d2b390315ea"
    $key = [Environment]::GetEnvironmentVariable("CLOUDFLARE_API_KEY", "User")
    $email = [Environment]::GetEnvironmentVariable("CLOUDFLARE_EMAIL", "User")

    if (-not $key -or -not $email) {
        Write-Host "  [ERR] CLOUDFLARE_API_KEY or CLOUDFLARE_EMAIL missing" -ForegroundColor Red
        Add-History -Cmd "build" -Legion "SYSTEM" -Assignment "" -Msg "Build failed: missing CF creds"
        return
    }

    $inventory = Get-LegionInventory -Account $account -Key $key -Email $email
    Write-Host "  Inventory: $($inventory.Count) assets" -ForegroundColor Gray

    $legionMap = @{}
    foreach ($item in $inventory) {
        $url = if ($item.type -eq "worker") {
            "https://$($item.name).mrmichaelhobbs123.workers.dev/"
        } else {
            "https://$($item.name).pages.dev/"
        }

        $health = Test-LegionHealth -Name $item.name -Url $url
        $status = if ($health -eq 200) { "ONLINE" }
        elseif ($health -eq 401) { "AUTH_REQUIRED" }
        elseif ($health -eq 404) { "OFFLINE_OR_EMPTY" }
        else { "BROKEN" }

        $legionMap[$item.name] = [pscustomobject]@{
            name = $item.name
            type = $item.type
            url = $url
            health = $health
            status = $status
            last_modified = $item.last_modified
            source = $item.source
            assignment = $null
            commander = $null
        }
    }

    $Garrison.legions = $legionMap
    $Garrison.built_at = (Get-Date -Format "o")
    $Garrison.last_audit = (Get-Date -Format "o")

    Write-Garrison -Data $Garrison
    Add-History -Cmd "build" -Legion "ALL" -Assignment "" -Msg "Built garrison: $($legionMap.Count) legions"

    Write-Host "  Garrison built: $($legionMap.Count) legions" -ForegroundColor Green
    foreach ($k in $legionMap.Keys | Sort-Object) {
        $l = $legionMap[$k]
        $color = if ($l.status -eq "ONLINE") { "Green" }
        elseif ($l.status -eq "AUTH_REQUIRED") { "Yellow" }
        elseif ($l.status -eq "OFFLINE_OR_EMPTY") { "Red" }
        else { "Red" }
        Write-Host "    $($l.status)  $($l.name)  [$($l.type)]" -ForegroundColor $color
    }
}

# ── STATUS COMMAND ────────────────────────────────────────────────────────────
function Invoke-Status {
    param([object]$Garrison)
    Write-Host "`nLEGION GARRISON — STATUS" -ForegroundColor Cyan
    Write-Host "  Status: $($Garrison.status)" -ForegroundColor Gray
    Write-Host "  Built:  $($Garrison.built_at)" -ForegroundColor Gray
    Write-Host "  Legions: $($Garrison.legions.Count)" -ForegroundColor Gray

    if ($Legion) {
        if ($Garrison.legions.PSObject.Properties | Where-Object { $_.Name -eq $Legion }) {
            $l = $Garrison.legions.$Legion
            Write-Host "`n  LEGION: $Legion" -ForegroundColor Yellow
            Write-Host "    Type:       $($l.type)" -ForegroundColor Gray
            Write-Host "    URL:        $($l.url)" -ForegroundColor Gray
            Write-Host "    Health:     $($l.health)" -ForegroundColor Gray
            Write-Host "    Status:     $($l.status)" -ForegroundColor Gray
            Write-Host "    Modified:   $($l.last_modified)" -ForegroundColor Gray
            Write-Host "    Assignment: $($l.assignment)" -ForegroundColor Gray
            Write-Host "    Commander:  $($l.commander)" -ForegroundColor Gray
        } else {
            Write-Host "  Legion not found: $Legion" -ForegroundColor Red
        }
    } else {
        Write-Host "`n  LEGION ROSTER:" -ForegroundColor Yellow
        foreach ($k in $Garrison.legions.PSObject.Properties.Name | Sort-Object) {
            $l = $Garrison.legions.$k
            $color = if ($l.status -eq "ONLINE") { "Green" }
            elseif ($l.status -eq "AUTH_REQUIRED") { "Yellow" }
            elseif ($l.status -eq "OFFLINE_OR_EMPTY") { "Red" }
            else { "Red" }
            $asgn = if ($l.assignment) { " [$($l.assignment)]" } else { "" }
            Write-Host "    $($l.status)  $($l.name)$asgn  [$($l.type)]" -ForegroundColor $color
        }
    }

    Add-History -Cmd "status" -Legion ($Legion ?? "ALL") -Assignment "" -Msg "Status check"
}

# ── ASSIGN COMMAND ────────────────────────────────────────────────────────────
function Invoke-Assign {
    param([object]$Garrison)
    if (-not $Legion) { throw "Assign requires -Legion" }
    if (-not $Assignment) { throw "Assign requires -Assignment" }

    if ($Garrison.legions.PSObject.Properties | Where-Object { $_.Name -eq $Legion }) {
        $Garrison.legions.$Legion.assignment = $Assignment
        if ($Notes) { $Garrison.legions.$Legion.notes = $Notes }
        Write-Garrison -Data $Garrison
        Write-Host "`nLEGION GARRISON — ASSIGN" -ForegroundColor Cyan
        Write-Host "  $Legion → $Assignment" -ForegroundColor Green
        if ($Notes) { Write-Host "  Notes: $Notes" -ForegroundColor Gray }
        Add-History -Cmd "assign" -Legion $Legion -Assignment $Assignment -Msg $Notes
    } else {
        Write-Host "  Legion not found: $Legion" -ForegroundColor Red
        Add-History -Cmd "assign" -Legion $Legion -Assignment $Assignment -Msg "FAILED: legion not found"
    }
}

# ── HISTORY COMMAND ───────────────────────────────────────────────────────────
function Invoke-History {
    Write-Host "`nLEGION GARRISON — HISTORY" -ForegroundColor Cyan
    if (-not (Test-Path $historyFile)) {
        Write-Host "  No history recorded." -ForegroundColor Gray
        return
    }
    $lines = Get-Content $historyFile -ErrorAction SilentlyContinue
    $lines | Select-Object -Last 20 | ForEach-Object {
        $e = $_ | ConvertFrom-Json
        Write-Host "  $($e.ts)  [$($e.cmd)]  $($e.legion)  $($e.assignment)" -ForegroundColor Gray
    }
    Write-Host "`n  Total entries: $($lines.Count)" -ForegroundColor Cyan
}

# ── FULL STATUS ───────────────────────────────────────────────────────────────
function Invoke-Full {
    param([object]$Garrison)
    Invoke-Status -Garrison $Garrison
    Write-Host "`n  ASSIGNMENTS:" -ForegroundColor Cyan
    foreach ($k in $Garrison.legions.PSObject.Properties.Name | Sort-Object) {
        $l = $Garrison.legions.$k
        if ($l.assignment) {
            Write-Host "    $($l.name): $($l.assignment)" -ForegroundColor Yellow
        }
    }
    Invoke-History
}

# ── ROUTER ────────────────────────────────────────────────────────────────────
Write-Host "`nLEGION GARRISON — $Command" -ForegroundColor Cyan
$garrison = Read-Garrison

switch ($Command) {
    "build"    { Invoke-Build -Garrison $garrison }
    "status"   { Invoke-Status -Garrison $garrison }
    "update"   { Invoke-Build -Garrison $garrison }
    "assign"   { Invoke-Assign -Garrison $garrison }
    "history"  { Invoke-History }
    "full"     { Invoke-Full -Garrison $garrison }
    default     { Write-Host "Unknown command: $Command"; exit 2 }
}

Write-Host "`nGarrison command complete." -ForegroundColor Green
