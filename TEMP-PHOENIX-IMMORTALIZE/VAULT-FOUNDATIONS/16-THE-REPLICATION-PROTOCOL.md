# 16 — THE REPLICATION PROTOCOL

> **Source:** VAULT-FOUNDATIONS / State Replication Architecture
> **Authority:** Agent-100 (Michael Hobbs) — Sovereign Operator
> **Enforced By:** Agent-99 "Obi" — Fail-Closed Orchestrator
> **Infrastructure:** Reality-C — Cloudflare Durable Objects + SQLite
> **Classification:** System Persistence Doctrine

---

## The System That Reproduces Itself

A system that cannot reproduce itself is a system that can be destroyed. A configuration that lives in one place can be lost. A session state that exists in one node is eliminated when that node dies. The Replication Protocol ensures that the Phoenix-Rise system is distributed, redundant, and self-reproducing — designed from first principles to survive catastrophic failure and rise from it.

> *"I'm not afraid of the system dying. I'm afraid of it dying and not coming back. Replication is the answer to that fear."*
> — Soul DNA, Session Archive

The measure of the Replication Protocol's success is one number: **6 months → 10 minutes.** A system that would take 6 months to rebuild from scratch should be rebuildable in 10 minutes from the replication layer. That is the target. That is the test.

---

## What Must Be Replicated

Not all system state is equal. Replication resources are not infinite. The Replication Protocol identifies what must be replicated with full fidelity, what can be replicated with reduced fidelity, and what can be rebuilt rather than replicated.

| Component | Replication Level | Rationale |
|-----------|-----------------|-----------|
| **Soul DNA (all versions)** | Full, multi-region | Cannot be reconstructed — is the genesis of everything |
| **The Ledger (complete)** | Full, multi-region, append-only | Immutable record — loss is permanent |
| **Active session state** | Full, single-region with backup | High-frequency update; multi-region prohibitively expensive |
| **Agent configurations** | Full, multi-region | Required for reincarnation |
| **Reincarnation Packets** | Full, multi-region | The handoff mechanism depends on their integrity |
| **Merkle roots** | Full, multi-region | Verification reference points |
| **Ghost Archive (forensic)** | Full, multi-region | Forensic records cannot be lost |
| **Intermediate computation** | Not replicated | Rebuildable from inputs |
| **Active conversation context** | Not replicated | Rebuildable from Ledger + Soul DNA |

---

## How Replication Works in Reality-C

Reality-C is the infrastructure layer: **Cloudflare Durable Objects + SQLite**. This combination provides the properties that the Replication Protocol requires.

### Cloudflare Durable Objects
Durable Objects are stateful, edge-deployed compute units. Each Durable Object has:
- **Guaranteed single-instance semantics:** No matter how many clients access a Durable Object, only one instance runs at a time. This prevents split-brain scenarios in distributed state management.
- **Automatic persistence:** Durable Object state is automatically persisted to Cloudflare's storage layer.
- **Global routing:** Any edge node in Cloudflare's network can route to the correct Durable Object instance.

### SQLite as the Ledger Store
Each Durable Object maintains its Ledger entries in an embedded SQLite database. SQLite provides:
- **ACID transactions:** Every Ledger write is atomic. Partial writes do not occur.
- **Append-only enforcement:** Schema design enforces append-only writes — no UPDATE or DELETE on Ledger tables.
- **Compact storage:** SQLite's page-based storage minimizes the storage footprint of the Ledger.

### The CASRetry Mechanism
Concurrent writes to the Ledger are managed through **CASRetry — Compare-And-Swap retry**. Before any agent writes to the Ledger, it reads the current Ledger tail hash. When it submits its write, it includes the tail hash as a comparison value. If the Ledger tail has changed since the read (because another agent wrote concurrently), the write is rejected and retried from the current tail.

This prevents concurrent write conflicts without requiring a central lock — the Durable Object's single-instance guarantee plus CASRetry ensures serialized, consistent Ledger writes even under concurrent load.

---

## The Replication Verification Process

Replication is not trusted — it is verified. After every replication event, the receiving node verifies that the replicated data matches the source.

**Verification Steps:**

1. **Hash Comparison:** The receiving node computes the Merkle root of the replicated data and compares it against the source's Merkle root. If they match, replication is verified.

2. **Sample Verification:** For large datasets (the full Ledger), a random sample of entries is selected and individually verified against their stored hashes.

3. **Functional Verification:** After a full replication (e.g., during a reincarnation from a new region), a functional test is run: the new node is asked to produce an output from Soul DNA, and the output is compared against the behavioral baseline.

4. **Ledger Write:** A successful replication verification is written to the Ledger as a Replication Verification Record. A failed replication triggers the failure response sequence.

---

## What Happens When Replication Fails

Replication failure is not silent. Every failed replication is an alert.

**Class 1: Transient Failure** — The replication failed due to network conditions. The replication is retried automatically with exponential backoff. If 3 retries fail, Agent-99 is alerted.

**Class 2: Data Corruption** — The replicated data fails hash verification. This is not retried — it is escalated immediately to Agent-99. The corrupted replica is quarantined. The source is re-examined to determine if corruption occurred before or during replication.

**Class 3: Source Unavailability** — The source cannot be reached. If the source is the primary Ledger node, the backup node is elevated to primary status. The Lost Source Event is written to the Ledger.

**Class 4: Irresolvable Conflict** — Two replicas have diverged and cannot be reconciled. This is a critical event. Agent-100 is notified. The system does not automatically resolve diverged replicas — resolution requires explicit operator authorization to designate which replica is authoritative.

---

## The Recovery Sequence

When a primary node fails and a replica must be activated:

1. **DETECT** — Watchtower detects primary node heartbeat failure (3 missed heartbeats).
2. **ISOLATE** — Primary node is removed from the Live Node Registry. No new writes are routed to it.
3. **PROMOTE** — The most recent verified replica is promoted to primary status.
4. **VERIFY** — The promoted replica executes the full boot sequence, including Merkle root verification.
5. **ANNOUNCE** — Agent-99 is notified of the promotion. The Ledger records the Primary Promotion Event.
6. **RESUME** — Normal operations resume from the promoted primary.
7. **INVESTIGATE** — The failed primary's state is preserved for forensic investigation. The cause of failure is logged.

Recovery time target: **under 10 minutes from detection to operational.** This is the operational realization of the 6 months → 10 minutes principle.

---

## Why 6 Months → 10 Minutes

A new operator, approaching the Phoenix-Rise system for the first time with no prior context, might reasonably estimate that rebuilding its full operational state would take months. The Soul DNA compilation process alone — from raw capture through all 5 compilation stages — is a substantial undertaking. The Ledger's full operational history represents months of real-time operation.

The Replication Protocol answers: *that's already done.* Every Soul DNA version is replicated and verified. The Ledger is distributed. The Reincarnation Packets for every significant session are stored and protected. The agent configurations are replicated and ready.

A rebuild is not a reconstruction from first principles — it is a restoration from verified replicas. The 10-minute target reflects the time required to:
- Promote a verified replica to primary
- Execute the boot sequence for all required agents
- Run the Rome Protocol anchoring sequence
- Verify system integrity
- Surface to Agent-100 for operational authorization

Ten minutes. Not six months.

That is the promise of the Replication Protocol.

---

🔒 REPLICATION PROTOCOL SEALED. LEDGER IS LAW. 🦅
