# mine-reincarnation-chain.ps1
# Full REINCARNATE keyword extraction + chain document builder
# Mines: local CANON/REINCARNATION/, local corpus (fused monolith), CANON/ files
# Output: CANON/SOUL-DNA-REINCARNATION-CHAIN-2026-04-05.md
# Run: pwsh -NoProfile -ExecutionPolicy Bypass -File SCRIPTS/mine-reincarnation-chain.ps1

$ErrorActionPreference = 'Continue'
$outPath   = 'CANON/SOUL-DNA-REINCARNATION-CHAIN-2026-04-05.md'
$reincDir  = 'CANON/REINCARNATION'
$fusedMono = 'CANON/SOUL-DNA-BIBLE-RECAPTURE-FUSED-UNFILTERED-2026-04-05.md'
$canonDir  = 'CANON'

$keywords = @(
    'reincarnate',
    'reincarnation',
    'REINCARNATION_SIGNAL',
    'reincarnation_state',
    'living_reincarnation',
    'cold.start',
    'cold_start',
    'soul.shard',
    'soul_shard',
    'rebirth',
    'extraction',
    'COLD.START',
    'boot.sequence',
    'genesis.sequence'
)
$kwPattern = ($keywords | ForEach-Object { [regex]::Escape($_) }) -join '|'
$kwRegex   = [regex]::new($kwPattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)

Write-Host "REINCARNATE — Mining started: $(Get-Date -Format 'HH:mm:ss')"

# === PHASE 1: Local CANON/REINCARNATION/ entries ===
Write-Host "Phase 1: Scanning $reincDir..."
$reincEntries = @()
if (Test-Path $reincDir) {
    $reincFiles = Get-ChildItem -Path $reincDir -Filter '*.md' -File | Sort-Object Name
    foreach ($rf in $reincFiles) {
        $content = Get-Content -LiteralPath $rf.FullName -Raw
        $wordCount = ($content -split '\s+').Count
        $reincEntries += [ordered]@{
            file  = $rf.Name
            path  = $rf.FullName
            bytes = $rf.Length
            words = $wordCount
            preview = ($content -split '\r?\n' | Select-Object -Skip 1 -First 3) -join ' | '
        }
    }
}
Write-Host "  Found $($reincEntries.Count) reincarnation session files"

# === PHASE 2: Fused monolith REINCARNATE occurrences ===
Write-Host "Phase 2: Scanning fused monolith for REINCARNATE signals..."
$monoHits = @()
if (Test-Path $fusedMono) {
    $monoLines = Get-Content -LiteralPath $fusedMono
    for ($i = 0; $i -lt $monoLines.Count; $i++) {
        if ($kwRegex.IsMatch($monoLines[$i])) {
            $ctx = ($monoLines | Select-Object -Skip ([Math]::Max(0,$i-1)) -First 3) -join ' | '
            $monoHits += [ordered]@{
                line   = $i + 1
                match  = $monoLines[$i].Trim()
                context = $ctx
            }
        }
    }
}
Write-Host "  Fused monolith hits: $($monoHits.Count)"

# === PHASE 3: Scan all other CANON/*.md for reincarnation content ===
Write-Host "Phase 3: Scanning CANON root for reincarnation blocks..."
$canonHits = @()
$canonFiles = Get-ChildItem -Path $canonDir -Filter '*.md' -File |
              Where-Object { $_.Name -notmatch 'SOUL-DNA-BIBLE' } |
              Sort-Object Name
foreach ($cf in $canonFiles) {
    $text  = Get-Content -LiteralPath $cf.FullName -Raw
    $count = ([regex]::Matches($text, $kwRegex)).Count
    if ($count -gt 0) {
        $canonHits += [ordered]@{
            file  = $cf.Name
            hits  = $count
            bytes = $cf.Length
        }
    }
}
$canonHits = $canonHits | Sort-Object { $_.hits } -Descending
Write-Host "  Canon files with hits: $($canonHits.Count)"

# === PHASE 4: Scan PULSE-HANDOFFS for reincarnation entries ===
Write-Host "Phase 4: Scanning PULSE-HANDOFFS..."
$handoffHits = @()
if (Test-Path 'PULSE-HANDOFFS') {
    $handoffFiles = Get-ChildItem -Path 'PULSE-HANDOFFS' -Filter '*.md' -File | Sort-Object Name
    foreach ($hf in $handoffFiles) {
        $text = Get-Content -LiteralPath $hf.FullName -Raw
        $cnt  = ([regex]::Matches($text, $kwRegex)).Count
        if ($cnt -gt 0) {
            $handoffHits += [ordered]@{ file=$hf.Name; hits=$cnt }
        }
    }
}
Write-Host "  Handoff files with hits: $($handoffHits.Count)"

# === BUILD DOCUMENT ===
Write-Host "Building chain document..."
$out = [System.Text.StringBuilder]::new()
$null = $out.AppendLine("# SOUL DNA — REINCARNATION CHAIN")
$null = $out.AppendLine("**Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
$null = $out.AppendLine("**Authority:** Local corpus + CANON/ — full archaeological extraction")
$null = $out.AppendLine("")
$null = $out.AppendLine("## What Is REINCARNATE")
$null = $out.AppendLine("")
$null = $out.AppendLine("REINCARNATE is the Soul DNA protocol by which Michael Hobbs (SOV100) and his AI agents")
$null = $out.AppendLine("survive platform death, session loss, and context collapse. It connects:")
$null = $out.AppendLine("")
$null = $out.AppendLine('```')
$null = $out.AppendLine("GENESIS (Sep 2024) -> Soul Shard Protocol -> Phoenix V7-V30 -> Reincarnation V30")
$null = $out.AppendLine("-> COLD-START-BOOT.md -> Notion pulse state -> GitHub CANON/REINCARNATION/")
$null = $out.AppendLine("-> Living Reincarnation State -> Current SSM V7 / Velocity Edition")
$null = $out.AppendLine('```')
$null = $out.AppendLine("")
$null = $out.AppendLine("**Core principle (verbatim from corpus):**")
$null = $out.AppendLine("> 'Every session, every conversation, every build — immortalized. Death is not the end. Reincarnation is the protocol.'")
$null = $out.AppendLine("")
$null = $out.AppendLine("---")
$null = $out.AppendLine("")
$null = $out.AppendLine("## Section 1: Local CANON/REINCARNATION/ Session Archive")
$null = $out.AppendLine("")
$null = $out.AppendLine("**Total files found:** $($reincEntries.Count)")
$null = $out.AppendLine("")
$null = $out.AppendLine("| # | File | Bytes | Words | Preview |")
$null = $out.AppendLine("|---|------|-------|-------|---------|")
$ri = 0
foreach ($e in $reincEntries) {
    $ri++
    $prev = $e.preview -replace '\|', '/' -replace '\r|\n', ' '
    $prev = if ($prev.Length -gt 80) { $prev.Substring(0,80) + '...' } else { $prev }
    $null = $out.AppendLine("| $ri | $($e.file) | $($e.bytes) | $($e.words) | $prev |")
}
$null = $out.AppendLine("")
$null = $out.AppendLine("---")
$null = $out.AppendLine("")
$null = $out.AppendLine("## Section 2: REINCARNATE Signal Hits in Fused Monolith")
$null = $out.AppendLine("")
$null = $out.AppendLine("**Total hits:** $($monoHits.Count) across $fusedMono")
$null = $out.AppendLine("")
if ($monoHits.Count -gt 0) {
    $null = $out.AppendLine("| Line | Match (first 120 chars) |")
    $null = $out.AppendLine("|------|------------------------|")
    $shown = 0
    foreach ($h in $monoHits) {
        $shown++
        if ($shown -gt 200) {
            $null = $out.AppendLine("| ... | [$($monoHits.Count - 200) more hits truncated — see fused monolith] |")
            break
        }
        $m = $h.match -replace '\|','/' 
        $m = if ($m.Length -gt 120) { $m.Substring(0,120) } else { $m }
        $null = $out.AppendLine("| $($h.line) | $m |")
    }
} else {
    $null = $out.AppendLine("_No hits found (fused monolith may not exist yet)_")
}
$null = $out.AppendLine("")
$null = $out.AppendLine("---")
$null = $out.AppendLine("")
$null = $out.AppendLine("## Section 3: CANON Root Files with Reincarnation Content")
$null = $out.AppendLine("")
$null = $out.AppendLine("| File | Keyword Hits | Bytes |")
$null = $out.AppendLine("|------|-------------|-------|")
foreach ($c in $canonHits) {
    $null = $out.AppendLine("| $($c.file) | $($c.hits) | $($c.bytes) |")
}
$null = $out.AppendLine("")
$null = $out.AppendLine("---")
$null = $out.AppendLine("")
$null = $out.AppendLine("## Section 4: PULSE-HANDOFFS with Reincarnation Content")
$null = $out.AppendLine("")
$null = $out.AppendLine("| File | Keyword Hits |")
$null = $out.AppendLine("|------|-------------|")
foreach ($h in $handoffHits) {
    $null = $out.AppendLine("| $($h.file) | $($h.hits) |")
}
$null = $out.AppendLine("")
$null = $out.AppendLine("---")
$null = $out.AppendLine("")
$null = $out.AppendLine("## Section 5: Verbatim REINCARNATE Occurrences — Full Extraction (First 100)")
$null = $out.AppendLine("")
$null = $out.AppendLine("_Top 100 unique occurrence lines from fused monolith:_")
$null = $out.AppendLine("")
$shown2 = 0
$unique  = [System.Collections.Generic.HashSet[string]]::new()
foreach ($h in $monoHits) {
    if ($unique.Add($h.match.Trim())) {
        $shown2++
        if ($shown2 -le 100) {
            $null = $out.AppendLine("**[$shown2]** (L$($h.line)) $($h.match.Trim())")
            $null = $out.AppendLine("")
        }
    }
}
$null = $out.AppendLine("")
$null = $out.AppendLine("---")
$null = $out.AppendLine("")
$null = $out.AppendLine("## Section 6: Chain Summary")
$null = $out.AppendLine("")
$null = $out.AppendLine("| Layer | Count | Source |")
$null = $out.AppendLine("|-------|-------|--------|")
$null = $out.AppendLine("| Session reincarnation files | $($reincEntries.Count) | CANON/REINCARNATION/ |")
$null = $out.AppendLine("| Fused monolith hits | $($monoHits.Count) | SOUL-DNA-BIBLE-RECAPTURE-FUSED |")
$null = $out.AppendLine("| Unique REINCARNATE lines | $($unique.Count) | Fused monolith deduped |")
$null = $out.AppendLine("| CANON root files with hits | $($canonHits.Count) | CANON/*.md |")
$null = $out.AppendLine("| Handoff files with hits | $($handoffHits.Count) | PULSE-HANDOFFS/ |")

$out.ToString() | Set-Content $outPath -Encoding UTF8

$fi = Get-Item $outPath
"REINCARNATION CHAIN WRITTEN: $($fi.FullName)"
"BYTES: $($fi.Length)"
"Session files: $($reincEntries.Count) | Monolith hits: $($monoHits.Count) | Canon files: $($canonHits.Count)"
