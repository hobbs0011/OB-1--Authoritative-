# BATTLE Stage 13 — Discord Build & Deploy Plan

**Date:** 2026-03-26
**Architect:** Agent-99 (OB1)
**Scope:** Step-by-step implementation plan to go from zero to live Discord community

---

## Executive Summary

**30-day build plan** from server creation to community launch. Three phases: Infrastructure (Days 1-3), Bot Integration (Days 4-14), and Soft Launch (Days 15-30).

---

## Phase 1: Infrastructure (Days 1-3)

### Day 1: Server Creation
| Step | Action | Time |
|---|---|---|
| 1.1 | Create Discord server "Natural English Training" | 5 min |
| 1.2 | Upload server icon (NET logo — purple/gold palette) | 5 min |
| 1.3 | Set server banner (Mouse → Tiger artwork) | 5 min |
| 1.4 | Configure server settings: verification level = Medium, content filter = high | 5 min |
| 1.5 | Enable Community features (enables: welcome screen, server discovery, announcement channels) | 5 min |
| 1.6 | Enable Developer Mode (for bot setup) | 2 min |

### Day 2: Channel Architecture
| Step | Action | Time |
|---|---|---|
| 2.1 | Create all categories from Stage 10 blueprint | 15 min |
| 2.2 | Create all channels with descriptions | 30 min |
| 2.3 | Set channel permissions per role | 30 min |
| 2.4 | Create 3 voice channels (Speaking Room 1/2/3) | 5 min |
| 2.5 | Create Stage channel for events | 5 min |
| 2.6 | Write `#rules` content | 20 min |
| 2.7 | Write `#welcome` content with role reaction setup | 20 min |

### Day 3: Role Setup
| Step | Action | Time |
|---|---|---|
| 3.1 | Create all roles from Stage 10 hierarchy | 15 min |
| 3.2 | Set role colors (Gospel 444 palette: gold, purple, green, blue, orange) | 10 min |
| 3.3 | Configure role permissions | 20 min |
| 3.4 | Set up reaction roles in `#choose-your-level` | 15 min |
| 3.5 | Test all permissions with alt account | 30 min |

---

## Phase 2: Bot Integration (Days 4-14)

### Days 4-5: Off-the-Shelf Bots
| Step | Action | Time |
|---|---|---|
| 4.1 | Add MEE6 (or Arcane) — configure XP system per Stage 11 rules | 1 hour |
| 4.2 | Add Carl-bot — configure auto-moderation | 1 hour |
| 4.3 | Add Dyno or YAGPDB — backup moderation + custom commands | 30 min |
| 4.4 | Configure welcome message DM | 20 min |
| 4.5 | Set up auto-role assignment on join (🐭 Mouse) | 10 min |
| 5.1 | Configure XP multipliers per channel | 30 min |
| 5.2 | Set up level-up announcements in `#achievements` | 15 min |
| 5.3 | Configure auto-role promotion at level thresholds | 30 min |
| 5.4 | Test full XP flow: join → post → level up → role change | 1 hour |

### Days 6-10: OBI Bot MVP
| Step | Action | Time |
|---|---|---|
| 6.1 | Create Discord Application + Bot account at discord.dev | 15 min |
| 6.2 | Set up bot repo: `hobbs0011/net-obi-discord-bot` | 10 min |
| 6.3 | Scaffold discord.js v14 project | 30 min |
| 6.4 | Implement `/obi chat` command — proxy to DeepSeek via Cloudflare Worker | 4 hours |
| 7.1 | Implement `/obi vocab` command | 2 hours |
| 7.2 | Implement `/obi correct` command | 2 hours |
| 8.1 | Implement daily challenge auto-post (cron) | 2 hours |
| 8.2 | Implement word of the day auto-post (cron) | 1 hour |
| 9.1 | Deploy bot to Cloudflare Worker (or Railway/Fly.io for persistent connection) | 2 hours |
| 9.2 | Test all commands in dev server | 2 hours |
| 10.1 | Bug fixes + polish | 4 hours |
| 10.2 | Deploy to production server | 1 hour |

### Days 11-14: Integration Bridges
| Step | Action | Time |
|---|---|---|
| 11.1 | Set up GitHub webhook → `#roblox-updates` channel | 30 min |
| 12.1 | Create invite link with tracking | 10 min |
| 12.2 | Create server discovery listing | 20 min |
| 13.1 | Prepare 7 days of pre-loaded daily challenges | 1 hour |
| 13.2 | Prepare 7 days of pre-loaded words of the day | 1 hour |
| 14.1 | Full integration test — all bots, all channels, all permissions | 2 hours |
| 14.2 | Create backup of server settings (template) | 15 min |

---

## Phase 3: Soft Launch (Days 15-30)

### Days 15-17: Seed Members
| Step | Action |
|---|---|
| 15.1 | Invite 10-20 existing students/contacts personally |
| 15.2 | Brief seed members on their role (be active, be welcoming) |
| 15.3 | Michael posts first introduction in `#introductions` |
| 16.1 | First daily challenge goes live |
| 16.2 | First word of the day goes live |
| 16.3 | First open mic night (voice channel event) |
| 17.1 | Gather feedback from seed members |
| 17.2 | Fix any permission or bot issues |

### Days 18-24: Organic Growth Push
| Step | Action |
|---|---|
| 18.1 | Add Discord join link to NET website (index.html) |
| 18.2 | Add Discord widget to Roblox game (in-game UI button) |
| 19.1 | Post invite on relevant Vietnamese English learning communities |
| 20.1 | First weekly leaderboard post |
| 21.1 | Host first community event (trivia night or group lesson) |
| 22-24 | Monitor, adjust XP rates, fix pain points |

### Days 25-30: Evaluate & Iterate
| Step | Action |
|---|---|
| 25.1 | First analytics report — DAU, messages, voice hours, retention |
| 26.1 | Identify top contributors — offer moderator roles |
| 27.1 | Plan Month 2 content calendar |
| 28.1 | OBI Bot v2 planning — what features do members want? |
| 29.1 | Submit to Discord Server Discovery (if 500+ members) |
| 30.1 | Month 1 retrospective — what worked, what didn't, what's next |

---

## Resource Requirements

| Resource | Requirement | Status |
|---|---|---|
| Discord account | Michael's existing account | ✅ Ready |
| Server creation | Free | ✅ Ready |
| Bot development | discord.js v14 knowledge | 🔨 Build |
| Cloudflare Worker | Existing infrastructure | ✅ Ready |
| DeepSeek API key | Existing | ✅ Ready |
| Deepgram API key | Existing | ✅ Ready |
| NET branding assets | Logo, colors, fonts | ✅ Ready (Gospel 444 palette) |
| Artwork (Mouse → Tiger) | For server banner/icon | 🎨 Stage 14-17 |
| 10-20 seed members | Michael's network | 👤 Michael |

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Ghost town (no activity) | HIGH | CRITICAL | Seed aggressively, bot auto-posts keep content flowing |
| Bot downtime | MEDIUM | HIGH | Use established bots (MEE6) alongside custom OBI bot |
| Toxic members | LOW | HIGH | Auto-mod + manual mod + ban policy |
| OBI bot abuse | MEDIUM | MEDIUM | Rate limiting + content filter |
| Feature creep | HIGH | MEDIUM | MVP first. Polish later. |
| Vietnamese-only conversations | HIGH | MEDIUM | XP incentives for English, not punishment for Vietnamese |

---

## Success Criteria (Day 30)

| Metric | Pass | Fail |
|---|---|---|
| Total members | ≥ 30 | < 15 |
| Daily active users | ≥ 5 | < 3 |
| OBI Bot functional | All MVP commands working | Commands broken |
| Daily challenge participation | ≥ 3 responses per day | 0 responses |
| Voice channel usage | ≥ 1 session per week | None |
| Member satisfaction (survey) | ≥ 7/10 | < 5/10 |

---

## Automation Checklist for Ongoing Operation

| Task | Automated? | Tool |
|---|---|---|
| Daily challenge posting | ✅ | OBI Bot cron |
| Word of the day | ✅ | OBI Bot cron |
| XP tracking + level-ups | ✅ | MEE6/XP Bot |
| Moderation (spam, profanity) | ✅ | Carl-bot + Discord AutoMod |
| Weekly leaderboard | ✅ | XP Bot scheduled post |
| GitHub commit notifications | ✅ | Webhook |
| Analytics digest | ❌ → ✅ Phase 5 | Custom bot |
| Bug report → Backlog | ❌ → ✅ Phase 5 | Custom bridge |
| New member onboarding | ✅ | Welcome bot DM |
| Role assignments | ✅ | Reaction roles + level-up auto-assign |
