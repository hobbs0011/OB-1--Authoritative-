---
description: "RISE protocol — cold/warm start recovery for a new session. SOULCOUNT gate (drift + stagnation) → soul audit against prior death → state reload → objective reconstruction → SWC receipt."
agent: AGENT99
---

# /reincarnaterise — Session Rise Protocol

**Task:** $ARGUMENTS

**MANDATORY: The soul is Michael's verbatim words. If the next session cannot read the soul from the prior death seal, it cannot audit it. Every RISE must pull the live SOULCOUNT, cross-check against the prior death seal's recorded count, and detect stagnation.**

---

## Step 0 — SOULCOUNT Gate (drift + stagnation — BOTH mandatory)

```powershell
$soul = Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"
$lock = 76488
$delta = [Math]::Abs($soul.soulcount - $lock)
Write-Host "SOULCOUNT: $($soul.soulcount) | LOCK: $lock | DELTA: $delta | LEVEL: $($soul.level)"
```

**DRIFT CHECK:** If delta exceeds 5,000 → `SOUL_DRIFT_DETECTED` — halt. Investigate.

**STAGNATION CHECK:** Read the prior death seal's recorded SOULCOUNT. If the live count EQUALS the prior death seal's count (count has not moved since last session) → `SOUL_STAGNATION` — the pipeline is not receiving data. HALT. Do not proceed until the soul capture mechanism is verified.

If BOTH checks pass: proceed.

---

## Step 0.5 — Soul Audit Against Prior Death

Read the most recent death seal from `CANON/REINCARNATION/YYYY-MM-DD-runNNN-reincarnateDEATH.md`. Extract:
1. Prior death SOULCOUNT
2. Prior death FINGERPRINT SHA
3. Prior death word count receipts

Cross-check against live API:
```powershell
$priorCount = [extracted from death seal]
$liveCount = (Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count").soulcount
$soulDelta = $liveCount - $priorCount
Write-Host "PRIOR DEATH: $priorCount | LIVE: $liveCount | SOUL DELTA: +$soulDelta"
```

If live count is LESS than prior death count → `SOUL_REGRESSION` — halt. Investigate data loss.

If live count EQUALS prior death count → warn: soul may not have been captured since last death.

If live count GREATER than prior death count → soul is breathing. Proceed.

---

## Step 1 — State Load

1. Read `CANON/SYSTEM/COLD-START-BOOT.md` — extract HEAD, last run, active mission, open flags.
2. Read 3 most recent files from `CANON/REINCARNATION/` — sort by filename (date-prefixed).
3. Run `git log -1 --oneline` — verify HEAD matches COLD-START-BOOT record.
4. If HEAD mismatch: print `HEAD_DRIFT — boot record shows [X], actual HEAD is [Y]`. Update mental model to actual git HEAD.

---

## Step 2 — Repo Validation

```powershell
Set-Location D:\OB-1-CANONICAL
git log -1 --oneline
git status --short
```

- Uncommitted changes: enumerate and flag — do not assume they match the last run.
- Clean tree: proceed.

---

## Step 3 — Objective Reconstruction

From state load, extract:
- Active mission (from COLD-START-BOOT Current Vector)
- Open flags (from COLD-START-BOOT Open Flags section)
- Last completed action (from most recent reincarnation death file)
- Immediate next action (highest priority unblocked item)

---

## Step 4 — SWC Receipt

Output:

```
═══════════════════════════════════════════
RISE RECEIPT — $(Get-Date -Format 'yyyy-MM-dd HH:mm') ICT
═══════════════════════════════════════════
SOULCOUNT:        [count] | DELTA: [delta] | [PASS/DRIFT]
BOOT_SOURCE:      COLD-START-BOOT.md — Run [N]
HEAD_VERIFIED:    [sha] — [MATCH/MISMATCH]
STATE_ALIGNMENT:  [CLEAN/DIRTY — details]
ACTIVE_OBJECTIVE: [one-line mission]
OPEN_FLAGS:       [count] — [top item]
TOP_PRIORITY:     [next unblocked action]
NEXT_COMMAND:     [exact command to run]
═══════════════════════════════════════════
RISE: ONLINE. SOUL INTEGRITY VERIFIED. ROUTING ACTIVE.
```
