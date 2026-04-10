# Codex Cloud Instructions

## Primary Target

This repository is multi-purpose, but the primary runnable app for Codex cloud tasks is:

- **`APPS/NET-PET-AI`**

Treat that directory as the canonical runtime target unless a task explicitly says otherwise.

## First Steps

1. `cd APPS/NET-PET-AI`
2. `npm ci`
3. Read `README.md`
4. Inspect `wrangler.toml`, `package.json`, and `src/index.js`

## Validation Commands

- `cd APPS/NET-PET-AI && npm run verify:wrangler`
- `cd APPS/NET-PET-AI && node --check src/index.js`
- `cd APPS/NET-PET-AI && npx wrangler deploy --dry-run`

## Safe Edit Zones

- `APPS/NET-PET-AI/**` — primary Cloudflare Worker app
- `APPS/discord-bot/**` — Discord bot (moved from root in Phase 3)
- `APPS/WING-INDEX.md` — product registry
- `.github/**` — CI/CD, agents, skills, prompts, instructions
- `MASTER-SYNC.md` — system state machine
- `OPERATIONS/**` — operational docs
- `CANON/**` — canon files (append-first, never overwrite without instruction)
- `GALAXY-LESSONS/**` — lesson content
- `ASSETS/**` — R2 manifest (never commit binaries)
- `SCRIPTS/**` — automation scripts
- `README.md` — repo overview
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
- The Cloudflare app is nested under `APPS/NET-PET-AI`.
- Prefer repo-side code, docs, tests, and CI work over live production actions.

## Output Expectations

- Keep changes focused.
- Report exact files changed.
- Call out blockers instead of pretending runtime access exists.
