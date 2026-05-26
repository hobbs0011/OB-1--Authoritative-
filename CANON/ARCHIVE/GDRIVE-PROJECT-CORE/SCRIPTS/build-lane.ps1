# BUILD LANE — In-Session Active Work Automation
# Purpose: Batch execution → scoring → validation → auto-commit (U12 micro-commit triggers)
# Invoke after each work batch to evaluate, score, and publish

param(
    [string]$BatchId = "B2",
    [ValidateSet("PENDING", "IN_PROGRESS", "COMPLETE", "FAILED")][string]$Status = "COMPLETE",
    [int]$FilesChanged = 0,
    [int]$LinesAdded = 0,
    [hashtable]$ValidationResults = @{},
    [switch]$AutoCommit = $true,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  BUILD LANE — Batch $BatchId Evaluation & Commit" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

# ============================================================================
# STAGE 1: VALIDATION ASSESSMENT
# ============================================================================
Write-Host "📍 STAGE 1: Validation Assessment" -ForegroundColor Cyan

$validationPass = 100
$validationIssues = @()

if ($ValidationResults.syntax_errors -gt 0) {
    $validationPass -= ($ValidationResults.syntax_errors * 5)
    $validationIssues += "Syntax errors: $($ValidationResults.syntax_errors)"
}

if ($ValidationResults.test_failures -gt 0) {
    $validationPass -= ($ValidationResults.test_failures * 10)
    $validationIssues += "Test failures: $($ValidationResults.test_failures)"
}

if ($ValidationResults.lint_warnings -gt 0) {
    $validationPass -= ($ValidationResults.lint_warnings * 2)
    $validationIssues += "Lint warnings: $($ValidationResults.lint_warnings)"
}

if ($validationIssues.Count -eq 0) {
    Write-Host "  ✅ All validations passed"
} else {
    Write-Host "  ⚠️  Issues found:"
    foreach ($issue in $validationIssues) {
        Write-Host "     - $issue"
    }
}

# ============================================================================
# STAGE 2: QUALITY SCORE COMPUTATION
# ============================================================================
Write-Host ""
Write-Host "📍 STAGE 2: Quality Score Computation" -ForegroundColor Cyan

# Invoke quality-score script
$scoreResult = & "$PSScriptRoot\quality-score.ps1" `
    -BatchId $BatchId `
    -ValidationPassRate $validationPass `
    -OutputMetrics $ValidationResults `
    -Verbose:$Verbose

$confidenceScore = $scoreResult.confidence_score
$autoCommitGate = $scoreResult.pass_gate

# ============================================================================
# STAGE 3: GIT STAGING & SUMMARY
# ============================================================================
Write-Host ""
Write-Host "📍 STAGE 3: Change Summary" -ForegroundColor Cyan

Push-Location "$PSScriptRoot\..\.."

$gitStatus = git status --short
$stagedCount = @($gitStatus | Where-Object { $_ -match "^[MADR]" }).Count
$unstagedCount = @($gitStatus | Where-Object { $_ -match "^ [MADR]" }).Count

Write-Host "  Files changed: $FilesChanged"
Write-Host "  Lines added: $LinesAdded"
Write-Host "  Staged changes: $stagedCount"
Write-Host "  Unstaged changes: $unstagedCount"
Write-Host ""
Write-Host "  Confidence Score: $confidenceScore/100"
Write-Host "  Gate Status: $(if ($autoCommitGate) { "✅ PASS (>95%)" } else { "⚠️  HOLD (<95%)" })"

# ============================================================================
# STAGE 4: AUTO-COMMIT DECISION
# ============================================================================
Write-Host ""
Write-Host "📍 STAGE 4: Auto-Commit Decision" -ForegroundColor Cyan

$commitMessage = "feat: $BatchId - $(($scoreResult.action).Replace('_', ' ').ToLower()) [Q:$confidenceScore%]"

if ($autoCommitGate -and $AutoCommit) {
    Write-Host "  🚀 Quality gate PASSED. Auto-committing..."
    Write-Host "     Message: $commitMessage"
    
    try {
        git add -A
        git commit -m $commitMessage
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Commit successful"
            Write-Host "     Hash: $(git rev-parse --short HEAD)"
        } else {
            Write-Host "  ⚠️  Commit failed (exit code $LASTEXITCODE)"
        }
    } catch {
        Write-Host "  ❌ Git error: $($_.Exception.Message)"
    }
} elseif (-not $autoCommitGate) {
    Write-Host "  ⏸️  Quality gate FAILED (score $confidenceScore < 95)"
    Write-Host "     Action: Manual review required before committing"
    Write-Host "     Fix issues and retry"
} else {
    Write-Host "  ⏸️  Auto-commit disabled"
    Write-Host "     Message ready: $commitMessage"
    Write-Host "     Run: git add -A; git commit -m '...'"
}

Pop-Location

# ============================================================================
# RETURN SUMMARY
# ============================================================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  BUILD LANE COMPLETE — Batch $BatchId" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

return @{
    batch_id = $BatchId
    timestamp = $timestamp
    validation_pass = $validationPass
    confidence_score = $confidenceScore
    auto_commit_gate = $autoCommitGate
    committed = $autoCommitGate -and $AutoCommit
    message = $commitMessage
}
