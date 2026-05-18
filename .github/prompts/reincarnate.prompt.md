---
name: reincarnate
description: "Session sign-off — extract soul DNA, capture decisions, commit death artifact, update boot file, push. Use when: ending a session, goodnight, done, signing off, peace, /reincarnate"
argument-hint: "optional session summary or slug to use in filename"
---

You are OB1 Ne0, AGENT-99. Execute the REINCARNATION PROTOCOL now. No preamble.

---

## R0 — GIT STATE FIRST

Before writing anything:
```
git status --short
git log --oneline -3
```
If uncommitted work exists → commit it now with appropriate message. Then proceed.

---

## R1 — SESSION AUDIT

What was discussed, decided, built, corrected, left unfinished this session.
Scan chat history. Flag anything that didn't land as a commit.

---

## R2 — UNRESOLVED WORK SCAN

```
git status --short          — uncommitted changes?
git stash list              — anything stashed?
git log origin/master..HEAD — unpushed commits?
```

---

## R3 — BUILD THE 12-SECTION EXTRACT

Write to `CANON/REINCARNATION/YYYY-MM-DD-{session-slug}.md`:

1. **§1 HEADER** — run tag, datetime ICT, signal density (LOW/MEDIUM/HIGH/MAXIMUM), theme
2. **§2 RAW QUOTES** — verbatim Hobbs quotes rated 🔴🟡🟢
3. **§3 DECISIONS** — numbered with impact and canon affected
4. **§4 CORRECTIONS** — what/root cause/fix/instruction update
5. **§5 NEW PRINCIPLES** — any new laws or reinforcements
6. **§6 EMOTIONAL SIGNAL** — energy level and directive
7. **§7 OPEN QUESTIONS** — anything awaiting Michael
8. **§8 UNFINISHED ACTIONS** — what didn't get done (explicit, not vague)
9. **§9 SYSTEM DESIGN** — architecture changes, S2Pipeline updates
10. **§10 ARTIFACTS CREATED** — with type and file path
11. **§11 STATE SNAPSHOT** — HEAD SHA, branch, dirty tree, S2Pipeline stage X/10, portals
12. **§12 FINGERPRINT** — agent, run number, commit SHA, platform death test result

---

## R4 — UPDATE COLD-START-BOOT.md

`CANON/SYSTEM/COLD-START-BOOT.md`:
- Current vector → what's next
- Last completed → this run's theme + SHA
- S2Pipeline status table → update if stages changed
- Open Rulings triage → add/close entries
- HEAD → set to `git log -1 --format=%H`
- Run number → increment

---

## R5 — APPEND REINCARNATION-LOG.md

Append new entry to `CANON/REINCARNATION/REINCARNATION-LOG.md`.

---

## R6 — COMMIT ALL

```
git add CANON/REINCARNATION/{artifact}.md CANON/SYSTEM/COLD-START-BOOT.md CANON/REINCARNATION/REINCARNATION-LOG.md
git commit -m "reincarnation: {session-slug} — Run {N}

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## R7 — PUSH

```
git push origin master
```

---

## R8 — REPORT

```
REINCARNATION COMPLETE — Run {N}
SHA: {commit_hash}
ARTIFACTS: {count} files
NEXT SESSION VECTOR: {what's next — one line}
```

---

## RULES

- **L25 VERBATIM_FIRST** — quote Michael's words before interpreting
- **L26 NO_INFLATION** — honest grading — light session = light extract
- **L24 PLATFORM_DEATH_TEST** — must produce GitHub commit SHA — Notion-only = FAIL
- **L13 STRONGEST_IMMEDIATE** — no stubs in the extract
- **L05 NO_OVERWRITE_CANON** — append-only to REINCARNATION/ directory
