"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftCommand = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/schemas/DraftTimerSchema"));
const discord_js_1 = require("discord.js");
const moment_1 = __importDefault(require("moment"));
class DraftCommand {
    constructor() {
        this.name = "draft";
        this.category = "draft";
        this.description = "Displays all the players picks currently by the leagues prefix";
        this.usage = ["m!draft <league prefix>"];
        this.invoke = async (ctx) => {
            let prefix = ctx.args.join(" ").trim();
            DraftTimerSchema_1.default.findOne({ prefix }, async (error, record) => {
                var _a;
                if (!record)
                    return ctx.sendMessage("There doesn't seem like there is a draft under that prefix.");
                let embed = new discord_js_1.MessageEmbed();
                embed.setTitle(`Draft: ${record.leagueName}`);
                let time = moment_1.default(record.timer);
                embed.setDescription(`League Prefix: ${record.prefix}\nTimer: ${record.pause === true ? "Timer is Off" : time.minutes() > 60 ? `${time.hours()} hours` : `${time.minutes()} minutes`}\nTotal Skips: ${record.totalSkips}\nOn pick ${(_a = record.players.find(x => x.userId === record.currentPlayer)) === null || _a === void 0 ? void 0 : _a.order} of ${record.round} / ${record.maxRounds} Rounds`);
                embed.setColor("RANDOM");
                for (let player of record.players) {
                    let desc = "";
                    for (let pokemon of player.pokemon) {
                        desc += `Round ${player.pokemon.findIndex(x => x === pokemon) + 1} - ${pokemon}\n`;
                    }
                    embed.addField(`Player ${(await ctx.client.users.fetch(player.userId)).username}`, `Pokemon:\n${desc}`);
                }
                ctx.sendMessage(embed);
            });
        };
    }
}
exports.DraftCommand = DraftCommand;
