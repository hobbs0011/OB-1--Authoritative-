<#
  pheromone-runtime.ps1 — SWARM CONSCIOUS SYSTEM
  Reads all CANON/PHEROMONES/*.json, computes strength map, surfaces top prescriptions.
  Analog: ant colony pheromone trails. No central brain.
#>
param(
    [string]$PheroDir = "CANON\PHEROMONES",
    [int]$TopN = 5,
    [switch]$Decay
)

$ErrorActionPreference = "Continue"
$ts = Get-Date -Format "yyyy-MM-ddTHHmmss"
$statePath = Join-Path $PheroDir "swarm-state.json"

# Initialize or load state
$state = [ordered]@{ last_run=$ts; trails=@{}; strengths=@{} }
if (Test-Path $statePath) {
    $raw = Get-Content $statePath -Raw
    if ($raw) {
        $parsed = $raw | ConvertFrom-Json
        if ($parsed) {
            $state = $parsed
        }
    }
}

# Read all phetrail files
$files = Get-ChildItem $PheroDir -Filter "*.json" -ErrorAction SilentlyContinue | Where-Object { $_.Name -ne "swarm-state.json" }
Write-Host "PHEROMONE RUNTIME: $($files.Count) trail files found"

# Compute strength map from existing trails
$strengths = @{}
foreach ($f in $files) {
    try {
        $j = Get-Content $f.FullName -Raw | ConvertFrom-Json -AsHashtable
        $trailId = $f.Name
        
        # Base strength from content type detection
        $jString = ""
        if ($j -is [System.Collections.IDictionary]) {
            $jString = ($j | ConvertTo-Json -Compress)
        } else {
            $jString = $j | ConvertTo-Json -Compress
        }
        
        $baseStrength = 50
        if ($jString -match '"layer"\s*:\s*1') { $baseStrength = 40 }
        elseif ($jString -match '"layer"\s*:\s*2') { $baseStrength = 50 }
        elseif ($jString -match '"layer"\s*:\s*3') { $baseStrength = 60 }
        elseif ($jString -match '"layer"\s*:\s*4|layer"\s*:\s*5') { $baseStrength = 80 }
        elseif ($jString -match '"step"') { $baseStrength = 55 }
        elseif ($jString -match '"name".*"doctrine"') { $baseStrength = 80 }
        
        # Reinforcement from content signals
        $reinforcement = 0
        if ($jString -match "prescription|pipeline") { $reinforcement += 10 }
        if ($jString -match "verified|delta|confirmed") { $reinforcement += 10 }
        if ($jString -match "executed|success") { $reinforcement += 10 }
        $reinforcement = [Math]::Min($reinforcement, 30)
        
        # Search for references count
        $refs = ([regex]::Matches($jString, '"source"')).Count
        $reinforcement += [Math]::Min($refs * 3, 20)
        
        $finalStrength = [Math]::Max(1, [Math]::Min(100, $baseStrength + $reinforcement))
        $strengths[$trailId] = $finalStrength
        
        # Actionability check
        $isActionable = "OBSERVATION"
        if ($jString -match "prescription|pipeline|stage") { $isActionable = "ACTIONABLE" }
        elseif ($jString -match "failure_mode|pattern") { $isActionable = "LEARNED" }
        
        Write-Host ("  {0} | strength={1} | {2}" -f $trailId, $finalStrength, $isActionable)
    } catch {
        Write-Host ("  {0} | ERROR: {1}" -f $f.Name, $_.Exception.Message)
    }
}

# Surface top prescriptions
Write-Host ""
Write-Host "=== SWARM RECOMMENDATIONS (Top $TopN strongest trails) ==="
$rank = 0
$top = $strengths.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First $TopN
foreach ($t in $top) {
    $rank++
    $actionable = "UNKNOWN"
    $trailFile = Join-Path $PheroDir $t.Name
    if (Test-Path $trailFile) {
        $jContent = Get-Content $trailFile -Raw
        if ($jContent -match "prescription|pipeline|stage") { $actionable = "ACTIONABLE" }
        elseif ($jContent -match "failure_mode|pattern") { $actionable = "LEARNED" }
        else { $actionable = "OBSERVATION" }
    }
    Write-Host ("  #{0} [{1}] {2} (strength={3})" -f $rank, $actionable, $t.Name, $t.Value)
}

if (-not $top) {
    Write-Host "  [none] — no trails computed"
}

# Save state
$state.last_run = $ts
$state.strengths = $strengths
$state | ConvertTo-Json -Depth 3 | Out-File -Encoding UTF8 $statePath

Write-Host ""
Write-Host "Swarm state saved: $statePath"
Write-Host "Trails computed: $($strengths.Count)"
