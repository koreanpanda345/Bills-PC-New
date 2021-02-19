import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import {calculate, Pokemon, Move} from "@smogon/calc";
import { MessageEmbed, Message, TextChannel, User } from "discord.js";
import {Sets, PokemonSet} from "@pkmn/sets";
import {Generations} from "@pkmn/data";
import { Dex } from "@pkmn/dex";
// b!damage
export class DamageCommand implements ICommand {
	name = "damagecalc";
	aliases = ["calc", "damage"];
	category = "Tools";
	description = "A Damage calucator command."
	invoke = async (ctx: CommandContext) => {
		let gen = 8;
		let pkmn1;
		let pkmn2;

		let embed = new MessageEmbed();
		embed.setColor('RANDOM');
		embed.setTitle('Damage Calculator Setup');
		embed.setDescription("what is the attacking pokemon's set?");

		ctx.sendMessage(embed).then(async msg => {
			await ctx.message.delete();
			let set1: PokemonSet;
			let set2: PokemonSet;
			const filter = (m: Message) => m.author.id === ctx.userId;
			const collector = (ctx.channel as TextChannel).createMessageCollector(filter, {max: 1});
			collector.on("collect", async (collected: Message) => {
				if(collected.content.toLowerCase().includes("cancel")) return ctx.sendMessage("Cancelling");
				set1 = Sets.importSet(collected.content);
				await collected.delete();
				const _collector = (ctx.channel as TextChannel).createMessageCollector(filter, {max: 1});
				embed.setDescription("What is the Defending Pokemon's set?");
				embed.addField("Attacker", Sets.exportSet(set1), true);
				msg.edit(embed).then(async _msg => {
					_collector.on("collect", async (_collected: Message) => {
						if(collected.content.toLowerCase().includes("cancel")) return ctx.sendMessage("Cancelling");
						set2 = Sets.importSet(_collected.content);
						await _collected.delete()
						let result = this.calculate(set1, set2);
						embed.setTitle('Damage Calculator Result');
						embed.setDescription(result);
						embed.addField("Defender", Sets.exportSet(set2), true);
						msg.edit(embed);
					});
				});
			});
		});
	};

	private calculate(set1: PokemonSet, set2: PokemonSet) {
		let gen1 = new Generations(Dex).get(8).species.get(set1.species) === undefined ? new Generations(Dex).get(7) : new Generations(Dex).get(8);
		let gen2 = new Generations(Dex).get(8).species.get(set2.species) === undefined ? new Generations(Dex).get(7) : new Generations(Dex).get(8);

		let attacker = new Pokemon(gen1, set1.species, {
			item: set1.item,
			nature: set1.nature,
			ability: set1.ability
		});

		if(set1.evs)
			attacker.evs = set1.evs;
		if(set1.ivs)
			attacker.ivs = set1.ivs;
		

		let defender = new Pokemon(gen2, set2.species, {
			item: set2.item,
			ability: set2.ability,
			nature: set2.nature
		});

		if(set2.evs)
			defender.evs = set2.evs;
		if(set2.ivs) 
			defender.ivs = set2.ivs;
		
		let desc = "";

		for(let i = 0; i < set1.moves.length; i++) {
			let move = new Move(gen1, set1.moves[i]);
			const result = calculate(new Generations(Dex).get(8), attacker, defender, move);
			const damage = result.damage;
			let _result: string = "";
			let percentage1: number;
			let percentage2: number;

			if(typeof damage === 'number' && damage === 0)
				_result += `${result.rawDesc.attackerName} ${result.rawDesc.moveName} vs. ${result.rawDesc.defenderName}: Does nothing. (0%)`;
			else
			{
				let arr = damage as number[];
				percentage1 = Math.floor(Math.round(arr[0] / result.defender.originalCurHP * 100));
				percentage2 = Math.floor(Math.round(arr[arr.length - 1] / result.defender.originalCurHP * 100));
				_result += `\`${result.desc()}\``;
			}	
			console.debug(result);
			desc += `${_result}\n`;
		}
		return desc;
	}
}