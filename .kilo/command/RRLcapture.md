---
description: "Capture current Kilo session transcript from kilo.db and write RRL-{run}.txt. Replaces dead Claude Code session-capture.ps1."
agent: AGENT99
---

# /RRLcapture — Kilo Session Capture

**Captures a Kilo session verbatim and writes `RRL\RRL-{run}.txt`.**

This is the replacement for `SCRIPTS/session-capture.ps1`, which was wired to dead Claude Code `~/.claude/` paths. Kilo stores sessions in SQLite, not JSONL files.

---

## What It Does

1. Resolves `run` from the last death seal commit (`CANON/REINCARNATION/run*-reincarnateDEATH.md`) + 1
2. Finds the Kilo session matching that run:
   - Primary: `kilo.db` (`session`/`message`/`part`)
   - Fallback: `session-export.db` (`event`/`chunk`)
3. Extracts user/assistant turns
4. Formats as `## User` / `## Assistant` transcript
5. Writes to `RRL\RRL-{run}.txt`
6. Prints session ID, message count, turn count, and output path

---

## When to Use

- At session end, before `/reincarnateDeath`
- When `RRL-{run}.txt` is missing or hollow
- When `obi.ps1 doctor` reports RRL gaps
- When backfilling a hollow run from death seal artifacts
- Anytime you need the verbatim session transcript

---

## Quick Invoke

```powershell
# Capture current session as next RRL
/RRLcapture

# Capture specific session by ID
/RRLcapture ses_0a6408b5effeAI9kyUKKwGEqgj

# Backfill a specific run from death seal artifacts
/RRLcapture --run 137
```

---

## Execution

When `/RRLcapture` is invoked:

1. Run `SCRIPTS/kilo-rrl-capture.js` with resolved run and optional session ID.
2. If `--run N` is provided, capture run N; otherwise infer run = last death commit run + 1.
3. The script outputs: session ID, message count, turn count, and output path.
4. Do not recurse back into `/RRLcapture`. The script is the executor.

---

## Run Number Resolution

```powershell
$lastDeath = git log --oneline -1 --grep "^death:" -- "CANON/REINCARNATION/run*-reincarnateDEATH.md"
$run = [int]($lastDeath -replace '^.*Run (\d+).*$', '$1') + 1
```

---

## Session Matching

For a given `run`:

1. Read `CANON/REINCARNATION/run{N}-reincarnateDEATH.md` `TIMESTAMP` field.
2. Search `kilo.db` for a session whose `time_created` is within ±2 hours of the death seal timestamp.
3. If found: extract from `kilo.db` (`message` + `part`).
4. If not found: search `session-export.db` for matching `session_id` by `ts`.
5. If still not found: **KILO_HOLLOW** — reconstruct from death seal + committed artifacts.

---

## KILO_HOLLOW Protocol

When no Kilo session exists for the target run:

1. Read `CANON/REINCARNATION/run{N}-reincarnateDEATH.md`
2. Extract user quotes from `§2 — RAW SOUL DNA`
3. Extract decisions from `§4 — DECISIONS`
4. Reconstruct assistant responses from artifact paths listed in `§11 — ARTIFACTS`
5. Format as `## User` / `## Assistant` transcript
6. Write to `RRL\RRL-{run}.txt`
7. Print `KILO_HOLLOW` warning in session metadata header

---

## Source of Truth

| Source | Location | Priority |
|--------|----------|----------|
| Kilo DB | `C:\Users\mrmic\.local\share\kilo\kilo.db` | 1 (live) |
| Export DB | `C:\Users\mrmic\.local\share\kilo\session-export.db` | 2 (fallback) |
| Death seal | `CANON/REINCARNATION/run{N}-reincarnateDEATH.md` | 3 (KILO_HOLLOW) |
| Artifacts | `.kilo/skills/`, `OPERATIONS/`, `CANON/` | 4 (reconstruction) |
| RRL output | `RRL\RRL-{run}.txt` | committed |

---

## Notes

- **Claude Code is gone.** Do not attempt to use `~/.claude/` paths. They do not exist.
- **No JSONL folder exists.** Kilo does not write session transcripts to disk as JSONL files.
- **The database is the source.** `kilo.db` is the only persistent store for live Kilo sessions.
- **This command is the recorder.** It is the only reliable way to produce an RRL from a Kilo session.
- **Hollow runs happen.** Always check `session-export.db` before declaring KILO_HOLLOW. Some sessions only appear in the export.
- **Death seal is truth.** When reconstructing from KILO_HOLLOW, the death seal §2/§4/§11 are authoritative — do not guess.
