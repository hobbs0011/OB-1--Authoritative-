# OBI Chrome Extension

> **Natural English Training** — Your AI English tutor for Vietnamese students.  
> Mouse → Tiger. Permission over perfection.

---

## Quick Start — Load Unpacked in Chrome

1. **Clone / download** this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the `APPS/obi-chrome-extension/` folder.
5. OBI will appear in your Chrome toolbar.

> **Icons:** The repo includes placeholder icon stubs. To generate proper PNG icons, open  
> `icons/generate-icons.html` in Chrome, click each download button, and save the files to  
> `icons/icon-16.png`, `icons/icon-48.png`, `icons/icon-128.png`.

---

## Requirements

| Requirement | Details |
|-------------|---------|
| **Chrome version** | 120 or later (Manifest V3 + Side Panel API) |
| **Gemini Nano (on-device AI)** | Chrome 120+; enable flags below |
| **Speech Recognition** | Requires internet connection (Web Speech API) |
| **Speech Synthesis** | Works offline (built into Chrome) |

### Enable Gemini Nano Flags

Navigate to `chrome://flags` and enable:

- `#prompt-api-for-gemini-nano` — **Enabled**
- `#translation-api` — **Enabled**
- `#language-detection-api` — **Enabled**
- `#summarization-api-for-gemini-nano` — **Enabled**
- `#rewriter-api-for-gemini-nano` — **Enabled**

After enabling flags, relaunch Chrome.

---

## Features

| Feature | Description |
|---------|-------------|
| 💬 **AI Chat** | Gemini Nano on-device ($0) with Cloudflare Workers fallback |
| 🌐 **Translation** | On-device EN ↔ VI translation via Chrome AI |
| 🎤 **Voice Input** | Web Speech API — speak instead of type |
| 🔊 **Auto-Speak** | SpeechSynthesis reads OBI's replies aloud (toggleable) |
| 📋 **Summarizer** | Chrome Built-in AI Summarizer API |
| ✏️ **Simplify** | Chrome Built-in AI Rewriter API for learner-level text |
| 🐭→🐯 **Level Tracking** | XP progress: Mouse → Cat → Wolf → Tiger |
| 📵 **Offline Detection** | Gemini Nano still works; backend fallback disabled when offline |
| 🖱️ **Context Menu** | Right-click selected text → "Ask OBI about this" |

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
          ┌───────────▼────────────────────┐
          │      AI Routing                │
          │                                │
          │  1st: Gemini Nano (on-device)  │
          │       chrome.ai.languageModel  │
          │       chrome.ai.translator     │
          │       chrome.ai.summarizer     │
          │       chrome.ai.rewriter       │
          │                                │
          │  2nd: Cloudflare Workers       │
          │  https://naturalenglish       │
          │        training.net/api/chat  │
          └────────────────────────────────┘
```

---

## Mouse → Tiger Level System

| Level | Emoji | Messages |
|-------|-------|----------|
| Mouse | 🐭 | 0–10 |
| Cat | 🐱 | 11–50 |
| Wolf | 🐺 | 51–200 |
| Tiger | 🐯 | 201+ |

Progress is stored in `chrome.storage.local` and persists across sessions.

---

## File Structure

```
obi-chrome-extension/
├── manifest.json          MV3 manifest
├── background.js          Service worker — context menu, side panel
├── content.js             Inline tooltip on selected text
├── popup.html / popup.js  Toolbar popup (380×520px)
├── sidepanel.html / .js   Full side panel with all features
├── styles/
│   ├── popup.css          Popup dark theme
│   └── sidepanel.css      Side panel dark theme
└── icons/
    ├── icon.svg           SVG logo (purple circle + gold O)
    ├── generate-icons.html Open in browser → download PNGs
    ├── icon-16.png        (generate via generate-icons.html)
    ├── icon-48.png        (generate via generate-icons.html)
    └── icon-128.png       (generate via generate-icons.html)
```

---

## Design Palette

| Token | Hex | Use |
|-------|-----|-----|
| Void Black | `#0f0f1a` | Background |
| Soul Purple | `#a855f7` | OBI messages, accents, borders |
| Imperial Gold | `#f59e0b` | User messages, XP bar, highlights |
| Text | `#e0e0e0` | Body text |

Fonts: **Inter** (UI body) + **Orbitron** (OBI header, bold display)

---

## Backend Fallback

When Gemini Nano is unavailable or offline detection activates:

```
POST https://naturalenglishtraining.net/api/chat
Content-Type: application/json

{ "message": "...", "language": "en" }

→ { "reply": "..." }
```

Powered by Cloudflare Workers + DeepSeek V3.

---

*OBI is built with ❤️ for Vietnamese English learners. 🐭→🐯*
