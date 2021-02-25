"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayersCommand = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/schemas/DraftTimerSchema"));
const discord_js_1 = require("discord.js");
class PlayersCommand {
    constructor() {
        this.name = "players";
        this.description = "Displays all of the players in the league based on the league prefix.";
        this.usage = ["b!players <league prefix>"];
        this.category = "draft";
        this.invoke = async (ctx) => {
            var _a;
            let prefix = (_a = ctx.args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            DraftTimerSchema_1.default.findOne({ prefix }, async (error, record) => {
                if (!record)
                    return ctx.sendMessage(`There is no league with the prefix of ${prefix}`);
                if ((record === null || record === void 0 ? void 0 : record.players.length) === 0)
                    return ctx.sendMessage(`This league doesn't have any players in it yet.`);
                let players = record.players;
                let embed = new discord_js_1.MessageEmbed();
                embed.setTitle(`League: ${record.leagueName}`);
                embed.setDescription(`League Prefix: ${record.prefix}\nTotal Players: ${players.length}`);
                for (let player of players) {
                    embed.addField(`Player ${(await ctx.client.users.fetch(player.userId)).username}`, `Draft Order: ${player.order}`);
                }
                embed.setColor("RANDOM");
                ctx.sendMessage(embed);
            });
        };
    }
}
exports.PlayersCommand = PlayersCommand;
