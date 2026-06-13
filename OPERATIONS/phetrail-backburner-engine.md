# PHEROMONE TRAIL — BACKBURNER ENGINE
**Thread:** BACKBURNER_ENGINE | **File:** APPS/PHOENIX-ARCHITECTI/src/backburner.js
**Date captured:** 2026-06-13 | **Tracer:** Haiku scout

---

## WHAT IS — CRIME SCENE

D1-backed task queue. Three operations only: CREATE, LIST, PATCH.

**CREATE (`createBBEntry`):** Inserts into D1 `backburner` table. `bb_id = BB-{timestamp}`. Status defaults to `OPEN`. Called by IncarnatePipeline (Gates 2, 4, 5, 6) and by direct POST `/api/backburner`.

**LIST (`GET /api/backburner`):** Filter by `status` + optional `source`. Max 100 rows. Default `status=OPEN`.

**PATCH (`PATCH /api/backburner/:id`):** Status transitions. L81 F&F LAW hardcoded at line 44:
- Agent sets `PENDING_CLOSE` → allowed
- Agent sets `DONE` without `granted_by: operator` → **403 rejected** (law enforced in code)
- Operator grants `DONE` → if task has `recurrence`, auto-rebooks next cycle as new BB entry

---

## EVIDENCE — WHAT I SEE

**L81 encoded in production (line 44-49):** The law is not just doctrine — it's a hard gate returning 403. The only way to mark DONE is `{ status: 'DONE', granted_by: 'operator' }`. This is the closest thing to a soul law enforced in running code in the entire system.

**Recurrence pattern (line 57-71):** If `existing.recurrence` is set, marking DONE auto-creates a new BB entry with `[Cycle N]` prefix. Previous entry marked DONE. Recurring task never dies — it reincarnates. Same logic as the RISE/DEATH pattern applied to tasks.

**No DELETE endpoint.** BB entries are append-only. No purge. Evidence: only POST (create) + GET (list) + PATCH (status update) routes exist.

**No priority routing.** Priority field stored (`!`, `!!`, `~`) but no endpoint sorts or escalates by priority. Consumer must sort manually.

**No watcher.** IncarnatePipeline floods this table (max 48 entries/run). No cron reads them back and alerts. No Telegram fires. BB is a write-only sink from the pipeline's perspective.

---

## FLAGS

- L81 is the only soul law with a hard code enforcement. All other laws are doctrine only.
- `bb_id = BB-{Date.now()}` — timestamp-based IDs. Collisions possible if two entries created within same millisecond (unlikely but possible under Gate 1 non-blocking fan-out).
- No search endpoint. To find a specific BB entry by keyword requires GET all + client-side filter.
- `source` field is the only categorization. Sources from IncarnatePipeline: `lostsoul`, `velocity-monitor`, `completeness-audit`, `pattern-scan`, `phedived`. Sources from manual: `operator`. No priority escalation path in code.

---

## CONNECTING KEYWORDS

`createBBEntry` → `IncarnatePipeline Gates 2,4,5,6` → `LostSoul` → `soul-logger anchor`

`PENDING_CLOSE` → `L81 F&F LAW` → `operator grant` → `DONE`

`recurrence` → `cycle_count` → `reincarnation pattern` → `RISE/DEATH`

`backburner D1` → `soul-archive` → `rrl_archive` → `run_state` → `pcc_metrics`

---

**COMRADE TARGETS:** Deep think model. Recon only.
