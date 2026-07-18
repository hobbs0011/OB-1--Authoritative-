---
description: SupplyLines
agent: AGENT99
---

# /SupplyLines

**Supply chain mode.** The roads between forts. Aqueducts. Grain shipments. Connects I→VI. Verifies each stage before the next advances.

**Task:** $ARGUMENTS

---

## How to Run

```
/SupplyLines [status|full-march|scout|fingerprint|process|verify|garrison] [--zone CANON/]
```

| Command | Purpose |
|---------|---------|
| `status` | Full pipeline health snapshot — all 6 stages, SOULCOUNT, HEAD |
| `full-march` | Execute all 6 stages in sequence with pre/post validation |
| `scout` | Stage I only — fire Phoenix Scout against target zone |
| `fingerprint` | Stage II only — DNA crunch + LEDGER verification |
| `process` | Stage III only — SOULKEYS + PHEROMONE extraction |
| `verify` | Stage IV only — 6-AI TRUTH + SHADOW REALM |
| `garrison` | Stage V only — MERKLE + APEX rollup |

---

## Health Gate (Phase 1)

Before any stage runs:

```powershell
$repo = "D:\OB-1-CANONICAL"
$paths = @(
    "$repo\CANON\HEAVY-LEDGER"
    "$repo\CANON\PHEROMONES"
    "$repo\CANON\STARMAP"
    "$repo\CANON\SOUL-KEYWORDS"
    "$repo\CANON\PIPELINE"
)

foreach ($p in $paths) {
    if (-not (Test-Path $p)) { HALT. Supply chain broken. Missing: $p }
}
```

---

## 6 Stages

### I — EXPLORATORES (Scouts)
- Run `pwsh -File SCRIPTS/phoenix-scout.ps1 -Zone <target>`
- Must return report path before ANTECORES advance
- Write `CANON/PHEROMONES/PheTrail-run{N}-supply-scout.json`

### II — ANTECORES (Vanguard)
- Enumerate `CANON/HEAVY-LEDGER/*.json` — verify count and naming
- Verify `CANON/STARMAP/starmap-run{N}.json` exists
- Verify `CANON/SOUL-KEYWORDS/rfkw-run{N}.txt` + `inverted-index.json` present
- Write `CANON/PHEROMONES/PheTrail-run{N}-supply-fingerprint.json`

### III — AGMEN (Main Body)
- Enumerate `CANON/PHEROMONES/PheTrail-run{N}.json` — verify schema_version
- Verify `negative_trails` arrays populated
- Write `CANON/PHEROMONES/PheTrail-run{N}-supply-process.json`

### IV — AGMEN NOVISSIMUM (Rear Guard)
- Cross-check ledger entries against starmap pointers
- Verify no duplicate HL-IDs
- Verify phetrail negative_trails append-only
- If divergence > 10%: HALT. Truth not established.
- Write `CANON/PHEROMONES/PheTrail-run{N}-supply-verify.json`

### V — PRAESIDIA (Garrison)
- Verify HL merkle_root fields across `CANON/HEAVY-LEDGER/*.json`
- Verify `CANON/PIPELINE/pipeline-run{N}.json` exists and is valid JSON
- Verify `CANON/ART-REGISTRY/art-sync-run{N}.json` present
- Merkle root must verify. Pipeline must return COMPLETE.
- Write `CANON/PHEROMONES/PheTrail-run{N}-supply-garrison.json`

### VI — LIMITANEI (Frontier Shield)
- `pwsh -File SCRIPTS/obi.ps1 doctor` → health sweep
- `pwsh -File SCRIPTS/obi.ps1 verify` → deploy dry-run
- Scheduled: 5-min cron health pulse
- Write `CANON/PHEROMONES/PheTrail-run{N}-supply-health.json`

---

## SOULCOUNT Checkpoint

```
Before supply:  GET /api/soul/count → count_before_supply
Per stage:      GET /api/soul/count → count_after_stage[N]
After supply:   GET /api/soul/count → count_after_supply
Deltas:        Δstage[N] = count_after_stage[N] - count_before_supply
               Δsupply = count_after_supply - count_before_supply
Log to:        phetrail per stage + consolidated trail
```

---

## Pheromone Trail

Every stage writes a scored trail entry:

| Stage | Trail Key | Score Meaning |
|-------|-----------|---------------|
| I | `scout` | +3 new SOUL, -3 critical breach |
| II | `fingerprint` | +2 verified, -2 missing artifact |
| III | `process` | +1 correct path, -1 schema drift |
| IV | `verify` | +2 chain intact, -2 divergence >10% |
| V | `garrison` | +2 merkle verified, -2 merkle gap |
| VI | `health` | +1 GREEN, -1 RED |

Each entry: `decision_context`, `alternatives_considered`, `chosen_reason`, `artifact`, `verification`, `strength` (-3 to +3)

---

## Output

| Artifact | Path |
|----------|------|
| Status report | stdout |
| Phetrail | `CANON/PHEROMONES/PheTrail-run{N}-supply-{stage}.json` |
| Consolidated trail | `CANON/PHEROMONES/PheTrail-run{N}-supply.json` |

---

## Handoff to /EngineerLegionnaire

```
SUPPLY_COMPLETE:
  run: [N]
  stages: [I, II, III, IV, V, VI]
  all_green: [true/false]
  phetrail: [path]
  next: /EngineerLegionnaire --audit [supply output]
```

**Do not advance to Engineer until all 6 stages are GREEN.**

`SUPPLY LINES: ONLINE. 6 STAGES. FAIL-CLOSED. PHEROMONE-STOCKED.`
