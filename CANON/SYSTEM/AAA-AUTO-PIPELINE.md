# AAA AUTO-PIPELINE PROTOCOL
## SCS (Session Checkpoint System) — Automated pipeline for session processing

---

## MANDATE — PIPELINE EXECUTES, ANCHOR AUDITS

The pipeline is the **workhorse**. The anchor is the **gate**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PIPELINE (CANON/SCRIPTS/workhorse-pipeline.ps1)                           │
│  Role: EXECUTE work                                                         │
│  - Colorize I-LOGs                                                          │
│  - Extract keywords                                                         │
│  - Extract LostSouls                                                         │
│  - Build pipeline JSON + handoff JSON                                       │
│  - Update inverted index                                                    │
│  - Promote artifacts to I-LOG-NAV/                                          │
│                                                                             │
│  The pipeline writes artifacts. It does NOT write audit reports.            │
│  The pipeline does NOT seal. It does NOT audit.                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  ANCHOR (AAA session — e.g. Incarnate-5-AAA.STONE-(Sessions1-4))           │
│  Role: AUDIT, DOCUMENT, SEAL                                                │
│  - Verify pipeline outputs are complete and consistent                       │
│  - Run 4-point audit (Capture / Index / Naming / LostSouls)                 │
│  - Write audit report and death seal                                        │
│  - Document gaps without fixing them                                         │
│  - Seal the checkpoint                                                      │
│                                                                             │
│  The anchor is READ-ONLY. It does NOT execute pipeline scripts.             │
│  The anchor does NOT generate missing artifacts.                             │
│  Any fix required = backburner entry. Always.                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The anchor NEVER executes the pipeline. The pipeline NEVER writes an audit report.**

If an agent is doing both, the system has collapsed. Stop. Reassign.

---

## CORE DOCTRINE

**Pipeline executes. Anchor audits. They are SEPARATE.**

The pipeline is the WORKHORSE. The anchor is the GATE. They are never the same agent.

```
PIPELINE (workhorse):    Executes → colorize → extract keywords → extract lostsouls → build pipeline JSON
ANCHOR (AAA session):   Audits → verifies completeness → checks consistency → seals → promotes to NAV
```

**The anchor does NOT touch pipeline scripts.**
**The pipeline does NOT write audit reports.**

Every SCS checkpoint must end in exactly one of two states:
1. **EXECUTION** — Work was performed: code written, files created, deployments made
2. **PIPELINE** — Work was deferred: directive captured in pipeline JSON, added to backburner

No checkpoint ends in a void. No directive passes through unexecuted OR unpipelined. That is how LostSouls are born.

### PRIMARY MANDATE — NO LOST SOULS

The entire anchor system exists for ONE purpose: **ensure no SOUL is lost between sessions.**
SOUL = Michael's exact words, directives, and intent.
A LostSoul = any directive, instruction, or work item from any session checkpoint that was NOT captured in the pipeline, handoff, or backburner.

The anchor is the **final impassable checkpoint** before a session is promoted to I-LOG-NAV. No session passes without zero LostSouls.

**The anchor does NOT execute pipelines. The anchor does NOT fix gaps. The anchor does NOT generate missing artifacts.**
**The anchor AUDITS, DOCUMENTS, and SEALS. Any fix = backburner. Always.**
**The anchor is READ-ONLY. It audits. It does not build.**

---

### PROTOCOL FLOW

```
SCS = RISE → SCOUT → FORCΞ MARCH → SOUL SCHOLARS → SUPPLY LINES → ENGINEER LEGIONNAIRE → DEATH → RISE
                                                                        ↓
                                                               CANON/SCRIPTS/workhorse-pipeline.ps1
```

### AUTOMATED PROCESS (WORKHORSE PIPELINE)

**Invocation:**
```powershell
powershell -ExecutionPolicy Bypass -File CANON/SCRIPTS/pipeline-health-check.ps1
# Only proceed if all FAILURES resolved

powershell -ExecutionPolicy Bypass -File CANON/SCRIPTS/workhorse-pipeline.ps1 `
    -SessionName "Incarnate-X-SessionName" `
    -ILogPath "I-LOG-UNAUDITED/I-LOG-Incarnate-X-SessionName.txt" `
    -PromoteToNav
```

### PIPELINE STAGES (5 automated steps)

| Step | Script | Output | Gate |
|------|--------|--------|------|
| 1 | `rrl-colorize.ps1 -InputFile <ILOG>` | COLORIZED.md + STATS.json | I-LOG must be valid JSONL |
| 2 | `extract-keywords.ps1 -StatsFile <STATS>` | rfkw-{session}.txt | STATS must have top_topics |
| 3 | `extract-lostsouls.ps1 -ILogFile <ILOG>` | lostsouls-{session}.md | I-LOG must have user messages |
| 4 | Manual: pipeline JSON creation | pipeline-{session}.json | Steps 1-3 complete |
| 5 | `update-inverted-index.ps1` | inverted-index.json updated | Step 2 complete |

### ERROR HANDLING

| Condition | Action | Severity |
|-----------|--------|----------|
| I-LOG is stub (< 100 bytes) | Skip to manual review. Set `ilog_is_stub: true` in audit | BLOCKING |
| COLORIZE fails | Check I-LOG is valid JSONL. If not JSONL, mark as stub | WARNING |
| Keywords extraction returns < 5 | Session has low signal. Accept as-is with note | ACCEPTED |
| LostSouls returns 0 | Mark as empty; session had no directives | ACCEPTED |
| Pipeline JSON exists | Overwrite only if `-Force` flag is used. Otherwise skip | SKIP |

### PROMOTION GATE (I-LOG-NAV/)

A session promotes to I-LOG-NAV/ when ALL of:
1. I-LOG is REAL (not stub, > 100KB)
2. COLORIZED.md exists (> 1KB)
3. STATS.json exists (> 1KB)
4. rfkw-{session}.txt exists (> 100 bytes)
5. lostsouls-{session}.md exists (can be empty)
6. pipeline-{session}.json exists
7. audit JSON updated reflecting state

Use `workhorse-pipeline.ps1 -PromoteToNav` to auto-promote.

### BACKBURNER INTEGRATION

After each session processed:
1. Update `BACKBURNER-PIPELINE-LOG.md` with completion status
2. Remove resolved BB entries
3. Add any new BB items discovered during processing

### FAIL-SAFES

1. **Health check must pass** before ANY pipeline work
2. **I-LOG-NAV/ is the single source of truth** for promoted sessions
3. **Pipeline versioning**: Each pipeline JSON has a timestamp
4. **No delete**: Never delete a pipeline artifact. Use `deprecated: true` flag
5. **Stale session detection**: If a session's I-LOG hasn't been modified in 30 days, flag it

### LIFECYCLE (Pipeline Execution vs Anchor Audit)

| Stage | Actor | Condition | Action |
|-------|-------|-----------|--------|
| RAW | Pipeline | Session just completed, no artifacts | Create I-LOG in I-LOG-UNAUDITED/ |
| PROCESSED | Pipeline | All 5 pipeline steps complete | Promote dataset to ready state |
| AUDITED | Anchor | Audit confirms promotion gate | Write audit report, seal |
| SEALED | Anchor + Operator | Death seal written and committed | Record in Reincarnate-Synch |
| NAV | Operator (per Anchor instruction) | All 4 points pass | Move to I-LOG-NAV/ |
| ARCHIVED | Pipeline | Session is 60+ days old | Move I-LOG to I-LOG-OLD/ |

**Pipeline Execution = artifact generation. Anchor Audit = verification + sealing.**

The pipeline produces: COLORIZED.md, STATS.json, rfkw-{session}.txt, lostsouls-{session}.md, pipeline-{session}.json, handoff-{session}.json.

The anchor produces: audit-sessions{N}-{M}.json, death seal, backburner entries, Reincarnate-Synch updates.

**These outputs never mix. Never.**

---

## SCS CHECKPOINT CLOSURE RULE
1. **EXECUTION** — the work item was done (code written, artifact generated, fix applied)
2. **PIPELINE** — the work item was captured (added to pipeline JSON open_items, backburner entry created)

**No other end state is valid. A checkpoint that closes without execution OR pipeline = LostSoul.**