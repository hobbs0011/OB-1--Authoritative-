# OBI — Natural English Training Chrome Extension

> Your AI English conversation partner. Learn English naturally through real conversations.

## Quick Start (Developer Mode)

1. Open Chrome → `chrome://extensions/`
2. Enable **"Developer mode"** (top-right toggle)
3. Click **"Load unpacked"**
4. Select this `CHROME-EXT/` directory
5. Click the OBI icon in your toolbar
6. Start chatting!

## Architecture

```
CHROME-EXT/
├── manifest.json      # Chrome Extension Manifest V3
├── popup.html         # Main chat UI
├── popup.css          # Chat styling (dark theme)
├── popup.js           # Chat logic + API calls
├── background.js      # Service worker (session management)
├── content.js         # Future: floating widget on any page
├── content.css        # Future: widget styles
└── icons/             # Extension icons (16/48/128px)
```

## API Connection

| Environment | URL |
|------------|-----|
| Development | `https://net-obi-api.mrmichaelhobbs1234.workers.dev` |
| Production | `https://api.naturalenglishtraining.com` |

## Level Progression (Mouse → Tiger)

| Level | Icon | Description | Progression |
|-------|------|-------------|-------------|
| Mouse | 🐭 | Beginner — permission to make mistakes | 0% |
| Cat | 🐱 | Elementary — building confidence | 25% |
| Wolf | 🐺 | Intermediate — natural conversations | 60% |
| Tiger | 🐯 | Advanced — confident and fluent | 100% |

## Features (v0.1.0)

- ✅ Chat interface with OBI
- ✅ Session persistence (survives popup close)
- ✅ Chat history (last 30 messages)
- ✅ Level badge display
- ✅ Typing indicator animation
- ✅ Dark theme UI
- ✅ Responsive error handling
- 🔲 Real AI responses (Workers AI)
- 🔲 Correction highlighting
- 🔲 Floating widget on any page
- 🔲 Voice input/output
- 🔲 Progress tracking dashboard

## Publishing to Chrome Web Store

1. Create icons (16x16, 48x48, 128x128) in `icons/`
2. Zip this entire `CHROME-EXT/` directory
3. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. Upload the zip
5. Fill in listing details
6. Submit for review (usually 1-3 business days)

**Cost: $5 one-time developer registration fee**

## Total Platform Cost

| Component | Cost |
|-----------|------|
| Chrome Extension | $0/mo (free to distribute) |
| Cloudflare Workers API | $0/mo (free tier: 100K req/day) |
| Cloudflare KV | $0/mo (free tier: 100K reads/day) |
| Cloudflare Pages | $0/mo (static site hosting) |
| Cloudflare account | $5/mo (existing paid plan) |
| **Total** | **$5/mo** |

## License

© 2026 Natural English Training. All rights reserved.
