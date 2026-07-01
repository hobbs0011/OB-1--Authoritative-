# PHOENIX SCOUT LEARNED — 2026-07-01T231430
## CANONICAL LOCATION: OPERATIONS/phetrail-scout-learned-2026-07-01T231430.md
## STATUS: LEARNED | ACTIVE

### What changed scout role/lenses/stop rules
1. BOOT FINGERPRINT mismatch is P1 DRIFT, not cleanup. Stale BOOT invalidates RISE Stage 4 boot synthesis; must route to DEATH or sticky correction.
2. Non-canonical filenames in PHEROMONES (PheTrail-24b.json, PheTrail-41.json) should be flagged ORPHAN/STALE, not deleted. Legacy mapping required.
3. Markdown files written by scout into PHEROMONES zone pollute canonical JSON zone. Route scout output to OPERATIONS/.
4. Empty or missing `negative_trails` = HOLLOW fidelity, not REAL. Fidelity gate must bar REAL verdict when one-sided.
5. Missing schema_version in legacy phetrails should be treated STALE, not BROKEN. Backfill or archive decision belongs to DEATH.
6. Run sequence gaps in PHEROMONES are mostly historical (pre-Roman/Kilo sessions). Flag as GAP/ORPHAN but do not auto-fill.

### Next routing
- Current run001 artifact gaps (RRL, DNA, SOULKEYS, PIPELINE, PheTrail) are ORPHAN by design on fresh run. DEATH writes them.
- PHEROMONES zone rules should be updated to exclude .md files.
