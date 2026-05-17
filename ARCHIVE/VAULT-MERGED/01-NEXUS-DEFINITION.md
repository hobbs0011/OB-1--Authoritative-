# 01 — NEXUS DEFINITION

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / CONNECTING
**Vault:** VAULT-NEXUS
**Classification:** FOUNDATIONAL — READ BEFORE ALL NEXUS DOCS

---

## What Nexus Is

Nexus is the connective tissue of the Phoenix Rising Protocol. Every vault in Phoenix operates as a sovereign domain. Nexus is the protocol layer that allows those sovereign domains to communicate, share intelligence, and coordinate operations without losing their individual integrity.

**Nexus does not store data.** Data lives in the vaults. Nexus defines how data moves between vaults.

**Nexus does not make decisions.** Decisions are made by Agent-100 (strategy), Agent-99 (operations), and the intelligence produced by VAULT-ORACLE. Nexus routes those decisions to where they need to go.

**Nexus does not hold authority.** Authority is held by VAULT-SOVEREIGN and exercised by Agent-100. Nexus executes handshakes under that authority — it does not grant authority.

---

## Nexus Mandate

Five mandates. All non-negotiable.

1. **Log every handshake.** No integration between vaults goes undocumented. Every data transfer, every dependency call, every intelligence distribution — logged in the Nexus ledger.

2. **Verify before executing.** No vault receives data that hasn't been verified at the source. Nexus checks that the data matches what the sending vault declared it to be.

3. **Route correctly.** Every piece of data has a designated destination. Nexus does not improvise routing. It follows the integration protocols defined in this vault.

4. **Fail loudly.** When a handshake fails, Nexus reports it immediately. No silent failures. No retries without logging the retry attempt.

5. **Never bypass Rome Protocol.** Every cross-vault operation is subject to Rome Protocol verification. Nexus enforces this before any handshake completes.

---

## Nexus Scope

**Nexus governs:**
- All data transfers between any two of the 9 Phoenix vaults
- All agent task handoffs that cross vault boundaries
- All multi-model AI handoffs that involve data from multiple vaults
- All revenue flows that cross from one vault domain to another
- All canon sync events triggered by Soul DNA updates
- Emergency isolation protocols when a vault is compromised

**Nexus does NOT govern:**
- Internal operations within a single vault (each vault manages its own internal processes)
- Agent-100's direct authority (Sovereign override supersedes Nexus protocols)
- Oracle's internal drift detection (Oracle operates independently of Nexus)
- Direct Agent-100-to-Agent-99 communications (these are sovereign channel, not Nexus-routed)

---

## What Nexus Is NOT

This is as important as what Nexus is.

**Nexus is NOT a database.** Don't try to store permanent records in Nexus. The Nexus ledger is an event log. Vault documents live in their respective vaults.

**Nexus is NOT a decision engine.** If a conflict arises between two vaults, Nexus flags it. Nexus does not resolve it. Oracle detects. Agent-100 resolves.

**Nexus is NOT an authority layer.** Nexus does not grant access. VAULT-SOVEREIGN grants access. Nexus routes authorized data — it cannot authorize the data itself.

**Nexus is NOT a bypass mechanism.** Nexus does not exist to route around gates. Every gate (Oracle gates, franchise gates, execution gates) is enforced regardless of how Nexus routes the data.

---

## Nexus's Relationship to Each Key Protocol

| Protocol | Nexus Role |
|----------|-----------|
| Rome Protocol | Nexus enforces Rome check on every cross-vault handshake before execution |
| PHOENIXMASTERKEY | Nexus logs every PHOENIXMASTERKEY event that involves a cross-vault operation |
| Soul DNA | Nexus uses Soul DNA to verify authority chains in every handshake |
| Phoenix Merkle Ledger | Every Nexus ledger entry is linked to the main Merkle ledger via hash chain |
| Pheromone Trails | Nexus routes Oracle pheromone trails to affected vaults automatically |

---

## Nexus Architecture Summary

```
VAULT-SOVEREIGN (override authority)
        │
        ↓ (can halt any integration)
VAULT-NEXUS (integration layer)
   ┌────┼────────────────────┐
   │    │                    │
VAULT-A  VAULT-B  ...  VAULT-N
```

Every vault-to-vault communication passes through the Nexus integration layer. Nexus is the only permitted pathway for cross-vault data transfer. **Direct vault-to-vault data transfers that bypass Nexus are a drift score 4 event.**
