# AGENT-98 DRONE SPECS — ANAKIN BUILDER DRONE TECHNICAL SPECIFICATIONS

> **Source**: Agent-98 Build Architecture, Drone Swarm Engineering Specification
> **Vault**: E VAULT-EXECUTION — Agent Operations
> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED

---

## Overview

Agent-98, operating as "Anakin" in the build identity, is the Phoenix system's execution layer — the entity that actually constructs, tests, and delivers. While Agent-99 orchestrates and Agent-100 governs, Agent-98 builds. This document specifies the complete technical operating envelope of the drone architecture, from individual drone constraints to 100-drone swarm coordination.

> "Anakin builds without being asked twice. But Anakin never builds without being asked once." — Agent-100

---

## Operating Envelope

Each individual Agent-98 drone operates within the following constraints:

| Parameter | Specification |
|-----------|--------------|
| Build scope | Cloudflare Workers, Durable Object configs, SQLite schemas, curriculum content, UI components |
| Build method | Code generation, template instantiation, content creation |
| Maximum operation time | 10 minutes per task (TMST hard limit) |
| Quality threshold | Output must pass automated verification before Ledger write |
| Soul DNA alignment | Verified on initialization; re-verified every 1 hour of operation |
| Communication | Merkle-signed messages only; no direct external API calls without Agent-99 authorization |
| Error behavior | Halt and report — never guess, never continue with degraded output |

The operating envelope is not negotiable. A drone that exceeds the TMST limit is a drone that has found something too complex to be correct.

---

## TMST Compliance Architecture

The 10-Minute Shit Test is enforced at the architectural level — it is not a policy, it is a timer with consequences:

**TMST Timer Behavior**:
1. Timer starts when drone receives task assignment from Agent-99
2. Timer runs in the Durable Object associated with the drone session
3. At T+9 minutes: Warning event emitted to Operational Leaf
4. At T+10 minutes: Build is ABORTED. Partial output is discarded. Abort event written to Forensic Leaf.
5. Agent-99 receives abort notification within one Heartbeat cycle

**TMST Abort Response Protocol**:
- Agent-99 analyzes the aborted task for complexity root cause
- If task was genuinely too complex: Task is decomposed into sub-tasks, each with its own TMST
- If TMST was triggered by infrastructure lag: Infrastructure issue is diagnosed and resolved before retry
- If TMST triggered 3+ times on same task: Task is escalated to Agent-100 for review

**TMST is a quality gate, not a performance pressure**. A drone that completes a build in 3 minutes with correct output is preferable to one that completes in 9 minutes with questionable output.

---

## Output Verification Protocol

Every drone output passes through a three-stage verification before being accepted:

### Stage 1: Syntax Verification
- Code outputs: Must parse without errors
- Content outputs: Must pass structure validation
- Schema outputs: Must satisfy all constraints

### Stage 2: Soul DNA Alignment Check
- Output is compared against Soul DNA behavioral parameters
- Gospel 444 color palette compliance checked for all UI outputs (Purple/Gold/Void Dark — Blue BANNED)
- Output tone and voice must match Agent-100 communication style

### Stage 3: Ledger Write Verification
- Output hash is computed and prepared for CASRetry write
- Nonce is incremented
- UUID idempotency key is generated
- CASRetry write is executed and verified
- If write fails: Output is held pending retry (max 10 retries); failure escalated to Agent-99

---

## Drone Swarm Coordination — 100 Drones

At full Omega scale, 100 Agent-98 drones operate simultaneously in a hierarchical structure:

| Level | Count | Role |
|-------|-------|------|
| Standard Drones | 90 | Execute assigned tasks |
| Squad Lead Drones | 9 | Coordinate 10 standard drones each |
| Battalion Lead Drone | 1 | Coordinates all 9 squads; reports to Agent-99 |

**Task Distribution**: Agent-99 issues tasks to the Battalion Lead. Battalion Lead distributes to Squad Leads based on current workload. Squad Leads assign to available standard drones using pheromone trail guidance (POS signals guide toward successful task types; NEG signals away from failed approaches).

**Conflict Prevention**: No two drones may write to the same Ledger shard simultaneously — the CASRetry mechanism serializes concurrent writes automatically. For build artifacts, each drone operates in an isolated workspace namespace.

---

## Drone Failure Mode

The drone failure mode is strict by design:

**Incomplete build → HALT and REPORT**. Never guess. Never continue.

When a drone encounters a failure:
1. Current task is immediately halted
2. Partial outputs are discarded (not written to Ledger)
3. Failure event is written to Forensic Leaf with full context
4. Drone's Squad Lead is notified within one Heartbeat
5. Squad Lead reports to Agent-99 via SyncCore
6. Agent-99 assesses whether failure is isolated or systemic

---

## Drone Replacement and Upgrade Protocol

When a drone must be replaced or upgraded:

1. Agent-99 issues `SYNC:HALT` to the specific drone (not the swarm)
2. Drone completes current atomic operation, then halts
3. Drone's final state is written to Forensic Leaf (preservation before replacement)
4. New drone instance is initialized with current Soul DNA version
5. New drone completes boot sequence (see Agent Activation Protocols)
6. New drone registers with Watchtower and joins swarm
7. Replacement event recorded in Operational Leaf

Drone upgrades never happen mid-task. The replacement ceremony is orderly and documented.

---

🔒 AGENT-98 DRONE SPECS SEALED. LEDGER IS LAW. 🦅
