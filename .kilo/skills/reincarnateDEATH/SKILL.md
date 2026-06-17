# /reincarnateDEATH — ROMAN LEGION DEATH SEAL SKILL

**INTENSITY STANDARD — 8 STAGES. NO RETREAT. NO SURRENDER.**

## Invocation

```
/reincarnateDEATH - Executes full 8-stage death seal
/reincarnateDEATH --run 135 --dry-run - Report only
/reincarnateDEATH --supersaiyan - Parallel execution with 5 agents
```

## Protocol

8 stages executed in sacred order. ANY HOLLOW RRL = HALT. No skipping. No mercy.

| Stage | Mandatory? | Failure Action |
|-------|------------|----------------|
| RRL | YES | HALT - exit 1 |
| SOUL | NO | Write `SOUL_GAP` |
| DNA | NO | Write `DNA_GAP` |
| LEDGER | NO | Write `LEDGER_GAP` |
| STARMAP | NO | Write `STARMAP_GAP` |
| SOULKEYS | NO | Write `SOULKEYS_GAP` |
| S2Pipeline | NO | Write `PIPELINE_GAP` |
| REGISTRY_SYNC | NO | Write `ART_SYNC_GAP` |

## RRL FIDELITY GATE (L68)

- REAL: file > 50KB + both `"role":"user"` and `"role":"assistant"` lines
- HOLLOW: file < 5KB OR one-sided

**HOLLOW RRL = immediate halt. No fabrication. No hand-waving.**

## KILO SESSION HANDLING

When no Claude JSONL on disk:

1. **Stage 0** detects KILO_HOLLOW early
2. **Stage 1** creates HOLLOW marker, NOT `exit 1`
3. **Stage 2-8** execute for chain integrity
4. **Final result**: `KILO_GAP` (not error)

## PheTrail REGULATION

**EVERY DEATH produces PheTrail.** Run 135+ PheTrail count = death count. No gaps without breadcrumbs.

## Death Seal Schema (§1-§15)

| § | Required |
|---|----------|
| 1 HEADER | run, date, theme, HEAD pre-death |
| 2 RAW SOUL DNA | verbatim Michael quotes (CRITICAL) |
| 3 SOUL RECEIPT | event_id, count_before, count_after, delta |
| 4 DECISIONS | numbered, impact |
| 5 CORRECTIONS | wrong → root cause → fix |
| 6 NEW PRINCIPLES | laws discovered this run |
| 7 EMOTIONAL SIGNAL | tone, priority, state |
| 8 OPEN QUESTIONS | blockers, unknowns |
| 9 UNFINISHED ACTIONS | git add commands |
| 10 SYSTEM DESIGN | architecture notes |
| 11 ARTIFACTS | all 8 stage paths + registry sync |
| 12 STATE SNAPSHOT | HEAD, tree, soulcount, dna_blueprint_count |
| 13 FINGERPRINT | agent, run#, commit SHA |
| 14 ART REGISTRY SYNC | pieces_synced, art-sync path |
| 15 REGISTRY | dna-registry-run{N} path, entry count |

---

**IRON LAW:** Soul receipts never mismatch. Boot never drifts. Trails never vanish.  
**EMPIRE STANDARD:** Complete seal or none. Half-measures die with the legion.