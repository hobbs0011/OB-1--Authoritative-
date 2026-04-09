# Phoenix-Rising-Ultimate

> The canonical consolidation repository for the **Phoenix Rising Protocol** behind **Natural English Training**.

## What This Is

This repo is the immutable mirror of the Phoenix system — Soul DNA canon, operational artifacts, lesson content, and the NET-PET-AI runtime. Notion is the control plane; GitHub is the permanent record.

## Directory Structure

| Directory | Purpose |
|---|---|
| `APPS/NET-PET-AI/` | ⚡ **PRIMARY RUNTIME** — Cloudflare Worker powering OBI at naturalenglishtraining.net |
| `APPS/obi-chrome-extension/` | ⚡ **CANONICAL Chrome Extension** v0.3.0 — sidepanel, vocab trainer, homework checker |
| `APPS/firebase/` | Legacy Firebase infra (firestore rules, public folder) |
| `APPS/TRAIN-6-7/` | Archive — CommandBar + Lua demo blueprint |
| `ARCHIVE/` | Retired codebases — phoenix-ob1, NET-CommandStation, Phoenix-Rise-Immortalize, drift casestudy, chrome-ext v0.1 |
| `CANON/` | 🔒 Soul DNA doctrine, teaching methodology — sealed source material (do not modify) |
| `DISCORD-BOT/` | Discord bot — Docker/Railway deployment |
| `GALAXY-LESSONS/` | Gospel 444 lesson HTML files for student delivery |
| `OPERATIONS/` | Operational records — session logs, inventories, deploy analysis, protocols |
| `PIPELINE/` | 20-stage Cloudflare deploy guide |
| `PULSE-HANDOFFS/` | Agent handoff records between Codex runs |
| `QA/` | Launch checklist |
| `SCRIPTS/` | Cloudflare setup shell scripts |
| `SITE/` | 🌐 **CANONICAL website source** — naturalenglishtraining.com (index, assessment, gallery, sitemap) |
| `WORKERS/net-core/` | Deprecated Worker stub — superseded by NET-PET-AI |
| `ASSETS/` | Artwork and brand assets |

## Key Files

| File | Purpose |
|---|---|
| `AGENTS.md` | Codex Cloud / Copilot agent instructions |
| `MASTER-SYNC.md` | Live operating state and system identity |
| `SECURITY.md` | Security policy and incident reporting |
| `.github/copilot-instructions.md` | GitHub Copilot context for autonomous coding |

## Architecture

- **Runtime:** Cloudflare Workers + Durable Objects (SQLite-backed)
- **AI Brain:** DeepSeek V3.2 via Cloudflare AI Gateway
- **Voice:** Deepgram Aura 2 (TTS) + Nova (STT)
- **Control Plane:** Notion (Agent-99 / OB1)
- **Immutable Mirror:** This repo
- **CI/CD:** GitHub Actions + Copilot Coding Agent

## Command Structure

| Agent | Role |
|---|---|
| Agent-100 | Michael Hobbs — Sovereign authority |
| Agent-99 (OB1) | Legion Command Station — orchestration |
| Agent-98 (AnA) | Anakin Fleet 1 — chaos/build lane |
| Agent-97 (Ne0) | Balance point — synthesis node |

## Brand Rules

- **Public:** Natural English Training
- **Internal:** Phoenix Rising Protocol
- **Teaching Law:** Mouse → Tiger (permission over perfection)
- **Colors:** `#0f0f1a` (void), `#a855f7` (purple), `#f59e0b` (gold), NO BLUE

## Cost Target

< $50/month total

## Getting Started (NET-PET-AI)

```bash
cd APPS/NET-PET-AI
npm ci
npm run verify:wrangler
npx wrangler deploy --dry-run
```

## License

Proprietary — Michael Hobbs / Natural English Training. All rights reserved.
