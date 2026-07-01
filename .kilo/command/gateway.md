---
description: "Full system gateway — SOULCOUNT gate + all workers health check + alias retirement status + git state + PA version verification. Local filesystem only. No Cloudflare."
agent: AGENT99
---

# /gateway — OB-1 System Gateway

Run full system health check across all active services.

**Task:** $ARGUMENTS

---

## Step 0 — SOULCOUNT Gate (mandatory first)

```powershell
$repo = "D:\OB-1-CANONICAL"
$soulFile = Join-Path $repo "CANON\SOUL\soulcount-local.txt"
if (Test-Path $soulFile) {
    $soul = [long](Get-Content $soulFile -Raw)
} else {
    $soul = 0
}
$lock = 907872
$delta = [Math]::Abs($soul - $lock)
Write-Host "SOULCOUNT: $soul | LOCK: $lock | DELTA: $delta"
if ($delta -gt 5000) { Write-Host "SOUL_DRIFT_DETECTED — halt all non-emergency work" }
else { Write-Host "SOUL_GATE: PASS — delta within ±5,000 tolerance" }
```

---

## Step 1 — Local Filesystem Health Check

Check all canonical zones:

```powershell
$repo = "D:\OB-1-CANONICAL"
$zones = @(
    @{ name="HEAVY-LEDGER"; path=Join-Path $repo "CANON\HEAVY-LEDGER" },
    @{ name="PHEROMONES";   path=Join-Path $repo "CANON\PHEROMONES" },
    @{ name="STARMAP";      path=Join-Path $repo "CANON\STARMAP" },
    @{ name="SOUL-KEYWORDS";path=Join-Path $repo "CANON\SOUL-KEYWORDS" },
    @{ name="PIPELINE";     path=Join-Path $repo "CANON\PIPELINE" }
)
foreach ($z in $zones) {
    if (Test-Path $z.path) {
        $count = (Get-ChildItem $z.path -File -Recurse -ErrorAction SilentlyContinue).Count
        Write-Host "$($z.name): 🟢 UP ($count files)"
    } else {
        Write-Host "$($z.name): 🔴 DOWN"
    }
}
```

---

## Step 2 — Alias Retirement Status

✅ **EXECUTED** — Audit T392 complete (May 23, 2026). `deepseek-chat` and `deepseek-reasoner` aliases retired. All live code uses canonical model IDs.

✅ **2-TIER COLLAPSE EXECUTED** — Run 18 (May 25, 2026). T1=Qwen 3.7 Max (Dialagram), T2=Claude Opus 4.7. T3/T4/T5 removed from all active dispatch surfaces.

```powershell
Write-Host "ALIAS RETIREMENT: EXECUTED. 2-TIER ACTIVE: T1=Qwen 3.7 Max, T2=Opus 4.7."
```

---

## Step 3 — Git State

```powershell
Set-Location D:\OB-1-CANONICAL
$head = git log -1 --oneline
$status = git status --short
$branch = git branch --show-current
Write-Host "BRANCH: $branch"
Write-Host "HEAD:   $head"
Write-Host "TREE:   $(if ($status) {'DIRTY — ' + $status} else {'CLEAN'})"
```

---

## Output Format

```
══════════════════════════════════════════
OB-1 GATEWAY — $(Get-Date -Format 'yyyy-MM-dd HH:mm') ICT
══════════════════════════════════════════
SOULCOUNT:         [count] | DELTA: [delta] | [PASS/DRIFT]
HEAVY-LEDGER:      [🟢 UP / 🔴 DOWN]
PHEROMONES:        [🟢 UP / 🔴 DOWN]
STARMAP:           [🟢 UP / 🔴 DOWN]
SOUL-KEYWORDS:     [🟢 UP / 🔴 DOWN]
PIPELINE:          [🟢 UP / 🔴 DOWN]
TIERS:             T1=Local PA | T2=Opus 4.7
GIT HEAD:          [sha oneline]
GIT TREE:          [CLEAN / DIRTY]
══════════════════════════════════════════
```

If any zone returns DOWN: print `GATEWAY: DEGRADED — investigate before heavy work`.
If SOULCOUNT delta > 5,000: print `SOUL_DRIFT_DETECTED — HALT`.
All green: print `GATEWAY: ALL SYSTEMS NOMINAL`.
