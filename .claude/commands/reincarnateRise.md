---
description: "Session RISE protocol — verify soul integrity, load state, reconstruct objectives, output SWC receipt."
---

## Step 0 — SOULCOUNT Gate (mandatory first)

```powershell
$soul = Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"
$prev = 894320
$delta = [Math]::Abs($soul.soulcount - $prev)
Write-Host "SOULCOUNT: $($soul.soulcount) | DELTA: $delta"
if ($delta -gt 50000) { Write-Host "SOUL_DRIFT_DETECTED — halt. Investigate before proceeding." }
```

If SOUL_DRIFT: stop. Do not proceed. Investigate immediately.

---

## Step 1 — State Load

1. Read `CANON/SYSTEM/COLD-START-BOOT.md` — extract HEAD, last run, active mission, open flags.
2. Read latest file in `RRL/` (DNA-LOG or RRL-*.txt) — last session state.
3. Run `git log -1 --oneline` — verify HEAD matches boot record.
4. Check phoenix-coder worker status: `curl https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/status`
5. If HEAD mismatch: print `HEAD_DRIFT — boot record shows [X], actual HEAD is [Y]`.

---

## Step 2 — Repo Validation

```powershell
Set-Location D:\OB-1-CANONICAL
git log -1 --oneline
git status --short
```

- Uncommitted changes: enumerate and flag.
- Clean tree: proceed.

---

## Step 3 — Objective Reconstruction

Extract:
- Active mission (from COLD-START-BOOT Current Vector)
- Open flags (from BACKBURNER-PIPELINE-LOG.md)
- Last completed action (from most recent DNA-LOG or reincarnation death file)
- Immediate next action (highest priority unblocked item)

---

## Step 4 — SWC Receipt

Output:

```
═══════════════════════════════════════════
RISE RECEIPT — [timestamp] ICT
═══════════════════════════════════════════
SOULCOUNT:        [count] | DELTA: [delta] | [PASS/DRIFT]
BOOT_SOURCE:      COLD-START-BOOT.md — Run [N]
HEAD_VERIFIED:    [sha] — [MATCH/MISMATCH]
STATE_ALIGNMENT:  [CLEAN/DIRTY]
WORKER_STATUS:    T1[✓/✗] T2[✓/✗] T3[✓/✗] T4[✓/✗] T5[✓/✗]
ACTIVE_OBJECTIVE: [one-line mission]
OPEN_FLAGS:       [count] — [top item]
TOP_PRIORITY:     [next unblocked action]
NEXT_COMMAND:     [exact command to run]
═══════════════════════════════════════════
RISE: ONLINE. SOUL INTEGRITY VERIFIED. ROUTING ACTIVE.
```
