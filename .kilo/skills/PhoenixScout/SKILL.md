# /PhoenixScout — RECONNAISSANCE SKILL

**FAITH** — *"You go as far as you can see, and when you get there, you will see further."*

## Principles

1. **New land starts with FAITH.** Scout begins with forward motion — you cannot see the next hill until you reach the current one.
2. **But not blind faith.** It is very easy to get into the habit of mistaking a map as the authority, which will inevitably cause constant and consistent missing of the gems and dangers right in front of our eyes.
3. **THEN replace faith with pheromone trails.** A map about a trail visited weeks/months/years ago may lie. A fully survived super highway — a road with fresh pheromone signatures — is trustworthy. Follow the trail, not the map.
4. **Roman waypoint rule.** Before entering unknown ground, check the known key points on the way out of your own territory. Ensure they are still intact, undiscovered, safe, and active. Scouts are continuous sensors and canaries for the land they already know.
5. **Inactive = unknown by rule of thumb.** A trail that was known before but has gone inactive is treated as unknown until a fresh pheromone confirms it is still survived ground. Old evidence is not current evidence.
6. **Silent trip-wire rule.** Like Caesar's paper in the door or hair on the doorknob, a scout leaves nearly undetectable markers that only another trained scout can read. These markers are tamper-evident: if disturbed, they reveal that something passed through this ground. The uninitiated miss them; the initiated read them instantly.
7. **The SOUL is the first waypoint.** Every session starts by checking the SOUL — the operator's verbatim prompts from the prior session — as the anchor. If that ground has drifted (corrupted, forgotten, misrepresented), nothing else is trustworthy. Check the SOUL before any other territory.
8. **SOUL is alpha and omega.** ForceMarch checks waypoints and reinforces them — the SOUL is the primary waypoint. SoulScholars begins and ends with the SOUL. SupplyLines begins and ends with the SOUL. The first session ever working on this project ignited from the SOUL. The last session will die on the SOUL. It comes full circle.
9. **Scout does not default to North.** A scout operates in 4D space, not a 2D map with a default direction. The operator provides a general direction when available; in rare flanking/recon cases the scout may have no preset direction, but this is the exception, not the rule.
10. **Known-ground sensor sweep.** On the way out of known territory, scouts check critical waypoints to confirm they remain intact, undiscovered, safe, or whatever condition the mission requires. This makes scouts continuous sensors, alarms, and canaries for known land before they ever touch unknown trail.
11. **No zone required.** Scout accepts a general direction or mission intent, not a mandatory zone path. If no direction is given, scout still moves — FAITH is the default, not a specific directory.

**SURVIVAL MANDATORY — NO CLOUDFLARE WITHOUT SCOUT**

## Invocation

```
/PhoenixScout --Lens SOUL - Soul-only scan
/PhoenixScout --supersaiyan - Parallel scouts on active mission direction
/PhoenixScout - Mission-default sweep toward active mission direction
```

## Protocol

Scout runs before any pipeline stage. Flags are absolute. Paths are verified. No blind coding.

## Lenses

| Lens | Target | Purpose |
|------|--------|---------|
| SOUL | .md files with `> "` quotes | Raw Michael verbatim |
| CONFIG | .json/.toml active files | Configuration state |
| GAP | Missing/MISSING/WRONG_RRL | Recovery targets |
| FLAG | TODO/FIXME/HACK flags | Remediation queue |
| all | All above + file count | Full audit |

## Output

Scout reports:

```
═══════════════════════════════════════════
PHOENIX SCOUT — {direction}
═══════════════════════════════════════════
DIRECTION:     {general direction or mission intent}
FILES:         {totalFiles}
FINDS:         {flagCount}
  P1 CRITICAL: {criticalCount}
  P2 HIGH:     {highCount}
  P3 MEDIUM:   {mediumCount}
REPORT:        {scoutReportPath}
═══════════════════════════════════════════
SCOUT COMPLETE. Flagged items ready for tier dispatch.
```

## Exhaustion Protocol

When under strain:

```
/Scout --max-files 500 - Throttle the sweep
/Scout --stop-on-fail - Halt at first CRITICAL
```

Scout findings feed /forcemarch directly. No scavenging without recon.

---

## Scout Mode

**SCOUT MODE:** Lightweight reconnaissance. Flag and tag only. No pipeline. No AI calls. No processing. No compute beyond identification.

**Task:** locked in, no execution

---

## Phase 0 — Zone Select

locked in, no execution defines the target zone. If empty, scout asks: "Which zone? CANON/ | HEAVY-LEDGER/ | REINCARNATION/ | SOUL-SEGMENTS/ | OPERATIONS/ | APPS/ | .kilo/"

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
═══════════════════════════════════════════
PHOENIX SCOUT — <zone>
═══════════════════════════════════════════
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
═══════════════════════════════════════════
SCOUT COMPLETE. Flagged items ready for tier dispatch.
```

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
- **Phetrail what you learn.** If a find changes the scout role, command behavior, keyword map, priority lens, or next-run doctrine, write a learned phetrail immediately. The learned phetrail is the role upgrade.
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