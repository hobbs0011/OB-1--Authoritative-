param(
    [Parameter(Mandatory=$true)] [string]$SessionName,
    [Parameter(Mandatory=$true)] [string]$ILogPath,
    [string]$OutputDir = "I-LOG-UNAUDITED",
    [string]$KeywordsDir = "CANON/SOUL-KEYWORDS",
    [string]$LostSoulsDir = "CANON/LOSTSOULS",
    [string]$PipelineDir = "CANON/REINCARNATION",
    [string]$IndexFile = "CANON/SOUL-KEYWORDS/inverted-index.json",
    [switch]$PromoteToNav,
    [switch]$SkipColorize,
    [switch]$SkipKeywords,
    [switch]$SkipLostSouls
)

$ErrorActionPreference = 'Stop'
$sep = "=" * 60
$stats = $null

# Derive file prefix from I-LOG filename (e.g., I-LOG-Incarnate-8 -> I-LOG-)
$ilogBase = [System.IO.Path]::GetFileNameWithoutExtension($ILogPath)
$filePrefix = if ($ilogBase -match '^(I-LOG-)') { $Matches[1] } else { 'I-LOG-' }
$safeName = $SessionName -replace '[\\/:*?"<>|&\(\)\s]+', '-' -replace '-+', '-' -replace '^-|-$', ''

# Full prefix for output filenames (e.g. I-LOG-Incarnate-8)
$fullPrefix = if ($safeName -match '^I-LOG-') { $safeName } else { "${filePrefix}${safeName}" }

$statsPath = Join-Path (Join-Path (Get-Location).Path $OutputDir) "$fullPrefix-STATS.json"

Write-Host $sep -ForegroundColor Cyan
Write-Host "WORKHORSE PIPELINE - $SessionName" -ForegroundColor Green
Write-Host "I-LOG: $ILogPath" -ForegroundColor Gray
Write-Host $sep -ForegroundColor Cyan

if (-not (Test-Path $ILogPath)) { throw "I-LOG not found: $ILogPath" }

if (-not $SkipColorize) {
    Write-Host "[STEP 1/4] Colorizing I-LOG..." -ForegroundColor Yellow
    $colorizeScript = Join-Path $PSScriptRoot "rrl-colorize.ps1"
    if (Test-Path $colorizeScript) {
        $stats = & $colorizeScript -InputFile $ILogPath
        $colorizedPath = Join-Path (Join-Path (Get-Location).Path $OutputDir) "$fullPrefix-COLORIZED.md"
        Write-Host "  COLORIZED: $colorizedPath" -ForegroundColor Green
        Write-Host "  STATS: $statsPath" -ForegroundColor Green
    } else {
        Write-Warning "  rrl-colorize.ps1 not found - skipping colorize"
        $stats = $null
    }
} else {
    Write-Host "[STEP 1/4] Colorize SKIPPED" -ForegroundColor Yellow
    $stats = $null
}

if (-not $stats) {
    if (Test-Path $statsPath) {
        $stats = Get-Content $statsPath -Raw | ConvertFrom-Json
    }
}

if ((-not $SkipKeywords) -and $stats -and $stats.top_topics.Count -ge 10) {
    Write-Host "[STEP 2/4] Extracting keywords..." -ForegroundColor Yellow
    $kwScript = Join-Path $PSScriptRoot "extract-keywords.ps1"
    $kwFile = Join-Path (Join-Path (Get-Location).Path $KeywordsDir) "rfkw-$fullPrefix.txt"
    if (Test-Path $kwScript) {
        & $kwScript -StatsFile $statsPath -OutputFile $kwFile -SessionName $SessionName
        Write-Host "  Keywords: $kwFile" -ForegroundColor Green
    }
} else {
    Write-Host "[STEP 2/4] Keywords SKIPPED (no STATS or insufficient data)" -ForegroundColor Yellow
}

if (-not $SkipLostSouls) {
    Write-Host "[STEP 3/4] Scanning for LostSouls..." -ForegroundColor Yellow
    $lsScript = Join-Path $PSScriptRoot "extract-lostsouls.ps1"
    $lsFile = Join-Path (Join-Path (Get-Location).Path $LostSoulsDir) "lostsouls-$fullPrefix.md"
    if (Test-Path $lsScript) {
        & $lsScript -ILogFile $ILogPath -OutputFile $lsFile -SessionName $SessionName
        Write-Host "  LostSouls: $lsFile" -ForegroundColor Green
    }
} else {
    Write-Host "[STEP 3/4] LostSouls SKIPPED" -ForegroundColor Yellow
}

Write-Host "[STEP 4/4] Creating pipeline artifacts..." -ForegroundColor Yellow
$pipelineFile = Join-Path (Join-Path (Get-Location).Path $PipelineDir) "pipeline-$fullPrefix.json"
$handoffFile = Join-Path (Join-Path (Get-Location).Path $PipelineDir) "handoff-$fullPrefix-to-NEXT.json"

$pipelineObj = @{
    name = $SessionName
    timestamp = (Get-Date -Format "o")
    irl = $ILogPath
    irl_colorized = Join-Path $OutputDir "$fullPrefix-COLORIZED.md"
    irl_stats = Join-Path $OutputDir "$fullPrefix-STATS.json"
    open_items = @()
    keywords_file = Join-Path $KeywordsDir "rfkw-$fullPrefix.txt"
    lost_souls_file = Join-Path $LostSoulsDir "lostsouls-$fullPrefix.md"
}
if ($stats) {
    $pipelineObj.audit = @{
        SOULcount = $stats.SOULcount
        DNAcount = $stats.DNAcount
        REASONcount = $stats.REASONcount
        total_chars = $stats.total_chars
        total = $stats.parsed_lines
    }
}

$pipelineObj | ConvertTo-Json -Depth 3 | Set-Content $pipelineFile -Encoding UTF8
Write-Host "  Pipeline: $pipelineFile" -ForegroundColor Green

Write-Host "[STEP 5/5] Updating inverted index..." -ForegroundColor Yellow
$idxScript = Join-Path $PSScriptRoot "update-inverted-index.ps1"
if (Test-Path $idxScript) {
    & $idxScript -IndexFile (Join-Path (Get-Location).Path $IndexFile) -RfkwDir (Join-Path (Get-Location).Path $KeywordsDir)
}

if ($PromoteToNav) {
    Write-Host "[PROMOTE] Promoting to I-LOG-NAV..." -ForegroundColor Magenta
    $navDir = Join-Path (Get-Location).Path "I-LOG-NAV"
    if (-not (Test-Path $navDir)) { New-Item -ItemType Directory -Path $navDir -Force | Out-Null }
    
    $filesToPromote = @(
        $ILogPath,
        (Join-Path (Join-Path (Get-Location).Path $OutputDir) "$fullPrefix-COLORIZED.md"),
        (Join-Path (Join-Path (Get-Location).Path $OutputDir) "$fullPrefix-STATS.json"),
        (Join-Path (Join-Path (Get-Location).Path $PipelineDir) "pipeline-$fullPrefix.json"),
        (Join-Path (Join-Path (Get-Location).Path $KeywordsDir) "rfkw-$fullPrefix.txt"),
        (Join-Path (Join-Path (Get-Location).Path $LostSoulsDir) "lostsouls-$fullPrefix.md")
    )
    foreach ($f in $filesToPromote) {
        if (Test-Path $f) {
            $dest = Join-Path $navDir (Split-Path -Leaf $f)
            Copy-Item $f $dest -Force
            Write-Host "  -> $dest" -ForegroundColor Gray
        }
    }
    Write-Host "  Promotion complete." -ForegroundColor Green
}

Write-Host $sep -ForegroundColor Cyan
Write-Host "PIPELINE COMPLETE - $SessionName" -ForegroundColor Green
Write-Host $sep -ForegroundColor Cyan