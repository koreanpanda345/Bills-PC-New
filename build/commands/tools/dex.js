"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexCommand = void 0;
const discord_js_1 = require("discord.js");
const dex_1 = require("@pkmn/dex");
const node_fetch_1 = __importDefault(require("node-fetch"));
const typeColors_1 = require("../../utils/typeColors");
const helpers_1 = require("../../utils/helpers");
class DexCommand {
    constructor() {
        this.name = "dex";
        this.aliases = ["pokemon"];
        this.category = "Tools";
        this.description = "Gets information about a pokemon, item, move, or ability from smogon.";
        this.usage = ["b!dex lopunny", "b!dex item lopunnite", "b!dex ability scrappy", "b!dex move close combat"];
        this.invoke = async (ctx) => {
            var _a;
            let option = (_a = ctx.args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            let embed = new discord_js_1.MessageEmbed();
            switch (option) {
                case "item":
                    const item = dex_1.Dex.getItem(ctx.args.join(" "));
                    if (!item) {
                        embed.setTitle(`Error: Couldn't find item called ${ctx.args.join(" ")}`);
                        embed.setColor('RED');
                        embed.setDescription('Please make sure you spelt it correctly.');
                        return ctx.sendMessage(embed);
                    }
                    embed.setTitle(`Data on Item #${item.num} - ${item.name}`);
                    embed.setDescription(`Description: ${item.desc}\n${(item.megaEvolves ? `Mega Evolves: ${item.megaEvolves}\n` : "")}`);
                    embed.setColor('RANDOM');
                    node_fetch_1.default(`https://pokeapi.co/api/v2/item/${item.num}`)
                        .then(res => res.json())
                        .then(json => {
                        embed.setImage(json.sprites.default);
                        ctx.sendMessage(embed);
                    });
                    break;
                case "move":
                    const move = dex_1.Dex.getMove(ctx.args.join(" "));
                    if (!move) {
                        embed.setTitle(`Error: Couldn't find move called ${ctx.args.join(" ")}`);
                        embed.setColor('RED');
                        embed.setDescription('Please make sure you spelt it correctly.');
                        return ctx.sendMessage(embed);
                    }
                    embed.setTitle(`Data on Move #${move.num} - ${move.name}`);
                    embed.setColor(typeColors_1.TypeColors[move.type.toLowerCase()][1]);
                    embed.setDescription(`Description: ${move.desc}\n\nShort Description: ${move.shortDesc}`);
                    embed.addField("Accuracy: ", `${move.accuracy === true ? "---" : move.accuracy}`, true);
                    embed.addField(`${move.category} | Base Power: `, `${move.basePower === 0 ? "---" : move.basePower}`, true);
                    embed.addField("PP:", `${move.pp} PP`, true);
                    embed.addField("Priority", `${move.priority}`, true);
                    embed.addField("Type", `${move.type}`, true);
                    embed.addField("Target", `${move.target === "normal" ? "Adjacent Pokemon" : move.target}`, true);
                    ctx.sendMessage(embed);
                    break;
                case "ability":
                    const ability = dex_1.Dex.getAbility(ctx.args.join(" "));
                    if (!ability) {
                        embed.setTitle(`Error: Couldn't find ability called ${ctx.args.join(" ")}`);
                        embed.setColor('RED');
                        embed.setDescription('Please make sure you spelt it correctly.');
                        return ctx.sendMessage(embed);
                    }
                    embed.setTitle(`Info on ${ability.name}`);
                    embed.setDescription(`Description: ${ability.desc}\n\nShort Description: ${ability.shortDesc}`);
                    embed.setColor("RANDOM");
                    ctx.sendMessage(embed);
                    break;
                default:
                    let search = option + " " + ctx.args.join(" ").toLowerCase();
                    console.log(search);
                    search = helpers_1.getNamingConvention(search);
                    let poke = dex_1.Dex.getSpecies(search);
                    let abilities = "";
                    let ab = Object.values(poke.abilities);
                    if (ab.length === 1 && ab[0] === '') {
                        embed.setTitle(`Error: Couldn't find pokemon called ${search}`);
                        embed.setColor('RED');
                        embed.setDescription('Please make sure you spelt it correctly.');
                        return ctx.sendMessage(embed);
                    }
                    console.log(ab);
                    for (let i = 0; i < ab.length; i++) {
                        abilities += `${ab[i]}\n`;
                    }
                    embed.setTitle(`Info On ${poke.name}`);
                    embed.setColor(typeColors_1.TypeColors[poke.types[0].toLowerCase()][1]);
                    embed.setDescription(`
				Tier: ${poke.tier === undefined ? "Illegal" : poke.tier} | Types: ${poke.types.length === 2
                        ? `${poke.types[0]} ${poke.types[1]}`
                        : `${poke.types[0]}`}
				\nAbilities: \n${abilities.replace("undefined", "")}\n[Can find more about ${poke.name}](https://www.smogon.com/dex/ss/pokemon/${search})`);
                    embed.addField("Base Stats", `**__HP__: ${poke.baseStats.hp}
				__ATK__: ${poke.baseStats.atk}
				__DEF__: ${poke.baseStats.def}
				__SPA__: ${poke.baseStats.spa}
				__SPD__: ${poke.baseStats.spd}
				__SPE__: ${poke.baseStats.spe}**`, true);
                    embed.addField(`Height: ${poke.heightm}m\nWeight: ${poke.weightkg}kg`, "\u200b", true);
                    embed.addField("\u200b", "\u200b");
                    if (poke.prevo)
                        embed.addField("Evolves From", poke.prevo, true);
                    if (poke.evos[0] !== undefined)
                        embed.addField("Evolves Into", poke.evos[0], true);
                    embed.setImage(`https://play.pokemonshowdown.com/sprites/ani/${poke.name.toLowerCase()}.gif`);
                    if (poke.otherFormes)
                        embed.addField("Other Forms", poke.otherFormes.toString().replace(/,+/g, ", "), true);
                    ctx.sendMessage(embed);
                    break;
            }
        };
    }
    random(max) {
        return Math.floor(Math.random() * max);
    }
}
exports.DexCommand = DexCommand;
