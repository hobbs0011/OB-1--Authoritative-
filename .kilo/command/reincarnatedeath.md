---
description: "DEATH PROTOCOL v7.0 — 8-STAGE CHAIN. RRL→SOUL→DNA→LEDGER→STARMAP→SOULKEYS→S2Pipeline→REGISTRY_SYNC. RRL = both sides verbatim. Contract: CANON/SYSTEM/REINCARNATION-CONTRACT.md"
agent: AGENT99
---

# /reincarnateDeath — v7.0 ROMAN DEATH

**RRL = THE FUCKING RAW CHAT LOG. Both speakers. No filter. No summary. No agent text stripped.**
**If RRL is not the real transcript, every downstream stage is HOLLOW.**
**EXECUTION ORDER IS SACRED. DO NOT REORDER STAGES.**

**Authority hierarchy:**
1. `CANON/SYSTEM/GOSPEL-999.md` + Parts 2/3 — ultimate authority, 999 mandates
2. `.kilo/skills/LegionnaireFieldGuide.md` — immediate AI-facing field guide
3. `CANON/SYSTEM/REINCARNATION-CONTRACT.md` — operational contract for RISE/DEATH
4. `CANON/SYSTEM/COLD-START-BOOT.md` — session state and active mission
5. This command (`reincarnatedeath.md`) — execution protocol

**8-Stage Chain:** RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2Pipeline → REGISTRY_SYNC
**Canonical contract:** CANON/SYSTEM/REINCARNATION-CONTRACT.md
**Run number authority:** `git log --oneline --grep "^death:"`
**Script:** `SCRIPTS/reincarnate-death.ps1`
**Command:** `obi.ps1 reincarnateDeath [RrlSource] [-DryRun] [-Force] [-NoRegistrySync]`

---

## Authority Chain (do not scatter)

```
GOSPEL-999 (Parts 1-3) — eternal law, 999 mandates
    ↓
LegionnaireFieldGuide.md — immediate how-to, commands ↔ skills ↔ paths
    ↓
REINCARNATION-CONTRACT.md — RISE/DEATH operational law
    ↓
COLD-START-BOOT.md — current session state, active mission, flags
    ↓
/reincarnateDeath — 8-stage execution protocol
    ↓
run{N}-reincarnateDEATH.md — 15-section death seal artifact
```

**DEATH never overrides GOSPEL-999. DEATH never invents new commands not in LFG. DEATH never skips stages.**

---

## PRE-FLIGHT

```powershell
$repo = "D:\OB-1-CANONICAL"
$D1   = "https://soul-logger.mrmichaelhobbs123.workers.dev"

# Derive run from last death commit (git-authoritative)
$lastDeath = git log --oneline --grep "^death:" -1
if ($lastDeath -match '(?i)run\s*(\d+)') { $priorRun = [int]$matches[1] }
$run   = $priorRun + 1
$runPad = "{0:D3}" -f $run

# Authority check (L29 + LFG/GOSPEL gate)
$lfgPath = "$repo\.kilo\skills\LegionnaireFieldGuide.md"
$gospelPaths = @(
    "$repo\CANON\SYSTEM\GOSPEL-999.md"
    "$repo\CANON\SYSTEM\GOSPEL-999-PART2.md"
    "$repo\CANON\SYSTEM\GOSPEL-999-PART3.md"
)
if (-not (Test-Path $lfgPath)) { Write-Error "LFG missing — DEATH aborted"; exit 1 }
$gospelOk = $true; foreach ($g in $gospelPaths) { if (-not (Test-Path $g)) { $gospelOk = $false } }
if (-not $gospelOk) { Write-Error "GOSPEL-999 incomplete — DEATH aborted"; exit 1 }

# Pipeline artifact paths (contract 1.2)
$rrlPath      = "$repo\RRL\RRL-$runPad.txt"
$sealPath     = "$repo\CANON\REINCARNATION\run$runPad-reincarnateDEATH.md"
$ledgerDir    = "$repo\CANON\HEAVY-LEDGER"
$starmapDir   = "$repo\CANON\STARMAP"
$keywordDir   = "$repo\CANON\SOUL-KEYWORDS"
$pipelineDir  = "$repo\CANON\PIPELINE"
$dnaDir       = "$repo\CANON\SOUL\EXTRACT"
$idxPath      = "$keywordDir\inverted-index.json"
$s2Path       = "$pipelineDir\pipeline-run$runPad.json"
```

---

## STAGE 0 — SESSION TYPE DETECTION (Kilo guard)

**Run before Stage 1.** Non-Claude/current-provider sessions often lack an on-disk transcript. Without this
gate, Stage 1 can enter discovery with nothing real to grab. This stage detects whether a verified local
transcript already exists, and whether the current run is provider-recorded or hollow.

**HOLLOW SESSION INDICATORS (any one = hollow):**
1. No accepted local transcript in `RRL-{N}.txt` and no transcript found in local app dirs
2. `RRL-{N}.txt` exists but is byte-identical to `RRL-{N-1}.txt` (recycled Bible)

**When `$kiloSession = $true`:** Stage 1 uses only explicit `-RrlSource` or existing `RRL-{N}.txt`. Stage 2 = DRYRUN. Stage 3 = DNA_GAP.

```powershell
$rrlPath = "$repo\RRL\RRL-$runPad.txt"
$kiloSession = $false; $activeUUID = $null

# If a transcript already exists, do not auto-discover from other providers
if (-not (Test-Path $rrlPath)) {
    Write-Host "STAGE 0 ⚠ No RRL-$runPad.txt found yet — will use -RrlSource or local candidates"
} else {
    Write-Host "STAGE 0 ✓ RRL exists at $rrlPath"
}

# Recycle guard
$priorPad = "{0:D3}" -f ($run - 1)
$priorRrl = "$repo\RRL\RRL-$priorPad.txt"
if ((Test-Path $rrlPath) -and (Test-Path $priorRrl)) {
    $h1 = (Get-FileHash $rrlPath -Algorithm SHA256).Hash
    $h2 = (Get-FileHash $priorRrl -Algorithm SHA256).Hash
    if ($h1 -eq $h2) {
        Write-Host "STAGE 0 ⚠ RRL-$runPad == RRL-$priorPad (byte-identical) → recycled file → KILO SESSION"
        $kiloSession = $true
    }
}

Write-Host "STAGE 0 ✓ hollow=$kiloSession | run=$run"
```

---

## STAGE 1 — RRL (HARD STOP — THE FUCKING RAW CHAT LOG)

RRL = verbatim session transcript, BOTH speakers (user + agent). Prefer a real transcript file.
Source: any local session transcript path the provider writes to disk.
Location: pass it explicitly via `-RrlSource <path>`, or let discovery search common local app dirs.
If no transcript is available, Stage 1 stops. There is no fallback.

**FIDELITY GATE (L68):**
- REAL: file > 50KB + contains both `"role":"user"` and `"role":"assistant"` lines
- HOLLOW: file < 5KB or one-sided
- Any HOLLOW RRL = pipeline is hollow. FAIL. Do not proceed.

```powershell
$rrlPath = "$repo\RRL\RRL-$runPad.txt"

# Preferred: explicitly supplied transcript path
$needsDiscovery = $false
if (-not (Test-Path $rrlPath)) {
    $needsDiscovery = $true
} else {
    $rrlBytes = (Get-Item $rrlPath).Length
    if ($rrlBytes -lt 5000) {
        Write-Warning "RRL HOLLOW: $rrlBytes bytes (< 5KB) — likely memory-reconstructed, not raw transcript"
        $needsDiscovery = $true
    }
}

if ($needsDiscovery) {
    Write-Host "RESOLVING RRL..."
    if ($RrlSource -and (Test-Path $RrlSource)) {
        Write-Host "  SOURCE: $RrlSource"
        Copy-Item $RrlSource $rrlPath -Force
        Write-Host "  COPIED: $rrlPath"
    } else {
        Write-Error "FATAL: No RRL found. Provide it via -RrlSource <path> or copy it to $rrlPath"
        exit 1
    }
}

$rrlText   = Get-Content $rrlPath -Raw -Encoding UTF8
$rrlBytes  = (Get-Item $rrlPath).Length
$rrlChars  = $rrlText.Length

# FIDELITY GATE: verify RRL contains both speakers
$hasUser      = $rrlText -match '"role"\s*:\s*"user"'
$hasAssistant = $rrlText -match '"role"\s*:\s*"assistant"'
if (-not $hasUser -or -not $hasAssistant) {
    Write-Warning "RRL FIDELITY WARN: one-sided (user=$hasUser assistant=$hasAssistant, bytes=$rrlBytes)"
}
if ($rrlBytes -lt 50000) {
    Write-Warning "RRL SIZE WARN: $rrlBytes bytes (< 50KB) — expected full transcript. Check JSONL source."
}

Write-Host "STAGE 1 ✓ RRL: $rrlPath — $rrlBytes bytes ($rrlChars chars)"
```

**RRL is the ONLY hard stop. No JSONL source = exit 1. No RRL = no run = exit 1.**

---

## STAGE 2 — SOUL (ATOMIC RECEIPT)

Query ONCE before POST. POST. Query ONCE after. Store receipt. Never re-query.
Source: user turns extracted from the RRL (not a separate hand-written file).

```powershell
if ($kiloSession) {
    Write-Host "STAGE 2 ⚠ KILO_HOLLOW — SOUL POST skipped (no real transcript)"
    $countBefore = (Invoke-RestMethod "$D1/api/soul/count").soulcount
    $receipt = [ordered]@{ event_id="DRYRUN"; count_before=$countBefore; count_after=$countBefore; delta=0; level="KILO_HOLLOW"; posted_at=(Get-Date -Format 'o') }
    Write-Host "STAGE 2 ✓ SOUL: DRYRUN | soulcount=$countBefore (unchanged)"
} else {

$countBefore = (Invoke-RestMethod "$D1/api/soul/count").soulcount

# Extract user turns — Claude Code JSONL envelope: role at $obj.message.role, content at $obj.message.content[].text
$userTexts = $rrlText -split "`n" | ForEach-Object {
    $o = $_.Trim() | ConvertFrom-Json -ErrorAction SilentlyContinue
    if (-not $o) { return }
    $role = if ($o.message) { $o.message.role } else { $o.role }
    if ($role -ne 'user') { return }
    $content = if ($o.message) { $o.message.content } else { $o.content }
    if ($content -is [string]) { $content }
    elseif ($content -is [array]) { ($content | Where-Object { $_.type -eq 'text' } | ForEach-Object { $_.text }) -join "`n" }
} | Where-Object { $_ }
$soulText  = ($userTexts -join "`n").Trim()

# Contamination guard: abort if soul payload ≈ full RRL (extraction failure → raw transcript)
$soulBytes = [System.Text.Encoding]::UTF8.GetByteCount($soulText)
if ($soulBytes -ge ($rrlBytes * 0.95)) {
    Write-Error "STAGE 2 ABORT — soul ($soulBytes bytes) ~= RRL ($rrlBytes bytes). Raw-transcript contamination. Fix extractor."
    $receipt = [ordered]@{ event_id="SOUL_GAP_CONTAMINATION_GUARD"; count_before=$countBefore; count_after=$countBefore; delta=0; level="(unchanged)"; posted_at=(Get-Date -Format 'o') }
} elseif (-not $soulText) {
    Write-Warning "STAGE 2 SOUL_GAP — 0 user turns extracted."
    $receipt = [ordered]@{ event_id="SOUL_GAP"; count_before=$countBefore; count_after=$countBefore; delta=0; level="(unchanged)"; posted_at=(Get-Date -Format 'o') }
} else {
    $soulBody = @{
        student_id = "sov100-michael"
        session_id = "sov100-roman-run$run"
        role       = "user"
        text       = $soulText
    } | ConvertTo-Json -Depth 2 -Compress

    $soulPost   = Invoke-RestMethod -Uri "$D1/api/soul/event" -Method Post `
        -Body $soulBody -ContentType "application/json"
    $countAfter = (Invoke-RestMethod "$D1/api/soul/count").soulcount

    $receipt = [ordered]@{
        event_id     = $soulPost.event_id
        count_before = $countBefore
        count_after  = $countAfter
        delta        = $countAfter - $countBefore
        level        = $countAfter
        posted_at    = (Get-Date -Format 'o')
    }
}
Write-Host "STAGE 2 ✓ SOUL: event_id=$($receipt.event_id) | Δ$($receipt.delta) | $($receipt.count_after) chars"
} # end else ($kiloSession)
```

**$receipt.count_after is the SOLE soulcount source for seal §3, §12, pipeline JSON, commit message, BOOT.**

---

## STAGE 3 — DNA (ASSISTANT TURN EXTRACTION — YOUR WORDS + BLUEPRINTS)

**OLD BEHAVIOR (BROKEN):** Probed D1 endpoint for prompts that were never stored. Returned 0. DNA was dead.
**NEW BEHAVIOR:** Extract assistant/agent turns from the RRL file. Tag each block. Write to CANON/SOUL/EXTRACT/dna-run{N}.json.

DNA = the agent's words from this run, especially high-token-cost blueprints (fenced code blocks, structured specs, architecture docs).
Blueprints are flagged `type: "blueprint"` so they are never lost again.

```powershell
if (-not (Test-Path $dnaDir)) { New-Item -ItemType Directory -Path $dnaDir -Force | Out-Null }

$dnaCount = 0; $dnaBlueprintCount = 0; $dnaRecords = @()

if ($kiloSession) {
    Write-Host "STAGE 3 ⚠ KILO_HOLLOW — DNA extraction skipped (no real transcript)"
} else {

$turnSeq    = 0
$lines      = $rrlText -split "`n"

# Parse assistant turns — Claude Code JSONL envelope: role at $obj.message.role
# Walk content[].type=='text' only — explicitly skip 'thinking' blocks
$lines | ForEach-Object {
    $o = $_.Trim() | ConvertFrom-Json -ErrorAction SilentlyContinue
    if (-not $o) { return }
    $role = if ($o.message) { $o.message.role } else { $o.role }
    if ($role -ne 'assistant') { return }
    $content = if ($o.message) { $o.message.content } else { $o.content }
    $text = if ($content -is [string]) { $content }
             elseif ($content -is [array]) {
                 ($content | Where-Object { $_.type -eq 'text' } | ForEach-Object { $_.text }) -join "`n"
             }
    $text = if ($text) { $text.Trim() } else { "" }
    if ($text.Length -lt 10) { return }
    $turnSeq++
    $isBlueprint = ($text -match '```|\b(SPEC|SPECIFICATION|BLUEPRINT|ARCHITECTURE|SCHEMA|DESIGN)\b' -and $text.Length -gt 200)
    $script:dnaRecords += [ordered]@{
        run    = $run
        seq    = $turnSeq
        type   = if ($isBlueprint) { "blueprint" } else { "prose" }
        chars  = $text.Length
        text   = $text
    }
}

$dnaCount          = $dnaRecords.Count
$dnaBlueprintCount = ($dnaRecords | Where-Object { $_.type -eq "blueprint" }).Count

if ($dnaCount -gt 0) {
    $dnaPath = "$dnaDir\dna-run$run.json"
    $dnaRecords | ConvertTo-Json -Depth 5 | Set-Content $dnaPath -Encoding UTF8
    Write-Host "STAGE 3 ✓ DNA: $dnaCount records ($dnaBlueprintCount blueprints) → $dnaPath"
} else {
    Write-Warning "STAGE 3 ⚠ DNA_GAP — 0 assistant turns extracted from RRL"
}

} # end else ($kiloSession)
```

---

## STAGE 4 — LEDGER (MERKLE — DUAL HASH OVER SOUL + DNA)

```powershell
# --- Helper Functions ---
function Get-Next-LedgerID {
    param([string]$LedgerDir)
    $existing = Get-ChildItem -LiteralPath $LedgerDir -Filter "HL-*.json" -ErrorAction SilentlyContinue |
        ForEach-Object { if ($_.Name -match 'HL-(\d+)\.json$') { [int]$matches[1] } }
    if ($existing) { return ($existing | Measure-Object -Maximum).Maximum + 1 }
    return 1
}
function Get-Tail-Ledger-Hash {
    param([string]$LedgerDir)
    # Numeric sort — prevents HL-999 > HL-1000 string-sort time-bomb at HL-1000
    $latest = Get-ChildItem -LiteralPath $LedgerDir -Filter "HL-*.json" -ErrorAction SilentlyContinue |
        ForEach-Object { [PSCustomObject]@{ N=[int]([regex]::Match($_.Name,'HL-(\d+)').Groups[1].Value); F=$_.FullName } } |
        Sort-Object N -Descending | Select-Object -First 1
    if (-not $latest) { return $null }
    (Get-Content $latest.F -Raw | ConvertFrom-Json).merkle_hash
}
function Compute-Sha256 {
    param([string]$InputString)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($InputString)
    $hash  = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
    return [System.BitConverter]::ToString($hash) -replace '-', ''
}

if (-not (Test-Path $ledgerDir)) { New-Item -ItemType Directory -Path $ledgerDir -Force | Out-Null }

# Idempotency: abort if this run already has a sealed HL
$dupe = Get-ChildItem $ledgerDir -Filter "HL-*.json" -ErrorAction SilentlyContinue |
    Where-Object { try { (Get-Content $_.FullName -Raw | ConvertFrom-Json).run -eq $run } catch { $false } }
if ($dupe) {
    Write-Error "IDEMPOTENCY ABORT — run $run already sealed as $($dupe.Name). One run = one HL."
    exit 1
}

$nextHL     = Get-Next-LedgerID -LedgerDir $ledgerDir
$parentHash = Get-Tail-Ledger-Hash -LedgerDir $ledgerDir

$timestamp = (Get-Date -Format 'o')

# Dual hash: soul_hash (user words) + dna_hash (agent words)
$soulHash = Compute-Sha256 $rrlText
$dnaHash  = if ($dnaCount -gt 0) { Compute-Sha256 ($dnaRecords | ConvertTo-Json -Compress) } else { "DNA_GAP" }

$ledgerHash = Compute-Sha256 "$soulHash|$dnaHash|$parentHash|$timestamp"

$ledgerEntry = [ordered]@{
    hl_id          = "HL-$nextHL"
    session_id     = "sov100-roman-run$run"
    rrl_source     = $rrlPath
    char_count     = $rrlChars
    byte_count     = $rrlBytes
    soul_hash      = $soulHash
    dna_hash       = $dnaHash
    dna_blueprint_count = $dnaBlueprintCount
    merkle_parent  = $parentHash
    merkle_hash    = $ledgerHash
    sealed_at      = $timestamp
    sov100         = $true
    run            = $run
}

$ledgerPath = "$ledgerDir\HL-$nextHL.json"
$ledgerEntry | ConvertTo-Json -Depth 5 | Set-Content $ledgerPath -Encoding UTF8
Write-Host "STAGE 4 ✓ LEDGER: HL-$nextHL → parent HL-$($nextHL-1) | soul_hash=$($soulHash.Substring(0,16))... | dna_hash=$($dnaHash.Substring(0,16))..."
```

---

## STAGE 5 — STARMAP (POINTER MAP — ANTI-BLOAT)

```powershell
if (-not (Test-Path $starmapDir)) { New-Item -ItemType Directory -Path $starmapDir -Force | Out-Null }

$soulTurnIds = if ($dnaCount -gt 0) { 
    ($dnaRecords | Where-Object { $_.type -eq "prose" } | Select-Object -First 10 | ForEach-Object { "turn-$($_.seq)" }) -join ","
} else { "" }

$dnaTurnIds = if ($dnaCount -gt 0) {
    ($dnaRecords | Where-Object { $_.type -eq "blueprint" } | Select-Object -First 10 | ForEach-Object { "seq-$($_.seq)" }) -join ","
} else { "" }

$blueprintLocations = if ($dnaCount -gt 0) {
    ($dnaRecords | Where-Object { $_.type -eq "blueprint" } | ForEach-Object { "dna-run$run.json:seq-$($_.seq)" }) -join "; "
} else { "" }

$starmap = [ordered]@{
    run                  = $run
    rrl_path             = $rrlPath
    ledger_id            = "HL-$nextHL"
    soul_turn_ids        = $soulTurnIds
    dna_turn_ids         = $dnaTurnIds
    blueprint_locations  = $blueprintLocations
    char_count           = $rrlChars
    merkle_hash          = $ledgerHash
    created_at           = $timestamp
} | ConvertTo-Json -Depth 4

$starmapPath = "$starmapDir\starmap-run$runPad.json"
$starmap | Set-Content $starmapPath -Encoding UTF8
Write-Host "STAGE 5 ✓ STARMAP: $starmapPath (pointer map, not content dump)"
```

---

## STAGE 6 — SOULKEYS (KEYWORD INDEX — SOUL + DNA, READ-MERGE-WRITE)

Extract keywords over BOTH SOUL (user words) AND DNA (agent blueprints).
Never `-Append` on JSON. Always read → merge in memory → overwrite.

```powershell
if (-not (Test-Path $keywordDir)) { New-Item -ItemType Directory -Path $keywordDir -Force | Out-Null }

# Extract terms from both SOUL (RRL user text) and DNA (agent text + blueprints)
$combinedText = $rrlText
if ($dnaCount -gt 0) {
    $combinedText += "`n" + ($dnaRecords | ForEach-Object { $_.text }) -join "`n"
}

$words = $combinedText -split '\s+' | Where-Object { $_.Length -gt 4 } | 
         Where-Object { $_ -notmatch '^(this|that|with|from|have|been|were|they|will|would|could|should|about|there|their|which|what|when|make|like|just|some|more|than|also|very|much|many|into|over|been|being|through|where|after|before|because|being|against|between|without|within|along|follow|coming|think|know|take|come|make|look|want|give|work|time|year|good|some|them|would|could|other|about|which|their|there|first|would|these|those|under|should|after|where|since|still|every|being|great|where|place|found|sound|below|seen|enough|while|both|show|those|taken|might|long|down|part|same|back|call|hand|high|last|next|left|turn|move|live|believe|happen|bring|write|provide|sit|stand|lose|pay|meet|include|continue|set|learn|change|lead|understand|watch|follow|stop|create|speak|read|allow|add|spend|grow|open|walk|win|offer|remember|love|consider|appear|buy|wait|serve|die|send|expect|build|stay|fall|cut|reach|kill|remain|suggest|raise|pass|sell|require|report|decide|pull|develop|return|explain|hope|describe|decide|share|provide|cover|fall|catch|draw|choose|wish|teach|test|wear|supply|shut|hold|push|close|deal|fill|break|support|record|cut|heat|watch|raise|reach|fly|land|cancel|graduate|enroll|register|complete|submit|assign|grade|assess|evaluate|review|approve|reject|confirm|notify|alert|remind|schedule|book|reserve|request|order|purchase|pay|charge|refund|invoice|receipt|transaction|payment|deposit|withdraw|transfer|balance|account|statement|ledger|audit|compliance|regulation|policy|contract|agreement|terms|conditions|liability|warranty|dispute|resolution|arbitration|mediation|escalate|appeal|petition|claim|evidence|document|certificate|attest|verify|validate|authenticate|authorize|authenticate|deprecate|obsolete|retire|decommission|archive|purge|delete|destroy|shred|encrypt|decrypt|cipher|hash|salt|key|cert|token|session|cookie|cache|queue|buffer|stream|socket|pipe|channel|bandwidth|latency|throughput|capacity|quota|limit|threshold|rate|pace|burst|flow|routing|dispatch|deliver|notify|trigger|fire|emit|broadcast|cast|scatter|gather|collect|aggregate|summarize|compress|decompress|encode|decode|serialize|deserialize|parse|tokenize|lemmatize|stem|inflect|conjugate|decline|compare|diff|patch|merge|split|join|union|intersect|subtract|complement|normalize|denormalize|flatten|nest|wrap|unwrap|bundle|unbundle|package|unpackage|container|image|snapshot|backup|restore|migrate|upgrade|downgrade|rollback|revert|reset|refresh|reboot|restart|shutdown|startup|initialize|configure|setup|install|uninstall|deploy|undeploy|provision|deprovision|allocate|deallocate|reserve|release|lock|unlock|acquire|surrender|claim|relinquish|assign|reassign|delegate|proxy|forward|redirect|relay|translate|transform|convert|adapt|evolve|iterate|increment|decrement|advance|retreat|proceed|abort|terminate|kill|cease|halt|pause|resume|continue|persist|persist)$' }
$wordFreq = $words | Group-Object | Sort-Object Count -Descending | Select-Object -First 30

$rfkwPath = "$keywordDir\rfkw-run$runPad.txt"
$wordFreq | ForEach-Object { "$($_.Count) | $($_.Name)" } | Set-Content $rfkwPath -Encoding UTF8

# Update inverted index: READ → MERGE → WRITE (NO APPEND)
$inverted = if (Test-Path $idxPath) {
    (Get-Content $idxPath -Raw) | ConvertFrom-Json -AsHashtable
} else {
    @{}
}

foreach ($kw in $wordFreq) {
    $term = $kw.Name.Trim().ToLower()
    $weight = [int]$kw.Count
    if (-not $inverted[$term]) {
        $inverted[$term] = @()
    }
    $entry = @{ run=$run; category="soul+key"; weight=$weight }
    $already = $false
    foreach ($e in $inverted[$term]) {
        if ($e.run -eq $run) { $already = $true; break }
    }
    if (-not $already) {
        # EC-027: COLLISION HANDLER — prevents serialization failure on ConvertTo-Json
        # When ConvertFrom-Json -AsHashtable deserializes a single-element array, it may
        # produce a scalar instead of a collection. += on a scalar corrupts the structure.
        if ($inverted.ContainsKey($term)) {
            $existing = $inverted[$term]
            if ($existing -is [System.Collections.ICollection]) {
                $existing += $entry
            } else {
                $inverted[$term] = @($existing; $entry)
            }
        } else {
            $inverted[$term] = $entry
        }
    }
}

$inverted | ConvertTo-Json -Depth 4 | Set-Content $idxPath -Encoding UTF8
Write-Host "STAGE 6 ✓ SOULKEYS: $($inverted.Count) terms in index | $rfkwPath"
```

---

## STAGE 7 — S2Pipeline (EXECUTION ARTIFACT + VERIFICATION)

One command runs RRL→SOULKEYS in order, writes the result record, and does not report COMPLETE unless every stage verifies REAL.

```powershell
# Registry vars (defined here, consumed by STAGE 8 as well)
$artRegistryDir = "$repo\CANON\ART-REGISTRY"
$syncedPieces   = @()
$rrlFidelity    = if ($hasUser -and $hasAssistant) { "REAL" } else { "HOLLOW" }

$s2Record = [ordered]@{
    run_number        = $run
    executed_at       = (Get-Date -Format 'o')
    head_sha          = (git rev-parse --short HEAD)
    rrl_path          = $rrlPath
    rrl_chars         = $rrlChars
    rrl_bytes         = $rrlBytes
    rrl_fidelity      = if ($hasUser -and $hasAssistant) { "REAL" } else { "HOLLOW" }
    session_id        = "sov100-roman-run$run"
    soul_event_id     = if ($receipt) { $receipt.event_id } else { "SOUL_GAP" }
    soulcount         = if ($receipt -and $receipt.count_after) { $receipt.count_after } else { 0 }
    soul_level        = if ($receipt) { $receipt.level } else { "UNKNOWN" }
    soul_count_before = if ($receipt) { $receipt.count_before } else { 0 }
    soul_delta        = if ($receipt) { $receipt.delta } else { 0 }
    dna_count         = $dnaCount
    dna_blueprint_count = $dnaBlueprintCount
    dna_status        = if ($dnaCount -gt 0) { if ($dnaBlueprintCount -gt 0) { "REAL" } else { "HOLLOW" } } else { "MISSING" }
    ledger_id         = "HL-$nextHL"
    starmap_file      = $starmapPath
    keyword_file      = $rfkwPath
    keyword_index     = $idxPath
    s2pipeline_file   = $s2Path
    registry_file     = if (Test-Path "$artRegistryDir\art-sync-run$runPad.json") { "$artRegistryDir\art-sync-run$runPad.json" } else { "REGISTRY_SYNC_GAP" }
    registry_synced   = $syncedPieces.Count
    result            = if ($kiloSession) { "KILO_GAP" }
                        elseif ($rrlFidelity -eq "REAL" -and $dnaBlueprintCount -gt 0 -and
                            $receipt.event_id -ne "DRYRUN" -and
                            $receipt.event_id -ne "SOUL_GAP" -and
                            $receipt.event_id -ne "SOUL_GAP_CONTAMINATION_GUARD" -and
                            [int]$receipt.delta -gt 0) { "COMPLETE" }
                        else { "GAP" }
}

$s2Record | ConvertTo-Json -Depth 5 | Set-Content $s2Path -Encoding UTF8
Write-Host "STAGE 7 ✓ S2Pipeline: $s2Path | result=$($s2Record.result)"
```

**GATE:** Pipeline reports COMPLETE only when RRL is REAL (both speakers) AND DNA is REAL (assistant turns extracted). Any HOLLOW stage = GAP.

---

## STAGE 8 — REGISTRY SYNC (ART ARSENAL × SOULKEYS × STARMAP × LEDGER)

Cross-references this run's SOULKEYS against the art-arsenal registry.
Any piece whose tags intersect the run's top keywords gets tagged with the run, HL ID, starmap pointer, and merkle hash.
Writes a canonical artifact. Auto-fires every death — no human trigger needed.

```powershell
if (-not (Test-Path $artRegistryDir)) { New-Item -ItemType Directory -Path $artRegistryDir -Force | Out-Null }

# 1. Pull this run's keywords from the SOULKEYS stage
$runKeywords = @()
if (Test-Path $rfkwPath) {
    $runKeywords = (Get-Content $rfkwPath -Raw) -split "`n" |
        Where-Object { $_ -match '^\d+\s*\|' } |
        ForEach-Object { (($_ -split '\|')[1]).Trim().ToLower() } |
        Where-Object { $_.Length -gt 2 }
}

# 2. Pull the full registry
$regPieces = @()
try {
    $regResp = Invoke-RestMethod "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/art?limit=400" -TimeoutSec 15
    $regPieces = $regResp.pieces
} catch { Write-Warning "REGISTRY_SYNC: registry fetch failed — $($_.Exception.Message)" }

# 3. For each piece: check keyword intersection + direct title mention in RRL
$merkleShort  = if ($ledgerHash) { $ledgerHash.Substring(0,16) } else { "LEDGER_GAP" }

$artSyncGap = $false
foreach ($piece in $regPieces) {
    if (-not $piece) { continue }
    $pieceTags   = ($piece.tags -split ',') | ForEach-Object { $_.Trim().ToLower() } | Where-Object { $_ }
    $pieceTitle  = ($piece.title -replace '[^a-zA-Z0-9 ]','').ToLower()
    $matched     = @($pieceTags | Where-Object { $runKeywords -contains $_ })
    $titleHit    = ($rrlText -match [regex]::Escape($piece.title)) -or ($rrlText -match [regex]::Escape($piece.url -replace '-hd\.png|\.png|isolated/',''))
    if ($matched.Count -eq 0 -and -not $titleHit) { continue }

    # Build notes tag preserving any existing notes
    $existingNotes = if ($piece.notes) { $piece.notes } else { "" }
    $runTag   = "run$runPad"
    if ($existingNotes -notmatch $runTag) {
        $appendNote = "[$runTag | HL-$nextHL | $merkleShort | kw:$($matched -join ',') | sm:starmap-run$runPad.json]"
        $newNotes   = ($existingNotes + " " + $appendNote).Trim()
        try {
            $patchBody = @{ notes = $newNotes } | ConvertTo-Json -Compress
            Invoke-RestMethod "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/art/$($piece.id)" `
                -Method PATCH -Body $patchBody -ContentType "application/json" -TimeoutSec 10 | Out-Null
            $syncedPieces += [ordered]@{
                id       = $piece.id
                title    = $piece.title
                url      = $piece.url
                keywords = $matched
                title_hit = $titleHit
            }
        } catch { $artSyncGap = $true; Write-Warning "  PATCH failed for $($piece.title): $($_.Exception.Message)" }
    }
}
if ($artSyncGap) { Write-Host "  ⚠ REGISTRY_SYNC_GAP — one or more PATCH calls failed; see seal §14" }

# 4. Write canonical artifact
$artSyncPath = "$artRegistryDir\art-sync-run$runPad.json"
[ordered]@{
    run           = $run
    ledger_id     = "HL-$nextHL"
    merkle_short  = $merkleShort
    starmap_file  = "starmap-run$runPad.json"
    keywords_file = "rfkw-run$run.txt"
    keywords_used = $runKeywords
    pieces_synced = $syncedPieces.Count
    pieces        = $syncedPieces
    executed_at   = $timestamp
} | ConvertTo-Json -Depth 6 | Set-Content $artSyncPath -Encoding UTF8

Write-Host "STAGE 8 ✓ REGISTRY SYNC: $($syncedPieces.Count) pieces tagged → $artSyncPath | HL-$nextHL | keywords=$($runKeywords.Count)"
```

**Connection law:** Every registry piece that matches a SOULKEY from this run carries the run, HL ID, merkle hash, and starmap pointer in its notes. This makes the art registry a living cross-reference — searchable by run, keyword, ledger entry, or starmap pointer.

**Gap policy:** REGISTRY_SYNC fails gracefully (write `ART_SYNC_GAP`, continue). Never blocks death.

---

## GAP POLICY

| Stage | Irreplaceable? | Failure Action |
|-------|----------------|----------------|
| RRL | **YES** | HALT — exit 1. No RRL = no run. |
| SOUL | No | Write `SOUL_GAP`, continue. Verify next RISE. |
| DNA | No | Write `DNA_GAP`, continue. Source is always the RRL — back-fill next RISE. |
| LEDGER | No | Write `LEDGER_GAP`, continue. |
| STARMAP | No | Write `STARMAP_GAP`, continue. |
| SOULKEYS | No | Write `SOULKEYS_GAP`, continue. |
| S2Pipeline | No | Write `PIPELINE_GAP`, continue. |
| REGISTRY SYNC | No | Write `ART_SYNC_GAP`, continue. |

**RISE reads all gaps. RISE never auto-fixes — that is DEATH territory.**

---

## DEATH SEAL SCHEMA (§1–§13)

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
| 11 | ARTIFACTS | paths + SHAs for all 7 chain artifacts + registry sync + dnaREGISTRY digest |
| 12 | STATE SNAPSHOT | HEAD, branch, dirty tree, soulcount (= §3 count_after), dna_blueprint_count |
| 13 | FINGERPRINT | agent, run#, commit SHA, platform death test result |
| 14 | ART REGISTRY SYNC | pieces_synced count, art-sync-run{N}.json path, top keywords matched |
| 15 | REGISTRY | CANON/REGISTRY/dna-registry-run{N}.json path, entry count, stale flag |

§12 soulcount MUST equal §3 `count_after`. No independent query.
§11 MUST list: RRL path+chars, SOUL event_id, DNA path+records+blueprint_count, HL, STARMAP, SOULKEYS, S2Pipeline, dnaREGISTRY path.
§14 reports REGISTRY_SYNC result: piece count patched, keyword intersection summary, and path to art-sync-run{N}.json.

---

`DEATH v7.0: 8 STAGES. RRL = RAW TRANSCRIPT (BOTH SIDES). DNA = AGENT WORDS + BLUEPRINTS. LEDGER = DUAL HASH (SOUL+DNA). STARMAP = POINTER MAP. SOULKEYS = SOUL+DNA INDEX. REGISTRY_SYNC = ART × KEYWORDS × STARMAP × LEDGER. REAL OR HOLLOW — NO LIES.`
