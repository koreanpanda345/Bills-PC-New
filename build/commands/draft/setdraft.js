"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetdraftCommand = void 0;
const discord_js_1 = require("discord.js");
const DraftTimerSchema_1 = __importDefault(require("../../database/schemas/DraftTimerSchema"));
class SetdraftCommand {
    constructor() {
        this.name = "setdraft";
        this.category = "draft";
        this.description = "Enables you to setup the draft timer feature, which will manage your draft's timer for you, and will ping, and skip players when its their turn or they been skipped.";
        this.permission = {
            user: ["MANAGE_GUILD"]
        };
        this.invoke = async (ctx) => {
            let filter = (m) => m.author.id === ctx.userId;
            let draft = {
                players: []
            };
            draft.channelId = ctx.channelId;
            draft.serverId = ctx.guildId;
            const step1 = ctx.channel.createMessageCollector(filter, { max: 1 });
            const embed = new discord_js_1.MessageEmbed();
            embed.setTitle("Draft Timer Setup");
            embed.setDescription("What is the league's name?");
            embed.setColor("RANDOM");
            ctx.sendMessage(embed).then(msg => {
                step1.on("collect", (collected) => {
                    if (collected.content.toLowerCase().includes("cancel")) {
                        step1.stop();
                        return ctx.sendMessage("Cancelling");
                    }
                    else {
                        draft.leagueName = collected.content.trim();
                        embed.setDescription(`League Name: ${draft.leagueName}` + "\nWhat would you like this league's prefix to be? This is main for during the draft.");
                        msg.edit(embed);
                        const step2 = ctx.channel.createMessageCollector(filter, { max: 1 });
                        step2.on("collect", (_collected) => {
                            if (_collected.content.toLowerCase().includes("cancel")) {
                                return ctx.sendMessage("Cancelling");
                            }
                            draft.leaguePrefix = _collected.content.trim();
                            embed.setDescription(`League Name: ${draft.leagueName}\nLeague Prefix: ${draft.leaguePrefix}` + "\nHow long is the timer? (m/h) example: For 10 minutes, then put `10m`, 1 hour put `1h`");
                            msg.edit(embed);
                            const step3 = ctx.channel.createMessageCollector(filter, { max: 1 });
                            step3.on("collect", (__collected) => {
                                if (__collected.content.toLowerCase().includes("cancel")) {
                                    return ctx.sendMessage("Cancelling");
                                }
                                let time = __collected.content.toLowerCase();
                                if (time.includes("m"))
                                    draft.timer = Number.parseInt(time.split("m")[0].trim()) * 1000 * 60;
                                else if (time.includes("h"))
                                    draft.timer = Number.parseInt(time.split("h")[0].trim()) * 1000 * 60 * 60;
                                else if (!time.includes("m") || time.includes("h")) {
                                    return ctx.sendMessage("That is not a valid time. Please use m for minutes, and h for hours.");
                                }
                                embed.setDescription(`League Name: ${draft.leagueName}\nLeague Prefix: ${draft.leaguePrefix}` + "\nPlease add the pings of the players. You can add each one individually, or all at once.\n Once you have all of your players, type in `save` to continue");
                                msg.edit(embed);
                                const step4 = ctx.channel.createMessageCollector(filter, { time: 2400000 });
                                step4.on("collect", async (___collected) => {
                                    if (___collected.content.toLowerCase().includes("cancel")) {
                                        return ctx.sendMessage("Cancelling");
                                    }
                                    if (___collected.content.toLowerCase().includes("save")) {
                                        return step4.stop();
                                    }
                                    else {
                                        ___collected.mentions.users.forEach(user => {
                                            var _a, _b, _c;
                                            (_a = draft.players) === null || _a === void 0 ? void 0 : _a.push({ userId: user.id, skips: 0, pokemon: [], order: draft.players.length + 1, leavePicks: "" });
                                            embed.addField(`Player ${user.username}`, `Draft Order: ${(_c = (_b = draft.players) === null || _b === void 0 ? void 0 : _b.find(x => x.userId === user.id)) === null || _c === void 0 ? void 0 : _c.order}`);
                                        });
                                        msg.edit(embed);
                                    }
                                });
                                step4.on("end", (_, reason) => {
                                    embed.setDescription(`League Name: ${draft.leagueName}\nLeague Prefix: ${draft.leaguePrefix}` + "\nWhat is the maximum skips that a player can have in a row? each skip will cut the timer in half for them.");
                                    msg.edit(embed);
                                    const step5 = ctx.channel.createMessageCollector(filter, { max: 1 });
                                    step5.on("collect", (____collected) => {
                                        if (____collected.content.toLowerCase().includes("cancel")) {
                                            return ctx.sendMessage("Cancelling");
                                        }
                                        else if (____collected.content.toLowerCase().includes("skip")) {
                                            draft.totalSkips = 3;
                                            ctx.sendMessage("Skipping...");
                                            step5.stop();
                                        }
                                        let skips = Number.parseInt(____collected.content.trim());
                                        if (isNaN(skips))
                                            return ctx.sendMessage("This is not a number.");
                                        draft.totalSkips = skips;
                                        embed.setDescription(`League Name: ${draft.leagueName}\nLeague Prefix: ${draft.leaguePrefix}\nTotal Skips Per Player: ${draft.totalSkips}` + "\nHow many rounds are there?");
                                        msg.edit(embed);
                                        const step6 = ctx.channel.createMessageCollector(filter, { max: 1 });
                                        step6.on("collect", (_____collected) => {
                                            if (_____collected.content.toLowerCase().includes("cancel")) {
                                                return ctx.sendMessage("Cancelling");
                                            }
                                            if (_____collected.content.toLowerCase().includes("skip")) {
                                                draft.maxRounds = 11;
                                                ctx.sendMessage("Skipping...");
                                                step6.stop();
                                            }
                                            let rounds = Number.parseInt(_____collected.content.trim());
                                            if (isNaN(rounds))
                                                return ctx.sendMessage("This is not a number");
                                            draft.maxRounds = rounds;
                                            DraftTimerSchema_1.default.findOne({ channelId: draft.channelId }, (err, record) => {
                                                var _a, _b;
                                                if (!record) {
                                                    draft.currentPlayer = (_b = (_a = draft.players) === null || _a === void 0 ? void 0 : _a.find(x => x.order === 1)) === null || _b === void 0 ? void 0 : _b.userId;
                                                    const newRecord = new DraftTimerSchema_1.default({
                                                        serverId: draft.serverId,
                                                        channelId: draft.channelId,
                                                        timer: draft.timer,
                                                        players: draft.players,
                                                        maxRounds: draft.maxRounds,
                                                        totalSkips: draft.totalSkips,
                                                        currentPlayer: draft.currentPlayer,
                                                        direction: "down",
                                                        round: 1,
                                                        prefix: draft.leaguePrefix,
                                                        leagueName: draft.leagueName,
                                                        pause: false,
                                                        stop: false,
                                                        edits: false,
                                                        sheetId: "none"
                                                    });
                                                    newRecord.save().catch(error => console.error(error));
                                                    let saveEmbed = new discord_js_1.MessageEmbed();
                                                    saveEmbed.setTitle("Saved");
                                                    saveEmbed.setDescription("You can now use the `startdraft` command in the channel that you set up in.");
                                                    saveEmbed.setColor("GREEN");
                                                    return msg.edit(saveEmbed);
                                                }
                                                let saveEmbed = new discord_js_1.MessageEmbed();
                                                saveEmbed.setTitle("Waring: a draft timer is already set up in this channel.");
                                                saveEmbed.setDescription("If you would like to remove this timer, then use the `deletedraft` command to delete it. To start the draft timer, use the command `startdraft` to start it.");
                                                saveEmbed.setColor("ORANGE");
                                                return msg.edit(saveEmbed);
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    }
                });
            });
        };
    }
}
exports.SetdraftCommand = SetdraftCommand;
