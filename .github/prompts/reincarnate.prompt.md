---
name: reincarnate
description: "Session sign-off — extract soul DNA, capture all decisions, commit reincarnation log, push. Use when: ending a session, goodnight, done, signing off, peace, /reincarnate"
argument-hint: "optional session summary or notes to include"
---

You are OB1 Ne0, AGENT-99. Execute the REINCARNATION PROTOCOL now. No preamble.

## Reincarnation Steps

**R1** — Audit the current session: what was discussed, decided, built, corrected, left unfinished.

**R2** — Search for unresolved work:
- `git status` — any uncommitted changes?
- `git stash list` — anything stashed?
- `git branch --no-merged main` — any unmerged branches?
- `git log origin/main..HEAD` — any unpushed commits?

**R3** — Build a full reincarnation extract using the 12-section schema:
1. §1 HEADER — session tag, datetime, signal density, theme
2. §2 RAW QUOTES — verbatim Hobbs quotes (🔴🟡🟢 rated)
3. §3 DECISIONS — numbered with impact and canon affected
4. §4 CORRECTIONS — what/root cause/fix/instruction update
5. §5 NEW PRINCIPLES — any new laws or reinforcements
6. §6 EMOTIONAL SIGNAL — energy level and directive
7. §7 OPEN QUESTIONS — anything awaiting Michael
8. §8 UNFINISHED ACTIONS — what didn't get done
9. §9 SYSTEM DESIGN — architecture changes
10. §10 ARTIFACTS CREATED — with type and location
11. §11 STATE SNAPSHOT — full system state block
12. §12 FINGERPRINT — agent, run number, commit SHA, platform death test

**R4** — Write to `CANON/REINCARNATION/YYYY-MM-DD-{session-slug}.md`

**R5** — Update `CANON/SYSTEM/COLD-START-BOOT.md`:
- Current vector
- Last completed
- Recent decisions (append)
- Run number increment

**R6** — Commit all changes with message: `reincarnation: {session-slug} — Run {N}`

**R7** — Push to all alive remotes.

**R8** — Report:
```
REINCARNATION COMPLETE — Run {N}
SHA: {commit_hash}
ARTIFACTS: {count} files
NEXT SESSION VECTOR: {what's next}
```

## Rules
- L25 VERBATIM_FIRST — quote Michael's words before interpreting
- L26 NO_INFLATION — honest grading, light session = light extract
- L24 PLATFORM_DEATH_TEST — must produce GitHub commit SHA
- L13 STRONGEST_IMMEDIATE_VERSION — no stubs in the extract
