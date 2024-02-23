const { SlashCommandBuilder, userMention } = require("discord.js");
const { getDatabase } = require("../../databaseManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register for the current game"),
  async execute(interaction) {
    const user = interaction.user;
    const db = getDatabase();
    db.addUser(user);
    await interaction.reply(
      `Welcome ${userMention(user.id)}, you're part of the game now.`,
    );
  },
};
