# 10 — INTEGRATION TESTING PROTOCOL

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / CONNECTING
**Vault:** VAULT-NEXUS
**Classification:** OPERATIONAL — QUALITY ASSURANCE

---

## Purpose

Cross-vault integrations don't go live untested. Period. Every new integration — every new bridge, every new handshake protocol, every new Oracle distribution path — is shadow-tested before it goes live. This document defines what shadow testing means in Phoenix, what the test checklist covers, and who must sign off before a handshake is confirmed live.

**Untested integrations are liabilities. Shadow first. Live second.**

---

## What Shadow Testing Means in Phoenix

Shadow testing in Phoenix means running the new integration in parallel with existing operations without the new integration's output affecting any production system.

**How it works:**
1. New integration is deployed to a shadow environment (staging Cloudflare Worker, staging D1 database)
2. Production data is replicated to shadow environment (point-in-time copy — no live production data writes)
3. The new handshake protocol executes against the shadow data
4. Results are observed: does the integration behave as specified?
5. Shadow results are compared to expected results (defined before shadow testing begins)
6. Production systems are untouched throughout shadow testing

**Shadow testing is not optional.** Every new cross-vault integration runs shadow tests. The only exception is an emergency deployment authorized by Agent-100 — and even then, shadow testing runs as soon as the emergency is resolved.

---

## Integration Test Checklist

Agent-99 runs this checklist for every cross-vault integration before it goes live:

**Phase 1 — Format Tests:**
- [ ] Handshake request message contains all required fields (per `02-VAULT-HANDSHAKE-PROTOCOL.md`)
- [ ] Payload hash matches payload content (tamper detection working)
- [ ] `authorized_by` field correctly set and validated
- [ ] `rome_check: true` field correctly enforced
- [ ] TTL field correctly enforced (handshake expires as expected)

**Phase 2 — Functional Tests:**
- [ ] Sending vault initiates handshake correctly
- [ ] Nexus routing delivers to correct receiving vault
- [ ] Receiving vault processes payload correctly
- [ ] CONFIRM message sent and received within timeout
- [ ] Data transformation (if any) produces correct output
- [ ] Error handling works: simulate sending vault failure — does Nexus handle gracefully?
- [ ] Error handling works: simulate receiving vault failure — does Nexus handle gracefully?
- [ ] Retry logic works correctly: simulate timeout and verify retry behavior

**Phase 3 — Security Tests:**
- [ ] Unauthorized handshake attempt (wrong `authorized_by`) is rejected
- [ ] Malformed payload (corrupt hash) is rejected
- [ ] Oversized payload triggers rejection or size limit enforcement
- [ ] No secrets appear in ledger entries
- [ ] No PHOENIXMASTERKEY values exposed in logs or error messages

**Phase 4 — Oracle Integration Tests:**
- [ ] Oracle detects the handshake and logs it correctly in Oracle ledger
- [ ] Drift check runs on any data flowing through the integration
- [ ] If drift detected, escalation fires correctly to Agent-99

**Phase 5 — Ledger Tests:**
- [ ] Nexus ledger entry is written for the test handshake
- [ ] Ledger entry format matches spec (timestamp | vault_a | vault_b | handshake_id | status | agent)
- [ ] Hash chain integrity maintained after test entries
- [ ] Test entries clearly marked as `TEST` to avoid contaminating production ledger

---

## Gate Conditions — All Must Pass Before Live

| Gate | Condition | FAIL Action |
|------|-----------|-------------|
| IT-G1 | All Phase 1 format tests pass | Fix format issues. Retest Phase 1. |
| IT-G2 | All Phase 2 functional tests pass | Fix functional issues. Retest Phase 2. |
| IT-G3 | All Phase 3 security tests pass | Fix security issues. Security retest mandatory before proceeding. |
| IT-G4 | All Phase 4 Oracle integration tests pass | Fix Oracle integration. Retest Phase 4. |
| IT-G5 | All Phase 5 ledger tests pass | Fix ledger issues. Retest Phase 5. |
| IT-G6 | Agent-99 reviews all test results and confirms PASS | Agent-99 must review — cannot auto-pass. |
| IT-G7 | Agent-100 signs off on new integration | Agent-100 required for any integration that touches VAULT-SOVEREIGN or VAULT-GENESIS. Agent-99 signs off on others. |

**All 7 gates must show PASS. One FAIL = integration does not go live.**

---

## Failed Integration Test Consequences

What a failed integration test triggers:

- **Phase 1 or 2 fail:** Integration is revised by Agent-99 (possibly with new Codex code generation). Shadow tests restart from Phase 1.
- **Phase 3 fail:** Security failure. The integration code is quarantined. Agent-100 is notified. A full security review is required before the integration is revised and retested.
- **Phase 4 fail:** Oracle integration issue. Oracle team (Agent-99 operating Oracle tools) fixes the monitoring integration first. Then Phase 4 retested.
- **Phase 5 fail:** Ledger integrity issue. No integration goes live with a broken ledger. Fix ledger. Retest Phase 5.

---

## Test Environment Management

Shadow test environments run on Cloudflare Workers with a `_shadow` suffix on Worker names and `_shadow` suffix on D1 database names. All shadow resources are:

- Tagged as shadow in Cloudflare dashboard
- Scheduled for cleanup after the integration goes live (shadow resources deleted within 7 days of successful go-live)
- Never connected to production R2 buckets (shadow R2 bucket: `phoenix-[vault]-shadow`)

**Agent-99 manages shadow environment cleanup. Orphaned shadow environments are flagged by Oracle as infrastructure waste.**
