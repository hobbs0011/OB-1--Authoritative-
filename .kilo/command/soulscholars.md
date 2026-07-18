---
description: SoulScholars
agent: AGENT99
---

# /SoulScholars

**Roman Rank: SAPIENTES | Bridge: EXPLORATORES → ANTECORES**

**Read only. Extract only. Preserve only.**

**Task:** $ARGUMENTS

---

## How to Run

```
/SoulScholars --source <directory-or-file>
```

| Arg | Purpose |
|-----|---------|
| `--source` | Directory or file containing raw SOUL material |
| `--dry-run` | Catalog only, no D1 posting |

---

## What It Does

1. **Read** the target file. Understand its structure:
   - Raw chat log (FROMSCRATCH): Michael + AI conversation
   - JSONL segment: `{id, text, sha256, confidence}` objects
   - Markdown doctrine: header-anchored sections

2. **Identify** Michael's words:
   - Verbatim blocks with his voice patterns
   - First-person statements: "I", "my", "we're"
   - Direct principles: "the thing is", "the truth is"
   - Section markers: `[Always going back to the basics..]`

3. **Extract** every Michael verbatim block with:
   - Line range
   - Full verbatim text (preserve pauses, filler, imperfections)
   - Topic tags (3-5 keywords)
   - Confidence score (0.0-1.0)
   - SHA256 hash

4. **Cross-reference** against:
   - Existing D1 soul-logger entries
   - Canonical doctrine files
   - HEAVY-LEDGER entries

5. Write extraction report to `OPERATIONS/scholar-extraction-<timestamp>.jsonl`

6. Write phetrail to `CANON/PHEROMONES/PheTrail-run{N}-scholar.json`

7. Hands off to `/SupplyLines`

---

## SOULCOUNT Checkpoint

```
Before extraction: GET /api/soul/count → count_before_scholar
Per session:       Log per-session SOULCOUNT from D1
After extraction:  GET /api/soul/count → count_after_scholar
Delta:             Δscholar = count_after - count_before
Log to:            phetrail + extraction report
```

---

## Pheromone Trail

Every extracted segment gets a scored trail entry:

| Score | Label | Meaning |
|-------|-------|---------|
| +3 | CRITICAL_FIND | New Michael doctrine, never seen before |
| +2 | VERIFIED_FIX | Known gap confirmed repaired |
| +1 | CORRECT_PATH | Expected content, no action needed |
| 0 | NEUTRAL | Routine extraction |
| -1 | MINOR_GAP | Low confidence or partial extraction |
| -2 | STRUCTURAL_GAP | Contradicts existing canon |
| -3 | CRITICAL_BREACH | Fabrication detected or source corrupted |

Each entry: `decision_context`, `alternatives_considered`, `chosen_reason`, `artifact`, `verification`, `strength` (-3 to +3)

---

## Output

| Artifact | Path | Purpose |
|----------|------|---------|
| Extraction report | `OPERATIONS/scholar-extraction-<timestamp>.jsonl` | Structured JSONL with all segments |
| Phetrail | `CANON/PHEROMONES/PheTrail-run{N}-scholar.json` | Scored decisions |
| D1 events | POST to `/api/soul/event` | Live SOULCOUNT increment |

---

## Handoff to /SupplyLines

```
SCHOLAR_COMPLETE:
  run: [N]
  source: [path]
  segments: [count]
  michael_verbatim: [count]
  new_doctrine: [count]
  duplicates: [count]
  phetrail: [path]
  next: /SupplyLines --check scholar
```

**Do not advance to Supply until Scholar report is written and cross-referenced.**

`SAPIENTES: ACTIVE. READ ONLY. PRESERVE EVERYTHING.`
