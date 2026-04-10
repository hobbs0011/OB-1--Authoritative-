// ============================================
// Welcome Event — New Member Joins
// ============================================

const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',
  once: false,
  async execute(member, db) {
    // Assign Survivor role
    const survivorRole = member.guild.roles.cache.get(process.env.SURVIVOR_ROLE_ID);
    if (survivorRole) {
      try {
        await member.roles.add(survivorRole);
      } catch (e) {
        console.error(`Failed to assign Survivor role to ${member.user.tag}:`, e.message);
      }
    }

    // Welcome message
    const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
    if (!channel) return;

    const memberCount = member.guild.memberCount;

    const embed = new EmbedBuilder()
      .setTitle('🧟 A NEW SURVIVOR HAS ENTERED THE ZONE')
      .setDescription(
        `Welcome **${member.user.username}**!\n\n` +
        `You are Survivor **#${memberCount}**.\n\n` +
        `> 🗡️ **SURVIVE** — 99 days. Zombies every night.\n` +
        `> ⚔️ **FIGHT** — Tap to attack. Dodge to live.\n` +
        `> 💰 **SPEND** — RNG drops. Trading. Battle Pass.\n\n` +
        `[**▶️ PLAY NOW**](${process.env.ROBLOX_GAME_URL})\n\n` +
        `Check out:\n` +
        `• <#${process.env.ANNOUNCEMENTS_CHANNEL_ID}> — Updates & patch notes\n` +
        `• <#${process.env.TRADING_CHANNEL_ID}> — Trade weapons & items\n` +
        `• <#${process.env.DROP_ALERTS_CHANNEL_ID}> — Daily loot drops\n` +
        `• <#${process.env.BUG_REPORTS_CHANNEL_ID}> — Found a bug? Report it`
      )
      .setColor(0xff4444)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setFooter({ text: 'SURVIVE. FIGHT. SPEND.' })
      .setTimestamp();

    await channel.send({ content: `<@${member.id}>`, embeds: [embed] });

    // Track stats
    db.prepare(
      `INSERT OR REPLACE INTO server_stats (key, value, updated_at) VALUES ('member_count', ?, datetime('now'))`
    ).run(String(memberCount));
  },
};
