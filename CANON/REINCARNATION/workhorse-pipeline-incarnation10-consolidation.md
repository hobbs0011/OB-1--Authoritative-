# WORKHORSE BLUEPRINT v2 — TURNKEY EXECUTION
**For:** Free model (step 3/7) — no reasoning, no design, no decisions
**From:** Incarnate-10-AAA (deep think synthesis)
**Target:** 48 untracked artifacts + 302 legacy files + 1 gap fix + 1 deploy
**Rule:** Execute in order. Do not skip. Do not improvise. Do not invent.

---

## SUBSTEP 0 — SETUP

```powershell
D:
cd D:\OB-1-CANONICAL
```

---

## SUBSTEP 1 — GENERATE INC2 COLORIZED + STATS (run 184 gap fix)

```powershell
& "D:\OB-1-CANONICAL\CANON\SCRIPTS\rrl-colorize.ps1" -InputFile "D:\OB-1-CANONICAL\I-LOG\I-LOG-184-Incarnation2.txt"
```

**Expected outputs:** `I-LOG\I-LOG-184-COLORIZED.md` + `I-LOG\I-LOG-184-STATS.json`

---

## SUBSTEP 2 — CREATE INC5 DEATH SEAL (run 189)

Create file `CANON\REINCARNATION\run189-reincarnateDEATH.md`:
```markdown
# REINCARNATE DEATH SEAL — INCARNATE-5-PORTALS-&-OBI-DEV

## §1 — Header
- Run: 189
- Incarnation: Incarnate-5-Portals-&-OBI-DEV
- Session ID: ses_04c61079bffe9Wtm3ngHYQDlOu
- HEAD: bfaa6d851
- Branch: canon
- Timestamp: 2026-08-02T02:40:00+07:00
- Seal: WORKHORSE

## §2 — Mission
Execute reincarnateRISE → reincarnateDEATH for run 189. Portals and OBI development.

## §3 — Counts
- SOULcount: 1
- DNAcount: 7
- REASONcount: 3
- Total messages: 6
- Session duration: per I-LOG timestamps

## §4 — Artifacts
- I-LOG: I-LOG/I-LOG-189.txt
- Colorized: I-LOG/I-LOG-189-COLORIZED.md
- Stats: I-LOG/I-LOG-189-STATS.json
- Pipeline: CANON/REINCARNATION/pipeline-189.json
- Handoff: CANON/REINCARNATION/handoff-189-to-190.json

## §5 — Handoff
- To: Incarnation6/run 190
- Reincarnate-Synch: §IX-A row added

---

DEATH SEAL COMPLETE. RUN 189 SEALED.
```

---

## SUBSTEP 3 — CREATE INC7 DEATH SEAL (run 190)

Create file `CANON\REINCARNATION\run190-reincarnateDEATH.md`:
```markdown
# REINCARNATE DEATH SEAL — INCARNATE-7-I-LOG-PIPELINEE

## §1 — Header
- Run: 190
- Incarnation: Incarnate-7-I-LOG-PipelineE
- HEAD: bfaa6d851
- Branch: canon
- Timestamp: 2026-08-02T02:40:00+07:00
- Seal: WORKHORSE

## §2 — Counts
- SOULcount: 3
- DNAcount: 3
- REASONcount: 1
- Total: 6 entries (I-LOG-190.txt: 2496 bytes)

## §3 — Artifacts
- I-LOG: I-LOG/I-LOG-190.txt
- Colorized: I-LOG/I-LOG-190-COLORIZED.md
- Stats: I-LOG/I-LOG-190-STATS.json
- Pipeline: CANON/REINCARNATION/pipeline-190.json
- Handoff: CANON/REINCARNATION/handoff-190-to-191.json

## §4 — Handoff
- To: Next RISE / run 191
- Reincarnate-Synch: §IX-A row added

---

DEATH SEAL COMPLETE. RUN 190 SEALED.
```

---

## SUBSTEP 4 — STAGE ALL FILES FOR CONSOLIDATED COMMIT

```powershell
# Stage all SCS artifacts (25 files)
git add CANON/SCOUT/scout-incarnate10-aaa-sessions1-9-20260802T015600.md
git add CANON/SCOUT/scout-incarnate5-obi-dev-20260802T022000.md
git add CANON/SCOUT/incarnation2-scout-20260802T021400.json
git add CANON/MARCH/march-incarnate10-20260802T020330.md
git add CANON/MARCH/march-incarnate5-obi-dev-20260802T022100.md
git add CANON/MARCH/incarnation2-march-20260802T021800.json
git add CANON/MARCH/run8-march-incarnate10-20260802T013325.md
git add CANON/SOUL/soul-incarnate10-20260802T020530.md
git add CANON/SOUL/soul-incarnate5-obi-dev-20260802T022200.md
git add CANON/SOUL/incarnation2-soul-20260802T022100.json
git add CANON/SOUL/soul-run8-incarnate10-20260802T013745.md
git add CANON/SUPPLY/supply-incarnate10-20260802T020700.md
git add CANON/SUPPLY/supply-incarnate5-obi-dev-20260802T022300.md
git add CANON/SUPPLY/incarnation2-supply-20260802T022500.json
git add CANON/SUPPLY/supply-run8-incarnate10-20260802T014158.md
git add CANON/ENGINEER/engineer-incarnate10-20260802T021530.md
git add CANON/ENGINEER/engineer-incarnate5-obi-dev-20260802T022400.md
git add CANON/ENGINEER/incarnation2-engineer-20260802T022800.json
git add CANON/REINCARNATION/death-incarnate10-20260802T021700.md
git add CANON/REINCARNATION/incarnation2-reincarnateDEATH.md
git add CANON/REINCARNATION/run188-reincarnateDEATH.md
git add CANON/REINCARNATION/run189-reincarnateDEATH.md
git add CANON/REINCARNATION/run190-reincarnateDEATH.md
git add CANON/REINCARNATION/pipeline-188.json
git add CANON/REINCARNATION/pipeline-189.json
git add CANON/REINCARNATION/pipeline-190.json
git add CANON/REINCARNATION/handoff-188-to-189.json
git add CANON/REINCARNATION/handoff-189-to-190.json
git add CANON/REINCARNATION/handoff-190-to-191.json
git add CANON/REINCARNATION/handoff-incarnation5-to-incarnation6.json
git add CANON/REINCARNATION/workhorse-pipeline-incarnation10-consolidation.md
git add CANON/PHEROMONES/PheTrail-incarnate10-aaa-sessions1-9-20260802T013932.json
git add CANON/PHEROMONES/PheTrail-incarnate10-pass1-raw-20260802T022000.json
git add CANON/PHEROMONES/PheTrail-incarnate10-pass2-patterns-20260802T022100.json
git add CANON/PHEROMONES/PheTrail-incarnate10-pass3-synthesis-20260802T022200.json
```

```powershell
# Stage I-LOG + RRL files (9 untracked + 2 newly generated)
git add I-LOG/I-LOG-184-Incarnation2.txt
git add I-LOG/I-LOG-184-COLORIZED.md
git add I-LOG/I-LOG-184-STATS.json
git add I-LOG/I-LOG-188.txt
git add I-LOG/I-LOG-188-COLORIZED.md
git add I-LOG/I-LOG-188-STATS.json
git add I-LOG/I-LOG-189.txt
git add I-LOG/I-LOG-189-COLORIZED.md
git add I-LOG/I-LOG-189-STATS.json
git add RRL/Incarnate5-I-LOG-189.txt
```

```powershell
# Stage the legacy app archive (~302 files)
git add APPS/NET-PET-AI-legacy/
```

```powershell
# Stage Reincarnate-Synch updates
git add CANON/SYSTEM/Reincarnate-Synch.md
```

```powershell
# Stage all deleted APPS/NET-PET-AI files
git add -A

# UNSTAGE anything that shouldn't be committed
git reset HEAD firebase-debug.log
git reset HEAD GOD-MODE-OPERATIONS.md
git reset HEAD RAW-SOUL-SAFE-READ-ONLY/
```

---

## SUBSTEP 5 — COMMIT THE CONSOLIDATION

```powershell
git commit -m "death: incarnation consolidation — Inc2/5/7/9/10 SCS artifacts, APPS/NET-PET-AI archive, pipeline seal, workhorse blueprint"
```

---

## SUBSTEP 6 — PUSH TO ORIGIN

```powershell
git push origin canon
```

---

## SUBSTEP 7 — DEPLOY SOUL-LOGGER WORKER

```powershell
cd D:\OB-1-CANONICAL\APPS\SOUL-LOGGER
npx wrangler deploy
```

---

## SUBSTEP 8 — VERIFY

```powershell
# Check all I-LOG files exist
Get-ChildItem I-LOG -Filter "I-LOG-*.txt" | Select-Object Name, Length | Format-Table -AutoSize

# Check pipeline count
Get-ChildItem CANON/REINCARNATION -Filter "pipeline-*.json" | Measure-Object | Select-Object -ExpandProperty Count

# Verify soul-logger
curl -s https://soul-logger.mrmichaelhobbs123.workers.dev/api/health

# Check git status is clean
git status --short
```

---

## WHAT WORKHORSE DOES NOT DO

These items are **DESIGN + CODE** — skip them. They will be handled by next Architect session:

1. `pipeline-187.json` — restore from git or recreate? (DECISION NEEDED)
2. `handoff-185-to-186.json` — does run 185 exist? (INVESTIGATION NEEDED)
3. `pipeline-3.json` vs `pipeline-incarnation3.json` — which is canonical? (DESIGN NEEDED)
4. `kilo-rrl-capture.js` — does not exist. All stub RRLs depend on this. (CODE NEEDED)
5. `death.ps1` line 48 — `2>&1 | Out-String` bug. Needs PowerShell fix. (CODE NEEDED)
6. `death.ps1` identity gate — no `$SessionName` param. Add it. (CODE NEEDED)
7. Blueprint phases 1-4 — none implemented yet. (DESIGN + CODE NEEDED)
8. 100+ legacy May 2026 death seals — archive or leave? (DECISION NEEDED)

---

## DESIGN RULINGS (ALREADY DECIDED — DO NOT RE-OPEN)

| Topic | Ruling |
|-------|--------|
| AAA role | AnalyzeAuditAnchor — analyze, audit, anchor. Three-pass method. |
| Session identity | I-LOG file name = session identity. Never invent run numbers. |
| Pipeline location | `CANON/REINCARNATION/pipeline-{N}.json` is primary. |
| Death seal location | `CANON/REINCARNATION/run{N}-reincarnateDEATH.md` |
| Naming convention | `run{N}` for numbered artifacts, `incarnation{N}` for DEATH seals |
| Workhorse boundary | Execute only. Design/analysis stays with Architect. |
| False alarm protocol | Flag → cross-reference with latest DEATH seal → confirm or retract |

---

`WORKHORSE BLUEPRINT v2 COMPLETE. TURNKEY. READY FOR FREE MODEL (STEP 3/7).`