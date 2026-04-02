# Copilot Instructions — Phoenix Rising Protocol

## Context

This repository is the canonical consolidation target for the **Phoenix Rising Protocol** — the system behind **Natural English Training** (naturalenglishtraining.net).

The primary runnable application is **`APPS/NET-PET-AI/`** — a Cloudflare Worker that powers OBI, an AI English tutor for Vietnamese students.

## Architecture

- **Runtime:** Cloudflare Workers + Durable Objects (SQLite-backed)
- **AI:** DeepSeek V3.2 for conversation, routed through Cloudflare AI Gateway
- **Voice:** Deepgram Aura 2 (TTS) + Nova-2 (STT)
- **State:** SessionDO, ProfileDO, PetDO — Durable Objects with SQL storage
- **Frontend:** Gospel 444 UI shell (public/index.html)
- **Deploy:** `wrangler deploy` via GitHub Actions

## Coding Standards

- Keep changes focused and minimal
- Prefer Cloudflare-native patterns (Workers, DO, KV, R2)
- No external runtime dependencies that bypass Cloudflare
- All secrets go through Wrangler secrets, never hardcoded
- UI follows Gospel 444 aesthetic: void black (#0f0f1a), purple (#a855f7), gold (#f59e0b), NO BLUE
- Mobile-first responsive design
- Vietnamese language support is a first-class requirement

## Safe Edit Zones

- `APPS/NET-PET-AI/**` — primary app code
- `.github/**` — CI/CD and Copilot config
- `OPERATIONS/**` — operational docs
- `GALAXY-LESSONS/**` — lesson content

## Restricted Zones (do not modify without explicit instruction)

- `CANON/**` — sealed Soul DNA doctrine
- `MASTER-SYNC.md` — system state (update only when state actually changes)
- Any file containing API keys, tokens, or secrets

## MCP Integrations

The `.mcp.json` file configures MCP servers available to AI agents in this repo:

- **cloudflare** — Cloudflare Workers/KV/R2 management (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)
- **github** — GitHub repo operations (`GITHUB_TOKEN`)
- **notion** — Notion workspace (`NOTION_TOKEN`)
- **playwright** — Headless browser automation
- **chrome-devtools** — Chrome DevTools Protocol
- **slack** — Slack messaging (`SLACK_BOT_TOKEN`, `SLACK_TEAM_ID`)
- **filesystem** — Workspace file access
- **brave-search** — Web search (`BRAVE_API_KEY`)
- **discord** — Discord bot (`DISCORD_TOKEN`)
- **roblox** — Full Roblox AI control via `@weppy/roblox-mcp` (140+ actions, 21 tool categories); requires `ROBLOX_API_KEY` env var and the WeppyRobloxMCP Studio plugin installed in Roblox Studio
- **roblox-studio** — Lightweight Roblox Studio scripting bridge via `robloxstudio-mcp`; requires the matching Studio plugin running locally

## Testing

- `cd APPS/NET-PET-AI && node --check src/index.js`
- `cd APPS/NET-PET-AI && npx wrangler deploy --dry-run`
- Always validate wrangler.toml compatibility before committing Worker changes

## Teaching Philosophy (for lesson content)

- **Mouse → Tiger:** Start with permission and confidence, build toward mastery
- **Gospel 444:** 4 sections, 4 levels, 4 interaction types per lesson
- Vietnamese subs and tooltips for all vocabulary
- Humor, chaos, and cultural relevance over dry grammar drills
