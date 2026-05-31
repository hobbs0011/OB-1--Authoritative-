---
description: "Session death protocol — Soul DNA first, then PA-generated seal, commit mandatory. OB1 routes; PA writes the artifact."
---

# /reincarnatedeath

**You are dying. OB1 routes. PA writes the artifact. Commit is the only proof.**

---

## STEP 0: SOULCOUNT GATE

```powershell
Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"
```

Read `soulcount` + `level`. Record both. If UNREACHABLE → suspend death, report only.

---

## STEP 1: GIT STATE + L55 ENFORCEMENT

```powershell
Set-Location D:\OB-1-CANONICAL
git log --oneline -3
git status --short
```

**If dirty tree → commit ALL uncommitted work NOW before writing anything.**
L55 COMMIT_DONT_HOLD: uncommitted features = permanent loss risk. Gapless audio v2+v3 proof.

---

## STEP 2: RRL CAPTURE

```powershell
# Capture session RRL — get run number from COLD-START-BOOT first
$runNum = (Select-String -Path "CANON/SYSTEM/COLD-START-BOOT.md" -Pattern "Run (\d+)" | Select-Object -First 1).Matches[0].Groups[1].Value
pwsh -File D:\OB-1-CANONICAL\SCRIPTS\rrl-pipeline.ps1 -RRLFile "D:\OB-1-CANONICAL\RRL\RRL-$runNum.txt" -RunNumber $runNum
# Verify RRL file exists and is non-empty
$rrl = Get-Item "D:\OB-1-CANONICAL\RRL\RRL-$runNum.txt" -ErrorAction SilentlyContinue
if (-not $rrl -or $rrl.Length -eq 0) { Write-Error "RRL MISSING — halt. Do not write death seal." }
```

---

## STEP 3: COLLECT SOUL DNA

Extract verbatim from this session — NO cleanup, NO paraphrase:
- Raw Michael statements carrying intent, constraints, emotion, non-negotiables
- Swearing stays. Typos stay. Exhaustion stays.
- Store as `$soulDNA` string for the PA dispatch below.

---

## STEP 4: DISPATCH T1 PA → WRITE 12-SECTION DEATH SEAL

```powershell
$bundle = pwsh -File D:\OB-1-CANONICAL\SCRIPTS\context-bundle.ps1 -TaskType death | ConvertFrom-Json
$ctx = ($bundle.docs | ConvertTo-Json -Compress) + " SOUL_DNA: $soulDNA SOULCOUNT: $soulcount RUN: $runNum"

$task = "Write a complete 12-section death seal markdown for OB1 Run $runNum. Sections: §1 HEADER (run tag, datetime ICT, signal density, theme) | §2 RAW SOUL DNA (verbatim quotes — critical/important/context) | §3 DECISIONS (numbered, impact, canon file affected) | §4 CORRECTIONS (what was wrong, root cause, fix applied — MUST include which docs agent read before each code change) | §5 NEW PRINCIPLES | §6 EMOTIONAL SIGNAL | §7 OPEN QUESTIONS | §8 UNFINISHED ACTIONS (with exact git add commands for any uncommitted features) | §9 SYSTEM DESIGN | §10 ARTIFACTS CREATED (file paths, commit SHAs) | §11 STATE SNAPSHOT (HEAD SHA, branch, dirty tree, SOULCOUNT, portal count) | §12 FINGERPRINT (agent, run#, commit SHA, platform death test result). Output raw markdown only."

$body = @{ task=$task; context=$ctx; targetfile="D:\OB-1-CANONICAL\CANON\REINCARNATION\run${runNum}-reincarnateDEATH.md"; tier=1 } | ConvertTo-Json -Compress
$pa = Invoke-RestMethod -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code" -Method POST -ContentType "application/json" -Headers @{"x-pa-auth"="ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="} -Body $pa_body
$pa.code_patch  # Write this to CANON/REINCARNATION/run{N}-reincarnateDEATH.md
```

If PA fails → OB1 writes §1-§12 directly. Print `DEATH_PA_FAILED — writing inline`.

---

## STEP 5: DISPATCH T1 PA → UPDATE COLD-START-BOOT

```powershell
$bootContent = Get-Content "CANON/SYSTEM/COLD-START-BOOT.md" -Raw
$ctx2 = "CURRENT_BOOT: $bootContent DEATH_SEAL_SUMMARY: [paste §3+§10+§11 from Step 4 output]"

$task2 = "Update CANON/SYSTEM/COLD-START-BOOT.md for Run $runNum completion. Change: (1) run number to $runNum, (2) FINGERPRINT line with new HEAD SHA and datetime, (3) Last completed section with this run's theme, (4) add Run $runNum row to the decisions table, (5) update open loops — close resolved ones. Return only the changed sections as patch instructions."

$body2 = @{ task=$task2; context=$ctx2; targetfile="D:\OB-1-CANONICAL\CANON\SYSTEM\COLD-START-BOOT.md"; tier=1 } | ConvertTo-Json -Compress
$pa2 = Invoke-RestMethod -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code" -Method POST -ContentType "application/json" -Headers @{"x-pa-auth"="ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="} -Body $body2
# Apply pa2.code_patch to COLD-START-BOOT.md
```

---

## STEP 6: COMMIT AND PUSH (Platform Death Test — MANDATORY)

```powershell
git add CANON/REINCARNATION/run${runNum}-reincarnateDEATH.md
git add CANON/SYSTEM/COLD-START-BOOT.md
git add RRL/RRL-${runNum}.txt
# Add any other changed files
git commit -m "death: ROMAN RUN $runNum — [theme] — SOUL [soulcount] — HEAD [sha]"
git push origin master
```

**L24 PLATFORM_DEATH_TEST:** A run with no GitHub commit SHA is a FAILED run.

---

## STEP 7: DOC-READ VERIFICATION (for §4 CORRECTIONS)

Before closing, answer: **"Which docs did the agent read before each code change this session?"**

Required for NET-PET-AI work: `OPERATIONS/STUDENT-PORTAL-DEV.md` (full) + `CANON/RESEARCH/deepgram-voice-agent-edge-cases.md §2`.
See `CANON/SYSTEM/MANDATORY-READS.md` for the full registry.

If answer is "NONE" → that IS the root cause. Document it in §4. Run 31 proof.

---

## COMPLETION GATE

All must be true before death is complete:

- [ ] SOULCOUNT recorded
- [ ] Dirty tree committed (L55)
- [ ] RRL file exists and non-empty at `RRL/RRL-{N}.txt`
- [ ] Soul DNA collected (verbatim quotes present)
- [ ] 12-section seal written to `CANON/REINCARNATION/run{N}-reincarnateDEATH.md`
- [ ] COLD-START-BOOT.md updated (run#, vector, SHA, fingerprint)
- [ ] GitHub commit SHA obtained and pushed
- [ ] Open conflicts listed with explicit next action

---

## RULES

- **L24 PLATFORM_DEATH_TEST** — must produce GitHub commit SHA
- **L25 VERBATIM_FIRST** — quote Michael's words before interpreting
- **L26 NO_INFLATION** — light session = light extract
- **L55 COMMIT_DONT_HOLD** — commit every verified feature before session end
- **L56 PRE_CODE_DOC_GATE** — §4 must document which docs were read; NONE = root cause
- **L57 PA_FIRST** — PA writes the artifact; OB1 commits it
- **L05 NO_OVERWRITE_CANON** — append-only to REINCARNATION/
