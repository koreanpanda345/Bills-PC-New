"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DamageCommand = void 0;
const calc_1 = require("@smogon/calc");
const discord_js_1 = require("discord.js");
const sets_1 = require("@pkmn/sets");
const data_1 = require("@pkmn/data");
const dex_1 = require("@pkmn/dex");
// b!damage
class DamageCommand {
    constructor() {
        this.name = "damagecalc";
        this.aliases = ["calc", "damage"];
        this.category = "Tools";
        this.description = "A Damage calucator command.";
        this.invoke = async (ctx) => {
            let gen = 8;
            let pkmn1;
            let pkmn2;
            let embed = new discord_js_1.MessageEmbed();
            embed.setColor('RANDOM');
            embed.setTitle('Damage Calculator Setup');
            embed.setDescription("what is the attacking pokemon's set?");
            ctx.sendMessage(embed).then(async (msg) => {
                await ctx.message.delete();
                let set1;
                let set2;
                const filter = (m) => m.author.id === ctx.userId;
                const collector = ctx.channel.createMessageCollector(filter, { max: 1 });
                collector.on("collect", async (collected) => {
                    if (collected.content.toLowerCase().includes("cancel"))
                        return ctx.sendMessage("Cancelling");
                    set1 = sets_1.Sets.importSet(collected.content);
                    await collected.delete();
                    const _collector = ctx.channel.createMessageCollector(filter, { max: 1 });
                    embed.setDescription("What is the Defending Pokemon's set?");
                    embed.addField("Attacker", sets_1.Sets.exportSet(set1), true);
                    msg.edit(embed).then(async (_msg) => {
                        _collector.on("collect", async (_collected) => {
                            if (collected.content.toLowerCase().includes("cancel"))
                                return ctx.sendMessage("Cancelling");
                            set2 = sets_1.Sets.importSet(_collected.content);
                            await _collected.delete();
                            let result = this.calculate(set1, set2);
                            embed.setTitle('Damage Calculator Result');
                            embed.setDescription(result);
                            embed.addField("Defender", sets_1.Sets.exportSet(set2), true);
                            msg.edit(embed);
                        });
                    });
                });
            });
        };
    }
    calculate(set1, set2) {
        let gen1 = new data_1.Generations(dex_1.Dex).get(8).species.get(set1.species) === undefined ? new data_1.Generations(dex_1.Dex).get(7) : new data_1.Generations(dex_1.Dex).get(8);
        let gen2 = new data_1.Generations(dex_1.Dex).get(8).species.get(set2.species) === undefined ? new data_1.Generations(dex_1.Dex).get(7) : new data_1.Generations(dex_1.Dex).get(8);
        let attacker = new calc_1.Pokemon(gen1, set1.species, {
            item: set1.item,
            nature: set1.nature,
            ability: set1.ability
        });
        if (set1.evs)
            attacker.evs = set1.evs;
        if (set1.ivs)
            attacker.ivs = set1.ivs;
        let defender = new calc_1.Pokemon(gen2, set2.species, {
            item: set2.item,
            ability: set2.ability,
            nature: set2.nature
        });
        if (set2.evs)
            defender.evs = set2.evs;
        if (set2.ivs)
            defender.ivs = set2.ivs;
        let desc = "";
        for (let i = 0; i < set1.moves.length; i++) {
            let move = new calc_1.Move(gen1, set1.moves[i]);
            const result = calc_1.calculate(new data_1.Generations(dex_1.Dex).get(8), attacker, defender, move);
            const damage = result.damage;
            let _result = "";
            let percentage1;
            let percentage2;
            if (typeof damage === 'number' && damage === 0)
                _result += `${result.rawDesc.attackerName} ${result.rawDesc.moveName} vs. ${result.rawDesc.defenderName}: Does nothing. (0%)`;
            else {
                let arr = damage;
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
exports.DamageCommand = DamageCommand;
