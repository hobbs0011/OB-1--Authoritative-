# QUALITY SCORE AUTOMATION — Batch Confidence Scoring
# Purpose: Compute confidence score per batch (RUN363 Upgrade #U11)
# Formula: (validation_pass% × 0.4) + (output_quality × 0.5) + (integrity_check × 0.1)
# Returns: Score 0-100; gates release at >95%

param(
    [string]$BatchId = "B1",
    [int]$ValidationPassRate = 100,        # 0-100: % of validations that passed
    [hashtable]$OutputMetrics = @{},       # Metrics from execution
    [switch]$Verbose = $false
)

function Get-OutputQualityScore {
    param([hashtable]$Metrics)
    
    # Base: 100 points
    $score = 100
    
    # Deductions
    if ($Metrics.syntax_errors -gt 0) { $score -= ($Metrics.syntax_errors * 5) }
    if ($Metrics.lint_warnings -gt 0) { $score -= ($Metrics.lint_warnings * 2) }
    if ($Metrics.test_failures -gt 0) { $score -= ($Metrics.test_failures * 10) }
    if ($Metrics.drift_detected) { $score -= 15 }
    if ($Metrics.uncommitted_changes -gt 0) { $score -= ($Metrics.uncommitted_changes * 1) }
    
    # Bonuses
    if ($Metrics.test_pass_rate -eq 100) { $score += 5 }
    if ($Metrics.coverage_percent -gt 80) { $score += 3 }
    
    return [Math]::Max(0, $score)
}

function Get-IntegrityCheckScore {
    param([hashtable]$Metrics)
    
    # Base: 100 points
    $score = 100
    
    # Deductions
    if ($Metrics.git_conflicts -gt 0) { $score -= ($Metrics.git_conflicts * 25) }
    if ($Metrics.unstaged_changes -gt 0) { $score -= ($Metrics.unstaged_changes * 3) }
    if ($Metrics.merkle_drift) { $score -= 50 }
    if (-not $Metrics.crypto_verified) { $score -= 25 }
    
    return [Math]::Max(0, $score)
}

# ============================================================================
# COMPUTE COMPONENT SCORES
# ============================================================================
$validationScore = $ValidationPassRate  # Direct pass-through
$outputScore = Get-OutputQualityScore -Metrics $OutputMetrics
$integrityScore = Get-IntegrityCheckScore -Metrics $OutputMetrics

# ============================================================================
# WEIGHTED CONFIDENCE SCORE
# ============================================================================
$confidenceScore = [int](
    ($validationScore * 0.4) +
    ($outputScore * 0.5) +
    ($integrityScore * 0.1)
)

# Cap at 100
if ($confidenceScore -gt 100) { $confidenceScore = 100 }

# ============================================================================
# SCORING DETAIL
# ============================================================================
$scoreDetail = @{
    batch_id = $BatchId
    timestamp = [datetime]::UtcNow.ToString("o")
    confidence_score = $confidenceScore
    components = @{
        validation = $validationScore
        output_quality = $outputScore
        integrity = $integrityScore
    }
    weights = @{
        validation = 0.4
        output = 0.5
        integrity = 0.1
    }
    pass_gate = $confidenceScore -gt 95
    action = if ($confidenceScore -gt 95) { "AUTO_COMMIT" } elseif ($confidenceScore -gt 80) { "REVIEW_REQUIRED" } else { "ROLLBACK_RECOMMENDED" }
}

# ============================================================================
# REPORTING
# ============================================================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  QUALITY SCORE — Batch $BatchId" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Confidence Score:  $confidenceScore/100" -ForegroundColor $(if ($confidenceScore -gt 95) { "Green" } else { "Yellow" })
Write-Host "    Validation:      $validationScore/100 (40% weight)"
Write-Host "    Output Quality:  $outputScore/100 (50% weight)"
Write-Host "    Integrity:       $integrityScore/100 (10% weight)"
Write-Host ""
Write-Host "  Decision Gate:     $(if ($scoreDetail.pass_gate) { "✅ PASS — SAFE TO COMMIT" } else { "⚠️  HOLD — REVIEW REQUIRED" })" -ForegroundColor $(if ($scoreDetail.pass_gate) { "Green" } else { "Yellow" })
Write-Host "  Recommended:       $($scoreDetail.action)"
Write-Host ""

if ($Verbose) {
    Write-Host "Detailed Metrics:" -ForegroundColor Gray
    $OutputMetrics | Format-Table -AutoSize
}

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

return $scoreDetail
