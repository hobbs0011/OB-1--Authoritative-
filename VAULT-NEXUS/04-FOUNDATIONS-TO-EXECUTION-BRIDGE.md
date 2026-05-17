# 04 — FOUNDATIONS TO EXECUTION BRIDGE

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / CONNECTING
**Vault:** VAULT-NEXUS
**Classification:** OPERATIONAL — DEPLOYMENT BRIDGE

---

## Purpose

VAULT-FOUNDATIONS holds the structural protocols that define how Phoenix operates. VAULT-EXECUTION is where those protocols become deployed reality — actual Workers, actual DB operations, actual franchise launches, actual teacher deployments. This bridge document defines how Foundations protocols translate to Execution procedures, how dependencies are tracked, and how execution failures feed back to Foundations.

**Foundations is the blueprint. Execution is the build. Nexus carries the blueprint to the build site.**

---

## Mapping Table: Foundation Protocol → Execution Procedure

| Foundation Protocol | Execution Procedure | Dependency Level |
|--------------------|---------------------|-----------------|
| Rome Verification Protocol | Pre-deploy Rome check (Codex-G3 gate) | CRITICAL — no deploy without this |
| FAIL-CLOSED Operations Standard | Worker error handling (try/catch + retry logic) | CRITICAL — all Workers must implement |
| Authority Chain Protocol | Agent authorization check before any production action | CRITICAL — no unauthorized production changes |
| Ledger Protocol | D1 write + R2 WAL archive in every operation | HIGH — all events must be logged |
| Cost Control Protocol | Free tier monitoring + cost alert system | HIGH — monthly cost tracking required |
| Soul DNA Alignment Protocol | Pre-output Oracle drift check | HIGH — all outputs drift-checked |
| Gate System | Franchise launch gates (Q-G1 through Q-G6) | HIGH — no launch without all gates |
| Agent-99 Operational Scope | Agent-99 execution boundaries (no sovereign acts) | MEDIUM — monitored by Oracle |
| Research and Intelligence Protocol | Pheromone trail creation on every documented failure | MEDIUM — required for all operational failures |

---

## How Execution Procedures Are Created from Foundation Protocols

Foundation protocols are abstract — they state the principle. Execution procedures are concrete — they state the steps.

**Translation process:**

1. Agent-99 identifies a new Foundations protocol that requires execution implementation
2. Agent-99 creates an execution procedure document in VAULT-EXECUTION
3. The procedure explicitly references the Foundations protocol it implements
4. Agent-99 requests Codex to generate any required code
5. Code is reviewed per `08-MICROSOFT-CODEX-LAYER.md` checklist
6. Procedure is tested in staging (see `10-INTEGRATION-TESTING-PROTOCOL.md`)
7. Agent-100 approves any procedure that is CRITICAL dependency level
8. Procedure goes live — Nexus records the `FOUNDATION_TO_EXECUTION` handshake

---

## Execution Failure Feedback to Foundations

When an execution procedure fails, that failure does not stay in VAULT-EXECUTION. It feeds back to VAULT-FOUNDATIONS via Nexus.

**Feedback process:**

```
Execution procedure fails
        ↓
Agent-99 creates pheromone trail (FAILURE→ROOT CAUSE→FIX→VERIFY)
        ↓
If root cause is a Foundation protocol flaw:
        ↓
Nexus initiates EXECUTION_TO_FOUNDATIONS handshake
        ↓
Agent-99 proposes Foundation protocol correction
        ↓
Agent-100 reviews and approves
        ↓
Foundation protocol updated
        ↓
Execution procedure updated to match corrected Foundation
        ↓
Both vaults' ledger entries updated
        ↓
ROME_LAW declared if fix is permanent
```

**Critical:** Execution failures that reveal Foundation protocol flaws are escalated immediately. A flawed Foundation protocol means every execution procedure derived from it may be wrong.

---

## Escalation Path

| Failure Type | Escalation |
|-------------|-----------|
| Execution procedure fails but Foundation is sound | Agent-99 fixes execution procedure. Oracle monitors. |
| Execution procedure fails AND Foundation protocol is the cause | Agent-99 escalates to Agent-100. Foundation update required. |
| Multiple execution procedures fail due to same Foundation flaw | Emergency escalation to Agent-100. All affected procedures halted. |
| Execution failure causes revenue impact > $1,000 | Immediate Agent-100 notification regardless of cause. |

---

## Bridge Health Check

Nexus runs a weekly Foundations-to-Execution bridge check:

- Are all active Foundations protocols implemented in VAULT-EXECUTION?
- Are there Execution procedures that reference superseded Foundation protocols?
- Are there Execution procedures with no Foundation protocol reference (orphaned procedures)?

**Orphaned execution procedures** (no Foundation reference) are flagged as drift score 1. Agent-99 must assign a Foundation reference within 14 days or the procedure is archived.

---

## Dependency Level Definitions

| Level | Meaning | Agent-100 Sign-off Required? |
|-------|---------|------------------------------|
| CRITICAL | Failure breaks core Phoenix operations or sovereignty | Yes — always |
| HIGH | Failure significantly impairs operations but doesn't break sovereignty | Required for initial implementation; Agent-99 handles maintenance |
| MEDIUM | Failure creates friction but operations continue | Agent-99 handles |
| LOW | Nice-to-have implementation of a Foundation principle | Agent-99 handles |
