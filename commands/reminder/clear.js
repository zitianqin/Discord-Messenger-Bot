const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');
const { getData, setData } = require('../../dataStore.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Deletes all of the user\'s reminders.'),

  async execute(interaction) {
    const reminders = getData().reminders;
    const userString = interaction.user.toString();
    const removedReminders = [];

    for (const reminder of reminders) {
      if (reminder.user === userString) {
        removedReminders.push(reminder);
      }
    }

    setData({ reminders: reminders.filter(reminder => reminder.user !== userString) });

    if (removedReminders.length === 0) {
      await interaction.reply(`You didn't have any reminders to delete!`);
    } else {
      await interaction.reply(`I've deleted the following reminders:\n\n${removedReminders.map(reminder => '**ID:** ' + reminder.id + '\n**Date and Time:** ' + new Date(reminder.unixReminderTime * 1000).toDateString() + ' at ' + new Date(reminder.unixReminderTime * 1000).toTimeString() + '\n**Reminder:**' + reminder.reminder).join('\n\n')}`);
    }
  },
};