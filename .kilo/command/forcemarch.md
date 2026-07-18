---
description: Forcemarch
agent: AGENT99
---

# /forcemarch

**Execute a force march across all canonical zones. No skipping stages. Exhaustion tolerated. Every stage writes a phetrail. Every stage checks SOULCOUNT.**

**Task:** $ARGUMENTS

---

## How to Run

```
/forcemarch [--zone CANON/HEAVY-LEDGER] [--dry-run]
```

| Flag | Purpose |
|------|---------|
| `--zone` | Specific zone to march |
| `--dry-run` | Report actions only, no writes |
| `--supersaiyan` | Parallel scout sweep |

---

## 6 Stages

### I — Scout
- Scan zone for SOUL, LEDGER, DRIFT, CONFIG, GAP, FLAG
- Write `OPERATIONS/phoenix-scout-<timestamp>.jsonl`
- Write `CANON/PHEROMONES/PheTrail-run{N}-march-scout.json`
- **Gate:** Scout report exists before proceeding

### II — Fingerprint
- Enumerate `CANON/HEAVY-LEDGER/*.json` — verify count and naming
- Verify `CANON/STARMAP/starmap-run{N}.json` exists
- Verify `CANON/SOUL-KEYWORDS/rfkw-run{N}.txt` + `inverted-index.json` present
- **Gate:** All fingerprint artifacts verified

### III — Process
- Enumerate `CANON/PHEROMONES/PheTrail-run{N}.json` — verify schema_version
- Verify `negative_trails` arrays populated
- **Gate:** Schema valid, negative trails present

### IV — Verify
- Cross-check ledger entries against starmap pointers
- Verify no duplicate HL-IDs
- Verify phetrail negative_trails append-only
- **Gate:** Divergence < 10%

### V — Garrison
- Verify HL merkle_root fields across `CANON/HEAVY-LEDGER/*.json`
- Verify `CANON/PIPELINE/pipeline-run{N}.json` exists and is valid JSON
- Verify `CANON/ART-REGISTRY/art-sync-run{N}.json` present
- **Gate:** Merkle root verifies, pipeline returns COMPLETE

### VI — Limitanei
- `pwsh -File SCRIPTS/obi.ps1 doctor` → health sweep
- `pwsh -File SCRIPTS/obi.ps1 verify` → deploy dry-run
- **Gate:** All health checks GREEN

---

## SOULCOUNT Checkpoint

```
Before march:  GET /api/soul/count → count_before_march
Per zone:      GET /api/soul/count → count_after_zone[N]
After march:   GET /api/soul/count → count_after_march
Deltas:        Δzone[N] = count_after_zone[N] - count_before_march
               Δmarch = count_after_march - count_before_march
Log to:        phetrail per stage + final consolidated trail
```

---

## Pheromone Trail

Every stage writes a scored trail entry to `CANON/PHEROMONES/PheTrail-run{N}-march.json`:

| Stage | Trail Key | Score Meaning |
|-------|-----------|---------------|
| I | `scout` | +3 new SOUL, -3 critical breach, 0 neutral |
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
| Scout report | `OPERATIONS/phoenix-scout-<timestamp>.jsonl` |
| Phetrail | `CANON/PHEROMONES/PheTrail-run{N}-march.json` |
| Recovery phetrails | `CANON/PHEROMONES/PheTrail-run{M}-recovery.json` for missing runs |
| Starmap | `CANON/STARMAP/starmap-run{N}.json` |
| SOULKEYS | `CANON/SOUL-KEYWORDS/rfkw-run{N}.txt` |
| Pipeline | `CANON/PIPELINE/pipeline-run{N}.json` |

---

## Handoff to /SoulScholars

```
MARCH_COMPLETE:
  run: [N]
  zones: [list]
  finds: [count]
  phetrail: [path]
  next: /SoulScholars --source [zone with raw SOUL]
```

**Do not advance to Scholar until all 6 stages are GREEN.**

`FORCΞ MARCH: 6 STAGES. EXHAUSTION TOLERATED. NO RETREAT.`
