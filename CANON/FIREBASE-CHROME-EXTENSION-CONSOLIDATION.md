# Firebase + Chrome Extension — Full Consolidation

> **Consolidated:** 2026-03-28 17:12 ICT
> **Source:** 30 files across 3 GitHub repos
> **Author:** Agent-99 (OB1) for SOV100
> **Exclusion:** Roblox (separate)
> **Artifact class:** 🏦 VAULT

---

## 🎯 Executive Summary

**Two parallel product scaffolds exist in `hobbs-lab/Phoenix-Rising-Protocol-Ultimate`:**

1. **Firebase project** (`APPS/firebase/`) — Landing page + Firestore backend for student data. Hosting, Auth, Functions, Firestore all scaffolded. **NOT DEPLOYED.** Project ID still `TODO_SET_PROJECT_ID`.
2. **OBI Chrome Extension** (`APPS/obi-chrome-extension/`) — Manifest V3 extension with popup chat, side panel, content script tooltip, and Gemini Nano on-device AI integration. **NOT DEPLOYED.** Extension key still `TODO_GENERATE_KEY`. Icons missing.

**Critical architecture decision already made:** Firebase was evaluated and **rejected** for NET-PET-AI (Cloudflare Workers is the runtime). But Firebase Hosting + Firestore remains valid as the **student data layer and landing page** separate from the Workers app.

**The $0 Chrome layer is 100% blueprinted, partially scaffolded, zero deployed.**

---

## 📊 Current State Matrix

| Component | Location | Code Exists? | Deployed? | Blockers |
|-----------|----------|-------------|-----------|----------|
| Firebase Hosting | `APPS/firebase/` | ✅ Scaffold | ❌ No | No project ID set |
| Firestore DB | `APPS/firebase/firestore.*` | ✅ Rules + Indexes | ❌ No | No project created |
| Firebase Functions | `APPS/firebase/firebase.json` | 🟡 Config only | ❌ No | No `functions/` dir |
| Firebase Landing Page | `APPS/firebase/public/index.html` | ✅ Built | ❌ No | No project ID |
| Chrome Extension Manifest | `APPS/obi-chrome-extension/manifest.json` | ✅ MV3 | ❌ No | Key not generated |
| Popup (Chat UI) | `popup.html` + `popup.js` + `popup.css` | ✅ Full | ❌ No | — |
| Side Panel | `sidepanel.html` + `sidepanel.js` + `sidepanel.css` | ✅ Full | ❌ No | — |
| Background Worker | `background.js` | ✅ Full | ❌ No | — |
| Content Script | `content.js` | ✅ Tooltip stub | ❌ No | TODO: real Nano response |
| Extension Icons | `icons/` | ❌ README only | ❌ No | Need 16/48/128 PNGs |
| Gemini Nano Prompt API | `popup.js` + `sidepanel.js` | ✅ Integrated | ❌ No | Chrome 120+ required |
| Gemini Nano Translation | `popup.js` + `sidepanel.js` | ✅ Integrated | ❌ No | Chrome 120+ required |
| Gemini Nano Language Detection | `popup.js` | ✅ Integrated | ❌ No | Chrome 120+ required |
| Chrome Enterprise Core | Notion only (Tool Stack §8) | ❌ No code | ❌ No | Not signed up |
| Chrome Policy API | Notion only | ❌ No code | ❌ No | Not integrated |

---

## 🏗️ Architecture — How It All Connects

```
Student Device
  └── Chrome Browser (managed via Chrome Enterprise Core — $0)
       ├── OBI Extension (force-installed via policy)
       │    ├── Gemini Nano Prompt API → instant responses, $0
       │    ├── Gemini Nano Translation API → Vietnamese↔English, $0
       │    ├── Gemini Nano Language Detection → auto-detect input, $0
       │    └── Gemini Nano Writer/Rewriter → Mouse→Tiger exercises, $0
       └── Connection to backend
            └── Cloudflare Workers ($0 free tier)
                 ├── DeepSeek → conversation engine
                 ├── Deepgram Aura 2 → voice output
                 ├── Durable Objects → state, ledger, sessions
                 └── Workers AI → 50+ models for fallback ($0)

Firebase (supplementary layer)
  ├── Hosting → landing page + extension download CTA
  ├── Firestore → student profiles + lesson progress
  ├── Auth → Google Sign-In
  └── Functions → admin API endpoints (Node.js 22)
```

**Decision record:** Firebase Hosting was **rejected** for the OBI app runtime (Workers wins). Firebase remains valid for:
- Static landing page with CTA to install Chrome Extension
- Firestore as student profile + progress database
- Firebase Auth for Google Sign-In
- Firebase Functions for admin API endpoints

---

## 🔥 Firebase Scaffold — Complete Inventory

### Directory: `APPS/firebase/`

| File | Size | Purpose | Status |
|------|------|---------|--------|
| `.firebaserc` | 61B | Project config | 🔴 `TODO_SET_PROJECT_ID` |
| `firebase.json` | 1KB | Hosting + Firestore + Functions config | ✅ Complete |
| `firestore.rules` | 974B | Security rules | ✅ Complete |
| `firestore.indexes.json` | 277B | Composite indexes | ✅ Complete |
| `public/index.html` | ~1KB | Landing page — OBI branding | ✅ Built |
| `README.md` | 1.2KB | Setup instructions | ✅ Complete |

### Firestore Schema

```
/students/{uid}
  - name: string
  - email: string
  - level: string (mouse|cat|tiger)
  - createdAt: timestamp
  - lastActive: timestamp

/students/{uid}/progress/{lessonId}
  - score: number
  - completedAt: timestamp
  - timeSpent: number (seconds)

/lessons/{lessonId}
  - title: string
  - level: string
  - content: map
  - createdAt: timestamp

/admin/dashboard
  - totalStudents: number
  - activeToday: number
  - lessonsCompleted: number
```

### Firestore Security Rules Summary
- Students: read/write own data only (auth.uid match)
- Lessons: public read, admin-only write
- Admin dashboard: admin claims only
- Default: deny all

### Firebase Config (`firebase.json`)
- Hosting: `public/` dir, SPA rewrites, security headers (X-Frame-Options DENY, nosniff, strict-origin referrer)
- API routes: `/api/**` → Cloud Functions
- Firestore: rules + indexes linked
- Functions: Node.js 22 runtime
- Cache: 1 hour on static assets

### Cost: $0 (Spark Plan)
- 10GB hosting storage, 360MB/day transfer
- 50K Firestore reads/day, 20K writes/day, 1GB storage
- 125K function invocations/month
- Auth: free for all providers

---

## 🧩 Chrome Extension — Complete Inventory

### Directory: `APPS/obi-chrome-extension/`

| File | Size | Purpose | Key Features |
|------|------|---------|-------------|
| `manifest.json` | 963B | MV3 manifest | storage, activeTab, sidePanel perms; host: naturalenglishtraining.net |
| `popup.html` | 1.2KB | Popup UI | Chat container, input area, "Open Full Panel" button |
| `popup.js` | 4KB | Popup logic | Gemini Nano (Prompt + Translation + Language Detection), backend fallback |
| `popup.css` | ~2KB | Popup styles | Gospel 444 palette, Orbitron + Inter fonts, dark theme |
| `sidepanel.html` | 836B | Side panel UI | Full chat + translate button |
| `sidepanel.js` | 2.8KB | Side panel logic | Gemini Nano Prompt + Translation, backend fallback |
| `sidepanel.css` | ~2KB | Side panel styles | Same Gospel 444 dark theme |
| `background.js` | 1.2KB | Service worker | Side panel opener, context menu "Ask OBI", 25s heartbeat |
| `content.js` | 1.8KB | Content script | Inline tooltip on selected text, auto-dismiss 8s |
| `icons/README.md` | ~200B | Icon placeholders | Need 16/48/128 PNGs in Gospel 444 style |

### Extension Manifest Details
- **Name:** "OBI — Natural English Training"
- **Version:** 0.1.0
- **Manifest Version:** 3
- **Permissions:** storage, activeTab, sidePanel
- **Host permissions:** `https://naturalenglishtraining.net/*`
- **Content scripts:** all URLs, document_idle
- **Minimum Chrome:** 120
- **Key:** `TODO_GENERATE_KEY`

### Gemini Nano Integration Map

| API | Used In | What It Does | Fallback |
|-----|---------|-------------|----------|
| Prompt API (`self.ai.languageModel`) | popup.js, sidepanel.js | On-device English tutoring responses | Backend `/api/chat` |
| Translation API (`self.ai.translator`) | popup.js, sidepanel.js | Vietnamese ↔ English translation | Backend (not yet built) |
| Language Detection (`self.ai.languageDetector`) | popup.js, sidepanel.js | Auto-detect Vietnamese vs English input | Default to 'en' |
| Summarizer API | — | Not yet integrated | — |
| Writer/Rewriter API | — | Not yet integrated | — |

### Backend Connection
- **URL:** `https://naturalenglishtraining.net/api/chat`
- **Method:** POST with `{message, language}`
- **System prompt:** "You are OBI, a friendly English tutor for Vietnamese students. Use simple language. Encourage the student. Follow Mouse→Tiger: permission over perfection."

### UI Features
- **Popup:** Quick chat interface, 360px wide, status indicator, "Open Full Panel" link
- **Side Panel:** Full-featured panel with chat + dedicated Translate button
- **Content Script:** Right-click "Ask OBI about this" → inline tooltip overlay
- **Design:** Dark void background (#0a0a1a), blue accent (#4444ff), green for user messages (#44ff44)

---

## 📐 Web Architecture Context

From `CANON/NET-WEB-ARCHITECTURE-2026.md`:

| Domain | Platform | Purpose | Status |
|--------|----------|---------|--------|
| `naturalenglishtraining.com` | Cloudflare Pages | Marketing site, landing page, brand | 🔨 Building |
| `naturalenglishtraining.net` | Cloudflare Workers | OBI app, student dashboard, Galaxy Lessons | ✅ Live |

**Firebase's role** in this architecture: supplementary student data layer + potential alternative landing page host. The `.com` site is already targeted for Cloudflare Pages, so Firebase Hosting may be **redundant** unless used for a separate purpose.

---

## ⚠️ Decision Required — Firebase Role Clarity

The repo contains **two competing landing page strategies:**

1. **`WEBSITE/index.html`** → Cloudflare Pages (.com) — Gospel 444 branded, full featured, 6 planned pages
2. **`APPS/firebase/public/index.html`** → Firebase Hosting — simpler OBI landing with extension CTA

**Options:**
- **A) Firebase = student data only** — Use Firestore for profiles/progress, Auth for login. Ditch Firebase Hosting (Cloudflare Pages handles the site).
- **B) Firebase = extension distribution hub** — Firebase Hosting serves a minimal page specifically for Chrome Extension download + student login.
- **C) Kill Firebase entirely** — Cloudflare D1 already handles user data on .net. Firebase is redundant.

---

## 🔴 Blockers & Missing Pieces

### Blocking Deployment
1. **Firebase project not created** — `.firebaserc` has `TODO_SET_PROJECT_ID`
2. **Extension key not generated** — manifest.json has `TODO_GENERATE_KEY`
3. **Extension icons missing** — only README placeholder exists
4. **No `functions/` directory** — `firebase.json` references it but it doesn't exist
5. **Content script TODO** — tooltip shows "Thinking..." but never gets a real Nano response

### Security
6. **`phoenix-ob1` (mrmichaelhobbs1234-lang)** — PUBLIC repo with `wrangler.toml` exposed. **Set to PRIVATE immediately.**

### Not Yet Built
7. Chrome Enterprise enrollment not started
8. Chrome Policy API integration not started
9. Gemini Nano Summarizer + Writer/Rewriter APIs not integrated
10. Firebase Admin SDK / Cloud Functions code not written

---

## 📁 Complete File Tree

```
hobbs-lab/Phoenix-Rising-Protocol-Ultimate/
├── APPS/
│   ├── firebase/
│   │   ├── .firebaserc                    # Project config (TODO)
│   │   ├── README.md                      # Setup instructions
│   │   ├── firebase.json                  # Hosting + Firestore + Functions
│   │   ├── firestore.rules                # Security rules
│   │   ├── firestore.indexes.json         # Composite indexes
│   │   └── public/
│   │       └── index.html                 # Landing page
│   │
│   └── obi-chrome-extension/
│       ├── manifest.json                  # MV3 manifest
│       ├── popup.html                     # Popup UI
│       ├── popup.js                       # Popup logic + Gemini Nano
│       ├── sidepanel.html                 # Side panel UI
│       ├── sidepanel.js                   # Side panel logic + Gemini Nano
│       ├── background.js                  # Service worker
│       ├── content.js                     # Content script (tooltip)
│       ├── styles/
│       │   ├── popup.css                  # Gospel 444 dark theme
│       │   └── sidepanel.css              # Gospel 444 dark theme
│       └── icons/
│           └── README.md                  # Icon specs (need PNGs)
│
├── CANON/
│   ├── NET-WEB-ARCHITECTURE-2026.md       # Full web architecture spec
│   ├── TOOL-STACK-ARSENAL-2026.md         # Tool stack (mentions Chrome)
│   ├── FIREBASE-CHROME-EXTENSION-CONSOLIDATION.md  # THIS FILE
│   └── RECON/
│       └── CHROME-FREE-TECH-STACK-AUDIT-2026-03-26.md  # Full Chrome audit
│
├── OPERATIONS/
│   └── FIREBASE-DEPLOY-ANALYSIS.md        # Firebase rejection decision
│
└── (Cross-repo references)
    └── hobbs-lab/Phoenix-Rise-Immortalize-/MASTER-SYNC.md
```

---

## 📋 Next Actions

- [ ] **Michael decides:** Firebase role (Option A, B, or C above)
- [ ] Create Firebase project at console.firebase.google.com
- [ ] Generate Chrome Extension key
- [ ] Create 16/48/128 icon PNGs (Gospel 444 palette)
- [ ] Build `functions/` directory with API endpoints
- [ ] Complete content.js TODO (wire up Gemini Nano response)
- [ ] Set `phoenix-ob1` repo to PRIVATE
- [ ] Sign up for Chrome Enterprise Core
- [ ] Test extension locally in Chrome 120+
- [ ] Integrate Summarizer + Writer/Rewriter APIs

---

## Source Files Consolidated

30 files read across 3 repos:
- `APPS/firebase/` — 6 files (README, firebase.json, firestore.rules, firestore.indexes.json, .firebaserc, public/index.html)
- `APPS/obi-chrome-extension/` — 10 files (manifest.json, popup.html, popup.js, popup.css, sidepanel.html, sidepanel.js, sidepanel.css, background.js, content.js, icons/README.md)
- `CANON/` — 3 files (NET-WEB-ARCHITECTURE-2026.md, TOOL-STACK-ARSENAL-2026.md, RECON/CHROME-FREE-TECH-STACK-AUDIT-2026-03-26.md)
- `OPERATIONS/` — 1 file (FIREBASE-DEPLOY-ANALYSIS.md)
- Cross-repo: `hobbs-lab/Phoenix-Rise-Immortalize-/MASTER-SYNC.md`
- Session logs with Firebase/Chrome refs: 4 reincarnation entries scanned

*Generated by OB1 max-agent consolidation sweep. Artifact class: 🏦 VAULT. Platform Death Test: PASS.*
