/* eslint-disable brace-style */
const { SlashCommandBuilder } = require('discord.js');
const { getData, setData } = require('../../dataStore.js');
const { uid, isValidDateAndTime } = require('../../helperFunctions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('schedule')
		.setDescription('Schedules a message for the user.')
		.addStringOption(option =>
			option
				.setName('message')
				.setDescription('The message you want to send')
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName('hour')
				.setDescription('The hour of the day to send the message (24-hour format - 0 to 23)')
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName('minute')
				.setDescription('The minute of the hour to send the message (24-hour format - 0 to 59)')
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
				.setRequired(false))
		.addStringOption(option =>
			option
				.setName('attachments')
				.setDescription('Links to any media you want to attach with the message. (Separate links with a space)')
				.setRequired(false))
		.addBooleanOption(option =>
			option
				.setName('anonymous')
				.setDescription('Send message anonymously. (Default: false)')
				.setRequired(false)),

	async execute(interaction) {
		const hour = interaction.options.getInteger('hour');
		const minute = interaction.options.getInteger('minute');
		const day = interaction.options.getInteger('day');
		const month = interaction.options.getInteger('month');
		const reminder = interaction.options.getString('message');
		const attachmentsOption = interaction.options.getString('attachments');
		const attachments = attachmentsOption ? attachmentsOption.split(' ') : [];
		const anonymous = interaction.options.getBoolean('anonymous') || false;

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
			await interaction.reply({ content: 'Please provide a valid date and time.', ephemeral: true });
			return;
		} else if (unixReminderTime <= unixTime) {
			await interaction.reply({ content: 'Please provide a date and time in the future.', ephemeral: true });
			return;
		} else if (reminder.length + (attachmentsOption?.length || 0) > 1700) {
			await interaction.reply({ content: 'Your total message length, including attachments, cannot be more than 1700 characters long.', ephemeral: true });
			return;
		} else if (attachments.length > 10) {
			await interaction.reply({ content: 'You can only attach up to 10 links.', ephemeral: true });
		}

		// Insert data into the dataStore
		const data = getData();
		const reminders = data.reminders;
		const newItem = { id: uid(), channel: interaction.channel, user: interaction.user, reminder: reminder, unixReminderTime: unixReminderTime, attachments: attachments, anonymous: anonymous };

		// Insert the new message into the array in the position after all previous messages that are scheduled to be sent before or at the same time as the new message.
		let index = 0;
		while (index < reminders.length && reminders[index].unixReminderTime <= newItem.unixReminderTime) {
			index++;
		}

		reminders.splice(index, 0, newItem);
		setData(data);

		// Tell the user the date and time the bot will remind them at, along with the message and any attachments.
		if (attachments.length > 0) {
			await interaction.reply({ content: `I will send the following message on ${reminderDateAndTime.toDateString()} in this channel at ${reminderDateAndTime.toTimeString()}.\n\n${reminder}\n\nAttachments: ${attachments.join('\n')}`, ephemeral: true });
		} else {
			await interaction.reply({ content: `I will send the following message on ${reminderDateAndTime.toDateString()} in this channel at ${reminderDateAndTime.toTimeString()}.\n\n${reminder}`, ephemeral: true });
		}
	},
};
