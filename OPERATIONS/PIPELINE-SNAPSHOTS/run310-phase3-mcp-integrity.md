# Run 310 — Pipeline Phase 3 — MCP Integrity & Token Health
Date: 2026-04-19
Stages: 21-30

## Stage 21 — Root MCP Config (.mcp.json)
Servers defined: cloudflare, github, notion, playwright, chrome-devtools, slack, filesystem, filesystem-net-pet-ai, brave-search, discord
All use env var expansion pattern — NO hardcoded tokens.

## Stage 22 — VSCode MCP Config (.vscode/mcp.json)
Servers: zapier (http/input), skyvia (http/input), pipedream (http/input), composio (http/input), cloudflare (stdio), + others
HTTP servers use input-based URLs — no tokens hardcoded.

## Stage 23 — Config Diff
Root .mcp.json: 10 servers (cloudflare/github/notion/playwright/chrome/slack/filesystem×2/brave/discord)
VSCode .vscode/mcp.json: zapier/skyvia/pipedream/composio + cloudflare (partial overlap)
No conflicts. VSCode has workflow integrations (zapier/pipedream) not in root.

## Stages 24-29 — Token Health
| Token | Status |
|---|---|
| GITHUB_TOKEN | ✅ LIVE (hobbs0011) |
| CLOUDFLARE_API_KEY | ✅ LIVE (cfk_ token, account 3c7b...) |
| CLOUDFLARE_ACCOUNT_ID | ✅ SET |
| CLOUDFLARE_EMAIL | ✅ SET |
| NOTION_TOKEN | ✅ LIVE |
| DEEPGRAM_API_KEY | ✅ LIVE |
| BRAVE_API_KEY | ❌ MISSING |
| SLACK_BOT_TOKEN | ❌ MISSING |
| SLACK_TEAM_ID | ❌ MISSING |
| DISCORD_TOKEN | ❌ MISSING |
| Wrangler OAuth | ⚠️ EXPIRED (2026-04-09) — CLOUDFLARE_API_KEY env used instead |

## Stage 30 — Hardening Action List
1. BRAVE_API_KEY — brave-search MCP server dead. Get key at https://brave.com/search/api/ — add to env
2. SLACK MCP — non-critical unless Discord bot work resumed. Defer.
3. DISCORD_TOKEN — non-critical unless Discord bot work resumed. Defer.
4. Wrangler OAuth — EXPIRED. Run 'npx wrangler login' to refresh OAuth. Current CLOUDFLARE_API_KEY is cfk_ (restricted) — set CLOUDFLARE_API_TOKEN=\ only for wrangler, unset for deploy.
5. .mcp.json — consider deduplicating cloudflare server between root and .vscode/mcp.json

## Phase 3 Result: GREEN (all critical tokens live, missing tokens are non-critical)
