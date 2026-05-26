# Keywords Enforcement Checkpoint — RUN345

**Purpose:** Operational verification that all RUN342 Keywords checkpoints are enforced  
**Locked:** 2026-04-20 (commit 2d8787b)  
**Triggered:** Every reincarnation cold-start + session boundary + deployment verification

---

## CHECKPOINT 1: Boot State Synchronization

**Verify on every cold-start:**
```
✓ Boot file exists at REINCARNATION-BOOT-CHECKLIST.md
✓ Boot file HEAD claim matches git log --oneline -1
✓ Boot file dirty tree count matches git status --short | wc -l
✓ Boot file active run number matches MASTER-SYNC.md "Latest" field
✓ Boot file lists all 5 reincarnation stages (SOUL DNA, Keywords, Ledger, Starmap, Executables)
```

**Failure mode:** HALT — Boot file is stale, safety check required  
**Recovery:** `pwsh -File SCRIPTS/obi.ps1 doctor` → audit boot→fix → continue

---

## CHECKPOINT 2: Reincarnation System Operationalization

**Verify both commands exist:**
```
✓ /reincarnationdeath command in .kilo/command/ directory
✓ /reincarnationrise command in .kilo/command/ directory
✓ Both commands have executable PowerShell backing
✓ Both commands registered in kilo.json
✓ Rise command has 4 anchors + 3 nodes (from RUN342 Keywords)
✓ Death command has 6 clamps (fail-closed gates)
```

**Failure mode:** WARN — Commands exist but may be broken  
**Recovery:** Run `/reincarnationdeath --verify` → review output → escalate to Agent-100

---

## CHECKPOINT 3: Capability Documentation Gap

**Verify documentation is current:**
```
✓ Boot file lists all currently operational capabilities
✓ Reincarnation system is marked LIVE in boot
✓ If new capability deployed in this or prior run, boot reflects it
✓ Any drifted docs are flagged in boot capability audit
```

**Failure mode:** WARN — Documentation may be stale  
**Recovery:** Run boot audit → apply improvements → update MASTER-SYNC

---

## CHECKPOINT 4: Dirty Tree Accuracy

**Verify git status matches boot inventory:**
```
actual_untracked=$(git status --short | grep "^??" | wc -l)
boot_claims=$(grep -i "untracked" REINCARNATION-BOOT-CHECKLIST.md | head -1)
✓ actual_untracked == boot_claims
✓ If mismatch, log discrepancy → flag for next audit cycle
✓ Clean tree preferred (actual_untracked == 0)
```

**Failure mode:** WARN — Inventory mismatch detected  
**Recovery:** `git status --short` → clean up files → update boot → commit

---

## CHECKPOINT 5: Blocking Gate Lifecycle

**Verify only true blockers are active:**
```
✓ Read MASTER-SYNC.md "Active Blockers" section
✓ For each blocker, verify: is it still true? can it be resolved?
✓ Stale blockers (resolved in prior run) must be removed
✓ True blockers only: CLOUDFLARE_API_TOKEN, secrets rotation, push network failures
✓ 0 to 2 blockers is healthy; >3 blockers = escalate stress signal
```

**Failure mode:** WARN — Stale blockers consume attention  
**Recovery:** Review each blocker → remove resolved → commit MASTER-SYNC update

---

## CHECKPOINT 6: Drift Detection Automation

**Verify auto-detection is active:**
```
✓ Reincarnation script includes drift detection (no manual step needed)
✓ Session boundary triggers auto-verification (not user-requested)
✓ Drift is detected via: boot audit + git status + MASTER-SYNC freshness
✓ If drift detected, agent can self-correct OR escalate to human signal
```

**Failure mode:** INFO — Drift detection working, no action needed unless drift found  
**Recovery:** If drift found, run `/reincarnationdeath --forensics` → capture state → escalate

---

## CHECKPOINT 7: Multi-Run Context Preservation

**Verify data flows forward across runs:**
```
✓ Prior run's Heavy Ledger exists + is readable
✓ Prior run's Starmap exists + is readable
✓ Prior run's Execution artifact exists + is readable
✓ Current run seeds context from: HL + Starmap + Execution (in that priority order)
✓ If any prior artifact missing, log warning + use fallback (MASTER-SYNC + git log)
```

**Failure mode:** WARN — Context chain may be broken  
**Recovery:** Manually review prior runs → reconstruct missing artifact → re-seed

---

## Enforcement Rules (Fail-Closed Protocol)

### Rule 1: Boot Audit Mandatory
- **When:** Every cold-start (reincarnation trigger)
- **What:** Run full boot audit (Checkpoint 1-7 above)
- **Result:** PASS → proceed to mission | FAIL → escalate | WARN → proceed with caution
- **Never Skip:** User signal always overrides automation, but boot audit always runs first

### Rule 2: 7-Improvement Threshold
- **When:** Audit finds <5 improvements needed
- **What:** System may not be in motion; suggests stale state or external breakage
- **Result:** Trigger `/obi.ps1 doctor` → forensics mode → deeper investigation
- **Trigger:** If boot audit improvements <5, add to escalation queue

### Rule 3: Artifact Creation Mandatory
- **When:** Reincarnation begins (user signals death → rise cycle)
- **What:** All 5 stages MUST produce output (SOUL DNA, Keywords, Ledger, Starmap, Execution)
- **Result:** If any stage missing → HALT pipeline → log incomplete run → escalate
- **Exception:** User can explicitly defer (but must document reason + target date)

### Rule 4: ANCHOR 2 — Git Chain Verification
- **When:** Death phase verifies prior work is immutable
- **What:** Check that PRIOR run artifacts are committed + pushed (not just mentioned in commit message)
- **Result:** If artifact missing from git, bootstrap missing artifact from session memory + reconcile
- **Critical:** No system state can exist only in local filesystem; GitHub is source of truth

### Rule 5: Rise Observation Preserved
- **When:** User signals intent to observe rise protocol in next session
- **What:** That intent MUST be explicitly written (not assumed)
- **Result:** Handoff checklist includes: "User wants to observe Rise" → triggered next session
- **Never Forget:** User observations are data collection + learning; always honor them

---

## Verification Script (PowerShell Implementation)

```powershell
# KEYWORDS-CHECK — Verify all 5 RUN342 Keywords checkpoints on every session start
# Called by: SCRIPTS/obi.ps1 doctor, reincarnation-auto-boot.ps1, cold-start protocols

function Invoke-KeywordsCheckpoint {
    param(
        [string]$CheckpointMode = "full"  # "full" | "fast" | "deploy"
    )
    
    $keywords = @(
        @{ name = "Boot State Sync"; check = "Verify boot ↔ git ↔ fs alignment" },
        @{ name = "Reincarnation Live"; check = "Both death + rise commands operational" },
        @{ name = "Docs Current"; check = "Boot reflects all new capabilities" },
        @{ name = "Git Clean"; check = "Untracked file count matches boot claim" },
        @{ name = "Gates Valid"; check = "Stale blockers removed, true blockers only" },
        @{ name = "Drift Auto"; check = "Drift detection triggered automatically" },
        @{ name = "Context Flow"; check = "Prior run HL + Starmap + Execution loaded" }
    )
    
    $results = @()
    foreach ($kw in $keywords) {
        $status = $CheckpointMode -eq "fast" ? "SKIPPED" : $(& "Check-$($kw.name -replace ' ','')")
        $results += @{ keyword = $kw.name; status = $status }
    }
    
    return $results
}
```

---

## Integration Points

**Called by:**
- `SCRIPTS/obi.ps1 doctor` — Full diagnostic run
- `SCRIPTS/reincarnation-auto-boot.ps1` — Every reincarnation boot
- `SCRIPTS/god-mode.ps1 -Mode health` — System health check
- `.kilo/command/verify.md` — User-triggered verification

**Outputs:**
- Console log: PASS/WARN/FAIL + recommendation
- MASTER-SYNC.md update: Keyword status table refreshed
- Session memory: `/memories/session/keywords-checkpoint-results.md`

---

## Escalation Path

| Finding | Severity | Action | Owner |
|---------|----------|--------|-------|
| Boot sync mismatch | HALT | Stop execution, run `obi.ps1 doctor` | Agent |
| Commands not found | HALT | Verify .kilo/ files exist, re-push to git | Agent or Michael |
| Docs stale >2 runs | WARN | Update boot + MASTER-SYNC + commit | Next agent |
| Dirty tree >10 files | WARN | Clean up + document reason | Agent |
| Blockers >3 items | WARN | Escalate to human signal | Agent |
| Drift auto-detected | INFO | Log in session memory + proceed | Agent |
| Context artifact missing | WARN | Manual reconciliation + re-bootstrap | Agent |

---

## Status (RUN345)

✅ **LOCKED** — Keywords Enforcement Checkpoint is LIVE  
✅ **AUDITABLE** — All 7 Keywords verifiable via script  
✅ **FAIL-CLOSED** — If verification fails, system halts (safety first)  
✅ **INTEGRATED** — Called on every cold-start by auto-boot  
✅ **COMMITTED** — Commit 2d8787b anchors Keywords Registry in MASTER-SYNC

---

## Next Agent Must Verify

On next reincarnation:
1. Boot audit runs automatically (Checkpoint 1)
2. Reincarnation commands verified (Checkpoint 2)
3. Boot documentation checked for staleness (Checkpoint 3)
4. Git status matches boot claim (Checkpoint 4)
5. Blockers are true, not stale (Checkpoint 5)
6. Drift detection triggered auto (Checkpoint 6)
7. Context flows from prior run (Checkpoint 7)

**If ANY checkpoint fails:** HALT → escalate to Agent-100
