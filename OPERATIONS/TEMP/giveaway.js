// ============================================
// /giveaway — Start or end a giveaway
// ============================================

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const crypto = require('crypto');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Manage giveaways')
    .addSubcommand(sub =>
      sub.setName('start')
        .setDescription('Start a new giveaway')
        .addStringOption(opt => opt.setName('prize').setDescription('What\'s the prize?').setRequired(true))
        .addIntegerOption(opt => opt.setName('winners').setDescription('Number of winners').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('end')
        .setDescription('End an active giveaway and pick winners')
        .addStringOption(opt => opt.setName('id').setDescription('Giveaway ID').setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, db) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'start') {
      const prize = interaction.options.getString('prize');
      const winnerCount = interaction.options.getInteger('winners');
      const giveawayId = crypto.randomBytes(4).toString('hex');

      const embed = new EmbedBuilder()
        .setTitle('🎁 GIVEAWAY!')
        .setDescription(
          `**Prize:** ${prize}\n` +
          `**Winners:** ${winnerCount}\n\n` +
          `Click the button below to enter!\n` +
          `ID: \`${giveawayId}\``
        )
        .setColor(0x22c55e)
        .setFooter({ text: 'SURVIVE. FIGHT. SPEND.' })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`giveaway_enter_${giveawayId}`)
          .setLabel('🎟️ Enter Giveaway')
          .setStyle(ButtonStyle.Success)
      );

      await interaction.reply({ embeds: [embed], components: [row] });

      // Store giveaway metadata
      db.prepare(
        `INSERT OR REPLACE INTO server_stats (key, value, updated_at) VALUES (?, ?, datetime('now'))`
      ).run(`giveaway_${giveawayId}`, JSON.stringify({ prize, winnerCount, channelId: interaction.channel.id }));

      // Handle button clicks
      const collector = interaction.channel.createMessageComponentCollector({
        filter: (i) => i.customId === `giveaway_enter_${giveawayId}`,
        time: 7 * 24 * 60 * 60 * 1000, // 7 days max
      });

      collector.on('collect', async (btnInteraction) => {
        try {
          db.prepare(
            'INSERT INTO giveaway_entries (giveaway_id, user_id) VALUES (?, ?)'
          ).run(giveawayId, btnInteraction.user.id);

          const entryCount = db.prepare(
            'SELECT COUNT(*) as count FROM giveaway_entries WHERE giveaway_id = ?'
          ).get(giveawayId).count;

          await btnInteraction.reply({
            content: `🎟️ You're in! (${entryCount} total entries)`,
            ephemeral: true,
          });
        } catch (e) {
          if (e.message.includes('UNIQUE')) {
            await btnInteraction.reply({ content: '⚠️ You already entered!', ephemeral: true });
          }
        }
      });

    } else if (sub === 'end') {
      const giveawayId = interaction.options.getString('id');

      const meta = db.prepare(
        "SELECT value FROM server_stats WHERE key = ?"
      ).get(`giveaway_${giveawayId}`);

      if (!meta) {
        return interaction.reply({ content: '❌ Giveaway not found.', ephemeral: true });
      }

      const { prize, winnerCount } = JSON.parse(meta.value);
      const entries = db.prepare(
        'SELECT user_id FROM giveaway_entries WHERE giveaway_id = ?'
      ).all(giveawayId);

      if (entries.length === 0) {
        return interaction.reply({ content: '❌ No entries for this giveaway.', ephemeral: true });
      }

      // Pick random winners
      const shuffled = entries.sort(() => Math.random() - 0.5);
      const winners = shuffled.slice(0, Math.min(winnerCount, entries.length));
      const winnerMentions = winners.map(w => `<@${w.user_id}>`).join(', ');

      const embed = new EmbedBuilder()
        .setTitle('🎉 GIVEAWAY ENDED!')
        .setDescription(
          `**Prize:** ${prize}\n` +
          `**Winners:** ${winnerMentions}\n\n` +
          `Congratulations! 🧟\n` +
          `Total entries: ${entries.length}`
        )
        .setColor(0xffd700)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      // Cleanup
      db.prepare('DELETE FROM giveaway_entries WHERE giveaway_id = ?').run(giveawayId);
      db.prepare('DELETE FROM server_stats WHERE key = ?').run(`giveaway_${giveawayId}`);
    }
  },
};
