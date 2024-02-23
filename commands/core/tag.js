const { SlashCommandBuilder } = require("discord.js");
const { getDatabase } = require("../../databaseManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tag")
    .setDescription("Tag the mentioned user")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to tag")
        .setRequired(true),
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("target");
    const db = getDatabase();
    if (interaction.user.id == target.id) {
      await interaction.reply(`Sorry, you can't tag yourself.`);
    } else {
      const tagged = db.getCurrentlyTagged();
      if (tagged) {
        // there does exist in the current game someone that has been tagged
        if (tagged !== interaction.user.displayName) {
          await interaction.reply(
            `You can't tag someone if you're not currently tagged. Check who's tagged with \`\\whos-tagged\` and tell them to go get 'em.`,
          );
        } else {
          db.tagUser(target, interaction.user);
          await interaction.reply(`${target}, you just got tagged!`);
        }
      } else {
        // no one's been tagged. proceed.
        db.tagUser(target, interaction.user);
        await interaction.reply(`${target}, you just got tagged!`);
      }
    }
  },
};
