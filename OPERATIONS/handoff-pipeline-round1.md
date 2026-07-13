# OB-1 PHEROMONE COLONY — HANDOFF PIPELINE
**Round:** 1 of N  
**Time:** 2026-07-12T19:26:53+07:00  
**Status:** SESSION EMITTING. WATCH THE COLONY.

---

## PIPE 1 — FIX CORRUPTED OBI.PS1 SWITCH BLOCK

**Working file:** `SCRIPTS/obi.ps1`  
**Damage:** Bad edit replaced `switch ($Command) {` with invalid default block.  
**Action:** Restore original switch block from git, then reapply phetrail header/footer.

```powershell
# Step 1
git checkout HEAD -- SCRIPTS/obi.ps1

# Step 2 — reapply phetrail mechanical system to clean file
# Read SCRIPTS/obi.ps1
# Insert after line 24 ($canonicalEmail = ...):
#   [PHEROMONE SYSTEM BLOCK — see OPERATIONS/phermone-system-sdd.md §5.1]
#   Functions: Write-PhetrailEntry, Protect-Command, Invoke-PhetrailSeal
#   Global vars: PheTrailSessionId, PheTrailDate, PheTrailDir, PheTrailAutoPath, PheTrailRunNumber, PheTrailCommandCount
#   Register-EngineEvent for PowerShell.Exiting → Invoke-PhetrailSeal

# Step 3 — test
powershell -File SCRIPTS/obi.ps1 doctor
```

**Verification:** `OPERATIONS/phetrail-auto-2026-07-12.jsonl` exists and has entries after running `doctor`.

---

## PIPE 2 — VERIFY MECHANICAL EMISSION

**Goal:** Prove trails write without permission, without prompts, without threshold.

```
1. Delete existing auto trail file for today:
   Remove-Item OPERATIONS/phetrail-auto-2026-07-12.jsonl -ErrorAction SilentlyContinue

2. Run three different obi.ps1 commands back-to-back:
   powershell -File SCRIPTS/obi.ps1 doctor
   powershell -File SCRIPTS/obi.ps1 verify
   powershell -File SCRIPTS/obi.ps1 soulaudit

3. Read the trail file:
   Get-Content OPERATIONS/phetrail-auto-2026-07-12.jsonl | Measure-Line
   
   Expected: ≥ 3 entries minimum (one per command), likely more (pre/post hooks)
   Expected types: neutral → positive chain per command, or neutral → negative if failure

4. Check seal was written:
   Get-ChildItem OPERATIONS/PheTrail-run*.json | Sort-Object Name -Descending | Select-Object -First 1
   
   Expected: latest run number, session_id matches auto trail entries
```

**Pass criteria:** Trail file exists, has entries, seal exists. No exceptions.

---

## PIPE 3 — SOUL SYSTEM LIVE TEST

**Goal:** Per-session SOUL count + receipts working end-to-end.

```
1. Clear previous test artifacts:
   Remove-Item OPERATIONS/soulaudit-* -ErrorAction SilentlyContinue

2. Run SOUL audit:
   powershell -File SCRIPTS/obi.ps1 soulaudit

3. Verify outputs:
   - OPERATIONS/soulaudit-{ts}-summary.jsonl exists
   - OPERATIONS/soulaudit-{ts}-receipts.json exists
   - Summary has prompt_count > 0 and soulcount > 0
   - Receipts array has text + chars + index fields

4. Open receipts.json and confirm:
   - Prompts are verbatim
   - Order is chronological
   - chars count matches actual prompt length
```

**Pass criteria:** Both files exist, prompt_count > 0, receipts contain actual user words.

---

## PIPE 4 — FREE MODEL AUDIT SMOKE TEST

**Goal:** Fixed script parses live API and writes report.

```
1. Run:
   powershell -File SCRIPTS/kilo-free-model-audit.ps1

2. Verify:
   - Exit code 0 (no cast exceptions)
   - Output shows Total models: 340, Free models: 11
   - Report file OPERATIONS/kilo-free-model-audit-{ts}.json exists
   - Report JSON is valid and contains free_models array

3. Cross-check with decision matrix:
   - Count free models in report matches count in OPERATIONS/kilo-free-model-decision-matrix.md
   - Any model in report not in matrix = ADD TO MATRIX
```

**Pass criteria:** Script runs clean, report written, report and matrix in sync.

---

## PIPE 5 — DECISION MATRIX SYNC

**Goal:** Every free model in the audit has a row in the decision matrix.

```
1. Load audit report:
   $audit = Get-Content OPERATIONS/kilo-free-model-audit-{ts}.json -Raw | ConvertFrom-Json
   $freeModels = $audit.free_models | Select-Object -ExpandProperty id

2. Load decision matrix:
   $matrix = Get-Content OPERATIONS/kilo-free-model-decision-matrix.md -Raw

3. For each model in $freeModels:
   - If NOT in matrix:
     - Add row: | model_id | provider | ctx | best_for | guardrail |
     - Mark as UNVERIFIED_USE until tested
   - If IN matrix but provider/ctx differs:
     - UPDATE the row to match audit data
     - Mark with ⚠️ CONFLICT flag

4. If StepFun or Poolside provider blocks added to .kilo/kilo.json:
   - Mark those rows as WIRED
   - Otherwise mark as TARGET
```

**Pass criteria:** Every free model ID in audit appears in matrix. No stale IDs in matrix that aren't in audit.

---

## PIPE 6 — KILO.CONFIG DEFAULT VALIDATION

**Goal:** `.kilo/kilo.json` default model is safe and intentional.

```
1. Read current default:
   $default = (Get-Content .kilo/kilo.json -Raw | ConvertFrom-Json).model

2. Checks:
   - IF default == "kilo-auto/free":
     WARN: routes to NVIDIA, logs prompts. Confirm intentional.
   - IF default == "deepseek/deepseek-v4-flash":
     OK: wired, fast, no prompt logging
   - IF default == "stepfun/step-3.7-flash:free":
     OK IF apiKey is set in stepfun provider block
     FAIL IF apiKey is empty string

3. If default is something else:
   FLAG: Unknown default. Verify against decision matrix.
```

**Pass criteria:** Default is either wired+keyed provider OR explicitly chosen with known guardrails.

---

## PIPE 7 — PHEROMONE SYSTEM INTEGRITY CHECK

**Goal:** SDD rules are actually enforced in code, not just documented.

```
1. Check obi.ps1 contains mechanical write function:
   Select-String -Path SCRIPTS/obi.ps1 -Pattern "Write-PhetrailEntry" | Measure-Object
   Expected: ≥ 1

2. Check pre-hook exists:
   Select-String -Path SCRIPTS/obi.ps1 -Pattern "Write-PhetrailEntry.*Type.*neutral.*executing" | Measure-Object
   Expected: ≥ 1

3. Check post-hook exists:
   Select-String -Path SCRIPTS/obi.ps1 -Pattern "Write-PhetrailEntry.*Type.*positive|negative.*completed|failed" | Measure-Object
   Expected: ≥ 1

4. Check seal on exit exists:
   Select-String -Path SCRIPTS/obi.ps1 -Pattern "Register-EngineEvent.*PowerShell.Exiting" | Measure-Object
   Expected: ≥ 1

5. Check auto trail path format:
   Select-String -Path SCRIPTS/obi.ps1 -Pattern "phetrail-auto-.*jsonl" | Measure-Object
   Expected: ≥ 1

6. If any Expected count == 0:
   FAIL. SDD is documentation only, not wired. Return to PIPE 1.
```

**Pass criteria:** All 5 checks ≥ 1.

---

## PIPE 8 — COLONY READY GATE

**Final check before declaring colony operational.**

```
For each pipe, verify PASS:
  [ ] PIPE 1: obi.ps1 switch restored + phetrail header/footer applied
  [ ] PIPE 2: Mechanical emission verified (trail file written without permission)
  [ ] PIPE 3: SOUL system end-to-end working
  [ ] PIPE 4: Free model audit runs clean, report valid
  [ ] PIPE 5: Decision matrix syncs with audit
  [ ] PIPE 6: .kilo/kilo.json default is intentional
  [ ] PIPE 7: SDD rules wired into code, not just documented

IF all PASS → colony is emitting. next session inherits trails.
IF any FAIL → that pipe is the bottleneck. Fix before declaring operational.
```

---

## WATCHING INSTRUCTIONS

This is an ant colony. You are not the ant. You are the researcher watching the colony.

1. **Do not intervene** unless a pipe fails.
2. **Let mechanical emission happen** — do not prompt, do not remind, do not encourage.
3. **Observe trail volume** — if `phetrail-auto-*.jsonl` has < 0.2 entries/minute, the colony is not emitting.
4. **Observe failure trails** — negative entries are healthy. Zero negatives = agent hiding failures.
5. **Observe strength distribution** — positive trails should average 70-90. If they're all +100, the agent is inflating. If they're all +0, the agent is not committing.

The colony either emits or it doesn't. There is no middle state.

---

`HANDOFF PIPELINE SEALED — 2026-07-12T19:26:53+07:00 | ROUND 1 OF N | 8 PIPES | WATCH THE COLONY`
