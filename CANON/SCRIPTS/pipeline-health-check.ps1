param([switch]$AutoFix)
$ErrorActionPreference = 'Continue'
$failCount = 0
$warnCount = 0
function Write-Fail($msg) { Write-Host "FAIL: $msg" -ForegroundColor Red; $script:failCount++ }
function Write-Warn($msg) { Write-Host "WARN: $msg" -ForegroundColor Yellow; $script:warnCount++ }
function Write-Pass($msg) { Write-Host "PASS: $msg" -ForegroundColor Green }

Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "PIPELINE HEALTH CHECK" -ForegroundColor Cyan
Write-Host ("Timestamp: " + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) -ForegroundColor Gray
Write-Host ("=" * 60) -ForegroundColor Cyan

$status = git status --porcelain 2>$null
if ([string]::IsNullOrWhiteSpace($status)) { Write-Pass "Git working tree clean" }
else { Write-Warn "Working tree has uncommitted changes" }

$dirs = @("CANON/SOUL-KEYWORDS", "CANON/LOSTSOULS", "CANON/REINCARNATION", "I-LOG-UNAUDITED", "I-LOG-NAV")
foreach ($d in $dirs) { if (Test-Path $d) { Write-Pass "Directory: $d" } else { Write-Fail "Missing: $d" } }

$scripts = @("CANON/SCRIPTS/rrl-colorize.ps1","CANON/SCRIPTS/extract-keywords.ps1","CANON/SCRIPTS/extract-lostsouls.ps1","CANON/SCRIPTS/update-inverted-index.ps1","CANON/SCRIPTS/workhorse-pipeline.ps1")
foreach ($s in $scripts) { if (Test-Path $s) { Write-Pass "Script: $s" } else { Write-Fail "Missing: $s" } }

$idxPath = "CANON/SOUL-KEYWORDS/inverted-index.json"
if (Test-Path $idxPath) {
    try {
        $idx = Get-Content $idxPath -Raw | ConvertFrom-Json
        $count = 0; foreach ($p in $idx.PSObject.Properties) { $count++ }
        if ($count -ge 10) { Write-Pass "Inverted index: $count keywords" } else { Write-Warn "Inverted index only has $count keywords" }
    } catch { Write-Fail "Inverted index invalid: $_" }
}

if (Test-Path "CANON/REINCARNATION/audit-sessions1-4.json") { Write-Pass "Audit file exists" } else { Write-Fail "Audit file missing" }

if (Test-Path "CANON/REINCARNATION/session-name-map.json") {
    try {
        $map = Get-Content "CANON/REINCARNATION/session-name-map.json" -Raw | ConvertFrom-Json
        Write-Pass "Session name map: $(($map.PSObject.Properties | Measure-Object).Count) entries"
    } catch { Write-Fail "Session name map invalid: $_" }
}

$head = git log --oneline -1 2>$null
if ($head) { Write-Pass "HEAD: $head" } else { Write-Fail "Cannot read HEAD" }

$navFiles = Get-ChildItem "I-LOG-NAV" -ErrorAction SilentlyContinue
if ($navFiles.Count -ge 3) { Write-Pass "I-LOG-NAV: $($navFiles.Count) artifacts" } else { Write-Warn "I-LOG-NAV: $($navFiles.Count) artifacts (expected 3+)" }

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
if ($failCount -eq 0 -and $warnCount -eq 0) { Write-Host "HEALTH: ALL PASS" -ForegroundColor Green }
elseif ($failCount -eq 0) { Write-Host "HEALTH: $warnCount warnings" -ForegroundColor Yellow }
else { Write-Host "HEALTH: $failCount FAILURES" -ForegroundColor Red }
Write-Host ("=" * 60) -ForegroundColor Cyan

if ($AutoFix) {
    Write-Host "Auto-fix not implemented - manual review required" -ForegroundColor Yellow
}