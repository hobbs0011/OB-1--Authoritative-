// ============================================
// /stats — Server and game statistics
// ============================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View server and community stats'),

  async execute(interaction, db) {
    const guild = interaction.guild;
    const memberCount = guild.memberCount;
    const onlineCount = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;
    const channelCount = guild.channels.cache.size;
    const roleCount = guild.roles.cache.size;
    const createdAt = guild.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Warning stats
    const totalWarnings = db.prepare('SELECT COUNT(*) as count FROM warnings').get().count;
    const todayWarnings = db.prepare(
      "SELECT COUNT(*) as count FROM warnings WHERE created_at > datetime('now', '-1 day')"
    ).get().count;

    const embed = new EmbedBuilder()
      .setTitle('📊 SERVER STATS')
      .addFields(
        { name: '👥 Members', value: `${memberCount}`, inline: true },
        { name: '🟢 Online', value: `${onlineCount}`, inline: true },
        { name: '📅 Created', value: createdAt, inline: true },
        { name: '💬 Channels', value: `${channelCount}`, inline: true },
        { name: '🎭 Roles', value: `${roleCount}`, inline: true },
        { name: '⚠️ Warnings', value: `${totalWarnings} total (${todayWarnings} today)`, inline: true }
      )
      .setColor(0x3b82f6)
      .setFooter({ text: 'SURVIVE. FIGHT. SPEND.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
