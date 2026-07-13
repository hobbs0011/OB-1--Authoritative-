# PheTrail — Scout Learned (2026-07-13T002035)

**SCOUT_ID:** SC-20260713T002035-001  
**ROLE_UPGRADE:** SCOUT → PHE_TRAIL_FOLLOWER  
**LENS:** PHEROMONE  

---

## Learned: Backburner Precedence

**FINDING:** Backburner items always take precedence over new work. This is not optional.

**EVIDENCE:**
- BB-53 (exposed API key) is HIGH priority security issue — time-sensitive
- BB-55 (funnel browser test) is DEFERRED — requires Michael action at end of pipeline
- BB-NEW phetrail scoring is DIRECTIVE_PENDING — Michael directive Run 120
- /soulsearch command is IMPLEMENTATION_NEEDED — missing harness for manual transcripts

**ROUTING:**
1. Resume BACKBURNER first (OPEN=5, BLOCKED=0, IN-PROGRESS=1)
2. BB-53 must be addressed before any new feature work
3. BB-55 waits for Michael's human test
4. BB-NEW and /soulsearch are implementation directives

---

## Learned: Phetrail Strength Scoring Directive

**FINDING:** Michael directive Run 120 requires 1-100 strength rating on every phetrail entry.

**IMPLEMENTATION:**
- incarnate.js createBBEntry → add strength field
- phetrail JSON schema → add strength field
- OPERATIONS phetrail .md files → add strength rating

**SCORING SCALE:**
- High-signal trails: near 100
- Routine operational trails: 20-50
- Dead ends / negative trails: 10-30 (decay slower per Stage 48 law)

**FIRST APPLIED:** phetrail-HOW-TO-SCOUT.md (100/100 SPIKE) — Run 120 scout session

---

## Learned: /soulsearch Command Gap

**FINDING:** The missing artifact is the harness, not the manual labor.

**PROBLEM:** Michael has manually copy/pasted raw session transcripts for thousands of sessions. No canonical harness to receive, verify, and permanently seal.

**SOLUTION:** /soulsearch command station
- Command: `obi.ps1 soulsearch -RrlSource <path> [OutFile] [-DryRun]`
- Script: `SCRIPTS/soulsearch.ps1`
- Doc: `.kilo/command/soulsearch.md`
- Pattern: Thin wrapper that enforces (1) file provided, (2) RRL write, (3) invoke DEATH with -RrlSource, (4) return seal path and result

**KEY INSIGHT:** The system was always possible. The manual labor was never the barrier. The missing artifact was the harness.

---

## Learned: Phantom Artifacts Pattern

**FINDING:** pipeline-run157/158/159.json were deleted during unauthorized cleanup.

**PATTERN:**
- schema-catalog-run158.json exists — written 2026-07-12 04:35 ICT
- pipeline-run158.json was created but now deleted
- No death seal was ever written for run158
- RRL-158.txt is MISSING — no transcript captured

**IMPLICATION:** Future scouts should verify artifact existence BEFORE claiming completion.

---

## Learned: KILO_HOLLOW Phetrail Gap

**FINDING:** PheTrail-run158.json exists but shows ORPHAN status, not true phetrail.

**PATTERN:**
- KILO sessions produce zero Claude Code JSONL
- DNA pipeline always hollow for Kilo
- PheTrail files should not be expected for KILO_HOLLOW sessions
- Status should be MISSING_BY_DESIGN, not MISSING

**ACTION:** Flag phetrail absence for KILO sessions as NOT_WALKED with note "expected per KILO_DNA_GAP law".

---

## Next Scout Target

**PHE_TRAIL_FOLLOWER should verify:**
1. BB-53 status after key rotation
2. BB-55 browser test completion (Michael action)
3. /soulsearch command implementation
4. BB-NEW phetrail strength scoring rollout

---

*Scout learned this zone must be indexed by backburner precedence, not new work discovery.*