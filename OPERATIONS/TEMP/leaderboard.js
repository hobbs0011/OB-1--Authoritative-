// ============================================
// /leaderboard — Show community leaderboards
// ============================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show community leaderboards')
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('Which leaderboard?')
        .setRequired(true)
        .addChoices(
          { name: '💬 Most Active (messages)', value: 'messages' },
          { name: '⚠️ Most Warned', value: 'warned' },
          { name: '🎟️ Most Giveaway Wins', value: 'giveaways' }
        )
    ),

  async execute(interaction, db) {
    const type = interaction.options.getString('type');

    let embed;

    if (type === 'warned') {
      const topWarned = db.prepare(
        'SELECT user_id, COUNT(*) as count FROM warnings GROUP BY user_id ORDER BY count DESC LIMIT 10'
      ).all();

      if (topWarned.length === 0) {
        return interaction.reply({ content: '✅ No warnings issued yet. Clean server!', ephemeral: true });
      }

      const list = topWarned.map((w, i) =>
        `**${i + 1}.** <@${w.user_id}> — ${w.count} warning(s)`
      ).join('\n');

      embed = new EmbedBuilder()
        .setTitle('⚠️ WALL OF SHAME')
        .setDescription(list)
        .setColor(0xff4444)
        .setFooter({ text: 'Don\'t end up here.' })
        .setTimestamp();

    } else {
      // Placeholder for future in-game data integration
      embed = new EmbedBuilder()
        .setTitle('🏆 LEADERBOARD')
        .setDescription(
          '**Coming soon!**\n\n' +
          'In-game leaderboards will sync here once the game is live.\n\n' +
          '> 🗡️ Kill streaks\n' +
          '> 💰 Total coins earned\n' +
          '> 🏅 Days survived\n' +
          '> ⚔️ Highest combo'
        )
        .setColor(0xffd700)
        .setFooter({ text: 'SURVIVE. FIGHT. SPEND.' })
        .setTimestamp();
    }

    await interaction.reply({ embeds: [embed] });
  },
};
