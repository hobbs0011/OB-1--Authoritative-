# 🧟 Train 6-7: Discord Bot

**SURVIVE. FIGHT. SPEND.**

Discord community bot for *Train 6-7: To Survive a Brainrot* — the Roblox zombie survival game.

## Features

### 🎮 Community
- `/play` — Quick game link
- `/drops` — Today's featured weapon rotation
- `/stats` — Server statistics
- `/leaderboard` — Community rankings
- `/report` — Submit bug reports

### 🎁 Engagement
- `/giveaway start` — Start a giveaway with button entry
- `/giveaway end` — Pick random winners
- **Brainrot auto-responses** — Bot reacts to skibidi, rizz, sigma, ohio, gyatt, fanum tax, mewing
- **Daily drop alerts** — Automated weapon tease at peak hours
- **Weekly update pings** — Auto-announce update days

### 🛡️ Moderation
- `/warn` — Issue warnings (mod only)
- `/warnings` — Check warning history (mod only)
- `/update` — Post patch notes (admin only)
- **Auto-mod** — Catches Discord invite links, Robux scams, slurs
- **Auto-timeout** — 1 hour timeout at 3 warnings
- **Mod log** — All actions logged to mod channel

### 📊 Data
- SQLite database for warnings, stats, giveaway entries
- Persistent across restarts
- WAL mode for performance

## Setup

### 1. Create Discord Bot
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create New Application → Bot tab → Reset Token → copy it
3. Under Bot tab, enable:
   - `SERVER MEMBERS INTENT`
   - `MESSAGE CONTENT INTENT`
   - `PRESENCE INTENT`
4. Under OAuth2 → URL Generator:
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Administrator` (or fine-tune)
   - Copy the URL → paste in browser → add to your server

### 2. Configure
```bash
cp .env.example .env
# Fill in all values in .env
```

### 3. Install & Run
```bash
npm install
npm start
```

### 4. Recommended Discord Server Structure

```
📁 INFORMATION
  #rules
  #announcements
  #welcome

📁 COMMUNITY
  #general
  #memes
  #clips
  #fan-art

📁 GAME
  #trading
  #drop-alerts
  #strategies
  #bug-reports
  #suggestions

📁 VOICE
  🔊 Survival Squad 1
  🔊 Survival Squad 2
  🔊 Boss Raid

📁 STAFF
  #mod-log
  #staff-chat
```

### 5. Roles
- `@Survivor` — Auto-assigned on join
- `@Veteran` — Day 50+ clears (manual or future automation)
- `@RIZZLORD` — Top players / event winners
- `@Moderator` — Staff

## Hosting

**Free options:**
- [Railway](https://railway.app) — free tier, auto-deploy from GitHub
- [Render](https://render.com) — free tier web service
- [Fly.io](https://fly.io) — free tier with 3 shared VMs

**Paid (recommended for production):**
- Railway Pro ($5/mo)
- Any VPS with Node.js 18+

## Architecture

```
DISCORD-BOT/
├── .env.example          # Environment template
├── package.json          # Dependencies
├── README.md             # This file
├── data/                 # SQLite database (auto-created)
│   └── bot.db
└── src/
    ├── index.js          # Main bot entry point + scheduled jobs
    ├── commands/         # Slash commands
    │   ├── play.js
    │   ├── drops.js
    │   ├── stats.js
    │   ├── warn.js
    │   ├── warnings.js
    │   ├── update.js
    │   ├── giveaway.js
    │   ├── report.js
    │   └── leaderboard.js
    └── events/           # Event handlers
        ├── guildMemberAdd.js   # Welcome + auto-role
        └── messageCreate.js    # Auto-mod + brainrot fun
```

## Future Integrations

- [ ] Roblox → Discord webhook (live kill feed, boss defeats)
- [ ] In-game leaderboard sync
- [ ] Trading verification system
- [ ] Event scheduling with reminders
- [ ] Ticket system for support
- [ ] Music bot for voice channels

---

**Built for the zone. 🧟**
