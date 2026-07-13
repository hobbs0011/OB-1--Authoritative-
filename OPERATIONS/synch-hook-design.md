# SYNCH HOOK — AUTOMATIC COMMAND SYNCHRONIZATION DESIGN

**Run:** 165  
**Author:** AGENT99  
**Status:** ADDITIVE ONLY — no existing command behavior changed.

## Problem
Multiple concurrent sessions (Rise/Scout/March/Supply/Scholar/Death) do not synchronize automatically.  
State drift accumulates because synch is manual, not part of the command lifecycle.

## Solution
Add `synch-hook.ps1` as a **pre/post wrapper** around every command invocation.

### Hook Contract
| Phase | Action | Fail behavior |
|-------|--------|---------------|
| PRE   | Record current HEAD + timestamp in `.kilo/synch-pre-<Command>.json` | HALT if write fails |
| POST  | Compare current HEAD to pre-recorded HEAD; write phetrail | Continue, flag DRIFT_DETECTED |

### Integration Points
- `/ReincarnateRise` → pre + post
- `/PhoenixScout` → pre + post
- `/forcemarch` → pre + post
- `/SupplyLines` → pre + post
- `/Scholar` → pre + post
- `/reincarnateDeath` → pre + post (already has idempotency guard; synch hook adds state marker)

### Phetrail Output
Each hook invocation writes a phetrail under `CANON/PHEROMONES/`:
- `PheTrail-run{N}-synch-{timestamp}-{command}-{stage}.json`

### Non-Breaking Guarantee
- No modification to `obi.ps1` command verbs.
- No modification to existing pipeline scripts.
- Hook is invoked by explicit call, not by implicit side effect.
- Existing workflows continue unchanged if hook is absent.

## Next Session Actions
1. Add `synch-hook.ps1` invocation to `SCRIPTS/obi.ps1` command pipeline (requires explicit Michael authorization to modify obi.ps1).
2. Consolidate duplicate `SYNCH-STATE.md` (root vs OPERATIONS/) into canonical `SYNCH-STATE.md`.
3. Rebuild `inverted-index.json` with RunMax>=165 to restore SoulSearch functionality.
