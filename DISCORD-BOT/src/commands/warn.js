// ============================================
// /warn — Warn a user (mod only)
// ============================================

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user (moderator only)')
    .addUserOption(opt => opt.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for warning').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction, db) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    // Insert warning
    db.prepare(
      'INSERT INTO warnings (user_id, mod_id, reason) VALUES (?, ?, ?)'
    ).run(target.id, interaction.user.id, reason);

    // Get warning count
    const warnCount = db.prepare(
      'SELECT COUNT(*) as count FROM warnings WHERE user_id = ?'
    ).get(target.id).count;

    const embed = new EmbedBuilder()
      .setTitle('⚠️ WARNING ISSUED')
      .addFields(
        { name: 'User', value: `<@${target.id}>`, inline: true },
        { name: 'Warned by', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Total Warnings', value: `${warnCount}`, inline: true },
        { name: 'Reason', value: reason }
      )
      .setColor(0xfbbf24)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Auto-timeout at 3 warnings
    if (warnCount >= 3) {
      try {
        const member = await interaction.guild.members.fetch(target.id);
        await member.timeout(60 * 60 * 1000, `${warnCount} warnings reached`);
        await interaction.followUp(`🔇 <@${target.id}> has been timed out for 1 hour (${warnCount} warnings).`);
      } catch (e) {
        await interaction.followUp(`⚠️ Could not timeout user: ${e.message}`);
      }
    }

    // Log to mod channel
    const modChannel = interaction.guild.channels.cache.get(process.env.MOD_LOG_CHANNEL_ID);
    if (modChannel && modChannel.id !== interaction.channel.id) {
      await modChannel.send({ embeds: [embed] });
    }
  },
};
