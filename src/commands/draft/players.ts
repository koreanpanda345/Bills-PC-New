import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import DraftTimer, { IDraftTimer } from "../../database/schemas/DraftTimerSchema";
import { CallbackError } from "mongoose";
import { MessageEmbed } from "discord.js";

export class PlayersCommand implements ICommand {
	name = "players";
	description = "Displays all of the players in the league based on the league prefix.";
	usage = ["b!players <league prefix>"]
	category = "draft";
	invoke = async(ctx: CommandContext) => {
		let prefix = ctx.args.shift()?.toLowerCase();
		DraftTimer.findOne({prefix}, async (error: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage(`There is no league with the prefix of ${prefix}`);
			if(record?.players.length === 0) return ctx.sendMessage(`This league doesn't have any players in it yet.`);
			let players = record.players;

			let embed = new MessageEmbed();
			embed.setTitle(`League: ${record.leagueName}`);
			embed.setDescription(`League Prefix: ${record.prefix}\nTotal Players: ${players.length}`);
			for(let player of players) {
				embed.addField(`Player ${(await ctx.client.users.fetch(player.userId)).username}`, `Draft Order: ${player.order}`);
			}
			embed.setColor("RANDOM");
			ctx.sendMessage(embed);
		});
	};
}