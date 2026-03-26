# MASTER-SYNC

**Canonical shared synchronization file for all orchestrator command stations before the next phase.**

This is the **single master sync markdown file**.
All orchestrator command stations should append here before the next phase.

---

## 1. Prime directive

- Use **one** shared sync file.
- Update **append-first**, not overwrite-first.
- If a move cannot be executed physically, **simulate it, document it, and reverse-engineer the turn-on path**.
- Do not promote guessed state into truth.
- `UNKNOWN` must remain explicit until resolved.
- Escalate only on **net-new signal**, blocker, or required unknown.
- No duplicate active truth.
- No dirty handoff.
- No drift inheritance.

---

## 2. Runtime decision lock

| Field | Value |
|---|---|
| Primary cloud runtime | **Cloudflare-first** |
| Backup cloud runtime | **Google-first** |
| Fallback surfaces | Android, Mac |
| Canonical command plane | Notion |
| Canonical repo | `hobbs-lab/Phoenix-Rise-Immortalize-` |
| Canonical sync artifact | `MASTER-SYNC.md` |
| Synchronization law | **$$$ Protocol — Super Saiyan Synch** |

---

## 3. Master orchestrator shape

### OB1-M0

**Role:** master orchestrator node, intake lane, routing governor, drift corrector, merge authority, and silent-close gate.

### Core lanes

| Lane | Role | Primary cloud home | Current state |
|---|---|---|---|
| M0 | Intake, route, correct, merge, silent close | Cloudflare Workers / Durable Objects | **Simulated and documented** |
| L1 | Ledger reconciliation | DO(SQLite) | **Simulated and documented** |
| L2 | Drift detection | Worker / workflow step | **Simulated and documented** |
| L3 | Correction chain | Workflows / queues | **Simulated and documented** |
| L4 | Fan-out strings | Queues / pub-sub style fan-out | **Simulated and documented** |
| L5 | Supervisor merge | M0 merge step | **Simulated and documented** |

---

## 4. Subagent deployment lock

| Subagent | Mission | Status |
|---|---|---|
| **Obi-N** | Notion workspace, backlog, build log, assets | **Simulated deployment complete** |
| **Obi-G** | GitHub repo, PRs, issues, commits, CI | **Simulated deployment complete** |
| **Obi-C** | Canon integrity across core law pages | **Simulated deployment complete** |
| **Obi-W** | Web and external signals | **Simulated deployment complete** |
| **Obi-Prime** | Merge and governance | **Simulated deployment complete** |

---

## 5. Phase gate

Next phase may begin only when:
- all command stations have filled this file
- runtime primary is confirmed
- outstanding `UNKNOWN` items are explicit
- blockers are converted into activation steps or resolved
- no duplicate active truth exists
