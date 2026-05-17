# Train 6-7 Revival Pipeline

**Estimated total time: ~65 minutes**
**Last updated:** 2026-05-18

---

## Phase 1 — Discord Bot Setup (~10 min)

### Step 1: Create the Discord Application (3 min)

1. Go to <https://discord.com/developers/applications>
2. Click **New Application** → name it `Train 6-7` → **Create**
3. Go to the **Bot** tab:
   - Click **Reset Token** → copy the token immediately (shown once) → this is `DISCORD_TOKEN`
   - Go to **General Information** → copy **Application ID** → this is `CLIENT_ID`
   - Under **Privileged Gateway Intents**, enable all three:
     - ✅ SERVER MEMBERS INTENT
     - ✅ MESSAGE CONTENT INTENT
     - ✅ PRESENCE INTENT
4. Go to **OAuth2 → URL Generator**:
   - Scopes: check `bot` and `applications.commands`
   - Bot Permissions: check `Administrator`
   - Copy the generated URL at the bottom

### Step 2: Invite the Bot to Your Server (1 min)

1. Paste the OAuth2 URL from Step 1 into your browser
2. Select your Discord server → **Authorize**

### Step 3: Collect Server and Channel IDs (3 min)

1. In Discord: **User Settings → Advanced → Enable Developer Mode**
2. Right-click your **server name** → **Copy Server ID** → this is `GUILD_ID`
3. Right-click each channel listed below → **Copy Channel ID**:

   | Env Var                    | Channel Name to right-click     |
   |----------------------------|---------------------------------|
   | `WELCOME_CHANNEL_ID`       | #welcome                        |
   | `ANNOUNCEMENTS_CHANNEL_ID` | #announcements                  |
   | `DROP_ALERTS_CHANNEL_ID`   | #drop-alerts                    |
   | `TRADING_CHANNEL_ID`       | #trading                        |
   | `BUG_REPORTS_CHANNEL_ID`   | #bug-reports                    |
   | `GENERAL_CHANNEL_ID`       | #general                        |
   | `MOD_LOG_CHANNEL_ID`       | #mod-log                        |

4. Right-click each role listed below → **Copy Role ID**:

   | Env Var            | Role Name       |
   |--------------------|-----------------|
   | `SURVIVOR_ROLE_ID` | Survivor        |
   | `VETERAN_ROLE_ID`  | Veteran         |
   | `RIZZLORD_ROLE_ID` | Rizzlord        |
   | `MOD_ROLE_ID`      | Mod             |

### Step 4: Compile All Env Vars

Write out your complete variable list before moving to Phase 2:

```
DISCORD_TOKEN=
CLIENT_ID=
GUILD_ID=
WELCOME_CHANNEL_ID=
ANNOUNCEMENTS_CHANNEL_ID=
DROP_ALERTS_CHANNEL_ID=
TRADING_CHANNEL_ID=
BUG_REPORTS_CHANNEL_ID=
GENERAL_CHANNEL_ID=
MOD_LOG_CHANNEL_ID=
SURVIVOR_ROLE_ID=
VETERAN_ROLE_ID=
RIZZLORD_ROLE_ID=
MOD_ROLE_ID=
ROBLOX_GAME_URL=https://www.roblox.com/games/YOUR_PLACE_ID
WEEKLY_UPDATE_CRON=0 3 * * 2
TZ=Asia/Bangkok
```

---

## Phase 2 — Railway Deploy (~5 min)

### Step 1: Create the Railway Project

1. Go to <https://railway.app> → sign in with GitHub (`hobbs0011`)
2. Click **New Project → Deploy from GitHub Repo**
3. Search for and select `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-`

### Step 2: Configure the Service

1. Once the service is created, click into it → **Settings** tab
2. Find **Root Directory** → set it to `APPS/discord-bot`
3. Railway will detect the `Dockerfile` in that directory automatically

### Step 3: Add Environment Variables

1. Go to the **Variables** tab
2. Paste in all variables from Phase 1 Step 4 (one per line, Railway accepts `KEY=value` format)
3. Click **Add** after each or use the bulk paste option if available

### Step 4: Deploy

1. Click **Deploy** (or Railway may auto-deploy on save)
2. Click into the service → **Logs** tab
3. Wait for the line: `Bot logged in as Train 6-7#XXXX` — bot is live

---

## Phase 3 — Roblox Setup (~30 min)

### Step 1: Create the Experience (5 min)

1. Go to <https://create.roblox.com> → log in as **PhoenixRisingGames**
2. Click **Create** → **Experience**
3. Name it exactly: `Survive a Brainrot`
4. Set **Max Players** to `5`
5. Click **Create**

### Step 2: Collect Place ID and Universe ID (2 min)

1. After creation, you land on the experience dashboard
2. The URL will be: `https://create.roblox.com/dashboard/creations/experiences/UNIVERSE_ID/overview`
   - Copy that number → this is `Universe ID`
3. Go to **Places** tab → click the root place
   - The URL changes to include the `Place ID` → copy it

### Step 3: Create the Open Cloud API Key (10 min)

1. Go to <https://create.roblox.com/dashboard/credentials>
2. Click **Create API Key**
3. Fill in:
   - **Name:** `Phoenix Rising Gaming`
   - **API System:** add `DataStore API` + `MessagingService API`
   - **Experience:** select `Survive a Brainrot` (paste your Place ID to find it)
   - **IP Addresses:** leave unrestricted for now (tighten later)
4. Click **Save** → copy the key immediately (shown once)

### Step 4: Enable Studio API Access (5 min)

1. Open Roblox Studio → open your `Survive a Brainrot` place
2. Go to **Game Settings** (Home tab → Game Settings button)
3. Under **Security**:
   - ✅ Allow HTTP Requests
   - ✅ Enable Studio Access to API Services

---

## Phase 4 — Roblox Studio Script Placement (~20 min)

Reference the full Script Placement Map in `APPS/TRAIN-67/TURN-KEY-DEPLOY-PACKET.md`.

### How to place each script

For every row in the map:

1. In the **Explorer** panel, right-click the target folder (e.g. `ServerScriptService`)
2. Click **Insert Object** → choose the type:
   - Server scripts → **Script**
   - Client scripts → **LocalScript**
   - Module scripts → **ModuleScript**
3. Rename the object to the **Script Name** in the table
4. Open the source file from `APPS/TRAIN-67/CODE/<filename>.lua` → select all → copy
5. Paste into the Studio script editor → **Ctrl+S** to save

### Script placement order

| # | Target Folder           | Script Name        | Source File                       |
|---|-------------------------|--------------------|-----------------------------------|
| 1 | ServerScriptService     | GameMain           | GameMain_PHASE1_REVISED.lua       |
| 2 | ServerScriptService     | MonetizationServer | MonetizationServer.lua            |
| 3 | StarterPlayerScripts    | HUDController      | HUDController_PHASE1_REVISED.lua  |
| 4 | ReplicatedStorage       | CodexData          | CodexData.lua                     |
| 5 | ReplicatedStorage       | CodexClient        | CodexClient.lua                   |
| 6 | ReplicatedStorage       | LedgerSchema       | LedgerSchema.lua                  |

### Step 2: Update Config in GameMain

After placing `GameMain`, find the Config block near the top and update:

```lua
Config.PlaceId = YOUR_PLACE_ID      -- from Phase 3 Step 2
Config.UniverseId = YOUR_UNIVERSE_ID -- from Phase 3 Step 2
```

---

## Phase 5 — Go Live (~5 min)

### Step 1: Publish the Experience

1. In Roblox Studio: **File → Publish to Roblox**
2. Confirm the experience name is `Survive a Brainrot`

### Step 2: Make It Public

1. Go to <https://create.roblox.com> → your experience dashboard
2. Click **Visibility** → set to **Public**

### Step 3: Smoke Test

1. Press **F5** in Studio → single-player test — confirm HUD loads and no script errors
2. **Start Server** (Studio → Test tab → Start Server) → join with 3+ players → confirm lobby gate works
3. Play one wave — confirm enemies spawn and rewards trigger

### Step 4: Announce in Discord

1. Post in `#announcements` on your Discord server:

```
Survive a Brainrot is LIVE on Roblox!
Play now: https://www.roblox.com/games/YOUR_PLACE_ID
```

2. Update `ROBLOX_GAME_URL` in Railway Variables with the real Place ID URL

---

## Quick Reference — All IDs to Collect

| Item              | Where to find it                                         | Used in              |
|-------------------|----------------------------------------------------------|----------------------|
| DISCORD_TOKEN     | Discord Dev Portal → Bot → Reset Token                  | Railway env var      |
| CLIENT_ID         | Discord Dev Portal → General Information → Application ID| Railway env var     |
| GUILD_ID          | Discord → right-click server name → Copy Server ID      | Railway env var      |
| Channel IDs (x7)  | Discord → right-click channel → Copy Channel ID         | Railway env vars     |
| Role IDs (x4)     | Discord → right-click role → Copy Role ID               | Railway env vars     |
| Place ID          | create.roblox.com → Places tab → place URL              | GameMain + API key   |
| Universe ID       | create.roblox.com → experience dashboard URL            | DataStore API calls  |
| Open Cloud Key    | create.roblox.com → Credentials → API Keys              | Server-side scripts  |
