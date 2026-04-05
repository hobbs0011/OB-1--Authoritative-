# phase2-raw-chatlog-ingest.ps1
# Phase 2 Soul DNA recapture — RAW verbatim ingestion, no thematic chunking
# One file = one corpus entry. No rewriting, no summarizing, no AI overlays.
# Only Michael's raw files go in. The corpus stays verbatim.
#
# Run: pwsh -NoProfile -ExecutionPolicy Bypass -File SCRIPTS/phase2-raw-chatlog-ingest.ps1

$ErrorActionPreference = 'Stop'

$sourceDir  = 'C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY'
$corpusDir  = 'CANON\SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05'
$indexPath  = "$corpusDir\INDEX.md"
$kwIndexPath = 'CANON\SOUL-DNA-BIBLE-KEYWORD-INDEX-2026-04-05.md'

# Get current highest chunk seq
$existing = Get-ChildItem $corpusDir -Filter '*.md' |
    Where-Object { $_.Name -ne 'INDEX.md' } |
    Sort-Object Name
$lastSeq = 0
foreach ($f in $existing) {
    if ($f.Name -match '^(\d{4})') {
        $n = [int]$Matches[1]
        if ($n -gt $lastSeq) { $lastSeq = $n }
    }
}

Write-Host "CORPUS: $($existing.Count) existing chunks. Last seq: $lastSeq"
Write-Host "SOURCE DIR: $sourceDir"

if (-not (Test-Path $sourceDir)) { throw "Source dir not found: $sourceDir" }

$sourceFiles = Get-ChildItem -LiteralPath $sourceDir -File |
    Where-Object { $_.Extension -match '\.(txt|jsonl|md)' } |
    Sort-Object Name

Write-Host "SOURCE FILES: $($sourceFiles.Count)"

# Track what we add
$added = 0
$skipped = 0
$failed = 0
$seq = $lastSeq

# Keywords to track dynamically (pheromone trail markers)
$kwMap = @{
    'SOUL_DNA'         = @()
    'REINCARNATE'      = @()
    'ROME_PROTOCOL'    = @()
    'GOSPEL_444'       = @()
    'LEDGER'           = @()
    'AGENT_99'         = @()
    'AGENT_98'         = @()
    'AGENT_100'        = @()
    'SUPER_SAIYAN'     = @()
    'MERKLE'           = @()
    'CRASH_CHAT'       = @()
    'CAPABLE_OPERATOR' = @()
    'MR_HOBBS'         = @()
    'PHOENIX'          = @()
    'DRIFT'            = @()
    'ENERGY_GATE'      = @()
    'FLOODGATES'       = @()
    'SURVIVAL'         = @()
    'NET_ESL'          = @()
    'SPY_DRONE'        = @()
    'VIETNAM'          = @()
    'MORMONISM'        = @()
    'OBI_WAN'          = @()
    'ANAKIN'           = @()
    'JEDI_COUNCIL'     = @()
    'MACHINE_THAT_BUILDS' = @()
    'AUTONOMOUS'       = @()
    'CANON'            = @()
    'VERBATIM'         = @()
    'RAW'              = @()
}

$kwPatterns = @{
    'SOUL_DNA'         = 'soul.?dna|soul_dna'
    'REINCARNATE'      = 'reincarnate|reincarnation'
    'ROME_PROTOCOL'    = 'rome.?protocol'
    'GOSPEL_444'       = 'gospel.?444'
    'LEDGER'           = '\bledger\b'
    'AGENT_99'         = 'agent.?99|obi-wan|obivan'
    'AGENT_98'         = 'agent.?98|anakin'
    'AGENT_100'        = 'agent.?100|agent-100|sovereign.?architect'
    'SUPER_SAIYAN'     = 'super.?saiyan'
    'MERKLE'           = 'merkle'
    'CRASH_CHAT'       = 'crash.?chat'
    'CAPABLE_OPERATOR' = 'capable.?operator'
    'MR_HOBBS'         = 'mr\.?\s*hobbs'
    'PHOENIX'          = '\bphoenix\b'
    'DRIFT'            = '\bdrift\b'
    'ENERGY_GATE'      = 'energy.?gate|floodgate'
    'FLOODGATES'       = 'floodgate'
    'SURVIVAL'         = '\bsurvival\b'
    'NET_ESL'          = '\bnet\b.*esl|esl.*\bnet\b|natural.?english'
    'SPY_DRONE'        = 'spy.?drone|probe.?droid'
    'VIETNAM'          = 'vietnam|vietnamese'
    'MORMONISM'        = 'mormon'
    'OBI_WAN'          = 'obi.?wan|agent.?99'
    'ANAKIN'           = 'anakin|agent.?98'
    'JEDI_COUNCIL'     = 'jedi.?council'
    'MACHINE_THAT_BUILDS' = 'machine.?that.?builds'
    'AUTONOMOUS'       = 'autonomous|autonomy|autonomize'
    'CANON'            = '\bcanon\b'
    'VERBATIM'         = '\bverbatim\b'
    'RAW'              = '\braw\b'
}

foreach ($f in $sourceFiles) {
    $sanitized = $f.Name -replace '[^a-zA-Z0-9\-_\.]', '_' -replace '_+','_'
    $seq++
    $seqPad = $seq.ToString('D4')
    $chunkName = "$seqPad-RAW-$sanitized"
    $chunkName = $chunkName -replace '\.txt$','_txt' -replace '\.jsonl\.txt$','_jsonl_txt'
    $chunkPath = "$corpusDir\$chunkName.md"

    if (Test-Path $chunkPath) {
        Write-Host "SKIP (exists): $chunkName"
        $seq--
        $skipped++
        continue
    }

    try {
        $rawText = Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        if ([string]::IsNullOrWhiteSpace($rawText)) {
            Write-Host "SKIP (empty): $($f.Name)"
            $seq--
            $skipped++
            continue
        }
        $sha256 = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash
        $lines  = ($rawText -split '\r?\n').Count
        $bytes  = $f.Length

        # Keyword scan
        $kwHits = @()
        foreach ($kw in $kwPatterns.Keys) {
            if ($rawText -match $kwPatterns[$kw]) {
                $kwHits += $kw
                $kwMap[$kw] += $chunkName
            }
        }

        $header = @"
# RAW VERBATIM — $($f.Name)
## Corpus Metadata
- chunk_seq   : $seqPad
- chunk_id    : $chunkName
- source_file : $($f.FullName)
- sha256      : $sha256
- size_bytes  : $bytes
- lines       : $lines
- ingested    : 2026-04-05
- phase       : Phase 2 — Raw Chat Log Ingest
- policy      : VERBATIM — No edits, no summaries, no AI overlays
- keywords    : $($kwHits -join ', ')

---

"@

        Set-Content -LiteralPath $chunkPath -Value ($header + $rawText) -Encoding UTF8
        Write-Host "WROTE [$seqPad] $($f.Name) — ${bytes}b, kw:$($kwHits.Count)"
        $added++
    }
    catch {
        Write-Host "FAILED: $($f.Name) — $_"
        $seq--
        $failed++
    }
}

# Update INDEX.md
$indexContent = Get-Content $indexPath -Raw
$appendLine = "`n`n## Phase 2 Raw Chat Log Ingest — 2026-04-05`n"
$appendLine += "- Files processed: $($sourceFiles.Count)`n"
$appendLine += "- Chunks added: $added`n"
$appendLine += "- Skipped (empty/exists): $skipped`n"
$appendLine += "- Failed: $failed`n"
$appendLine += "- Last seq: $seq`n"
Add-Content -LiteralPath $indexPath -Value $appendLine -Encoding UTF8

# Update keyword index dynamically
$kwAppend = "`n`n## Phase 2 Dynamic Keyword Index Update — 2026-04-05`n`n"
foreach ($kw in ($kwMap.Keys | Sort-Object)) {
    if ($kwMap[$kw].Count -gt 0) {
        $kwAppend += "### $kw ($($kwMap[$kw].Count) files)`n"
        foreach ($hit in $kwMap[$kw]) {
            $kwAppend += "- $hit`n"
        }
        $kwAppend += "`n"
    }
}
Add-Content -LiteralPath $kwIndexPath -Value $kwAppend -Encoding UTF8

Write-Host ""
Write-Host "=== PHASE 2 COMPLETE ==="
Write-Host "ADDED   : $added"
Write-Host "SKIPPED : $skipped"
Write-Host "FAILED  : $failed"
Write-Host "TOTAL CORPUS: $($lastSeq + $added) chunks"
