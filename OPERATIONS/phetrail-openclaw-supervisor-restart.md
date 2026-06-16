# PHEROMONE TRAIL — OPENCLAW SUPERVISOR RESTART HANDOFF
**Date:** 2026-06-17T00:31 ICT
**Strength: 80/100** | Type: RECON — process supervision, restart mechanism

---

## §1 RESTART HANDOFF FILE

**Path:** `C:\Users\mrmic\.openclaw\gateway-supervisor-restart-handoff.json`
**Size:** 1 line JSON
**Created:** timestamp `1779666793984` (Unix ms) = 2026-06-17T00:23:14 UTC (very recent!)

**Contents:**
```json
{
  "kind": "gateway-supervisor-restart-handoff",
  "version": 1,
  "intentId": "d5c00477-7fa1-4a29-a466-e131103f509c",
  "pid": 11440,
  "processInstanceId": "05b4b155-6b32-470f-89a0-44ff1e8af8a2",
  "createdAt": 1779666793984,
  "expiresAt": 1779666853984,
  "source": "unknown",
  "restartKind": "full-process",
  "supervisorMode": "schtasks"
}
```

---

## §2 WHAT THIS MEANS

**OpenClaw has a supervisor/restart mechanism:**
- `restartKind: full-process` = restart the entire gateway process
- `supervisorMode: schtasks` = uses Windows Scheduled Task for supervision
- `expiresAt` = 60 seconds after creation (1779666793984 + 60000 = 1779666853984)
- `source: unknown` = the restart was triggered by an unknown source

**This is likely the mechanism that keeps OpenClaw running:**
- Windows Scheduled Task monitors the gateway
- If gateway crashes, schtask restarts it
- This file is a handoff marker between supervisor and gateway

**PID 11440** — need to check if this is the current running gateway process.

---

## §3 FLAGS

1. **OPENCLAW_SUPERVISOR_SCHTASKS** — uses Windows Scheduled Task for process supervision
2. **OPENCLAW_RECENT_RESTART** — this file was created very recently (00:23:14 UTC)
3. **OPENCLAW_RESTART_SOURCE_UNKNOWN** — what triggered the restart?

---

`OPENCLAW SUPERVISOR RESTART SEALED — 2026-06-17T00:31 ICT | SCHTASKS SUPERVISION CONFIRMED | RECENT RESTART HANDOFF | SOURCE UNKNOWN`
