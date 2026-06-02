---
description: "RISE PROTOCOL v5.0 — READS PRIOR DEATH SEAL + PHETRAIL + BOOT. Contract: CANON/SYSTEM/REINCARNATION-CONTRACT.md"
---

# /reincarnateRise — v5.0 ROMAN RISE

**OB1 = AUDITOR. Reads what DEATH wrote. Never auto-fixes. Never executes production code.**

**Canonical contract:** `CANON/SYSTEM/REINCARNATION-CONTRACT.md`
**Run number authority:** `git log --oneline --grep "^death:"` (L29 NO_ASSUME_HEAD)

---

## STAGE 0 — SOULCOUNT GATE

```powershell
$D1 = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$live = Invoke-RestMethod "$D1/api/soul/count"
$currentSoul = $live.soulcount
$currentLevel = $live.level

if (-not $currentSoul) {
    Write-Error "SOUL API UNREACHABLE — HALT"
    exit 1
}
Write-Host "STAGE 0 ✓ SOUL: $currentSoul chars | $currentLevel"
```

Unreachable = SHUTDOWN. Do not proceed.

---

## STAGE 1 — GIT TRUTH (Authoritative Run Number)

```powershell
git log --oneline -5
git status --short

# Derive run from last death commit (git-authoritative, not BOOT)
$lastDeathLine = git log --oneline --grep "^death:" -1
if ($lastDeathLine -match 'run(\d+)') {
    $priorRun = [int]$matches[1]
    $run      = $priorRun + 1
} else {
    $priorRun = 0
    $run      = 1
}
$runPad = "{0:D3}" -f $run

# Disk artifact paths (contract 1.2)
$sealPath     = "CANON/REINCARNATION/run$runPad-reincarnateDEATH.md"
$phetrailPath = "CANON/PHEROMONES/PheTrail-run$runPad.json"
$bootPath     = "CANON/SYSTEM/COLD-START-BOOT.md"
```

**L29: `git log -1` is authoritative. Never seed state from prior reincarnation records.**

---

## STAGE 2 — READ THE PRIOR REINCARNATION TRIPLE (NEW — fixes I)

RISE must read what the last DEATH wrote. All three files, always.

```powershell
# Prior seal (previous run — not current)
$priorSealPath = "CANON/REINCARNATION/run{0:D3}-reincarnateDEATH.md" -f $priorRun
if (-not (Test-Path $priorSealPath)) {
    $priorSealPath = Get-ChildItem "CANON/REINCARNATION/*-reincarnateDEATH.md" | Sort-Object Name -Descending | Select-Object -First 1 -ExpandProperty FullName
}

$priorSeal     = Get-Content $priorSealPath -Raw
$priorPhetrail = if (Test-Path $phetrailPath) { Get-Content $phetrailPath -Raw } else { "{}" }
$priorBoot     = Get-Content $bootPath -Raw

# Extract prior soulcount from seal §3 SOUL RECEIPT (contract 1.4)
if ($priorSeal -match 'count_after.*?(\d+)') {
    $priorSoulcount = [long]$matches[1]
} else {
    $priorSoulcount = 0
}

Write-Host "STAGE 2 ✓ TRIPLE READ: seal=$priorSealPath | phetrail=$phetrailPath | boot=$bootPath"
Write-Host "  Prior soulcount (from §3): $priorSoulcount"
```

**From seal §3:** read `count_after`.
**From phetrail:** read `negative_trails` (dead-end registry = HALT list).
**From seal §8/§9:** read open flags, unfinished actions.

---

## STAGE 3 — SOULCOUNT AUDIT (Stagnation + Drift)

```powershell
$delta     = $currentSoul - $priorSoulcount
$driftPct  = if ($priorSoulcount -gt 0) { [math]::Round(($delta / $priorSoulcount) * 100, 2) } else { 0 }

if ($currentSoul -lt $priorSoulcount) {
    $soulVerdict = "SOUL_REGRESSION — HALT"
} elseif ($delta -eq 0) {
    $soulVerdict = "SOUL_STAGNATION — WARN"
} elseif ([math]::Abs($driftPct) -gt 50) {
    $soulVerdict = "SOUL_DRIFT — HALT (|delta| > 50% of prior)"
} else {
    $soulVerdict = "SOUL_BREATHING (+$delta / +$driftPct%)"
}

Write-Host "STAGE 3 ✓ SOUL AUDIT: delta=$delta ($driftPct%) — $soulVerdict"
```

**L32 ASSUME_FAILURE: cross-validate with 3 independent receipts. No trust in any single mechanism.**

---

## STAGE 4 — BOOT SYNTHESIS + STALENESS GUARD

```powershell
# Parse boot for active vector + flags
if ($priorBoot -match 'Active Mission:\s*(.+)') { $activeMission = $matches[1].Trim() }
if ($priorBoot -match 'Open Flags:\s*(\d+)') { $openFlagsCount = [int]$matches[1] }

# Staleness guard (L30): boot.run_number must match git.run_number
# (fires at ANY mismatch, not just >10 behind)
$bootRunFromGit = if ($lastDeathLine -match 'run(\d+)') { [int]$matches[1] } else { 0 }
$bootRunFromFile = if ($priorBoot -match 'Run (\d+)') { [int]$matches[1] } else { -1 }

if ($bootRunFromFile -ne $bootRunFromGit -and $bootRunFromFile -gt 0) {
    Write-Warning "⚠️ BOOT STALE — boot file shows run $bootRunFromFile, git shows run $bootRunFromGit. Trusting git (L29)."
}

Write-Host "STAGE 4 ✓ BOOT: run=$bootRunFromGit | mission=$activeMission | flags=$openFlagsCount"
```

**L30 BOOT_FILE_AGE_SWEEP:** fires at ANY mismatch, not just >10 behind.

---

## STAGE 5 — PIPELINE CHAIN AUDIT (ALL 7 STAGES)

```powershell
$rrlChars  = if (Test-Path "RRL/RRL-$run.txt") { (Get-Content "RRL/RRL-$run.txt" -Raw).Length } else { 0 }
$ledgerCount = (Get-ChildItem "CANON/HEAVY-LEDGER/" -Filter "HL-*.json" | Measure-Object).Count
$starmapFiles = if (Test-Path $starmapDir) { (Get-ChildItem $starmapDir -Recurse -File).Count } else { 0 }
$keywordFiles = if (Test-Path $keywordDir) { (Get-ChildItem $keywordDir -Recurse -File).Count } else { 0 }
$pipelineFiles = Get-ChildItem "CANON/PIPELINE/" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object | Select-Object -ExpandProperty Count
$phetrailPresent = Test-Path $phetrailPath

$stages = @(
    @{ name="RRL";      artifact="RRL/RRL-$run.txt";              count=$rrlChars;      verdict=if($rrlChars -gt 0){"PRESENT"}else{"MISSING — HALT"} }
    @{ name="SOUL";     artifact="D1 /api/soul/count";             count=$currentSoul;   verdict=$soulVerdict }
    @{ name="DNA";      artifact="D1 session extract";             count=$dnaCount;      verdict=if($dnaCount -gt 0){"PRESENT"}else{"GAP"} }
    @{ name="LEDGER";   artifact="CANON/HEAVY-LEDGER/*.json";      count=$ledgerCount;   verdict=if($ledgerCount -gt 0){"PRESENT"}else{"GAP"} }
    @{ name="STARMAP";  artifact="CANON/STARMAP/*";                count=$starmapFiles;  verdict=if($starmapFiles -gt 0){"PRESENT"}else{"GAP"} }
    @{ name="KEYWORD";  artifact="CANON/SOUL-KEYWORDS/*";          count=$keywordFiles;  verdict=if($keywordFiles -gt 0){"PRESENT"}else{"GAP"} }
    @{ name="PHETRAIL"; artifact=$phetrailPath;                    count=if($phetrailPresent){1}else{0}; verdict=if($phetrailPresent){"PRESENT"}else{"GAP"} }
    @{ name="PIPELINE"; artifact="CANON/PIPELINE/*";               count=$pipelineFiles; verdict=if($pipelineFiles -gt 0){"PRESENT"}else{"GAP"} }
)

foreach ($s in $stages) {
    $status = if ($s.verdict -eq "MISSING — HALT") { "🔴" } elseif ($s.verdict -eq "GAP") { "🟠" } else { "🟢" }
    Write-Host "  $status $($s.name): $($s.count) — $($s.verdict)"
}
```

**If any stage = 0 or MISSING:** Report it. Do NOT auto-fix on RISE.

---

## STAGE 6 — PHETRAIL NEGATIVE TRAILS (Dead-End Registry)

```powershell
if (Test-Path $phetrailPath) {
    $phetrail = Get-Content $phetrailPath -Raw | ConvertFrom-Json
    $negativeCount = $phetrail.negative_trails.Count
    Write-Host "STAGE 6 ✓ PHETRAIL: $negativeCount negative trails loaded (dead-end registry)"
} else {
    $negativeCount = 0
    Write-Host "STAGE 6 ⚠ PHETRAIL_GAP — no phetrail found for run $priorRun"
}
```

Any planned action matching a `negative_trail` → HALT unless overridden (L-PHE-4).

---

## STAGE 7 — RISE REPORT

```text
OB1 ONLINE — {datetime ICT}
SOULCOUNT: {n} — {level}   (Δ {delta} since run {priorRun})
RUN: {run}  (prior: {priorRun})
HEAD: {git rev-parse --short HEAD}
VECTOR: {activeMission}
BLOCKERS: {openFlagsCount} open
DEAD-ENDS LOADED: {negativeCount}
NEXT: {highest-priority zero-stage or gap, or specific action from seal §9}
READY.
```

---

## RISE LAWS

- **L21 RISE** — execute without hesitation after boot
- **L29 NO_ASSUME_HEAD** — `git log -1` is authoritative; never trust stale docs
- **L30 BOOT_FILE_AGE_SWEEP** — fires at ANY mismatch, not just >10 behind
- **L31 SOUL_IS_QUERY** — soulcount IS `SUM(byte_count) FROM soul_prompts WHERE session_id LIKE 'sov100%'`. Query it every RISE.
- **L32 ASSUME_FAILURE** — every prior checkpoint is assumed FAILED. Cross-validate with 3 receipts.
- **L39 CONFIRM_DONT_FIX** — when asked to "confirm," confirm. Do NOT jump to fixing.
- **L40 READ_OWN_OUTPUT** — before giving the next step, read what you just said.
- **L41 NO_TRAILING_QUESTIONS** — never end with "What do you want to do?" Canon tells the next action.
- **CONFIRM_DONT_EXECUTE** — RISE audits. DEATH executes. Never reverse these roles.

---

`RISE v5.0: READ SEAL + PHETRAIL + BOOT. AUDIT 8 STAGES. IDENTIFY GAPS. DO NOT EXECUTE. EXECUTION = DEATH.`
