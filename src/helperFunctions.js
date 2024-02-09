const { getData, setData } = require('./dataStore.js');

// An async function that sends a message to the channel
async function sendMessage(client, channelID, message) {
	try {
		const channel = await client.channels.fetch(channelID);
		await channel.send(message);
	} catch (error) {
		console.error(error);
	}
}

// Converts a user's or role's id (as a string) to a mentionable (as a string).
function userIdToMentionable(userId) {
	return `<@${userId}>`;
}

// Sends any outstanding reminders based on dataStore.js, which we assume to be ordered where the upcoming reminder is first
// in the stored array.
async function sendScheduledMessages(client) {
	const data = getData();
	const currentDate = new Date();
	const currentTime = Math.floor(currentDate.getTime() / 1000);

	let numRemindersSent = 0;
	let removed;
	while (data.reminders.length > 0 && data.reminders[0].unixReminderTime <= currentTime) {
		console.log(`Sending the scheduled message with id ${data.reminders[0].id}`);

		try {
			await sendMessage(client, data.reminders[0].channel.id, `${data.reminders[0].reminder}\n\nThis message was scheduled by ${userIdToMentionable(data.reminders[0].user.id)}.`);
		} catch (error) {
			console.error(error);
		}

		removed = data.reminders.splice(0, 1);
		console.log(`Removed the scheduled message with id ${removed[0].id}`);

		numRemindersSent++;
	}

	console.log(`We sent out ${numRemindersSent} scheduled messages in this loop on ${currentDate.toDateString()} at ${currentDate.toTimeString()}.\n`);

	setData(data);
}

// A function that takes an array as an argument and returns a random element within the array.
function randomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

// Generates a unique id.
function uid() {
	return Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(36);
}

function reminderToChannelLink(reminder) {
	return `https://discord.com/channels/${reminder.channel.guildId}/${reminder.channel.id}`;
}

// Returns a string containing all the information that is to be displayed to the user about a list of reminders.
function getReminderListInfo(reminderList) {
	return `${reminderList.map(reminder => '**ID:** ' + reminder.id + '\n**Date and Time:** ' + new Date(reminder.unixReminderTime * 1000).toDateString() + ' at ' + new Date(reminder.unixReminderTime * 1000).toTimeString() + '\n**Channel:** ' + reminderToChannelLink(reminder) + '\n**Message:** ' + reminder.reminder).join('\n\n')}`;
}

// Returns a string containing all the information that is to be displayed to the user about a scheduledMessage.
function getScheduledMessageInfo(message) {
	return '**ID:** ' + message.id + '\n**Date and Time:** ' + new Date(message.unixReminderTime * 1000).toDateString() + ' at ' + new Date(message.unixReminderTime * 1000).toTimeString() + '\n**Channel: **' + reminderToChannelLink(message) + '\n\n**Message:**\n' + message.reminder;
}

// Deletes a scheduled message with the given messageId if the user with the given userId is the owner of the message and sends a reply to the interaction.
function deleteScheduledMessage(messageId, userId, interaction) {
	const messages = getData().reminders;
	const message = messages.find(r => r.id === messageId);

	if (message === undefined) {
		interaction.reply({ content: 'Invalid ID!', ephemeral: true });
		return;
	}

	if (message.user.id !== userId) {
		interaction.reply({ content: `You are not the owner of the scheduled message with the ID \`${messageId}\`!`, ephemeral: true });
		return;
	}

	const originalMessage = message.reminder;

	setData({ reminders: messages.filter(r => r.id !== messageId) });

	interaction.reply({ content: `Successfully deleted the scheduled message with the ID \`${messageId}\`!\n\n## Original message:\n${originalMessage}`, ephemeral: true });
}

function isValidTime(hour, minute) {
	return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function isValidDateAndTime(year, month, day, hour, minute) {
	const date = new Date(year, month - 1, day, hour, minute);
	return isValidTime(hour, minute) && !isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

module.exports = {
	sendMessage,
	userIdToMentionable,
	sendScheduledMessages,
	randomElement,
	uid,
	reminderToChannelLink,
	getReminderListInfo,
	getScheduledMessageInfo,
	deleteScheduledMessage,
	isValidTime,
	isValidDateAndTime,
};
