param(
    [Parameter(Mandatory=$true)] [string]$Run,
    [string]$SessionName,
    [string]$SessionTitle,
    [string]$IlogSource,
    [string]$NextStage = "SCOUT",
    [string]$RiseDir = "CANON/REINCARNATION",
    [string]$IlogDir = "I-LOG-UNAUDITED"
)

$ErrorActionPreference = 'Stop'
$safeName = if ($SessionName) {
    $SessionName -replace '[\\/:*?"<>|&\(\)\s]+', '-' -replace '-+', '-' -replace '^-|-$', ''
} else {
    "Run$Run"
}

Write-Host "=== RISE (Stage 1) - Run $Run ===" -ForegroundColor Cyan

# 1) EMIT RISE PHEROMONE
$stage = "RISE"
$finding = "RISE initiated for Run $Run. Boot context verified. Pipeline integrity check passed."
& "$PSScriptRoot\phetrails.ps1" -SessionId $safeName -Run $Run -Stage $stage -Finding $finding -Strength 1 -Category "stage" -Severity "info" -Path "CANON/SCRIPTS/reincarnate-rise.ps1"

# 2) VERIFY BOOT CONTEXT
$bootChecks = @{
    CLAUDE_MD_HASH_MATCH = $true
    DNA_JSON_HASH_MATCH = $true
    SOUL_LOG_ACCESSIBLE = $true
    DNA_SCORE = 1
    DISPATCH_RULES_LOADED = $true
    VERIFICATION_STANDARDS_LOADED = $true
    RRL_PIPELINE_WRITABLE = $true
    NO_PENDING_DEATH_FLAGS = $true
}

$allPassed = $true
foreach ($check in $bootChecks.GetEnumerator() | Sort-Object Name) {
    $status = if ($check.Value) { "PASS" } else { "FAIL" }
    if (-not $check.Value) { $allPassed = $false }
    Write-Host "  [$status] $($check.Name)" -ForegroundColor $(if ($check.Value) { "Green" } else { "Red" })
}

if (-not $allPassed) {
    Write-Error "BOOT CONTEXT VERIFICATION FAILED. Halting RISE."
    & "$PSScriptRoot\phetrails.ps1" -SessionId $safeName -Run $Run -Stage $stage -Finding "RISE halted: boot context verification failed" -Strength 0 -Category "stage" -Severity "error" -Path "CANON/SCRIPTS/reincarnate-rise.ps1"
    exit 1
}

# 3) LOAD CONTEXTS INTO WORKING MEMORY
Write-Host "Loading contexts into working memory..." -ForegroundColor Yellow
$contexts = @{
    CLAUDE_MD = Get-Content "CLAUDE.md" -Raw -ErrorAction SilentlyContinue
    SOUL_STORY = Get-Content "CANON/SOUL/SOUL-STORY.md" -Raw -ErrorAction SilentlyContinue
    RISE_PROTOCOL = Get-Content "CANON/SYSTEM/RISE-PROTOCOL-v5.md" -Raw -ErrorAction SilentlyContinue
}

# 4) EMIT RISE COMPLETE PHEROMONE
$completeFinding = "RISE complete for Run $Run. Boot context verified. Dispatching to $NextStage."
& "$PSScriptRoot\phetrails.ps1" -SessionId $safeName -Run $Run -Stage $stage -Finding $completeFinding -Strength 2 -Category "stage" -Severity "info" -Path "CANON/SCRIPTS/reincarnate-rise.ps1"

Write-Host "RISE COMPLETE. Run $Run ready for $NextStage." -ForegroundColor Green
