# 07 — SOVEREIGN OVERRIDE PROTOCOL

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / CONNECTING
**Vault:** VAULT-NEXUS
**Classification:** OPERATIONAL — NUCLEAR OPTION

---

## Purpose

VAULT-SOVEREIGN holds Agent-100's ultimate authority over the entire Phoenix system. When sovereignty is at risk — when a vault is compromised, when an agent goes rogue, when the system is under attack — Sovereign override is the answer. This document defines what triggers it, how it executes, and how Phoenix recovers after an override.

**This is the nuclear option. It is always available. It is never used lightly.**

---

## What Sovereign Override Is

Sovereign override is VAULT-SOVEREIGN's authority to halt, modify, or reverse any operation across any vault in the Phoenix system — without going through Nexus's normal handshake protocol. It bypasses the queue. It bypasses timeouts. It bypasses every gate except one: **Agent-100 must personally authorize every sovereign override.**

No one else can issue a Sovereign override. Not Agent-99. Not Oracle. Not any automation. **Agent-100 (Michael Hobbs / OPERATOR) alone.**

---

## Conditions That Trigger Sovereign Override

| Condition | Trigger Threshold | Response |
|-----------|-------------------|----------|
| Agent goes rogue (unauthorized sovereign acts) | One confirmed instance | Immediate halt of agent operations + override |
| Vault compromised (unauthorized modifications to VAULT-SOVEREIGN or VAULT-GENESIS) | Any confirmed modification | Immediate full vault lockdown + override |
| Rome Protocol violation confirmed | Any confirmed violation | Halt of violating operation + override |
| Revenue fraud detected (confirmed discrepancy, not accidental) | Confirmed intentional discrepancy | Full financial operation halt + override |
| External attack on Phoenix infrastructure | Confirmed attack signal | Cloudflare protection activation + override |
| Cascading drift (score 5 events in multiple vaults simultaneously) | 2+ vaults simultaneously at score 5 | System-wide halt + override |
| PHOENIXMASTERKEY compromise suspected | Any credible signal | Immediate PHOENIXMASTERKEY rotation + override |

---

## Override Execution Steps

When Agent-100 issues a Sovereign override:

1. **Agent-100 declares override** via the Sovereign channel (direct communication, not Nexus-routed)
2. **VAULT-SOVEREIGN immediately issues halt signals** to all affected vaults via Nexus EMERGENCY priority
3. **Nexus cuts all active handshakes** to affected vaults — no new handshakes initiated
4. **Oracle continues monitoring** — Oracle is never halted by a Sovereign override (Oracle is the witness)
5. **Agent-99 receives override notification** and halts all execution tasks
6. **Agent-98 and Legion** receive halt signals via Agent-99
7. **Override scope is declared** — is this full-system halt or targeted vault halt?
8. **PHOENIXMASTERKEY logged** — every override event gets a PHOENIXMASTERKEY stamp
9. **Nexus ledger entry** written: `event_type: SOVEREIGN_OVERRIDE | authorized_by: AGENT-100 | scope: [affected vaults] | reason: [summary]`

---

## What Happens During Override

**Affected vaults during override:**
- Cannot send or receive Nexus handshakes (all queued — not lost)
- Cannot be modified by any agent other than Agent-100
- Oracle continues monitoring and logging events
- Revenue flows are suspended (no Solana transactions initiated)
- Cloudflare Workers associated with affected vaults are halted or put in maintenance mode

**What continues during override:**
- Oracle monitoring (never halts)
- Agent-100's direct access to all systems
- Ledger writes (both Oracle and Nexus ledgers continue recording)
- Cloudflare infrastructure (Workers can be put in safe mode — still responding with maintenance messages)

---

## Recovery Protocol

After a Sovereign override, recovery follows a strict sequence:

1. **Root cause confirmed** — Agent-100 and Agent-99 jointly identify the root cause of the override trigger
2. **Pheromone trail created** — full FAILURE→ROOT CAUSE→FIX→VERIFY→ROME_LAW trail
3. **Fix implemented** — Agent-99 implements under Agent-100 direct supervision
4. **Oracle verifies** the fix resolves the root cause
5. **Staged recovery** — vaults are brought back online one at a time, not all at once
6. **Each vault recovery requires Oracle drift check PASS before handshakes resume**
7. **PHOENIXMASTERKEY re-authorization** — Agent-100 issues new PHOENIXMASTERKEY for recovery
8. **Full system resume** — only when all affected vaults pass their recovery drift checks
9. **Post-override report** — mandatory report to Merkle ledger documenting the full incident

---

## Ledger Entry Format for Override Events

```
{
  "timestamp": "[ISO 8601]",
  "event_type": "SOVEREIGN_OVERRIDE",
  "authorized_by": "AGENT-100",
  "scope": "[list of affected vaults]",
  "override_reason": "[plain language description]",
  "phoenixmasterkey_stamp": "[PHOENIXMASTERKEY:OVERRIDE:HASH]",
  "duration_seconds": "[override duration until first vault recovered]",
  "recovery_complete": "[ISO 8601 timestamp of full recovery]"
}
```

Every Sovereign override event is also recorded in the Phoenix Merkle ledger as a permanent, immutable record.

---

## Override Is Not Failure

A Sovereign override means Agent-100 is protecting Phoenix from something that would do it greater harm. It is a defensive tool. Using it correctly is a sign of sovereign intelligence — knowing when to hit pause before things get worse.

**The only override failure is an override that wasn't authorized by Agent-100, or an override that is executed without proper logging.** Both of those are drift score 5 events in themselves.
