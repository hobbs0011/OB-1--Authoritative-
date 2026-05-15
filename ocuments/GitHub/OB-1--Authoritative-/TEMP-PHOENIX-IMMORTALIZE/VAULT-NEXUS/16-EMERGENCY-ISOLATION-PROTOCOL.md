# 16 — EMERGENCY ISOLATION PROTOCOL

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / CONNECTING
**Vault:** VAULT-NEXUS
**Classification:** OPERATIONAL — CONTAINMENT PROTOCOL

---

## Purpose

When a vault is compromised — attacked, corrupted, drifting beyond acceptable bounds, or otherwise unreliable — it must be isolated. Isolation cuts the vault off from the Nexus handshake network while Oracle continues to monitor it. The compromised vault cannot contaminate the rest of Phoenix. This document defines the isolation protocol, what an isolated vault can and cannot do, and how it is recovered and reintegrated.

**Isolation is not punishment. Isolation is containment. Phoenix survives by cutting off infected nodes.**

---

## Isolation Trigger Conditions

| Condition | Threshold | Initiating Authority |
|-----------|-----------|---------------------|
| Drift score 5 in vault | Any confirmed score-5 event | Oracle detects → Nexus isolates → Agent-100 notified |
| Unauthorized vault modification | Any detected unauthorized change | Oracle detects → Agent-100 authorizes isolation |
| Rome Protocol violation within vault | Any confirmed violation | Oracle detects → Nexus isolates → Agent-100 notified |
| Vault producing contaminated outputs | Oracle detects drift in 3+ outputs | Oracle flags → Agent-99 recommends → Agent-100 authorizes |
| External breach of vault infrastructure | Confirmed external access | Cloudflare triggers → Nexus isolates → Agent-100 notified |
| Agent operating within vault goes rogue | Confirmed unauthorized agent acts | Agent-100 directly orders isolation |

---

## Isolation Execution Steps

When isolation is authorized:

1. **Nexus cuts all active handshakes** to and from the affected vault immediately — no new handshakes are accepted
2. **Queued handshakes** for the affected vault are held (not deleted) — they resume after reintegration
3. **Oracle continues monitoring** the isolated vault — monitoring never stops, not even in isolation
4. **Affected vault receives isolation signal** — internal operations may continue in read-only mode (no writes to shared resources)
5. **All agents operating in the vault** are notified of isolation — no new tasks initiated in the vault
6. **Nexus ledger entry** recorded: `event_type: VAULT_ISOLATED | vault: [name] | reason: [summary] | authorized_by: AGENT-100`
7. **Sovereign override evaluated** — does the isolation require Sovereign override? If the compromised vault holds system-critical operations, Agent-100 may issue Sovereign override simultaneously with isolation
8. **Agent-100 briefing** — Oracle delivers a full incident brief to Agent-100 within 15 minutes of isolation

---

## What the Isolated Vault Can Do

| Action | Permitted? |
|--------|-----------|
| Internal read operations (query its own D1 data) | Yes |
| Accept new Nexus handshakes from other vaults | No |
| Initiate Nexus handshakes to other vaults | No |
| Be monitored by Oracle | Yes — always |
| Accept direct Agent-100 access | Yes |
| Accept Agent-99 investigation access | Yes (under Agent-100 authorization) |
| Write to its own D1 database | No (write-locked during isolation) |
| Write to shared Merkle ledger | No |
| Receive Sovereign override commands | Yes |

---

## What the Isolated Vault Cannot Do

- **Cannot send or receive data via Nexus** — the entire handshake network is cut
- **Cannot be modified by anyone other than Agent-100** — even Agent-99 needs explicit Agent-100 authorization for each change during isolation
- **Cannot resume normal operations** until all recovery gate conditions are met
- **Cannot self-declare recovery** — recovery must be confirmed by Oracle and authorized by Agent-100

---

## Recovery and Reintegration Protocol

Recovery from isolation is a staged, gated process:

**Stage 1 — Root Cause Analysis:**
1. Oracle delivers full incident report to Agent-100 and Agent-99
2. Root cause identified (unauthorized modification? Technical failure? Agent error? External breach?)
3. Pheromone trail created: FAILURE→ROOT CAUSE→FIX→VERIFY→ROME_LAW

**Stage 2 — Containment Confirmation:**
1. Confirm the cause of isolation has been eliminated
2. If external breach: Cloudflare security review, Worker updated, access logs audited
3. If agent error: Agent retraining or replacement completed
4. If technical failure: Infrastructure issue resolved and verified

**Stage 3 — Vault Restoration:**
1. Vault documents reviewed — any corrupted or modified documents identified
2. Corrupted documents restored from R2 archive (last-known-good version)
3. Oracle runs full drift check on all vault documents (every document scored)
4. All documents must score 0–1 before reintegration

**Stage 4 — Reintegration Gate Conditions:**

| Gate | Condition |
|------|-----------|
| R-G1 | Root cause confirmed and eliminated |
| R-G2 | All vault documents drift score 0–1 |
| R-G3 | Oracle confirms vault integrity |
| R-G4 | Agent-99 confirms operational readiness |
| R-G5 | Agent-100 issues PHOENIXMASTERKEY reintegration authorization |

**All 5 gates must pass. PHOENIXMASTERKEY is required for final reintegration.**

**Stage 5 — Reintegration:**
1. Nexus restores handshake connections to the vault
2. Queued handshakes are delivered (in order, oldest first)
3. Oracle monitors first 24 hours of post-reintegration activity with heightened sensitivity
4. ROME_LAW declared for any protocol changes that prevent recurrence
5. Full incident report added to Phoenix Merkle ledger as permanent record
