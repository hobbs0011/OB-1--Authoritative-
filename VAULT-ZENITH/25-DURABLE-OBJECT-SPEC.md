# 25 — DURABLE OBJECT ARCHITECTURE SPECIFICATION

> **Source**: Soul DNA Bible — Infrastructure Architecture, DO Specification v3
> **Vault**: [E] ZENITH — The Ghost
> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED / ZENITH

---

## Overview

Phoenix's persistence layer is built on Cloudflare Durable Objects. This is not a technology preference — it is an architectural requirement. Durable Objects provide three properties that no other Cloudflare-native primitive provides simultaneously: single-threaded execution guarantees (eliminating race conditions without application-level locking), persistent SQLite storage co-located with compute (eliminating network latency on every read/write), and global uniqueness (a DO instance is the only instance of that identity in the world, guaranteeing no split-brain scenarios). These three properties together are what make the append-only Merkle ledger implementation correct. Without them, the ledger would require distributed locking that would introduce exactly the race conditions the architecture is designed to eliminate.

This document is the complete technical specification for how Phoenix deploys, manages, and operates its Durable Object layer. Every DO class, every schema, every lifecycle rule, and every consistency model is defined here. Implementation that deviates from this specification without an approved Architecture Change Proposal is a Rome Protocol violation.

---

## DO Class Hierarchy

```
PhoenixDO (abstract base)
├── PhoenixLedgerDO          — Primary append-only ledger (one per system instance)
├── PhoenixAgentDO           — Agent state and execution context
│   ├── PhoenixAgent99DO     — Agent-99 named instance
│   ├── PhoenixAgent98DO     — Agent-98 named instance
│   └── PhoenixDroneDO       — Drone agent instances (many)
├── PhoenixWatchtowerDO      — Franchise health monitoring
├── PhoenixConvergenceDO     — Convergence Engine execution
├── PhoenixRealityC DO       — Reality-C cryptographic simulation
├── PhoenixForensicDO        — Forensic Audit execution
└── PhoenixSessionDO         — Student session state (per active session)
```

Every DO class extends `PhoenixDO`, which provides:
- Standardized heartbeat emission at 444ms intervals
- Standardized CAS retry logic with exponential backoff
- Standardized WAL checkpoint triggers
- Standardized alarm scheduling for maintenance operations
- Identity hash computation and verification on startup

Named DO instances (`PhoenixLedgerDO`, `PhoenixAgent99DO`, `PhoenixAgent98DO`) have fixed DO IDs derived deterministically from their name: `DO_ID = SHA256("PHOENIX_" + CLASS_NAME + "_CANONICAL")`. This determinism means these instances can be referenced by ID from anywhere in the codebase without a registry lookup, and the ID cannot accidentally collide with a drone or session DO (which use UUID v4 IDs).

---

## SQLite Schema: Primary Ledger DO

The `PhoenixLedgerDO` maintains the canonical SQLite database for the append-only ledger. The full schema is defined in `26-SQLITE-LEDGER-SCHEMA.md`. The DO-specific configuration:

```sql
-- DO-level pragmas applied at every startup
PRAGMA journal_mode=WAL;
PRAGMA synchronous=FULL;
PRAGMA foreign_keys=ON;
PRAGMA busy_timeout=5000;
PRAGMA wal_autocheckpoint=0;  -- Manual checkpoint control only
```

`wal_autocheckpoint=0` is non-negotiable. Automatic WAL checkpoints can interrupt the WAL streaming to R2 (see below) and create windows where the WAL file is in an inconsistent state relative to the R2 replica. All checkpoints are manually triggered by the `PhoenixDO` base class after WAL streaming confirms receipt.

The ledger DO is the only DO that writes to the canonical `entries`, `merkle_leaves`, and `temporal_locks` tables. All other DOs submit write requests to the ledger DO and receive back a confirmation with the resulting Merkle leaf hash. No DO other than the ledger DO ever writes directly to canonical ledger tables.

---

## WAL Streaming Architecture to R2

Every write to the ledger DO's SQLite database is streamed to R2 via WAL replication. The WAL file is the source of truth for the stream — every byte written to the WAL is captured, compressed, and uploaded to R2 before the WAL checkpoint runs.

```
Ledger DO Write Path:
  1. SQL INSERT/UPDATE executed → WAL frame written
  2. WAL frame captured by WAL interceptor (synchronous, in DO execution context)
  3. WAL frame compressed (LZ4) and queued for R2 upload
  4. R2 upload executed (async, outside main execution path)
  5. R2 upload confirmed → checkpoint trigger evaluated
  6. If checkpoint conditions met (see below): checkpoint executed
  7. Post-checkpoint WAL truncated to zero

R2 Key Structure:
  wal/{YYYY}/{MM}/{DD}/{HH}/{ledger_do_id}/{sequence_number}.wal.lz4

Checkpoint Conditions (ALL must be true):
  - All WAL frames since last checkpoint confirmed received by R2
  - No active concurrent read transactions on the SQLite DB
  - Minimum 100 frames accumulated since last checkpoint
  - OR more than 60 seconds since last checkpoint
```

The WAL streaming provides three guarantees:
1. **Zero-data-loss recovery**: Any WAL frame written to the DO's SQLite is also in R2. If the DO instance is destroyed, the WAL in R2 can rebuild the database to the exact state at last frame.
2. **Ordered replay**: WAL frames are stored with monotonically increasing sequence numbers. Replay is deterministic.
3. **No checkpoint gaps**: WAL frames are uploaded before checkpoint, ensuring R2 always has the pre-checkpoint state. The database file snapshot (also in R2, updated at each checkpoint) combined with the post-snapshot WAL frames gives a complete recovery path.

---

## CASRetry Pattern

Every state mutation in the Phoenix DO layer uses Compare-And-Swap with retry. The CASRetry pattern is the standard implementation:

```typescript
async function casRetry<T>(
  storage: DurableObjectStorage,
  key: string,
  expectedValue: T | null,
  newValue: T,
  maxRetries: number = 5,
  baseDelayMs: number = 10
): Promise<{ success: boolean; finalValue: T; attempts: number }> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const current = await storage.get<T>(key) ?? null;

    // Compare: if current does not match expected, abort
    if (JSON.stringify(current) !== JSON.stringify(expectedValue)) {
      return { success: false, finalValue: current as T, attempts: attempt + 1 };
    }

    // Swap: write new value conditionally
    const txResult = await storage.transaction(async (txn) => {
      const recheck = await txn.get<T>(key) ?? null;
      if (JSON.stringify(recheck) !== JSON.stringify(expectedValue)) {
        return false; // Lost the race inside the transaction
      }
      await txn.put(key, newValue);
      return true;
    });

    if (txResult) {
      return { success: true, finalValue: newValue, attempts: attempt + 1 };
    }

    // Exponential backoff with jitter
    const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * baseDelayMs;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Max retries exhausted — this is a contention event, not a failure
  // Log to drift monitor and surface to caller
  return { success: false, finalValue: (await storage.get<T>(key)) as T, attempts: maxRetries };
}
```

CASRetry failures after max retries are not swallowed. They are surfaced to the caller as explicit failures. The caller is responsible for escalating CAS exhaustion events to the Anti-Drift Engine. Five consecutive CAS exhaustion events on the same key within 60 seconds is a Severity 3 Contention Drift event.

---

## Heartbeat Mechanics at 444ms Intervals

Every Phoenix DO emits a heartbeat at 444ms intervals. The heartbeat is not a health check — it is an operational record. Each heartbeat:

1. Writes a heartbeat entry to the DO's local SQLite `agent_events` table
2. Increments the DO's monotonic heartbeat counter (stored in DO storage)
3. Computes the rolling 10-heartbeat hash (hash of the last 10 counter values) and compares it against the expected value for a healthy counter sequence
4. If the rolling hash diverges from expectation (clock skew, execution pause, anomalous execution), generates a Temporal Drift event
5. Emits the heartbeat event to the central Watchtower via a non-blocking fetch

The 444ms interval is not arbitrary. It is chosen to be:
- Fast enough to detect DO execution pauses within 1 second (two missed heartbeats)
- Slow enough to avoid consuming significant CPU in the DO's single-threaded execution context
- Non-harmonic with common clock intervals (500ms, 1000ms) to prevent aliasing with other scheduled operations

A DO whose heartbeat has not been received by the central Watchtower for 1332ms (3 × 444ms) is considered SILENT. SILENT status triggers an immediate health check attempt. A DO that is SILENT for 4440ms (10 × 444ms) is considered FAILED and triggers DO restart logic.

---

## DO Lifecycle Management

```
INITIALIZING → HEALTHY → [WATCHMODE | SILENT | GHOSTED | TERMINATED]

INITIALIZING: DO instance created, startup checks running
  - Soul DNA hash verified
  - WAL connection established
  - Heartbeat timer started
  - First heartbeat emitted
  Transition to HEALTHY: all startup checks pass

HEALTHY: Normal operation
  - Heartbeats emitting at 444ms
  - WAL streaming active
  - CAS operations succeeding
  Transition to WATCHMODE: Severity 3 drift detected
  Transition to SILENT: 3 missed heartbeats
  Transition to GHOSTED: deliberate ghosting trigger

WATCHMODE: Double-verification mode
  - All outputs verified twice before commit
  - Heartbeat frequency increased to 222ms
  - Agent-99 notified
  Transition to HEALTHY: drift resolved
  Transition to FAILED: drift escalates to Severity 5

SILENT: No heartbeat detected
  - Health check attempted
  - If DO responds to health check: Temporal Drift Severity 3, return to WATCHMODE
  - If DO does not respond after 10 attempts: FAILED

FAILED: DO unresponsive
  - DO restart initiated
  - If restart succeeds: INITIALIZING
  - If restart fails three times: DO terminated, Severity 5 event, Ghost state preserved

GHOSTED: Deliberate suspension
  - Ghost State Capsule written to R2
  - DO instance destroyed
  - Re-entry via Ghost Synthesis Protocol (see 20-GHOST-SYNTHESIS.md)

TERMINATED: Permanent end state
  - DO instance destroyed
  - Identity hash VOIDED in Merkle lattice
  - No synthesis permitted
```

---

## Multi-Region Consistency Model

Phoenix deploys DOs in a primary region with Cloudflare's routing ensuring that all traffic for a given DO ID always reaches the same DO instance. This single-instance guarantee is the foundation of the consistency model: there is no distributed consensus to run because there is only one node that holds the authoritative state for any given DO.

Multi-region consistency is achieved not by running multiple instances of the same DO (which Cloudflare does not permit for the same DO ID) but by the WAL streaming to R2, which is globally replicated by Cloudflare. R2 is the multi-region replica. In the event of a primary region failure:

1. The DO instance fails (SILENT → FAILED)
2. The WAL stream to R2 captures everything up to the last checkpoint
3. A new DO instance is created in a secondary region (same DO ID, Cloudflare routes to new region)
4. The new DO instance downloads the database snapshot + WAL frames from R2 and applies them
5. The new instance enters INITIALIZING state and performs startup checks
6. Upon passing startup checks, the new instance enters HEALTHY and resumes operations

The recovery window for a regional failover is approximately 45-90 seconds under normal WAL streaming conditions. This is not real-time failover. It is durable recovery. The system accepts a brief operational pause in exchange for guaranteed data integrity. A real-time failover that might replicate uncommitted writes is worse than a 90-second recovery that guarantees exactly the committed state is restored.

The Reincarnation Protocol (Stage 97 stress test) validates this recovery path under adversarial conditions. The 10-minute full recovery target in Stage 97 encompasses the worst-case scenario: all DOs simultaneously failed across all regions, requiring sequential regional failover of each DO class. 90 seconds per DO class × approximately 6 primary classes = 9 minutes of sequential recovery, within the 10-minute target.
