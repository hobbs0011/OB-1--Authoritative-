<#
  reincarnate-death.ps1 -- v7.0 ROMAN DEATH
  8-Stage Chain: RRL -> SOUL -> DNA -> LEDGER -> STARMAP -> SOULKEYS -> S2Pipeline -> REGISTRY_SYNC
  15-Section Death Seal follows artifact chain.
  Canonical contract: CANON/SYSTEM/REINCARNATION-CONTRACT.md
  Run authority: git log --oneline --grep "^death:" (L29 NO_ASSUME_HEAD)
#>
param(
    [switch]$DryRun,
    [switch]$Force,
    [switch]$NoRegistrySync,
    [int]$TimeoutSec = 120,
    [string]$RrlSource
)

$ErrorActionPreference = "Stop"
$repoRoot = "D:\OB-1-CANONICAL"
$D1      = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$rrlPattern = "$repoRoot\RRL\RRL-{0}.txt"
$sealPattern = "$repoRoot\CANON\REINCARNATION\run{0}-reincarnateDEATH.md"
$ledgerDir = "$repoRoot\CANON\HEAVY-LEDGER"
$starmapDir = "$repoRoot\CANON\STARMAP"
$keywordDir = "$repoRoot\CANON\SOUL-KEYWORDS"
$pipelineDir = "$repoRoot\CANON\PIPELINE"
$dnaDir = "$repoRoot\CANON\SOUL\EXTRACT"
$idxPath = "$keywordDir\inverted-index.json"
$s2Pattern = "$pipelineDir\pipeline-run{0}.json"
$artSyncDir = "$repoRoot\CANON\ART-REGISTRY"
$reincDir = "$repoRoot\CANON\REINCARNATION"
$engDir = "$repoRoot\CANON\ENGINEERING"
$bootPath = "$repoRoot\CANON\SYSTEM\COLD-START-BOOT.md"
$stateSnapPath = "$repoRoot\CANON\HEAVY-LEDGER\STATE-SNAPSHOT.json"

$ts = Get-Date -Format "yyyy-MM-ddTHHmmss"
$logPath = "$repoRoot\OPERATIONS\reincarnate-death-$ts.log"

function Write-Log { param([string]$Msg); $line = "[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $Msg; Write-Host $line; $line | Out-File -Append -Encoding UTF8 $logPath }
function Write-Err { param([string]$Msg); Write-Log "ERR: $Msg"; throw $Msg }
function Write-Ok { param([string]$Msg); Write-Log "OK: $Msg" }
function Write-Warn { param([string]$Msg); Write-Log "WARN: $Msg" }
function Ensure-Dir { param([string]$P); if (-not (Test-Path $P)) { New-Item -ItemType Directory -Path $P -Force | Out-Null } }
function Write-Json { param([string]$Path,[object]$D); $D | ConvertTo-Json -Depth 5 | Set-Content $Path -Encoding UTF8 }
function Read-Json { param([string]$P); if (Test-Path $P) { Get-Content $P -Raw | ConvertFrom-Json } else { $null } }
function Compute-Sha256 { param([string]$S); $b=[System.Text.Encoding]::UTF8.GetBytes($S); $h=[System.Security.Cryptography.SHA256]::Create().ComputeHash($b); [System.BitConverter]::ToString($h)-replace '-','' }
function Get-Next-LedgerID {
    param([string]$LedgerDir)
    $ids = Get-ChildItem -LiteralPath $LedgerDir -Filter "HL-*.json" -ErrorAction SilentlyContinue |
        ForEach-Object { if ($_.Name -match 'HL-(\d+)\.json$') { [int]$matches[1] } }
    if ($ids) { return ($ids | Measure-Object -Maximum).Maximum + 1 }; return 1
}
function Get-Tail-Ledger-Hash {
    param([string]$LedgerDir)
    $latest = Get-ChildItem -LiteralPath $LedgerDir -Filter "HL-*.json" -ErrorAction SilentlyContinue |
        ForEach-Object { [PSCustomObject]@{ N=[int]([regex]::Match($_.Name,'HL-(\d+)').Groups[1].Value); F=$_.FullName } } |
        Sort-Object N -Descending | Select-Object -First 1
    if (-not $latest) { return $null }
    try { (Get-Content $latest.F -Raw | ConvertFrom-Json).merkle_hash } catch { $null }
}
function Invoke-D1 {
    param([string]$Method,[string]$Path,[object]$Body,[int]$Timeout=120)
    $uri = "$D1$Path"
    if ($Body) { return Invoke-RestMethod -Uri $uri -Method $Method -Body ($Body|ConvertTo-Json -Compress -Depth 5) -ContentType "application/json" -TimeoutSec $Timeout }
    return Invoke-RestMethod -Uri $uri -Method $Method -TimeoutSec $Timeout
}

Write-Log "============================="
Write-Log "REINCARNATE DEATH v7.0"
Write-Log "============================="

# Self-identity guard: this is the canonical script. Abort if invoked from a non-canonical path/name.
$myPath = (Get-Item $MyInvocation.MyCommand.Path).FullName
$myName = [System.IO.Path]::GetFileName($myPath)
if ($myName -ne 'reincarnate-death.ps1') {
    Write-Err "CANONICAL PATH VIOLATION: Expected 'reincarnate-death.ps1', got '$myName'. Use the canonical script at SCRIPTS/reincarnate-death.ps1. Do not improvise replacements."
}

# Authority gate: LFG + GOSPEL-999 must exist before any execution
$lfgPath = Join-Path $repoRoot ".kilo\skills\LegionnaireFieldGuide.md"
$gospelPaths = @(
    Join-Path $repoRoot "CANON\SYSTEM\GOSPEL-999.md"
    Join-Path $repoRoot "CANON\SYSTEM\GOSPEL-999-PART2.md"
    Join-Path $repoRoot "CANON\SYSTEM\GOSPEL-999-PART3.md"
)
if (-not (Test-Path $lfgPath)) { Write-Err "LFG missing at $lfgPath -- DEATH aborted" }
$gospelOk = $true; foreach ($g in $gospelPaths) { if (-not (Test-Path $g)) { $gospelOk = $false } }
if (-not $gospelOk) { Write-Err "GOSPEL-999 incomplete -- DEATH aborted" }
Write-Ok "AUTHORITY: LFG + GOSPEL-999 verified"

# Backburner precedence gate
$backburnerPath = Join-Path $repoRoot "OPERATIONS\BACKBURNER-PIPELINE-LOG.md"
if (-not (Test-Path $backburnerPath)) { Write-Err "BACKBURNER missing at $backburnerPath -- DEATH aborted" }
$bbText = Get-Content $backburnerPath -Raw
$bbOpen = [regex]::Matches($bbText, 'Status:\s*OPEN').Count
$bbBlocked = [regex]::Matches($bbText, 'Status:\s*BLOCKED').Count
$bbInProgress = [regex]::Matches($bbText, 'Status:\s*IN-PROGRESS').Count
if ($bbOpen -gt 0 -or $bbBlocked -gt 0) {
    Write-Warn "BACKBURNER PRECEDENCE: open=$bbOpen blocked=$bbBlocked in_progress=$bbInProgress"
    Write-Warn "Backburner items exist. New work is deferred until backburner is cleared or Michael explicitly overrides."
}

Push-Location $repoRoot | Out-Null
# STAGE 0 — RUN AUTHORITY (filesystem primary, git fallback)
Write-Log "--- STAGE 0: RUN AUTHORITY ---"

$fsRun = 0
if (Test-Path $reincDir) {
    $fsSeals = Get-ChildItem $reincDir -Filter "run*-reincarnateDEATH.md" -ErrorAction SilentlyContinue |
        ForEach-Object { if ($_.Name -match 'run(\d+)-reincarnateDEATH\.md$') { [int]$matches[1] } }
    if ($fsSeals) { $fsRun = ($fsSeals | Measure-Object -Maximum).Maximum }
}

$gitRun = 0
$lastDeath = git log --oneline --grep "^death:" -1 2>&1
if ($lastDeath -match '(?i)run\s*(\d+)') { $gitRun = [int]$matches[1] }

$priorRun = [Math]::Max([int]$fsRun, [int]$gitRun)
$run = [int]($priorRun + 1)
$runPad = "{0:D3}" -f $run
$rrlPathRun = $rrlPattern -f $runPad
$sealPathRun = $sealPattern -f $runPad
$dnaPathRun = "$dnaDir\dna-run$runPad.json"
$starmapPath = "$starmapDir\starmap-run$runPad.json"
$rfkwPath = "$keywordDir\rfkw-run$runPad.txt"
$s2PathRun = $s2Pattern -f $runPad
Write-Log "Run authority: fs=$fsRun git=$gitRun prior=$priorRun current=$run"
$artSyncPath = "$artSyncDir\art-sync-run$runPad.json"

foreach ($d in @($ledgerDir,$starmapDir,$keywordDir,$pipelineDir,$dnaDir,$artSyncDir,(Split-Path $rrlPathRun),(Split-Path $sealPathRun),$engDir)) { Ensure-Dir $d }

# STAGE 0 -- Session Type Detection (Kilo-native)
Write-Log "--- STAGE 0: Session Type Detection ---"
$kiloSession = $true; $activeUUID = $null
Write-Log "Kilo-native mode — all sessions treated as KILO_HOLLOW unless RRL file exists"
if (Test-Path $rrlPathRun) {
    $priorPad = "{0:D3}" -f ($run - 1); $priorRrl = $rrlPattern -f $priorPad
    if ((Test-Path $priorRrl)) {
        $h1 = (Get-FileHash $rrlPathRun -Algorithm SHA256).Hash; $h2 = (Get-FileHash $priorRrl -Algorithm SHA256).Hash
        if ($h1 -eq $h2) { Write-Warn "RRL recycled -> KILO"; $kiloSession = $true } else { $kiloSession = $false }
    } else { $kiloSession = $false }
}
$sessionType = if ($kiloSession) { "KILO_HOLLOW" } else { "REAL" }
Write-Ok "SESSION: $sessionType | run=$run | uuid=$activeUUID"

# STAGE 0.5 -- SOUL PRESERVATION (first waypoint, alpha and omega)
Write-Log "--- STAGE 0.5: SOUL PRESERVANCE ---"
$soulDir = "$repoRoot\CANON\SOUL\EXTRACT"
$soulPathRun = "$soulDir\soul-run$runPad.jsonl"
$soulBytes = 0; $soulEntries = 0; $soulPreserved = $false
if (-not (Test-Path $soulPathRun)) {
    $soulSource = $null
    # 1) Operator-saved SOUL prompts
    $soulUserPrompts = Join-Path $repoRoot "OPERATIONS\soul-user-prompts.jsonl"
    if (Test-Path $soulUserPrompts) {
        $soulSource = $soulUserPrompts
        Write-Log "SOUL: found saved prompts at $soulUserPrompts"
    }
    # 2) Current session Kilo recall
    if (-not $soulSource) {
        $soulSource = "KILO_RECALL"
        Write-Log "SOUL: no saved file found, will mark as KILO_RECALL"
    }
    if (-not $DryRun) {
        if ($soulSource -ne "KILO_RECALL" -and (Test-Path $soulSource)) {
            Copy-Item $soulSource $soulPathRun -Force
            $soulBytes = (Get-Item $soulPathRun).Length
            $soulEntries = (Get-Content $soulPathRun -Encoding UTF8 | Measure-Object -Line).Lines
            $soulPreserved = $true
        } else {
            # Write placeholder SOUL for KILO_HOLLOW sessions
            $placeholder = @{ run=$run; session_type=$sessionType; source="KILO_RECALL"; note="SOUL preserved via Kilo session recall; no transcript available"; timestamp=(Get-Date -Format "o") } | ConvertTo-Json -Compress
            $placeholder | Set-Content -LiteralPath $soulPathRun -Encoding UTF8 -Force
            $soulBytes = (Get-Item $soulPathRun).Length
            $soulEntries = 1
            $soulPreserved = $true
        }
    }
} else {
    $soulBytes = (Get-Item $soulPathRun).Length
    $soulEntries = (Get-Content $soulPathRun -Encoding UTF8 | Measure-Object -Line).Lines
    $soulPreserved = $true
    Write-Log "SOUL: already preserved at $soulPathRun"
}
Write-Ok "SOUL: $soulPathRun | bytes=$soulBytes entries=$soulEntries preserved=$soulPreserved"

# STAGE 1 -- RRL
Write-Log "--- STAGE 1: RRL ---"
$rrlText = $null; $rrlBytes = 0; $rrlChars = 0; $hasUser = $false; $hasAssistant = $false; $rrlFidelity = "HOLLOW"; $needsDiscovery = $false
if (-not (Test-Path $rrlPathRun)) { $needsDiscovery = $true } else { $rrlBytes = (Get-Item $rrlPathRun).Length; if ($rrlBytes -lt 5000) { Write-Warn "RRL HOLLOW: $rrlBytes bytes"; $needsDiscovery = $true } }
if ($needsDiscovery) {
    if ($RrlSource -and (Test-Path $RrlSource)) {
        Write-Log "Using provided -RrlSource: $RrlSource"
        if (-not $DryRun) { Copy-Item $RrlSource $rrlPathRun -Force }
        $needsDiscovery = $false
    } elseif ($kiloSession) {
        # Kilo/third-party environments do not produce real RRLs.
        # Write empty placeholder so downstream stages have valid paths.
        Write-Log "KILO_SESSION: RRL not available - writing placeholder"
        if (-not $DryRun) { "KILO_HOLLOW placeholder" | Set-Content -LiteralPath $rrlPathRun -Encoding UTF8 -Force }
        $needsDiscovery = $false
    } else {
        Write-Log "Searching for local session transcript..."
        $candidateDirs = @(
            (Join-Path $env:LOCALAPPDATA "kilo"),
            (Join-Path $env:APPDATA "kilo"),
            (Join-Path $env:USERPROFILE ".kilo"),
            (Join-Path $repoRoot "RRL")
        )
        $candidateFiles = @()
        foreach ($d in $candidateDirs) {
            if (Test-Path $d) {
                $candidateFiles += Get-ChildItem $d -Filter "*.jsonl" -ErrorAction SilentlyContinue |
                    Sort-Object LastWriteTime -Descending | Select-Object -First 5
            }
        }
        $candidateFiles = $candidateFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($candidateFiles) {
            $jsonlFile = $candidateFiles
            Write-Log "SOURCE: $($jsonlFile.FullName) ($($jsonlFile.Length) bytes)"
            if (-not $DryRun) { Copy-Item $jsonlFile.FullName $rrlPathRun -Force }
            $needsDiscovery = $false
        }
    }
}
if ($needsDiscovery) { if ($kiloSession) { Write-Warn "KILO_HOLLOW: no RRL found, proceeding with placeholder"; $rrlFidelity="HOLLOW" } else { Write-Err "FATAL: No RRL found. Provide it via -RrlSource <path> or copy it to $rrlPathRun"; exit 1 } }
if ($RrlSource -and (Test-Path $RrlSource)) { Write-Log "RRL overridden from $RrlSource" }
if ($kiloSession -or -not (Test-Path $rrlPathRun)) {
    $rrlText = "KILO_HOLLOW"; $rrlBytes = 0; $rrlChars = 0; $hasUser = $false; $hasAssistant = $false; $rrlFidelity = "HOLLOW"
} else {
    $rrlText = Get-Content $rrlPathRun -Raw -Encoding UTF8; $rrlBytes = [System.IO.File]::ReadAllBytes($rrlPathRun).Length; $rrlChars = $rrlText.Length
    $hasUser = $rrlText -match '"role"\s*:\s*"user"'; $hasAssistant = $rrlText -match '"role"\s*:\s*"assistant"'; $rrlFidelity = if ($hasUser -and $hasAssistant) { "REAL" } else { "HOLLOW" }
}
if ($rrlFidelity -eq "HOLLOW") { Write-Warn "RRL FIDELITY: one-sided (user=$hasUser assistant=$hasAssistant bytes=$rrlBytes)" }
if ($rrlBytes -lt 50000) { Write-Warn "RRL SIZE: $rrlBytes bytes (< 50KB)" }
if (-not $rrlText -and -not $kiloSession) { Write-Err "RRL EMPTY; ABORT"; exit 1 }
Write-Ok "RRL: $rrlPathRun | $rrlBytes bytes ($rrlChars chars) fidelity=$rrlFidelity"

# STAGE 2 -- SOUL
Write-Log "--- STAGE 2: SOUL ---"
$countBefore = 0; $receipt = $null
try { $countBefore = (Invoke-D1 -Method Get -Path "/api/soul/count").soulcount } catch { Write-Warn "D1 count failed" }
if ($kiloSession) {
    $receipt = [ordered]@{ event_id="DRYRUN"; count_before=$countBefore; count_after=$countBefore; delta=0; level="KILO_HOLLOW"; posted_at=(Get-Date -Format "o") }
    Write-Ok "SOUL: DRYRUN | soulcount=$countBefore"
} else {
    # Extract user texts from RRL (works for both HOLLOW one-sided and REAL two-sided)
    Write-Log "SOUL EXTRACT: parsing user texts from RRL ($rrlChars chars, fidelity=$rrlFidelity)"
    $userTexts = @()
    $lines = $rrlText -split "`n"
    foreach ($line in $lines) {
        $line = $line.Trim()
        if (-not $line) { continue }
        try { $o = $line | ConvertFrom-Json } catch { continue }
        $role = if ($o.message) { $o.message.role } else { $o.role }
        if ($role -ne 'user') { continue }
        $content = if ($o.message) { $o.message.content } else { $o.content }
        if ($content -is [string]) { $userTexts += $content }
    }
    $soulText = ($userTexts -join "`n").Trim(); $soulBytes = [System.Text.Encoding]::UTF8.GetByteCount($soulText)
    if ($soulBytes -ge ($rrlBytes * 0.95)) {
        $receipt = [ordered]@{ event_id="SOUL_GAP_CONTAMINATION_GUARD"; count_before=$countBefore; count_after=$countBefore; delta=0; level="UNKNOWN"; posted_at=(Get-Date -Format "o") }
        Write-Err "SOUL CONTAMINATION: soul ~= RRL"
    } elseif (-not $soulText) {
        $receipt = [ordered]@{ event_id="SOUL_GAP"; count_before=$countBefore; count_after=$countBefore; delta=0; level="UNKNOWN"; posted_at=(Get-Date -Format "o") }
        Write-Warn "SOUL_GAP -- 0 user turns"
    } else {
        $soulPost = $null; if ($DryRun) { $soulPost = @{ event_id = "DRYRUN-$run" } } else { try { $soulPost = Invoke-D1 -Method Post -Path "/api/soul/event" -Body ([ordered]@{ student_id="sov100-michael"; session_id="sov100-roman-run$run"; role="user"; text=$soulText }) -Timeout $TimeoutSec } catch { Write-Err "SOUL POST failed: $_"; $soulPost = @{ event_id="POST_FAILED" } } }
        try { $countAfter = (Invoke-D1 -Method Get -Path "/api/soul/count").soulcount } catch { $countAfter = $countBefore }
        $receipt = [ordered]@{ event_id=$soulPost.event_id; count_before=$countBefore; count_after=$countAfter; delta=($countAfter-$countBefore); level=$countAfter; posted_at=(Get-Date -Format "o") }
        Write-Ok "SOUL: $($receipt.event_id) | delta=$($receipt.delta) | count=$countAfter"
    }
}

# STAGE 3 -- DNA
Write-Log "--- STAGE 3: DNA ---"
$dnaCount = 0; $dnaBlueprintCount = 0; $dnaRecords = @()
if ($kiloSession) { Write-Log "STAGE 3 [KILO_HOLLOW] -- DNA extraction skipped" } else {
    $turnSeq = 0; $lines = $rrlText -split "`n"
    foreach ($line in $lines) {
        $line = $line.Trim(); if (-not $line) { continue }
        try { $o = $line | ConvertFrom-Json } catch { continue }
        $role = if ($o.message) { $o.message.role } else { $o.role }; if ($role -ne 'assistant') { continue }
        $content = if ($o.message) { $o.message.content } else { $o.content }
        $text = if ($content -is [string]) { $content } elseif ($content -is [array]) { ($content | Where-Object { $_.type -eq 'text' } | ForEach-Object { $_.text }) -join "`n" }
        $text = if ($text) { $text.Trim() } else { "" }; if ($text.Length -lt 10) { continue }
        $turnSeq++; $isBlueprint = ($text -match '```|\b(SPEC|SPECIFICATION|BLUEPRINT|ARCHITECTURE|SCHEMA|DESIGN)\b' -and $text.Length -gt 200)
        $script:dnaRecords += [ordered]@{ run=$run; seq=$turnSeq; type=if($isBlueprint){"blueprint"}else{"prose"}; chars=$text.Length; text=$text }
    }
    $dnaCount = $dnaRecords.Count; $dnaBlueprintCount = ($dnaRecords | Where-Object { $_.type -eq "blueprint" }).Count
    if ($dnaCount -gt 0) { if (-not $DryRun) { Write-Json $dnaPathRun $dnaRecords }; Write-Ok "DNA: $dnaCount records ($dnaBlueprintCount blueprints) -> $dnaPathRun" } else { Write-Warn "DNA_GAP -- 0 assistant turns" }
}

# STAGE 4 -- LEDGER
Write-Log "--- STAGE 4: LEDGER ---"
$dupe = Get-ChildItem $ledgerDir -Filter "HL-*.json" -ErrorAction SilentlyContinue | Where-Object { try { (Get-Content $_.FullName -Raw | ConvertFrom-Json).run -eq $run } catch { $false } }
if ($dupe) { if ($Force) { Write-Warn "IDEMPOTENCY WARN: run $run already sealed" } else { Write-Err "IDEMPOTENCY ABORT -- run $run already sealed"; exit 1 } }
$nextHL = Get-Next-LedgerID -LedgerDir $ledgerDir; $parentHash = Get-Tail-Ledger-Hash -LedgerDir $ledgerDir; $timestamp = (Get-Date -Format "o")
$soulHash = Compute-Sha256 $rrlText; $dnaHash = if ($dnaCount -gt 0) { Compute-Sha256 ($dnaRecords | ConvertTo-Json -Compress) } else { "DNA_GAP" }
$ledgerHash = Compute-Sha256 "$soulHash|$dnaHash|$parentHash|$timestamp"
$ledgerEntry = [ordered]@{
    hl_id="HL-$nextHL"; session_id="sov100-roman-run$run"; rrl_source=$rrlPathRun; char_count=$rrlChars; byte_count=$rrlBytes
    soul_hash=$soulHash; dna_hash=$dnaHash; dna_blueprint_count=$dnaBlueprintCount; merkle_parent=$parentHash; merkle_hash=$ledgerHash
    sealed_at=$timestamp; sov100=$true; run=$run; result=if($rrlFidelity -eq "REAL" -and $dnaBlueprintCount -gt 0){"REAL"}else{"HOLLOW"}
}
if (-not $DryRun) { Write-Json "$ledgerDir\HL-$nextHL.json" $ledgerEntry }
Write-Ok "LEDGER: HL-$nextHL | parent=$parentHash | soul=$($soulHash.Substring(0, [Math]::Min(16, $soulHash.Length)))... | dna=$($dnaHash.Substring(0, [Math]::Min(16, $dnaHash.Length)))..."

# STAGE 5 -- STARMAP
Write-Log "--- STAGE 5: STARMAP ---"
$starmap = [ordered]@{
    run=$run; rrl_path=$rrlPathRun; ledger_id="HL-$nextHL"
    soul_turn_ids=if($dnaCount -gt 0){($dnaRecords | Where-Object {$_.type -eq "prose"} | Select-Object -First 10 | ForEach-Object {"turn-$($_.seq)"}) -join ","}else{""}
    dna_turn_ids=if($dnaCount -gt 0){($dnaRecords | Where-Object {$_.type -eq "blueprint"} | Select-Object -First 10 | ForEach-Object {"seq-$($_.seq)"}) -join ","}else{""}
    blueprint_locations=if($dnaCount -gt 0){($dnaRecords | Where-Object {$_.type -eq "blueprint"} | ForEach-Object {"dna-run$runPad.json:seq-$($_.seq)"}) -join "; "}else{""}
    char_count=$rrlChars; merkle_hash=$ledgerHash; created_at=$timestamp
}
if (-not $DryRun) { Write-Json $starmapPath $starmap }
Write-Ok "STARMAP: $starmapPath"

# STAGE 6 -- SOULKEYS
Write-Log "--- STAGE 6: SOULKEYS ---"
$combinedText = $rrlText; if ($dnaCount -gt 0) { $combinedText += "`n" + ($dnaRecords | ForEach-Object { $_.text }) -join "`n" }
if ($combinedText.Length -gt 200000) { $combinedText = $combinedText.Substring(0,200000); Write-Warn "SOULKEYS: capped combinedText to 200KB for stack safety" }
$stopWordList = @('the','and','for','are','but','not','you','all','can','had','her','was','one','our','out','has','have','been','were','they','will','would','could','should','about','there','their','which','what','when','make','like','just','some','more','than','also','very','much','many','into','over','been','being','through','where','after','before','because','against','between','without','within','along','follow','coming','think','know','take','come','make','look','want','give','work','time','year','good','them','would','could','other','about','which','their','there','first','would','these','those','under','should','after','where','since','still','every','being','great','where','place','found','sound','below','seen','enough','while','both','show','those','taken','might','long','down','part','same','back','call','hand','high','last','next','left','turn','move','live','believe','happen','bring','write','provide','sit','stand','lose','pay','meet','include','continue','set','learn','change','lead','understand','watch','follow','stop','create','speak','read','allow','add','spend','grow','open','walk','win','offer','remember','love','consider','appear','buy','wait','serve','die','send','expect','build','stay','fall','cut','reach','kill','remain','suggest','raise','pass','sell','require','report','decide','pull','develop','return','explain','hope','describe','decide','share','provide','cover','fall','catch','draw','choose','wish','teach','test','wear','supply','shut','hold','push','close','deal','fill','break','support','record','cut','heat','watch','raise','reach','fly','land','cancel','graduate','enroll','register','complete','submit','assign','grade','assess','evaluate','review','approve','reject','confirm','notify','alert','remind','schedule','book','reserve','request','order','purchase','pay','charge','refund','invoice','receipt','transaction','payment','deposit','withdraw','transfer','balance','account','statement','ledger','audit','compliance','regulation','policy','contract','agreement','terms','conditions','liability','warranty','dispute','resolution','arbitration','mediation','escalate','appeal','petition','claim','evidence','document','certificate','attest','verify','validate','authenticate','authorize','deprecate','obsolete','retire','decommission','archive','purge','delete','destroy','shred','encrypt','decrypt','cipher','hash','salt','key','cert','token','session','cookie','cache','queue','buffer','stream','socket','pipe','channel','bandwidth','latency')
$stopWordsHash = [System.Collections.Generic.HashSet[string]]$stopWordList
$words = $combinedText -split '\s+' | Where-Object { $_.Length -gt 4 } | Where-Object { -not $stopWordsHash.Contains($_.ToLower()) }
$wordFreq = $words | Group-Object | Sort-Object Count -Descending | Select-Object -First 30
if (-not $DryRun) { $wordFreq | ForEach-Object { "$($_.Count) | $($_.Name)" } | Set-Content $rfkwPath -Encoding UTF8 }
$inverted = @{}
if (Test-Path $idxPath) {
    try {
        $json = Get-Content $idxPath -Raw -Encoding UTF8
        $dict = $json | ConvertFrom-Json
        if ($dict -is [System.Collections.IDictionary]) {
            foreach ($k in $dict.Keys) { $inverted[$k] = $dict[$k] }
        }
    } catch { $inverted = @{} }
}
$alreadyDone = @{}
foreach ($term in $inverted.Keys) {
    $val = $inverted[$term]
    if ($val -is [System.Collections.ICollection]) {
        foreach ($e in $val) { if ($e.run -eq $run) { $alreadyDone[$term] = $true; break } }
    } elseif ($val -and $val.run -eq $run) { $alreadyDone[$term] = $true }
}
foreach ($kw in $wordFreq) {
    $term = $kw.Name.Trim().ToLower(); $weight = [int]$kw.Count; if ($alreadyDone.ContainsKey($term)) { continue }
    $entry = [ordered]@{ run=$run; category="soul+key"; weight=$weight }
    if ($inverted.ContainsKey($term)) { $existing = $inverted[$term]; if ($existing -is [System.Collections.ICollection]) { $existing += $entry } else { $inverted[$term] = @($existing; $entry) } } else { $inverted[$term] = $entry }
}
if (-not $DryRun) {
    $out = @{}; foreach ($k in $inverted.Keys) { $out[$k] = $inverted[$k] }
    $out | ConvertTo-Json -Depth 5 | Set-Content $idxPath -Encoding UTF8
}
Write-Ok "SOULKEYS: $($inverted.Count) terms | $rfkwPath"

# STAGE 7 -- S2Pipeline
Write-Log "--- STAGE 7: S2Pipeline ---"
$s2Record = [ordered]@{
    run_number=$run; executed_at=(Get-Date -Format "o");     head_sha=(git -C $repoRoot rev-parse --short HEAD 2>$null).Trim()
    rrl_path=$rrlPathRun; rrl_chars=$rrlChars; rrl_bytes=$rrlBytes; rrl_fidelity=$rrlFidelity
    session_id="sov100-roman-run$run"; soul_event_id=if($receipt){$receipt.event_id}else{"SOUL_GAP"}; soulcount=if($receipt -and $receipt.count_after){$receipt.count_after}else{0}; soul_level=if($receipt){$receipt.level}else{"UNKNOWN"}; soul_count_before=if($receipt){$receipt.count_before}else{0}; soul_delta=if($receipt){$receipt.delta}else{0}
    dna_count=$dnaCount; dna_blueprint_count=$dnaBlueprintCount; dna_status=if($dnaCount -gt 0){if($dnaBlueprintCount -gt 0){"REAL"}else{"HOLLOW"}}else{"MISSING"}
    ledger_id="HL-$nextHL"; starmap_file=$starmapPath; keyword_file=$rfkwPath; keyword_index=$idxPath; s2pipeline_file=$s2PathRun
    registry_file=if(Test-Path $artSyncPath){$artSyncPath}else{"REGISTRY_SYNC_GAP"}; registry_synced=0
    result=if($kiloSession){"KILO_GAP"}elseif($rrlFidelity -eq "REAL" -and $dnaBlueprintCount -gt 0 -and $receipt.event_id -notmatch 'DRYRUN|SOUL_GAP|SOUL_GAP_CONTAMINATION_GUARD|POST_FAILED' -and $receipt.delta -gt 0){"COMPLETE"}else{"GAP"}
}
if (-not $DryRun) { Write-Json $s2PathRun $s2Record }
Write-Ok "S2Pipeline: $s2PathRun | result=$($s2Record.result)"

# STAGE 8 -- REGISTRY SYNC
Write-Log "--- STAGE 8: REGISTRY SYNC ---"
$syncedPieces = @()
if (-not $NoRegistrySync) {
    $runKeywords = @(); if (Test-Path $rfkwPath) { $runKeywords = (Get-Content $rfkwPath -Raw) -split "`n" | Where-Object { $_ -match '^(\d+)\s*\|' } | ForEach-Object { (($_ -split '\|')[1]).Trim().ToLower() } | Where-Object { $_.Length -gt 2 } }
    $merkleShort = if ($ledgerHash) { $ledgerHash.Substring(0,16) } else { "LEDGER_GAP" }
    $regPieces = @(); try { $regResp = Invoke-RestMethod "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/art?limit=400" -TimeoutSec 20; $regPieces = $regResp.pieces } catch { Write-Warn "Registry fetch failed: $_" }
    foreach ($piece in $regPieces) {
        if (-not $piece) { continue }; $pieceTags = ($piece.tags -split ',') | ForEach-Object { $_.Trim().ToLower() } | Where-Object { $_ }; $pieceTitle = ($piece.title -replace '[^a-zA-Z0-9 ]','').ToLower()
        $matched = @($pieceTags | Where-Object { $runKeywords -contains $_ }); $titleHit = ($rrlText -match [regex]::Escape($piece.title)) -or ($rrlText -match [regex]::Escape(($piece.url -replace '-hd\.png|\.png|isolated/','')))
        if ($matched.Count -eq 0 -and -not $titleHit) { continue }
        $existingNotes = if ($piece.notes) { $piece.notes } else { "" }; $runTag = "run$runPad"
        if ($existingNotes -notmatch $runTag) {
            $appendNote = "[$runTag | HL-$nextHL | $merkleShort | kw:$($matched -join ',') | sm:starmap-run$runPad.json]"; $newNotes = ($existingNotes + " " + $appendNote).Trim()
            try { $null = Invoke-RestMethod "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/art/$($piece.id)" -Method PATCH -Body ([ordered]@{ notes=$newNotes }|ConvertTo-Json -Compress) -ContentType "application/json" -TimeoutSec 10; $syncedPieces += [ordered]@{ id=$piece.id; title=$piece.title; url=$piece.url; keywords=$matched; title_hit=$titleHit } }
            catch { Write-Warn "PATCH failed $($piece.title): $_" }
        }
    }
    $artSync = [ordered]@{ run=$run; ledger_id="HL-$nextHL"; merkle_short=$merkleShort; starmap_file="starmap-run$runPad.json"; keywords_file="rfkw-run$runPad.txt"; keywords_used=$runKeywords; pieces_synced=$syncedPieces.Count; pieces=$syncedPieces; executed_at=$timestamp }
    if (-not $DryRun) { Write-Json $artSyncPath $artSync }
    Write-Ok "REGISTRY_SYNC: $($syncedPieces.Count) pieces -> $artSyncPath"
} else { Write-Log "REGISTRY_SYNC: skipped" }

# STAGE 9 -- ENGINEERING (roads, infrastructure, city prosperity)
Write-Log "--- STAGE 9: ENGINEERING ---"
$engDir = Join-Path $repoRoot "CANON\ENGINEERING"
$engReportPath = Join-Path $engDir "engineering-run$runPad.json"
$infraIssues = @()
$upgrades = @()
# 1) Road audit: check if core paths/symlinks/scripts are intact
$corePaths = @($repoRoot, $ledgerDir, $starmapDir, $keywordDir, $pipelineDir, $dnaDir, $artSyncDir, $reincDir)
foreach ($p in $corePaths) {
    if (-not (Test-Path $p)) { $infraIssues += "MISSING: $p" }
}
# 2) Infrastructure: verify death/rise scripts are syntactically valid
$scriptErrors = @()
foreach ($script in @("reincarnate-death.ps1", "reincarnate-rise.ps1")) {
    $scriptPath = Join-Path $repoRoot "SCRIPTS\$script"
    if (Test-Path $scriptPath) {
        $errors = $null; [System.Management.Automation.PSParser]::Tokenize((Get-Content $scriptPath -Raw), [ref]$errors) | Out-Null
        if ($errors) { $scriptErrors += "$script : $($errors.Count) syntax errors" }
    }
}
if ($scriptErrors.Count -gt 0) { $infraIssues += $scriptErrors } else { $upgrades += "Scripts syntax-validated" }
# 3) City prosperity: verify backburner is not growing unchecked
$bbCount = 0; $bbPath = Join-Path $repoRoot "OPERATIONS\BACKBURNER-PIPELINE-LOG.md"
if (Test-Path $bbPath) { $bbContent = Get-Content $bbPath -Raw; $bbCount = ([regex]::Matches($bbContent, "- \*\*Status:\*\* OPEN")).Count }
if ($bbCount -gt 20) { $infraIssues += "BACKBURNER overflow: $bbCount open items" } else { $upgrades += "Backburner manageable ($bbCount open)" }
# 4) Build roads: ensure canonical command/agent/skill paths exist
$canonPaths = @(".kilo\command", ".kilo\agent", ".kilo\skills")
foreach ($cp in $canonPaths) {
    $fullPath = Join-Path $repoRoot $cp
    if (-not (Test-Path $fullPath)) { $infraIssues += "MISSING: $cp" } else { $upgrades += "Canon path present: $cp" }
}
$engResult = if ($infraIssues.Count -eq 0) { "GREEN" } else { "GAP" }
$engReport = [ordered]@{
    run=$run; executed_at=(Get-Date -Format "o"); head_sha=(git -C $repoRoot rev-parse --short HEAD 2>$null).Trim()
    result=$engResult; infrastructure_issues=$infraIssues; upgrades_applied=$upgrades
    backburner_open=$bbCount; scripts_validated=($scriptErrors.Count -eq 0)
}
if (-not $DryRun) { Write-Json $engReportPath $engReport }
Write-Ok "ENGINEERING: $engReportPath | result=$engResult issues=$($infraIssues.Count) upgrades=$($upgrades.Count)"

# DEATH SEAL (15 SECTIONS)
Write-Log "--- DEATH SEAL ---"
$headSha = (git -C $repoRoot rev-parse --short HEAD 2>$null).Trim(); $dirty = git -C $repoRoot status --porcelain 2>$null | Where-Object { $_ }; $branch = git -C $repoRoot branch --show-current 2>$null
$artifactPaths = @($rrlPathRun,$dnaPathRun,"$ledgerDir\HL-$nextHL.json",$starmapPath,$rfkwPath,$idxPath,$s2PathRun,$artSyncPath,$soulPathRun,$engReportPath)
$artifactSHAs = @(); foreach ($p in $artifactPaths) { if (Test-Path $p) { $artifactSHAs += "$(Split-Path $p -Leaf):$((Get-FileHash $p -Algorithm SHA256).Hash.Substring(0,16))" } }
$trueRuns = @(); $currentBranch = git -C $repoRoot branch --show-current 2>$null; $deathLines = git -C $repoRoot log --oneline --branches=$currentBranch --grep "^death:" 2>$null | ForEach-Object { if ($_ -match '(?i)run\s*(\d+)') { [int]$matches[1] } }; $trueRuns = @($deathLines | Sort-Object -Unique); $totalTrueRuns = $trueRuns.Count; $lastTrue = if ($trueRuns) { $trueRuns[-1] } else { 0 }; $deathCommitCount = ($deathLines | Measure-Object).Count
$dnaRegistryPath = "$repoRoot\CANON\REGISTRY\dna-registry-run$runPad.json"; $dnaRegistryExists = Test-Path $dnaRegistryPath; $dnaRegistryCount = 0; if ($dnaRegistryExists) { try { $dnaRegistryCount = ((Get-Content $dnaRegistryPath -Raw | ConvertFrom-Json).entries | Measure-Object).Count } catch {} }
$topKeywords = @(); if (Test-Path $rfkwPath) { $topKeywords = (Get-Content $rfkwPath -Raw -ErrorAction SilentlyContinue) -split "`n" | Where-Object { $_ -match '^\d+\s*\|' } | Select-Object -First 5 }
$criticalDecisions = @()
if ($receipt -and $receipt.event_id -and $receipt.event_id -notmatch 'DRYRUN|GAP|FAILED') { $criticalDecisions += "SOUL posted (event $($receipt.event_id))" }
if ($dnaBlueprintCount -gt 0) { $criticalDecisions += "DNA blueprints preserved ($dnaBlueprintCount)" }
if ($rrlFidelity -eq "REAL") { $criticalDecisions += "RRL fidelity verified (both speakers)" } else { $criticalDecisions += "RRL HOLLOW -- downstream stages flagged" }

$seal = @"
# REINCARNATE DEATH SEAL v7.0

## Â§1 -- Header
- **Run:** $run
- **Timestamp:** $(Get-Date -Format "o")
- **Theme:** Roman Death v7.0 / 9-Stage Chain
- **Signal Density:** $(if($rrlFidelity -eq "REAL"){'HIGH'}else{'LOW -- HOLLOW RRL'})
- **HEAD:** $headSha
- **Branch:** $branch
- **Session Type:** $sessionType
- **RRL Fidelity:** $rrlFidelity
- **Dirty Tree:** $(if($dirty){'YES'}else{'CLEAN'})
- **Death ledger commits:** $deathCommitCount
- **True run count (git):** $totalTrueRuns (last=$lastTrue)

## Â§2 -- Raw Soul DNA
- **RRL:** $rrlPathRun
- **Bytes:** $rrlBytes | **Chars:** $rrlChars
- **Fidelity:** $rrlFidelity (user=$hasUser assistant=$hasAssistant)
- **Soul bytes:** $(if($dnaCount -gt 0){'see SOULKEYS'}else{'GAP'})

## Â§3 -- SOUL Preservation
- **Path:** $soulPathRun
- **Bytes:** $soulBytes | **Entries:** $soulEntries
- **Preserved:** $soulPreserved
- **Source:** $(if($soulSource){$soulSource}else{'KILO_RECALL'})

## Â§4 -- Soul Receipt
| Field | Value |
|-------|-------|
| event_id | $(if($receipt){$receipt.event_id}else{'GAP'}) |
| count_before | $(if($receipt){$receipt.count_before}else{'-'}) |
| count_after | $(if($receipt){$receipt.count_after}else{'-'}) |
| delta | $(if($receipt){$receipt.delta}else{'-'}) |
| level | $(if($receipt){$receipt.level}else{'-'}) |
| posted_at | $(if($receipt){$receipt.posted_at}else{'-'}) |

## Â§5 -- Decisions
$(if($criticalDecisions){$criticalDecisions | ForEach-Object { "- $_" } }else{'- (none)'})

## Â§6 -- Corrections
- None recorded this run.

## Â§7 -- New Principles
- None recorded this run.

## Â§8 -- Emotional Signal
- Neutral -- execution mode.

## Â§9 -- Open Questions
- None recorded this run.

## Â§10 -- Unfinished Actions
$(if($dirty){"- git add <paths> | git commit -m `"death: run $run artifacts`"" }else{"- Tree clean"})

## Â§10 -- System Design
- 8-Stage Roman Death v7.0 operational.
- D1 sovereign store; Cloudflare workspace only.

## Â§11 -- Artifacts
$(if($artifactSHAs){$artifactSHAs | ForEach-Object { "- $_" }})
- **runPad:** $runPad | **HL:** HL-$nextHL | **Merkle:** $($ledgerHash.Substring(0,16))...

## Â§12 -- State Snapshot
- **HEAD:** $headSha
- **Branch:** $branch
- **Dirty:** $(if($dirty){'YES'}else{'CLEAN'})
- **SOULCOUNT:** $(if($receipt -and $receipt.count_after){$receipt.count_after}else{0})
- **DNA Blueprints:** $dnaBlueprintCount

## Â§13 -- Fingerprint
- **Agent:** OB-1 CANONICAL (kilo-auto/free)
- **Run:** $run
- **Commit SHA:** $headSha
- **Session Type:** $sessionType

## Â§14 -- Art Registry Sync
- **Pieces synced:** $($syncedPieces.Count)
- **Art sync file:** $artSyncPath
- **Top keywords:** $(if($topKeywords){($topKeywords | ForEach-Object { $_.Trim() }) -join ', '}else{'GAP'})

## Â§15 -- Registry
- **DNA Registry Path:** $dnaRegistryPath
- **DNA Registry Exists:** $dnaRegistryExists
- **DNA Registry Count:** $dnaRegistryCount
- **Overall Status:** $(if($s2Record.result -eq "COMPLETE"){'REAL'}elseif($s2Record.result -eq "KILO_GAP"){'KILO_GAP'}else{'HOLLOW'})

## Â§16 -- Engineering
- **Result:** $engResult
- **Infrastructure Issues:** $($infraIssues.Count)
- **Upgrades Applied:** $($upgrades.Count)
- **Backburner Open:** $bbCount
- **Scripts Validated:** $(if($scriptErrors.Count -eq 0){'YES'}else{'NO - $($scriptErrors.Count) errors'})
- **Engineering Report:** $engReportPath
"@

if (-not $DryRun) { $seal | Set-Content $sealPathRun -Encoding UTF8 }
Write-Ok "DEATH SEAL: $sealPathRun"

# Final state snapshot update
if (-not $DryRun) {
    $snapshot = [ordered]@{
        run = $run
        updated_at = (Get-Date -Format "o")
        head = $headSha
        branch = $branch
        rrl_fidelity = $rrlFidelity
        soulcount = if($receipt -and $receipt.count_after){$receipt.count_after}else{0}
        dna_blueprint_count = $dnaBlueprintCount
        ledger_id = "HL-$nextHL"
        s2pipeline_result = $s2Record.result
        registry_synced = $syncedPieces.Count
    }
    Write-Json $stateSnapPath $snapshot
    Write-Ok "STATE-SNAPSHOT updated"
}

Pop-Location | Out-Null
Write-Log "============================="
Write-Log "DEATH COMPLETE: run=$run result=$($s2Record.result)"
Write-Log "============================="

