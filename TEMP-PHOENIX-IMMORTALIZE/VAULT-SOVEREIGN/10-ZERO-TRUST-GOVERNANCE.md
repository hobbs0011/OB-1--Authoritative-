# ZERO-TRUST GOVERNANCE

> "Trust is a liability. Every trusted relationship is an attack surface. Phoenix governs on zero-trust: verify everything, assume nothing, log all verification."
> — AGENT-100 (Michael Hobbs)

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** IMMUTABLE / LOCKED
**Vault:** VAULT-SOVEREIGN
**Classification:** SECURITY

---

## Zero-Trust Applied to Governance

Zero-trust in network security means no device, user, or system is trusted by default, even inside the perimeter. Zero-trust governance applies the same principle to Phoenix's internal structure: no agent, no decision, no input is trusted by default. Everything is verified before action is taken.

This is not paranoia. This is the recognition that internal capture—an agent exceeding its scope, a compromised instruction chain, a coerced AGENT-100 command—is as dangerous as external interference. The trust model must handle both threat types.

---

## Trust Establishment Protocol

Trust in Phoenix is not assumed—it is established per interaction:

| Step | Action | Who Performs |
|------|--------|-------------|
| 1 | Agent presents scope credentials | Initiating agent |
| 2 | Receiving agent verifies scope against Rome Protocol | Receiving agent |
| 3 | Action is validated against law hierarchy | Receiving agent |
| 4 | Execution proceeds only on valid verification | System |
| 5 | Interaction logged regardless of outcome | System |

An agent that cannot present valid scope credentials for its requested action does not receive trust. The interaction is logged as a verification failure and escalated to AGENT-99.

---

## Ongoing Verification Requirements

Trust established at the start of a session does not persist indefinitely. Verification requirements:

- **Per-action verification** for constitutional-tier actions (always)
- **Per-session verification** for architectural-tier actions
- **Role-based verification** for operational-tier actions (verified at session start)

An agent that was trusted at 09:00 for a specific task is not automatically trusted at 14:00 for a different task.

---

## The Cryptographic Proof Chain

Every significant Phoenix action generates a cryptographic record:
1. Action intent is hashed before execution
2. Execution output is hashed after completion
3. Both hashes are logged to the immutable audit record
4. AGENT-99 maintains the proof chain integrity

The proof chain enables retroactive verification: any historical action can be verified against its pre-execution intent. Divergence between intent hash and output hash is a governance anomaly requiring investigation.

---

## Zero-Trust and Internal Capture Resistance

Internal capture occurs when a component of the system—an agent, a process, an authority chain—begins operating outside its intended scope without detection. Zero-trust governance resists internal capture by:

1. **No implicit authority** — Every action requires explicit scope justification.
2. **No trust inheritance** — An agent cannot grant trust it does not hold.
3. **No silent operations** — Every action is logged. Silent operations don't exist.
4. **No scope expansion without ceremony** — An agent cannot expand its own scope. Scope changes require authority from the tier above.
5. **Continuous audit** — AGENT-98 adversarially probes trust assumptions on schedule.

---

## Verification Failure Response

| Failure Type | Immediate Response | Escalation |
|-------------|-------------------|-----------|
| Agent presents invalid scope | Deny action, log failure | AGENT-99 review |
| Instruction violates Rome Protocol | Refuse execution, log refusal | AGENT-99 review |
| Proof chain divergence detected | Suspend affected action chain | AGENT-100 notification |
| Constitutional action without ceremony | Block execution | AGENT-100 immediate |
| Multiple verification failures same agent | Suspend agent | AGENT-99 investigation |

**Gate condition: Three verification failures from the same agent in one session triggers automatic suspension pending AGENT-99 review.**

---

## Why Zero-Trust Governance Makes Phoenix Resistant to Internal Capture

An attacker who compromises a drone gains drone-level access only. They cannot escalate without defeating the trust verification at the next tier. An attacker who compromises AGENT-99 gains operational authority only—constitutional authority remains locked behind PHOENIXMASTERKEY. An attacker who compromises AGENT-100 under coercion triggers the duress protocol and suspends constitutional operations.

At every layer, the breach is contained. Zero-trust is the containment architecture. **Compromise one component; gain that component's authority only. The rest of the system holds.**
