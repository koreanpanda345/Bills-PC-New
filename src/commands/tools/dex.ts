import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import { MessageEmbed } from "discord.js";
import {} from "@pkmn/data";
import {Dex} from "@pkmn/dex";
import fetch from "node-fetch";
import { TypeColors } from "../../utils/typeColors";
import { getNamingConvention } from "../../utils/helpers";
export class DexCommand implements ICommand {
	name = "dex";
	aliases = ["pokemon"];
	category = "Tools";
	description = "Gets information about a pokemon, item, move, or ability from smogon.";
	usage = ["b!dex lopunny", "b!dex item lopunnite", "b!dex ability scrappy", "b!dex move close combat"];
	invoke = async (ctx: CommandContext) => {
		let option = ctx.args.shift()?.toLowerCase();
		let embed = new MessageEmbed();
		switch(option)
		{
			case "item":
				const item = Dex.getItem(ctx.args.join(" "));
				if(!item) {
					embed.setTitle(`Error: Couldn't find item called ${ctx.args.join(" ")}`);
					embed.setColor('RED');
					embed.setDescription('Please make sure you spelt it correctly.');
					return ctx.sendMessage(embed);
				}
				embed.setTitle(`Data on Item #${item.num} - ${item.name}`);
				embed.setDescription(`Description: ${item.desc}\n${(item.megaEvolves ? `Mega Evolves: ${item.megaEvolves}\n` : "")}`);
				embed.setColor('RANDOM');
				fetch(`https://pokeapi.co/api/v2/item/${item.num}`)
					.then(res => res.json())
					.then(json => 	
						{
							embed.setImage(json.sprites.default);
							ctx.sendMessage(embed);
						});
				break;
			case "move":
				const move = Dex.getMove(ctx.args.join(" "));
				if(!move) {
					embed.setTitle(`Error: Couldn't find move called ${ctx.args.join(" ")}`);
					embed.setColor('RED');
					embed.setDescription('Please make sure you spelt it correctly.');
					return ctx.sendMessage(embed);
				}
				embed.setTitle(`Data on Move #${move.num} - ${move.name}`);
				embed.setColor(TypeColors[move.type.toLowerCase()][1]);
				embed.setDescription(
					`Description: ${move.desc}\n\nShort Description: ${move.shortDesc}`
				);
				embed.addField(
					"Accuracy: ",
					`${move.accuracy === true ? "---" : move.accuracy}`,
					true
				);
				embed.addField(
					`${move.category} | Base Power: `,
					`${move.basePower === 0 ? "---" : move.basePower}`,
					true
				);
				embed.addField("PP:", `${move.pp} PP`, true);
				embed.addField("Priority", `${move.priority}`, true);
				embed.addField("Type", `${move.type}`, true);
				embed.addField(
					"Target",
					`${
						move.target === "normal" ? "Adjacent Pokemon" : move.target
					}`,
					true
				);
				ctx.sendMessage(embed);
				break;
			case "ability":
				const ability = Dex.getAbility(ctx.args.join(" "));
				if(!ability) {
					embed.setTitle(`Error: Couldn't find ability called ${ctx.args.join(" ")}`);
					embed.setColor('RED');
					embed.setDescription('Please make sure you spelt it correctly.');
					return ctx.sendMessage(embed);
				}
				embed.setTitle(`Info on ${ability.name}`);
				embed.setDescription(
					`Description: ${ability.desc}\n\nShort Description: ${ability.shortDesc}`
				);
				embed.setColor("RANDOM");
				ctx.sendMessage(embed);
				break;
			default:
				let search = option + " " + ctx.args.join(" ").toLowerCase();
				console.log(search);
				search = getNamingConvention(search);

				let poke = Dex.getSpecies(search);

				let abilities: string = "";
			let ab = Object.values(poke.abilities);
			if(ab.length === 1 && ab[0] === '') {
				embed.setTitle(`Error: Couldn't find pokemon called ${search}`);
				embed.setColor('RED');
				embed.setDescription('Please make sure you spelt it correctly.');
				return ctx.sendMessage(embed);
			}
			console.log(ab);
			for (let i = 0; i < ab.length; i++) 
			{
				abilities += `${ab[i]}\n`;
			}
		
			embed.setTitle(`Info On ${poke.name}`);
			embed.setColor(TypeColors[poke.types[0].toLowerCase()][1]);
			embed.setDescription(`
				Tier: ${
	poke.tier === undefined ? "Illegal" : poke.tier
} | Types: ${
	poke.types.length === 2
		? `${poke.types[0]} ${poke.types[1]}`
		: `${poke.types[0]}`
}
				\nAbilities: \n${abilities.replace(
		"undefined",
		""
	)}\n[Can find more about ${
	poke.name
}](https://www.smogon.com/dex/ss/pokemon/${search})`);
			embed.addField(
				"Base Stats",
				`**__HP__: ${poke.baseStats.hp}
				__ATK__: ${poke.baseStats.atk}
				__DEF__: ${poke.baseStats.def}
				__SPA__: ${poke.baseStats.spa}
				__SPD__: ${poke.baseStats.spd}
				__SPE__: ${poke.baseStats.spe}**`,
				true
			);
			embed.addField(
				`Height: ${poke.heightm}m\nWeight: ${poke.weightkg}kg`,
				"\u200b",
				true
			);
			embed.addField("\u200b", "\u200b");
			if (poke.prevo)
				embed.addField("Evolves From", poke.prevo, true);
			if (poke.evos![0] !== undefined) embed.addField("Evolves Into", poke.evos![0], true);
			
			embed.setImage(`https://play.pokemonshowdown.com/sprites/ani/${poke.name.toLowerCase()}.gif`);
			if (poke.otherFormes)
				embed.addField(
					"Other Forms",
					poke.otherFormes.toString().replace(/,+/g, ", "),
					true
				);
			ctx.sendMessage(embed);
				break;
		}
	};
	random(max: number) 
	{
		return Math.floor(Math.random() * max);
	} 
}