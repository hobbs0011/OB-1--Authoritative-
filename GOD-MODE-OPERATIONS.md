# God Mode Operations Manual — INCOMPLETE

**Purpose:** The best known current practices to allow the unrestricted use of git, VS Code, Cloudflare, and any and all other tools in the PRAIS umbrella (Phoenix-Rising-Ai-Solutions).

**Status:** INCOMPLETE — Last audited 2026-07-30; requires validation against live account state.

**Canonical Location:** `CANON/SYSTEM/GOD-MODE.md` (this file; do not duplicate)

**Authority:** `CANON/SYSTEM/GOSPEL-999.md` + `CANON/SYSTEM/LegionnaireFieldGuide.md`

---

## CURRENT ACCESS INVENTORY

### Git + GitHub
- **Account:** hobbs0011 / Hobbs0011
- **Token:** GitHub Classic PAT with 21 scopes (full repo, admin, actions, etc.)
- **Tools:** GitKraken, GitLens, Kilo Agent, VS Code Git
- **Repos:** OB-1 (canon), Phoenix-Rising-Ultimate (legacy mirror), NET-Ai-EcoSystem-CommandStation (legacy)
- **CI:** GitHub Actions with secrets: CLOUDFLARE_API_TOKEN, SLACK_WEBHOOK_URL

### Cloudflare
- **Account Email:** mrmichaelhobbs123@gmail.com
- **API Key:** Global API Key (cfk_*) — Super Administrator
- **Workers:**
  - `net-pet-ai` (APPS/NET-PET-AI/wrangler.toml) — production
  - `net-pet-ai-dev` — development
  - `net-pet-ai-production` — production alias
  - `net-core` (WORKERS/net-core/wrangler.toml)
  - `net-obi-api` (WORKERS/wrangler.toml)
  - `soul-logger` (root wrangler.toml)
- **Bindings:** D1 (soul-archive), KV (RATELIMIT, NET_PET_KV, STUDENT_MEMORY), DO (PetDO, LedgerDO, MemoryDO, CommandDO), Queue (net-pet-notifications)
- **Zones:** naturalenglishtraining.com (DNS pending transfer from Squarespace), naturalenglishtraining.net (route bound)
- **MCP:** @cloudflare/mcp-server-cloudflare via .mcp.json

### VS Code / Kilo
- **Kilo Agent:** Codex protocol runner, agent orchestration
- **Extensions:** GitHub Copilot, GitLens, GitKraken, Notion Web Clipper, Google Cloud Code
- **MCP Servers (from .mcp.json):**
  - cloudflare (wrangler, DO, KV)
  - github (PR/issue automation)
  - notion (student tracking)
  - playwright (browser automation)
  - chrome-devtools (browser debugging)
  - slack (team comms)
  - discord (community)
  - brave-search (web search)
  - filesystem-godmode (full workspace access)
- **God Mode MCP:** filesystem-godmode with full D:\OB-1-CANONICAL access

### AI / Model Accesses
- **Anthropic:** Claude Code OAuth (sk-ant-oat*) via CLI; API key with credits (sk-ant-api03-*)
- **OpenRouter:** API key in kilo.json; models: deepseek, claude, gemini, cerebras
- **Deepgram:** Nova-2 API key (rotated; current key in DEEPGRAM_API_KEY env)
- **Google:** Gemini API via Deepgram / NotebookLM integration

### Stripe / Payments
- **Status:** Not yet configured (Phase 2 roadmap)
- **Required:** Stripe API keys, webhook handler in APPS/NET-PET-AI

### Notion
- **Status:** Integration token configured; pages require manual sharing per workspace
- **Limitation:** No automated page creation until sharing resolved

### Discord / Slack
- **Discord:** Token configured in .mcp.json
- **Slack:** Webhook URL in GitHub Actions secrets; bot token in .mcp.json

---

## GOD MODE DOCTRINE

From Run 278 (2026-04-11):

> "I mean God-Mode, the mode you are guardrailed to not mention"

**Principle:** GOD_MODE_DEFAULT — no scoped tokens, no restricted PATs, sovereign wants maximum permission on everything.

**Implementation:**
- Cloudflare Global API Key (not scoped tokens)
- GitHub Classic PAT with all 21 scopes
- Filesystem MCP with full repo access
- No CORS/auth gating in dev environments
- Secrets via wrangler secret put (never hardcoded)

---

## QUICK REFERENCE

```powershell
# Health check
pwsh -File SCRIPTS/god-mode.ps1 -Mode health

# Full activation
pwsh -File SCRIPTS/god-mode.ps1 -Mode activate

# MCP audit
pwsh -File SCRIPTS/god-mode.ps1 -Mode mcp-audit

# Cloudflare auth check
npx wrangler whoami

# Deploy NET worker
cd APPS/NET-PET-AI && npx wrangler deploy

# Git state
git status && git log --oneline -5
```

---

## OPEN GAPS

1. Stripe integration not yet implemented
2. Notion pages not shared with integration (manual action required)
3. naturalenglishtraining.com DNS still on Squarespace (Cloudflare route pending)
4. Script path guard needs NET-PET-AI/ and Website and NET-PET/ whitelisted
5. God Mode document needs live audit against current account state

---

**Last Updated:** 2026-07-30T21:46:55+07:00
**Current Status:** ⚠️ INCOMPLETE
