# GOD MODE - Master System Orchestrator
# Consolidates: Venv, Health, MCPs, Tools, Debug, Cloudflare
# Entry point for all system operations

param(
    [ValidateSet('activate', 'health', 'mcp-audit', 'debug', 'tools-check')]
    [string]$Mode = 'activate'
)

$ErrorActionPreference = 'Continue'
$RepoRoot = Split-Path $PSScriptRoot -Parent
$VenvPath = "$RepoRoot\.venv"
$LogDir = "$RepoRoot\OPERATIONS\system-health-logs"
$DbgLog = "$LogDir\debug-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').log"

# Ensure log directory
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force >$null
}

function Write-Log {
    param([string]$Text, [string]$Level = 'info')
    $ts = Get-Date -Format 'HH:mm:ss'
    $colors = @{info='Cyan'; ok='Green'; warn='Yellow'; err='Red'; title='Magenta'; section='Yellow'}
    Write-Host "[$ts] [$Level] $Text" -ForegroundColor $colors[$Level]
    Add-Content -Path $DbgLog -Value "[$ts] [$Level] $Text"
}

function Banner {
    param([string]$Text, [string]$Type = 'title')
    Write-Host ""
    Write-Host "  ╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "  ║ $($Text.PadRight(66)) ║" -ForegroundColor Magenta
    Write-Host "  ╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
}

function Phase {
    param([string]$Name, [int]$Num)
    Write-Log "═══════════════════════════════════════ PHASE $($Num): $Name ═══════════════════════════════════════" 'section'
}

# =============================================================================
# SECTION A: ENVIRONMENT ACTIVATION
# =============================================================================

function Activate-VirtualEnv {
    Phase "VIRTUAL ENVIRONMENT" 1
    
    # Check Python
    try {
        $py = python --version 2>&1
        Write-Log "Python found: $py" 'ok'
    }
    catch {
        Write-Log "Python not found" 'err'
        return $false
    }
    
    # Create or verify venv
    if (-not (Test-Path "$VenvPath\Scripts\python.exe")) {
        Write-Log "Creating virtual environment..." 'warn'
        python -m venv $VenvPath
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Failed to create venv" 'err'
            return $false
        }
    }
    
    # Activate
    & "$VenvPath\Scripts\Activate.ps1"
    Write-Log "Virtual environment activated" 'ok'
    return $true
}

# =============================================================================
# SECTION B: HEALTH CHECKS
# =============================================================================

function Check-SystemHealth {
    Phase "SYSTEM HEALTH CHECKS" 2
    
    Push-Location $RepoRoot
    
    # Doctor check
    Write-Log "Running doctor diagnostic..." 'info'
    try {
        $doc = pwsh -File SCRIPTS/obi.ps1 doctor 2>&1 | ConvertFrom-Json
        if ($doc.email_match -and $doc.github_token) {
            Write-Log "Doctor: All credentials verified ✓" 'ok'
            $doc_ok = $true
        }
        else {
            Write-Log "Doctor: Missing credentials" 'warn'
            $doc_ok = $false
        }
    }
    catch {
        Write-Log "Doctor check failed: $_" 'err'
        $doc_ok = $false
    }
    
    # Verify build
    Write-Log "Running build verification..." 'info'
    try {
        $verify = pwsh -File SCRIPTS/obi.ps1 verify 2>&1 | Out-String
        if ($verify -match 'dry-run: exiting now') {
            Write-Log "Build: Verification passed ✓" 'ok'
            $verify_ok = $true
        }
        else {
            Write-Log "Build: Verification failed" 'warn'
            $verify_ok = $false
        }
    }
    catch {
        Write-Log "Build check failed: $_" 'err'
        $verify_ok = $false
    }
    
    # Git state
    Write-Log "Checking git state..." 'info'
    $branch = git branch --show-current
    $dirty = (git status --short 2>&1 | Measure-Object | Select-Object -ExpandProperty Count) -gt 0
    Write-Log "Git branch: $branch" 'ok'
    Write-Log "Git state: $(if ($dirty) { 'DIRTY' } else { 'CLEAN' })" $(if ($dirty) { 'warn' } else { 'ok' })
    
    Pop-Location
    
    return @{ doctor = $doc_ok; build = $verify_ok; git = -not $dirty }
}

# =============================================================================
# SECTION C: MCP CONNECTIONS
# =============================================================================

function Audit-MCPs {
    Phase "MCP CONNECTION AUDIT" 3
    
    $mcps = @{}
    
    # Cloudflare (Wrangler)
    Write-Log "Checking Cloudflare connection..." 'info'
    try {
        $cf = wrangler whoami 2>&1
        if ($cf -match 'email') {
            Write-Log "Cloudflare: Connected ✓" 'ok'
            $mcps['cloudflare'] = $true
        }
        else {
            Write-Log "Cloudflare: Not authenticated" 'warn'
            $mcps['cloudflare'] = $false
        }
    }
    catch {
        Write-Log "Cloudflare: Not installed or failed" 'warn'
        $mcps['cloudflare'] = $false
    }
    
    # GitHub
    Write-Log "Checking GitHub connection..." 'info'
    try {
        $gh = gh auth status 2>&1
        if ($gh -match 'Logged in') {
            Write-Log "GitHub: Authenticated ✓" 'ok'
            $mcps['github'] = $true
        }
        else {
            Write-Log "GitHub: Not authenticated" 'warn'
            $mcps['github'] = $false
        }
    }
    catch {
        Write-Log "GitHub: CLI not found" 'warn'
        $mcps['github'] = $false
    }
    
    # Notion — BLACKLISTED (future connections permanently disabled; legacy data preserved)
    Write-Log "Notion: BLACKLISTED — platform usage is permanently disabled" 'warn'
    $mcps['notion'] = 'BLACKLISTED'
    
    # Deepgram (Future)
    Write-Log "Deepgram: Not yet integrated (planned)" 'warn'
    $mcps['deepgram'] = $null
    
    # NotebookLM (Future)
    Write-Log "NotebookLM: Not yet integrated (planned)" 'warn'
    $mcps['notebooklm'] = $null
    
    # Stripe (Future)
    Write-Log "Stripe: Not yet integrated (planned)" 'warn'
    $mcps['stripe'] = $null
    
    return $mcps
}

# =============================================================================
# SECTION D: TOOL VERIFICATION
# =============================================================================

function Check-Tools {
    Phase "DEVELOPMENT TOOLS" 4
    
    $tools = @{}
    
    # GitKraken
    Write-Log "Checking GitKraken..." 'info'
    if (Get-Command gitkraken -ErrorAction SilentlyContinue) {
        Write-Log "GitKraken: Installed ✓" 'ok'
        $tools['gitkraken'] = $true
    }
    else {
        Write-Log "GitKraken: Not in PATH (https://www.gitkraken.com/)" 'warn'
        $tools['gitkraken'] = $false
    }
    
    # VS Code Extensions
    Write-Log "Checking VS Code extensions..." 'info'
    $exts = @(
        'GitHub.copilot'
        'eamodio.gitlens'
        'Axosoft.gitkraken-gitlens'
        'googlecloudtools.cloudcode'
    )
    foreach ($ext in $exts) {
        if (Get-Command code -ErrorAction SilentlyContinue) {
            $installed = code --list-extensions 2>$null | Select-String $ext
            if ($installed) {
                Write-Log "  ✓ $ext" 'ok'
                $tools[$ext] = $true
            }
            else {
                Write-Log "  ✗ $ext (install via: code --install-extension $ext)" 'warn'
                $tools[$ext] = $false
            }
        }
    }
    
    # Node.js
    Write-Log "Checking Node.js..." 'info'
    try {
        $node = node --version
        Write-Log "Node.js: $node ✓" 'ok'
        $tools['nodejs'] = $true
    }
    catch {
        Write-Log "Node.js: Not found" 'err'
        $tools['nodejs'] = $false
    }
    
    return $tools
}

# =============================================================================
# SECTION E: CLOUDFLARE GOD MODE
# =============================================================================

function Verify-GodMode {
    Phase "CLOUDFLARE GOD MODE VERIFICATION" 5
    
    Write-Log "Checking Cloudflare ultimate configuration..." 'info'
    
    Push-Location "$RepoRoot\APPS\NET-PET-AI"
    
    # Parse wrangler.toml
    $config = Get-Content wrangler.toml
    
    $has_dos = if ($config -match 'durable_objects') { $true } else { $false }
    $has_kv = if ($config -match '\[\[kv_namespaces') { $true } else { $false }
    $has_ai = if ($config -match '\[\[ai') { $true } else { $false }
    $has_workers_kv = if ($config -match 'workers_kv') { $true } else { $false }
    
    Write-Log "Durable Objects: $(if ($has_dos) { '✓' } else { '✗' })" $(if ($has_dos) { 'ok' } else { 'warn' })
    Write-Log "KV Namespaces: $(if ($has_kv) { '✓' } else { '✗' })" $(if ($has_kv) { 'ok' } else { 'warn' })
    Write-Log "AI Gateway: $(if ($has_ai) { '✓' } else { '✗' })" $(if ($has_ai) { 'ok' } else { 'warn' })
    Write-Log "Workers KV: $(if ($has_workers_kv) { '✓' } else { '✗' })" $(if ($has_workers_kv) { 'ok' } else { 'warn' })
    
    Pop-Location
    
    $allOk = $has_dos -and $has_kv
    return $allOk
}

# =============================================================================
# SECTION F: DEBUG PIPELINE
# =============================================================================

function Generate-DebugBundle {
    Phase "DEBUG DIAGNOSTIC BUNDLE" 6
    
    Write-Log "Generating comprehensive debug report..." 'info'
    Write-Log "Report file: $DbgLog" 'info'
    
    # Collect all info
    Add-Content -Path $DbgLog -Value ""
    Add-Content -Path $DbgLog -Value "╔════════════════════════════════════════════════╗"
    Add-Content -Path $DbgLog -Value "║        COMPREHENSIVE DEBUG REPORT              ║"
    Add-Content -Path $DbgLog -Value "║        Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss').     ║"
    Add-Content -Path $DbgLog -Value "╚════════════════════════════════════════════════╝"
    Add-Content -Path $DbgLog -Value ""
    
    # System info
    Add-Content -Path $DbgLog -Value "[SYSTEM INFO]"
    Add-Content -Path $DbgLog -Value "OS: $(Get-WmiObject -Class Win32_OperatingSystem | Select-Object -ExpandProperty Caption)"
    Add-Content -Path $DbgLog -Value "PowerShell: $($PSVersionTable.PSVersion)"
    Add-Content -Path $DbgLog -Value "Repo Root: $RepoRoot"
    Add-Content -Path $DbgLog -Value ""
    
    # Git info
    Add-Content -Path $DbgLog -Value "[GIT STATE]"
    Push-Location $RepoRoot
    Add-Content -Path $DbgLog -Value "Branch: $(git branch --show-current)"
    Add-Content -Path $DbgLog -Value "HEAD: $(git log --oneline -1)"
    Add-Content -Path $DbgLog -Value "Remote tracking:"
    Add-Content -Path $DbgLog -Value "$(git branch -vv)"
    Add-Content -Path $DbgLog -Value ""
    Pop-Location
    
    # Environment
    Add-Content -Path $DbgLog -Value "[ENVIRONMENT]"
    Add-Content -Path $DbgLog -Value "Python: $(python --version 2>&1)"
    Add-Content -Path $DbgLog -Value "Node: $(node --version 2>&1)"
    Add-Content -Path $DbgLog -Value "Git: $(git --version)"
    Add-Content -Path $DbgLog -Value ""
    
    Write-Log "Debug bundle generated: $DbgLog" 'ok'
}

# =============================================================================
# MAIN ENTRY POINTS
# =============================================================================

function Run-FullActivation {
    Banner "PHOENIX RISING PROTOCOL - GOD MODE ACTIVATION"
    
    # Activate venv
    if (-not (Activate-VirtualEnv)) {
        Write-Log "Failed to activate environment" 'err'
        exit 1
    }
    
    # Health checks
    $health = Check-SystemHealth
    
    # MCPs
    $mcps = Audit-MCPs
    
    # Tools
    $tools = Check-Tools
    
    # God Mode
    $godmode = Verify-GodMode
    
    # Summary
    Banner "OPERATIONAL STATUS"
    Write-Log "Doctor: $(if ($health.doctor) { '✓ PASS' } else { '✗ FAIL' })" $(if ($health.doctor) { 'ok' } else { 'err' })
    Write-Log "Build: $(if ($health.build) { '✓ PASS' } else { '✗ FAIL' })" $(if ($health.build) { 'ok' } else { 'err' })
    Write-Log "Git: $(if ($health.git) { '✓ CLEAN' } else { '⚠ DIRTY' })" $(if ($health.git) { 'ok' } else { 'warn' })
    Write-Log "Cloudflare: $(if ($godmode) { '✓ GOD MODE' } else { '✗ LIMITED' })" $(if ($godmode) { 'ok' } else { 'warn' })
    Write-Log "MCP Ready: $($mcps.Values | Where-Object {$_ -eq $true} | Measure-Object | Select-Object -ExpandProperty Count)/6"
    
    Banner "READY FOR OPERATIONS"
    Write-Host ""
}

function Run-HealthCheck {
    Write-Log "Quick health diagnostic..." 'info'
    $h = Check-SystemHealth
    Write-Log "Status: $(if ($h.doctor -and $h.build) { 'HEALTHY' } else { 'ISSUES DETECTED' })" $(if ($h.doctor -and $h.build) { 'ok' } else { 'warn' })
}

function Run-MCPAudit {
    Write-Log "MCP audit..." 'info'
    $mcps = Audit-MCPs
    $mcps | Format-Table -AutoSize
}

function Run-DebugMode {
    Generate-DebugBundle
    Write-Log "Debug mode activated - full diagnostics collected" 'ok'
}

function Run-ToolsCheck {
    Write-Log "Tool availability check..." 'info'
    Check-Tools | Format-Table -AutoSize
}

# =============================================================================
# EXECUTE
# =============================================================================

switch ($Mode) {
    'activate' { Run-FullActivation }
    'health' { Run-HealthCheck }
    'mcp-audit' { Run-MCPAudit }
    'debug' { Run-DebugMode }
    'tools-check' { Run-ToolsCheck }
}

Write-Host ""
