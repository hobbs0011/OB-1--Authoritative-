# Phoenix Rising Protocol — System-Wide Tech Stack Registry

**Last updated:** 2026-04-04 | **Source:** Codebase audit + Notion system map  
**Canonical app:** `APPS/NET-PET-AI/` (Cloudflare Worker)

---

## Legend

| Status | Meaning |
|--------|---------|
| ✅ WIRED | Actively called in production code |
| 🔧 CONFIGURED | Wrangler/env secret defined, not yet fully wired |
| 📋 REFERENCED | Mentioned in docs/memory but not in runtime code |
| ❌ NOT USED | Listed in Notion system map, evaluated, rejected or deferred |

---

## AI — Language Models

| Tool | Status | Where Used | Details |
|------|--------|------------|---------|
| **DeepSeek V3** (`deepseek-chat`) | ✅ WIRED | `src/index.js:205, 208, 273, 279, 295, 311` | Primary LLM for all chat, lesson, practice, feedback endpoints. Secret: `DEEPSEEK_API_KEY`. Direct API call to `api.deepseek.com`. |
| **ChatGPT / GPT** | ❌ NOT USED | — | In Notion map as an external tool used by the operator (Michael), not wired into the Worker. |
| **Claude** | ❌ NOT USED | — | Same as above — operator tool only, not in Worker runtime. |
| **Gemini** | ❌ NOT USED | — | Operator tool only. |
| **NotebookLM** | ❌ NOT USED | — | Operator research tool. No API integration. |
| **Perplexity** | ❌ NOT USED | — | Operator research tool. No API integration. |

---

## Voice — TTS / STT

| Tool | Status | Where Used | Details |
|------|--------|------------|---------|
| **Deepgram Aura 2** (TTS) | ✅ WIRED | `src/index.js:232` `public/chat.js:42-125` | Model: `aura-asteria-en`. Route: `POST /api/tts`. Secret: `DEEPGRAM_API_KEY`. Browser speech-synthesis fallback in `chat.js:125`. |
| **Deepgram Nova-2** (STT) | 📋 REFERENCED | — | Listed in system identity as planned STT. **Not wired in Worker.** Frontend uses browser `webkitSpeechRecognition` (`chat.js:619-655`) as current STT. Nova-2 integration is a pending upgrade. |

---

## Infrastructure — Cloudflare

| Tool | Status | Where Used | Details |
|------|--------|------------|---------|
| **Cloudflare Workers** | ✅ WIRED | `src/index.js` | Runtime. `wrangler.toml:main = "src/index.js"`. |
| **Durable Objects (SQLite)** | ✅ WIRED | `wrangler.toml`, `src/index.js` | 4 DOs: `SessionDO`, `ProfileDO`, `PetDO`, `LedgerDO`. Migrations: `v1-net-pet-core`, `v2-ledger`. |
| **Cloudflare Assets** | ✅ WIRED | `wrangler.toml:[assets]` | Serves `./public` directory. Binding: `ASSETS`. |
| **Cloudflare Pages** | 📋 REFERENCED | — | `naturalenglishtraining.net` frontend may use Pages for static hosting. Not confirmed in current `wrangler.toml`. |
| **Cloudflare AI Gateway** | ❌ NOT USED | — | Documented in `DRONE-14` as Tier 1 upgrade. Would wrap DeepSeek calls. **Not yet wired.** |
| **D1** | 📋 REFERENCED | `DRONE-14-CLOUDFLARE-ECOSYSTEM-MAP.md` | Listed as ✅ YES in Drone 14 map but not in `wrangler.toml`. May be used elsewhere or planned. |
| **KV** | 📋 REFERENCED | `DRONE-14` | Listed as ✅ YES in Drone 14 map. Not in current `wrangler.toml`. |
| **R2** | 📋 REFERENCED | `DRONE-14` | Listed as ✅ YES in Drone 14 map. Not in current `wrangler.toml`. |

---

## Backend Services

| Tool | Status | Where Used | Details |
|------|--------|------------|---------|
| **Notion** | ❌ NOT USED | — | Was implemented in `src/notion.js` in a prior session (memory record), but `src/notion.js` does not exist in current codebase. Routes `/api/notion/*` are not in `src/index.js`. Notion is used as an **operator documentation tool only**. |
| **Firebase** | ❌ NOT USED | — | Evaluated and rejected. See `OPERATIONS/FIREBASE-DEPLOY-ANALYSIS.md`. Firebase Hosting/App Hosting incompatible with Cloudflare Worker + Durable Objects architecture. |
| **Roblox Open Cloud API** | ❌ NOT USED | — | In Notion system map. Not wired into NET-PET-AI Worker. Future integration target for Roblox game-based lesson delivery. |

---

## Communication Platforms

| Tool | Status | Where Used | Details |
|------|--------|------------|---------|
| **Telegram** | ❌ NOT USED | — | In Notion system map. No bot or webhook wired in Worker. |
| **Zalo** | ❌ NOT USED | — | In Notion system map (Vietnamese messaging platform). No integration in Worker. |

---

## Frontend / Client Tools

| Tool | Status | Where Used | Details |
|------|--------|------------|---------|
| **naturalenglishtraining.net** | ✅ WIRED | `public/index.html`, `public/magic-chat.html` | Live production domain. Worker serves this UI. |
| **Browser SpeechRecognition (WebKit)** | ✅ WIRED | `public/chat.js:619-655` | Current STT fallback. `webkitSpeechRecognition` used for voice input until Deepgram Nova-2 is wired. |
| **Translator (Chrome extension)** | ❌ NOT USED | — | Operator tool. No runtime integration in Worker. |

---

## Developer Toolchain

| Tool | Status | Where Used | Details |
|------|--------|------------|---------|
| **Wrangler CLI** | ✅ WIRED | `package.json`, `wrangler.toml` | Deploy, dry-run, secret management. Commands: `npm run verify:wrangler`, `npx wrangler deploy --dry-run`. |
| **GitHub Actions** | ✅ WIRED | `.github/` | CI/CD pipeline. Auto-deploys on push. |
| **GitHub Copilot** | ✅ WIRED | `.github/copilot-instructions.md` | Agent instructions, task execution, PR automation. |
| **VS Code** | 📋 REFERENCED | — | Primary IDE. No direct codebase integration. |
| **GitHub (hobbs0011 org)** | ✅ WIRED | This repo | `hobbs0011/Phoenix-Rising-Protocol-Ultimate` — canonical source. |
| **GitHub (hobbs0011)** | 📋 REFERENCED | — | Secondary personal account. |
| **GitHub (mrmichaelhobbs1234-lang)** | 📋 REFERENCED | — | Language-focused account. |
| **Roblox Creator Account** | ❌ NOT USED | — | Separate platform. Not integrated with Worker. |

---

## Audit Summary — What Needs to Happen

### 🔴 High Priority (broken/missing wiring)
1. **Deepgram Nova-2 STT** — Mentioned in system identity, browser STT is the fallback, real Deepgram STT not yet wired. Add `POST /api/stt` route to Worker + wire `DEEPGRAM_API_KEY` for listening endpoint.
2. **Cloudflare AI Gateway** — One-line swap for DeepSeek calls. Adds caching, rate limiting, fallback. Free. Listed as Tier 1 in Drone 14. Not done.

### 🟡 Medium Priority (docs say it exists but code says otherwise)
3. **Notion `src/notion.js`** — Memory records claim this file exists with 4 routes. **It does not exist** in current codebase (`src/` contains only `index.js`). Memory is stale. If Notion integration is desired, it must be rebuilt.
4. **D1, KV, R2** — Drone 14 map marks these ✅ YES but they are absent from `wrangler.toml`. Needs clarification: are these in a separate Worker config not in this repo?

### 🟢 Low Priority (future work)
5. **Telegram/Zalo bots** — Notification delivery for Vietnamese students. Deferred.
6. **Roblox Open Cloud API** — Game-based lesson delivery. Deferred.
7. **Firebase** — Rejected. No action needed.
