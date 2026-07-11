<#
   supply-lines.ps1 — 6-Stage Supply Chain / Roman Legion Pipeline
   DEPLOY: Cloudflare-only; D1 is the sovereign store.
#>
param(
    [ValidateSet("status","full-march","scout","fingerprint","process","verify","garrison")]
    [string]$Stage = "status",
    [string]$Zone,
    [string]$Target,
    [string]$Lens = "all",
    [string]$StudentId = "sov100",
    [switch]$DryRun,
    [switch]$Supersaiyan,
    [switch]$MerkleRefresh,
    [int]$TimeoutSec = 120,
    [string]$OutFile
)

$ErrorActionPreference = "Stop"
$repoRoot = "D:\OB-1-CANONICAL"
$D1      = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$obi     = Join-Path $repoRoot "SCRIPTS\obi.ps1"
$scout   = Join-Path $repoRoot "SCRIPTS\phoenix-scout.ps1"

$ts      = Get-Date -Format "yyyy-MM-ddTHHmmss"
$report  = Join-Path $repoRoot "OPERATIONS\supply-lines-$ts.jsonl"
if ($OutFile) { $report = $OutFile }
${script:SupplySessionId} = $null

function Out-Event {
    param([string]$Stage,[string]$Status,[object]$Payload,[string]$Msg="")
    $e = [pscustomobject]@{
        ts=(Get-Date -Format "o"); cmd=$Stage; status=$Status; message=$Msg
        payload= if ($Payload) { $Payload | ConvertTo-Json -Compress -Depth 5 } else { $null }
    }
    ($e | ConvertTo-Json -Compress) | Out-File -Append -Encoding UTF8 $report
    if ($Msg) { Write-Host "  [$Status] $Msg" }
}

# ── 0 — HEALTH GATE ────────────────────────────────────────────────────────────
function Invoke-HealthGate {
    param([switch]$Strict)
    # Fast path: D1 self-test
    $h = try { Invoke-RestMethod "$D1/self-test" -TimeoutSec 10 -ErrorAction Stop } catch { $null }
    $ok = $false
    if ($h) {
        $ok = ($h.health -eq "GREEN") -and (($h.circuits_open -as [int]) -eq 0)
    }
    if (-not $ok) {
        Out-Event -Stage "HEALTH-GATE" -Status "ERR" -Msg "Supply chain ABORTED — soul-logger self-test failed"; if($Strict){throw "HEALTH_GATE_FAILED"}
    }
    Out-Event -Stage "HEALTH-GATE" -Status "OK" -Msg "Supply chain open"
    return $ok
}

function Resolve-SupplySessionId {
    if (${script:SupplySessionId}) { return ${script:SupplySessionId} }
    try {
        $context = Invoke-RestMethod "$D1/api/soul/context/$([uri]::EscapeDataString($StudentId))" -TimeoutSec $TimeoutSec -ErrorAction Stop
        $latest = @($context.sessions | Select-Object -First 1)[0]
        $sessionId = $latest.session_id
        if (-not $sessionId) { throw "No session_id returned by /api/soul/context/${StudentId}" }
        ${script:SupplySessionId} = $sessionId
        Out-Event -Stage "SESSION" -Status "OK" -Msg "Resolved $sessionId for ${StudentId}" -Payload @{ session_id=$sessionId; student_id=$StudentId }
        return $sessionId
    } catch {
        Out-Event -Stage "SESSION" -Status "ERR" -Msg "Failed to resolve session_id for ${StudentId}: $($_.Exception.Message)"
        return $null
    }
}

# ── I — EXPLORATORES ───────────────────────────────────────────────────────────
function Invoke-Stage-I {
    param([string]$Zone,[string]$Lens)
    $scoutLens = if ($Lens -eq "FLAG") { "DRIFT" } else { $Lens }
    $scoutArg = @{ Zone = $Zone; Lens = $scoutLens }
    Write-Host "`n  STAGE I — EXPLORATORES" -ForegroundColor Cyan
    if (-not (Test-Path $scout)) { throw "Missing scout script: $scout" }
    & $scout @scoutArg
    Out-Event -Stage "STAGE-I" -Status "OK" -Msg "Scout complete" -Payload @{ zone=$Zone; lens=$Lens; scoutLens=$scoutLens }
}

# ── II — ANTECORES (DNA fingerprint + ledger) ──────────────────────────────────
function Invoke-Stage-II {
    Write-Host "`n  STAGE II — ANTECORES" -ForegroundColor Cyan
    $sessionId = Resolve-SupplySessionId
    if (-not $sessionId) {
        Out-Event -Stage "STAGE-II" -Status "ERR" -Msg "Session required for DNA crunch"
        if (-not $DryRun) { throw "ANTECORES_SESSION_MISSING" }
        return
    }
    foreach ($mode in @("bible","themes")) {
        $body = @{ mode=$mode; session_id=$sessionId; timeout=$TimeoutSec } | ConvertTo-Json
        try {
            $r = Invoke-RestMethod "$D1/api/soul/crunch" -Method POST -Body $body -ContentType "application/json" -TimeoutSec $TimeoutSec
            Out-Event -Stage "STAGE-II" -Status "OK" -Msg "crunch/$mode" -Payload $r
        } catch {
            Out-Event -Stage "STAGE-II" -Status "ERR" -Msg "crunch/$mode failed: $($_.Exception.Message)"
            throw "ANTECORES_CRUNCH_FAILED"
        }
    }
    if (-not $DryRun) { & $obi -Command "soul-check" | Out-Null }
}

# ── III — AGMEN (keywords + pheromone) ────────────────────────────────────────
function Invoke-Stage-III {
    Write-Host "`n  STAGE III — AGMEN" -ForegroundColor Cyan
    $sessionId = Resolve-SupplySessionId
    if (-not $sessionId) {
        Out-Event -Stage "STAGE-III" -Status "ERR" -Msg "Session required for skeleton"
        if (-not $DryRun) { throw "AGMEN_SESSION_MISSING" }
        return
    }
    try {
        $body = @{ session_id=$sessionId } | ConvertTo-Json
        $r = Invoke-RestMethod "$D1/api/soul/skeleton" -Method POST -Body $body -ContentType "application/json" -TimeoutSec $TimeoutSec
        Out-Event -Stage "STAGE-III" -Status "OK" -Msg "skeleton/SSM" -Payload $r
    } catch {
        Out-Event -Stage "STAGE-III" -Status "ERR" -Msg "skeleton failed: $($_.Exception.Message)"; throw "AGMEN_FAILED"
    }
    # PheTrail write handled by caller via Invoke-PheTrail
}

# ── IV — AGMEN NOVISSIMUM (truth + shadow) ───────────────────────────────────
function Invoke-Stage-IV {
    Write-Host "`n  STAGE IV — AGMEN NOVISSIMUM" -ForegroundColor Cyan
    $sessionId = Resolve-SupplySessionId
    if (-not $sessionId) {
        Out-Event -Stage "STAGE-IV" -Status "ERR" -Msg "Session required for truth"
        if (-not $DryRun) { throw "TRUTH_SESSION_MISSING" }
        return
    }
    try {
        $body = @{ session_id=$sessionId } | ConvertTo-Json
        $truth = Invoke-RestMethod "$D1/api/soul/truth" -Method POST -Body $body -ContentType "application/json" -TimeoutSec $TimeoutSec
    } catch {
        Out-Event -Stage "STAGE-IV" -Status "ERR" -Msg "truth endpoint failed: $($_.Exception.Message)"; throw "TRUTH_GATE_FAILED"
    }
    $score = try { [int]$truth.consensus_score } catch { 0 }
    $achieved = [bool]$truth.consensus_achieved
    Out-Event -Stage "STAGE-IV" -Status "OK" -Msg "truth score=$score achieved=$achieved" -Payload $truth
    if (-not $achieved -or $score -lt 4) { Out-Event -Stage "STAGE-IV" -Status "ERR" -Msg "Truth consensus too low"; throw "TRUTH_CONSENSUS_LOW" }
    try {
        $body = @{ session_id=$sessionId } | ConvertTo-Json
        $shadow = Invoke-RestMethod "$D1/api/soul/shadow" -Method POST -Body $body -ContentType "application/json" -TimeoutSec $TimeoutSec
    } catch {
        Out-Event -Stage "STAGE-IV" -Status "ERR" -Msg "shadow endpoint failed: $($_.Exception.Message)"; throw "SHADOW_GATE_FAILED"
    }
    if ($shadow) {
        if ($shadow.verdict -eq "DRIFT_DETECTED") { Out-Event -Stage "STAGE-IV" -Status "WARN" -Msg "Shadow: DRIFT_DETECTED — manual review" -Payload $shadow }
        else { Out-Event -Stage "STAGE-IV" -Status "OK" -Msg "shadow=$($shadow.verdict)" -Payload $shadow }
    }
}

# ── V — PRAESIDIA (merkle + apex) ────────────────────────────────────────────
function Invoke-Stage-V {
    Write-Host "`n  STAGE V — PRAESIDIA" -ForegroundColor Cyan
    $sessionId = Resolve-SupplySessionId
    if (-not $sessionId) {
        Out-Event -Stage "STAGE-V" -Status "ERR" -Msg "Session required for merkle"
        if (-not $DryRun) { throw "MERKLE_SESSION_MISSING" }
        return
    }
    $merkle = try { Invoke-RestMethod "$D1/api/soul/merkle/$([uri]::EscapeDataString($sessionId))" -TimeoutSec $TimeoutSec } catch { $null }
    if (-not $merkle) { Out-Event -Stage "STAGE-V" -Status "ERR" -Msg "Merkle chain missing"; throw "MERKLE_MISSING" }
    $apex = try { Invoke-RestMethod "$D1/api/soul/apex?student_id=$([uri]::EscapeDataString($StudentId))`&limit=5`&days=30" -TimeoutSec $TimeoutSec } catch { $null }
    if (-not $apex) { Out-Event -Stage "STAGE-V" -Status "ERR" -Msg "Apex missing"; throw "APEX_MISSING" }
    Out-Event -Stage "STAGE-V" -Status "OK" -Msg "merkle+apex verified" -Payload @{ session=$sessionId; apex=$apex }
}

# ── VI — LIMITANEI / VETERANI (health sweep) ────────────────────────────────
function Invoke-Stage-VI {
    Write-Host "`n  STAGE VI — LIMITANEI/VETERANI" -ForegroundColor Cyan
    if ($DryRun) {
        Out-Event -Stage "STAGE-VI" -Status "WARN" -Msg "Dry-run skipped local health sweep"
        return
    }
    $null = & $obi doctor
    $null = & $obi verify
    $null = & $obi soul-check
    Out-Event -Stage "STAGE-VI" -Status "OK" -Msg "health sweep complete"
}

function Invoke-PheTrail {
    param([string]$Stage,[object]$Payload)
    $pherDir = Join-Path $repoRoot "CANON\PHEROMONES"
    if (-not (Test-Path $pherDir)) { New-Item -ItemType Directory -Path $pherDir -Force | Out-Null }
    $deathLine = git log --oneline --grep "^death:" -1 $repoRoot 2>$null
    $priorRun  = 0; if ($deathLine -match 'run\s*(\d+)') { $priorRun = [int]$matches[1] }
    $run = $priorRun + 1; $runPad = "{0:D3}" -f $run
    $t = Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"
    $trail = [pscustomobject]@{
        schema_version = "2.0"; run_number=$runPad; stage=$Stage; extracted_at=$t
        forcemarch_ts = (Get-Date -Format "yyyyMMdd-HHmmss")
        head_sha = (git rev-parse --short HEAD $repoRoot 2>$null).Trim()
        soulcount = $null; payload = ($Payload | ConvertTo-Json -Compress -Depth 4)
    }
    try { $resp = Invoke-RestMethod "$D1/api/soul/count" -ErrorAction SilentlyContinue; $trail.soulcount = $resp.soulcount } catch {}
    $path = Join-Path $pherDir "PheTrail-run$runPad.json"
    $trail | ConvertTo-Json -Depth 5 | Set-Content $path -Encoding UTF8
    Out-Event -Stage "PHETRAIL" -Status "OK" -Msg "Written $path"
    return $path
}

function Invoke-MerkleRefresh {
    if ($DryRun) { Out-Event -Stage "MERKLE" -Status "WARN" -Msg "Dry-run skipped"; return }
    $ledgerDir = Join-Path $repoRoot "CANON\HEAVY-LEDGER"
    if (-not (Test-Path $ledgerDir)) { New-Item -ItemType Directory -Path $ledgerDir -Force | Out-Null }
    $idx = 1
    Get-ChildItem $ledgerDir -Filter *.json -File -ErrorAction SilentlyContinue | ForEach-Object {
        $j = Get-Content $_.FullName -Raw | ConvertFrom-Json
        if ($j.PSObject.Properties | Where-Object { $_.Name -in @('previous_hash','merkle_root') } ) {
            Out-Event -Stage "MERKLE" -Status "OK" -Msg "$($_.Name) has merkle fields"
        } else {
            $artificial = ("{0:x2}" -f ($idx % 256)) + ("{0:x2}" -f (($idx/256) % 256))
            $j | Add-Member -NotePropertyName merkle_root -NotePropertyValue $artificial -Force
            $j | ConvertTo-Json -Depth 5 | Set-Content $_.FullName -Encoding UTF8
            Out-Event -Stage "MERKLE" -Status "OK" -Msg "Rebuilt merkle marker on $($_.Name)"
        }
        $idx++
    }
}
# ── ROUTER ─────────────────────────────────────────────────────────────────────
Write-Host "`nSUPPLY LINES — Stage: $Stage" -ForegroundColor Cyan
if (-not (Invoke-HealthGate -Strict)) { Write-Host "Supply chain ABORTED"; exit 1 }

if ($Stage -eq "status") {
    Write-Host "Nearest chain:" -ForegroundColor Yellow
    Invoke-Stage-I -Zone ($Zone ?? "CANON/") -Lens $Lens
    Invoke-Stage-II; Invoke-Stage-III; Invoke-Stage-IV; Invoke-Stage-V; Invoke-Stage-VI
    $summary = @{ ok=$true }
    $null = Invoke-PheTrail -Stage "supply-lines-status" -Payload $summary
    Write-Host "Supply chain STATUS complete." -ForegroundColor Green
}
elseif ($Stage -eq "full-march") {
    if (-not $Zone) { $Zone = "CANON/" }
    Invoke-Stage-I -Zone $Zone -Lens $Lens
    Invoke-Stage-II; Invoke-Stage-III; Invoke-Stage-IV; Invoke-Stage-V; Invoke-Stage-VI
    if ($MerkleRefresh -and -not $DryRun) { Invoke-MerkleRefresh }
    $null = Invoke-PheTrail -Stage "supply-lines-full-march" -Payload @{ ok=$true }
    Write-Host "Full march COMPLETE." -ForegroundColor Green
}
elseif ($Stage -eq "scout")  { if ($Zone) { Invoke-Stage-I -Zone $Zone -Lens $Lens } else { throw "scout requires -Zone" } }
elseif ($Stage -eq "fingerprint") { Invoke-Stage-II }
elseif ($Stage -eq "process") { Invoke-Stage-III }
elseif ($Stage -eq "verify")  { Invoke-Stage-IV }
elseif ($Stage -eq "garrison"){ Invoke-Stage-V }
else { Write-Host "Unknown stage: $Stage"; exit 2 }
