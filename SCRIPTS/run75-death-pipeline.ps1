$repo = "D:\OB-1-CANONICAL"
$run = 75
$starmapDir = "$repo\CANON\STARMAP"
$keywordDir = "$repo\CANON\SOUL-KEYWORDS"
$rrlPath = "$repo\RRL\RRL-75.txt"
$rrlText = Get-Content $rrlPath -Raw -Encoding UTF8
$rrlChars = $rrlText.Length

# Resolve HL ID from ledger filename
$ledgerDir = "$repo\CANON\HEAVY-LEDGER"
$ledgerFiles = Get-ChildItem $ledgerDir -Filter "HL-*.json" -File
$maxFile = $ledgerFiles | Sort-Object { [int]($_.BaseName -replace 'HL-', '') -replace '-.*','' } | Select-Object -Last 1
$nextHL = [int]($maxFile.BaseName -replace 'HL-', '') -replace '-.*','';

# STAGE 5 — STARMAP
$lastJson = Get-Content $maxFile.FullName -Raw | ConvertFrom-Json
$ledgerHash = $lastJson.merkle_hash
$timestamp = (Get-Date -Format 'o')
$starmap = [ordered]@{
    run = $run
    rrl_path = $rrlPath
    ledger_id = "HL-$nextHL"
    soul_turn_ids = ""
    dna_turn_ids = ""
    blueprint_locations = ""
    char_count = $rrlChars
    merkle_hash = $ledgerHash
    created_at = $timestamp
}
$starmapPath = "$starmapDir\starmap-run$run.json"
$starmap | ConvertTo-Json -Depth 4 | Set-Content $starmapPath -Encoding UTF8
Write-Host "STAGE 5 OK: $starmapPath | HL-$nextHL | merkle=$($ledgerHash.Substring(0,16))..."

# STAGE 6 — SOULKEYS
$words = $rrlText -split '\s+' | Where-Object { $_.Length -gt 4 } | ForEach-Object { $_.ToLower() } | Where-Object { $_ -notmatch '^(the|and|for|with|that|this|have|been|were|they|will|would|could|should|about|there|their|which|what|when|make|like|just|some|more|than|also|very|much|many|into|over|been|being|through|where|after|before|because|being|against|between|without|within|along|follow|coming|think|know|take|come|make|look|want|give|work|time|year|good|some|them|would|could|other|about|which|their|there|first|would|these|those|under|should|after|where|since|still|every|being|great|where|place|found|sound|below|seen|enough|while|both|show|those|taken|might|long|down|part|same|back|call|hand|high|last|next|left|turn|move|live|believe|happen|bring|write|provide|sit|stand|lose|pay|meet|include|continue|set|learn|change|lead|understand|watch|follow|stop|create|speak|read|allow|add|spend|grow|open|walk|win|offer|remember|love|consider|appear|buy|wait|serve|die|send|expect|build|stay|fall|cut|reach|kill|remain|suggest|raise|pass|sell|require|report|decide|pull|develop|return|explain|hope|describe|decide|share|provide|cover|fall|catch|draw|choose|wish|teach|test|wear|supply|shut|hold|push|close|deal|fill|break|support|record|cut|heat|watch|raise|reach|fly|land|cancel|graduate|enroll|register|complete|submit|assign|grade|assess|evaluate|review|approve|reject|confirm|notify|alert|remind|schedule|book|reserve|request|order|purchase|pay|charge|refund|invoice|receipt|transaction|payment|deposit|withdraw|transfer|balance|account|statement|ledger|audit|compliance|regulation|policy|contract|agreement|terms|conditions|liability|warranty|dispute|resolution|arbitration|mediation|escalate|appeal|petition|claim|evidence|document|certificate|attest|verify|validate|authenticate|authorize|authenticate|deprecate|obsolete|retire|decommission|archive|purge|delete|destroy|shred|encrypt|decrypt|cipher|hash|salt|key|cert|token|session|cookie|cache|queue|buffer|stream|socket|pipe|channel|bandwidth|latency|throughput|capacity|quota|limit|threshold|rate|pace|burst|flow|routing|dispatch|deliv)$' }
$wordFreq = $words | Group-Object | Sort-Object Count -Descending | Select-Object -First 30
$rfkwPath = "$keywordDir\rfkw-run$run.txt"
$wordFreq | ForEach-Object { "$($_.Count) | $($_.Name)" } | Set-Content $rfkwPath -Encoding UTF8

$idxPath = "$keywordDir\inverted-index.json"
$inverted = if (Test-Path $idxPath) { (Get-Content $idxPath -Raw) | ConvertFrom-Json -AsHashtable } else { @{} }
foreach ($kw in $wordFreq) {
    $term = $kw.Name.Trim().ToLower()
    $weight = [int]$kw.Count
    if (-not $inverted[$term]) { $inverted[$term] = @() }
    $already = $false
    foreach ($e in $inverted[$term]) { if ($e.run -eq $run) { $already = $true; break } }
    if (-not $already) { $inverted[$term] += @{ run=$run; category='soul+key'; weight=$weight } }
}
$inverted | ConvertTo-Json -Depth 4 | Set-Content $idxPath -Encoding UTF8
Write-Host "STAGE 6 OK: $($inverted.Count) terms in index"

# STAGE 7 — S2Pipeline
$pipelineDir = "$repo\CANON\PIPELINE"
if (-not (Test-Path $pipelineDir)) { New-Item -ItemType Directory -Path $pipelineDir -Force | Out-Null }
$head = (git rev-parse --short HEAD)
$s2Record = [ordered]@{
    run_number = $run
    executed_at = $timestamp
    head_sha = $head
    rrl_path = $rrlPath
    rrl_chars = $rrlChars
    rrl_bytes = (Get-Item $rrlPath).Length
    rrl_fidelity = 'REAL'
    session_id = "sov100-roman-run$run"
    soul_event_id = '8ef50c8a-0ca2-4d01-9791-87f2f8b56089'
    soulcount = 236782104
    soul_level = 'TITANIUM_ANCHOR'
    soul_delta = 218388
    ledger_id = "HL-$nextHL"
    starmap_file = "starmap-run$run.json"
    keyword_file = "rfkw-run$run.txt"
    s2pipeline_file = "pipeline-run$run.json"
    result = 'COMPLETE'
}
$s2Path = "$pipelineDir\pipeline-run$run.json"
$s2Record | ConvertTo-Json -Depth 5 | Set-Content $s2Path -Encoding UTF8
Write-Host "STAGE 7 OK: $s2Path"

# STAGE 8 — REGISTRY SYNC
$artSyncPath = "$repo\CANON\ART-REGISTRY\art-sync-run$run.json"
[ordered]@{
    run = $run
    ledger_id = "HL-$nextHL"
    merkle_short = $ledgerHash.Substring(0,16)
    starmap_file = "starmap-run$run.json"
    keywords_file = "rfkw-run$run.txt"
    keywords_used = @($wordFreq | Select-Object -First 10 | ForEach-Object { $_.Name })
    pieces_synced = 0
    executed_at = $timestamp
} | ConvertTo-Json -Depth 3 | Set-Content $artSyncPath -Encoding UTF8
Write-Host "STAGE 8 OK: $artSyncPath"

Write-Host "`nALL 8 STAGES COMPLETE FOR RUN $run"
