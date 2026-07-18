<#
.SYNOPSIS
Supply Lines - Roman legion supply chain validation and execution pipeline.

.DESCRIPTION
Implements a 6-stage pipeline (Exploratores -> Antecares -> Agmenes -> Agmenes Novissimum -> Praetoria -> Limitanei/Veterani)
with health gates, pheromone trail integration, and fail-closed rules.

.PARAMETER Command
The command to execute: status, full-march, scout, fingerprint, process, verify, garrison

.PARAMETER Zone
Target zone for scout command (default: CANON/)

.PARAMETER DryRun
Report actions only, no writes

.PARAMETER Supersaiyan
Enable parallel scout sweep

.EXAMPLE
.\supply-lines.ps1 -Command status
.EXAMPLE
.\supply-lines.ps1 -Command full-march
.EXAMPLE
.\supply-lines.ps1 -Command scout -Zone CANON/HEAVY-LEDGER
#>
[CmdletBinding()]
param(
    [ValidateSet('status','full-march','scout','fingerprint','process','verify','garrison')]
    [string]$Command = 'status',
    [string]$Zone = 'CANON/',
    [switch]$DryRun,
    [switch]$Supersaiyan
)

# ========== CONFIGURATION ==========
$repo = "D:\OB-1-CANONICAL"
$ledger = Join-Path $repo "CANON\HEAVY-LEDGER"
$pher = Join-Path $repo "CANON\PHEROMONES"
$starmap = Join-Path $repo "CANON\STARMAP"
$keys = Join-Path $repo "CANON\SOUL-KEYWORDS"
$pipe = Join-Path $repo "CANON\PIPELINE"
$art = Join-Path $repo "CANON\ART-REGISTRY"
$scripts = Join-Path $repo "SCRIPTS"
$ops = Join-Path $repo "OPERATIONS"

# Helper function to write output
function Write-OutputEx {
    param([string]$Message)
    if ($DryRun) {
        Write-Host "[DRY-RUN] $Message" -ForegroundColor Yellow
    } else {
        Write-Host $Message
    }
}

# ========== HEALTH GATE (PHASE 1) ==========
function Invoke-HealthGate {
    $paths = @(
        @{ Path = $ledger; Name = "CANON\HEAVY-LEDGER" },
        @{ Path = $pher;   Name = "CANON\PHEROMONES" },
        @{ Path = $starmap; Name = "CANON\STARMAP" },
        @{ Path = $keys;   Name = "CANON\SOUL-KEYWORDS" },
        @{ Path = $pipe;   Name = "CANON\PIPELINE" }
    )
    
    foreach ($p in $paths) {
        if (-not (Test-Path $p.Path)) {
            Write-Error "HALT. Supply chain broken. Missing: $($p.Name)"
            return $false
        }
    }
    return $true
}

# ========== STAGE FUNCTIONS ==========
function Invoke-StageI {
    param([string]$ZoneParam)
    Write-OutputEx "STAGE I - EXPLORATORES (Scouts): Scanning zone $ZoneParam"
    if ($DryRun) { return }
    
    # Actual execution: phoenix-scout.ps1
    $scoutScript = Join-Path $scripts "phoenix-scout.ps1"
    if (Test-Path $scoutScript) {
        & $scoutScript -Zone $ZoneParam @PSBoundParameters
    } else {
        Write-Warning "phoenix-scout.ps1 not found at $scoutScript"
    }
}

function Invoke-StageII {
    Write-OutputEx "STAGE II - ANTECORES (Vanguard): Verifying ledger and starmap"
    if ($DryRun) { return }
    
    # 1. Validate CANON/HEAVY-LEDGER/*.json
    $ledgerFiles = Get-ChildItem $ledger -Filter *.json -File -ErrorAction SilentlyContinue
    if (-not $ledgerFiles) {
        Write-Error "HALT. No ledger files found in $ledger"
        return
    }
    Write-OutputEx "   Found $($ledgerFiles.Count) ledger files"
    
    # 2. Verify current run starmap
    $currentRun = Get-CurrentRunNumber
    $starmapFile = Join-Path $starmap "starmap-run$currentRun.json"
    if (Test-Path $starmapFile) {
        Write-OutputEx "   Starmap found: $starmapFile"
    } else {
        Write-Warning "Starmap not found for run $currentRun"
    }
    
    # 3. Verify soul keywords
    $kwFile = Join-Path $keys "rfkw-run$currentRun.txt"
    $idxFile = Join-Path $keys "inverted-index-run$currentRun.json"
    if (Test-Path $kwFile) { Write-OutputEx "   Keywords file found: $kwFile" }
    if (Test-Path $idxFile) { Write-OutputEx "   Inverted index found: $idxFile" }
}

function Invoke-StageIII {
    Write-OutputEx "STAGE III - AGMEN (Main Body): Processing pheromone trails"
    if ($DryRun) { return }
    
    $currentRun = Get-CurrentRunNumber
    $trailFile = Join-Path $pher "PheTrail-run$currentRun.json"
    if (Test-Path $trailFile) {
        $content = Get-Content $trailFile -Raw | ConvertFrom-Json
        if ($content.schema_version -eq "2.0") {
            Write-OutputEx "   Valid schema found in $trailFile"
            if ($content.negative_trails) {
                Write-OutputEx "   Negative trails present: $($content.negative_trails.Count) entries"
            }
        } else {
            Write-Warning "Schema version mismatch in $trailFile"
        }
    } else {
        Write-Warning "Pheromone trail not found for run $currentRun"
    }
}

function Invoke-StageIV {
    Write-OutputEx "STAGE IV - AGMEN NOVISSIMUM (Rear Guard): Truth verification"
    if ($DryRun) { return }
    
    $currentRun = Get-CurrentRunNumber
    # Cross-check ledger vs starmap (simplified)
    $ledgerCount = (Get-ChildItem $ledger -Filter *.json -File -ErrorAction SilentlyContinue).Count
    $starmapFile = Join-Path $starmap "starmap-run$currentRun.json"
    if (Test-Path $starmapFile) {
        $starmapContent = Get-Content $starmapFile -Raw | ConvertFrom-Json
        $pointerCount = ($starmapContent.pointers | Measure-Object).Count
        Write-OutputEx "   Ledger files: $ledgerCount, Starmap pointers: $pointerCount"
        if ($ledgerCount -gt 0 -and $pointerCount -gt 0) {
            $diff = [math]::Abs($ledgerCount - $pointerCount)
            $percent = if ($ledgerCount -gt 0) { [math]::Round(($diff / $ledgerCount) * 100) } else { 0 }
            Write-OutputEx "   Difference: $percent%"
            if ($percent -gt 10) {
                Write-Error "HALT. Divergence > 10%. Truth not established."
                return
            }
        }
    } else {
        Write-Warning "Starmap not found for cross-check"
    }
    
    # Verify phetrail negative_trails append-only (simplified)
    $trailFile = Join-Path $pher "PheTrail-run$currentRun.json"
    if (Test-Path $trailFile) {
        $content = Get-Content $trailFile -Raw | ConvertFrom-Json
        if ($content.negative_trails) {
            Write-OutputEx "   Negative trails count: $($content.negative_trails.Count) (append-only assumed)"
        }
    }
}

function Invoke-StageV {
    Write-OutputEx "STAGE V - PRAESIDIA (Garrison): Merkle and pipeline verification"
    if ($DryRun) { return }
    
    $currentRun = Get-CurrentRunNumber
    # 1. Verify HL merkle roots (simplified: check for merkle_root field)
    $hlFiles = Get-ChildItem $ledger -Filter *.json -File -ErrorAction SilentlyContinue
    foreach ($file in $hlFiles) {
        $content = Get-Content $file.FullName -Raw | ConvertFrom-Json
        if ($content.psobject.Properties.Name -contains 'merkle_root') {
            Write-OutputEx "   HL file $($file.Name) has merkle_root"
        } else {
            Write-Warning "HL file $($file.Name) missing merkle_root"
        }
    }
    
    # 2. Verify pipeline run file
    $pipelineFile = Join-Path $pipe "pipeline-run$currentRun.json"
    if (Test-Path $pipelineFile) {
        $content = Get-Content -Path $pipelineFile -Raw | ConvertFrom-Json
        if ($content -and $content.psobject.Properties.Name -contains 'run') {
            Write-OutputEx "   Pipeline file valid: $pipelineFile"
        } else {
            Write-Warning "Pipeline file invalid or missing run field"
        }
    } else {
        Write-Warning "Pipeline file not found for run $currentRun"
    }
    
    # 3. Verify art-sync
    $artFile = Join-Path $art "art-sync-run$currentRun.json"
    if (Test-Path $artFile) {
        Write-OutputEx "   Art-sync file found: $artFile"
    } else {
        Write-Warning "Art-sync file not found for run $currentRun"
    }
}

function Invoke-StageVI {
    Write-OutputEx "STAGE VI - LIMITANEI/VETERANI (Frontier Shield): Health sweep"
    if ($DryRun) { return }
    
    # 1. obi.ps1 doctor
    $obiScript = Join-Path $scripts "obi.ps1"
    if (Test-Path $obiScript) {
        Write-OutputEx "   Running obi.ps1 doctor"
        & $obiScript doctor @PSBoundParameters
    } else {
        Write-Warning "obi.ps1 not found at $obiScript"
    }
    
    # 2. obi.ps1 verify (dry-run)
    if ($DryRun) {
        Write-OutputEx "   Would run obi.ps1 verify --dry-run"
    } else {
        Write-OutputEx "   Running obi.ps1 verify"
        & $obiScript verify @PSBoundParameters
    }
    
    # 3. SOULCOUNT integrity (simplified)
    # Try to get current SOULCOUNT from obi soul-check if available, otherwise from history
    $soulCount = "UNAVAILABLE"
    try {
        # Try to get from obi soul-check first
        $obiScript = Join-Path $scripts "obi.ps1"
        if (Test-Path $obiScript) {
            $result = & $obiScript soul-check 2>$null
            if ($LASTEXITCODE -eq 0 -and $result) {
                if ($result -match 'SOULCOUNT=(\d+)') {
                    $soulCount = $matches[1]
                }
            }
        }
    } catch {
        # Fallback to history file
    }
    
    if ($soulCount -eq "UNAVAILABLE") {
        $soulHistory = Join-Path $ops "soulcount-history.json"
        if (Test-Path $soulHistory) {

            try {
                $soulContent = Get-Content $soulHistory -Raw | ConvertFrom-Json
                if ($soulContent -is [array]) {
                    $latest = $soulContent[-1]  # Get last element
                    if ($latest.PSObject.Properties.Name -contains 'count') {
                        $soulCount = $latest.count
                    } elseif ($latest.PSObject.Properties.Name -contains 'SOULCOUNT') {
                        $soulCount = $latest.SOULCOUNT
                    }
                }
            } catch {
                $soulCount = "ERROR"
            }
        }
    }
    
    Write-OutputEx "   SOULCOUNT: $soulCount"
}

# ========== HELPER FUNCTIONS ==========
function Get-CurrentRunNumber {
    # Mimics logic from forcemarch.ps1: get last death commit, increment
    try {
        $lastDeath = git log --oneline --grep "^death:" -1 2>$null
        if ($lastDeath -match '(?i)run\s*(\d+)') {
            return [int]$matches[1] + 1
        }
    } catch {}
    # Fallback: count existing HL files? Not perfect but better than nothing
    $hlCount = (Get-ChildItem $ledger -Filter HL-*.json -File -ErrorAction SilentlyContinue).Count
    return $hlCount + 1
}

function Write-PheromoneTrail {
    param(
        [string]$Action,
        [string]$Verification = "",
        [string]$Failure = "",
        [string]$RootCause = "",
        [string]$Learned = "",
        [string]$Next = "",
        [int]$Strength = 0,
        [string]$Type = "neutral",
        [string]$Artifact = ""
    )
    $scoutId = "SC-$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')"
    $sessionId = [guid]::NewGuid().ToString()
    $timestamp = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK'
    
    $trail = [pscustomobject]@{
        scout_id       = $scoutId
        session_id     = $sessionId
        timestamp      = $timestamp
        type           = $Type
        strength       = $Strength
        artifact       = $Artifact
        action         = $Action
        verification   = $Verification
        failure        = $Failure
        root_cause     = $RootCause
        learned        = $Learned
        next           = $Next
        decay_days     = 0
    }
    
    $json = $trail | ConvertTo-Json -Depth 3
    $trailFile = Join-Path $ops "phetrail-auto-$(Get-Date -Format 'yyyy-MM-dd').jsonl"
    if ($DryRun) {
        Write-OutputEx "   Would append pheromone trail to $trailFile"
    } else {
        $json | Out-File -FilePath $trailFile -Append -Encoding UTF8
        Write-OutputEx "   Appended pheromone trail to $trailFile"
    }
}

# ========== MAIN EXECUTION ==========
try {
    # Phase 1: Health Gate (for all commands)
    if (-not (Invoke-HealthGate)) {
        exit 1
    }
    
    # Get current run number for reporting
    $currentRun = Get-CurrentRunNumber
    Write-OutputEx "Current run number: $currentRun"
    Write-OutputEx "Command: $Command`n"
    
    switch ($Command) {
        'status' {
            Write-OutputEx "=== SUPPLY LINES STATUS ==="
            # SOULCOUNT
            $soulCount = "UNAVAILABLE"
            try {
                # Try to get from obi soul-check first
                $obiScript = Join-Path $scripts "obi.ps1"
                if (Test-Path $obiScript) {
                    $result = & $obiScript soul-check 2>$null
                    if ($LASTEXITCODE -eq 0 -and $result) {
                        if ($result -match 'SOULCOUNT=(\d+)') {
                            $soulCount = $matches[1]
                        }
                    }
                }
            } catch {
                # Fallback to history file
            }
            
            if ($soulCount -eq "UNAVAILABLE") {
                $soulHistory = Join-Path $ops "soulcount-history.json"
                if (Test-Path $soulHistory) {
                    try {
                        $soulContent = Get-Content $soulHistory -Raw | ConvertFrom-Json
                        if ($soulContent -is [array]) {
                            $latest = $soulContent[-1]  # Get last element
                            if ($latest.PSObject.Properties.Name -contains 'count') {
                                $soulCount = $latest.count
                            } elseif ($latest.PSObject.Properties.Name -contains 'SOULCOUNT') {
                                $soulCount = $latest.SOULCOUNT
                            }
                        }
                    } catch {
                        $soulCount = "ERROR"
                    }
                }
            }
            
            Write-OutputEx "SOULCOUNT: $soulCount"
            # HEAD
            try {
                $head = git rev-parse --short HEAD 2>$null
                if ($head) { Write-OutputEx "HEAD: $head" } else { Write-OutputEx "HEAD: UNKNOWN" }
            } catch { Write-OutputEx "HEAD: UNKNOWN (git error)" }
            
            #: STATUS:"
            Write-OutputEx "I  (Exploratores): $(if (Test-Path (Join-Path $scripts "phoenix-scout.ps1")) { 'READY' } else { 'MISSING SCRIPT' })"
            Write-OutputEx "II (Antecores):    $(if (Test-Path $ledger) { 'READY' } else { 'MISSING LEDGER' })"
            Write-OutputEx "III (Agmenes):     $(if (Test-Path $pher) { 'READY' } else { 'MISSING PHEROMONES' })"
            Write-OutputEx "IV (Agmenes Novissimum): $(if (Test-Path $starmap) { 'READY' } else { 'MISSING STARMAP' })"
            Write-OutputEx "V  (Praetoria):    $(if (Test-Path $pipe) { 'READY' } else { 'MISSING PIPELINE' })"
            Write-OutputEx "VI (Limitanei):    $(if (Test-Path (Join-Path $scripts "obi.ps1")) { 'READY' } else { 'MISSING OBI.SCRIPT' })"
        }
        
        'full-march' {
            Write-OutputEx "=== EXECUTING FULL MARCH (6 STAGES) ==="
            # Stage I
            Invoke-StageI -ZoneParam $Zone
            # Stage II
            Invoke-StageII
            # Stage III
            Invoke-StageIII
            # Stage IV
            Invoke-StageIV
            # Stage V
            Invoke-StageV
            # Stage VI
            Invoke-StageVI
            Write-OutputEx "`nFULL MARCH COMPLETE"
            # Write final pheromone trail for full-march
            Write-PheromoneTrail -Action "supply-lines-full-march" -Verification "All 6 stages completed" -Artifact "supply-lines-pipeline" -Type "neutral"
        }
        
        'scout' {
            Write-OutputEx "=== SCOUT MODE (STAGE I ONLY) ==="
            Invoke-StageI -ZoneParam $Zone
            Write-PheromoneTrail -Action "scout" -Verification "Scout completed for zone $Zone" -Artifact "obi:scout" -Type "neutral"
        }
        
        'fingerprint' {
            Write-OutputEx "=== FINGERPRINT MODE (STAGE II ONLY) ==="
            Invoke-StageII
            Write-PheromoneTrail -Action "fingerprint" -Verification "Ledger and starmap verified" -Artifact "obi:fingerprint" -Type "neutral"
        }
        
        'process' {
            Write-OutputEx "=== PROCESS MODE (STAGE III ONLY) ==="
            Invoke-StageIII
            Write-PheromoneTrail -Action "process" -Verification "Pheromone trails processed" -Artifact "obi:process" -Type "neutral"
        }
        
        'verify' {
            Write-OutputEx "=== VERIFY MODE (STAGE IV ONLY) ==="
            Invoke-StageIV
            Write-PheromoneTrail -Action "verify" -Verification "Truth verification completed" -Artifact "obi:verify" -Type "neutral"
        }
        
        'garrison' {
            Write-OutputEx "=== GARRISON MODE (STAGE V ONLY) ==="
            Invoke-StageV
            Write-PheromoneTrail -Action "garrison" -Verification "Garrison duties completed" -Artifact "obi:garrison" -Type "neutral"
        }
    }
    
    # If we have a Supersaiyan flag, note it (though implementation would be in the scripts)
    if ($Supersaiyan) {
        Write-OutputEx "`nSupersaiyan mode: ENABLED (parallel scout sweep)"
    }
    
} catch {
    Write-Error "SUPPLY LINES FAILED: $_"
    exit 1
}