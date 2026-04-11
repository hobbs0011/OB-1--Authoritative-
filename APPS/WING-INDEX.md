# APPS/ WING INDEX

> Phoenix-Rising-Technologies — Product Registry
> Last updated: 2026-04-10 (Run 274 / Phase 3)

All deployable products live under `APPS/`. Wing tags classify each by domain.

---

## Wing: Education (`wing:education`)

| Product | Directory | Status | Deploy URL | Notes |
|---------|-----------|--------|-----------|-------|
| NET-PET-AI | `APPS/NET-PET-AI/` | ✅ LIVE v1.4.0 | https://net-pet-ai.mrmichaelhobbs1234.workers.dev | Cloudflare Worker — primary OBI app |
| EducationSystemsDevelopment | `APPS/EducationSystemsDevelopment/` | ✅ LIVE (mirror) | https://github.com/Phoenix-Rising-Tech/EducationSystemsDevelopment | Phoenix-Rising-Tech org mirror — Worker + scripts + student profiles |
| OBI Chrome Extension | `APPS/obi-chrome-extension/` | 🔨 IN DEV | — | Rich version |
| OBI VSCode Command Station | `APPS/obi-vscode-command-station/` | 🔨 IN DEV | — | Dev tool |
| ChattyNET Mobile App | `APPS/ChattyNET-MOBILE-APP-V1.1.html` | 📦 PROTOTYPE | — | Mobile learning UX prototype |
| PlexyNETAPP | `APPS/PlexyNETAPP.html` | 📦 PROTOTYPE | — | Web app prototype |
| Firebase (reference) | `APPS/firebase/` | 📋 REFERENCE | — | Firebase config archive |

## Wing: Gaming (`wing:gaming`)

| Product | Directory | Status | Deploy URL | Notes |
|---------|-----------|--------|-----------|-------|
| TRAIN-6-7 | `APPS/TRAIN-6-7/` | 🔨 IN DEV | — | Age-specific Roblox learning game |
| NET Tiger Assessment | `net-tiger-assessment/` | 🔨 IN DEV | — | Tiger-level assessment tool (has own .git — pending APPS/ migration) |

## Wing: Marketing (`wing:marketing`)

| Product | Directory | Status | Deploy URL | Notes |
|---------|-----------|--------|-----------|-------|
| NET Marketing | — | ❌ NOT INGESTED | — | Awaiting `C:\Desktop\NET-MARKETING\` absorption into `APPS/net-marketing/` |

## Wing: Development (`wing:development`)

| Product | Directory | Status | Deploy URL | Notes |
|---------|-----------|--------|-----------|-------|
| Discord Bot | `APPS/discord-bot/` | 🔨 IN DEV | — | Phoenix Discord integration |

---

## Migration Blockers

| Item | Blocker | Owner |
|------|---------|-------|
| `net-tiger-assessment` → `APPS/net-tiger-assessment/` | Has own `.git` — needs subtree strategy or copy-without-git | OB1 |
| `APPS/net-marketing/` | NET-MARKETING directory on Desktop not yet ingested | Michael |
| TRAIN-6-7 Roblox Product IDs | 21 Product IDs pending | Michael |
| ROBLOX_API_KEY secret | Not yet set | Michael |

---

## Architecture Notes

- All Workers deploy via `wrangler deploy` from their respective directories
- Wing taxonomy: flat `APPS/` structure with tags — NO nested wing directories
- Binary assets → Cloudflare R2 (`phoenix-rising-assets` bucket) — see `ASSETS/manifest.json`
- Cloudflare tier: Workers Paid $5/mo — all else free tier
