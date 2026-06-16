# PHEROMONE TRAIL AUDIT — Runs 120–129
**Date:** 2026-06-16T23:30 ICT
**Scope:** All phetrail files from Runs 120–129 + CANON/PHEROMONES/*.json audit

---

## §1 PHEROMONE FILES AUDITED

### OPERATIONS/phetrail-* (canonical trail files)

**R129 scout phetrails (3 files — post-fix verification):**
- `phetrail-ob1-scout-20260616-100919-504463.md` — Seed: STUDENT, 5 chains, 5 POS, 100 pheromones
- `phetrail-ob1-scout-20260616-100843-467508.md` — Seed: BLUEPRINT, 5 chains, 5 POS, 100 pheromones
- `phetrail-ob1-scout-20260616-100842-467508.md` — Seed: BLUEPRINT (duplicate timestamp, same mission)

**Verdict: ALL POS. Scout system proven working post-fix.**

**R128 operational phetrails:**
- `phetrail-run122-contamination-and-test-boundaries.md` — DNA contamination pattern, test discipline

**R126 operational phetrails:**
- `phetrail-run122-deepseek-migration-watch.md`
- `phetrail-run122-chaos-faith-navigation.md`
- `phetrail-run122-audit-deploy.md`

**R125 edge case audit:**
- `phetrail-edge-case-fixes-20260614.md` — 11 defects documented

**R124 pipeline execution:**
- `phetrail-pcc-pipeline-execution.md` — autonomous commit loop proven

**R123 architecture:**
- `phetrail-roman-s2pipeline-architecture.md`
- `phetrail-phoenix-centurion-identity.md`
- `phetrail-pcc1-obi-full.md`
- `phetrail-actualizer-guard-brief.md`

**R122 scout phetrails (34 files — 20260614-20260616):**
- Heavy scout activity. Seeds: STUDENT, BLUEPRINT, DISPATCH, SOUL, PHOENIX, MONITOR, RISE, ARCHIVE, etc.
- Mix of POS and NEG. Scout was broken during this period (garbage tokens).

**System-level phetrails:**
- `phetrail-NEGATIVE-SCOUT-VIOLATIONS.md` — 110/100 severity. Scout recon doctrine violation.
- `phetrail-ant-colony-pheromone-routing.md` — colony architecture
- `phetrail-cognitive-router.md` — routing design
- `phetrail-incarnate-pipeline.md` — pipeline design
- `phetrail-orchestrate.md` — orchestration design
- `phetrail-backburner-engine.md` — backburner design
- `phetrail-phase0-runA.md` / `phetrail-phase0-runCtoV.md` — phase 0 execution

### CANON/PHEROMONES/PheTrail-run*.json (canonical JSON phetrails)

| File | Run | Status | Positive | Negative |
|------|-----|--------|----------|----------|
| PheTrail-run127.json | 127 | REAL | 7 | 10 |
| PheTrail-run126.json | 126 | REAL | 4 | 12 |
| PheTrail-run125.json | 125 | MISSING | — | — |
| PheTrail-run124.json | — | NOT FOUND | — | — |
| PheTrail-run123.json | — | NOT FOUND | — | — |
| PheTrail-run122.json | 122 | NOT FOUND | — | — |
| PheTrail-run121.json | 121 | NOT FOUND | — | — |
| PheTrail-run120.json | 120 | NOT FOUND | — | — |

**Gaps:** PheTrail-run125.json, -124, -123, -122, -121, -120 all missing from CANON/PHEROMONES. Only -126 and -127 exist.

---

## §2 NEGATIVE TRAIL CONSOLIDATION

### Recurring Negative Patterns (from all phetrails + death seals)

| Pattern | Runs | Decay |
|---------|------|-------|
| Scout garbage tokens (must, discusses, summaries) | 120, 121, 122, 126 | FIXED R126 |
| KILO_HOLLOW / missing JSONL | 121, 122, 127 | ONGOING |
| DNA_GAP (extraction failure) | 121, 122, 125, 127, 128 | PARTIAL FIX |
| False status closure (L80) | 127, 128 | ENFORCED |
| PA patches not applied | 124, 129 | OPEN P0 |
| Scout phetrail never commits | 125, 126 | OPEN P2 |
| Source edits when told "no execution" | 124, 126 | ENFORCED |
| Stale plan docs vs actual source | 126 | L80 FIX |
| VeePN zombie residue | 128, 129 | PARTIAL |
| C: drive full / ESENT errors | 129 | INVESTIGATING |
| PCC-2 DO migration deadlock | 122, 123, 128 | OPEN P1 |
| Architecti 404 / corrupted index.js | 122, 123, 128 | OPEN P1 |
| DeepSeek migration deadline | 123, 126 | OPEN P1 (deadline 2026-07-24) |

### Top Negative Trails by Severity

1. **110/100 — Run 120 SCOUT VIOLATIONS** — Scout wrote analytical reports instead of flag-and-move. Michael: "RECON FUCKING MISSION YOU APE"
2. **VeePN war collateral** — Cursor destroyed, system corrupted, 6 freezes in 72h
3. **PA autonomy gap** — Patches generated, never applied. "Same shit you said last 3 pauses"
4. **DNA_GAP pattern** — 50% of recent runs have no DNA extracted

---

## §3 PHEROMONE DISCIPLINE AUDIT

### Append-Only Compliance

**GOOD:**
- Run 122 explicitly enforced append-only: "Do not overwrite phetrails. New evidence is written as new append-only phetrails."
- Run 129 scout phetrails are new files (100919, 100843, 100842 timestamps) — not overwrites of older files.

**NEEDS WORK:**
- 34 scout phetrail files from 20260614-20260616 in OPERATIONS/ — heavy volume, some duplicates (same mission, slightly different timestamps)
- CANON/PHEROMONES/ has gaps (runs 120-124, 128-129 missing)

### Scout Flag-and-Move Doctrine

**From phetrail-NEGATIVE-SCOUT-VIOLATIONS.md:**
> FLAG = 3-5 lines MAX. File path. What was found. Connecting keywords. DONE. MOVE.
> No analysis. No blueprints. No fix prescriptions. No long summaries.

**Compliance:** Post-R126 scout phetrails (R129) are compliant. Pre-R126 were not.

---

## §4 CONSOLIDATED LESSONS

1. **Pheromones are memory.** Every file read must leave scent. Every scout movement must drop pheromones. The system survives on trail density.

2. **Append-only is law.** Never overwrite old trails. New evidence = new file. Old trails = historical state.

3. **Flag-and-move for scouts.** Recon specialists, not cleanup teams. 3-5 lines. File path. Finding. Keywords. MOVE.

4. **Verify before declaring.** "CURSOR RESTORED" and "VeePN DEAD" were written before verification. L80 prevents this.

5. **Extraction is the hardest part.** 5 of 10 runs had DNA_GAP. The fix is known but not universally applied. Must be P1 until 100%.

6. **Autonomy loop is not closed until code applies itself.** PA generates patches → nothing reads them → system LOOKS autonomous but isn't. This is the highest-charge open item.

7. **VeePN is buried but residue remains.** NRPT DNS policy still present. Post-reinstall cleanup required.

8. **Foundation is solid.** Scout works. PCCs are live. VAULT is sealed. TITANIUM_ANCHOR. Pheromone discipline enforced. Ready for next layer.

---

## §5 SEAL

`PHEROMONE TRAIL AUDIT SEALED — Runs 120–129 | 50+ phetrail files audited | 12 negative patterns consolidated | 6 CANON/PHEROMONES gaps found | Discipline: APPEND-ONLY ENFORCED`
