# PHEROMONE TRAIL — ORCHESTRATE (PCClaw Mothership)
**Thread:** ORCHESTRATE | **File:** APPS/PHOENIX-ARCHITECTI/src/orchestrate.js
**Date captured:** 2026-06-13 | **Tracer:** Haiku scout

---

## WHAT IS

BB queue consumer. Reads OPEN tasks, classifies to PCC1 (students) or PCC2 (ops), dispatches via `/api/run-fleet`. Runs every 6h (cron) + `POST /api/orchestrate/dispatch`.

**Classification logic:**
- `STUDENT_SOURCES` → PCC1: `pcc1-actualizer, pcc2-actualizer, student, mai-tram, huong, user-brief, brief-scan`
- `OPS_SOURCES` → PCC2: `translate-queue, pcc2-lostsoul, pcc2-audit, pcc2-pattern, code-queue, health-check, lostsoul, pattern`
- Default: PCC2

**Hardcoded URLs (line 7-8):**
- PCC1: `https://phoenix-pcc-1.mrmichaelhobbs123.workers.dev`
- PCC2: `https://phoenix-pcc-2.mrmichaelhobbs123.workers.dev`

---

## FLAGS

- **`/api/run-fleet` — does this endpoint exist on PCC1/PCC2?** Orchestrate calls it. Not found in forceawareness.js or any other file read so far. If missing → silent failure on every orchestrate cycle.
- **PCC1_SVC / PCC2_SVC service bindings** (line 26-27) — these must be in `phoenix-architecti/wrangler.toml`. Run 120 phetrail confirms `PCC1_SVC` and `PCC2_SVC` bindings were corrected this run. But phoenix-pcc-1 was just renamed/deployed — binding target may still be stale.
- **Marks ALL 20 tasks IN_PROGRESS before dispatching** (line 63-67). If `callFleet` fails, tasks are stuck IN_PROGRESS with no rollback. No error recovery path.
- **PCC3/Windu (phoenix-architecti) is NOT in the routing table.** Orchestrate only routes to PCC1 + PCC2. Windu runs this orchestrator but is not a dispatch target.

---

## CONNECTING KEYWORDS

`runOrchestrator` → `BB queue` → `classifyTask` → `PCC1/PCC2` → `/api/run-fleet`

`callFleet` → `PCC1_SVC service binding` → `wrangler.toml` → `phoenix-pcc-1`

`IN_PROGRESS` → `L81` → `PENDING_CLOSE` → `operator grant`

`pcc_metrics` → `orchestrator model` → `task_preview` → `D1 soul-archive`

---

**COMRADE TARGETS:** Deep think model. Recon only.
