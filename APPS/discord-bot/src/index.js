// ============================================
// Train 6-7: To Survive a Brainrot — Discord Bot
// SURVIVE. FIGHT. SPEND.
// ============================================

require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { CronJob } = require('cron');
const Database = require('better-sqlite3');

// ── Client Setup ──
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.commands = new Collection();

// ── Database Setup ──
const db = new Database(path.join(__dirname, '..', 'data', 'bot.db'));
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    mod_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS server_stats (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS giveaway_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    giveaway_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    entered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(giveaway_id, user_id)
  );
`);

// ── Load Commands ──
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
const commandData = [];

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    commandData.push(command.data.toJSON());
  }
}

// ── Load Events ──
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, db));
  } else {
    client.on(event.name, (...args) => event.execute(...args, db));
  }
}

// ── Slash Command Handler ──
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction, db);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);
    const reply = { content: '❌ Something broke. The zombies got to the server.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

// ── Scheduled Jobs ──

// Weekly Update Reminder — pings announcements channel
const weeklyUpdateJob = new CronJob(
  process.env.WEEKLY_UPDATE_CRON || '0 3 * * 2', // Tuesday 10am ICT (3am UTC)
  async () => {
    const channel = client.channels.cache.get(process.env.ANNOUNCEMENTS_CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle('🔥 WEEKLY UPDATE INCOMING')
      .setDescription(
        '**Survivors!** A new update is dropping today.\n\n' +
        '> New weapons? New mutations? New ways to spend?\n' +
        '> Stay tuned for patch notes...\n\n' +
        '**SURVIVE. FIGHT. SPEND.** 🧟'
      )
      .setColor(0xff4444)
      .setTimestamp();

    await channel.send({ content: '@everyone', embeds: [embed] });
  },
  null, true, process.env.TZ || 'Asia/Bangkok'
);

// Daily Drop Alert — random weapon/item tease
const dailyDropJob = new CronJob(
  '0 9 * * *', // 4pm ICT (9am UTC) — peak after-school hours
  async () => {
    const channel = client.channels.cache.get(process.env.DROP_ALERTS_CHANNEL_ID);
    if (!channel) return;

    const drops = [
      { name: 'Sigma Katana', rarity: 'LEGENDARY', emoji: '⚔️', color: 0xffd700 },
      { name: 'Ohio Anomaly Fang', rarity: 'EPIC', emoji: '🦷', color: 0xa855f7 },
      { name: 'Brainrot Beam Cannon', rarity: 'RIZZLORD', emoji: '🔫', color: 0xff0000 },
      { name: 'Skibidi Shield', rarity: 'RARE', emoji: '🛡️', color: 0x3b82f6 },
      { name: 'Mewing Medallion', rarity: 'EPIC', emoji: '🏅', color: 0xa855f7 },
      { name: 'Gyatt Grenade', rarity: 'LEGENDARY', emoji: '💣', color: 0xffd700 },
      { name: 'Fanum Tax Dagger', rarity: 'RARE', emoji: '🗡️', color: 0x3b82f6 },
      { name: 'Rizz Aura Cloak', rarity: 'RIZZLORD', emoji: '✨', color: 0xff0000 },
    ];
    const drop = drops[Math.floor(Math.random() * drops.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${drop.emoji} DROP ALERT: ${drop.name}`)
      .setDescription(
        `**Rarity:** ${drop.rarity}\n\n` +
        `This item has been spotted in today's loot rotation.\n` +
        `Will you survive long enough to claim it?\n\n` +
        `[**PLAY NOW**](${process.env.ROBLOX_GAME_URL})`
      )
      .setColor(drop.color)
      .setFooter({ text: 'SURVIVE. FIGHT. SPEND.' })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  },
  null, true, process.env.TZ || 'Asia/Bangkok'
);

// ── Register Slash Commands ──
client.once('ready', async () => {
  console.log(`\n🧟 Bot online as ${client.user.tag}`);
  console.log(`📡 Serving ${client.guilds.cache.size} guild(s)`);
  console.log(`⚔️ ${commandData.length} commands loaded`);
  console.log(`🔥 SURVIVE. FIGHT. SPEND.\n`);

  // Register commands
  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commandData }
    );
    console.log(`✅ Registered ${commandData.length} slash commands`);
  } catch (error) {
    console.error('Failed to register commands:', error);
  }

  // Start scheduled jobs
  weeklyUpdateJob.start();
  dailyDropJob.start();
  console.log('⏰ Scheduled jobs started');

  // Set activity
  client.user.setActivity('Day 1 of 99... 🧟', { type: 3 }); // WATCHING
});

// ── Ensure data directory exists ──
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// ── Login ──
client.login(process.env.DISCORD_TOKEN);
