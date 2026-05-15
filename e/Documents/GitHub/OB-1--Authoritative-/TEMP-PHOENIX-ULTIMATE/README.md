# Phoenix-Rising-Protocol-Ultimate

> The canonical consolidation repository for the **Phoenix Rising Protocol** behind **Natural English Training**.

## What This Is

This repo is the immutable mirror of the Phoenix system — Soul DNA canon, operational artifacts, lesson content, and the NET-PET-AI runtime. Notion is the control plane; GitHub is the permanent record.

## Directory Structure

| Directory | Purpose |
|---|---|
| `APPS/` | Runnable applications — NET-PET-AI (Cloudflare Worker), ChattyNET, lesson prototypes |
| `APPS/NET-PET-AI/` | **Primary runtime target** — Cloudflare Worker powering OBI at naturalenglishtraining.net |
| `CANON/` | Soul DNA doctrine, teaching methodology, sealed source material |
| `GALAXY-LESSONS/` | Gospel 444 lesson content — HTML lesson files for student delivery |
| `OPERATIONS/` | Operational records — session logs, inventories, deploy analysis, protocols |
| `Website and NET-PET/` | Website source and NET-PET seed files |

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
