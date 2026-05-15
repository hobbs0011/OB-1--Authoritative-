// ============================================
// Message Handler — Auto-moderation + Fun
// ============================================

const { EmbedBuilder } = require('discord.js');

// Banned words/patterns (add more as needed)
const BANNED_PATTERNS = [
  /discord\.gg\/[a-zA-Z0-9]+/i,       // Discord invite links
  /https?:\/\/[^\s]*free.*robux/i,     // Free Robux scams
  /(n[i1]gg|f[a4]gg|r[e3]t[a4]rd)/i,  // Slurs (basic)
];

// Brainrot responses — engage the community
const BRAINROT_TRIGGERS = {
  'skibidi': '🚽 Skibidi Zombie spotted on Day {day}!',
  'rizz': '✨ Rizz level: RIZZLORD tier',
  'sigma': '🐺 Sigma grindset = Day 99 solo clear',
  'ohio': '💀 Only in Ohio would you fight THAT boss',
  'gyatt': '😳 Gyatt... that loot drop though',
  'fanum tax': '🍔 The Fanum Tax Dagger takes 30% of zombie HP',
  'mewing': '🤫 Mewing gives +10% stealth... probably',
  'brainrot': '🧠 Certified brainrot. Welcome home.',
};

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message, db) {
    if (message.author.bot) return;

    // ── Auto-moderation ──
    for (const pattern of BANNED_PATTERNS) {
      if (pattern.test(message.content)) {
        try {
          await message.delete();
          await message.channel.send({
            content: `⚠️ <@${message.author.id}> — that message was removed by auto-mod.`,
          });

          // Log to mod channel
          const modChannel = message.guild.channels.cache.get(process.env.MOD_LOG_CHANNEL_ID);
          if (modChannel) {
            const logEmbed = new EmbedBuilder()
              .setTitle('🛡️ Auto-Mod Action')
              .addFields(
                { name: 'User', value: `<@${message.author.id}> (${message.author.tag})`, inline: true },
                { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
                { name: 'Content', value: message.content.substring(0, 1024) || 'N/A' },
                { name: 'Pattern', value: `\`${pattern.toString()}\``, inline: true }
              )
              .setColor(0xff0000)
              .setTimestamp();
            await modChannel.send({ embeds: [logEmbed] });
          }

          // Auto-warn
          db.prepare(
            'INSERT INTO warnings (user_id, mod_id, reason) VALUES (?, ?, ?)'
          ).run(message.author.id, 'AUTO-MOD', `Banned pattern: ${pattern.toString()}`);

          // Check warning count — auto-timeout at 3
          const warnCount = db.prepare(
            'SELECT COUNT(*) as count FROM warnings WHERE user_id = ?'
          ).get(message.author.id).count;

          if (warnCount >= 3) {
            try {
              const member = await message.guild.members.fetch(message.author.id);
              await member.timeout(60 * 60 * 1000, `Auto-timeout: ${warnCount} warnings`);
              if (modChannel) {
                await modChannel.send(`🔇 <@${message.author.id}> timed out for 1 hour (${warnCount} warnings).`);
              }
            } catch (e) {
              console.error('Failed to timeout user:', e.message);
            }
          }
        } catch (e) {
          console.error('Auto-mod error:', e.message);
        }
        return;
      }
    }

    // ── Brainrot Engagement ──
    const lowerContent = message.content.toLowerCase();
    for (const [trigger, response] of Object.entries(BRAINROT_TRIGGERS)) {
      if (lowerContent.includes(trigger)) {
        const day = Math.floor(Math.random() * 99) + 1;
        await message.reply(response.replace('{day}', day));
        return; // Only one response per message
      }
    }
  },
};
