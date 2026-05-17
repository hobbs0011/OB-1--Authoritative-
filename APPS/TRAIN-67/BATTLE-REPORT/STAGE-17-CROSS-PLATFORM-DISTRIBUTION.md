# BATTLE Stage 17 — Cross-Platform Distribution

**Date:** 2026-03-26
**Architect:** Agent-99 (OB1)
**Scope:** Automated distribution of generated content across all platforms

---

## Executive Summary

Content generated in Stage 16 needs to reach audiences on Discord, Instagram, Facebook, Twitter/X, the NET website, and the Roblox game. This stage designs the distribution layer that publishes content to the right platform at the right time in the right format.

---

## Platform Map

| Platform | Content Types | Frequency | API Available? | Auto-Publish? |
|---|---|---|---|---|
| Discord | Challenges, vocab, leaderboards, events | Daily | ✅ discord.js | ✅ Full auto |
| Instagram | Tips, quotes, spotlights, promos | 3-5x/week | ⚠️ Graph API (limited) | ⚠️ Schedule only |
| Facebook Page | Tips, quotes, game updates | 3-5x/week | ✅ Graph API | ✅ Auto |
| Twitter/X | Tips, quotes, threads | 3-5x/week | ✅ API v2 | ✅ Auto |
| TikTok | Short video tips | 1-2x/week | ⚠️ Limited | ❌ Manual |
| NET Website | Lessons, blog posts, gallery | Weekly | ✅ Static deploy | ✅ Auto (via build) |
| Roblox Game | Loading tips, shop items, events | On update | ✅ Roblox API | ⚠️ Semi-auto |

---

## Distribution Architecture

```
┌─────────────────┐
│  Content Queue   │
│  (Notion DB)     │
└────────┬────────┘
         │ Scheduled time reached + Status = Ready
         ▼
┌─────────────────┐
│  Distributor     │
│  (CF Worker)     │
└────────┬────────┘
         │
    ┌────┼────┬────────┬──────────┬──────────┐
    ▼    ▼    ▼        ▼          ▼          ▼
Discord  FB  Twitter  Instagram  Website   Roblox
(API)  (API) (API)   (schedule) (deploy)  (manual)
```

---

## Platform-Specific Adapters

### Discord Adapter
| Feature | Implementation |
|---|---|
| Post to channel | discord.js `channel.send()` with embed |
| Image attachment | Upload rendered template image |
| Scheduling | Cloudflare Cron Trigger |
| Rich embeds | Custom embed builder with Gospel 444 colors |

### Facebook Adapter
| Feature | Implementation |
|---|---|
| Post to page | Facebook Graph API `/page/feed` |
| Image post | Upload image + caption |
| Scheduling | Built-in scheduling via API |
| Requirements | Facebook App + Page Access Token |

### Twitter/X Adapter
| Feature | Implementation |
|---|---|
| Post tweet | Twitter API v2 |
| Image tweet | Upload media then attach to tweet |
| Thread | Chain of tweets for longer content |
| Requirements | Twitter Developer account + OAuth 2.0 |

### Instagram Adapter
| Feature | Implementation |
|---|---|
| Post image | Instagram Graph API (Business/Creator account required) |
| Stories | Not available via API — manual or Later.com |
| Reels | Not available via API — manual |
| Requirements | Facebook Business + Instagram Business account |
| **Recommendation** | Use Later.com or Buffer for scheduling. $15/mo. |

### Website Adapter
| Feature | Implementation |
|---|---|
| Blog post | Generate HTML, push to `WEBSITE/blog/` on GitHub |
| Lesson page | Generate lesson HTML, push to `GALAXY-LESSONS/` |
| Deploy trigger | GitHub push → Cloudflare Pages auto-deploy |

### Roblox Adapter
| Feature | Implementation |
|---|---|
| Loading screen tips | Update `LoadingTips` DataStore via Open Cloud API |
| Shop items | Update `ShopCatalog` DataStore |
| Event data | Update `ActiveEvents` DataStore |
| Requirements | Roblox Open Cloud API key |

---

## Scheduling Strategy

### Optimal Posting Times (Vietnamese Audience)

| Time (ICT) | Platform | Content Type | Why |
|---|---|---|---|
| 07:00 | Discord | Word of the Day | Morning commute / coffee |
| 08:00 | Discord | Daily Challenge | Start of day energy |
| 11:30 | Instagram, Facebook | Tip of the Day | Lunch break scrolling |
| 12:00 | Discord | Conversation Starter | Lunch break engagement |
| 17:00 | Twitter | Quote / Tip | After work commute |
| 18:00 | Discord | Meme of the Day | Evening relaxation |
| 20:00 | Facebook | Longer content / Game update | Prime evening browsing |
| 21:00 | Instagram | Visual content / Story | Pre-sleep scrolling |

### Weekly Content Calendar (Cross-Platform)

| Day | Discord | Instagram | Facebook | Twitter |
|---|---|---|---|---|
| Mon | Challenge + Vocab + Leaderboard | Tip | Tip + Leaderboard | Quote |
| Tue | Challenge + Vocab + Speaking | — | — | Tip |
| Wed | Challenge + Vocab + Lesson | Lesson promo | Lesson promo | — |
| Thu | Challenge + Vocab + Speaking | Tip | — | Quote |
| Fri | Challenge + Vocab + Game Night | Meme | Game update | Tip |
| Sat | Challenge + Vocab + Workshop | Student spotlight | Spotlight | — |
| Sun | Challenge + Vocab (light day) | Quote | — | — |

---

## Analytics & Tracking

### Per-Platform Metrics

| Metric | Discord | Instagram | Facebook | Twitter |
|---|---|---|---|---|
| Impressions | Message views | Reach | Reach | Impressions |
| Engagement | Reactions + replies | Likes + comments | Likes + comments + shares | Likes + retweets |
| Clicks | Link clicks | Profile visits + link | Link clicks | Link clicks |
| Growth | New members | New followers | New page likes | New followers |

### UTM Tracking
All links include UTM parameters:
```
https://naturalenglishtraining.com?utm_source={platform}&utm_medium=social&utm_campaign={content_type}&utm_content={post_id}
```

### Weekly Report (Auto-Generated)
Pulled from platform APIs → formatted → posted to `#analytics` (Discord staff channel) + Notion Build Log

---

## Tool Recommendations

| Need | Tool | Cost | Notes |
|---|---|---|---|
| Multi-platform scheduling | Buffer or Later | $15-30/mo | Handles Instagram stories + scheduling |
| Link shortening + tracking | Dub.co or Bitly | Free tier | UTM builder included |
| Analytics dashboard | Notion (aggregated) | Free | Pull from platform APIs weekly |
| Image CDN | Cloudflare R2 + Images | Free tier | Serve optimized images |

### DIY vs SaaS Decision

| Approach | Pros | Cons | Monthly Cost |
|---|---|---|---|
| Full DIY (custom bots) | Total control, no recurring cost | Dev time, maintenance | $3-16 (API costs only) |
| Hybrid (DIY Discord + Buffer for social) | Best of both, saves dev time | Monthly subscription | $18-46 |
| Full SaaS (Buffer + Zapier) | Fastest to launch, least code | Least control, highest cost | $50-100 |

**Recommendation: Hybrid.** DIY for Discord (we're building bots anyway). Buffer/Later for Instagram/Facebook/Twitter.

---

## Action Items

| # | Action | Priority | Effort |
|---|---|---|---|
| 1 | Set up Facebook Business page for NET | P0 | 1 hour |
| 2 | Set up Instagram Business account | P0 | 30 min |
| 3 | Set up Twitter/X account for NET | P0 | 30 min |
| 4 | Sign up for Buffer or Later (free trial) | P1 | 15 min |
| 5 | Build Discord distribution adapter | P1 | 2 hours |
| 6 | Build Facebook API adapter | P2 | 4 hours |
| 7 | Build Twitter API adapter | P2 | 4 hours |
| 8 | Configure UTM tracking | P1 | 1 hour |
| 9 | Build weekly analytics aggregator | P2 | 6 hours |
| 10 | Set up Cloudflare Pages for website auto-deploy | P1 | 2 hours |
