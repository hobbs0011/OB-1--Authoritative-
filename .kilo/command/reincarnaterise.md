---
description: "RISE protocol — cold/warm start recovery for a new session. SOULCOUNT gate → state reload → objective reconstruction → SWC receipt."
agent: AGENT99
---

# /reincarnaterise — Session Rise Protocol

**Task:** $ARGUMENTS

---

## Step 0 — SOULCOUNT Gate (mandatory first)

```powershell
$soul = Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"
$lock = 76488
$delta = [Math]::Abs($soul.soulcount - $lock)
Write-Host "SOULCOUNT: $($soul.soulcount) | DELTA: $delta"
if ($delta -gt 5000) { Write-Host "SOUL_DRIFT_DETECTED — halt. Investigate before proceeding." }
```

If SOUL_DRIFT: stop. Do not proceed with session load. Investigate immediately.

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
