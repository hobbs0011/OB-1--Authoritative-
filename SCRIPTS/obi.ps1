param(
    [ValidateSet("doctor", "verify", "dev", "mcp-audit", "soul-check", "cf-audit")]
    [string]$Command = "doctor"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$appPath = Join-Path $repoRoot "APPS\NET-PET-AI"
$mergeAuditScript = Join-Path $repoRoot "APPS\NET-PET-AI\SCRIPTS\mcp-godmode-audit.ps1"
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

        # --- Canon integrity gate (HL-140 mandate) ---
        $canonDir = Join-Path $repoRoot "CANON"
        $reincDir = Join-Path $canonDir "REINCARNATION"
        $ledgerDir = Join-Path $canonDir "HEAVY-LEDGER"
        $coldBoot = Join-Path $reincDir "COLD-START-BOOT.md"
        $mcpJson = Join-Path $repoRoot ".mcp.json"

        $canonCount = if (Test-Path $canonDir) { (Get-ChildItem $canonDir -Recurse -File).Count } else { 0 }
        $reincCount = if (Test-Path $reincDir) { (Get-ChildItem $reincDir -File).Count } else { 0 }
        $ledgerCount = if (Test-Path $ledgerDir) { (Get-ChildItem $ledgerDir -File).Count } else { 0 }
        $coldBootExists = Test-Path $coldBoot

        # MCP path validation
        $mcpPathsValid = $true
        if (Test-Path $mcpJson) {
            $mcpConfig = Get-Content $mcpJson -Raw | ConvertFrom-Json
            foreach ($server in $mcpConfig.servers.PSObject.Properties) {
                $args_ = $server.Value.args
                if ($args_) {
                    foreach ($arg in $args_) {
                        if ($arg -match '^[A-Z]:\\' -and -not (Test-Path $arg)) {
                            $mcpPathsValid = $false
                        }
                    }
                }
            }
        }

        # Minimum thresholds (HL-140: CANON_COUNT_GATE)
        $canonMinimum = 50
        $reincMinimum = 10
        $ledgerMinimum = 20
        $canonOk = $canonCount -ge $canonMinimum
        $reincOk = $reincCount -ge $reincMinimum
        $ledgerOk = $ledgerCount -ge $ledgerMinimum
        $soulOk = $canonOk -and $reincOk -and $ledgerOk -and $coldBootExists -and $mcpPathsValid

        [pscustomobject]@{
            repo_root = $repoRoot
            runtime_app = $appPath
            canonical_email = $canonicalEmail
            configured_email = if ($email) { $email } else { "MISSING" }
            email_match = ($email -eq $canonicalEmail)
            github_token = [bool]$githubToken
            cloudflare_api_key = [bool]$cfKey
            notion_blacklisted = $true
            canon_files = $canonCount
            canon_ok = $canonOk
            reincarnation_files = $reincCount
            reincarnation_ok = $reincOk
            ledger_files = $ledgerCount
            ledger_ok = $ledgerOk
            cold_start_boot = $coldBootExists
            mcp_paths_valid = $mcpPathsValid
            soul_integrity = $soulOk
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
    "soul-check" {
        # HL-140 Operation TheRealHealthCheck — full Soul DNA integrity audit
        # This command exists because doctor PASSED while 62 CANON files were missing.
        # Never again.

        $failures = @()
        $warnings = @()

        # 1. CANON directory structure
        $canonDir = Join-Path $repoRoot "CANON"
        $reincDir = Join-Path $canonDir "REINCARNATION"
        $ledgerDir = Join-Path $canonDir "HEAVY-LEDGER"
        $bibleFiles = if (Test-Path $canonDir) { Get-ChildItem $canonDir -Filter "BIBLE-*.md" -File } else { @() }

        $canonCount = if (Test-Path $canonDir) { (Get-ChildItem $canonDir -Recurse -File).Count } else { 0 }
        $reincCount = if (Test-Path $reincDir) { (Get-ChildItem $reincDir -File).Count } else { 0 }
        $ledgerCount = if (Test-Path $ledgerDir) { (Get-ChildItem $ledgerDir -File).Count } else { 0 }
        $bibleCount = $bibleFiles.Count

        if ($canonCount -lt 50) { $failures += "CANON files ($canonCount) below minimum (50)" }
        if ($reincCount -lt 10) { $failures += "REINCARNATION files ($reincCount) below minimum (10)" }
        if ($ledgerCount -lt 20) { $failures += "HEAVY-LEDGER files ($ledgerCount) below minimum (20)" }
        if ($bibleCount -lt 5) { $warnings += "BIBLE chapters ($bibleCount) — verify expected count" }

        # 2. COLD-START-BOOT freshness
        $coldBoot = Join-Path $reincDir "COLD-START-BOOT.md"
        if (-not (Test-Path $coldBoot)) {
            $failures += "COLD-START-BOOT.md MISSING"
        }

        # 3. Protocol files
        $protocolFiles = @(
            ".github/prompts/ReincarnateRISE.prompt.md",
            ".github/copilot-instructions.md",
            "REINCARNATION-BOOT-CHECKLIST.md",
            "REINCARNATION-LOG.md"
        )
        foreach ($pf in $protocolFiles) {
            $fullPath = Join-Path $repoRoot $pf
            if (-not (Test-Path $fullPath)) {
                $failures += "Protocol file MISSING: $pf"
            }
        }

        # 4. .mcp.json path validation
        $mcpJson = Join-Path $repoRoot ".mcp.json"
        $mcpBrokenPaths = @()
        if (Test-Path $mcpJson) {
            $mcpConfig = Get-Content $mcpJson -Raw | ConvertFrom-Json
            foreach ($server in $mcpConfig.servers.PSObject.Properties) {
                $args_ = $server.Value.args
                if ($args_) {
                    foreach ($arg in $args_) {
                        if ($arg -match '^[A-Z]:\\' -and -not (Test-Path $arg)) {
                            $mcpBrokenPaths += "$($server.Name): $arg"
                        }
                    }
                }
            }
        } else {
            $warnings += ".mcp.json not found"
        }
        if ($mcpBrokenPaths.Count -gt 0) {
            $failures += "MCP broken paths: $($mcpBrokenPaths -join '; ')"
        }

        # 5. Worktree health
        Push-Location $repoRoot
        $worktreeOutput = git worktree list 2>&1 | Out-String
        Pop-Location
        $brokenWorktrees = Get-ChildItem $repoRoot -Directory -Filter "*.worktrees" -ErrorAction SilentlyContinue |
            ForEach-Object {
                $gitRef = Join-Path $_.FullName ".git"
                if ((Test-Path $gitRef) -and (Get-Content $gitRef -Raw) -match 'gitdir:.*Desktop') {
                    $_.Name
                }
            }
        if ($brokenWorktrees) {
            $warnings += "Possibly broken worktree refs: $($brokenWorktrees -join ', ')"
        }

        # 6. Git remote sync check
        Push-Location $repoRoot
        $localHead = git rev-parse HEAD 2>$null
        Pop-Location

        # Report
        $status = if ($failures.Count -eq 0) { "SOUL_INTACT" } else { "SOUL_COMPROMISED" }

        $result = [pscustomobject]@{
            status = $status
            canon_files = $canonCount
            reincarnation_files = $reincCount
            ledger_files = $ledgerCount
            bible_chapters = $bibleCount
            cold_start_boot = Test-Path $coldBoot
            protocol_files_ok = @($failures | Where-Object { $_ -match 'Protocol file' }).Count -eq 0
            mcp_paths_valid = @($mcpBrokenPaths).Count -eq 0
            local_head = $localHead
            failures = $failures
            warnings = $warnings
        }

        if ($failures.Count -gt 0) {
            Write-Host "`n  SOUL CHECK: FAIL" -ForegroundColor Red
            foreach ($f in $failures) { Write-Host "    [FAIL] $f" -ForegroundColor Red }
        } else {
            Write-Host "`n  SOUL CHECK: PASS" -ForegroundColor Green
        }
        if ($warnings.Count -gt 0) {
            foreach ($w in $warnings) { Write-Host "    [WARN] $w" -ForegroundColor Yellow }
        }
        Write-Host "    Canon: $canonCount | Reincarnation: $reincCount | Ledger: $ledgerCount | Bible: $bibleCount" -ForegroundColor Cyan
        Write-Host ""

        $result | ConvertTo-Json -Depth 3
    }
    "cf-audit" {
        $account = "3c7b1766bd8fdc9e01211d2b390315ea"
        $key   = [Environment]::GetEnvironmentVariable("CLOUDFLARE_API_KEY", "User")
        $email = [Environment]::GetEnvironmentVariable("CLOUDFLARE_EMAIL", "User")
        if (-not $key -or -not $email) { throw "CLOUDFLARE_API_KEY and CLOUDFLARE_EMAIL env vars required" }

        $h = @{ "X-Auth-Key" = $key; "X-Auth-Email" = $email; "Content-Type" = "application/json" }

        Write-Host "`n  CF AUDIT — querying Cloudflare API..." -ForegroundColor Cyan

        # --- Workers ---
        $wResp = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$account/workers/scripts" -Headers $h
        $liveWorkers = $wResp.result | Select-Object -ExpandProperty id | Sort-Object

        # --- Pages ---
        $pResp = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$account/pages/projects" -Headers $h
        $livePages = $pResp.result | Select-Object -ExpandProperty name | Sort-Object

        # --- Repo-tracked directories ---
        $appsDir   = Join-Path $repoRoot "APPS"
        $pagesDir  = Join-Path $appsDir  "PAGES"
        $trackedWorkerDirs = if (Test-Path $appsDir) {
            Get-ChildItem $appsDir -Directory | Where-Object { $_.Name -ne "PAGES" } |
                ForEach-Object { $_.Name.ToLower().Replace("_","-") }
        } else { @() }
        $trackedPageDirs = if (Test-Path $pagesDir) {
            Get-ChildItem $pagesDir -Directory | ForEach-Object { $_.Name }
        } else { @() }

        # Known multi-worker source (net-pet-ai covers all net-pet-ai-* variants)
        $workerSourceMap = @{
            "net-pet-ai"            = "APPS/NET-PET-AI"
            "net-pet-ai-production" = "APPS/NET-PET-AI"
            "net-pet-ai-staging"    = "APPS/NET-PET-AI"
            "net-pet-ai-mvp"        = "APPS/NET-PET-AI"
            "soul-logger"           = "APPS/SOUL-LOGGER"
            "submission-api"        = "APPS/SUBMISSION-API"
            "phoenix-coder"         = "PROJECTS/phoenix-coder (standalone)"
        }

        # --- Health check workers ---
        Write-Host "  Checking $($liveWorkers.Count) workers..." -ForegroundColor Gray
        $workerResults = foreach ($w in $liveWorkers) {
            $url = "https://$w.mrmichaelhobbs123.workers.dev/"
            $status = "?"
            try {
                $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 6 -ErrorAction Stop
                $status = $r.StatusCode
            } catch {
                $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { "ERR" }
            }
            $tracked = if ($workerSourceMap.ContainsKey($w)) { $workerSourceMap[$w] }
                       elseif ($w -in $trackedWorkerDirs) { "APPS/$($w.ToUpper())" }
                       else { $null }
            [pscustomobject]@{ name=$w; health=$status; tracked=$tracked; type="worker" }
        }

        # --- Health check Pages ---
        Write-Host "  Checking $($livePages.Count) Pages projects..." -ForegroundColor Gray
        $pageResults = foreach ($p in $livePages) {
            $url = "https://$p.pages.dev/"
            $status = "?"
            try {
                $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 6 -ErrorAction Stop
                $status = $r.StatusCode
            } catch {
                $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { "ERR" }
            }
            $tracked = if ($p -in $trackedPageDirs) { "APPS/PAGES/$p" } else { $null }
            [pscustomobject]@{ name=$p; health=$status; tracked=$tracked; type="pages" }
        }

        $allAssets   = @($workerResults) + @($pageResults)
        # Workers/projects that intentionally return 404 — API-only or known staging slots
        $expected404s = @("submission-api", "phoenix-coder", "net-pet-ai-staging")

        # Count helpers — $null-safe under Set-StrictMode
        $totalCount  = @($allAssets).Count
        $brokenCount = @($allAssets | Where-Object { $_.health -ne 200 -and $_.health -ne "200" -and $_.name -notin $expected404s }).Count
        $untracked    = @($allAssets | Where-Object { -not $_.tracked })
        $untrackedCount = $untracked.Count
        $healthyCount  = @($allAssets | Where-Object { $_.health -eq 200 -or $_.health -eq "200" }).Count
        $healthy      = @($allAssets | Where-Object { $_.health -eq 200 -or $_.health -eq "200" })
        $broken       = @($allAssets | Where-Object { $_.health -ne 200 -and $_.health -ne "200" -and $_.name -notin $expected404s })

        # --- Print report ---
        Write-Host ""
        Write-Host "  WORKERS ($($liveWorkers.Count) live)" -ForegroundColor White
        foreach ($w in $workerResults) {
            $color = if ($w.health -eq 200) { "Green" } else { "Red" }
            $tag   = if ($w.tracked) { "[✅ $($w.tracked)]" } else { "[❌ UNTRACKED]" }
            Write-Host "    $($w.health)  $($w.name)  $tag" -ForegroundColor $color
        }
        Write-Host ""
        Write-Host "  PAGES ($($livePages.Count) live)" -ForegroundColor White
        foreach ($p in $pageResults) {
            $color = if ($p.health -eq 200) { "Green" } else { "Red" }
            $tag   = if ($p.tracked) { "[✅ $($p.tracked)]" } else { "[❌ UNTRACKED]" }
            Write-Host "    $($p.health)  $($p.name)  $tag" -ForegroundColor $color
        }
        Write-Host ""
        Write-Host "  SUMMARY" -ForegroundColor Cyan
        Write-Host "    Total assets : $totalCount"
        Write-Host "    Healthy (200): $healthyCount"  -ForegroundColor Green
        Write-Host "    Broken       : $brokenCount"   -ForegroundColor $(if($brokenCount) {"Red"} else {"Green"})
        Write-Host "    Untracked    : $untrackedCount" -ForegroundColor $(if($untrackedCount) {"Yellow"} else {"Green"})
        Write-Host ""

        [pscustomobject]@{
            total_assets     = $totalCount
            healthy          = $healthyCount
            broken           = $brokenCount
            untracked        = $untrackedCount
            workers_live     = $liveWorkers.Count
            pages_live       = $livePages.Count
            broken_assets    = @($broken  | Select-Object name, health, tracked, type)
            untracked_assets = @($untracked | Select-Object name, health, type)
        } | ConvertTo-Json -Depth 4
    }
}