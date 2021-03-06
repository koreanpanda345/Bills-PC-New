import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import DraftTimer, { IDraftTimer } from "../../database/schemas/DraftTimerSchema";
import { CallbackError } from "mongoose";
import { MessageEmbed } from "discord.js";
import { Dex } from "@pkmn/dex";
import { getNamingConvention } from "../../utils/helpers";

export class RemovefromqueueCommand implements ICommand {
	name = "removequeue";

	invoke = async (ctx: CommandContext) => {
		let prefix = ctx.args.shift()?.toLowerCase();
		DraftTimer.findOne({prefix}, (err: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage(`There is no league that has this prefix.`);
			if(!record.players.find(x => x.userId === ctx.userId)) return ctx.sendMessage("Are not in this league. If this is a mistaken, then tell one of your league liaisons.");
			let player = record.players.find(x => x.userId === ctx.userId);
			let pokemon = ctx.args.join(" ");
			pokemon = getNamingConvention(pokemon);
			let check = Dex.getSpecies(pokemon.toLowerCase().trim());
			if(!check) return ctx.sendMessage(`That is not a valid pokemon.`);
			if(!player?.queue.includes(pokemon)) return ctx.sendMessage(`Doesn't seem like you have queued ${pokemon}`);

			player.queue.splice(player.queue.findIndex(x => x === pokemon), 1);
			
			let embed = new MessageEmbed().setTitle(`Removed from queue for ${record.leagueName}`);
			embed.setDescription(`To add a pokemon to the queue, use the command \`addqueue\`.`);
			player?.queue.forEach(x => {
				embed.addField(`In queue(In ${player?.queue.findIndex(y => y === x)} Rounds): `, x);
			});
			embed.setColor("RANDOM");
			ctx.sendMessage(embed);
			record.save().catch(error => console.error(error));
		});
	};
}