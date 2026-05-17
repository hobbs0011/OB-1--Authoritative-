# Ultimate Tool Stack — Agent-99 Arsenal (2026)

> **Snapshot:** 2026-03-25 22:40 ICT
> **Source:** Assets & Accounts DB + system knowledge
> **Purpose:** GitHub mirror of the Tool Stack Soul DNA (Notion page is 148 synced blocks — unreadable by API)

---

## 🔴 PRODUCTION TIER

### Cloudflare (PAID)
- **Account:** mrmichaelhobbs1234@gmail.com (paid tier)
- **Second account:** hobbs@naturalenglishtraining.com
- **Services:** Workers, Pages, DNS, D1 (SQLite), KV, Durable Objects, R2
- **No merge possible** — manual migration required between accounts
- **PENDING:** Add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID as GitHub secrets

### net-pet-ai (Cloudflare Worker)
- **Role:** PRODUCTION worker — OBI student-facing app
- **Stack:** CF Workers + Durable Objects + D1 + KV
- **Domain:** naturalenglishtraining.net → Cloudflare Workers
- **Status:** ✅ LIVE

### DeepSeek
- **Role:** OBI /api/chat — primary AI brain
- **Status:** ✅ LIVE (PRODUCTION)

### Deepgram Aura 2
- **Role:** OBI TTS (aura-2-orion-en)
- **Status:** ✅ LIVE (PRODUCTION)

### GitHub (hobbs0011)
- **Role:** Canonical repo account
- **Repos:** Phoenix-Rising-Protocol-Ultimate (private), Phoenix-Rise-Immortalize- (private)
- **Note:** Notion AI GitHub integration linked to NaturalEnglishTraining org, NOT hobbs0011

### Firebase (PAID)
- **Role:** Potential deployment target for static apps (Galaxy Lessons, Classroom Manager)
- **Alternative to:** Cloudflare Pages
- **Console:** https://console.firebase.google.com
- **Status:** Active/trial — confirmed 2026-03-25

---

## 🟣 BUILD TIER

### GitHub Actions
- **Role:** CI/CD deploy pipeline → wrangler deploy
- **Status:** ✅ Active

### GitHub Copilot (Premium)
- **Role:** Agent 99 — coding agents, deployment
- **Status:** ✅ Active (premium credits)

### Notion
- **Role:** Command Plane — Project HQ, Agent-99, Agent-98, Agent-97
- **Plan:** Legendary Pioneer
- **Status:** ✅ Active

### VS Code (Insiders)
- **Role:** Dev environment + Cline/Roo Code (Claude)
- **Status:** ✅ Active

### Wrangler CLI
- **Role:** Cloudflare deploy tool
- **Status:** ✅ Active

### GitHub — NaturalEnglishTraining (Org)
- **URL:** https://github.com/NaturalEnglishTraining
- **Repos:** demo-repository, NET-Marketing, TheRomeProtocol
- **Note:** This is the org connected to Notion AI's GitHub integration
- **Status:** ⏳ Setup Needed

---

## 🟢 SUPPORT TIER

### Gemini (Google)
- **Role:** Agent-98 (Anakin) builder role. Architecture and UI
- **Status:** ✅ Active

### Claude
- **Role:** Forensic audit and governance. Agent-97 role
- **Status:** ✅ Active

### ChatGPT (GPT-4o)
- **Role:** Codex CLI, artifact gen
- **Status:** ✅ Active

### Perplexity
- **Role:** Research, competitive analysis, MASTERMIND7 origin. Plexy API (sonar-pro)
- **Status:** ✅ Active

### NotebookLM (Google)
- **Role:** Structured notes, source analysis
- **Status:** ✅ Active

### Telegram
- **Role:** Class updates, team communication
- **Status:** ✅ Active

### Zalo
- **Role:** Student comms (Vietnamese students)
- **Status:** ✅ Active

### Chrome Translator Extension
- **URL:** https://chromewebstore.google.com/detail/pnpdnibdembnnlaiibkeandepjajegoi
- **Status:** ✅ Active (installed 2026-03-23)

---

## ⚪ LEGACY TIER

### GitHub (mrmichaelhobbs1234-lang)
- **URL:** https://github.com/mrmichaelhobbs1234-lang
- **Repos:** phoenix-ob1 (PUBLIC ⚠️ SECRET RISK — wrangler.toml), phoenix-drift-casestudy
- **Action:** Set phoenix-ob1 to PRIVATE

### GitHub (hobbs0011)
- **URL:** https://github.com/hobbs0011
- **Repos:** NET-Ai-EcoSystem-CommandStation (PUBLIC, dormant since 2025-11-17)
- **Action:** Archive or transfer to hobbs0011

### Roblox Open Cloud API
- **Role:** Student engagement/reward system
- **Status:** CONCEPT only — keyed but not live

---

## 🔒 Known Gaps / Action Items

1. **CLOUDFLARE_API_TOKEN** not set as GitHub secret → blocks GitHub Actions deploy bridge
2. **phoenix-ob1 repo is PUBLIC** with wrangler.toml → secret exposure risk
3. **NaturalEnglishTraining org** connected to Notion AI instead of hobbs0011 → blocks direct repo access
4. **SOVEREIGN_KEY rotation** still pending
5. **Ghost CF workers** not yet deleted (phoenix-ob1, phoenix-empire, phoenix-rising-protocol)
6. **Firebase** capabilities not yet audited — hosting, Firestore, Auth, Functions available?
7. **No merge path** between two Cloudflare accounts

---

## Cloudflare vs Firebase — Deployment Audit (2026-03-25)

For static HTML apps (Galaxy Lessons, Classroom Manager):

| Factor | Cloudflare Pages | Firebase Hosting |
|--------|-----------------|-----------------|
| Already in stack | ✅ YES | ✅ YES (paid) |
| Cost | Free (100K req/day) | Free (10GB/mo) |
| Auto-deploy from GitHub | ✅ | ✅ (needs CLI) |
| Global CDN | ✅ 300+ cities | ✅ Google CDN |
| Future backend | Workers + D1 (built) | Functions + Firestore |
| Domain routing | Already on CF DNS | Needs config |

**Recommendation:** Cloudflare for anything touching net-pet-ai or naturalenglishtraining.net domain. Firebase as backup or for standalone apps needing Google Auth.

---

*Generated from Assets & Accounts DB + system knowledge. Notion source page (synced blocks) remains the visual reference for Michael.*
