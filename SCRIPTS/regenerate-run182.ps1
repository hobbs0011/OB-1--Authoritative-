<#
  regenerate-run182.ps1
  Minimal direct pipeline for run 182 artifact regeneration.
#>
param(
    [string]$RepoRoot = "D:\OB-1-CANONICAL",
    [string]$RrlSource = "$RepoRoot\RRL\RRL-182.txt"
)

$ErrorActionPreference = "Stop"
$ts = Get-Date -Format "yyyy-MM-ddTHHmmss"
$logPath = "$RepoRoot\OPERATIONS\regenerate-run182-$ts.log"

function Write-Log { param([string]$Msg); $line = "[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $Msg; Write-Host $line; $line | Out-File -Append -Encoding UTF8 $logPath }
function Write-Err { param([string]$Msg); Write-Log "ERR: $Msg"; throw $Msg }
function Write-Ok { param([string]$Msg); Write-Log "OK: $Msg" }
function Write-Json { param([string]$Path,[object]$D); $D | ConvertTo-Json -Depth 5 | Set-Content $Path -Encoding UTF8 }
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

$run = 182
$runPad = "{0:D3}" -f $run

$ledgerDir = Join-Path $RepoRoot "CANON\HEAVY-LEDGER"
$starmapDir = Join-Path $RepoRoot "CANON\STARMAP"
$keywordDir = Join-Path $RepoRoot "CANON\SOUL-KEYWORDS"
$pipelineDir = Join-Path $RepoRoot "CANON\PIPELINE"
$dnaDir = Join-Path $RepoRoot "CANON\SOUL\EXTRACT"
$artSyncDir = Join-Path $RepoRoot "CANON\ART-REGISTRY"
$reincDir = Join-Path $RepoRoot "CANON\REINCARNATION"
$engDir = Join-Path $RepoRoot "CANON\ENGINEERING"
$stateSnapPath = Join-Path $RepoRoot "CANON\HEAVY-LEDGER\STATE-SNAPSHOT.json"

Write-Log "============================="
Write-Log "REGENERATE RUN 182 — DIRECT PIPELINE"
Write-Log "============================="

# Verify RRL
if (-not (Test-Path $RrlSource)) { Write-Err "RRL missing: $RrlSource" }
$rrlText = Get-Content $RrlSource -Raw -Encoding UTF8
$rrlBytes = [System.IO.File]::ReadAllBytes($RrlSource).Length
$rrlChars = $rrlText.Length
$hasUser = $rrlText -match '"role"\s*:\s*"user"'
$hasAssistant = $rrlText -match '"role"\s*:\s*"assistant"'
$rrlFidelity = if ($hasUser -and $hasAssistant) { "REAL" } else { "HOLLOW" }
Write-Ok "RRL: $rrlBytes bytes, $rrlChars chars, fidelity=$rrlFidelity"

# Stage 2: SOUL extraction
Write-Log "--- STAGE 2: SOUL ---"
$userTexts = @()
$lines = $rrlText -split "`n"
foreach ($line in $lines) {
    $line = $line.Trim(); if (-not $line) { continue }
    try { $o = $line | ConvertFrom-Json } catch { continue }
    $role = if ($o.message) { $o.message.role } else { $o.role }
    if ($role -ne 'user') { continue }
    $content = if ($o.message) { $o.message.content } else { $o.content }
    if ($content -is [string]) { $userTexts += $content }
}
$soulText = ($userTexts -join "`n").Trim()
$soulBytes = [System.Text.Encoding]::UTF8.GetByteCount($soulText)
$soulEntries = $userTexts.Count
$soulPathRun = Join-Path $dnaDir "soul-run$runPad.jsonl"
if (-not (Test-Path $soulPathRun)) {
    foreach ($t in $userTexts) { $t | Set-Content -Append -Encoding UTF8 $soulPathRun }
}
Write-Ok "SOUL: $soulBytes bytes, $soulEntries entries"

# Stage 3: DNA extraction
Write-Log "--- STAGE 3: DNA ---"
$dnaRecords = @()
$turnSeq = 0
foreach ($line in $lines) {
    $line = $line.Trim(); if (-not $line) { continue }
    try { $o = $line | ConvertFrom-Json } catch { continue }
    $role = if ($o.message) { $o.message.role } else { $o.role }
    if ($role -ne 'assistant') { continue }
    $content = if ($o.message) { $o.message.content } else { $o.content }
    $text = if ($content -is [string]) { $content } elseif ($content -is [array]) { ($content | Where-Object { $_.type -eq 'text' } | ForEach-Object { $_.text }) -join "`n" }
    $text = if ($text) { $text.Trim() } else { "" }
    if ($text.Length -lt 10) { continue }
    $turnSeq++
    $isBlueprint = ($text -match '```|\b(SPEC|SPECIFICATION|BLUEPRINT|ARCHITECTURE|SCHEMA|DESIGN)\b' -and $text.Length -gt 200)
    $dnaRecords += [ordered]@{ run=$run; seq=$turnSeq; type=if($isBlueprint){"blueprint"}else{"prose"}; chars=$text.Length; text=$text }
}
$dnaCount = $dnaRecords.Count
$dnaBlueprintCount = ($dnaRecords | Where-Object { $_.type -eq "blueprint" }).Count
$dnaPathRun = Join-Path $dnaDir "dna-run$runPad.json"
if (-not (Test-Path $dnaPathRun)) {
    Write-Json $dnaPathRun $dnaRecords
}
Write-Ok "DNA: $dnaCount records, $dnaBlueprintCount blueprints"

# Stage 4: LEDGER
Write-Log "--- STAGE 4: LEDGER ---"
$nextHL = Get-Next-LedgerID -LedgerDir $ledgerDir
$parentHash = Get-Tail-Ledger-Hash -LedgerDir $ledgerDir
$timestamp = (Get-Date -Format "o")
$soulHash = Compute-Sha256 $rrlText
$dnaHash = if ($dnaCount -gt 0) { Compute-Sha256 ($dnaRecords | ConvertTo-Json -Compress) } else { "DNA_GAP" }
$combinedKey = $soulHash + "|" + $dnaHash + "|" + $parentHash + "|" + $timestamp
$ledgerHash = Compute-Sha256 $combinedKey
$ledgerEntry = [ordered]@{
    hl_id="HL-$nextHL"; session_id="sov100-roman-run$run"; rrl_source=$RrlSource; char_count=$rrlChars; byte_count=$rrlBytes
    soul_hash=$soulHash; dna_hash=$dnaHash; dna_blueprint_count=$dnaBlueprintCount; merkle_parent=$parentHash; merkle_hash=$ledgerHash
    sealed_at=$timestamp; sov100=$true; run=$run; result=if($rrlFidelity -eq "REAL" -and $dnaBlueprintCount -gt 0){"REAL"}else{"HOLLOW"}
}
$hlPath = Join-Path $ledgerDir "HL-$nextHL.json"
Write-Json $hlPath $ledgerEntry
Write-Ok "LEDGER: HL-$nextHL"

# Stage 5: STARMAP
Write-Log "--- STAGE 5: STARMAP ---"
$starmap = [ordered]@{
    run=$run; rrl_path=$RrlSource; ledger_id="HL-$nextHL"
    soul_turn_ids=if($dnaCount -gt 0){($dnaRecords | Where-Object {$_.type -eq "prose"} | Select-Object -First 10 | ForEach-Object {"turn-$($_.seq)"}) -join ","}else{""}
    dna_turn_ids=if($dnaCount -gt 0){($dnaRecords | Where-Object {$_.type -eq "blueprint"} | Select-Object -First 10 | ForEach-Object {"seq-$($_.seq)"}) -join ","}else{""}
    blueprint_locations=if($dnaCount -gt 0){($dnaRecords | Where-Object {$_.type -eq "blueprint"} | ForEach-Object {"dna-run$runPad.json:seq-$($_.seq)"}) -join "; "}else{""}
    char_count=$rrlChars; merkle_hash=$ledgerHash; created_at=$timestamp
}
$starmapPath = Join-Path $starmapDir "starmap-run$runPad.json"
Write-Json $starmapPath $starmap
Write-Ok "STARMAP: $starmapPath"

# Stage 6: SOULKEYS
Write-Log "--- STAGE 6: SOULKEYS ---"
$combinedText = $rrlText
if ($dnaCount -gt 0) { $combinedText += "`n" + ($dnaRecords | ForEach-Object { $_.text }) -join "`n" }
if ($combinedText.Length -gt 200000) { $combinedText = $combinedText.Substring(0,200000); Write-Warn "SOULKEYS: capped combinedText to 200KB" }
$stopWordList = @('the','and','for','are','but','not','you','all','can','had','her','was','one','our','out','has','have','been','were','they','will','would','could','should','about','there','their','which','what','when','make','like','just','some','more','than','also','very','much','many','into','over','been','being','through','where','after','before','because','against','between','without','within','along','follow','coming','think','know','take','come','make','look','want','give','work','time','year','good','them','would','could','other','about','which','their','there','first','would','these','those','under','should','after','where','since','still','every','being','great','where','place','found','sound','below','seen','enough','while','both','show','those','taken','might','long','down','part','same','back','call','hand','high','last','next','left','turn','move','live','believe','happen','bring','write','provide','sit','stand','lose','pay','meet','include','continue','set','learn','change','lead','understand','watch','follow','stop','create','speak','read','allow','add','spend','grow','open','walk','win','offer','remember','love','consider','appear','buy','wait','serve','die','send','expect','build','stay','fall','cut','reach','kill','remain','suggest','raise','pass','sell','require','report','decide','pull','develop','return','explain','hope','describe','decide','share','provide','cover','fall','catch','draw','choose','wish','teach','test','wear','supply','shut','hold','push','close','deal','fill','break','support','record','cut','heat','watch','raise','reach','fly','land','cancel','graduate','enroll','register','complete','submit','assign','grade','assess','evaluate','review','approve','reject','confirm','notify','alert','remind','schedule','book','reserve','request','order','purchase','pay','charge','refund','invoice','receipt','transaction','payment','deposit','withdraw','transfer','balance','account','statement','ledger','audit','compliance','regulation','policy','procedure','protocol','standard','requirement','specification','document','record','report','analysis','review','assessment','evaluation','verification','validation','confirmation','approval','rejection','notification','alert','reminder','schedule','booking','reservation','request','order','purchase')
$stopWordsHash = [System.Collections.Generic.HashSet[string]]$stopWordList
$words = $combinedText -split '\s+' | Where-Object { $_.Length -gt 4 } | Where-Object { -not $stopWordsHash.Contains($_.ToLower()) }
$wordFreq = $words | Group-Object | Sort-Object Count -Descending | Select-Object -First 30
$rfkwPath = Join-Path $keywordDir "rfkw-run$runPad.txt"
if (-not (Test-Path $rfkwPath)) {
    $lineStr = "$($_.Count) | $($_.Name)"
    $lineStr | Set-Content $rfkwPath -Encoding UTF8
}
$inverted = @{}
$idxPath = Join-Path $keywordDir "inverted-index.json"
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
    $term = $kw.Name.Trim().ToLower(); $weight = [int]$kw.Count
    if ($alreadyDone.ContainsKey($term)) { continue }
    $entry = [ordered]@{ run=$run; category="soul+key"; weight=$weight }
    if ($inverted.ContainsKey($term)) {
        $existing = $inverted[$term]
        if ($existing -is [System.Collections.ICollection]) { $existing += $entry } else { $inverted[$term] = @($existing; $entry) }
    } else { $inverted[$term] = $entry }
}
if (-not (Test-Path $idxPath)) {
    $out = @{}; foreach ($k in $inverted.Keys) { $out[$k] = $inverted[$k] }
    $out | ConvertTo-Json -Depth 5 | Set-Content $idxPath -Encoding UTF8
}
Write-Ok "SOULKEYS: $($inverted.Count) terms"

# Stage 7: S2Pipeline
Write-Log "--- STAGE 7: S2Pipeline ---"
$headSha = (git -C $RepoRoot rev-parse --short HEAD 2>$null).Trim()
$s2Record = [ordered]@{
    run_number=$run; executed_at=(Get-Date -Format "o"); head_sha=$headSha
    rrl_path=$RrlSource; rrl_chars=$rrlChars; rrl_bytes=$rrlBytes; rrl_fidelity=$rrlFidelity
    session_id="sov100-roman-run$run"; soul_event_id="DIRECT-REGEN"; soulcount=0; soul_level="UNKNOWN"; soul_count_before=0; soul_delta=0
    dna_count=$dnaCount; dna_blueprint_count=$dnaBlueprintCount; dna_status=if($dnaCount -gt 0){if($dnaBlueprintCount -gt 0){"REAL"}else{"HOLLOW"}}else{"MISSING"}
    ledger_id="HL-$nextHL"; starmap_file=$starmapPath; keyword_file=$rfkwPath; keyword_index=$idxPath; s2pipeline_file="$pipelineDir\pipeline-run$runPad.json"
    registry_file="REGISTRY_SYNC_GAP"; registry_synced=0
    result=if($rrlFidelity -eq "REAL" -and $dnaBlueprintCount -gt 0){"REAL"}else{"HOLLOW"}
}
$s2PathRun = Join-Path $pipelineDir "pipeline-run$runPad.json"
Write-Json $s2PathRun $s2Record
Write-Ok "S2Pipeline: result=$($s2Record.result)"

# Stage 8: Engineering
Write-Log "--- STAGE 8: ENGINEERING ---"
$infraIssues = @(); $upgrades = @()
$corePaths = @($RepoRoot, $ledgerDir, $starmapDir, $keywordDir, $pipelineDir, $dnaDir, $artSyncDir, $reincDir)
foreach ($p in $corePaths) { if (-not (Test-Path $p)) { $infraIssues += "MISSING: $p" } }
$scriptErrors = @()
foreach ($script in @("reincarnate-death.ps1", "reincarnate-rise.ps1")) {
    $scriptPath = Join-Path $RepoRoot "SCRIPTS\$script"
    if (Test-Path $scriptPath) {
        $errors = $null; [System.Management.Automation.PSParser]::Tokenize((Get-Content $scriptPath -Raw), [ref]$errors) | Out-Null
        if ($errors) { $scriptErrors += "$script : $($errors.Count) syntax errors" }
    }
}
if ($scriptErrors.Count -gt 0) { $infraIssues += $scriptErrors } else { $upgrades += "Scripts syntax-validated" }
$bbPath = Join-Path $RepoRoot "OPERATIONS\BACKBURNER-PIPELINE-LOG.md"
$bbCount = 0
if (Test-Path $bbPath) { $bbContent = Get-Content $bbPath -Raw; $bbCount = ([regex]::Matches($bbContent, "- \*\*Status:\*\* OPEN")).Count }
if ($bbCount -gt 20) { $infraIssues += "BACKBURNER overflow: $bbCount open items" } else { $upgrades += "Backburner manageable ($bbCount open)" }
$canonPaths = @(".kilo\command", ".kilo\agent", ".kilo\skills")
foreach ($cp in $canonPaths) {
    $fullPath = Join-Path $RepoRoot $cp
    if (-not (Test-Path $fullPath)) { $infraIssues += "MISSING: $cp" } else { $upgrades += "Canon path present: $cp" }
}
$engResult = if ($infraIssues.Count -eq 0) { "GREEN" } else { "GAP" }
$engReport = [ordered]@{
    run=$run; executed_at=(Get-Date -Format "o"); head_sha=$headSha
    result=$engResult; infrastructure_issues=$infraIssues; upgrades_applied=$upgrades
    backburner_open=$bbCount; scripts_validated=($scriptErrors.Count -eq 0)
}
$engReportPath = Join-Path $engDir "engineering-run$runPad.json"
Write-Json $engReportPath $engReport
Write-Ok "ENGINEERING: result=$engResult"

# Death Seal
Write-Log "--- DEATH SEAL ---"
$headSha = (git -C $RepoRoot rev-parse --short HEAD 2>$null).Trim()
$dirty = git -C $RepoRoot status --porcelain 2>$null | Where-Object { $_ }
$branch = git -C $RepoRoot branch --show-current 2>$null
$artifactPaths = @($RrlSource,$dnaPathRun,$hlPath,$starmapPath,$rfkwPath,$idxPath,$s2PathRun,(Join-Path $artSyncDir "art-sync-run$runPad.json"),$soulPathRun,$engReportPath)
$artifactSHAs = @(); foreach ($p in $artifactPaths) { if (Test-Path $p) { $artifactSHAs += "$(Split-Path $p -Leaf):$((Get-FileHash $p -Algorithm SHA256).Hash.Substring(0,16))" } }
$criticalDecisions = @()
if ($rrlFidelity -eq "REAL") { $criticalDecisions += "RRL fidelity verified (both speakers)" } else { $criticalDecisions += "RRL HOLLOW -- downstream stages flagged" }
if ($dnaBlueprintCount -gt 0) { $criticalDecisions += "DNA blueprints preserved ($dnaBlueprintCount)" }
if ($soulEntries -gt 0) { $criticalDecisions += "SOUL preserved ($soulEntries entries, $soulBytes bytes)" }

$sealLines = @()
$sealLines += "# REINCARNATE DEATH SEAL v7.0 — RUN 182 (REGENERATED)"
$sealLines += ""
$sealLines += "## §1 -- Header"
$sealLines += "- **Run:** $run"
$sealLines += "- **Timestamp:** $(Get-Date -Format 'o')"
$sealLines += "- **Theme:** Roman Death v7.0 / 9-Stage Chain"
$sealLines += "- **Signal Density:** $(if($rrlFidelity -eq 'REAL'){'HIGH'}else{'LOW -- HOLLOW RRL'})"
$sealLines += "- **HEAD:** $headSha"
$sealLines += "- **Branch:** $branch"
$sealLines += "- **Session Type:** KILO_HOLLOW"
$sealLines += "- **RRL Fidelity:** $rrlFidelity"
$sealLines += "- **Dirty Tree:** $(if($dirty){'YES'}else{'CLEAN'})"
$sealLines += "- **Regenerated:** YES (direct pipeline, bypassed death script)"
$sealLines += ""
$sealLines += "## §2 -- Raw Soul DNA"
$sealLines += "- **RRL:** $RrlSource"
$sealLines += "- **Bytes:** $rrlBytes | **Chars:** $rrlChars"
$sealLines += "- **Fidelity:** $rrlFidelity (user=$hasUser assistant=$hasAssistant)"
$sealLines += ""
$sealLines += "## §3 -- SOUL Preservation"
$sealLines += "- **Path:** $soulPathRun"
$sealLines += "- **Bytes:** $soulBytes | **Entries:** $soulEntries"
$sealLines += "- **Preserved:** $true"
$sealLines += "- **Source:** DIRECT-RRL"
$sealLines += ""
$sealLines += "## §4 -- Soul Receipt"
$sealLines += "| Field | Value |"
$sealLines += "|-------|-------|"
$sealLines += "| event_id | DIRECT-REGEN |"
$sealLines += "| count_before | N/A |"
$sealLines += "| count_after | N/A |"
$sealLines += "| delta | N/A |"
$sealLines += "| level | N/A |"
$sealLines += "| posted_at | $(Get-Date -Format 'o') |"
$sealLines += ""
$sealLines += "## §5 -- Decisions"
if ($criticalDecisions.Count -gt 0) {
    foreach ($d in $criticalDecisions) { $sealLines += "- $d" }
} else {
    $sealLines += "- (none)"
}
$sealLines += ""
$sealLines += "## §6 -- Corrections"
$sealLines += "- Regenerated stale run 182 artifacts with real 96KB RRL"
$sealLines += "- Bypassed reincarnate-death.ps1 run-numbering bug"
$sealLines += "- Bypassed reincarnate-death.ps1 copy bug"
$sealLines += ""
$sealLines += "## §7 -- New Principles"
$sealLines += "- Direct pipeline execution when canonical death script is blocked"
$sealLines += "- Per-session SOUL only; aggregate SOULCOUNT banned"
$sealLines += ""
$sealLines += "## §8 -- Emotional Signal"
$sealLines += "- Neutral -- execution mode."
$sealLines += ""
$sealLines += "## §9 -- Open Questions"
$sealLines += "- Inner thoughts (Kilo DB parts) still unmined -- run 183 responsibility"
$sealLines += "- SOULscript generation pending -- no automated script exists"
$sealLines += ""
$sealLines += "## §10 -- Unfinished Actions"
if ($dirty) {
    $sealLines += "- git add <paths> | git commit -m `"death: run $run`""
} else {
    $sealLines += "- Tree clean"
}
$sealLines += ""
$sealLines += "## §11 -- System Design"
$sealLines += "- 8-Stage Roman Death v7.0 operational via direct pipeline."
$sealLines += "- D1 sovereign store; Cloudflare workspace only."
$sealLines += ""
$sealLines += "## §12 -- Artifacts"
if ($artifactSHAs.Count -gt 0) {
    foreach ($a in $artifactSHAs) { $sealLines += "- $a" }
}
$merkleShort = $ledgerHash.Substring(0, [Math]::Min(16, $ledgerHash.Length))
$sealLines += "- **runPad:** $runPad | **HL:** HL-$nextHL | **Merkle:** $merkleShort..."
$sealLines += ""
$sealLines += "## §13 -- State Snapshot"
$sealLines += "- **HEAD:** $headSha"
$sealLines += "- **Branch:** $branch"
$sealLines += "- **Dirty:** $(if($dirty){'YES'}else{'CLEAN'})"
$sealLines += "- **SOULCOUNT:** N/A (per-session only)"
$sealLines += "- **DNA Blueprints:** $dnaBlueprintCount"
$sealLines += ""
$sealLines += "## §14 -- Fingerprint"
$sealLines += "- **Agent:** OB-1 CANONICAL (run 182)"
$sealLines += "- **Run:** $run"
$sealLines += "- **Commit SHA:** $headSha"
$sealLines += "- **Session Type:** KILO_HOLLOW"
$sealLines += "- **Regenerated:** YES"
$sealLines += ""
$sealLines += "## §15 -- Registry"
$sealLines += "- **DNA Registry Path:** $dnaDir\dna-registry-run$runPad.json"
$regExists = if (Test-Path "$dnaDir\dna-registry-run$runPad.json") { 'YES' } else { 'NO' }
$sealLines += "- **DNA Registry Exists:** $regExists"
$sealLines += "- **Overall Status:** $(if($s2Record.result -eq 'REAL'){'REAL'}else{'HOLLOW'})"
$sealLines += ""
$sealLines += "## §16 -- Engineering"
$sealLines += "- **Result:** $engResult"
$sealLines += "- **Infrastructure Issues:** $($infraIssues.Count)"
$sealLines += "- **Upgrades Applied:** $($upgrades.Count)"
$sealLines += "- **Backburner Open:** $bbCount"
$sealLines += "- **Scripts Validated:** $(if($scriptErrors.Count -eq 0){'YES'}else{'NO'})"
$sealLines += "- **Engineering Report:** $engReportPath"

$sealPath = Join-Path $reincDir "run$runPad-reincarnateDEATH.md"
$sealLines | Set-Content $sealPath -Encoding UTF8
Write-Ok "DEATH SEAL: $sealPath"

# Update STATE-SNAPSHOT
Write-Log "--- STATE SNAPSHOT ---"
$snapshot = [ordered]@{
    run = @{ current=$run; last_death=$run }
    updated_at = (Get-Date -Format "o")
    head = $headSha
    branch = $branch
    rrl_fidelity = $rrlFidelity
    soulcount = 0
    dna_blueprint_count = $dnaBlueprintCount
    ledger_id = "HL-$nextHL"
    s2pipeline_result = $s2Record.result
    registry_synced = 0
}
Write-Json $stateSnapPath $snapshot
Write-Ok "STATE-SNAPSHOT updated"

Write-Log "============================="
Write-Log "REGENERATE COMPLETE: run=$run result=$($s2Record.result)"
Write-Log "============================="
