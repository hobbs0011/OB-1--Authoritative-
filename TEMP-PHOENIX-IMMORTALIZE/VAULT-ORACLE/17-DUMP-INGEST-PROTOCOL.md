# 17 — DUMP INGEST PROTOCOL

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / MONITORING
**Vault:** VAULT-ORACLE
**Classification:** OPERATIONAL — INGESTION SOVEREIGNTY

---

## Purpose

Stage 101–130. This is the ingestion sovereignty layer. Raw data dumps arrive from Telegram, Zalo, and chat logs. They are messy, unstructured, and potentially contaminated with noise, secrets, or Researcher Mode drift. This protocol converts raw dumps into verified, tagged, classified intelligence. **Nothing from a raw dump reaches a vault without clearing this protocol.**

---

## Source Aggregation

Oracle ingests dumps from three primary raw sources:

| Source | Type | Agent Responsible | Typical Volume |
|--------|------|-------------------|----------------|
| Telegram channels | Chat logs, audio transcripts | Agent-98 (field) | 50–200 messages/day |
| Zalo groups | Vietnam-local communications, student/teacher comms | Agent-98 (field) | 100–500 messages/day |
| Direct chat logs | Agent-99 / Agent-100 session exports | Agent-99 | 5–20 sessions/week |

All dumps are submitted to Oracle via the ingestion endpoint (Cloudflare Worker: `oracle-ingest.workers.dev`). Direct file drops to D1 are not permitted — all ingestion goes through the Worker.

---

## [DUMP:...] Header Strictness Rules

Every dump submitted to Oracle MUST begin with a valid `[DUMP:...]` header. No header = dump rejected immediately.

**Required header format:**
```
[DUMP:SOURCE=<source_name>|DATE=<YYYY-MM-DD>|TIME=<HH:MM:SS UTC>|AGENT=<submitting_agent>|TYPE=<TELEGRAM|ZALO|CHAT>|HASH=<sha256_of_content>]
```

**Header validation rules:**
- `SOURCE` field must match an approved source name in Oracle's source registry
- `DATE` and `TIME` must be valid ISO format and must be in the past (future timestamps = REJECT)
- `AGENT` must be an authorized agent (Agent-99, Agent-98, or Agent-100)
- `TYPE` must be one of: TELEGRAM, ZALO, CHAT
- `HASH` must match the SHA-256 of the dump content (tamper detection)

**Header validation failure = dump rejected at intake. No partial processing.**

---

## [/DUMP] Footer Verification

Every dump must close with `[/DUMP]`. Content after `[/DUMP]` is stripped and discarded.

**Footer checks:**
- Footer must be present (missing footer = incomplete dump, reject with `INCOMPLETE_DUMP` error)
- Content length between header and footer must match content hash in header
- If content has been modified after hash was computed: `HASH_MISMATCH` → reject + alert Agent-99

---

## Timestamp Monotonic Check

Dumps within a session must have monotonically increasing timestamps. A dump with timestamps that go backwards indicates:
- Out-of-order assembly of chat logs
- Potential tampering
- Data corruption

**Action:** Flag the dump as `TIMESTAMP_ERROR`. Submit to Agent-99 for manual review. Do not auto-ingest.

---

## Duplicate Hash Rejection

Oracle maintains a hash registry of all ingested dumps (stored in D1). On submission:

1. Compute SHA-256 of incoming dump content
2. Check hash against D1 hash registry
3. If hash exists: `DUPLICATE_REJECT` — log the event, do not process again
4. If hash is new: Continue ingestion pipeline

**Duplicate ingestion is a common error (agents submitting the same log twice). It is not treated as a security event unless the same hash arrives from different claimed sources.**

---

## Redaction of Secrets Before Ingestion

Before any dump content enters Oracle's processing pipeline:

**Auto-redaction scan checks for:**
- API keys and tokens (regex patterns for common formats: Bearer tokens, hex strings > 32 chars)
- Wallet addresses (Solana base58, Ethereum 0x format)
- Password strings (any field labeled `password`, `passwd`, `secret`, `key`)
- PHOENIXMASTERKEY values
- Personal identification data (Vietnamese ID numbers, passport numbers)

**If secrets detected:**
- Secrets are replaced with `[REDACTED-<type>]` placeholder
- Redaction event logged: `event_type: REDACTION | count: [N] | type: [types detected]`
- Agent-99 notified of redaction event
- Original unredacted content is NOT stored anywhere in the Phoenix system

---

## Cold Storage Archive to R2

After successful ingestion and processing, the redacted and tagged dump is archived to R2:

```
Bucket: phoenix-oracle-dumps
Key: dumps/<year>/<month>/<date>/<AGENT>/<HASH>.json
Metadata: { tags, source, agent, ingestion_timestamp, classification }
```

R2 archives are permanent. They are the cold record of all Oracle ingestion activity. D1 holds the processed intelligence (hot, 90-day retention). R2 holds the raw-processed archive (permanent).

---

## Classification and Tag Taxonomy

Every dump, after passing header/footer/hash checks and redaction, is classified and tagged.

**Classification levels:**

| Level | Name | Description |
|-------|------|-------------|
| L1 | OPERATIONAL | General field operations, classroom observations, student data |
| L2 | SENSITIVE | Revenue data, agent communications, strategy discussions |
| L3 | RESTRICTED | Soul DNA references, Rome Protocol content, Agent-100 directives |

**Full Tag Taxonomy:**

| Tag | Domain | Description |
|-----|--------|-------------|
| AUTH | Authority | Content about agent roles, authority chains, access control |
| WRANGLER | Infrastructure | Cloudflare Wrangler configs, deployment scripts, infra changes |
| DO_SQLITE | Database | Durable Objects and SQLite/D1 operations |
| ROME | Governance | Rome Protocol declarations, law changes, truth anchors |
| REVENUE | Finance | Revenue data, franchise fees, Solana transactions |
| PEDAGOGY | Curriculum | Teaching methods, curriculum content, student outcomes |
| FAILURE | Incident | Documented failures — triggers pheromone trail |
| FIX | Resolution | Documented fixes for logged failures |
| VERIFY | Confirmation | Verification that a fix worked |
| GOSPEL444 | Canon | Content referencing core Gospel 444 alignment rules |

**Multiple tags per dump allowed. Minimum one tag required.**

---

## Gospel 444 Alignment Check

All ingested dumps are checked for Gospel 444 alignment. Gospel 444 defines the core operating frequency of Phoenix. Any dump content that contradicts Gospel 444 principles is flagged with drift score 3 before further processing.

**STOP gate:** If Researcher Mode is detected in any dump (encyclopedic voice, citation dumps, academic hedging), the dump is quarantined. `RESEARCHER_MODE_DETECTED` alert sent to Agent-99. The dump is not processed further until Agent-99 manually reviews and authorizes stripped-and-resubmitted version.

**Researcher Mode is incompatible with Phoenix operations. It does not get ingested. Period.**
