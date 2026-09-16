# CLOUDFLARE MANIFEST — OB-1 CANONICAL

**Account:** mrmichaelhobbs123@gmail.com
**Account ID:** 3c7b1766bd8fdc9e01211d2b390315ea
**Last audited:** 2026-08-15
**Audit command:** `pwsh -File SCRIPTS/obi.ps1 cf-audit`
**Last audit result:** total 18 · healthy 15 · broken 0 · untracked 0

This file is the authoritative inventory of all live Cloudflare assets.

---

## Workers (8 live)

| Worker | URL | Health | Tracked in Repo | Notes |
|---|---|---|---|---|
| frosty-bush-c14f | frosty-bush-c14f.mrmichaelhobbs123.workers.dev | ✅ 200 | ✅ APPS/FROSTY-BUSH-C14F | Phoenix Vault — Google Docs OAuth writer. Early soul-DNA capture tool, superseded by soul-logger. |
| net-obi-api | net-obi-api.mrmichaelhobbs123.workers.dev | ✅ 200 | ✅ APPS/NET-OBI-API | Legacy API worker. Early prototype (waitlist + hardcoded chat, AI never wired). Superseded by net-pet-ai. Kept as legacy reference. |
| net-pet-ai | net-pet-ai.mrmichaelhobbs123.workers.dev | ✅ 200 | ✅ APPS/NET-PET-AI | Primary worker — canon branch |
| net-pet-ai-production | net-pet-ai-production.mrmichaelhobbs123.workers.dev | ✅ 200 | ⚠️ APPS/NET-PET-AI-PRODUCTION (bundle rescued) | **SEPARATE DEPLOY PIPELINE.** Running v1.6.2+v68.1-phase4-advanced (repo is v1.5.0). 30 DO class exports — monetization layer (Stripe, affiliate, cohort analysis, churn, rate limiting). Contains phase6 schema (7 SQLite tables). Notion pre-blacklist: LIVE. DO NOT deploy canon code here — will orphan 30 live DO namespaces. Bundle rescued 2026-05-18. v1.6.2 source not yet recovered. |
| net-pet-ai-staging | net-pet-ai-staging.mrmichaelhobbs123.workers.dev | ❌ 404 | ✅ APPS/NET-PET-AI | Staging slot — no health route by design. Known exclusion (in expect-404 list). |
| phoenix-coder | phoenix-coder.mrmichaelhobbs123.workers.dev | ❌ 404 | ⚠️ PROJECTS/phoenix-coder (standalone) | Standalone repo. API-only worker — intentionally no GET / route. Known exclusion. |
| soul-logger | soul-logger.mrmichaelhobbs123.workers.dev | ✅ 200 | ✅ APPS/SOUL-LOGGER | Chat dump ingestion drone. D1: soul-archive. Parsers: claude / chatgpt / notebooklm / vscode / gemini. |
| submission-api | submission-api.mrmichaelhobbs123.workers.dev | ❌ 404 | ✅ APPS/SUBMISSION-API | NET assessment submission handler. D1: net-submissions. Resend email notify. API-only (POST /api/submit only). Known exclusion. |

### Removed / Deleted (no longer in CF account)

| Worker | Reason |
|---|---|
| net-core | Deleted via CF API — 404 orphan, early 2025 prototype, no repo source |
| net-pet-ai-mvp | Deleted via CF API — old MVP deployment, 404 |
| net-pet-ai-selection | Deleted via CF API — 404 orphan, superseded by 4room apps |
| net-pet-ai-cubs | Deleted via CF API — 404 orphan, superseded by 4room apps |
| obi-landing | Deleted via CF API — 404 dead Pages project |
| phoenix-v5-test | Deleted via CF API — 404 orphan, early 2025 prototype, no repo source |

---

## Pages Projects (11 live)

| Project | URL | Live | Tracked in Repo | Notes |
|---|---|---|---|---|
| net-github-dashboard | canon.net-github-dashboard.pages.dev | ✅ 200 | ✅ APPS/PAGES/net-github | GitHub-style NET dashboard. New deploy 2026-08-15. |
| career-4room | career-4room.pages.dev | ✅ 200 | ✅ APPS/PAGES/career-4room | NET Career pathway assessment. RESCUED 2026-05-18 — promoted to production branch. |
| cubs-4room | cubs-4room.pages.dev | ✅ 200 | ✅ APPS/PAGES/cubs-4room | NET Cubs child assessment (ages 3–7). RESCUED 2026-05-18 — promoted to production branch. |
| naturalenglishtraining | naturalenglishtraining.pages.dev | ✅ 200 | ✅ APPS/PAGES/naturalenglishtraining | Marketing site — primary brand domain. Rescued to repo 2026-05-17. |
| net-marketing-landing | net-marketing-landing.pages.dev | ✅ 200 | ✅ APPS/PAGES/net-marketing-landing | Landing page. Rescued to repo 2026-05-17. |
| netpetai-presentation | netpetai-presentation.pages.dev | ✅ 200 | ✅ APPS/PAGES/netpetai-presentation | Interactive presentation deck with cloned chat.js. Rescued to repo 2026-05-17. |
| professional-4room | professional-4room.pages.dev | ✅ 200 | ✅ APPS/PAGES/professional-4room | NET Professional (adult) pathway assessment. RESCUED 2026-05-18 — promoted to production branch. |
| professional-selection | professional-selection.pages.dev | ✅ 200 | ✅ APPS/PAGES/professional-selection | Selection funnel: University vs Career. RESCUED 2026-05-18 — promoted to production branch. |
| tigers-4room | tigers-4room.pages.dev | ✅ 200 | ✅ APPS/PAGES/tigers-4room | NET Tigers child assessment (ages 8–17). RESCUED 2026-05-18 — promoted to production branch. |
| tigers-selection | tigers-selection.pages.dev | ✅ 200 | ✅ APPS/PAGES/tigers-selection | Selection funnel: Cubs vs Tigers. RESCUED 2026-05-18 — promoted to production branch. |
| university-4room | university-4room.pages.dev | ✅ 200 | ✅ APPS/PAGES/university-4room | NET University pathway assessment. RESCUED 2026-05-18 — promoted to production branch. |
| mailala | mailala.pages.dev | ✅ 200 | ✅ WEBSITE/mailala | Hostel & Bar site — warm island aesthetic, 14 venue photos, booking engine, PWA, SEO. Deployed 2026-09-16 via wrangler. |

### Removed / Deleted (no longer in CF account)

| Project | Reason |
|---|---|
| net-tiger-assessment | Deleted via CF API — 404 dead, source rescued to APPS/NET-PET-AI/public/ |
| net-marketing | Deleted via CF API — 404 dead |
| obi-landing | Deleted via CF API — 404 dead |

---

## KV Namespaces (3)

| Name | ID |
|---|---|
| SESSIONS | 4adc1924c50b49df8dc260e95efd68bf |
| WAITLIST | a30d57a9da6e4446a536aef7ccf8756f |
| CACHE | ea5c8e99cb584dee9ab4f9ba5ed421c9 |

---

## D1 Databases (2)

| Name | UUID | Created | Tables |
|---|---|---|---|
| soul-archive | c69a11bc-064b-478f-9b1f-e9b8e2431fb8 | 2026-05-05 | 7+ |
| net-submissions | 1a7246ce-1227-4205-9234-76cbd036fa48 | 2026-05-05 | 3+ |

> **Note:** Initial audit reported 0 tables — false negative. Both databases have active schema confirmed via CF MCP API. Counts are live and may increase as ingestion progresses.

---

## Ghost Assets Rescued (2026-05-17)

Files that existed in the deployed `net-pet-ai-production` worker but were absent from git. All rescued to `APPS/NET-PET-AI/public/`:

| File | Size | Status | Notes |
|---|---|---|---|
| minh-methodology.html | 22,284 bytes | ✅ RESCUED | Multi-tab portal — Methodology tab |
| minh-profile.html | 22,481 bytes | ✅ RESCUED | Multi-tab portal — Profile tab |
| minh-transcripts.html | 25,227 bytes | ✅ RESCUED | Multi-tab portal — Transcripts tab (Apr 13, Apr 24 sessions) |
| minh-action-plan.html | 26,759 bytes | ✅ RESCUED | Multi-tab portal — Action Plan tab |
| net-tiger-assessment.html | 35,213 bytes | ✅ RESCUED | Tiger Assessment app (bilingual VI/EN) |

**Pre-existing in repo (not ghost):**
- `public/minh-parent-portal.html` — Dashboard tab (was already in repo)
- `public/student/minh-private.html` — Simple card format (WRONG template, used for new students)

---

## Root Legacy Dirs

Audit run 2026-05-18. Five directories were flagged as potential root ghosts predating the APPS/ reorganization.

| Dir | Ruling | Notes |
|---|---|---|
| `net-tiger-assessment\` | DELETED (pre-audit) | Legacy root copy of NET Tiger Assessment Pages site. Content rescued to `APPS/NET-PET-AI/public/net-tiger-assessment.html` and `APPS/nettiger-pages/`. Already removed from disk before this audit. Staged deletion committed here. |
| `DISCORD-BOT\` | DELETED (pre-audit) | Older root copy of Train 6-7 discord bot. Superseded by `APPS/discord-bot/` (same version, identical source). Already removed from disk before this audit. Staged deletion committed here. |
| `CHROME-EXT\` | DELETED (pre-audit) | Root copy of Chrome extension at v0.1.0 — older than `APPS/obi-chrome-extension/` (v0.3.0). Superseded by APPS copy. Already removed from disk before this audit. Staged deletion committed here. |
| `src\` | DELETED (pre-audit) | Root-level `src/` containing discord bot command files — duplicate of `DISCORD-BOT/src/`. Already removed from disk before this audit. Staged deletion committed here. |
| `worker\` | MOVED → `APPS/PHOENIX-EMPIRE-DEV/` | `phoenix-empire` worker, v67.0-REVENUE-PIPELINE. Local dev artifact — never deployed to CF (not in manifest, has local `.wrangler/state/` SQLite). Unique code: `magic_chat_endpoint.js`, `revenue_logic.js`. `ALLOWED_ORIGINS: magic-chat-phoenix.vercel.app`. Moved to APPS/ for archival — do not deploy without full review. |

---

## Other Apps (Non-CF)

Apps in `APPS/` with no Cloudflare Worker or Pages deployment entry in this manifest. Audited 2026-05-18.

| Name | Deploy Target | Status | Notes |
|---|---|---|---|
| EducationSystemsDevelopment | NONE | DELETED | Empty directory — 0 files, 0 bytes. Created as placeholder. Removed from git and disk 2026-05-18. |
| Phoenix-Rising-FullStackMarketing | NONE | LOCAL-ONLY | Marketing art/asset library — logos, iconology, social graphics, brand assets. No deploy target (static image repo). Canonical image library for NET/OBI brand. |
| NET-PET-AI-merge | N/A | DEAD | Listed in merge commit (2f7fbb2) as an `AA` entry — empty directory artifact from workspace merge. Does not exist on disk. No content, no action needed. |
| TRAIN-67 | NONE | LOCAL-ONLY | Roblox game "Survive a Brainrot" — 41 Lua modules, full battle reports, specs, launch docs. No Cloudflare deploy target (Roblox-hosted game, not a CF worker). Moved from root `TRAIN-67/` → `APPS/TRAIN-67/` 2026-05-18. Stub `APPS/TRAIN-6-7/` (5 files) deleted. |
| discord-bot | Railway / Render / Fly.io | LOCAL-ONLY | Train 6-7 Discord bot (`train67-discord-bot`). Node.js + discord.js. Not yet deployed. README lists Railway/Render/Fly.io as hosting options. No deploy secrets configured. |
| firebase | Firebase Hosting | LOCAL-ONLY (never configured) | Firebase config for NET OBI — static hosting + Firestore student profiles. `.firebaserc` has `"TODO_SET_PROJECT_ID"` — project ID never set. No functions source dir. Never deployed. Config is a template scaffold only. |
| obi-chrome-extension | Chrome Web Store | LOCAL-ONLY | OBI Chrome Extension v0.3.0 (manifest_version 3). AI English tutor + homework checker. Not published — sideload only per `SIDELOAD-GUIDE.md`. |
| obi-vscode-command-station | VS Code Marketplace | LOCAL-ONLY | OBI Command Station VS Code extension v1.0.0. Phoenix Rising Protocol — command tunnel. Not published to marketplace. |
| phoenix-ob1 | CF Workers | DEAD | `phoenix-ob1-system` worker — v139-TRUTH-SEALED, deployed to `mrmichaelhobbs1234.workers.dev` (old account, note: `1234` not `123`). 5 DO classes with migration tags. NOT in current CF account (`mrmichaelhobbs123`). Treat as dead — old account artifact. Has unique DO architecture (5 classes). |
| PHOENIX-EMPIRE-DEV | CF Workers (dev only) | DEAD | `phoenix-empire` worker, v67.0-REVENUE-PIPELINE. Moved from root `worker/` 2026-05-18. Local dev only — has `.wrangler/state/` SQLite but never deployed. NOT in live CF manifest. |

---

## Gaps / Action Items

| # | Gap | Status |
|---|---|---|
| GAP-1 | `obi.ps1 doctor` had no Cloudflare API query | ✅ **CLOSED** — `cf-audit` command added and verified (commit `2da6358`) |
| GAP-2 | 7 live Workers not tracked in repo | ✅ **CLOSED** — all traced: net-obi-api + frosty-bush-c14f rescued; phoenix-coder doc'd as standalone; dead workers (net-core, phoenix-v5-test) deleted via CF API |
| GAP-3 | `naturalenglishtraining.pages.dev` not in repo | ✅ **CLOSED** — rescued to `APPS/PAGES/naturalenglishtraining` (commit `a70fc8c`) |
| GAP-4 | 7 Pages projects returning 404 | ✅ **CLOSED** — 6 rescued & promoted to production; 1 (net-marketing) deleted via CF API as dead |
| GAP-5 | 2 D1 databases reported as empty | ✅ **CLOSED** — both have active schema, 0 rows false-negative from CAPIv4 incomplete listing |
| GAP-6 | BlueTech students on wrong portal template | ✅ **CLOSED** — Mai Tram, Quy, Huong rebuilt against 5-tab multi-portal template (commit `fb280e6`) |
| GAP-7 | `submission-api` and `soul-logger` untracked | ✅ **CLOSED** — both located and tracked in `APPS/` (commit `fe16efe`) |
| GAP-8 | net-pet-ai-production deploy path | 🔒 **FROZEN** — Production stable on v1.6.2. Deploy intentionally blocked: src/ incomplete (missing StudentProfileDO, CohortAnalysisDO, phase6-init.js). Do not deploy until full source recovery. See APPS/NET-PET-AI-PRODUCTION/README.md. |
| GAP-9 | mailala Pages project not created | 🔄 **PENDING** — Site code ready at WEBSITE/mailala/. Requires CLOUDFLARE_API_TOKEN from user to create `mailala` Pages project. |
