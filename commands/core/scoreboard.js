const { SlashCommandBuilder } = require("discord.js");
const { getDatabase } = require("../../databaseManager");
const { isEmpty } = require("lodash");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("scoreboard")
    .setDescription("See the current standings"),
  async execute(interaction) {
    const db = getDatabase();
    const scoreboard = db.getScoreboard();
    if (isEmpty(scoreboard)) {
      await interaction.reply(
        "No one's playing yet. Use /register to add yourself to the game, or tag someone and then use /tag <username> to record it!",
      );
    } else {
      await interaction.reply({
        content: `## Scoreboard\n${scoreboard.join("\n")}`,
        ephemeral: true,
      });
    }
  },
};
