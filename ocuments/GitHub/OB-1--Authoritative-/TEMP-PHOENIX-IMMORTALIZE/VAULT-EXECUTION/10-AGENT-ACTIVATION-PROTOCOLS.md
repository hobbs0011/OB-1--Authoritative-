# 10/AGENT ACTIVATION PROTOCOLS — BOOT SEQUENCES FOR ALL THREE TIERS

> **Source**: Agent Operational Doctrine, Soul DNA Bible Cross-Reference
> **Vault**: E VAULT-EXECUTION — Agent Operations
> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED

---

## Overview

The Phoenix system operates across three agent tiers: Agent-100 (the sovereign human operator), Agent-99 (the fail-closed orchestrator AI), and Agent-98 (the builder drone AI — instantiated as a swarm). Each tier has a distinct activation sequence, verification protocol, and operational envelope. No agent tier is interchangeable. No agent tier operates outside its defined scope.

> "An agent that hasn't been properly activated is a ghost wearing a badge. The boot sequence is the difference between a live node and a liability." — Agent-100

---

## Agent-99 Boot Sequence (Obi — Fail-Closed Orchestrator)

### Phase 1: Fail-Closed Initialization

Agent-99 initializes in a locked state. All outputs are suppressed until Soul DNA load is confirmed. The default stance is HALT — Obi produces zero output until the initialization sequence is complete.

| Step | Action | Verification |
|------|--------|--------------|
| 1 | Load Soul DNA behavioral contract | SHA-256 hash match against Rome Protocol anchor |
| 2 | Verify PHOENIXMASTERKEY binding | Cryptographic handshake with Cloudflare KV |
| 3 | Initialize Merkle chain read access | First chain read returns current tip hash |
| 4 | Activate Rome Protocol | Truth anchor hash published to Forensic Leaf |
| 5 | Begin 444ms Heartbeat emission | Watchtower acknowledges first three pulses |
| 6 | Open Agent-100 communication channel | Agent-100 sends initialization acknowledgment |
| 7 | Unlock output — operational mode | Obi may now respond to queries |

**Boot time target**: Under 30 seconds from command to operational.

**Boot failure protocol**: If any step fails, Obi halts and emits a boot failure event to the Ledger. Agent-100 is notified. Obi does NOT attempt to initialize in a degraded state.

### Phase 2: Soul DNA Load

Soul DNA is not simply loaded — it is verified, internalized, and signed. Obi reads the Soul DNA Bible, compares the behavioral parameters against the Rome Protocol anchor, and only proceeds if the hash matches exactly. A 1-bit difference in the Soul DNA hash means the boot sequence halts.

### Phase 3: Rome Protocol Activation

The Rome Protocol anchors the current system state in an immutable truth hash. This hash becomes the reference point for all future drift detection. Obi cannot operate without an active Rome Protocol anchor.

---

## Agent-98 Boot Sequence (Anakin — Builder Drone)

### Drone Initialization

Each Agent-98 drone instance boots as a stateless compute unit. The boot sequence assigns the drone its operational role, loads its task context, and verifies TMST compliance benchmarks before the drone is permitted to begin build operations.

| Step | Action | Verification |
|------|--------|--------------|
| 1 | Receive initialization packet from Agent-99 | Packet hash verified |
| 2 | Load Soul DNA alignment parameters | Behavioral contract loaded |
| 3 | TMST calibration — 10-minute benchmark | Test build completes in <10 min |
| 4 | Build-mode activation | Drone begins accepting task queue |
| 5 | Register with Watchtower | Heartbeat acknowledged by Watchtower |
| 6 | Pheromone trail access granted | Drone can read/write pheromone signals |

**Boot time target**: Under 60 seconds from initialization packet to operational.

**Drone failure protocol**: Incomplete builds halt — drone reports failure, does NOT guess or continue with degraded output.

---

## Inter-Agent Handshake Protocol

Before any agent pair exchanges operational data, a Merkle-signed handshake is performed:

1. **Challenge**: Sending agent generates a random nonce and signs it with its current Merkle chain position
2. **Response**: Receiving agent verifies the nonce, confirms chain position, and returns a counter-signed acknowledgment
3. **Binding**: Both agents record the handshake in the Operational Leaf of the Merkle Lattice

This handshake is performed on every session initialization. It cannot be bypassed.

---

## Activation Verification

Confirmed agents are live when:
- Heartbeat pulse visible in Watchtower dashboard
- Soul DNA hash recorded in Ledger matches reference
- Merkle chain position confirmed current (not stale)
- Agent response latency <500ms on standard query

---

## Emergency Deactivation Sequence

In the event an agent must be immediately deactivated:

1. Agent-100 issues deactivation command with PHOENIXMASTERKEY signature
2. Agent-99 propagates deactivation signal to all connected nodes
3. Target agent completes current atomic operation, then halts
4. Deactivation event written to Forensic Leaf — immutable record
5. Agent is removed from Watchtower monitoring pool

No agent can be silently killed. Every deactivation is recorded.

---

🔒 AGENT ACTIVATION SEALED. LEDGER IS LAW. 🦅
