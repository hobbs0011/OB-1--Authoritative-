# synch-hook.ps1 — AUTOMATIC SYNCHRONIZATION LIFECYCLE HOOK
# Called pre-command and post-command by Rise / Scout / March / Supply / Scholar / Death.
# Never modifies existing command output. Append-only phetrail + state marker.
#
# Usage:
#   synch-hook.ps1 -Stage pre|post -Command Rise|Scout|March|Supply|Scholar|Death [-Run N] [-DryRun]
#
# Contract:
#   PRE  — reconcile SYNCH-STATE.md dirty-tree marker, write phetrail stage='pre-<command>'
#   POST — append stage='post-<command>' phetrail, verify HEAD matches recorded pre-state

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('pre','post')]
    [string]$Stage,

    [Parameter(Mandatory=$true)]
    [ValidateSet('Rise','Scout','March','Supply','Scholar','Death')]
    [string]$Command,

    [int]$Run = 165,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$repoRoot = "D:\OB-1-CANONICAL"
$synchStatePath = Join-Path $repoRoot "SYNCH-STATE.md"
$phetrailDir   = Join-Path $repoRoot "CANON\PHEROMONES"
$timestamp     = Get-Date -Format 'yyyy-MM-ddTHH:mm:ss.fffffffK'
$head          = git rev-parse --short HEAD
$phetrailId    = "PheTrail-run{0:D3}-synch-{1}-{2}-{3}" -f $Run, $timestamp.Replace(':','').Replace('-','').Replace('.',''), $Command.ToLower(), $Stage

function Write-SynchPhetrail {
    param([string]$Stage, [string]$Command, [string]$Run, [string]$Head)
    $trail = [ordered]@{
        schema_version = "2.1"
        run_number     = [int]$Run
        head_sha       = $Head
        soulcount      = $null
        extracted_at   = $timestamp
        stage          = $Stage
        command        = $Command
        action         = "synch-hook"
        artifact       = "SYNCH-STATE.md"
        verification   = "HEAD=$Head timestamp=$timestamp"
        result         = "SYNCHED"
    } | ConvertTo-Json -Depth 4 -Compress
    $path = Join-Path $phetrailDir ("{0}.json" -f $phetrailId)
    if (-not $DryRun) {
        Set-Content -LiteralPath $path -Value $trail -Encoding UTF8
    }
    return $path
}

if ($Stage -eq 'pre') {
    # Record pre-command HEAD for post-command divergence check
    $markerPath = Join-Path $repoRoot ".kilo\synch-pre-{0}.json" -f $Command
    $marker = [ordered]@{ command=$Command; run=$Run; head=$head; timestamp=$timestamp } | ConvertTo-Json -Compress
    if (-not $DryRun) {
        Set-Content -LiteralPath $markerPath -Value $marker -Encoding UTF8
    }
    $trailPath = Write-SynchPhetrail -Stage $Stage -Command $Command -Run $Run -Head $head
    Write-Host "SYNCH PRE [$Command] head=$head marker=$markerPath trail=$trailPath"
} else {
    # POST: compare HEAD to pre-command marker
    $markerPath = Join-Path $repoRoot ".kilo\synch-pre-{0}.json" -f $Command
    $preHead = $null
    if (Test-Path $markerPath) {
        $pre = Get-Content $markerPath -Raw | ConvertFrom-Json
        $preHead = $pre.head
    }
    $diverged = $preHead -ne $head
    $trailPath = Write-SynchPhetrail -Stage $stage -Command $Command -Run $Run -Head $head
    $result = if ($diverged) { "DRIFT_DETECTED" } else { "SYNCHED" }
    Write-Host "SYNCH POST [$Command] head=$head pre=$preHead diverged=$diverged result=$result trail=$trailPath"
}
