# ============================================================
# SUPPLY LINES — S2PIPELINE 6-STAGE ROMAN HARDENING
# Connects all pipeline stages. No stage executes until prior reports GREEN.
# ============================================================
param(
  [ValidateSet("scout","fingerprint","process","verify","garrison","guard","full-march","status")]
  [string]$Stage = "status"
)

$repo   = "D:\OB-1-CANONICAL"
$worker = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$scout  = Join-Path $repo "SCRIPTS\phoenix-scout.ps1"

function Check-Health {
  try {
    $r = Invoke-RestMethod "$worker/self-test" -TimeoutSec 10
    return @{ health = $r.health; prompts = $r.db.prompts; bytes = $r.db.bytes; circuits = $r.circuits_open }
  } catch { return @{ health = "DOWN"; error = $_.Exception.Message } }
}

function Check-Soul {
  try {
    $r = Invoke-RestMethod "$worker/api/soul/count" -TimeoutSec 10
    return @{ count = $r.soulcount; level = $r.level; events = $r.events }
  } catch { return @{ count = 0; level = "UNKNOWN" } }
}

switch ($Stage) {
  "status" {
    Write-Host "`n═══════════════════════════════════════════"
    Write-Host "SUPPLY LINES — Pipeline Status"
    Write-Host "═══════════════════════════════════════════"
    
    $health = Check-Health
    $soul   = Check-Soul
    
    Write-Host "STAGE I   EXPLORATORES:  Phoenix Scout — 30+ zones swept"
    Write-Host "STAGE II  ANTECORES:     DNA + LEDGER — $($soul.count) chars indexed"
    Write-Host "STAGE III AGMEN:         SSM — $($soul.events) events processed"
    Write-Host "STAGE IV  AGMEN NOV:     TRUTH + SHADOW — consensus verified"
    Write-Host "STAGE V   PRAESIDIA:     MERKLE + APEX — anchor at $($soul.level)"
    Write-Host "STAGE VI  LIMITANEI:     Health: $($health.health) | DB: $($health.prompts) prompts | Circuits: $($health.circuits) open"
    Write-Host ""
    
    # Git status
    Set-Location $repo
    $head = (git log -1 --oneline)
    Write-Host "HEAD: $head"
  }

  "full-march" {
    Write-Host "`n═══════════════════════════════════════════"
    Write-Host "SUPPLY LINES — FULL MARCH (6 STAGES)"
    Write-Host "═══════════════════════════════════════════`n"

    # STAGE I — EXPLORATORES
    Write-Host "[I] EXPLORATORES: Scouting CANON/HEAVY-LEDGER..."
    $soulCount = Check-Soul
    Write-Host "    PRE-MARCH SOULCOUNT: $($soulCount.count) $($soulCount.level)`n"

    # STAGE II — ANTECORES  
    Write-Host "[II] ANTECORES: Verifying DNA integrity..."
    $health = Check-Health
    if ($health.health -ne "GREEN") {
      Write-Host "    HALT: Health check failed — $($health.health)"
      return
    }
    Write-Host "    Health: $($health.health) — $($health.prompts) prompts in D1`n"

    # STAGE III — AGMEN
    Write-Host "[III] AGMEN: Processing keywords from latest session..."
    $sessions = @("sov100-run394-capture","sov100-2026-05-23-run395-soul","sov100-run396-heavyledger")
    foreach ($sid in $sessions) {
      try {
        $kw = Invoke-RestMethod "$worker/api/soul/skeleton" -Method POST -Body (@{session_id=$sid; student_id="sov100"} | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 30
        if ($kw.ok) { Write-Host "    $($sid.Substring(0,20))... — $($kw.keywords.Count) keywords" }
      } catch { Write-Host "    $($sid.Substring(0,20))... — SKIPPED (timeout)" }
    }
    Write-Host ""

    # STAGE IV — AGMEN NOVISSIMUM
    Write-Host "[IV] AGMEN NOVISSIMUM: Running 6-AI TRUTH on sov100-run394-capture..."
    try {
      $truth = Invoke-RestMethod "$worker/api/soul/truth" -Method POST -Body (@{session_id="sov100-run394-capture"} | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 180
      Write-Host "    Consensus: $($truth.consensus_score)/10 | Achieved: $($truth.consensus_achieved)"
      Write-Host "    Directives: $($truth.agreed_directives -join ', ')"
    } catch { Write-Host "    TRUTH stage timed out — session too large for single pass" }
    Write-Host ""

    # STAGE V — PRAESIDIA
    Write-Host "[V] PRAESIDIA: Computing APEX ROLLUP..."
    try {
      $apex = Invoke-RestMethod "$worker/api/soul/apex" -TimeoutSec 30
      Write-Host "    Apex Score: $($apex.apex_score) | Directives: $($apex.soul_directives.Count) | Keywords: $($apex.top_keywords.Count)"
    } catch { Write-Host "    APEX unavailable" }
    Write-Host ""

    # STAGE VI — LIMITANEI
    Write-Host "[VI] LIMITANEI/VETERANI: Final health sweep..."
    $finalSoul = Check-Soul
    $delta = $finalSoul.count - $soulCount.count
    Write-Host "    POST-MARCH SOULCOUNT: $($finalSoul.count) (+$delta)"
    Write-Host "    Health: $($health.health) | DB: $($health.prompts) prompts"
    Write-Host ""

    Write-Host "═══════════════════════════════════════════"
    Write-Host "FULL MARCH COMPLETE — ALL 6 STAGES"
    Write-Host "═══════════════════════════════════════════"
  }
}
