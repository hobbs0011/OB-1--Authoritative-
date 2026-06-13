# /health — System Health Check

Full situational awareness in one shot. Run this at boot or any time system state is unclear.

## EXECUTION

```powershell
$auth = "ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="
$base = "https://phoenix-architecti.mrmichaelhobbs123.workers.dev"
$headers = @{ "x-pa-auth" = $auth }

# 1. PA status — all bindings + AI models
$status = Invoke-RestMethod "$base/api/status"

# 2. PCC metrics — pass rate, latency, last call
$pcc = Invoke-RestMethod "$base/api/metrics/pcc?limit=10" -Headers $headers

# 3. BB queue — open items by source
$bb = Invoke-RestMethod "$base/api/backburner?status=OPEN&limit=20" -Headers $headers

# 4. IncarnatePipeline — last run_state
$rise = Invoke-RestMethod "$base/api/incarnate/rise" -Headers $headers

# 5. Soul-logger — live soulcount
$soul = Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"

# Report
Write-Host "=== SYSTEM HEALTH ===" -ForegroundColor Cyan
Write-Host "PA: $($status.status) | Llama70B: $($status.ai.llama_70b.ok) ($($status.ai.llama_70b.ms)ms) | DB: $($status.db.ok)"
Write-Host "PCC: $($status.pcc.status) | Pass: $($status.pcc.pass_rate) | Avg: $($status.pcc.avg_ms)ms | Calls24h: $($status.pcc.calls_24h)"
Write-Host "SOUL: $($soul.soulcount) chars"
Write-Host "BB OPEN: $($bb.Count) entries"
Write-Host "LAST RUN: $($rise.last_run.run_number) | Sealed: $($rise.last_run.sealed_at)"
Write-Host "LOST SOULS OPEN: $($rise.open_lost_souls)"
if ($rise.open_lost_souls -gt 0) {
    Write-Host "--- LOST SOULS ---" -ForegroundColor Yellow
    Write-Host $rise.lost_souls
}
```

## WHAT TO LOOK FOR

| Signal | Action |
|--------|--------|
| `PA: LIVE` + `Llama70B: true` | Normal — CF Workers AI live |
| `PCC: DEGRADED` | Check BB for health-check entries, investigate fail_reason |
| `PCC: SILENT` | No PCClaw calls since last cron — check if Invoke-PCClaw.ps1 is being used |
| `BB OPEN > 20` | Queue backing up — run orchestrate or review priorities |
| `LOST SOULS > 0` | Prior session directives unexecuted — read before doing anything new |
| `SOUL < last known` | Soul-logger issue — check soul-logger worker status |

## LAWS
- Run this at RISE if cold-start files are unavailable or unclear
- LOST SOULS surface here — read them before executing anything new this session
- PCC health is live — DEGRADED here means something broke since last session
