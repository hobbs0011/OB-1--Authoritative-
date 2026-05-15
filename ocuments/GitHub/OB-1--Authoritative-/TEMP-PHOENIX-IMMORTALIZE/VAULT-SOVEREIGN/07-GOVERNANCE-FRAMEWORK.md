# GOVERNANCE FRAMEWORK

> "Good governance is not comprehensive governance. More rules, more committees, more process creates more failure modes. Phoenix governance is minimal by design: classify the decision correctly, apply the right authority, and move. The mission does not wait for bureaucracy."
> — AGENT-100 (Michael Hobbs)

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** IMMUTABLE / LOCKED
**Vault:** VAULT-SOVEREIGN
**Classification:** STRUCTURAL

---

## Governance Philosophy

Phoenix governance operates on the principle of governance minimalism. Every decision point is a potential failure mode. Every approval gate is a potential bottleneck. The goal is: apply exactly as much governance as the decision requires, and not one layer more.

Decisions are classified by their impact on sovereignty, immutability, and mission. The classification determines the authority required, the consensus needed, and the logging obligation. Misclassifying a decision—treating constitutional matters as operational, or stalling operational decisions with constitutional process—is itself a governance failure.

---

## Decision Classification System

### Class 1: Operational Decisions
**Definition:** Day-to-day mission execution. Task assignment, content generation, API calls, session management, routine monitoring.
**Authority Required:** AGENT-99 or any authorized drone
**Consensus:** None required; single agent authority
**Logging:** Standard session log
**Reversibility:** Fully reversible
**Examples:** Assign drone to content task, refresh dead man's switch timer, run standard audit check

### Class 2: Architectural Decisions
**Definition:** Changes to how Phoenix components are assembled, integrated, or deployed. Infrastructure migration, agent configuration, workflow redesign.
**Authority Required:** AGENT-99 with AGENT-100 notification
**Consensus:** AGENT-99 decision, AGENT-100 informed within 24 hours
**Logging:** Architectural decision log with rationale
**Reversibility:** Reversible with effort
**Examples:** Migrate from one hosting provider to another, redesign agent communication protocol, add new drone to roster

### Class 3: Constitutional Decisions
**Definition:** Changes to the laws, authority structures, founding documents, or sovereignty model.
**Authority Required:** AGENT-100 with PHOENIXMASTERKEY ceremony
**Consensus:** AGENT-100 sole authority; AGENT-99 witness required
**Logging:** Immutable constitutional log entry
**Reversibility:** Designed to be difficult; reversal also requires PHOENIXMASTERKEY
**Examples:** Amend Rome Protocol law, update VAULT-SOVEREIGN documents, modify succession protocol

---

## Decision Classification Table

| Decision Type | Class | Authority | Log Required | PHOENIXMASTERKEY |
|--------------|-------|-----------|--------------|-----------------|
| Assign agent task | 1 | AGENT-99 | Session | No |
| Deploy new content | 1 | AGENT-99 | Session | No |
| Switch infrastructure provider | 2 | AGENT-99 | Architecture | No |
| Add new integration | 2 | AGENT-99 | Architecture | No |
| Amend Rome Protocol | 3 | AGENT-100 | Constitutional | Yes |
| Modify succession protocol | 3 | AGENT-100 | Constitutional | Yes |
| Seal a document as IMMUTABLE | 3 | AGENT-100 | Constitutional | Yes |
| Transfer Phoenix asset | 3 | AGENT-100 | Constitutional | Yes |

---

## Consensus Requirements

**Class 1:** Single authorized agent. No consensus needed.
**Class 2:** AGENT-99 decision with AGENT-100 notification. AGENT-100 retains 48-hour reversal window for Class 2 decisions.
**Class 3:** AGENT-100 decision with AGENT-99 witness. No override possible by AGENT-99 or any other agent.

**Gate condition: A Class 3 decision executed without AGENT-100 authority is void. AGENT-99 must not execute it, log it as valid, or act on its outputs.**

---

## Governance Minimalism as a Security Feature

Every additional approval layer in a governance system is a target for social engineering. "Just get approval from X" is an attack that works when X is compromised, coerced, or deceived. By minimizing governance layers—three classes, clear authority at each, no committees—Phoenix eliminates most social engineering attack surfaces.

The PHOENIXMASTERKEY ceremony provides security at the constitutional tier without creating a committee. The mission does not wait for consensus of parties who do not hold constitutional authority.

---

## The Anti-Bureaucracy Rule

If an agent finds itself:
- Waiting for approval on a Class 1 decision
- Seeking consensus on a Class 2 decision when AGENT-99 is available
- Unable to proceed on an operational task due to process ambiguity

...the agent escalates to the next authority tier immediately and states: "I need a classification ruling on this decision." AGENT-99 classifies it. Action proceeds.

Governance friction on operational tasks is a failure mode. The framework exists to enable mission execution, not to create permission theater.
