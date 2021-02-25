"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueCommand = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/schemas/DraftTimerSchema"));
const discord_js_1 = require("discord.js");
class QueueCommand {
    constructor() {
        this.name = "queue";
        this.aliases = ["q"];
        this.category = "draft";
        this.usage = ["b!q <league prefix>"];
        this.description = "Displays your queued pokemon for a certain draft.";
        this.invoke = async (ctx) => {
            var _a;
            let prefix = (_a = ctx.args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            DraftTimerSchema_1.default.findOne({ prefix }, (err, record) => {
                if (!record)
                    return ctx.sendMessage(`There is no league that has this prefix.`);
                if (!record.players.find(x => x.userId === ctx.userId))
                    return ctx.sendMessage("Are not in this league. If this is a mistaken, then tell one of your league liaisons.");
                let player = record.players.find(x => x.userId === ctx.userId);
                let embed = new discord_js_1.MessageEmbed().setTitle(`Your current queue for ${record.leagueName}`);
                embed.setDescription(`To add a pokemon to the queue, use the command \`addqueue\`.`);
                player === null || player === void 0 ? void 0 : player.queue.forEach(x => {
                    embed.addField(`In queue(In ${player === null || player === void 0 ? void 0 : player.queue.findIndex(y => y === x)} Rounds): `, x);
                });
                if ((player === null || player === void 0 ? void 0 : player.queue.length) === 0)
                    embed.addField(`Doesn't see like you have any pokemon queued yet.`, "\u200b");
                embed.setColor("RANDOM");
                return ctx.sendMessage(embed);
            });
        };
    }
}
exports.QueueCommand = QueueCommand;
