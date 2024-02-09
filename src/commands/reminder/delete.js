const { SlashCommandBuilder } = require('discord.js');
const { deleteScheduledMessage } = require('../../helperFunctions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete')
		.setDescription('Deletes one of the user\'s scheduled messages.')
		.addStringOption(option =>
			option
				.setName('messageid')
				.setDescription('The ID of the scheduled message you want to delete')
				.setRequired(true)),

	async execute(interaction) {
		deleteScheduledMessage(interaction.options.getString('messageid'), interaction.user.id, interaction);
	},
};
