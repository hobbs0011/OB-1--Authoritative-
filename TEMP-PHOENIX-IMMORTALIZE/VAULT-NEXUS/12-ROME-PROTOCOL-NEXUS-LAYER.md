# 12 — ROME PROTOCOL NEXUS LAYER

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / CONNECTING
**Vault:** VAULT-NEXUS
**Classification:** OPERATIONAL — SUPREME LAW ENFORCEMENT

---

## Purpose

Rome Protocol is the supreme law of the Phoenix system. No operation — internal or cross-vault — contradicts Rome. This document defines how Rome Protocol governs specifically at the Nexus layer: how Rome checks are performed on cross-vault handshakes, what constitutes a Rome violation at the nexus level, and what happens when a Rome check fails.

**Rome is not a gate you pass through to get permission. Rome is the boundary. You don't cross it.**

---

## Rome Protocol in the Nexus Context

At the Nexus layer, Rome Protocol governs two things:

1. **Who can authorize cross-vault operations.** Only agents with Rome-sanctioned authority can initiate or approve handshakes. The authority chain (Agent-100 → Agent-99 → Agent-98) is defined by Rome. Any handshake `authorized_by` field claiming an agent not in the Rome-sanctioned authority chain is a Rome violation.

2. **What can be transferred between vaults.** Rome Protocol defines certain categories of information and operations that require Agent-100's direct authorization. Any cross-vault transfer of these categories without proper authorization is a Rome violation.

---

## Rome Check Steps for Cross-Vault Handshakes

Before any handshake executes, Nexus performs the Rome check:

1. **Authority verification:** Is the `authorized_by` agent in the Rome-sanctioned authority chain?
   - Agent-100: Authorized for all handshakes
   - Agent-99: Authorized for ROUTINE and URGENT handshakes on non-sovereign matters
   - Agent-98: Authorized to initiate field report handshakes only
   - Legion: Cannot initiate handshakes
   - Any other identifier: Automatic Rome violation

2. **Restricted transfer check:** Does the handshake payload involve any of these restricted categories?
   - VAULT-SOVEREIGN document modifications (Agent-100 only)
   - VAULT-GENESIS axiom updates (Agent-100 only)
   - PHOENIXMASTERKEY values (Agent-100 only — never transmitted via Nexus)
   - Rome Protocol declarations (Agent-100 only)
   - Soul DNA updates (Agent-100 only)
   If yes, and `authorized_by` is not Agent-100: Rome violation.

3. **Truth anchor verification:** Does the handshake operation align with the most recent Rome truth anchor? The truth anchor is the last confirmed Rome declaration — every cross-vault operation must be consistent with it.
   - If truth anchor is stale (not verified in past 30 days): Flag to Agent-99. Still allow operation unless direct conflict detected.
   - If operation directly contradicts truth anchor: Immediate halt. Rome violation.

4. **Rome check confirmation:** If steps 1–3 pass, Rome check is confirmed. `rome_check: true` is set. Handshake proceeds.

---

## What Constitutes a Rome Violation at the Nexus Layer

| Violation Type | Example | Consequence |
|----------------|---------|-------------|
| Unauthorized authority claim | Handshake `authorized_by: AGENT-98` for a vault modification | Immediate rejection. Drift score 4. Agent-99 + Agent-100 alerted. |
| Restricted transfer without Agent-100 | VAULT-SOVEREIGN doc sent via Nexus handshake without Agent-100 authorization | Immediate halt. Drift score 5. Agent-100 direct alert. |
| Truth anchor contradiction | Operation that reverses a confirmed Rome law without new Agent-100 declaration | Immediate halt. Drift score 5. Full review required. |
| Rome check bypass attempt | Handshake with `rome_check: true` set without actually running the check | Detected by Nexus cross-verification. Drift score 5. |

---

## Consequences of a Failed Rome Check

**FAIL = IMMEDIATE HALT.**

When a Rome check fails at the Nexus layer:

1. Handshake is rejected and does not execute
2. Nexus logs `ROME_VIOLATION` event in Nexus ledger
3. Oracle is notified immediately (drift score 4 or 5 depending on violation type)
4. Agent-100 is notified directly (bypasses Agent-99 queue)
5. The initiating vault is flagged — no further handshakes from that vault until cleared
6. PHOENIXMASTERKEY required to re-enable the flagged vault for Nexus handshakes
7. Post-incident review required before operations resume

**No Rome violation is treated as a minor incident.** Every Rome violation is an Agent-100-level event.

---

## Truth Anchor Verification Protocol

The truth anchor is the most recent Rome Protocol declaration from Agent-100. It serves as the operating reference for the current state of Phoenix law.

**Truth anchor verification before handshake:**
1. Retrieve most recent Rome declaration from VAULT-SOVEREIGN
2. Check declaration timestamp — is it < 30 days old?
3. Does the proposed cross-vault operation align with or contradict this declaration?
4. If contradicts: Rome violation. Halt.
5. If aligns or is unrelated: Proceed.

**Stale truth anchor (> 30 days without new Rome declaration):**
- Flag to Agent-99: `TRUTH_ANCHOR_STALE`
- Operations continue (not halted for stale anchor alone)
- Agent-99 requests Agent-100 issue a fresh truth anchor within 7 days
- If 7 days pass without fresh anchor: All CRITICAL cross-vault operations require Agent-100 real-time authorization until anchor is refreshed

---

## Nexus Rome Violation Log Format

```
{
  "timestamp": "[ISO 8601]",
  "event_type": "ROME_VIOLATION",
  "vault_a": "[initiating vault]",
  "vault_b": "[target vault]",
  "handshake_id": "[attempted handshake ID]",
  "authorized_by": "[claimed authorizer]",
  "violation_type": "[UNAUTHORIZED_AUTHORITY | RESTRICTED_TRANSFER | TRUTH_ANCHOR_CONFLICT | BYPASS_ATTEMPT]",
  "drift_score": "[4 or 5]",
  "action_taken": "HALT + AGENT-100 ALERTED",
  "phoenixmasterkey_required": true
}
```
