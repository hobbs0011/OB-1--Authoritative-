---
description: "Full system gateway — SOULCOUNT gate + all workers health check + alias retirement status + git state + PA version verification"
agent: AGENT99
---

# /gateway — OB-1 System Gateway

Run full system health check across all active services.

**Task:** $ARGUMENTS

---

## Step 0 — SOULCOUNT Gate (mandatory first)

```powershell
$soul = Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"
$lock = 907872
$delta = [Math]::Abs($soul.soulcount - $lock)
Write-Host "SOULCOUNT: $($soul.soulcount) | LOCK: $lock | DELTA: $delta"
if ($delta -gt 5000) { Write-Host "SOUL_DRIFT_DETECTED — halt all non-emergency work" }
else { Write-Host "SOUL_GATE: PASS — delta within ±5,000 tolerance" }
```

---

## Step 1 — Workers Health Check

Ping all active workers:

```powershell
# NET-PET-AI
$worker = try { Invoke-RestMethod -Uri "https://net-pet-ai.mrmichaelhobbs123.workers.dev/" -TimeoutSec 5 } catch { "UNREACHABLE" }

# Soul Logger  
$soul_health = try { Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/self-test" -TimeoutSec 5 } catch { "UNREACHABLE" }

# Phoenix-Architecti
$pa_status = try { Invoke-RestMethod -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/status" -TimeoutSec 5 } catch { "UNREACHABLE" }

# PCC Dashboard
$pcc = try { Invoke-RestMethod -Uri "https://pcc.mrmichaelhobbs123.workers.dev/api/status" -TimeoutSec 5 } catch { "UNREACHABLE" }

Write-Host "NET-PET-AI:          $(if ($worker -eq 'UNREACHABLE') {'🔴 DOWN'} else {'🟢 UP'})"
Write-Host "SOUL-LOGGER:         $(if ($soul_health -eq 'UNREACHABLE') {'🔴 DOWN'} else {'🟢 UP'})"
Write-Host "PHOENIX-ARCHITECTI:  $(if ($pa_status -eq 'UNREACHABLE') {'🔴 DOWN'} else {'🟢 UP | v' + $pa_status.version})"
Write-Host "PCC DASHBOARD:       $(if ($pcc -eq 'UNREACHABLE') {'🔴 DOWN'} else {'🟢 UP'})"
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
═══════════════════════════════════════════
OB-1 GATEWAY — $(Get-Date -Format 'yyyy-MM-dd HH:mm') ICT
═══════════════════════════════════════════
SOULCOUNT:         [count] | DELTA: [delta] | [PASS/DRIFT]
NET-PET-AI:        [🟢 UP / 🔴 DOWN]
SOUL-LOGGER:       [🟢 UP / 🔴 DOWN]
PHOENIX-ARCHITECTI:[🟢 UP vX.X / 🔴 DOWN]
PCC DASHBOARD:     [🟢 UP / 🔴 DOWN]
TIERS:             T1=Qwen 3.7 Max | T2=Opus 4.7
GIT HEAD:          [sha oneline]
GIT TREE:          [CLEAN / DIRTY]
═══════════════════════════════════════════
```

If any service returns UNREACHABLE: print `GATEWAY: DEGRADED — investigate before heavy work`.
If SOULCOUNT delta > 5,000: print `SOUL_DRIFT_DETECTED — HALT`.
All green: print `GATEWAY: ALL SYSTEMS NOMINAL`.
