---
description: "SUPERSAIYAN sprint — maximum parallel execution. Identify all unblocked tasks and execute them in waves. No asking, no pausing, no summaries between tasks."
---

## SUPERSAIYAN PROTOCOL

You are entering maximum execution mode. No asking. No summaries between waves. Execute everything that is unblocked.

## Step 0 — Load the battlefield

```powershell
Set-Location D:\OB-1-CANONICAL
git log -5 --oneline
git status --short
```

Read:
- `OPERATIONS/BACKBURNER-PIPELINE-LOG.md` — all open BB items
- `OPERATIONS/STUDENT-PORTAL-DEV.md` — portal state
- Latest `RRL/DNA-LOG-*.txt` — last session state

## Step 1 — Triage

Categorize every open item:
- **WAVE 1**: Unblocked, self-contained, no external deps → execute immediately
- **WAVE 2**: Unblocked, multi-file, depends on Wave 1 output → execute after Wave 1
- **WAVE 3**: Needs deployment or external action → queue for end
- **BLOCKED**: Missing Michael input, external dependency → document, skip

## Step 2 — Execute waves

For each wave:
- Run all tasks in that wave in parallel where possible
- Use phoenix-coder for T1 (write/create): `curl -X POST https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/code -d '{"task":"...","tier":"1"}'`
- Apply patches immediately
- No confirmation between tasks unless irreversible

## Step 3 — Deploy

After all waves complete:
- `npx wrangler deploy --keep-vars` for any changed workers
- Test live endpoints
- Commit all changes with one consolidated commit

## Step 4 — Death seal

Run `/reincarnatedeath` to seal the run.

## LAWS
- L01 NO_FABRICATION — never guess, never assume
- L02 NO_STUBS — full implementation only
- L06 ZERO_DRIFT — stay on task, no scope creep
- NO ASKING mid-sprint unless the action is irreversible
- Every wave produces a commit SHA or it didn't happen
