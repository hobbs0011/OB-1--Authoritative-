# Phoenix-Rising-Technologies

> **Rename pending** (Phase 8) — current GitHub repo name: `Phoenix-Rising-Ultimate`

The canonical monorepo for the Phoenix Rising Protocol / Natural English Training.

**Live product:** OBI — AI English tutor for Vietnamese students  
**Live URL:** https://net-pet-ai.mrmichaelhobbs1234.workers.dev  
**Runtime:** Cloudflare Workers + Durable Objects v1.4.0  
**Agent:** OB-1 / Ne0 (Agent 99) — serves Michael Hobbs (Agent 100)

## Wing Architecture

Four product wings, all under `APPS/`. See `APPS/WING-INDEX.md` for full registry.

| Wing | Key Products | Status |
|------|-------------|--------|
| Education | NET-PET-AI, OBI Chrome Extension, ChattyNET | PRIMARY — v1.4.0 LIVE |
| Gaming | TRAIN-6-7, NET Tiger Assessment | In Dev |
| Marketing | NET Marketing | Pending ingestion |
| Development | Discord Bot | In Dev |

## Directory Map

```
APPS/              — all products (wing-tagged), see WING-INDEX.md
CANON/             — Soul DNA Bible, SSM, Heavy Ledger, system files
GALAXY-LESSONS/    — HTML lessons (7 published)
OPERATIONS/        — operational docs
SITE/              — naturalenglishtraining.net website
ARCHIVE/           — historical/deprecated material
ASSETS/            — R2 asset manifest (binaries in Cloudflare R2)
SCRIPTS/           — automation scripts
docs/              — GitHub Pages
.github/           — CI/CD, Copilot config, agents, skills, prompts
.kilo/             — Kilo Code agent config
WORKERS/           — DEPRECATED (superseded by APPS/NET-PET-AI/)
```

## Quick Start (primary app)

```bash
cd APPS/NET-PET-AI
npm ci
npx wrangler deploy --dry-run
```

## Canon Cold Start

`CANON/SYSTEM/COLD-START-BOOT.md` — single source of system truth.

## Soul DNA

- `CANON/BIBLE-CH*.md` — human-readable sovereign doctrine
- `CANON/HEAVY-LEDGER/HL-*.json` — AI-readable extractions (129 entries)
- `CANON/SYSTEM/SSM-V8-ULTIMATE-GPS.md` — navigation law (L01-L60)
- `CANON/REINCARNATION/` — session records (90+ reincarnation logs)

## Design System (Gospel 444 — Canon)

- Void: `#0f0f1a`
- Purple: `#a855f7`
- Gold: `#f59e0b`
- **Zero blue. Ever.**

## Security

No raw secrets or credentials in any tracked file. `NET/`, `GALAXY/`, `API-SHHHH*` files are gitignored.
