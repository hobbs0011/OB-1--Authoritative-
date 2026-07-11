# phetrail-scout-learned-2026-07-03T013905.md
Scout focus: Bluetech + student portals — Mai Tram, Huong (active); Quan, Quang, Khang (Quan/Quang active per directive, Khang absent).
Historical scan back to earliest artifacts.

## Findings → Rules Upgraded

1. **Class intel `07-soul-quotes.md` is pre-extracted SOUL gold.** Any file named `07-soul-quotes.md` under `OPERATIONS/CLASS-INTEL/*` must be auto-flagged as SOUL UNMINED and queued for `/api/soul/event` ingestion. Do not treat `.md` in ops as inert.

2. **Active/inactive student split is implicit.** Presence in `public/student/` = active; absence = inactive or missing. No manifest exists. Future scout must enumerate expected roster vs actual filesystem presence.

3. **Archive dirs need manifests.** `public/lessons/archive/` and `public/deactivated/` should carry README/manifest or they become ungoverned VAULT territory.

4. **Dashboards without baked student context are runtime dependencies.** Absence of student links is NOT a dead-link; verify API runtime before declaring gap.

5. **Khang absence.** Zero files across repo for Khang. Scout must differentiate NOT_IN_ROSTER from ORPHAN. Do not fabricate missing students.

6. **Cross-file registry gap.** Class intel directories have no index mapping date→student→ledger. Add `OPERATIONS/CLASS-INTEL/index.md` or accept orphan risk.

7. **Historical class intel gap.** `CLASS-INTEL/` only has June 2026 sessions. Historical data exists in `NET-STUDENTS/`, `ARCHIVE/GDRIVE-PROJECT-CORE/`, `ARCHIVE/TELEGRAM/`, `STUDENT-WEBSITES/`, `SOULDNA-CAPTURES/`, and `public/lessons/archive/`. Scout must enumerate historical locations before declaring a student session gap.

8. **VAULT manifests are frozen if stale.** VAULT manifests without refresh timestamp >30 days should be flagged FROZEN. Mai-Tram vault has 2 recordings from April 15; others empty.

## Routing Impact

- **DEATH:** Must ingest `07-soul-quotes.md` files for Mai Tram + Huong before seal.
- **/reincarnateRise:** Must cross-check STATE-SNAPSHOT student roster against actual portal files.
- **Soul intake:** Student transcripts must be excluded from sov100 count per L31.
- **Backburner:** `/soulsearch` should index `OPERATIONS/CLASS-INTEL/*/07-soul-quotes.md` first, not generic markdown.
- **Historical backfill:** Route `NET-STUDENTS/`, `ARCHIVE/TELEGRAM/`, and `public/lessons/archive/` through `/api/soul/extract` with student vs sov100 split before merging into canonical CLASS-INTEL.
