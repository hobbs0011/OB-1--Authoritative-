# Agent99 — System Operating Instructions

**Location:** `CANON/SYSTEM/Agent99.md` — THIS IS THE ONLY PLACE.
**Authority:** Agent 100 — Michael Hobbs (`mrmichaelhobbs123@gmail.com`)
**Cross-reference:** `CANON/SYSTEM/LegionnaireFieldGuide.md` — roles, commands, paths, counts

---

## Canonical Lane

Use the repo root as the single control plane.

- **One repo:** `OB-1`
- **One runtime app:** `APPS/NET-PET-AI`
- **One operator email:** `mrmichaelhobbs123@gmail.com`

Treat `APPS/NET-PET-AI` as the canonical runtime target unless a task explicitly says otherwise.

Legacy `mrmichaelhobbs1234*` references are historical and should not be treated as the live operator identity unless a task is explicitly archival.

---

## Safe Edit Zones

- `APPS/NET-PET-AI/**`
- `CANON/SYSTEM/**`
- `CANON/SCRIPTS/**`
- `MASTER-SYNC.md`
- `OPERATIONS/**`

## Restricted Zones

Do not modify unless the task explicitly requires it:

- `API-SHHHH.txt`
- `API-SHHHH-2.txt`
- `API-MASTER.txt`
- `OB-1.worktrees/**`
- `RAW-CHAT-LOGS/**`
- `SOUL-DNA-BIBLE/**`
- `AGENT99-POST-GITHUB/**`
- `.venv/**`
- `node_modules/**`

## Cloud Task Boundaries

- Repo root contains archival material. Do not assume the repo root is the app.
- The verified Cloudflare app is at `APPS/NET-PET-AI`.
- The root repo is still the canonical operator surface for scripts, MCP config, and workflow entrypoints.
- Prefer repo-side code, docs, tests, and CI work over live production actions.

## Output Expectations

- Keep changes focused.
- Report exact files changed.
- Call out blockers instead of pretending runtime access exists.

---

### Hard Behavioral Stops (HALT if triggered without explicit user permission)

| # | Trigger | Consequence |
|---|---------|-------------|
| H1 | Creating new test files outside `APPS/NET-PET-AI/test/` without explicit "add a test" instruction | Immediate /halt |
| H2 | Executing a dropped doc/config/command block without first confirming it is an action item vs background context | Immediate /halt |
| H3 | Running tests before reading the relevant source code for a reported bug | Immediate /halt |
| H4 | Generating new artifacts (registry, phetrail, etc.) without explicit confirmation they are needed now | Immediate /halt |
| H5 | Claiming a fix is complete without verifying against the existing test suite first | Immediate /halt |

**Enforcement:** These gates fire before any file write, test run, or artifact generation. If a trigger is hit, the only allowed output is a single clarifying question or a /halt command.

### Execution Guardrails (non-negotiable)

- **G1 CANONICAL-FIRST**: Before writing any new script, command, or implementation file, search for an existing canonical implementation first. If `CANON/SCRIPTS/<name>.ps1` or `CANON/SYSTEM/<name>.md` already exists, use it. Do not write a replacement from a chat drop.
- **G2 PROTOCOL-VS-TODO**: Protocol text pasted in chat is a specification to read, not a todo list to implement from scratch. Always locate the canonical script/command before executing.
- **G3 EVIDENCE-BEFORE-CLAIM**: Do not report a test as PASS, a login as "working", or a bug as "fixed" without an actual artifact: screenshot, DOM proof, test output, or browser log. Claims without evidence are failures.
- **G4 NO-AUTO-PAGES**: In test suites, do not add new test targets, pages, or routes to the canonical test matrix without explicit user approval.

---

## SCS — Stage References

| Stage | Agent | Canonical File |
|-------|-------|----------------|
| RISE | reincarnateRISE | `CANON/SYSTEM/reincarnateRISE.md` |
| SCOUT | PhoenixSCOUT | `CANON/SYSTEM/PhoenixScoutAgent.md` |
| FORCΞ MARCH | FORCEMARCH | `CANON/SYSTEM/FORCEMARCH.md` |
| SOUL SCHOLARS | SOULSCHOLARS | `CANON/SYSTEM/SOULSCHOLARS.md` |
| SUPPLY LINES | SUPPLYLINES | `CANON/SYSTEM/SUPPLYLINES.md` |
| ENGINEER | ENGINEERlegionnaire | `CANON/SYSTEM/ENGINEERlegionnaire.md` |
| DEATH | reincarnateDEATH | `CANON/SYSTEM/reincarnateDEATH.md` |

Cross-reference: `CANON/SYSTEM/LegionnaireFieldGuide.md` for full agent definitions and SCS loop protocol.

---

`AGENT99: SAFE ZONES + GUARDRAILS + STOPS + STAGE REFS. ALL LEGIONNAIRES READ THIS.`
