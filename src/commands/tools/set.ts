import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import { Sets, PokemonSet } from "@pkmn/sets";
import { Dex } from "@pkmn/dex";
import fetch from "node-fetch";
import { MessageEmbed } from "discord.js";

export class SetCommand implements ICommand {
	name = "set";
	category = "Tools";
	description = "Gets sets from smogon for A given pokemon in a given gen and format.";
	invoke = async(ctx: CommandContext) => {
		let str = ctx.args.join(" ");
		let rep = str.replace(/ +/g, "");
		let arglist = rep.split(",");
		arglist.forEach(prop => prop = prop.trim());
		let gen = arglist[0];
		let format = arglist[1];
		let name = "";
		let _set = "";
		console.log(arglist);
		if(arglist[2].toLowerCase().includes("mega")) {
			let _str = arglist[2].toLowerCase().replace("mega", "");
			let lower = _str.toLowerCase();
			name = lower.charAt(0).toUpperCase() + lower.slice(1);
			name += "-Mega";
		}
		else {
			let lower = arglist[2].toLowerCase();
			name = lower.charAt(0).toUpperCase() + lower.slice(1);
		}

		let json;

		fetch(`http://play.pokemonshowdown.com/data/sets/gen${gen}${format}.json`)
			.then(res => res.text())
			.catch(error => {return console.log(error);})
			.then(body => {
				let str = body as string;
				let js = str.replace("smogon.com/stats", "smogon");
				js = str.replace("smogon.com/dex", "smogon");
				json = JSON.parse(js);
				let embed = new MessageEmbed();
			
				let setArr: string[] = [];

				if(json.dex[`${name}`] === undefined)
				{
					embed.setTitle(`Couldn't find a set for ${name} in Gen ${gen} ${format}`);
					embed.setColor("RED");
					return ctx.sendMessage(embed);
				}
				console.debug(json.dex[`${name}`]);
				Object.keys(json.dex[`${name}`]).forEach((keys) => {
					setArr.push(keys);
				});

				for(let i = 0; i < setArr.length; i++) {
					let set = json.dex[`${name}`][setArr[i]];
					let evs = `${set.evs.hp !== undefined ? ` ${set.evs.hp} HP /` : ""}${
						set.evs.atk !== undefined ? ` ${set.evs.atk} Atk /` : ""
					}${set.evs.def !== undefined ? ` ${set.evs.def} Def /` : ""}${
						set.evs.spa !== undefined ? ` ${set.evs.spa} SpA /` : ""
					}${set.evs.spd !== undefined ? ` ${set.evs.spd} SpD /` : ""}${
						set.evs.spe !== undefined ? ` ${set.evs.spe} Spe /` : ""
					}`;
					let ivs: string = "";
					embed.setTitle(`Gen ${gen} ${format} set for ${name}`);
					if (set.ivs !== undefined)
						ivs = `${set.ivs.hp !== undefined ? ` ${set.ivs.hp} HP /` : ""}${
							set.ivs.atk !== undefined ? ` ${set.ivs.atk} Atk /` : ""
						}${set.ivs.def !== undefined ? ` ${set.ivs.def} Def /` : ""}${
							set.ivs.spa !== undefined ? ` ${set.ivs.spa} SpA /` : ""
						}${set.ivs.spd !== undefined ? ` ${set.ivs.spd} SpD /` : ""}${
							set.ivs.spe !== undefined ? ` ${set.evs.spe} Spe /` : ""
						}`;
					_set =  `\`\`\`${name} @ ${set.item}\nAbility: ${set.ability}\nEVs:${evs.substr(0, evs.length - 1)}${set.ivs === undefined ? "" : `\nIVs: ${ivs.substr(0, ivs.length - 1)}`}\n${set.nature} Nature\n- ${set.moves[0]}\n- ${set.moves[1]}\n- ${set.moves[2]}\n- ${set.moves[3]}\`\`\``;
					embed.addField(
						`${setArr[i]}`,
						_set
					);
				}

				embed.setColor("RANDOM");
				embed.setFooter("Set(s) are from smogon.com");

				ctx.sendMessage(embed);
			}).catch(error => {
				let embed = new MessageEmbed();
				embed.setTitle(`Couldn't find a set for ${name} in Gen ${gen} ${format}`);
				embed.setColor("RED");
				return ctx.sendMessage(embed);
			})
	};
}