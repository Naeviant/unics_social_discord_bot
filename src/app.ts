import { Client, MessageEmbed, Role, GuildChannel } from 'discord.js';

import * as dotenv from "dotenv";

dotenv.config();

const client = new Client();

client.on('ready', () => {
	console.log('Discord Bot Online')
});

client.on('message', async (message) => {
	// Check Message is from Correct Guild
	const guild = message.guild;
	if (guild && guild.id === process.env.DISCORD_GUILD) {
		// Break Down Message
		const args = message.content.split(" | ");
		// Check User is Administrator 
		if (message.member && message.member.hasPermission('ADMINISTRATOR')) {
			// Handle New Events
			// 	~newevent | <Name> | <Groups> | [Text/Voice/TextVoice]
			if (args[0] == "~newevent") {
				// Prepare Reply
				let reply = new MessageEmbed();
				// Test Command Validity
				if (args.length === 4 && !isNaN(parseInt(args[2])) && ["text", "voice", "textvoice"].indexOf(args[3].toLowerCase()) > -1) {
					// Create New Event Role to Apply to All Users (Announcements etc.)
					const announcementsRole = await guild.roles.create({ data: {
						name: args[1]
					}});

					// Create Category
					const eventCategory = await guild.channels.create(args[1], {
						type: 'category'
					});

					// Generate Announcements Channel
					const announcementsChannel = await guild.channels.create(args[1], {
						type: 'text',
						parent: eventCategory,
						permissionOverwrites: [
							{
								id: guild.roles.everyone,
								deny: 'SEND_MESSAGES'
							}
						]
					});

					// Generate Channels and Roles for Groups
					let i = 1;
					while (i <= parseInt(args[2])) {
						// Generate Role
						let groupRole = await guild.roles.create({ data: {
							name: `${args[1]} - Group ${i}`
						}});
						// Generate Text Channel
						if (args[3].toLowerCase() == 'textvoice' || args[3].toLowerCase() == 'text') {
							await guild.channels.create(`${args[1]} - Group ${i}`, {
								type: 'text',
								parent: eventCategory,
								permissionOverwrites: [
									{
										id: guild.roles.everyone,
										deny: 'VIEW_CHANNEL'
									},
									{
										id: groupRole,
										allow: 'VIEW_CHANNEL'
									}
								]
							});
						}
						// Generate Voice Channel
						if (args[3].toLowerCase() == 'textvoice' || args[3].toLowerCase() == 'voice') {
							await guild.channels.create(`${args[1]} - Group ${i}`, {
								type: 'voice',
								parent: eventCategory,
								permissionOverwrites: [
									{
										id: guild.roles.everyone,
										deny: 'VIEW_CHANNEL'
									},
									{
										id: groupRole,
										allow: 'VIEW_CHANNEL'
									}
								]
							});
						}
						i += 1;
					}
					// Send Confirmation
					reply.setTitle('Event Created')
						 .setDescription(`${args[2]} groups have been created for ${args[1]}.`);

					message.reply(reply);
					
				}
				else {
					// Handle Invalid Command Syntax
					reply.setTitle('Invalid Command')
						 .setDescription('Usage: ~newevent | <Event Name> | <Number of Groups> | [Text/Voice/TextVoice]');

					message.reply(reply);
				}
			}
		}
	}
});

// Connect Bot to Discord
client.login(process.env.DISCORD_TOKEN);