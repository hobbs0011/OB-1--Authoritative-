# Phoenix Rising — FullStack Marketing
## Art / Images / Iconology Subsystem

**Org**: [Phoenix-Rising-Ai-Solutions](https://github.com/Phoenix-Rising-Ai-Solutions)  
**Parent system**: [Phoenix-Rising-Ultimate](https://github.com/hobbs0011/Phoenix-Rising-Ultimate) (canon vault)  
**Brand**: Natural English Training (naturalenglishtraining.net)  
**Agent**: OB1 Ne0 | Marketing Lane | Synch3

---

## What this repo is

The **canonical image + iconology library** for all NET/OBI marketing output.

This is NOT copywriting. Copywriting lives in a separate subsystem.  
This repo = art, visual identity, asset management, social graphics, icons, logos.

---

## Subsystem Map

```
Phoenix-Rising-Ai-Solutions/
└── Phoenix-Rising-FullStackMarketing/
    ├── art/              ← core artwork (hero pieces, key visuals)
    ├── logos/            ← logo variations (primary, stacked, icon-only, white, dark)
    ├── iconology/        ← icon sets, emojis, discord stickers, UI icons
    ├── social/           ← platform-spec social graphics (Facebook, LinkedIn, Discord)
    ├── sales-funnel/     ← funnel stage images (hero, step, CTA, email)
    ├── website/          ← website images (hero, banner, section dividers)
    ├── characters/       ← OBI + Tiger + Mouse character art
    ├── raw-intake/       ← DROP ZONE — PDFs, notebook exports, raw images before processing
    ├── processed/        ← post-intake WebP-converted, indexed assets
    └── INDEX.json        ← master asset registry (machine-readable, MagicChat query target)
```

---

## Folder Definitions

| Folder | Content | Use Slots |
|--------|---------|-----------|
| `art/` | Hero pieces, core visual art, brand pillars | website-hero, presentation-slide, email-header |
| `logos/` | All logo variants — dark bg, light bg, icon, stacked, animated | app-header, discord-server-icon, print, favicon |
| `iconology/` | Icon sets, emoji packs, discord stickers, UI elements | discord-emoji, discord-sticker, app-ui, favicon |
| `social/` | Facebook covers/posts, LinkedIn banners/posts | facebook-cover-820x312, facebook-post-1080x1080, linkedin-cover-1584x396, linkedin-post-1200x627 |
| `sales-funnel/` | Funnel stage artwork — awareness through conversion | sales-funnel-hero, sales-funnel-step, sales-funnel-cta, email-header |
| `website/` | Website-specific images — hero, banner, section art | website-hero, website-banner, website-section |
| `characters/` | OBI mascot, Tiger character, Mouse character, progression art | lesson-header, website-hero, discord-sticker, social-square-1080 |
| `raw-intake/` | Raw drops — PDFs, notebook exports, PNGs before processing | — (staging only) |
| `processed/` | Final WebP assets after intake pipeline | all use slots |

---

## Platform Dimensions Reference

| Use Slot | Dimensions | Platform |
|----------|-----------|---------|
| facebook-cover-820x312 | 820×312px | Facebook |
| facebook-post-1080x1080 | 1080×1080px | Facebook |
| linkedin-cover-1584x396 | 1584×396px | LinkedIn |
| linkedin-post-1200x627 | 1200×627px | LinkedIn |
| discord-emoji-56x56 | 56×56px | Discord |
| discord-sticker-320x320 | 320×320px | Discord |
| discord-server-icon-512x512 | 512×512px | Discord |
| discord-banner-960x540 | 960×540px | Discord |
| website-hero | 1920×1080px min | Web |
| website-banner | 1280×400px | Web |
| sales-funnel-hero | 1200×628px | Email/Web |
| social-square-1080 | 1080×1080px | Universal |
| social-story-1080x1920 | 1080×1920px | Universal |
| email-header-600x200 | 600×200px | Email |
| print | 300dpi min | Physical |

---

## Gospel 444 Design Law

> All art in this repo MUST comply with Gospel 444 visual identity.

- **Background**: void black `#0f0f1a`
- **Primary accent**: soul purple `#a855f7`
- **Secondary accent**: imperial gold `#f59e0b`
- **BANNED**: blue in any form
- **Typography**: Orbitron / Rajdhani for display | Inter for body
- **Direction**: black glass luxury | purple neon edge glow | gold accents | big typography | minimal clutter

Intake scoring: every asset gets a Gospel 444 compliance grade:
- ✅ PASS — fully compliant
- ⚠️ CONDITIONAL — minor deviation, usable with note
- ❌ FAIL — brand violation, do not publish

---

## How to Add Assets

1. Drop raw files into `raw-intake/`
2. Run intake pipeline (Agent 99 via MagicChat or `/marketing-intake` command)
3. Agent classifies, converts, and writes `INDEX.json` entries
4. Processed files move to appropriate folder
5. Commit with tag: `intake: {asset-name} — {category}`

---

## Cross-Repo Links

| Repo | Relationship |
|------|-------------|
| [Phoenix-Rising-Ultimate](https://github.com/hobbs0011/Phoenix-Rising-Ultimate) | Canon vault — COLD-START-BOOT, CANON/, ASSETS/ART-ARSENAL/ |
| `Phoenix-Rising-FullStackMarketing` (this repo) | Marketing art subsystem |
| `Phoenix-Rising-Copywriting` (coming) | Marketing text/copy subsystem |

---

## MagicChat Integration

This repo is indexed by Agent 99 for MagicChat queries:

> "Give me a LinkedIn banner for Tiger Mode" → Agent queries INDEX.json → returns asset path + CDN URL

INDEX.json schema is compatible with `ASSETS/ART-ARSENAL/INDEX.json` in the canon vault.

---

*Natural English Training — Mouse → Tiger — Gospel 444*
