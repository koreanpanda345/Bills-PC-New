import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import { DraftMonitor } from './../../monitors/draft';
import { MessageEmbed } from "discord.js";
import { Dex } from "@pkmn/dex";
import DraftTimer, { IDraftTimer } from "../../database/schemas/DraftTimerSchema";
import { CallbackError } from "mongoose";
import { getNamingConvention } from './../../utils/helpers';

export class EditpokemonCommand implements ICommand {
	name = "editpokemon";
	category = "draft";
	description = "Edits a players draft pick";
	
	invoke = async (ctx: CommandContext) => {
		let player = ctx.message.mentions.users.first();
		if(!player) return ctx.sendMessage("Please use the command again, but ping the user that you want to wold like to change their.");
		ctx.args.shift();

		let pokemon = ctx.args.join(" ");
		let oldPokemon = pokemon.split(",")[0];
		let newPokemon = pokemon.split(",")[1];
		
		if(!oldPokemon) return "Please try this command again, but add what pokemon you would like to change.";
		if(!newPokemon) return "Please try this command again, but add what pokemon you would like to replace the old pokemon with.";
		

		DraftTimer.findOne({channelId: ctx.channelId}, async(err: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage("Please setup up the draft using the `setdraft` command.");
			if(!record.players.find(x => x.userId === player?.id)) return ctx.sendMessage("That player is not in the draft");
			
			oldPokemon = getNamingConvention(oldPokemon);
			newPokemon = getNamingConvention(newPokemon);

			const oldCheck = Dex.getSpecies(oldPokemon);
			const newCheck = Dex.getSpecies(newPokemon);

			if(!oldCheck) return ctx.sendMessage(`${oldPokemon} is not a valid pokemon.`);
			if(!newCheck) return ctx.sendMessage(`${newPokemon} is not a valid pokemon.`);
			
			const found = record.pokemon.includes(newCheck.name);
			if(found) return ctx.sendMessage(`${newCheck.name} is already drafted by ${(await ctx.client.users.fetch(record.players.find(x => x.pokemon.includes(newCheck.name))?.userId!)).username}`);
			let _player = record.players.find(x => x.userId === player?.id);
			let index = _player?.pokemon.findIndex(x => x === oldCheck.name);
			let _pokemon = _player?.pokemon as string[];
			_pokemon[index!] = newCheck.name;
			_pokemon = record.pokemon as string[];
			index = record.pokemon.findIndex(x => x === oldCheck.name) as number;
			_pokemon[index!] = newCheck.name;  
			record.save().catch(error => console.error(error));
			
			let embed = new MessageEmbed();
			embed.setTitle(`Draft Pick has Been Changed.`);
			embed.setDescription(`Player ${(await ctx.client.users.fetch(player?.id!)).username} has selected ${newCheck.name} instead of ${oldCheck.name}`);
			embed.setImage(`https://play.pokemonshowdown.com/sprites/ani/${newCheck.name.toLowerCase()}.gif`);
			ctx.sendMessage(embed);
		});

		// let draft = ctx.client.runningMonitors.get(ctx.channelId) as DraftMonitor;
		// if(!draft) return ctx.sendMessage("There doesn't seem like there is a draft happening.");
		// let user = ctx.message.mentions.users.first();
		// if(!user) return ctx.sendMessage("Please try this command again, but ping the user that you would like to change their pick.");
		// ctx.args.shift();
		// let args = ctx.args.join(" ");
		// let oldPokemon = args.split(",")[0];
		// let newPokemon = args.split(",")[1];

		// if(!oldPokemon) return "Please try this command again, but add what pokemon you would like to change.";
		// if(!newPokemon) return "Please try this command again, but add what pokemon you would like to replace the old pokemon with.";
		
		// console.log(oldPokemon, newPokemon);
		
		// oldPokemon = draft.getPokemonName(oldPokemon);
		// newPokemon = draft.getPokemonName(newPokemon);
		// let record = await draft.getDraftData();
		// if(record === null) return ctx.sendMessage("Please use the `setdraft` command to setup the draft timer.");
		// const oldCheck = Dex.getSpecies(oldPokemon);
		// const newCheck = Dex.getSpecies(newPokemon);
		// if(!oldCheck) return ctx.sendMessage(`${oldPokemon} is not a valid pokemon`);
		// if(!oldCheck) return ctx.sendMessage(`${newPokemon} is not a valid pokemon`);
		// let player = record.players.find(x => x.userId === user?.id);
		// if(!player) return ctx.sendMessage(`That player is not in the draft`);
		// if(!player?.pokemon.includes(oldCheck.name)) return ctx.sendMessage(`Player ${(await ctx.client.users.fetch(user?.id)).username} didn't draft ${oldPokemon}`);
		// player.pokemon[player.pokemon.findIndex(x => x === oldCheck.name)] = newCheck.name;
		// record.pokemon[record.pokemon.findIndex(x => x === oldCheck.name)] = newCheck.name;
		// let embed = new MessageEmbed();
		// embed.setTitle(`Draft Pick has Been Changed.`);
		// embed.setDescription(`Player ${(await ctx.client.users.fetch(user?.id)).username} has selected ${newCheck.name} instead of ${oldCheck.name}`);
		// embed.setImage(`https://play.pokemonshowdown.com/sprites/ani/${newCheck.name.toLowerCase()}.gif`);
		// ctx.sendMessage(embed);
		// record.save().catch(error => console.error(error));
	}
}