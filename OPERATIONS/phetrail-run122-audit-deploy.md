# PHEROMONE TRAIL — FULL AUDIT DEPLOY CYCLE
**Run 122 | 2026-06-13 | Session: Kilo audit → deploy attempt**
**Strength: 90/100** | Tracer: Kilo (Sonnet 4.5)

---

## WHAT WAS

Full-system audit requested by Michael. Scope: git, infrastructure, config, codebase, state/documents, security, doctrine, pipeline, ops.

## WHAT WAS FOUND (critical findings)

### CRITICAL
1. `x-pa-auth` hardcoded in 18+ files (JS, PS1, MD). Value: `ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=`
2. `DEEPSEEK_API_KEY` in plaintext `.env` at repo root: `[REDACTED-ROTATE]`
3. BB-53: API key in git history — `RRL/ClaudeTheRetard1.txt:2466`, key compromised, must rotate + purge
4. 14 endpoints on phoenix-architecti unauthenticated (rate-limited only)
5. Run 122 artifacts uncommitted: HL-700, HL-702, pipeline-run122, starmap-run122, rfkw-run122, RRL-121, RRL-122

### HIGH
6. phoenix-architecti router syntax errors at lines 120-174 — malformed if/else nesting
7. PCC1 error 1042 — broken
8. DEATH pipeline hollow: death_runs=0, session-capture.ps1 never triggers /api/incarnate/death
9. Backburner watcher missing — L81 F&F violation, 48+ BB entries/run with no operator surfacing
10. SOUL contamination: extractUserMessages uses `obj.role` vs `obj.message.role` — systemic in incarnate.js
11. COLD-START-BOOT 9 runs stale (Run 113), lists offboarded students Quy/Minh as active
12. STATE-SNAPSHOT 16 runs stale (Run 106)
13. REINCARNATION-LOG gap: Runs 105-122 missing from file

## DEPLOY ATTEMPTS

| Worker | Result | Error |
|--------|--------|-------|
| net-pet-ai | ✅ SUCCESS | Version 12f8363a |
| phoenix-architecti | ❌ FAIL | `ReferenceError: WatchdogAlarm is not defined` at race.js:276 |
| phoenix-pcc-1 | ❌ FAIL | `Cannot apply new-class migration to class 'LegionRunner' — already depended on by existing DOs` |

## DEPLOY FAILURES ANALYSIS

**phoenix-architecti:** `race.js:276` exports `ForceAwarenessAlarm extends WatchdogAlarm` but `WatchdogAlarm` class is defined at line 192 INSIDE the same file — AFTER the export statement at line 276. The class ordering is wrong: export references a class not yet declared. Node `--check` passed because Node treats class declarations as hoisted — but CF Workers runtime does NOT hoist in the same way across module boundaries.

**phoenix-pcc-1:** Migration conflict. `LegionRunner` class is already deployed as a DO. The wrangler.toml has `new_classes = ["LegionRunner"]` in migration v2. Re-deploying this migration tag fails because the class already exists in production. The migration needs to be removed from wrangler.toml for subsequent deploys.

## FILES MODIFIED THIS SESSION

Working tree: 18 modified + 26 untracked files.

Key uncommitted artifacts:
- `CANON/HEAVY-LEDGER/HL-700.json`, `HL-702.json`
- `CANON/PIPELINE/pipeline-run122.json`
- `CANON/SOUL-KEYWORDS/rfkw-run122.txt`
- `CANON/STARMAP/starmap-run122.json`
- `RRL/RRL-121.txt`, `RRL/RRL-122.txt`

## CONNECTING KEYWORDS

`phoenix-architecti deploy fail` → `WatchdogAlarm hoisting` → `race.js:192 vs :276` → `class ordering fix`
`pcc1 deploy fail` → `LegionRunner migration conflict` → `wrangler.toml migration v2` → `remigrate or skip`
`net-pet-ai deploy success` → `version 12f8363a` → `4 assets uploaded` → `prod healthy`

## NEGATIVE TRAIL

Deploy attempted before syntax check at CF layer. Local `node --check` passed but CF runtime class hoisting differs. Lesson: test deploy in dry-run FIRST, not after local syntax check.

## L77 TRIGGERS

- DEPLOY FAILED (phoenix-architecti, pcc1)
- DEPLOY SUCCEEDED (net-pet-ai)
- MISTAKES MADE (deploy attempted without CF-layer class ordering verification)

