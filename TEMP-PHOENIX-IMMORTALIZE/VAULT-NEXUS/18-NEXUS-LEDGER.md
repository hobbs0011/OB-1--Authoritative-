# 18 — NEXUS LEDGER

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / CONNECTING
**Vault:** VAULT-NEXUS
**Classification:** OPERATIONAL — IMMUTABLE INTEGRATION LOG

---

## Purpose

The Nexus Ledger is the immutable record of every cross-vault operation in Phoenix. Every handshake, every agent handoff, every model-to-model transfer, every gate pass and gate fail — all of it is written to the Nexus Ledger. **The ledger is the truth of what happened between vaults. It cannot be modified. It cannot be deleted without Agent-100 authorization and PHOENIXMASTERKEY.**

---

## Ledger Format

Every Nexus ledger entry uses this format:

```
timestamp | vault_a | vault_b | handshake_id | status | agent
```

**Field definitions:**

| Field | Format | Description |
|-------|--------|-------------|
| `timestamp` | ISO 8601 (UTC) | Exact time of event — to millisecond precision |
| `vault_a` | VAULT-[NAME] or MODEL-[NAME] | Source of the operation |
| `vault_b` | VAULT-[NAME] or MODEL-[NAME] or AGENT-[N] | Destination of the operation |
| `handshake_id` | UUID (hs- prefix) or handoff/task ID | Unique identifier for this operation |
| `status` | Enum (see below) | Current status of the operation |
| `agent` | AGENT-100 / AGENT-99 / AGENT-98 / ORACLE / NEXUS | Who authorized or initiated the operation |

---

## Status Enum

| Status | Meaning |
|--------|---------|
| `SENT` | Handshake/handoff initiated, awaiting confirmation |
| `CONFIRMED` | Destination confirmed receipt |
| `EXECUTING` | Payload transfer in progress |
| `SUCCESS` | Handshake completed successfully |
| `TIMEOUT` | No confirmation within TTL |
| `RETRY-1` | First retry attempt |
| `RETRY-2` | Second retry attempt |
| `FAILED` | All retries exhausted, handshake failed |
| `REJECTED` | Gate failure — handshake rejected |
| `ROME_VIOLATION` | Rome Protocol check failed |
| `ISOLATED` | Destination vault is in isolation |
| `BYPASSED` | PHOENIXMASTERKEY gate bypass applied |
| `CANCELLED` | Agent-100 explicitly cancelled the operation |

---

## Handshake ID Generation

Handshake IDs are UUID v4 values with a type-specific prefix:

| Operation Type | Prefix | Example |
|----------------|--------|---------|
| Vault-to-vault handshake | `hs-` | `hs-550e8400-e29b-41d4-a716-446655440000` |
| Agent handoff | `ho-` | `ho-7c0a9b1c-4f3d-11ee-be56-0242ac120002` |
| Model handoff | `mh-` | `mh-9b2c1d3e-5a6b-7c8d-9e0f-1a2b3c4d5e6f` |
| Resync event | `rs-` | `rs-3f4e5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b` |

IDs are generated at initiation by the initiating vault or agent. They are unique system-wide and are never reused. Retries get new IDs.

---

## Sample Ledger Entries

```
2024-11-15T08:00:00.000Z | VAULT-NET-SEEDS | VAULT-ORACLE | hs-a1b2c3d4-... | SENT | AGENT-99
2024-11-15T08:00:05.123Z | VAULT-NET-SEEDS | VAULT-ORACLE | hs-a1b2c3d4-... | CONFIRMED | AGENT-99
2024-11-15T08:00:10.456Z | VAULT-NET-SEEDS | VAULT-ORACLE | hs-a1b2c3d4-... | SUCCESS | AGENT-99
2024-11-15T09:00:00.000Z | GEMINI-3.1-PRO | GPT-5.4 | mh-b2c3d4e5-... | SENT | ORACLE
2024-11-15T09:01:30.000Z | GEMINI-3.1-PRO | GPT-5.4 | mh-b2c3d4e5-... | SUCCESS | ORACLE
2024-11-15T10:15:00.000Z | VAULT-FOUNDATIONS | VAULT-EXECUTION | hs-c3d4e5f6-... | SENT | AGENT-99
2024-11-15T10:45:00.000Z | VAULT-FOUNDATIONS | VAULT-EXECUTION | hs-c3d4e5f6-... | TIMEOUT | NEXUS
2024-11-15T10:45:01.000Z | VAULT-FOUNDATIONS | VAULT-EXECUTION | hs-d4e5f6a7-... | RETRY-1 | NEXUS
2024-11-15T10:46:01.000Z | VAULT-FOUNDATIONS | VAULT-EXECUTION | hs-d4e5f6a7-... | SUCCESS | AGENT-99
2024-11-15T14:00:00.000Z | VAULT-NET-SEEDS | VAULT-CHAOS | hs-e5f6a7b8-... | REJECTED | NEXUS
```

---

## Ledger Write Rules

1. Every entry is written immediately — no batch writes to the ledger
2. Failed writes are retried 3 times. Three failures = Oracle alert + emergency manual log
3. Entries are append-only — no UPDATE or DELETE operations on ledger rows
4. Each entry includes the hash of the previous entry for chain integrity

---

## WAL Streaming to R2

The Nexus Ledger D1 database streams its Write-Ahead Log (WAL) to R2 every 6 hours:

- R2 bucket: `phoenix-nexus-ledger-archive`
- Object key: `nexus-ledger/<year>/<month>/<date>/<HH00>.wal`
- Compression: gzip (to minimize R2 storage use)
- Verification: Hash of WAL file stored as object metadata for integrity check

**D1 retention: 90 days (hot, queryable). R2 retention: Permanent.**

---

## Hash Chaining for Tamper Detection

Each ledger entry includes:

```
entry_hash = SHA-256(timestamp + vault_a + vault_b + handshake_id + status + agent + prev_entry_hash)
```

Oracle runs a daily integrity check on the previous 7 days of Nexus ledger entries. Any hash chain break triggers:
- `LEDGER_TAMPER_DETECTED` event
- Drift score 5
- Immediate Agent-100 notification
- Full investigation before any operations resume

The Nexus Ledger is also linked to the Phoenix Merkle Ledger at weekly intervals — the final entry hash of each week is embedded in the Merkle ledger, creating an immutable cross-reference point.

---

## Retention Policy

| Layer | Retention | Authority to Delete |
|-------|-----------|---------------------|
| D1 (hot) | 90 days | Agent-100 + PHOENIXMASTERKEY |
| R2 (cold) | Permanent | Agent-100 + PHOENIXMASTERKEY |
| Merkle reference | Permanent | Cannot be deleted — it's in the Merkle chain |

**No entry is ever deleted in routine operations. Deletion is an extraordinary act requiring Agent-100 and PHOENIXMASTERKEY.**
