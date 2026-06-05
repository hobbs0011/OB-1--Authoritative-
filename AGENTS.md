## Claude Custom Chatmode (Cline extension dropdown)

Registered in `~/.claude/settings.json` → `chatModes.Claude`:

| Field | Value |
|-------|-------|
| **agentName** | `OB-1 Claude Sonnet 4.5` |
| **description** | `Claude Sonnet 4.5 — dedicated Anthropic instance carrying run316 OB-1 canonical ledger context. Use for deep audits, final rulings, and reincarnation decisions.` |
| **roleDefinition** | `You are Claude — the dedicated Anthropic Sonnet 4.5 model instance, wired to the run316 canonical OB-1 ledger context. Always reference AGENTS.md and the Regeneration roadmap before any deep run. MARSHAL_RUNS_FIRST · NO_ASSUME_HEAD · BOOT_FILE_AGE_SWEEP active.` |

Set up simply: `swicth to Claude`.

> **File:** `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`  
> Authentication: `~/.claude/.credentials.json` (OAuth session — `sk-ant-oat01…`, subscription: **Pro**, TL;DR: `claude-sonnet-4-20250514`)

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
