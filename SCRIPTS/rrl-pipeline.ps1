# RRL PIPELINE RUNNER  -  FULL CHAIN EXECUTION
# RRL → SOUL → DNA → LEDGER → STARMAP → KEYWORD → PIPELINE
# One command. All seven stages. No skip. No prose.
# Computers have been able to copy-paste since 1983.
# This script ensures the machine never forgets how to process what was copied.
param(
    [Parameter(Mandatory=$true)]
    [string]$RRLFile,          # Path to RRL-N.txt (Michael verbatim)
    [Parameter(Mandatory=$true)]
    [string]$RunNumber,        # Run number for artifact naming
    [switch]$DryRun,           # Validate without posting to D1
    [string]$SessionId = "",   # Override session_id (default: sov100-roman-run$RunNumber)
    [switch]$AllowContaminated # Allow files >100KB (Kilo exports/backdrops) — documents contamination
)

$ErrorActionPreference = "Continue"
$repo    = "D:\OB-1-CANONICAL"
$D1      = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$runId   = if ($SessionId) { $SessionId } else { "sov100-roman-run$RunNumber" }
$results = @{}

# ═══════════════════════════════════════════
# LEDGER HELPERS (contract 1.5)
# ═══════════════════════════════════════════
function Get-Next-Ledger-ID {
    param([string]$LedgerDir = "$repo\CANON\HEAVY-LEDGER")
    if (-not (Test-Path $LedgerDir)) { return 1 }
    $ids = Get-ChildItem $LedgerDir -Filter "HL-*.json" | ForEach-Object {
        if ($_.Name -match 'HL-(\d+)') { [int]$matches[1] }
    }
    if ($ids) { ($ids | Measure-Object -Maximum).Maximum + 1 } else { 1 }
}

function Get-Tail-Ledger-Hash {
    param([string]$LedgerDir = "$repo\CANON\HEAVY-LEDGER")
    if (-not (Test-Path $LedgerDir)) { return "0x0" }
    # Numeric sort — prevents HL-999 > HL-1000 string-sort time-bomb at HL-1000
    $last = Get-ChildItem $LedgerDir -Filter "HL-*.json" -ErrorAction SilentlyContinue |
        ForEach-Object { [PSCustomObject]@{ N=[int]([regex]::Match($_.Name,'HL-(\d+)').Groups[1].Value); F=$_.FullName } } |
        Sort-Object N -Descending | Select-Object -First 1
    if (-not $last) { return "0x0" }
    try {
        $json = Get-Content $last.F -Raw | ConvertFrom-Json
        if ($json.merkle_hash) { return $json.merkle_hash }
        elseif ($json.merkle_parent) { return $json.merkle_parent }
        else {
            return [System.BitConverter]::ToString(
                [System.Security.Cryptography.SHA256]::Create().ComputeHash(
                    [System.Text.Encoding]::UTF8.GetBytes((Get-Content $last.F -Raw))
                )
            ).Replace("-", "").ToLower()
        }
    } catch { "0x0" }
}

function Compute-Sha256 {
    param([string]$InputString)
    [System.BitConverter]::ToString(
        [System.Security.Cryptography.SHA256]::Create().ComputeHash(
            [System.Text.Encoding]::UTF8.GetBytes($InputString)
        )
    ).Replace("-", "").ToLower()
}

function Write-Step($step, $status, $detail) {
    $icon = if ($status -eq "PASS") { "[PASS]" } elseif ($status -eq "FAIL") { "[FAIL]" } else { "[WARN]" }
    Write-Host "$icon STEP $step  -  $detail"
    $results["step$step"] = @{ status = $status; detail = $detail }
}

# ═══════════════════════════════════════════
# GATE 0: RRL FILE EXISTS
# ═══════════════════════════════════════════
Write-Host "═══════════════════════════════════════════"
Write-Host "RRL PIPELINE  -  RUN $RunNumber"
Write-Host "RRL: $RRLFile"
Write-Host "═══════════════════════════════════════════"
Write-Host ""

if (-not (Test-Path $RRLFile)) {
    Write-Step 0 "FAIL" "RRL FILE NOT FOUND: $RRLFile"
    Write-Host "HALT: RRL IS THE ONLY IRREPLACEABLE ARTIFACT. CANNOT PROCEED."
    exit 1
}

$rrlText   = Get-Content $RRLFile -Raw -Encoding UTF8
$rrlChars  = $rrlText.Length
$rrlBytes  = (Get-Item $RRLFile).Length
$kiloHollow = [bool]($rrlText -match '^\s*#\s*KILO_HOLLOW\b')
$dnaCount = 0
$dnaBlueprintCount = 0
Write-Step 0 "PASS" "RRL loaded: $rrlChars chars, $rrlBytes bytes | KILO_HOLLOW=$kiloHollow"

# ═══════════════════════════════════════════
# GATE 0.5: FIDELITY CHECK (v6.0 — RRL = full transcript, both sides)
# ═══════════════════════════════════════════
$FIDELITY_MIN_BYTES = 5000
$FIDELITY_MIN_TURNS = 10
if ($kiloHollow) {
    Write-Step "0.5" "WARN" "KILO_HOLLOW marker detected: $rrlBytes bytes — no transcript available; sealing KILO_GAP"
} elseif ($rrlBytes -lt $FIDELITY_MIN_BYTES) {
    Write-Step "0.5" "WARN" "RRL SMALL: $rrlBytes bytes (< $FIDELITY_MIN_BYTES) — may be hollow. Checking structure..."
    $hasRole = $rrlText -match '"role"\s*:\s*"(user|assistant)"'
    if (-not $hasRole) {
        Write-Step "0.5" "FAIL" "RRL HAS NO ROLE MARKERS — not a valid transcript JSONL. HALT."
        Write-Host "HALT: RRL is not a valid transcript. Provide the real JSONL or copy-paste the full chat."
        exit 1
    }
} else {
    Write-Step "0.5" "PASS" "SIZE OK — $rrlBytes bytes"
}

# ═══════════════════════════════════════════
# HELPER: Extract user/assistant turns from JSONL
# Claude Code JSONL envelope: role at $obj.message.role, content at $obj.message.content[].text
# ═══════════════════════════════════════════
function Split-RL {
    param([string]$Text)
    $user = @()
    $assistant = @()

    $Text -split "`n" | ForEach-Object {
        $line = $_.Trim()
        if (-not $line) { return }
        $o = $line | ConvertFrom-Json -ErrorAction SilentlyContinue
        if (-not $o) { return }
        $role = if ($o.message) { $o.message.role } else { $o.role }
        if (-not $role) { return }
        $content = if ($o.message) { $o.message.content } else { $o.content }
        $text = if ($content -is [string]) { $content }
                elseif ($content -is [array]) {
                    ($content | Where-Object { $_.type -eq 'text' } | ForEach-Object { $_.text }) -join "`n"
                }
        if (-not $text) { return }
        $text = $text.Trim()
        if ($text.Length -lt 2) { return }
        if ($role -eq 'user') { $user += $text }
        elseif ($role -eq 'assistant') { $assistant += $text }
    }

    return @{ User=$user; Assistant=$assistant }
}

$turns = Split-RL -Text $rrlText
$userTurns = $turns.User
$agentTurns = $turns.Assistant
$hasUser      = $userTurns.Count -gt 0
$hasAssistant = $agentTurns.Count -gt 0
Write-Host "  PARSED: $($userTurns.Count) user turns, $($agentTurns.Count) assistant turns"

# ═══════════════════════════════════════════
# STEP 1: SOUL  -  POST USER TURNS TO D1
# ═══════════════════════════════════════════
$soulPost = $null
$delta = 0
$soulAfter = $null
if ($kiloHollow) {
    Write-Step 1 "WARN" "KILO_HOLLOW: SOUL POST skipped"
} elseif ($DryRun) {
    Write-Step 1 "PASS" "DRYRUN: Would POST $($userTurns.Count) user turns to D1"
} else {
    try {
        $soulBefore = Invoke-RestMethod "$D1/api/soul/count" -TimeoutSec 10
        Write-Host "  SOUL BEFORE: $($soulBefore.soulcount) chars | $($soulBefore.level)"

        $soulText  = $userTurns -join "`n`n"
        $soulBytes = [System.Text.Encoding]::UTF8.GetByteCount($soulText)

        # Contamination guard: soul payload must not approximate full RRL size
        if ($soulBytes -ge ($rrlBytes * 0.95)) {
            Write-Step 1 "FAIL" "CONTAMINATION GUARD — soul ($soulBytes bytes) ~= RRL ($rrlBytes bytes). Extraction returned full transcript. SOUL POST aborted."
        } elseif (-not $hasUser) {
            Write-Step 1 "WARN" "SOUL_GAP — 0 user turns extracted. SOUL POST skipped."
        } else {
            $body = @{
                student_id = "sov100-michael"
                session_id = $runId
                role       = "user"
                text       = $soulText
            } | ConvertTo-Json -Depth 2 -Compress

            $soulPost = Invoke-RestMethod -Uri "$D1/api/soul/event" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 60
            Write-Step 1 "PASS" "SOUL POSTED: event_id=$($soulPost.event_id) | bytes=$($soulPost.byte_count) | $($userTurns.Count) user turns"

            $soulAfter = Invoke-RestMethod "$D1/api/soul/count" -TimeoutSec 10
            # EC-44: soulcount=0 no retry — if zero, wait 3s and retry once before accepting
            if ($soulAfter.soulcount -eq 0) {
                Write-Host "  SOUL AFTER: 0 — retrying in 3s (EC-44 guard)..."
                Start-Sleep -Seconds 3
                $soulAfter = Invoke-RestMethod "$D1/api/soul/count" -TimeoutSec 10
            }
            $delta = $soulAfter.soulcount - $soulBefore.soulcount
            Write-Host "  SOUL AFTER: $($soulAfter.soulcount) chars | $($soulAfter.level) | DELTA: +$delta"
        }
    } catch {
        Write-Step 1 "FAIL" "SOUL POST FAILED: $($_.Exception.Message)"
        Write-Host "  Pipeline continues  -  SOUL_GAP will be recorded in death seal."
    }
}

# ═══════════════════════════════════════════
# STEP 2: DNA  -  LOCAL EXTRACTION FROM RRL (no D1 query)
# Extract assistant turns from RRL → tag blueprints → write CANON/SOUL/EXTRACT/dna-run{N}.json
# ═══════════════════════════════════════════
if ($kiloHollow) {
    $dnaDir = "$repo\CANON\SOUL\EXTRACT"
    if (-not (Test-Path $dnaDir)) { New-Item -ItemType Directory -Path $dnaDir -Force | Out-Null }

    $dnaRecords = @(
        [ordered]@{
            run    = $RunNumber
            seq    = 0
            type   = "missing"
            chars  = 0
            text   = "# KILO_HOLLOW - No session transcript"
        }
    )
    $dnaCount = $dnaRecords.Count
    $dnaBlueprintCount = 0
    $dnaPath = "$dnaDir\dna-run$RunNumber.json"
    $dnaRecords | ConvertTo-Json -Depth 5 | Set-Content $dnaPath -Encoding UTF8
    Write-Step 2 "WARN" "DNA_GAP: KILO_HOLLOW marker; 0 blueprints"
} elseif ($DryRun) {
    Write-Step 2 "PASS" "DRYRUN: Would extract DNA from $($agentTurns.Count) assistant turns"
} else {
    $dnaDir = "$repo\CANON\SOUL\EXTRACT"
    if (-not (Test-Path $dnaDir)) { New-Item -ItemType Directory -Path $dnaDir -Force | Out-Null }
    
    $dnaRecords = @()
    $seq = 0
    foreach ($turn in $agentTurns) {
        $seq++
        $text = $turn
        $isBlueprint = ($text -match '```|`````|\b(SPEC|SPECIFICATION|BLUEPRINT|ARCHITECTURE|SCHEMA|DESIGN)\b' -and $text.Length -gt 200)
        $dnaRecords += [ordered]@{
            run    = $RunNumber
            seq    = $seq
            type   = if ($isBlueprint) { "blueprint" } else { "prose" }
            chars  = $text.Length
            text   = $text
        }
    }
    
    $dnaCount = $dnaRecords.Count
    $dnaBlueprintCount = ($dnaRecords | Where-Object { $_.type -eq "blueprint" }).Count
    
    if ($dnaCount -gt 0) {
        $dnaPath = "$dnaDir\dna-run$RunNumber.json"
        $dnaRecords | ConvertTo-Json -Depth 5 | Set-Content $dnaPath -Encoding UTF8
        Write-Step 2 "PASS" "DNA EXTRACTED: $dnaCount prompts ($dnaBlueprintCount blueprints) | session=$runId"
    } else {
        Write-Step 2 "WARN" "DNA EXTRACT returned 0 prompts from RRL"
    }
}

# ═══════════════════════════════════════════
# STEP 3: LEDGER  -  WRITE MERKLE ENTRIES
# ═══════════════════════════════════════════
$ledgerDir = "$repo\CANON\HEAVY-LEDGER"
if (-not (Test-Path $ledgerDir)) {
    New-Item -ItemType Directory -Path $ledgerDir -Force | Out-Null
}

# Idempotency: abort if this run already has a sealed HL
$dupe = Get-ChildItem $ledgerDir -Filter "HL-*.json" -ErrorAction SilentlyContinue |
    Where-Object { try { (Get-Content $_.FullName -Raw | ConvertFrom-Json).run -eq [int]$RunNumber } catch { $false } }
if ($dupe) {
    Write-Step 3 "FAIL" "IDEMPOTENCY ABORT — run $RunNumber already sealed as $($dupe.Name). One run = one HL. Re-run DEATH to read existing output."
    exit 1
}

$nextHL = Get-Next-Ledger-ID -LedgerDir $ledgerDir
$parentHash = Get-Tail-Ledger-Hash -LedgerDir $ledgerDir

# Log parent source
Write-Host "  PARENT: HL-$($nextHL - 1) → $($parentHash.Substring(0, [Math]::Min(16, $parentHash.Length)))..."

$timestamp = (Get-Date -Format 'o')
$recordHash = Compute-Sha256 "$rrlText|$parentHash|$timestamp"

$ledgerEntry = [ordered]@{
    hl_id         = "HL-$nextHL"
    session_id    = $runId
    rrl_source    = $RRLFile
    char_count    = $rrlChars
    byte_count    = $rrlBytes
    merkle_parent = $parentHash
    merkle_hash   = $recordHash
    sealed_at     = $timestamp
    sov100        = $true
    run           = $RunNumber
}

$ledgerPath = "$ledgerDir\HL-$nextHL.json"
$ledgerEntry | ConvertTo-Json -Depth 4 | Set-Content $ledgerPath -Encoding UTF8
Write-Step 3 "PASS" "LEDGER WRITTEN: HL-$nextHL ($rrlChars chars) | parent: $($parentHash.Substring(0, [Math]::Min(16, $parentHash.Length)))..."

# ═══════════════════════════════════════════
# STEP 4: STARMAP  -  POINTER INDEX
# ═══════════════════════════════════════════
$starmapDir = "$repo\CANON\STARMAP"
if (-not (Test-Path $starmapDir)) { New-Item -ItemType Directory -Path $starmapDir -Force | Out-Null }

$starmapPath = "$starmapDir\starmap-run$RunNumber.json"
$starmapRecord = [ordered]@{
    run          = $RunNumber
    rrl_path     = $RRLFile
    ledger_id    = "HL-$nextHL"
    session_id   = $runId
    rrl_chars    = $rrlChars
    rrl_bytes    = $rrlBytes
    soul_delta   = if ($delta) { $delta } else { 0 }
    soul_event_id = if ($soulPost) { $soulPost.event_id } else { "DRYRUN" }
    dna_count    = if ($dnaCount) { $dnaCount } else { 0 }
    blueprint_count = if ($dnaBlueprintCount) { $dnaBlueprintCount } else { 0 }
    sealed_at    = $timestamp
    merkle_hash  = $recordHash
}
$starmapRecord | ConvertTo-Json -Depth 3 | Set-Content $starmapPath -Encoding UTF8
Write-Step 4 "PASS" "STARMAP WRITTEN: $starmapPath"

# ═══════════════════════════════════════════
# STEP 5: KEYWORD  -  FREQUENCY INDEX
# ═══════════════════════════════════════════
$keywordDir = "$repo\CANON\SOUL-KEYWORDS"
if (-not (Test-Path $keywordDir)) { New-Item -ItemType Directory -Path $keywordDir -Force | Out-Null }

# Simple word frequency extraction
$words = $rrlText -split '\s+' | Where-Object { $_.Length -gt 3 } | 
         Where-Object { $_ -notmatch '^(this|that|with|from|have|been|were|they|will|would|could|should|about|there|their|which|what|when|make|like|just|some|more|than|also|very|much|many|into|over|been|being)$' }
$wordFreq = $words | Group-Object | Sort-Object Count -Descending | Select-Object -First 30

$rfkwPath = "$keywordDir\rfkw-run$RunNumber.txt"
$wordFreq | ForEach-Object { "$($_.Count) | $($_.Name)" } | Set-Content $rfkwPath -Encoding UTF8
Write-Step 5 "PASS" "KEYWORD WRITTEN: $rfkwPath ($($wordFreq.Count) terms)"

# ═══════════════════════════════════════════
# STEP 6: PIPELINE  -  EXECUTION ARTIFACT
# ═══════════════════════════════════════════
$pipelineDir = "$repo\CANON\PIPELINE"
if (-not (Test-Path $pipelineDir)) { New-Item -ItemType Directory -Path $pipelineDir -Force | Out-Null }

if ($kiloHollow) {
    $rrlFidelity = "MISSING"
    $soulIsReal = $false
    $dnaIsReal = $false
    $pipelineResult = "KILO_GAP"
} else {
    $rrlFidelity  = if ($hasUser -and $hasAssistant) { "REAL" } else { "HOLLOW" }
    $soulIsReal   = ($soulPost -and $soulPost.event_id -and $soulPost.event_id -ne "DRYRUN" -and [int]$delta -gt 0)
    $dnaIsReal    = ($dnaCount -gt 0)
    $pipelineResult = if ($rrlFidelity -eq "REAL" -and $soulIsReal -and $dnaBlueprintCount -gt 0) { "COMPLETE" } else { "GAP" }
}

$pipelineRecord = [ordered]@{
    run_number        = $RunNumber
    executed_at       = (Get-Date -Format 'o')
    rrl_path          = $RRLFile
    rrl_chars         = $rrlChars
    rrl_bytes         = $rrlBytes
    rrl_fidelity      = $rrlFidelity
    rrl_reason        = if ($kiloHollow) { "KILO_HOLLOW marker - no session transcript" } else { "" }
    kilo_hollow       = $kiloHollow
    session_id        = $runId
    soul_event_id     = if ($kiloHollow) { "KILO_HOLLOW" } elseif ($soulPost) { $soulPost.event_id } else { "SOUL_GAP" }
    soulcount         = if ($soulAfter) { $soulAfter.soulcount } else { 0 }
    soul_level        = if ($kiloHollow) { "KILO_HOLLOW" } elseif ($soulAfter) { $soulAfter.level } else { "UNKNOWN" }
    soul_delta        = $delta
    dna_count         = if ($dnaCount) { $dnaCount } else { 0 }
    dna_blueprint_count = if ($dnaBlueprintCount) { $dnaBlueprintCount } else { 0 }
    ledger_id         = "HL-$nextHL"
    starmap_file      = $starmapPath
    keyword_file      = $rfkwPath
    pipeline_file     = "$pipelineDir\pipeline-run$RunNumber.json"
    seal_sha          = ""
    result            = $pipelineResult
} | ConvertTo-Json -Depth 4

$pipelinePath = "$pipelineDir\pipeline-run$RunNumber.json"
$pipelineRecord | Set-Content $pipelinePath -Encoding UTF8

# Compute seal_sha from written artifact and patch it back in
$pipelineBytes = [System.IO.File]::ReadAllBytes($pipelinePath)
$sealHash = [System.BitConverter]::ToString(
    [System.Security.Cryptography.SHA256]::Create().ComputeHash($pipelineBytes)
).Replace("-", "").ToLower()
$pipelineRaw = Get-Content $pipelinePath -Raw
$pipelineRaw = $pipelineRaw -replace '"seal_sha": ""', "`"seal_sha`": `"$sealHash`""
$pipelineRaw | Set-Content $pipelinePath -Encoding UTF8

Write-Step 6 "PASS" "PIPELINE WRITTEN: $pipelinePath | seal_sha: $($sealHash.Substring(0,16))..."

# ═══════════════════════════════════════════
# STEP 7: SOULCOUNT FINAL
# ═══════════════════════════════════════════
if (-not $DryRun) {
    try {
        $soulFinal = Invoke-RestMethod "$D1/api/soul/count" -TimeoutSec 10
        Write-Step 7 "PASS" "SOULCOUNT FINAL: $($soulFinal.soulcount) | $($soulFinal.level) | $($soulFinal.events) events"
    } catch {
        Write-Step 7 "WARN" "SOULCOUNT FINAL CHECK FAILED"
    }
} else {
    Write-Step 7 "PASS" "DRYRUN: soulcount check skipped"
}

# ═══════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════
Write-Host ""
Write-Host "═══════════════════════════════════════════"
Write-Host "RRL PIPELINE COMPLETE  -  RUN $RunNumber"
Write-Host "═══════════════════════════════════════════"
Write-Host "RRL:      $RRLFile  -  $rrlChars chars"
Write-Host "SOUL:     $runId  - $(if ($kiloHollow) { 'KILO_HOLLOW skipped' } elseif ($DryRun) { 'DRYRUN' } else { 'D1 posted' })"
Write-Host "DNA:      $(if ($kiloHollow) { 'DNA_GAP - 0 blueprints' } elseif ($results['step2']) { $results['step2'].detail } else { 'SKIPPED' })"
Write-Host "LEDGER:   HL-$nextHL  -  $ledgerPath"
Write-Host "STARMAP:  $starmapPath"
Write-Host "KEYWORD:  $rfkwPath"
Write-Host "PIPELINE: $pipelinePath"
Write-Host "RESULT:   $pipelineResult"
Write-Host "═══════════════════════════════════════════"
Write-Host "NEXT: Update COLD-START-BOOT → Write death seal → Commit"
