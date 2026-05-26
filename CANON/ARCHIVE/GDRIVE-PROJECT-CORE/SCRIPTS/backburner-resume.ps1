# U15: Backburner Resume Automation
# Purpose: Surface deferred items on session boot, check OPERATIONS/BACKBURNER-PIPELINE-LOG.md

function Resume-BackburnerItems {
    param(
        [string]$BackburnerPath = "$PSScriptRoot\..\OPERATIONS\BACKBURNER-PIPELINE-LOG.md"
    )
    
    Write-Host ""
    Write-Host "📦 BACKBURNER RESUME (U15)" -ForegroundColor Cyan
    
    if (-not (Test-Path $BackburnerPath)) {
        Write-Host "   ✅ No backburner items found (clean start)"
        return @()
    }
    
    Write-Host "   📖 Reading: $BackburnerPath" -ForegroundColor Gray
    
    $content = Get-Content $BackburnerPath -Raw
    
    # Parse deferred items (markdown format)
    # Example: "## DEFERRED\n- [ ] Item 1 (priority: P1)\n- [x] Item 2"
    $lines = $content -split "`n"
    $deferred = @()
    $inDeferredSection = $false
    
    foreach ($line in $lines) {
        if ($line -match "## DEFERRED") {
            $inDeferredSection = $true
            continue
        }
        
        if ($inDeferredSection -and $line -match "^- \[ \]") {
            # Unchecked item
            $item = $line -replace "^- \[ \] ", ""
            $deferred += $item
        }
        
        if ($inDeferredSection -and $line -match "^##" -and -not ($line -match "## DEFERRED")) {
            # End of deferred section
            $inDeferredSection = $false
        }
    }
    
    if ($deferred.Count -eq 0) {
        Write-Host "   ✅ No open deferred items"
        return @()
    }
    
    Write-Host "   ⚠️  Found $($deferred.Count) deferred item(s):" -ForegroundColor Yellow
    $deferred | ForEach-Object { Write-Host "      · $_" -ForegroundColor Yellow }
    
    Write-Host ""
    Write-Host "   💡 RECOMMENDATION: Review and prioritize these items before starting new work"
    Write-Host ""
    
    return $deferred
}

# Invoke on session boot
Resume-BackburnerItems
