# PIPELINE HEALTH CHECK — Run BEFORE any session processing
# Invoke: powershell -File CANON/SCRIPTS/pipeline-health-check.ps1
# FAIL = DO NOT PROCEED until resolved.

param([switch]$AutoFix)

$ErrorActionPreference = 'Continue'
$nl = [Environment]::NewLine
$failCount = 0
$warnCount = 0

function Write-Fail($msg) { Write-Host "FAIL: $msg" -ForegroundColor Red; $script:failCount++ }
function Write-Warn($msg) { Write-Host "WARN: $msg" -ForegroundColor Yellow; $script:warnCount++ }
function Write-Pass($msg) { Write-Host "PASS: $msg" -ForegroundColor Green }

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "PIPELINE HEALTH CHECK" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "=" * 60 -ForegroundColor Cyan

# H1 — Git HEAD clean
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Pass "Git working tree clean"
} else {
    Write-Warn "Working tree has $($status -split $nl | Measure-Object | Select-Object -ExpandProperty Count) dirty files"
}

# H2 — Required directories
$dirs = @("CANON/SOUL-KEYWORDS", "CANON/LOSTSOULS", "CANON/REINCARNATION", "I-LOG-UNAUDITED", "I-LOG-NAV")
foreach ($d in $dirs) {
    if (Test-Path $d) { Write-Pass "Directory exists: $d" }
    else { Write-Fail "Directory missing: $d" }
}

# H3 — Essential scripts exist
$scripts = @(
    "CANON/SCRIPTS/rrl-colorize.ps1",
    "CANON/SCRIPTS/extract-keywords.ps1",
    "CANON/SCRIPTS/extract-lostsouls.ps1",
    "CANON/SCRIPTS/update-inverted-index.ps1",
    "CANON/SCRIPTS/workhorse-pipeline.ps1"
)
foreach ($s in $scripts) {
    if (Test-Path $s) { Write-Pass "Script: $s" }
    else { Write-Fail "Script missing: $s" }
}

# H4 — Inverted index valid
$idxPath = "CANON/SOUL-KEYWORDS/inverted-index.json"
if (Test-Path $idxPath) {
    try {
        $idx = Get-Content $idxPath -Raw | ConvertFrom-Json
        $count = 0; foreach ($p in $idx.PSObject.Properties) { $count++ }
        if ($count -ge 10) { Write-Pass "Inverted index: $count keywords" }
        else { Write-Warn "Inverted index only has $count keywords" }
    } catch {
        Write-Fail "Inverted index is invalid JSON: $_"
    }
}

# H5 — Audit file exists
if (Test-Path "CANON/REINCARNATION/audit-sessions1-4.json") {
    Write-Pass "Audit file exists"
} else {
    Write-Fail "Audit file missing"
}

# H6 — Session name map valid
if (Test-Path "CANON/REINCARNATION/session-name-map.json") {
    try {
        $map = Get-Content "CANON/REINCARNATION/session-name-map.json" -Raw | ConvertFrom-Json
        Write-Pass "Session name map: $(($map.PSObject.Properties | Measure-Object).Count) entries"
    } catch {
        Write-Fail "Session name map invalid: $_"
    }
}

# H7 — HEAD commit reference
$head = git log --oneline -1 2>$null
if ($head) {
    Write-Pass "HEAD: $head"
} else {
    Write-Fail "Cannot read HEAD"
}

# H8 — I-LOG-NAV has promoted sessions
$navFiles = Get-ChildItem "I-LOG-NAV" -ErrorAction SilentlyContinue
if ($navFiles.Count -ge 3) { Write-Pass "I-LOG-NAV: $($navFiles.Count) promoted artifacts" }
else { Write-Warn "I-LOG-NAV: $($navFiles.Count) artifacts (expected 3+ promoted sessions)" }

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
if ($failCount -eq 0 -and $warnCount -eq 0) {
    Write-Host "HEALTH: ALL PASS — Pipeline ready" -ForegroundColor Green
} elseif ($failCount -eq 0 -and $warnCount -gt 0) {
    Write-Host "HEALTH: $warnCount warnings — Proceed with caution" -ForegroundColor Yellow
} else {
    Write-Host "HEALTH: $failCount FAILURES — Do NOT proceed until resolved" -ForegroundColor Red
}
Write-Host "=" * 60 -ForegroundColor Cyan

if ($AutoFix) {
    Write-Host "`nAuto-fix mode enabled. Fixing critical issues..." -ForegroundColor Magenta
    if (-not (Test-Path "I-LOG-NAV")) { New-Item -ItemType Directory -Path "I-LOG-NAV" -Force | Out-Null }
    Write-Host "Auto-fix complete." -ForegroundColor Green
}