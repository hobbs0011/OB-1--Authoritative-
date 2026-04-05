# 18 — ORACLE LEDGER

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / MONITORING
**Vault:** VAULT-ORACLE
**Classification:** OPERATIONAL — IMMUTABLE EVENT LOG

---

## Purpose

The Oracle Ledger is the immutable event record of everything Oracle sees, flags, and reports. Every drift event, every gate check, every agent heartbeat, every intelligence confirmation — it all goes in the ledger. **The ledger cannot be modified after writing. Any attempt to modify it is detected and treated as a score-5 breach.**

---

## Ledger Format

Every ledger entry follows this exact format:

```
timestamp | event_type | vault | agent | drift_score | action_taken
```

**Field definitions:**

| Field | Format | Description |
|-------|--------|-------------|
| `timestamp` | ISO 8601 (UTC) | Exact time of event — to millisecond precision |
| `event_type` | Uppercase enum (see below) | What type of event this is |
| `vault` | VAULT-[NAME] or SYSTEM | Which vault or system component is involved |
| `agent` | ORACLE / AGENT-99 / AGENT-98 / AGENT-100 / SYSTEM | Who triggered or is subject of this event |
| `drift_score` | 0–5 or N/A | Drift score if applicable. N/A for non-drift events. |
| `action_taken` | Free text (max 200 chars) | What Oracle did in response to this event |

---

## Event Type Enum

| Event Type | Description |
|------------|-------------|
| `DRIFT_CHECK` | Oracle ran a drift check on an agent output or document |
| `GATE_PASS` | An Oracle gate passed |
| `GATE_FAIL` | An Oracle gate failed |
| `AGENT_HEARTBEAT` | Agent heartbeat received and logged |
| `AGENT_UNRESPONSIVE` | Agent failed to respond to heartbeat within timeout |
| `ESCALATION` | Event escalated to Agent-99 or Agent-100 |
| `INTELLIGENCE_CONFIRM` | Intelligence cleared all gates — O-G5 pass |
| `INTELLIGENCE_REJECT` | Intelligence rejected at one or more gates |
| `VAULT_CHANGE` | A vault document was modified |
| `VAULT_CONFLICT` | Cross-vault conflict detected |
| `CONFLICT_RESOLVED` | Cross-vault conflict resolved |
| `REVENUE_CONFIRM` | Revenue event confirmed (Solana + D1 match) |
| `REVENUE_DISCREPANCY` | Revenue discrepancy detected |
| `SOLANA_CONFIRM` | On-chain Solana transaction confirmed |
| `CODE_DEPLOY` | Codex-generated code deployed to production |
| `DUMP_INGEST` | Raw dump successfully ingested and processed |
| `DUMP_REJECT` | Raw dump rejected at ingestion |
| `REDACTION` | Secrets redacted from ingested content |
| `NOTEBOOKLM_INGEST` | Vault doc loaded into NotebookLM notebook |
| `TRAIL_CREATED` | New pheromone trail created |
| `TRAIL_RESOLVED` | Pheromone trail marked VERIFIED or ROME_LAW |
| `PHOENIXMASTERKEY_BYPASS` | Gate bypassed with PHOENIXMASTERKEY authority |
| `COST_ALERT` | AI cost threshold approached or exceeded |

---

## Sample Ledger Entries

```
2024-11-15T09:42:00.412Z | DRIFT_CHECK | VAULT-NET-SEEDS | AGENT-99 | 0 | Output clean. No action.
2024-11-15T10:15:33.007Z | GATE_FAIL | VAULT-ORACLE | ORACLE | N/A | O-G2 fail. Drift score 3 in research output from Gemini. Halted. Agent-99 alerted.
2024-11-15T10:16:01.234Z | ESCALATION | VAULT-ORACLE | AGENT-99 | 3 | Drift score 3 research output escalated to Agent-99. Pending review.
2024-11-15T11:00:00.000Z | AGENT_HEARTBEAT | SYSTEM | AGENT-99 | N/A | Heartbeat received. Tasks: 3 active, 0 blocked. Status: CLEAN.
2024-11-15T14:22:17.881Z | REVENUE_CONFIRM | VAULT-NET-SEEDS | ORACLE | N/A | HCMC node payment confirmed. SOL tx verified. D1 updated. Amount matches.
2024-11-15T16:45:00.123Z | TRAIL_CREATED | VAULT-ORACLE | ORACLE | N/A | PHT-2024-0031 created. Tags: INFRA, REVENUE. Status: PENDING.
2024-11-15T18:30:00.000Z | CODE_DEPLOY | VAULT-EXECUTION | AGENT-99 | N/A | Staging pass. Production deploy via Wrangler. Health check OK.
```

---

## Storage Architecture

**Hot storage — Cloudflare D1:**
- All ledger entries written to D1 database: `oracle-ledger` table
- Retention: 90 days in D1 (hot, query-able)
- D1 primary key: `entry_id` (UUID, auto-generated)
- Query latency target: <10ms for any ledger lookup

**Cold storage — Cloudflare R2:**
- WAL (Write-Ahead Log) streaming to R2 every 24 hours
- R2 bucket: `phoenix-oracle-ledger-archive`
- Retention: Permanent. No expiry.
- R2 objects named: `ledger/<year>/<month>/<date>/oracle-ledger-<timestamp>.wal`

**Recovery:** If D1 is corrupted or lost, the ledger can be fully reconstructed from R2 WAL archives. Recovery procedure requires Agent-100 authorization.

---

## Hash Chaining — Tamper Detection

Each ledger entry includes a hash of its own content plus the hash of the previous entry:

```
entry_hash = SHA-256(timestamp + event_type + vault + agent + drift_score + action_taken + prev_entry_hash)
```

The first entry in each day uses the previous day's final entry hash as the `prev_entry_hash`.

**Tamper detection:** To verify ledger integrity, re-compute all entry hashes sequentially. Any hash mismatch indicates tampering at that entry. Oracle runs a daily integrity check on the past 7 days of entries. A hash mismatch triggers drift score 5 and immediate Agent-100 alert.

---

## Retention Policy Summary

| Storage Layer | Retention | Queryable | Authority to Delete |
|---------------|-----------|-----------|---------------------|
| D1 (hot) | 90 days | Yes — full SQL query | Agent-100 only |
| R2 (cold) | Permanent | Via export only | Agent-100 only — requires PHOENIXMASTERKEY |

**No ledger entry is ever deleted without Agent-100 authorization. Deleting ledger entries is the equivalent of destroying legal records in the Phoenix system. It requires PHOENIXMASTERKEY and is logged in the Sovereign vault.**
