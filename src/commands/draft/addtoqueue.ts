import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import DraftTimer, { IDraftTimer } from "../../database/schemas/DraftTimerSchema";
import { CallbackError } from "mongoose";
import {Dex} from "@pkmn/dex";
import { MessageEmbed } from "discord.js";
import { getNamingConvention } from "../../utils/helpers";
export class AddtoqueueCommand implements ICommand {
	name="addqueue";
	aliases=["addq", "aq"];
	category = "draft";
	description = "Adds a pokemon to the queue for your draft";
	usage = ["b!addqueue <league prefix> <pokemon>"];
	
	invoke = async(ctx: CommandContext) => {
		let prefix = ctx.args.shift()?.toLowerCase();
		DraftTimer.findOne({prefix}, (err: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage(`There is no league that has this prefix.`);
			if(!record.players.find(x => x.userId === ctx.userId)) return ctx.sendMessage("Are not in this league. If this is a mistaken, then tell one of your league liaisons.");
			let player = record.players.find(x => x.userId === ctx.userId);
			let pokemon = ctx.args.join(" ");
			pokemon = getNamingConvention(pokemon);
			let check = Dex.getSpecies(pokemon.toLowerCase().trim());
			if(!check) return ctx.sendMessage(`That is not a valid pokemon.`);
			let found = record.pokemon.find(x => x === pokemon);
			if(found) return ctx.sendMessage(`${pokemon} has already been drafted by ${record.players.find(x => x.pokemon.includes(pokemon))}!`);
			if(player?.queue.includes(pokemon)) return ctx.sendMessage("This pokemon is already in queue.");

			player?.queue.push(pokemon);
			
			let embed = new MessageEmbed().setTitle(`Added to Queue for ${record.leagueName}`);
			embed.setDescription(`To remove a pokemon from the queue, use the command \`removequeue\`.`);
			player?.queue.forEach(x => {
				embed.addField(`In queue(In ${player?.queue.findIndex(y => y === x)} Rounds): `, x);
			});
			record.save().catch(error => console.error(error));
			return ctx.sendMessage(embed);
			
		});
		
	};
}