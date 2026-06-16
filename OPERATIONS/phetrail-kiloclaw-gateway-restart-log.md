# PHEROMONE TRAIL — KILOCLAW GATEWAY RESTART LOG
**Date:** 2026-06-17T00:43 ICT
**Strength: 60/100** | Type: RECON — restart history

---

## §1 GATEWAY RESTART LOG

**Path:** `C:\Users\mrmic\.openclaw\logs\gateway-restart.log`
**Size:** 16 lines
**Date range:** 2026-05-24 to 2026-05-25 (2 days only)

**Contents:**
- Multiple restarts on 2026-05-24 (setup day)
- All restarts from `windows-task-handoff` source
- Pattern: restart attempt → fallback → finished

**Assessment:** Restart log only covers setup period. No recent restarts logged. This is expected if the gateway has been stable since setup.

**Note:** The log is small (16 lines) and only covers May 24-25, 2026. Either:
- Log rotation is happening (old logs deleted)
- Gateway has been stable since setup
- Restart logging is minimal

---

## §2 FLAGS

1. **KILOCLAW_RESTART_LOG_SETUP_ONLY** — only 2 days of history
2. **KILOCLAW_RESTARTS_AUTO** — all from windows-task-handoff

---

`KILOCLAW GATEWAY RESTART LOG SEALED — 2026-06-17T00:43 ICT | 16 LINES | SETUP-DAY ONLY | AUTO-RESTARTS FROM SCHTASK`
