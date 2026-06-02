$ErrorActionPreference = 'Stop'
$repo = "D:\OB-1-CANONICAL"
Set-Location $repo

# Hard-exclude at Get-ChildItem level — these dirs are never scanned.
# Keeps the working set small before any per-item logic runs.
$hardExcludeDirs = @(
    "$repo\.git",
    "$repo\.kilo\worktrees",
    "$repo\node_modules",
    "$repo\ARCHIVE",
    "$repo\CANON\ARCHIVE",
    "$repo\CANON\REINCARNATION",
    "$repo\CANON\PHEROMONES",
    "$repo\CANON\HEAVY-LEDGER",
    "$repo\CANON\STARMAP",
    "$repo\CANON\SOUL-KEYWORDS",
    "$repo\CANON\PIPELINE",
    "$repo\RRL",
    "$repo\VAULT-MERGED",
    "$repo\VAULT-PIPELINE-DOCS",
    "$repo\VAULT-NET-SEEDS",
    "$repo\VAULT-CHAOS",
    "$repo\SEEDS",
    "$repo\PROOFS-CHAT-2026-04-05",
    "$repo\SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05",
    "$repo\HEAVY-LEDGER",
    "$repo\REINCARNATION",
    "$repo\SOUL-DNA-BIBLE",
    "$repo\SOUL-SEGMENTS",
    "$repo\RAW-CHAT-LOGS",
    "$repo\SESSION-RECORDS",
    "$repo\SESSIONS",
    "$repo\PROOFS-KEY",
    "$repo\PROOFS-SOUL",
    "$repo\PULSE-HANDOFFS",
    "$repo\Website and NET-PET",
    "$repo\HarvestedChats",
    "$repo\APPS\discord-bot\node_modules",
    "$repo\.kilo\worktrees"
)

function Test-HardExcluded($fullPath) {
    foreach ($ex in $hardExcludeDirs) {
        if ($fullPath.StartsWith($ex, [System.StringComparison]::OrdinalIgnoreCase)) { return $true }
    }
    return $false
}

$allMd = Get-ChildItem -Path $repo -Recurse -Filter "*.md" -File |
    Where-Object { -not (Test-HardExcluded $_.FullName) }
$total = $allMd.Count
Write-Host "TOTAL_MD_AFTER_EXCLUDE: $total"

# Buckets
$register = [System.Collections.Generic.List[pscustomobject]]::new()
$referenceOnly = [System.Collections.Generic.List[pscustomobject]]::new()
$dataArtifact = [System.Collections.Generic.List[pscustomobject]]::new()
$duplicate = [System.Collections.Generic.List[pscustomobject]]::new()
$archive = [System.Collections.Generic.List[pscustomobject]]::new()
$unclear = [System.Collections.Generic.List[pscustomobject]]::new()

# Auto-demote patterns (path is proof, no content read needed)
$autoArchivePatterns = @(
    'CANON\ARCHIVE\',
    'ARCHIVE\',
    'VAULT-MERGED\',
    'VAULT-PIPELINE-DOCS\',
    'VAULT-NET-SEEDS\',
    'VAULT-CHAOS\',
    'SEEDS\',
    'Website and NET-PET\',
    'PROOFS-CHAT-2026-04-05\',
    'SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05\',
    'HEAVY-LEDGER\',
    'REINCARNATION\',
    'SOUL-DNA-BIBLE\',
    'SOUL-SEGMENTS\',
    'RAW-CHAT-LOGS\',
    'SESSION-RECORDS\',
    'SESSIONS\',
    'PROOFS-KEY\',
    'PROOFS-SOUL\',
    'PULSE-HANDOFFS\'
)

$autoDuplicatePatterns = @(
    '\.kilo\worktrees\',
    'node_modules\',
    'dist\',
    '\rs\mrmic\'
)

$autoDataPatterns = @(
    'CANON\REINCARNATION\',
    'CANON\PHEROMONES\',
    'RRL\',
    'CANON\HEAVY-LEDGER\',
    'CANON\STARMAP\',
    'CANON\SOUL-KEYWORDS\',
    'CANON\PIPELINE\'
)

$autoRefPatterns = @(
    'RECON\',
    'SALES-DNA\',
    'SCRIBE-DEPLOYMENT\',
    'CANON\TRAIN-67\'
)

function Test-PatternMatch($path, $patterns) {
    foreach ($p in $patterns) {
        if ($path -like "*$p*") { return $true }
    }
    return $false
}

# Specific files to demote regardless
$demoteFiles = @(
    'DEATH-PROTOCOL-v2.md',
    'REINCARNATION-BOOT-CHECK.md',
    'RISE-PROTOCOL-v5.md',
    'PHOENIX-DEATH-PROTOCOL.md',
    'PHOENIX-RISE-PROTOCOL.md',
    'PHOENIX-VERIFY-PROTOCOL.md',
    'PHOENIX-PULSE-PROTOCOL.md',
    'PHOENIX-DISPATCH-PROTOCOL.md'
)

$processed = 0
foreach ($f in $allMd) {
    $rel = $f.FullName.Substring($repo.Length + 1)
    $name = [System.IO.Path]::GetFileName($rel)
    $nameLower = $name.ToLower()
    $lastMod = $f.LastWriteTime.ToString("yyyy-MM-ddTHH:mm:ss")

    $lines = if ($f.Length -gt 0) { Get-Content $f.FullName -TotalCount 20 -Encoding UTF8 -ErrorAction SilentlyContinue } else { @() }
    $lineCount = if ($lines) { $lines.Count } else { 0 }
    $firstH1 = ""
    $bodyLines = @()
    foreach ($line in $lines) {
        if ($line -match '^\s*#\s+(.+)$') { $firstH1 = $matches[1].Trim(); continue }
        $bodyLines += $line
    }
    $first200 = ($bodyLines -join "`n")
    if ($first200.Length -gt 200) { $first200 = $first200.Substring(0, 200) }

    $entry = [pscustomobject]@{
        Path = $rel
        FirstH1 = $firstH1
        First200 = $first200
        LastModified = $lastMod
        LineCount = $lineCount
    }

    # README = DUPLICATE
    if ($nameLower -eq 'readme.md') { $duplicate.Add($entry); $processed++; continue }

    # Auto-demote by specific filename
    if ($demoteFiles | Where-Object { $nameLower -eq $_ }) { $archive.Add($entry); $processed++; continue }

    # Auto-demote run3xx in CANON\SYSTEM\ (except canonical files)
    if ($rel -match 'CANON\\SYSTEM\\' -and $name -match '^run\d{3}' -and $name -notmatch 'COLD-START-BOOT|REINCARNATION-CONTRACT|MANDATORY-READS|ACTIVE-MISSION|DISPATCH-RULES|BATTLEFIELD-MAP') {
        $archive.Add($entry); $processed++; continue
    }

    # Path-based classification (apply in priority order)
    if (Test-PatternMatch $rel $autoArchivePatterns) { $archive.Add($entry); $processed++; continue }
    if (Test-PatternMatch $rel $autoDuplicatePatterns) { $duplicate.Add($entry); $processed++; continue }
    if (Test-PatternMatch $rel $autoDataPatterns) { $dataArtifact.Add($entry); $processed++; continue }
    if (Test-PatternMatch $rel $autoRefPatterns) { $referenceOnly.Add($entry); $processed++; continue }

    # Kilo skills/agents — operational metadata, not registry docs
    if ($rel -match '(^|\\)\.kilo\\(command|agent|worktrees)\\') { $duplicate.Add($entry); $processed++; continue }
    if ($rel -match '(^|\\)\.claude\\commands\\') { $duplicate.Add($entry); $processed++; continue }

    # Active system dirs = REGISTER (fixed: no leading \\ requirement)
    if ($rel -match '(^|\\)CANON\\SYSTEM\\') { $register.Add($entry); $processed++; continue }
    if ($rel -match '(^|\\)CANON\\RESEARCH\\') { $register.Add($entry); $processed++; continue }
    if ($rel -match '(^|\\)OPERATIONS\\' -and $rel -notmatch 'Phoenix-Rising\\') { $register.Add($entry); $processed++; continue }
    if ($rel -match 'APPS\\NET-PET-AI\\OPERATIONS\\') { $register.Add($entry); $processed++; continue }

    # Specific high-value root-level files = REGISTER
    $rootRegisterFiles = @('CLOUDFLARE-MANIFEST.md','AGENTS.md','OBI-STUDENT-ROSTER.md','OBI-SYSTEM-PROMPT-TEMPLATE.md','CLAUDE.md','MASTER-SYNC.md')
    if ($rootRegisterFiles -contains $name) { $register.Add($entry); $processed++; continue }

    # Phoenix-Rising is pre-Roman archive regardless of subdir
    if ($rel -match '(^|\\)Phoenix-Rising\\') { $archive.Add($entry); $processed++; continue }

    # Content-based archive signals
    if ($first200.ToLower() -match 'raw chat|chat log|transcript|proof|superdump|super dump|sold dump') { $archive.Add($entry); $processed++; continue }

    # Old system files (>90 days, completed/final language)
    $fileDate = $f.LastWriteTime
    $bootDate = Get-Date "2026-06-01"
    $ageDays = ($bootDate - $fileDate).Days
    if ($ageDays -gt 90 -and $first200.ToLower() -match 'completed|finished|done|sealed|final|legacy') { $archive.Add($entry); $processed++; continue }

    # Remaining = UNCLEAR (should be small)
    $unclear.Add($entry)
    $processed++
}

Write-Host "PROCESSED: $processed"
Write-Host "  REGISTER: $($register.Count)"
Write-Host "  REFERENCE_ONLY: $($referenceOnly.Count)"
Write-Host "  DATA: $($dataArtifact.Count)"
Write-Host "  DUPLICATE: $($duplicate.Count)"
Write-Host "  ARCHIVE: $($archive.Count)"
Write-Host "  UNCLEAR: $($unclear.Count)"

# Write candidates
$sb = [System.Text.StringBuilder]::new()
[void]$sb.AppendLine("# REGISTRY v2.1 — CORRECTED DISCOVERY CANDIDATES")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("Generated: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss') ICT")
[void]$sb.AppendLine("Total .md scanned: $total")
[void]$sb.AppendLine("Excluded paths: CANON/REINCARNATION/, CANON/PHEROMONES/, RRL/, CANON/HEAVY-LEDGER/, CANON/STARMAP/, CANON/SOUL-KEYWORDS/, .git/, node_modules/, dist/, .kilo/worktrees/")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("## Summary")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("| Verdict | Count | Action |")
[void]$sb.AppendLine("|---------|------:|--------|")
[void]$sb.AppendLine("| REGISTER | $($register.Count) | add to docs{} + map task_type(s) |")
[void]$sb.AppendLine("| REFERENCE-ONLY | $($referenceOnly.Count) | docs{} + one type, on_demand:true |")
[void]$sb.AppendLine("| DATA ARTIFACT | $($dataArtifact.Count) | excluded by path |")
[void]$sb.AppendLine("| DUPLICATE | $($duplicate.Count) | EXCLUDE + flag cleanup |")
[void]$sb.AppendLine("| ARCHIVE/DEAD | $($archive.Count) | propose move to ARCHIVE/ |")
[void]$sb.AppendLine("| UNCLEAR | $($unclear.Count) | residual — see below |")
[void]$sb.AppendLine("")

if ($register.Count -gt 0) {
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## REGISTER ($($register.Count) items)")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("| Path | Lines | Modified |")
    [void]$sb.AppendLine("|------|------:|----------|")
    foreach ($r in $register) { [void]$sb.AppendLine("| $($r.Path) | $($r.LineCount) | $($r.LastModified) |") }
    [void]$sb.AppendLine("")
}

if ($referenceOnly.Count -gt 0) {
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## REFERENCE-ONLY ($($referenceOnly.Count) items)")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("| Path | Lines | Modified |")
    [void]$sb.AppendLine("|------|------:|----------|")
    foreach ($r in $referenceOnly) { [void]$sb.AppendLine("| $($r.Path) | $($r.LineCount) | $($r.LastModified) |") }
    [void]$sb.AppendLine("")
}

if ($duplicate.Count -gt 0) {
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## DUPLICATE ($($duplicate.Count) items)")
    [void]$sb.AppendLine("")
    foreach ($r in $duplicate) { [void]$sb.AppendLine("- $($r.Path)") }
    [void]$sb.AppendLine("")
}

if ($archive.Count -gt 0) {
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## ARCHIVE/DEAD ($($archive.Count) items — representative sample)")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("| Path | Lines | Modified |")
    [void]$sb.AppendLine("|------|------:|----------|")
    $archSample = $archive | Select-Object -First 25
    foreach ($r in $archSample) { [void]$sb.AppendLine("| $($r.Path) | $($r.LineCount) | $($r.LastModified) |") }
    if ($archive.Count -gt 25) { [void]$sb.AppendLine("| ... and $($archive.Count - 25) more | | |") }
    [void]$sb.AppendLine("")
}

if ($unclear.Count -gt 0) {
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## UNCLEAR — RESIDUAL ($($unclear.Count) items — OB1 RULING)")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("These survived path rules. Top 100:")
    [void]$sb.AppendLine("")
    $uncSample = $unclear | Select-Object -First 100
    foreach ($r in $uncSample) {
        $snip = $r.First200.Substring(0, [Math]::Min(120, $r.First200.Length))
        [void]$sb.AppendLine("- **$($r.Path)** Lines:$($r.LineCount) H1:`"$($r.FirstH1)`" `"$snip`"")
    }
    if ($unclear.Count -gt 100) { [void]$sb.AppendLine('')
    [void]$sb.AppendLine('... and ' + ($unclear.Count - 100) + ' more UNCLEAR items.') }
    [void]$sb.AppendLine("")
}

$outPath = Join-Path $repo 'OPERATIONS\REGISTRY-CANDIDATES.md'
[System.IO.File]::WriteAllText($outPath, $sb.ToString(), [System.Text.Encoding]::UTF8)
Write-Host "WRITTEN: $outPath"
