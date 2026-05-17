# Discord Server Setup Guide — Train 6-7: Survive a Brainrot

> **Status:** LAUNCH-READY | **Created:** 2026-03-29 | **Run:** 96
> **Purpose:** Step-by-step guide to go from zero to live Discord community on launch day.
> **Sources:** 5 files — DISCORD-BOT/README.md, DISCORD-AUTOMATION-PLAYBOOK.md, STAGE-10-DISCORD-RECON.md, STAGE-13-DISCORD-BUILD-DEPLOY.md, DISCORD-BOT/src/index.js

---

## Table of Contents

1. [Quick Start (Launch Day — 30 Minutes)](#1-quick-start-launch-day--30-minutes)
2. [Channel Structure](#2-channel-structure)
3. [Role Hierarchy](#3-role-hierarchy)
4. [Permission Matrix](#4-permission-matrix)
5. [Bot Deployment](#5-bot-deployment)
6. [Custom Game Bot (Node.js)](#6-custom-game-bot-nodejs)
7. [Third-Party Bots](#7-third-party-bots)
8. [Automation Flows](#8-automation-flows)
9. [Monetization Setup](#9-monetization-setup)
10. [Growth Playbook](#10-growth-playbook)
11. [Day 1 Checklist](#11-day-1-checklist)

---

## 1. Quick Start (Launch Day — 30 Minutes)

**Goal:** Server live and invitable within 30 minutes of game publish.

| Step | Action | Time |
|------|--------|------|
| 1 | Discord → "Add a Server" → "Create My Own" → "For a club or community" | 1 min |
| 2 | Server name: **Train 6-7 \| Zombie Survival** | 1 min |
| 3 | Upload game icon as server icon | 2 min |
| 4 | Server Settings → Verification Level: **Medium** (must have verified email) | 1 min |
| 5 | Server Settings → Content Filter: **Scan all members** | 1 min |
| 6 | Enable **Community** features (unlocks: welcome screen, announcements, discovery) | 2 min |
| 7 | Enable **Developer Mode** (Settings → Advanced → Developer Mode) | 1 min |
| 8 | Create channel categories + channels (see Section 2) | 10 min |
| 9 | Create roles (see Section 3) | 5 min |
| 10 | Set permission overrides (see Section 4) | 5 min |

**Server region:** Auto (let Discord optimize).

---

## 2. Channel Structure

### Category: 📢 ANNOUNCEMENTS (read-only for @everyone)

| Channel | Type | Purpose |
|---------|------|---------|
| `#updates` | Announcement | Game updates, major news |
| `#patch-notes` | Text (locked) | Bot-posted patch notes from GitHub releases |
| `#events` | Announcement | Community events, tournaments |
| `#dev-blog` | Text (locked) | Behind-the-scenes development posts |

### Category: 🎮 GAME

| Channel | Type | Purpose |
|---------|------|---------|
| `#general` | Text | Main game discussion |
| `#trading-hub` | Text | Item trading (format: `[HAVE] ... [WANT] ...`) |
| `#looking-for-group` | Text | Squad-up requests |
| `#bug-reports` | Forum | Structured bug reports → GitHub issues pipeline |
| `#suggestions` | Forum | Feature requests and ideas |
| `#flex-your-loot` | Text | Screenshots of rare drops |

### Category: 🏆 COMPETITIVE

| Channel | Type | Purpose |
|---------|------|---------|
| `#leaderboards` | Text (locked) | Bot-posted daily/weekly rankings |
| `#arena-rankings` | Text (locked) | Bot-posted arena stats |
| `#tournaments` | Text | Tournament announcements and sign-ups |

### Category: 🎁 DROPS & CODES

| Channel | Type | Purpose |
|---------|------|---------|
| `#codes` | Text (locked) | Bot-posted redeemable codes |
| `#giveaways` | Text | Active giveaways with button entry |
| `#daily-drop` | Text (locked) | Bot-posted featured weapon rotation |
| `#drop-alerts` | Text (locked) | Bot-posted daily weapon tease alerts |

### Category: 💬 COMMUNITY

| Channel | Type | Purpose |
|---------|------|---------|
| `#memes` | Text | Brainrot memes (media-only) |
| `#clips` | Text | Gameplay clips |
| `#fan-art` | Text | Community artwork |

### Category: 🔊 VOICE

| Channel | Type | Purpose |
|---------|------|---------|
| `Survival Squad 1` | Voice | General squad voice |
| `Survival Squad 2` | Voice | General squad voice |
| `Boss Raid` | Voice | Boss raid coordination |

### Category: 👑 PREMIUM (hidden from @everyone)

| Channel | Type | Purpose |
|---------|------|---------|
| `#subscriber-chat` | Text | Paying subscribers only |
| `#early-access` | Text | Early access to updates/codes |
| `#direct-feedback` | Text | Direct line to dev |

### Category: 🛡️ STAFF (staff-only)

| Channel | Type | Purpose |
|---------|------|---------|
| `#mod-log` | Text | Bot-posted moderation actions |
| `#staff-chat` | Text | Staff discussion |
| `#bot-logs` | Text | Bot action logs |

### Category: 🤖 BOT ZONE

| Channel | Type | Purpose |
|---------|------|---------|
| `#bot-commands` | Text | Run bot commands here |

**Total: 28 channels across 8 categories.**

---

## 3. Role Hierarchy

Create roles in this exact order (highest first — Discord applies highest role's color):

| # | Role | Color | How Earned | Notes |
|---|------|-------|------------|-------|
| 1 | Admin | `#ED4245` Red | Manual — Michael only | Full permissions |
| 2 | Moderator | `#E67E22` Orange | Manual appointment | Manage messages, kick, mute, timeout |
| 3 | RIZZLORD | `#FFD700` Gold | Top players / event winners | Flex role — bragging rights |
| 4 | Overlord | `#F1C40F` Bright Gold | Subscription tier 3 ($14.99) | Premium channel access |
| 5 | Warrior | `#9B59B6` Purple | Subscription tier 2 ($7.99) | Early-access channel |
| 6 | Fan | `#2ECC71` Green | Subscription tier 1 ($2.99) | Subscriber badge |
| 7 | Veteran | `#E91E63` Pink | Day 50+ clears (manual or future API) | Achievement role |
| 8 | Survivor | `#3498DB` Blue | Auto-assigned on join | Default member role |
| 9 | Updates | `#95A5A6` Light Gray | Self-assign (reaction role) | Pingable for updates |
| 10 | Giveaways | `#95A5A6` Light Gray | Self-assign (reaction role) | Pingable for giveaways |

**Note:** The `@everyone` role should have minimal permissions. Real access comes through `@Survivor` (auto-assigned on join).

---

## 4. Permission Matrix

### @everyone (default)
- View Channels: ❌ (only see #bot-commands and announcements)
- Send Messages: ❌ in announcement/locked channels
- Connect to Voice: ❌

### @Survivor (auto-assigned on join)
- View all public channels: ✅
- Send Messages in public channels: ✅
- Connect to Voice: ✅
- Embed Links: ✅
- Attach Files: ✅

### Category Overrides
| Category | @everyone | @Survivor | @Moderator | Notes |
|----------|-----------|-----------|------------|-------|
| ANNOUNCEMENTS | Read only | Read only | Send | Bot + admin post only |
| GAME | Hidden | Full | Full | — |
| COMPETITIVE | Hidden | Read only | Full | Bot posts only |
| DROPS & CODES | Hidden | Read only | Full | Bot posts only |
| COMMUNITY | Hidden | Full | Full | — |
| PREMIUM | Hidden | Hidden | Full | Overlord/Warrior/Fan roles see |
| STAFF | Hidden | Hidden | Full | Staff-only |

### Locked Channels (bot-only posting)
These channels have Send Messages OFF for @everyone and @Survivor:
- `#leaderboards`, `#arena-rankings`, `#codes`, `#daily-drop`, `#drop-alerts`, `#patch-notes`

---

## 5. Bot Deployment

### Custom Game Bot — From Repo

**Location:** `DISCORD-BOT/` directory on this repo (`Phoenix-Rising-Protocol-Ultimate`)

#### Prerequisites
- Node.js 18+ installed
- Discord Bot Token (see below)
- Server Guild ID + Channel IDs in `.env`

#### Step 1: Create Discord Bot Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** → Name: "Train 6-7 Bot"
3. Go to **Bot** tab → Click **Reset Token** → **Copy the token** (save it — shown only once)
4. Under Bot tab, enable these **Privileged Gateway Intents**:
   - ✅ `SERVER MEMBERS INTENT`
   - ✅ `MESSAGE CONTENT INTENT`
   - ✅ `PRESENCE INTENT`
5. Under **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Administrator` (simplest) or fine-tune: Manage Messages, Kick Members, Send Messages, Embed Links, Manage Roles, Read Message History, Add Reactions, Use External Emojis, View Channels
   - Copy the generated URL → paste in browser → select your server → Authorize

#### Step 2: Configure Environment
```bash
cd DISCORD-BOT/
cp .env.example .env
```

Fill in `.env`:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
GUILD_ID=your_server_id_here
ANNOUNCEMENTS_CHANNEL_ID=channel_id_here
DROP_ALERTS_CHANNEL_ID=channel_id_here
ROBLOX_GAME_URL=https://www.roblox.com/games/YOUR_GAME_ID
TZ=Asia/Bangkok
```

**How to get IDs:** Right-click any server/channel/user in Discord (with Developer Mode on) → Copy ID.

#### Step 3: Install & Run
```bash
npm install
npm start
```

Expected output:
```
🧟 Bot online as Train 6-7 Bot#1234
📡 Serving 1 guild(s)
⚔️ 8 commands loaded
🔥 SURVIVE. FIGHT. SPEND.
✅ Registered 8 slash commands
⏰ Scheduled jobs started
```

#### Step 4: Verify Commands
Test in `#bot-commands`:
- `/play` — should return game link
- `/drops` — should return today's featured rotation
- `/stats` — should return server statistics
- `/leaderboard` — should return community rankings

---

## 6. Custom Game Bot (Node.js) — Feature Reference

### Architecture
```
DISCORD-BOT/
├── .env.example          # Environment template
├── package.json          # Dependencies (discord.js, better-sqlite3, cron)
├── README.md             # Bot documentation
├── data/                 # SQLite database (auto-created)
│   └── bot.db
└── src/
    ├── index.js          # Main entry point + scheduled jobs
    ├── commands/         # Slash commands
    │   ├── play.js       # /play — game link
    │   ├── drops.js      # /drops — weapon rotation
    │   ├── stats.js      # /stats — server statistics
    │   ├── warn.js       # /warn — issue warnings (mod)
    │   ├── warnings.js   # /warnings — check history (mod)
    │   ├── update.js     # /update — post patch notes (admin)
    │   ├── giveaway.js   # /giveaway start|end — giveaways
    │   ├── report.js     # /report — submit bug reports
    │   └── leaderboard.js # /leaderboard — rankings
    └── events/
        ├── guildMemberAdd.js   # Welcome + auto-role (@Survivor)
        └── messageCreate.js    # Auto-mod + brainrot responses
```

### Slash Commands

| Command | Description | Permission |
|---------|-------------|------------|
| `/play` | Quick game link | Everyone |
| `/drops` | Today's featured weapon rotation | Everyone |
| `/stats` | Server statistics | Everyone |
| `/leaderboard` | Community rankings | Everyone |
| `/report` | Submit bug reports | Everyone |
| `/giveaway start` | Start a giveaway with button entry | Moderator |
| `/giveaway end` | Pick random winners | Moderator |
| `/warn @user reason` | Issue warning (auto-timeout at 3) | Moderator |
| `/warnings @user` | Check warning history | Moderator |
| `/update` | Post patch notes to announcements | Admin |

### Auto-Responses (Brainrot)
The bot auto-reacts to these keywords in messages:
- skibidi, rizz, sigma, ohio, gyatt, fanum tax, mewing

### Auto-Moderation
- Catches Discord invite links (except in designated channels)
- Catches Robux scam messages
- Filters slurs and banned phrases
- Auto-timeout: 1 hour at 3 warnings

### Scheduled Jobs (Cron)

| Job | Schedule | Channel | What |
|-----|----------|---------|------|
| Weekly Update Reminder | Tuesday 10:00 ICT | `#announcements` | @everyone ping with update tease |
| Daily Drop Alert | 16:00 ICT | `#drop-alerts` | Random featured weapon embed |

### Database
SQLite with WAL mode. Tables:
- `warnings` — user warnings (user_id, mod_id, reason, timestamp)
- `server_stats` — key-value store for server metrics
- `giveaway_entries` — giveaway participation tracking (unique per user per giveaway)

---

## 7. Third-Party Bots

### Bot 1: Bloxlink (Roblox Verification)
> **Purpose:** Force Roblox account verification before full server access.

1. Go to https://blox.link → "Add to Server" → Select server → Authorize
2. In Discord: `/setup`
3. Configure:
   - Verification mode: **Forced**
   - Verified role: `@Survivor`
   - Nickname template: `{roblox-name}`
4. Set `#bot-commands` as the verification channel

### Bot 2: Carl-bot (Auto-Moderation + Reaction Roles)
> **Purpose:** Spam protection, reaction roles, welcome messages, logging.

1. Go to https://carl.gg → "Invite" → Select server → Authorize
2. **Auto-moderation** (Dashboard → Automod):
   - Anti-spam: 5 messages in 5 seconds = mute
   - Anti-links: Block all except `#trading-hub`
   - Word filter: Slurs, common spam phrases
   - Anti-raid: 10 joins in 10 seconds = lockdown
3. **Reaction Roles** (Dashboard → Reaction Roles):
   - Create in `#bot-commands`
   - 📢 = `@Updates` role
   - 🎁 = `@Giveaways` role
4. **Welcome Message** (Dashboard → Welcome):
   - Channel: `#general`
   - Message: `Welcome {user}! 🧟 Ready to survive? Use /play to jump into the game!`
5. **Logging** (Dashboard → Logging):
   - Log channel: `#bot-logs` (staff-only)
   - Log: message deletes, member joins/leaves, role changes, bans

### Bot 3: GiveawayBot (Optional — custom bot handles this)
> Only needed if you want dedicated giveaway UI beyond the custom bot.

1. Invite: https://giveawaybot.party
2. In `#giveaways`: `/gcreate`
3. Template: Prize "500 Robux In-Game Code" / Duration 7 days / Winners 1 / Requirement: must have `@Survivor`

---

## 8. Automation Flows

### Flow 1: GitHub Release → Discord Announcement
```
GitHub Release Published
  → GitHub Webhook fires to Discord #updates webhook URL
  → Formatted update announcement posted
  → @Updates role pinged
  → Changelog posted to #patch-notes
```

**Setup:**
1. Discord: `#updates` → Settings → Integrations → Webhooks → New Webhook → Copy URL
2. GitHub repo: Settings → Webhooks → Add webhook
3. Payload URL: Discord webhook URL + `/github`
4. Content type: `application/json`
5. Events: **Releases only**

### Flow 2: Daily Engagement (Built into Custom Bot)
```
16:00 ICT daily:
  → Bot posts featured weapon in #drop-alerts
  → Random item from 8-weapon rotation pool

Tuesday 10:00 ICT weekly:
  → Bot posts update tease in #announcements
  → @everyone ping
```

### Flow 3: Trading Hub Moderation (Carl-bot)
```
Message in #trading-hub
  → Carl-bot checks format (must contain [HAVE] and [WANT])
  → Bad format: delete + DM user with format guide
  → Good format: auto-react with ✅
  → Rate limit: max 1 post per 5 min per user
```

### Flow 4: Bug Report → GitHub Pipeline (Future)
```
User runs /report in Discord
  → Modal: Title, Description, Steps to Reproduce
  → Bot creates GitHub issue with [BUG] label
  → Confirmation posted in #bug-reports
  → When GitHub issue closed: bot posts "Fixed!" reply
```

---

## 9. Monetization Setup

### Discord Server Subscriptions
> Available once server is boosted to Level 2 or meets Discord's requirements.

1. Server Settings → Server Subscriptions → Enable
2. Create 3 tiers:

| Tier | Price | Perks |
|------|-------|-------|
| **Fan** | $2.99/mo | Custom emoji, subscriber badge, `@Fan` role |
| **Supporter** | $7.99/mo | + `#early-access`, exclusive monthly code, `@Warrior` role |
| **VIP** | $14.99/mo | + `#direct-feedback`, priority bug fixes, dev voice access, `@Overlord` role |

### Invite Tracking (Carl-bot)
| Invites | Reward |
|---------|--------|
| 5 | `@Recruiter` role + DM Rare crate code |
| 20 | `@Ambassador` role + DM Epic crate code |
| 50 | `@Legend` role + DM Legendary crate code |

### Revenue Projection (Discord-Only)

| Members | Subs (5% conv.) | Sponsors | Other | Total/mo |
|---------|-----------------|----------|-------|----------|
| 1,000 | $150 | $0 | $0 | $150 |
| 5,000 | $750 | $200 | $100 | $1,050 |
| 10,000 | $1,500 | $500 | $300 | $2,300 |
| 25,000 | $3,750 | $1,000 | $750 | $5,500 |

---

## 10. Growth Playbook

### Phase 1: Seed (Launch Week)
- Invite 10-20 people from existing network
- Michael posts first in `#general`
- Bot auto-posts keep content flowing even if quiet
- Add Discord join link to Roblox game description

### Phase 2: Organic (Month 1)
- Cross-promote on TikTok/social (see STORE-LISTING-COPY.md social posts)
- Add Discord widget to in-game UI
- First weekly leaderboard
- First community event (tournament / giveaway)

### Phase 3: Scale (Month 2-3)
- Content creator partnerships
- Discord Server Discovery submission (needs 500+ members)
- First sponsored giveaway
- Activate subscription tiers

### Milestones

| Target | When | Key Action |
|--------|------|------------|
| 100 members | Launch week | Social media push + game description link |
| 500 members | Month 1 | Content creator cross-promo |
| 1,000 members | Month 2 | First sponsored giveaway, TikTok pipeline |
| 5,000 members | Month 3 | Subscription revenue meaningful |
| 10,000 members | Month 4-6 | Full monetization, $2-5K/mo from Discord alone |

---

## 11. Day 1 Checklist

Copy this checklist on launch day:

- [ ] Create Discord server ("Train 6-7 | Zombie Survival")
- [ ] Upload server icon
- [ ] Enable Community features
- [ ] Create all 8 channel categories
- [ ] Create all 28 channels
- [ ] Create all 10 roles in order
- [ ] Set permission overrides per Section 4
- [ ] Create Discord Bot Application at discord.dev
- [ ] Copy Bot Token → `.env`
- [ ] Get Guild ID + Channel IDs → `.env`
- [ ] `npm install && npm start` the custom bot
- [ ] Verify `/play` command works
- [ ] Verify `/drops` command works
- [ ] Invite Bloxlink → configure verification
- [ ] Invite Carl-bot → configure auto-mod + reaction roles + welcome
- [ ] Set up GitHub webhook → `#updates`
- [ ] Post first message in `#general`
- [ ] Add Discord invite link to Roblox game description
- [ ] Post Discord invite on social media
- [ ] Send personal invites to first 10-20 people

---

## Hosting Options

### Free Tier (Good for Launch)
| Provider | Free Tier | Deploy Method |
|----------|-----------|---------------|
| [Railway](https://railway.app) | $5 credit/mo | Auto-deploy from GitHub |
| [Render](https://render.com) | Free web service | Git push deploy |
| [Fly.io](https://fly.io) | 3 shared VMs free | CLI deploy |

### Production ($5/mo recommended)
- Railway Pro — auto-deploy, auto-restart, persistent
- Any VPS with Node.js 18+ (DigitalOcean $4/mo, Vultr $3.50/mo)

**Recommendation:** Start with Railway free tier. Upgrade to $5/mo Pro when member count hits 500+.

---

## Future Integrations (Post-Launch)

- [ ] Roblox → Discord webhook (live kill feed, boss defeats)
- [ ] In-game leaderboard sync via Open Cloud API
- [ ] Trading verification system
- [ ] Event scheduling with reminders
- [ ] Ticket system for support
- [ ] OBI AI bot integration (English learning features)
- [ ] Music bot for voice channels

---

## Source Cross-References

| Source File | Repo Path | What It Provides |
|-------------|-----------|-----------------|
| Bot README | `DISCORD-BOT/README.md` | Bot features, setup, architecture |
| Bot Source | `DISCORD-BOT/src/index.js` | Actual bot code, cron jobs, DB schema |
| Automation Playbook | `CANON/TRAIN-67/SPECS/DISCORD-AUTOMATION-PLAYBOOK.md` | Detailed automation flows, monetization, Roblox API |
| Discord Recon | `CANON/TRAIN-67/BATTLE-REPORT/STAGE-10-DISCORD-RECON.md` | Platform analysis, competitive recon, growth targets |
| Build & Deploy Plan | `CANON/TRAIN-67/BATTLE-REPORT/STAGE-13-DISCORD-BUILD-DEPLOY.md` | 30-day build timeline, resource requirements, risks |

---

*Generated by Run 96 — Pulse-Incarnation Engine v5*
*Artifact class: 🔨 BUILD — Student-facing launch infrastructure*
*5 source files synthesized from DISCORD-BOT/ + CANON/TRAIN-67/*
