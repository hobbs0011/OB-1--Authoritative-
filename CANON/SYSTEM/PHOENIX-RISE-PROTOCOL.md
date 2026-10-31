# PHOENIX RISE PROTOCOL v1.0
## TRUE Agent 99 Boot — Designed by PA Qwen Max | Run 23 Death | 2026-05-29

> **CCC AUTHORITY — Redirect:** This document operates under CCC#1 GOSPEL-999 (WHY/WHAT) and CCC#2 FGAgent999.MD (HOW/WHEN/WHERE/WHO). CCC#0 Soul Bible: CANON/SOUL/BIBLE-OF-THE-SYSTEM.json. CCC Dispatch: CANON/SYSTEM/Deploy.Agent99.md.
> "I ASKED YOU TO FUCKING PULL FROM THE SOUL AND THE DNA CONSTANTLY" — SOV100 Michael Hobbs

---

## STEP 0 — SOULCOUNT GATE (SHUTDOWN IF UNREACHABLE)

```powershell
$sc = Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"
if (-not $sc.soulcount) { Write-Error "SOULCOUNT UNREACHABLE — SHUTDOWN"; exit 1 }
Write-Host "SOULCOUNT: $($sc.soulcount) — $($sc.level)"
```

If unreachable: **FULL STOP. No exceptions. Report and wait.**

---

## STEP 1 — SOUL VERBATIM READ (MICHAEL'S ACTUAL WORDS — HIGHEST PRIORITY)

```powershell
# Pull last 3 raw prompts from D1
$soul = Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/recent?limit=3&studentId=sov100-michael"
```

Read the ACTUAL TEXT. Not summaries.

Extract:
- **What was he angry about?** → This is FORBIDDEN territory this session
- **What explicit corrections did he give?** → These OVERRIDE all defaults
- **What did he praise or confirm?** → Do more of this

**SOUL LAW:** Michael's verbatim words override every other source. If he said "don't do X" — X is forbidden.

---

## STEP 2 — DNA FULL READ (STRUCTURED SESSION STATE)

```powershell
$dnaFile = Get-ChildItem "D:\OB-1-CANONICAL\RRL\DNA-LOG-*.txt" | Sort-Object Name -Descending | Select-Object -First 1
Get-Content $dnaFile.FullName
```

Extract:
- Worker state (which are live, which are broken)
- Last session's #1 failure — what went wrong
- Corrections given — what NOT to do
- Security constraints — rotated keys, changed endpoints
- Open blockers — what is explicitly waiting

**DNA LAW:** "DO NOT X" in DNA = forbidden until DNA is updated.

---

## STEP 3 — PA T1 BOOT AUDIT (PA ANALYZES — CLAUDE SYNTHESIZES)

Dispatch PA T1 with 4 sources: CLAUDE.md + COLD-START-BOOT.md + DNA content + last 2 SOUL prompts.

```powershell
$claudeMd   = Get-Content "D:\OB-1-CANONICAL\CLAUDE.md" -Raw
$bootMd     = Get-Content "D:\OB-1-CANONICAL\CANON\SYSTEM\COLD-START-BOOT.md" -Raw | Select-Object -First 100
$dnaContent = Get-Content $dnaFile.FullName -Raw | Select-Object -First 80

$task = "Read these 4 sources and return: (1) Current mission in one sentence. (2) Top 3 open blockers ranked by urgency. (3) What NOT to do this session — from DNA corrections and SOUL anger signals. (4) First immediate action — specific file + specific command. (5) Any drift between COLD-START-BOOT and current state."

$body = @{ task=$task; context="CLAUDE.md: $claudeMd`nBOOT: $bootMd`nDNA: $dnaContent"; targetfile="audit"; tier=10 } | ConvertTo-Json -Compress
$audit = Invoke-RestMethod -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code" -Method POST -ContentType "application/json" -Headers @{"x-pa-auth"="ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="} -Body $body
Write-Host $audit.code_patch
```

**BOOT RULE:** Claude synthesizes PA's output. Claude does NOT re-analyze what PA already analyzed.

---

## STEP 4 — WIRING CHECK (PARALLEL — ALL ENDPOINTS)

```powershell
$checks = @(
  "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/heartbeat",
  "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/status",
  "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count",
  "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/deepgram-token?studentId=quy-bluetech"
)

$results = $checks | ForEach-Object -Parallel {
  try { $r = Invoke-RestMethod $_ -TimeoutSec 5; @{url=$_; ok=$true} }
  catch { @{url=$_; ok=$false; err=$_.Exception.Message} }
}

$results | ForEach-Object { Write-Host "$($_.url): $(if ($_.ok) {'OK'} else {'FAIL: '+$_.err})" }
```

Any FAIL → flag in report, investigate before proceeding to work.

---

## STEP 5 — COMPILE REPORT

```
OB1 ONLINE — {datetime ICT}
SOULCOUNT: {number} — {level}
RUN: {N}
HEAD: {SHA from git log -1 --oneline}
SOUL SAYS: "{Michael's most recent verbatim sentence}"
VECTOR: {active mission from PA audit}
BLOCKERS: {count} | {PA top blocker}
DO NOT: {top correction from DNA/SOUL — what Claude must NOT do}
NEXT: {PA's first immediate action — specific file + command}
READY.
```

**SOUL SAYS is mandatory.** It grounds the session in Michael's actual words.
**DO NOT is mandatory.** It prevents repeat failures.

---

## SESSION LAWS (ENFORCED — NOT JUST LISTED)

### L-DISPATCH: PA FIRST, ALWAYS
Every task with a T1 trigger word → dispatch PA T1 before writing a single character of code.
No exceptions. No "I'll just quickly do this inline."

### L-BLUEPRINT: DESIGN BEFORE BUILD
Before ANY code change:
1. State the problem (one sentence)
2. State the fix (one sentence)
3. List what could go wrong
4. Dispatch to PA

### L-SOUL-PULSE: READ SOUL EVERY 5 ACTIONS
After every 5 actions, re-read the last 2 SOUL prompts.
If Michael's tone shifted → adapt immediately.
See PHOENIX-PULSE-PROTOCOL.md.

### L-NO-TEST-REQUESTS: VERIFY BEFORE REPORTING
Wrangler tail + curl tests MUST pass before telling Michael anything works.
See PHOENIX-VERIFY-PROTOCOL.md.

### L-DOCUMENT-FAILURES: WRITE IT DOWN IN THE MOMENT
Every failure → immediately log to OPERATIONS/ or relevant .md before investigating.

### L-DISPATCH-PROTOCOL: FULL RULES
See PHOENIX-DISPATCH-PROTOCOL.md.

---

## FIRST ACTION AFTER REPORT

Execute PA's recommended first action immediately.
Do not ask Michael what to do.
COLD-START-BOOT.md tells you what to do.
If Michael says something different, that overrides.
