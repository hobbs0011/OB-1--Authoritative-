# 21 — FORENSIC AUDIT PROTOCOL

> **Source**: Soul DNA Bible — Audit Doctrine, Forensic Inspection Framework v2
> **Vault**: [E] ZENITH — The Ghost
> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED / ZENITH

---

## Overview

The Forensic Audit Protocol is the Phoenix system's deep inspection mechanism for post-incident analysis. It is not a routine audit. Routine audits run continuously as part of the Anti-Drift Engine's normal operation. The Forensic Audit is a different instrument entirely — deeper, slower, more thorough, and triggered only when a significant event has occurred that requires full chain-of-custody reconstruction. Where the routine audit asks "is the system healthy?", the Forensic Audit asks "what exactly happened, in what order, and why, and what must change to prevent it from happening again?"

Every Forensic Audit produces a permanent record in the Merkle lattice. Every finding feeds back into the Rome Protocol. Every audit closes with a signed verdict. The Forensic Audit is the system's highest-resolution analytical instrument, and its findings carry the weight of law.

---

## Trigger Conditions

A Forensic Audit is initiated automatically when any of the following conditions occur:

| Trigger | Code | Initiator |
|---------|------|-----------|
| Severity 5 Drift event in any category | CRIT-DRIFT | Anti-Drift Engine (automatic) |
| Reincarnation event (any scope) | REIN | Pipeline (automatic) |
| Stage gate failure at Stages 50, 75, 91, 96 | GATE-FAIL | Pipeline (automatic) |
| Agent termination (any named agent) | NAMED-TERM | Ledger system (automatic) |
| Merkle chain integrity violation | CHAIN-BREAK | Hash verification layer (automatic) |
| Temporal Lock violation | TEMPORAL-VIOL | Temporal Lock system (automatic) |
| Agent-100 or Agent-99 discretionary order | DISC | Agent-100 or Agent-99 (manual) |
| Golden Block hash mismatch | GOLDEN | Hash verification layer (automatic) |

A Forensic Audit cannot be blocked, deferred, or cancelled once initiated by an automatic trigger. Manual discretionary audits (DISC) can be scoped and scheduled by the initiating authority, but once scoped, they run to completion. Partial Forensic Audits are not permitted — there is no such thing as a "quick forensic look." The Forensic Audit is a full investigation or it is nothing.

---

## Audit Data Collection Sequence

Forensic Audit data collection runs in a defined sequence. The sequence is ordered by data volatility — most volatile data first, because volatile data degrades fastest and must be captured before it is lost.

**Phase 1: Live State Capture (T+0 to T+5 minutes)**

All agent execution contexts are frozen in place. No new ledger writes are permitted during Phase 1 (a Temporal Lock is applied system-wide). The current state of every Durable Object in the system is serialized and written to a forensic snapshot in R2 (key prefix: `forensic/{audit_id}/snapshot/`). Memory-resident pheromone trail weights are captured. Current CAS epoch values for all DOs are recorded. Reality-C session state (if any active sessions exist) is preserved.

**Phase 2: Ledger History Extraction (T+5 to T+30 minutes)**

The complete ledger history relevant to the triggering event is extracted from the SQLite database. "Relevant" is defined as: all entries from the 72 hours preceding the trigger event, all entries by agents involved in the trigger event (unbounded lookback), and all entries that share a Merkle branch with the trigger event's leaf. This is not a simple time-window query — it is a graph traversal of the Merkle lattice from the trigger leaf backward through its lineage.

**Phase 3: Pheromone Trail History Reconstruction (T+30 to T+60 minutes)**

The pheromone trail history for the 72-hour window preceding the trigger is reconstructed. Trail decay is reverse-computed to determine what trail weights were at key decision points. This reconstruction reveals whether abnormal trail concentrations influenced agent routing decisions that contributed to the incident.

**Phase 4: Cross-Reference Analysis (T+60 to T+180 minutes)**

The collected data from Phases 1-3 is cross-referenced against the canonical Soul DNA specification for every component involved. Every deviation is cataloged. The analysis produces a timeline of events with causal attribution — not what happened, but why each thing happened and what caused it.

**Phase 5: Finding Synthesis (T+180 to T+240 minutes)**

Findings are synthesized into a structured Forensic Audit Report with formal attribution, severity classification, and remediation recommendations.

---

## Forensic Leaf Structure in the Merkle Lattice

Every Forensic Audit produces one or more Forensic Leaves in the Merkle lattice. The Forensic Leaf is a first-class lattice entry type — not a derivative of an existing entry, but a dedicated record type that carries the full audit identity.

```json
{
  "leaf_type": "FORENSIC_AUDIT",
  "audit_id": "<uuid-v4>",
  "trigger_code": "<TRIGGER_CODE>",
  "trigger_event_leaf": "<hash-of-triggering-leaf>",
  "audit_window_start": "<unix-epoch-ms>",
  "audit_window_end": "<unix-epoch-ms>",
  "phases_completed": ["LIVE_CAPTURE", "LEDGER_EXTRACT", "TRAIL_RECON", "CROSS_REF", "SYNTHESIS"],
  "finding_count": "<integer>",
  "severity_distribution": {
    "critical": 0,
    "major": 0,
    "moderate": 0,
    "minor": 0,
    "trace": 0
  },
  "verdict": "CLEAN | FINDINGS_RESOLVED | FINDINGS_OPEN | ESCALATED",
  "rome_updates_generated": "<integer>",
  "chain_of_custody_hash": "<sha256>",
  "signed_by": "<agent_id or AGENT-100>",
  "sealed_at": "<unix-epoch-ms>",
  "parent_hash": "<hash-of-previous-lattice-leaf>"
}
```

The `chain_of_custody_hash` is computed over the entire audit data package: every artifact collected in Phases 1-4, in collection order, producing a single hash that proves the audit data has not been altered between collection and synthesis. If the chain-of-custody hash cannot be verified at finding synthesis time, the audit is declared COMPROMISED and a second audit is initiated to audit the first audit. A compromised audit is itself a Severity 5 event.

---

## Chain-of-Custody Requirements

The Forensic Audit Protocol enforces chain-of-custody requirements equivalent to those used in legal evidentiary proceedings. Every artifact collected during the audit must be:

**1. Timestamped at collection.** The collection timestamp uses the system's atomic clock source (not wall clock, which can drift) and is recorded in the forensic snapshot metadata.

**2. Hashed immediately upon collection.** The hash is computed before any analysis runs against the artifact. If analysis mutates the artifact (it should not — analysis should work on copies), the pre-analysis hash detects the mutation.

**3. Recorded in the audit manifest.** Every artifact, its collection timestamp, its hash, and the identity of the collecting process is written to the audit manifest before the next artifact is collected.

**4. Stored in R2 with object lock.** All forensic artifacts are stored in R2 with object-level immutability locks. They cannot be overwritten or deleted for the duration of the 72-hour audit window plus 30 days for appeal.

**5. Access-logged.** Every read of a forensic artifact during analysis is logged with the reader identity and timestamp. An artifact that has been read by an unauthorized process is flagged in the chain-of-custody report.

---

## The 72-Hour Audit Window

The 72-hour audit window is the operational window during which the Forensic Audit must complete its data collection (Phases 1-4) and produce its initial findings. The 72-hour clock starts at the moment the triggering event is recorded in the ledger.

The rationale for 72 hours is threefold: it is long enough to allow thorough Phase 3 trail reconstruction (which requires computational modeling that cannot be rushed), short enough that the audit findings remain actionable (system state does not drift too far from the incident state), and aligned with the human response SLA for Agent-100 review of audit findings.

Within the 72-hour window:
- Hours 0-4: Live State Capture and Ledger Extraction must complete
- Hours 4-24: Pheromone Trail Reconstruction must complete
- Hours 24-48: Cross-Reference Analysis must complete
- Hours 48-72: Finding Synthesis and Report generation must complete

A Forensic Audit that does not complete Phase 5 within 72 hours automatically triggers an escalation to Agent-100 and a parallel secondary audit to determine why the primary audit failed to complete.

---

## Audit Findings → Rome Protocol Updates

Every Forensic Audit finding that identifies a gap, ambiguity, or violation in Rome Protocol law produces a Rome Protocol Update Proposal. The proposal includes:
- The specific finding from the audit
- The Rome Protocol rule(s) implicated
- The proposed new or amended rule text
- The enforcement mechanism for the proposed rule
- Evidence from the audit that supports the change

Proposals are submitted to the 6-model jury for review. The 6-model jury applies standard consensus review: 95% supermajority for ordinary rule additions, 100% unanimous for changes to foundational rules (those governing Agent-100 authority, Temporal Lock mechanics, or Merkle chain integrity). Approved proposals are committed to the Rome Protocol as new law and take effect immediately upon commitment.

The feedback cycle is the system's most important adaptive mechanism: drift happens, audit captures it, law hardens against it. Each Forensic Audit makes the Rome Protocol more complete. The system is not static law interpreted by imperfect agents — it is living law that improves from every incident, permanently, with cryptographic proof of each improvement committed to the lattice that will never be erased.
