<#
.SYNOPSIS
  dnaREGISTRY v1.0 -- Full canonical registry scan
#>

param(
  [switch]$Force,
  [switch]$DryRun
)

$ErrorActionPreference = 'SilentlyContinue'
$repo = "D:\OB-1-CANONICAL"
Set-Location $repo

$registryPathTemplate = "$repo\CANON\REGISTRY\dna-registry-run{0:D3}.json"
$idxPath = "$repo\CANON\SOUL-KEYWORDS\inverted-index.json"

$lastDeath = git log --oneline --grep "^death:" -1 2>&1
$run = 1
if ($lastDeath -match '(?i)run\s*(\d+)') { $run = [int]$Matches[1] + 1 }
$runPad = "{0:D3}" -f $run
$outPath = $registryPathTemplate -f $runPad

Write-Host "=== dnaREGISTRY v1.0 -- Run $runPad ==="

# Load inverted index (handles mixed-case dupes in PS5.1)
$idx = @{}
if (Test-Path $idxPath) {
    Write-Host "[1] Loading inverted-index.json ..."
    try {
        $raw = Get-Content $idxPath -Raw
        $h = [regex]::Matches($raw, '"([^"]+)"\s*:\s*\[') | ForEach-Object { $_.Groups[1].Value }
        foreach ($k in $h) { $idx[$k.ToLower()] = 1 }
        Write-Host "    Loaded $($idx.Count) unique keywords (case-folded)"
    } catch {
        Write-Warning "    SOULKEYS_GAP -- parse failed: $_"
        if (-not $Force) { Write-Error "Run /soulkeys first or use -Force"; exit 1 }
    }
} else {
    Write-Warning "    SOULKEYS_GAP -- index not found"
    if (-not $Force) { Write-Error "Run /soulkeys first or use -Force"; exit 1 }
}

# Scan roots
$scanRoots = @(
    "$repo\CANON",
    "$repo\OPERATIONS",
    "$repo\CANON\SYSTEM",
    "$repo\CANON\RESEARCH",
    "$repo\.kilo\command",
    "$repo\.claude\commands",
    "$repo\CANON\SOUL",
    "$repo\CANON\TRAIN-67\DOCS",
    "$repo\CANON\MARKETING",
    "$repo\APPS\PHOENIX-ARCHITECTI"
)
$excludePatterns = @("node_modules", "\.git\\", "ARCHIVE", "backup", "PROOFS-CHAT", "SOUL-DNA-BIBLE-RECAPTURE", "\.kilo\\worktrees", "SOUL-SEGMENTS", "SOUL-LOG-VERBATIM")

$entries = [System.Collections.Generic.List[hashtable]]::new()
$totalFiles = 0
$catStats = @{}

foreach ($root in $scanRoots) {
    if (-not (Test-Path $root)) { continue }
    Get-ChildItem $root -Recurse -Filter "*.md" -ErrorAction SilentlyContinue | ForEach-Object {
        $rel = $_.FullName.Substring($repo.Length + 1)
        $skip = $false
        foreach ($p in $excludePatterns) {
            if ($rel -match [regex]::Escape($p)) { $skip = $true; break }
        }
        if (-not $skip -and $_.Length -gt 50) {
            $totalFiles++
            $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
            $first200 = ""
            if ($content.Length -gt 0) {
                $first200 = $content.Substring(0, [Math]::Min(200, $content.Length)).Replace("`n", " ").Replace("`r","")
            }
            $hash = ""
            try {
                $ho = Get-FileHash $_.FullName -Algorithm SHA256 -ErrorAction SilentlyContinue
                if ($ho) { $hash = $ho.Hash.Substring(0,12) }
            } catch {}
            $hashInput = $rel + "|" + $_.Length + "|" + $_.LastWriteTimeUtc.Ticks
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($hashInput)
            $ms = [System.IO.MemoryStream]::new($bytes)
            $regHash = ""
            try {
                $ho2 = Get-FileHash -InputStream $ms -Algorithm SHA256 -ErrorAction SilentlyContinue
                if ($ho2) { $regHash = $ho2.Hash.Substring(0,8).ToUpper() }
            } catch {}
            $regId = "REG-$regHash"

            $matchedKeywords = New-Object System.Collections.Generic.List[string]
            if ($idx.Count -gt 0) {
                foreach ($kw in $idx.Keys) {
                    if ($content -match [regex]::Escape($kw)) {
                        [void]$matchedKeywords.Add($kw)
                    }
                }
            }

            # INLINE category detection
            $p = $rel.ToLower()
            $h2 = $first200.ToLower()
            $category = "UNCLASSIFIED"

            if ($p -match "command\\")                   { $category = "COMMAND" }
            elseif ($p -match "reincarnat")              { $category = "REINCARNATION" }
            elseif ($p -match "pheromone|phetrail")      { $category = "PHEROMONE" }
            elseif ($p -match "phoenix-architecti")      { $category = "PHOENIX-ARCHITECTI" }
            elseif ($p -match "ledger|hl-")              { $category = "LEDGER" }
            elseif ($p -match "mandatory-reads")         { $category = "MANDATORY-READS" }
            elseif ($p -match "cold-start-boot")         { $category = "BOOT" }
            elseif ($p -match "bible")                   { $category = "BIBLE" }
            elseif ($p -match "soul")                    { $category = "SOUL" }
            elseif ($p -match "dna|extract")             { $category = "DNA" }
            elseif ($p -match "starmap")                 { $category = "STARMAP" }
            elseif ($p -match "keyword|soul-key|rfkw")   { $category = "SOULKEYS" }
            elseif ($p -match "pipeline")                { $category = "PIPELINE" }
            elseif ($p -match "registry")                { $category = "REGISTRY" }
            elseif ($p -match "research")                { $category = "RESEARCH" }
            elseif ($p -match "operations")              { $category = "OPERATIONS" }
            elseif ($p -match "student-portal")          { $category = "STUDENT-PORTAL" }
            elseif ($p -match "deepgram")                { $category = "DEEPGRAM-RESEARCH" }
            elseif ($p -match "train")                   { $category = "TRAIN-67" }
            elseif ($p -match "marketing")               { $category = "MARKETING" }
            elseif ($p -match "vault")                   { $category = "VAULT" }
            elseif ($p -match "proofs|proof")           { $category = "PROOF" }
            elseif ($p -match "reincarnation-log")       { $category = "REINCARNATION-LOG" }
            elseif ($h2 -match "reincarnat|death|rise")  { $category = "REINCARNATION" }
            elseif ($h2 -match "mandatory|dispatch")     { $category = "MANDATORY-READS" }
            elseif ($h2 -match "registry")               { $category = "REGISTRY" }
            elseif ($h2 -match "soul|sovereign")         { $category = "SOUL" }
            elseif ($h2 -match "starmap|pointer")        { $category = "STARMAP" }
            elseif ($h2 -match "keyword|freq")           { $category = "SOULKEYS" }
            elseif ($h2 -match "pipeline|stage")         { $category = "PIPELINE" }
            elseif ($h2 -match "ledger|merkle")          { $category = "LEDGER" }
            elseif ($h2 -match "pheromone|trail")        { $category = "PHEROMONE" }
            elseif ($h2 -match "bible|sovereign")        { $category = "BIBLE" }

            if ($catStats[$category]) { $catStats[$category]++ } else { $catStats[$category] = 1 }

            $entry = [ordered]@{
                reg_id          = $regId
                path            = $rel
                size_bytes      = $_.Length
                last_modified   = $_.LastWriteTimeUtc.ToString("o")
                sha256_prefix   = $hash
                category        = $category
                first_tokens    = $first200
                keyword_hits    = $matchedKeywords.Count
                top_keywords    = @($matchedKeywords | Select-Object -First 10)
                linked_stages   = @()
            }
            $null = $entries.Add([hashtable]$entry)
        }
    }
}

Write-Host "[2] Scanned $totalFiles files, $($entries.Count) entries"
foreach ($k in ($catStats.Keys | Sort-Object)) {
    Write-Host "    Cat: $k = $($catStats[$k])"
}
if ($entries.Count -eq 0) { Write-Warning "REGISTRY_EMPTY_GAP" }

Write-Host "[3] Linking stages ..."
$stageMap = @{
    "COMMAND"=@("DEATH","RISE","PHE","REGISTRY")
    "REINCARNATION"=@("RRL","DEATH","RISE")
    "PHEROMONE"=@("PHE")
    "LEDGER"=@("LEDGER")
    "MANDATORY-READS"=@("ALL")
    "BOOT"=@("BOOT","RISE")
    "BIBLE"=@("SOUL","DNA")
    "SOUL"=@("SOUL")
    "DNA"=@("DNA")
    "STARMAP"=@("STARMAP")
    "SOULKEYS"=@("SOULKEYS")
    "PIPELINE"=@("PIPELINE")
    "REGISTRY"=@("REGISTRY","RISE","DEATH")
    "RESEARCH"=@("DNA","ALL")
    "OPERATIONS"=@("DEATH")
    "STUDENT-PORTAL"=@("ALL")
    "DEEPGRAM-RESEARCH"=@("DNA","RESEARCH")
    "TRAIN-67"=@("ALL")
    "MARKETING"=@("ALL")
    "PHOENIX-ARCHITECTI"=@("DNA","RESEARCH","ALL")
    "VAULT"=@("SOUL","DNA")
    "PROOF"=@("SOUL","DNA")
    "REINCARNATION-LOG"=@("REINCARNATION")
    "UNCLASSIFIED"=@("UNKNOWN")
}
foreach ($e in $entries) {
    $cat = $e.category
    if ($stageMap[$cat]) { $e.linked_stages = $stageMap[$cat] } else { $e.linked_stages = @("UNKNOWN") }
}

Write-Host "[4] Building digest ..."
$catGroups = $entries | Group-Object -Property category | ForEach-Object { "$($_.Name)=$($_.Count)" }
$byCat = $catGroups -join ", "
$topKw = @($idx.Keys | Select-Object -First 30)
$allPaths = $entries | ForEach-Object { $_.path } | Sort-Object -Unique

$digest = New-Object PSObject -Property @{
    generated_at = (Get-Date).ToUniversalTime().AddHours(7).ToString("o")
    total_entries = $entries.Count
    by_category = $byCat
    entry_count_by_category = @($entries | Group-Object -Property category | ForEach-Object { @{ category = $_.Name; count = $_.Count } })
    top_keywords = $topKw
    paths = $allPaths
    all_entries = $entries
}

if ($DryRun) {
    Write-Host "[DRYRUN] First 5:"
    for ($i=0; $i -lt [Math]::Min(5, $entries.Count); $i++) {
        $e = $entries[$i]
        Write-Host "  $($e.reg_id) | $($e.category) | $($e.path)"
    }
    Write-Host "DRYRUN complete."
    exit 0
}

$outDir = Split-Path $outPath -Parent
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

$json = $digest | ConvertTo-Json -Depth 6
$utf8 = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText($outPath, $json, $utf8)

Write-Host ""
Write-Host "=== dnaREGISTRY COMPLETE ==="
$fs = (Get-Item $outPath).Length
Write-Host "File:    $outPath"
Write-Host "Size:    $fs bytes"
Write-Host "Entries: $($digest.total_entries)"
Write-Host "Cats:    $byCat"
Write-Host "Top KW:  $($topKw -join ', ')"
Write-Host ""
Write-Host "Laws active:"
Write-Host "  L-REG-1 SCAN_FIRST"
Write-Host "  L-REG-2 APPEND_ONLY"
$uncCount = [int]($entries | Where-Object { $_.category -eq 'UNCLASSIFIED' }).Count
Write-Host "  L-REG-3 CATEGORY_REQUIRED ($uncCount UNCLASSIFIED)"
Write-Host "  L-REG-4 KEYWORD_SYNC"
Write-Host "  L-REG-5 PATH_VERIFY"
