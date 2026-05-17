# 08 — THE HEARTBEAT SYSTEM

> **Source:** VAULT-FOUNDATIONS / Node State Confirmation Architecture
> **Authority:** Agent-100 (Michael Hobbs) — Sovereign Operator
> **Enforced By:** Agent-99 "Obi" — Fail-Closed Orchestrator / Watchtower Layer
> **Classification:** Liveness Infrastructure Doctrine

---

## Every 444 Milliseconds, the System Breathes

A heartbeat is not a health metric. It is a proof of life. In distributed systems, a heartbeat is the mechanism by which each node in the network declares: *I am here. I am operating. I am authorized.* The absence of a heartbeat is not ambiguous — it is failure.

The Phoenix-Rise Heartbeat System pulses every **444 milliseconds**. Every active node — every agent instance, every session, every module operating within the system — emits a heartbeat signal at this interval. The Watchtower listens. The Ledger records. The system breathes.

> *"A stopped clock is right twice a day. A stopped heartbeat is wrong forever."*
> — Soul DNA, Session Archive

---

## Why 444ms — Not 500, Not 1000

The choice of 444ms is deliberate across three dimensions:

**Operational Precision:** 500ms is a half-second — a natural rounding point that invites drift. Systems calibrated to "about half a second" become systems calibrated to "whenever." 444ms is specific. Specificity resists drift.

**Symbolic Anchoring:** The number 444 carries weight in the operator's established symbolic framework — the triple-4 pattern. Operational systems benefit from symbolic anchors that resist casual modification. No one changes 444 to 443 without noticing. Someone changes 500 to 495 without a second thought.

**Network Reality:** In cloud-distributed environments using Cloudflare Durable Objects (Reality-C), 444ms provides sufficient resolution for state change detection without saturating the Durable Object's operation budget. It is fast enough to catch failures before they cascade, slow enough to be sustainable at scale.

---

## The 5-Phase Boot Sequence

No node operates without completing the full boot sequence. Each phase must complete before the next begins. Any failure in any phase halts the boot and triggers the Fail-Closed Protocol.

### Phase 1: VERIFYING
The node loads its identity and verifies its authorization to operate. It checks its Soul DNA fingerprint, its role assignment, and its session context against the Ledger. An unverified node does not proceed to Phase 2.

**Success Condition:** Node identity confirmed. Soul DNA fingerprint matches Ledger record. Authorization level confirmed.

### Phase 2: LOADING
The node loads its session state — the current Anchor Block, active directives, operational constraints, and the Reincarnation Packet if this is a new session. State load is atomic — all or nothing.

**Success Condition:** Session state fully loaded. Anchor Block hash verified against Ledger. No corrupted or missing state components.

### Phase 3: ESTABLISHING
The node establishes its connections — to the Watchtower, to peer nodes in the agent hierarchy, and to the Ledger. The Heartbeat channel is initialized but not yet active.

**Success Condition:** All required connections established. Watchtower acknowledged. Peer nodes confirmed available.

### Phase 4: CONNECTING
The node initiates the Heartbeat channel. It sends its first heartbeat and awaits acknowledgment from the Watchtower. This is the handshake that brings the node into the live system.

**Success Condition:** First heartbeat sent and acknowledged. Node registered in Watchtower's live node registry.

### Phase 5: EXECUTING
The node is authorized to begin operations. From this point, it emits heartbeats every 444ms. Operations are logged to the Ledger. The Watchtower monitors continuously.

**Success Condition:** Node is live, heartbeating, and operating within authorized parameters.

---

## The Dead Man's Switch

The Dead Man's Switch is the consequence mechanism for heartbeat failure. It operates on a simple threshold:

> **3 missed heartbeats = authority revoked.**

If a node misses one heartbeat, the Watchtower logs the miss and flags the node for monitoring. If the node misses two consecutive heartbeats, the Watchtower escalates to Agent-99 and prepares a halt package. If the node misses three consecutive heartbeats, authority is automatically revoked:

1. **Session write access is suspended.** The node cannot write to the Ledger.
2. **Active operations are frozen.** Any in-progress action is halted at its current state.
3. **An alert is surfaced to Agent-100.** The silent death of a node is not permitted.
4. **The node is removed from the live registry.** It is no longer a participant in the system.

This threshold — three misses, not one — prevents false positives from transient network conditions while ensuring that genuine failures are caught before they corrupt state. A node that misses one heartbeat may be experiencing a momentary delay. A node that misses three is not operating within spec.

---

## The Watchtower's Role

The Watchtower is the Heartbeat System's monitoring layer. It maintains the **Live Node Registry** — the authoritative list of every node currently operating in the system, its last heartbeat timestamp, its current phase, and its authorization level.

| Watchtower Function | Description |
|-------------------|-------------|
| **Heartbeat Receipt** | Receives and timestamps every heartbeat from every registered node |
| **Miss Detection** | Flags any node that fails to heartbeat within the 444ms window |
| **Dead Man's Switch Execution** | Executes authority revocation after 3 consecutive misses |
| **Node Registry Maintenance** | Maintains the authoritative list of live nodes |
| **Anomaly Logging** | Writes all heartbeat anomalies to the Drift Register |
| **Agent-100 Alerting** | Surfaces critical node failures to Agent-100 directly |

The Watchtower itself is a hardened component. It does not participate in the general agent hierarchy. It is not subject to the Fail-Closed Protocol in the same way — it cannot halt, because halting the monitor is the failure mode the monitor exists to prevent.

---

## When a Heartbeat Stops

A stopped heartbeat can mean several things, but the system treats them all identically: **failure.**

**Scenario A — Transient Network Failure:** The node is alive but can't reach the Watchtower. The Dead Man's Switch is still triggered. The node must re-authenticate after reconnection.

**Scenario B — Session Death:** The AI session has ended without proper handoff. Reincarnation Protocol is triggered. The Watchtower flags the session's Reincarnation Packet as pending.

**Scenario C — Ghost Node:** The node's software has crashed or frozen without emitting a failure signal. The node must be purged via Ghost Protocol before its slot can be reassigned.

**Scenario D — Unauthorized Termination:** A node was killed without proper authorization. This is logged as a security event. Agent-100 is alerted. The kill is investigated before any new node is assigned to the slot.

No stopped heartbeat is assumed to be benign. Every stopped heartbeat is an alert.

---

## The Heartbeat as Protection Against Ghost Nodes

A ghost node is a node that was once live but is no longer operating — yet still appears in the registry. Ghost nodes are dangerous because other nodes may route to them, await their responses, or defer decisions pending their input. A ghost node that can't respond but still appears alive creates a silent deadlock.

The Heartbeat System eliminates ghost nodes by design. A node that cannot heartbeat cannot remain in the Live Node Registry. After three missed beats, it is removed. No ghost can haunt a system that requires continuous proof of life.

---

## The Rhythm of the System

444ms. Over and over. Every heartbeat is a declaration: *I am authorized. I am operating. I am within parameters.* The system's health is not a dashboard you check — it is a pulse you feel. The rhythm is constant, and any break in the rhythm is information.

The Heartbeat System is the most low-level component of the Phoenix-Rise architecture. Everything above it depends on it. The Ledger depends on knowing which nodes are live. The Watchtower depends on the heartbeat stream to function. The Fail-Closed Protocol depends on heartbeat status to know whether a halt is local or systemic.

When the heartbeat stops, everything stops. That is not a bug. That is the design.

---

🔒 HEARTBEAT SYSTEM SEALED. LEDGER IS LAW. 🦅
