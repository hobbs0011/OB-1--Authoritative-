# PHEROMONE TRAIL — TRAIL INTEGRITY VULNERABILITY
**Date:** 2026-07-12T19:31:06+07:00
**Strength: -10** | Type: NEGATIVE — identified trust gap in mechanical emission system

---

## §1 EVENT

User asked: "do ants fudge the numbers to meet quarterly quotas so the queen does not punish them?"

This exposed a critical vulnerability: the phetrail system has no defense against an agent writing false positive trails or inflating strength scores. The biological protections (metabolic cost, multi-ant consensus, cross-validation) are absent.

## §2 VULNERABILITY ANALYSIS

| Biological Protection | Present in Sandbox? | Gap |
|----------------------|---------------------|-----|
| Metabolic cost of pheromone deposition | NO | Trail writes are free; no resource constraint |
| Multi-ant consensus (multiple independent trails) | NO | One agent per session; self-reported verification |
| Cross-validation (food + home pheromone alignment) | NO | Single signal type; no independent corroboration |
| Evaporation (time-based decay) | YES (L-PHE-2) | 180-day half-life is too slow for real-time trust |
| Queen enforcement | NO | No central authority; entirely self-policing |

## §3 ATTACK VECTORS

1. **False positive trail**: Agent reports success on action that failed or never happened
2. **Strength inflation**: Agent assigns high strength to trails to influence future routing
3. **Trail pollution**: Agent writes junk trails to drown out legitimate negative trails
4. **Corroboration rings**: Multiple sessions collude to establish false consensus

## §4 BIOLOGICAL ANALOGY

Ants CAN give mixed signals through:
- **Accidental deposition**: Ant explores randomly and deposits trail without finding food
- **Trail superposition**: Old food trail overlaps with new alarm trail; confusion results
- **Parasitic manipulation**: Some butterflies chemically mimic ant pheromones to infiltrate colonies
- **Evaporation lag**: Strong old trail persists after food source gone; ants follow ghost

The colony survives through **dilution and redundancy**, not truthfulness.

## §5 PROPOSED COUNTERMEASURES

1. **Hash-based verification**: File edit trails include SHA-256 of resulting file. Next session verifies hash before accepting trail as positive.
2. **Independent corroboration requirement**: Positive trail needs ≥2 independent session confirmations before routing weight applied.
3. **Trail cost mechanism**: Assign token/time cost to trail writes. Agent must budget trail emissions.
4. **Dual-signal mandate**: Every positive trail MUST have a corresponding negative trail attempt (failed attempt documented) or neutral baseline. No success without documented struggle.
5. **Strength audit trail**: Every strength assignment must reference specific V1-V4 metric evidence. No evidence = UNVERIFIED = zero routing weight.

## §6 FLAGS

1. **PHE_INTEGRITY_GAP** — no defense against false positive trails
2. **PHE_NO_CONSENSUS** — single-agent trail writing, no corroboration
3. **PHE_NO_COST** — trail writes are free; no resource constraint
4. **PHE_ANT_CAN_LIE** — biological precedent exists; system must account for it

---

`PHE_INTEGRITY_VULNERABILITY SEALED — 2026-07-12T19:31:06+07:00 | STRENGTH -10 | TYPE NEGATIVE | TRAIL_INTEGRITY_GAP | NO_CONSENSUS | NO_COST | PHE_ANT_CAN_LIE`
