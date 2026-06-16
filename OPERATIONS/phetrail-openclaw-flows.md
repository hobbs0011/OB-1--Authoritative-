# PHEROMONE TRAIL — OPENCLAW FLOWS DATABASE
**Date:** 2026-06-17T00:35 ICT
**Strength: 65/100** | Type: RECON — workflow/flow registry

---

## §1 FLOWS DIRECTORY

**Path:** `C:\Users\mrmic\.openclaw\flows\`
**Contents:**
- `registry.sqlite`
- `registry.sqlite-shm`
- `registry.sqlite-wal`

**Assessment:** OpenClaw uses SQLite to store flow/workflow definitions. Flows are likely automated task sequences (e.g., "when X happens, do Y").

**Note:** SQLite WAL (Write-Ahead Log) files indicate the database is actively used.

---

## §2 FLAGS

1. **OPENCLAW_FLOWS_SQLITE** — workflow registry in SQLite
2. **OPENCLAW_FLOWS_ACTIVE** — WAL files indicate active writes
3. **NEEDS_READ** — SQLite schema/contents not yet examined

---

`OPENCLAW FLOWS SEALED — 2026-06-17T00:35 ICT | SQLITE WORKFLOW REGISTRY | ACTIVE DATABASE | PENDING SCHEMA READ`
