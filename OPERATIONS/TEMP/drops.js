// ============================================
// /drops — Show today's featured loot rotation
// ============================================

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const WEAPONS = [
  { name: 'Wooden Bat', rarity: 'Common', tier: '⬜', dps: '8' },
  { name: 'Rusty Machete', rarity: 'Common', tier: '⬜', dps: '12' },
  { name: 'Iron Sword', rarity: 'Uncommon', tier: '🟩', dps: '18' },
  { name: 'Crossbow', rarity: 'Uncommon', tier: '🟩', dps: '22' },
  { name: 'Plasma Cutter', rarity: 'Rare', tier: '🟦', dps: '30' },
  { name: 'Katana', rarity: 'Rare', tier: '🟦', dps: '35' },
  { name: 'Railgun', rarity: 'Epic', tier: '🟪', dps: '45' },
  { name: 'Void Scythe', rarity: 'Epic', tier: '🟪', dps: '48' },
  { name: 'Sigma Blade', rarity: 'Legendary', tier: '🟨', dps: '60' },
  { name: 'Photon Lance', rarity: 'Legendary', tier: '🟨', dps: '65' },
  { name: 'Brainrot Annihilator', rarity: 'RIZZLORD', tier: '🟥', dps: '99' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('drops')
    .setDescription('Show today\'s featured weapons in the loot rotation'),

  async execute(interaction) {
    // Pick 3 random featured weapons
    const shuffled = [...WEAPONS].sort(() => Math.random() - 0.5);
    const featured = shuffled.slice(0, 3);

    const weaponList = featured.map(w =>
      `${w.tier} **${w.name}** — ${w.rarity} (${w.dps} DPS)`
    ).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('🎰 TODAY\'S FEATURED DROPS')
      .setDescription(
        `${weaponList}\n\n` +
        `These weapons are in today's loot rotation.\n` +
        `Kill zombies. Open crates. Get lucky.\n\n` +
        `[**▶️ PLAY NOW**](${process.env.ROBLOX_GAME_URL})`
      )
      .setColor(0xffd700)
      .setFooter({ text: `Rotation resets daily • SURVIVE. FIGHT. SPEND.` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
