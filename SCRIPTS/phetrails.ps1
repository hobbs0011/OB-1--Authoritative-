<#
  phetrails.ps1 — Pheromone Trail Extraction v2.1
  STAGE III: AGMEN — PHEROMONE Broadcast
  Run authority: git (L29). Zero-pad. Contract 1.2 paths.
#>
param(
    [switch]$DryRun,
    [int]$LookbackDays = 30
)

$ErrorActionPreference = "Stop"
$repoRoot = "D:\OB-1-CANONICAL"
$D1      = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$ts      = Get-Date -Format "yyyy-MM-ddTHHmmss"
$iso     = Get-Date -Format "o"

function Invoke-Report { param([string]$Msg,[string]$Severity="INFO")
    Write-Host ("  [{0}] {1}" -f $Severity,$Msg)
}

# ── RUN AUTHORITY (git, zero-pad) ─────────────────────────────────────────────
$lastDeathLine = git log --oneline --grep "^death:" -1 $repoRoot 2>$null
$priorRun = 0
if ($lastDeathLine -match 'run\s*(\d+)') { $priorRun = [int]$matches[1] }
$run    = $priorRun + 1
$runPad = "{0:D3}" -f $run

# ── PATHS ─────────────────────────────────────────────────────────────────────
$pherDir     = Join-Path $repoRoot "CANON\PHEROMONES"
$registryDir = Join-Path $repoRoot "CANON\Dna-REGISTRY"
$registryIdx = Join-Path $registryDir "registry-index.json"
$snapshot    = Join-Path $repoRoot "CANON\HEAVY-LEDGER\STATE-SNAPSHOT.json"
$boot        = Join-Path $repoRoot "CANON\SYSTEM\COLD-START-BOOT.md"
$phetrailPath= Join-Path $pherDir "PheTrail-run$runPad.json"

if (-not (Test-Path $pherDir)) { New-Item -ItemType Directory -Path $pherDir -Force | Out-Null }

# ── STATE MARKERS (neutral) ───────────────────────────────────────────────────
$headSha = (git -C $repoRoot rev-parse --short HEAD 2>$null).Trim()
$soulcount = $null
try {
    $resp = Invoke-RestMethod "$D1/api/soul/count" -TimeoutSec 10 -ErrorAction Stop
    $soulcount = $resp.soulcount
} catch {
    Invoke-Report "SOULCOUNT unreachable: $($_.Exception.Message)" "WARN"
}

$registryEntries = 0
if (Test-Path $registryIdx) {
    try {
        $regData = Get-Content $registryIdx -Raw -ErrorAction Stop | ConvertFrom-Json
        $registryEntries = if ($regData.total_entries) { [int]$regData.total_entries } else { $regData.entries.Count }
    } catch {}
}

$activeMission = ""
$openFlagsCount = 0
$topPriority = ""
if (Test-Path $snapshot) {
    try {
        $snap = Get-Content $snapshot -Raw -ErrorAction Stop | ConvertFrom-Json
        $activeMission = if ($snap.active_mission.name) { $snap.active_mission.name } else { "" }
        if ($snap.active_mission.open_flags) { $openFlagsCount = @($snap.active_mission.open_flags).Count }
    } catch {}
}
if (-not $activeMission -and (Test-Path $boot)) {
    $bootLines = Get-Content $boot -ErrorAction SilentlyContinue
    foreach ($l in $bootLines) {
        if ($l -match "Active mission:") { $activeMission = $l.Trim(); break }
    }
}

$stateMarkers = [ordered]@{
    active_mission    = $activeMission
    open_flags_count  = $openFlagsCount
    top_priority      = $topPriority
    registry_entries  = $registryEntries
    head_sha          = $headSha
    soulcount         = $soulcount
    extracted_at      = $iso
}

# ── POSITIVE TRAILS ──────────────────────────────────────────────────────────
$positive = @()
$since = (Get-Date).AddDays(-$LookbackDays).ToString("yyyy-MM-dd")

$recentCommits = git log --oneline --since="$since" $repoRoot 2>$null
foreach ($c in $recentCommits) {
    if ($c -match 'deploy|wrangler|production|live') {
        $positive += [ordered]@{
            artifact      = "git:" + $c.Split(' ')[1]
            action        = $c.Trim()
            verification  = "git log since $since"
            timestamp     = $iso
        }
    }
}

# Scan OPERATIONS/ for recent reports (last 7 days)
$opsDir = Join-Path $repoRoot "OPERATIONS"
if (Test-Path $opsDir) {
    $cutoff = (Get-Date).AddDays(-7)
    Get-ChildItem $opsDir -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.LastWriteTime -gt $cutoff) {
            $positive += [ordered]@{
                artifact      = $_.FullName.Replace("$repoRoot\", "")
                action        = "Recent operational artifact"
                verification  = "LastWriteTime=$($_.LastWriteTime)"
                timestamp     = $iso
            }
        }
    }
}

# ── NEGATIVE TRAILS ──────────────────────────────────────────────────────────
$negative = @()

# phetrail gaps: missing runs in sequence
$lastDeath = git log --oneline --grep "^death:" --all $repoRoot 2>$null |
    ForEach-Object { if ($_ -match 'run\s*(\d+)') { [int]$matches[1] } }
$maxRun = if ($lastDeath) { $lastDeath | Measure-Object -Maximum | Select-Object -ExpandProperty Maximum } else { 0 }
$missing = 1..$maxRun | Where-Object { $_ -notin $lastDeath }
foreach ($m in $missing) {
    $negative += [ordered]@{
        artifact     = "CANON/PHEROMONES/PheTrail-run{0:D3}.json" -f $m
        failure      = "Missing phetrail for run $m"
        root_cause   = "No death seal recorded for run $m; trail gap"
        decay_days   = 180
        timestamp    = $iso
    }
}

# Encoding issues in SCRIPTS/
$scriptsDir = Join-Path $repoRoot "SCRIPTS"
if (Test-Path $scriptsDir) {
    Get-ChildItem $scriptsDir -Filter "*.ps1" -File -ErrorAction SilentlyContinue | ForEach-Object {
        $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
            $negative += [ordered]@{
                artifact     = $_.FullName.Replace("$repoRoot\", "")
                failure      = "UTF-8 BOM present"
                root_cause   = "Script saved with UTF-8 BOM; PowerShell may misparse first line"
                decay_days   = 180
                timestamp    = $iso
            }
        }
    }
}

# State snapshot drift
if (Test-Path $snapshot) {
    $snapSha = ""
    try {
        $snap = Get-Content $snapshot -Raw -ErrorAction Stop | ConvertFrom-Json
        $snapSha = $snap.run.head_sha
    } catch {}
    if ($snapSha -and $snapSha -ne $headSha) {
        $negative += [ordered]@{
            artifact     = "CANON/HEAVY-LEDGER/STATE-SNAPSHOT.json"
            failure      = "HEAD mismatch: snapshot=$snapSha actual=$headSha"
            root_cause   = "STATE-SNAPSHOT not updated after git operations"
            decay_days   = 180
            timestamp    = $iso
        }
    }
}

# ── BUILD PAYLOAD ─────────────────────────────────────────────────────────────
$phetrail = [ordered]@{
    schema_version    = "2.0"
    run_number        = $runPad
    extracted_at      = $iso
    head_sha          = $headSha
    soulcount         = $soulcount
    registry_entries  = $registryEntries
    positive_trails   = $positive
    negative_trails   = $negative
    state_markers     = $stateMarkers
}

# ── WRITE ─────────────────────────────────────────────────────────────────────
if ($DryRun) {
    Invoke-Report "DRY-RUN: Would write $phetrailPath" "INFO"
    $phetrail | ConvertTo-Json -Depth 5 | Write-Output
    exit 0
}

try {
    $jsonTest = $phetrail | ConvertTo-Json -Depth 5 | ConvertFrom-Json
    $phetrail | ConvertTo-Json -Depth 5 | Set-Content $phetrailPath -Encoding UTF8
    Invoke-Report "PHETRAIL WRITTEN: $phetrailPath" "OK"
} catch {
    Invoke-Report "PHETRAIL_WRITE_FAILED - $($_.Exception.Message)" "ERR"
    Write-Host "  -> DEATH should seal with PHETRAIL_WRITE_GAP; RISE back-fills next time"
    exit 1
}
