import { ICommand } from "../../types/commands";
import { PermissionString, MessageEmbed } from "discord.js";
import { CommandContext } from "../../types/commandContext";
import DraftTimer from "../../database/schemas/DraftTimerSchema";
import { CallbackError } from "mongoose";
import { IDraftTimer } from './../../database/schemas/DraftTimerSchema';
import { Dex } from "@pkmn/dex";
export class AddpokemonCommand implements ICommand {
	name = "addpokemon";
	category = "draft";
	permission: {user: PermissionString[]} = {
		user: ["MANAGE_GUILD"]
	};

	invoke = async (ctx: CommandContext) => {
		let player = ctx.message.mentions.users.first();
		if(!player) return ctx.sendMessage(`Please try this command again, but provide what player you want to add the pokemon to.`);
		ctx.args.shift();
		let pokemon = ctx.args.join(" ");
		let text = "";
		if(pokemon.includes("-text"))
		{
			text = pokemon.split("-text")[1].trim();
			pokemon = pokemon.split("-text")[0].trim();
		}

		DraftTimer.findOne({channelId: ctx.channelId}, async (err: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage("Please setup the draft by using the `setdraft` command.");
			if(!record.players.find(x => x.userId === player?.id)) return ctx.sendMessage(`Player ${player?.username} is not in the draft.`);
			const check = Dex.getSpecies(pokemon.toLowerCase());
			if(!check) return ("That is not a valid pokemon");
			const found = record.pokemon.includes(pokemon);
			if(found) return ctx.sendMessage(`${pokemon} is already drafted by ${(await ctx.client.users.fetch(record.players.find(x => x.pokemon.includes(pokemon))?.userId!)).username}`);

			record.players.find(x => x.userId === player?.id)?.pokemon.push(pokemon);
			record.pokemon.push(pokemon);

			let embed = new MessageEmbed().setDescription(`Staff Member <@${ctx.userId}> has predrafted **${pokemon.charAt(0).toUpperCase() + pokemon.slice(1)}** for <@${player?.id}>${text !== "" ? `\n${text}`: ""}`);
			embed.setColor("RANDOM");
			embed.setImage(`https://play.pokemonshowdown.com/sprites/ani/${check.name.toLowerCase()}.gif`)
			ctx.sendMessage(embed);
			if(record.players.find(x => x.userId === player?.id)?.skips! > 0)  {
				let _player = record.players.find(x => x.userId === player?.id);
				_player?.skips !== undefined ? _player.skips-- : 0;
			}
			
			record.save().catch(error => console.error(error));
		});
	};
}