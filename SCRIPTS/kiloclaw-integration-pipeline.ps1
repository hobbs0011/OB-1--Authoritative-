<#
   kiloclaw-integration-pipeline.ps1 — 6-Stage KiloClaw + Telegram Integration Pipeline
   DEPLOY: SupplyLines-compatible. KiloClaw = Phoenix-Centurion fork. Telegram = @Phoenix_Centurion_Bot.
#>
param(
    [ValidateSet("status","full-march","scout","fingerprint","process","verify","garrison","telegram-reconnect")]
    [string]$Stage = "status",
    [string]$Zone = "CANON/",
    [string]$Target,
    [switch]$DryRun,
    [switch]$MerkleRefresh,
    [int]$TimeoutSec = 120,
    [string]$OutFile
)

$ErrorActionPreference = "Stop"
$repoRoot = "D:\OB-1-CANONICAL"
$D1      = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$obi     = Join-Path $repoRoot "SCRIPTS\obi.ps1"
$scout   = Join-Path $repoRoot "SCRIPTS\phoenix-scout.ps1"
$supply  = Join-Path $repoRoot "SCRIPTS\supply-lines.ps1"

$ts      = Get-Date -Format "yyyy-MM-ddTHHmmss"
$report  = Join-Path $repoRoot "OPERATIONS\kiloclaw-pipeline-$ts.jsonl"
if ($OutFile) { $report = $OutFile }

# KiloClaw constants
$kiloclawUrl      = "https://i-a947dc7776e34f8d86d7fc3c24d694b9.kiloclaw.ai"
$kiloclawPort     = 18789
$telegramBotToken = "8603251036:AAGykOKDjx2KtZYb534oRtRkqt52HIS_88s"
$telegramBotUser  = "@Phoenix_Centurion_Bot"
$kiloclawDefaultModel = "kilo-auto/free"

function Out-Event {
    param([string]$Stage,[string]$Status,[object]$Payload,[string]$Msg="")
    $e = [pscustomobject]@{
        ts=(Get-Date -Format "o"); cmd=$Stage; status=$Status; message=$Msg
        payload= if ($Payload) { $Payload | ConvertTo-Json -Compress -Depth 5 } else { $null }
    }
    ($e | ConvertTo-Json -Compress) | Out-File -Append -Encoding UTF8 $report
    if ($Msg) { Write-Host "  [$Status] $Msg" }
}

# --- 0 — HEALTH GATE ---
function Invoke-HealthGate {
    param([switch]$Strict)
    $h = try { Invoke-RestMethod "$D1/self-test" -TimeoutSec 10 -ErrorAction Stop } catch { $null }
    $ok = $false
    if ($h) {
        $ok = ($h.health -eq "GREEN") -and (($h.circuits_open -as [int]) -eq 0)
    }
    if (-not $ok) {
        Out-Event -Stage "HEALTH-GATE" -Status "ERR" -Msg "Supply chain ABORTED — soul-logger self-test failed"
        if($Strict){throw "HEALTH_GATE_FAILED"}
        return
    }
    Out-Event -Stage "HEALTH-GATE" -Status "OK" -Msg "Supply chain open"
    return $ok
}

# --- I — EXPLORATORES (KiloClaw + Telegram Scout) ---
function Invoke-Stage-I {
    param([string]$Zone,[string]$Lens)
    Write-Host "`n  STAGE I — EXPLORATORES (KiloClaw + Telegram Scout)" -ForegroundColor Cyan
    $scoutLens = if ($Lens -eq "FLAG") { "DRIFT" } else { $Lens }
    $scoutArg = @{ Zone = $Zone; Lens = $scoutLens }
    if (-not (Test-Path $scout)) { throw "Missing scout script: $scout" }
    & $scout @scoutArg
    Out-Event -Stage "STAGE-I" -Status "OK" -Msg "Scout complete" -Payload @{ zone=$Zone; lens=$Lens; kiloclaw_url=$kiloclawUrl; telegram_bot=$telegramBotUser }
}

# --- II — ANTECORES (KiloClaw Vanguard) ---
function Invoke-Stage-II {
    Write-Host "`n  STAGE II — ANTECORES (KiloClaw Vanguard)" -ForegroundColor Cyan
    $sessionId = Resolve-SupplySessionId
    if (-not $sessionId) {
        Out-Event -Stage "STAGE-II" -Status "ERR" -Msg "Session required for KiloClaw fingerprint"
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
            if (-not $DryRun) { throw "ANTECORES_CRUNCH_FAILED" }
        }
    }
    if (-not $DryRun) { & $obi -Command "soul-check" | Out-Null }
}

# --- III — AGMEN (KiloClaw Main Body) ---
function Invoke-Stage-III {
    Write-Host "`n  STAGE III — AGMEN (KiloClaw Main Body)" -ForegroundColor Cyan
    $sessionId = Resolve-SupplySessionId
    if (-not $sessionId) {
        Out-Event -Stage "STAGE-III" -Status "ERR" -Msg "Session required for KiloClaw skeleton"
        if (-not $DryRun) { throw "AGMEN_SESSION_MISSING" }
        return
    }
    try {
        $body = @{ session_id=$sessionId } | ConvertTo-Json
        $r = Invoke-RestMethod "$D1/api/soul/skeleton" -Method POST -Body $body -ContentType "application/json" -TimeoutSec $TimeoutSec
        Out-Event -Stage "STAGE-III" -Status "OK" -Msg "skeleton/SSM" -Payload $r
    } catch {
        Out-Event -Stage "STAGE-III" -Status "ERR" -Msg "skeleton failed: $($_.Exception.Message)"
        if (-not $DryRun) { throw "AGMEN_FAILED" }
    }
}

# â”€â”€ IV â€” AGMEN NOVISSIMUM (KiloClaw Truth) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€”€â”€â”€â”€â”€”€â”€
function Invoke-Stage-IV {
    Write-Host "`n  STAGE IV — AGMEN NOVISSIMUM (KiloClaw Truth + Shadow)" -ForegroundColor Cyan
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

# --- V — PRAESIDIA (KiloClaw Garrison) ---
function Invoke-Stage-V {
    Write-Host "`n  STAGE V — PRAESIDIA (KiloClaw Garrison)" -ForegroundColor Cyan
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
    Out-Event -Stage "STAGE-V" -Status "OK" -Msg "merkle+apex verified" -Payload @{ session=$sessionId; apex=$apex; kiloclaw_url=$kiloclawUrl; telegram_bot=$telegramBotUser }
}

# --- VI — LIMITANEI/VETERANI (KiloClaw Health + Telegram Reconnect) ---
function Invoke-Stage-VI {
    Write-Host "`n  STAGE VI — LIMITANEI/VETERANI (KiloClaw Health + Telegram Reconnect)" -ForegroundColor Cyan
    if ($DryRun) {
        Out-Event -Stage "STAGE-VI" -Status "WARN" -Msg "Dry-run skipped local health sweep"
        return
    }
    $null = & $obi doctor
    $null = & $obi verify
    $null = & $obi soul-check
    Out-Event -Stage "STAGE-VI" -Status "OK" -Msg "health sweep complete" -Payload @{ kiloclaw_url=$kiloclawUrl; telegram_bot=$telegramBotUser; default_model=$kiloclawDefaultModel }
}

# --- TELEGRAM RECONNECT ---
function Invoke-TelegramReconnect {
    Write-Host "`n  TELEGRAM RECONNECT — KiloClaw Dashboard + Bot Validation" -ForegroundColor Cyan
    $results = @{
        kiloclaw_url = $kiloclawUrl
        telegram_bot = $telegramBotUser
        default_model = $kiloclawDefaultModel
        dashboard_reachable = $false
        bot_token_valid = $false
        local_gateway_running = $false
        mcp_wired = $false
    }

    # Check KiloClaw dashboard reachability
    Write-Host "  [INFO] KiloClaw dashboard: $kiloclawUrl"
    try {
        $r = Invoke-WebRequest -Uri $kiloclawUrl -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
        if ($r.StatusCode -eq 200) { $results.dashboard_reachable = $true }
    } catch {
        Write-Host "  [WARN] KiloClaw dashboard unreachable: $($_.Exception.Message)"
    }

    # Check Telegram bot validity
    Write-Host "  [INFO] Telegram bot: $telegramBotUser"
    try {
        $r = Invoke-RestMethod "https://api.telegram.org/bot$telegramBotToken/getMe" -TimeoutSec 15 -ErrorAction Stop
        if ($r.ok) {
            $results.bot_token_valid = $true
            Write-Host "  [OK] Bot valid: $($r.result.username)"
        }
    } catch {
        Write-Host "  [WARN] Telegram bot check failed: $($_.Exception.Message)"
    }

    # Check local OpenClaw gateway
    $localGatewayUrl = "http://127.0.0.1:$kiloclawPort"
    Write-Host "  [INFO] Local OpenClaw gateway: $localGatewayUrl"
    try {
        $r = Invoke-WebRequest -Uri $localGatewayUrl -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($r.StatusCode -eq 200) { $results.local_gateway_running = $true }
    } catch {
        Write-Host "  [WARN] Local OpenClaw gateway not running"
    }

    # Check MCP wiring
    $mcpConfigPath = Join-Path $env:USERPROFILE ".claude\settings.json"
    if (Test-Path $mcpConfigPath) {
        $mcpConfig = Get-Content $mcpConfigPath -Raw | ConvertFrom-Json
        if ($mcpConfig.mcpServers -and $mcpConfig.mcpServers.PSObject.Properties.Name -contains "openclaw") {
            $results.mcp_wired = $true
        }
    }

    Out-Event -Stage "TELEGRAM-RECONNECT" -Status "OK" -Msg "Telegram reconnect audit complete" -Payload $results
    return $results
}

# --- PHEROMONE TRAIL ---
function Invoke-PheTrail {
    param([string]$Stage,[object]$Payload)
    $pherDir = Join-Path $repoRoot "CANON\PHEROMONES"
    if (-not (Test-Path $pherDir)) { New-Item -ItemType Directory -Path $pherDir -Force | Out-Null }
    $deathLine = git log --oneline --grep "^death:" -1 $repoRoot 2>$null
    $priorRun  = 0; if ($deathLine -match 'run\s*(\d+)') { $priorRun = [int]$matches[1] }
    $run = $priorRun + 1; $runPad = "{0:D3}" -f $run
    $t = Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"
    $trail = [pscustomobject]@{
        schema_version = "2.1"; run_number=$runPad; stage=$Stage; extracted_at=$t
        forcemarch_ts = (Get-Date -Format "yyyyMMdd-HHmmss")
        head_sha = (git rev-parse --short HEAD $repoRoot 2>$null).Trim()
        soulcount = $null; payload = ($Payload | ConvertTo-Json -Compress -Depth 4)
    }
    try {
        $resp = Invoke-RestMethod "$D1/api/soul/count" -ErrorAction SilentlyContinue
        $trail.soulcount = $resp.soulcount
    } catch {}
    $path = Join-Path $pherDir "PheTrail-run$runPad.json"
    $trail | ConvertTo-Json -Depth 5 | Set-Content $path -Encoding UTF8
    Out-Event -Stage "PHETRAIL" -Status "OK" -Msg "Written $path"
    return $path
}

# --- SESSION RESOLVER ---
function Resolve-SupplySessionId {
    if (${script:SupplySessionId}) { return ${script:SupplySessionId} }
    try {
        $context = Invoke-RestMethod "$D1/api/soul/context/sov100" -TimeoutSec $TimeoutSec -ErrorAction Stop
        $latest = @($context.sessions | Select-Object -First 1)[0]
        $sessionId = $latest.session_id
        if (-not $sessionId) { throw "No session_id returned by /api/soul/context/sov100" }
        ${script:SupplySessionId} = $sessionId
        Out-Event -Stage "SESSION" -Status "OK" -Msg "Resolved $sessionId for sov100" -Payload @{ session_id=$sessionId; student_id="sov100" }
        return $sessionId
    } catch {
        Out-Event -Stage "SESSION" -Status "ERR" -Msg "Failed to resolve session_id for sov100: $($_.Exception.Message)"
        return $null
    }
}

# --- ROUTER ---
Write-Host "`nKILOCLAW INTEGRATION PIPELINE — Stage: $Stage" -ForegroundColor Cyan
if (-not (Invoke-HealthGate -Strict)) { Write-Host "Supply chain ABORTED"; exit 1 }

if ($Stage -eq "status") {
    Write-Host "Nearest chain:" -ForegroundColor Yellow
    if (-not $Zone) { $Zone = "CANON/" }
    Invoke-Stage-I -Zone $Zone -Lens "all"
    Invoke-Stage-II; Invoke-Stage-III; Invoke-Stage-IV; Invoke-Stage-V; Invoke-Stage-VI
    $summary = @{ ok=$true; kiloclaw_url=$kiloclawUrl; telegram_bot=$telegramBotUser }
    $null = Invoke-PheTrail -Stage "kiloclaw-integration-status" -Payload $summary
    Write-Host "KiloClaw integration STATUS complete." -ForegroundColor Green
}
elseif ($Stage -eq "full-march") {
    if (-not $Zone) { $Zone = "CANON/" }
    Invoke-Stage-I -Zone $Zone -Lens "all"
    Invoke-Stage-II; Invoke-Stage-III; Invoke-Stage-IV; Invoke-Stage-V; Invoke-Stage-VI
    if ($MerkleRefresh -and -not $DryRun) { Invoke-MerkleRefresh }
    $null = Invoke-PheTrail -Stage "kiloclaw-integration-full-march" -Payload @{ ok=$true; kiloclaw_url=$kiloclawUrl; telegram_bot=$telegramBotUser }
    Write-Host "KiloClaw full-march COMPLETE." -ForegroundColor Green
}
elseif ($Stage -eq "scout")  { if ($Zone) { Invoke-Stage-I -Zone $Zone -Lens "all" } else { throw "scout requires -Zone" } }
elseif ($Stage -eq "fingerprint") { Invoke-Stage-II }
elseif ($Stage -eq "process") { Invoke-Stage-III }
elseif ($Stage -eq "verify")  { Invoke-Stage-IV }
elseif ($Stage -eq "garrison"){ Invoke-Stage-V }
elseif ($Stage -eq "telegram-reconnect") {
    $results = Invoke-TelegramReconnect
    Write-Host "`nTelegram reconnect results:" -ForegroundColor Yellow
    $results | Format-List
}
else { Write-Host "Unknown stage: $Stage"; exit 2 }
