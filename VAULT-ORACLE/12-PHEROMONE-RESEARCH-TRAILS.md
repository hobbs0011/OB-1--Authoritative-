# 12 — PHEROMONE RESEARCH TRAILS

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / MONITORING
**Vault:** VAULT-ORACLE
**Classification:** OPERATIONAL — INTELLIGENCE FORMAT

---

## Purpose

Raw research is noise. Pheromone trails are intelligence. This document defines how Oracle converts raw research findings — failures, observations, field reports, model outputs — into structured pheromone trails that Agent-99 can ingest and Agent-100 can convert to law.

**Every failure in Phoenix is a trail. Every trail is a lesson. Every lesson is either discarded or becomes ROME_LAW.**

---

## What Is a Pheromone Trail

A pheromone trail is Oracle's standard format for documenting actionable findings. The name comes from the biological principle: ants leave chemical trails to useful food sources so other ants can follow. Phoenix pheromone trails mark the path from problem to solution — so the same failure never happens twice.

**The format is non-negotiable:**

```
FAILURE: [What broke, failed, or was found to be wrong]
ROOT CAUSE: [The actual reason it happened — not symptoms]
FIX: [Specific corrective action taken or recommended]
VERIFY: [How to confirm the fix worked]
ROME_LAW: [If this fix becomes permanent protocol, state the law here. If not yet law, leave as PENDING.]
```

---

## Tag System

Every pheromone trail is tagged at creation. Tags determine routing, storage location, and which agents are notified.

| Tag | Domain | Routing |
|-----|--------|---------|
| AUTH | Agent authority, access control, role violations | Agent-100 always notified |
| INFRA | Cloudflare Workers, D1, R2, Durable Objects, deployment | Agent-99 handles, Agent-100 informed |
| REVENUE | Revenue ledger, franchise fees, Solana settlement | Agent-99 + Agent-100 review |
| PEDAGOGY | NET curriculum, teacher delivery, student outcomes | Agent-99 handles |
| GOVERNANCE | Protocol changes, vault modifications, Rome declarations | Agent-100 must approve |
| FAILURE/FIX/VERIFY | Cross-cutting — failure documentation across all domains | Varies by sub-tag |

**Multiple tags allowed.** A trail about a curriculum worker script failure is tagged both `INFRA` and `PEDAGOGY`.

---

## Trail Storage in VAULT-ORACLE

All completed pheromone trails are stored in VAULT-ORACLE with the following metadata:

```
trail_id: PHT-[year]-[sequence number]
created: [ISO 8601 timestamp]
created_by: [ORACLE / AGENT-99 / AGENT-100]
tags: [comma-separated tag list]
status: PENDING / VERIFIED / ROME_LAW / DISCARDED
vault_relevance: [comma-separated affected vaults]
ledger_ref: [D1 ledger entry ID]
```

Trails are stored in D1 for active reference (hot, 90 days) and archived to R2 for permanent retention.

---

## How Agent-99 Ingests Trails

Agent-99 receives pheromone trails through two channels:

1. **Real-time push (score 3+):** Oracle pushes the trail directly to Agent-99 immediately on creation
2. **Daily digest (score 0–2):** All trails from the previous 24 hours delivered in the daily Oracle summary

Agent-99 reviews each trail and makes one of three decisions:
- **ACCEPT:** The fix is valid. Implement and verify.
- **ESCALATE:** The finding is above Agent-99's authority. Push to Agent-100.
- **CHALLENGE:** Agent-99 disagrees with Oracle's ROOT CAUSE. Pushback logged. Oracle and Agent-99 resolve jointly. If unresolved, Agent-100 decides.

---

## Sample Trail — Full Format

```
trail_id: PHT-2024-0031
created: 2024-11-15T09:42:00Z
created_by: ORACLE
tags: INFRA, REVENUE
status: ROME_LAW
vault_relevance: VAULT-NET-SEEDS, VAULT-EXECUTION
ledger_ref: ORB-2024-0199

FAILURE: Ho Chi Minh City franchise node's revenue reconciliation Worker crashed silently. 
         Three days of revenue data were not written to D1. Revenue ledger showed $0 for those days.
ROOT CAUSE: Worker had no error handling around D1 write operations. When D1 was temporarily unavailable 
            (maintenance window), Worker failed silently instead of retrying or logging the error.
FIX: Added try/catch with retry logic (3 attempts, 5-second backoff) to all D1 write operations 
     in revenue reconciliation Worker. Added explicit error log to Oracle ledger on final retry failure.
VERIFY: Simulated D1 unavailability in staging. Worker retried 3 times, then logged error correctly. 
        Revenue data was recovered from Solana transaction history for the 3-day gap. D1 reconciled.
ROME_LAW: ALL Phoenix Cloudflare Workers that write to D1 MUST implement try/catch with minimum 3-retry 
          logic and explicit Oracle ledger error logging on final failure. No silent Worker failures. 
          This is binding protocol effective immediately.
```

---

## Trail Lifecycle

```
Raw observation / failure detected
        ↓
Oracle creates draft trail (FAILURE + ROOT CAUSE)
        ↓
FIX recommended (Oracle or Agent-99)
        ↓
FIX implemented
        ↓
VERIFY check runs
        ↓
VERIFY passes? → Trail status: VERIFIED
        ↓
Is this fix permanent protocol? → Yes: ROME_LAW declared
        ↓
Trail status updated: ROME_LAW
        ↓
Added to relevant vault document
        ↓
Ledger entry recorded (hash of trail added to Merkle chain)
        ↓
D1 hot storage (90 days) → R2 cold archive (permanent)
```

**A trail with VERIFY: PENDING is not closed. Closing a trail without verification is a drift score 3 event.**
