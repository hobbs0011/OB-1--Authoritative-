# DISCOVERY LANE — Pre-Session Audit
# Purpose: Automatic audit on cold-start (RUN363 Upgrade #U1, #U9, #U10)
# Returns: DISCOVERY-REPORT-{timestamp}.json cached in session

param(
    [string]$ReportPath = "$PSScriptRoot\..\CANON\AUDIT",
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$reportFile = "$ReportPath\DISCOVERY-REPORT-$timestamp.json"

# Ensure output directory exists
if (-not (Test-Path $ReportPath)) {
    New-Item -ItemType Directory -Path $ReportPath -Force | Out-Null
}

Write-Host "🔍 DISCOVERY LANE — Pre-Session Audit Started" -ForegroundColor Cyan
Write-Host "Report: $reportFile`n" -ForegroundColor Gray

# ============================================================================
# PARALLEL TASK 1: GIT STATUS AUDIT
# ============================================================================
$gitAudit = @{
    timestamp = [datetime]::UtcNow.ToString("o")
    branch = $null
    head = $null
    upstream = $null
    dirty_files = 0
    untracked_files = 0
    is_clean = $false
    error = $null
}

try {
    Push-Location "$PSScriptRoot\..\.."
    
    $gitAudit.branch = git rev-parse --abbrev-ref HEAD
    $gitAudit.head = git rev-parse --short HEAD
    
    $upstreamBranch = git rev-parse --abbrev-ref @{u} 2>$null
    if ($LASTEXITCODE -eq 0) {
        $gitAudit.upstream = $upstreamBranch
    }
    
    $status = git status --short
    $gitAudit.dirty_files = @($status | Where-Object { $_ -notmatch '^\?\?' }).Count
    $gitAudit.untracked_files = @($status | Where-Object { $_ -match '^\?\?' }).Count
    $gitAudit.is_clean = ($gitAudit.dirty_files -eq 0 -and $gitAudit.untracked_files -eq 0)
    
    Pop-Location
} catch {
    $gitAudit.error = $_.Exception.Message
}

# ============================================================================
# PARALLEL TASK 2: MCP HEALTH CHECK
# ============================================================================
$mcpAudit = @{
    timestamp = [datetime]::UtcNow.ToString("o")
    agents_found = 0
    agents = @()
    error = $null
}

try {
    $kiloAgents = Get-ChildItem "$PSScriptRoot\..\.kilo\agent\*.md" -ErrorAction SilentlyContinue
    $githubAgents = Get-ChildItem "$PSScriptRoot\..\.github\agents\*.md" -ErrorAction SilentlyContinue
    
    foreach ($agent in (@($kiloAgents) + @($githubAgents))) {
        $agentData = @{
            name = $agent.BaseName
            path = $agent.FullName
            size_bytes = $agent.Length
            modified = $agent.LastWriteTime.ToString("o")
            status = "VALID"
        }
        
        # Quick validation: check if file contains frontmatter
        $content = Get-Content $agent.FullName -Raw
        if (-not ($content -match '^---')) {
            $agentData.status = "INVALID_NO_FRONTMATTER"
        }
        
        $mcpAudit.agents += $agentData
    }
    
    $mcpAudit.agents_found = $mcpAudit.agents.Count
} catch {
    $mcpAudit.error = $_.Exception.Message
}

# ============================================================================
# PARALLEL TASK 3: FILE SCHEMA VALIDATION
# ============================================================================
$schemaAudit = @{
    timestamp = [datetime]::UtcNow.ToString("o")
    critical_files = @()
    error = $null
}

$criticalFiles = @(
    "MASTER-SYNC.md",
    "APPS\NET-PET-AI\wrangler.toml",
    "APPS\NET-PET-AI\package.json",
    "CANON\KEYWORDS\PHASE-10-CANONICAL.json"
)

try {
    foreach ($file in $criticalFiles) {
        $filePath = "$PSScriptRoot\..\..\$file"
        if (Test-Path $filePath) {
            $fileInfo = Get-Item $filePath
            $fileData = @{
                name = $file
                exists = $true
                size_bytes = $fileInfo.Length
                modified = $fileInfo.LastWriteTime.ToString("o")
                is_readable = $true
                validation = "PASS"
            }
            
            # Quick JSON validation
            if ($file -match '\.json$') {
                try {
                    $null = Get-Content $filePath -Raw | ConvertFrom-Json
                } catch {
                    $fileData.validation = "JSON_INVALID"
                }
            }
            
            $schemaAudit.critical_files += $fileData
        } else {
            $schemaAudit.critical_files += @{
                name = $file
                exists = $false
                validation = "MISSING"
            }
        }
    }
} catch {
    $schemaAudit.error = $_.Exception.Message
}

# ============================================================================
# PARALLEL TASK 4: SECRETS AUDIT
# ============================================================================
$secretsAudit = @{
    timestamp = [datetime]::UtcNow.ToString("o")
    wrangler_secrets = @()
    error = $null
}

try {
    Push-Location "$PSScriptRoot\..\..\APPS\NET-PET-AI"
    
    # Try to list secrets (this may fail if user not authenticated)
    try {
        $secrets = wrangler secret list --json 2>$null | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($secrets) {
            foreach ($secret in $secrets) {
                $secretsAudit.wrangler_secrets += @{
                    name = $secret.name
                    status = "EXISTS"
                }
            }
        }
    } catch {
        $secretsAudit.wrangler_note = "Could not query wrangler secrets (may require auth)"
    }
    
    Pop-Location
} catch {
    $secretsAudit.error = $_.Exception.Message
}

# ============================================================================
# PARALLEL TASK 5: KEYWORD INDEX VALIDATION
# ============================================================================
$keywordAudit = @{
    timestamp = [datetime]::UtcNow.ToString("o")
    phases_found = @()
    merkle_root = $null
    error = $null
}

try {
    $phasePath = "$PSScriptRoot\..\..\CANON\KEYWORDS"
    
    $phaseFiles = Get-ChildItem "$phasePath\PHASE-*.json" -ErrorAction SilentlyContinue
    foreach ($phase in $phaseFiles) {
        $phaseNum = [regex]::Match($phase.Name, 'PHASE-(\d+)').Groups[1].Value
        $phaseData = @{
            phase = $phaseNum
            file = $phase.Name
            size_bytes = $phase.Length
            modified = $phase.LastWriteTime.ToString("o")
        }
        
        $keywordAudit.phases_found += $phaseData
    }
    
    # Get merkle root from Phase 10
    $phase10File = "$phasePath\PHASE-10-CANONICAL.json"
    if (Test-Path $phase10File) {
        $phase10 = Get-Content $phase10File -Raw | ConvertFrom-Json
        $keywordAudit.merkle_root = $phase10.canonical_seal
    }
} catch {
    $keywordAudit.error = $_.Exception.Message
}

# ============================================================================
# COMPILE DISCOVERY REPORT
# ============================================================================
$discoveryReport = @{
    run = "RUN363"
    timestamp = [datetime]::UtcNow.ToString("o")
    session_duration = "0m" # Will be updated at session end
    lanes = @{
        discovery = @{
            status = "COMPLETE"
            execution_time_ms = [int]((Get-Date) - [datetime]::UtcNow).TotalMilliseconds
        }
    }
    audits = @{
        git = $gitAudit
        mcp = $mcpAudit
        schema = $schemaAudit
        secrets = $secretsAudit
        keywords = $keywordAudit
    }
}

# ============================================================================
# COMPUTE HEALTH SCORE
# ============================================================================
$healthScore = 100

# Git penalties
if (-not $gitAudit.is_clean) {
    $healthScore -= [int]($gitAudit.dirty_files * 2 + $gitAudit.untracked_files)
    if ($healthScore -lt 0) { $healthScore = 0 }
}

# MCP penalties
$invalidAgents = @($mcpAudit.agents | Where-Object { $_.status -ne "VALID" }).Count
$healthScore -= ($invalidAgents * 5)

# Schema penalties
$missingCritical = @($schemaAudit.critical_files | Where-Object { $_.exists -eq $false }).Count
$healthScore -= ($missingCritical * 10)

$invalidJson = @($schemaAudit.critical_files | Where-Object { $_.validation -ne "PASS" }).Count
$healthScore -= ($invalidJson * 15)

if ($healthScore -lt 0) { $healthScore = 0 }

$discoveryReport.health_score = [int]$healthScore

# ============================================================================
# OUTPUT AND CACHE
# ============================================================================
$discoveryReport | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportFile -Encoding UTF8

Write-Host "✅ Discovery Report Written" -ForegroundColor Green
Write-Host "   Path: $reportFile"
Write-Host "   Health Score: $($discoveryReport.health_score)/100"
Write-Host "   Git Status: $(if ($gitAudit.is_clean) { '✅ CLEAN' } else { "⚠️  DIRTY ($($gitAudit.dirty_files) files)" })"
Write-Host "   MCP Agents: $($mcpAudit.agents_found) found"
Write-Host "   Keyword Phases: $($keywordAudit.phases_found.Count) indexed"
Write-Host ""

# Gate logic
if ($discoveryReport.health_score -lt 50) {
    Write-Host "⚠️  WARNING: Health score below 50. Review above details before proceeding." -ForegroundColor Yellow
} else {
    Write-Host "🚀 Pre-session audit PASSED. Safe to proceed with work." -ForegroundColor Green
}

return $discoveryReport
