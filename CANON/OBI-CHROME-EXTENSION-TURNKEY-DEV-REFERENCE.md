# OBI Chrome Extension — Turnkey Developer Reference
## Every URL You Need. Zero Copy-Paste Hunting.
> **Created**: 2026-03-30 | **For**: SOV100 Michael Hobbs | **By**: OB1/Agent-99
> **Purpose**: One-stop master reference for building, testing, publishing, and extending the OBI Chrome Extension

---

## 🔴 SECTION 1: CHROME FLAGS TO ENABLE (Do This First)

Open each of these in Chrome:

| Flag | URL | Set To |
|------|-----|--------|
| Gemini Nano On-Device Model | `chrome://flags/#optimization-guide-on-device-model` | **Enabled BypassPerfRequirement** |
| Prompt API for Gemini Nano | `chrome://flags/#prompt-api-for-gemini-nano` | **Enabled** |
| Prompt API Multimodal Input | `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input` | **Enabled** |
| Summarization API | `chrome://flags/#summarization-api-for-gemini-nano` | **Enabled** |
| Writer API | `chrome://flags/#writer-api-for-gemini-nano` | **Enabled** |
| Rewriter API | `chrome://flags/#rewriter-api-for-gemini-nano` | **Enabled** |
| Language Detection API | `chrome://flags/#language-detection-api` | **Enabled** |
| Translation API | `chrome://flags/#translation-api` | **Enabled** |
| Proofreader API | `chrome://flags/#proofreader-api-for-gemini-nano` | **Enabled** |

**After enabling**: Click **Relaunch** → then visit:
- `chrome://components` → Find "Optimization Guide On Device Model" → Click "Check for update" → Wait for download (~1.7GB)
- `chrome://on-device-internals` → Verify model status and test prompts

---

## 🟡 SECTION 2: CHROME EXTENSION CORE DOCUMENTATION

### Getting Started
| Page | URL |
|------|-----|
| **Extensions Home** | https://developer.chrome.com/docs/extensions |
| **Get Started Guide** | https://developer.chrome.com/docs/extensions/get-started |
| **Your First Extension Tutorial** | https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world |
| **Run Scripts on Every Page** | https://developer.chrome.com/docs/extensions/get-started/tutorial/scripts-on-every-tab |
| **Inject Scripts into Active Tab** | https://developer.chrome.com/docs/extensions/get-started/tutorial/scripts-activetab |
| **Tab Manager Tutorial** | https://developer.chrome.com/docs/extensions/get-started/tutorial/popup-tabs-manager |
| **Service Worker Tutorial** | https://developer.chrome.com/docs/extensions/get-started/tutorial/service-worker-events |
| **Debug Extensions** | https://developer.chrome.com/docs/extensions/get-started/tutorial/debug |

### Develop Guide (Full Index)
| Page | URL |
|------|-----|
| **Develop Overview** | https://developer.chrome.com/docs/extensions/develop |
| **Manifest V3 Overview** | https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3 |
| **Migrate to MV3** | https://developer.chrome.com/docs/extensions/develop/migrate |

### UI Components
| Page | URL |
|------|-----|
| **Side Panel** | https://developer.chrome.com/docs/extensions/develop/ui/side-panel |
| **Create a Side Panel** | https://developer.chrome.com/docs/extensions/develop/ui/create-a-side-panel |
| **Action (Toolbar Icon)** | https://developer.chrome.com/docs/extensions/develop/ui/add-popup |
| **Context Menus** | https://developer.chrome.com/docs/extensions/develop/ui/context-menu |
| **Override Pages** | https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages |
| **Notifications** | https://developer.chrome.com/docs/extensions/develop/ui/notifications |

### Core Concepts
| Page | URL |
|------|-----|
| **Service Workers** | https://developer.chrome.com/docs/extensions/develop/concepts/service-workers |
| **Content Scripts** | https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts |
| **Permissions** | https://developer.chrome.com/docs/extensions/develop/concepts/permissions |
| **Messaging** | https://developer.chrome.com/docs/extensions/develop/concepts/messaging |
| **Storage** | https://developer.chrome.com/docs/extensions/develop/concepts/storage-and-cookies |
| **Offscreen Documents** | https://developer.chrome.com/docs/extensions/develop/concepts/offscreen-documents |
| **Native Messaging** | https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging |
| **Match Patterns** | https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns |
| **Content Filtering** | https://developer.chrome.com/docs/extensions/develop/concepts/content-filtering |
| **Extension Update Lifecycle** | https://developer.chrome.com/docs/extensions/develop/concepts/extension-update-lifecycle |
| **Cross-Origin Isolation** | https://developer.chrome.com/docs/extensions/develop/concepts/cross-origin-isolation |

### Security & Privacy
| Page | URL |
|------|-----|
| **Stay Secure** | https://developer.chrome.com/docs/extensions/develop/security/stay-secure |
| **Protect User Privacy** | https://developer.chrome.com/docs/extensions/develop/security/protect-user-privacy |
| **Remotely Hosted Code** | https://developer.chrome.com/docs/extensions/develop/migrate/improve-security |

---

## 🟢 SECTION 3: CHROME EXTENSION API REFERENCE (Every API)

### Full API Index
| Page | URL |
|------|-----|
| **API Reference Home** | https://developer.chrome.com/docs/extensions/reference/api |

### APIs Used in OBI Extension
| API | URL | OBI Use |
|-----|-----|---------|
| **chrome.sidePanel** | https://developer.chrome.com/docs/extensions/reference/api/sidePanel | Side panel chat UI |
| **chrome.contextMenus** | https://developer.chrome.com/docs/extensions/reference/api/contextMenus | "Ask OBI" right-click |
| **chrome.storage** | https://developer.chrome.com/docs/extensions/reference/api/storage | Level tracking, settings |
| **chrome.tts** | https://developer.chrome.com/docs/extensions/reference/api/tts | Text-to-speech |
| **chrome.ttsEngine** | https://developer.chrome.com/docs/extensions/reference/api/ttsEngine | Custom TTS engine |
| **chrome.action** | https://developer.chrome.com/docs/extensions/reference/api/action | Toolbar icon |
| **chrome.runtime** | https://developer.chrome.com/docs/extensions/reference/api/runtime | Messaging, lifecycle |
| **chrome.tabs** | https://developer.chrome.com/docs/extensions/reference/api/tabs | Tab management |
| **chrome.commands** | https://developer.chrome.com/docs/extensions/reference/api/commands | Keyboard shortcuts |
| **chrome.alarms** | https://developer.chrome.com/docs/extensions/reference/api/alarms | Heartbeat/scheduling |
| **chrome.notifications** | https://developer.chrome.com/docs/extensions/reference/api/notifications | User notifications |
| **chrome.identity** | https://developer.chrome.com/docs/extensions/reference/api/identity | OAuth (future) |
| **chrome.offscreen** | https://developer.chrome.com/docs/extensions/reference/api/offscreen | DOM access from SW |
| **chrome.scripting** | https://developer.chrome.com/docs/extensions/reference/api/scripting | Script injection |
| **chrome.declarativeNetRequest** | https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest | Network rules |
| **chrome.permissions** | https://developer.chrome.com/docs/extensions/reference/api/permissions | Optional permissions |

### All Other Chrome Extension APIs
| API | URL |
|-----|-----|
| chrome.accessibilityFeatures | https://developer.chrome.com/docs/extensions/reference/api/accessibilityFeatures |
| chrome.bookmarks | https://developer.chrome.com/docs/extensions/reference/api/bookmarks |
| chrome.browsingData | https://developer.chrome.com/docs/extensions/reference/api/browsingData |
| chrome.certificateProvider | https://developer.chrome.com/docs/extensions/reference/api/certificateProvider |
| chrome.contentSettings | https://developer.chrome.com/docs/extensions/reference/api/contentSettings |
| chrome.cookies | https://developer.chrome.com/docs/extensions/reference/api/cookies |
| chrome.debugger | https://developer.chrome.com/docs/extensions/reference/api/debugger |
| chrome.desktopCapture | https://developer.chrome.com/docs/extensions/reference/api/desktopCapture |
| chrome.devtools.inspectedWindow | https://developer.chrome.com/docs/extensions/reference/api/devtools/inspectedWindow |
| chrome.devtools.network | https://developer.chrome.com/docs/extensions/reference/api/devtools/network |
| chrome.devtools.panels | https://developer.chrome.com/docs/extensions/reference/api/devtools/panels |
| chrome.devtools.recorder | https://developer.chrome.com/docs/extensions/reference/api/devtools/recorder |
| chrome.dns | https://developer.chrome.com/docs/extensions/reference/api/dns |
| chrome.documentScan | https://developer.chrome.com/docs/extensions/reference/api/documentScan |
| chrome.dom | https://developer.chrome.com/docs/extensions/reference/api/dom |
| chrome.downloads | https://developer.chrome.com/docs/extensions/reference/api/downloads |
| chrome.enterprise.hardwarePlatform | https://developer.chrome.com/docs/extensions/reference/api/enterprise/hardwarePlatform |
| chrome.enterprise.platformKeys | https://developer.chrome.com/docs/extensions/reference/api/enterprise/platformKeys |
| chrome.events | https://developer.chrome.com/docs/extensions/reference/api/events |
| chrome.extension | https://developer.chrome.com/docs/extensions/reference/api/extension |
| chrome.fileBrowserHandler | https://developer.chrome.com/docs/extensions/reference/api/fileBrowserHandler |
| chrome.fileSystemProvider | https://developer.chrome.com/docs/extensions/reference/api/fileSystemProvider |
| chrome.fontSettings | https://developer.chrome.com/docs/extensions/reference/api/fontSettings |
| chrome.gcm | https://developer.chrome.com/docs/extensions/reference/api/gcm |
| chrome.history | https://developer.chrome.com/docs/extensions/reference/api/history |
| chrome.i18n | https://developer.chrome.com/docs/extensions/reference/api/i18n |
| chrome.idle | https://developer.chrome.com/docs/extensions/reference/api/idle |
| chrome.input.ime | https://developer.chrome.com/docs/extensions/reference/api/input/ime |
| chrome.instanceID | https://developer.chrome.com/docs/extensions/reference/api/instanceID |
| chrome.loginState | https://developer.chrome.com/docs/extensions/reference/api/loginState |
| chrome.management | https://developer.chrome.com/docs/extensions/reference/api/management |
| chrome.omnibox | https://developer.chrome.com/docs/extensions/reference/api/omnibox |
| chrome.pageCapture | https://developer.chrome.com/docs/extensions/reference/api/pageCapture |
| chrome.platformKeys | https://developer.chrome.com/docs/extensions/reference/api/platformKeys |
| chrome.power | https://developer.chrome.com/docs/extensions/reference/api/power |
| chrome.printerProvider | https://developer.chrome.com/docs/extensions/reference/api/printerProvider |
| chrome.printing | https://developer.chrome.com/docs/extensions/reference/api/printing |
| chrome.printingMetrics | https://developer.chrome.com/docs/extensions/reference/api/printingMetrics |
| chrome.privacy | https://developer.chrome.com/docs/extensions/reference/api/privacy |
| chrome.processes | https://developer.chrome.com/docs/extensions/reference/api/processes |
| chrome.proxy | https://developer.chrome.com/docs/extensions/reference/api/proxy |
| chrome.readingList | https://developer.chrome.com/docs/extensions/reference/api/readingList |
| chrome.search | https://developer.chrome.com/docs/extensions/reference/api/search |
| chrome.sessions | https://developer.chrome.com/docs/extensions/reference/api/sessions |
| chrome.sockets | https://developer.chrome.com/docs/extensions/reference/api/sockets |
| chrome.system.cpu | https://developer.chrome.com/docs/extensions/reference/api/system/cpu |
| chrome.system.display | https://developer.chrome.com/docs/extensions/reference/api/system/display |
| chrome.system.memory | https://developer.chrome.com/docs/extensions/reference/api/system/memory |
| chrome.system.storage | https://developer.chrome.com/docs/extensions/reference/api/system/storage |
| chrome.tabCapture | https://developer.chrome.com/docs/extensions/reference/api/tabCapture |
| chrome.tabGroups | https://developer.chrome.com/docs/extensions/reference/api/tabGroups |
| chrome.topSites | https://developer.chrome.com/docs/extensions/reference/api/topSites |
| chrome.vpnProvider | https://developer.chrome.com/docs/extensions/reference/api/vpnProvider |
| chrome.wallpaper | https://developer.chrome.com/docs/extensions/reference/api/wallpaper |
| chrome.webNavigation | https://developer.chrome.com/docs/extensions/reference/api/webNavigation |
| chrome.webRequest | https://developer.chrome.com/docs/extensions/reference/api/webRequest |
| chrome.windows | https://developer.chrome.com/docs/extensions/reference/api/windows |

### Manifest Reference
| Page | URL |
|------|-----|
| **Manifest File Format** | https://developer.chrome.com/docs/extensions/reference/manifest |
| **Permissions List** | https://developer.chrome.com/docs/extensions/reference/permissions-list |

---

## 🟣 SECTION 4: CHROME BUILT-IN AI APIs (Gemini Nano — $0 Cost)

| Page | URL | Status |
|------|-----|--------|
| **AI on Chrome Home** | https://developer.chrome.com/docs/ai | Hub |
| **Get Started with Built-in AI** | https://developer.chrome.com/docs/ai/get-started | Setup guide |
| **Built-in AI API Status** | https://developer.chrome.com/docs/ai/built-in-apis | Status table |
| **Prompt API** | https://developer.chrome.com/docs/ai/prompt-api | Extensions: Chrome 138 stable |
| **Summarizer API** | https://developer.chrome.com/docs/ai/summarizer-api | Chrome 138 stable |
| **Writer API** | https://developer.chrome.com/docs/ai/writer-api | Developer trial |
| **Rewriter API** | https://developer.chrome.com/docs/ai/rewriter-api | Developer trial |
| **Translator API** | https://developer.chrome.com/docs/ai/translator-api | Chrome 138 stable |
| **Language Detector API** | https://developer.chrome.com/docs/ai/language-detection | Chrome 138 stable |
| **Proofreader API** | https://developer.chrome.com/docs/ai/proofreader-api | Origin trial |
| **On-Device Internals** | `chrome://on-device-internals` | Test prompts locally |
| **Early Preview Program** | https://developer.chrome.com/docs/ai/join-epp | Get first access |
| **Chrome AI Dev Preview Forum** | https://groups.google.com/a/chromium.org/g/chrome-ai-dev-preview-discuss | Community |

### API Explainers (GitHub Specs)
| Spec | URL |
|------|-----|
| Prompt API Explainer | https://github.com/webmachinelearning/prompt-api |
| Writing Assistance APIs (Writer/Rewriter/Summarizer) | https://github.com/webmachinelearning/writing-assistance-apis |
| Translation API Explainer | https://github.com/webmachinelearning/translation-api |
| Proofreader API Proposal | https://github.com/webmachinelearning/proposals/issues/7 |
| Web Machine Learning CG | https://www.w3.org/groups/cg/webmachinelearning/ |

### Chrome Status Tracking
| Feature | URL |
|---------|-----|
| Prompt API | https://chromestatus.com/feature/5134603979063296 |
| Summarizer API | https://chromestatus.com/feature/5765833618046976 |
| Translator API | https://chromestatus.com/feature/5765833618046976 |

### TypeScript Support
```
npm install @types/dom-chromium-ai
```

---

## 🔵 SECTION 5: WEB SPEECH API (Free STT/TTS — No API Key)

| Page | URL | Use |
|------|-----|-----|
| **Web Speech API Overview** | https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API | Master reference |
| **Using the Web Speech API** | https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API | Tutorial |
| **SpeechRecognition** | https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition | STT (needs internet) |
| **SpeechRecognitionEvent** | https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionEvent | Result handling |
| **SpeechSynthesis** | https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis | TTS (works offline) |
| **SpeechSynthesisUtterance** | https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance | Voice config |
| **SpeechSynthesisVoice** | https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice | Voice selection |
| **Web Speech API Spec** | https://webaudio.github.io/web-speech-api/ | W3C spec |
| **Chrome Speech Demo** | https://www.google.com/intl/en/chrome/demos/speech.html | Live demo |
| **chrome.tts API** | https://developer.chrome.com/docs/extensions/reference/api/tts | Extension TTS |
| **chrome.ttsEngine API** | https://developer.chrome.com/docs/extensions/reference/api/ttsEngine | Custom TTS engine |

---

## 🟠 SECTION 6: GEMINI API FREE TIER (Cloud Fallback — $0)

| Page | URL |
|------|-----|
| **Google AI Studio** | https://aistudio.google.com | Free prompt playground |
| **Get API Key** | https://aistudio.google.com/app/apikey | Free, no credit card |
| **Gemini API Quickstart** | https://ai.google.dev/gemini-api/docs/quickstart | Setup guide |
| **Gemini API Pricing** | https://ai.google.dev/gemini-api/docs/pricing | Free tier details |
| **Rate Limits** | https://ai.google.dev/gemini-api/docs/rate-limits | Free: ~1,350 req/day |
| **AI Studio Quickstart** | https://ai.google.dev/gemini-api/docs/ai-studio-quickstart | Visual guide |
| **Node.js SDK** | https://ai.google.dev/gemini-api/docs/quickstart?lang=node | For Cloudflare Workers |
| **REST API** | https://ai.google.dev/gemini-api/docs/quickstart?lang=rest | Direct HTTP calls |
| **Gemini API Home** | https://ai.google.dev/gemini-api | Overview |

### Free Tier Models (March 2026)
- **Gemini 2.5 Flash** — Free with rate limits
- **Gemini 2.5 Flash-Lite** — Free with rate limits  
- **Gemini 3 Flash** — Free with rate limits
- **Gemini 3.1 Flash-Lite** — Free with rate limits

---

## 💰 SECTION 7: GOOGLE CLOUD FREE TIER & CREDITS

| Resource | URL | Value |
|----------|-----|-------|
| **Google Cloud Free Tier** | https://cloud.google.com/free | $300 trial + Always Free |
| **Free Tier Products List** | https://cloud.google.com/free/docs/free-cloud-features | 20+ products |
| **Google for Startups** | https://cloud.google.com/startup/apply | Up to $200K credits |
| **AI Startups Program** | https://cloud.google.com/startup/apply | Up to $350K for AI |
| **Free AI Tools** | https://cloud.google.com/use-cases/free-ai-tools | AI-specific free tier |
| **Cloud Speech-to-Text** | https://cloud.google.com/speech-to-text | 60 min/mo free |
| **Cloud Translation** | https://cloud.google.com/translate | 500K chars/mo free |
| **Cloud Natural Language** | https://cloud.google.com/natural-language | 5K units/mo free |
| **Cloud Text-to-Speech** | https://cloud.google.com/text-to-speech | 1M chars/mo free |

---

## 🛒 SECTION 8: CHROME WEB STORE — PUBLISHING

| Page | URL |
|------|-----|
| **Developer Dashboard** | https://chrome.google.com/webstore/devconsole | Upload & manage |
| **Register Developer Account** | https://developer.chrome.com/docs/webstore/register | One-time $5 fee |
| **Set Up Account** | https://developer.chrome.com/docs/webstore/set-up-account | Profile setup |
| **Publish Guide** | https://developer.chrome.com/docs/webstore/publish | Step-by-step |
| **Prepare Extension** | https://developer.chrome.com/docs/webstore/prepare | Pre-publish checklist |
| **Listing Requirements** | https://developer.chrome.com/docs/webstore/cws-dashboard-listing | Store listing |
| **Privacy Fields** | https://developer.chrome.com/docs/webstore/cws-dashboard-privacy | Privacy declaration |
| **Distribution Settings** | https://developer.chrome.com/docs/webstore/cws-dashboard-distribution | Visibility |
| **Program Policies** | https://developer.chrome.com/docs/webstore/program-policies | Rules |
| **Quality Guidelines** | https://developer.chrome.com/docs/webstore/quality-guidelines | Best practices |
| **Chrome Web Store Home** | https://chromewebstore.google.com | Browse extensions |
| **Extension Samples** | https://github.com/GoogleChrome/chrome-extensions-samples | Official samples |

---

## 🔧 SECTION 9: CHROME INTERNAL PAGES

| Page | URL | Purpose |
|------|-----|---------|
| Extensions Manager | `chrome://extensions` | Load unpacked, manage |
| Flags | `chrome://flags` | Enable experimental features |
| Components | `chrome://components` | Gemini Nano download status |
| On-Device Internals | `chrome://on-device-internals` | Test Gemini Nano prompts |
| Service Worker Internals | `chrome://serviceworker-internals` | Debug service workers |
| GPU Info | `chrome://gpu` | Check GPU acceleration |
| Version | `chrome://version` | Chrome version info |
| Net Internals | `chrome://net-internals` | Network debugging |
| Inspect Pages | `chrome://inspect` | DevTools for all contexts |

---

## 🏗️ SECTION 10: OBI EXTENSION ARCHITECTURE (After PR #12 Merge)

### File Structure
```
APPS/obi-chrome-extension/
├── manifest.json          — MV3 manifest, Chrome 120+
├── background.js          — Service worker, context menu, side panel opener
├── content.js             — Tooltip on text selection, Gemini Nano + fallback
├── popup.html             — Popup UI
├── popup.js               — Chat, Gemini Nano, STT/TTS, level tracking
├── sidepanel.html         — Side panel UI
├── sidepanel.js           — Chat, translate, summarize, rewrite
├── styles/
│   ├── popup.css          — Gospel 444 dark theme (popup)
│   └── sidepanel.css      — Gospel 444 dark theme (sidepanel)
├── icons/
│   ├── generate-icons.html — Open in browser → download PNGs
│   └── icon.svg           — SVG reference
└── README.md              — Quick-start guide
```

### Tech Stack ($0/month)
| Layer | Technology | Cost |
|-------|-----------|------|
| On-device AI | Gemini Nano (Prompt API) | $0 |
| Translation | Chrome Translation API | $0 |
| Language Detection | Chrome Language Detector API | $0 |
| Summarization | Chrome Summarizer API | $0 |
| Writing | Chrome Writer/Rewriter APIs | $0 |
| Speech-to-Text | Web Speech API (SpeechRecognition) | $0 |
| Text-to-Speech | Web Speech API (SpeechSynthesis) | $0 |
| Cloud Fallback | Cloudflare Workers + KV | $0 (free tier) |
| Cloud AI Fallback | Gemini API Free Tier | $0 (rate limited) |
| Storage | chrome.storage.local | $0 |
| Hosting | Chrome Web Store | $5 one-time |

### Mouse → Tiger Level System
| Level | Emoji | Messages | XP Range |
|-------|-------|----------|----------|
| Mouse | 🐭 | 0-10 | 0-10 |
| Cat | 🐱 | 11-50 | 11-50 |
| Wolf | 🐺 | 51-200 | 51-200 |
| Tiger | 🐯 | 201+ | 201+ |

---

## 📋 SECTION 11: MICHAEL'S LAUNCH CHECKLIST

### Step 1: Enable Chrome Flags
Open each flag URL from Section 1 → set to Enabled → Relaunch Chrome

### Step 2: Download Gemini Nano
- Go to `chrome://components`
- Find "Optimization Guide On Device Model"
- Click "Check for update" → wait for download (~1.7GB)
- Verify at `chrome://on-device-internals`

### Step 3: Clone & Load Extension
```bash
git clone https://github.com/hobbs0011/Phoenix-Rising-Protocol-Ultimate.git
cd Phoenix-Rising-Protocol-Ultimate/APPS/obi-chrome-extension
```
- Open `chrome://extensions`
- Enable **Developer mode** (top right toggle)
- Click **Load unpacked** → select the `obi-chrome-extension` folder

### Step 4: Generate Icons
- Open `icons/generate-icons.html` in Chrome
- Click download buttons for 16px, 48px, 128px PNGs
- Save to the `icons/` folder
- Reload extension at `chrome://extensions`

### Step 5: Test
- Click OBI icon in toolbar → chat in popup
- Right-click any text → "Ask OBI" → tooltip appears
- Click side panel icon → full chat + translate + summarize + rewrite
- Click 🎤 → speak → auto-transcribe → auto-send
- Watch Mouse → Tiger level progress

### Step 6: Optional — Publish to Chrome Web Store
- Register at https://chrome.google.com/webstore/devconsole ($5 one-time)
- Zip the extension folder
- Upload → fill listing → submit for review

### Step 7: Future — Add Gemini API Cloud Fallback
- Get free API key at https://aistudio.google.com/app/apikey
- Add to Cloudflare Workers environment variable
- Replace DeepSeek backend with Gemini API

---

## 🔗 SECTION 12: ADDITIONAL RESOURCES

### WebMCP (Chrome 145+ — Future)
| Resource | URL |
|----------|-----|
| WebMCP Overview | https://developer.chrome.com/docs/web-platform/web-mcp |
| Chrome 145 Release | https://chromestatus.com/features |

### LiteRT-LM (On-Device Runtime — Future)
| Resource | URL |
|----------|-----|
| LiteRT-LM Blog | https://developers.googleblog.com/on-device-genai-in-chrome-chromebook-plus-and-pixel-watch-with-litert-lm/ |

### ML Kit GenAI (Android — Future)
| Resource | URL |
|----------|-----|
| ML Kit GenAI | https://developers.google.com/ml-kit/genai |

### Google I/O 2025 Sessions
| Resource | URL |
|----------|-----|
| Google I/O 2025 | https://io.google/2025 |
| Gemini Nano Sessions | https://io.google/2025/explore/?q=gemini+nano |

### GitHub Repos (Ours)
| Repo | URL | Access |
|------|-----|--------|
| Phoenix-Rising-Protocol-Ultimate | https://github.com/hobbs0011/Phoenix-Rising-Protocol-Ultimate | ✅ Write |
| Phoenix-Rise-Immortalize- | https://github.com/hobbs0011/Phoenix-Rise-Immortalize- | ✅ Write |
| NET-Ai-EcoSystem-CommandStation | https://github.com/hobbs0011/NET-Ai-EcoSystem-CommandStation | ❌ Read only |

### Design Palette (Gospel 444)
| Token | Value | Use |
|-------|-------|-----|
| Void Black | `#0f0f1a` | Backgrounds |
| Soul Purple | `#a855f7` | Primary accent, borders |
| Imperial Gold | `#f59e0b` | Secondary accent, highlights |
| Light Purple | `#c084fc` | Gradient endpoint |
| Text | `#e0e0e0` | Body text |
| Orbitron | Google Fonts | Headers |
| Inter | Google Fonts | Body/UI |
| Rajdhani | Google Fonts | Alternative headers |

---

> **PLATFORM DEATH TEST**: This document exists on GitHub as permanent artifact.
> **DUAL PUBLISH**: GitHub (CANON/) + Notion (Phoenix HQ)
