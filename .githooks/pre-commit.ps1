# pre-commit.ps1 — Canonical pre-commit guard
param()

$ErrorActionPreference = 'Stop'

$stagedFiles = git diff --cached --name-only --diff-filter=ACMRTUXB 2>$null
if (-not $stagedFiles) { exit 0 }

$BLOCKED = 0

# ── Secret Guard ─────────────────────────────────────────────────────────────
$secretPattern = '(DOTENV_PRIVATE_KEY\s*=|BEGIN[[:space:]]+([A-Z]+[[:space:]]+)?PRIVATE[[:space:]]+KEY|API[_-]?KEY[[:space:]]*[:=][[:space:]]*["\x27]?[A-Za-z0-9_\-]{16,}|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z\-_]{35}|xox[baprs]-[A-Za-z0-9-]{10,})'

foreach ($file in $stagedFiles) {
    if ($file -eq '.githooks/pre-commit.ps1' -or $file -eq '.githooks/pre-commit.cmd' -or $file -eq '.github/workflows/secret-scan.yml') {
        continue
    }

    $exists = git cat-file -e "`:${file}`" 2>$null
    if (-not $exists) { continue }

    $content = git show "`:${file}`" 2>$null
    if (-not $content -or $content -notmatch '\S') { continue }

    $addedLines = git diff --cached -U0 -- "`"$file`"" 2>$null | Select-String -Pattern '^\+[^+]' -SimpleMatch
    if (-not $addedLines) { continue }

    if ($addedLines | Select-String -Pattern $secretPattern -Quiet) {
        Write-Host "[secret-guard] Potential secret detected in $file"
        $addedLines | Select-String -Pattern $secretPattern | ForEach-Object { Write-Host "  $_" }
        $BLOCKED = 1
    }
}

# ── Script Path Guard ─────────────────────────────────────────────────────────
# LFG: "Only location: CANON/SCRIPTS/". System/utility scripts live nowhere else.
# App code in APPS/, ARCHIVE/, WORKERS/ is grandfathered.

$scriptExts = '\.(ps1|sh|py|bat|cmd|mjs|cjs|js|ts)$'
$allowedPrefixes = @(
    'CANON/SCRIPTS/',
    'CANON/ARCHIVE/',
    'APPS/',
    'ARCHIVE/',
    'WORKERS/',
    'NET-PET-AI/'
)

$newScripts = git diff --cached --name-only --diff-filter=A 2>$null | Where-Object { $_ -match $scriptExts }

foreach ($file in $newScripts) {
    $allowed = $false
    foreach ($prefix in $allowedPrefixes) {
        if ($file.StartsWith($prefix)) { $allowed = $true; break }
    }
    if (-not $allowed) {
        Write-Host "[script-guard] New script outside allowed path: $file"
        Write-Host "  Allowed: CANON/SCRIPTS/, APPS/*, ARCHIVE/*, WORKERS/*, NET-PET-AI/*"
        $BLOCKED = 1
    }
}

# ── .kilo/ Executable Block ───────────────────────────────────────────────────
# .kilo/ is config/state. Never allow executable files here.
$kiloNewExec = $newScripts | Where-Object { $_ -match '^\.kilo/' }
foreach ($file in $kiloNewExec) {
    Write-Host "[script-guard] Executable script in .kilo is forbidden: $file"
    $BLOCKED = 1
}

if ($BLOCKED -ne 0) {
    Write-Host ""
    Write-Host "Commit blocked. Fix above violations or use --no-verify to bypass."
    exit 1
}

exit 0
