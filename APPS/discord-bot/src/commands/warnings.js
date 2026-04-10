// ============================================
// /warnings — Check a user's warning history
// ============================================

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Check a user\'s warning history')
    .addUserOption(opt => opt.setName('user').setDescription('User to check').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction, db) {
    const target = interaction.options.getUser('user');

    const warnings = db.prepare(
      'SELECT * FROM warnings WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
    ).all(target.id);

    if (warnings.length === 0) {
      return interaction.reply({ content: `✅ <@${target.id}> has no warnings.`, ephemeral: true });
    }

    const warnList = warnings.map((w, i) =>
      `**${i + 1}.** ${w.reason}\n   By: <@${w.mod_id}> • ${new Date(w.created_at).toLocaleDateString()}`
    ).join('\n\n');

    const embed = new EmbedBuilder()
      .setTitle(`⚠️ Warnings for ${target.username}`)
      .setDescription(warnList)
      .setColor(0xfbbf24)
      .setFooter({ text: `Total: ${warnings.length} warning(s)` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed, ], ephemeral: true });
  },
};
