const { SlashCommandBuilder } = require('discord.js');
const { getData, setData } = require('../../dataStore.js');

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
      await interaction.reply(`You didn't have any reminders to delete!`);
    } else {
      await interaction.reply(`This is a list of your deleted reminders:\n\n${removedReminders.map(reminder => '**ID:** ' + reminder.id + '\n**Date and Time:** ' + new Date(reminder.unixReminderTime * 1000).toDateString() + ' at ' + new Date(reminder.unixReminderTime * 1000).toTimeString() + '\n**Remindee(s):** ' + `<@${reminder.remindee.id}>` + '\n**Reminder:** ' + reminder.reminder).join('\n\n')}`);
    }
  },
};
