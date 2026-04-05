# 17 — NEXUS GATE SYSTEM

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / CONNECTING
**Vault:** VAULT-NEXUS
**Classification:** OPERATIONAL — GATE PROTOCOL

---

## Purpose

Nexus gates control the progression of every cross-vault handshake from initiation to completion. No handshake jumps to execution without clearing all gates. Bad data, unauthorized requests, and Rome violations are stopped here — at the gate — before they reach the destination vault. **FAIL-CLOSED. Always. PHOENIXMASTERKEY is the only bypass key.**

---

## The Six Nexus Gates

### N-G0 — Handshake Initiated

| Field | Detail |
|-------|--------|
| **Gate** | N-G0 |
| **Name** | Handshake Initiated |
| **PASS Condition** | Handshake request received with all required fields present (per `02-VAULT-HANDSHAKE-PROTOCOL.md`). Payload hash computed. Handshake ID assigned. TTL clock started. |
| **FAIL Condition** | Missing required fields, invalid vault names, malformed payload, duplicate handshake_id from same source |
| **Escalation** | FAIL → Reject immediately. Log `N-G0_FAIL`. Notify initiating vault. If same vault fails N-G0 three times in 24 hours, alert Agent-99. |

---

### N-G1 — Authority Verified

| Field | Detail |
|-------|--------|
| **Gate** | N-G1 |
| **Name** | Authority Verified |
| **PASS Condition** | `authorized_by` field contains an agent with authority for this specific handshake type. Authority verified against Soul DNA chain. |
| **FAIL Condition** | Unknown agent in `authorized_by` field, agent without authority for this handshake type, or `authorized_by` contradicts Soul DNA authority chain |
| **Escalation** | FAIL → Reject. Log `N-G1_AUTH_FAIL`. Drift score 4 assigned. Agent-99 and Agent-100 alerted immediately. |

---

### N-G2 — Rome Protocol Check

| Field | Detail |
|-------|--------|
| **Gate** | N-G2 |
| **Name** | Rome Protocol Check |
| **PASS Condition** | `rome_check: true` confirmed as genuinely verified (not just set to true). Handshake content does not contradict active Rome declarations. Truth anchor consistency confirmed. |
| **FAIL Condition** | `rome_check: false`, `rome_check: true` but verification not confirmed, content contradicts active Rome law |
| **Escalation** | FAIL → Immediate halt. Log `ROME_VIOLATION`. Drift score 5. Agent-100 directly alerted. See `12-ROME-PROTOCOL-NEXUS-LAYER.md`. |

---

### N-G3 — Payload Integrity

| Field | Detail |
|-------|--------|
| **Gate** | N-G3 |
| **Name** | Payload Integrity |
| **PASS Condition** | Payload hash matches computed hash of payload content. Payload size within limits. No detected secrets or PHOENIXMASTERKEY values in payload. No Researcher Mode content detected. |
| **FAIL Condition** | Hash mismatch (tampered payload), payload exceeds size limit, secrets detected in payload, Researcher Mode content detected |
| **Escalation** | Hash mismatch: FAIL + alert Agent-99 (potential tampering). Secrets detected: FAIL + alert Agent-99 + redaction required before resubmission. |

---

### N-G4 — Destination Vault Ready

| Field | Detail |
|-------|--------|
| **Gate** | N-G4 |
| **Name** | Destination Vault Ready |
| **PASS Condition** | Destination vault (vault_b) is operational (not isolated, not in maintenance), has capacity to receive, and has confirmed readiness via CONFIRM message within TTL |
| **FAIL Condition** | Destination vault is isolated, in maintenance, or fails to confirm within TTL |
| **Escalation** | Isolated vault: FAIL immediately, alert Agent-99. Timeout: Log `HANDSHAKE_TIMEOUT`. Retry per priority-based retry schedule. Two retries fail: Alert Agent-99. |

---

### N-G5 — Integration Complete

| Field | Detail |
|-------|--------|
| **Gate** | N-G5 |
| **Name** | Integration Complete |
| **PASS Condition** | Payload delivered to destination vault. Destination vault confirms receipt and processing. Ledger entry written. Hash chain updated. |
| **FAIL Condition** | Destination vault received payload but could not process it. Payload processing error reported. Ledger write failed. |
| **Escalation** | Processing failure: Log `INTEGRATION_EXEC_FAIL`. Alert Agent-99. Retry payload delivery up to 2 times. Three failures: Alert Agent-100. Manual intervention required. |

---

## Gate Flow Diagram

```
Handshake Request Received
        ↓
N-G0: Handshake Initiated → FAIL? Reject.
        ↓
N-G1: Authority Verified → FAIL? Reject + Alert A99 + A100.
        ↓
N-G2: Rome Protocol Check → FAIL? HALT + Rome Violation + Alert A100.
        ↓
N-G3: Payload Integrity → FAIL? Reject + Investigate.
        ↓
N-G4: Destination Vault Ready → FAIL? Wait/Retry/Escalate.
        ↓
N-G5: Integration Complete → FAIL? Retry/Escalate to A100.
        ↓
PASS: Handshake logged. Integration confirmed.
```

---

## PHOENIXMASTERKEY Gate Bypass

Only Agent-100 (Michael Hobbs) can issue a PHOENIXMASTERKEY bypass for a Nexus gate.

**Bypass rules:**
- Bypass is logged before it executes — no retroactive bypass logging
- Only one gate may be bypassed per PHOENIXMASTERKEY authorization
- The reason for bypass must be recorded in plain language
- Agent-99 is notified of every bypass within 30 minutes
- Bypassed operations are still monitored by Oracle — bypass does not disable drift detection

**Gate override log format:**
```
{
  "timestamp": "[ISO 8601]",
  "event_type": "GATE_BYPASS",
  "gate": "N-G[0-5]",
  "handshake_id": "[UUID]",
  "authorized_by": "AGENT-100",
  "bypass_reason": "[plain language]",
  "phoenixmasterkey_stamp": "[PHOENIXMASTERKEY:NEXUS:GATE_BYPASS:HASH]"
}
```

**FAIL-CLOSED is the default. Bypass is the exception. The exception is always logged.**
