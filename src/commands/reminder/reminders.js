const { SlashCommandBuilder } = require('discord.js');
const { getData } = require('../../dataStore.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reminders')
    .setDescription('Gets a list of all the user\'s reminders.'),

  async execute(interaction) {
    const reminders = getData().reminders;
    const userId = interaction.user.id;
    const reminderList = [];

    for (const reminder of reminders) {
      if (reminder.user.id === userId) {
        reminderList.push(reminder);
      }
    }

    if (reminderList.length === 0) {
      await interaction.reply(`You don't have any upcoming reminders!`);
    } else {
      await interaction.reply(`This is a list of your upcoming reminders:\n\n${reminderList.map(reminder => '**ID:** ' + reminder.id + '\n**Date and Time:** ' + new Date(reminder.unixReminderTime * 1000).toDateString() + ' at ' + new Date(reminder.unixReminderTime * 1000).toTimeString() + '\n**Remindee(s):** ' + `<@${reminder.remindee.id}>` + '\n**Reminder:** ' + reminder.reminder).join('\n\n')}`);
    }
  },
};