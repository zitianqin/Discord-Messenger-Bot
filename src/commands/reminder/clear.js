const { SlashCommandBuilder } = require('discord.js');
const { getData, setData } = require('../../dataStore.js');
const { getReminderListInfo } = require('../../helperFunctions.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Deletes all of the user\'s reminders.'),

  async execute(interaction) {
    const reminders = getData().reminders;
    const userId = interaction.user.id;
    const removedReminders = [];

    for (const reminder of reminders) {
      if (reminder.user.id === userId) {
        removedReminders.push(reminder);
      }
    }

    setData({ reminders: reminders.filter(reminder => reminder.user.id !== userId) });

    if (removedReminders.length === 0) {
      await interaction.reply({content: `You didn't have any reminders to delete!`, ephemeral: true});
    } else {
      await interaction.reply({content: `This is a list of your deleted reminders:\n\n${getReminderListInfo(removedReminders)}`, ephemeral: true});
    }
  },
};
