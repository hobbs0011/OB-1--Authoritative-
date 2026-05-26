# Reincarnation DEATH Pre-Check — Operational Audit
# Verifies session is ready for reincarnation with hardening clamps
# Non-reversible: all clamps must pass before proceeding
# Called: /reincarnationdeath from Kilo

param(
    [string]$SessionTag = (Get-Date -Format "yyyyMMdd-HHmmss"),
    [switch]$Verify = $false
)

$ErrorActionPreference = "Stop"
$WorkingDir = "d:\OB-1"
Set-Location $WorkingDir

Write-Host "🔐 REINCARNATION DEATH CHECKLIST — Pre-Flight Audit" -ForegroundColor Cyan
Write-Host "Session Tag: $SessionTag" -ForegroundColor Gray
Write-Host ""

# Track clamp results
$clamps_passed = @()
$clamps_failed = @()

# ============================================================================
# CLAMP 1: Session Context Authenticity (Prompts Logged)
# ============================================================================
Write-Host "▶ CLAMP 1: Session prompts logged to tracker..." -ForegroundColor Yellow

try {
    $tracker_file = "CANON/SOUL-DNA/PROMPT-TRACKER.json"
    if (-not (Test-Path $tracker_file)) {
        throw "Tracker file not found: $tracker_file"
    }
    
    $tracker = Get-Content $tracker_file | ConvertFrom-Json
    $current_run = $tracker.PSObject.Properties.Name | Select-Object -Last 1
    
    if (-not $current_run) {
        throw "No run entries in tracker"
    }
    
    $prompts = $tracker.$current_run.prompts
    if ($prompts.Count -lt 1) {
        throw "No prompts logged for current run"
    }
    
    Write-Host "   ✓ Tracker exists with $($prompts.Count) prompts" -ForegroundColor Green
    $clamps_passed += "CLAMP-1-PROMPTS"
}
catch {
    Write-Host "   ✗ CLAMP 1 FAILED: $_" -ForegroundColor Red
    $clamps_failed += "CLAMP-1-PROMPTS"
}

# ============================================================================
# CLAMP 2: Soul DNA Extraction (Raw Quotes)
# ============================================================================
Write-Host "▶ CLAMP 2: Raw quotes extraction..." -ForegroundColor Yellow

try {
    $leggierarchive = Get-ChildItem "CANON/HEAVY-LEDGER" -Filter "*-heavy-ledger.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
    if (-not $leggierarchive) {
        throw "No Heavy Ledger found (quotes not extracted yet)"
    }
    
    $ledger = Get-Content $leggierarchive.FullName | ConvertFrom-Json
    if (-not $ledger.findings -or $ledger.findings.Count -lt 2) {
        throw "Insufficient findings in ledger (need ≥ 2)"
    }
    
    Write-Host "   ✓ Heavy Ledger exists with $($ledger.findings.Count) findings" -ForegroundColor Green
    $clamps_passed += "CLAMP-2-QUOTES"
}
catch {
    Write-Host "   ✗ CLAMP 2 FAILED: $_" -ForegroundColor Red
    $clamps_failed += "CLAMP-2-QUOTES"
}

# ============================================================================
# CLAMP 3: Decisions Are Locked
# ============================================================================
Write-Host "▶ CLAMP 3: Decisions locked..." -ForegroundColor Yellow

try {
    if ($ledger.decisions -and $ledger.decisions.Count -ge 2) {
        Write-Host "   ✓ $($ledger.decisions.Count) decisions documented" -ForegroundColor Green
        $clamps_passed += "CLAMP-3-DECISIONS"
    }
    else {
        throw "Insufficient decisions (need ≥ 2, got $($ledger.decisions.Count ?? 0))"
    }
}
catch {
    Write-Host "   ✗ CLAMP 3 FAILED: $_" -ForegroundColor Red
    $clamps_failed += "CLAMP-3-DECISIONS"
}

# ============================================================================
# CLAMP 4: Open Loops Are Explicit
# ============================================================================
Write-Host "▶ CLAMP 4: Open loops explicit..." -ForegroundColor Yellow

try {
    $starmap = Get-ChildItem "CANON/STARMAP" -Filter "*-starmap.md" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
    if (-not $starmap) {
        throw "No Starmap found (open loops not documented)"
    }
    
    $content = Get-Content $starmap.FullName -Raw
    if ($content -match "TODO:|HANDOFF:|ESCALATION:") {
        Write-Host "   ✓ Starmap contains explicit handoff instructions" -ForegroundColor Green
        $clamps_passed += "CLAMP-4-LOOPS"
    }
    else {
        throw "Starmap missing explicit handoff sections"
    }
}
catch {
    Write-Host "   ✗ CLAMP 4 FAILED: $_" -ForegroundColor Red
    $clamps_failed += "CLAMP-4-LOOPS"
}

# ============================================================================
# CLAMP 5: Git State Is Clean
# ============================================================================
Write-Host "▶ CLAMP 5: Git state clean..." -ForegroundColor Yellow

try {
    $status = & git status --porcelain
    $unpushed = & git log origin/canon..canon --oneline 2>$null
    
    if ($status) {
        throw "Working tree is dirty. Uncommitted files: `n$status"
    }
    
    if ($unpushed) {
        throw "Unpushed commits exist. Push before reincarnation."
    }
    
    Write-Host "   ✓ Git is clean (working tree and pushed)" -ForegroundColor Green
    $clamps_passed += "CLAMP-5-GIT"
}
catch {
    Write-Host "   ✗ CLAMP 5 FAILED: $_" -ForegroundColor Red
    $clamps_failed += "CLAMP-5-GIT"
}

# ============================================================================
# CLAMP 6: Heavy Ledger Is Valid JSON
# ============================================================================
Write-Host "▶ CLAMP 6: Heavy Ledger validity..." -ForegroundColor Yellow

try {
    if (-not $ledger) {
        throw "Ledger not loaded"
    }
    
    if (-not $ledger.hl_id) {
        throw "Ledger missing hl_id"
    }
    
    Write-Host "   ✓ Heavy Ledger is valid: $($ledger.hl_id)" -ForegroundColor Green
    $clamps_passed += "CLAMP-6-LEDGER"
}
catch {
    Write-Host "   ✗ CLAMP 6 FAILED: $_" -ForegroundColor Red
    $clamps_failed += "CLAMP-6-LEDGER"
}

# ============================================================================
# FINAL VERDICT
# ============================================================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "CLAMPS PASSED: $($clamps_passed.Count)/6" -ForegroundColor Green
Write-Host "CLAMPS FAILED: $($clamps_failed.Count)/6" -ForegroundColor Red

if ($clamps_failed.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ REINCARNATION BLOCKED" -ForegroundColor Red
    Write-Host "Failed clamps:" -ForegroundColor Red
    $clamps_failed | ForEach-Object { Write-Host "  • $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "Fix all failed clamps before calling /reincarnationrise" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ ALL CLAMPS PASSED — Ready for reincarnation" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Call /reincarnationrise to audit and lock new session" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

exit 0
