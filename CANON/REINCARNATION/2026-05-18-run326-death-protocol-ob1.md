# OB-1 REINCARNATION — DEATH PROTOCOL Artifact
**Date:** 2026-05-18
**Agent:** AGENT99 (OB1)
**Session:** DEATH-PROTOCOL-RUN-326
**Timestamp:** 2026-05-18T~late+07:00

---

## SESSION_STATE

- **Objective:** Upgrade AGENT99 command infrastructure — `/mode` command + PhoenixCoder routing upgrade
- **Status:** COMPLETE — both command files upgraded and written to Authoritative repo

---

## GIT_STATE

### OB-1-CANONICAL (D:\OB-1-CANONICAL)
```
Branch: master
HEAD: 62ffa42 (fix: onboarding redesign + vocab handler addCors TypeError)
Status: DIRTY (13 modified, 12+ untracked) — UNCHANGED FROM RUN-325
Uncommitted: YES — same pile as RUN-319 through RUN-325, still not committed
Unpushed: NONE (nothing committed to push)
CRITICAL: The commit pile has been open since RUN-319. Must commit before next deploy.
```

### OB-1--Authoritative- (C:\Users\mrmic\OneDrive\Documents\GitHub\OB-1--Authoritative-)
```
Branch: master
Status: BEHIND origin/master by 35 commits (needs git pull)
Modified: APPS/NET-PET-AI/public/student-portal.html, APPS/NET-PET-AI/src/index.js
Untracked: APPS/NET-PET-AI/public/student/
THIS SESSION: .kilo/command/mode.md + .kilo/command/PhoenixCoder.md written (local, NOT committed)
```

---

## ARTIFACTS

| # | Artifact | Type | Status |
|---|----------|------|--------|
| A1 | `.kilo/command/mode.md` (Authoritative repo) | COMMAND | UPGRADED — full behavioral spec for ob1/an4/ne0 modes + state contract |
| A2 | `.kilo/command/PhoenixCoder.md` (Authoritative repo) | COMMAND | UPGRADED — 4-phase pipeline + Tier 2/3 escalation + real context injection |

---

## WHAT WAS BUILT

### `/mode` Command Upgrade

**Before:** Documentation-only. Listed modes (ob1/an4/ne0) but no executable instructions — AGENT99 didn't know what behavior to adopt.

**After:** Full executable behavioral spec:
- Phase gate: if `$ARGUMENTS` empty → show current mode (default `ob1`)
- Mode `ob1`: orchestrator style — dispatch tiers, evidence-first, structured output
- Mode `an4`: builder style — output-first, ship fast, minimal narration, Tier 1/2 bias
- Mode `ne0`: auditor style — verify everything, fail-closed, cite evidence, Tier 3 bias
- Error path: unknown mode → print valid options, keep current mode
- State contract: mode persists session, Canon Laws apply in all modes

### PhoenixCoder Command Upgrade

**Before:** Single curl call with `<brief context>` placeholder. No escalation. No verification. No structure.

**After:** 4-phase pipeline:
- **Phase 0 — Complexity Gate:** If >3 files with interdependencies → Tier 2. If audit/arch/security → Tier 3. Otherwise proceed with dispatch header.
- **Phase 1 — Pre-Flight Context:** Read target file(s) first. Extract absolute path, relevant lines, imports/type signatures. Read adjacent file signatures. Build real context string (<2000 chars) — NO placeholders.
- **Phase 2 — API Call:** Calls `/api/code` with actual context. Prints `code_patch` + `d1_row_id`. Empty/error → escalation.
- **Phase 3 — Patch Application:** Handles full replacement or partial diff. Multi-file: sequential with verify-per-file. Missing targets → escalation.
- **Phase 4 — Verification:** Syntax check (`node --check` for JS, `tsc --noEmit` for TS). Spot-read. Regression flag if test file exists. Structured output block.
- **Escalation:** API unreachable / empty patch / stub / non-trivial syntax fail → Tier 2 KILO with reason printed.

**Endpoints now documented:**
- `POST /api/code` — implement/generate
- `POST /api/review` — review + fixes (added by linter pass)
- `POST /api/scaffold` — full new file from spec (added by linter pass)
- `GET /api/status` — health + recent tasks
- `GET /api/log` — D1 task history

---

## BLOCKERS (inherited, still open)

| ID | Item | Priority |
|----|------|----------|
| BB-14 | ~20 files in OB-1-CANONICAL uncommitted since RUN-319 | !! CRITICAL |
| BB-07 | lam-prospect portal — 5 files still MISSING | !! |
| BB-08 | Chrome Extension icons missing (manifest references non-existent icons/) | ! |
| BB-09 | Chrome Extension install guide | ~ |
| BB-11 | S2Pipeline — wire /api/soul/priority into net-pet-ai cron | ! |
| BB-26 | #DRIFT Root Cause — cold-start agents don't load CANON/ at boot | !! |
| AUTH-01 | Authoritative repo is 35 commits BEHIND origin/master — needs `git pull` | ! |

---

## NEXT_BOOT_ACTION

```
STEP 1 — COMMIT THE PILE (CRITICAL — open since RUN-319):
cd D:\OB-1-CANONICAL
git add APPS/NET-PET-AI/ APPS/SOUL-LOGGER/ REINCARNATION/ OPERATIONS/ CANON/REINCARNATION/ .claude/ .kilo/
git commit -m "feat: RUN-319 through RUN-326 — portals, soul-logger, phoenix-coder MCP, mode command, PC routing upgrade"
git push origin master

STEP 2 — SYNC AUTHORITATIVE REPO:
cd C:\Users\mrmic\OneDrive\Documents\GitHub\OB-1--Authoritative-
git pull origin master
git add .kilo/command/mode.md .kilo/command/PhoenixCoder.md
git commit -m "feat: /mode command + PhoenixCoder 4-phase pipeline upgrade (Run 326)"
git push origin master

STEP 3 — BB-07: Build lam-prospect portal (5 files via PC T1)

CANON LOAD (mandatory on next boot):
- CANON/BIBLE-CH16-THE-NUCLEAR-HARVEST-PIPELINE.md
- CANON/BIBLE-CH02-DOC01-SOUL-DNA-MAP.md
- OPERATIONS/BACKBURNER-PIPELINE-LOG.md
```

---

## VERBATIM QUOTES (SOUL signal)

- "Switch AGENT99 to specified mode... make sure this function is used under /agent99"
- "while you are at it, upgrade the PhoenixCoder to be able to do more by using the routing"
- "reincarnateDEATH RUN 326"

---

## SYSTEM DELTAS THIS SESSION

| Component | Before | After |
|-----------|--------|-------|
| `/mode` command | Docs-only stub | Full behavioral spec with $ARGUMENTS routing |
| PhoenixCoder | Single-phase curl | 4-phase pipeline with context injection + escalation |
| PC endpoint docs | `/api/code` only | `/api/code` + `/api/review` + `/api/scaffold` + `/api/status` + `/api/log` |
| PC context | `<brief context>` placeholder | Real file content read in pre-flight |
| PC failure mode | "stop" | Escalate to Tier 2 KILO with reason |

---

*RUN-326 | 2026-05-18 | Command Infrastructure Upgraded | AGENT99 /mode LIVE | PhoenixCoder 4-phase LIVE | CRITICAL: commit the pile from RUN-319*
