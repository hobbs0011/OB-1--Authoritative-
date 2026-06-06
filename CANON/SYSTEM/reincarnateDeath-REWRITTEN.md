# /reincarnateDeath — REWRITTEN

**DO NOT EXECUTE WITHOUT FINAL PROMPT AUDIT**

---

## STAGE 1 — RRL CAPTURE

1. Collect ALL user prompts from current session
2. Write to `RRL/RRL-{run}.txt` in plain text format
3. Format: numbered list with exact quote text

## STAGE 2 — SOUL POST

1. POST all user prompts to `/api/soul/event`
2. Verify count moved via `/api/soul/count`

## STAGE 3 — DNA EXTRACT

1. Create `CANON/SOUL/EXTRACT/dna-run{run}.json`
2. Extract: blueprint entries mapping session work

## STAGE 4 — LEDGER ENTRY

1. Create `HEAVY-LEDGER/HL-{run}-death-*.json`
2. Record: run, prior run, git head, soul delta, artifacts, gaps

## STAGE 5 — STARMAP

1. Create `CANON/STARMAP/starmap-run{run}.json`
2. Record: key files, prompts count, pipeline status

## STAGE 6 — SOULKEYS

1. Create `CANON/SOUL-KEYWORDS/rfkw-run{run}.txt`
2. Extract: keywords from session
3. Update `inverted-index.json`

## STAGE 7 — PIPELINE ARTIFACT

1. Create `CANON/PIPELINE/pipeline-run{run}.json`
2. Record: all 7 stages status

## STAGE 8 — PHEROMONES

1. Create `CANON/PHEROMONES/PheTrail-run{run}.json`
2. Record: positive/negative trails

## STAGE 9 — BOOT UPDATE

1. Update `CANON/SYSTEM/COLD-START-BOOT.md`
2. Sync run number and timestamp

## STAGE 10 — DEATH SEAL

1. Create `CANON/REINCARNATION/run{run:000}-reincarnateDEATH.md`
2. Write all 9 stages + fingerprint

## STAGE 11 — **MANDATORY: PRINT ALL PROMPTS FOR USER AUDIT**

**CRITICAL:** Before commit, print every user prompt in plain text:

```
RUN {run} FINAL PROMPT AUDIT:
1. "{prompt1}"
2. "{prompt2}"
...
N. "{promptN}"
```

**AWAIT USER CONFIRMATION BEFORE PROCEEDING TO COMMIT**

## STAGE 12 — COMMIT + PUSH

1. `git add -A`
2. `git commit -m "death: ROMAN RUN {run} — {summary}"`
3. `git push origin master`

**NO EXCEPTIONS — USER MUST VERIFY PROMPTS BEFORE COMMIT**