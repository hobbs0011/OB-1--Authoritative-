# BATTLE Stage 15 — Template Engine

**Date:** 2026-03-26
**Architect:** Agent-99 (OB1)
**Scope:** Reusable visual templates that combine artwork with text for automated content generation

---

## Executive Summary

Templates are the bridge between raw artwork and published content. This stage designs a template system where artwork + text variables = finished visual content for Discord, social media, website, and in-game use.

---

## Template Categories

### 1. Discord Templates

| Template | Size | Variables | Use Case |
|---|---|---|---|
| Daily Challenge Card | 800x400 | `{challenge_text}`, `{day_number}`, `{theme}` | `#daily-challenge` auto-post |
| Word of the Day Card | 800x400 | `{word}`, `{definition}`, `{vietnamese}`, `{example}` | `#vocabulary-builder` |
| Weekly Leaderboard | 800x600 | `{rank_1-5}`, `{xp_1-5}`, `{week_number}` | `#leaderboards` |
| Achievement Badge | 400x400 | `{username}`, `{level}`, `{role_emoji}` | `#achievements` |
| Event Announcement | 1200x628 | `{event_name}`, `{date}`, `{time}`, `{description}` | `#events` |
| Welcome Card | 800x400 | `{username}`, `{member_count}` | DM on join |

### 2. Social Media Templates

| Template | Size | Platform | Variables |
|---|---|---|---|
| Quote Card (Square) | 1080x1080 | Instagram, Facebook | `{quote}`, `{author}`, `{background_image}` |
| Quote Card (Story) | 1080x1920 | Instagram Stories, TikTok | Same |
| Tip of the Day | 1080x1080 | All | `{tip_text}`, `{tip_number}` |
| Student Spotlight | 1080x1080 | All | `{name}`, `{quote}`, `{photo}`, `{level}` |
| Game Update | 1200x628 | Facebook, Twitter | `{update_title}`, `{screenshot}`, `{version}` |
| Lesson Promo | 1080x1080 | All | `{lesson_name}`, `{description}`, `{emoji}` |

### 3. Website Templates

| Template | Size | Variables |
|---|---|---|
| Blog Post Header | 1920x600 | `{title}`, `{subtitle}`, `{background}` |
| Lesson Card | 400x300 | `{lesson_name}`, `{description}`, `{icon}` |
| Testimonial Card | 600x400 | `{quote}`, `{name}`, `{role}`, `{photo}` |
| OG Image | 1200x630 | `{page_title}`, `{description}` |

### 4. Roblox Game Templates

| Template | Size | Variables |
|---|---|---|
| Loading Screen | 1920x1080 | `{tip_text}`, `{version}` |
| Billboard/Decal | 1024x512 | `{text}`, `{image}` |
| Shop Item Card | 512x512 | `{item_name}`, `{price}`, `{image}` |
| Achievement Popup | 600x200 | `{achievement_name}`, `{description}` |

---

## Template Design System

### Gospel 444 Design Tokens

```css
/* Base Palette */
--void: #0f0f1a;
--void-light: #1a1a2e;
--purple: #a855f7;
--purple-glow: rgba(168,85,247,0.3);
--gold: #f59e0b;
--gold-glow: rgba(245,158,11,0.3);
--white: #f0f0f5;
--gray: #9ca3af;

/* Typography */
--font-display: 'Orbitron', sans-serif;  /* Headlines */
--font-sub: 'Rajdhani', sans-serif;       /* Sub-headlines */
--font-body: 'Inter', sans-serif;         /* Body text */

/* Effects */
--border-radius: 12px;
--glow-purple: 0 0 20px rgba(168,85,247,0.4);
--glow-gold: 0 0 20px rgba(245,158,11,0.4);
--gradient-primary: linear-gradient(135deg, #a855f7, #f59e0b);
```

### Style Variants

| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| **Cyberpunk** | Void + star field | White + gold glow | Purple glow border | Default / high impact |
| **Glassmorphism** | Blurred background | White | Frosted glass effect | Elegant / cards |
| **Minimal** | Solid void | White | Thin purple line | Data-heavy / leaderboards |
| **Bold** | Gold gradient | Void (dark text) | None | CTAs / announcements |

---

## Technical Implementation

### Option A: HTML/CSS → Image (Recommended)

**Stack:** Puppeteer or Playwright on Cloudflare Worker (via Browser Rendering API)

```
Template (HTML/CSS) + Variables (JSON) → Headless Browser → Screenshot → PNG/WebP
```

**Pros:** Full CSS control, responsive, easy to update templates, web fonts work
**Cons:** Slightly slower (~2-5 seconds per image)

### Option B: Canvas API (Node.js)

**Stack:** node-canvas or @napi-rs/canvas

```
Template (JS Canvas instructions) + Variables → Canvas render → PNG
```

**Pros:** Fast (~200ms), no browser dependency
**Cons:** Harder to design, no CSS, font management pain

### Option C: Figma API + Automation

**Stack:** Figma templates + Figma REST API

```
Figma template + Variables → API call → Export PNG
```

**Pros:** Designer-friendly, pixel-perfect
**Cons:** Requires Figma Pro ($15/mo), API rate limits

### Recommendation: **Option A (HTML/CSS → Image)**

Reason: Michael already has the website CSS with Gospel 444 styling. Templates can literally reuse the same CSS. Cloudflare Browser Rendering API is free tier eligible.

---

## Template File Structure

```
ASSETS/TEMPLATES/
├── discord/
│   ├── daily-challenge.html
│   ├── word-of-day.html
│   ├── leaderboard.html
│   ├── achievement.html
│   ├── event.html
│   └── welcome.html
├── social/
│   ├── quote-square.html
│   ├── quote-story.html
│   ├── tip-of-day.html
│   ├── student-spotlight.html
│   └── game-update.html
├── website/
│   ├── blog-header.html
│   ├── lesson-card.html
│   ├── og-image.html
│   └── testimonial.html
├── game/
│   ├── loading-screen.html
│   ├── shop-card.html
│   └── achievement-popup.html
├── shared/
│   ├── base.css          # Gospel 444 tokens
│   ├── fonts.css         # Orbitron, Rajdhani, Inter
│   └── components.css    # Reusable components
└── render.js             # Template renderer (Puppeteer)
```

---

## API Design

```
POST /api/render-template
{
  "template": "discord/daily-challenge",
  "variables": {
    "challenge_text": "Describe your morning routine in 3 sentences",
    "day_number": 42,
    "theme": "Daily Life"
  },
  "format": "png",
  "size": "800x400"
}

→ Returns: image binary or CDN URL
```

---

## Action Items

| # | Action | Priority | Effort |
|---|---|---|---|
| 1 | Create `ASSETS/TEMPLATES/` directory structure | P0 | 15 min |
| 2 | Build `shared/base.css` from website CSS | P0 | 1 hour |
| 3 | Build first 3 Discord templates (challenge, vocab, welcome) | P1 | 4 hours |
| 4 | Build template renderer (Puppeteer on CF Worker) | P1 | 6 hours |
| 5 | Build social media templates (quote, tip) | P2 | 4 hours |
| 6 | Build Roblox game templates | P2 | 3 hours |
| 7 | Create render API endpoint | P2 | 4 hours |
