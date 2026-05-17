# Firebase + Chrome Extension — Deep Dive Consolidation

> **Updated:** 2026-03-28 17:46 ICT
> **Source:** 30 source files + 4 reincarnation logs + 3 session records + 2 RECON audits across all 3 repos
> **Artifact class:** 🏦 VAULT (strategic deep dive — replaces inventory-only v1)
> **Exclusion:** Roblox (separate workstream)

---

## 🧬 WHY THIS EXISTS — Michael's Strategic Vision

This is not a tech inventory. This is the consolidation of a **strategic decision Michael has been building across 5+ sessions** since 2026-03-22.

### The Core Thesis: $0 Distribution to Vietnamese Students

Michael's insight: **Chrome Extensions are essentially free.** Combined with:
- **Gemini Nano** (on-device AI, $0, runs on CPU — works on low-end Vietnamese student laptops)
- **Chrome Enterprise** (free browser management, silent extension install for schools)
- **Firebase** (free auth, free database, free hosting, free push notifications)
- **Cloudflare Workers** (already live, $5/mo base)

This creates a **$0-to-$5/mo full AI tutoring platform** that deploys silently into every student's browser.

### The Decision Trail (Michael's Words — Verbatim)

**2026-03-24 — The Chrome Extension Revelation:**
> "we can MAKE OUR OWN EXTENSIONS!!"
>
> Decision: Chrome extensions = $0 deployment vector. Manifest V3 + Gemini Nano on-device + Chrome Enterprise silent deploy.

**2026-03-25 — Firebase + Cloudflare Audit:**
> "We have cloudflare and firebase, audit, which is best?"
> "please scan files, did we lose our toolstack SOUL DNA? I have a paid firebase setup, or a trial or whatever it is"
>
> Decision: Cloudflare for the app runtime. Firebase for supplementary services (auth, data, static hosting).

**2026-03-26 — Free Stack Harvesting Directive:**
> "CHAOS ENGINEER TO THE END, PAY ATTENTION TO FREE TOOLS, EXTENSIONS FROM GPT AND FROM GOOGLE"
> "make the bonus 3 stages you will do in a moment PURE FREE to NEAR-FREE to essential"
> "PS I just signed up for Firebase"
>
> Decision: <$20/month budget ceiling for 5-model AI stack. Firebase = cost-zero ingress layer.

**2026-03-26 — Consolidation Directive:**
> "do a 5 stages pipeline looking into everything we have done on hobbs0011 mrmichaelhobbs1234-lang and hobbs-lab on our tool stack, especially regarding good chromes free tech stacks"
> "transfer all to hobbs-lab possible"
> "hold off on scaffolding, enter dump mode after transfer"
>
> Decision: hobbs-lab is THE canonical home. Chrome Extension scaffold exists but deployment deferred until Michael says go.

---

## 🎯 The $0 OBI Deployment Model

This is the architecture Michael has been building toward:

```
STUDENT'S DEVICE (Vietnamese household)
│
├── Chrome Browser (managed via Chrome Enterprise Core — $0)
│   │
│   ├── OBI Extension (force-installed via Chrome Enterprise policy)
│   │   │
│   │   ├── ON-DEVICE AI LAYER ($0 — Gemini Nano, Chrome 120+)
│   │   │   ├── Prompt API (self.ai.languageModel)
│   │   │   │   └── Instant English tutoring responses — NO API COST
│   │   │   ├── Translation API (self.ai.translator)
│   │   │   │   └── Vietnamese ↔ English — NO API COST
│   │   │   ├── Language Detection API (self.ai.languageDetector)
│   │   │   │   └── Auto-detect Vietnamese vs English input
│   │   │   ├── Summarizer API (NOT YET INTEGRATED)
│   │   │   │   └── Lesson material summaries on-device
│   │   │   └── Writer/Rewriter API (NOT YET INTEGRATED)
│   │   │       └── Mouse→Tiger sentence exercises on-device
│   │   │
│   │   └── BACKEND FALLBACK (only when Nano unavailable)
│   │       └── Cloudflare Workers → DeepSeek (~$0.14/M tokens)
│   │
│   └── Context Menu: "Ask OBI about this" → inline tooltip on any webpage
│
├── Firebase Layer ($0 — Spark Plan)
│   ├── Auth → Google Sign-In (students already have Google accounts)
│   ├── Firestore → Student profiles + lesson progress + teacher dashboard
│   ├── Hosting → Landing page with Chrome Extension download CTA
│   └── Functions → Admin API endpoints (Node.js 22)
│
└── Cloudflare Layer ($5/mo base)
    ├── Workers → OBI app runtime (naturalenglishtraining.net)
    ├── Durable Objects → Stateful sessions, ledger
    ├── D1 → Student data (SQLite)
    ├── KV → Rate limiting, config
    ├── R2 → Audio, media storage
    └── AI Gateway → DeepSeek wrapper (caching, rate limiting, fallback)
```

### Why This Kills

| Factor | Traditional EdTech | OBI $0 Stack |
|--------|-------------------|-------------|
| Per-student cost | $5-50/mo/student | $0 (Gemini Nano on-device) |
| Deployment | App store download, manual install | Chrome Enterprise silent install — teacher pushes, done |
| Internet required? | Always | Only for backend fallback. Gemini Nano works OFFLINE |
| Hardware requirement | Modern device | Runs on CPU. Low-end laptops work. |
| Student friction | Create account, download app, learn UI | Extension appears in browser. Already there. |
| Translation cost | API calls per translation | $0 (on-device Gemini Nano Translation API) |
| Monthly burn at 1,000 students | $5,000-50,000 | ~$10-20 (Cloudflare overage only) |

### The Chrome Enterprise Play (The Moat)

This is the part most people miss. Chrome Enterprise Core is **free** and gives:

| Capability | What It Does for OBI | Cost |
|-----------|---------------------|------|
| ExtensionInstallForceList | Silent-install OBI extension on all managed browsers | $0 |
| Token-based enrollment | Enroll school/family devices with one token | $0 |
| Usage reporting | See which students are using OBI, how often | $0 |
| Policy enforcement | Block competing extensions, enforce safe browsing | $0 |
| Chrome Management APIs | Programmatic policy control via Workers | $0 |
| Reports API | Browser version, extension data, usage metrics | $0 |
| Telemetry API | Device health + performance monitoring | $0 |

**The play:** Michael registers for Chrome Enterprise Core (free). Gets enrollment tokens. Vietnamese schools/families enroll their Chrome browsers. OBI extension silently installs. Student opens Chrome → OBI is already there. Zero friction. Zero cost. Zero app store approval process.

**Signup:** enterprise.google.com/signup/chrome-browser/email
**Open-source reference:** github.com/google/ChromeBrowserEnterprise

---

## 🔥 What EXISTS Right Now (Code Audit)

### Chrome Extension: `APPS/obi-chrome-extension/` (10 files, ~16KB total)

**Status: SCAFFOLDED. NOT DEPLOYED.**

| File | What It Does | Gemini Nano? | Status |
|------|-------------|-------------|--------|
| `manifest.json` | MV3 manifest. Permissions: storage, activeTab, sidePanel. Host: naturalenglishtraining.net. Min Chrome: 120. | — | ✅ but key=TODO |
| `popup.html` + `popup.js` + `popup.css` | Quick chat popup. 360px wide. OBI header + chat + status. | ✅ Prompt + Translation + Language Detection | ✅ Full |
| `sidepanel.html` + `sidepanel.js` + `sidepanel.css` | Full side panel. Chat + dedicated Translate button. | ✅ Prompt + Translation | ✅ Full |
| `background.js` | Service worker. Opens side panel. Context menu "Ask OBI about this". 25s heartbeat for Enterprise managed installs. | — | ✅ Full |
| `content.js` | Inline tooltip on selected text. Dark theme overlay. Auto-dismiss 8s. | ❌ TODO — shows "Thinking..." but never gets real response | 🟡 Stub |
| `icons/` | README placeholder only. Need 16/48/128 PNGs in Gospel 444 palette. | — | ❌ Missing |

**The Gemini Nano Integration Pattern (already coded):**

```javascript
// FROM popup.js — this is the $0 magic
async function promptOnDevice(prompt) {
  if ('ai' in self && 'languageModel' in self.ai) {
    const session = await self.ai.languageModel.create({
      systemPrompt: 'You are OBI, a friendly English tutor for Vietnamese students. 
        Use simple language. Encourage the student. 
        Follow Mouse→Tiger: permission over perfection.',
    });
    return await session.prompt(prompt);
  }
  return null; // fallback to backend — only if Nano unavailable
}
```

This is the core. On-device AI with a system prompt baked in. $0 per response. Falls back to `naturalenglishtraining.net/api/chat` (DeepSeek via Cloudflare Workers) only when Chrome doesn't support Gemini Nano.

**Translation (also $0, also on-device):**
```javascript
async function translateOnDevice(text, sourceLanguage, targetLanguage) {
  if ('ai' in self && 'translator' in self.ai) {
    const translator = await self.ai.translator.create({ sourceLanguage, targetLanguage });
    return await translator.translate(text);
  }
  return null; // fallback to backend
}
```

Vietnamese ↔ English translation running entirely on the student's machine. No API call. No cost.

### Firebase: `APPS/firebase/` (6 files, ~4KB total)

**Status: SCAFFOLDED. NOT DEPLOYED. Project ID not set.**

| File | Purpose | Status |
|------|---------|--------|
| `.firebaserc` | Project config | 🔴 `TODO_SET_PROJECT_ID` |
| `firebase.json` | Hosting + Firestore + Functions. SPA rewrites. Security headers. Node.js 22. | ✅ Complete |
| `firestore.rules` | Students own-data-only. Lessons public-read. Admin claims-only. Default deny. | ✅ Complete |
| `firestore.indexes.json` | Composite index on progress collection. | ✅ Complete |
| `public/index.html` | OBI landing page. Orbitron font. Dark theme. "Get the Chrome Extension" CTA. | ✅ Built |
| `README.md` | Setup guide: create project, install CLI, deploy. Firestore schema. Cost: $0 Spark plan. | ✅ Complete |

**Firestore Schema (designed for Mouse→Tiger pedagogy):**
```
/students/{uid}
  - name, email
  - level: "mouse" | "cat" | "tiger"    ← Mouse→Tiger progression
  - createdAt, lastActive

/students/{uid}/progress/{lessonId}
  - score, completedAt, timeSpent

/lessons/{lessonId}
  - title, level, content, createdAt

/admin/dashboard
  - totalStudents, activeToday, lessonsCompleted
```

**Firebase Cost at Scale ($0 Spark Plan):**

| Resource | Free Tier | At 100 Students | At 1,000 Students |
|----------|-----------|-----------------|-------------------|
| Hosting | 10GB storage, 360MB/day | ✅ Within limits | ✅ Within limits |
| Firestore reads | 50K/day | ~5K/day | ~50K/day (ceiling) |
| Firestore writes | 20K/day | ~1K/day | ~10K/day |
| Firestore storage | 1GB | ~50MB | ~500MB |
| Functions | 125K/month | ~10K/month | ~50K/month |
| Auth | Unlimited | ✅ Free | ✅ Free |

**Verdict: Firebase free tier handles up to ~1,000 students before needing Blaze plan ($0.18/100K reads).**

---

## ⚡ The Competing Landing Page Problem

Two landing pages exist. This needs Michael's decision.

| Page | Location | What It Is | Deploy Target |
|------|----------|-----------|---------------|
| `WEBSITE/index.html` | Ultimate repo | Full Gospel 444 branded site. Hero, features, OBI showcase, lessons gallery, methodology, social proof. 6 planned pages. | Cloudflare Pages → naturalenglishtraining.com |
| `APPS/firebase/public/index.html` | Ultimate repo | Minimal OBI landing. Dark theme. "Get the Chrome Extension" CTA. | Firebase Hosting → TBD |

**Options:**
- **A) Firebase = student data only.** Firestore for profiles/progress, Auth for login. Kill Firebase Hosting — Cloudflare Pages handles the .com site. Chrome Extension CTA lives on the .com site.
- **B) Firebase = extension distribution hub.** Firebase Hosting serves a dedicated page for Chrome Extension download + student login. Separate from the .com marketing site.
- **C) Kill Firebase entirely.** Cloudflare D1 already handles user data on .net. Firebase is redundant.
- **D) Firebase = school/teacher portal.** Firebase Hosting + Auth + Firestore for the teacher dashboard and Chrome Enterprise management. .com = students. Firebase = teachers.

**Michael's 2026-03-25 decision leans toward Cloudflare for everything, Firebase as backup.** But Firebase signup was confirmed 2026-03-26. The $0 auth layer (Google Sign-In) is the strongest reason to keep Firebase alive.

---

## 🔴 What's NOT Built Yet (The Gap)

### Code Gaps
1. **Extension key not generated** — `manifest.json` has `TODO_GENERATE_KEY`
2. **Extension icons missing** — need 16/48/128 PNGs (Gospel 444 palette: #a855f7 purple, #f59e0b gold, #0f0f1a void)
3. **content.js TODO** — tooltip shows "Thinking..." but never calls Gemini Nano for the actual response
4. **No `functions/` directory** — `firebase.json` references Cloud Functions but the directory doesn't exist
5. **Firebase project not created** — `.firebaserc` has `TODO_SET_PROJECT_ID`
6. **Gemini Nano Summarizer + Writer/Rewriter APIs** — blueprinted in RECON audit, not integrated into extension code
7. **Chrome Enterprise enrollment scripts** — zero code
8. **Chrome Policy API integration** — zero code

### Deployment Gaps
9. **Chrome Enterprise Core signup** — not done yet
10. **Chrome Web Store listing** — not started (required for public extension distribution; Chrome Enterprise can bypass for managed devices)
11. **Firebase project creation** — not done at console.firebase.google.com

### Security Gaps
12. **`phoenix-ob1` (mrmichaelhobbs1234-lang)** — PUBLIC repo with `wrangler.toml` exposed. SET TO PRIVATE.
13. **SOVEREIGN_KEY rotation** — flagged across multiple sessions, still pending

---

## 🗺️ Source Files Consolidated

### Strategic/Decision Files (THE DEEP CONTEXT)

| File | Key Content |
|------|------------|
| `CANON/REINCARNATION/2026-03-24-100-phoenixes-war-games.md` | "we can MAKE OUR OWN EXTENSIONS!!" — Chrome extension revelation. Decision #6: Chrome extensions = $0 deployment vector. |
| `CANON/REINCARNATION/2026-03-25-RISE-WEBSITE-BUILD.md` | Firebase vs Cloudflare audit. Decision: Cloudflare for runtime, Firebase as backup. Firebase paid account confirmed. |
| `CANON/REINCARNATION/2026-03-26-vault-expansion-blueprint-ingestion.md` | "PAY ATTENTION TO FREE TOOLS, EXTENSIONS FROM GPT AND FROM GOOGLE". Firebase signup. <$20/month budget. Firebase as cost-zero ingress. |
| `CANON/REINCARNATION/2026-03-26-repo-consolidation-hobbs-lab-canonical.md` | "hold off on scaffolding" for Chrome Extension. All repos → hobbs-lab. Free tech stack audit ordered. |
| `CANON/RECON/CHROME-FREE-TECH-STACK-AUDIT-2026-03-26.md` | The full 5-stage Chrome audit. Chrome Enterprise, Gemini Nano 5 APIs, $0 deployment blueprint. Gap: 100% between strategy and code. |
| `CANON/RECON/OPENCLAW-MARKET-RESEARCH-2026-03-26.md` | Competitive validation. "Chrome + Firebase decision is the right call." OpenClaw validates multi-channel but OBI's $0 model is better for ESL. |
| `OPERATIONS/SESSION-RECORD-2026-03-22-23.md` | Firebase rejected for app RUNTIME (Cloudflare Workers wins). Firebase Hosting evaluated and set aside. |
| `OPERATIONS/FIREBASE-DEPLOY-ANALYSIS.md` | Technical analysis: Firebase can't run Cloudflare Workers code. Firebase off the table for NET-PET-AI runtime. |

### Code Files (THE SCAFFOLD)

| Directory | Files | Total Size |
|-----------|-------|-----------|
| `APPS/obi-chrome-extension/` | manifest.json, popup.html, popup.js, popup.css, sidepanel.html, sidepanel.js, sidepanel.css, background.js, content.js, icons/README.md | ~16KB |
| `APPS/firebase/` | .firebaserc, firebase.json, firestore.rules, firestore.indexes.json, public/index.html, README.md | ~4KB |

### Architecture Files

| File | Role |
|------|------|
| `CANON/NET-WEB-ARCHITECTURE-2026.md` | Full web architecture: .com (CF Pages) + .net (CF Workers). Domain strategy. Deploy pipeline. Cost model. |
| `CANON/TOOL-STACK-ARSENAL-2026.md` | Full tool stack. Firebase listed as PRODUCTION tier (paid). Chrome Translator Extension installed 2026-03-23. |

### Cross-Repo

| Source | Content |
|--------|---------|
| `hobbs-lab/Phoenix-Rise-Immortalize-/MASTER-SYNC.md` | Legacy Firebase references from original repo |
| `hobbs0011/NET-Ai-EcoSystem-CommandStation` | 0 Firebase/Chrome hits — dormant React dashboard |

---

## 📋 Next Actions (Priority Order)

### 🔴 Michael Decisions Needed
1. **Firebase role:** Option A, B, C, or D (see above)
2. **Chrome Extension deployment timing:** scaffold exists, when to ship?

### 🔴 Immediate (Agent Can Do)
3. Set `phoenix-ob1` to PRIVATE (security — wrangler.toml exposed)
4. Fix `content.js` TODO — wire up Gemini Nano Prompt API for real tooltip responses

### 🟡 Short-Term
5. Create Firebase project at console.firebase.google.com → get project ID → update `.firebaserc`
6. Generate Chrome Extension key → update `manifest.json`
7. Create 16/48/128 icon PNGs (Gospel 444: purple #a855f7, gold #f59e0b, void #0f0f1a)
8. Build `functions/` directory with admin API endpoints
9. Integrate Gemini Nano Summarizer + Writer/Rewriter APIs into extension

### 🟢 Medium-Term
10. Sign up for Chrome Enterprise Core
11. Test extension locally in Chrome 120+
12. Chrome Web Store developer account ($5 one-time fee)
13. Build Chrome Enterprise enrollment flow for schools
14. Build Zalo channel (OpenClaw Zalo adapter as reference)

---

*Deep dive consolidation by OB1. 30 source files + 4 reincarnation logs + 3 session records + 2 RECON audits synthesized. GitHub is truth. No Notion dependency.*
