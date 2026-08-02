param(
    [Parameter(Mandatory=$true)] [string]$SessionName,
    [Parameter(Mandatory=$true)] [string]$ILogPath,
    [string]$OutputDir = "I-LOG-UNAUDITED",
    [string]$KeywordsDir = "CANON/SOUL-KEYWORDS",
    [string]$LostSoulsDir = "CANON/LOSTSOULS",
    [string]$PipelineDir = "CANON/REINCARNATION",
    [string]$IndexFile = "CANON/SOUL-KEYWORDS/inverted-index.json",
    [string]$AuditFile = "",
    [switch]$PromoteToNav,
    [switch]$SkipColorize,
    [switch]$SkipKeywords,
    [switch]$SkipLostSouls
)

$ErrorActionPreference = 'Stop'
$nl = [Environment]::NewLine
$repo = (Get-Location).Path

# Validate inputs
if (-not (Test-Path $ILogPath)) { throw "I-LOG not found: $ILogPath" }
$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "WORKHORSE PIPELINE — $SessionName" -ForegroundColor Green
Write-Host "I-LOG: $ILogPath" -ForegroundColor Gray
Write-Host "=" * 60 -ForegroundColor Cyan

# STEP 1: COLORIZED + STATS
if (-not $SkipColorize) {
    Write-Host "`n[STEP 1/4] Colorizing I-LOG..." -ForegroundColor Yellow
    $colorizeScript = Join-Path $PSScriptRoot "rrl-colorize.ps1"
    if (Test-Path $colorizeScript) {
        $stats = & $colorizeScript -InputFile $ILogPath
        Write-Host "  COLORIZED: $(Join-Path $OutputDir "$SessionName-COLORIZED.md")" -ForegroundColor Green
        Write-Host "  STATS: $(Join-Path $OutputDir "$SessionName-STATS.json")" -ForegroundColor Green
    } else {
        Write-Warning "  rrl-colorize.ps1 not found — skipping colorize"
        $stats = $null
    }
} else {
    Write-Host "`n[STEP 1/4] Colorize SKIPPED" -ForegroundColor Yellow
    $stats = $null
}

# Read STATS if available
if (-not $stats) {
    $statsPath = Join-Path $repo $OutputDir "$SessionName-STATS.json"
    if (Test-Path $statsPath) {
        $stats = Get-Content $statsPath -Raw | ConvertFrom-Json
    }
}

# STEP 2: KEYWORD EXTRACTION
if ((-not $SkipKeywords) -and $stats -and $stats.top_topics.Count -ge 10) {
    Write-Host "`n[STEP 2/4] Extracting keywords..." -ForegroundColor Yellow
    $kwScript = Join-Path $PSScriptRoot "extract-keywords.ps1"
    $kwFile = Join-Path $repo $KeywordsDir "rfkw-$SessionName.txt"
    if (Test-Path $kwScript) {
        & $kwScript -StatsFile $statsPath -OutputFile $kwFile -SessionName $SessionName
        Write-Host "  Keywords: $kwFile" -ForegroundColor Green
    }
} else {
    Write-Host "`n[STEP 2/4] Keywords SKIPPED (no STATS or insufficient data)" -ForegroundColor Yellow
}

# STEP 3: LOSTSOULS SCAN
if (-not $SkipLostSouls) {
    Write-Host "`n[STEP 3/4] Scanning for LostSouls..." -ForegroundColor Yellow
    $lsScript = Join-Path $PSScriptRoot "extract-lostsouls.ps1"
    $lsFile = Join-Path $repo $LostSoulsDir "lostsouls-$SessionName.md"
    if (Test-Path $lsScript) {
        & $lsScript -ILogFile $ILogPath -OutputFile $lsFile -SessionName $SessionName
        Write-Host "  LostSouls: $lsFile" -ForegroundColor Green
    }
} else {
    Write-Host "`n[STEP 3/4] LostSouls SKIPPED" -ForegroundColor Yellow
}

# STEP 4: PIPELINE + HANDOFF JSONS
Write-Host "`n[STEP 4/4] Creating pipeline artifacts..." -ForegroundColor Yellow
$pipelineFile = Join-Path $repo $PipelineDir "pipeline-$SessionName.json"
$handoffFile = Join-Path $repo $PipelineDir "handoff-$SessionName-to-NEXT.json"

$pipelineObj = @{
    name = $SessionName
    timestamp = (Get-Date -Format "o")
    irl = $ILogPath
    irl_colorized = Join-Path $OutputDir "$SessionName-COLORIZED.md"
    irl_stats = Join-Path $OutputDir "$SessionName-STATS.json"
    open_items = @()
    keywords_file = "$KeywordsDir/rfkw-$SessionName.txt"
    lost_souls_file = "$LostSoulsDir/lostsouls-$SessionName.md"
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

# STEP 5: UPDATE INVERTED INDEX
Write-Host "`n[STEP 5/5] Updating inverted index..." -ForegroundColor Yellow
$idxScript = Join-Path $PSScriptRoot "update-inverted-index.ps1"
if (Test-Path $idxScript) {
    & $idxScript -IndexFile (Join-Path $repo $IndexFile) -RfkwDir (Join-Path $repo $KeywordsDir)
}

# STEP 6: PROMOTE TO I-LOG-NAV (optional)
if ($PromoteToNav) {
    Write-Host "`n[PROMOTE] Promoting to I-LOG-NAV..." -ForegroundColor Magenta
    $navDir = Join-Path $repo "I-LOG-NAV"
    if (-not (Test-Path $navDir)) { New-Item -ItemType Directory -Path $navDir -Force | Out-Null }
    
    $filesToPromote = @(
        $ILogPath,
        (Join-Path $OutputDir "$SessionName-COLORIZED.md"),
        (Join-Path $OutputDir "$SessionName-STATS.json"),
        (Join-Path $PipelineDir "pipeline-$SessionName.json"),
        (Join-Path $KeywordsDir "rfkw-$SessionName.txt"),
        (Join-Path $LostSoulsDir "lostsouls-$SessionName.md")
    )
    foreach ($f in $filesToPromote) {
        $fullPath = Join-Path $repo $f
        if (Test-Path $fullPath) {
            $dest = Join-Path $navDir (Split-Path -Leaf $fullPath)
            Copy-Item $fullPath $dest -Force
            Write-Host "  -> $dest" -ForegroundColor Gray
        }
    }
    Write-Host "  Promotion complete." -ForegroundColor Green
}

Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "PIPELINE COMPLETE — $SessionName" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan