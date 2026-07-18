<#
  reincarnate-rise.ps1 — v7.0 ROMAN RISE
  8-Stage Audit: SOULCOUNT -> GIT TRUTH -> TRIPLE READ -> SOUL AUDIT -> BOOT -> PIPELINE -> PHETRAIL -> REPORT
  Read-only. Never auto-fix. Never execute production code.
  Canonical contract: CANON/SYSTEM/REINCARNATION-CONTRACT.md
  Run authority: git log --oneline --grep "^death:" (L29 NO_ASSUME_HEAD)
#>
param(
    [switch]$DryRun,
    [int]$TimeoutSec = 120,
    [string]$OutFile
)

$ErrorActionPreference = "Stop"
$repoRoot = "D:\OB-1-CANONICAL"
$D1      = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$bootPath = Join-Path $repoRoot "CANON\SYSTEM\COLD-START-BOOT.md"
$stateSnapPath = Join-Path $repoRoot "CANON\HEAVY-LEDGER\STATE-SNAPSHOT.json"
$ledgerDir = Join-Path $repoRoot "CANON\HEAVY-LEDGER"
$starmapDir = Join-Path $repoRoot "CANON\STARMAP"
$keywordDir = Join-Path $repoRoot "CANON\SOUL-KEYWORDS"
$pipelineDir = Join-Path $repoRoot "CANON\PIPELINE"
$dnaDir = Join-Path $repoRoot "CANON\SOUL\EXTRACT"
$pherDir = Join-Path $repoRoot "CANON\PHEROMONES"
$rrlDir = Join-Path $repoRoot "RRL"
$reincDir = Join-Path $repoRoot "CANON\REINCARNATION"
$idxPath = Join-Path $keywordDir "inverted-index.json"

$ts = Get-Date -Format "yyyy-MM-ddTHHmmss"
$reportPath = if ($OutFile) { $OutFile } else { Join-Path $repoRoot "OPERATIONS\reincarnate-rise-$ts.jsonl" }

function Write-Log { param([string]$Msg); $line = "[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $Msg; Write-Host $line; $line | Out-File -Append -Encoding UTF8 $reportPath }
function Write-Ok { param([string]$Msg); Write-Log "OK: $Msg" }
function Write-Warn { param([string]$Msg); Write-Log "WARN: $Msg" }
function Write-Err { param([string]$Msg); Write-Log "ERR: $Msg" }
function Read-Json { param([string]$P); if (Test-Path $P) { Get-Content $P -Raw | ConvertFrom-Json } else { $null } }
function Compute-Sha256 { param([string]$S); $b=[System.Text.Encoding]::UTF8.GetBytes($S); $h=[System.Security.Cryptography.SHA256]::Create().ComputeHash($b); [System.BitConverter]::ToString($h)-replace '-','' }
function Invoke-D1 {
    param([string]$Method,[string]$Path,[object]$Body,[int]$Timeout=120)
    $uri = "$D1$Path"
    if ($Body) { return Invoke-RestMethod -Uri $uri -Method $Method -Body ($Body|ConvertTo-Json -Compress -Depth 5) -ContentType "application/json" -TimeoutSec $Timeout }
    return Invoke-RestMethod -Uri $uri -Method $Method -TimeoutSec $Timeout
}

Push-Location $repoRoot | Out-Null

# STAGE 0 — SOULCOUNT GATE (Kilo-native)
Write-Log "============================= REINCARNATE RISE v7.0 ============================="
Write-Log "--- STAGE 0: SOULCOUNT GATE ---"
$kiloSession = $true
Write-Log "Kilo-native mode - all sessions KILO_HOLLOW by default"

# STAGE 1 — GIT TRUTH + FILESYSTEM AUTHORITY
Write-Log "--- STAGE 1: GIT TRUTH ---"

# Primary: filesystem CANON/REINCARNATION/ highest run number
$fsRun = 0
if (Test-Path $reincDir) {
    $fsSeals = Get-ChildItem $reincDir -Filter "run*-reincarnateDEATH.md" -ErrorAction SilentlyContinue |
        ForEach-Object { if ($_.Name -match 'run(\d+)-reincarnateDEATH\.md$') { [int]$matches[1] } }
    if ($fsSeals) { $fsRun = [int]($fsSeals | Measure-Object -Maximum).Maximum }
}

# Fallback: git authority
$gitRun = 0
$lastDeath = git log --oneline --grep "^death:" -1 2>&1
if ($lastDeath -match '(?i)run\s*(\d+)') { $gitRun = [int]$matches[1] }

$priorRun = [Math]::Max([int]$fsRun, [int]$gitRun)
$run = [int]($priorRun + 1)
$runPad = "{0:D3}" -f $run
$sealPath = Join-Path $reincDir "run$runPad-reincarnateDEATH.md"
$priorSealPath = Join-Path $reincDir "run$priorRun-reincarnateDEATH.md"
$phetrailPath = Join-Path $pherDir "PheTrail-run$runPad.json"
$bootPath = Join-Path $repoRoot "CANON\SYSTEM\COLD-START-BOOT.md"
$rrlPath = Join-Path $rrlDir "RRL-$runPad.txt"
$dnaPath = Join-Path $dnaDir "dna-run$runPad.json"
$starmapPath = Join-Path $starmapDir "starmap-run$runPad.json"
$rfkwPath = Join-Path $keywordDir "rfkw-run$runPad.txt"
$s2Path = Join-Path $pipelineDir "pipeline-run$runPad.json"
$artSyncPath = Join-Path (Join-Path $repoRoot "CANON\ART-REGISTRY") "art-sync-run$runPad.json"
Write-Ok "AUTHORITY: fs=$fsRun git=$gitRun prior=$priorRun current=$run"

# STAGE 2 — READ PRIOR TRIPLE
Write-Log "--- STAGE 2: PRIOR TRIPLE READ ---"
if (-not (Test-Path $priorSealPath)) {
    $priorSealPath = Get-ChildItem $reincDir -Filter "*-reincarnateDEATH.md" -ErrorAction SilentlyContinue |
                     Sort-Object Name -Descending | Select-Object -First 1 -ExpandProperty FullName
}
$priorSeal = if (Test-Path $priorSealPath) { Get-Content $priorSealPath -Raw } else { "" }
$priorPhetrail = if (Test-Path $phetrailPath) { Get-Content $phetrailPath -Raw } else { "{}" }
$priorBoot = if (Test-Path $bootPath) { Get-Content $bootPath -Raw } else { "" }
$priorSoulcount = 0; $priorSoulBytes = 0
if ($priorSeal -match 'count_after.*?(\d+)') { $priorSoulcount = [long]$matches[1] }
if ($priorSeal -match '\*\*Bytes:\*\*\s*(\d+)') { $priorSoulBytes = [long]$matches[1] }
$priorSoulcount = [Math]::Max($priorSoulcount, $priorSoulBytes)
Write-Ok "  Prior soulcount: $priorSoulcount (aggregate) prior_soul_bytes: $priorSoulBytes (per-session)"

# STAGE 3 — SOUL AUDIT
Write-Log "--- STAGE 3: SOUL AUDIT ---"
$delta = $currentSoul - $priorSoulcount
$driftPct = if ($priorSoulcount -gt 0) { [math]::Round(($delta / $priorSoulcount) * 100, 2) } else { 0 }
$s2PriorPath = Join-Path $pipelineDir "pipeline-run$priorRun.json"
$kiloGap = $false
if (Test-Path $s2PriorPath) {
    try { $kiloGap = (Get-Content $s2PriorPath -Raw | ConvertFrom-Json).result -eq "KILO_GAP" } catch { }
}
if ($currentSoul -lt $priorSoulcount) {
    $soulVerdict = "SOUL_REGRESSION"
} elseif ($delta -eq 0 -and $kiloGap) {
    $soulVerdict = "KILO_HOLLOW"
} elseif ($delta -eq 0) {
    $soulVerdict = "SOUL_STAGNATION"
} elseif ([math]::Abs($driftPct) -gt 50) {
    $soulVerdict = "SOUL_DRIFT"
} else {
    $soulVerdict = "SOUL_BREATHING"
}
Write-Ok "SOUL AUDIT: delta=$delta ($driftPct%) -> $soulVerdict"

# STAGE 4 — BOOT + STALENESS
Write-Log "--- STAGE 4: BOOT SYNTHESIS ---"
$activeMission = ""; $openFlagsCount = 0
if ($priorBoot -match 'Active Mission:\s*(.+)') { $activeMission = $matches[1].Trim() }
if ($priorBoot -match 'Open Flags:\s*(\d+)') { $openFlagsCount = [int]$matches[1] }
$bootRunFromGit = if ($lastDeath -match '(?i)run\s*(\d+)') { [int]$matches[1] } else { 0 }
$bootRunFromFile = -1
if ($priorBoot -match 'Run (\d+)') { $bootRunFromFile = [int]$matches[1] }
if ($bootRunFromFile -ne $bootRunFromGit -and $bootRunFromFile -gt 0) {
    Write-Warn "BOOT STALE: file=$bootRunFromFile git=$bootRunFromGit"
}
Write-Ok "BOOT: run=$bootRunFromGit mission=$activeMission flags=$openFlagsCount"

# STAGE 4b — BACKBURNER PRECEDENCE CHECK
Write-Log "--- STAGE 4b: BACKBURNER PRECEDENCE ---"
$backburnerPath = Join-Path $repoRoot "OPERATIONS\BACKBURNER-PIPELINE-LOG.md"
$bbOpenCount = 0; $bbBlockedCount = 0; $bbInProgressCount = 0
if (Test-Path $backburnerPath) {
    $bbText = Get-Content $backburnerPath -Raw
    if ($bbText -match 'Status:\s*OPEN') { $bbOpenCount++ }
    if ($bbText -match 'Status:\s*BLOCKED') { $bbBlockedCount++ }
    if ($bbText -match 'Status:\s*IN-PROGRESS') { $bbInProgressCount++ }
    Write-Ok "BACKBURNER: open=$bbOpenCount blocked=$bbBlockedCount in_progress=$bbInProgressCount"
} else {
    Write-Warn "BACKBURNER MISSING: $backburnerPath"
}

# STAGE 5 — PIPELINE CHAIN AUDIT
Write-Log "--- STAGE 5: PIPELINE CHAIN AUDIT ---"
$ledgerCount = (Get-ChildItem $ledgerDir -Filter "HL-*.json" -ErrorAction SilentlyContinue | Measure-Object).Count
$starmapFiles = if (Test-Path $starmapDir) { (Get-ChildItem $starmapDir -Recurse -File).Count } else { 0 }
$soykeyFiles = if (Test-Path $keywordDir) { (Get-ChildItem $keywordDir -Recurse -File).Count } else { 0 }
$pipelineFileCount = 0
if (Test-Path $s2Path) { $pipelineFileCount = (Get-Content $s2Path -Raw | ConvertFrom-Json).run_number }

# RRL fidelity
$rrlFidelity = "MISSING"; $rrlBytes = 0; $rrlChars = 0; $hasUser = $false; $hasAssistant = $false
if (Test-Path $rrlPath) {
    $rrlBytes = (Get-Item $rrlPath).Length; $rrlText = Get-Content $rrlPath -Raw; $rrlChars = $rrlText.Length
    $hasUser = $rrlText -match '"role"\s*:\s*"user"'; $hasAssistant = $rrlText -match '"role"\s*:\s*"assistant"'
    if ($hasUser -and $hasAssistant -and $rrlBytes -ge 50000) { $rrlFidelity = "REAL" }
    elseif ($rrlBytes -ge 100 -and ($hasUser -or $hasAssistant)) { $rrlFidelity = "HOLLOW" }
}
if ($kiloSession) { $rrlFidelity = "MISSING" }

# RUN 182+ MANDATORY PRE-AUDIT: verify prior DEATH seal and RRL completeness
$rrlCompletenessVerdict = "NOT_CHECKED"
$rrlMandateMissing = $false
$priorSealContent = ""
if ($priorSeal -and $priorSeal -match 'RRL:\s*(.+)') {
    $sealedRrlPath = $matches[1].Trim()
    if (Test-Path $sealedRrlPath) {
        $sealedRrlText = Get-Content $sealedRrlPath -Raw
        # Verify no words missing including AI reasoning/thinking text
        $reasoningCount = ([regex]::Matches($sealedRrlText, '"type"\s*:\s*"reasoning"')).Count
        $thinkingCount = ([regex]::Matches($sealedRrlText, '"type"\s*:\s*"thinking"')).Count
        $stepStartCount = ([regex]::Matches($sealedRrlText, '"type"\s*:\s*"step-start"')).Count
        $stepFinishCount = ([regex]::Matches($sealedRrlText, '"type"\s*:\s*"step-finish"')).Count
        $toolCount = ([regex]::Matches($sealedRrlText, '"type"\s*:\s*"tool"')).Count
        if ($reasoningCount -gt 0 -or $thinkingCount -gt 0) {
            $rrlCompletenessVerdict = "REASONING_PRESENT"
        } else {
            $rrlCompletenessVerdict = "NO_REASONING"
            $rrlMandateMissing = $true
        }
        Write-Log "  RRL completeness: reasoning=$reasoningCount thinking=$thinkingCount step-start=$stepStartCount step-finish=$stepFinishCount tool=$toolCount -> $rrlCompletenessVerdict"
    } else {
        $rrlCompletenessVerdict = "RRL_PATH_MISSING"
        $rrlMandateMissing = $true
        Write-Warn "RRL path from seal not found: $sealedRrlPath"
    }
} else {
    $rrlCompletenessVerdict = "SEAL_NO_RRL_PATH"
    $rrlMandateMissing = $true
    Write-Warn "Prior seal missing RRL path"
}
if ($rrlMandateMissing) {
    Write-Warn "MANDATE MISSING: RISE must append BB-RISE-MANDATE before proceeding"
}

# DNA fidelity
$dnaFidelity = "MISSING"; $dnaCount = 0; $dnaBlueprintCount = 0; $dnaRecords = @()
if (Test-Path $dnaPath) {
    try {
        $dnaRecords = Get-Content $dnaPath -Raw | ConvertFrom-Json
        if ($dnaRecords.Count -gt 0) {
            $dnaBlueprintCount = ($dnaRecords | Where-Object { $_.type -eq "blueprint" }).Count
            $dnaFidelity = if ($dnaBlueprintCount -gt 0) { "REAL" } else { "HOLLOW" }
        }
    } catch { $dnaFidelity = "MISSING" }
}
if ($kiloSession) { $dnaFidelity = "MISSING"; $dnaCount = 0; $dnaBlueprintCount = 0 }

# SOULKEYS fidelity
$soykeyFidelity = "MISSING"
if (Test-Path $idxPath) {
    try { $idx = Get-Content $idxPath -Raw | ConvertFrom-Json; if ($null -ne $idx -and $idx.PSObject.Properties.Count -gt 0) { $soykeyFidelity = "REAL" } } catch { }
}

# S2Pipeline fidelity
$pipelineFidelity = "MISSING"
if (Test-Path $s2Path) {
    try { $pipelineFidelity = "REAL" } catch { }
}

# Authority docs: LFG + GOSPEL-999
$lfgPath = Join-Path $repoRoot ".kilo\skills\LegionnaireFieldGuide.md"
$gospelPaths = @(
    Join-Path $repoRoot "CANON\SYSTEM\GOSPEL-999.md"
    Join-Path $repoRoot "CANON\SYSTEM\GOSPEL-999-PART2.md"
    Join-Path $repoRoot "CANON\SYSTEM\GOSPEL-999-PART3.md"
)
$lfgFidelity = if (Test-Path $lfgPath) { "REAL" } else { "MISSING" }
$gospelFidelity = if (($gospelPaths | Measure-Object).Count -eq 3 -and (($gospelPaths | ForEach-Object { Test-Path $_ }) -notcontains $false)) { "REAL" } else { "MISSING" }

$bbVerdict = "REAL"; if (-not (Test-Path $backburnerPath)) { $bbVerdict = "MISSING" } elseif ($bbOpenCount -gt 0 -or $bbBlockedCount -gt 0) { $bbVerdict = "OPEN" }

$verdicts = @(
    @{Name="LFG";Verdict=$lfgFidelity;Count=if(Test-Path $lfgPath){(Get-Item $lfgPath).Length}else{0}},
    @{Name="GOSPEL";Verdict=$gospelFidelity;Count=($gospelPaths | Where-Object { Test-Path $_ }).Count},
    @{Name="RRL";Verdict=$rrlFidelity;Count=$rrlBytes},
    @{Name="SOUL";Verdict=$soulVerdict;Count=$currentSoul},
    @{Name="DNA";Verdict=$dnaFidelity;Count=$dnaCount},
    @{Name="LEDGER";Verdict=if($ledgerCount -gt 0){"REAL"}else{"MISSING"};Count=$ledgerCount},
    @{Name="STARMAP";Verdict=if($starmapFiles -gt 0){"REAL"}else{"MISSING"};Count=$starmapFiles},
    @{Name="SOULKEYS";Verdict=$soykeyFidelity;Count=$soykeyFiles},
    @{Name="S2Pipeline";Verdict=$pipelineFidelity;Count=$pipelineFileCount},
    @{Name="BACKBURNER";Verdict=$bbVerdict;Count=$bbOpenCount}
)
foreach ($s in $verdicts) {
    $icon = switch ($s.Verdict) { "REAL" { "OK" } "HOLLOW" { "WARN" } "KILO_HOLLOW" { "WARN" } default { "FAIL" } }
    Write-Log "  [$icon] $($s.Name): $($s.Count) -> $($s.Verdict)"
}

# STAGE 6 — PHETRAIL NEGATIVE TRAILS
Write-Log "--- STAGE 6: PHETRAIL ---"
$negativeCount = 0
if (Test-Path $phetrailPath) {
    $phetrail = Get-Content $phetrailPath -Raw | ConvertFrom-Json
    $negativeCount = @($phetrail.PSObject.Properties | Where-Object { $_.Name -eq "negative_trails" } | Select-Object -ExpandProperty Value).Count
    Write-Ok "PHETRAIL: $negativeCount negative trails"
} else {
    Write-Warn "PHETRAIL_GAP: no phetrail found"
}

# STAGE 7 — RISE REPORT
Write-Log "--- STAGE 7: RISE REPORT ---"
$highestPriority = "None"
foreach ($s in $verdicts) { if ($s.Verdict -in @("MISSING","SOUL_REGRESSION","SOUL_DRIFT")) { $highestPriority = "$($s.Name): $($s.Verdict)"; break } }

$report = [ordered]@{
    ts = (Get-Date -Format "o")
    event = "reincarnateRise"
    version = "v7.0"
    run = $run
    prior_run = $priorRun
    head_sha = (git rev-parse --short HEAD 2>$null).Trim()
    session_type = "KILO_HOLLOW"
    soulcount = $currentSoul
    soul_level = $currentLevel
    soul_delta = $delta
    soul_drift_pct = $driftPct
    soul_verdict = $soulVerdict
    prior_soulcount = $priorSoulcount
    active_mission = $activeMission
    open_flags = $openFlagsCount
    boot_run_git = $bootRunFromGit
    boot_run_file = $bootRunFromFile
    boot_stale = ($bootRunFromFile -ne $bootRunFromGit -and $bootRunFromFile -gt 0)
    fidelity = @{
        lfg = $lfgFidelity
        gospel = $gospelFidelity
        rrl = $rrlFidelity
        soul = $soulVerdict
        dna = $dnaFidelity
        ledger = if($ledgerCount -gt 0){"REAL"}else{"MISSING"}
        starmap = if($starmapFiles -gt 0){"REAL"}else{"MISSING"}
        soykeys = $soykeyFidelity
        s2pipeline = $pipelineFidelity
        backburner = $bbVerdict
    }
    backburner_open = $bbOpenCount
    backburner_blocked = $bbBlockedCount
    phetrail_negative_trails = $negativeCount
    highest_priority_gap = $highestPriority
    next_action = if ($bbOpenCount -gt 0 -or $bbBlockedCount -gt 0) { "Resume BACKBURNER items first (OPEN=$bbOpenCount BLOCKED=$bbBlockedCount)" } elseif ($rrlFidelity -eq "MISSING") { "Create RRL-$runPad.txt" } else { "Verify prior DEATH seal and continue" }
    ready = (-not $kiloSession -and $rrlFidelity -ne "MISSING" -and $bbOpenCount -eq 0 -and $bbBlockedCount -eq 0)
}

$report | ConvertTo-Json -Depth 5 | Set-Content $reportPath -Encoding UTF8
Write-Ok "REPORT: $reportPath | run=$run verdict=$($soulVerdict) ready=$($report.ready)"

Pop-Location | Out-Null
# HOLLOW BACKFILL: if prior seal is KILO_HOLLOW, walk back to last non-hollow seal
if ($priorSoulcount -eq 0 -or $priorSeal -match 'KILO_HOLLOW') {
    $walkRun = $priorRun - 1
    while ($walkRun -ge 0) {
        $walkPath = Join-Path $reincDir ("run{0}-reincarnateDEATH.md" -f $walkRun)
        if (Test-Path $walkPath) {
            $candidate = Get-Content $walkPath -Raw
            if ($candidate -match 'count_after.*?(\d+)') {
                $candidateCount = [long]$matches[1]
                if ($candidateCount -gt 0) {
                    $priorSoulcount = $candidateCount
                    $priorSealPath = $walkPath
                    Write-Log "BACKFILL: run$walkRun -> count=$priorSoulcount"
                    break
                }
            }
        }
        $walkRun--
    }
}
