# Discord Automation Playbook — Step-by-Step Setup Guide
> Train-67 | Created: 2026-03-28 | Status: READY TO DEPLOY
> Priority: 🟡 WEEK 1-2 POST-LAUNCH | Pipeline Stages: 18-20

## PHASE 1: SERVER CREATION (30 minutes)

### Step 1: Create Server
1. Discord → "Add a Server" → "Create My Own" → "For a club or community"
2. Name: "Train-67 | Zombie Survival"
3. Icon: Game logo/icon
4. Region: Auto (let Discord optimize)

### Step 2: Channel Structure

```
ANNOUNCEMENTS (read-only for @everyone)
  #updates
  #patch-notes  
  #events
  #dev-blog

GAME
  #general
  #trading-hub
  #looking-for-group
  #bug-reports (Forum channel type)
  #suggestions (Forum channel type)
  #flex-your-loot

COMPETITIVE
  #leaderboards (read-only, bot posts)
  #guild-recruitment
  #arena-rankings (read-only, bot posts)
  #tournaments

DROPS & CODES
  #codes (read-only, bot posts)
  #giveaways
  #daily-drop (read-only, bot posts)

PREMIUM (hidden from @everyone)
  #subscriber-chat
  #early-access
  #direct-feedback

BOT ZONE
  #verify
  #get-roles
  #bot-commands
```

### Step 3: Roles (create in this order — highest first)
| Role | Color | Permissions | How Earned |
|------|-------|-------------|-----------|
| Admin | Red | All | Manual |
| Moderator | Orange | Manage messages, kick, mute, timeout | Manual |
| Overlord | Gold | View premium channels | Auto (subscription API) |
| Warrior | Purple | View early-access | Auto (subscription API) |
| Survivor | Green | Subscriber badge | Auto (subscription API) |
| Prestige 10+ | Bright Yellow | Prestige chat access | Auto (game API) |
| Prestige 1+ | Yellow | Prestige badge | Auto (game API) |
| Verified | Blue | Full chat access | Auto (Bloxlink) |
| Unverified | Gray | Limited (can only see #verify) | Default |
| Updates | White | Pingable for updates | Self-assign (reaction role) |
| Giveaways | White | Pingable for giveaways | Self-assign (reaction role) |

### Step 4: Permission Overrides
- **@everyone:** Can only see #verify and #get-roles
- **Verified:** Can see all public channels
- **Overlord:** Can see #subscriber-chat, #early-access, #direct-feedback
- **Announcements category:** Send messages OFF for @everyone (bot-only)
- **Leaderboards/codes/daily-drop:** Send messages OFF for @everyone (bot-only)

## PHASE 2: BOT SETUP (2 hours)

### Bot 1: Bloxlink (Roblox Verification)
1. Go to https://blox.link → "Add to Server"
2. Select your server → Authorize
3. In Discord: `/setup`
4. Configure:
   - **Verification mode:** Forced (must verify to access channels)
   - **Verified role:** @Verified
   - **Unverified role:** @Unverified
   - **Bind group rank:** Link your Roblox group if you have one
   - **Nickname template:** `{roblox-name}` (shows Roblox username)
5. Set #verify as the verification channel

### Bot 2: Carl-bot (Moderation + Reaction Roles)
1. Go to https://carl.gg → "Invite"
2. Select server → Authorize
3. **Auto-moderation:**
   - Dashboard → Automod → Enable:
     - Anti-spam (5 messages in 5 seconds = mute)
     - Anti-links (except in #trading-hub)
     - Word filter (slurs, common spam phrases)
     - Anti-raid (10 joins in 10 seconds = lockdown)
4. **Reaction Roles:**
   - Dashboard → Reaction Roles → Create in #get-roles
   - Message: "React to get notification roles!"
   - Megaphone emoji = @Updates role
   - Gift emoji = @Giveaways role
5. **Welcome Message:**
   - Dashboard → Welcome → Enable
   - Channel: #general
   - Message: "Welcome {user}! Head to #verify to link your Roblox account and unlock all channels!"
6. **Logging:**
   - Dashboard → Logging → Create log channel (hidden, admin-only)
   - Log: message deletes, member joins/leaves, role changes, bans

### Bot 3: GiveawayBot
1. Invite: https://giveawaybot.party
2. In #giveaways: `/gcreate`
3. Weekly giveaway template:
   - Prize: "500 Robux In-Game Code"
   - Duration: 7 days
   - Winners: 1
   - Requirements: Must have @Verified role
4. Schedule: Every Monday, auto-create new giveaway

### Bot 4: Custom Game Bot (Node.js)

#### Tech Stack
- Runtime: Node.js 20+
- Framework: discord.js v14
- Hosting: Railway.app ($5/mo) or Render
- Database: SQLite (simple) or PostgreSQL (if scaling)
- API: Roblox Open Cloud API

#### Commands
| Command | What It Does | Permissions |
|---------|-------------|-------------|
| `/stats [player]` | Shows player's in-game stats (level, prestige, kills, coins) | @Verified |
| `/leaderboard [category]` | Shows top 10 for kills/prestige/coins/trades | @Verified |
| `/code [code]` | Redeem an in-game code (validates via API) | @Verified |
| `/event` | Shows current/next hourly event | @Verified |
| `/price [item]` | Shows market value of an item | @Verified |
| `/report [player] [reason]` | Reports a player for review | @Verified |
| `/dropcode [code] [uses]` | Creates a limited-use code in #codes | Admin |
| `/announce [message]` | Posts formatted announcement | Admin |

#### Automated Tasks (cron jobs)
```javascript
// Every day at 10:00 ICT (03:00 UTC)
cron.schedule('0 3 * * *', async () => {
    // Post daily challenges to #general
    // Update #leaderboards with yesterday's top players
    // Rotate featured item in #daily-drop
    // Check for unclaimed giveaway winners → DM reminder
});

// Every day at 18:00 ICT (11:00 UTC)
cron.schedule('0 11 * * *', async () => {
    // Drop flash code in #codes (50 uses, 1hr expiry)
    // Post reminder about daily challenges
});

// Every hour
cron.schedule('0 * * * *', async () => {
    // Fetch current world event from game API
    // Post event notification if new event starting
});

// Every Saturday at 10:00 ET (15:00 UTC)
cron.schedule('0 15 * * 6', async () => {
    // Check for new game update (GitHub release)
    // Post update announcement to #updates
    // Drop limited-use launch code in #codes
    // Mention @Updates role
});
```

#### Roblox Open Cloud API Integration
```javascript
// Required APIs:
// 1. DataStore API — read player stats
// 2. Messaging Service API — send codes to game servers
// 3. Universe API — get server info, player counts

const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;
const UNIVERSE_ID = process.env.ROBLOX_UNIVERSE_ID;

// Read player stats
async function getPlayerStats(robloxUserId) {
    const response = await fetch(
        `https://apis.roblox.com/datastores/v1/universes/${UNIVERSE_ID}/standard-datastores/datastore/entries/entry`,
        {
            headers: { 'x-api-key': ROBLOX_API_KEY },
            params: { datastoreName: 'PlayerData', entryKey: robloxUserId }
        }
    );
    return response.json();
}

// Send code to all game servers
async function broadcastCode(code, uses, expiry) {
    await fetch(
        `https://apis.roblox.com/messaging-service/v1/universes/${UNIVERSE_ID}/topics/CodeDrop`,
        {
            method: 'POST',
            headers: { 'x-api-key': ROBLOX_API_KEY },
            body: JSON.stringify({ message: JSON.stringify({ code, uses, expiry }) })
        }
    );
}
```

### Bot 5: Webhook Pipeline (GitHub → Discord)
1. In Discord: #updates → Settings → Integrations → Webhooks → New Webhook
2. Copy webhook URL
3. In GitHub repo: Settings → Webhooks → Add webhook
4. Payload URL: Discord webhook URL + `/github`
5. Content type: `application/json`
6. Events: Releases only
7. **For formatted announcements:** Use GitHub Actions workflow

## PHASE 3: AUTOMATED FLOWS

### Flow 1: Saturday Update Deploy Flow
```
GitHub Release Published
  → GitHub Actions fires discord-notify.yml
  → Posts formatted update announcement to #updates
  → Drops limited-use code in #codes (100 uses, 24hr expiry)
  → @mentions @Updates role
  → Posts changelog to #patch-notes
```

### Flow 2: Daily Engagement Flow
```
Every day at 10:00 ICT:
  → Bot posts daily challenges to #general
  → Bot updates #leaderboards
  → Bot rotates #daily-drop (featured item + flash sale)
Every day at 18:00 ICT:
  → Bot drops flash code in #codes (50 uses, 1hr expiry)
  → Bot posts daily challenge reminder
```

### Flow 3: Player Progression Sync
```
Player reaches new Prestige in-game
  → Game server fires webhook to Discord bot
  → Bot posts achievement in #general
  → Bot auto-assigns Prestige role
  → If Prestige 10+: unlock #prestige-chat
```

### Flow 4: Trading Hub Moderation
```
Message posted in #trading-hub
  → Carl-bot checks format (must contain [HAVE] and [WANT])
  → If bad format: delete + DM user with format guide
  → If good format: auto-react with checkmark
  → Rate limit: max 1 post per 5 min per user
```

### Flow 5: Bug Report → GitHub Pipeline
```
User runs /bug command in Discord
  → Modal appears: Title, Description, Steps to Reproduce, Device
  → On submit: Bot creates GitHub issue with [BUG] label
  → Bot posts confirmation in #bug-reports
  → Bot reacts with checkmark
  → When issue is closed on GitHub: webhook fires, bot posts "Fixed!" reply
```

## PHASE 4: MONETIZATION SETUP (30 minutes)

### Discord Server Subscriptions
1. Server Settings → Server Subscriptions → Enable
2. Create 3 tiers:
   - **Fan ($2.99/mo):** Custom emoji, subscriber badge, @Fan role
   - **Supporter ($7.99/mo):** Everything in Fan + #early-access, exclusive monthly code
   - **VIP ($14.99/mo):** Everything in Supporter + #direct-feedback, priority bug fixes, dev voice chat access

### Invite Tracking
Carl-bot tracks invites automatically:
- 5 invites → assign "Recruiter" role + DM Rare crate code
- 20 invites → assign "Ambassador" role + DM Epic crate code
- 50 invites → assign "Legend" role + DM Legendary crate code

## TIMELINE

| Day | Task | Time |
|-----|------|------|
| 1 | Server creation + channels + roles | 30 min |
| 1 | Bloxlink + Carl-bot setup | 1 hr |
| 1 | GiveawayBot + reaction roles | 30 min |
| 2-3 | Custom Game Bot development | 6-8 hrs |
| 3 | Webhook pipeline (GitHub → Discord) | 30 min |
| 3 | Monetization tiers setup | 30 min |
| 4 | Testing all automations | 2 hrs |
| 5 | Invite first community members / soft launch | — |

**Total setup time:** ~12 hours across 5 days. Bot hosting: $5/mo ongoing.

## GROWTH TARGETS

| Milestone | When | Actions |
|-----------|------|---------|
| 100 members | Launch week | Invite from existing student base + social media |
| 500 members | Month 1 | Content creator partnerships, cross-promo |
| 1,000 members | Month 2 | First sponsored giveaway, TikTok pipeline active |
| 5,000 members | Month 3 | Discord subscription revenue meaningful |
| 10,000 members | Month 4-6 | Full monetization active, $2-5K/mo from Discord alone |

## REVENUE PROJECTION (Discord-Only)

| Members | Server Subs (5% conversion) | Giveaway Sponsors | Merch/Affiliate | Total/mo |
|---------|---------------------------|-------------------|-----------------|----------|
| 1,000 | $150 | $0 | $0 | $150 |
| 5,000 | $750 | $200 | $100 | $1,050 |
| 10,000 | $1,500 | $500 | $300 | $2,300 |
| 25,000 | $3,750 | $1,000 | $750 | $5,500 |
