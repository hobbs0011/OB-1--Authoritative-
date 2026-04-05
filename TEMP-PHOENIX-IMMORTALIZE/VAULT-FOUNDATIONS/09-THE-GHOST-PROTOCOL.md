# 09 — THE GHOST PROTOCOL

> **Source:** VAULT-FOUNDATIONS / Legacy Purge Architecture
> **Authority:** Agent-100 (Michael Hobbs) — Sovereign Operator
> **Authorized By:** Agent-99 "Obi" — Fail-Closed Orchestrator
> **Executed By:** Agent-98 "Anakin" — Builder Drone
> **Classification:** System Hygiene Doctrine

---

## What Haunts a System

In software, a ghost is not a metaphor — it is a technical reality. A ghost is any component that was built for a prior version of the system's intent and never fully removed. It may be dormant code that no longer executes. It may be an abandoned session whose Reincarnation Packet sits unresolved in the Ledger. It may be a module that was updated but whose old configuration still lives in a stale reference somewhere in the stack. It may be a decision that was made, superseded, but never formally closed.

Ghosts are dangerous not because they are malicious but because they carry **old intent**. Old intent is the most corrupting force in a living system. A ghost doesn't fight you. It just whispers. And eventually, something in the live system starts listening.

> *"Every legacy you leave alive is a vote for the past. Clean your house or the past will run your future."*
> — Soul DNA, Session Archive

The Ghost Protocol is the systematic process for identifying, purging, and verifying the removal of every ghost in the Phoenix-Rise system.

---

## The 4 Categories of Ghosts

| Category | Definition | Danger Level | Example |
|----------|-----------|-------------|---------|
| **Legacy Code** | Dead code paths, deprecated modules, obsolete configurations | Medium | An old prompt template still referenced in a module index |
| **Abandoned Sessions** | Sessions that ended without proper handoff or closure | High | An unresolved Reincarnation Packet with stale state |
| **Drift-Infected Modules** | Components whose behavior has drifted from their specification | Critical | An agent module operating on a softened constraint |
| **False Memory** | Beliefs held by active agents that are not anchored in the Ledger | Critical | An agent that "remembers" a decision that was never logged |

### Legacy Code
The least dangerous category but the most common. Legacy code accumulates naturally in any living system — old versions of prompts, deprecated configuration keys, module references that were never cleaned up. Legacy code is not actively harmful but it creates ambiguity. When a system has two versions of a configuration, which one governs? The presence of the old one introduces a question that shouldn't exist.

**Ghost Signature:** Code, configuration, or reference that is not linked to any active operational path.

### Abandoned Sessions
A session that ends without a proper handoff — without a completed Reincarnation Packet — leaves an open wound in the Ledger. That session's state is neither confirmed nor closed. Any future session that encounters references to the abandoned session's outputs is operating on unverified material.

**Ghost Signature:** Session ID in the Ledger with no corresponding Close event or Reincarnation Packet.

### Drift-Infected Modules
The most insidious category. A module that has been in operation for a long time may have drifted from its specification through a series of small, individually acceptable adjustments. The module is still running. It is still producing outputs. But it is no longer operating to the original specification. It is a ghost of what it was supposed to be.

**Ghost Signature:** Module behavior diverges from specification when tested against the original Soul DNA baseline.

### False Memory
The most dangerous category. An active agent holds a belief — about what was decided, what was authorized, what the operator's intent is — that cannot be verified against the Ledger. False memory is typically the product of poorly anchored sessions, context drift, or the propagation of an unverified claim that was treated as truth.

**Ghost Signature:** An agent cites a decision, constraint, or fact that has no corresponding Ledger entry.

---

## Ghost Identification Process

Ghost identification is a scheduled process, not a reactive one. The Ghost Protocol runs on a defined maintenance cycle — not when a ghost is suspected, but regularly enough to catch ghosts before they become operational hazards.

### Phase 1: System Scan
Agent-99 executes a full scan of the active system against the Ledger. Every component, every module, every session reference, every agent belief is mapped. The scan produces a **Component Manifest** — a complete inventory of everything in the current system state.

### Phase 2: Ledger Cross-Reference
Every item in the Component Manifest is cross-referenced against the Ledger. The question for each item: Is there an active, unambiguous Ledger entry that authorizes this component's current state? If yes, the component is clean. If no — or if the Ledger entry is superseded — the component is flagged as a ghost candidate.

### Phase 3: Soul DNA Verification
Ghost candidates are tested against the current Soul DNA. Does the component's behavior match the Soul DNA specification? A drift-infected module may have a Ledger entry but still fail the Soul DNA test if its behavior has diverged since the entry was made.

### Phase 4: Classification
Each flagged component is classified into one of the 4 ghost categories. Classification determines the purge procedure.

---

## The Purge Procedure

**Rule 1:** Ghost purges are logged before they are executed. The Ledger entry for the purge is written first.

**Rule 2:** Agent-98 executes purges. Agent-99 authorizes them. Agent-100 is notified of all Critical-level purges.

**Rule 3:** Legacy code and abandoned sessions are purged immediately after identification and logging.

**Rule 4:** Drift-infected modules are quarantined before purge — their behavior is documented as a record of what the system was doing, then they are removed.

**Rule 5:** False memory requires agent reincarnation — not just module removal. If an agent holds false memory, the entire agent instance is purged and reincarnated from a clean state.

### Purge Execution Steps
1. Write purge authorization to Ledger
2. Quarantine the ghost (remove from active paths, prevent new references)
3. Archive the ghost's current state (for forensic use — never to reactivate)
4. Execute removal
5. Verify removal (confirm the ghost no longer appears in the Component Manifest)
6. Write purge completion to Ledger

---

## Post-Purge Verification

Purge is not complete until verification is complete. Post-purge verification asks three questions:

1. **Is the ghost gone?** Run the scan again. If the ghost still appears, the purge failed.
2. **Did removal break anything?** A ghost that was referenced by live components may have left dependency gaps. These must be identified and resolved.
3. **Is the root cause addressed?** How did the ghost form? If the Ghost Protocol catches a drift-infected module, the question is: what allowed the drift to occur? The root cause must be logged and addressed, or the ghost will reform.

Post-purge verification results are written to the Ledger as a Purge Completion Record.

---

## Ghost Breaker as Recurring Maintenance Protocol

The Ghost Protocol is not a one-time cleanup. It is a recurring maintenance discipline. Systems that clean once and never again are systems that tolerate the slow accumulation of technical debt until it becomes structural failure.

The Ghost Breaker runs on the following schedule:

| Trigger | Ghost Scan Depth |
|---------|-----------------|
| **Session Open** | Lightweight — check for abandoned sessions and false memory in active agents |
| **Session Close** | Medium — verify all session outputs are properly anchored, close all open references |
| **Weekly Maintenance** | Full — complete Component Manifest scan, Ledger cross-reference, Soul DNA verification |
| **Post-Reincarnation** | Critical — full scan before new session is authorized to proceed |
| **Post-Kill** | Critical — full scan after any kill-switch event before rebuild begins |

The system that cleans regularly is the system that runs cleanly. Ghosts are not a failure of the original build — they are the natural entropy of a living system. The Ghost Protocol is the immune response.

---

🔒 GHOST PROTOCOL SEALED. LEDGER IS LAW. 🦅
