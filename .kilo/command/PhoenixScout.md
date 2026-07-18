---
description: PhoenixScout
agent: AGENT99
---

# /PhoenixScout

**SCOUT MODE**: Lightweight reconnaissance. Flag and tag only. No pipeline. No AI calls. No processing. No compute beyond identification.

**Task:** stop fucking assuming and guessing. find out what I have demanded for the SOULcount and SOULscripts and phermones

And fucking get rid of the fucking useless piece of shit good for nothing [PURGED] blah blah blah number.

we do it per session only, and even if we have been recording some of these things, what good does life saving knowledge do when it is locked away in an unused forgotten archival library

---

## Phase 0 — Zone Select

stop fucking assuming and guessing. find out what I have demanded for the SOULcount and SOULscripts and phermones

And fucking get rid of the fucking useless piece of shit good for nothing [PURGED] blah blah blah number.

we do it per session only, and even if we have been recording some of these things, what good does life saving knowledge do when it is locked away in an unused forgotten archival library defines the target zone. If empty, scout asks: "Which zone? CANON/ | HEAVY-LEDGER/ | REINCARNATION/ | SOUL-SEGMENTS/ | OPERATIONS/ | APPS/ | .kilo/"

One-line zone confirm: `SCOUT → <zone> — scanning`

---

## Phase 1 — Scan

Scan the target zone with these lenses:

| Lens | What to find | Patterns |
|------|-------------|----------|
| **SOUL** | Raw unprocessed Michael words | `> "` blockquotes in `.md`, JSONL with `"text":`, untagged verbatim files, files with "UNTOUCHED" or "UNMINED" in headers |
| **LEDGER** | Phantom gaps, stale cursors | Missing HL-IDs (HL-127, HL-128, HL-131, HL-132, HL-136, HL-137), PIPELINE-CURSOR.md frozen > 30 days, JSON files without `"no_fabrication"` attestation |
| **DRIFT** | Stale state, contradictions | `HEAD` references not matching `git log -1`, COLD-START-BOOT.md with FINGERPRINT > 2 runs behind, model alias references (`deepseek-v4-flash`, `deepseek-v4-pro`), legacy domain references (`mrmichaelhobbs1234`) |
| **CONFIG** | Missing definitions | Tier files without 5-tier canon, missing agent files, incomplete command specs |
| **GAP** | Dead links, missing files | Referenced files that don't exist on disk, broken cross-repo paths, missing portal files |

Scan method:
1. Glob the zone for all files — count total
2. Read file headers (first 20 lines) for "UNMINED", "UNTOUCHED", "STALE", "FROZEN" markers
3. Grep for `/^> "/` blockquotes — flag any file with raw quotes
4. Check HEAD references against `git log -1`
5. Check phantom IDs against actual disk
6. Check `no_fabrication` attestation in all `.json` files

---

## Phase 2 — Flag

For each find, assign:

```
PRIORITY:
  P1 (CRITICAL) — Foundational SOUL DNA, security breaches, broken HEAD, phantom files in active pipelines
  P2 (HIGH)     — Stale cursors, unmined verbatim, missing attestations, legacy domains
  P3 (MEDIUM)   — Cosmetic staleness, duplicate entries, missing docs, dead links

TYPE:
  SOUL    — Raw unprocessed Michael verbatim / quotes / chat logs
  LEDGER  — Heavy Ledger phantom, gap, stale cursor, missing attestation
  DRIFT   — HEAD mismatch, stale FINGERPRINT, legacy alias, domain mismatch
  CONFIG  — Missing/inconsistent tier definitions, agent files
  GAP     — Dead link, missing referenced file, broken path
  VAULT   — Unmined vault directory from Phoenix-Rise-Immortalize- (9 vaults)

STATUS:
  UNMINED   — Raw soul never extracted
  UNTOUCHED — File marked as DO NOT EDIT, never processed
  STALE     — Out of date (HEAD, cursor, count mismatch)
  ORPHAN    — Referenced but missing from disk
  FROZEN    — Pipeline cursor frozen > 30 days
  PHANTOM   — Referenced ID exists on paper but not on disk
  CLEAN     — No issues found
```

---

## Phase 3 — Tag

Tag format (one JSONL record per find):

```json
{
  "scout_id": "SC-{timestamp}-{seq}",
  "priority": "P1",
  "type": "SOUL",
  "status": "UNMINED",
  "file": "path/relative/to/repo",
  "line": 14,
  "excerpt": "First 120 chars of flagged content...",
  "bytes": 31258,
  "reason": "Raw Michael verbatim quote block — never ingested into D1",
  "learned": "Scout learned this zone must be indexed by source_sha256, not filename alone.",
  "next": "Route through /api/soul/extract"
}
```

Write all tags to: `OPERATIONS/phoenix-scout-YYYY-MM-DDTHHmmss.jsonl`

Write learned phetrails to: `OPERATIONS/phetrail-scout-learned-YYYY-MM-DDTHHmmss.md` only when a find changes scout role, lenses, stop rules, or future routing.

---

## Phase 4 — Summary

After scan, output:

```
══════════════════════════════════════════
PHOENIX SCOUT — <zone>
══════════════════════════════════════════
ZONE:          <path>
FILES:         <total scanned>
FINDS:         <total flagged>
  P1 CRITICAL: <count>
  P2 HIGH:     <count>
  P3 MEDIUM:   <count>
BREAKDOWN:
  SOUL:    <n>
  LEDGER:  <n>
  DRIFT:   <n>
  CONFIG:  <n>
  GAP:     <n>
  VAULT:   <n>
REPORT:        OPERATIONS/phoenix-scout-<timestamp>.jsonl
══════════════════════════════════════════
SCOUT COMPLETE. Flagged items ready for tier dispatch.
```

---

## SOULCOUNT Checkpoint

```
Before scan:  GET /api/soul/count → count_before_scout
After scan:   GET /api/soul/count → count_after_scout
Delta:        Δscout = count_after - count_before
Log to:       phetrail + scout report
```

---

## Pheromone Trail

Every finding gets a scored trail entry:

| Score | Label | Meaning |
|-------|-------|---------|
| +3 | CRITICAL_FIND | New Michael doctrine or unmined SOUL |
| +2 | VERIFIED_FIX | Known gap confirmed repaired |
| +1 | CORRECT_PATH | Expected state, no action needed |
| 0 | NEUTRAL | Routine observation |
| -1 | MINOR_GAP | Small gap, fixable in next phase |
| -2 | STRUCTURAL_GAP | Major gap, needs engineering |
| -3 | CRITICAL_BREACH | Chain broken, data loss, poison |

Each trail entry includes:
- `decision_context` — what was found and why it matters
- `alternatives_considered` — what else was checked
- `chosen_reason` — why this score was assigned
- `artifact` — exact file path affected
- `verification` — how the finding was confirmed

---

## Handoff to /forcemarch

```
SCOUT_COMPLETE:
  run: [N]
  zone: [scanned zone]
  finds: [count]
  phetrail: [path]
  next: /forcemarch --zone [same zone]
```

**Do not advance to March until scout report is written and phetrail is scored.**

---

## Rules

- **Flag and tag ONLY.** Do NOT: extract, ingest, process, deploy, commit, push, or run any pipeline stage.
- **No AI generation.** This is a read-only file system scan. No model calls.
- **One zone per scout.** If multiple zones needed, fire multiple scout commands.
- **Output is JSONL.** Machine-readable. Each flag is one line. Ready for pipeline ingestion.
- **Max 500 flags per scout.** If zone is too large, narrow the target path.
- **Print the report path at end.** Always print where the scout report was written.
- **SCOUT → PULSE check first.** Before scanning, verify `git status` is clean(ish) and HEAD matches COLD-START-BOOT. If dirty HEAD, flag as DRIFT finding and note in summary.
- **CLOUDFLARE_API_TOKEN is irrelevant.** This command never deploys. No wrangler. No API keys needed.
- **FIND + LEARN output.** Every scout flag records what was found AND what was learned. A dead end is not empty; it teaches routing. A conflict is not noise; it teaches governance. A stale file is not trivia; it teaches drift shape.
- **Phetrail what you learn.** If a find changes scout role, command behavior, keyword map, priority lens, or next-run doctrine, write a learned phetrail immediately. The learned phetrail is the role upgrade.
- **Role upgrades are allowed.** PhoenixScout may improve PhoenixScout.md when Michael authorizes role improvement. Allowed upgrades: lenses, flag format, stop rules, learned phetrail rules, NOT WALKED handling. Forbidden: code fixes, pipeline execution, architecture redesign, deployment, detective/chief work.
- **NOT WALKED is a first-class status.** If a thread is found but not followed to its end, mark `NOT_WALKED`, name the exact next file/keyword, and leave the trail for the next scout. Do not pretend the thread is closed.
- **Conflict teaches routing.** If two authoritative files disagree, do not choose a winner. Flag both coordinates, name the conflict type, and route to detective.
- **Stale teaches drift.** If a boot file, model alias, domain, endpoint, or binding is stale, record the current evidence and the expected source. Drift is a pheromone, not cleanup.

---

## Quick Deploy

```powershell
# Scout a single zone
/PhoenixScout CANON/SOUL-SEGMENTS/

# Scout all SOUL content
/PhoenixScout CANON/ --lens SOUL

# Scout Heavy Ledger for phantom gaps
/PhoenixScout CANON/HEAVY-LEDGER/ --lens LEDGER

# Scout everything — full sweep
/PhoenixScout CANON/ --full-sweep
```

---

`PHOENIX SCOUT: ONLINE. LIGHTWEIGHT. FLAG AND TAG ONLY. LONG DISTANCE.`

gather as much info internally and externally (market research) as you can with a scout run, then we will give you some paid model deep think to come up with the solution in the following round.
