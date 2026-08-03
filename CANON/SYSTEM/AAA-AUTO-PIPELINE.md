# AAA AUTO-PIPELINE PROTOCOL
## SCS (Session Checkpoint System) — Automated pipeline for session processing — Stone/Silver/Gold anchors

### PURPOSE
Make SCS session processing inevitable, automatic, and failure-resistant. Any model can pick up and process any session with zero hand-holding.

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

### LIFECYCLE

| Stage | Condition | Action |
|-------|-----------|--------|
| RAW | Session just completed, no artifacts | Create I-LOG in I-LOG-UNAUDITED/ |
| PROCESSED | All 5 pipeline steps complete | Promote to I-LOG-NAV/ |
| AUDITED | Audit JSON confirms promotion gate | Update audit |
| SEALED | Death seal written and committed | Stone/Silver/Gold anchor |
| ARCHIVED | Session is 60+ days old and not in active rotation | Move I-LOG to I-LOG-OLD/ |