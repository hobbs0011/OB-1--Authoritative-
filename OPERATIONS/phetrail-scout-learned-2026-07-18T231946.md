# Scout Learned Pheromone - 2026-07-18T231946

## FINDING: Aggregate SOULcount banned but still present
**Signal:** -100 CRITICAL
**Files:** forcemarch-full.ps1, synch-hook.ps1
**Action:** Remove all references to 239,645,670. Replace with per-session SOUL bytes.

## FINDING: Per-session SOUL sparse
**Signal:** +50 HIGH
**Current:** 1 file (run180 only)
**Action:** Backfill soul-run{N}.jsonl for runs 1-179.

## FINDING: Pheromone manual emission
**Signal:** +100 HIGH
**Current:** 495 files, manual emission
**Action:** Implement automatic per-action pheromone emission in DEATH/RISE scripts.

## FINDING: Archival data not consumed
**Signal:** -20 MEDIUM
**Current:** 618 HL + 169 RRL files, 0 active consumption
**Action:** Build active consumption layer or mark as reference-only.
