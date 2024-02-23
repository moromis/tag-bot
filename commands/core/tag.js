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
      db.tagUser(target, interaction.user);
      await interaction.reply(`${target}, you just got tagged!`);
    }
  },
};
