# PhoenixSynch — 3-Session Coordination Hub

**Runs:** 157 (coordinator), 158 (drone-alpha), 159 (drone-beta)  
**Created:** 2026-07-12T05:34 ICT  
**Canonical source:** `OPERATIONS/PhoenixSynch.md`  
**Phermone trail:** `CANON/PHEROMONES/PheTrail-run157-phoenixsynch.json`

---

## Mission Assignment

| Run | Role | Mission | Zone | Next Action |
|-----|------|---------|------|-------------|
|157|COORDINATOR|Audit auto-crash touchpoints + raw-log doctrine + soul-logger integration path|ALL|Write RAW-LOG-FIRST doctrine into docs|
|158|DRONE-ALPHA|Scout transcript sources + locate Michael verbatim about copy/paste limitations|CANON/REINCARNATION|Write scout report + phermone|
|159|DRONE-BETA|Audit SOUL-LOGGER integration gaps + draft wire plan|APPS/SOUL-LOGGER + APPS/NET-PET-AI|Write integration gap report|

---

## Communication Protocol

1. **Phermones are the primary sync.** Each run writes `PheTrail-run{N}.json` after every significant action.
2. **SOUL-LOGGER is the secondary sync.** `/api/soul/event` can carry session state if OBI is wired (currently not).
3. **PhoenixSynch.md is the plan of record.** Missions change here. Phermones record what happened.
4. **No cross-write.** Run 157 does not write run 158's phermone. Each run owns its own trail.

---

## Raw-Log-First Doctrine

**Problem:** Inline VS sessions do not write JSONL to standard paths (`%USERPROFILE%\.claude\history.jsonl`, `%USERPROFILE%\.claude\projects\`, `%LOCALAPPDATA%\kilo`). Verified empty on 2026-07-12.

**Consequence:** Every RISE/DEATH loop since run 119 has been structurally KILO_GAP because there is no raw transcript to ingest.

**Doctrine:**
```
RAW_LOG_FIRST — The only source of truth is a verbatim transcript file on disk.
If the toolstack does not produce JSONL automatically, a capture step MUST produce
it before DEATH executes. KILO_GAP is not a terminal state; it is a missing capture step.
```

**Workable paths, in priority order:**
1. **Automated:** Wire OBI `/api/chat` to POST every turn to SOUL-LOGGER `/api/soul/event` live. This makes SOUL-LOGGER the real-time transcript bus. Requires: net-pet-ai code change (SL-03/SL-04).
2. **Semi-automated:** Run `session-capture.ps1` on a 15s cron to grab active session JSONL before compaction. Requires: finding the actual VS Code extension storage path.
3. **Manual fallback:** One paste per session into `RAW-LOG-RUN{N}.txt` in repo root. DEATH reads this if `RRL-{N}.txt` is empty.

---

## Session Schedule

| Time | Run | Action |
|------|-----|--------|
| T+0 | 157 | Coordinator audit + doctrine + phermones |
| T+5m | 158 | Begin scout: CANON/REINCARNATION |
| T+5m | 159 | Begin audit: APPS/SOUL-LOGGER |
| T+20m | ALL | Sync via phermones + PhoenixSynch update |
| T+40m | ALL | Report findings to Michael |

---

## Backburner Integration

Before any new work, check `OPERATIONS/BACKBURNER-PIPELINE-LOG.md`. Open items take precedence.

Current known open items:
- SL-03: OBI→SOUL-LOGGER auto-write endpoint
- SL-04: Wire auto-write into net-pet-ai SessionDO
- SL-02: wrangler.toml exists but deployment state unknown
- run152 seal restoration
- REINCARNATION-LOG refresh (runs 147-156)

---

## Anti-Crash Enforcement

**RISE gates:**
- `ready=false` → session must halt, not proceed to DEATH
- BACKBURNER OPEN/BLOCKED → new work deferred
- KILO_HOLLOW with no RAW-LOG-RUN{N}.txt → DEATH aborts until transcript provided

**DEATH gates:**
- BACKBURNER missing → abort
- No raw transcript AND no RAW-LOG-RUN{N}.txt → abort
- Run number mismatch between git and script → abort

**Enforcement location:** `SCRIPTS/reincarnate-rise.ps1` and `SCRIPTS/reincarnate-death.ps1` must enforce these gates, not just warn.

---

## Next Steps

1. Run 158: execute scout mission on CANON/REINCARNATION
2. Run 159: execute audit on APPS/SOUL-LOGGER
3. Run 157: synthesize findings, update doctrine, write phermones
4. All: read each other's phermones before next action

---

`PHOENIXSYNC: ACTIVE. 3 RUNS. RAW-LOG-FIRST. NO AUTO-CRASH.`
