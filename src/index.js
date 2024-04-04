const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { sendScheduledMessages } = require('./utils.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Read in commands from the 'commands' directory. All commands must be in a subfolder within the commands folder.
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Check the dataStore.js file every minute and send out outstanding reminders.
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
	// Send the reminders out at the start of every minute.
	const currentDate = new Date();
	const currentSecond = currentDate.getSeconds() * 1000;
	const currentMillisecond = currentDate.getMilliseconds();
	const timeToWait = 60000 - (currentSecond + currentMillisecond);

	sendScheduledMessages(client);
	setTimeout(setInterval, timeToWait, () => sendScheduledMessages(client), 60000);
});

// When a command interaction is created, find the corresponding command and execute it.
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
	}
});

client.login(token);