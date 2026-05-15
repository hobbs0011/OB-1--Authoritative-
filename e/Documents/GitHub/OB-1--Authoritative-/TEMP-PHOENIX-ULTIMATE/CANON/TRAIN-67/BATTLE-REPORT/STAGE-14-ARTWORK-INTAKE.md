# BATTLE Stage 14 — Artwork Intake System

**Date:** 2026-03-26
**Architect:** Agent-99 (OB1)
**Scope:** System for Michael to share artwork and have it automatically catalogued, processed, and made available for content generation

---

## Executive Summary

Michael has artwork assets that need to flow into the content machine. This stage designs the intake pipeline: how art enters the system, gets tagged, stored, and made accessible to all downstream consumers (Discord, website, Roblox game, social media).

---

## Problem Statement

1. Michael has artwork scattered across devices, chats, and platforms
2. No centralized asset library exists
3. No tagging or metadata system for quick retrieval
4. No automated pipeline to turn raw art into formatted content
5. Art shared in chat disappears into transcript history

---

## Intake Architecture

### Input Channels (How Art Enters)

| Channel | Method | Auto-Catalogued? |
|---|---|---|
| Discord `#artwork-intake` | Upload image → bot processes | ✅ Yes |
| Notion page drop | Upload to Asset Library page | ✅ Yes (via Notion API) |
| GitHub push | Push to `ASSETS/` directory | ✅ Yes (via webhook) |
| Chat paste (this agent) | Michael pastes in conversation | ⚠️ Manual extraction needed |
| Email attachment | Forward to intake email | 🔧 Phase 2 |

### Recommended Primary Channel: **Discord `#artwork-intake`**

Why: Michael is already going to be in Discord. Upload image → bot auto-processes → done.

---

## Asset Library Structure

### GitHub (Immutable Mirror)
```
ASSETS/
├── RAW/                    # Original uploads, untouched
│   ├── characters/
│   ├── backgrounds/
│   ├── ui-elements/
│   ├── logos/
│   ├── promotional/
│   └── misc/
├── PROCESSED/              # Resized, optimized versions
│   ├── discord/            # 1024x1024, PNG
│   ├── website/            # WebP, multiple sizes
│   ├── roblox/             # Roblox-compatible formats
│   ├── social/             # Platform-specific sizes
│   └── thumbnails/         # 128x128 previews
├── TEMPLATES/              # Stage 15 output
└── MANIFEST.json           # Master index of all assets
```

### Notion (Control Plane)
Database: **Asset Library**

| Property | Type | Purpose |
|---|---|---|
| Name | Title | Descriptive name |
| Category | Select | character / background / ui / logo / promo / misc |
| Tags | Multi-select | style tags (cyberpunk, galaxy, gospel-444, mouse-tiger, etc.) |
| Platform | Multi-select | discord / website / roblox / social / all |
| Status | Status | Raw / Processing / Ready / Published |
| GitHub Path | URL | Link to file in repo |
| Dimensions | Text | WxH pixels |
| File Size | Number | KB |
| Upload Date | Date | When it entered the system |
| Used In | Relation | Links to content where this asset was used |
| Thumbnail | File | 128x128 preview |

---

## Auto-Processing Pipeline

### On Upload (Any Channel)

```
1. RECEIVE raw image
2. VALIDATE format (PNG, JPG, WebP, SVG accepted)
3. EXTRACT metadata (dimensions, file size, color palette)
4. AUTO-TAG using image analysis:
   - Color palette → map to Gospel 444 palette compliance
   - Content detection → character / background / text / logo
   - Style detection → cyberpunk / glassmorphism / flat / photo
5. GENERATE variants:
   - Discord: 1024x1024 PNG
   - Website hero: 1920x1080 WebP
   - Website card: 400x300 WebP
   - Social square: 1080x1080 PNG
   - Social story: 1080x1920 PNG
   - Roblox decal: 1024x1024 PNG
   - Thumbnail: 128x128 PNG
6. PUSH to GitHub ASSETS/ directory
7. CREATE Notion Asset Library entry
8. CONFIRM to user with thumbnail + metadata
```

### Technology Stack for Processing

| Component | Tool | Cost |
|---|---|---|
| Image resizing | Sharp.js (Node) or Cloudflare Image Resizing | Free / $5 mo |
| Format conversion | Sharp.js | Free |
| Auto-tagging | Cloudflare Workers AI (image classification) | Free tier |
| Color extraction | Color Thief (JS library) | Free |
| Storage | GitHub (source of truth) + Cloudflare R2 (CDN) | Free tier |

---

## Manual Intake Protocol (For Chat Pastes)

When Michael pastes artwork in a chat session:

1. Agent saves image to conversation context
2. Agent asks: "Category? Tags? Or should I auto-classify?"
3. Agent pushes to GitHub `ASSETS/RAW/[category]/`
4. Agent creates Notion Asset Library entry
5. Agent confirms with thumbnail preview

---

## Gospel 444 Palette Compliance Check

Every incoming asset gets scored against the brand palette:

| Color | Hex | Tolerance |
|---|---|---|
| Void (background) | `#0f0f1a` | ±15% |
| Purple (primary) | `#a855f7` | ±20% |
| Gold (accent) | `#f59e0b` | ±20% |
| White (text) | `#f0f0f5` | ±10% |

- **Score 80%+** → ✅ On-brand, auto-approve
- **Score 50-79%** → ⚠️ Usable but flag for review
- **Score <50%** → 🔴 Off-brand, needs color correction or manual override

---

## Action Items

| # | Action | Priority | Effort |
|---|---|---|---|
| 1 | Create `ASSETS/` directory structure in Ultimate repo | P0 | 15 min |
| 2 | Create Asset Library database in Notion | P0 | 30 min |
| 3 | Build Discord intake bot (channel + auto-process) | P1 | 4 hours |
| 4 | Build MANIFEST.json auto-generator | P1 | 2 hours |
| 5 | Integrate Sharp.js for variant generation | P1 | 4 hours |
| 6 | Set up Cloudflare R2 bucket for CDN serving | P2 | 1 hour |
| 7 | Build Notion API integration for auto-cataloguing | P2 | 4 hours |
