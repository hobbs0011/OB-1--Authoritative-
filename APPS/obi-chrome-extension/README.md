# OBI Chrome Extension

> **Natural English Training** — Your AI English tutor for Vietnamese students.  
> Mouse → Tiger. Permission over perfection.

---

## Quick Start — Sideload in Chrome (No Web Store Needed)

### Step 1: Get the Extension Files

**Option A — Download from GitHub:**
1. Go to: `https://github.com/hobbs-lab/Phoenix-Rising-Protocol-Ultimate`
2. Click the green **"Code"** button → **"Download ZIP"**
3. Unzip the file
4. Navigate to the folder: `APPS/obi-chrome-extension/`

**Option B — Teacher sends ZIP:**
1. Teacher ZIPs the `APPS/obi-chrome-extension/` folder
2. Sends via Zalo, email, or USB drive
3. Student unzips on their computer

### Step 2: Load in Chrome

1. Open Chrome and go to: `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `obi-chrome-extension/` folder
5. Done! OBI appears in the Chrome toolbar 🎉

### Step 3: (Optional) Gemini API Key

For **best** homework checker results (multimodal vision AI):
1. Go to: https://aistudio.google.com/apikey
2. Sign in with any Google account → **Create API Key** (free)
3. Copy the key
4. Open OBI → Homework tab → paste key when prompted
5. Key is saved on your device — you only do this once

> **Without a Gemini API key**, the Homework Checker still works using built-in OCR (Tesseract.js) + OBI's backend.

---

## Features

| Feature | Description |
|---------|-------------|
| 💬 **Magic Chat** | Gemini Nano on-device ($0) with Cloudflare Workers fallback |
| 📸 **Homework Checker** | Camera capture + file upload, Tesseract OCR + Gemini Vision AI |
| 📚 **Vocab Trainer** | SRS flashcards, XP tracking, streak counter, Mouse→Tiger levels |
| 🌐 **Translation** | On-device EN ↔ VI translation via Chrome Built-in AI |
| 🎤 **Voice Input** | Web Speech API — speak instead of type |
| 🔊 **Auto-Speak** | SpeechSynthesis reads OBI's replies aloud (toggleable) |
| 📋 **Summarizer** | Chrome Built-in AI Summarizer API |
| ✏️ **Simplify** | Chrome Built-in AI Rewriter API for learner-level text |
| 🐭→🐯 **Level Tracking** | XP progress: Mouse → Cat → Wolf → Tiger |
| 📵 **Offline Detection** | Gemini Nano works offline; backend disabled when offline |
| 🖱️ **Context Menu** | Right-click selected text → "Ask OBI about this" |

---

## Requirements

| Requirement | Details |
|-------------|---------|
| **Chrome version** | 120 or later (Manifest V3 + Side Panel API) |
| **Gemini Nano (on-device AI)** | Chrome 120+; enable flags below |
| **Speech Recognition** | Requires internet connection (Web Speech API) |
| **Speech Synthesis** | Works offline (built into Chrome) |
| **Camera** | For Homework Checker — Chrome prompts for permission on first use |

### Enable Gemini Nano Flags (Optional, for best AI quality)

Navigate to `chrome://flags` and enable:

- `#prompt-api-for-gemini-nano` — **Enabled**
- `#translation-api` — **Enabled**
- `#language-detection-api` — **Enabled**
- `#summarization-api-for-gemini-nano` — **Enabled**
- `#rewriter-api-for-gemini-nano` — **Enabled**

After enabling flags, relaunch Chrome.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Chrome Extension                      │
│                                                          │
│  ┌──────────────┐   ┌───────────────────────────────┐   │
│  │  popup.html  │   │       sidepanel.html           │   │
│  │  popup.js    │   │       sidepanel.js              │   │
│  │  (380×520px) │   │  Chat + Translate + Summarize  │   │
│  └──────┬───────┘   └──────────────┬────────────────┘   │
│         │                          │                      │
│         └──────────┬───────────────┘                     │
│                    │                                      │
│         ┌──────────▼──────────┐                          │
│         │    background.js    │                          │
│         │  Service Worker     │                          │
│         │  Context Menu       │                          │
│         │  Side Panel Opener  │                          │
│         └──────────┬──────────┘                          │
│                    │                                      │
│         ┌──────────▼──────────┐                          │
│         │    content.js       │                          │
│         │  Inline Tooltip     │                          │
│         │  (selected text)    │                          │
│         └─────────────────────┘                          │
└─────────────────────┬───────────────────────────────────┘
                      │
          ┌───────────▼────────────────────────────────────┐
          │               AI Routing                        │
          │                                                  │
          │  💬 Chat:                                        │
          │   1. Gemini Nano (on-device, chrome.ai)          │
          │   2. Cloudflare Workers (naturalenglish.net)     │
          │                                                  │
          │  📸 Homework:                                    │
          │   1. Gemini Vision Flash (best quality)          │
          │   2. Tesseract OCR → OBI backend (free, local)  │
          │                                                  │
          │  📚 Vocab:                                       │
          │   All local — SRS algorithm in-browser          │
          └──────────────────────────────────────────────────┘
```

---

## File Structure

```
obi-chrome-extension/
├── manifest.json          MV3 manifest (v1.0.0)
├── background.js          Service worker — context menu, side panel
├── content.js             Inline tooltip on selected text
├── styles.css             Gospel 444 design system (shared tokens)
├── popup.html             Toolbar popup (380×520px) — Chat | Homework | Vocab tabs
├── popup.js               Chat logic, XP tracking, speech
├── sidepanel.html         Full side panel
├── sidepanel.js           Chat + translate + summarize + simplify
├── homework-checker.html  Camera capture + OCR + AI feedback
├── vocab-practice.html    SRS flashcards + XP + streaks
├── vocab-trainer.html     Alternate vocab trainer UI
├── writing-practice.html  Writing practice module
├── styles/
│   ├── popup.css          Popup dark theme
│   └── sidepanel.css      Side panel dark theme
├── lib/
│   ├── tesseract.min.js   Tesseract.js OCR library (bundled, runs client-side)
│   └── worker.min.js      Tesseract worker script
└── icons/
    ├── icon.svg           SVG logo (purple circle + gold O)
    ├── generate-icons.html Open in browser → download PNGs
    ├── icon-16.png        Toolbar icon
    ├── icon-48.png        Extensions page icon
    └── icon-128.png       Web Store / large icon
```

---

## Homework Checker — How It Works

1. **Upload or Capture** — Upload a photo or use the live camera
2. **Tesseract OCR** — Extracts text client-side (no server needed)
3. **AI Check** — Routes to best available AI:
   - **Gemini Vision** (if API key saved): Full multimodal analysis of the image
   - **OBI Backend** (fallback): Sends extracted OCR text to Cloudflare Workers
4. **Feedback** — Mouse→Tiger encouragement, never shaming

---

## Mouse → Tiger Level System

| Level | Emoji | Messages / XP |
|-------|-------|--------------|
| Mouse | 🐭 | 0–10 messages / 0–99 XP |
| Cat | 🐱 | 11–50 / 100–299 XP |
| Wolf | 🐺 | 51–200 / 300–599 XP |
| Tiger | 🐯 | 201+ / 600+ XP |

Progress is stored in `chrome.storage.local` and persists across sessions.

---

## Design Palette

| Token | Hex | Use |
|-------|-----|-----|
| Void Black | `#0f0f1a` | Background |
| Soul Purple | `#a855f7` | OBI messages, accents, borders |
| Imperial Gold | `#f59e0b` | User messages, XP bar, highlights |
| Text | `#f1f5f9` | Body text |

Fonts: **Inter** (UI body) + **Orbitron** (OBI header, bold display)

---

## Backend Fallback

When Gemini Nano is unavailable:

```
POST https://naturalenglishtraining.net/api/chat
Content-Type: application/json

{ "message": "...", "language": "en" }

→ { "reply": "..." }
```

Powered by Cloudflare Workers + DeepSeek V3.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Extension not loading | Make sure Developer Mode is ON in chrome://extensions |
| "Load unpacked" grayed out | Enable Developer Mode first |
| API key not working | Get a new free key at aistudio.google.com/apikey |
| Camera not working | Allow camera permission when Chrome asks |
| Photo not uploading | Try a smaller/clearer photo (under 20MB) |
| No AI response | Check internet connection |
| Gemini Nano unavailable | Enable flags at chrome://flags (see above) |

---

*OBI is built with ❤️ for Vietnamese English learners. 🐭→🐯*  
*Natural English Training — naturalenglishtraining.net*

