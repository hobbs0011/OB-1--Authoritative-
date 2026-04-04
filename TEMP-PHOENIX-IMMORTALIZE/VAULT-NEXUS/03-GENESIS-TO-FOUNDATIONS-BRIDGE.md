# 03 — GENESIS TO FOUNDATIONS BRIDGE

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / CONNECTING
**Vault:** VAULT-NEXUS
**Classification:** OPERATIONAL — STRUCTURAL BRIDGE

---

## Purpose

VAULT-GENESIS holds the origin axioms of Phoenix — the fundamental truths from which all protocols derive. VAULT-FOUNDATIONS translates those axioms into structural protocols that govern how Phoenix operates. This document defines the bridge between them: how Genesis content flows into Foundations, what triggers a Foundations update, and what the rules are when Genesis evolves.

**Genesis is the source. Foundations is the structure. Nexus is the bridge.**

---

## The Relationship

Genesis axioms are not operational documents. They are philosophical and strategic foundations — the "why" behind Phoenix. Foundations documents are the "how" — the operational protocols derived from the "why." Every Foundations protocol must be traceable to at least one Genesis axiom.

**If a Foundations protocol cannot be traced to a Genesis axiom: it is either missing its Genesis reference, or it doesn't belong in Foundations.**

---

## Mapping Table: Genesis Axiom → Foundation Protocol

| Genesis Axiom | Foundation Protocol | Status |
|---------------|--------------------|----|
| Agent-100 is the sole OPERATOR and sovereign authority | Authority Chain Protocol (all decisions trace back to Agent-100) | ACTIVE |
| Rome Protocol is supreme law — no action contradicts it | Rome Verification Protocol (all operations Rome-checked) | ACTIVE |
| Phoenix operates FAIL-CLOSED — failure defaults to halt | FAIL-CLOSED Operations Standard | ACTIVE |
| PHOENIXMASTERKEY is the apex authorization mechanism | Gate System (all critical gates require PHOENIXMASTERKEY) | ACTIVE |
| The Merkle ledger is the immutable record of Phoenix | Ledger Protocol (all events logged, hash-chained) | ACTIVE |
| Soul DNA defines the genetic code of Phoenix | Soul DNA Alignment Protocol (all outputs checked against Soul DNA) | ACTIVE |
| Agent-99 is the SENTURION — executes but does not override | Agent-99 Operational Scope (execution within bounds, no sovereign acts) | ACTIVE |
| Pheromone trails convert failure to law | Research and Intelligence Protocol (failure documentation → ROME_LAW) | ACTIVE |
| Free stack discipline — maximum output at minimum cost | Cost Control Protocol (<$20/month target) | ACTIVE |

---

## When Genesis Content Updates

Genesis axioms are not expected to change frequently. They are foundational. But when they do change, the update propagates to Foundations through this process:

1. **Agent-100 updates Genesis axiom** (only Agent-100 can modify VAULT-GENESIS)
2. **Oracle detects VAULT-CHANGE event** — Genesis document modified
3. **Oracle runs cross-vault consistency check** — does the change affect any Foundations protocol?
4. **If yes:** Nexus initiates `GENESIS_UPDATE` handshake to VAULT-FOUNDATIONS
5. **Agent-99 reviews** the impact on Foundations protocols (which protocols are affected?)
6. **Manual review required** — Genesis-to-Foundations updates are NOT auto-applied
7. **Agent-100 authorizes** the Foundations update (Genesis changes always require Agent-100 sign-off on downstream impact)
8. **Foundations document updated** by Agent-99 under Agent-100 authorization
9. **Oracle confirms** updated Foundations document aligns with new Genesis axiom
10. **Ledger entries** written to both Nexus ledger and Oracle ledger

**Why manual review? Because a Genesis axiom change is a fundamental shift. Auto-applying it could propagate errors cascade-style through every vault that depends on Foundations.**

---

## Does Foundation Auto-Update When Genesis Changes?

**No. Never.**

Every Genesis-to-Foundations update requires:
- Agent-99 impact analysis
- Agent-100 authorization
- Oracle drift check on the result

Auto-updates between Genesis and Foundations are disabled. The risk of cascading protocol errors from a premature auto-update outweighs the efficiency gain.

---

## Bridge Health Monitoring

Nexus monitors the Genesis-to-Foundations bridge with a weekly consistency check:

- Are all active Foundations protocols still traceable to a Genesis axiom?
- Have any Genesis axioms been added that don't yet have a corresponding Foundations protocol?
- Are there any Foundations protocols that reference deprecated Genesis content?

**If any inconsistency is found:** Nexus flags it as a `BRIDGE_CONSISTENCY_FAIL` and alerts Agent-99. Agent-99 has 7 days to resolve before Agent-100 is automatically notified.

---

## Traceability Requirement

Every document in VAULT-FOUNDATIONS must include:

```
**Genesis Reference:** [Genesis axiom name or document reference]
```

Documents in VAULT-FOUNDATIONS that lack a Genesis reference are flagged as incomplete (drift score 1) until the reference is added.
