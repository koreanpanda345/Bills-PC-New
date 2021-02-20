import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import DraftTimer from "../../database/schemas/DraftTimerSchema";
import {IDraftTimer} from "../../database/schemas/DraftTimerSchema";
import {Dex} from "@pkmn/dex";
import { TextChannel, Message } from "discord.js";
import moment from "moment";
export class StartdraftCommand implements ICommand {
	name = "startdraft";
	category = "draft";
	invoke = async (ctx: CommandContext) => {
		//@ts-ignore
		DraftTimer.findOne({serverId: ctx.guildId, channelId: ctx.channelId}, async (err, record: IDraftTimer) => {
			if(record === null) return ctx.sendMessage("Please use the `setdraft` command to setup the draft timer.");
			ctx.sendMessage(`Timer has been set`);
			console.log(record.round <= record.maxRounds);
			await this.getUserPick(record, ctx);

		});
	};

	private async getUserPick(record: IDraftTimer, ctx: CommandContext) {
		(await ctx.client.users.fetch(record.currentPlayer)).createDM().then(dm => {
			let filter = (m: Message) => m.author.id === record.currentPlayer;
			let collector = dm.createMessageCollector(filter, {time: record.timer});
			let player = record.players.find(x => x.userId === record.currentPlayer);
			dm.send(`Your Pick in ${ctx.guild?.name}`);
			let time = moment(record.timer);
			ctx.sendMessage(`<@${record.currentPlayer}> is on the Clock! (Timer is ${time.minutes() > 60 ? `${time.hours()} hours` : `${time.minutes()} minutes`})`);
			collector.on("collect", async (collected: Message) => {
				let pokemon = collected.content.trim();
				let check = Dex.getSpecies(pokemon.toLowerCase().trim());
				if(!check.exists) return dm.send("That is not a pokemon");
				let found = record.pokemon.find(x => x.toLowerCase() === pokemon.toLowerCase());
				if(found) return dm.send("That pokemon has already been picked.");
				player?.pokemon.push(pokemon);
				record.pokemon?.push(pokemon);
				((await ctx.client.channels.fetch(record.channelId)) as TextChannel).send(`<@${record.currentPlayer}> has drafted ${pokemon}!`);
				collector.stop('picked');
			});

			collector.on("end", async (collected, reason) => {
				player = record.players.find(x => x.userId === record.currentPlayer);
				if(reason === 'time'){
					player?.skips !== undefined ? player.skips++ : 0;
					dm.send("You were skipped.");
					ctx.sendMessage(`<@${record.currentPlayer}> was skipped`);
				}
				if(record.direction === "down" && player?.order === record.players.length + 1) {
					record.direction = "up";
					record.round++;
				}
				else if(record.direction === "down" && player?.order !== record.players.length + 1) {
					record.currentPlayer = record.players.find(x => x.order === (player?.order! + 1) - 1)?.userId!;
				}
				else if(record.direction === "up" && player?.order === 0) {
					record.direction = "down";
					record.round++;
				}
				else if(record.direction === "up" && player?.order !== 0) {
					record.currentPlayer = record.players.find(x => x.order === (player?.order! - 1) - 1 )?.userId!; 
				}

				record.save().catch(error => console.error(error));
				if(record.round <= record.maxRounds) await this.getUserPick(record, ctx);
			});
		});


	}
}