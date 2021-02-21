import { ICommand } from "../types/commands";
import { CommandContext } from "../types/commandContext";
import DraftTimer from "../database/schemas/DraftTimerSchema";
import {IDraftTimer} from "../database/schemas/DraftTimerSchema";
import {Dex} from "@pkmn/dex";
import { TextChannel, Message, MessageEmbed, PermissionString } from "discord.js";
import moment from "moment";
import { IMonitors } from "../types/monitors";
import { CallbackError } from "mongoose";
import { getNamingConvention } from './../utils/helpers';


export class DraftMonitor implements IMonitors {
	private _ctx: CommandContext;
	constructor(ctx: CommandContext) {
		this._ctx = ctx;
	}
	name = "draft";

	pause = async () => {
		let record = await this.getDraftData();	
		if(record === null) return this._ctx.sendMessage("Please use the `setdraft` command to setup the draft timer.");
		record.pause = true;
		record.save().catch(error => console.error(error));
	}

	resume = async() => {
		let record = await this.getDraftData();
		if(record === null) return this._ctx.sendMessage("Please use the `setdraft` command to setup the draft timer.");
		record.pause = false;
		record.save().catch(error => console.error(error));
	}

	stop = async () => {
		let record = await this.getDraftData();
		if(record === null) return this._ctx.sendMessage("Please us the `setdraft` command to setup the draft timer.");
		record.stop = true;
		record.save().catch(error => console.error());
	}

	getDraftData = async (): Promise<IDraftTimer> => {
		let ctx = this._ctx;
		let result = await new Promise((resolve) => {
			
			DraftTimer.findOne({serverId: ctx.guildId, channelId: ctx.channelId}, async (err: CallbackError, record: IDraftTimer) => {
				if(record === null) return ctx.sendMessage("Please use the `setdraft` command to setup the draft timer.");
				// console.debug(record);
				return resolve(record);
			});
		});
		// @ts-ignore
		return result;
	}

	getPokemonName = (name: string) => {
		return getNamingConvention(name);
	};

	invoke = async () => {
		let ctx = this._ctx;
		ctx.sendMessage(`Draft Timer has been turned on!`);
		let record = await this.getDraftData();

		setInterval(async () => {
			console.log("loaded data");
			record = await this.getDraftData();
		}, 10000);


		//@ts-ignore
			let getUserPicks = async () => {
				
				if(record.stop === true)
				{
					record.stop = false;
					record.save().catch(error => console.error(error));
					ctx.client.runningMonitors.delete(ctx.channelId);
					ctx.client.executingMonitors.delete(ctx.channelId);
					ctx.sendMessage("Stopping draft. you can pick off where you last left off on using the `startdraft` command.");
					
					return;
				}
				(await ctx.client.users.fetch(record.currentPlayer)).createDM().then(async dm => {
					let filter = (m: Message) => m.author.id === record.currentPlayer;
					let collector = dm.createMessageCollector(filter, {time: record.pause ? 8640000 : record.timer});
					let player = record.players.find(x => x.userId === record.currentPlayer);
					if(player?.queue.length !== 0) {
						let pokemon = player?.queue.shift()!;
						pokemon = this.getPokemonName(pokemon);
						let check = Dex.getSpecies(pokemon.toLowerCase().trim());
						let draftEmbed = new MessageEmbed()
							.setDescription(`<@${record.currentPlayer}> Has Drafted **${check.name}**`)
							.setImage(`https://play.pokemonshowdown.com/sprites/ani/${check.name.toLowerCase()}.gif`)
							.setColor("RANDOM");
						ctx.sendMessage(draftEmbed);
						if(record.direction === "down") {
							console.log(player?.order);
							console.log(record.players.length);
							console.log(player?.order === record.players.length);
							if(player?.order === record.players.length) {
								console.log("something");
								record.direction = "up";
								record.round++;
							}
							else 
								record.currentPlayer = record.players.find(x => x.order === player?.order! + 1)?.userId!;
						}
						else if(record.direction === "up") {
							if(player?.order === 1) {
								record.direction = "down";
								record.round++;
							}
							else 
								record.currentPlayer = record.players.find(x => x.order === player?.order! - 1)?.userId!;	
						}
						record.save().catch(error => console.error(error));
					}
					else if(player.skips! >= record.totalSkips) {
						if(record.direction === "down") {
							if(player?.order === record.players.length) {
								record.direction = "up";
								record.round++;
							}
							else 
								record.currentPlayer = record.players.find(x => x.order === player?.order! + 1)?.userId!;
						}
						else if(record.direction === "up") {
							if(player?.order === 1) {
								record.direction = "down";
								record.round++;
							}
							else 
								record.currentPlayer = record.players.find(x => x.order === player?.order! - 1)?.userId!;	
						}
						let skipEmbed = new MessageEmbed()
								.setDescription(`<@${record.currentPlayer}> is on auto skip.`)
								.setColor("RED");
						ctx.sendMessage(skipEmbed);
						if(record.round <= record.maxRounds) await getUserPicks();
						else if(record.round >= record.maxRounds) {
							let finishedEmbed = new MessageEmbed();
							finishedEmbed.setTitle('Draft has concluded');
							finishedEmbed.setDescription(`Here is the Drafts that each player has made.`);
							finishedEmbed.setColor("RANDOM");
							for(let _player of record.players) {
								let desc = "";
								_player.pokemon.forEach(x => desc += `Round ${_player.pokemon.findIndex(y => y === x) + 1} - ${x}\n`);

								finishedEmbed.addField(`Player ${(await ctx.client.users.fetch(_player.userId)).username}`, desc, true);
							}
							ctx.client.executingMonitors.delete(ctx.channelId);
							ctx.client.runningMonitors.delete(ctx.channelId);
							return ctx.sendMessage(finishedEmbed);
						}
					}
					else {
					let time = moment(record.timer);
					let pickEmbed = new MessageEmbed()
						.setTitle(`Its your pick in ${ctx.guild?.name}`)
						.setDescription(`Your league's prefix is ${record.prefix}. To draft a pokemon type in \`${record.prefix} <pokemon name>\` example: \`${record.prefix} lopunny\`\nYou can apply text to the selection by adding \`-text\` at the end of the pokemon you want, then say whatever you want to say.`)
						.setColor("RANDOM")
						.addField("Timer:", `${record.pause ? "Timer Is off" : (time.minutes() > 60 ? `${time.hours()} hours` : `${time.minutes()} minutes`)}`)
						.setFooter(`We are on pick ${player?.order} of round ${record.round} / ${record.maxRounds}`);
					dm.send(pickEmbed);
					let serverEmbed = new MessageEmbed()
						.setDescription(`<@${record.currentPlayer}> is on the Clock!\nWe are on pick ${player?.order} of round ${record.round} / ${record.maxRounds}`)
						.addField("Timer:", `${record.pause ? "Timer Is off" : (time.minutes() > 60 ? `${time.hours()} hours` : `${time.minutes()} minutes`)}`)
						.setColor("RANDOM");
					ctx.sendMessage(serverEmbed);
					collector.on("collect", async (collected: Message) => {
						if(player?.skips === record.totalSkips) {
							collector.stop("skipped");
							return;
						}
						let args = collected.content.trim().split(/ +/g);
						let prefix = args.shift()?.toLowerCase();
						let pokemon = args.join(" ");
						let text = "";
						if(pokemon.includes("-text")) {
							text = pokemon.split("-text")[1].trim();
							pokemon = pokemon.split("-text")[0].trim();
						}

						pokemon = this.getPokemonName(pokemon);
						if(prefix?.length! < 1 || prefix !== record.prefix) return dm.send("Please enter your league's prefix, then your pokemon. example `" + record.prefix + " lopunny`");
						let check = Dex.getSpecies(pokemon.toLowerCase().trim());
						if(!check.exists) return dm.send("That is not a pokemon");
						let found = record.pokemon.find(x => x.toLowerCase() === pokemon.toLowerCase());
						if(found) {
							let owner = record.players.find(x => x.pokemon.includes(found!));
							return dm.send(`${check.name} has already been drafted by ${(await ctx.client.users.fetch(owner?.userId!)).username}`);
						}
						player?.pokemon.push(check.name);
						record.pokemon?.push(check.name);
						let draftEmbed = new MessageEmbed()
							.setDescription(`<@${record.currentPlayer}> Has Drafted **${check.name}**${text !== "" ? `\n${text}`: ""}`)
							.setImage(`https://play.pokemonshowdown.com/sprites/ani/${check.name.toLowerCase()}.gif`)
							.setColor("RANDOM");
						ctx.sendMessage(draftEmbed);
						collector.stop('picked');
					});
		
					collector.on("end", async (collected, reason) => {
							
						player = record.players.find(x => x.userId === record.currentPlayer);
						if(reason === 'time'){
							player?.skips !== undefined ? player.skips++ : 0;
							dm.send("You were skipped.");
							let skipEmbed = new MessageEmbed()
								.setDescription(`<@${record.currentPlayer}> has been skipped (${player?.skips}/${record.totalSkips})`)
								.setColor("ORANGE");
							
							ctx.sendMessage(skipEmbed);
						}
						if(record.direction === "down") {
							if(player?.order === record.players.length) {
								record.direction = "up";
								record.round++;
							}
							else 
								record.currentPlayer = record.players.find(x => x.order === player?.order! + 1)?.userId!;
						}
						else if(record.direction === "up") {
							if(player?.order === 1) {
								record.direction = "down";
								record.round++;
							}
							else 
								record.currentPlayer = record.players.find(x => x.order === player?.order! - 1)?.userId!;	
						}
						record.save().catch(error => console.error(error));
						if(record.round <= record.maxRounds) await getUserPicks();
						else if(record.round >= record.maxRounds) {
							let finishedEmbed = new MessageEmbed();
							finishedEmbed.setTitle('Draft has concluded');
							finishedEmbed.setDescription(`Here is the Drafts that each player has made.`);
							finishedEmbed.setColor("RANDOM");
							for(let _player of record.players) {
								let desc = "";
								_player.pokemon.forEach(x => desc += `Round ${_player.pokemon.findIndex(y => y === x) + 1} - ${x}\n`);

								finishedEmbed.addField(`Player ${(await ctx.client.users.fetch(_player.userId)).username}`, desc, true);
							}
							ctx.client.executingMonitors.delete(ctx.channelId);
							ctx.client.runningMonitors.delete(ctx.channelId);
							return ctx.sendMessage(finishedEmbed);
						}
					});
					}
				});
			};
			let data = await getUserPicks();
	}

}