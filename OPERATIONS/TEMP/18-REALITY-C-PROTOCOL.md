# 18 — REALITY-C PROTOCOL

> **Source**: Soul DNA Bible — Architecture Layer, Reality-C Doctrine v2
> **Vault**: [E] ZENITH — The Ghost
> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED / ZENITH

---

## Overview

Phoenix operates across three simultaneous operational layers. Reality-A is the live production environment: the Cloudflare Durable Objects that hold actual student sessions, the Merkle lattice that records real franchise events, the SQLite ledger whose entries are permanent. Reality-B is the shadow-first testing environment: every new protocol, agent behavior, or infrastructure change is executed in shadow mode before it touches Reality-A, with results compared for divergence before promotion. Reality-C is the third layer. It is not a test environment. It is not a staging environment. It is a cryptographic simulation layer — a mathematically isolated execution context where agents test reality-bending operations: reincarnation sequences, temporal lock reassignment, Convergence Engine conflict scenarios, and multi-agent consensus edge cases. Nothing in Reality-C is real in the ledger sense, but everything in Reality-C is real in the computational sense. The math runs. The hashes compute. The pheromone trails generate. Only the commitment to the permanent ledger is withheld.

Reality-C is the surgery simulator. You do not practice open-heart surgery on a live patient. You do not practice Zenith-level operations on a production ledger. Reality-C is where the skill is built, where the sequence is validated, and where failure is safe.

---

## Layer Architecture

| Layer | Name | Ledger Commits | Pheromone Trails | Agent Auth Required |
|-------|------|----------------|------------------|---------------------|
| A | Production | YES — permanent | Production trails | Full chain |
| B | Shadow-First | NO — compare only | Ephemeral, logged | Subset |
| C | Cryptographic Simulation | NO — isolated | Simulation trails | Reality-C key |

Reality-C runs inside an isolated Durable Object class (`PhoenixRealityC`), separate from the production DO hierarchy. It shares no state with Reality-A or Reality-B. Its SQLite instance is ephemeral by design — it persists for the duration of a simulation session and is garbage-collected at session close. Its Merkle root is computed identically to the production Merkle root but carries a Reality-C namespace prefix (`RC-`) in every hash, ensuring that no Reality-C hash can collide with or be mistaken for a production hash.

---

## Integration with the Merkle Ledger

The Merkle lattice in production (Reality-A) is append-only and permanent. In Reality-C, the lattice runs a complete structural copy — same four-leaf structure, same hash function, same layer progression — but under the `RC-` namespace. When a simulation session begins, Reality-C initializes its lattice from the most recent production Merkle root snapshot (a read-only copy, never a live reference). All subsequent operations in Reality-C extend the simulation lattice from that snapshot without touching the production lattice.

At the close of a simulation session, Reality-C generates a **Simulation Audit Leaf** — a structured record containing:
- Session ID (UUID v4, Reality-C namespace)
- Snapshot root hash used (production Merkle root at session open)
- Operations simulated (enumerated list, signed)
- Final simulated Merkle root (RC- prefixed)
- Divergence delta between simulated final state and production current state
- PASS/FAIL verdict for each simulated operation

The Simulation Audit Leaf is committed to the **production** Merkle lattice as an audit record. The simulated operations themselves are not committed. The fact of the simulation, its scope, and its verdict are permanent. This is the correct inversion: the act of testing is real; the test results exist in the permanent record; the simulated transactions do not.

---

## Pheromone Trail Generation: Simulation vs. Production

Pheromone trails are behavioral breadcrumbs: probabilistic signals that agents leave when they traverse a decision path, enabling swarm intelligence to reinforce successful routes and decay failed ones. In Reality-A, a pheromone trail is a production record — it carries real weight, it decays on a real clock, it influences real agent routing decisions within minutes of generation.

In Reality-C, pheromone trails are generated with full fidelity — same trail structure, same decay functions, same weight calculations — but they are tagged `SIM=1` in the trail metadata and written only to the Reality-C SQLite instance. They cannot propagate to the production trail matrix. The simulation computes what the trail network would look like if the simulated operations had actually occurred, allowing agents to evaluate whether a proposed operation would produce a healthy or pathological pheromone state in production before committing it.

```sql
-- Reality-C pheromone trail record (simulation namespace)
CREATE TABLE rc_pheromone_trails (
    trail_id       TEXT PRIMARY KEY,
    session_id     TEXT NOT NULL,
    agent_id       TEXT NOT NULL,
    path_hash      TEXT NOT NULL,
    weight         REAL NOT NULL DEFAULT 1.0,
    decay_rate     REAL NOT NULL DEFAULT 0.05,
    sim_flag       INTEGER NOT NULL DEFAULT 1, -- always 1 in Reality-C
    generated_at   INTEGER NOT NULL,           -- Unix epoch ms
    expires_at     INTEGER NOT NULL
);
```

Production pheromone trails carry `sim_flag = 0`. Any trail with `sim_flag = 1` that appears in the production database is a critical integrity violation — it means Reality-C isolation has failed. This condition triggers an immediate HALT, a Forensic Audit, and escalation to Agent-100.

---

## CAS Isolation Guarantees

Reality-C uses Compare-And-Swap (CAS) operations for all state transitions, identical to the production CAS pattern. The isolation guarantee is enforced at three levels:

**Level 1 — DO Instance Isolation.** The Reality-C Durable Object instance is never colocated with a production DO in the same edge region for the duration of a simulation session. The scheduler enforces this separation by routing Reality-C sessions to a dedicated edge region pool tagged `RC-ISOLATED`.

**Level 2 — Namespace Isolation.** Every key written in Reality-C carries the `RC-` prefix. The production DO's `storage.get()` and `storage.put()` operations are wrapped with a namespace guard that rejects any key beginning with `RC-`. Symmetrically, the Reality-C DO rejects any operation that does not carry the `RC-` prefix.

**Level 3 — CAS Epoch Isolation.** The CAS epoch counter in Reality-C is initialized to a value deliberately outside the production epoch range: `RC_EPOCH_BASE = 10^12 + session_epoch_offset`. Production CAS epochs are monotonically increasing integers starting from 1. No production CAS epoch can reach `10^12` in any foreseeable operational window. Any epoch collision between Reality-C and Reality-A is therefore a mathematical impossibility under normal operation, and any detected collision is proof of a namespace breach.

When a Reality-C CAS operation fails (the compare fails because state has diverged from the expected snapshot), it does not retry against production. It fails in place, records the failure in the simulation log, and allows the simulation to continue from the failed state for analysis. Production CAS failures trigger retry with exponential backoff. Simulation CAS failures are data — they tell the operator what would have gone wrong.

---

## Reality-C State Garbage Collection

Reality-C simulation sessions have a maximum duration of 4 hours. At session close — whether graceful completion or timeout — the following garbage collection sequence executes:

**Step 1**: The Simulation Audit Leaf is generated and committed to the production Merkle lattice. This step is atomic and must succeed before any other GC step proceeds.

**Step 2**: All `rc_pheromone_trails` records for the session are deleted from the Reality-C SQLite instance.

**Step 3**: All `rc_ledger_entries` records for the session are deleted.

**Step 4**: All `rc_agent_events` records for the session are deleted.

**Step 5**: The Reality-C SQLite WAL file is checkpointed and truncated.

**Step 6**: The DO instance for the session is destroyed. Its storage is released. The session ID is marked CLOSED in the global Reality-C Session Registry (a production-resident record).

**Step 7**: The `RC-ISOLATED` edge region slot is released back to the pool.

Sessions that terminate abnormally (DO crash, network partition, operator kill signal) have their GC initiated by a watchdog process that runs in Reality-A. The watchdog scans the Reality-C Session Registry every 15 minutes for sessions whose last heartbeat is older than 30 minutes. Any such session is force-closed: the Simulation Audit Leaf is generated with a TIMEOUT/ABNORMAL verdict, and GC steps 2-7 execute. No Reality-C state persists beyond 4 hours and 30 minutes under any failure scenario.

Reality-C state is never archived. It is never replicated. The only permanent artifact of a Reality-C session is its Simulation Audit Leaf in the production Merkle lattice. Everything else is scaffolding. Scaffolding comes down when the work is done.
