---
description: "Session DEATH protocol — seal the run, write reincarnation file, update boot record, commit."
---

## Step 0 — SOULCOUNT Final Check

```powershell
$soul = Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"
Write-Host "SOULCOUNT FINAL: $($soul.soulcount)"
```

Record the final count. This number goes in the death seal.

---

## Step 1 — Session State Capture

```powershell
Set-Location D:\OB-1-CANONICAL
git log -1 --oneline
git diff --name-only HEAD~1 HEAD
git status --short
```

Extract:
1. **Objective**: what was the mission entering this run?
2. **Completion state**: what was built/changed/fixed?
3. **Artifacts**: files changed (from git diff)
4. **Blockers**: unresolved issues, pending Michael actions
5. **Next boot action**: top-priority unblocked item

---

## Step 2 — Write Reincarnation Death File

Write to `CANON/REINCARNATION/YYYY-MM-DD-run[N]-reincarnateDEATH.md`:

```markdown
# DEATH SEAL — Run [N] — YYYY-MM-DD

## Session Summary
[What was built/changed — 2-3 bullet points]

## Git State
- HEAD: [sha]
- Branch: master
- Tree: [CLEAN/DIRTY]

## Artifacts Changed
[List of files from git diff]

## Open Flags Remaining
[Flags not resolved this session]

## Worker State
[Output of curl phoenix-coder /api/status — tier key status]

## Micro-Ledger Entry
- SOULCOUNT at death: [count] | TITANIUM_ANCHOR
- Key decisions: [any irreversible choices made this session]
- Next session priority: [one action]

## Next Boot Command
[Exact command or objective for next session]
```

---

## Step 3 — REINCARNATION-LOG Update

Add entry to `CANON/REINCARNATION/REINCARNATION-LOG.md`:

```
| Run [N] | [date] | [one-line summary] | HEAD [sha] |
```

---

## Step 4 — COLD-START-BOOT Update

Update `CANON/SYSTEM/COLD-START-BOOT.md`:
- FINGERPRINT line → current run + HEAD + SOULCOUNT + date

---

## Step 5 — Commit

```powershell
Set-Location D:\OB-1-CANONICAL
git add CANON/REINCARNATION/ CANON/SYSTEM/COLD-START-BOOT.md
git commit -m "death: Run [N] — [one-line summary] — SOULCOUNT [count] TITANIUM_ANCHOR"
git log -1 --oneline
```

**Output the final SHA. No SHA = death did not happen.**

---

## Safety Rules
- No destructive actions (reset --hard, force push, branch -D)
- Commit only what was worked on this session
- Uncommitted unauthorized work: document in blockers, do NOT commit
