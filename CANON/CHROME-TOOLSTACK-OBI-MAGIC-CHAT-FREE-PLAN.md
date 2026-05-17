# Chrome Toolstack — OBI + Magic Chat for $0
> **Date:** 2026-03-30 16:55 ICT
> **Source:** 6 internal canon files + 3 repo scans + 2 web research sweeps + MAGIC-CHAT-CONSOLIDATED.md cross-reference
> **Artifact class:** 🏦 VAULT + 🔨 BUILD hybrid
> **Cross-ref:** CANON/MAGIC-CHAT-CONSOLIDATED.md (commit 4581e1bf)

---

## EXECUTIVE SUMMARY

**We can run OBI and Magic Chat for virtually $0 using Chrome's native toolstack.** The architecture exists on paper. The extension scaffold exists in code (10 files, ~16KB). Zero is deployed. This document consolidates ALL findings from 5+ sessions, 6 canon files, and fresh web research into one actionable battle plan.

### The $0 Formula
```
Gemini Nano (on-device AI, $0) + Chrome Extension (free distribution)
+ Chrome Enterprise (free management) + Web Speech API (free STT/TTS)
+ Cloudflare Workers ($5/mo fallback) = Magic Chat for ~$5/month total
```

### What Magic Chat IS (from CANON/MAGIC-CHAT-CONSOLIDATED.md)
Magic Chat is the **conversational AI lane** of the NET ecosystem — the product where students talk to OBI in natural English, get corrected, get encouraged, and progress from Mouse → Tiger. It's the 5-stage pipeline:
1. **LISTEN** → Student speaks/types in English or Vietnamese
2. **UNDERSTAND** → NLP processes intent, detects language, identifies errors
3. **RESPOND** → OBI replies naturally, with corrections woven in (not clinical)
4. **TRACK** → Progress logged (Mouse→Cat→Wolf→Tiger)
5. **ADAPT** → Next response calibrated to student level

**Chrome's toolstack makes ALL 5 stages run on-device for $0.**

---

## THE $0 CHROME STACK — COMPLETE BREAKDOWN

### Layer 1: Gemini Nano Built-in AI (On-Device, $0)

Google shipped Gemini Nano directly into Chrome. No API key. No cloud call. No cost. Runs on the student's machine.

| API | Chrome Status | Magic Chat Stage | What It Does | Cost |
|-----|--------------|-----------------|-------------|------|
| **Prompt API** | ✅ Stable (Chrome 128+) | RESPOND | `self.ai.languageModel.create()` → OBI tutoring responses on-device | $0 |
| **Translation API** | ✅ Stable (Chrome 128+) | UNDERSTAND | `self.ai.translator.create()` → Vietnamese ↔ English on-device | $0 |
| **Language Detection API** | ✅ Stable (Chrome 128+) | LISTEN | `self.ai.languageDetector.create()` → Auto-detect Vietnamese vs English | $0 |
| **Summarizer API** | ✅ Stable (Chrome 131+) | ADAPT | On-device lesson material summaries | $0 |
| **Writer API** | ✅ Stable (Chrome 131+) | RESPOND | Generate Mouse→Tiger sentence exercises | $0 |
| **Rewriter API** | ✅ Stable (Chrome 131+) | RESPOND | Rewrite student sentences at correct level | $0 |

**🔴 CRITICAL UPDATE (Web Research 2026-03-30):**
- **Chrome 140+: CPU support for Gemini Nano is rolling out.** Previously GPU-only. Now works on low-end Vietnamese student laptops with NO discrete GPU.
- **Google I/O 2025 confirmed:** Built-in AI APIs are production-ready, not experimental. Available to Chrome Extensions.
- **Model management is automatic:** Chrome downloads/updates Gemini Nano in the background. Developer does nothing.

**The code ALREADY EXISTS in our scaffold:**
```javascript
// FROM APPS/obi-chrome-extension/popup.js
async function promptOnDevice(prompt) {
  if ('ai' in self && 'languageModel' in self.ai) {
    const session = await self.ai.languageModel.create({
      systemPrompt: 'You are OBI, a friendly English tutor for Vietnamese students. '
        + 'Use simple language. Encourage the student. '
        + 'Follow Mouse→Tiger: permission over perfection.',
    });
    return await session.prompt(prompt);
  }
  return null; // fallback to Cloudflare Workers backend
}

// Translation — also $0
async function translateOnDevice(text, sourceLanguage, targetLanguage) {
  if ('ai' in self && 'translator' in self.ai) {
    const translator = await self.ai.translator.create({ sourceLanguage, targetLanguage });
    return await translator.translate(text);
  }
  return null;
}
```

### Layer 2: Web Speech API (Free STT + TTS)

Chrome has **built-in speech recognition and synthesis** via the Web Speech API. This is the VOICE layer for Magic Chat.

| Capability | API | Cost | Browser Support | Magic Chat Use |
|-----------|-----|------|----------------|---------------|
| **Speech-to-Text** (STT) | `SpeechRecognition` | $0 | Chrome + Chromium (sends audio to Google servers) | Student speaks English → text for OBI to process |
| **Text-to-Speech** (TTS) | `SpeechSynthesis` | $0 | All modern browsers (local voices) | OBI speaks responses aloud |
| **Chrome Extension TTS** | `chrome.tts` API | $0 | Chrome Extensions only | Higher-quality TTS with SAPI5/macOS voices |

**STT code pattern (not yet in scaffold):**
```javascript
const recognition = new webkitSpeechRecognition();
recognition.continuous = false;
recognition.interimResults = true;
recognition.lang = 'en-US'; // or 'vi-VN' for Vietnamese

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  // Send to Gemini Nano Prompt API for OBI response
  promptOnDevice(transcript).then(response => {
    // Display + speak response
    speechSynthesis.speak(new SpeechSynthesisUtterance(response));
  });
};
recognition.start();
```

**⚠️ LIMITATION:** Chrome's SpeechRecognition sends audio to Google's servers for processing. It's free but requires internet. For truly offline STT, would need a local model (future enhancement). TTS is fully offline using system voices.

### Layer 3: Chrome Extension Distribution ($0)

| Distribution Method | Cost | Friction | Scale |
|-------------------|------|---------|-------|
| **Chrome Web Store** | $5 one-time dev fee | Student installs manually | Public — anyone can install |
| **Chrome Enterprise Force-Install** | $0 | ZERO friction — silently appears in browser | Schools/managed devices |
| **Direct sideload** (developer mode) | $0 | High — student must enable dev mode | Testing only |

**Our extension scaffold:** `APPS/obi-chrome-extension/` — 10 files, MV3, Gemini Nano integrated

| File | Size | Status |
|------|------|--------|
| manifest.json | 963B | ✅ MV3, needs key generation |
| popup.html + popup.js + popup.css | ~5KB | ✅ Gemini Nano Prompt + Translation integrated |
| sidepanel.html + sidepanel.js + sidepanel.css | ~4KB | ✅ Full chat + translate |
| background.js | 1.2KB | ✅ Service worker, context menu, heartbeat |
| content.js | 1.8KB | 🟡 Tooltip stub — needs Nano wiring |
| icons/ | — | ❌ Missing — need 16/48/128 PNGs |
| styles/ | — | Exists as directory |

### Layer 4: Chrome Enterprise Core ($0 Management)

| Capability | What It Does for OBI/Magic Chat | Cost |
|-----------|-------------------------------|------|
| `ExtensionInstallForceList` | Silent-install OBI extension on ALL managed browsers | $0 |
| Token-based enrollment | Enroll school devices with one token — parents do nothing | $0 |
| Usage reporting | Which students use OBI, how often, engagement metrics | $0 |
| Policy enforcement | Block competing extensions, enforce safe browsing | $0 |
| Chrome Management APIs | Programmatic control via Cloudflare Workers | $0 |
| Reports API | Browser version, extension data, usage dashboard | $0 |
| Telemetry API | Device health + performance on student laptops | $0 |

**Signup:** enterprise.google.com/signup/chrome-browser/email
**Open-source ref:** github.com/google/ChromeBrowserEnterprise
**Status:** NOT signed up yet.

### Layer 5: Cloudflare Workers Backend (Fallback, $5/mo)

When Gemini Nano is unavailable (older Chrome, unsupported device), fall back to cloud:

| Component | Cost | Status | Role |
|-----------|------|--------|------|
| Workers | $5/mo paid tier | ✅ LIVE | OBI API runtime |
| DeepSeek | ~$0.14/M input tokens | ✅ LIVE | Conversation engine |
| Deepgram Aura 2 | Active account | ✅ LIVE | Premium voice output |
| Durable Objects | $0 (Workers tier) | ✅ LIVE | Session state |
| D1 (SQLite) | $0 free tier | ✅ LIVE | Student data |
| KV Store | $0 free tier | ✅ LIVE | Config, rate limiting |
| R2 Storage | $0 free tier | ✅ LIVE | Audio/media |
| Workers AI | $0 free tier | ❌ Untapped | 50+ models fallback |
| AI Gateway | $0 | ❌ Untapped | Caching, rate limiting |
| Vectorize | $0 free tier | ❌ Untapped | Semantic search |

---

## THE COMPLETE ARCHITECTURE

```
STUDENT'S DEVICE (Vietnamese household)
│
├── Chrome Browser (managed via Chrome Enterprise Core — $0)
│   │
│   ├── OBI Extension (force-installed or Chrome Web Store)
│   │   │
│   │   ├── 🎤 VOICE LAYER ($0 — Web Speech API)
│   │   │   ├── SpeechRecognition → Student speaks English
│   │   │   └── SpeechSynthesis → OBI speaks back
│   │   │
│   │   ├── 🧠 ON-DEVICE AI ($0 — Gemini Nano, Chrome 128+)
│   │   │   ├── Prompt API → OBI tutoring responses
│   │   │   ├── Translation API → Vietnamese ↔ English
│   │   │   ├── Language Detection → Auto-detect input language
│   │   │   ├── Summarizer API → Lesson summaries
│   │   │   ├── Writer API → Generate exercises
│   │   │   └── Rewriter API → Level-appropriate rewrites
│   │   │
│   │   ├── 💬 MAGIC CHAT UI
│   │   │   ├── Popup (quick chat — 360px)
│   │   │   ├── Side Panel (full session)
│   │   │   └── Context Menu → "Ask OBI about this" on any text
│   │   │
│   │   └── 📡 CLOUD FALLBACK (only when Nano unavailable)
│   │       └── Cloudflare Workers → DeepSeek (~$0.14/M tokens)
│   │
│   └── 🔥 Firebase ($0 Spark Plan — optional)
│       ├── Auth → Google Sign-In (students have Google accounts)
│       ├── Firestore → Profiles, progress, teacher dashboard
│       └── Hosting → Extension download landing page
│
└── 📊 TEACHER PORTAL
    ├── Chrome Enterprise Console → usage, enrollment, policies
    └── Cloudflare Workers API → student progress, analytics
```

### Magic Chat 5-Stage Pipeline → Chrome Implementation

| Stage | Traditional ($$) | Chrome $0 Version |
|-------|-----------------|-------------------|
| **1. LISTEN** | Paid STT API (Whisper, Deepgram) | Web Speech API SpeechRecognition ($0) + Gemini Nano Language Detection ($0) |
| **2. UNDERSTAND** | Cloud NLP (GPT-4, Claude) | Gemini Nano Prompt API on-device ($0) |
| **3. RESPOND** | Cloud AI + paid TTS | Gemini Nano Prompt API ($0) + SpeechSynthesis ($0) |
| **4. TRACK** | Cloud database | Chrome Extension storage API ($0) + Firebase Firestore ($0 Spark) |
| **5. ADAPT** | Cloud inference | Gemini Nano Writer/Rewriter ($0) + local level tracking |

### Cost at Scale

| Scale | Traditional EdTech | OBI Chrome Stack |
|-------|-------------------|-----------------|
| 10 students | $50-500/mo | $5/mo (Cloudflare base) |
| 100 students | $500-5,000/mo | $5-10/mo |
| 1,000 students | $5,000-50,000/mo | $10-20/mo |
| 10,000 students | $50,000-500,000/mo | $20-50/mo |

**The economics are insane.** Gemini Nano processes EVERYTHING on-device. Cloud only handles edge cases.

---

## WHAT'S BUILT vs. WHAT'S NOT

### ✅ BUILT (Code Exists)
1. Chrome Extension scaffold — 10 files, MV3, `APPS/obi-chrome-extension/`
2. Gemini Nano Prompt API integration — in popup.js + sidepanel.js
3. Gemini Nano Translation API integration — in popup.js + sidepanel.js
4. Gemini Nano Language Detection — in popup.js
5. Background service worker — context menu, side panel, heartbeat
6. Popup UI — dark theme, OBI chat, status display
7. Side Panel UI — full chat + translate button
8. Cloudflare Workers backend — LIVE at naturalenglishtraining.net
9. Firebase scaffold — 6 files, `APPS/firebase/`
10. Second extension scaffold — `CHROME-EXT/` (7 files, separate approach)

### ❌ NOT BUILT (Gaps)
1. **Web Speech API integration** — no STT/TTS code in extension yet
2. **content.js wiring** — tooltip shows "Thinking..." but never calls Nano
3. **Extension icons** — need 16/48/128 PNGs (Gospel 444 palette)
4. **Extension key** — manifest.json has `TODO_GENERATE_KEY`
5. **Summarizer + Writer + Rewriter API** integration — blueprinted, not coded
6. **Chrome Enterprise enrollment** — not signed up
7. **Firebase project** — `.firebaserc` has `TODO_SET_PROJECT_ID`
8. **Cloud Functions directory** — referenced but doesn't exist
9. **Chrome Web Store listing** — not started
10. **Mouse→Tiger progression logic** — schema exists in Firestore rules, no runtime code
11. **Offline mode** — Gemini Nano works offline but extension doesn't handle offline gracefully yet
12. **Voice pipeline** — the biggest gap. Magic Chat needs voice. Web Speech API code = ~50 lines.

---

## MICHAEL'S DECISION TRAIL (Verbatim)

**2026-03-24:** "we can MAKE OUR OWN EXTENSIONS!!"
→ Chrome extensions = $0 deployment vector

**2026-03-25:** "We have cloudflare and firebase, audit, which is best?"
→ Cloudflare for runtime. Firebase as backup.

**2026-03-26:** "CHAOS ENGINEER TO THE END, PAY ATTENTION TO FREE TOOLS, EXTENSIONS FROM GPT AND FROM GOOGLE"
→ <$20/month budget ceiling. Firebase = cost-zero ingress.

**2026-03-26:** "hold off on scaffolding, enter dump mode after transfer"
→ Scaffold exists but deployment deferred until Michael says go.

**2026-03-26:** "do a 5 stages pipeline looking into everything we have done on hobbs0011 mrmichaelhobbs1234-lang and hobbs0011 on our tool stack, especially regarding good chromes free tech stacks"
→ Full audit produced: CANON/RECON/CHROME-FREE-TECH-STACK-AUDIT-2026-03-26.md

**2026-03-30:** "pull all the recent findings on how we can use chromes toolstack to run OBI and magic chat for virtually free"
→ THIS DOCUMENT.

---

## WEB RESEARCH FINDINGS (2026-03-30)

### Chrome Built-in AI — Latest Status
- **developer.chrome.com/docs/ai** — Official hub for all Chrome AI APIs
- **Chrome 140+** — CPU support for Gemini Nano rolling out (previously GPU-only)
- **Google I/O 2025** — "Practical built-in AI with Gemini Nano in Chrome" — confirmed production-ready
- **Model management is automatic** — Chrome handles download/update/purge
- All 6 APIs (Prompt, Translation, Language Detection, Summarizer, Writer, Rewriter) available to Chrome Extensions
- **Hybrid workloads supported** — seamless transition between on-device and cloud

### Web Speech API — Free Voice Layer
- **SpeechRecognition** — Chrome + Chromium only. Sends to Google servers (free). Supports `en-US` and `vi-VN`.
- **SpeechSynthesis** — All modern browsers. Uses system voices. Fully offline.
- **chrome.tts API** — Extension-specific TTS with SAPI5 (Windows), macOS voices. Higher quality.
- **Limitation:** SpeechRecognition needs internet (audio goes to Google). TTS is offline.

### Chrome Extensions + AI — Ecosystem
- Extensions can access ALL Gemini Nano APIs via `self.ai.*`
- MV3 service workers have full API access
- Side panels provide rich UI without popup limitations
- Context menus enable "Ask OBI about this" on any selected text

---

## CHAOS ENGINEERING CHECKLIST — FROM BLUEPRINT TO DEPLOYED

### Phase 1: Wire the Voice (Priority — Magic Chat needs voice)
- [ ] Add Web Speech API SpeechRecognition to popup.js + sidepanel.js
- [ ] Add SpeechSynthesis for OBI responses
- [ ] Add chrome.tts as enhanced TTS option
- [ ] Handle microphone permissions gracefully
- [ ] Test with Vietnamese accent English speech

### Phase 2: Complete the Extension
- [ ] Fix content.js — wire Gemini Nano for real tooltip responses
- [ ] Generate extension key → update manifest.json
- [ ] Create 16/48/128 icon PNGs (purple #a855f7, gold #f59e0b, void #0f0f1a)
- [ ] Add Summarizer API for lesson material
- [ ] Add Writer/Rewriter API for Mouse→Tiger exercises
- [ ] Offline handling — graceful degradation when no internet

### Phase 3: Firebase + Auth
- [ ] Create Firebase project → get project ID
- [ ] Build `functions/` directory with admin endpoints
- [ ] Implement Google Sign-In in extension
- [ ] Connect Firestore for progress tracking

### Phase 4: Distribution
- [ ] Sign up Chrome Enterprise Core (enterprise.google.com)
- [ ] Get enrollment token
- [ ] Chrome Web Store developer account ($5 one-time)
- [ ] Test extension in Chrome 128+ (minimum for Gemini Nano)
- [ ] Test on low-end Vietnamese laptop (CPU-only Gemini Nano)

### Phase 5: Magic Chat Full Pipeline
- [ ] Wire all 5 stages end-to-end
- [ ] Build Mouse→Tiger progression runtime
- [ ] Connect to classroom substrate (Statues/Monkeys/Tigers from Gospel 444)
- [ ] Teacher dashboard via Chrome Enterprise Console + Workers API
- [ ] Zalo channel integration (OpenClaw adapter reference)

---

## SOURCE FILES INDEX

| File | Repo | Key Content |
|------|------|------------|
| `CANON/RECON/CHROME-FREE-TECH-STACK-AUDIT-2026-03-26.md` | Ultimate | Full 5-stage audit, $0 blueprint, gap analysis |
| `CANON/FIREBASE-CHROME-EXTENSION-CONSOLIDATION.md` | Ultimate | Deep dive + code audit + architecture + Michael decisions |
| `CHROME-EXT/README.md` | Ultimate | Extension dev guide, Mouse→Tiger levels, publishing steps |
| `APPS/obi-chrome-extension/` (10 files) | Ultimate | Extension scaffold with Gemini Nano integration |
| `APPS/firebase/` (6 files) | Ultimate | Firebase scaffold with Firestore rules |
| `CANON/MAGIC-CHAT-CONSOLIDATED.md` | Ultimate | Magic Chat full canon — 5-stage pipeline, classroom substrate |
| `CANON/TOOL-STACK-ARSENAL-2026.md` | Ultimate | Full tool stack (Chrome section STALE — needs update) |
| `CANON/CLOUDFLARE-ECOSYSTEM-MAP-2026.md` | Ultimate | Cloudflare backend layer |
| `CANON/CLOUDFLARE-VS-FIREBASE-VERDICT-2026.md` | Ultimate | CF wins for runtime, Firebase for auth/data |
| `CANON/REINCARNATION/2026-03-24-100-phoenixes-war-games.md` | Ultimate | "we can MAKE OUR OWN EXTENSIONS!!" revelation |
| `CANON/REINCARNATION/2026-03-25-RISE-WEBSITE-BUILD.md` | Ultimate | Firebase vs Cloudflare audit decision |
| `CANON/REINCARNATION/2026-03-26-vault-expansion-blueprint-ingestion.md` | Ultimate | Free tools directive, Firebase signup |

### Web Sources (2026-03-30)
| URL | Key Finding |
|-----|------------|
| developer.chrome.com/docs/ai | Official Chrome AI hub — all 6 APIs documented |
| developer.chrome.com/blog/gemini-nano-cpu-support | Chrome 140+: CPU support rolling out |
| io.google/2025 | Google I/O 2025: Built-in AI production-ready |
| developer.mozilla.org/Web/API/Web_Speech_API | Web Speech API docs — free STT/TTS |
| developer.chrome.com/docs/extensions/reference/api/tts | chrome.tts extension API — enhanced TTS |

---

## BOTTOM LINE

**The Chrome toolstack gives us Magic Chat for $0-$5/month at any scale.** Six on-device AI APIs. Free voice recognition and synthesis. Free extension distribution. Free enterprise management. The strategy is canon. The scaffold exists. The gap is execution.

**When Michael says go, we build the voice layer first (Web Speech API — ~50 lines of code), then complete the extension, then ship to Chrome Web Store ($5 one-time), then Chrome Enterprise for schools.**

---

*Consolidated by OB1. 6 canon files + 3 repo scans + 2 web research sweeps synthesized. Platform Death Test: PASS (if commit succeeds). Cross-ref: CANON/MAGIC-CHAT-CONSOLIDATED.md.*
