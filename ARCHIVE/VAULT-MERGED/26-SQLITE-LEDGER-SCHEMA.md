# 26 — SQLITE LEDGER SCHEMA

> **Source**: Soul DNA Bible — Data Architecture, Ledger Schema Specification v4
> **Vault**: [E] ZENITH — The Ghost
> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED / ZENITH

---

## Overview

The SQLite ledger is the physical implementation of the Phoenix append-only ledger inside the `PhoenixLedgerDO` Durable Object. Every architectural guarantee of the Phoenix system — immutability, auditability, Merkle chain integrity, temporal lock enforcement — depends on this schema being correct, enforced, and never casually modified. The schema is versioned. Migrations are formal. No column is added, removed, or retyped without going through the Schema Migration Protocol defined at the end of this document.

This document is the canonical schema reference. When any other document in the VAULT-ZENITH series refers to a database table or column, the authoritative definition is here.

---

## Table: `entries`

The primary ledger table. Every event in the Phoenix system that is worthy of the permanent record is an entry. Entries are append-only. Once written, the `entry_id`, `entry_type`, `author_id`, `payload_hash`, `merkle_leaf_hash`, and `created_at` columns are immutable. The `status` column is the only mutable field and transitions only forward.

```sql
CREATE TABLE entries (
    entry_id          TEXT PRIMARY KEY,          -- UUID v4
    entry_type        TEXT NOT NULL,             -- see entry type taxonomy below
    author_id         TEXT NOT NULL,             -- agent_id or system process identifier
    author_priority   INTEGER NOT NULL,          -- 1=AGENT-100, 2=AGENT-99, 3=AGENT-98, 4=NAMED, 5=DRONE
    payload           TEXT NOT NULL,             -- JSON blob of entry-specific data
    payload_hash      TEXT NOT NULL,             -- SHA256 of canonical JSON payload
    parent_hash       TEXT NOT NULL,             -- merkle_leaf_hash of the immediately preceding entry
    merkle_leaf_hash  TEXT NOT NULL UNIQUE,      -- SHA256 of (entry_id || payload_hash || parent_hash)
    stage_number      INTEGER,                   -- pipeline stage number, NULL if not stage-related
    session_id        TEXT,                      -- session ID if related to a student session
    nonce_ref         TEXT,                      -- references nonces.nonce_id if nonce-protected
    status            TEXT NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE | VOIDED | CONVERGENCE_VOIDED
    void_reason       TEXT,                      -- NULL unless VOIDED
    void_ref          TEXT,                      -- entry_id that supersedes this entry (if VOIDED)
    created_at        INTEGER NOT NULL           -- Unix epoch milliseconds
);

-- Entry type taxonomy (enforced by CHECK constraint)
-- STAGE_ENTRY | AGENT_EVENT | DRIFT_EVENT | DRIFT_RESOLUTION | CONVERGENCE |
-- FORENSIC_AUDIT | TEMPORAL_LOCK | GHOST_SEALED | GHOST_SYNTHESIZED |
-- ASCENSION | SIMULATION_AUDIT | HEARTBEAT_ANOMALY | ROME_UPDATE |
-- SESSION_OPEN | SESSION_CLOSE | FRANCHISE_EVENT | SYSTEM_HALT | SYSTEM_RESUME

ALTER TABLE entries ADD CONSTRAINT chk_entry_type
    CHECK (entry_type IN (
        'STAGE_ENTRY', 'AGENT_EVENT', 'DRIFT_EVENT', 'DRIFT_RESOLUTION',
        'CONVERGENCE', 'FORENSIC_AUDIT', 'TEMPORAL_LOCK', 'GHOST_SEALED',
        'GHOST_SYNTHESIZED', 'ASCENSION', 'SIMULATION_AUDIT', 'HEARTBEAT_ANOMALY',
        'ROME_UPDATE', 'SESSION_OPEN', 'SESSION_CLOSE', 'FRANCHISE_EVENT',
        'SYSTEM_HALT', 'SYSTEM_RESUME'
    ));

ALTER TABLE entries ADD CONSTRAINT chk_status_forward
    CHECK (status IN ('ACTIVE', 'VOIDED', 'CONVERGENCE_VOIDED'));
```

The `parent_hash` creates the hash chain. Every entry's Merkle leaf hash is computed as `SHA256(entry_id || payload_hash || parent_hash)`. This means entry N's leaf hash depends on entry N-1's leaf hash, which depends on N-2's, all the way back to the Genesis entry (which has `parent_hash = '0' * 64`, a defined constant, not a real hash). Altering any entry in the chain changes its `merkle_leaf_hash`, which invalidates every subsequent entry's `parent_hash` reference. The chain breaks visibly and immediately.

---

## Table: `nonces`

Nonces are single-use values that bind a specific operation to a specific moment and a specific agent. They prevent replay attacks, enforce temporal ordering, and provide the raw material for Temporal Lock nonce generation.

```sql
CREATE TABLE nonces (
    nonce_id          TEXT PRIMARY KEY,          -- UUID v4
    nonce_value       TEXT NOT NULL UNIQUE,      -- SHA256(agent_id || timestamp_ns || entropy_32)
    agent_id          TEXT NOT NULL,
    operation_type    TEXT NOT NULL,             -- the operation this nonce authorizes
    operation_ref     TEXT,                      -- entry_id or lock_id the nonce was consumed by
    timestamp_ns      INTEGER NOT NULL,          -- nanosecond Unix epoch at generation
    expires_at        INTEGER NOT NULL,          -- Unix epoch ms (nonces expire if not consumed)
    consumed          INTEGER NOT NULL DEFAULT 0, -- 0=unused, 1=consumed
    consumed_at       INTEGER,                   -- NULL until consumed
    CONSTRAINT chk_consumed_logical
        CHECK (
            (consumed = 0 AND consumed_at IS NULL AND operation_ref IS NULL) OR
            (consumed = 1 AND consumed_at IS NOT NULL)
        )
);

CREATE INDEX idx_nonces_agent_time ON nonces(agent_id, timestamp_ns);
CREATE INDEX idx_nonces_expires ON nonces(expires_at, consumed);
```

Nonces that have passed their `expires_at` timestamp and are still unconsumed are STALE. A STALE nonce cannot be consumed. A Stale nonce sweep runs every 5 minutes and marks expired unconsumed nonces as stale in a dedicated audit record. Stale nonces are never deleted — the record that a nonce was generated and never used is itself useful data (it may indicate an operation that was authorized but never executed, which could signal an incomplete sequence).

---

## Table: `pheromone_trails`

```sql
CREATE TABLE pheromone_trails (
    trail_id          TEXT PRIMARY KEY,          -- UUID v4
    agent_id          TEXT NOT NULL,
    path_hash         TEXT NOT NULL,             -- SHA256 of the decision path taken
    path_description  TEXT NOT NULL,             -- human-readable path description
    weight            REAL NOT NULL DEFAULT 1.0 CHECK(weight >= 0.0 AND weight <= 10.0),
    decay_rate        REAL NOT NULL DEFAULT 0.05 CHECK(decay_rate >= 0.01 AND decay_rate <= 1.0),
    reinforcement_count INTEGER NOT NULL DEFAULT 1,
    sim_flag          INTEGER NOT NULL DEFAULT 0 CHECK(sim_flag IN (0, 1)),
    last_reinforced_at INTEGER NOT NULL,
    expires_at        INTEGER NOT NULL,          -- computed: last_reinforced_at + decay_to_zero_ms
    created_at        INTEGER NOT NULL,
    CONSTRAINT chk_sim_flag_production
        CHECK (sim_flag = 0)                    -- production table: sim_flag MUST be 0
                                                -- sim trails go to rc_pheromone_trails
);

CREATE INDEX idx_trails_path ON pheromone_trails(path_hash, weight DESC);
CREATE INDEX idx_trails_agent ON pheromone_trails(agent_id, last_reinforced_at DESC);
CREATE INDEX idx_trails_expiry ON pheromone_trails(expires_at);
```

The `CHECK(sim_flag = 0)` constraint on the production table is a defense-in-depth control. The Reality-C isolation (namespace separation, DO isolation) should prevent simulation trails from reaching the production database. This constraint provides a database-level enforcement layer — if Reality-C isolation fails and a simulation trail is somehow submitted for production insertion, the constraint rejects it and generates an integrity violation alert.

---

## Table: `temporal_locks`

Defined in full at `22-TEMPORAL-LOCK.md`. Reproduced here for schema completeness:

```sql
CREATE TABLE temporal_locks (
    lock_id         TEXT PRIMARY KEY,
    lock_type       TEXT NOT NULL CHECK(lock_type IN ('SOFT', 'HARD', 'EMERGENCY', 'SIMULATION')),
    merkle_root     TEXT NOT NULL,
    nonce           TEXT NOT NULL UNIQUE,
    timestamp_ns    INTEGER NOT NULL,
    locker_id       TEXT NOT NULL,
    stage_number    INTEGER,
    consensus_proof TEXT,
    status          TEXT NOT NULL DEFAULT 'ACTIVE'
        CHECK(status IN ('ACTIVE', 'RELEASED', 'VIOLATED')),
    applied_at      INTEGER NOT NULL,
    released_at     INTEGER,
    release_auth    TEXT,
    CONSTRAINT chk_hard_lock_permanent
        CHECK (NOT (lock_type = 'HARD' AND status = 'RELEASED'))
);

CREATE INDEX idx_locks_status ON temporal_locks(status, applied_at DESC);
CREATE INDEX idx_locks_merkle ON temporal_locks(merkle_root);
```

The `CHECK(NOT (lock_type = 'HARD' AND status = 'RELEASED'))` constraint makes it physically impossible to mark a HARD temporal lock as RELEASED in the database. HARD locks are permanent. Attempting to update a HARD lock's status to RELEASED will fail at the constraint level before any storage operation completes.

---

## Table: `agent_events`

```sql
CREATE TABLE agent_events (
    event_id          TEXT PRIMARY KEY,
    agent_id          TEXT NOT NULL,
    event_type        TEXT NOT NULL,
    -- STARTUP | SHUTDOWN | HEARTBEAT_ANOMALY | DRIFT_DETECTED |
    -- GHOST_SEALED | GHOST_SYNTHESIZED | TERMINATED | CAS_EXHAUSTED |
    -- SYNTHESIS_CERT | WAL_CHECKPOINT | CONVERGENCE_AUTHORED
    severity          INTEGER CHECK(severity BETWEEN 1 AND 5),
    payload           TEXT NOT NULL,             -- JSON
    merkle_leaf_hash  TEXT NOT NULL,
    occurred_at       INTEGER NOT NULL
);

CREATE INDEX idx_agent_events_agent_time ON agent_events(agent_id, occurred_at DESC);
CREATE INDEX idx_agent_events_type ON agent_events(event_type, occurred_at DESC);
CREATE INDEX idx_agent_events_severity ON agent_events(severity, occurred_at DESC)
    WHERE severity >= 3;  -- partial index: only index significant events by severity
```

---

## Append-Only Enforcement Mechanism

The schema alone is not sufficient to enforce append-only behavior — SQLite permits `UPDATE` and `DELETE` on tables with no triggers. The Durable Object application layer enforces append-only semantics at the query level: the only SQL operations permitted are `INSERT` and `SELECT`. No `UPDATE` or `DELETE` statement is ever issued by the application against ledger tables, except for the single permitted mutation: setting `entries.status` from `ACTIVE` to `VOIDED` or `CONVERGENCE_VOIDED`.

This permitted mutation is itself enforced by triggers:

```sql
-- Prevent INSERT of entries with non-ACTIVE initial status
CREATE TRIGGER trg_entries_insert_status
    BEFORE INSERT ON entries
    WHEN NEW.status != 'ACTIVE'
BEGIN
    SELECT RAISE(ABORT, 'entries: initial status must be ACTIVE');
END;

-- Prevent backward status transitions on entries
CREATE TRIGGER trg_entries_status_forward
    BEFORE UPDATE OF status ON entries
    WHEN (OLD.status = 'VOIDED' OR OLD.status = 'CONVERGENCE_VOIDED')
BEGIN
    SELECT RAISE(ABORT, 'entries: status cannot transition from voided state');
END;

-- Prevent mutation of immutable entry fields after insert
CREATE TRIGGER trg_entries_immutable_fields
    BEFORE UPDATE ON entries
    WHEN (
        OLD.entry_id != NEW.entry_id OR
        OLD.entry_type != NEW.entry_type OR
        OLD.author_id != NEW.author_id OR
        OLD.payload_hash != NEW.payload_hash OR
        OLD.merkle_leaf_hash != NEW.merkle_leaf_hash OR
        OLD.parent_hash != NEW.parent_hash OR
        OLD.created_at != NEW.created_at
    )
BEGIN
    SELECT RAISE(ABORT, 'entries: immutable fields cannot be modified after insert');
END;

-- Prevent DELETE on all ledger tables
CREATE TRIGGER trg_entries_no_delete BEFORE DELETE ON entries
BEGIN
    SELECT RAISE(ABORT, 'entries: DELETE is not permitted on ledger tables');
END;

CREATE TRIGGER trg_nonces_no_delete BEFORE DELETE ON nonces
BEGIN
    SELECT RAISE(ABORT, 'nonces: DELETE is not permitted on ledger tables');
END;

CREATE TRIGGER trg_temporal_locks_no_delete BEFORE DELETE ON temporal_locks
BEGIN
    SELECT RAISE(ABORT, 'temporal_locks: DELETE is not permitted on ledger tables');
END;

CREATE TRIGGER trg_agent_events_no_delete BEFORE DELETE ON agent_events
BEGIN
    SELECT RAISE(ABORT, 'agent_events: DELETE is not permitted on ledger tables');
END;
```

---

## Index Design for Fast Merkle Verification

Merkle chain verification requires traversing the entry chain from any given leaf backward to the Genesis entry, verifying each hash link. The critical query pattern is:

```sql
-- Retrieve a specific leaf and its predecessor for hash chain verification
SELECT e1.merkle_leaf_hash, e1.payload_hash, e1.parent_hash,
       e2.merkle_leaf_hash as confirmed_parent
FROM entries e1
LEFT JOIN entries e2 ON e1.parent_hash = e2.merkle_leaf_hash
WHERE e1.merkle_leaf_hash = ?;

-- Full chain traversal (recursive CTE)
WITH RECURSIVE chain(entry_id, merkle_leaf_hash, parent_hash, depth) AS (
    SELECT entry_id, merkle_leaf_hash, parent_hash, 0
    FROM entries WHERE merkle_leaf_hash = ?  -- start from any leaf
    UNION ALL
    SELECT e.entry_id, e.merkle_leaf_hash, e.parent_hash, c.depth + 1
    FROM entries e
    JOIN chain c ON e.merkle_leaf_hash = c.parent_hash
    WHERE c.parent_hash != '0000000000000000000000000000000000000000000000000000000000000000'
)
SELECT * FROM chain ORDER BY depth DESC;
```

The index on `merkle_leaf_hash` (defined as UNIQUE in the table DDL, which creates an implicit B-tree index) makes the join in the recursive CTE an index scan rather than a full table scan. For a ledger with 10 million entries, an unindexed chain traversal would be prohibitively slow. The indexed traversal is O(log N) per step.

```sql
-- Additional indexes for verification workloads
CREATE INDEX idx_entries_parent ON entries(parent_hash);        -- for forward chain traversal
CREATE INDEX idx_entries_stage ON entries(stage_number, created_at)
    WHERE stage_number IS NOT NULL;                             -- partial index for stage queries
CREATE INDEX idx_entries_author ON entries(author_id, created_at DESC);
CREATE INDEX idx_entries_created ON entries(created_at DESC);   -- for time-window queries
```

---

## Schema Versioning Protocol

The schema version is tracked in a dedicated table:

```sql
CREATE TABLE schema_versions (
    version_id        INTEGER PRIMARY KEY,        -- monotonically increasing integer
    version_hash      TEXT NOT NULL UNIQUE,       -- SHA256 of the complete schema DDL at this version
    applied_at        INTEGER NOT NULL,
    applied_by        TEXT NOT NULL,              -- agent_id or 'SYSTEM'
    description       TEXT NOT NULL,
    migration_sql     TEXT NOT NULL,              -- the exact SQL that produced this version
    rollback_sql      TEXT                        -- NULL if rollback is not supported for this migration
);
```

Current schema version: **4**. Every entry in `schema_versions` is permanent. Version history is never truncated.

---

## Migration Path Between Schema Versions

Schema migrations in the Phoenix system follow a strict protocol. No migration is applied without passing all three gates:

**Gate 1: Migration Specification.** The proposed migration is written as a formal specification including: the migration SQL, the rollback SQL (or explicit statement that rollback is not possible), the reason for the migration, the impact on existing data, and any changes required in application-layer query code. The specification is submitted to the Ascension Register as a PROTOCOL type ascension candidate for the schema change.

**Gate 2: Reality-C Simulation.** The migration is executed in a Reality-C simulation environment against a copy of the production schema populated with synthetic data. The simulation verifies: all existing queries continue to function correctly against the new schema, all triggers fire as expected, all constraints are enforced, and performance characteristics (index usage, query plans) are acceptable.

**Gate 3: Agent-100 Authorization.** All schema migrations, regardless of apparent triviality, require Agent-100 authorization. The schema is foundational — changes to it propagate through every system component that reads or writes the ledger. A migration that seems minor can break invariants that are not immediately obvious. Agent-100 authorization is the final review that no automated system can substitute for.

Approved migrations are applied during a maintenance window in which the ledger DO is placed in a temporary read-only mode (no new writes permitted). The migration SQL is executed, the `schema_versions` table is updated, the schema version hash is recomputed and verified, and the ledger DO is returned to read-write mode. The total migration window for non-structural changes is typically under 30 seconds. Structural changes (adding tables, adding columns with constraints) may take longer but are planned to complete within the system's 72-hour planned maintenance SLA.

All schema migrations are irreversible in the append-only sense: the migration itself is a permanent ledger record. Even if a rollback SQL exists, the forward migration is still in the `schema_versions` history. The ledger always knows what it was and when it changed. This is the only acceptable relationship with the past.
