# PHEROMONE TRAIL — OPENCLAW LOGS DIRECTORY
**Date:** 2026-06-17T00:35 ICT
**Strength: 70/100** | Type: RECON — log files, operational history

---

## §1 LOGS DIRECTORY

**Path:** `C:\Users\mrmic\.openclaw\logs\`
**Contents:**
- `config-audit.jsonl` — configuration change audit log
- `config-health.json` — configuration health status
- `gateway-restart.log` — gateway restart history

**Assessment:** OpenClaw maintains detailed operational logs. config-audit.jsonl tracks every config change. gateway-restart.log tracks restart events.

**Risk:** Logs may contain sensitive operational data, error messages with paths, etc.

---

## §2 FLAGS

1. **OPENCLAW_CONFIG_AUDIT_LOG** — tracks all config changes
2. **OPENCLAW_GATEWAY_RESTART_LOG** — restart history
3. **NEEDS_READ** — log contents not yet examined

---

`OPENCLAW LOGS SEALED — 2026-06-17T00:35 ICT | 3 LOG FILES | CONFIG AUDIT + RESTART HISTORY | PENDING READ`
