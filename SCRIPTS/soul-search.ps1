# soul-search.ps1 — SOULSEARCH ENGINE v1.0
# Query: term → SOULKEYS index → STARMAP pointers → RRL/LEDGER exact hits
# Returns verbatim snippets, never paraphrase.
# Chain: rfkw-search finds runs; soul-search resolves through STARMAP to actual content.

param(
    [Parameter(Mandatory=$true)]
    [string]$Query,
    [int]$MaxResults = 10,
    [switch]$BlueprintsOnly,
    [string]$RepoRoot = "D:\OB-1-CANONICAL"
)

$ErrorActionPreference = "SilentlyContinue"
$keywordDir  = "$RepoRoot\CANON\SOUL-KEYWORDS"
$starmapDir  = "$RepoRoot\CANON\STARMAP"
$rrlDir      = "$RepoRoot\RRL"
$dnaDir      = "$RepoRoot\CANON\SOUL\EXTRACT"

$idxPath     = "$keywordDir\inverted-index.json"
$timestamp   = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')

# ── STEP 1: Query SOULKEYS inverted index ─────────────────────────────────────
$term = $Query.ToLower().Trim()
$hits = @()

if (Test-Path $idxPath) {
    $index = Get-Content $idxPath -Raw | ConvertFrom-Json -AsHashtable
    if ($index[$term]) {
foreach ($entry in $index[$term]) {
        # Handle both {run: N} and {runs: [N]} formats
        $runNum = if ($entry.run) { $entry.run } elseif ($entry.runs -and $entry.runs[0]) { $entry.runs[0] } else { $null }
        if ($runNum) {
            $hits += [ordered]@{
                Source = "SOULKEYS"
                Run    = $runNum
                Weight = $entry.weight
                Category = $entry.category
            }
        }
    }
    }
}

# Fallback: scan per-run rfkw files if index missing or no hit
if ($hits.Count -eq 0 -and (Test-Path $keywordDir)) {
    Get-ChildItem $keywordDir -Filter "rfkw-run*.txt" -ErrorAction SilentlyContinue | ForEach-Object {
        $lines = Get-Content $_.FullName -ErrorAction SilentlyContinue
        foreach ($line in $lines) {
            if ($line -match "^(\d+)\s*\|\s*.+?\|\s*(.+)$") {
                $w = [int]$matches[1]; $k = $matches[2].ToLower().Trim()
                if ($k -eq $term) {
                    $runNum = $_.BaseName -replace 'rfkw-run', ''
                    $hits += [ordered]@{ Source="SOULKEYS"; Run=[int]$runNum; Weight=$w; Category="fallback" }
                }
            }
        }
    }
}

if ($hits.Count -eq 0) {
    Write-Output "🔎 `"$Query`" — 0 hits (term not in SOULKEYS)"
    exit 0
}

# ── STEP 2: Resolve STARMAP pointers ──────────────────────────────────────────
$results = @()
foreach ($hit in ($hits | Sort-Object Weight -Descending | Select-Object -First $MaxResults)) {
    $runNum = $hit.Run
    $starmapPath = "$starmapDir\starmap-run$runNum.json"
    $rrlPath     = "$rrlDir\RRL-$runNum.txt"
    $dnaRunPath  = "$dnaDir\dna-run$runNum.json"

    $rrlTurnIds    = ""
    $dnaTurnIds    = ""
    $bpLocations   = ""
    $ledgerId      = ""
    $rrlSnippet    = ""
    $dnaSnippet    = ""

    # Load STARMAP pointer
    if (Test-Path $starmapPath) {
        try {
            $starmap = Get-Content $starmapPath -Raw | ConvertFrom-Json
            $rrlTurnIds   = $starmap.soul_turn_ids
            $dnaTurnIds   = $starmap.dna_turn_ids
            $bpLocations  = $starmap.blueprint_locations
            $ledgerId     = $starmap.ledger_id
        } catch { }
    }

    # Retrieve RRL snippet (SOUL = Michael's words / user turns)
    if (Test-Path $rrlPath) {
        $rrlFull = Get-Content $rrlPath -Raw -Encoding UTF8
        # Find first occurrence of query term and extract surrounding context
        $idx = $rrlFull.IndexOf($Query, [StringComparison]::OrdinalIgnoreCase)
        if ($idx -ge 0) {
            $start = [Math]::Max(0, $idx - 120)
            $len   = [Math]::Min(300, $rrlFull.Length - $start)
            $rrlSnippet = $rrlFull.Substring($start, $len)
            $rrlSnippet = $rrlSnippet -replace "`n", " " -replace "`r", " "
            if ($start -gt 0) { $rrlSnippet = "...$rrlSnippet" }
            if ($start + $len -lt $rrlFull.Length) { $rrlSnippet = "$rrlSnippet..." }
        } else {
            $rrlSnippet = "[term not found in RRL text — pointer may reference turn ID]"
        }
    }

    # Retrieve DNA snippet (agent words / blueprints)
    if (Test-Path $dnaRunPath) {
        try {
            $dnaRecords = Get-Content $dnaRunPath -Raw | ConvertFrom-Json
            $matchRecord = $dnaRecords | Where-Object { $_.text -match [regex]::Escape($Query) } | Select-Object -First 3
            if ($matchRecord) {
                foreach ($rec in $matchRecord) {
                    $text = $rec.text -replace "`n", " " -replace "`r", " "
                    $typeLabel = if ($rec.type -eq "blueprint") { "[blueprint]" } else { "[prose]" }
                    $dnaSnippet += "$typeLabel seq $($rec.seq): `"...$($text.Substring(0, [Math]::Min(200, $text.Length)))...`" "
                }
            } else {
                $dnaSnippet = "[no assistant turn contains exact term]"
            }
        } catch { $dnaSnippet = "[DNA parse error]" }
    }

    $results += [ordered]@{
        Run          = $runNum
        Weight       = $hit.Weight
        Category     = $hit.Category
        LedgerId     = $ledgerId
        RrlSnippet   = $rrlSnippet
        DnaSnippet   = $dnaSnippet
        BpLocations  = $bpLocations
    }
}

# ── STEP 3: Rank (weight × recency) + print ──────────────────────────────────
$maxRun = ($results | Measure-Object -Property Run -Maximum).Maximum
$results | ForEach-Object {
    $recency = 1 + ($_.Run / [Math]::Max(1, $maxRun))
    $_.Rank = [math]::Round($_.Weight * $recency, 2)
    $_
} | Sort-Object Rank -Descending | ForEach-Object {
    $icon = if ($_.DnaSnippet -match "\[blueprint\]") { "🔷" } else { "🔎" }
    Write-Output ""
    Write-Output "$icon `"$Query`" — [run $($_.Run) · weight $($_.Weight) · rank $($_.Rank)]"
    Write-Output "  LEDGER $($_.LedgerId)"
    if ($_.RrlSnippet) {
        Write-Output "  SOUL  RRL-$($_.Run).txt → `"$($_.RrlSnippet)`""
    }
    if ($_.DnaSnippet) {
        Write-Output "  DNA   $($_.DnaSnippet)"
    }
    if ($_.BpLocations) {
        Write-Output "  BP    blueprints: $($_.BpLocations)"
    }
}

Write-Output ""
Write-Output "SOULSEARCH COMPLETE: $($results.Count) hits for `"$Query`" — $timestamp"
