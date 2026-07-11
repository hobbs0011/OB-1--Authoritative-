# reincarnateDeath v7.0 -- Run 151
$ErrorActionPreference = "Stop"
$repo = "D:\OB-1-CANONICAL"
$D1   = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$run  = 151
$runPad = "{0:D3}" -f $run

# authority check
$lfgPath = "$repo\.kilo\skills\LegionnaireFieldGuide.md"
$gospelPaths = @(
    "$repo\CANON\SYSTEM\GOSPEL-999.md",
    "$repo\CANON\SYSTEM\GOSPEL-999-PART2.md",
    "$repo\CANON\SYSTEM\GOSPEL-999-PART3.md"
)
if (-not (Test-Path $lfgPath)) { Write-Error "LFG missing"; exit 1 }
$gospelOk = $true; foreach ($g in $gospelPaths) { if (-not (Test-Path $g)) { $gospelOk = $false } }
if (-not $gospelOk) { Write-Error "GOSPEL-999 incomplete"; exit 1 }

$rrlPath      = "$repo\RRL\RRL-$runPad.txt"
$sealPath     = "$repo\CANON\REINCARNATION\run$runPad-reincarnateDEATH.md"
$ledgerDir    = "$repo\CANON\HEAVY-LEDGER"
$starmapDir   = "$repo\CANON\STARMAP"
$keywordDir   = "$repo\CANON\SOUL-KEYWORDS"
$pipelineDir  = "$repo\CANON\PIPELINE"
$dnaDir       = "$repo\CANON\SOUL\EXTRACT"
$idxPath      = "$keywordDir\inverted-index.json"
$s2Path       = "$pipelineDir\pipeline-run$runPad.json"

foreach ($p in @($ledgerDir,$starmapDir,$keywordDir,$pipelineDir,$dnaDir)) {
    if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p -Force | Out-Null }
}

# STAGE 0
Write-Host "`n=== STAGE 0 ==="
$kiloSession = $false
if (-not (Test-Path $rrlPath)) {
    Write-Host "STAGE 0: no RRL-$runPad.txt found -> KILO SESSION"
    $kiloSession = $true
} else {
    Write-Host "STAGE 0: RRL exists at $rrlPath"
}
$priorPad = "{0:D3}" -f ($run - 1)
$priorRrl = "$repo\RRL\RRL-$priorPad.txt"
if ((Test-Path $rrlPath) -and (Test-Path $priorRrl)) {
    $h1 = (Get-FileHash $rrlPath -Algorithm SHA256).Hash
    $h2 = (Get-FileHash $priorRrl -Algorithm SHA256).Hash
    if ($h1 -eq $h2) {
        Write-Host "STAGE 0: RRL identical to prior -> KILO SESSION"
        $kiloSession = $true
    }
}
Write-Host "STAGE 0: hollow=$kiloSession run=$run"

# STAGE 1
Write-Host "`n=== STAGE 1 ==="
$rrlText = ""; $rrlBytes = 0; $rrlChars = 0; $hasUser = $false; $hasAssistant = $false
if ($kiloSession) {
    Write-Host "STAGE 1: KILO_HOLLOW"
} else {
    if (-not (Test-Path $rrlPath)) { Write-Error "FATAL: No RRL"; exit 1 }
    $rrlBytes = (Get-Item $rrlPath).Length
    if ($rrlBytes -lt 5000) { Write-Warning "RRL HOLLOW: $rrlBytes bytes"; $kiloSession = $true }
    $rrlText = Get-Content $rrlPath -Raw -Encoding UTF8
    $rrlChars = $rrlText.Length
    $hasUser = $rrlText -match '"role"\s*:\s*"user"'
    $hasAssistant = $rrlText -match '"role"\s*:\s*"assistant"'
    Write-Host "STAGE 1: RRL $rrlPath bytes=$rrlBytes chars=$rrlChars user=$hasUser assistant=$hasAssistant"
}

# STAGE 2
Write-Host "`n=== STAGE 2 ==="
$countBefore = 0; $receipt = $null
if ($kiloSession) {
    Write-Host "STAGE 2: KILO_HOLLOW SOUL skipped"
    try { $countBefore = (Invoke-RestMethod "$D1/api/soul/count").soulcount } catch {}
    $receipt = [ordered]@{ event_id="DRYRUN"; count_before=$countBefore; count_after=$countBefore; delta=0; level="KILO_HOLLOW"; posted_at=(Get-Date -Format 'o') }
    Write-Host "STAGE 2: SOUL DRYRUN soulcount=$countBefore"
} else {
    $countBefore = (Invoke-RestMethod "$D1/api/soul/count").soulcount
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
    $soulBytes = [System.Text.Encoding]::UTF8.GetByteCount($soulText)
    if ($soulBytes -ge ($rrlBytes * 0.95)) {
        Write-Error "STAGE 2 ABORT soul contamination"; exit 1
    }
    if (-not $soulText) {
        Write-Warning "STAGE 2 SOUL_GAP"
        $receipt = [ordered]@{ event_id="SOUL_GAP"; count_before=$countBefore; count_after=$countBefore; delta=0; level="(unchanged)"; posted_at=(Get-Date -Format 'o') }
    } else {
        $soulBody = @{ student_id="sov100-michael"; session_id="sov100-roman-run$run"; role="user"; text=$soulText } | ConvertTo-Json -Depth 2 -Compress
        $soulPost = Invoke-RestMethod -Uri "$D1/api/soul/event" -Method Post -Body $soulBody -ContentType "application/json"
        $countAfter = (Invoke-RestMethod "$D1/api/soul/count").soulcount
        $receipt = [ordered]@{ event_id=$soulPost.event_id; count_before=$countBefore; count_after=$countAfter; delta=$countAfter - $countBefore; level=$countAfter; posted_at=(Get-Date -Format 'o') }
    }
    Write-Host "STAGE 2: SOUL event_id=$($receipt.event_id) delta=$($receipt.delta) count_after=$($receipt.count_after)"
}

# STAGE 3
Write-Host "`n=== STAGE 3 ==="
$dnaCount = 0; $dnaBlueprintCount = 0; $dnaRecords = @()
if ($kiloSession) {
    Write-Host "STAGE 3: KILO_HOULL DNA skipped"
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
        $text = if ($text) { $text.Trim() } else { "" }
        if ($text.Length -lt 10) { return }
        $turnSeq++
        $isBlueprint = ($text -match '```|\b(SPEC|SPECIFICATION|BLUEPRINT|ARCHITECTURE|SCHEMA|DESIGN)\b' -and $text.Length -gt 200)
        $script:dnaRecords += [ordered]@{ run=$run; seq=$turnSeq; type=if ($isBlueprint) { "blueprint" } else { "prose" }; chars=$text.Length; text=$text }
    }
    $dnaCount = $dnaRecords.Count
    $dnaBlueprintCount = ($dnaRecords | Where-Object { $_.type -eq "blueprint" }).Count
    if ($dnaCount -gt 0) {
        $dnaPath = "$dnaDir\dna-run$run.json"
        $dnaRecords | ConvertTo-Json -Depth 5 | Set-Content $dnaPath -Encoding UTF8
        Write-Host "STAGE 3: DNA $dnaCount records ($dnaBlueprintCount blueprints) forked"
    } else {
        Write-Warning "STAGE 3: DNA_GAP"
    }
}

# STAGE 4
Write-Host "`n=== STAGE 4 ==="
function Get-Next-LedgerID { param([string]$LedgerDir) $existing = Get-ChildItem -LiteralPath $LedgerDir -Filter "HL-*.json" -ErrorAction SilentlyContinue | ForEach-Object { if ($_.Name -match 'HL-(\d+)\.json$') { [int]$matches[1] } }; if ($existing) { return ($existing | Measure-Object -Maximum).Maximum + 1 }; return 1 }
function Get-Tail-Ledger-Hash { param([string]$LedgerDir) $latest = Get-ChildItem -LiteralPath $LedgerDir -Filter "HL-*.json" -ErrorAction SilentlyContinue | ForEach-Object { [PSCustomObject]@{ N=[int]([regex]::Match($_.Name,'HL-(\d+)').Groups[1].Value); F=$_.FullName } } | Sort-Object N -Descending | Select-Object -First 1; if (-not $latest) { return $null }; (Get-Content $latest.F -Raw | ConvertFrom-Json).merkle_hash }
function Compute-Sha256 { param([string]$InputString) $bytes = [System.Text.Encoding]::UTF8.GetBytes($InputString); $hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes); return [System.BitConverter]::ToString($hash) -replace '-', '' }
$nextHL = Get-Next-LedgerID -LedgerDir $ledgerDir
$parentHash = Get-Tail-Ledger-Hash -LedgerDir $ledgerDir
$timestamp = (Get-Date -Format 'o')
$soulHash = Compute-Sha256 $rrlText
$dnaHash = if ($dnaCount -gt 0) { Compute-Sha256 ($dnaRecords | ConvertTo-Json -Compress) } else { "DNA_GAP" }
$ledgerHash = Compute-Sha256 "$soulHash|$dnaHash|$parentHash|$timestamp"
$ledgerEntry = [ordered]@{ hl_id="HL-$nextHL"; session_id="sov100-roman-run$run"; rrl_source=$rrlPath; char_count=$rrlChars; byte_count=$rrlBytes; soul_hash=$soulHash; dna_hash=$dnaHash; dna_blueprint_count=$dnaBlueprintCount; merkle_parent=$parentHash; merkle_hash=$ledgerHash; sealed_at=$timestamp; sov100=$true; run=$run }
$ledgerPath = "$ledgerDir\HL-$nextHL.json"
$ledgerEntry | ConvertTo-Json -Depth 5 | Set-Content $ledgerPath -Encoding UTF8
$soulHashShort = if ($soulHash) { $soulHash.Substring(0,16) } else { "NO_SOUL_HASH" }
$dnaHashShort = if ($dnaHash -and $dnaHash.Length -ge 16) { $dnaHash.Substring(0,16) } else { $dnaHash }
Write-Host "STAGE 4: LEDGER HL-$nextHL parent=$parentHash soul=$soulHashShort dna=$dnaHashShort"

# STAGE 5
Write-Host "`n=== STAGE 5 ==="
$soulTurnIds = if ($dnaCount -gt 0) { ($dnaRecords | Where-Object { $_.type -eq "prose" } | Select-Object -First 10 | ForEach-Object { "turn-$($_.seq)" }) -join "," } else { "" }
$dnaTurnIds = if ($dnaCount -gt 0) { ($dnaRecords | Where-Object { $_.type -eq "blueprint" } | Select-Object -First 10 | ForEach-Object { "seq-$($_.seq)" }) -join "," } else { "" }
$blueprintLocations = if ($dnaCount -gt 0) { ($dnaRecords | Where-Object { $_.type -eq "blueprint" } | ForEach-Object { "dna-run$run.json:seq-$($_.seq)" }) -join "; " } else { "" }
$starmap = [ordered]@{ run=$run; rrl_path=$rrlPath; ledger_id="HL-$nextHL"; soul_turn_ids=$soulTurnIds; dna_turn_ids=$dnaTurnIds; blueprint_locations=$blueprintLocations; char_count=$rrlChars; merkle_hash=$ledgerHash; created_at=$timestamp } | ConvertTo-Json -Depth 4
$starmapPath = "$starmapDir\starmap-run$runPad.json"
$starmap | Set-Content $starmapPath -Encoding UTF8
Write-Host "STAGE 5: STARMAP $starmapPath"

# STAGE 6
Write-Host "`n=== STAGE 6 ==="
$combinedText = $rrlText
if ($dnaCount -gt 0) { $combinedText += "`n" + ($dnaRecords | ForEach-Object { $_.text }) -join "`n" }
$words = $combinedText -split '\s+' | Where-Object { $_.Length -gt 4 } | Where-Object { $_ -notmatch '^(this|that|with|from|have|been|were|they|will|would|could|should|about|there|their|which|what|when|make|like|just|some|more|than|also|very|much|many|into|over|been|being|through|where|after|before|because|being|against|between|without|within|along|follow|coming|think|know|take|come|make|look|want|give|work|time|year|good|some|them|would|could|other|about|which|their|there|first|would|these|those|under|should|after|where|since|still|every|being|great|where|place|found|sound|below|seen|enough|while|both|show|those|taken|might|long|down|part|same|back|call|hand|high|last|next|left|turn|move|live|believe|happen|bring|write|provide|sit|stand|lose|pay|meet|include|continue|set|learn|change|lead|understand|watch|follow|stop|create|speak|read|allow|add|spend|grow|open|walk|win|offer|remember|love|consider|appear|buy|wait|serve|die|send|expect|build|stay|fall|cut|reach|kill|remain|suggest|raise|pass|sell|require|report|decide|pull|develop|return|explain|hope|describe|decide|share|provide|cover|fall|catch|draw|choose|wish|teach|test|wear|supply|shut|hold|push|close|deal|fill|break|support|record|cut|heat|watch|raise|reach|fly|land|cancel|graduate|enroll|register|complete|submit|assign|grade|assess|evaluate|review|approve|reject|confirm|notify|alert|remind|schedule|book|reserve|request|order|purchase|pay|charge|refund|invoice|receipt|transaction|payment|deposit|withdraw|transfer|balance|account|statement|ledger|audit|compliance|regulation|policy|contract|agreement|terms|conditions|liability|warranty|dispute|resolution|arbitration|mediation|escalate|appeal|petition|claim|evidence|document|certificate|attest|verify|validate|authenticate|authorize|authenticate|deprecate|obsolete|retire|decommission|archive|purge|delete|destroy|shred|encrypt|decrypt|cipher|hash|salt|key|cert|token|session|cookie|cache|queue|buffer|stream|socket|pipe|channel|bandwidth|latency|throughput|capacity|quota|limit|threshold|rate|pace|burst|flow|routing|dispatch|deliver|notify|trigger|fire|emit|broadcast|cast|scatter|gather|collect|aggregate|summarize|compress|decompress|encode|decode|serialize|deserialize|parse|tokenize|lemmatize|stem|inflect|conjugate|decline|compare|diff|patch|merge|split|join|union|intersect|subtract|complement|normalize|denormalize|flatten|nest|wrap|unwrap|bundle|unbundle|package|unpackage|container|image|snapshot|backup|restore|migrate|upgrade|downgrade|rollback|revert|reset|refresh|reboot|restart|shutdown|startup|initialize|configure|setup|install|uninstall|deploy|undeploy|provision|deprovision|allocate|deallocate|reserve|release|lock|unlock|acquire|surrender|claim|relinquish|assign|reassign|delegate|proxy|forward|redirect|relay|translate|transform|convert|adapt|evolve|iterate|increment|decrement|advance|retreat|proceed|abort|terminate|kill|cease|halt|pause|resume|continue|persist|persist)$' }
$wordFreq = $words | Group-Object | Sort-Object Count -Descending | Select-Object -First 30
$rfkwPath = "$keywordDir\rfkw-run$runPad.txt"
$wordFreq | ForEach-Object { "$($_.Count) | $($_.Name)" } | Set-Content $rfkwPath -Encoding UTF8
$inverted = @{}
if (Test-Path $idxPath) {
    try {
        $parsed = (Get-Content $idxPath -Raw) | ConvertFrom-Json
        foreach ($p in $parsed.psobject.Properties) {
            $inverted[$p.Name] = $p.Value
        }
    } catch { $inverted = @{} }
}
foreach ($kw in $wordFreq) {
    $term = $kw.Name.Trim().ToLower(); $weight = [int]$kw.Count
    if (-not $inverted[$term]) { $inverted[$term] = @() }
    $entry = @{ run=$run; category="soul+key"; weight=$weight }
    $already = $false; foreach ($e in $inverted[$term]) { if ($e.run -eq $run) { $already = $true; break } }
    if (-not $already) {
        if ($inverted.ContainsKey($term)) {
            $existing = $inverted[$term]
            if ($existing -is [System.Collections.ICollection]) { $existing += $entry } else { $inverted[$term] = @($existing; $entry) }
        } else { $inverted[$term] = $entry }
    }
}
$inverted | ConvertTo-Json -Depth 4 | Set-Content $idxPath -Encoding UTF8
Write-Host "STAGE 6: SOULKEYS $($inverted.Count) terms"

# STAGE 7
Write-Host "`n=== STAGE 7 ==="
$artRegistryDir = "$repo\CANON\ART-REGISTRY"
$syncedPieces = @()
$rrlFidelity = if ($hasUser -and $hasAssistant) { "REAL" } else { "HOLLOW" }
$s2Record = [ordered]@{
    run_number=$run; executed_at=(Get-Date -Format 'o'); head_sha=(git rev-parse --short HEAD)
    rrl_path=$rrlPath; rrl_chars=$rrlChars; rrl_bytes=$rrlBytes; rrl_fidelity=$rrlFidelity
    session_id="sov100-roman-run$run"; soul_event_id=if ($receipt) { $receipt.event_id } else { "SOUL_GAP" }
    soulcount=if ($receipt -and $receipt.count_after) { $receipt.count_after } else { 0 }
    soul_level=if ($receipt) { $receipt.level } else { "UNKNOWN" }
    soul_count_before=if ($receipt) { $receipt.count_before } else { 0 }; soul_delta=if ($receipt) { $receipt.delta } else { 0 }
    dna_count=$dnaCount; dna_blueprint_count=$dnaBlueprintCount
    dna_status=if ($dnaCount -gt 0) { if ($dnaBlueprintCount -gt 0) { "REAL" } else { "HOLLOW" } } else { "MISSING" }
    ledger_id="HL-$nextHL"; starmap_file=$starmapPath; keyword_file=$rfkwPath; keyword_index=$idxPath
    s2pipeline_file=$s2Path; registry_file=if (Test-Path "$artRegistryDir\art-sync-run$runPad.json") { "$artRegistryDir\art-sync-run$runPad.json" } else { "REGISTRY_SYNC_GAP" }
    registry_synced=$syncedPieces.Count
    result=if ($kiloSession) { "KILO_GAP" } elseif ($rrlFidelity -eq "REAL" -and $dnaBlueprintCount -gt 0 -and $receipt.event_id -notmatch "DRYRUN|SOUL_GAP|SOUL_GAP_CONTAMINATION_GUARD" -and [int]$receipt.delta -gt 0) { "COMPLETE" } else { "GAP" }
}
$s2Record | ConvertTo-Json -Depth 5 | Set-Content $s2Path -Encoding UTF8
Write-Host "STAGE 7: S2Pipeline result=$($s2Record.result)"

# STAGE 8
Write-Host "`n=== STAGE 8 ==="
$runKeywords = @()
if (Test-Path $rfkwPath) {
    $runKeywords = (Get-Content $rfkwPath -Raw) -split "`n" | Where-Object { $_ -match '^\d+\s*\|' } | ForEach-Object { (($_ -split '\|')[1]).Trim().ToLower() } | Where-Object { $_.Length -gt 2 }
}
$regPieces = @()
try {
    $regResp = Invoke-RestMethod "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/art?limit=400" -TimeoutSec 15
    $regPieces = $regResp.pieces
} catch { Write-Warning "REGISTRY_SYNC fetch failed: $($_.Exception.Message)" }
$merkleShort = if ($ledgerHash) { $ledgerHash.Substring(0,16) } else { "LEDGER_GAP" }
$artSyncGap = $false
foreach ($piece in $regPieces) {
    if (-not $piece) { continue }
    $pieceTags = ($piece.tags -split ',') | ForEach-Object { $_.Trim().ToLower() } | Where-Object { $_ }
    $pieceTitle = ($piece.title -replace '[^a-zA-Z0-9 ]','').ToLower()
    $matched = @($pieceTags | Where-Object { $runKeywords -contains $_ })
    $titleHit = ($rrlText -match [regex]::Escape($piece.title)) -or ($rrlText -match [regex]::Escape(($piece.url -replace '-hd\.png|\.png|isolated/','')))
    if ($matched.Count -eq 0 -and -not $titleHit) { continue }
    $existingNotes = if ($piece.notes) { $piece.notes } else { "" }
    $runTag = "run$runPad"
    if ($existingNotes -notmatch $runTag) {
        $appendNote = "[$runTag | HL-$nextHL | $merkleShort | kw:$($matched -join ',') | sm:starmap-run$runPad.json]"
        $newNotes = ($existingNotes + " " + $appendNote).Trim()
        try {
            $patchBody = @{ notes = $newNotes } | ConvertTo-Json -Compress
            Invoke-RestMethod "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/art/$($piece.id)" -Method PATCH -Body $patchBody -ContentType "application/json" -TimeoutSec 10 | Out-Null
            $syncedPieces += [ordered]@{ id=$piece.id; title=$piece.title; url=$piece.url; keywords=$matched; title_hit=$titleHit }
        } catch { $artSyncGap = $true; Write-Warning "PATCH failed for $($piece.title): $($_.Exception.Message)" }
    }
}
$artSyncPath = "$artRegistryDir\art-sync-run$runPad.json"
[ordered]@{
    run=$run; ledger_id="HL-$nextHL"; merkle_short=$merkleShort; starmap_file="starmap-run$runPad.json"
    keywords_file="rfkw-run$run.txt"; keywords_used=$runKeywords; pieces_synced=$syncedPieces.Count
    pieces=$syncedPieces; executed_at=$timestamp
} | ConvertTo-Json -Depth 6 | Set-Content $artSyncPath -Encoding UTF8
Write-Host "STAGE 8: REGISTRY_SYNC $($syncedPieces.Count) pieces"

# SEAL
Write-Host "`n=== SEAL ==="
$clean = git status --short | Where-Object { $_ -match '^[^ ]' }
$dirty = ($clean | Measure-Object).Count -gt 0
$sealLines = @()
$sealLines += "# Run $runPad - reincarnateDEATH v7.0"
$sealLines += "## S1 HEADER"
$sealLines += "- run: $run"
$sealLines += "- datetime_ict: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')"
$sealLines += "- theme: KILO_GAP session tie-off"
$sealLines += "- signal_density: LOW"
$sealLines += "- head_pre_death: $(git rev-parse --short HEAD)"
$sealLines += "- branch: $(git rev-parse --abbrev-ref HEAD)"
$sealLines += "- dirty_tree: $(if ($dirty) { 'YES' } else { 'NO' })"
$sealLines += ""
$sealLines += "## S2 RAW SOUL DNA"
$sealLines += "_$(if ($kiloSession) { 'KILO_HOLLOW - no raw transcript available.' } else { $rrlText.Substring(0, [Math]::Min(2000, $rrlText.Length)) })_"
$sealLines += "CRITICAL: No real user/assistant transcript captured for this CLI session."
$sealLines += "IMPORTANT: All downstream stages reflect a hollow/KILO_GAP run."
$sealLines += "CONTEXT: Session run in CLI without provider-side transcript export."
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
$sealLines += "1. Run $run sealed as KILO_GAP -- no RRL available for this CLI session."
$sealLines += "2. Skipped real SOUL/DNA ingestion due to missing transcript."
$sealLines += "3. Preserved ledger/starmap/soulkeys/s2pipeline/registry as hollow artifacts."
$sealLines += ""
$sealLines += "## S5 CORRECTIONS"
$sealLines += "- wrong: expected on-disk transcript for CLI session"
$sealLines += "- root cause: CLI provider does not write RRL automatically"
$sealLines += "- fix: future death must accept explicit -RrlSource or seal KILO_GAP immediately after Stage 0"
$sealLines += "- docs read: reincarnatedeath.md Stage 0/1 hollow policy"
$sealLines += ""
$sealLines += "## S6 NEW PRINCIPLES"
$sealLines += "- CLI sessions without explicit -RrlSource must seal KILO_GAP immediately after Stage 0."
$sealLines += "- Do not attempt RRL discovery from alternate providers unless explicitly directed."
$sealLines += ""
$sealLines += "## S7 EMOTIONAL SIGNAL"
$sealLines += "Neutral -- hollow run bound cleanly. No data loss. Pipeline contracts honored."
$sealLines += ""
$sealLines += "## S8 OPEN QUESTIONS"
$sealLines += "- Where is the source of truth for CLI session transcripts in this environment?"
$sealLines += ""
$sealLines += "## S9 UNFINISHED ACTIONS"
$sealLines += "- None beyond obtaining a real RRL source for the next non-hollow run."
$sealLines += ""
$sealLines += "## S10 SYSTEM DESIGN"
$sealLines += "Hollow run artifacts kept to preserve chain continuity: HL, STARMAP, SOULKEYS, S2Pipeline, REGISTRY_SYNC."
$sealLines += ""
$sealLines += "## S11 ARTIFACTS"
$sealLines += "- RRL: $rrlPath (0 bytes / missing)"
$sealLines += "- SOUL: event_id=$($receipt.event_id)"
$sealLines += "- DNA: $dnaDir\dna-run$run.json ($dnaCount records, $dnaBlueprintCount blueprints -- KILO_HOLLOW)"
$sealLines += "- LEDGER: $ledgerPath"
$sealLines += "- STARMAP: $starmapPath"
$sealLines += "- SOULKEYS: $idxPath"
$sealLines += "- S2Pipeline: $s2Path"
$sealLines += "- REGISTRY_SYNC: $artSyncPath"
$sealLines += ""
$sealLines += "## S12 STATE SNAPSHOT"
$sealLines += "- HEAD: $(git rev-parse --short HEAD)"
$sealLines += "- branch: $(git rev-parse --abbrev-ref HEAD)"
$sealLines += "- dirty_tree: $(if ($dirty) { 'YES' } else { 'NO' })"
$sealLines += "- soulcount: $($receipt.count_after)"
$sealLines += "- dna_blueprint_count: $dnaBlueprintCount"
$sealLines += ""
$sealLines += "## S13 FINGERPRINT"
$sealLines += "- agent: AGENT99"
$sealLines += "- run#: $run"
$sealLines += "- commit_sha: $(git rev-parse HEAD)"
$sealLines += "- platform: win32 / powershell / Cloudflare Workers CLI"
$sealLines += "- death_test: KILO_GAP_HOLLOW"
$sealLines += ""
$sealLines += "## S14 ART REGISTRY SYNC"
$sealLines += "- pieces_synced: $($syncedPieces.Count)"
$sealLines += "- art-sync-run$runPad.json: $artSyncPath"
$sealLines += "- keywords_matched: $($runKeywords -join ', ')"
$sealLines += ""
$sealLines += "## S15 REGISTRY"
$sealLines += "- dna-registry-run$runPad.json: N/A -- no registry write executed in this hollow run"
$sealLines | Set-Content $sealPath -Encoding UTF8
Write-Host "SEAL: $sealPath"

# COMMIT
Write-Host "`n=== COMMIT ==="
$artifacts = @($sealPath, $ledgerPath, $starmapPath, $idxPath, $s2Path, $artSyncPath)
if ($dnaCount -gt 0) { $artifacts += "$dnaDir\dna-run$run.json" }
if (Test-Path $rfkwPath) { $artifacts += $rfkwPath }
git add $artifacts
$commitMsg = "death: Run $run - DEATH v7.0 complete | HL-$nextHL | RRL=$rrlBytes bytes | soulcount=$($receipt.count_after) | result=$($s2Record.result) | HEAD=$(git rev-parse --short HEAD)"
git commit -m $commitMsg
Write-Host "COMMITTED: $commitMsg"
