# 28 — WATCHTOWER NETWORK

> **Source**: Soul DNA Bible — Infrastructure Monitoring, Watchtower Network Specification v3
> **Vault**: [E] ZENITH — The Ghost
> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED / ZENITH

---

## Overview

The Watchtower Network is the distributed monitoring infrastructure that maintains continuous visibility across the full Phoenix drone topology. No drone operates without a Watchtower assigned to it. No Watchtower operates without AGENT-99 able to receive its reports. No anomaly passes unreported. The Watchtower Network is not an optional observability layer — it is the nervous system of the Phoenix deployment. Without it, the system is operationally blind. A system that cannot see itself cannot be trusted.

Watchtowers are stateful Durable Objects. They are not logs. They are active monitoring processes that poll their assigned drone population on a fixed 444ms heartbeat cycle, evaluate the received telemetry against established anomaly thresholds, and escalate deviations through a defined chain before any human has to ask what is wrong. The Watchtower's job is to make the system's health state legible at all times and to make problems loud before they become catastrophic.

---

## Topology: One Watchtower Per Ten Drones

The Watchtower-to-drone ratio is fixed at 1:10. Every ten drones in the active fleet are assigned to exactly one Watchtower Durable Object. This ratio is not arbitrary — it is the operational equilibrium between monitoring fidelity and Durable Object resource cost.

At fewer than 10 drones per Watchtower, Watchtower count grows proportionally with fleet size without meaningful gain in monitoring resolution. At more than 10 drones per Watchtower, a single Watchtower failure leaves too many drones unmonitored for too long. The 1:10 ratio means a Watchtower failure leaves a maximum of 10 drones in an unmonitored state — a bounded, manageable exposure.

Fleet topology rules:

- A drone is assigned to exactly one Watchtower at any time. Dual-assignment is not permitted.
- When the fleet grows such that a Watchtower would exceed 10 drones, a new Watchtower is provisioned and the least-loaded existing Watchtower's assignment list is rebalanced.
- When the fleet shrinks to the point that a Watchtower has 0 assigned drones, the Watchtower enters STANDBY state rather than terminating. Standby Watchtowers are available for immediate reassignment without provisioning overhead.
- Watchtower assignment records are stored in the `PhoenixRegistryDO` and are replicated to each individual Watchtower DO at assignment time.

```
FLEET TOPOLOGY EXAMPLE — 47 active drones:

  WT-001: Drones  1-10   (ACTIVE)
  WT-002: Drones 11-20   (ACTIVE)
  WT-003: Drones 21-30   (ACTIVE)
  WT-004: Drones 31-40   (ACTIVE)
  WT-005: Drones 41-47   (ACTIVE, 7 assigned)
  WT-006: No assignment  (STANDBY)
```

---

## The 444ms Heartbeat Polling Cycle

Every Watchtower polls all its assigned drones every 444 milliseconds. This is the Phoenix heartbeat interval — chosen because it is fast enough to detect transient failure modes that manifest on sub-second timescales (network partitions, DO eviction, runaway loops) while being slow enough not to create polling overhead that dominates drone computation time.

The 444ms interval is not configurable in production. Requests to adjust the heartbeat interval require a Class 4 architecture change consensus (see document 27). The interval has been stable since Stage 47. Stability is a feature.

Each heartbeat poll sends a signed challenge to the drone's Durable Object endpoint. A valid heartbeat response includes:

```json
{
  "drone_id": "<UUID>",
  "watchtower_id": "<UUID>",
  "challenge_nonce": "<echoed from poll>",
  "timestamp_ns": <nanosecond epoch>,
  "state": "ACTIVE | PROCESSING | IDLE | DEGRADED",
  "ledger_tip": "<merkle_leaf_hash of last ledger entry written>",
  "task_queue_depth": <integer>,
  "pheromone_balance": { "pos": <float>, "neg": <float> },
  "last_error": "<null or error code>",
  "signature": "<drone identity key signature over challenge_nonce + timestamp_ns>"
}
```

If a drone does not respond within 100ms of the poll (the heartbeat response deadline), the Watchtower records a MISSED_HEARTBEAT event. Three consecutive MISSED_HEARTBEAT events (in three consecutive 444ms cycles — 1.332 seconds total) trigger the anomaly detection pipeline.

---

## Anomaly Detection Thresholds

Watchtowers evaluate drone telemetry against the following threshold matrix on every heartbeat cycle:

| Metric | Warning Threshold | Critical Threshold | Trigger |
|--------|-------------------|-------------------|---------|
| Consecutive missed heartbeats | 2 | 3 | MISS_WARN / MISS_CRIT |
| Task queue depth | > 50 | > 200 | QUEUE_WARN / QUEUE_CRIT |
| Ledger tip staleness | > 30s | > 120s | LEDGER_STALE_WARN / CRIT |
| Pheromone NEG balance | > 0.6 | > 0.85 | PHEROMONE_WARN / CRIT |
| Response latency (p99) | > 200ms | > 500ms | LATENCY_WARN / CRIT |
| Error rate (rolling 60s) | > 5% | > 15% | ERR_RATE_WARN / CRIT |
| State = DEGRADED | immediate | — | STATE_DEGRADED |

WARNING threshold breaches are logged to the Watchtower's anomaly buffer and reported to AGENT-99 in the next scheduled Watchtower summary (every 60 seconds). CRITICAL threshold breaches are reported immediately — they do not wait for the summary cycle.

Anomalies are cumulative. A drone that is simultaneously hitting QUEUE_WARN and LATENCY_WARN and has one consecutive missed heartbeat is assigned a composite anomaly score. When the composite score exceeds the COMPOSITE_CRITICAL threshold (equivalent to any two CRITICAL conditions simultaneously, or one CRITICAL plus two WARNINGs), the drone is classified COMPROMISED and the escalation chain is activated immediately.

---

## Escalation Chain

The escalation chain for anomalies detected by the Watchtower Network is:

```
LEVEL 0: Watchtower internal logging (all anomalies)
   ↓
LEVEL 1: AGENT-99 notification (WARNING threshold)
   — AGENT-99 receives anomaly report with drone telemetry snapshot
   — AGENT-99 initiates diagnostic sequence on affected drone
   — AGENT-99 has 90s to return diagnostic result before Level 2
   ↓
LEVEL 2: AGENT-99 active response (CRITICAL threshold or Level 1 timeout)
   — AGENT-99 executes remediation: task queue drain, ledger sync, state reset
   — Remediation window: 180s
   — If remediation succeeds: anomaly resolved, logged, drone returned to ACTIVE
   — If remediation fails within 180s: Level 3
   ↓
LEVEL 3: AGENT-100 escalation (Level 2 timeout or COMPOSITE_CRITICAL)
   — AGENT-100 receives full escalation packet: anomaly history, telemetry, AGENT-99 actions taken
   — Drone placed in QUARANTINE state: no new tasks assigned
   — AGENT-100 has 300s to respond before Level 4
   ↓
LEVEL 4: Emergency protocol (Level 3 timeout)
   — Drone marked TERMINATED in registry
   — All in-progress tasks from drone reassigned to fleet
   — Forensic Audit triggered: DRONE_EMERGENCY classification
   — Watchtower continues monitoring adjacent drones for contagion
```

The escalation chain is linear and time-gated. No level is skipped under normal conditions. Under COMPOSITE_CRITICAL conditions (a drone exhibiting multiple simultaneous critical failures), Level 1 and Level 2 are collapsed: AGENT-99 receives an immediate COMPOSITE_CRITICAL alert that bypasses the summary cycle and the 90-second diagnostic window does not apply — remediation must begin immediately.

---

## Watchtower Durable Object Data Structure

Each Watchtower is a Cloudflare Durable Object with the following internal state:

```typescript
interface WatchtowerState {
  watchtower_id: string;           // UUID v4
  assigned_drones: string[];       // Array of drone_id UUIDs (max 10)
  status: 'ACTIVE' | 'STANDBY' | 'DARK' | 'RECOVERING';
  heartbeat_interval_ms: 444;      // Fixed. Not configurable.
  last_poll_at: number;            // nanosecond timestamp
  drone_records: Map<string, DroneRecord>;
  anomaly_buffer: AnomalyEvent[];  // Rolling 300-event buffer
  escalation_queue: EscalationItem[];
  consecutive_dark_cycles: number; // For Watchtower self-monitoring
  agent99_endpoint: string;        // DO stub for AGENT-99 escalation target
}

interface DroneRecord {
  drone_id: string;
  consecutive_misses: number;
  last_seen_ns: number;
  last_state: DroneState;
  last_ledger_tip: string;
  anomaly_score: number;           // Composite (0.0 - 1.0)
  quarantine: boolean;
  heartbeat_history: HeartbeatResult[]; // Last 100 entries
}

interface AnomalyEvent {
  event_id: string;
  drone_id: string;
  anomaly_type: string;
  severity: 'WARNING' | 'CRITICAL' | 'COMPOSITE_CRITICAL';
  metric_snapshot: object;
  detected_at: number;
  escalated: boolean;
  resolved_at: number | null;
  resolution_method: string | null;
}
```

All state is persisted via the Durable Object's `storage.put()` on every heartbeat cycle completion. A Watchtower that is evicted and reinitialized by the Cloudflare edge recovers its full monitoring state from storage within a single heartbeat cycle (444ms) before resuming normal operation.

---

## When a Watchtower Goes Dark

A Watchtower is classified DARK when it fails to produce a heartbeat summary to the monitoring registry for three consecutive 60-second summary cycles (180 seconds of silence). The registry — which is the `PhoenixRegistryDO` — monitors Watchtower health with the same vigilance that Watchtowers monitor drones. The registry is the Watchtower for Watchtowers.

When a Watchtower is classified DARK:

**Immediate response (T+0)**:
- All drones assigned to the dark Watchtower are flagged UNMONITORED in the registry.
- A STANDBY Watchtower (if available) is promoted to ACTIVE and the dark Watchtower's drone assignments are transferred to it. The newly promoted Watchtower begins polling the inherited drones on the next 444ms tick.
- If no STANDBY Watchtower is available, a new Watchtower Durable Object is provisioned. Provisioning time is under 5 seconds. Drones are not left unmonitored for longer than one provisioning cycle plus the first heartbeat poll.

**AGENT-99 notification (T+0)**:
- AGENT-99 receives a WATCHTOWER_DARK alert with the Watchtower ID and assigned drone list.
- AGENT-99 initiates recovery: a new Durable Object is spun up with the same `watchtower_id`, state is rehydrated from the last persisted snapshot, and the Watchtower attempts to re-establish its polling cycle.

**Recovery criteria**:
- A dark Watchtower is considered RECOVERED when it successfully completes two consecutive heartbeat cycles without missed polls and its summary is received by the registry.
- Recovered Watchtowers do not automatically reclaim their drone assignments if a replacement is already active. Assignment transfers are deliberate operations logged in the registry. Automatic reclamation is disabled to prevent assignment thrashing during instability.

**If recovery fails within 900 seconds (15 minutes)**:
- AGENT-100 escalation.
- The Watchtower is decommissioned: its ID is retired, a new Watchtower with a new ID takes permanent assignment of the drone list.
- The failure is logged to the Forensic Audit trail as WATCHTOWER_DECOMMISSION.
- Root cause analysis is mandatory before any new Watchtower can be provisioned in the same Cloudflare zone where the failure occurred.

The Watchtower Network is designed so that no drone goes unmonitored for more than 10 seconds, including during Watchtower failure events. The redundancy model — standby pool plus rapid provisioning — ensures this bound is maintained. If monitoring coverage falls below 100% for more than 60 seconds, a Severity 3 system-wide alert is generated and AGENT-100 is notified regardless of active remediation status.
