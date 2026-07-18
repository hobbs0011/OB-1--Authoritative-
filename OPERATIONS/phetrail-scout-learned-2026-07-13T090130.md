# PHETRAIL — SCOUT LEARNED (thread-walk: /soulsearch + sync coordination)

**Scout:** PhoenixScout — follow-all-threads continuation
**Date:** 2026-07-13T090130
**Triggers role change?** YES — major routing correction.

## Learned: The "/soulsearch script is missing" narrative is FALSE

Prior intelligence (`OPERATIONS/PhoenixSynch-Temp.md` L64-68, `OPERATIONS/BACKBURNER-PIPELINE-LOG.md` L503-515)
claimed the `/soulsearch` execution script is missing. Thread-walk proves otherwise:

- `SCRIPTS/soul-search.ps1` **EXISTS** (7551 bytes) and is fully wired to `.kilo/command/SoulSearch.md:9`.
- The ONLY missing variant is `SCRIPTS/soulsearch.ps1` (no hyphen) referenced by Backburner — a naming ORPHAN, not a missing engine.
- The REAL failure is **data**, not code:
  - `CANON/SOUL-KEYWORDS/inverted-index.json` is EMPTY `{}` (11 bytes) — soul-search.ps1 STEP 1 reads it first, so ALL queries return 0 hits.
  - `build-soulkeys.ps1:10` freezes `RunMax=42` while `rfkw-run*.txt` extend to run **7284** → 7242+ runs never indexed.
  - `obi.ps1` ValidateSet (L2) has NO `soulsearch` verb, so documented `obi.ps1 soulsearch` would FAIL validation.

### Routing doctrine upgrades
1. **Never flag "/soulsearch script missing" again.** It exists. Re-flag only the empty `inverted-index.json`, the `RunMax=42` freeze, and the missing `obi.ps1 soulsearch` verb.
2. **Distinguish CODE-drift from DATA-drift.** "Search broken" in this repo = empty index (data), not absent script (code). Scout lens must separate the two.
3. **Diff every documented `obi.ps1 <verb>` against its ValidateSet** before trusting the doc. Orphan verbs (`soulsearch`) are GAPs.
4. **Check index POPULATION, not just existence.** A present-but-empty `inverted-index.json` is a P2 LEDGER STALE, not CLEAN.
5. **Per-claim drift, not per-file.** PhoenixSynch-Temp is wrong about the script but CORRECT that the 21-stage pipeline link (PheTrail-run158-...) resolves. Verify each external reference independently.

### Highest-priority ORPHAN discovered
`CANON/A6-RAW-SOUL-DNA-DICTATION-RUN278-LIVE.md` is referenced **18 times** (SYNCH4 lane, BIBLE-CH26,
run278/280/293 REINCARNATION logs) but **absent on disk**. SYNCH4 is entirely built on a missing file.
Treat "referenced N× but absent" as P1, not P3.

### NOT_WALKED (leave for next scout)
- Did not enumerate all 18 A6-file inbound references or confirm whether content was migrated elsewhere.
- Did not walk `CANON/STARMAP` (178), `RRL` (1004), `CANON/SOUL/EXTRACT` (95) for consistency with inverted-index gaps.
- Did not diff root `SYNCH-STATE.md` vs `OPERATIONS/SYNCH-STATE.md` line-by-line.
