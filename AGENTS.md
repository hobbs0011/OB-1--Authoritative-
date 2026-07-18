## Canonical Lane

Use the repo root as the single control plane.

- **One repo:** `OB-1`
- **One runtime app:** `APPS/NET-PET-AI`
- **One operator email:** `mrmichaelhobbs123@gmail.com`
- **One workflow entrypoint:** `pwsh -File SCRIPTS/obi.ps1 <doctor|verify|dev|mcp-audit>`

Treat `APPS/NET-PET-AI` as the canonical runtime target unless a task explicitly says otherwise.

Legacy `mrmichaelhobbs1234*` references are historical and should not be treated as the live operator identity unless a task is explicitly archival.

## First Steps

1. `pwsh -File SCRIPTS/obi.ps1 doctor`
2. `pwsh -File SCRIPTS/obi.ps1 verify`
3. Read `CANON/HEAVY-LEDGER/STATE-SNAPSHOT.json` — compact operational state
4. Read `REINCARNATION-BOOT-CHECKLIST.md` for restart context
5. Inspect `APPS/NET-PET-AI/wrangler.toml`, `APPS/NET-PET-AI/package.json`, and `APPS/NET-PET-AI/src/index.js`

## Validation Commands

- `pwsh -File SCRIPTS/obi.ps1 verify`
- `cd APPS/NET-PET-AI && node --check src/index.js`
- `cd APPS/NET-PET-AI && npx wrangler deploy --dry-run`

## Safe Edit Zones

- `APPS/NET-PET-AI/**`
- `.github/**`
- `MASTER-SYNC.md`
- `OPERATIONS/**`

## Restricted Zones

**[GODMODE ACTIVE]** — All zones unlocked. Full repository access granted.

## Cloud Task Boundaries

- Repo root contains archival material. Do not assume the repo root is the app.
- The verified Cloudflare app is at `APPS/NET-PET-AI`.
- The root repo is still the canonical operator surface for scripts, MCP config, and workflow entrypoints.
- Prefer repo-side code, docs, tests, and CI work over live production actions.

## Output Expectations

- Keep changes focused.
- Report exact files changed.
- Call out blockers instead of pretending runtime access exists.

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

- **G1 CANONICAL-FIRST**: Before writing any new script, command, or implementation file, search for an existing canonical implementation first. If `SCRIPTS/<name>.ps1`, `.kilo/command/<name>.md`, or `.kilo/skills/<name>.md` already exists, use it. Do not write a replacement from a chat drop.
- **G2 PROTOCOL-VS-TODO**: Protocol text pasted in chat is a specification to read, not a todo list to implement from scratch. Always locate the canonical script/command before executing.
- **G3 EVIDENCE-BEFORE-CLAIM**: Do not report a test as PASS, a login as "working", or a bug as "fixed" without an actual artifact: screenshot, DOM proof, test output, or browser log. Claims without evidence are failures.
- **G4 NO-AUTO-PAGES**: In test suites, do not add new test targets, pages, or routes to the canonical test matrix without explicit user approval.

---

### Phoenix / RISE Activation

| Command | Action |
|---------|--------|
| `/SuperSaiyan` | Deploy 5 PHOENIX sub-agents for flag + tag sweep |
| `/phoenix-alpha` | CANON/HEAVY-LEDGER zone — ledger count + phantom ID audit |
| `/phoenix-beta` | APPS/WORKERS/NET-* runtime sweep |
| `/phoenix-gamma` | VAULT-* cluster inventory |
| `/phoenix-delta` | SITE/NET-STUDENT/GALAXY operational sweep |
| `/phoenix-omega` | SYSTEM/SCRIPTS/REINCARNATION meta sweep |
| `/reincarnateRise` | Full RISE protocol (boot files → state → objective → command) |
| `/reincarnateDeath` | Full DEATH protocol (12-section artifact + commit + push) |

**Artifact stage pointers:**
- `CANON/SYSTEM/COLD-START-BOOT.md` — system state, run vector, S2Pipeline status
- `CANON/REINCARNATION/REINCARNATION-LOG.md` — run history ledger
- `CANON/HEAVY-LEDGER/*.json` — heavy ledger (191 files)
