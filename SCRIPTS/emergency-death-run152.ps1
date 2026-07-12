$ErrorActionPreference = 'Stop'
$repo = 'D:\OB-1-CANONICAL'
$D1 = 'https://soul-logger.mrmichaelhobbs123.workers.dev'
$run = 152
$runPad = '{0:D3}' -f $run

$rrlPath = Join-Path $repo ('RRL\RRL-' + $runPad + '.txt')
$sealPath = Join-Path $repo ('CANON\REINCARNATION\run' + $runPad + '-reincarnateDEATH.md')
$ledgerDir = Join-Path $repo 'CANON\HEAVY-LEDGER'
$starmapDir = Join-Path $repo 'CANON\STARMAP'
$keywordDir = Join-Path $repo 'CANON\SOUL-KEYWORDS'
$pipelineDir = Join-Path $repo 'CANON\PIPELINE'
$dnaDir = Join-Path $repo 'CANON\SOUL\EXTRACT'
$idxPath = Join-Path $keywordDir 'inverted-index.json'

foreach ($p in @($ledgerDir,$starmapDir,$keywordDir,$pipelineDir,$dnaDir)) {
    if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p -Force | Out-Null }
}

# STAGE 0/1 - KILO_GAP
if (-not (Test-Path $rrlPath)) {
    '' | Set-Content -LiteralPath $rrlPath -Encoding UTF8
}
$rrlText = Get-Content $rrlPath -Raw -Encoding UTF8
$rrlBytes = (Get-Item $rrlPath).Length
$rrlChars = $rrlText.Length
$kiloSession = $true
if ($rrlBytes -ge 5000) {
    $hasUser = $rrlText -match '"role"\s*:\s*"user"'
    $hasAssistant = $rrlText -match '"role"\s*:\s*"assistant"'
    if ($hasUser -and $hasAssistant) { $kiloSession = $false }
}
Write-Host "STAGE 0/1: hollow=$kiloSession bytes=$rrlBytes"

# STAGE 2 - SOUL
$countBefore = 0; $receipt = $null
if ($kiloSession) {
    try { $countBefore = (Invoke-RestMethod ('{0}/api/soul/count' -f $D1)).soulcount } catch {}
    $receipt = [ordered]@{
        event_id = 'DRYRUN'
        count_before = $countBefore
        count_after = $countBefore
        delta = 0
        level = 'KILO_HOLLOW'
        posted_at = (Get-Date -Format 'o')
    }
    Write-Host "STAGE 2: SOUL DRYRUN soulcount=$countBefore"
} else {
    $countBefore = (Invoke-RestMethod ('{0}/api/soul/count' -f $D1)).soulcount
    $receipt = [ordered]@{
        event_id = 'SOUL_GAP'
        count_before = $countBefore
        count_after = $countBefore
        delta = 0
        level = '(unchanged)'
        posted_at = (Get-Date -Format 'o')
    }
    Write-Host "STAGE 2: SOUL_GAP"
}

# STAGE 3 - DNA
$dnaCount = 0; $dnaBlueprintCount = 0
Write-Host "STAGE 3: DNA_GAP"

# STAGE 4 - LEDGER
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

$nextHL = Get-Next-LedgerID -LedgerDir $ledgerDir
$parentHash = Get-Tail-Ledger-Hash -LedgerDir $ledgerDir
$timestamp = (Get-Date -Format 'o')
$soulHash = Compute-Sha256 $rrlText
$dnaHash = 'DNA_GAP'
$ledgerHash = Compute-Sha256 "$soulHash|$dnaHash|$parentHash|$timestamp"
$ledgerEntry = [ordered]@{
    hl_id = 'HL-' + $nextHL
    session_id = 'sov100-roman-run' + $run
    rrl_source = $rrlPath
    char_count = $rrlChars
    byte_count = $rrlBytes
    soul_hash = $soulHash
    dna_hash = $dnaHash
    dna_blueprint_count = 0
    merkle_parent = $parentHash
    merkle_hash = $ledgerHash
    sealed_at = $timestamp
    sov100 = $true
    run = $run
}
$ledgerPath = Join-Path $ledgerDir ('HL-' + $nextHL + '.json')
$ledgerEntry | ConvertTo-Json -Depth 5 | Set-Content $ledgerPath -Encoding UTF8
$parentShort = if ($parentHash) { $parentHash.Substring(0,16) } else { 'NULL' }
Write-Host "STAGE 4: LEDGER HL-$nextHL parent=$parentShort"

# STAGE 5 - STARMAP
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
Write-Host "STAGE 5: STARMAP written"

# STAGE 6 - SOULKEYS
$combinedText = $rrlText
$words = $combinedText -split '\s+' | Where-Object { $_.Length -gt 4 } | Where-Object { $_ -notmatch '^(this|that|with|from|have|been|were|they|will|would|could|should|about|there|their|which|what|when|make|like|just|some|more|than|also|very|much|many|into|over|been|being|through|where|after|before|because|being|against|between|without|within|along|follow|coming|think|know|take|come|make|look|want|give|work|time|year|good|some|them|would|could|other|about|which|their|there|first|would|these|those|under|should|after|where|since|still|every|being|great|where|place|found|sound|below|seen|enough|while|both|show|those|taken|might|long|down|part|same|back|call|hand|high|last|next|left|turn|move|live|believe|happen|bring|write|provide|sit|stand|lose|pay|meet|include|continue|set|learn|change|lead|understand|watch|follow|stop|create|speak|read|allow|add|spend|grow|open|walk|win|offer|remember|love|consider|appear|buy|wait|serve|die|send|expect|build|stay|fall|cut|reach|kill|remain|suggest|raise|pass|sell|require|report|decide|pull|develop|return|explain|hope|describe|decide|share|provide|cover|fall|catch|draw|choose|wish|teach|test|wear|supply|shut|hold|push|close|deal|fill|break|support|record|cut|heat|watch|raise|reach|fly|land|cancel|graduate|enroll|register|complete|submit|assign|grade|assess|evaluate|review|approve|reject|confirm|notify|alert|remind|schedule|book|reserve|request|order|purchase|pay|charge|refund|invoice|receipt|transaction|payment|deposit|withdraw|transfer|balance|account|statement|ledger|audit|compliance|regulation|policy|contract|agreement|terms|conditions|liability|warranty|dispute|resolution|arbitration|mediation|escalate|appeal|petition|claim|evidence|document|certificate|attest|verify|validate|authenticate|authorize|authenticate|deprecate|obsolete|retire|decommission|archive|purge|delete|destroy|shred|encrypt|decrypt|cipher|hash|salt|key|cert|token|session|cookie|cache|queue|buffer|stream|socket|pipe|channel|bandwidth|latency|throughput|capacity|quota|limit|threshold|rate|pace|burst|flow|routing|dispatch|deliver|notify|trigger|fire|emit|broadcast|cast|scatter|gather|collect|aggregate|summarize|compress|decompress|encode|decode|serialize|deserialize|parse|tokenize|lemmatize|stem|inflect|conjugate|decline|compare|diff|patch|merge|split|join|union|intersect|subtract|complement|normalize|denormalize|flatten|nest|wrap|unwrap|bundle|unbundle|package|unpackage|container|image|snapshot|backup|restore|migrate|upgrade|downgrade|rollback|revert|reset|refresh|reboot|restart|shutdown|startup|initialize|configure|setup|install|uninstall|deploy|undeploy|provision|deprovision|allocate|deallocate|reserve|release|lock|unlock|acquire|surrender|claim|relinquish|assign|reassign|delegate|proxy|forward|redirect|relay|translate|transform|convert|adapt|evolve|iterate|increment|decrement|advance|retreat|proceed|abort|terminate|kill|cease|halt|pause|resume|continue|persist|persist)$' }
$wordFreq = $words | Group-Object | Sort-Object Count -Descending | Select-Object -First 30
$rfkwPath = Join-Path $keywordDir ('rfkw-run' + $runPad + '.txt')
$wordFreq | ForEach-Object { "$($_.Count) | $($_.Name)" } | Set-Content $rfkwPath -Encoding UTF8
$inverted = if (Test-Path $idxPath) { (Get-Content $idxPath -Raw) | ConvertFrom-Json -AsHashtable } else { @{} }
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
Write-Host "STAGE 6: SOULKEYS $($inverted.Count) terms"

# STAGE 7 - S2Pipeline
$artRegistryDir = Join-Path $repo 'CANON\ART-REGISTRY'
$syncedPieces = @()
$rrlFidelity = 'HOLLOW'
$s2Record = [ordered]@{
    run_number = $run
    executed_at = (Get-Date -Format 'o')
    head_sha = (git rev-parse --short HEAD)
    rrl_path = $rrlPath
    rrl_chars = $rrlChars
    rrl_bytes = $rrlBytes
    rrl_fidelity = $rrlFidelity
    session_id = 'sov100-roman-run' + $run
    soul_event_id = if ($receipt) { $receipt.event_id } else { 'SOUL_GAP' }
    soulcount = if ($receipt -and $receipt.count_after) { $receipt.count_after } else { 0 }
    soul_level = if ($receipt) { $receipt.level } else { 'UNKNOWN' }
    soul_count_before = if ($receipt) { $receipt.count_before } else { 0 }
    soul_delta = if ($receipt) { $receipt.delta } else { 0 }
    dna_count = 0
    dna_blueprint_count = 0
    dna_status = 'MISSING'
    ledger_id = 'HL-' + $nextHL
    starmap_file = $starmapPath
    keyword_file = $rfkwPath
    keyword_index = $idxPath
    s2pipeline_file = $s2Path
    registry_file = if (Test-Path (Join-Path $artRegistryDir ('art-sync-run' + $runPad + '.json'))) { Join-Path $artRegistryDir ('art-sync-run' + $runPad + '.json') } else { 'REGISTRY_SYNC_GAP' }
    registry_synced = 0
    result = 'KILO_GAP'
}
$s2PathFull = Join-Path $pipelineDir ('pipeline-run' + $runPad + '.json')
$s2Record | ConvertTo-Json -Depth 5 | Set-Content $s2PathFull -Encoding UTF8
Write-Host "STAGE 7: S2Pipeline result=$($s2Record.result)"

# STAGE 8 - REGISTRY SYNC minimal
Write-Host "STAGE 8: REGISTRY_SYNC minimal"
$runKeywords = @()
if (Test-Path $rfkwPath) {
    $runKeywords = (Get-Content $rfkwPath -Raw) -split "`n" |
        Where-Object { $_ -match '^\d+\s*\|' } |
        ForEach-Object { (($_ -split '\|')[1]).Trim().ToLower() } |
        Where-Object { $_.Length -gt 2 }
}
$artSyncPath = Join-Path $artRegistryDir ('art-sync-run' + $runPad + '.json')
[ordered]@{
    run = $run
    ledger_id = 'HL-' + $nextHL
    merkle_short = $ledgerHash.Substring(0,16)
    starmap_file = 'starmap-run' + $runPad + '.json'
    keywords_file = 'rfkw-run' + $runPad + '.txt'
    keywords_used = $runKeywords
    pieces_synced = 0
    pieces = @()
    executed_at = $timestamp
} | ConvertTo-Json -Depth 6 | Set-Content $artSyncPath -Encoding UTF8

# SEAL + COMMIT
$dirty = ((git status --short) | Measure-Object).Count -gt 0
$sealLines = @()
$sealLines += "# Run $runPad - reincarnateDEATH v7.0"
$sealLines += "## S1 HEADER"
$sealLines += "- run: $run"
$sealLines += "- datetime_ict: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')"
$sealLines += "- theme: KILO_GAP emergency seal"
$sealLines += "- signal_density: LOW"
$sealLines += "- head_pre_death: $(git rev-parse --short HEAD)"
$sealLines += "- branch: $(git rev-parse --abbrev-ref HEAD)"
$sealLines += "- dirty_tree: $(if ($dirty) { 'YES' } else { 'NO' })"
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
$sealLines += "- HEAD: $(git rev-parse --short HEAD)"
$sealLines += "- branch: $(git rev-parse --abbrev-ref HEAD)"
$sealLines += "- dirty_tree: $(if ($dirty) { 'YES' } else { 'NO' })"
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
$sealLines += "- pieces_synced: 0"
$sealLines += "- art-sync-run$runPad.json: $artSyncPath"
$sealLines += "- keywords_matched: NONE"
$sealLines += ""
$sealLines += "## S15 REGISTRY"
$sealLines += "- dna-registry-run$runPad.json: N/A"
$sealLines | Set-Content $sealPath -Encoding UTF8
Write-Host "SEAL $sealPath"

$artifacts = @($sealPath, $ledgerPath, $starmapPath, $idxPath, $s2PathFull, $artSyncPath, $rfkwPath, $rrlPath)
git add $artifacts
$msg = "death: Run $run - DEATH v7.0 emergency | HL-$nextHL | RRL=0 bytes | soulcount=$($receipt.count_after) | result=KILO_GAP | HEAD=$(git rev-parse --short HEAD)"
git commit -m $msg
Write-Host "COMMITTED $msg"
