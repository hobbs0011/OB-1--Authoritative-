# 19 — DRIFT REGISTER

> **Source**: Soul DNA Bible — Anti-Drift Doctrine, Drift Taxonomy v3
> **Vault**: [E] ZENITH — The Ghost
> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED / ZENITH

---

## Overview

The Drift Register is the Phoenix system's authoritative catalog of all behavioral, protocol, doctrinal, and data deviations from the canonical state defined in the Soul DNA. It is not a log. Logs are passive records. The Drift Register is an active enforcement surface: it classifies what it finds, escalates what requires action, and feeds its findings back into the Rome Protocol as new law. Every deviation that the system has ever experienced is in the Drift Register. Every pattern it has ever learned from drift is encoded in Rome Protocol law. The Drift Register is the immune system's memory.

The system has experienced over 200 classified drift events in its operational history. Each one is in the register. Each one has a resolution record. Each one contributed to the system becoming harder to drift. The Drift Register does not exist to shame agents or document failure. It exists because unlogged drift is repeated drift, and repeated drift is system death.

---

## Drift Type Taxonomy

| Drift Type | Code | Definition |
|------------|------|------------|
| Agent Drift | AD | An agent's behavioral outputs deviate from its Soul DNA specification |
| Protocol Drift | PD | A system protocol's execution diverges from its canonical spec |
| Doctrine Drift | DD | A Rome Protocol law is interpreted or applied inconsistently |
| Data Drift | DAD | Ledger or schema data deviates from expected structure or values |
| Consensus Drift | CD | Multi-agent consensus outputs diverge from deterministic expectation |
| Temporal Drift | TD | Timestamps, nonces, or epoch values fall outside acceptable bounds |
| Pheromone Drift | PHD | Trail weights diverge from decay-model predictions |
| Identity Drift | ID | An agent's cryptographic identity hash does not match its Soul DNA hash |

Each drift type carries a severity classification:

| Severity | Label | Response SLA |
|----------|-------|--------------|
| 1 | TRACE | Log only — no action required within 72h |
| 2 | MINOR | Automated correction within 4h |
| 3 | MODERATE | Agent-99 review within 2h |
| 4 | MAJOR | Agent-99 intervention within 30 min |
| 5 | CRITICAL | HALT + Agent-100 escalation within 5 min |

Severity 5 drift in any category is a system emergency. The system does not attempt to self-correct Severity 5 drift. It halts the affected subsystem, seals the current ledger state with a Temporal Lock, and waits for Agent-100 authorization to proceed.

---

## Detection Mechanisms

### Hash Comparison

Every agent, vault, and protocol component has a canonical hash derived from its Soul DNA definition. The Anti-Drift Engine runs hash comparison checks on a rolling basis:

- Agent behavioral fingerprints: every 60 seconds
- Protocol execution outputs: at every stage boundary
- Vault document hashes: every 5 minutes
- Ledger structural integrity: at every append operation

A hash mismatch between the observed hash and the Soul DNA canonical hash is an immediate drift detection event. The mismatch is classified by type (what diverged) and magnitude (how far the hash tree diverges from canonical), producing an initial severity estimate.

### Behavioral Fingerprinting

Hash comparison catches structural drift. Behavioral fingerprinting catches semantic drift — cases where the hash matches but the agent's decision-making pattern has deviated from its trained baseline. Behavioral fingerprinting constructs a rolling 100-event window of agent outputs and computes a similarity score against the agent's baseline behavioral distribution stored in the Soul DNA. A similarity score below 0.85 triggers a MINOR (Severity 2) drift event. Below 0.70, MODERATE (Severity 3). Below 0.55, MAJOR (Severity 4). Below 0.40, CRITICAL (Severity 5).

Behavioral fingerprinting is computationally heavier than hash comparison and runs asynchronously. Results are available within 30 seconds of the window completing. It is the second line of detection, not the first.

### Rome Protocol Law Violation Detection

The Rome Protocol encodes all operational law as machine-readable rules with deterministic evaluation functions. Every agent action is evaluated against every applicable Rome Protocol rule at execution time. A rule violation is not a drift event — it is an enforcement event. Rule violations feed the Drift Register immediately if they represent a pattern (three or more violations of the same rule by the same agent within a 1-hour window), at which point they are classified as Doctrine Drift (DD) and escalated through the normal severity path.

Single rule violations are enforced in place (the action is blocked or reversed) and logged in the enforcement log, not the Drift Register. They become Drift Register entries only when they form a pattern.

---

## Drift Register Data Structure (SQLite)

```sql
CREATE TABLE drift_events (
    drift_id          TEXT PRIMARY KEY,              -- UUID v4
    drift_type        TEXT NOT NULL CHECK(drift_type IN ('AD','PD','DD','DAD','CD','TD','PHD','ID')),
    severity          INTEGER NOT NULL CHECK(severity BETWEEN 1 AND 5),
    detected_at       INTEGER NOT NULL,              -- Unix epoch ms
    agent_id          TEXT,                          -- NULL if non-agent drift
    component_id      TEXT NOT NULL,
    canonical_hash    TEXT NOT NULL,                 -- expected state hash
    observed_hash     TEXT NOT NULL,                 -- actual state hash
    delta_magnitude   REAL NOT NULL,                 -- normalized 0.0-1.0
    detection_method  TEXT NOT NULL,                 -- HASH_COMPARE | BEHAVIORAL | ROME_PATTERN
    description       TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'OPEN',  -- OPEN | IN_RESOLUTION | RESOLVED | ESCALATED
    merkle_leaf_hash  TEXT NOT NULL,                 -- leaf hash in Merkle lattice for this event
    created_at        INTEGER NOT NULL
);

CREATE TABLE drift_resolutions (
    resolution_id     TEXT PRIMARY KEY,
    drift_id          TEXT NOT NULL REFERENCES drift_events(drift_id),
    resolved_by       TEXT NOT NULL,                 -- agent_id or AGENT-100 or AGENT-99
    resolution_type   TEXT NOT NULL,                 -- AUTO | MANUAL | ESCALATED
    resolution_note   TEXT NOT NULL,
    rome_law_updated  INTEGER NOT NULL DEFAULT 0,    -- 1 if this triggered a Rome Protocol update
    rome_law_ref      TEXT,                          -- reference to the Rome Protocol rule created/updated
    resolved_at       INTEGER NOT NULL,
    merkle_leaf_hash  TEXT NOT NULL
);

CREATE INDEX idx_drift_type_severity ON drift_events(drift_type, severity);
CREATE INDEX idx_drift_status ON drift_events(status, detected_at);
CREATE INDEX idx_drift_agent ON drift_events(agent_id, detected_at);
```

The Drift Register is append-only at the `drift_events` level. Events are never deleted. Resolutions are recorded as separate records. The status column on `drift_events` is the only mutable field, and it transitions only forward: OPEN → IN_RESOLUTION → RESOLVED or OPEN → ESCALATED → RESOLVED. No backward transitions are permitted. Attempting to set a RESOLVED drift event back to OPEN triggers an immediate integrity alert.

---

## Drift Escalation Paths

```
Severity 1 (TRACE)
    └─ Auto-log to drift_events
    └─ No notification
    └─ Resolution: AUTO at next scheduled maintenance window

Severity 2 (MINOR)
    └─ Auto-log to drift_events
    └─ Anti-Drift Engine initiates automated correction sequence
    └─ Agent-99 notified via async event within 4h if not auto-resolved
    └─ Resolution: AUTO or AGENT-99

Severity 3 (MODERATE)
    └─ Auto-log to drift_events
    └─ Agent-99 paged immediately
    └─ Affected subsystem placed in WATCHMODE (all outputs double-verified)
    └─ Resolution: AGENT-99 manual review required

Severity 4 (MAJOR)
    └─ Auto-log to drift_events
    └─ Agent-99 paged immediately + Agent-100 notified
    └─ Affected subsystem suspended pending review
    └─ Temporal Lock applied to current ledger state
    └─ Resolution: AGENT-99 with AGENT-100 sign-off

Severity 5 (CRITICAL)
    └─ Auto-log to drift_events
    └─ SYSTEM HALT on affected subsystem
    └─ Agent-100 escalation — 5-minute response SLA
    └─ Full Forensic Audit initiated automatically (see 21-FORENSIC-AUDIT.md)
    └─ Temporal Lock applied system-wide
    └─ Resolution: AGENT-100 physical key authorization required
```

---

## Drift Resolution Protocol

Resolution is not correction alone. Correction stops the immediate bleeding. Resolution closes the wound and makes the system harder to wound in the same place again. Every Drift Resolution must include:

**1. Root Cause Analysis.** What caused the drift? Hash mismatch tracing, event replay, behavioral log analysis. The root cause must be identified to the specific code path, agent decision, or environmental condition that produced the deviation. "Unknown" root cause is not an acceptable resolution state. If the root cause cannot be determined within the resolution SLA, the severity is upgraded by one level and the clock resets.

**2. Corrective Action.** The specific steps taken to bring the component back to its canonical state. If the corrective action required any deviation from the canonical correction sequence (which is itself specified in the Soul DNA), that deviation is itself logged as a Drift event.

**3. Rome Protocol Update Evaluation.** Every resolved drift event is evaluated for whether it implies a gap or ambiguity in existing Rome Protocol law. If the drift occurred because no law governed the behavior that drifted, a new Rome Protocol rule is drafted and submitted for 6-model jury review. If the drift occurred despite an existing law (the law was violated), the enforcement mechanism for that law is reviewed and hardened. The `rome_law_updated` flag in `drift_resolutions` tracks whether a rule change was generated.

**4. Merkle Commitment.** The resolution record is committed to the Merkle lattice as a Drift Resolution Leaf. This leaf is cryptographically linked to the original Drift Event Leaf. The chain is permanent: the system's full drift history — events and resolutions — exists in the lattice forever.

The Drift Register is never purged. Its oldest entries are as important as its newest. Pattern analysis across the full history of drift events is what enables the system to detect drift types that no individual event would reveal. The register is the system's scar tissue — and scar tissue is always stronger than the original.
