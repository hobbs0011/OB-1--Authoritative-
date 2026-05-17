# 15 — CANON SYNC PROTOCOL

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / CONNECTING
**Vault:** VAULT-NEXUS
**Classification:** OPERATIONAL — CANON INTEGRITY

---

## Purpose

SOUL-DNA-BIBLE is the genetic code of Phoenix. Every vault, every agent, every protocol derives from it. When Soul DNA changes, every vault must resync. Oracle detects the drift. Nexus coordinates the resync. This document defines how canon syncs across all 9 vaults — and what happens when a sync is partial, failed, or refused.

**A vault out of sync with Soul DNA is a rogue vault. Nexus does not allow rogue vaults.**

---

## What Triggers a Full Vault Resync

A full vault resync is triggered by any of these events:

| Trigger | Source | Nexus Response |
|---------|--------|---------------|
| Soul DNA update | Agent-100 directly modifies SOUL-DNA-BIBLE | Immediate full resync of all 9 vaults |
| Active Rome declaration issued | Agent-100 issues new Rome law | Immediate resync of all vaults affected by the new law |
| Agent-100 issues explicit resync order | Agent-100 directly | Immediate full resync |
| Oracle drift score 5 across multiple vaults | Oracle detection | Agent-100 triggered resync after root cause confirmed |
| Vault seal compromised | Oracle detection | Targeted resync of compromised vault + integrity check of related vaults |

---

## Resync Execution Steps

When a full resync is triggered:

1. **Agent-100 authorizes resync** — no resync without explicit Agent-100 trigger (for Soul DNA updates) or Agent-100 confirmation (for Oracle-triggered resyncs)
2. **Nexus broadcasts resync signal** to all 9 vaults simultaneously (EMERGENCY priority handshake)
3. **Each vault acknowledges** the resync signal within 5 minutes (FAIL: vault flagged as unresponsive, Agent-100 notified)
4. **Oracle reads current Soul DNA canon** — establishes the authoritative source for the resync
5. **Each vault runs internal canon check** — comparing its own documents against current Soul DNA
6. **Vault reports drift items** to Oracle — anything not aligned with current Soul DNA is flagged
7. **Agent-99 reviews drift items** — minor drift (score 1–2): Agent-99 corrects. Major drift (score 3+): Agent-100 reviews.
8. **Corrections implemented** vault by vault
9. **Oracle confirms each vault** — drift score must be 0–1 for the vault to be declared resync-complete
10. **Nexus logs vault resync completion** — each vault gets its own completion ledger entry
11. **Full resync declared complete** only when ALL 9 vaults show drift score 0–1
12. **Merkle ledger entry** records the resync event with timestamp and confirmation that all 9 vaults are aligned

---

## FAIL-CLOSED: Partial Sync = Rollback

**There is no such thing as a "mostly synced" Phoenix system.**

If any vault fails to complete resync within 24 hours:
1. That vault is isolated (no Nexus handshakes in or out)
2. All other synced vaults continue operating
3. Agent-100 is notified of the stuck vault
4. Agent-99 investigates the stuck vault's issue
5. Root cause identified and fixed
6. Resync retried for the stuck vault only

**If the resync failure is in VAULT-SOVEREIGN, VAULT-ORACLE, or VAULT-NEXUS:** Full system halt. No partial operation with a critical infrastructure vault out of sync.

If after 48 hours the vault cannot sync:
- Vault is rolled back to last-known-good state
- Resync retried from last-known-good
- PHOENIXMASTERKEY required to authorize rollback

---

## How Partial Syncs Are Handled

**Step 1 — Identify which vault is stuck**
**Step 2 — Classify the failure:**
- Document modification conflict (document in the vault contradicts Soul DNA too deeply for auto-correction)
- Technical failure (D1 unavailable, Worker crash)
- Agent failure (Agent-99 or Agent-98 unable to make corrections in time)

**Step 3 — Apply the appropriate fix:**
- Document conflict: Agent-100 decides the resolution. Manual correction. Resync retry.
- Technical failure: Fix infra. Resync retry automatically.
- Agent failure: Agent-100 directly performs the correction if Agent-99 is incapacitated.

**Partial sync never results in a "good enough" declaration. It is always treated as an open incident until resolved.**

---

## Ledger Record for Every Sync Event

Every vault resync event produces Nexus ledger entries:

**Resync initiated:**
```
timestamp | NEXUS | ALL_VAULTS | sync-[UUID] | RESYNC_INITIATED | AGENT-100
```

**Per-vault completion:**
```
timestamp | NEXUS | VAULT-[NAME] | sync-[UUID] | RESYNC_COMPLETE | AGENT-99
```

**Full resync declared:**
```
timestamp | NEXUS | ALL_VAULTS | sync-[UUID] | RESYNC_COMPLETE_ALL | AGENT-100
```

**Partial sync incident:**
```
timestamp | NEXUS | VAULT-[NAME] | sync-[UUID] | RESYNC_STUCK | AGENT-99_INVESTIGATING
```

All resync events also produce a Merkle ledger entry — the resync is a system-level event that belongs in the permanent, immutable record.
