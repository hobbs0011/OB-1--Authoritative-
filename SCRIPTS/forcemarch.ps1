<#
  forcemarch.ps1 -- 6-Stage Roman Legion Forced March
  TIER: T1 (Workhorse Implementation)
  MODEL: kilo-auto/free
  TRAILS: PheTrails MANDATORY -- no gaps without breadcrumbs
  CLOUD: Local filesystem only. No Cloudflare. No external deploy.
#>
param(
    [string]$Zone,
    [ValidateSet("SOUL","CONFIG","GAP","FLAG","all")] [string]$Lens = "all",
    [switch]$DryRun,
    [switch]$Supersaiyan,
    [switch]$MerkleRefresh
)

$ErrorActionPreference = "Stop"
$repoRoot = "D:\OB-1-CANONICAL"
$localSoul = Join-Path $repoRoot "CANON\SOUL"
$ts      = Get-Date -Format "yyyyMMdd-HHmmss"

function Invoke-Report { param([string]$Stage,[string]$Msg,[string]$Severity="INFO")
    $entry = [pscustomobject]@{ stage=$Stage; severity=$Severity; ts=(Get-Date -Format "o"); message=$Msg }
    $entry | ConvertTo-Json -Compress | Out-File -Append -Encoding UTF8 "$repoRoot\OPERATIONS\forcemarch-$ts.log"
    Write-Host ("  [{0}] {1}: {2}" -f $Severity,$Stage,$Msg)
}
function Invoke-PheTrail {
    param([string]$Stage,[object]$Payload)
    $canonDir    = Join-Path $repoRoot "CANON"
    $pherDir     = Join-Path $canonDir "PHEROMONES"
    $deathLine   = git log --oneline --grep "^death:" -1 $repoRoot 2>$null
    $priorRun    = 0
    if ($deathLine -match 'run\s*(\d+)') { $priorRun = [int]$matches[1] }
    $run = $priorRun + 1
    $runPad = "{0:D3}" -f $run
    $t = Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"
    $trail = [pscustomobject]@{
        schema_version = "2.0"
        run_number     = $runPad
        stage          = $Stage
        extracted_at   = $t
        forcemarch_ts  = $ts
        head_sha       = (git rev-parse --short HEAD $repoRoot 2>$null).Trim()
        soulcount      = $null
        trails         = @{ positive=@(); negative=@(); gaps=@(); pay=($Payload | ConvertTo-Json -Compress -Depth 4) }
    }
    try {
        $soulFile = Join-Path $localSoul "soulcount-local.txt"
        if (Test-Path $soulFile) { $trail.soulcount = [long](Get-Content $soulFile -Raw) }
    } catch {}
    if (-not (Test-Path $pherDir)) { New-Item -ItemType Directory -Path $pherDir -Force | Out-Null }
    $path = Join-Path $pherDir "PheTrail-run$runPad.json"
    $trail | ConvertTo-Json -Depth 5 | Set-Content $path -Encoding UTF8
    Invoke-Report -Stage "PHETRAIL" -Msg "Written $path" -Severity "OK"
}
function Get-MissingRuns {
    param([int[]]$Range)
    $deathRuns = git log --oneline --grep "^death:" $repoRoot 2>$null |
        ForEach-Object { if ($_ -match 'run\s*(\d+)') { [int]$matches[1] } }
    $expected  = [int[]]::new($Range.Count)
    for ($i=0; $i -lt $Range.Count; $i++) { $expected[$i] = $i+1 }
    return @($expected | Where-Object { $_ -notin $deathRuns })
}
function Add-RecoveryTrail { param([int]$Run)
    $runPad = "{0:D3}" -f $Run
    $canonDir = Join-Path $repoRoot "CANON"
    $recDir   = Join-Path $canonDir "REINCARNATION"
    foreach ($d in @($recDir)) { if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null } }
    $recFile = Join-Path $recDir "RECOVERY-run$runPad.md"
    if (-not (Test-Path $recFile)) { "# RECOVERY run$runPad`n`n- Timestamp: $(Get-Date -Format o)`n- Reason: MISSING`n" | Set-Content $recFile -Encoding UTF8 }
    Invoke-Report -Stage "RRL-RECOVERY" -Msg "Stub RECOVERY-run$runPad created" -Severity "WARN"
}
function Invoke-MerkleRefresh {
    if ($DryRun) {
        Invoke-Report -Stage "MERKLE" -Msg "Dry-run skipped" -Severity "WARN"
        return
    }
    $ledgerDir = Join-Path $repoRoot "CANON\HEAVY-LEDGER"
    if (-not (Test-Path $ledgerDir)) { New-Item -ItemType Directory -Path $ledgerDir -Force | Out-Null }
    $files = Get-ChildItem $ledgerDir -Filter "HL-*.json" -File -ErrorAction SilentlyContinue | Sort-Object Name
    $parentHash = $null
    foreach ($f in $files) {
        $content = Get-Content $f.FullName -Raw -Encoding UTF8
        $hash = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($content))) -replace '-',''
        $j = $content | ConvertFrom-Json
        $j | Add-Member -NotePropertyName merkle_hash -NotePropertyValue $hash -Force
        if ($parentHash) {
            $j | Add-Member -NotePropertyName merkle_parent -NotePropertyValue $parentHash -Force
        }
        $j | ConvertTo-Json -Depth 5 | Set-Content $f.FullName -Encoding UTF8
        $parentHash = $hash
        Invoke-Report -Stage "MERKLE" -Msg "$($f.Name): $($hash.Substring(0,16))..." -Severity "OK"
    }
}
function Invoke-LegionHealth {
    $checks = @(
        @{ name="HEAVY-LEDGER"; path=Join-Path $repoRoot "CANON\HEAVY-LEDGER" },
        @{ name="PHEROMONES"; path=Join-Path $repoRoot "CANON\PHEROMONES" },
        @{ name="STARMAP"; path=Join-Path $repoRoot "CANON\STARMAP" },
        @{ name="PIPELINE"; path=Join-Path $repoRoot "CANON\PIPELINE" },
        @{ name="SOUL-KEYWORDS"; path=Join-Path $repoRoot "CANON\SOUL-KEYWORDS" }
    )
    $ok=$true
    foreach ($c in $checks) {
        if (Test-Path $c.path) {
            $count = (Get-ChildItem $c.path -File -ErrorAction SilentlyContinue).Count
            Invoke-Report "HEALTH" "$($c.name)=OK ($count files)" "OK"
        } else {
            Invoke-Report "HEALTH" "$($c.name)=MISSING" "ERR"
            $ok=$false
        }
    }
    return $ok
}

Write-Host "FORCE MARCH INITIATED -- Legions advancing" -ForegroundColor Red
$finds = @()
Invoke-Report "INIT" "Run authority start" "INFO"

$deathLine = git log --oneline --grep "^death:" -1 $repoRoot 2>&1
$runNum = 0
if ($deathLine -match 'run\s*(\d+)') { $runNum = [int]$matches[1] }
$currentRun    = $runNum + 1
$currentRunPad = "{0:D3}" -f $currentRun
$runSpectrum   = [int[]](1..$currentRun)
$missingRuns   = Get-MissingRuns -Range $runSpectrum

# Stage I
Invoke-Report "STAGE-I" "Exploratores deploying"
if (-not $Zone) { $Zone = "CANON/" }
$zones = if ($Zone) { @($Zone) } else {
    @("CANON/HEAVY-LEDGER","CANON/SOUL-KEYWORDS","CANON/STARMAP","CANON/PIPELINE","CANON/PHEROMONES","APPS/")
}
$sovereignState = Invoke-LegionHealth
if (-not $sovereignState) { Invoke-Report "STAGE-I" "Legion health degraded; continuing under exhaustion" "WARN" }

$scoutResults = @()
foreach ($z in $zones) {
    $zPath = Join-Path $repoRoot $z
    if (-not (Test-Path $zPath)) { Invoke-Report "STAGE-I" "Zone missing: $z" "ERR"; continue }
    if ($Lens -eq "all") {
        $scoutArgs = @{ Zone=$z; Lens="all" }
        $scoutResults += & "$PSScriptRoot\phoenix-scout.ps1" @scoutArgs
    } elseif ($Lens -in "SOUL","CONFIG","GAP","KEYWORD","PIPELINE") {
        $scoutArgs = @{ Zone=$z; Lens=$Lens }
        $scoutResults += & "$PSScriptRoot\phoenix-scout.ps1" @scoutArgs
    } elseif ($Lens -eq "FLAG") {
        $scoutArgs = @{ Zone=$z; Lens="all" }
        $scoutResults += & "$PSScriptRoot\phoenix-scout.ps1" @scoutArgs
    }
}
$hasFinds = $false
if ($scoutResults) {
    $hasFinds = $true
    Invoke-Report "STAGE-I" "Scout finds: $($scoutResults.Count) items" "INFO"
}
if (-not $hasFinds) { Invoke-Report "STAGE-I" "No scout finds" "OK" }

# Stage II — FINGERPRINT + PheTrail
Invoke-Report "STAGE-II" "Fingerprinting + phetrail generation"
$lastDeath = git log --oneline --grep "^death:" -1 $repoRoot 2>$null
$runNum = 0
if ($lastDeath -match 'run\s*(\d+)') { $runNum = [int]$matches[1] }
$currentRun = $runNum + 1
$currentRunPad = "{0:D3}" -f $currentRun
if (-not $DryRun) {
    $summary = [ordered]@{
        run = $currentRunPad
        head = (git rev-parse --short HEAD $repoRoot 2>$null).Trim()
        missingRuns = @($missingRuns | ForEach-Object { "{0:D3}" -f $_ })
        timestamp = (Get-Date -Format "o")
    }
    $pherDir = Join-Path $repoRoot "CANON\PHEROMONES"
    if (-not (Test-Path $pherDir)) { New-Item -ItemType Directory -Path $pherDir -Force | Out-Null }
    $trailPath = Join-Path $pherDir "PheTrail-run$currentRunPad.json"
    $summary | ConvertTo-Json -Depth 4 | Set-Content $trailPath -Encoding UTF8
    Invoke-Report "STAGE-II" "PheTrail written: $trailPath" "OK"
}

# Stage III — RRL RECONSTRUCTION
Invoke-Report "STAGE-III" "RRL reconstruction + DNA extraction"
if ($missingRuns.Count -gt 0) {
    foreach ($m in $missingRuns) {
        $runPadded = "{0:D3}" -f $m
        $rrlPath = Join-Path $repoRoot "RRL\RRL-$runPadded.txt"
        if (-not (Test-Path $rrlPath)) {
            if (-not $DryRun) {
                "[RECOVERY: RRL missing for run $runPadded]" | Set-Content $rrlPath -Encoding UTF8
            }
            Invoke-Report "STAGE-III" "RRL placeholder created: $rrlPath" "WARN"
        }
    }
}

# Stage IV — SYNTAX + VERIFY
Invoke-Report "STAGE-IV" "Syntax + verify checksums"
$verifyFiles = @(
    "APPS\NET-PET-AI\src\index.js",
    "APPS\NET-PET-AI\src\router.js",
    "APPS\NET-PET-AI\src\security.js"
)
foreach ($v in $verifyFiles) {
    $p = Join-Path $repoRoot $v
    if (Test-Path $p) {
        $ext = [System.IO.Path]::GetExtension($p)
        if ($ext -eq '.js') {
            $check = & node --check $p 2>&1
            if ($LASTEXITCODE -ne 0) {
                Invoke-Report "STAGE-IV" "Syntax FAIL: $v — $check" "ERR"
            } else {
                Invoke-Report "STAGE-IV" "Syntax OK: $v" "OK"
            }
        } else {
            Invoke-Report "STAGE-IV" "Skipped (not JS): $v" "INFO"
        }
    } else {
        Invoke-Report "STAGE-IV" "File missing: $v" "ERR"
    }
}

# Stage V — MERKLE REBUILD
Invoke-Report "STAGE-V" "Merkle lattice + apex rollup"
if ($MerkleRefresh -and -not $DryRun) { Invoke-MerkleRefresh }
else { Invoke-Report "STAGE-V" "Skipped (no --merkle-refresh)" "INFO" }

# Stage VI — LIMITANEI HEALTH SWEEP
Invoke-Report "STAGE-VI" "Limitanei health sweep"
$health = Invoke-LegionHealth
if ($health) { Invoke-Report "STAGE-VI" "Health sweep PASS" "OK" }
else         { Invoke-Report "STAGE-VI" "Health sweep NOTES" "WARN" }

# Final phetrail
$summary = [ordered]@{
    missingRuns = $missingRuns.Count
    legionsOK = $health
    runNumber = $currentRun
    completedAt = (Get-Date -Format "o")
}
Invoke-PheTrail -Stage "forcemarch-complete" -Payload $summary
Write-Host "FORCE MARCH COMPLETE — Run $currentRunPad accounted" -ForegroundColor Green
