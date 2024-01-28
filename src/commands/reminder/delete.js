const { SlashCommandBuilder } = require('discord.js');
const { getData, setData } = require('../../dataStore.js');
const { getReminderListInfo } = require('../../helperFunctions.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Deletes one of the user\'s scheduled messages.')
    .addStringOption(option =>
      option
        .setName('messageID')
        .setDescription('The ID of the scheduled message you want to delete')
        .setRequired(true)),

  async execute(interaction) {
    const reminders = getData().reminders;
    const userId = interaction.user.id;
    const reminderId = interaction.options.getString('messageID');

    const reminder = reminders.find(reminder => reminder.id === reminderId);

    if (reminder === undefined) {
      await interaction.reply({content: `Invalid messageID!`, ephemeral: true});
      return;
    }

    if (reminder.user.id !== userId) {
      await interaction.reply({content: `You are not the owner of the scheduled message with the ID \`${reminderId}\`!`, ephemeral: true});
      return;
    }

    const originalMessage = reminder.reminder;

    setData({ reminders: reminders.filter(reminder => reminder.id !== reminderId) });

    await interaction.reply({content: `Successfully deleted the scheduled message with the ID \`${reminderId}\`!\n\n##Original message:\n${originalMessage}`, ephemeral: true});
  },
};
