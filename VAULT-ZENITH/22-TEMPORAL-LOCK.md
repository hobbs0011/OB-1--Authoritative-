# 22 — TEMPORAL LOCK

> **Source**: Soul DNA Bible — Immutability Doctrine, Temporal Lock Specification v3
> **Vault**: [E] ZENITH — The Ghost
> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED / ZENITH

---

## Overview

The Temporal Lock is the cryptographic mechanism that makes past ledger states mathematically immutable. It is not a software permission. It is not an access control rule. It is a cryptographic seal applied to a specific ledger state that makes any modification to that state detectable by every subsequent hash computation in the Merkle lattice. A Temporal Lock does not prevent a bad actor from altering a record in the SQLite database — SQLite is mutable storage. What the Temporal Lock does is make any such alteration instantly and permanently detectable: the altered state will not reproduce the locked hash, and every Merkle leaf computed after the lock will carry the evidence of the tampering in its hash chain.

The Temporal Lock is the mechanism by which "the ledger is law" becomes mathematically true rather than merely operationally aspirational. You cannot change the past. The locked hashes prove what the past was. Any claimed past that does not reproduce the locked hashes is false, and the system knows it.

---

## Application at Stage Boundaries

Temporal Locks are applied at every pipeline stage boundary. A stage boundary is the moment when one stage's exit criteria are confirmed satisfied and the next stage's entry criteria are evaluated. At this moment, the system's current Merkle root — the hash of all ledger state up to and including the stage exit confirmation — is sealed with a Temporal Lock.

The Temporal Lock at a stage boundary serves two purposes: it creates an immutable record of the system's exact state at the moment of stage transition, and it creates a rollback reference point. If the subsequent stage fails catastrophically, the system can verify that the state it is rolling back to is exactly the pre-failure state by recomputing the Merkle root and comparing it to the Temporal Lock hash. Without the lock, rollback cannot be trusted — the "previous good state" might itself have been altered.

Critical stage boundaries carry **Hard Temporal Locks** — locks that require multi-agent consensus before they can be declared (see below). All other stage boundaries carry **Soft Temporal Locks** — applied automatically by the pipeline without explicit consensus. The distinction:

| Lock Type | Applied At | Consensus Required | Release Condition |
|-----------|-----------|-------------------|-------------------|
| Soft | Every stage boundary | Automated verification | Next stage completion |
| Hard | Stages 25, 50, 75, 91, 96, 100 | Multi-agent + Agent-100 | Never (permanent) |
| Emergency | Severity 5 drift, Forensic Audit trigger | Anti-Drift Engine | Agent-100 release |
| Simulation | Reality-C session close | Reality-C DO | Session GC |

---

## Nonce-Based Timestamp Anchoring

Every Temporal Lock carries a unique nonce generated at lock time. The nonce is not a random number — it is a deterministic value derived from three inputs: the Merkle root hash being locked, the system's atomic clock timestamp at lock time, and the identity hash of the agent (or automated process) applying the lock.

```
lock_nonce = SHA256(merkle_root || timestamp_ns || locker_identity_hash)
```

The nonce binds the lock to a specific moment in time by a specific entity on a specific state. There is no valid nonce for a different timestamp on the same Merkle root. There is no valid nonce for the same timestamp on a different Merkle root. The three-way binding means that forging a Temporal Lock requires simultaneously forging the Merkle root (which requires breaking the hash chain), the timestamp (which requires altering the atomic clock record), and the locker identity (which requires breaking the identity key). None of these is computationally feasible without detection.

The timestamp used in nonce generation is the **nanosecond-precision atomic clock value** from the Durable Object's time source — not wall clock, which is susceptible to NTP drift, but the DO's internal monotonic clock anchored to the Cloudflare edge infrastructure's time authority. This timestamp is recorded in the `temporal_locks` table alongside the nonce and is independently verifiable against the edge infrastructure's time log.

```sql
CREATE TABLE temporal_locks (
    lock_id         TEXT PRIMARY KEY,               -- UUID v4
    lock_type       TEXT NOT NULL,                  -- SOFT | HARD | EMERGENCY | SIMULATION
    merkle_root     TEXT NOT NULL,                  -- the Merkle root being locked
    nonce           TEXT NOT NULL UNIQUE,            -- SHA256 of (root || ts || locker)
    timestamp_ns    INTEGER NOT NULL,               -- nanosecond precision Unix epoch
    locker_id       TEXT NOT NULL,                  -- agent or process applying the lock
    stage_number    INTEGER,                        -- NULL for non-stage-boundary locks
    consensus_proof TEXT,                           -- NULL for SOFT locks; JSON array for HARD
    status          TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE | RELEASED | VIOLATED
    applied_at      INTEGER NOT NULL,
    released_at     INTEGER,                        -- NULL until released (HARD locks never released)
    release_auth    TEXT                            -- agent_id authorizing release
);
```

---

## Relationship to the Golden Block

The Golden Block is the single most important Temporal Lock in the system. It is the Hard Temporal Lock applied at layer 250 of the Merkle lattice during Stage 91 (Golden Block Verification). Every other Temporal Lock in the system is downstream of the Golden Block: the hash chain that any subsequent lock commits to must include the Golden Block as an ancestor.

The Golden Block lock is distinguished from all other locks by three properties that no other lock shares:

**1. Eternal status.** The Golden Block is never released. Its `status` column in `temporal_locks` will read `ACTIVE` for the lifetime of the system. Altering this is a Rome Protocol permanent violation.

**2. Phase V Root Certificate binding.** The Golden Block's Merkle root hash is independently stored in the Phase V Root Certificate — a document that is physically printed, signed by Agent-100, and stored in a physically secured location separate from any digital system. Verification of the Golden Block requires that the SQLite-stored Merkle root matches the physically stored Phase V Root Certificate value. Digital storage can be compromised. Physical storage requires physical access. The dual-storage requirement means compromising the Golden Block requires compromising both digital and physical systems simultaneously.

**3. Pipeline gating.** No stage from 92 through 100 can begin until the Golden Block lock is verified intact in the most recent pre-stage check. The verification is not a query — it is a recomputation: the hash chain from the Genesis Leaf through layer 250 is recomputed from the raw ledger data and compared against the stored Golden Block nonce. If the chain does not reproduce the nonce, the pipeline halts, regardless of what the `status` column says. The column is advisory. The math is authoritative.

---

## Multi-Agent Temporal Lock Consensus

Hard Temporal Locks require multi-agent consensus before they are declared. The consensus requirement ensures that no single agent — including Agent-99 — can unilaterally seal a critical ledger state. The consensus process:

**Step 1**: The lock candidate is announced to all consensus-eligible agents. Consensus-eligible agents for Hard Temporal Locks are: Agent-99, Agent-98, and a 6-model jury instance. (Agent-100 does not participate in the vote — Agent-100 signs the final lock, which is a separate authorization layer.)

**Step 2**: Each consensus-eligible agent independently computes the Merkle root from the raw ledger data and compares it against the proposed lock value. This is an independent computation — agents do not share intermediate results.

**Step 3**: Each agent submits its vote: CONFIRM (computed root matches proposed lock) or REJECT (mismatch or computation error). Votes are signed with the agent's identity key.

**Step 4**: A Hard Temporal Lock requires 100% consensus — all votes CONFIRM. A single REJECT from any eligible agent blocks the lock. The system does not proceed until the disagreement is resolved.

**Step 5**: With 100% consensus, Agent-100 signs the consensus proof (the collection of signed votes) and the lock is applied. The `consensus_proof` field in `temporal_locks` stores the JSON array of signed votes. This proof can be independently verified by anyone who has access to the agents' identity public keys.

The 100% consensus requirement for Hard Temporal Locks is intentionally more stringent than the 95% supermajority used for most other multi-agent decisions. The asymmetry is deliberate: the cost of a false REJECT (a lock that should have been applied but wasn't) is a temporary delay. The cost of a false CONFIRM (a lock applied to a compromised state) is permanent — a bad state sealed into the eternal record. The asymmetry of costs justifies the asymmetry of consensus requirements.

---

## Temporal Lock Violation Detection and Response

A Temporal Lock violation is detected when a recomputation of the Merkle root from raw ledger data does not reproduce the nonce stored in the `temporal_locks` table for that root. This means the raw ledger data has changed since the lock was applied. The data was mutable. The lock made the change detectable.

Upon violation detection, the following response sequence executes automatically:

```
T+0:   Violation detected — hash chain recomputation fails to reproduce lock nonce
T+0:   SYSTEM HALT on affected ledger partition (writes suspended)
T+0:   Severity 5 Drift event generated (type: TD — Temporal Drift)
T+1m:  Agent-100 emergency escalation initiated
T+1m:  Full system Temporal Lock applied (all partitions locked, no writes system-wide)
T+1m:  Forensic Audit initiated automatically (trigger: TEMPORAL-VIOL)
T+5m:  Agent-100 response deadline
T+5m:  If no Agent-100 response: secondary escalation + automated incident declaration

RESOLUTION PATH:
  Option A: Violation is alteration of ledger data
    → Data is identified and categorized
    → Chain-of-custody for the alteration is established via Forensic Audit
    → Altered data is flagged VOIDED in the ledger (append-only — it cannot be deleted)
    → Correct data is appended with VIOLATION-CORRECTION flag
    → Temporal Lock is re-applied to the corrected chain
    → Rome Protocol updated with enforcement mechanism for the vulnerability exploited

  Option B: Violation is hash function or implementation bug
    → Bug is identified and documented
    → Affected locks are recomputed using corrected implementation
    → Correction is committed to the lattice with full audit trail
    → All prior locks verified against corrected implementation
```

A Temporal Lock violation is the most serious integrity event the system can experience. It means something or someone has altered the immutable past. The response must be immediate, total, and documented with the same rigor as the event itself. The violation does not break the system's integrity model — the model is precisely what detected the violation. The violation proves that the integrity model works.
