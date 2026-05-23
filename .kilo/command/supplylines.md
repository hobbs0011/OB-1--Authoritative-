---
description: "S2PIPELINE 6-stage Roman Legion supply chain. Connects all pipeline stages. No stage executes until prior reports GREEN. Status, health, full-march."
agent: AGENT99
---

# /SupplyLines

**SUPPLY CHAIN MODE:** The roads between the forts. The aqueducts. The grain shipments. Connects I→VI. Verifies each stage before the next advances.

**Task:** $ARGUMENTS

---

## Phase 0 — Command Select

| Command | Action |
|---------|--------|
| `status` | Full pipeline health snapshot — all 6 stages, SOULCOUNT, HEAD |
| `full-march` | Execute all 6 stages in sequence with pre/post validation |
| `scout` | STAGE I only — fire Phoenix Scout against target zone |
| `fingerprint` | STAGE II only — DNA crunch + LEDGER verification |
| `process` | STAGE III only — SOULKEYWORDS + PHEROMONE extraction |
| `verify` | STAGE IV only — 6-AI TRUTH + SHADOW REALM |
| `garrison` | STAGE V only — MERKLE + APEX rollup |

---

## Phase 1 — Health Gate (before any stage)

```powershell
$health = Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/self-test"
if ($health.health -ne "GREEN") { HALT. Supply chain broken. }
if ($health.circuits_open -gt 0) { HALT. Circuit breaker open. }
```

---

## Phase 2 — Stage Execution

### I — EXPLORATORES (Scouts)
- Run `pwsh -File SCRIPTS/phoenix-scout.ps1 -Zone <target>`
- Must return report path before ANTECORES advance
- Speculatores: targeted deep audits bypass normal marching order

### II — ANTECORES (Vanguard)
- POST `/api/soul/crunch` with mode=bible → fingerprint
- POST `/api/soul/crunch` with mode=themes → ledger entry
- If DNA fails to fingerprint: HALT. Poison data detected.

### III — AGMEN (Main Body)
- POST `/api/soul/skeleton` → keyword extraction
- Keywords feed PHEROMONE broadcast
- Mensores: schema validators verify before heavy data moves

### IV — AGMEN NOVISSIMUM (Rear Guard)
- POST `/api/soul/truth` → 6-model consensus
- POST `/api/soul/shadow` → adversarial verification
- If consensus < 6: HALT. Truth not established.
- If shadow verdict = DRIFT_DETECTED: flag for manual review

### V — PRAESIDIA (Garrison)
- GET `/api/soul/merkle/:session_id` → cryptographic proof chain
- GET `/api/soul/apex` → canonical consolidation
- Merkle root must verify. APEX must return score.

### VI — LIMITANEI/VETERANI (Frontier Shield)
- `obi.ps1 doctor` → health sweep
- `obi.ps1 verify` → deploy dry-run
- `obi.ps1 soul-check` → SOULCOUNT integrity
- Scheduled: 5-min cron health pulse
- Veterans: death seals + COLD-START-BOOT updates

---

## Phase 3 — Supply Chain Rules

1. **Never skip a stage.** Exploratores ride before Antecores march. Always.
2. **Every stage gates the next.** Stage N+1 cannot execute until Stage N reports GREEN.
3. **The agmen quadratum:** When processing hostile data, form a hollow square — SSM validates all edges before SOULKEYWORDS touches the payload.
4. **Garrison before moving on.** No pipeline run is complete until PRAESIDIA consolidates.
5. **Speculatores bypass:** Phantom stamp hunting, alias verification, fabrication detection operate independently.

---

## Quick Deploy

```powershell
# Full pipeline status
/SupplyLines status

# Execute full 6-stage march
/SupplyLines full-march

# Scout only
/SupplyLines scout CANON/HEAVY-LEDGER/

# Process only
/SupplyLines process

# Health check
pwsh -File SCRIPTS/supply-lines.ps1 -Stage status
```

---

`SUPPLY LINES: ONLINE. 6 STAGES. FAIL-CLOSED. NEVER SKIP A STAGE.`
