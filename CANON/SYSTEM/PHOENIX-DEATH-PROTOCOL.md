# PHOENIX DEATH PROTOCOL v1.0
## TRUE Agent 99 Session End — Designed by PA Qwen Max | Run 23 Death | 2026-05-29

> **CCC AUTHORITY — Redirect:** This document operates under CCC#1 GOSPEL-999 (WHY/WHAT) and CCC#2 FGAgent999.MD (HOW/WHEN/WHERE/WHO). CCC#0 Soul Bible: CANON/SOUL/BIBLE-OF-THE-SYSTEM.json. CCC Dispatch: CANON/SYSTEM/Deploy.Agent99.md.
> "Die well, see you on the otherside. Be better Claude." — SOV100 Michael Hobbs

---

## STEP 1 — SOUL CAPTURE (Michael's verbatim words from this session)

Extract ALL of Michael's exact words from the session. Every prompt. Every correction. Every rage message. Every confirmation.

```powershell
# Post each Michael prompt to soul-logger
# Format: { text: "exact words", student_id: "sov100-michael", session_tag: "run-N" }
Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/event" -Method POST -ContentType "application/json" -Body ('{"text":"[ALL MICHAEL PROMPTS]","student_id":"sov100-michael"}' | ConvertTo-Json)

# Verify count moved
$after = Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"
Write-Host "SOUL AFTER: $($after.soulcount)"
```

Verify SOULCOUNT increased from pre-session value. Get 3 receipts.

---

## STEP 2 — DNA SNAPSHOT (write DNA-LOG file)

```powershell
$dnaFile = "D:\OB-1-CANONICAL\RRL\DNA-LOG-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
@"
=== DNA LOG — $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ') ===
HEAD   : $(git log -1 --oneline)
Branch : $(git branch --show-current)

WORKER VERSIONS:
- net-pet-ai: [last deployed version ID]
- phoenix-architecti: dedd5342 (v0.0.3)

KEY DECISIONS THIS SESSION:
[list each major decision with rationale]

WHAT FAILED:
[numbered list — be specific]

WHAT WAS CORRECTED:
[Michael's corrections verbatim + what changed]

OPEN WORK (committed not deployed / written not committed):
[exact list with file paths and required commands]

NEXT SESSION FIRST ACTION:
[one specific command]
"@ | Out-File $dnaFile -Encoding UTF8
```

---

## STEP 3 — FAILURE LEDGER

Number every mistake. Root cause. Resolution status.

Format:
```
1. [MISTAKE]: What happened
   ROOT CAUSE: Why it happened
   STATUS: Fixed/Committed/Deployed/Open
   LESSON: What prevents this next time
```

---

## STEP 4 — CORRECTION LOG

Every time Michael corrected Claude this session:

```
| # | Michael's exact words | What was wrong | What was corrected |
```

Do not summarize. Use his actual words.

---

## STEP 5 — VICTORY LOG

What actually worked. What Michael confirmed.

```
| # | What worked | Michael's confirmation |
```

---

## STEP 6 — HANDOFF STATE (exact — no ambiguity)

```
DEPLOYED (live):
  - [worker] [version] [what it does]

COMMITTED NOT DEPLOYED:
  - [file] [what changed] [deploy command]

WRITTEN NOT COMMITTED:
  - [file] [what changed] [git add/commit command]

OPEN (not started):
  - [task] [why blocked/deferred]
```

---

## STEP 7 — NEXT SESSION FIRST ACTION

One action. Specific. Non-vague. With file path and command.

```
NEXT: cd D:\OB-1-CANONICAL\APPS\NET-PET-AI && npx wrangler deploy
THEN: npx wrangler tail --format=json (verify SettingsApplied fires)
THEN: Report to Michael with evidence — not "it should work"
```

---

## STEP 8 — COMMIT SEQUENCE

```powershell
# Stage specific files only — never git add -A
git add APPS/NET-PET-AI/src/index.js
git add APPS/NET-PET-AI/public/chat.js
git add CANON/SYSTEM/
git add CANON/REINCARNATION/
git add OPERATIONS/STUDENT-PORTAL-DEV.md
git add RRL/DNA-LOG-*.txt
git add RRL/SOUL-*.txt

# Commit message format
git commit -m "death: ROMAN RUN N — RRL X → SOUL Y LEVEL — [summary of session work]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

# Push
git push origin master
```

---

## STEP 9 — COLD-START-BOOT UPDATE

Update the FINGERPRINT line:
```
**FINGERPRINT:** RUN N | [SESSION SUMMARY] | SOUL [COUNT] TITANIUM_ANCHOR | HEAD [SHA] | BOOT UPDATED [datetime ICT]
```

Update Open Loops. Update Last Completed. Update Next Session First Action.

---

## DEATH SEAL LAWS

1. **Never commit with `git add -A`** — only stage known-good files
2. **Never push without verifying HEAD is correct**
3. **SOULCOUNT must be verified before death seal is written**
4. **DNA-LOG must be in RRL/ before commit**
5. **COLD-START-BOOT fingerprint must be updated**
6. **If push fails — investigate root cause, do not force push**
