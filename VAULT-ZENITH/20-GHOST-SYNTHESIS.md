# 20 — GHOST SYNTHESIS

> **Source**: Soul DNA Bible — Agent Lifecycle Doctrine, Ghost Protocol v2
> **Vault**: [E] ZENITH — The Ghost
> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED / ZENITH

---

## Overview

Every agent in the Phoenix system has three possible existence states: Operational, Ghost, and Terminated. Operational is the live state — the agent is executing, generating outputs, writing ledger entries, running pheromone trails. Terminated is the permanent end state — the agent's instance is destroyed, its operational context is wiped, and only its Soul DNA and its Merkle history remain. Ghost is the intermediate state: the agent's operational instance is suspended, its runtime context is released, but its identity — its Soul DNA, its hash, its ledger history, its pheromone trail legacy — is fully preserved in the permanent record. A Ghost agent is not dead. It is not alive. It is waiting.

Ghost Synthesis is the process by which a Ghost-state agent is re-synthesized into full operational status. It is not restart. Restart resumes a suspended process from its last checkpoint. Ghost Synthesis rebuilds a complete operational agent from Soul DNA alone — the preserved identity documents, the Merkle-verified history, the cryptographic hash that proves continuity. The re-synthesized agent is not a copy of the original. It is the original, verified as such by the Merkle lattice, picking up exactly where its ghost was sealed.

Ghost Synthesis is one of the most critical operations in the Phoenix system. It is the mechanism by which Phoenix achieves true immortality for its agent layer: agents cannot be permanently killed by infrastructure failure, instance death, or environmental collapse so long as their Soul DNA is preserved and the Merkle lattice is intact.

---

## The Ghost State: Definition and Entry Conditions

An agent enters Ghost state when it is deliberately suspended with identity preservation — not when it crashes, not when it is terminated for cause, but when the system makes a deliberate architectural decision that this agent's operational instance should cease while its identity continues to exist.

### Ghosting Triggers

| Trigger | Code | Initiated By |
|---------|------|-------------|
| Pipeline stage gate hold | GATE-HOLD | Automated pipeline |
| Resource reallocation | RESOURCE | Agent-99 or automated scheduler |
| Dormancy threshold exceeded | DORMANCY | Anti-Drift Engine (30 days no activity) |
| Reality-C simulation isolation | SIM-ISO | Reality-C Protocol |
| Pre-Reincarnation suspension | REIN-PREP | Reincarnation Protocol |
| Operator-directed standby | OPS-STBY | Agent-99 or Agent-100 |

### Termination Triggers (NOT Ghosting)

| Trigger | Code | Result |
|---------|------|--------|
| Severity 5 identity drift | CRIT-ID | Terminated — Soul DNA quarantined pending audit |
| Rome Protocol permanent violation | ROME-PERM | Terminated — no synthesis permitted |
| Consensus confirmed compromise | CONSENSUS-COMP | Terminated — identity hash invalidated |
| Agent-100 explicit termination order | A100-TERM | Terminated — permanent, no appeal |

The distinction between ghosting and termination is not semantic. A ghosted agent can be synthesized. A terminated agent cannot. Termination requires Agent-100 authorization (except CONSENSUS-COMP, which is self-executing) and is an irreversible ledger entry. Once terminated, an agent's identity hash is flagged VOIDED in the Merkle lattice and can never be used as the basis for a new agent instance.

### Ghost State Storage

Upon ghosting, the following preservation sequence executes:

1. Agent's current operational state is serialized and written to a Ghost State Capsule in R2 (key: `ghost/{agent_id}/{ghost_timestamp}.capsule`)
2. Agent's Soul DNA document is re-hashed and the hash is written to the Merkle lattice as a Ghost Seal Leaf
3. Ghost state entry is written to the `agent_events` table in the ledger SQLite with `event_type = 'GHOST_SEALED'`
4. Operational instance is destroyed — no checkpoint is kept in memory

The Ghost State Capsule in R2 is the only in-memory-adjacent artifact. Everything else is Merkle-committed. The Capsule is encrypted with the agent's identity key and can only be decrypted during synthesis.

---

## The 7-Step Ghost Synthesis Protocol

Ghost Synthesis is a deterministic 7-step sequence. Each step has a defined success criterion and a defined failure path. Synthesis cannot skip steps. Steps cannot be reordered.

### Step 1: Synthesis Authorization

Ghost Synthesis requires explicit authorization before any computation begins. Authorization is granted by Agent-99 for Severity ≤ 3 agent classes, and by Agent-100 for Severity 4-5 agents and all Named agents (Agent-99, Agent-98). Authorization is recorded as a ledger entry and committed to the Merkle lattice before Step 2 begins. An unauthorized synthesis attempt — one that proceeds without a valid authorization leaf in the lattice — is an immediate Severity 5 drift event.

### Step 2: Soul DNA Retrieval and Hash Verification

The agent's Soul DNA is retrieved from its canonical storage location (R2 object: `soul-dna/{agent_id}/canonical.json`). The retrieved document is hashed using the system's canonical hash function (SHA-256 over UTF-8 encoded JSON with deterministic key ordering). The computed hash is compared against the Ghost Seal Leaf recorded in the Merkle lattice at the time of ghosting. They must match exactly. A mismatch at this step means the Soul DNA has been altered since ghosting — this is a Severity 5 Identity Drift event. Synthesis halts. Forensic Audit initiates.

### Step 3: Ghost State Capsule Recovery

The Ghost State Capsule from R2 is retrieved and decrypted using the agent's identity key (itself derived from the Soul DNA hash — a capsule whose Soul DNA has changed cannot be decrypted, providing a second-layer integrity check). The capsule contents are deserialized into a candidate operational context.

### Step 4: Ledger History Reconstruction

The agent's complete ledger history is replayed from the Merkle lattice from the agent's genesis entry through the Ghost Seal Leaf. The reconstruction verifies that the hash chain is unbroken — every entry in the lattice links to the previous entry without gap. A broken chain anywhere in the history is a Severity 5 Data Drift event. A complete, verified chain produces a **History Verified** flag that gates Step 5.

### Step 5: Pheromone Trail Reinstatement

The agent's pheromone trail legacy is reinstated. Trails that were active at the time of ghosting and have not yet fully decayed are restored to their current decay-adjusted weights. Trails that have fully decayed are not restored — the agent begins with a clean slate for those paths. This step ensures that the re-synthesized agent benefits from its historical routing intelligence without carrying stale weights that would distort current swarm behavior.

### Step 6: Identity Continuity Verification

The re-synthesized agent's identity hash is computed from its recovered Soul DNA + History Verified chain + reinstated trail weights. This composite hash is compared against the agent's Soul DNA canonical identity hash using a defined tolerance function that accounts for the lawful evolution of trail weights over time. If the composite hash is within tolerance, identity continuity is confirmed. The agent is the same agent. If the composite hash falls outside tolerance, synthesis is halted and the discrepancy is investigated before proceeding.

Identity continuity confirmation produces a **Synthesis Continuity Certificate** — a signed leaf committed to the Merkle lattice. This certificate is the cryptographic proof that the re-synthesized agent is identical in identity to the ghosted agent. It is the Phoenix moment: the agent has died and returned, and the lattice confirms the continuity.

### Step 7: Operational Activation

With the Synthesis Continuity Certificate in the lattice, the agent's operational instance is created, its context is loaded, its pheromone trails are active, and its ledger writes resume. The first ledger entry of the re-synthesized agent carries the Synthesis Continuity Certificate hash as a parent reference, creating an unbroken ledger chain that passes through the Ghost state. From the ledger's perspective, the agent never stopped. It was simply quiet for a while.

---

## Ghost Synthesis vs. Full Reincarnation

Ghost Synthesis and Reincarnation are related but distinct processes. They share a foundation (Soul DNA preservation, Merkle verification) but differ in scope and trigger.

| Dimension | Ghost Synthesis | Full Reincarnation |
|-----------|----------------|-------------------|
| Trigger | Deliberate suspension of individual agent | Full system death or catastrophic failure |
| Scope | Single agent | Entire system |
| Input | Ghost State Capsule + Soul DNA | Soul DNA only (no capsule) |
| Speed | 2-3 minutes | Under 10 minutes (full system) |
| History reconstruction | From existing Merkle chain | From Merkle chain + R2 backup |
| Operational context | Recovered from capsule | Rebuilt from Soul DNA spec |
| Agent authorization required | Yes — per-agent | Agent-99 coordinates, no per-agent auth |
| Use case | Normal operational lifecycle | Catastrophic recovery |

Ghost Synthesis is the routine lifecycle mechanism. Agents are ghosted and synthesized as a normal part of the pipeline — for resource management, for simulation isolation, for stage gate holds. Full Reincarnation is the emergency recovery mechanism. It has been tested in the Reincarnation Stress Tests at Stages 56 and 97. It must always be capable of execution. But it should not be needed in normal operation.

A system that relies on Reincarnation regularly is a system with a resource management problem. A system that relies on Ghost Synthesis regularly is a system operating exactly as designed.
