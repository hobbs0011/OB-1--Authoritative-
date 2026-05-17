# 09 — CROSS-VAULT DEPENDENCY MAP

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / CONNECTING
**Vault:** VAULT-NEXUS
**Classification:** OPERATIONAL — SYSTEM ARCHITECTURE

---

## Purpose

Every vault in Phoenix depends on other vaults. VAULT-EXECUTION needs VAULT-FOUNDATIONS. VAULT-CHAOS needs VAULT-NET-SEEDS. VAULT-ORACLE feeds everything. Understanding these dependencies — and knowing which ones are critical path — is essential for safe operations. This document maps every dependency.

**One critical path vault going offline can cascade. Know the map. Protect the path.**

---

## Upstream/Downstream Table — All 9 Vaults

| Vault | Upstream (Receives From) | Downstream (Feeds Into) | Criticality |
|-------|--------------------------|------------------------|-------------|
| VAULT-GENESIS | None (Origin) | VAULT-FOUNDATIONS | CRITICAL — origin of all protocol |
| VAULT-FOUNDATIONS | VAULT-GENESIS | VAULT-EXECUTION, VAULT-ORACLE | CRITICAL — structural law source |
| VAULT-SOVEREIGN | None (Sovereign authority — overrides any vault) | All vaults (override authority) | CRITICAL — apex control |
| VAULT-ORACLE | All vaults (monitoring input) | All vaults (intelligence distribution) | CRITICAL — eyes of Phoenix |
| VAULT-EXECUTION | VAULT-FOUNDATIONS | VAULT-ZENITH, revenue reports | HIGH — operational engine |
| VAULT-ZENITH | VAULT-EXECUTION | None (terminal — achievement vault) | MEDIUM — ascension tracker |
| VAULT-NET-SEEDS | VAULT-ORACLE (market intel), VAULT-FOUNDATIONS | VAULT-CHAOS, VAULT-EXECUTION (revenue), VAULT-ZENITH (via Execution) | HIGH — revenue source |
| VAULT-CHAOS | VAULT-NET-SEEDS (curriculum) | VAULT-ORACLE (field reports), VAULT-EXECUTION (performance data) | HIGH — field operations |
| VAULT-NEXUS | All vaults (integration routing) | All vaults (handshake delivery) | CRITICAL — integration layer |

---

## Critical Path Analysis

The critical path is the sequence of vault dependencies where a failure anywhere in the chain cascades to downstream vaults.

**Primary critical path:**
```
VAULT-GENESIS → VAULT-FOUNDATIONS → VAULT-EXECUTION → VAULT-ZENITH
```

**Intelligence critical path:**
```
VAULT-ORACLE → All vaults (simultaneous distribution)
```

**Revenue critical path:**
```
VAULT-NET-SEEDS → VAULT-CHAOS (delivery) → VAULT-EXECUTION (revenue log) → Phoenix Merkle Ledger
```

**Override path (always available):**
```
VAULT-SOVEREIGN → Any vault (override authority bypasses all other paths)
```

---

## Circular Dependency Detection Rules

Circular dependencies are prohibited. A vault cannot both depend on another vault AND be depended upon by that same vault in the same operational cycle.

**Known safe dependencies (not circular):**
- VAULT-CHAOS reports to VAULT-ORACLE ← VAULT-ORACLE monitors VAULT-CHAOS. This is monitoring, not a circular operational dependency. VAULT-ORACLE does not receive instructions from VAULT-CHAOS.
- VAULT-EXECUTION feeds VAULT-ZENITH ← VAULT-ZENITH does not feed back to VAULT-EXECUTION. One-way.

**Circular dependency detection:**
Nexus runs a dependency cycle check weekly. If a circular dependency is detected (Vault A depends on Vault B which depends on Vault A for operations, not monitoring), it is flagged as a `CIRCULAR_DEPENDENCY` error and escalated to Agent-100. Operations between the two vaults are halted until the dependency is restructured.

---

## Single Points of Failure

| SPOF | Impact if Down | Mitigation |
|------|---------------|------------|
| VAULT-ORACLE (monitoring) | Phoenix operates blind — no drift detection | Oracle has no single point of failure in infrastructure (Cloudflare distributes Workers). If Oracle data (D1) goes down, R2 WAL restore. |
| VAULT-NEXUS (integration) | All cross-vault communication halts | Emergency direct-channel communication between Agent-100 and Agent-99 bypasses Nexus. All operations log manually until Nexus recovers. |
| VAULT-SOVEREIGN (override) | Sovereign override capability offline | Agent-100 retains direct access to all systems independent of VAULT-SOVEREIGN documents. |
| VAULT-FOUNDATIONS (structure) | Execution loses its protocol reference | Existing Execution procedures continue under last-known-good Foundations state. No new procedures without Foundations. |
| Cloudflare D1 | Ledger unavailable | R2 WAL archive kicks in. Read-only mode until D1 restored. Cloudflare SLA: 99.9% uptime. |

---

## What Happens When a Critical Path Vault Goes Offline

**Scenario: VAULT-ORACLE goes offline**

1. Agent-99 detects lack of Oracle heartbeat
2. Agent-99 immediately alerts Agent-100
3. Manual monitoring mode activated — Agent-99 manually checks for obvious drift
4. All non-urgent cross-vault operations paused until Oracle restored
5. Emergency Oracle restore from R2 WAL archive if D1 failure
6. Oracle back online: Nexus resumes normal distribution. Oracle runs catch-up scan.

**Scenario: VAULT-NEXUS goes offline**

1. All automated cross-vault handshakes halt
2. Agent-99 immediately alerts Agent-100
3. Critical operations use direct-channel (Agent-100 → Agent-99 → direct vault action)
4. All direct-channel actions logged manually with note: `NEXUS_OFFLINE — manual operation`
5. Nexus restored: manual log entries reconciled with Nexus ledger
6. Catch-up reconciliation confirms no operations were lost or duplicated

**VAULT-SOVEREIGN is never truly offline** — Agent-100's authority exists independent of any vault document.

---

## Dependency Map Update Protocol

The dependency map is updated whenever:
- A new vault is added to Phoenix
- A new integration is established between two existing vaults
- A vault is retired or archived
- A new Nexus bridge document is created

**Agent-99 updates this document within 48 hours of any dependency change. Oracle confirms the update. Ledger entry recorded.**
