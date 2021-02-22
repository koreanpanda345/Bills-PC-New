import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import { Message, TextChannel, MessageEmbed, Collection, PermissionString } from "discord.js";
import DraftTimer, { IDraftTimer } from "../../database/schemas/DraftTimerSchema";
import { CallbackError, Document } from "mongoose";


export class SetdraftCommand implements ICommand {
	name = "setdraft";
	category = "draft";
	description = "Enables you to setup the draft timer feature, which will manage your draft's timer for you, and will ping, and skip players when its their turn or they been skipped.";
	permission: {user?: PermissionString[]} = {
		user: ["MANAGE_GUILD"]
	}
	invoke = async(ctx: CommandContext) => {
		let filter = (m: Message) => m.author.id === ctx.userId;
		let draft: {
			channelId?: string,
			serverId?: string,
			timer?: number,
			totalSkips?: number,
			players?: Array<{userId?: string, skips?: number, pokemon?: string[], order?: number}>,
			maxRounds?: number,
			currentPlayer?: string,
			leagueName?: string,
			leaguePrefix?: string
		} = {
			players: []
		};

		draft.channelId = ctx.channelId as string;
		draft.serverId = ctx.guildId!;
		const step1 = (ctx.channel as TextChannel).createMessageCollector(filter, {max: 1});
		
		const embed = new MessageEmbed();
		embed.setTitle("Draft Timer Setup");
		embed.setDescription("What is the league's name?");
		embed.setColor("RANDOM");
		ctx.sendMessage(embed).then(msg => {
			step1.on("collect", (collected: Message) => {
				if(collected.content.toLowerCase().includes("cancel")) {
					step1.stop();
					return ctx.sendMessage("Cancelling");
				}
				else {
					draft.leagueName = collected.content.trim();
					embed.setDescription(`League Name: ${draft.leagueName}` + "\nWhat would you like this league's prefix to be? This is main for during the draft.");
					msg.edit(embed);
					const step2 = (ctx.channel as TextChannel).createMessageCollector(filter, {max: 1});
		
					step2.on("collect", (_collected: Message) => {
					if(_collected.content.toLowerCase().includes("cancel"))
					{
						return ctx.sendMessage("Cancelling");
					}
					draft.leaguePrefix = _collected.content.trim();
					embed.setDescription(`League Name: ${draft.leagueName}\nLeague Prefix: ${draft.leaguePrefix}` + "\nHow long is the timer? (m/h) example: For 10 minutes, then put `10m`, 1 hour put `1h`");
					msg.edit(embed);
					const step3 = (ctx.channel as TextChannel).createMessageCollector(filter, {max: 1});

					step3.on("collect", (__collected: Message) => {
					
					
					if(__collected.content.toLowerCase().includes("cancel"))
					{
						return ctx.sendMessage("Cancelling");
						
					}
					let time = __collected.content.toLowerCase();
					if(time.includes("m")) draft.timer = Number.parseInt(time.split("m")[0].trim()) * 1000 * 60;
					else if(time.includes("h")) draft.timer = Number.parseInt(time.split("h")[0].trim()) * 1000 * 60 * 60;
					else if(!time.includes("m") || time.includes("h")) {
						return ctx.sendMessage("That is not a valid time. Please use m for minutes, and h for hours.");
					}
					embed.setDescription(`League Name: ${draft.leagueName}\nLeague Prefix: ${draft.leaguePrefix}` + "\nPlease add the pings of the players. You can add each one individually, or all at once.\n Once you have all of your players, type in `save` to continue");
				msg.edit(embed);
				const step4 = (ctx.channel as TextChannel).createMessageCollector(filter, {time: 2400000});

				step4.on("collect", async (___collected: Message) => {
					if(___collected.content.toLowerCase().includes("cancel"))
					{
						return ctx.sendMessage("Cancelling");
					}
					if(___collected.content.toLowerCase().includes("save"))
					{
						return step4.stop();
					}
					else {
						___collected.mentions.users.forEach(user => {
							draft.players?.push({userId: user.id, skips: 0, pokemon: [], order: draft.players.length + 1});
							embed.addField(`Player ${user.username}`, `Draft Order: ${draft.players?.find(x => x.userId === user.id)?.order}`);	
						})
						msg.edit(embed);
					}
				});
				step4.on("end", (_, reason) => {
					embed.setDescription(`League Name: ${draft.leagueName}\nLeague Prefix: ${draft.leaguePrefix}` + "\nWhat is the maximum skips that a player can have in a row? each skip will cut the timer in half for them.");
					msg.edit(embed);
					const step5 = (ctx.channel as TextChannel).createMessageCollector(filter, {max: 1});
	
					step5.on("collect", (____collected: Message) => {
						if(____collected.content.toLowerCase().includes("cancel")) {
							return ctx.sendMessage("Cancelling");
						}
	
						else if(____collected.content.toLowerCase().includes("skip"))
						{
							draft.totalSkips = 3;
							ctx.sendMessage("Skipping...");
							step5.stop();
						}
	
						let skips = Number.parseInt(____collected.content.trim());
						if(isNaN(skips)) return ctx.sendMessage("This is not a number.");
						draft.totalSkips = skips;
						embed.setDescription(`League Name: ${draft.leagueName}\nLeague Prefix: ${draft.leaguePrefix}\nTotal Skips Per Player: ${draft.totalSkips}` + "\nHow man rounds are there?");
						msg.edit(embed);
									const step6 = (ctx.channel as TextChannel).createMessageCollector(filter, {max: 1});
						step6.on("collect", (_____collected: Message) => {
						
						
						if(_____collected.content.toLowerCase().includes("cancel")) {
							return ctx.sendMessage("Cancelling");
						}
	
						if(_____collected.content.toLowerCase().includes("skip"))
						{
							draft.maxRounds = 11;
							ctx.sendMessage("Skipping...");
							step6.stop();
						}
	
						let rounds = Number.parseInt(_____collected.content.trim());
						if(isNaN(rounds)) return ctx.sendMessage("This is not a number");
						draft.maxRounds = rounds;
						DraftTimer.findOne({channelId: draft.channelId!}, (err: CallbackError, record: IDraftTimer) => {
							if(!record) {
								draft.currentPlayer = draft.players?.find(x => x.order === 1)?.userId;
								const newRecord = new DraftTimer({
									serverId: draft.serverId!,
									channelId: draft.channelId!,
									timer: draft.timer!,
									players: draft.players!,
									maxRounds: draft.maxRounds!,
									totalSkips: draft.totalSkips!,
									currentPlayer: draft.currentPlayer,
									direction: "down",
									round: 1,
									prefix: draft.leaguePrefix!,
									leagueName: draft.leagueName!,
									pause: false,
									stop: false,
									edits: false
								});
		
								newRecord.save().catch(error => console.error(error));
								let saveEmbed = new MessageEmbed();
								saveEmbed.setTitle("Saved");
								saveEmbed.setDescription("You can now use the `startdraft` command in the channel that you set up in.");
								saveEmbed.setColor("GREEN");
		
								return msg.edit(saveEmbed);
							}
							let saveEmbed = new MessageEmbed();
							saveEmbed.setTitle("Waring: a draft timer is already set up in this channel.");
							saveEmbed.setDescription("If you would like to remove this timer, then use the `deletedraft` command to delete it. To start the draft timer, use the command `startdraft` to start it.");
							saveEmbed.setColor("ORANGE");
		
							return msg.edit(saveEmbed);
						})
					});
					
					});
				})
				});
				});
				}
			});

		});
	};
}