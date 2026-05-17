// ============================================
// /play — Quick link to the game
// ============================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Get the game link — jump into Train 6-7!'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🧟 Train 6-7: To Survive a Brainrot')
      .setDescription(
        `**99 days. Zombies. Loot. Survive.**\n\n` +
        `[**▶️ PLAY NOW ON ROBLOX**](${process.env.ROBLOX_GAME_URL})\n\n` +
        `> 🗡️ 19 weapons across 6 rarity tiers\n` +
        `> 🧟 5 enemy types + Sigma Bosses\n` +
        `> 🎰 RNG mutations every run\n` +
        `> 🤝 Trade your drops\n` +
        `> 🏆 Battle Pass Season 1 LIVE`
      )
      .setColor(0xff4444)
      .setFooter({ text: 'SURVIVE. FIGHT. SPEND.' });

    await interaction.reply({ embeds: [embed] });
  },
};
