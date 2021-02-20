import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import DraftTimer, { IDraftTimer } from "../../database/schemas/DraftTimerSchema";
import { CallbackError } from "mongoose";
import { Dex } from "@pkmn/dex";
import { MessageEmbed } from "discord.js";

export class QueueCommand implements ICommand {
	name = "queue";
	aliases = ["q"];
	category = "draft";
	usage = ["b!q <league prefix>"];
	description = "Displays your queued pokemon for a certain draft."
	invoke = async (ctx: CommandContext) => {
		let prefix = ctx.args.shift()?.toLowerCase();
		DraftTimer.findOne({prefix}, (err: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage(`There is no league that has this prefix.`);
			if(!record.players.find(x => x.userId === ctx.userId)) return ctx.sendMessage("Are not in this league. If this is a mistaken, then tell one of your league liaisons.");
			let player = record.players.find(x => x.userId === ctx.userId);
			let embed = new MessageEmbed().setTitle(`Your current queue for ${record.leagueName}`);
			embed.setDescription(`To add a pokemon to the queue, use the command \`addqueue\`.`);
			player?.queue.forEach(x => {
				embed.addField(`In queue(In ${player?.queue.findIndex(y => y === x)} Rounds): `, x);
			});
			if(player?.queue.length === 0) embed.addField(`Doesn't see like you have any pokemon queued yet.`, "\u200b");
			embed.setColor("RANDOM");
			return ctx.sendMessage(embed);
			
		});
	}
}