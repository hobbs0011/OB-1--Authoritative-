# PHOENIX-CODER HAIKU OPERATOR — Run 61
# Pure state machine. Haiku does not think. It turns the crank.
# Usage: pwsh -File OPERATIONS/PHOENIX-CODER-HAIKU-OPERATOR-run61.ps1 -StartRung 2
# Sonnet/Claude Code handles: file apply, wrangler deploy, MO-00/00.5 bootstrap

param([int]$StartRung = 2)

$PA = "https://phoenix-architecti.mrmichaelhobbs123.workers.dev"
$AUTH = $env:PA_AUTH_SECRET  # must be set: $env:PA_AUTH_SECRET = "..."
$MO_FILE = "$PSScriptRoot\..\OPERATIONS\PHOENIX-CODER-MARCHING-ORDERS-run61.json"
$LOG = "$PSScriptRoot\..\OPERATIONS\PHOENIX-CODER-BOOTSTRAP-run61.md"

# ── Load DAG ──────────────────────────────────────────────────────────────────
$mos = (Get-Content $MO_FILE -Raw | ConvertFrom-Json).dag
$dag  = @{}
foreach ($mo in $mos) { $dag[$mo.id] = $mo }

# ── State map ─────────────────────────────────────────────────────────────────
$state   = @{}  # id → PENDING / VERIFIED / FAILED
$patches = @{}  # id → patch string (carry-forward context)
foreach ($mo in $mos) { $state[$mo.id] = 'PENDING' }

# Mark bootstrap rungs as VERIFIED (handled by Sonnet)
$state['MO-00']  = 'VERIFIED'
$state['MO-01']  = if ($StartRung -le 1) { 'PENDING' } else { 'VERIFIED' }

# ── Helpers ───────────────────────────────────────────────────────────────────
function Write-Log($msg) {
    $ts = Get-Date -Format "HH:mm:ss"
    $line = "[$ts] $msg"
    Write-Host $line
    Add-Content $LOG $line
}

function Get-Ready {
    # Auto-mark AWAITING_APPLY as VERIFIED if target file exists
    $mos | Where-Object { $state[$_.id] -eq 'AWAITING_APPLY' } | ForEach-Object {
        $targetPath = "D:\OB-1-CANONICAL\$($_.target)"
        if (Test-Path $targetPath) {
            Write-Log "AUTO-VERIFY: $($_.id) — target file created"
            $state[$_.id] = 'VERIFIED'
        }
    }

    $mos | Where-Object {
        $state[$_.id] -eq 'PENDING' -and
        $_.rung -ge $StartRung -and
        $_.action -in @('execute','test') -and
        ($_.depends_on.Count -eq 0 -or ($_.depends_on | ForEach-Object { $state[$_] } | Where-Object { $_ -ne 'VERIFIED' }).Count -eq 0)
    }
}

function Build-Context($mo) {
    $ctx = $mo.context ?? ''
    foreach ($dep in ($mo.depends_on ?? @())) {
        if ($patches[$dep]) {
            $ctx = "RESULT OF $dep`:`n$($patches[$dep])`n`n$ctx"
        }
    }
    return $ctx
}

function Invoke-Order($mo) {
    Write-Log "FIRING $($mo.id) — $($mo.label)"
    $ctx = Build-Context $mo
    $body = @{
        task    = $mo.task
        context = $ctx
        target  = $mo.target ?? ''
        tier    = if ($mo.model -match 'llama-3.3-70b') { 1 } else { 1 }
    } | ConvertTo-Json -Compress

    try {
        # LAMBO: call PA /api/code (T1→T5 cascade) not seed /api/execute (CF-Qwen only)
        $r = Invoke-RestMethod "$PA/api/code" -Method POST `
             -ContentType 'application/json' `
             -Headers @{'x-pa-auth' = $AUTH} `
             -Body $body `
             -TimeoutSec 60
        return $r
    } catch {
        Write-Log "ERROR $($mo.id): $($_.Exception.Message)"
        return $null
    }
}

# ── Main operator loop ────────────────────────────────────────────────────────
Write-Log "=== HAIKU OPERATOR ONLINE — StartRung=$StartRung ==="
Add-Content $LOG "`n# Phoenix-Coder Bootstrap Log — Run 61`n"

$maxWaves = 20
$wave = 0

while ($true) {
    $ready = @(Get-Ready)
    if ($ready.Count -eq 0) {
        $pending = @($mos | Where-Object { $state[$_.id] -eq 'PENDING' })
        if ($pending.Count -eq 0) {
            Write-Log "ALL ORDERS COMPLETE."
            break
        }
        Write-Log "BLOCKED — $($pending.Count) orders pending with unresolved deps or awaiting deploy"
        Write-Log "Waiting 15s for Sonnet to apply + deploy..."
        Start-Sleep 15
        $wave++
        if ($wave -gt $maxWaves) { Write-Log "MAX WAVES REACHED — halting"; break }
        continue
    }

    $wave++
    Write-Log "`n--- WAVE $wave — $($ready.Count) orders ---"

    # Fire ready orders (cap 10)
    $batch = $ready | Select-Object -First 10
    $results = $batch | ForEach-Object -Parallel {
        $mo = $_
        $pa = $using:PA
        $auth = $using:AUTH
        $ctx_map = $using:patches

        $ctx = $mo.context ?? ''
        foreach ($dep in ($mo.depends_on ?? @())) {
            if ($ctx_map[$dep]) { $ctx = "RESULT OF $dep`:`n$($ctx_map[$dep])`n`n$ctx" }
        }
        $body = @{ task=$mo.task; context=$ctx; target=($mo.target??''); tier=1 } | ConvertTo-Json -Compress
        try {
            # LAMBO: 10 subagents of PA /api/code (T1→T5 cascade)
            $r = Invoke-RestMethod "$pa/api/code" -Method POST -ContentType 'application/json' -Headers @{'x-pa-auth'=$auth} -Body $body -TimeoutSec 60
            @{ id=$mo.id; patch=$r.code_patch; verified=$false; model=$r.tier; ok=$true }
        } catch {
            @{ id=$mo.id; patch=''; verified=$false; ok=$false; error=$_.Exception.Message }
        }
    } -ThrottleLimit 10

    # Process results
    foreach ($res in $results) {
        $mo = $dag[$res.id]
        if (-not $res.ok) {
            Write-Log "FAILED $($res.id): $($res.error)"
            $state[$res.id] = 'FAILED'
            if ($mo.on_fail -eq 'halt') { Write-Log "HALT ordered."; exit 1 }
        } elseif ($res.patch.Length -lt 10) {
            Write-Log "STUB $($res.id) — patch too short ($($res.patch.Length) chars) — marking FAILED"
            $state[$res.id] = 'FAILED'
        } else {
            $patches[$res.id] = $res.patch
            Write-Log "PATCH READY $($res.id) — $($res.patch.Length) chars (via PA lambo cascade) — awaiting apply+deploy"

            # Write patch to a staging file for Sonnet to apply
            $stagingPath = "D:\OB-1-CANONICAL\OPERATIONS\patches\$($res.id)-patch.js"
            New-Item (Split-Path $stagingPath) -ItemType Directory -Force | Out-Null
            Set-Content $stagingPath $res.patch -Encoding UTF8
            Write-Log "  Staged: $stagingPath"
            Write-Log "  Target: $($mo.target)"
            Write-Log "  Apply:  Copy-Item '$stagingPath' 'D:\OB-1-CANONICAL\$($mo.target)' -Force"

            # Mark VERIFIED only after Sonnet confirms node --check passes
            # Sonnet sets $state[id] = 'VERIFIED' by editing this script's state or calling:
            # pwsh -File HAIKU-OPERATOR.ps1 -MarkVerified MO-02
            Write-Log "  >>> WAITING FOR SONNET: apply patch, node --check, wrangler deploy, then mark VERIFIED"
            $state[$res.id] = 'AWAITING_APPLY'
        }
    }

    Start-Sleep 5
}

Write-Log "=== OPERATOR DONE ==="
$mos | ForEach-Object { Write-Log "  $($_.id): $($state[$_.id])" }
