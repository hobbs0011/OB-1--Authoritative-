# Codex Cloud Instructions

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
3. Read `README.md`
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
