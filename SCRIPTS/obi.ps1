param(
    [ValidateSet("doctor", "verify", "dev", "mcp-audit", "soul-check")]
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
        $notion = [Environment]::GetEnvironmentVariable("NOTION_TOKEN", "User")

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
            notion_token = [bool]$notion
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
}