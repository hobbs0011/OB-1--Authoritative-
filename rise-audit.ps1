$ErrorActionPreference='SilentlyContinue'
$D1 = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$live = Invoke-RestMethod "$D1/api/soul/count"
$currentSoul = $live.soulcount
$currentLevel = $live.level
if (-not $currentSoul) { Write-Error "SOUL API UNREACHABLE -- HALT"; exit 1 }
Write-Host "STAGE 0 OK: SOUL=$currentSoul LEVEL=$currentLevel"
$lastDeathLine = git log --oneline --grep "^death:" -1
$m = [regex]::Match($lastDeathLine, 'run(\d+)')
$priorRun = if ($m.Success) { [int]$m.Groups[1].Value } else { 0 }
$run = $priorRun + 1
$runPad = "{0:D3}" -f $run
$sealPath = "CANON/REINCARNATION/run$runPad-reincarnateDEATH.md"
$phetrailPath = "CANON/PHEROMONES/PheTrail-run$runPad.json"
$bootPath = "CANON/SYSTEM/COLD-START-BOOT.md"
Write-Host "STAGE 1 OK: run=$run priorRun=$priorRun runPad=$runPad"
$priorSealPath = "CANON/REINCARNATION/run{0:D3}-reincarnateDEATH.md" -f $priorRun
if (-not (Test-Path $priorSealPath)) {
  $candidates = Get-ChildItem "CANON/REINCARNATION/*-reincarnateDEATH.md" -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
  if ($candidates) { $priorSealPath = $candidates.FullName }
}
$priorSeal = if (Test-Path $priorSealPath) { Get-Content $priorSealPath -Raw } else { "" }
$priorPhetrail = if (Test-Path $phetrailPath) { Get-Content $phetrailPath -Raw } else { "{}" }
$priorBoot = if (Test-Path $bootPath) { Get-Content $bootPath -Raw } else { "" }
$sm = [regex]::Match($priorSeal, 'count_after.*?(\d+)')
$priorSoulcount = if ($sm.Success) { [long]$sm.Groups[1].Value } else { 0 }
Write-Host "STAGE 2 OK: priorSoulcount=$priorSoulcount"
$delta = $currentSoul - $priorSoulcount
$driftPct = if ($priorSoulcount -gt 0) { [math]::Round(($delta / $priorSoulcount) * 100, 2) } else { 0 }
$s2PathKilo = "CANON/PIPELINE/pipeline-run$priorRun.json"
$kiloGap = $false
if (Test-Path $s2PathKilo) {
  try { $kiloGap = (Get-Content $s2PathKilo -Raw | ConvertFrom-Json).result -eq "KILO_GAP" } catch {}
}
if ($currentSoul -lt $priorSoulcount) { $soulVerdict = "SOUL_REGRESSION -- HALT" }
elseif ($delta -eq 0 -and $kiloGap) { $soulVerdict = "KILO_HOLLOW -- DRYRUN session (expected, no alarm)" }
elseif ($delta -eq 0) { $soulVerdict = "SOUL_STAGNATION -- WARN" }
elseif ([math]::Abs($driftPct) -gt 50) { $soulVerdict = "SOUL_DRIFT -- HALT (|delta| > 50% of prior)" }
else { $soulVerdict = "SOUL_BREATHING (+$delta / +$driftPct%)" }
Write-Host "STAGE 3 OK: delta=$delta ($driftPct%) => $soulVerdict"
$m2 = [regex]::Match($priorBoot, 'Active Mission:\s*(.+)')
$activeMission = if ($m2.Success) { $m2.Groups[1].Value.Trim() } else { "" }
$m3 = [regex]::Match($priorBoot, 'Open Flags:\s*(\d+)')
$openFlagsCount = if ($m3.Success) { [int]$m3.Groups[1].Value } else { -1 }
$bootRunFromGit = if ($lastDeathLine -match 'run(\d+)') { [int]$matches[1] } else { 0 }
$bootRunFromFile = if ($priorBoot -match 'Run (\d+)') { [int]$matches[1] } else { -1 }
if ($bootRunFromFile -ne $bootRunFromGit -and $bootRunFromFile -gt 0) {
  Write-Warning "BOOT STALE -- boot file shows run $bootRunFromFile, git shows run $bootRunFromGit. Trusting git."
}
Write-Host "STAGE 4 OK: run=$bootRunFromGit mission='$activeMission' flags=$openFlagsCount"
$rrlPath = "RRL/RRL-$run.txt"
$ledgerCount = (Get-ChildItem "CANON/HEAVY-LEDGER/" -Filter "HL-*.json" -ErrorAction SilentlyContinue | Measure-Object).Count
$starmapFiles = if (Test-Path "CANON/STARMAP") { (Get-ChildItem "CANON/STARMAP" -Recurse -File | Measure-Object).Count } else { 0 }
$soykeyDir = "CANON/SOUL-KEYWORDS"
$soykeyFiles = if (Test-Path $soykeyDir) { (Get-ChildItem $soykeyDir -Recurse -File | Measure-Object).Count } else { 0 }
$rrlFidelity = "MISSING"
if (Test-Path $rrlPath) {
  $rrlBytes = (Get-Item $rrlPath).Length
  $rrlText = Get-Content $rrlPath -Raw
  $hasUser = $rrlText -match '"role"\s*:\s*"user"'
  $hasAssistant = $rrlText -match '"role"\s*:\s*"assistant"'
  if ($rrlBytes -ge 50000 -and $hasUser -and $hasAssistant) { $rrlFidelity = "REAL" }
  elseif ($rrlBytes -ge 100 -and ($hasUser -or $hasAssistant)) { $rrlFidelity = "HOLLOW" }
}
$dnaFidelity = "MISSING"
$dnaRunPath = "CANON/SOUL/EXTRACT/dna-run$run.json"
$dnaRecords = @()
if (Test-Path $dnaRunPath) {
  try {
    $dnaRecords = Get-Content $dnaRunPath -Raw | ConvertFrom-Json
    $bpCount = ($dnaRecords | Where-Object { $_.type -eq "blueprint" }).Count
    if ($dnaRecords.Count -gt 0 -and $bpCount -gt 0) { $dnaFidelity = "REAL" }
    elseif ($dnaRecords.Count -gt 0) { $dnaFidelity = "HOLLOW" }
  } catch { $dnaFidelity = "MISSING" }
}
$soykeyFidelity = "MISSING"
$idxPath = "$soykeyDir/inverted-index.json"
if (Test-Path $idxPath) {
  try { $idx = Get-Content $idxPath -Raw | ConvertFrom-Json -AsHashtable; if ($idx.Count -gt 0) { $soykeyFidelity = "REAL" } } catch {}
}
$pipelineFidelity = "MISSING"
$s2Path = "CANON/PIPELINE/pipeline-run$run.json"
if (Test-Path $s2Path) { $pipelineFidelity = "REAL" }
$pipelineFiles = if (Test-Path "CANON/PIPELINE/") { (Get-ChildItem "CANON/PIPELINE/" -Recurse -File | Measure-Object).Count } else { 0 }
Write-Host "STAGE 5 OK:"
$items = @(
  @{N="RRL"; C=if(Test-Path $rrlPath){(Get-Content $rrlPath -Raw).Length}else{0}; V=$rrlFidelity},
  @{N="SOUL"; C=$currentSoul; V=$soulVerdict},
  @{N="DNA"; C=if($dnaFidelity -ne "MISSING"){$dnaRecords.Count}else{0}; V=$dnaFidelity},
  @{N="LEDGER"; C=$ledgerCount; V=if($ledgerCount -gt 0){"REAL"}else{"MISSING"}},
  @{N="STARMAP"; C=$starmapFiles; V=if($starmapFiles -gt 0){"REAL"}else{"MISSING"}},
  @{N="SOULKEYS"; C=$soykeyFiles; V=$soykeyFidelity},
  @{N="S2Pipeline"; C=$pipelineFiles; V=$pipelineFidelity}
)
foreach ($s in $items) {
  $icon = switch ($s.V) { "REAL" { "+" } "HOLLOW" { "~" } "MISSING" { "!" } default { "?" } }
  Write-Host ("  {0} {1}: {2} -> {3}" -f $icon, $s.N, $s.C, $s.V)
}
$negativeCount = 0
if (Test-Path $phetrailPath) {
  try { $phetrail = Get-Content $phetrailPath -Raw | ConvertFrom-Json; $negativeCount = $phetrail.negative_trails.Count } catch {}
  Write-Host "STAGE 6 OK: negative=$negativeCount"
} else {
  Write-Host "STAGE 6 GAP: no phetrail found"
}
$head = git rev-parse --short HEAD
$next = "DEATH must create seal + phetrail for run$runPad"
Write-Host "RISE COMPLETE run=$run head=$head"
