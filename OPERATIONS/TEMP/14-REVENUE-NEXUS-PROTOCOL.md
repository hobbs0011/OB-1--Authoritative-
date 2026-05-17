# 14 — REVENUE NEXUS PROTOCOL

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / CONNECTING
**Vault:** VAULT-NEXUS
**Classification:** OPERATIONAL — REVENUE CRITICAL

---

## Purpose

Revenue is the lifeblood of Phoenix. It starts as a student payment at a NET franchise node and ends as confirmed, immutable value in the Phoenix Merkle ledger — with Solana as the settlement layer. This document maps every step of that revenue journey across vaults, defines reconciliation procedures, and establishes Agent-99's revenue monitoring checkpoints.

**Revenue that isn't tracked is revenue that can be stolen, lost, or miscounted. Phoenix tracks every dollar.**

---

## Revenue Flow Overview

```
Student pays for NET course (VND/USD cash or transfer)
        ↓
Franchise node records payment in D1 (VAULT-NET-SEEDS domain)
        ↓
Daily revenue batch converted to SOL via approved pathway
        ↓
Solana Actions transaction sent to Phoenix wallet
        ↓
Oracle confirms on-chain (VAULT-ORACLE domain)
        ↓
Confirmed revenue written to VAULT-EXECUTION ledger
        ↓
Monthly revenue summary written to VAULT-SOVEREIGN treasury record
        ↓
Phoenix Merkle ledger entry (immutable, hash-chained)
```

---

## Revenue Flow Nexus Handshake Map

Every vault boundary in the revenue flow requires a Nexus handshake:

| From Vault | To Vault | Handshake Type | Data Transferred |
|------------|----------|----------------|-----------------|
| VAULT-NET-SEEDS | VAULT-ORACLE | Revenue notification | Daily revenue batch summary |
| VAULT-ORACLE | VAULT-EXECUTION | Confirmation signal | Solana-confirmed revenue amount |
| VAULT-EXECUTION | VAULT-SOVEREIGN | Monthly treasury update | Monthly revenue total, reconciliation report |
| VAULT-SOVEREIGN | Phoenix Merkle Ledger | Sovereign record | Month-end signed revenue declaration |

Each handshake must complete before the next can initiate. Revenue does not skip vaults.

---

## Cross-Vault Revenue Reconciliation

Reconciliation happens at three levels:

**Level 1 — Daily (NET-Seeds D1 vs Solana):**
- Agent-99 pulls daily revenue total from each franchise node's D1
- Oracle confirms matching Solana transaction(s)
- Discrepancy > 1%: `REVENUE_DISCREPANCY` alert to Agent-99
- Discrepancy > 5%: `REVENUE_DISCREPANCY` alert to Agent-99 AND Agent-100

**Level 2 — Weekly (Execution Ledger vs Node D1 Totals):**
- Agent-99 compares VAULT-EXECUTION weekly revenue summary against sum of all node D1 totals
- Any weekly shortfall not explained by timing differences: Escalate to Agent-100
- Weekly reconciliation report stored in D1 and archived to R2

**Level 3 — Monthly (Sovereign Treasury vs All Ledgers):**
- Agent-100 reviews monthly treasury record
- Compares against: Execution ledger total, Solana transaction history, each node's D1 records
- All four sources must agree within 1% tolerance (exchange rate variance)
- Agent-100 signs monthly treasury declaration
- Signed declaration becomes Merkle ledger entry (immutable)

---

## Agent-99 Revenue Monitoring Checkpoints

| Checkpoint | Frequency | What Agent-99 Checks | Alert Threshold |
|------------|-----------|----------------------|-----------------|
| Node daily revenue | Daily | Each node's D1 revenue vs target | >20% below target |
| Solana confirmation | Daily | All expected transactions confirmed | Any unconfirmed after 24 hours |
| Weekly reconciliation | Weekly | Execution ledger vs node D1 totals | Any discrepancy >1% |
| Monthly treasury | Monthly | Full reconciliation across all sources | Any discrepancy >1% |
| Revenue trend | Monthly | Month-over-month growth/decline | >15% decline triggers Agent-100 review |

---

## Discrepancy Resolution Protocol

When a revenue discrepancy is detected:

**Step 1 — Identify:** Where in the revenue chain did the discrepancy appear?
- D1 record at node level?
- Solana transaction (amount mismatch, missing transaction)?
- Execution ledger aggregation error?
- Exchange rate calculation error?

**Step 2 — Classify:**
- Timing issue (payment received in wrong cycle) → Reclassify, no discrepancy
- Technical error (D1 write failure, Worker crash) → Fix, recover data, pheromone trail
- Calculation error (exchange rate applied incorrectly) → Correct, audit prior periods
- Unresolved (cannot explain) → Agent-100 must investigate. Potential fraud escalation.

**Step 3 — Fix and Verify:**
- Fix is implemented
- D1 corrected entries logged with a `CORRECTION` flag
- Oracle confirms correction resolves discrepancy
- Pheromone trail created
- ROME_LAW declared if systemic fix needed

**Step 4 — Merkle ledger entry:**
- Correction event recorded in Merkle ledger (immutable record of the discrepancy and resolution)

---

## Revenue Cannot Leave Phoenix Without Authorization

**No outbound revenue transfer from any Phoenix wallet without Agent-100 authorization.**

Rules:
- Disbursements (franchise shares, agent compensation, expenses) require Agent-100 explicit approval
- All disbursements go through Solana Actions (trustless, verifiable)
- Oracle monitors every outbound Solana transaction
- Unauthorized outbound transaction = drift score 5, immediate Agent-100 alert, Sovereign override potential

**Revenue flows in easily. Revenue flows out only with Agent-100's hand.**
