// ============================================
// /report — Submit a bug report
// ============================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Submit a bug report')
    .addStringOption(opt => opt.setName('title').setDescription('Brief title of the bug').setRequired(true))
    .addStringOption(opt => opt.setName('description').setDescription('What happened?').setRequired(true))
    .addStringOption(opt =>
      opt.setName('severity')
        .setDescription('How bad is it?')
        .setRequired(true)
        .addChoices(
          { name: '🔴 Game-breaking', value: 'critical' },
          { name: '🟡 Annoying', value: 'medium' },
          { name: '🟢 Minor', value: 'low' }
        )
    ),

  async execute(interaction) {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const severity = interaction.options.getString('severity');

    const severityConfig = {
      critical: { emoji: '🔴', color: 0xff0000, label: 'CRITICAL' },
      medium:   { emoji: '🟡', color: 0xfbbf24, label: 'MEDIUM' },
      low:      { emoji: '🟢', color: 0x22c55e, label: 'LOW' },
    };
    const sev = severityConfig[severity];

    const embed = new EmbedBuilder()
      .setTitle(`${sev.emoji} BUG REPORT: ${title}`)
      .setDescription(description)
      .addFields(
        { name: 'Severity', value: sev.label, inline: true },
        { name: 'Reporter', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Status', value: '🔓 Open', inline: true }
      )
      .setColor(sev.color)
      .setFooter({ text: `Report by ${interaction.user.username}` })
      .setTimestamp();

    // Send to bug reports channel
    const bugChannel = interaction.guild.channels.cache.get(process.env.BUG_REPORTS_CHANNEL_ID);
    if (bugChannel) {
      const msg = await bugChannel.send({ embeds: [embed] });
      await msg.react('👍'); // Track acknowledgment
      await interaction.reply({ content: `✅ Bug report submitted to <#${bugChannel.id}>. Thanks survivor!`, ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed] });
    }
  },
};
