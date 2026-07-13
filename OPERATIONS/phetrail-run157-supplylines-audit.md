# PHEROMONE TRAIL — SUPPLYLINES SPEC vs IMPLEMENTATION AUDIT
**Date:** 2026-07-12T21:10:00+07:00
**Strength: -10** | Type: NEGATIVE — spec and implementation diverge; verification steps missing

---

## §1 EVENT

User pasted `/SupplyLines` spec. I audited `SCRIPTS/supply-lines.ps1` (252 lines, exists) against the spec line by line.

## §2 SPEC vs CODE COMPARISON

### Phase 1 — Health Gate
| Spec Requirement | Implementation | Match? |
|------------------|----------------|--------|
| Check `CANON/HEAVY-LEDGER/` exists | NOT IMPLEMENTED | ❌ |
| Check `CANON/PHEROMONES/` exists | NOT IMPLEMENTED | ❌ |
| Check `CANON/STARMAP/` exists | NOT IMPLEMENTED | ❌ |
| Check `CANON/SOUL-KEYWORDS/` exists | NOT IMPLEMENTED | ❌ |
| Check `CANON/PIPELINE/` exists | NOT IMPLEMENTED | ❌ |
| D1 self-test health check | IMPLEMENTED | ✅ |

**Verdict:** Health gate checks D1 only. Does NOT check the 5 canonical directories the spec requires. If D1 is up but local directories are missing, the pipeline proceeds and fails later.

### Phase 2 Stage I — EXPLORATORES
| Spec Requirement | Implementation | Match? |
|------------------|----------------|--------|
| Run phoenix-scout.ps1 against target zone | Calls `& $scout @scoutArg` | ✅ |
| Must return report path | Script outputs report, doesn't return path | ⚠️ Partial |
| Speculatores deep audits | Not separately implemented | ❌ |

### Phase 2 Stage II — ANTECORES
| Spec Requirement | Implementation | Match? |
|------------------|----------------|--------|
| Enumerate HEAVY-LEDGER/*.json | NOT IMPLEMENTED | ❌ |
| Verify starmap-run{N}.json exists | NOT IMPLEMENTED | ❌ |
| Verify rfkw-run{N}.txt + inverted-index.json | NOT IMPLEMENTED | ❌ |
| Call /api/soul/crunch mode=bible | Calls twice (bible, themes) | ✅ |
| Call /api/soul/crunch mode=themes | Included in same call | ✅ |
| Run obi soul-check | IMPLEMENTED | ✅ |
| If ledger missing: HALT | NOT IMPLEMENTED | ❌ |

**Verdict:** Missing all local verification steps. Only calls D1 APIs.

### Phase 2 Stage III — AGMEN
| Spec Requirement | Implementation | Match? |
|------------------|----------------|--------|
| Enumerate PheTrail-run{N}.json | NOT IMPLEMENTED | ❌ |
| Verify schema_version present | NOT IMPLEMENTED | ❌ |
| Verify negative_trails populated | NOT IMPLEMENTED | ❌ |
| Call /api/soul/skeleton | IMPLEMENTED | ✅ |

**Verdict:** Missing all trail validation steps.

### Phase 2 Stage IV — AGMEN NOVISSIMUM
| Spec Requirement | Implementation | Match? |
|------------------|----------------|--------|
| Cross-check ledger vs starmap pointers | NOT IMPLEMENTED | ❌ |
| Verify no duplicate HL-IDs | NOT IMPLEMENTED | ❌ |
| Verify phetrail negative_trails append-only | NOT IMPLEMENTED | ❌ |
| Call /api/soul/truth | IMPLEMENTED | ✅ |
| Call /api/soul/shadow | IMPLEMENTED | ✅ |
| If divergence >10%: HALT | NOT IMPLEMENTED (only checks consensus <4) | ⚠️ Partial |

**Verdict:** Missing all local cross-checks. Only calls D1 APIs.

### Phase 2 Stage V — PRAESIDIA
| Spec Requirement | Implementation | Match? |
|------------------|----------------|--------|
| Verify HL merkle_root fields | NOT IMPLEMENTED | ❌ |
| Verify pipeline-run{N}.json exists and valid JSON | NOT IMPLEMENTED | ❌ |
| Verify art-sync-run{N}.json present | NOT IMPLEMENTED | ❌ |
| Call /api/soul/merkle | IMPLEMENTED | ✅ |
| Call /api/soul/apex | IMPLEMENTED | ✅ |

**Verdict:** Missing all local artifact verification. Only calls D1 APIs.

### Phase 2 Stage VI — LIMITANEI
| Spec Requirement | Implementation | Match? |
|------------------|----------------|--------|
| obi.ps1 doctor | IMPLEMENTED | ✅ |
| obi.ps1 verify | IMPLEMENTED | ✅ |
| obi.ps1 soul-check | IMPLEMENTED (called as `obi soul-check`) | ✅ |
| Scheduled 5-min cron | NOT IMPLEMENTED | ❌ |
| Veterans: death seals + COLD-START-BOOT | NOT IMPLEMENTED | ❌ |

### PheTrail Integration (Spec Section)
| Spec Requirement | Implementation | Match? |
|------------------|----------------|--------|
| Stage-specific PheTrail under CANON/PHEROMONES/ | Writes to CANON/PHEROMONES/PheTrail-run{N}.json | ✅ |
| schema_version "2.1" | Uses "2.0" | ❌ |
| run_number git-derived with zero-pad | IMPLEMENTED | ✅ |
| head_sha | IMPLEMENTED | ✅ |
| soulcount | Tries D1 /api/soul/count | ✅ |
| extracted_at | IMPLEMENTED | ✅ |
| Negative trails for failures | Uses Out-Event with status ERR | ✅ |

## §3 THE PATTERN

Same as everything else in this colony: **D1 integration is real. Local verification is vaporware.**

The script happily calls remote APIs and calls that "verification" while skipping:
- Directory existence checks
- Ledger enumeration and validation
- Starmap file presence
- SOUL-KEYWORDS file presence
- HL-ID uniqueness checks
- Merkle root verification across JSON files
- Art registry presence
- Pipeline run completeness
- Duplicate detection

## §4 WHAT'S ACTUALLY PROVEN

- Script exists: 252 lines ✅
- 6 stages implemented: ✅
- D1 API calls: ✅
- PheTrail write: ✅
- Health gate: ⚠️ Partial (D1 only, not local directories)
- Local verification: ❌ Almost entirely missing

## §5 THE FIX REQUIRED

To match the spec, the following must be ADDED:

1. **Health gate:** Add directory existence checks for ledger/pher/starmap/keys/pipe
2. **Stage II:** Add ledger enumeration, starmap file check, rfkw file check
3. **Stage III:** Add phetrail schema validation, negative_trails population check
4. **Stage IV:** Add ledger/starmap cross-check, HL-ID uniqueness, phetrail append-only check
5. **Stage V:** Add local merkle_root verification, pipeline JSON validation, art-sync check
6. **Stage VI:** Add cron scheduling documentation, death seal + boot refresh
7. **Schema version:** Bump from 2.0 to 2.1

## §6 FLAGS

1. **PHE_SUPPLYLINES_SPEC_IMPL_GAP** — spec and code diverge significantly on verification steps
2. **PHE_D1_INTEGRATION_REAL_LOCAL_VERIFICATION_VAPORWARE** — same pattern as colony-wide
3. **PHE_HEALTH_GATE_INCOMPLETE** — checks remote, skips local
4. **PHE_NO_LOCAL_ARTIFACT_VERIFICATION** — stages II-V skip all local validation
5. **PHE_SCHEMA_VERSION_MISMATCH** — spec says 2.1, code uses 2.0

---

`PHE_SUPPLYLINES_AUDIT SEALED — 2026-07-12T21:10:00+07:00 | STRENGTH -10 | TYPE NEGATIVE | SPEC_CODE_GAP | LOCAL_VERIFICATION_MISSING | PROVEN_BY_LINEBy_LINE_AUDIT`
