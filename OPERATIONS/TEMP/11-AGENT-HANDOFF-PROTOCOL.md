# 11 — AGENT HANDOFF PROTOCOL

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / CONNECTING
**Vault:** VAULT-NEXUS
**Classification:** OPERATIONAL — AGENT COORDINATION

---

## Purpose

Tasks in Phoenix often start with one agent and need to reach another. Agent-99 routes a classroom observation task to Agent-98. Agent-98 completes field work and hands results to Agent-99. Agent-99 escalates a decision to Agent-100. Every one of these handoffs follows a defined protocol. **No handoff happens in the dark. Every handoff is logged.**

---

## The Agent Chain

```
Agent-100 (OPERATOR — strategic authority)
        ↓ issues directives ↑ receives reports
Agent-99 (SENTURION — operational authority)
        ↓ assigns tasks ↑ receives field reports
Agent-98 (Chaos/Drone — field operations)
        ↓ deploys ↑ reports
Legion (Teacher Drones — classroom execution)
```

Handoffs flow up and down this chain. **They do not skip levels without explicit authorization from Agent-100.** Agent-98 does not report directly to Agent-100 under normal operations. Legion does not report to Agent-99 directly — they report via Agent-98.

---

## Handoff Message Format

Every agent handoff requires a structured handoff message. Missing fields = handoff rejected.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `handoff_id` | UUID | Yes | Unique identifier for this handoff |
| `timestamp` | ISO 8601 UTC | Yes | When the handoff was initiated |
| `from_agent` | String | Yes | Sending agent identity |
| `to_agent` | String | Yes | Receiving agent identity |
| `task_id` | String | Yes | The task being handed off (references a task record in D1) |
| `task_type` | Enum | Yes | `FIELD_MISSION` / `REVIEW` / `ESCALATION` / `DECISION` / `INFORMATION` |
| `priority` | Enum | Yes | `ROUTINE` / `URGENT` / `EMERGENCY` |
| `payload_summary` | String (max 500 chars) | Yes | What is being handed off, in plain language |
| `payload_ref` | String | Yes | Reference to full payload in D1 or R2 |
| `rome_check` | Boolean | Yes | Confirms task doesn't violate Rome Protocol |
| `confirmation_required` | Boolean | Yes | Does receiving agent need to confirm receipt? |
| `ttl` | Integer (seconds) | Yes | Handoff expires if not confirmed within TTL |

---

## Confirmation Requirements

| Task Type | Confirmation Required | Timeout |
|-----------|----------------------|---------|
| FIELD_MISSION | Yes — Agent-98 confirms on start AND on completion | 1 hour for start confirm, mission duration for completion |
| REVIEW | Yes — reviewing agent confirms receipt | 30 minutes |
| ESCALATION | Yes — receiving agent confirms receipt | 15 minutes |
| DECISION | Yes — decision-maker confirms receipt | 10 minutes |
| INFORMATION | Optional — confirmation flag determines this | Per flag |

---

## Ledger Entry for Every Handoff

Every handoff — successful or failed — gets a Nexus ledger entry:

```
timestamp | from_agent | to_agent | handoff_id | task_type | status | action_taken
```

**Example entries:**
```
2024-11-15T08:00:00Z | AGENT-99 | AGENT-98 | ho-7f3a9b | FIELD_MISSION | SENT | Da Nang classroom obs assigned.
2024-11-15T08:15:00Z | AGENT-98 | AGENT-99 | ho-7f3a9b | FIELD_MISSION | CONFIRMED | Agent-98 confirmed start.
2024-11-15T14:30:00Z | AGENT-98 | AGENT-99 | ho-7f3a9b | FIELD_MISSION | COMPLETE | Observation report submitted.
2024-11-15T14:45:00Z | AGENT-99 | AGENT-100 | ho-9b2c1d | ESCALATION | SENT | Student outcome anomaly at Da Nang — Agent-100 decision required.
```

---

## What Happens When the Receiving Agent Fails to Confirm

| Timeout Status | Action |
|----------------|--------|
| 50% of TTL elapsed, no confirm | Nexus sends reminder notification to receiving agent |
| TTL elapsed, no confirm | Nexus logs `HANDOFF_TIMEOUT`. Escalate to the next level up the chain. |
| Second TTL elapsed after escalation, no confirm | Agent-100 notified directly. The task is treated as BLOCKED. |

**A blocked task is never abandoned.** It stays in BLOCKED status until Agent-100 personally resolves it — either by re-assigning it, completing it directly, or explicitly canceling it with a logged reason.

---

## Timeout Rules by Priority

| Priority | Initial TTL | Escalation TTL | Final Escalation |
|----------|-------------|----------------|-----------------|
| ROUTINE | 3600 seconds (1 hour) | 7200 seconds (2 hours) | Agent-100 notified at 3 hours |
| URGENT | 900 seconds (15 min) | 1800 seconds (30 min) | Agent-100 notified at 45 min |
| EMERGENCY | 300 seconds (5 min) | 300 seconds (5 min) | Agent-100 notified at 10 min |

---

## Cross-Vault Handoffs

When a task crosses from one vault domain to another (e.g., Agent-99 assigns a curriculum update task that moves from VAULT-NET-SEEDS to VAULT-CHAOS), it requires BOTH:

1. **Agent handoff** (this document's protocol)
2. **Vault handshake** (per `02-VAULT-HANDSHAKE-PROTOCOL.md`)

Both must complete for the cross-vault task to be treated as delivered. The agent handoff and the vault handshake share the same `task_id` for correlation in the ledger.
