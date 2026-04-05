# Discord Bot MVP — Skibidi Zombie Community Bot

**GOAL: MAKE MONEY.** Discord bot drives community → community drives retention → retention drives revenue.

## Bot Identity

**Name:** SkibidiBot (or BrainrotBot — test both)
**Avatar:** Skibidi Zombie character art
**Status:** "Surviving the Brainrots | !help"

## Tech Stack

- **Runtime:** Node.js 20+
- **Library:** discord.js v14
- **Hosting:** Railway / Render (free tier to start, upgrade when CCU > 100)
- **Database:** SQLite (local) → PostgreSQL (when scaling)
- **Roblox API:** Noblox.js for game data integration

## MVP Commands (Phase 1 — Ship in 24h)

### Core Commands

| Command | Description | Priority |
|---------|-------------|----------|
| `!help` | Show all commands | P0 |
| `!play` | Link to Roblox game page | P0 |
| `!leaderboard` | Top 10 players by wave/coins | P0 |
| `!stats @user` | Player stats lookup | P1 |
| `!daily` | Daily English challenge (1 question) | P0 |
| `!quiz` | Quick 5-question English quiz | P1 |
| `!braincheck` | Random brainrot meme + English fact | P1 |
| `!invite` | Generate invite link + referral tracking | P0 |

### Engagement Commands

| Command | Description | Priority |
|---------|-------------|----------|
| `!streak` | Show daily login streak | P1 |
| `!challenge @user` | PvP English battle | P2 |
| `!meme` | Generate random brainrot meme caption | P2 |
| `!vocab` | Word of the day (brainrot-themed) | P1 |

### Admin Commands

| Command | Description |
|---------|-------------|
| `!announce <text>` | Send announcement to announcement channel |
| `!event <name> <duration>` | Start a timed community event |
| `!giveaway <prize> <duration>` | Start a giveaway |
| `!ban <user>` | Ban user from bot features |

## Auto-Features (No Command Needed)

### Welcome System
```
On member join:
  1. Send welcome embed in #welcome
  2. Assign "Brainrot Survivor" role
  3. DM with game link + quick start guide
  4. Log join to #mod-log
```

### Daily Engagement Loop
```
Every day at 12:00 UTC:
  1. Post Word of the Day in #daily-english
  2. Post Daily Challenge in #challenges
  3. Post leaderboard update in #leaderboard
  4. Rotate featured meme in #memes
```

### Activity Tracking
```
On message:
  1. Track XP (1 XP per message, 5 XP for quiz answer)
  2. Track streaks (messages on consecutive days)
  3. Level up notifications at thresholds
  4. Role rewards: Level 5 → "Sigma", Level 10 → "Gyatt Master", Level 25 → "Brainrot Lord"
```

### Game Integration
```
Webhook from Roblox game → Discord:
  - New high score announcements
  - Boss kill celebrations
  - Wave record notifications
  - New player welcomes ("X just started playing!")
```

## Channel Structure

```
SKIBIDI ZOMBIE
├── 📢 announcements
├── 📜 rules
├── 👋 welcome
├── 💬 general
├── 🎮 game-chat
├── 📊 leaderboard
├── 📚 daily-english
├── 🏆 challenges
├── 🎨 memes
├── 🎁 giveaways
├── 🐛 bug-reports
├── 💡 suggestions
├── 🔧 mod-log (admin only)
└── 🤖 bot-commands
```

## Bot Code Skeleton

```javascript
// index.js — SkibidiBot Entry Point
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ]
});

client.commands = new Collection();

// Command handler
const fs = require('fs');
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log(`SkibidiBot online! Serving ${client.guilds.cache.size} servers`);
    client.user.setActivity('Surviving the Brainrots | !help', { type: 'PLAYING' });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith('!')) return;
    
    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    
    if (command) {
        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('Something went brainrot. Try again.');
        }
    }
});

// Welcome system
client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.find(c => c.name === 'welcome');
    if (channel) {
        channel.send({
            embeds: [{
                title: '🧟 NEW SURVIVOR DETECTED',
                description: `Welcome ${member}! Ready to survive the brainrots?`,
                color: 0x00ff88,
                fields: [
                    { name: '🎮 Play Now', value: '[Click to Play](https://www.roblox.com/games/YOUR_GAME_ID)', inline: true },
                    { name: '📚 Learn English', value: 'Type `!daily` for today\'s challenge', inline: true },
                ],
                footer: { text: 'Skibidi Zombie: Survive the Brainrots' }
            }]
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
```

## Deployment Checklist

- [ ] Create Discord Application at discord.com/developers
- [ ] Create Bot, copy token
- [ ] Set bot permissions: Send Messages, Manage Roles, Embed Links, Read Message History, Add Reactions
- [ ] Generate invite URL with correct permissions
- [ ] Deploy to Railway/Render with DISCORD_TOKEN env var
- [ ] Create all channels in server
- [ ] Test all MVP commands
- [ ] Set up Roblox → Discord webhook for game events
- [ ] Configure daily cron job for automated posts
- [ ] Add server to game description

## Revenue Integration Points

1. **!play** command tracks click-throughs (attribution)
2. **Leaderboard** creates FOMO → drives game plays
3. **Daily challenges** create habit loops → retention
4. **Giveaways** grow server → grow player base
5. **Referral tracking** measures Discord → Roblox conversion
6. **Event announcements** drive time-limited spending

---
*Built for Skibidi Zombie: Survive the Brainrots. GOAL: MAKE MONEY.*
