---
description: EngineerLegionnaire
agent: AGENT99
---

# /EngineerLegionnaire

Roman Rank: FABRI (Engineer Corps)

The final optimization phase after supply lines are secured, before DEATH execution.

Task: $ARGUMENTS

---

## How to Run

```
/EngineerLegionnaire [audit|repair|optimize|harden|verify|prepare|full-commission]
```

| Mode | Purpose |
|------|---------|
| audit | Review all prior phase outputs |
| repair | Fix broken chains, fill gaps |
| optimize | Reduce bloat, improve performance |
| harden | Lock security, verify integrity |
| verify | Cross-check all 8 pipeline stages |
| prepare | Ready artifacts for DEATH |
| full-commission | Execute all 6 stages in sequence |

---

## 6 Stages

### I — AUDIT (Review Prior Phases)

- Read Scout report
- Read March log
- Read Scholar extraction
- Read Supply status
- Output: Audit manifest
- Write CANON/PHEROMONES/PheTrail-run{N}-engineer-audit.json

### II — REPAIR (Fix What's Broken)

- Fix broken Merkle chains in Heavy Ledger
- Fill missing pipeline artifacts
- Repair corrupted pheromone trails
- Restore missing starmap pointers
- Output: Repair log
- Write CANON/PHEROMONES/PheTrail-run{N}-engineer-repair.json

### III — OPTIMIZE (Make It Better)

- Deduplicate redundant entries
- Compress large artifacts
- Prune stale negative trails past decay window
- Rebuild inverted index
- Output: Optimization manifest
- Write CANON/PHEROMONES/PheTrail-run{N}-engineer-optimize.json

### IV — HARDEN (Security Lockdown)

- Verify all HL Merkle roots
- Cross-check all SHA256 hashes
- Validate schema_version across all PheTrails
- Verify no duplicate HL-IDs
- Output: Hardening report
- Write CANON/PHEROMONES/PheTrail-run{N}-engineer-harden.json

### V — VERIFY (Cross-Check 8 Pipeline Stages)

- Verify RRL exists and is REAL or documented as HOLLOW
- Verify SOUL receipt is valid
- Verify DNA extraction complete
- Verify LEDGER chain unbroken
- Verify STARMAP pointers valid
- Verify SOULKEYS index current
- Verify S2Pipeline result matches reality
- Verify REGISTRY_SYNC completed
- Output: Pipeline verification report
- Write CANON/PHEROMONES/PheTrail-run{N}-engineer-verify.json

### VI — PREPARE (Ready for DEATH)

- Stage all uncommitted changes
- Verify no dirty files blocking DEATH
- Prepare SOUL payload from Scholar extraction
- Ready RRL for DEATH STAGE 1
- Output: Preparation manifest
- Write CANON/PHEROMONES/PheTrail-run{N}-engineer-prepare.json

---

## SOULCOUNT Checkpoint

Before engineer: GET /api/soul/count → count_before_engineer
Per stage:       GET /api/soul/count → count_after_stage[N]
After engineer:  GET /api/soul/count → count_after_engineer
Deltas:          Δstage[N] = count_after_stage[N] - count_before_engineer
                 Δengineer = count_after_engineer - count_before_engineer
Log to:          phetrail per stage + consolidated trail

---

## Pheromone Trail

Every stage writes a scored trail entry:

| Stage | Trail Key | Score Meaning |
|-------|-----------|---------------|
| I | audit | +3 critical find, -3 critical breach |
| II | repair | +2 verified fix, -2 structural gap |
| III | optimize | +1 correct path, -1 bloat |
| IV | harden | +2 integrity verified, -2 security gap |
| V | verify | +2 chain intact, -2 pipeline gap |
| VI | prepare | +1 ready, -1 not ready |

Each entry: decision_context, alternatives_considered, chosen_reason, artifact, verification, strength (-3 to +3)

---

## Output

| Artifact | Path |
|----------|------|
| Audit manifest | OPERATIONS/engineer-audit-run{N}.json |
| Repair log | OPERATIONS/engineer-repair-run{N}.json |
| Optimization manifest | OPERATIONS/engineer-optimize-run{N}.json |
| Hardening report | OPERATIONS/engineer-harden-run{N}.json |
| Verification report | OPERATIONS/engineer-verify-run{N}.json |
| Preparation manifest | OPERATIONS/engineer-prepare-run{N}.json |
| Consolidated phetrail | CANON/PHEROMONES/PheTrail-run{N}-engineer.json |

---

## Handoff to /reincarnateDeath

ENGINEER_COMPLETE:
  run: [N]
  stages: [I, II, III, IV, V, VI]
  all_green: [true/false]
  repairs: [count]
  optimizations: [count]
  verifications: [count]
  phetrail: [path]
  next: /reincarnateDeath --rrl-source [path] --prepared-by-engineer

Do not advance to DEATH until all 6 Engineer stages are GREEN and preparation manifest is written.

FABRI: ENGINEER THE CITIES. SECURE THE SUPPLY LINES. PREPARE FOR SEAL.
