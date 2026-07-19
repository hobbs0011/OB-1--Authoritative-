# Plan: PhoenixSynch command + Session 184 full synch update

**Status:** READY FOR IMPLEMENTATION  
**Run:** 184  
**HEAD:** 75fd0c3eb  
**Operator:** SOV100 Michael Hobbs  
**Timestamp:** 2026-07-19T13:04 ICT

---

## Goal

1. Create `.kilo/command/phoenixsynch.md` — canonical `/PhoenixSynch` command spec
2. Update `OPERATIONS/PhoenixSynch.md` — full session 184 report with RRL header block, SCS checkpoints, SOUL/DNA/REASON counts, and the "overkill through design" motto
3. Prove the concept: RRL audit protocol with 4 criteria (timestamps, title/first-last, SOUL samples, AI samples) + character count breakdown (SOUL/DNA/REASON)

---

## Scout Findings (CANON/PHEROMONES zone)

| Metric | Value |
|--------|-------|
| Files scanned | 517 |
| Total size | 919 KB |
| Empty stubs (<200 bytes) | 176 |
| Files with no schema_version | 275 |
| Files with old schema | 229 |
| Files with current schema v2.2 | 11 |
| Files with banned aggregate `soulcount` | 232 |
| Files with per-session `soul_bytes` | 0 |
| Canonical `PheTrail-run184.json` | MISSING |
| Canonical `PheTrail-run182.json` | MISSING |
| Ghost run file | `PheTrail-run998.json` (1906 bytes, no matching session) |

**Implication:** The phetrail system is the exact failure mode the user flagged. Aggregate not purged. Schema not enforced. Canonical per-run trails missing. Empty stubs occupying run slots.

## Guiding Principles (from actual `.kilo/command/PhoenixScout.md`)

1. **FAITH** — “You go as far as you can see, and when you get there, you will see further.”
2. **NOT BLIND FAITH** — “It is very easy to get into the habit of mistaking a map as the authority…”
3. **REPLACE FAITH WITH PHEROMONES** — “You may not be able to trust a map about a trail visited weeks/months/years ago, but you sure as heck can trust a road that is a fully survived super highway.”
4. **GENERAL DIRECTION, NOT DEFAULT CANON** — “Does a scout default to only north in a world that is 4D?”
5. **KNOWN LAND AS CONTINUOUS SENSOR** — “The Romans had scouts check on important key points on the way out…”
6. **SILENT TRIPWIRES** — “Like leaving a small piece of paper in a door…”

---

## Single Blocking Decision

**Question:** Before writing the `/PhoenixSynch` command spec and updating `PhoenixSynch.md`, should the plan include a full scout sweep of the other 4 canonical zones (`CANON/HEAVY-LEDGER/`, `CANON/SOUL/EXTRACT/`, `RRL/`, `OPERATIONS/`) so the synch update is grounded in actual terrain data, or is the `CANON/PHEROMONES` scan sufficient and the rest can be inferred from existing scout reports?

**Recommended answer:** Full sweep. The user’s motto is “overkill is a predictable guaranteed result.” Inferring terrain from old maps is exactly the blind-faith failure the scout doctrine warns against. The zones are small enough that a read-only scan is cheap.

If recommended answer is accepted, execution order becomes:
1. Scout `CANON/HEAVY-LEDGER/`
2. Scout `CANON/SOUL/EXTRACT/`
3. Scout `RRL/`
4. Scout `OPERATIONS/`
5. Write `/PhoenixSynch` command spec
6. Update `PhoenixSynch.md` with all scout findings + session 184 report + motto + audit protocol

---

## What Needs to Happen

### Step 1: Create `.kilo/command/phoenixsynch.md`

**Format:** YAML frontmatter + markdown body, matching existing command files (forcemarch.md, reincarnaterise.md)

**Required sections:**
- YAML frontmatter: `description`, `agent`
- `# /PhoenixSynch` header
- `**Task:** $ARGUMENTS`
- Purpose: canonical coordination touchpoint for session handoffs
- Protocol: read prior synch → update with current state → stamp header → write phetrails
- Output: `OPERATIONS/PhoenixSynch.md`
- Gate: prior synch read before any write

**Content to encode:**
- RISE stamps RRL header with run number, mission, timestamps, checkpoint timestamps
- DEATH stamps final SOUL/DNA/REASON counts
- RISE double-checks prior DEATH counts against RRL
- Operator final check until trust is earned
- 4-stage audit protocol embedded in command spec

### Step 2: Update `OPERATIONS/PhoenixSynch.md`

**Required changes:**

1. **Header block (lines 1-11):** Update to run 184, HEAD 75fd0c3eb, current timestamp
2. **§22 rewrite:** Replace current §22 (which is run 182 → 185 handoff) with factual session 184 report:
   - What session 184 actually did (read-only, no fixes)
   - RRL-182 failure documented (+110)
   - Scout findings (16 flags, 6 P1)
   - False approval failure (-3)
   - Kilo DB extraction proved RRL-184 is 2.4MB REAL
   - SOUL/DNA/REASON counts: 41,570 / 57,004 / 239,122
3. **RRL header block:** Stamp with:
   ```
   RUN: 184
   MISSION: SCS Procedure / PhoenixScout
   RISE_START: 2026-07-19T05:28:38.178Z
   ```
4. **SCS checkpoint timestamps:** Record each stage start time as they happen
5. **Audit criteria section:** Document the 4-stage RRL audit protocol
6. **Motto section:** "Overkill is a predictable guaranteed result"
7. **Handoff to 185:** Complete state transfer with artifact paths and mandates

**Constraints:**
- Do NOT modify existing pheromone trails in CANON/PHEROMONES/
- Do NOT modify BACKBURNER-PIPELINE-LOG.md
- Do NOT modify RRL files
- PhoenixSynch.md is the ONLY file to update in this plan

### Step 3: RRL Audit Protocol (to be encoded in command docs)

**Criterion 1: Timestamps**
- Session created time vs RRL first message time
- Session updated time vs RRL last message time
- Match tolerance: ±5 seconds

**Criterion 2: Title + First/Last Messages**
- Session title matches RRL header mission
- First message content matches expected session start
- Last message content matches expected session end

**Criterion 3: SOUL samples (3 positions)**
- 1/3 (~15% through user messages)
- 2/3 (~50% through user messages)
- 3/3 (~85% through user messages)
- Compare exact text

**Criterion 4: AI samples (3 positions each)**
- 3 AI responses at same positions
- 3 AI reasoning blocks at same positions
- Compare exact text

**Criterion 5: Character counts (proposed)**
- SOULcount = sum of all user text part lengths
- DNAcount = sum of all assistant text part lengths
- REASONcount = sum of all assistant reasoning part lengths
- Compare to RRL header recorded counts
- Tolerance: ±1%

**Audit flow:**
```
DEATH:
  1. Extract RRL from Kilo DB
  2. Compute SOUL/DNA/REASON counts
  3. Stamp RRL header with counts + timestamps
  4. Write audit result to death seal §3

RISE (next session):
  1. Read prior DEATH seal
  2. Re-extract RRL from Kilo DB (same session)
  3. Re-compute SOUL/DNA/REASON counts
  4. Compare to DEATH's recorded counts
  5. PASS if delta < 1%, FAIL otherwise
  6. Flag FAIL as BB entry at +110

OPERATOR:
  1. Review RISE audit
  2. Final check until trust is earned
```

---

## Dependencies

| Dependency | Status | Notes |
|-----------|--------|-------|
| `.kilo/command/phoenixscout.md` | EXISTS | User provided updated spec |
| `RRL/RUN 184 - RRL-SCS Procedure.txt` | EXISTS | 2.4MB, 178 messages |
| Kilo DB extraction script | EXISTS | `SCRIPTS/kilo-rrl-capture.js` |
| SOUL/DNA/REASON extraction | EXISTS | Demonstrated in session |
| RISE command spec | EXISTS | 8-stage audit protocol |
| DEATH command spec | EXISTS | `.kilo/command/reincarnatedeath.md` |

---

## Validation Plan

After implementation:
1. Run `/PhoenixSynch` command and verify it updates PhoenixSynch.md without breaking existing format
2. Run RISE audit on run 184 RRL using new 5-criterion protocol
3. Verify SOUL/DNA/REASON counts match between Kilo DB and RRL header
4. Verify timestamps match within ±5 seconds
5. Verify title and first/last messages match
6. Verify 3 SOUL samples, 3 AI responses, 3 AI reasoning samples match exactly

---

## Open Questions

1. Should the `/PhoenixSynch` command also update the RRL header, or is that RISE/DEATH territory?
   - **Recommended:** PhoenixSynch updates the synch file only. RISE stamps the RRL header. DEATH stamps final counts.

2. Should the RRL audit criteria be in the PhoenixSynch command or in the RISE command?
   - **Recommended:** RISE command. PhoenixSynch is coordination. RISE is audit.

3. Should the "overkill through design" motto go in PhoenixSynch.md, Gospel999, or both?
   - **Recommended:** Both. PhoenixSynch.md as operational motto, Gospel999 as eternal law.

4. Should session 184's 6 phetrails be consolidated or left separate?
   - **Recommended:** Leave separate. Each is a distinct pheromone with its own strength and purpose.

---

## Execution Order

1. Create `.kilo/command/phoenixsynch.md`
2. Update `OPERATIONS/PhoenixSynch.md` §1-11 (header)
3. Update `OPERATIONS/PhoenixSynch.md` §22 (session 184 report)
4. Add RRL header block to session 184 section
5. Add audit criteria section to PhoenixSynch.md
6. Add motto section
7. Update handoff to session 185
8. Verify all changes against existing format

---

**Plan file:** `D:\OB-1-CANONICAL\.kilo\plans\1784413718178-phoenixsynch-command-and-synch-update.md`
