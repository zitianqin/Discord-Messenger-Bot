const { SlashCommandBuilder } = require('discord.js');

// A function that takes an array as an argument and returns a random element within the array.
function randomElement(array) {
  var randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
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

    // Schedule the reminder message
    // Calculate the delay in milliseconds
    const delay = (unixReminderTime - unixTime) * 1000;

    // Set a timeout function to send the reminder message after the delay
    setTimeout(() => {
      // Send the reminder message to the same channel and tag the user
      interaction.channel.send(`${interaction.user.toString()}, this is your reminder to ${reminder}!`);
    }, delay);
  },
};