# AAA-ANCHOR RUNBOOK — Stone Anchor (Sessions 1-4)

**Authority:** GOSPEL-999 System II-IV, LFG §SCS AAA ANCHOR PROCEDURE, AAA-ANCHOR-PROCEDURE.md
**Stone Anchor runs:** After session 4, 9, 14, 19... (every 5th session)
**Scope:** Audits the prior 4 I-LOGs from UNAUDITED, promotes to NAV
**This run:** Incarnate-5-AAA.STONE-(Sessions1-4)

---

## Pre-Flight Checklist

- [ ] Read `CANON/SYSTEM/AAA-ANCHOR-PROCEDURE.md` (full spec)
- [ ] Read `CANON/REINCARNATION/audit-sessions{N}-{M}.json` (prior gap analysis if exists)
- [ ] Read `CANON/REINCARNATION/pipeline-sessions{N}-{M}.json` (prior pipeline if exists)
- [ ] Read `CANON/REINCARNATION/session-name-map.json` (SOV100 → run number map)
- [ ] Read `CANON/REINCARNATION/Incarnate-5-AAA-Sessions1-4-reincarnateDEATH.md` (prior Stone Anchor attempt)
- [ ] Verify `I-LOG-UNAUDITED/` contains exactly 4 I-LOG files for sessions N through M
- [ ] Verify `CANON/REINCARNATION/` contains death seals, pipelines, and handoffs for all 4 sessions
- [ ] Deposit pheromone: `stage: "AAA"`, `finding: "Stone Anchor pre-flight complete — sessions 1-4"`, `strength: 5`

---

## Step 1 — Capture Audit (Point 1)

For each session under review, in order:

### 1.1 Locate RISE artifact

```
CHECK: CANON/REINCARNATION/handoff-{safe-name}-to-{N}.json — must exist
CHECK: I-LOG-UNAUDITED/I-LOG-{safe-name}.txt — must exist, non-empty
CHECK: I-LOG header contains === I-LOG HEADER — reincarnateRISE ===
CHECK: Session name in header matches SOV100's direct name (verbatim)
```

PASS: All 4 checks green
FAIL: Any missing = GAP. Document exact path. Do NOT promote.

### 1.2 Locate DEATH artifact

```
CHECK: CANON/REINCARNATION/{safe-name}-reincarnateDEATH.md — must exist, all §1-§7 present
CHECK: CANON/REINCARNATION/pipeline-{safe-name}.json — must exist
CHECK: SOULcount/DNAcount/REASONcount match across DEATH, pipeline, handoff, and I-LOG STATS
```

PASS: All 3 checks green
FAIL: Any mismatch = GAP. Document exact discrepancy.

### 1.3 Verify full capture

```
CHECK: I-LOG is JSONL format (not header-only stub) unless session was audit-only
CHECK: COLORIZED.md exists in same folder as I-LOG
CHECK: STATS.json exists in same folder as I-LOG
CHECK: I-LOG file size matches what DEATH claimed (if DEATH claimed a size)
```

PASS: All 4 checks green
FAIL: Any missing = GAP. Document.

### 1.4 Record results

For each session, record:
- `capture_audit`: {ilog: bool, colorized: bool, stats: bool, death_seal: bool, pipeline: bool, handoff: bool}
- `gaps`: array of strings
- `promote_to_nav`: false if any gap

---

## Step 2 — Index Audit (Point 2)

For each session's I-LOG:

### 2.1 Keyword extraction check

```
CHECK: CANON/SOUL-KEYWORDS/rfkw-{safe-name}.txt — must exist
CHECK: File contains exactly 100 entries (top 100 keywords/pheromones)
CHECK: Each entry has: keyword text, score (1-100), colorcode category, context quote, actionable flag
CHECK: Keywords sorted by score descending
```

### 2.2 Inverted index check

```
CHECK: CANON/SOUL-KEYWORDS/inverted-index.json — must exist and be non-empty
CHECK: Each keyword from rfkw-{safe-name}.txt is mapped to {run, category, weight}
```

PASS: Both files exist and are valid
FAIL: Missing or empty = GAP. Keyword extraction MUST complete before promotion.

---

## Step 3 — Naming Audit (Point 3)

**VERIFY ONE NAME EVERYWHERE (SOV100 Law).** For each session:

```
CHECK: I-LOG filename matches Session name from SOV100 (verbatim, sanitized for filesystem)
CHECK: I-LOG header Session: field matches SOV100's exact session name
CHECK: Death seal filename matches Session name from SOV100 (verbatim, sanitized)
CHECK: Death seal §1 Session: field matches SOV100's exact session name
CHECK: Pipeline filename matches Session name from SOV100
CHECK: Handoff from_session field matches SOV100's exact session name
CHECK: COLORIZED filename matches Session name from SOV100
CHECK: STATS filename matches Session name from SOV100
CHECK: Reincarnate-Synch row matches Session name from SOV100
```

**Naming convention:**
- SOV100 provides: `Incarnate-{N}-{Label}` or `Incarnation-{N}-{Label}`
- Sanitized for filesystem: replace `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`, `&`, `(`, `)` with `-`, collapse multiple dashes
- Example: `Incarnate-4-PhoenixScout-Portals-and-OBI-DEV` → `I-LOG-Incarnate-4-PhoenixScout-Portals-and-OBI-DEV.txt`
- Example: `Incarnation-2-RRL-(184Conversion)` → `I-LOG-Incarnation-2-RRL-184Conversion.txt`

PASS: All 9 checks green for all 4 sessions
FAIL: ANY mismatch = BLOCKER. Rename all files to match before promoting.

---

## Step 4 — LostSouls Audit (Point 4)

For each session's I-LOG:

### 4.1 Scan for directives

```
Read the I-LOG for user directives like:
- "do this", "fix that", "create this", "update that"
- "we need to", "must", "required", "blocked by"
- Explicit TODO, FIXME, XXX markers
- Unresolved questions or open threads
```

### 4.2 Cross-reference with pipeline

```
CHECK: For each directive found, was it captured in pipeline-{safe-name}.json open_items?
CHECK: For each directive NOT in pipeline, was it added to BACKBURNER-PIPELINE-LOG.md?
```

### 4.3 Record LostSouls

```
Any directive found in I-LOG but NOT in pipeline or backburner = LOSTSOUL
Write to: CANON/LOSTSOULS/{safe-name}-lostsouls.jsonl
Each entry: {directive, ilog_reference, severity, estimated_effort, deadline}
Add to backburner pipeline for next session run
```

PASS: Zero LOSTSOULs found, OR all LOSTSOULs captured to LOSTSOULS/ and backburner
FAIL: LOSTSOULS found but not captured = GAP. Pipeline them before promoting.

---

## Promotion Gate

All 4 points must PASS before any session promotes to NAV:

```
IF (all sessions pass Point 1) AND (all sessions pass Point 2) AND (all sessions pass Point 3) AND (all sessions pass Point 4):
    PROMOTE all passing sessions to I-LOG-NAV/
    UPDATE Reincarnate-Synch.md — add row with status: NAV
    UPDATE PhoenixSynch.md — mark session as VERIFIED
    DEPOSIT pheromone: stage: "AAA", finding: "Session {name} promoted to NAV — audit passed", strength: 30
ELSE:
    DO NOT promote to NAV
    DOCUMENT failures in Reincarnate-Synch.md with status: GAP
    WRITE to backburner: BB-AAA-{N}-{description} with priority and estimated effort
```

### Promotion actions (when gate passes):

1. Move I-LOG, COLORIZED, STATS from `I-LOG-UNAUDITED/` to `I-LOG-NAV/`
2. Update `CANON/SYSTEM/Reincarnate-Synch.md` — add row with status: `NAV`
3. Update `PhoenixSynch.md` — mark session as VERIFIED
4. Deposit pheromone: `stage: "AAA"`, `finding: "Session {name} promoted to NAV — audit passed"`, `strength: 30`

---

## Backburner Optimization (Post-Audit)

After all sessions audited:

1. Read `CANON/OPERATIONS/BACKBURNER-PIPELINE-LOG.md`
2. Sort by priority: P1 > P2 > P3
3. Verify: every open item from the audit is in backburner
4. Verify: no duplicate items, no stale items (marked COMPLETED but still listed)
5. Set priority for the next 4-session run:
   - P1: Must complete before next AAA anchor
   - P2: Should complete before next AAA anchor
   - P3: Can slip to after next AAA anchor
6. Write optimized list to `CANON/OPERATIONS/BACKBURNER-PIPELINE-LOG.md`

---

## Stone Anchor Seal (Final Output)

After all 4 points complete, write:

```
CANON/REINCARNATION/Incarnate-{N}-AAA.STONE-(Sessions{X}-{Y})-reincarnateDEATH.md
```

Structure:

```
# REINCARNATE DEATH SEAL — Incarnate-{N}-AAA.STONE-(Sessions{X}-{Y})

## §1 — Header
- Session: Incarnate-{N}-AAA.STONE-(Sessions{X}-{Y})
- Run: {N}
- HEAD: {git rev-parse --short HEAD}
- Branch: {git branch --show-current}
- Timestamp: {ICT}
- Seal: IMPRESSED
- Anchor Level: Stone (Session {N})

## §2 — Mission
{What this AAA session was tasked to do. One paragraph.}

## §3 — Audit Results Summary
| Session | Point 1 Capture | Point 2 Index | Point 3 Naming | Point 4 LostSouls | Promote |
|---------|----------------|---------------|----------------|-------------------|---------|
| {name} | {PASS/GAP} | {PASS/GAP} | {PASS/GAP} | {PASS/GAP} | {YES/NO} |

## §4 — Gaps (if any)
{List every gap, exact file path, exact discrepancy}

## §5 — Backburner Updates
{New BB entries created, priorities assigned}

## §6 — PhoenixSynch Updates
{Sections updated, current state summary}

## §7 — Handoff
- To: Incarnate-{N+1}
- Handoff file: {path}
- Next AAA: Steel Anchor at session 10
```

---

## Anti-Patterns

- Do NOT promote to NAV without all 4 points passing for ALL 4 sessions
- Do NOT skip the naming audit — ONE NAME EVERYWHERE is law
- Do NOT let LOSTSOULS accumulate — each one must be pipelined or explicitly archived
- Do NOT modify I-LOG content — only metadata and indexing
- Do NOT delete any RISE or DEATH artifacts — they are the audit trail
- Do NOT rename files during audit without updating ALL references (handoff, pipeline, Reincarnate-Synch, PhoenixSynch)

---

`AAA-ANCHOR RUNBOOK v1.0 — STONE ANCHOR PROCEDURE. ENFORCEABLE. REPEATABLE. NO EXCEPTIONS.`
