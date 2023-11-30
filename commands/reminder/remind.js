const { SlashCommandBuilder } = require('discord.js');
const { getData, setData } = require('../../dataStore.js');

// A function that takes an array as an argument and returns a random element within the array.
function randomElement(array) {
  var randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

function uid() {
  return Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9*Math.pow(10, 12)).toString(36);
}

// Arrays for randomising and creating variation within the messages.
const okayArray = ['Okey dokey', 'Aye aye, captain', 'Sure thing', 'Absofruitly', 'okie'];
const endingArray = ['!', ' :D'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Sets a reminder for the user.')
    .addStringOption(option =>
      option
        .setName('reminder')
        .setDescription('The thing you want to be reminded about')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('hour')
        .setDescription('The hour of the day of the reminder')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('minute')
        .setDescription('The minute of hour of the day of the reminder')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('day')
        .setDescription('The day of the reminder')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('month')
        .setDescription('The month of the reminder')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('year')
        .setDescription('The year of the reminder')
        .setRequired(false)),

  async execute(interaction) {
    const hour = interaction.options.getInteger('hour');
    const minute = interaction.options.getInteger('minute');
    const day = interaction.options.getInteger('day');
    const month = interaction.options.getInteger('month');
    const reminder = interaction.options.getString('reminder');

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
    
    // Tell the user the date and time the bot will remind them at.
    await interaction.reply(`${randomElement(okayArray)} ${interaction.user.toString()}, I will remind you to ${reminder} on ${reminderDateAndTime.toDateString()} at ${reminderDateAndTime.toTimeString()}${randomElement(endingArray)}`);

    // Insert data into the dataStore
    let data = getData();
    let reminders = data.reminders;
    let newItem = {id: uid(), channel: interaction.channel, user: interaction.user.toString(), reminder: reminder, unixReminderTime: unixReminderTime};
    
    let index = 0;
    while (index < reminders.length && reminders[index].unixReminderTime < newItem.unixReminderTime) {
      index++;
    }
    
    reminders.splice(index, 0, newItem);
    setData(data);
  },
};