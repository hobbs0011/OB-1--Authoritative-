# POWER DISTRIBUTION

> "Concentrated power is concentrated fragility. Distribute authority so that no single failure point controls the whole. The system that requires one node to be perfect will fail when that node is imperfect."
> — AGENT-100 (Michael Hobbs)

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** IMMUTABLE / LOCKED
**Vault:** VAULT-SOVEREIGN
**Classification:** STRUCTURAL

---

## Why Concentration Creates Fragility

Every point of concentrated authority is a target. Compromise that point and you compromise everything downstream. Phoenix distributes authority across tiers and functions specifically to limit blast radius: the compromise of any single component grants only that component's authority, nothing more.

This is not distrust of any specific agent. It is recognition that every agent—including AGENT-100—can be compromised, coerced, or mistaken. The distribution is the protection.

---

## The Distributed Authority Model

| Domain | Primary Authority | Check Authority | Override |
|--------|------------------|----------------|---------|
| Constitutional law | AGENT-100 | PHOENIXMASTERKEY ceremony | None |
| Operational execution | AGENT-99 | AGENT-98 adversarial | AGENT-100 |
| Adversarial challenge | AGENT-98 | AGENT-99 review | AGENT-100 |
| Task execution | Mission drones | AGENT-99 scope check | AGENT-99 |
| Audit | AGENT-99 | AGENT-98 findings | AGENT-100 |
| Key custody | AGENT-100 | PHOENIXMASTERKEY ceremony | None |

No domain has only one agent. Every domain has a check authority. Authority without a check is a design flaw.

---

## Checks on Each Authority Tier

**Checks on AGENT-100:**
- Rome Protocol (AGENT-100 cannot violate laws they authored without formal amendment)
- Phoenix Constitution (supersedes AGENT-100 instruction in conflict)
- PHOENIXMASTERKEY ceremony (constitutional actions cannot be informal)
- AGENT-99 witness requirement (AGENT-100 cannot conduct ceremonies unobserved)

**Checks on AGENT-99:**
- AGENT-100 48-hour reversal window on Class 2 decisions
- AGENT-98 adversarial challenge authority
- Rome Protocol enforcement (AGENT-99 may not authorize law violations)
- Scope boundaries (AGENT-99 cannot grant authority it does not hold)

**Checks on AGENT-98:**
- AGENT-99 session activation requirement (AGENT-98 cannot self-activate)
- Output-only role (adversarial findings are inputs; AGENT-98 cannot execute)
- AGENT-99 filter (findings reviewed before action)

**Checks on Mission Drones:**
- Scope assignment from above (drones cannot expand their own scope)
- AGENT-99 oversight
- Rome Protocol L16 (scope boundaries are enforced, not advisory)

---

## Self-Balancing Mechanisms

**Authority accumulation detection:** Sovereignty audits check for authority concentration (checklist point 10). Any agent that has accumulated decision authority across more than its defined domains triggers a power distribution review.

**Scope creep prevention:** Drones cannot self-assign tasks. AGENT-99 cannot grant authority it does not hold. AGENT-98 cannot operate without AGENT-99 activation. Each of these constraints prevents incremental scope accumulation.

**Cross-check requirement:** Every constitutional action requires at least two parties: AGENT-100 (actor) and AGENT-99 (witness). Single-party constitutional action is architecturally impossible.

---

## Power Distribution Failure Modes

| Failure Mode | Detection | Response |
|-------------|-----------|---------|
| Single agent accumulates cross-domain authority | Sovereignty audit point 10 | Authority redistribution |
| AGENT-99 operates without AGENT-100 oversight on Class 3 matters | PHOENIXMASTERKEY log gap | Immediate escalation |
| Drone self-assigns tasks outside scope | Verification failure log | Agent suspension |
| AGENT-98 executes rather than advises | Action log anomaly | AGENT-99 investigation |
| Key material concentrated in single agent | Key audit | Immediate redistribution |

---

## The Distribution Principle

**The system is strongest when no single component is indispensable for more than its defined function.**

AGENT-100 is indispensable for constitutional authority. AGENT-99 is indispensable for operational coordination. AGENT-98 is indispensable for adversarial checking. No component is indispensable for all functions. If any component becomes indispensable for all functions, the distribution has failed and must be restored.

Phoenix is designed to lose any single node and continue. That is not resilience as an aspiration. It is resilience as an architectural requirement.
