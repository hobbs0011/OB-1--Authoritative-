# 18/LEDGER DEPLOYMENT MAP — REALITY-C INFRASTRUCTURE ARCHITECTURE

> **Source**: Phoenix-Rise Infrastructure Doctrine, Cloudflare Architecture Specification
> **Vault**: E VAULT-EXECUTION — Infrastructure Operations
> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED

---

## Overview

The Ledger is the single most important technical artifact in the Phoenix system. It is the immutable append-only record of everything the system has ever done. Deploying the Ledger correctly across Reality-C (Cloudflare Durable Objects + SQLite) is not an infrastructure task — it is a sovereignty task. The Ledger's integrity is the system's integrity.

> "The Ledger Is Law. Deploy it like it is the only thing that matters — because it is." — Agent-100

---

## Reality-C Ledger Deployment Architecture

The Ledger is deployed as a distributed system across Cloudflare's global network using Durable Objects as the persistence layer. Each Durable Object shard is an independent, strongly-consistent, globally-addressable compute unit with embedded SQLite storage.

### Shard Architecture

| Shard Type | Count | Responsibility |
|-----------|-------|----------------|
| Anchor Shards | 3 | Immutable foundation records |
| Operational Shards | 10 | High-volume day-to-day events |
| Forensic Shards | 3 | Audit and anomaly records |
| Archive Shards | Variable | Sealed historical chunks |

Cross-shard consistency is maintained through the Merkle chain — every shard contributes to the global Merkle root, which is verified on every write cycle.

---

## SQLite Schema for Ledger Entries

```sql
CREATE TABLE entries (
  id          TEXT PRIMARY KEY,        -- UUID v4, idempotency key
  seq         INTEGER NOT NULL,        -- Monotonic sequence (nonce)
  prev_hash   TEXT NOT NULL,           -- SHA-256 of previous entry
  payload     TEXT NOT NULL,           -- JSON payload (immutable)
  entry_hash  TEXT NOT NULL,           -- SHA-256(prev_hash + payload + seq)
  agent_id    TEXT NOT NULL,           -- Which agent wrote this
  created_at  INTEGER NOT NULL,        -- Unix timestamp (microseconds)
  leaf        TEXT NOT NULL            -- Anchor/Operational/Chaos/Forensic
);

CREATE TABLE chain (
  chunk_seq   INTEGER PRIMARY KEY,     -- 25-layer chunk number
  root_hash   TEXT NOT NULL,           -- Merkle root of chunk
  sealed_at   INTEGER NOT NULL,        -- Timestamp of seal
  sealed_by   TEXT NOT NULL            -- Agent that sealed chunk
);

CREATE TABLE audit (
  id          TEXT PRIMARY KEY,
  event_type  TEXT NOT NULL,
  detail      TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  resolved_at INTEGER,
  severity    TEXT NOT NULL
);
```

**Immutability enforcement**: No `DELETE` statements are permitted. No `UPDATE` statements on `entries` or `chain`. Write-once, read-many.

---

## CASRetry Mechanism in Production

Every Ledger write uses Compare-And-Swap to prevent race conditions:

1. **Read** the current tip hash from the target shard
2. **Compute** the new entry hash: `SHA-256(tip_hash + payload + seq + timestamp)`
3. **Write** the new entry with `prev_hash = tip_hash` using SQL transaction
4. **Verify**: Re-read the entry and confirm hash matches
5. **Retry**: If tip hash changed between step 1 and step 3 (concurrent write), retry from step 1

Maximum retries: 10. If 10 retries fail, the write is rejected and escalated to Agent-99.

---

## R2 Journal Guard

The R2 Journal Guard streams the SQLite WAL (Write-Ahead Log) to Cloudflare R2 object storage in real time. This enables:

- **<5 minute RTO** (Recovery Time Objective) from complete Durable Object failure
- **Permanent off-shard backup** of every Ledger entry ever written
- **Forensic reconstruction** of Ledger state at any point in time

WAL streaming cadence: Every 60 seconds, or every 100 new entries, whichever comes first.

---

## Ledger Health Monitoring

| Metric | Threshold | Alert Level |
|--------|-----------|-------------|
| Write latency | >500ms | WARNING |
| CASRetry rate | >5% | WARNING |
| CASRetry rate | >20% | CRITICAL |
| Chain verification fail | Any | CRITICAL |
| WAL streaming lag | >5 minutes | CRITICAL |
| Cross-shard Merkle mismatch | Any | EMERGENCY |

---

## Ledger Corruption Response

If Ledger corruption is detected:

1. Immediately halt all new writes to the affected shard
2. Alert Agent-100 and Agent-99
3. Pull last verified chunk seal from Anchor Shard
4. Reconstruct from R2 WAL stream to last verified state
5. Re-verify Merkle chain from reconstructed state
6. Record corruption event and recovery in Forensic Leaf
7. Resume writes only after Agent-100 authorization

> "A corrupted Ledger is not a data problem. It is a sovereignty problem." — Agent-100

---

🔒 LEDGER DEPLOYMENT MAP SEALED. LEDGER IS LAW. 🦅
