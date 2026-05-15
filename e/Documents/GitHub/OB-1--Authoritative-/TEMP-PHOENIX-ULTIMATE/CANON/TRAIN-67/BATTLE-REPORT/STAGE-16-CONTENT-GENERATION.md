# BATTLE Stage 16 — Content Generation Pipeline

**Date:** 2026-03-26
**Architect:** Agent-99 (OB1)
**Scope:** Automated pipeline that combines artwork + templates + AI to generate ready-to-publish content

---

## Executive Summary

This is where the magic happens. Artwork (Stage 14) + Templates (Stage 15) + AI (DeepSeek) = automated content factory. The system generates daily Discord posts, social media content, lesson materials, and game assets with minimal manual intervention.

---

## Pipeline Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Content Brief   │────▶│  AI Generator │────▶│ Template Render  │
│  (schedule/manual)│     │  (DeepSeek)   │     │  (Puppeteer)     │
└─────────────────┘     └──────────────┘     └─────────────────┘
                                                       │
                                              ┌────────┴────────┐
                                              │  Asset Selector  │
                                              │  (from Library)  │
                                              └────────┬────────┘
                                                       │
                                              ┌────────┴────────┐
                                              │  Output Queue    │
                                              │  (ready to post) │
                                              └─────────────────┘
```

---

## Content Types & Generation Rules

### 1. Daily Challenge (Discord)

| Field | Source |
|---|---|
| Challenge text | AI-generated based on weekly theme + difficulty level |
| Background image | Random from `ASSETS/RAW/backgrounds/` |
| Template | `discord/daily-challenge.html` |
| Schedule | Daily 08:00 ICT |
| Approval | Auto-publish (AI pre-approved prompts from curated bank) |

**Generation prompt:**
```
You are an English teacher creating a daily challenge for Vietnamese learners.
Theme: {weekly_theme}
Difficulty: {mouse|cat|tiger}
Create a fun, engaging challenge that:
- Can be answered in 1-3 sentences
- Uses vocabulary from the weekly theme
- Has a clear correct/good answer but allows creativity
- Feels conversational, not textbook-like
Output: challenge_text (max 100 chars), hint (optional)
```

### 2. Word of the Day (Discord)

| Field | Source |
|---|---|
| Word | Curated word bank (500+ words, categorized by theme/level) |
| Definition | AI-generated (simple, learner-friendly) |
| Vietnamese | Dictionary lookup + AI verification |
| Examples | AI-generated (3 natural sentences) |
| Template | `discord/word-of-day.html` |
| Schedule | Daily 07:00 ICT |

### 3. Social Media Posts

| Type | Frequency | AI Role | Human Role |
|---|---|---|---|
| English tip | 3x/week | Generate tip text | Review before publish |
| Quote card | 2x/week | Select/format quote | Approve artwork |
| Lesson promo | 1x/week | Write description | Approve |
| Student spotlight | 1x/week | Draft copy | Michael provides photo/quote |
| Game update | On release | Summarize changelog | Approve |

### 4. Lesson Materials

| Type | AI Role | Output |
|---|---|---|
| Galaxy Lesson content | Generate exercises, scenarios | HTML lesson file |
| Vocabulary lists | Curate from word bank by theme | JSON data file |
| Roleplay scripts | Generate conversation scenarios | Text + audio prompts |
| Quiz questions | Generate from lesson content | JSON quiz data |

---

## Content Queue System

### Notion Database: Content Queue

| Property | Type | Purpose |
|---|---|---|
| Title | Title | Content title/description |
| Type | Select | daily-challenge / word-of-day / social-tip / social-quote / lesson / game |
| Platform | Multi-select | discord / instagram / facebook / twitter / website / roblox |
| Status | Status | Draft / Ready / Scheduled / Published / Failed |
| Scheduled For | Date | When to publish |
| Generated Content | Text | The AI-generated text |
| Template | Select | Which template to use |
| Assets Used | Relation | Link to Asset Library entries |
| Rendered Image | File | The final rendered image |
| Published URL | URL | Where it was published |

### Queue Workflow

```
1. CRON or MANUAL trigger → generates content brief
2. AI generates text content
3. Asset selector picks appropriate artwork
4. Template renderer creates final image
5. Entry added to Content Queue as "Ready"
6. Publisher bot checks queue every 5 minutes
7. If scheduled time has passed + status is "Ready" → publish
8. Update status to "Published" + store published URL
```

---

## Word Bank Architecture

### Structure
```json
{
  "words": [
    {
      "word": "resilient",
      "level": "tiger",
      "theme": ["personality", "career"],
      "definition": "able to recover quickly from difficulties",
      "vietnamese": "kiên cường",
      "examples": [
        "She's incredibly resilient — nothing keeps her down.",
        "Building a resilient team means embracing failure.",
        "The most resilient students are the ones who make the most mistakes."
      ],
      "pronunciation": "/rɪˈzɪl.i.ənt/",
      "used_on": null
    }
  ]
}
```

### Bank Size Target
| Level | Words | Status |
|---|---|---|
| Mouse (A1-A2) | 200 | 🔧 Build |
| Cat (B1-B2) | 200 | 🔧 Build |
| Tiger (C1-C2) | 100 | 🔧 Build |
| **Total** | **500** | **🔧 Build** |

AI can generate the initial bank; Michael curates and approves.

---

## Quality Control

### Auto-Publish Rules (No Human Review Needed)
- Daily challenges (from pre-approved prompt patterns)
- Word of the day (from curated word bank)
- Leaderboard updates (data-driven, no creative content)
- Achievement announcements (templated)

### Human Review Required
- Social media posts (Michael reviews before publish)
- New lesson content (Michael approves)
- Student spotlights (privacy review)
- Any content using student-submitted artwork
- Game update announcements

### AI Content Guardrails
| Rule | Implementation |
|---|---|
| No fabricated statistics | System prompt instruction |
| No cultural insensitivity | Vietnamese cultural context in system prompt |
| No competitor mentions | Blocklist in post-processing |
| Age-appropriate | Content filter (target: 13+ audience) |
| Brand voice consistency | System prompt with NET tone guide |

---

## Cost Estimate

| Component | Monthly Cost |
|---|---|
| DeepSeek API (content generation) | $3-8 |
| Cloudflare Worker (template rendering) | $0-5 |
| Cloudflare R2 (image storage) | $0-3 |
| **Total** | **$3-16/month** |

---

## Action Items

| # | Action | Priority | Effort |
|---|---|---|---|
| 1 | Build word bank (500 words, JSON) | P0 | 8 hours (AI-assisted) |
| 2 | Create Content Queue database in Notion | P0 | 30 min |
| 3 | Build daily challenge generator (AI + template) | P1 | 4 hours |
| 4 | Build word-of-day generator (bank + template) | P1 | 3 hours |
| 5 | Build social media content generator | P1 | 6 hours |
| 6 | Build publisher bot (queue → platform) | P2 | 8 hours |
| 7 | Build lesson content generator | P2 | 12 hours |
