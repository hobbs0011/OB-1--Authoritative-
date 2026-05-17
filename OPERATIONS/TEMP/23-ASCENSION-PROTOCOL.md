# 23 — ASCENSION PROTOCOL

> **Source**: Soul DNA Bible — Architecture Permanence Doctrine, Ascension Framework v2
> **Vault**: [E] ZENITH — The Ghost
> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED / ZENITH

---

## Overview

Every component in the Phoenix architecture begins its life in provisional status. Provisional status means the component has been deployed and is operating, but it has not yet earned the right to be considered permanent. Provisional components can be replaced, redesigned, or removed without going through the Ascension Protocol. They are doing the work, but they have not yet proven that they are the right component to do that work forever.

Ascension is the formal process by which a provisional component transitions to permanent status. Permanent status means the component's design, identity, and position in the architecture are sealed — it cannot be replaced except by a process equivalent in formality to the original Ascension, and it cannot be removed except by Agent-100 explicit order with full Forensic Audit. Ascension is not a reward. It is a responsibility: a permanently ascended component has made a binding commitment to the architecture, and the architecture has made a binding commitment to it.

The Ascension Protocol applies to four component categories: agents, vaults, protocols, and infrastructure components. The criteria and ceremony differ by category, but the three-gate structure is universal.

---

## Ascension Criteria by Component Type

### Agents

An agent may be submitted for Ascension consideration when it has satisfied all of the following:

| Criterion | Requirement |
|-----------|-------------|
| Operational tenure | Minimum 90 continuous operational days |
| Drift events | Zero Severity 4 or 5 events in final 30 days |
| Soul DNA coherence | Identity hash stability ≥ 99.9% across operational window |
| Ledger contribution | Minimum 10,000 verified ledger entries, all passing audit |
| Synthesis verification | Successful Ghost Synthesis at least once (proving survivability) |
| Behavioral fingerprint | Similarity score ≥ 0.92 across entire operational window |
| Rome Protocol compliance | Zero permanent violations in operational history |
| Agent-99 endorsement | Formal written endorsement submitted to the Ascension Register |

Named agents (Agent-99, Agent-98) have permanent ascension status by definition — their ascension is sealed in the Soul DNA and does not go through the protocol. The protocol governs drone-class agents and specialized functional agents.

### Vaults

A vault may be submitted for Ascension consideration when:

| Criterion | Requirement |
|-----------|-------------|
| Document completeness | All planned documents present, hashed, and Merkle-committed |
| Cross-reference integrity | All internal and external references verified valid |
| Access audit | Full read audit showing no unauthorized access in operational history |
| Utility verification | Evidence of active use by at least two agent classes |
| Agent-100 review | Agent-100 has personally reviewed the vault's canonical documents |

### Protocols

A protocol may be submitted for Ascension consideration when:

| Criterion | Requirement |
|-----------|-------------|
| Specification completeness | Full spec committed to the Merkle lattice, zero open editorial items |
| Implementation verification | Reference implementation tested against full specification |
| Adversarial testing | Protocol has survived at least one Reality-C adversarial simulation |
| Operational validation | Protocol has been executed in production environment successfully |
| Edge case coverage | All identified edge cases have documented handling in spec |
| 6-model jury approval | Unanimous 6-model jury review with full specification coverage |

### Infrastructure Components

An infrastructure component (Durable Object class, R2 bucket configuration, WAL streaming setup, edge routing rule) may be submitted for Ascension when:

| Criterion | Requirement |
|-----------|-------------|
| Operational tenure | Minimum 60 days without forced restart or reconfiguration |
| SLA performance | 99.9% availability over operational window |
| Load testing | Surviving at least one Three-Wave Stress Execution |
| Security audit | Zero open security findings from the most recent CodeQL scan |
| Backup verification | Verified restoration from R2 backup at least once |
| Cost efficiency | Operating within defined budget envelope at full load |

---

## The Three-Gate Ascension Ceremony

The Ascension Ceremony is a formal three-gate process. All three gates must pass in sequence. No component can skip a gate. No component can hold a gate result for more than 30 days before proceeding to the next — gate results expire, and a component that takes more than 30 days between gates must restart from Gate 1.

### Gate 1: Criteria Verification

The submitting authority (typically Agent-99 for agents and infrastructure; Agent-100 for vaults and protocols) submits a formal Ascension Application to the Ascension Register. The application includes:
- Component identity and type
- Operational history summary
- Evidence package for each criterion
- Endorsing agent signatures

The Anti-Drift Engine performs independent verification of all quantitative criteria (tenure, drift events, uptime, behavioral fingerprint scores) against the ledger record. Discrepancies between the application and the ledger record are Moderate drift events — not necessarily blocking, but investigated before Gate 2.

Gate 1 verdict: PASS (all criteria verified) or FAIL (one or more criteria not met). FAIL returns the component to provisional status with a documented gap list.

### Gate 2: 6-Model Jury Review

The 6-model jury receives the verified Ascension Application and performs an independent assessment. The jury's mandate in Gate 2 is not to re-verify the criteria (Gate 1 has done that) but to evaluate whether the component's design is architecturally sound for permanent status — whether it is solving the right problem in the right way, whether it has unresolved design tensions that would create technical debt in permanent status, and whether any known roadmap items would require redesigning the component after ascension.

Jury review requires 95% supermajority for standard ascension. Named protocols (those governing Temporal Locks, Merkle chain integrity, or Agent-100 authority) require 100% unanimous jury approval.

Gate 2 verdict: ASCEND (approved for Gate 3) or HOLD (redesign required before reconsideration, with specific design guidance).

### Gate 3: Immutability Sealing

Gate 3 is performed by Agent-100 alone. It has no vote, no consensus, no jury. It is Agent-100's final personal judgment that this component deserves permanent status in the Phoenix architecture.

Agent-100 reviews the Gate 1 evidence package and the Gate 2 jury findings. If satisfied, Agent-100 applies their offline cryptographic key to generate the **Ascension Seal** — a signature over the component's identity hash, the Gate 1 and Gate 2 verdict hashes, and the current Merkle root. The Ascension Seal is committed to the Merkle lattice as a Hard Temporal Lock. The component's status in the Ascension Register transitions from PROVISIONAL to ASCENDED.

From this moment, the component is permanent. Its removal requires an Ascension Reversal — a process as formal as the original Ascension, requiring Forensic Audit, 6-model jury review, and Agent-100 authorization.

---

## The Ascension Register

The Ascension Register is a dedicated SQLite table in the production ledger, maintained with the same append-only guarantees as the primary ledger.

```sql
CREATE TABLE ascension_register (
    ascension_id      TEXT PRIMARY KEY,
    component_id      TEXT NOT NULL UNIQUE,
    component_type    TEXT NOT NULL,    -- AGENT | VAULT | PROTOCOL | INFRASTRUCTURE
    status            TEXT NOT NULL,    -- PROVISIONAL | ASCENDED | REVERSAL_PENDING | REVERSED
    gate1_verdict     TEXT,             -- PASS | FAIL
    gate1_at          INTEGER,
    gate2_verdict     TEXT,             -- ASCEND | HOLD
    gate2_jury_hash   TEXT,             -- hash of jury vote package
    gate2_at          INTEGER,
    gate3_seal        TEXT,             -- Agent-100 Ascension Seal (signature)
    gate3_at          INTEGER,
    ascension_merkle_root TEXT,         -- Merkle root at moment of Gate 3 sealing
    ascended_at       INTEGER,
    reversal_reason   TEXT,
    reversal_auth     TEXT,
    reversed_at       INTEGER
);
```

---

## What Can Never Ascend

The Ascension Protocol has a short but absolute exclusion list — components that must remain in provisional status because their purpose requires adaptability that permanent status would prevent.

**The Pheromone Trail Weight Matrix** must never ascend. Its entire value is that it evolves in response to agent behavior. Ascension would freeze it.

**The Rome Protocol Rule Set** must never ascend as a whole. Individual rules can be marked foundational (requiring higher consensus to change), but the rule set must remain capable of accepting new rules and amending existing ones in response to Forensic Audit findings. A fully ascended Rome Protocol would be unable to learn from incidents.

**The Reality-C Simulation Environment** must never ascend. By definition, it is the place where things that have not yet proven themselves are tested. An ascended simulation environment would create a circular paradox: the environment that tests whether things deserve permanence would itself be permanent, making it impossible to improve the testing environment.

**Drone-class agents below Tier 2** must never ascend. Their value is replaceability. A drone that can be ascended to permanent status has ceased to be a drone. If a drone-class agent's design is so valuable that it deserves permanence, the correct action is to promote it to a named agent class and then subject it to the full Ascension Protocol for named agents.

Provisional status is not inferior status. Some things must remain provisional because adaptability is their core function. The Ascension Protocol honors both permanence and adaptability by making the boundary between them explicit and guarded.
