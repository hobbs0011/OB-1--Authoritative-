# 16 — ORACLE GATE SYSTEM

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / MONITORING
**Vault:** VAULT-ORACLE
**Classification:** OPERATIONAL — GATE PROTOCOL

---

## Purpose

Oracle gates control what intelligence is allowed to progress through the Phoenix system. No unverified intelligence reaches Agent-99. No bad research becomes action. No drift passes through unchecked. This document defines Oracle's six-gate system: O-G0 through O-G5.

**FAIL-CLOSED. Always. No gate is bypassed without PHOENIXMASTERKEY. Every bypass is logged.**

---

## The Six Oracle Gates

### O-G0 — Source Verification

| Field | Detail |
|-------|--------|
| **Gate** | O-G0 |
| **Name** | Source Verification |
| **PASS Condition** | Source is on the Oracle approved source list AND source metadata is complete (origin, timestamp, source type) |
| **FAIL Condition** | Unknown source, missing metadata, or source flagged as unreliable in prior Oracle session |
| **Escalation** | FAIL → Source rejected. Not logged as intelligence. Agent-99 notified if source was submitted by an agent. |

---

### O-G1 — Format Compliance

| Field | Detail |
|-------|--------|
| **Gate** | O-G1 |
| **Name** | Format Compliance |
| **PASS Condition** | Research output follows pheromone trail format OR approved Oracle output format. No Wikipedia voice. No citation dumps. Operational tone confirmed. |
| **FAIL Condition** | Output contains prohibited formatting: Wikipedia voice, citation dump, encyclopedic filler, academic hedging |
| **Escalation** | FAIL → Output rejected. Reformat request sent to originating model. Three format fails from same source = source flagged. |

---

### O-G2 — Drift Score Check

| Field | Detail |
|-------|--------|
| **Gate** | O-G2 |
| **Name** | Drift Score Check |
| **PASS Condition** | Drift score 0–2. Content does not contradict active canon, Rome declarations, or Soul DNA. |
| **FAIL Condition** | Drift score 3 or higher |
| **Escalation** | Score 3: Halt + Agent-99. Score 4: Halt + Agent-99 + Agent-100. Score 5: Emergency halt + Agent-100 + vault lockdown. |

---

### O-G3 — Cross-Vault Consistency

| Field | Detail |
|-------|--------|
| **Gate** | O-G3 |
| **Name** | Cross-Vault Consistency |
| **PASS Condition** | Intelligence does not contradict any document in any of the 9 vaults. Any new claim that touches another vault is verified against that vault's current content. |
| **FAIL Condition** | Intelligence contradicts existing vault content. Conflict type detected (Type 1, 2, or 3 per cross-vault conflict classification). |
| **Escalation** | Type 2 conflict: Flag to Agent-99. Type 1 or 3: Halt + Agent-100. Intelligence is quarantined pending resolution. |

---

### O-G4 — Agent Authorization Check

| Field | Detail |
|-------|--------|
| **Gate** | O-G4 |
| **Name** | Agent Authorization Check |
| **PASS Condition** | The intelligence or action has been requested or authorized by an agent with the authority to do so. Agent-99 authorized for operational intel. Agent-100 authorized for strategic intel and law declarations. |
| **FAIL Condition** | Intelligence submitted by an unauthorized source (Agent-98 attempting to issue operational directives, Legion attempting to modify curriculum standards, unknown submitter) |
| **Escalation** | FAIL → Submission rejected. Submitting agent flagged. Agent-99 notified immediately. |

---

### O-G5 — Intelligence Confirmed

| Field | Detail |
|-------|--------|
| **Gate** | O-G5 |
| **Name** | Intelligence Confirmed |
| **PASS Condition** | Intelligence has cleared O-G0 through O-G4. Content is verified, formatted, drift-clean, vault-consistent, and properly authorized. Ready to deliver to Agent-99 or Agent-100. |
| **FAIL Condition** | Any prior gate has an unresolved FAIL. Or: Agent-100 manually rejects intelligence even after O-G0 through O-G4 pass. |
| **Escalation** | O-G5 FAIL → Intelligence is archived as REJECTED. Full rejection log maintained. PHOENIXMASTERKEY required to re-submit rejected intelligence. |

---

## Gate Flow

```
Raw input received
        ↓
O-G0: Source Verification → FAIL? Reject.
        ↓
O-G1: Format Compliance → FAIL? Reformat or reject.
        ↓
O-G2: Drift Score Check → FAIL? Escalate by score.
        ↓
O-G3: Cross-Vault Consistency → FAIL? Quarantine + escalate.
        ↓
O-G4: Agent Authorization Check → FAIL? Reject + flag agent.
        ↓
O-G5: Intelligence Confirmed → FAIL? Archive as REJECTED.
        ↓
PASS: Intelligence delivered to Agent-99 or Agent-100.
```

---

## PHOENIXMASTERKEY Bypass Protocol

**Only Agent-100 (Michael Hobbs) can issue a PHOENIXMASTERKEY gate bypass.**

If a bypass is issued:
1. PHOENIXMASTERKEY authorization is logged before the bypass executes
2. The specific gate being bypassed is logged
3. The reason for bypass is recorded in plain language
4. Oracle continues to monitor the bypassed intelligence — bypass does not disable drift detection
5. Agent-99 is notified of every bypass within 1 hour

**No agent other than Agent-100 can issue a PHOENIXMASTERKEY bypass. Any attempt by another agent triggers drift score 5 and immediate Agent-100 alert.**
