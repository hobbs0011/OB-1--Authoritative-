# BATTLE Stage 11 — Discord Bot Architecture

**Date:** 2026-03-26
**Architect:** Agent-99 (OB1)
**Scope:** Full bot ecosystem design for NET Discord community

---

## Executive Summary

Three-bot architecture: **OBI Bot** (custom AI tutor), **NET-XP Bot** (gamification), and **NET-Admin Bot** (moderation + analytics). Custom OBI Bot is the differentiator — most Discord English servers don't have an AI tutor embedded.

---

## Bot 1: OBI Bot (Custom — Priority Build)

### Purpose
Bring the OBI AI tutor into Discord. Students can practice English directly in the server without visiting the website.

### Technical Architecture
```
Discord API (discord.js v14)
    ↓
OBI Gateway (Cloudflare Worker)
    ↓
DeepSeek API (language model)
    +
Deepgram API (voice transcription)
```

### Commands
| Command | Description | Channel |
|---|---|---|
| `/obi chat [message]` | Conversational English practice | Any |
| `/obi correct [text]` | Get grammar/pronunciation correction | `#grammar-help` |
| `/obi vocab [word]` | Get definition, examples, pronunciation | `#vocabulary-builder` |
| `/obi challenge` | Get a random English challenge | `#daily-challenge` |
| `/obi level` | Check your English level assessment | Any |
| `/obi roleplay [scenario]` | Start a roleplay scenario (restaurant, interview, etc.) | `#daily-challenge` |
| `/obi translate [text]` | Vietnamese ↔ English translation | Any |

### Automated Actions
| Trigger | Action | Schedule |
|---|---|---|
| Daily 08:00 ICT | Post daily English challenge to `#daily-challenge` | Cron |
| Daily 12:00 ICT | Post word of the day to `#vocabulary-builder` | Cron |
| New member join | Send welcome DM with OBI introduction + first challenge | Event |
| Message in `#grammar-help` | Auto-analyze and suggest corrections | Event |
| Voice channel join | Greet in voice (optional TTS) | Event |

### Technical Requirements
- **Hosting:** Cloudflare Worker (reuse existing `phoenix-ob1` infrastructure)
- **Database:** Cloudflare D1 or KV for user preferences and conversation history
- **Rate limiting:** 10 messages per user per minute (prevent abuse)
- **Context window:** Last 10 messages per user per channel for conversation continuity
- **Cost estimate:** ~$5-20/month (DeepSeek is cheap, Deepgram for voice only)

### Privacy
- No message logging outside of active conversations
- User can `/obi forget` to clear their conversation history
- Vietnamese corner (`#vietnamese-corner`) excluded from bot monitoring

---

## Bot 2: NET-XP Bot (Gamification)

### Purpose
Reward English usage with XP, levels, and roles. Make the server addictive through gamification.

### Option A: Custom Build
Build from scratch for full control over XP algorithm.

### Option B: MEE6 / Arcane / YAGPDB (Recommended for Speed)
Use existing bot with custom configuration. Migrate to custom when needed.

### XP Rules
| Action | XP Reward | Cooldown | Notes |
|---|---|---|---|
| Send message (English) | 15-25 XP | 1 per minute | Language detection via API |
| Send message (Vietnamese) | 5 XP | 1 per minute | Lower reward incentivizes English |
| Voice channel (per minute) | 3 XP | Continuous | Must have 2+ people in channel |
| Daily challenge completed | 50 XP | 1 per day | Verified by reaction/response |
| Help another member | 30 XP | Manual mod award | Mod assigns via command |
| Share screenshot/meme | 10 XP | 3 per day | Media channels only |
| Weekly writing submission | 100 XP | 1 per week | `#writing-workshop` |
| Invite a friend (verified) | 200 XP | Unlimited | Invite tracking |

### Level Thresholds
| Level | XP Required | Role Earned | Perks |
|---|---|---|---|
| 1-9 | 0-500 | 🐭 Mouse | Basic access |
| 10-19 | 500-2,000 | 🐭 Mouse+ | Custom color |
| 20-34 | 2,000-8,000 | 🐱 Cat | Intermediate channels |
| 35-49 | 8,000-20,000 | 🐱 Cat+ | Voice priority |
| 50-74 | 20,000-50,000 | 🐯 Tiger | All channels + mentor role |
| 75-99 | 50,000-100,000 | 🐯 Tiger+ | Custom emoji slot |
| 100 | 100,000+ | 👑 Legend | Hall of fame |

### Leaderboards
- Weekly top 10 posted to `#leaderboards` every Monday 09:00 ICT
- Monthly Hall of Fame with special role badge
- All-time leaderboard accessible via `/xp top`

---

## Bot 3: NET-Admin Bot (Moderation + Analytics)

### Purpose
Automate moderation, track community health metrics, and bridge Discord ↔ GitHub/Notion.

### Option: Carl-bot or Custom
Carl-bot handles 80% of needs. Custom for the Notion/GitHub bridges.

### Moderation Features
| Feature | Implementation |
|---|---|---|
| Auto-mod profanity filter | Built-in Discord AutoMod + custom word list |
| Spam detection | Rate limit: 5 messages in 5 seconds = timeout |
| Link filtering | Whitelist: roblox.com, naturalenglishtraining.com, youtube.com |
| Raid protection | Account age < 7 days + burst join = lockdown |
| Warning system | 3 warnings = 24h mute, 5 = kick, 7 = ban |

### Analytics (Weekly Digest → `#analytics`)
| Metric | Source |
|---|---|---|
| Active members (DAU/WAU/MAU) | Discord API |
| Messages per channel | Discord API |
| Voice minutes total | Discord API |
| Top contributors | XP bot data |
| New member retention (7-day) | Join date tracking |
| English vs Vietnamese message ratio | Language detection |

### Bridge Integrations
| Bridge | Direction | Purpose |
|---|---|---|
| GitHub → Discord | One-way | Commit notifications to `#roblox-updates` |
| Discord → Notion | One-way | Bug reports from `#game-feedback` → Backlog DB |
| Discord → Notion | One-way | Weekly analytics digest → Build Log |

---

## Deployment Priority

| Phase | Bot | Timeline | Effort |
|---|---|---|---|
| Phase 1 (Launch) | MEE6/Arcane for XP + Carl-bot for moderation | Day 1 | 2 hours config |
| Phase 2 (Week 2) | OBI Bot MVP (chat + daily challenge) | Week 2 | 20 hours dev |
| Phase 3 (Month 1) | OBI Bot full (voice, roleplay, corrections) | Month 1 | 40 hours dev |
| Phase 4 (Month 2) | Custom XP bot (replace MEE6) | Month 2 | 30 hours dev |
| Phase 5 (Month 3) | Full analytics + bridge bots | Month 3 | 20 hours dev |

---

## Cost Estimate

| Item | Monthly Cost |
|---|---|
| Discord server | Free |
| MEE6 Premium (optional) | $12/mo |
| Cloudflare Worker (OBI Bot) | $5/mo (free tier may suffice) |
| DeepSeek API | $5-15/mo (usage dependent) |
| Deepgram API (voice) | $5-10/mo (usage dependent) |
| **Total** | **$15-42/month** |

---

## Security Considerations

| Risk | Mitigation |
|---|---|
| API key exposure | All keys in Cloudflare Worker secrets, never in bot code |
| Prompt injection via OBI | System prompt hardened, user input sanitized |
| Bot token leak | Store in environment variables, rotate quarterly |
| User data collection | Minimal data retention, GDPR-compliant |
| Abuse of OBI for non-English content | Rate limiting + content filter |
