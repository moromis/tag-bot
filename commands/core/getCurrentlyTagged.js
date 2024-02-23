const { SlashCommandBuilder } = require("discord.js");
const { getDatabase } = require("../../databaseManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whos-tagged")
    .setDescription("Who's tagged?"),
  async execute(interaction) {
    const db = getDatabase();
    const tagged = db.getCurrentlyTagged();
    await interaction.reply(
      tagged
        ? `${tagged} is currently tagged right now.`
        : "No one is tagged yet. Someone get someone!",
    );
  },
};
