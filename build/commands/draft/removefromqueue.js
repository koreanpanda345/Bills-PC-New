"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemovefromqueueCommand = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/schemas/DraftTimerSchema"));
const discord_js_1 = require("discord.js");
const dex_1 = require("@pkmn/dex");
const helpers_1 = require("../../utils/helpers");
class RemovefromqueueCommand {
    constructor() {
        this.name = "removequeue";
        this.invoke = async (ctx) => {
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
                if (!(player === null || player === void 0 ? void 0 : player.queue.includes(pokemon)))
                    return ctx.sendMessage(`Doesn't seem like you have queued ${pokemon}`);
                player.queue.splice(player.queue.findIndex(x => x === pokemon), 1);
                let embed = new discord_js_1.MessageEmbed().setTitle(`Removed from queue for ${record.leagueName}`);
                embed.setDescription(`To add a pokemon to the queue, use the command \`addqueue\`.`);
                player === null || player === void 0 ? void 0 : player.queue.forEach(x => {
                    embed.addField(`In queue(In ${player === null || player === void 0 ? void 0 : player.queue.findIndex(y => y === x)} Rounds): `, x);
                });
                embed.setColor("RANDOM");
                ctx.sendMessage(embed);
                record.save().catch(error => console.error(error));
            });
        };
    }
}
exports.RemovefromqueueCommand = RemovefromqueueCommand;
