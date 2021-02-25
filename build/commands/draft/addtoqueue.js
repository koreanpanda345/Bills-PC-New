"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddtoqueueCommand = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/schemas/DraftTimerSchema"));
const dex_1 = require("@pkmn/dex");
const discord_js_1 = require("discord.js");
const helpers_1 = require("../../utils/helpers");
class AddtoqueueCommand {
    constructor() {
        this.name = "addqueue";
        this.aliases = ["addq", "aq"];
        this.category = "draft";
        this.description = "Adds a pokemon to the queue for your draft";
        this.usage = ["b!addqueue <league prefix> <pokemon>"];
        this.invoke = async (ctx) => {
            return await new Promise((resolve) => {
                var _a;
                let prefix = (_a = ctx.args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                DraftTimerSchema_1.default.findOne({ prefix }, (err, record) => {
                    if (!record)
                        return ctx.sendMessage(`There is no league that has this prefix.`);
                    if (!record.players.find(x => x.userId === ctx.userId))
                        return ctx.sendMessage("Are not in this league. If this is a mistaken, then tell one of your league liaisons.");
                    let player = record.players.find(x => x.userId === ctx.userId);
                    let pokemon = ctx.args.join(" ");
                    pokemon = helpers_1.getNamingConvention(pokemon);
                    let check = dex_1.Dex.getSpecies(pokemon.toLowerCase().trim());
                    if (!check)
                        return ctx.sendMessage(`That is not a valid pokemon.`);
                    let found = record.pokemon.find(x => x === pokemon);
                    if (found)
                        return ctx.sendMessage(`${pokemon} has already been drafted by ${record.players.find(x => x.pokemon.includes(pokemon))}!`);
                    if (player === null || player === void 0 ? void 0 : player.queue.includes(pokemon))
                        return ctx.sendMessage("This pokemon is already in queue.");
                    player === null || player === void 0 ? void 0 : player.queue.push(pokemon);
                    let embed = new discord_js_1.MessageEmbed().setTitle(`Added to Queue for ${record.leagueName}`);
                    embed.setDescription(`To remove a pokemon from the queue, use the command \`removequeue\`.`);
                    player === null || player === void 0 ? void 0 : player.queue.forEach(x => {
                        embed.addField(`In queue(In ${player === null || player === void 0 ? void 0 : player.queue.findIndex(y => y === x)} Rounds): `, x);
                    });
                    record.save().catch(error => console.error(error));
                    ctx.sendMessage(embed);
                });
            });
        };
    }
}
exports.AddtoqueueCommand = AddtoqueueCommand;
