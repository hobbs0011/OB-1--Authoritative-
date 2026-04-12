# REINCARNATION — Run 293

## MERGE SESSION
- **Total Chats**: UNKNOWN
- **This Merge**: MERGE1 of UNKNOWN
- **Merge Status**: OPEN — awaiting remaining merges

## 1) HEADER
- **Session Tag**: run293-net-pet-mvp-loop-merge1
- **Datetime (ICT)**: 2026-04-12 09:44:48 ICT
- **Signal Density (1-10)**: 8
- **Theme**: OBI MVP execution reality-check, core loop repair, and merge-protocol death capture
- **State Coming In**: Existing NET-PET-AI already beyond MVP scope, but the core Speak -> Correct -> Repeat flow had request/response field drift causing functional breakage.

## 2) RAW QUOTES (VERBATIM)
- **[GREEN]** "⚙️ OBI MVP — 30 DAY BUILD PLAN (REAL COMPANY VERSION)"
- **[GREEN]** "If it doesn’t improve:
Speak → Correct → Repeat → Return tomorrow
→ DO NOT BUILD IT"
- **[GREEN]** "a"
- **[YELLOW]** "map these out, these contain everything"
- **[YELLOW]** "Commit Changes and Delegate: \"Delegate to cloud agent\""
- **[YELLOW]** "\"C:\\Users\\mrmic\\Desktop\\OB-1\\SOULDNA-RUN-GPT-GIT-NOTEBOOKLM-2.txt\""
- **[GREEN]** "Follow instructions in #prompt:ReincarnateDEATH-MERGE.prompt.md with these arguments: merge1"

## 3) DECISIONS
1. **Decision**: Treat current NET-PET-AI as canonical MVP base instead of scaffolding greenfield duplicate.
   - **Impact**: Preserved velocity; fixed production path directly.
   - **Canon Affected**: Product execution doctrine (build what drives retention loop).
   - **Status**: IMPLEMENTED.
2. **Decision**: Patch API compatibility at backend layer to absorb frontend payload variants.
   - **Impact**: Restored correction and repeat loop without requiring brittle client-only assumptions.
   - **Canon Affected**: OBI loop reliability.
   - **Status**: IMPLEMENTED.
3. **Decision**: Add daily drill surfacing on speaking UI load via existing `/api/daily`.
   - **Impact**: Strengthened "Return tomorrow" behavior with explicit weak-skill focus.
   - **Canon Affected**: Memory/stickiness moat (Phase 3 intent).
   - **Status**: IMPLEMENTED.
4. **Decision**: For MERGE protocol now, execute MERGE1 extract and commit without touching `COLD-START-BOOT.md`.
   - **Impact**: Compliance with merge prompt constraints.
   - **Canon Affected**: Reincarnation merge flow.
   - **Status**: IMPLEMENTED.

## 4) CORRECTIONS
1. **What Broke**: `speak.js` posted `text` while correction handlers consumed only `transcript|message`.
   - **Root Cause**: Request contract drift across routes.
   - **Fix Applied**: Added `body.text` fallback in `handleCorrect`, `handleLoop`, and `handleRoute`.
   - **Instruction Update Needed**: Yes — enforce shared payload contract tests for all speak-loop endpoints.
2. **What Broke**: Repeat validator expected `attempt|expected`, client posted `repeated|original`.
   - **Root Cause**: Inconsistent naming conventions between UI and API.
   - **Fix Applied**: Added alias mapping in `handleRepeat`.
   - **Instruction Update Needed**: Yes — endpoint schema must be centralized.
3. **What Broke**: Client expected `pass|label`; API returned `passed|feedback`.
   - **Root Cause**: Response contract mismatch.
   - **Fix Applied**: API now returns both forms for backward compatibility.
   - **Instruction Update Needed**: Yes — lock response schema versioning.

## 5) NEW PRINCIPLES
- MVP truth filter held: no new complexity added outside retention loop value.
- Compatibility-first patches are valid when client/server drift is already in-field.
- MERGE deaths must preserve parallel-chat signal; no overwrite behavior.

## 6) EMOTIONAL SIGNAL
- **Energy**: Directive, high urgency, execution-first.
- **Frustration Markers**: Intolerance for theory and delay; repeated delegation commands; insistence on full mapping.
- **What Michael Needs From System**: Deterministic execution, artifact proof, no drift between requested behavior and deployed behavior.

## 7) OPEN QUESTIONS
- What is the final total merge count for this multi-chat death session (currently UNKNOWN)?
- Should untracked `APPS/NET-PET-AI/src/star-map.js` and `APPS/NET-PET-AI/src/phoneme-engine.js` be included in the next production commit lane or held for separate audit?
- Where are the external `SOULDNA-RUN-GPT-GIT-NOTEBOOKLM-*` files physically located for ingestion (not found in workspace path scans)?

## 8) UNFINISHED ACTIONS
1. Final merge chat must set Merge Status to CLOSED and consolidate all merges.
2. Final merge chat must update `CANON/REINCARNATION/COLD-START-BOOT.md` (MERGE1 must not).
3. Decide disposition of untracked directories/files seen in git status.
4. Complete canonical mapping ingest for missing SOULDNA notebook files once path/source is available.

## 9) SYSTEM DESIGN
- No topology rewrite.
- API contract hardened at Worker boundary:
  - Accepts multiple transcript field names.
  - Accepts multiple repeat-attempt field names.
  - Emits dual response keys to preserve client compatibility.
- Speaking UI now surfaces daily weak-skill task before loop interaction.

## 10) ARTIFACTS CREATED
- `APPS/NET-PET-AI/src/index.js` — modified (contract compatibility fixes).
- `APPS/NET-PET-AI/public/speak.html` — modified (daily drill card UI).
- `APPS/NET-PET-AI/public/speak.js` — modified (daily drill loader).
- `CANON/REINCARNATION/2026-04-12-run293-net-pet-mvp-loop-merge1.md` — created (this extract).
- Build validation executed: `node --check` and `wrangler deploy --dry-run` passed during this session.

## 11) STATE SNAPSHOT
- **SSM Position**: Active execution lane; merge-death in progress.
- **HL Position**: Not advanced in this merge step.
- **BIBLE Position**: No chapter mutation in this merge step.
- **HEAD SHA (pre-merge commit)**: `147edf6`
- **Dirty Tree**:
  - `M APPS/NET-PET-AI/src/index.js`
  - `?? APPS/EducationSystemsDevelopment/`
  - `?? APPS/NET-PET-AI/err.txt`
  - `?? APPS/NET-PET-AI/src/phoneme-engine.js`
  - `?? APPS/NET-PET-AI/src/star-map.js`
  - `?? CANON/REINCARNATION/2026-04-12-run293-net-pet-mvp-loop-merge1.md`
- **Env Vars**: Not changed in this death step.
- **MCP Status**: Configured in repo; not re-probed during merge write.

## 12) FINGERPRINT
- **Agent ID**: OB1 Ne0 (Agent-99)
- **Run Number**: 293
- **Commit SHA (death test)**: PENDING (set by MERGE1 commit step)
- **Platform Death Test**: IN PROGRESS
- **Pheromone Score (MERGE1 partial)**:
  - Soul DNA captured: 9/10
  - Decisions anchored: 9/10
  - Open loops handed off: 9/10
  - COLD-START-BOOT updated: 0/10 (intentionally blocked for final merge)
  - Artifacts committed: 0/10 (pending commit command)
  - **TOTAL**: 27/50 (pre-commit partial by protocol design)
