---
description: "Full system gateway â€” SOULCOUNT gate + all workers health check + alias retirement status + git state + PA version verification. Local filesystem only. No Cloudflare."
agent: AGENT99
---

# /gateway â€” OB-1 System Gateway

Run full system health check across all active services.

**Task:** $ARGUMENTS

---

## Step 0 â€” SOULCOUNT Gate (mandatory first)

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
if ($delta -gt 5000) { Write-Host "SOUL_DRIFT_DETECTED â€” halt all non-emergency work" }
else { Write-Host "SOUL_GATE: PASS â€” delta within Â±5,000 tolerance" }
```

---

## Step 1 â€” Local Filesystem Health Check

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
        Write-Host "$($z.name): ðŸŸ¢ UP ($count files)"
    } else {
        Write-Host "$($z.name): ðŸ”´ DOWN"
    }
}
```

---

## Step 2 â€” Alias Retirement Status

âœ… **EXECUTED** â€” Audit T392 complete (May 23, 2026). `deepseek-v4-flash` and `deepseek-v4-pro` aliases retired. All live code uses canonical model IDs.

âœ… **2-TIER COLLAPSE EXECUTED** â€” Run 18 (May 25, 2026). T1=Primary Workhorse, T2=Claude Opus 4.7. T3/T4/T5 removed from all active dispatch surfaces.

```powershell
Write-Host "ALIAS RETIREMENT: EXECUTED. 2-TIER ACTIVE: T1=Qwen 3.7 Max, T2=Opus 4.7."
```

---

## Step 3 â€” Git State

```powershell
Set-Location D:\OB-1-CANONICAL
$head = git log -1 --oneline
$status = git status --short
$branch = git branch --show-current
Write-Host "BRANCH: $branch"
Write-Host "HEAD:   $head"
Write-Host "TREE:   $(if ($status) {'DIRTY â€” ' + $status} else {'CLEAN'})"
```

---

## Output Format

```
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
OB-1 GATEWAY â€” $(Get-Date -Format 'yyyy-MM-dd HH:mm') ICT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
SOULCOUNT:         [count] | DELTA: [delta] | [PASS/DRIFT]
HEAVY-LEDGER:      [ðŸŸ¢ UP / ðŸ”´ DOWN]
PHEROMONES:        [ðŸŸ¢ UP / ðŸ”´ DOWN]
STARMAP:           [ðŸŸ¢ UP / ðŸ”´ DOWN]
SOUL-KEYWORDS:     [ðŸŸ¢ UP / ðŸ”´ DOWN]
PIPELINE:          [ðŸŸ¢ UP / ðŸ”´ DOWN]
TIERS:             T1=Local PA | T2=Opus 4.7
GIT HEAD:          [sha oneline]
GIT TREE:          [CLEAN / DIRTY]
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
```

If any zone returns DOWN: print `GATEWAY: DEGRADED â€” investigate before heavy work`.
If SOULCOUNT delta > 5,000: print `SOUL_DRIFT_DETECTED â€” HALT`.
All green: print `GATEWAY: ALL SYSTEMS NOMINAL`.

