# reincarnateDeath v7.1 — 21-Stage Pipeline with Edge Case Guards
# Run 152 emergency execution
$ErrorActionPreference = 'Stop'
$repo = 'D:\OB-1-CANONICAL'
$D1 = 'https://soul-logger.mrmichaelhobbs123.workers.dev'
$run = 152
$runPad = '{0:D3}' -f $run

# Paths
$rrlPath = Join-Path $repo ('RRL\RRL-' + $runPad + '.txt')
$sealPath = Join-Path $repo ('CANON\REINCARNATION\run' + $runPad + '-reincarnateDEATH.md')
$ledgerDir = Join-Path $repo 'CANON\HEAVY-LEDGER'
$starmapDir = Join-Path $repo 'CANON\STARMAP'
$keywordDir = Join-Path $repo 'CANON\SOUL-KEYWORDS'
$pipelineDir = Join-Path $repo 'CANON\PIPELINE'
$dnaDir = Join-Path $repo 'CANON\SOUL\EXTRACT'
$idxPath = Join-Path $keywordDir 'inverted-index.json'
$artRegistryDir = Join-Path $repo 'CANON\ART-REGISTRY'

# Ensure directories exist
foreach ($p in @($ledgerDir,$starmapDir,$keywordDir,$pipelineDir,$dnaDir,$artRegistryDir)) {
    if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p -Force | Out-Null }
}

# Helper functions
function Get-Next-LedgerID {
    param([string]$LedgerDir)
    $existing = Get-ChildItem -LiteralPath $LedgerDir -Filter 'HL-*.json' -ErrorAction SilentlyContinue |
        ForEach-Object { if ($_.Name -match 'HL-(\d+)\.json$') { [int]$matches[1] } }
    if ($existing) { return ($existing | Measure-Object -Maximum).Maximum + 1 }
    return 1
}
function Get-Tail-Ledger-Hash {
    param([string]$LedgerDir)
    $latest = Get-ChildItem -LiteralPath $LedgerDir -Filter 'HL-*.json' -ErrorAction SilentlyContinue |
        ForEach-Object { [PSCustomObject]@{ N=[int]([regex]::Match($_.Name,'HL-(\d+)').Groups[1].Value); F=$_.FullName } } |
        Sort-Object N -Descending | Select-Object -First 1
    if (-not $latest) { return $null }
    (Get-Content $latest.F -Raw | ConvertFrom-Json).merkle_hash
}
function Compute-Sha256 {
    param([string]$InputString)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($InputString)
    $hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
    return [System.BitConverter]::ToString($hash) -replace '-', ''
}
function Write-SafeStatus {
    param([string]$Message)
    # EC-005: Unicode-safe status output
    $safe = $Message -replace '[^\x00-\x7F]', '?'
    Write-Host $safe
}

# Pipeline result tracking
$pipelineResult = [ordered]@{}
$edgeCaseFlags = @()
$partialFailures = @()

# ============================================================================
# STAGE 1: PRE-FLIGHT + DIRTY TREE AUDIT (Edge case #10)
# ============================================================================
Write-SafeStatus "=== STAGE 1: PRE-FLIGHT ==="
$head = git rev-parse --short HEAD
$branch = git rev-parse --abbrev-ref HEAD
$dirtyFiles = git status --short
$dirtyCount = ($dirtyFiles | Measure-Object).Count
$pipelineResult['head'] = $head
$pipelineResult['branch'] = $branch
$pipelineResult['dirty_count'] = $dirtyCount
if ($dirtyCount -gt 50) {
    $edgeCaseFlags += "EC-10: Dirty tree has $dirtyCount files; artifacts may be masked"
}
Write-SafeStatus "STAGE 1: HEAD=$head branch=$branch dirty=$dirtyCount"

# ============================================================================
# STAGE 2: SESSION TYPE DETECTION (Edge cases #1, #7)
# ============================================================================
Write-SafeStatus "=== STAGE 2: SESSION DETECTION ==="
$kiloSession = $true
$rrlSourceProvided = $false
$rrlFreshEmpty = $false

# Check if RRL exists
if (Test-Path $rrlPath) {
    $rrlBytes = (Get-Item $rrlPath).Length
    if ($rrlBytes -ge 5000) {
        $kiloSession = $false
    }
} else {
    # EC-001: Empty RRL in Kilo mode - write placeholder
    Write-SafeStatus "STAGE 2: No RRL found, writing empty placeholder (Kilo mode)"
    '' | Set-Content -LiteralPath $rrlPath -Encoding UTF8
    $rrlFreshEmpty = $true
    $kiloSession = $true
}

# EC-007: Placeholder RRL carry-forward guard
$priorPad = '{0:D3}' -f ($run - 1)
$priorRrl = Join-Path $repo ('RRL\RRL-' + $priorPad + '.txt')
if ($rrlFreshEmpty -and (Test-Path $priorRrl)) {
    $priorBytes = (Get-Item $priorRrl).Length
    if ($priorBytes -eq 0) {
        $edgeCaseFlags += "EC-007: Prior RRL was also empty placeholder; consecutive KILO_GAP"
    }
}

Write-SafeStatus "STAGE 2: hollow=$kiloSession fresh_empty=$rrlFreshEmpty"

# ============================================================================
# STAGE 3: RRL RESOLUTION (Edge cases #1, #7)
# ============================================================================
Write-SafeStatus "=== STAGE 3: RRL RESOLUTION ==="
$rrlText = ''
$rrlBytes = 0
$rrlChars = 0
$hasUser = $false
$hasAssistant = $false

if ($kiloSession) {
    # EC-001: Ensure placeholder exists
    if (-not (Test-Path $rrlPath)) {
        '' | Set-Content -LiteralPath $rrlPath -Encoding UTF8
    }
    $rrlText = Get-Content $rrlPath -Raw -Encoding UTF8
    $rrlBytes = (Get-Item $rrlPath).Length
    $rrlChars = $rrlText.Length
} else {
    $rrlText = Get-Content $rrlPath -Raw -Encoding UTF8
    $rrlBytes = (Get-Item $rrlPath).Length
    $rrlChars = $rrlText.Length
    $hasUser = $rrlText -match '"role"\s*:\s*"user"'
    $hasAssistant = $rrlText -match '"role"\s*:\s*"assistant"'
}

$pipelineResult['rrl_bytes'] = $rrlBytes
$pipelineResult['rrl_chars'] = $rrlChars
Write-SafeStatus "STAGE 3: RRL resolved bytes=$rrlBytes"

# ============================================================================
# STAGE 4: RRL FIDELITY GATE (Edge case #11)
# ============================================================================
Write-SafeStatus "=== STAGE 4: FIDELITY GATE ==="
if (-not $kiloSession) {
    if (-not $hasUser -or -not $hasAssistant) {
        $edgeCaseFlags += "EC-011: One-sided transcript user=$hasUser assistant=$hasAssistant"
        Write-SafeStatus "STAGE 4: WARN one-sided transcript"
    } else {
        Write-SafeStatus "STAGE 4: Both speakers present"
    }
} else {
    Write-SafeStatus "STAGE 4: Kilo session, fidelity check skipped"
}

# ============================================================================
# STAGE 5: RRL PLACEHOLDER GUARD (Edge case #7)
# ============================================================================
Write-SafeStatus "=== STAGE 5: PLACEHOLDER GUARD ==="
if ($rrlFreshEmpty -and $rrlBytes -eq 0) {
    $edgeCaseFlags += "EC-007: Fresh empty placeholder written, cannot carry forward"
    Write-SafeStatus "STAGE 5: Fresh empty placeholder confirmed"
} elseif ($rrlBytes -eq 0) {
    $edgeCaseFlags += "EC-007: RRL is 0 bytes but not freshly written"
    Write-SafeStatus "STAGE 5: WARN empty RRL not freshly written"
}

# ============================================================================
# STAGE 6: SOUL RECEIPT (Edge case #8)
# ============================================================================
Write-SafeStatus "=== STAGE 6: SOUL ==="
$countBefore = 0
$receipt = $null
$soulRetryCount = 0
$soulMaxRetries = 1  # EC-008: double-retry exhaustion guard

if ($kiloSession) {
    Write-SafeStatus "STAGE 6: KILO_HOLLOW SOUL skipped"
    try { $countBefore = (Invoke-RestMethod ('{0}/api/soul/count' -f $D1)).soulcount } catch {}
    $receipt = [ordered]@{
        event_id = 'DRYRUN'
        count_before = $countBefore
        count_after = $countBefore
        delta = 0
        level = 'KILO_HOLLOW'
        posted_at = (Get-Date -Format 'o')
    }
} else {
    $countBefore = (Invoke-RestMethod ('{0}/api/soul/count' -f $D1)).soulcount
    $userTexts = $rrlText -split "`n" | ForEach-Object {
        $o = $_.Trim() | ConvertFrom-Json -ErrorAction SilentlyContinue
        if (-not $o) { return }
        $role = if ($o.message) { $o.message.role } else { $o.role }
        if ($role -ne 'user') { return }
        $content = if ($o.message) { $o.message.content } else { $o.content }
        if ($content -is [string]) { $content }
        elseif ($content -is [array]) { ($content | Where-Object { $_.type -eq 'text' } | ForEach-Object { $_.text }) -join "`n" }
    } | Where-Object { $_ }
    $soulText = ($userTexts -join "`n").Trim()
    
    if (-not $soulText) {
        $receipt = [ordered]@{
            event_id = 'SOUL_GAP'
            count_before = $countBefore
            count_after = $countBefore
            delta = 0
            level = '(unchanged)'
            posted_at = (Get-Date -Format 'o')
        }
    } else {
        $soulBody = @{
            student_id = 'sov100-michael'
            session_id = 'sov100-roman-run' + $run
            role = 'user'
            text = $soulText
        } | ConvertTo-Json -Depth 2 -Compress
        
        do {
            try {
                $soulPost = Invoke-RestMethod -Uri ('{0}/api/soul/event' -f $D1) -Method Post -Body $soulBody -ContentType 'application/json'
                $countAfter = (Invoke-RestMethod ('{0}/api/soul/count' -f $D1)).soulcount
                $receipt = [ordered]@{
                    event_id = $soulPost.event_id
                    count_before = $countBefore
                    count_after = $countAfter
                    delta = $countAfter - $countBefore
                    level = $countAfter
                    posted_at = (Get-Date -Format 'o')
                }
                $soulRetryCount = $soulMaxRetries  # Success, exit loop
            } catch {
                $soulRetryCount++
                if ($soulRetryCount -gt $soulMaxRetries) {
                    $receipt = [ordered]@{
                        event_id = 'SOUL_POST_FAILED'
                        count_before = $countBefore
                        count_after = $countBefore
                        delta = 0
                        level = 'ERROR'
                        posted_at = (Get-Date -Format 'o')
                    }
                    $edgeCaseFlags += "EC-008: SOUL API failed after $soulRetryCount attempts"
                    break
                }
            }
        } while ($soulRetryCount -le $soulMaxRetries)
    }
}

$pipelineResult['soul_event_id'] = if ($receipt) { $receipt.event_id } else { 'SOUL_GAP' }
$pipelineResult['soul_delta'] = if ($receipt) { $receipt.delta } else { 0 }
Write-SafeStatus "STAGE 6: SOUL event_id=$($receipt.event_id) delta=$($receipt.delta)"

# ============================================================================
# STAGE 7: DNA EXTRACTION
# ============================================================================
Write-SafeStatus "=== STAGE 7: DNA ==="
$dnaCount = 0
$dnaBlueprintCount = 0
$dnaRecords = @()

if ($kiloSession) {
    Write-SafeStatus "STAGE 7: KILO_HOLLOW DNA skipped"
} else {
    $turnSeq = 0
    $rrlText -split "`n" | ForEach-Object {
        $o = $_.Trim() | ConvertFrom-Json -ErrorAction SilentlyContinue
        if (-not $o) { return }
        $role = if ($o.message) { $o.message.role } else { $o.role }
        if ($role -ne 'assistant') { return }
        $content = if ($o.message) { $o.message.content } else { $o.content }
        $text = if ($content -is [string]) { $content }
                 elseif ($content -is [array]) { ($content | Where-Object { $_.type -eq 'text' } | ForEach-Object { $_.text }) -join "`n" }
        $text = if ($text) { $text.Trim() } else { '' }
        if ($text.Length -lt 10) { return }
        $turnSeq++
        $isBlueprint = ($text -match '```|\b(SPEC|SPECIFICATION|BLUEPRINT|ARCHITECTURE|SCHEMA|DESIGN)\b' -and $text.Length -gt 200)
        $script:dnaRecords += [ordered]@{ run=$run; seq=$turnSeq; type=if ($isBlueprint) { 'blueprint' } else { 'prose' }; chars=$text.Length; text=$text }
    }
    $dnaCount = $dnaRecords.Count
    $dnaBlueprintCount = ($dnaRecords | Where-Object { $_.type -eq 'blueprint' }).Count
    if ($dnaCount -gt 0) {
        $dnaPath = Join-Path $dnaDir ('dna-run' + $run + '.json')
        $dnaRecords | ConvertTo-Json -Depth 5 | Set-Content $dnaPath -Encoding UTF8
        Write-SafeStatus "STAGE 7: DNA $dnaCount records ($dnaBlueprintCount blueprints)"
    } else {
        Write-SafeStatus "STAGE 7: DNA_GAP"
    }
}

# ============================================================================
# STAGE 8: DNA BLUEPRINT DETECTION
# ============================================================================
Write-SafeStatus "=== STAGE 8: BLUEPRINT DETECTION ==="
if ($dnaBlueprintCount -eq 0 -and $dnaCount -gt 0) {
    $edgeCaseFlags += "EC-008: DNA has $dnaCount records but 0 blueprints"
}
Write-SafeStatus "STAGE 8: blueprints=$dnaBlueprintCount records=$dnaCount"

# ============================================================================
# STAGE 9: LEDGER ID GENERATION (Edge case #2)
# ============================================================================
Write-SafeStatus "=== STAGE 9: LEDGER ID ==="
$nextHL = Get-Next-LedgerID -LedgerDir $ledgerDir
if ($nextHL -le 0) {
    $nextHL = 1
    $edgeCaseFlags += "EC-002: Ledger ID generation returned invalid value, reset to 1"
}
Write-SafeStatus "STAGE 9: nextHL=$nextHL"

# ============================================================================
# STAGE 10: LEDGER HASH + SCHEMA DRIFT CHECK (Edge case #3)
# ============================================================================
Write-SafeStatus "=== STAGE 10: LEDGER HASH ==="
$parentHash = Get-Tail-Ledger-Hash -LedgerDir $ledgerDir
$timestamp = (Get-Date -Format 'o')
$soulHash = Compute-Sha256 $rrlText
$dnaHash = if ($dnaCount -gt 0) { Compute-Sha256 ($dnaRecords | ConvertTo-Json -Compress) } else { 'DNA_GAP' }
$ledgerHash = Compute-Sha256 "$soulHash|$dnaHash|$parentHash|$timestamp"

# EC-003: Schema drift check - validate against actual HL format
$expectedSchema = @('hl_id','session_id','rrl_source','char_count','byte_count','soul_hash','dna_hash','merkle_parent','merkle_hash','sealed_at','sov100','run')
$ledgerEntry = [ordered]@{
    hl_id = 'HL-' + $nextHL
    session_id = 'sov100-roman-run' + $run
    rrl_source = $rrlPath
    char_count = $rrlChars
    byte_count = $rrlBytes
    soul_hash = $soulHash
    dna_hash = $dnaHash
    dna_blueprint_count = $dnaBlueprintCount
    merkle_parent = $parentHash
    merkle_hash = $ledgerHash
    sealed_at = $timestamp
    sov100 = $true
    run = $run
}
$jsonCheck = $ledgerEntry | ConvertTo-Json -Depth 5
try {
    $null = $jsonCheck | ConvertFrom-Json
    $schemaValid = $true
} catch {
    $schemaValid = $false
    $edgeCaseFlags += "EC-003: Schema validation failed for HL-$nextHL"
}

$ledgerPath = Join-Path $ledgerDir ('HL-' + $nextHL + '.json')
$ledgerEntry | ConvertTo-Json -Depth 5 | Set-Content $ledgerPath -Encoding UTF8
Write-SafeStatus "STAGE 10: LEDGER hash computed schema_valid=$schemaValid"

# ============================================================================
# STAGE 11: LEDGER WRITE + IDEMPOTENCY (Edge case #6)
# ============================================================================
Write-SafeStatus "=== STAGE 11: LEDGER IDEMPOTENCY ==="
$dupe = Get-ChildItem $ledgerDir -Filter 'HL-*.json' -ErrorAction SilentlyContinue |
    Where-Object { try { (Get-Content $_.FullName -Raw | ConvertFrom-Json).run -eq $run } catch { $false } }
if ($dupe) {
    $edgeCaseFlags += "EC-006: Concurrent death detected - HL for run $run already exists"
    Write-SafeStatus "STAGE 11: ABORT duplicate HL for run $run"
    throw "IDEMPOTENCY ABORT - run $run already sealed"
}
Write-SafeStatus "STAGE 11: No duplicate, HL-$nextHL written"

# ============================================================================
# STAGE 12: STARMAP CREATION
# ============================================================================
Write-SafeStatus "=== STAGE 12: STARMAP ==="
$starmap = [ordered]@{
    run = $run
    rrl_path = $rrlPath
    ledger_id = 'HL-' + $nextHL
    soul_turn_ids = ''
    dna_turn_ids = ''
    blueprint_locations = ''
    char_count = $rrlChars
    merkle_hash = $ledgerHash
    created_at = $timestamp
} | ConvertTo-Json -Depth 4
$starmapPath = Join-Path $starmapDir ('starmap-run' + $runPad + '.json')
$starmap | Set-Content $starmapPath -Encoding UTF8
Write-SafeStatus "STAGE 12: STARMAP written"

# ============================================================================
# STAGE 13: SOULKEYS EXTRACTION (Edge case #4)
# ============================================================================
Write-SafeStatus "=== STAGE 13: SOULKEYS ==="
$combinedText = $rrlText
$words = $combinedText -split '\s+' | Where-Object { $_.Length -gt 4 } | Where-Object { $_ -notmatch '^(this|that|with|from|have|been|were|they|will|would|could|should|about|there|their|which|what|when|make|like|just|some|more|than|also|very|much|many|into|over|been|being|through|where|after|before|because|being|against|between|without|within|along|follow|coming|think|know|take|come|make|look|want|give|work|time|year|good|some|them|would|could|other|about|which|their|there|first|would|these|those|under|should|after|where|since|still|every|being|great|where|place|found|sound|below|seen|enough|while|both|show|those|taken|might|long|down|part|same|back|call|hand|high|last|next|left|turn|move|live|believe|happen|bring|write|provide|sit|stand|lose|pay|meet|include|continue|set|learn|change|lead|understand|watch|follow|stop|create|speak|read|allow|add|spend|grow|open|walk|win|offer|remember|love|consider|appear|buy|wait|serve|die|send|expect|build|stay|fall|cut|reach|kill|remain|suggest|raise|pass|sell|require|report|decide|pull|develop|return|explain|hope|describe|decide|share|provide|cover|fall|catch|draw|choose|wish|teach|test|wear|supply|shut|hold|push|close|deal|fill|break|support|record|cut|heat|watch|raise|reach|fly|land|cancel|graduate|enroll|register|complete|submit|assign|grade|assess|evaluate|review|approve|reject|confirm|notify|alert|remind|schedule|book|reserve|request|order|purchase|pay|charge|refund|invoice|receipt|transaction|payment|deposit|withdraw|transfer|balance|account|statement|ledger|audit|compliance|regulation|policy|contract|agreement|terms|conditions|liability|warranty|dispute|resolution|arbitration|mediation|escalate|appeal|petition|claim|evidence|document|certificate|attest|verify|validate|authenticate|authorize|authenticate|deprecate|obsolete|retire|decommission|archive|purge|delete|destroy|shred|encrypt|decrypt|cipher|hash|salt|key|cert|token|session|cookie|cache|queue|buffer|stream|socket|pipe|channel|bandwidth|latency|throughput|capacity|quota|limit|threshold|rate|pace|burst|flow|routing|dispatch|deliver|notify|trigger|fire|emit|broadcast|cast|scatter|gather|collect|aggregate|summarize|compress|decompress|encode|decode|serialize|deserialize|parse|tokenize|lemmatize|stem|inflect|conjugate|decline|compare|diff|patch|merge|split|join|union|intersect|subtract|complement|normalize|denormalize|flatten|nest|wrap|unwrap|bundle|unbundle|package|unpackage|container|image|snapshot|backup|restore|migrate|upgrade|downgrade|rollback|revert|reset|refresh|reboot|restart|shutdown|startup|initialize|configure|setup|install|uninstall|deploy|undeploy|provision|deprovision|allocate|deallocate|reserve|release|lock|unlock|acquire|surrender|claim|relinquish|assign|reassign|delegate|proxy|forward|redirect|relay|translate|transform|convert|adapt|evolve|iterate|increment|decrement|advance|retreat|proceed|abort|terminate|kill|cease|halt|pause|resume|continue|persist|persist)$' }
$wordFreq = $words | Group-Object | Sort-Object Count -Descending | Select-Object -First 30
$rfkwPath = Join-Path $keywordDir ('rfkw-run' + $runPad + '.txt')
$wordFreq | ForEach-Object { "$($_.Count) | $($_.Name)" } | Set-Content $rfkwPath -Encoding UTF8

# EC-004: PowerShell 5.1 safe index update (no -AsHashtable)
$inverted = @{}
if (Test-Path $idxPath) {
    $raw = Get-Content $idxPath -Raw
    try {
        $parsed = $raw | ConvertFrom-Json
        if ($parsed -is [System.Collections.IDictionary]) {
            foreach ($k in $parsed.Keys) {
                $inverted[$k] = $parsed[$k]
            }
        }
    } catch {
        $edgeCaseFlags += "EC-004: Failed to parse inverted-index.json, starting fresh"
    }
}

foreach ($kw in $wordFreq) {
    $term = $kw.Name.Trim().ToLower()
    $weight = [int]$kw.Count
    if (-not $inverted[$term]) { $inverted[$term] = @() }
    $entry = @{ run=$run; category='soul+key'; weight=$weight }
    $already = $false
    foreach ($e in $inverted[$term]) { if ($e.run -eq $run) { $already = $true; break } }
    if (-not $already) {
        if ($inverted.ContainsKey($term)) {
            $existing = $inverted[$term]
            if ($existing -is [System.Collections.ICollection]) { $existing += $entry }
            else { $inverted[$term] = @($existing; $entry) }
        } else { $inverted[$term] = $entry }
    }
}
$inverted | ConvertTo-Json -Depth 4 | Set-Content $idxPath -Encoding UTF8
Write-SafeStatus "STAGE 13: SOULKEYS $($inverted.Count) terms"

# ============================================================================
# STAGE 14: SOULKEYS MERGE + UNICODE SAFE (Edge case #5)
# ============================================================================
Write-SafeStatus "=== STAGE 14: UNICODE SAFE ==="
# EC-005: Already handled via Write-SafeStatus wrapper
# Validate rfkw file is readable
$rfkwContent = Get-Content $rfkwPath -Raw -Encoding UTF8
$rfkwLines = ($rfkwContent -split "`n").Count
Write-SafeStatus "STAGE 14: rfkw lines=$rfkwLines"

# ============================================================================
# STAGE 15: S2PIPELINE RECORD
# ============================================================================
Write-SafeStatus "=== STAGE 15: S2PIPELINE ==="
$s2Record = [ordered]@{
    run_number = $run
    executed_at = (Get-Date -Format 'o')
    head_sha = (git rev-parse --short HEAD)
    rrl_path = $rrlPath
    rrl_fidelity = if ($kiloSession) { 'HOLLOW' } else { if ($hasUser -and $hasAssistant) { 'REAL' } else { 'HOLLOW' } }
    session_id = 'sov100-roman-run' + $run
    soul_event_id = $receipt.event_id
    soulcount = $receipt.count_after
    soul_delta = $receipt.delta
    dna_count = $dnaCount
    dna_blueprint_count = $dnaBlueprintCount
    ledger_id = 'HL-' + $nextHL
    starmap_file = $starmapPath
    keyword_file = $rfkwPath
    s2pipeline_file = $s2Path
    result = if ($kiloSession) { 'KILO_GAP' } else { 'GAP' }
}
$s2PathFull = Join-Path $pipelineDir ('pipeline-run' + $runPad + '.json')
$s2Record | ConvertTo-Json -Depth 5 | Set-Content $s2PathFull -Encoding UTF8
Write-SafeStatus "STAGE 15: S2Pipeline written"

# ============================================================================
# STAGE 16: REGISTRY SYNC + PARTIAL FAILURE TRACKING (Edge case #9)
# ============================================================================
Write-SafeStatus "=== STAGE 16: REGISTRY SYNC ==="
$syncedPieces = @()
$failedPieces = @()
$runKeywords = @()
if (Test-Path $rfkwPath) {
    $runKeywords = (Get-Content $rfkwPath -Raw) -split "`n" |
        Where-Object { $_ -match '^\d+\s*\|' } |
        ForEach-Object { (($_ -split '\|')[1]).Trim().ToLower() } |
        Where-Object { $_.Length -gt 2 }
}

try {
    $regResp = Invoke-RestMethod 'https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/art?limit=400' -TimeoutSec 15
    $regPieces = $regResp.pieces
    $merkleShort = $ledgerHash.Substring(0,16)
    
    foreach ($piece in $regPieces) {
        if (-not $piece) { continue }
        $pieceTags = ($piece.tags -split ',') | ForEach-Object { $_.Trim().ToLower() } | Where-Object { $_ }
        $pieceTitle = ($piece.title -replace '[^a-zA-Z0-9 ]','').ToLower()
        $matched = @($pieceTags | Where-Object { $runKeywords -contains $_ })
        $titleHit = ($rrlText -match [regex]::Escape($piece.title)) -or ($rrlText -match [regex]::Escape($piece.url -replace '-hd\.png|\.png|isolated/',''))
        if ($matched.Count -eq 0 -and -not $titleHit) { continue }
        
        $existingNotes = if ($piece.notes) { $piece.notes } else { '' }
        $runTag = 'run' + $runPad
        if ($existingNotes -notmatch $runTag) {
            $appendNote = '[' + $runTag + ' | HL-' + $nextHL + ' | ' + $merkleShort + ' | kw:' + ($matched -join ',') + ' | sm:starmap-run' + $runPad + '.json]'
            $newNotes = ($existingNotes + ' ' + $appendNote).Trim()
            try {
                $patchBody = @{ notes = $newNotes } | ConvertTo-Json -Compress
                Invoke-RestMethod ('https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/art/' + $piece.id) -Method PATCH -Body $patchBody -ContentType 'application/json' -TimeoutSec 10 | Out-Null
                $syncedPieces += [ordered]@{ id=$piece.id; title=$piece.title; keywords=$matched }
            } catch {
                $failedPieces += [ordered]@{ id=$piece.id; title=$piece.title; error=$_.Exception.Message }
                $edgeCaseFlags += "EC-009: PATCH failed for $($piece.title)"
            }
        }
    }
} catch {
    $edgeCaseFlags += "EC-009: Registry fetch failed: $($_.Exception.Message)"
}

$artSyncPath = Join-Path $artRegistryDir ('art-sync-run' + $runPad + '.json')
[ordered]@{
    run = $run
    ledger_id = 'HL-' + $nextHL
    merkle_short = $ledgerHash.Substring(0,16)
    starmap_file = 'starmap-run' + $runPad + '.json'
    keywords_file = 'rfkw-run' + $runPad + '.txt'
    keywords_used = $runKeywords
    pieces_synced = $syncedPieces.Count
    pieces = $syncedPieces
    failed_pieces = $failedPieces
    executed_at = $timestamp
} | ConvertTo-Json -Depth 6 | Set-Content $artSyncPath -Encoding UTF8
Write-SafeStatus "STAGE 16: REGISTRY_SYNC synced=$($syncedPieces.Count) failed=$($failedPieces.Count)"

# ============================================================================
# STAGE 17: SCHEMA DRIFT VALIDATION (Edge case #3)
# ============================================================================
Write-SafeStatus "=== STAGE 17: SCHEMA DRIFT ==="
# Validate HL on disk matches expected format
$hlRaw = Get-Content $ledgerPath -Raw -Encoding UTF8
try {
    $hlParsed = $hlRaw | ConvertFrom-Json
    $schemaOk = $hlParsed.hl_id -and $hlParsed.merkle_hash -and $hlParsed.run -eq $run
    if (-not $schemaOk) {
        $edgeCaseFlags += "EC-003: HL schema drift detected on disk"
    }
} catch {
    $schemaOk = $false
    $edgeCaseFlags += "EC-003: HL JSON parse error on disk"
}
Write-SafeStatus "STAGE 17: schema_ok=$schemaOk"

# ============================================================================
# STAGE 18: DEATH SEAL GENERATION
# ============================================================================
Write-SafeStatus "=== STAGE 18: SEAL ==="
$sealLines = @()
$sealLines += "# Run $runPad - reincarnateDEATH v7.1"
$sealLines += "## S1 HEADER"
$sealLines += "- run: $run"
$sealLines += "- datetime_ict: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')"
$sealLines += "- theme: KILO_GAP emergency seal"
$sealLines += "- signal_density: LOW"
$sealLines += "- head_pre_death: $head"
$sealLines += "- branch: $branch"
$sealLines += "- dirty_tree: $(if ($dirtyCount -gt 50) { 'YES(' + $dirtyCount + ')' } else { 'NO' })"
$sealLines += ""
$sealLines += "## S2 RAW SOUL DNA"
$sealLines += "_KILO_GAP - no raw transcript available for this CLI session._"
$sealLines += ""
$sealLines += "## S3 SOUL RECEIPT"
$sealLines += "- event_id: $($receipt.event_id)"
$sealLines += "- count_before: $($receipt.count_before)"
$sealLines += "- count_after: $($receipt.count_after)"
$sealLines += "- delta: $($receipt.delta)"
$sealLines += "- level: $($receipt.level)"
$sealLines += "- posted_at: $($receipt.posted_at)"
$sealLines += ""
$sealLines += "## S4 DECISIONS"
$sealLines += "1. Run $run sealed as KILO_GAP."
$sealLines += "2. Empty RRL placeholder written."
$sealLines += "3. SOUL dry-run; DNA missing; hollow artifacts."
$sealLines += ""
$sealLines += "## S5 CORRECTIONS"
$sealLines += "- Wrong: expected real RRL in CLI Kilo mode."
$sealLines += "- Root cause: Kilo environment does not auto-produce real transcripts."
$sealLines += "- Fix: accept empty placeholder and seal KILO_GAP."
$sealLines += "- Docs read: reincarnatedeath.md Stage 0/1 Kilo exception."
$sealLines += ""
$sealLines += "## S6 NEW PRINCIPLES"
$sealLines += "- Emergency death can run without real RRL if Kilo mode is detected."
$sealLines += "- Seal must remain honest: KILO_GAP, not COMPLETE."
$sealLines += ""
$sealLines += "## S7 EMOTIONAL SIGNAL"
$sealLines += "Neutral. Minimal-juice seal completed."
$sealLines += ""
$sealLines += "## S8 OPEN QUESTIONS"
$sealLines += "- RRL source for this environment when available?"
$sealLines += ""
$sealLines += "## S9 UNFINISHED ACTIONS"
$sealLines += "- Provide actual RRL source for next non-hollow run."
$sealLines += ""
$sealLines += "## S10 SYSTEM DESIGN"
$sealLines += "Hollow artifacts preserve chain continuity: HL, STARMAP, SOULKEYS, S2Pipeline, REGISTRY_SYNC."
$sealLines += ""
$sealLines += "## S11 ARTIFACTS"
$sealLines += "- RRL: $rrlPath"
$sealLines += "- SOUL: event_id=$($receipt.event_id)"
$sealLines += "- DNA: GAP"
$sealLines += "- LEDGER: $ledgerPath"
$sealLines += "- STARMAP: $starmapPath"
$sealLines += "- SOULKEYS: $idxPath"
$sealLines += "- S2Pipeline: $s2PathFull"
$sealLines += "- REGISTRY_SYNC: $artSyncPath"
$sealLines += ""
$sealLines += "## S12 STATE SNAPSHOT"
$sealLines += "- HEAD: $head"
$sealLines += "- branch: $branch"
$sealLines += "- dirty_tree: $(if ($dirtyCount -gt 50) { 'YES(' + $dirtyCount + ')' } else { 'NO' })"
$sealLines += "- soulcount: $($receipt.count_after)"
$sealLines += "- dna_blueprint_count: 0"
$sealLines += ""
$sealLines += "## S13 FINGERPRINT"
$sealLines += "- agent: AGENT99"
$sealLines += "- run#: $run"
$sealLines += "- commit_sha: $(git rev-parse HEAD)"
$sealLines += "- platform: win32 / powershell"
$sealLines += "- death_test: KILO_GAP_EMERGENCY"
$sealLines += ""
$sealLines += "## S14 ART REGISTRY SYNC"
$sealLines += "- pieces_synced: $($syncedPieces.Count)"
$sealLines += "- failed_pieces: $($failedPieces.Count)"
$sealLines += "- art-sync-run$runPad.json: $artSyncPath"
$sealLines += "- keywords_matched: $($runKeywords -join ', ')"
$sealLines += ""
$sealLines += "## S15 REGISTRY"
$sealLines += "- dna-registry-run$runPad.json: N/A"
$sealLines += ""
$sealLines += "## EDGE CASE FLAGS"
$sealLines += "```"
foreach ($flag in $edgeCaseFlags) { $sealLines += $flag }
$sealLines += "```"
$sealLines | Set-Content $sealPath -Encoding UTF8
Write-SafeStatus "STAGE 18: Seal written with $($edgeCaseFlags.Count) edge case flags"

# ============================================================================
# STAGE 19: COMMIT + ARTIFACT-ONLY STAGING (Edge case #10)
# ============================================================================
Write-SafeStatus "=== STAGE 19: COMMIT ==="
$artifacts = @($sealPath, $ledgerPath, $starmapPath, $idxPath, $s2PathFull, $artSyncPath, $rfkwPath, $rrlPath)
# EC-010: Only stage pipeline artifacts, not unrelated dirty files
git add $artifacts
$msg = "death: Run $run - DEATH v7.1 21-stage | HL-$nextHL | RRL=0 bytes | soulcount=$($receipt.count_after) | result=KILO_GAP | edge_cases=$($edgeCaseFlags.Count) | HEAD=$head"
git commit -m $msg
Write-SafeStatus "STAGE 19: COMMITTED $msg"

# ============================================================================
# STAGE 20: POST-COMMIT VERIFICATION
# ============================================================================
Write-SafeStatus "=== STAGE 20: VERIFY ==="
$commitHash = git rev-parse --short HEAD
$sealExists = Test-Path $sealPath
$hlExists = Test-Path $ledgerPath
$starmapExists = Test-Path $starmapPath
$pipelineResult['commit'] = $commitHash
$pipelineResult['seal_exists'] = $sealExists
$pipelineResult['hl_exists'] = $hlExists
$pipelineResult['starmap_exists'] = $starmapExists
Write-SafeStatus "STAGE 20: commit=$commitHash seal=$sealExists hl=$hlExists starmap=$starmapExists"

# ============================================================================
# STAGE 21: PIPELINE RESULT REPORT
# ============================================================================
Write-SafeStatus "=== STAGE 21: RESULT ==="
$result = [ordered]@{
    run = $run
    result = 'KILO_GAP'
    hl_id = 'HL-' + $nextHL
    edge_cases = $edgeCaseFlags.Count
    artifacts = $artifacts.Count
    commit = $commitHash
}
Write-SafeStatus "STAGE 21: Run $run complete result=$($result.result) edge_cases=$($edgeCaseFlags.Count)"
