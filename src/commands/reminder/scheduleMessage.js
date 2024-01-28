const { SlashCommandBuilder } = require('discord.js');
const { getData, setData } = require('../../dataStore.js');
const { randomElement, uid, isValidDateAndTime } = require('../../helperFunctions.js');

// Arrays for randomising and creating variation within the messages.
const okayArray = ['Okey dokey', 'Aye aye, captain', 'Sure thing', 'Absofruitly', 'okie'];
const endingArray = ['!', ' :D'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('message')
    .setDescription('Schedules a message for the user.')
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('The message you want to send')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('hour')
        .setDescription('The hour of the day to send the message')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('minute')
        .setDescription('The minute of the hour of the day to send the message')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('day')
        .setDescription('The day to send the message')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('month')
        .setDescription('The month to send the message')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('year')
        .setDescription('The year to send the message')
        .setRequired(false)),

  async execute(interaction) {
    const hour = interaction.options.getInteger('hour');
    const minute = interaction.options.getInteger('minute');
    const day = interaction.options.getInteger('day');
    const month = interaction.options.getInteger('month');
    const reminder = interaction.options.getString('message');

    const date = new Date();
    const unixTime = Math.floor(date.getTime() / 1000);
    
    // Adjust the year (since it is optionally given by the user) depending on if it will make the reminder be in the past.
    // This will make the reminder be the earliest possible time in the future.
    let year;
    if (interaction.options.getInteger('year')) {
      year = interaction.options.getInteger('year');

    } else {
      const givenDate = new Date(date.getFullYear(), month - 1, day, hour, minute);
      const unixGivenTime = Math.floor(givenDate.getTime() / 1000);

      if (unixGivenTime < unixTime) {
        givenDate.setFullYear(givenDate.getFullYear() + 1);
      }
      
      year = givenDate.getFullYear();
    }

    const reminderDateAndTime = new Date(year, month - 1, day, hour, minute);
    const unixReminderTime = Math.floor(reminderDateAndTime.getTime() / 1000);

    // Check for invalid date and time inputs
    if (!isValidDateAndTime(year, month, day, hour, minute)) {
      await interaction.reply({content: 'Please provide a valid date and time.', ephemeral: true});
      return;
    } else if (unixReminderTime <= unixTime) {
      await interaction.reply({content: 'Please provide a date and time in the future.', ephemeral: true});
      return;
    } else if (reminder.length > 220) {
      await interaction.reply({content: 'Your message cannot be more than 220 characters long.', ephemeral: true});
      return;
    }

    // Insert data into the dataStore
    let data = getData();
    let reminders = data.reminders;

    const newItem = {id: uid(), channel: interaction.channel, user: interaction.user, reminder: reminder, unixReminderTime: unixReminderTime};
    
    let index = 0;
    while (index < reminders.length && reminders[index].unixReminderTime < newItem.unixReminderTime) {
      index++;
    }

    reminders.splice(index, 0, newItem);
    setData(data);

    // Tell the user the date and time the bot will remind them at.
    await interaction.reply({content: `${randomElement(okayArray)}, I will send "${reminder}" on ${reminderDateAndTime.toDateString()} at ${reminderDateAndTime.toTimeString()}${randomElement(endingArray)}`, ephemeral: true});
  },
};
