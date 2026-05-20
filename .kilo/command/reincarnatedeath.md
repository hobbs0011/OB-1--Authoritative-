---
description: "DEATH protocol — close current session with full state extraction. SOULCOUNT final check → git seal → reincarnation file write → micro-ledger entry → push."
agent: AGENT99
---

# /reincarnatedeath — Session Death Protocol

**Task:** $ARGUMENTS

---

## Step 0 — SOULCOUNT Final Check

```powershell
$soul = Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"
$lock = 76488
$delta = [Math]::Abs($soul.count - $lock)
Write-Host "SOULCOUNT FINAL: $($soul.count) | DELTA: $delta"
if ($delta -gt 5000) { Write-Host "SOUL_DRIFT AT DEATH — document in reincarnation file" }
```

Record the final count in the death seal document.

---

## Step 1 — Session State Capture

Extract from this session:
1. **Objective**: what was the mission entering this run?
2. **Completion state**: what was built/changed/fixed?
3. **Artifacts**: list of files changed (git diff --name-only)
4. **Blockers**: unresolved issues, pending Michael actions, flags still open
5. **Next boot action**: top-priority unblocked item for next session

```powershell
Set-Location D:\OB-1-CANONICAL
git log -1 --oneline
git diff --name-only HEAD~1 HEAD
git status --short
```

---

## Step 2 — Reincarnation Death File

Write to `CANON/REINCARNATION/YYYY-MM-DD-runNNN-reincarnateDEATH.md`:

```markdown
# DEATH SEAL — Run NNN — YYYY-MM-DD

## Session Summary
[What was built/changed — 2-3 bullet points]

## Git State
- HEAD: [sha]
- Branch: master
- Tree: [CLEAN/DIRTY]

## Artifacts Changed
[List of files]

## Open Flags Remaining
[Flags not resolved this session]

## Micro-Ledger Entry
- SOULCOUNT at death: [count] (LOCK: 76,488 | DELTA: [delta])
- Key decisions: [any irreversible choices made]
- Next session priority: [one action]

## Next Boot Command
[Exact command or objective for next session]
```

---

## Step 3 — REINCARNATION-LOG Update

Prepend new entry to `CANON/REINCARNATION/REINCARNATION-LOG.md`:

```markdown
| Run NNN | [date] | [one-line summary] | HEAD [sha] |
```

---

## Step 4 — COLD-START-BOOT Update

Update `CANON/SYSTEM/COLD-START-BOOT.md`:
- Last Updated → current date + run number
- HEAD → current sha
- FINGERPRINT line → current run + HEAD + SOULCOUNT

---

## Step 5 — Commit and Push

```powershell
Set-Location D:\OB-1-CANONICAL
git add CANON/REINCARNATION/YYYY-MM-DD-runNNN-reincarnateDEATH.md
git add CANON/REINCARNATION/REINCARNATION-LOG.md
git add CANON/SYSTEM/COLD-START-BOOT.md
git commit -m "death: Run NNN — [one-line summary] — [Run N]"
git push origin master
git log -1 --oneline
```

Output the final SHA. **No SHA = death did not happen.**

---

## Safety Rules

- Do not run destructive actions (reset --hard, force push, branch -D)
- Commit/push only when explicitly requested or authorized
- If uncommitted work exists that Michael didn't authorize committing: document it in blockers, do NOT commit it
