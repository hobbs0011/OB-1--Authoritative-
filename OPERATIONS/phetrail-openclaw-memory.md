# PHEROMONE TRAIL — OPENCLAW MEMORY DATABASE
**Date:** 2026-06-17T00:35 ICT
**Strength: 65/100** | Type: RECON — agent memory store

---

## §1 MEMORY DIRECTORY

**Path:** `C:\Users\mrmic\.openclaw\memory\`
**Contents:**
- `main.sqlite`
- `main.sqlite-shm`
- `main.sqlite-wal`

**Assessment:** OpenClaw's active memory system (memory-core plugin enabled) stores agent memory in SQLite. This is where the agent's long-term memory lives.

**Note:** WAL files indicate active database writes — memory is being updated.

---

## §2 FLAGS

1. **OPENCLAW_MEMORY_SQLITE** — agent memory in SQLite
2. **OPENCLAW_MEMORY_ACTIVE** — WAL files show active writes
3. **NEEDS_READ** — SQLite schema/contents not yet examined

---

`OPENCLAW MEMORY SEALED — 2026-06-17T00:35 ICT | SQLITE MEMORY STORE | ACTIVE WRITES | PENDING SCHEMA READ`
