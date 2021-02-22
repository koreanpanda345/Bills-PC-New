import { ICommand } from "../../types/commands";
import { CommandContext } from './../../types/commandContext';
import DraftTimer, { IDraftTimer } from "../../database/schemas/DraftTimerSchema";
import { CallbackError } from "mongoose";
import { MessageEmbed } from "discord.js";
import moment from "moment";

export class DraftCommand implements ICommand {
	name = "draft";
	category = "draft";
	description = "Displays all the players picks currently by the leagues prefix";
	usage = ["m!draft <league prefix>"]
	invoke = async(ctx: CommandContext) => {
		let prefix = ctx.args.join(" ").trim();
		DraftTimer.findOne({prefix}, async (error: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage("There doesn't seem like there is a draft under that prefix.");
			let embed = new MessageEmbed();
			embed.setTitle(`Draft: ${record.leagueName}`);
			let time = moment(record.timer);
			embed.setDescription(`League Prefix: ${record.prefix}\nTimer: ${record.pause === true ? "Timer is Off" : time.minutes() > 60 ? `${time.hours()} hours` : `${time.minutes()} minutes`}\nTotal Skips: ${record.totalSkips}\nOn pick ${record.players.find(x => x.userId === record.currentPlayer)?.order} of ${record.round} / ${record.maxRounds} Rounds`);
			embed.setColor("RANDOM");
			for(let player of record.players) {
				let desc = "";
				for(let pokemon of player.pokemon) {
					desc += `Round ${player.pokemon.findIndex(x => x === pokemon) + 1} - ${pokemon}\n`;
				}
				embed.addField(`Player ${(await ctx.client.users.fetch(player.userId)).username}`, `Pokemon:\n${desc}`);
			}

			ctx.sendMessage(embed);
		})
	};
}