# PHEROMONE TRAIL — ASUS BLOAT AUDIT
**Date:** 2026-06-17T00:17 ICT
**Strength: 75/100** | Type: RECON — inventory only, no fixes

---

## §1 ASUS SERVICE INVENTORY (13 SERVICES)

### Running / Automatic (11)
| Service | PID | Notes |
|---------|-----|-------|
| ArmouryCrateControlInterface | — | ASUS control plane |
| ArmouryCrateService | — | Main ASUS service |
| ASUS Optimization | — | Performance tuning |
| AsusAppService | — | App ecosystem |
| AsusCertService | — | Certificate management |
| AsusPTPService | — | Precision Touchpad |
| ASUSSoftwareManager | — | Software updates |
| ASUSSwitch | — | Display/Mode switching |
| ASUSSystemAnalysis | — | System diagnostics |
| ASUSSystemDiagnosis | — | Health checks |
| GameInputRedistService | — | Game input layer |

### Stopped / Manual (2)
| Service | Status | Risk |
|---------|--------|------|
| asus (ASUS Update) | Stopped, Automatic | Will auto-start |
| asusm (ASUS Update) | Stopped, Manual | Lower risk |
| GameInputSvc | Stopped, Manual | Input intercept layer |

---

## §2 CRASH HISTORY

**ASUS AURA SYNC:**
- 06/15/2026 22:10:45 — Event 7034 (terminated unexpectedly)
- 06/16/2026 14:43:42 — Event 7034 (terminated unexpectedly)
- 06/16/2026 23:29:03 — Event 7034 (terminated unexpectedly)

**Pattern:** Crashes every 12-16 hours. Indicates driver instability or conflict.

---

## §3 DCOM PERMISSION WARNINGS

**Event 10016 (recurring):**
- Server {A463FCB9-6B1C-4E0D-A80B-A2CA7999E25D} — Local Launch permission denied
- Server {7EAD5C10-8B3F-11E6-AE22-56B6B6499611} — Local Launch permission denied
- Server {F65817C8-DD85-4136-89F0-B9D12939F2C4} — Local Launch permission denied
- Server {95775DC4-77AA-4E94-8CF6-68267EEF1856} — Local Launch permission denied

**Likely source:** ASUS services + GameInput trying to access COM objects without proper ACLs.

---

## §4 IMPACT ASSESSMENT

**Low risk:**
- AsusPTPService (touchpad driver support)
- AsusCertService (certificate mgmt)

**Medium risk:**
- ArmouryCrateControlInterface + Service (heavy, auto-restart)
- ASUSSoftwareManager (auto-updates, can install bloat)
- GameInputRedistService + GameInputSvc (input intercept layer — Michael had cursor issues)

**High risk:**
- ASUS AURA SYNC (crashes regularly, driver instability)
- ASUSSystemAnalysis + ASUSSystemDiagnosis (telemetry)

---

## §5 CONNECTED PHEROMONES

- `phetrail-system-recon-20260617.md` — main recon sweep
- `CANON/REINCARNATION/run128-reincarnateDEATH.md` — ASUS ArmourySocketServer disabled in prior run
- Event 7034 crashes documented in system event log

---

`ASUS BLOAT AUDIT SEALED — 2026-06-17T00:17 ICT | 13 SERVICES INVENTORIED | 3 CRASHES DOCUMENTED | 4 DCOM PERMISSION VIOLATIONS | NO FIXES`
