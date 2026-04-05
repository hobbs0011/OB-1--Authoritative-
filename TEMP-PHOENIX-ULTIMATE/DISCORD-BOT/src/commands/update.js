// ============================================
// /update — Post a game update announcement (mod only)
// ============================================

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('update')
    .setDescription('Post a game update announcement (moderator only)')
    .addStringOption(opt => opt.setName('title').setDescription('Update title').setRequired(true))
    .addStringOption(opt => opt.setName('changes').setDescription('What changed (use | to separate items)').setRequired(true))
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('Update type')
        .setRequired(true)
        .addChoices(
          { name: '🔥 Major Update', value: 'major' },
          { name: '⚡ Hotfix', value: 'hotfix' },
          { name: '🎉 New Content', value: 'content' },
          { name: '⚖️ Balance', value: 'balance' },
          { name: '🐛 Bug Fix', value: 'bugfix' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const title = interaction.options.getString('title');
    const changes = interaction.options.getString('changes').split('|').map(c => `• ${c.trim()}`).join('\n');
    const type = interaction.options.getString('type');

    const typeConfig = {
      major:   { emoji: '🔥', color: 0xff4444, label: 'MAJOR UPDATE' },
      hotfix:  { emoji: '⚡', color: 0xfbbf24, label: 'HOTFIX' },
      content: { emoji: '🎉', color: 0x22c55e, label: 'NEW CONTENT' },
      balance: { emoji: '⚖️', color: 0x3b82f6, label: 'BALANCE PATCH' },
      bugfix:  { emoji: '🐛', color: 0x8b5cf6, label: 'BUG FIX' },
    };

    const cfg = typeConfig[type];

    const embed = new EmbedBuilder()
      .setTitle(`${cfg.emoji} ${cfg.label}: ${title}`)
      .setDescription(
        `**Changes:**\n${changes}\n\n` +
        `[**▶️ PLAY NOW**](${process.env.ROBLOX_GAME_URL})`
      )
      .setColor(cfg.color)
      .setFooter({ text: 'SURVIVE. FIGHT. SPEND.' })
      .setTimestamp();

    // Post to announcements channel
    const announcementsChannel = interaction.guild.channels.cache.get(process.env.ANNOUNCEMENTS_CHANNEL_ID);
    if (announcementsChannel) {
      await announcementsChannel.send({ content: '@everyone', embeds: [embed] });
      await interaction.reply({ content: `✅ Update posted to <#${announcementsChannel.id}>`, ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed] });
    }
  },
};
