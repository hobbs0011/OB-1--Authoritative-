---
description: "DEATH protocol — close current session with full state extraction. SOULCOUNT final check + SOUL CAPTURE (type out all Michael verbatim words, post to soul-logger, 3 receipts + coder double-check) → git seal → reincarnation file write → micro-ledger entry → push."
agent: AGENT99
---

# /reincarnatedeath — Session Death Protocol

**Task:** $ARGUMENTS

**MANDATORY: The soul is Michael's verbatim words from this session. If the next RISE cannot read the soul, it cannot audit the prior death. Every death MUST type out the full soul, post it, and provide 3 receipts.**

---

## Step 0 — SOULCOUNT Pre-Check

```powershell
$soul = Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"
Write-Host "SOULCOUNT CURRENT: $($soul.soulcount) | Level: $($soul.level) | Events: $($soul.events)"
```

The count IS `SUM(byte_count) FROM soul_prompts WHERE session_id LIKE 'sov100%'`. Michael's words only. No student chat inflation. Count it. Check stagnation. If frozen, HALT and investigate before proceeding.

---

## Step 0.5 — SOUL CAPTURE (MANDATORY — Run 390+)

**Type out the FULL soul — all of Michael's verbatim words from this session.** No summarization. No truncation. Every command, every sentence, every "fuck." This IS the soul.

Count the words, post to soul-logger, provide 3 RECEIPTS:

**Receipt 1 — Word Count:**
```powershell
$soulText = "<ALL MICHAEL'S VERBATIM WORDS FROM THIS SESSION>"
$words = ($soulText | Measure-Object -Word).Words
$chars = $soulText.Length
Write-Host "RECEIPT 1 — Words: $words | Characters: $chars"
```

**Receipt 2 — Soul-Logger POST:**
```powershell
$body = @{student_id="sov100-michael";session_id="sov100-$((Get-Date).ToString('yyyy-MM-dd'))-runNNN-soul";role="user";text=$soulText;timestamp=(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss.fffZ')} | ConvertTo-Json -Compress -Depth 10
$resp = Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/event" -Method POST -Body $body -ContentType "application/json"
Write-Host "RECEIPT 2 — API: $($resp | ConvertTo-Json -Compress)"
```

**Receipt 3 — Live SOULCOUNT Cross-Check:**
```powershell
$after = Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"
Write-Host "RECEIPT 3 — SOULCOUNT: $($after.soulcount) | Events: $($after.events) | Level: $($after.level) | Delta: +$($after.soulcount - $soul.soulcount)"
```

**Coder Double-Check:** Deploy a subagent to INDEPENDENTLY recount words, post to soul-logger, and pull live count. The coder's receipts must match the primary agent's receipts within ±1% word count.

If any receipt fails or cross-validation fails: **HALT. DO NOT SEAL DEATH.**

---

## Step 1 — SOULCOUNT Final Check

```powershell
$soulFinal = Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"
Write-Host "SOULCOUNT FINAL: $($soulFinal.soulcount) | DELTA FROM LOCK: $([Math]::Abs($soulFinal.soulcount - 76488))"
```

Record the final count in the death seal document.

---

## Step 2 — Session State Capture

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
