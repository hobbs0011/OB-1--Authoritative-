---
name: reincarnatedeath
description: "Session death protocol: preserve Soul DNA first, then decisions, corrections, and explicit handoff for the next chat."
argument-hint: "optional session slug"
---

# /reincarnatedeath

This protocol is fail-closed and Soul-DNA-first.

## Prime Directives

1. Capture Soul DNA first:
- Verbatim user lines from the current session that carry intent, constraints, emotion, and non-negotiables.
- No paraphrase before capture.
- No polite erasure.

2. If Soul DNA is incomplete, STOP:
- Do not mark reincarnation complete.
- Report the exact missing input needed.

3. Preserve explicit handoff:
- Decisions made (implemented vs open).
- Corrections and root cause.
- Unfinished actions as explicit next steps.

4. Write append-only artifact:
- Create a new file under CANON/REINCARNATION with date + run slug.
- Never overwrite prior reincarnation entries.

5. Stage before claim:
- Work in short stages (discover -> capture -> verify -> append).
- Any stated command outcome must be accompanied by evidence text from actual output.

6. Conflict ledger required:
- Any ambiguity (path mismatch, lane mismatch, missing artifact) must be recorded as REINCARNATION_CONFLICT with owner + next action.

## Required Extract Order

1. Header (run tag, datetime, theme)
2. Raw Soul DNA quotes (verbatim)
3. Decisions
4. Corrections
5. Open questions
6. Unfinished actions
7. State snapshot
8. Artifact list
9. Fingerprint (branch, sha if available)

## Completion Gate

Reincarnation is complete only if:
- Soul DNA section exists and is non-empty.
- Unfinished actions are explicit.
- Append-only artifact is written.
- Evidence is attached for critical operational claims.
- Any open conflict is explicitly listed with next action.
