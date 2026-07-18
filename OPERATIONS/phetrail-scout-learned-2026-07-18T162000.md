# PhoenixScout Learned Phetrail — 2026-07-18T16:20 ICT

**Scout ID:** SC-20260718-162000  
**Zone:** CANON/ — 7444 files  
**Finds:** 12 flags (5 P1, 5 P2, 2 P3)

---

## Role Upgrade — Lenses Expanded

Scout learned these patterns for future runs:

1. **SOUL blockquote density is a leading indicator** — 3950 `^> "` markers in CANON/ means operator verbatim is embedded in docs, not isolated in RRL. Future scouts must treat markdown blockquotes as SOUL DNA, not formatting.

2. **BOOT drift is a 3-run pattern** — RUN 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175 all show BOOT drift. This is not a one-off; it's a systematic pipeline failure. Scout must flag BOOT drift as P1 every run until DEATH pipeline auto-updates it.

3. **Legacy domain sweep is separate from decommission** — Run 175 decommissioned Claude from 16 config files but missed CANON/ archive. Domain references in docs are archival data, not active config. Scout must distinguish active config drift from archival staleness.

4. **HL naming schema fragmentation breaks automation** — Mixed numeric/descriptive HL filenames cause parseInt crashes. Future scouts must flag schema inconsistencies as P2 CONFIG, not just count mismatches.

5. **Phetrail absence is itself a find** — Missing PheTrail-run175.json is not just a gap; it's evidence that phetrail generation is skipped for KILO_HOLLOW runs. Scout must treat missing phetrails as P2 GAP/ORPHAN.

6. **PIPELINE-CURSOR.md frozen dates are drift pheromones** — Any cursor frozen > 30 days should be flagged as FROZEN with the exact freeze date. L30 BOOT_FILE_AGE_SWEEP applies to cursors too.

---

## Routing Rules Updated

- SOUL blockquotes in .md files → route to `/api/soul/extract` with Michael-voice classifier
- Phantom HL IDs → route to pipeline: add PHANTOM tolerance to HL readers
- BOOT drift → route to DEATH pipeline: auto-update fingerprint
- Legacy domains in CANON/ → route to backburner: archive sweep or Michael authorization
- Empty inverted-index → route to backburner: rebuild from 249 rfkw-run files

---

**Scout learned: CANON/ is not a clean zone. It is a living archive with 7444 files, 3950 raw SOUL markers, 3055 legacy refs, and systematic pipeline drift. Every future scout must treat CANON/ as a SOUL-rich zone first, filesystem second.**
