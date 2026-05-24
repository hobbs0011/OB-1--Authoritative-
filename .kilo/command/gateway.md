---
description: "Full system gateway — SOULCOUNT gate + all workers health check + alias retirement countdown + git state + PC version verification"
agent: AGENT99
---

# /gateway — OB-1 System Gateway

Run full system health check across all active services.

**Task:** $ARGUMENTS

---

## Step 0 — SOULCOUNT Gate (mandatory first)

```powershell
$soul = Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"
$lock = 898066
$delta = [Math]::Abs($soul.soulcount - $lock)
Write-Host "SOULCOUNT: $($soul.soulcount) | LOCK: $lock | DELTA: $delta"
if ($delta -gt 5000) { Write-Host "SOUL_DRIFT_DETECTED — halt all non-emergency work" }
else { Write-Host "SOUL_GATE: PASS — delta within ±5,000 tolerance" }
```

---

## Step 1 — Workers Health Check

Ping all three active workers:

```powershell
# NET-PET-AI
$worker = try { Invoke-RestMethod -Uri "https://net-pet-ai.mrmichaelhobbs123.workers.dev/" -TimeoutSec 5 } catch { "UNREACHABLE" }

# Soul Logger  
$soul_health = try { Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/self-test" -TimeoutSec 5 } catch { "UNREACHABLE" }

# Phoenix Coder
$pc_status = try { Invoke-RestMethod -Uri "https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/status" -TimeoutSec 5 } catch { "UNREACHABLE" }

Write-Host "NET-PET-AI:     $(if ($worker -eq 'UNREACHABLE') {'🔴 DOWN'} else {'🟢 UP'})"
Write-Host "SOUL-LOGGER:    $(if ($soul_health -eq 'UNREACHABLE') {'🔴 DOWN'} else {'🟢 UP'})"
Write-Host "PHOENIX-CODER:  $(if ($pc_status -eq 'UNREACHABLE') {'🔴 DOWN'} else {'🟢 UP | v' + $pc_status.version})"
```

---

## Step 2 — Alias Retirement Status

✅ **EXECUTED** — Audit T392 complete (May 23, 2026). `deepseek-chat` and `deepseek-reasoner` aliases retired. All live code uses canonical model IDs: `deepseek-v4-flash`, `deepseek-v4-pro`, `cerebras/gpt-oss-120b`.

> **DEPRECATION NOTE:** `stepfun/step-3.5-flash` is retired (StepFun 404 — confirmed dead Run 11). T1 burst model is now `cerebras/gpt-oss-120b` (Cerebras GLM 4.7 via PA T1 free cascade). Do not use StepFun in any new wiring.

```powershell
Write-Host "ALIAS RETIREMENT: EXECUTED. All live paths use canonical IDs (deepseek-v4-flash, deepseek-v4-pro, cerebras/gpt-oss-120b). StepFun DEPRECATED."
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
SOULCOUNT:    [count] | DELTA: [delta] | [PASS/DRIFT]
NET-PET-AI:   [🟢 UP / 🔴 DOWN]
SOUL-LOGGER:  [🟢 UP / 🔴 DOWN]
PHOENIX-CODER:[🟢 UP vX.X / 🔴 DOWN]
ALIAS RETIRE: [N days remaining]
GIT HEAD:     [sha oneline]
GIT TREE:     [CLEAN / DIRTY]
═══════════════════════════════════════════
```

If any service returns UNREACHABLE: print `GATEWAY: DEGRADED — investigate before heavy work`.
If SOULCOUNT delta > 5,000: print `SOUL_DRIFT_DETECTED — HALT`.
All green: print `GATEWAY: ALL SYSTEMS NOMINAL`.
