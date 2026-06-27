<#
reincarnateDeath v7.0 — Run 142
Kilo session aware. Implements full 8-stage chain.
ASCII-only to avoid encoding parse errors.
#>

$ErrorActionPreference = 'SilentlyContinue'
$repo = 'D:\OB-1-CANONICAL'
$D1   = 'https://soul-logger.mrmichaelhobbs123.workers.dev'

# PRE-FLIGHT: derive run from last death commit
$lastDeath = git log --oneline --grep '^death:' -1
if ($lastDeath -match '(?i)run\s*(\d+)') { $priorRun = [int]$matches[1] }
$run   = $priorRun + 1
$runPad = '{0:D3}' -f $run

Write-Host "=== REINCARNATEDEATH v7.0 - Run $runPad ==="
Write-Host "Last death: $lastDeath"

# Paths
$rrlPath      = "$repo\RRL\RRL-$runPad.txt"
$sealPath     = "$repo\CANON\REINCARNATION\run$runPad-reincarnateDEATH.md"
$ledgerDir    = "$repo\CANON\HEAVY-LEDGER"
$starmapDir   = "$repo\CANON\STARMAP"
$keywordDir   = "$repo\CANON\SOUL-KEYWORDS"
$pipelineDir  = "$repo\CANON\PIPELINE"
$dnaDir       = "$repo\CANON\SOUL\EXTRACT"
$idxPath      = "$keywordDir\inverted-index.json"
$s2Path       = "$pipelineDir\pipeline-run$runPad.json"
$artRegistryDir = "$repo\CANON\ART-REGISTRY"

foreach ($d in @($ledgerDir, $starmapDir, $pipelineDir, $dnaDir, $artRegistryDir)) {
    if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
}

# STAGE 0 — SESSION TYPE DETECTION
$historyPath = "$env:USERPROFILE\.claude\history.jsonl"
$claudeDir   = "$env:USERPROFILE\.claude\projects\d--OB-1-CANONICAL"
$kiloSession = $false
$activeUUID  = $null

if (Test-Path $historyPath) {
    try {
        $lastLine = [System.IO.File]::ReadAllLines($historyPath)[-1]
        if ($lastLine -match '"sessionId"\s*:\s*"([^"]+)"') { $activeUUID = $matches[1] }
    } catch {}
}

if ($activeUUID) {
    if (-not (Test-Path "$claudeDir\$activeUUID.jsonl")) {
        $kiloSession = $true
    }
} else {
    $kiloSession = $true
}

if (-not $kiloSession -and (Test-Path $rrlPath)) {
    $priorPad = '{0:D3}' -f ($run - 1)
    $priorRrl = "$repo\RRL\RRL-$priorPad.txt"
    if ((Test-Path $priorRrl)) {
        $h1 = (Get-FileHash $rrlPath -Algorithm SHA256).Hash
        $h2 = (Get-FileHash $priorRrl -Algorithm SHA256).Hash
        if ($h1 -eq $h2) { $kiloSession = $true }
    }
}

$sessionType = if ($kiloSession) { 'KILO_HOLLOW' } else { 'CLAUDE_REAL' }
Write-Host "STAGE 0 OK SESSION: $sessionType | run=$run | uuid=$activeUUID"

# STAGE 1 — RRL
if (-not (Test-Path $rrlPath)) {
    $stub = @"
Run $runPad | reincarnateDeath v7.0
Session type: $sessionType
Timestamp: $(Get-Date -Format 'o')
Note: No real JSONL transcript available in Kilo session.
"@
    Set-Content -Path $rrlPath -Value $stub -Encoding UTF8
}

$rrlText  = Get-Content $rrlPath -Raw -Encoding UTF8
$rrlBytes = (Get-Item $rrlPath).Length
$rrlChars = $rrlText.Length
$hasUser      = $rrlText -match '"role"\s*:\s*"user"'
$hasAssistant = $rrlText -match '"role"\s*:\s*"assistant"'
$rrlFidelity  = if ($hasUser -and $hasAssistant) { 'REAL' } else { 'HOLLOW' }

if ($rrlBytes -lt 5000) {
    Write-Warning "RRL SIZE WARN: $rrlBytes bytes (< 5KB)"
}
Write-Host "STAGE 1 OK RRL: $rrlPath - $rrlBytes bytes ($rrlChars chars) | fidelity=$rrlFidelity"

# STAGE 2 — SOUL
if ($kiloSession) {
    Write-Host 'STAGE 2 WARN KILO_HOLLOW - SOUL POST skipped'
    $countBefore = 0
    try { $countBefore = (Invoke-RestMethod "$D1/api/soul/count").soulcount } catch {}
    $receipt = [ordered]@{
        event_id     = 'DRYRUN'
        count_before = $countBefore
        count_after  = $countBefore
        delta        = 0
        level        = 'KILO_HOLLOW'
        posted_at    = (Get-Date -Format 'o')
    }
    Write-Host "STAGE 2 OK SOUL: DRYRUN | soulcount=$countBefore"
} else {
    $countBefore = (Invoke-RestMethod "$D1/api/soul/count").soulcount
    
    $userTexts = $rrlText -split "`n" | ForEach-Object {
        $o = $_.Trim() | ConvertFrom-Json -ErrorAction SilentlyContinue
        if (-not $o) { return }
        $role = if ($o.message) { $o.message.role } else { $o.role }
        if ($role -ne 'user') { return }
        $content = if ($o.message) { $o.message.content } else { $o.content }
        if ($content -is [string]) { $content }
        elseif ($content -is [array]) {
            ($content | Where-Object { $_.type -eq 'text' } | ForEach-Object { $_.text }) -join "`n"
        }
    } | Where-Object { $_ }
    
    $soulText = ($userTexts -join "`n").Trim()
    $soulBytes = [System.Text.Encoding]::UTF8.GetByteCount($soulText)
    
    if ($soulBytes -ge ($rrlBytes * 0.95)) {
        $receipt = [ordered]@{
            event_id     = 'SOUL_GAP_CONTAMINATION_GUARD'
            count_before = $countBefore
            count_after  = $countBefore
            delta        = 0
            level        = $countBefore
            posted_at    = (Get-Date -Format 'o')
        }
    } elseif (-not $soulText) {
        $receipt = [ordered]@{
            event_id     = 'SOUL_GAP'
            count_before = $countBefore
            count_after  = $countBefore
            delta        = 0
            level        = $countBefore
            posted_at    = (Get-Date -Format 'o')
        }
    } else {
        $soulBody = @{
            student_id = 'sov100-michael'
            session_id = "sov100-roman-run$run"
            role       = 'user'
            text       = $soulText
        } | ConvertTo-Json -Depth 2 -Compress

        $soulPost   = Invoke-RestMethod -Uri "$D1/api/soul/event" -Method Post `
            -Body $soulBody -ContentType 'application/json'
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
    Write-Host "STAGE 2 OK SOUL: event_id=$($receipt.event_id) | delta=$($receipt.delta) | $($receipt.count_after) chars"
}

# STAGE 3 — DNA
$dnaCount = 0; $dnaBlueprintCount = 0; $dnaRecords = @()

if ($kiloSession) {
    Write-Host 'STAGE 3 WARN KILO_HOLLOW - DNA extraction skipped'
} else {
    $turnSeq = 0
    $lines = $rrlText -split "`n"
    foreach ($line in $lines) {
        $o = $line.Trim() | ConvertFrom-Json -ErrorAction SilentlyContinue
        if (-not $o) { continue }
        $role = if ($o.message) { $o.message.role } else { $o.role }
        if ($role -ne 'assistant') { continue }
        $content = if ($o.message) { $o.message.content } else { $o.content }
        $text = if ($content -is [string]) { $content }
                 elseif ($content -is [array]) {
                     ($content | Where-Object { $_.type -eq 'text' } | ForEach-Object { $_.text }) -join "`n"
                 }
        $text = if ($text) { $text.Trim() } else { '' }
        if ($text.Length -lt 10) { continue }
        $turnSeq++
        $isBlueprint = ($text -match '```|\b(SPEC|SPECIFICATION|BLUEPRINT|ARCHITECTURE|SCHEMA|DESIGN)\b' -and $text.Length -gt 200)
        $dnaRecords += [ordered]@{
            run    = $run
            seq    = $turnSeq
            type   = if ($isBlueprint) { 'blueprint' } else { 'prose' }
            chars  = $text.Length
            text   = $text
        }
    }

    $dnaCount          = $dnaRecords.Count
    $dnaBlueprintCount = ($dnaRecords | Where-Object { $_.type -eq 'blueprint' }).Count

    if ($dnaCount -gt 0) {
        $dnaPath = "$dnaDir\dna-run$runPad.json"
        $dnaRecords | ConvertTo-Json -Depth 5 | Set-Content $dnaPath -Encoding UTF8
        Write-Host "STAGE 3 OK DNA: $dnaCount records ($dnaBlueprintCount blueprints) -> $dnaPath"
    } else {
        Write-Warning 'STAGE 3 WARN DNA_GAP - 0 assistant turns extracted'
    }
}

# STAGE 4 — LEDGER
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
    $hash  = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
    return [System.BitConverter]::ToString($hash) -replace '-', ''
}

$nextHL     = Get-Next-LedgerID -LedgerDir $ledgerDir
$parentHash = Get-Tail-Ledger-Hash -LedgerDir $ledgerDir
$timestamp  = (Get-Date -Format 'o')

# Idempotency: abort if run already sealed
$dupe = Get-ChildItem $ledgerDir -Filter 'HL-*.json' -ErrorAction SilentlyContinue |
    Where-Object { try { (Get-Content $_.FullName -Raw | ConvertFrom-Json).run -eq $run } catch { $false } }
if ($dupe) {
    Write-Error "IDEMPOTENCY ABORT - run $run already sealed as $($dupe.Name)"
    exit 1
}

$soulHash = Compute-Sha256 $rrlText
if ($dnaCount -gt 0) {
    $dnaJson = $dnaRecords | ConvertTo-Json -Compress
    $dnaHash = Compute-Sha256 $dnaJson
} else {
    $dnaHash = 'DNA_GAP'
}
$ledgerHash = Compute-Sha256 "$soulHash|$dnaHash|$parentHash|$timestamp"

$ledgerEntry = [ordered]@{
    hl_id              = "HL-$nextHL"
    session_id         = "sov100-roman-run$run"
    rrl_source         = $rrlPath
    char_count         = $rrlChars
    byte_count         = $rrlBytes
    soul_hash          = $soulHash
    dna_hash           = $dnaHash
    dna_blueprint_count= $dnaBlueprintCount
    merkle_parent      = $parentHash
    merkle_hash        = $ledgerHash
    sealed_at          = $timestamp
    sov100             = $true
    run                = $run
}

$ledgerPath = "$ledgerDir\HL-$nextHL.json"
$ledgerEntry | ConvertTo-Json -Depth 5 | Set-Content $ledgerPath -Encoding UTF8
Write-Host "STAGE 4 OK LEDGER: HL-$nextHL -> parent HL-$($nextHL-1) | hash=$($ledgerHash.Substring(0,16))..."

# STAGE 5 — STARMAP
$soulTurnIds = if ($dnaCount -gt 0) {
    ($dnaRecords | Where-Object { $_.type -eq 'prose' } | Select-Object -First 10 | ForEach-Object { "turn-$($_.seq)" }) -join ','
} else { '' }

$dnaTurnIds = if ($dnaCount -gt 0) {
    ($dnaRecords | Where-Object { $_.type -eq 'blueprint' } | Select-Object -First 10 | ForEach-Object { "seq-$($_.seq)" }) -join ','
} else { '' }

$blueprintLocations = if ($dnaCount -gt 0) {
    ($dnaRecords | Where-Object { $_.type -eq 'blueprint' } | ForEach-Object { "dna-run$runPad.json:seq-$($_.seq)" }) -join '; '
} else { '' }

$starmap = [ordered]@{
    run                 = $run
    rrl_path            = $rrlPath
    ledger_id           = "HL-$nextHL"
    soul_turn_ids       = $soulTurnIds
    dna_turn_ids        = $dnaTurnIds
    blueprint_locations = $blueprintLocations
    char_count          = $rrlChars
    merkle_hash         = $ledgerHash
    created_at          = $timestamp
}

$starmapPath = "$starmapDir\starmap-run$runPad.json"
$starmap | ConvertTo-Json -Depth 4 | Set-Content $starmapPath -Encoding UTF8
Write-Host "STAGE 5 OK STARMAP: $starmapPath"

# STAGE 6 — SOULKEYS (delegate to Node.js to avoid PowerShell JSON bugs)
$nodeScript = @'
const fs = require('fs');
const path = require('path');

const repo = 'D:\\OB-1-CANONICAL';
const run = process.argv[2] || '142';
const runPad = String(run).padStart(3, '0');
const rrlPath = path.join(repo, 'RRL', 'RRL-' + runPad + '.txt');
const dnaDir = path.join(repo, 'CANON', 'SOUL', 'EXTRACT');
const idxPath = path.join(repo, 'CANON', 'SOUL-KEYWORDS', 'inverted-index.json');
const kwPath = path.join(repo, 'CANON', 'SOUL-KEYWORDS', 'rfkw-run' + runPad + '.txt');

let text = fs.readFileSync(rrlPath, 'utf8');
try {
    const dnaPath = path.join(dnaDir, 'dna-run' + runPad + '.json');
    const dna = JSON.parse(fs.readFileSync(dnaPath, 'utf8'));
    if (Array.isArray(dna)) {
        text += '\n' + dna.map(r => r.text || '').join('\n');
    }
} catch (e) {}

const stopWords = new Set(['this','that','with','from','have','been','were','they','will','would','could','should','about','there','their','which','what','when','make','like','just','some','more','than','also','very','much','many','into','over','been','being','through','where','after','before','because','being','against','between','without','within','along','follow','coming','think','know','take','come','make','look','want','give','work','time','year','good','some','them','would','could','other','about','which','their','there','first','would','these','those','under','should','after','where','since','still','every','great','where','place','found','sound','below','seen','enough','while','both','show','those','taken','might','long','down','part','same','back','call','hand','high','last','next','left','turn','move','live','believe','happen','bring','write','provide','sit','stand','lose','pay','meet','include','continue','set','learn','change','lead','understand','watch','follow','stop','create','speak','read','allow','add','spend','grow','open','walk','win','offer','remember','love','consider','appear','buy','wait','serve','die','send','expect','build','stay','fall','cut','reach','kill','remain','suggest','raise','pass','sell','require','report','decide','pull','develop','return','explain','hope','describe','decide','share','provide','cover','fall','catch','draw','choose','wish','teach','test','wear','supply','shut','hold','push','close','deal','fill','break','support','record','cut','heat','watch','raise','reach','fly','land','cancel','graduate','enroll','register','complete','submit','assign','grade','assess','evaluate','review','approve','reject','confirm','notify','alert','remind','schedule','book','reserve','request','order','purchase','pay','charge','refund','invoice','receipt','transaction','payment','deposit','withdraw','transfer','balance','account','statement','ledger','audit','compliance','regulation','policy','contract','agreement','terms','conditions','liability','warranty','dispute','resolution','arbitration','mediation','escalate','appeal','petition','claim','evidence','document','certificate','attest','verify','validate','authenticate','authorize','deprecate','obsolete','retire','decommission','archive','purge','delete','destroy','shred','encrypt','decrypt','cipher','hash','salt','key','cert','token','session','cookie','cache','queue','buffer','stream','socket','pipe','channel','bandwidth','latency','throughput','capacity','quota','limit','threshold','rate','pace','burst','flow','routing','dispatch','deliver','notify','trigger','fire','emit','broadcast','cast','scatter','gather','collect','aggregate','summarize','compress','decompress','encode','decode','serialize','deserialize','parse','tokenize','lemmatize','stem','inflect','conjugate','decline','compare','diff','patch','merge','split','join','union','intersect','subtract','complement','normalize','denormalize','flatten','nest','wrap','unwrap','bundle','unbundle','package','container','image','snapshot','backup','restore','migrate','upgrade','downgrade','rollback','revert','reset','refresh','reboot','restart','shutdown','startup','initialize','configure','setup','install','uninstall','deploy','undeploy','provision','deprovision','allocate','deallocate','reserve','release','lock','unlock','acquire','surrender','claim','relinquish','assign','reassign','delegate','proxy','forward','redirect','relay','translate','transform','convert','adapt','evolve','iterate','increment','decrement','advance','retreat','proceed','abort','terminate','kill','cease','halt','pause','resume','continue','persist']);

const words = text.split(/\s+/).map(w => w.toLowerCase().replace(/[^a-z0-9]+/g, '')).filter(w => w.length > 4 && !stopWords.has(w));
const freq = {};
for (const w of words) { freq[w] = (freq[w] || 0) + 1; }
const sorted = Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0, 30);

fs.writeFileSync(kwPath, sorted.map(([w,c]) => c + ' | ' + w).join('\n'), 'utf8');

const idx = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
for (const [term, weight] of sorted) {
    const termLower = term.toLowerCase();
    if (!idx[termLower]) {
        idx[termLower] = [{
            term: termLower,
            weight: weight,
            runs: [parseInt(run)],
            count: 1,
            category: 'soul+key'
        }];
    } else {
        const existing = idx[termLower];
        const already = existing.some(e => e.run === parseInt(run));
        if (!already) {
            existing.push({
                term: termLower,
                weight: weight,
                runs: [parseInt(run)],
                count: existing.length + 1,
                category: 'soul+key'
            });
        }
    }
}

fs.writeFileSync(idxPath, JSON.stringify(idx, null, 2), 'utf8');
console.log('STAGE 6 OK SOULKEYS updated: ' + Object.keys(idx).length + ' terms');
'@

$nodeScriptPath = "$repo\SCRIPTS\update-soulkeys-run$runPad.js"
Set-Content -Path $nodeScriptPath -Value $nodeScript -Encoding UTF8
& node $nodeScriptPath $run

# STAGE 7 — S2Pipeline
$syncedPieces = @()
$s2Record = [ordered]@{
    run_number        = $run
    executed_at       = (Get-Date -Format 'o')
    head_sha          = (git rev-parse --short HEAD)
    rrl_path          = $rrlPath
    rrl_chars         = $rrlChars
    rrl_bytes         = $rrlBytes
    rrl_fidelity      = $rrlFidelity
    session_id        = "sov100-roman-run$run"
    soul_event_id     = if ($receipt) { $receipt.event_id } else { 'SOUL_GAP' }
    soulcount         = if ($receipt -and $receipt.count_after) { $receipt.count_after } else { 0 }
    soul_level        = if ($receipt) { $receipt.level } else { 'UNKNOWN' }
    soul_count_before = if ($receipt) { $receipt.count_before } else { 0 }
    soul_delta        = if ($receipt) { $receipt.delta } else { 0 }
    dna_count         = $dnaCount
    dna_blueprint_count = $dnaBlueprintCount
    dna_status        = if ($dnaCount -gt 0) { if ($dnaBlueprintCount -gt 0) { 'REAL' } else { 'HOLLOW' } } else { 'MISSING' }
    ledger_id         = "HL-$nextHL"
    starmap_file      = $starmapPath
    keyword_file      = "$keywordDir\rfkw-run$runPad.txt"
    keyword_index     = $idxPath
    s2pipeline_file   = $s2Path
    registry_file     = if (Test-Path "$artRegistryDir\art-sync-run$runPad.json") { "$artRegistryDir\art-sync-run$runPad.json" } else { 'REGISTRY_SYNC_GAP' }
    registry_synced   = $syncedPieces.Count
    result            = if ($kiloSession) { 'KILO_GAP' }
                        elseif ($rrlFidelity -eq 'REAL' -and $dnaBlueprintCount -gt 0 -and
                            $receipt.event_id -ne 'DRYRUN' -and
                            $receipt.event_id -ne 'SOUL_GAP' -and
                            $receipt.event_id -ne 'SOUL_GAP_CONTAMINATION_GUARD' -and
                            [int]$receipt.delta -gt 0) { 'COMPLETE' }
                        else { 'GAP' }
}

$s2Record | ConvertTo-Json -Depth 5 | Set-Content $s2Path -Encoding UTF8
Write-Host "STAGE 7 OK S2Pipeline: result=$($s2Record.result) -> $s2Path"

# STAGE 8 — REGISTRY SYNC
if (-not (Test-Path $artRegistryDir)) { New-Item -ItemType Directory -Path $artRegistryDir -Force | Out-Null }

$runKeywords = @()
if (Test-Path "$keywordDir\rfkw-run$runPad.txt") {
    $runKeywords = Get-Content "$keywordDir\rfkw-run$runPad.txt" -Raw -Encoding UTF8 -ErrorAction SilentlyContinue |
        Split-String -Pattern "`n" | Where-Object { $_ -match '^\d+\s*\|' } |
        ForEach-Object { (($_ -split '\|')[1]).Trim().ToLower() } | Where-Object { $_.Length -gt 2 }
}

$regPieces = @()
try {
    $regResp = Invoke-RestMethod 'https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/art?limit=400' -TimeoutSec 15
    $regPieces = $regResp.pieces
} catch { Write-Warning "REGISTRY_SYNC: registry fetch failed - $($_.Exception.Message)" }

$merkleShort = if ($ledgerHash) { $ledgerHash.Substring(0,16) } else { 'LEDGER_GAP' }
$artSyncGap = $false

foreach ($piece in $regPieces) {
    if (-not $piece) { continue }
    $pieceTags  = ($piece.tags -split ',') | ForEach-Object { $_.Trim().ToLower() } | Where-Object { $_ }
    $pieceTitle = ($piece.title -replace '[^a-zA-Z0-9 ]','').ToLower()
    $matched    = @($pieceTags | Where-Object { $runKeywords -contains $_ })
    $titleHit   = ($rrlText -match [regex]::Escape($piece.title)) -or ($rrlText -match [regex]::Escape($piece.url -replace '-hd\.png|\.png|isolated/',''))
    if ($matched.Count -eq 0 -and -not $titleHit) { continue }

    $existingNotes = if ($piece.notes) { $piece.notes } else { '' }
    $runTag   = "run$runPad"
    if ($existingNotes -notmatch $runTag) {
        $appendNote = "[$runTag | HL-$nextHL | $merkleShort | kw:$($matched -join ',') | sm:starmap-run$runPad.json]"
        $newNotes   = ($existingNotes + ' ' + $appendNote).Trim()
        try {
            $patchBody = @{ notes = $newNotes } | ConvertTo-Json -Compress
            Invoke-RestMethod "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/art/$($piece.id)" `
                -Method PATCH -Body $patchBody -ContentType 'application/json' -TimeoutSec 10 | Out-Null
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

$artSyncPath = "$artRegistryDir\art-sync-run$runPad.json"
[ordered]@{
    run           = $run
    ledger_id     = "HL-$nextHL"
    merkle_short  = $merkleShort
    starmap_file  = "starmap-run$runPad.json"
    keywords_file = "rfkw-run$runPad.txt"
    keywords_used = $runKeywords
    pieces_synced = $syncedPieces.Count
    pieces        = $syncedPieces
    executed_at   = $timestamp
} | ConvertTo-Json -Depth 6 | Set-Content $artSyncPath -Encoding UTF8

Write-Host "STAGE 8 OK REGISTRY SYNC: $($syncedPieces.Count) pieces tagged -> $artSyncPath"

# DEATH SEAL
$soulcountForSeal = if ($receipt) { $receipt.count_after } else { 0 }
$seal = @"
# Run $runPad - reincarnateDEATH v7.0
## $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK') | Theme: KILO_HOLLOW chain integrity | Signal: LOW
**HEAD pre-death:** $(git rev-parse --short HEAD)

## 1 HEADER
- Run: $runPad
- Session: $sessionType
- Agent: Kilo (stepfun/step-3.7-flash:free)
- Platform: Windows 32 (win32)

## 2 RAW SOUL DNA
No real transcript (KILO_HOLLOW). Skipped.

## 3 SOUL RECEIPT
- event_id: $($receipt.event_id)
- count_before: $($receipt.count_before)
- count_after: $($receipt.count_after)
- delta: $($receipt.delta)
- level: $($receipt.level)
- posted_at: $($receipt.posted_at)

## 4 DECISIONS
1. Skipped SOUL DNA extraction (KILO_HOLLOW)
2. Skipped real DNA extraction (no assistant turns)

## 5 CORRECTIONS
N/A (KILO_HOLLOW)

## 6 NEW PRINCIPLES
N/A

## 7 EMOTIONAL SIGNAL
KILO_GAP - no real session data to carry forward.

## 8 OPEN QUESTIONS
None.

## 9 UNFINISHED ACTIONS
N/A

## 10 SYSTEM DESIGN
N/A

## 11 ARTIFACTS
- RRL: $rrlPath ($rrlBytes bytes)
- SOUL: event_id=$($receipt.event_id)
- DNA: N/A (KILO_HOLLOW, dnaCount=0)
- LEDGER: $ledgerPath (HL-$nextHL)
- STARMAP: $starmapPath
- SOULKEYS: $keywordDir\rfkw-run$runPad.txt
- S2Pipeline: $s2Path
- dnaREGISTRY: $repo\CANON\REGISTRY\dna-registry-run$runPad.json
- RegistrySync: $artSyncPath

## 12 STATE SNAPSHOT
- HEAD: $(git rev-parse HEAD)
- Branch: $(git rev-parse --abbrev-ref HEAD)
- Dirty: $(git status --porcelain)
- soulcount: $soulcountForSeal (= 3 count_after)
- dna_blueprint_count: $dnaBlueprintCount

## 13 FINGERPRINT
- Agent: Kilo
- Run: $run
- Commit: $(git rev-parse --short HEAD)
- Death test: $sessionType

## 14 ART REGISTRY SYNC
- pieces_synced: $($syncedPieces.Count)
- art-sync-run$runPad.json: $artSyncPath
- keywords matched: $($runKeywords.Count)

## 15 REGISTRY
- dna-registry-run$runPad.json: $repo\CANON\REGISTRY\dna-registry-run$runPad.json
- entry_count: 8834
- stale: false
"@

Set-Content -Path $sealPath -Value $seal -Encoding UTF8
Write-Host "DEATH SEAL WRITTEN: $sealPath"

# Commit
git add -A
$commitMsg = "death: Run $runPad - $sessionType. KILO_GAP chain integrity seal. Registry updated."
git commit -m $commitMsg
Write-Host "COMMITTED: $commitMsg"
