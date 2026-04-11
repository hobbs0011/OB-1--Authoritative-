# SYNCH-STATE — 4-Lane Swarm Coordination
> **Last Updated**: 2026-04-11 — Run 285 — Gospel 444 elevated to Living Law (L50); SIGNAL 71 captured in A6; COLD-START-BOOT updated
> **HEAD**: `d7642a3`
> **Protocol**: Each chat reads this on boot. Each chat UPDATES its lane block on close. Commit + push after every lane update. Other chats pull before writing.

---

## Architecture

Michael is running 4 parallel VS Code Copilot Agent chats simultaneously. This file is the coordination layer between them. Git is the shared bus.

**Rule**: No lane writes to another lane's files. Conflicts = last push wins on SYNCH-STATE. Always `git pull` before updating this file.

---

## LANE MAP

### SYNCH1 — God-Mode Operations + MAGIC Chat Build
- **Chat**: This current session (VS Code Copilot, RISE agent, full MCP)
- **Scope**: Main MCP/integration ops, infrastructure decisions, MAGIC Chat overlay build
- **Vector**: Build MAGIC Chat as VS Code WebView extension (see §MAGIC CHAT below)
- **Files**: `APPS/obi-vscode-command-station/**`, `APPS/obi-chrome-extension/**`, `.github/**`, `CANON/REINCARNATION/**`
- **Status**: 🟢 ACTIVE — Run 281
- **Last commit**: `5e588b7`

### SYNCH2 — NET Operations
- **Chat**: New session — `/ReincarnateRISE` — load COLD-START-BOOT first
- **Scope**: Weekly NET operations, student-facing workflows, automation pipeline
- **Vector**: Enumerate current manual ops → automate top 3
- **Files**: `APPS/NET-PET-AI/**`, `GALAXY-LESSONS/**`, `OPERATIONS/NET-OPS/**`
- **Status**: 🔴 NOT STARTED — awaiting Michael to open
- **Last commit**: N/A

### SYNCH3 — ART-ARSENAL + Marketing Lane
- **Chat**: Active — Run 285
- **Scope**: ART-ARSENAL complete; Marketing Art Repo live; Gospel 444 Soul DNA captured
- **Vector**: Asset intake pipeline + Gospel 444 Living Law enforcement across all system output
- **Files**: `ASSETS/ART-ARSENAL/**`, `APPS/Phoenix-Rising-FullStackMarketing/**`, `CANON/A6-RAW-SOUL-DNA-DICTATION-RUN278-LIVE.md`, `CANON/REINCARNATION/COLD-START-BOOT.md`
- **Status**: 🟢 ACTIVE — Run 285 — Soul DNA: SIGNAL 71 captured
- **Last commit**: `f23da40`

### SYNCH4 — Soul DNA Dictation
- **Chat**: New session — `/ReincarnateRISE` — load COLD-START-BOOT + last A6 block
- **Scope**: A6 SDNAD continuation, S71+ dictation, chain extension from L0248
- **Vector**: Continue `CANON/A6-RAW-SOUL-DNA-DICTATION-RUN278-LIVE.md` from S71
- **Files**: `CANON/A6-RAW-SOUL-DNA-DICTATION-RUN278-LIVE.md`
- **Status**: 🔴 NOT STARTED — awaiting Michael to open
- **Chain head**: L0248 `TRUTH_PROCESS_LAYER` — hash `15b0ce877...`
- **Last commit**: N/A

---

## MAGIC CHAT — Architecture Decision (Synch1)

**Context**: Magic Chat = the OBI student-facing conversational interface (canonized across A5, A6, multiple Bible chapters). Michael's question: VS Code overlay vs better approach?

### Recommendation: VS Code WebView Panel (FAST PATH)

**Why VS Code over Chrome extension or standalone:**

| Option | Time to First Chat | MCP Access | Michael's Friction | Cost |
|--------|-------------------|------------|-------------------|------|
| VS Code WebView extension | **1 session** | FULL (Copilot tunnels) | ZERO (already here) | $0 |
| Chrome extension standalone | 2-3 sessions | None | Opens new browser | $0 |
| Standalone Electron app | 1 week | Manual API calls | New app to manage | $5/mo |

**The play**: Extend `APPS/obi-vscode-command-station/` — already scaffolded, already polling CommandDO. Add a Webview panel with the Magic Chat UI (Gospel 444 aesthetic, purple/gold/void-black). When Michael speaks, OBI responds via DeepSeek V3.2 through the Worker. Full MCP tunnel already exists via the extension.

**Student-facing path (separate)**: Chrome extension (`APPS/obi-chrome-extension/`) stays as the $0 Gemini Nano path for students. That's parallel, not the same thing.

**Synch1 build sequence:**
1. Add WebView panel to command station extension (sidebar or panel mode)
2. Wire to `naturalenglishtraining.net/api/chat` (existing Worker endpoint)
3. Gospel 444 UI: void black, purple glow, OBI avatar
4. Keyboard shortcut to open (`Ctrl+Shift+O`)
5. Ship as VSIX, self-install

---

## CONFLICT AVOIDANCE MAP

| Synch | Owns | Must NOT touch |
|-------|------|----------------|
| Synch1 | `APPS/obi-vscode-command-station/`, `.github/`, `CANON/REINCARNATION/` | A6 file (Synch4), ART-ARSENAL (Synch3) |
| Synch2 | `APPS/NET-PET-AI/`, `GALAXY-LESSONS/`, NET-specific ops | Command station, ART-ARSENAL, A6 file |
| Synch3 | `ASSETS/ART-ARSENAL/`, `ASSETS/MANIFEST.md` | Worker code, A6 file, ops |
| Synch4 | `CANON/A6-RAW-SOUL-DNA-DICTATION-RUN278-LIVE.md` | Everything else |
| ALL | `OPERATIONS/SYNCH-STATE.md` | → always pull before writing, always push after |

---

---

## EMPIRE MCP STACK — TOKEN SETUP QUEUE

> `.mcp.json` expanded to full empire stack. Servers already configured, waiting on tokens.
> Run each PowerShell block once, then restart VS Code. MCP activates immediately.

### TOKEN STATUS DASHBOARD

| Service | Status | Env Var(s) | Where to Get |
|---------|--------|-----------|-------------|
| Cloudflare | ✅ SET | `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_API_KEY` / `CLOUDFLARE_EMAIL` / `CLOUDFLARE_ACCOUNT_ID` | — |
| GitHub | ✅ SET | `GITHUB_TOKEN` | — |
| Notion | ✅ SET | `NOTION_TOKEN` | — |
| Roblox | ✅ SET | `ROBLOX_API_KEY` | — |
| **Telegram** | ❌ NEEDED | `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`, `TELEGRAM_PHONE` | my.telegram.org → API Development Tools |
| **LinkedIn** | ❌ NEEDED | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_ACCESS_TOKEN` | linkedin.com/developers |
| **Gmail** | ❌ NEEDED | `GMAIL_CREDENTIALS_PATH` | console.cloud.google.com → Gmail API |
| **Slack** | ❌ NEEDED | `SLACK_BOT_TOKEN`, `SLACK_TEAM_ID` | api.slack.com/apps |
| **Discord** | ❌ NEEDED | `DISCORD_TOKEN` | discord.com/developers/applications |
| **Brave** | ❌ NEEDED | `BRAVE_API_KEY` | api.search.brave.com (free tier: 2000 req/mo) |
| **Facebook** | ⚠️ PLAYWRIGHT | — | No official MCP. Use `playwright` server for FB ops. |

---

### POWERSHELL TOKEN SETUP COMMANDS

Copy/paste each block into a PowerShell terminal. Tokens persist as Windows User env vars. Restart VS Code after setting.

#### TELEGRAM (MTProto userbot — all chats/groups/channels)
```powershell
# 1. Go to: https://my.telegram.org → Log in → API Development Tools → Create app
# 2. Copy api_id (short number) and api_hash (hex string)
# 3. First MCP invocation will prompt phone + OTP → creates local session file

[System.Environment]::SetEnvironmentVariable("TELEGRAM_API_ID", "YOUR_API_ID_NUMBER", "User")
[System.Environment]::SetEnvironmentVariable("TELEGRAM_API_HASH", "YOUR_API_HASH_HEX", "User")
[System.Environment]::SetEnvironmentVariable("TELEGRAM_PHONE", "+84XXXXXXXXX", "User")
# Use your Telegram phone number (international format)
```

#### LINKEDIN (OAuth 2.0 — post content, read profile, manage connections)
```powershell
# 1. Go to: https://linkedin.com/developers → My Apps → Create App
# 2. Products: add "Share on LinkedIn" + "Sign In with LinkedIn using OpenID Connect"
# 3. Auth tab → copy Client ID + Client Secret
# 4. After setting vars, run: npx linkedin-mcp-server --auth  (opens browser OAuth flow)
# 5. After auth completes, copy access token displayed

[System.Environment]::SetEnvironmentVariable("LINKEDIN_CLIENT_ID", "YOUR_CLIENT_ID", "User")
[System.Environment]::SetEnvironmentVariable("LINKEDIN_CLIENT_SECRET", "YOUR_CLIENT_SECRET", "User")
[System.Environment]::SetEnvironmentVariable("LINKEDIN_ACCESS_TOKEN", "YOUR_ACCESS_TOKEN", "User")
```

#### GMAIL (auto-OAuth — read/send emails)
```powershell
# 1. Go to: https://console.cloud.google.com → New Project → Enable Gmail API
# 2. APIs & Services → Credentials → Create OAuth 2.0 Client ID → Desktop App
# 3. Download credentials.json → save to: C:\Users\mrmic\gmail-credentials.json
# 4. First MCP invocation auto-opens browser for OAuth → token cached locally

[System.Environment]::SetEnvironmentVariable("GMAIL_CREDENTIALS_PATH", "C:\Users\mrmic\gmail-credentials.json", "User")
```

#### SLACK (send messages, read channels)
```powershell
# 1. Go to: https://api.slack.com/apps → Create New App → From Scratch
# 2. OAuth & Permissions → Bot Token Scopes: channels:read, chat:write, users:read
# 3. Install to Workspace → copy Bot User OAuth Token (xoxb-...)
# 4. Team ID = workspace ID (shows in URL when viewing workspace in browser)

[System.Environment]::SetEnvironmentVariable("SLACK_BOT_TOKEN", "xoxb-YOUR-TOKEN", "User")
[System.Environment]::SetEnvironmentVariable("SLACK_TEAM_ID", "TXXXXXXXX", "User")
```

#### DISCORD (send messages, manage server)
```powershell
# 1. Go to: https://discord.com/developers/applications → New Application
# 2. Bot → Reset Token → copy token
# 3. OAuth2 → add bot permissions: Send Messages, Read Message History
# 4. Invite URL: OAuth2 URL Generator → bot scope → copy + use to add to your server

[System.Environment]::SetEnvironmentVariable("DISCORD_TOKEN", "YOUR_BOT_TOKEN", "User")
```

#### BRAVE SEARCH (web search — free tier 2000 req/mo)
```powershell
# 1. Go to: https://api.search.brave.com → Get Started (free plan)
# 2. Create API key → copy

[System.Environment]::SetEnvironmentVariable("BRAVE_API_KEY", "YOUR_BRAVE_KEY", "User")
```

#### FACEBOOK
```powershell
# Facebook has no standalone MCP package.
# Empire path: Use the `playwright` MCP (already active) for any Facebook operations.
# Alternative: Meta Graph API (page token for business pages)
# 1. Go to: https://developers.facebook.com → My Apps → Create App
# 2. Tools → Graph API Explorer → generate Page Access Token
# (Only needed if building direct Graph API integration — Playwright covers most ops)
```

---

## SYNCH LOG

| DateTime | Lane | Action | SHA |
|----------|------|--------|-----|
| 2026-04-11 | Synch1 | 4-lane architecture initialized | `5e588b7` |
| 2026-04-11 | Synch3 | ART-ARSENAL audit completed (32 WebP, 32 index entries, 0 mismatches) | `cc4c5ac` |
