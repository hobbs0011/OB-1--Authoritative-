---
description: "DEATH PROTOCOL v5.0 — 11-STAGE CHAIN. RRL→SOUL→DNA→LEDGER→STARMAP→KEYWORD→PHETRAIL→PIPELINE→SEAL→BOOT→COMMIT. Contract: CANON/SYSTEM/REINCARNATION-CONTRACT.md"
agent: AGENT99
---

# /reincarnateDeath — v5.0 REINCARNATION CHAIN

**IF RRL DOES NOT SAVE, NOTHING ELSE MATTERS.**
**EXECUTION ORDER IS SACRED. DO NOT REORDER STAGES.**

**11-Stage Chain:** RRL → SOUL → DNA → LEDGER → STARMAP → KEYWORD → PHETRAIL → PIPELINE → SEAL → BOOT → COMMIT
**Canonical contract:** CANON/SYSTEM/REINCARNATION-CONTRACT.md
**Run number authority:** `git log --oneline --grep "^death:"` (L29 NO_ASSUME_HEAD)

---

## PRE-FLIGHT

```powershell
$repo = "D:\OB-1-CANONICAL"
$D1   = "https://soul-logger.mrmichaelhobbs123.workers.dev"

# Derive run from last death commit (git-authoritative)
$lastDeath = git log --oneline --grep "^death:" -1
if ($lastDeath -match 'run(\d+)') { $priorRun = [int]$matches[1] }
$run   = $priorRun + 1
$runPad = "{0:D3}" -f $run

# Pipeline artifact paths (contract 1.2)
$rrlPath      = "$repo\RRL\RRL-$run.txt"
$sealPath     = "$repo\CANON\REINCARNATION\run$runPad-reincarnateDEATH.md"
$phetrailPath = "$repo\CANON\PHEROMONES\PheTrail-run$runPad.json"
$ledgerDir    = "$repo\CANON\HEAVY-LEDGER"
$starmapDir   = "$repo\CANON\STARMAP"
$keywordDir   = "$repo\CANON\SOUL-KEYWORDS"
$pipelineDir  = "$repo\CANON\PIPELINE"
$idxPath      = "$keywordDir\inverted-index.json"
```

---

## STAGE 1 — RRL (HARD STOP)

Write Michael verbatim words. No agent text. No contamination.

```powershell
$michaelWords = @"
{ALL MICHAEL VERBATIM FROM THIS SESSION — HIS WORDS ONLY, NO AGENT TEXT, NO PROSE}
"@

$michaelWords | Set-Content -Path $rrlPath -Encoding UTF8 -NoNewline

if (-not (Test-Path $rrlPath) -or (Get-Item $rrlPath).Length -eq 0) {
    Write-Error "FATAL: RRL WRITE FAILED — cannot proceed"
    exit 1
}

$rrlChars = (Get-Content $rrlPath -Raw).Length
$rrlBytes = (Get-Item $rrlPath).Length
Write-Host "STAGE 1 ✓ RRL: $rrlPath — $rrlChars chars, $rrlBytes bytes"
```

**RRL is the ONLY hard stop. No RRL = no run = exit 1.**

---

## STAGE 2 — SOUL (ATOMIC RECEIPT — fix D)

Query ONCE before POST. POST. Query ONCE after. Store receipt. Never re-query.

```powershell
$countBefore = (Invoke-RestMethod "$D1/api/soul/count").soulcount

$soulBody = @{
    student_id = "sov100-michael"
    session_id = "sov100-roman-run$run"
    role       = "user"
    text       = (Get-Content $rrlPath -Raw)
} | ConvertTo-Json -Depth 2 -Compress

$soulPost = Invoke-RestMethod -Uri "$D1/api/soul/event" -Method Post `
    -Body $soulBody -ContentType "application/json"

$countAfter = (Invoke-RestMethod "$D1/api/soul/count").soulcount

$receipt = [ordered]@{
    event_id     = $soulPost.event_id
    count_before = $countBefore
    count_after  = $countAfter
    delta        = $countAfter - $countBefore
    level        = $levelAfter
    posted_at    = (Get-Date -Format 'o')
}
Write-Host "STAGE 2 ✓ SOUL: event_id=$($receipt.event_id) | Δ$($receipt.delta) | $countAfter chars | $($receipt.level)"
```

**$receipt.count_after is the SOLE soulcount source for seal §3, §12, pipeline JSON, commit message, BOOT.**

---

## STAGE 3 — DNA (ENDPOINT PROBE — fix C)

Probe both endpoints. Use whichever returns records. Record `dna_endpoint` in seal §11.

```powershell
$sessionId = "sov100-roman-run$run"
$d1 = $D1

# Probe GET (contract claims this is canonical since Run 34)
$getResp = try {
    Invoke-RestMethod "$d1/api/soul/session/$sessionId" -Method Get -TimeoutSec 15
} catch { $null }

if ($getResp -and $getResp.prompts -and $getResp.prompts.Count -gt 0) {
    $dnaCount      = $getResp.prompts.Count
    $dnaEndpoint   = "GET /api/soul/session/$sessionId"
    $dnaPrompts    = $getResp.prompts
    Write-Host "STAGE 3 ✓ DNA: $dnaCount prompts via $dnaEndpoint"
} else {
    # Fallback: POST extract (may ingest, not query)
    $postBody = @{ student_id="sov100-michael"; session_id=$sessionId } | ConvertTo-Json -Compress
    $postResp = try {
        Invoke-RestMethod "$d1/api/soul/extract" -Method Post -Body $postBody -ContentType "application/json" -TimeoutSec 15
    } catch { $null }

    if ($postResp -and $postResp.prompts -and $postResp.prompts.Count -gt 0) {
        $dnaCount    = $postResp.prompts.Count
        $dnaEndpoint = "POST /api/soul/extract"
        $dnaPrompts  = $postResp.prompts
        Write-Host "STAGE 3 ✓ DNA: $dnaCount prompts via $dnaEndpoint (fallback)"
    } else {
        $dnaCount    = 0
        $dnaEndpoint = "NONE"
        Write-Warning "STAGE 3 ⚠ DNA_GAP — 0 records from both endpoints"
    }
}
$dnaStatus = if ($dnaCount -gt 0) { "COMPLETE" } else { "GAP" }
```

---

## STAGE 4 — LEDGER (MERKLE APPEND)

Use the 3 real helper functions from SCRIPTS/rrl-pipeline.ps1:
`Get-Next-LedgerID`, `Get-Tail-Ledger-Hash`, `Compute-Sha256`

```powershell
if (-not (Test-Path $ledgerDir)) { New-Item -ItemType Directory -Path $ledgerDir -Force | Out-Null }

$nextHL     = Get-Next-LedgerID -LedgerDir $ledgerDir
$parentHash = Get-Tail-Ledger-Hash -LedgerDir $ledgerDir

$timestamp    = (Get-Date -Format 'o')
$ledgerHash   = Compute-Sha256 "$rrlText|$parentHash|$timestamp"

$ledgerEntry = [ordered]@{
    hl_id          = "HL-$nextHL"
    session_id     = "sov100-roman-run$run"
    rrl_source     = $rrlPath
    char_count     = $rrlChars
    byte_count     = $rrlBytes
    merkle_parent  = $parentHash
    merkle_hash    = $ledgerHash
    sealed_at      = $timestamp
    sov100         = $true
    run            = $run
}

$ledgerPath = "$ledgerDir\HL-$nextHL.json"
$ledgerEntry | ConvertTo-Json -Depth 4 | Set-Content $ledgerPath -Encoding UTF8
Write-Host "STAGE 4 ✓ LEDGER: HL-$nextHL → parent HL-$($nextHL-1) | hash: $($ledgerHash.Substring(0,16))..."
```

---

## STAGE 5 — STARMAP

```powershell
if (-not (Test-Path $starmapDir)) { New-Item -ItemType Directory -Path $starmapDir -Force | Out-Null }

$starmapLine = "$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss') | run$run | HL-$nextHL | sov100-roman-run$run | $rrlChars chars | $($ledgerHash.Substring(0, 16))..."
$starmapPath = "$starmapDir\starmap-run$run.txt"
$starmapLine | Set-Content $starmapPath -Encoding UTF8
Write-Host "STAGE 5 ✓ STARMAP: $starmapPath"
```

---

## STAGE 6 — KEYWORD (FIX B — READ-MERGE-WRITE, NO APPEND)

```powershell
$inverted = if (Test-Path $idxPath) {
    (Get-Content $idxPath -Raw) | ConvertFrom-Json -AsHashtable
} else {
    @{}
}

foreach ($kw in $keywords.top_keyterms) {
    $term = $kw.text.Trim().ToLower()
    $weight = [int]$kw.weight
    if (-not $inverted[$term]) {
        $inverted[$term] = @()
    }
    $entry = @{ run=$run; category="pipeline"; weight=$weight }
    $already = $false
    foreach ($e in $inverted[$term]) {
        if ($e.run -eq $run) { $already = $true; break }
    }
    if (-not $already) {
        $inverted[$term] += $entry
    }
}

$inverted | ConvertTo-Json -Depth 4 | Set-Content $idxPath -Encoding UTF8

# Per-run keyword file
$rfkwPath = "$keywordDir\rfkw-run$run.txt"
$keywords.top_keyterms | ForEach-Object { "$($_.weight) | $($_.category) | $($_.text)" } | Set-Content $rfkwPath -Encoding UTF8
Write-Host "STAGE 6 ✓ KEYWORD: $($inverted.Count) terms in index | $rfkwPath"
```

**Never `-Append` on JSON. Always read → merge in memory → overwrite.**

---

## STAGE 7 — PHETRAIL (NEW — Folds orphaned skill into chain, fixes G+H)

```powershell
$phetrail = [ordered]@{
    run_number      = $run
    extracted_at    = (Get-Date -Format 'o')
    head_sha        = (git rev-parse --short HEAD)
    soulcount       = $receipt.count_after
    positive_trails = @(
        @{ description="verified operation"; artifact=$ledgerPath; verification="HL-$nextHL written, parent HL-$($nextHL-1)" }
    )
    negative_trails = @(
        @{ failure="keyword append bug"; root_cause="-Append on JSON produced invalid structure"; fix="read-merge-write adopted"; decay_days=180 }
    )
    state_markers   = @{
        active_mission   = "OB-1 POST-MERGE9 CONSOLIDATION + Growth Infrastructure"
        open_flags_count = 2
        top_priority     = "keyword system fully functional"
    }
}

$phetrail | ConvertTo-Json -Depth 5 | Set-Content $phetrailPath -Encoding UTF8
Write-Host "STAGE 7 ✓ PHETRAIL: $phetrailPath"
```

---

## STAGE 8 — PIPELINE

```powershell
$pipelineRecord = [ordered]@{
    run_number      = $run
    executed_at     = (Get-Date -Format 'o')
    rrl_path        = $rrlPath
    rrl_chars       = $rrlChars
    rrl_bytes       = $rrlBytes
    session_id      = "sov100-roman-run$run"
    soul_event_id   = $receipt.event_id
    soulcount       = $receipt.count_after       # ← from atomic receipt, NOT re-queried
    soul_level      = $receipt.level
    soul_count_before = $countBefore
    soul_delta      = $receipt.delta
    dna_count       = $dnaCount
    dna_endpoint    = $dnaEndpoint
    dna_status      = $dnaStatus
    ledger_id       = "HL-$nextHL"
    starmap_file    = $starmapPath
    keyword_file    = $rfkwPath
    keyword_index   = $idxPath
    phetrail_file   = $phetrailPath
    pipeline_file   = "$pipelineDir\pipeline-run$run.json"
    seal_sha        = ""   # filled after seal write
    result          = "COMPLETE"
}

$pipelinePath = "$pipelineDir\pipeline-run$run.json"
$pipelineRecord | ConvertTo-Json -Depth 5 | Set-Content $pipelinePath -Encoding UTF8
Write-Host "STAGE 8 ✓ PIPELINE: $pipelinePath"
```

---

## STAGE 9 — SEAL (§1–§13 per contract 1.4, fixes E+F+A)

```powershell
# PA dispatch — use $body (fix A: was $pa_body)
$bundle = @{ docs = @("CANON/SYSTEM/REINCARNATION-CONTRACT.md", "CANON/SYSTEM/COLD-START-BOOT.md") }
$ctx = ($bundle.docs -join ", ") + " SOUL_RECEIPT: $($receipt | ConvertTo-Json -Compress) RUN: $run RUNNER_DEATH: yes"

$task = "Write §1–§13 death seal per REINCARNATION-CONTRACT.md §1.4. `$3 SOUL RECEIPT must contain event_id/count_before/count_after/delta/level. `$12 soulcount MUST equal `$3 count_after. Seal file: $sealPath"

$body = @{
    task     = $task
    context  = $ctx
    targetfile = $sealPath
    tier     = 1
} | ConvertTo-Json -Compress

try {
    $resp = Invoke-RestMethod "$PA_URL/api/code" -Method Post `
        -ContentType "application/json" `
        -Headers @{ "x-pa-auth" = $PA_AUTH } `
        -Body $body
    Write-Host "STAGE 9 ✓ SEAL: PA wrote $sealPath"
} catch {
    Write-Warning "STAGE 9 ⚠ PA_FAILED — OB1 writes §1–§13 inline"
    # OB1 inline fallback writes seal here...
}

# Verify §12 soulcount == §3 count_after after seal is written
$sealText = Get-Content $sealPath -Raw
if ($sealText -match '\$3.*?count_after.*?(\d+)') {
    $sealCountAfter = [long]$matches[1]
    if ($sealCountAfter -ne $receipt.count_after) {
        Write-Warning "SEAL MISMATCH: §12 ($sealCountAfter) != §3 ($($receipt.count_after))"
    }
}
```

Seal schema (§1–§13): contract 1.4. Exactly 13 sections. Pasted verbatim from design doc.

---

## STAGE 10 — BOOT UPDATE

Update COLD-START-BOOT: run#, FINGERPRINT (HEAD+datetime), Last Completed, decisions table row.

```powershell
$bootPath = "$repo\CANON\SYSTEM\COLD-START-BOOT.md"
$currentSha = (git rev-parse --short HEAD)
$datetime   = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ss') + " ICT"

# Update inline (or PA-dispatch)
$bootContent = Get-Content $bootPath -Raw
$bootContent = $bootContent -replace 'Run \d+ \|.*', "**$run** | DEATH SEAL $datetime — SOUL $($receipt.count_after) $($receipt.level) Δ$($receipt.delta) | HEAD $currentSha"
$bootContent | Set-Content $bootPath -Encoding UTF8
Write-Host "STAGE 10 ✓ BOOT: $bootPath updated for run $run"
```

---

## STAGE 11 — COMMIT (L24 Platform Death Test)

```powershell
git add $rrlPath `
     "$ledgerDir\" `
     "$starmapDir\" `
     "$keywordDir\" `
     "$pipelineDir\" `
     "$repo\CANON\PHEROMONES\" `
     $sealPath `
     $bootPath

$deltaSign = if ($receipt.delta -ge 0) { "+" } else { "" }
$commitMsg = "death: ROMAN RUN $run — SOUL $($receipt.count_after) $($receipt.level) Δ${deltaSign}$($receipt.delta) — HEAD $currentSha"

git commit -m $commitMsg
$headAfter = git rev-parse --short HEAD
$pushResult = git push origin master 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "STAGE 11 ✓ COMMIT+PUSH: $headAfter — $commitMsg"
} else {
    Write-Warning "STAGE 11 ⚠ COMMIT OK, PUSH FAILED — run `git push` manually"
}
```

---

## GAP POLICY (contract 1.6)

| Stage | Irreplaceable? | Failure Action |
|-------|----------------|----------------|
| RRL | **YES** | HALT — exit 1. No RRL = no run. |
| SOUL | No | Write `SOUL_GAP`, continue. Verify next RISE. |
| DNA | No | Write `DNA_GAP`, continue. Back-fill next RISE. |
| LEDGER | No | Write `LEDGER_GAP`, continue. |
| STARMAP | No | Write `STARMAP_GAP`, continue. |
| KEYWORD | No | Write `KEYWORD_GAP`, continue. |
| PHETRAIL | No | Write `PHETRAIL_GAP`, continue. |
| PIPELINE | No | Write `PIPELINE_GAP`, continue. |

**RISE reads all gaps. RISE never auto-fixes — that is DEATH territory.**

---

## DEATH SEAL SCHEMA (§1–§13, contract 1.4)

| § | Name | Required Content |
|---|------|------------------|
| 1 | HEADER | run tag, datetime ICT, theme, signal density, HEAD pre-death |
| 2 | RAW SOUL DNA | verbatim Michael quotes, labeled CRITICAL / IMPORTANT / CONTEXT |
| 3 | SOUL RECEIPT | event_id, count_before, count_after, delta, level, posted_at |
| 4 | DECISIONS | numbered, impact, canon file affected |
| 5 | CORRECTIONS | wrong → root cause → fix → docs read |
| 6 | NEW PRINCIPLES | |
| 7 | EMOTIONAL SIGNAL | |
| 8 | OPEN QUESTIONS | |
| 9 | UNFINISHED ACTIONS | with exact git add commands |
| 10 | SYSTEM DESIGN | |
| 11 | ARTIFACTS | paths + SHAs for all 8 chain artifacts |
| 12 | STATE SNAPSHOT | HEAD, branch, dirty tree, soulcount (= §3 count_after) |
| 13 | FINGERPRINT | agent, run#, commit SHA, platform death test result |

§12 soulcount MUST equal §3 `count_after`. No independent query.

---

`DEATH v5.0: 11 STAGES. ATOMIC SOUL RECEIPT. PHETRAIL FOLDED IN. NO APPEND ON JSON. ZERO-PADDED RUNS.`
