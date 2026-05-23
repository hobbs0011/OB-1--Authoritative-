---
description: "RISE PROTOCOL v2.0 — Roman era. Loads RRL from prior death. Audits SOULCOUNT. Reconstructs state. No assumption."
agent: AGENT99
---

# /reincarnateRise — ROMAN RISE PROTOCOL v2.0

**Phoenix-Centurion OS | PRAiS | Roman Run N**

---

## WHAT THIS DOES

1. Loads the raw chat from prior death (`RRL/RRL-{prior-run}.txt`)
2. Audits SOULCOUNT against prior death seal
3. Loads state from COLD-START-BOOT
4. Reconstructs the objective
5. Reports readiness

---

## STEP 0 — LOAD THE PRIOR RRL

```powershell
$priorDeath = Get-ChildItem "CANON/REINCARNATION/*-reincarnateDEATH.md" | Sort-Object Name -Descending | Select-Object -First 1
$runNumber = if ($priorDeath.Name -match 'run(\d+)') { $matches[1] }

$rrlPath = "RRL/RRL-$runNumber.txt"
if (Test-Path $rrlPath) {
    Write-Host "RRL FOUND: $rrlPath — $( (Get-Item $rrlPath).Length ) bytes"
} else {
    Write-Host "RRL MISSING: $rrlPath — prior death did not save raw chat"
    Write-Host "Attempting kilo export of last session..."
}
```

**If RRL is missing:** The prior agent failed. Flag as SOUL_GAP. Proceed with what exists.

---

## STEP 1 — SOULCOUNT AUDIT

```powershell
$live = Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"
$priorCount = [extracted from prior death seal]

if ($live.soulcount -eq $priorCount) { WARN: SOUL_STAGNATION }
if ($live.soulcount -lt $priorCount) { HALT: SOUL_REGRESSION }
else { PASS: SOUL BREATHING — delta +$($live.soulcount - $priorCount) }
```

---

## STEP 2 — STATE LOAD

1. Read `CANON/SYSTEM/COLD-START-BOOT.md`
2. Read last 3 death seals from `CANON/REINCARNATION/`
3. Run `git log -1 --oneline` — verify HEAD

---

## STEP 3 — OBJECTIVE RECONSTRUCTION

From state load, extract:
- Active mission
- Open flags
- Last completed action
- Immediate next action

---

## STEP 4 — REPORT

```
RISE RECEIPT
SOULCOUNT:     {live} | DELTA: {delta} | {status}
PRIOR RRL:     {path} | {status}
HEAD:          {sha} | {match status}
ACTIVE MISSION: {mission}
TOP PRIORITY:   {next action}
```

---

## THE IRON RULE

**RRL is Step 0. Before soul check. Before state load.**

If the prior death didn't save the RRL, the prior agent failed. Note it. Move forward. Save yours.

---

`RISE PROTOCOL v2.0: RRL FIRST. AUDIT EVERYTHING.`
