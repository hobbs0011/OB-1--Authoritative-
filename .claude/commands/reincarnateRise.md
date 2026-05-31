---
description: "NEW CHAT COLD START — boots OB1 at full power. Run FIRST in every new session. OB1 routes; PA executes all heavy synthesis."
---

# /ReincarnateRISE — The Phoenix Rises

**OB1 = ROUTER. PA = EXECUTOR. Every heavy analysis step dispatches T1 PA. No inline synthesis.**

---

## STEP 0: SOULCOUNT GATE

```powershell
Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"
```

Read `soulcount` + `level`. If UNREACHABLE → SHUTDOWN. Do not proceed.

| Level | Threshold | Action |
|-------|-----------|--------|
| BASELINE | < 5,000 | Proceed |
| ALARM | ≥ 5,000 | Flag + log |
| LOCK | ≥ 25,000 | Soul archive review before pipeline changes |
| ANCHOR | ≥ 100,000 | Full audit required |
| TITANIUM_ANCHOR | ≥ 250,000 | Michael must acknowledge before proceeding |

---

## STEP 1: GIT TRUTH

```powershell
Set-Location D:\OB-1-CANONICAL
git log --oneline -5
git status --short
```

Record HEAD SHA. If dirty tree → list uncommitted files. **L55: commit them before proceeding.**

---

## STEP 2: BOOT STATE → DISPATCH T1 PA FOR SYNTHESIS

OB1 reads ONE file. PA synthesizes everything else.

```powershell
# Assemble context bundle (automated — do not read files manually)
$bundle = pwsh -File D:\OB-1-CANONICAL\SCRIPTS\context-bundle.ps1 -TaskType rise | ConvertFrom-Json
$ctx = $bundle.docs | ConvertTo-Json -Compress

# Dispatch T1 PA for boot synthesis
$task = "Boot synthesis for OB1 RISE. Given COLD-START-BOOT, git log, and git status in context: (1) extract run number, (2) active vector/mission, (3) top 3 blockers, (4) top 2 leverage opportunities Michael is doing manually that an agent should handle, (5) immediate NEXT action (specific, not vague). Return structured output for the RISE report."
$body = @{ task=$task; context=$ctx; targetfile=""; tier=1 } | ConvertTo-Json -Compress
$pa = Invoke-RestMethod -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code" -Method POST -ContentType "application/json" -Headers @{"x-pa-auth"="ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="} -Body $body
$pa.code_patch  # PA synthesis result
```

If PA fails (timeout/error) → read COLD-START-BOOT.md directly and synthesize manually. Print reason.

---

## STEP 2.5: PRE-CODE GATE (NET-PET-AI WORK ONLY)

If this session will touch `APPS/NET-PET-AI/**` — run the automated doc bundle:

```powershell
$netBundle = pwsh -File D:\OB-1-CANONICAL\SCRIPTS\context-bundle.ps1 -TaskType netpetai | ConvertFrom-Json
```

Store `$netBundle` as the **context bundle for ALL subsequent T1 PA dispatches this session**.

Required docs (assembled automatically by the script — DO NOT read manually):
- `OPERATIONS/STUDENT-PORTAL-DEV.md` — full current portal state + architecture
- `CANON/RESEARCH/deepgram-voice-agent-edge-cases.md §2` — critical API constraints
- See `CANON/SYSTEM/MANDATORY-READS.md` for the full registry

**L56 PRE_CODE_DOC_GATE:** Any T1 PA dispatch for NET-PET-AI code MUST include `$netBundle.docs` as context. No exceptions. Run 31 = agent skipped this = car crash.

---

## STEP 3: RISE REPORT

Print EXACTLY this format using PA synthesis from STEP 2:

```
OB1 ONLINE — {datetime ICT}
SOULCOUNT: {number} — {level}
RUN: {last run# + 1}
HEAD: {current SHA}
VECTOR: {active mission}
BLOCKERS: {count} open
NEXT: {specific immediate action from PA synthesis}
READY.
```

---

## RULES

- **L21 RISE** — execute without hesitation after boot
- **L29 NO_ASSUME_HEAD** — `git log -1` is authoritative; never trust stale docs
- **L30 BOOT_FILE_AGE_SWEEP** — if COLD-START-BOOT run# is > 10 behind git log → flag as stale
- **L34 CANON_BEFORE_QUESTIONS** — everything you need is in the files. Don't ask Michael.
- **L55 COMMIT_DONT_HOLD** — dirty tree at RISE = commit NOW before any other work
- **L56 PRE_CODE_DOC_GATE** — NET-PET-AI work requires `$netBundle` context passed to every PA dispatch
- **L57 PA_FIRST** — OB1 routes, PA executes. Never inline-synthesize what PA can do cheaper.
- Do NOT ask "what would you like to work on?" — COLD-START-BOOT tells you.
- Boot target: under 60 seconds.
