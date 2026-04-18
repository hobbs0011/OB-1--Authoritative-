# 🚀 Train 6-7 Discord Bot — Hands-Off Deployment Guide

**Goal: Bot runs 24/7, auto-redeploys on every git push, zero server management.**

---

## Recommended: Railway ($5/mo, ~$1-2 actual usage for a Discord bot)

Railway auto-deploys from GitHub. Push code → bot restarts. That's it.

### One-Time Setup (~10 minutes)

#### Step 1: Create Discord Bot Application (3 min)

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** → name it `Train 6-7` → Create
3. Go to **Bot** tab:
   - Click **Reset Token** → **copy the token** (you'll need this)
   - Copy the **Application ID** from General Information
   - Enable these under Privileged Gateway Intents:
     - ✅ SERVER MEMBERS INTENT
     - ✅ MESSAGE CONTENT INTENT
     - ✅ PRESENCE INTENT
4. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Administrator`
   - Copy the generated URL → paste in browser → add to your Discord server

#### Step 2: Get Your Discord Server IDs (2 min)

1. In Discord, go to **Settings → Advanced → Enable Developer Mode**
2. Right-click your **server name** → Copy Server ID → this is `GUILD_ID`
3. Right-click each **channel** → Copy Channel ID (for the env vars below)
4. Right-click each **role** → Copy Role ID (for the env vars below)

#### Step 3: Deploy on Railway (5 min)

1. Go to [railway.app](https://railway.app) → sign in with GitHub (`hobbs-lab`)
2. Click **New Project → Deploy from GitHub Repo**
3. Select `hobbs-lab/Phoenix-Rising-Protocol-Ultimate`
4. Railway will detect the repo. In the new service's **Settings**:
   - Set **Root Directory** to `DISCORD-BOT`
   - Railway will auto-detect the Dockerfile
5. Go to the **Variables** tab and add:

```
DISCORD_TOKEN=your_bot_token_from_step_1
CLIENT_ID=your_application_id_from_step_1
GUILD_ID=your_server_id_from_step_2
WELCOME_CHANNEL_ID=channel_id
ANNOUNCEMENTS_CHANNEL_ID=channel_id
DROP_ALERTS_CHANNEL_ID=channel_id
TRADING_CHANNEL_ID=channel_id
BUG_REPORTS_CHANNEL_ID=channel_id
GENERAL_CHANNEL_ID=channel_id
MOD_LOG_CHANNEL_ID=channel_id
SURVIVOR_ROLE_ID=role_id
VETERAN_ROLE_ID=role_id
RIZZLORD_ROLE_ID=role_id
MOD_ROLE_ID=role_id
ROBLOX_GAME_URL=https://www.roblox.com/games/YOUR_PLACE_ID
WEEKLY_UPDATE_CRON=0 3 * * 2
TZ=Asia/Bangkok
```

6. Click **Deploy** → Railway builds the Docker image and starts the bot
7. Check the **Logs** tab — you should see the bot come online

#### Step 4: Done. Go live.

That's it. From now on:
- **Every git push** to `hobbs-lab/Phoenix-Rising-Protocol-Ultimate` that changes `DISCORD-BOT/` → Railway auto-redeploys
- Bot runs **24/7** with automatic restarts on crash
- Logs visible in Railway dashboard
- No SSH, no VPS, no cron jobs, no PM2

---

## What It Costs

| Resource | Usage | Cost |
|----------|-------|------|
| CPU | ~0.1 vCPU idle | ~$0.50/mo |
| RAM | ~50-100MB | ~$0.50/mo |
| Storage | SQLite DB < 10MB | negligible |
| **Total** | | **~$1-2/mo** |

Railway Hobby plan: $5/mo with $5 included credits. A Discord bot basically runs free within the included credits.

---

## Updating the Bot

**Just push to GitHub.** That's the whole process.

```bash
# Ne0 pushes code changes to DISCORD-BOT/ on GitHub
# Railway detects the push
# Railway rebuilds and redeploys automatically
# Bot goes offline for ~30 seconds during rebuild
# Bot comes back online with new code
```

No manual deploy commands. No SSH. No restart scripts.

---

## Monitoring

- **Railway Dashboard** → Logs tab shows real-time bot output
- **Railway Alerts** → Set up Slack/Discord/email notifications for crashes
- Bot sends mod actions to `#mod-log` channel automatically

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Bot offline | Check Railway logs. Usually a missing env var. |
| Slash commands not showing | Bot needs 1-2 minutes to register. If stuck, re-invite with OAuth2 URL. |
| SQLite errors | Data dir might not be writable. Check Dockerfile permissions. |
| Deploy fails | Check Railway build logs. Usually a package.json issue. |
| Bot token leaked | Immediately reset token in Discord Developer Portal → update Railway variable. |

---

## Alternative: Render.com (backup option)

If Railway doesn't work out:

1. Go to [render.com](https://render.com) → sign in with GitHub
2. New → Background Worker → connect `hobbs-lab/Phoenix-Rising-Protocol-Ultimate`
3. Root Directory: `DISCORD-BOT`
4. Build Command: `npm ci --omit=dev`
5. Start Command: `node src/index.js`
6. Add all environment variables
7. Free tier has a sleep timer — **Starter plan ($7/mo) for 24/7**

---

## Alternative: Oracle Cloud (free forever, more setup)

For truly $0/mo hosting with 24GB RAM:

1. Create Oracle Cloud account → Always Free ARM instance
2. SSH in → install Node.js 20
3. Clone repo → cd DISCORD-BOT → npm install
4. Set up PM2 or systemd for process management
5. More hands-on, but $0 forever

---

## Architecture Note

The bot lives inside the `Phoenix-Rising-Protocol-Ultimate` monorepo at `DISCORD-BOT/`.
Railway's **Root Directory** feature isolates it — only `DISCORD-BOT/` changes trigger redeploys.
This means pulse engine commits to `CANON/` won't cause unnecessary bot restarts.

---

**Built for the zone. Deploy and forget. 🧟**
