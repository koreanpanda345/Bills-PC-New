"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftMonitor = void 0;
const DraftTimerSchema_1 = __importDefault(require("../database/schemas/DraftTimerSchema"));
const dex_1 = require("@pkmn/dex");
const discord_js_1 = require("discord.js");
const moment_1 = __importDefault(require("moment"));
const helpers_1 = require("./../utils/helpers");
const GoogleSheets_1 = require("../modules/GoogleSheets");
// import { GoogleSheets, SpreadSheetData } from "../modules/GoogleSheets";
class DraftMonitor {
    constructor(ctx) {
        this.name = "draft";
        this.pause = async () => {
            let record = await this.getDraftData();
            if (record === null)
                return this._ctx.sendMessage("Please use the `setdraft` command to setup the draft timer.");
            record.pause = true;
            record.save().catch(error => console.error(error));
        };
        this.resume = async () => {
            let record = await this.getDraftData();
            if (record === null)
                return this._ctx.sendMessage("Please use the `setdraft` command to setup the draft timer.");
            record.pause = false;
            record.save().catch(error => console.error(error));
        };
        this.stop = async () => {
            let record = await this.getDraftData();
            if (record === null)
                return this._ctx.sendMessage("Please us the `setdraft` command to setup the draft timer.");
            record.stop = true;
            record.save().catch(error => console.error());
        };
        this.getDraftData = async () => {
            let ctx = this._ctx;
            let result = await new Promise((resolve) => {
                DraftTimerSchema_1.default.findOne({ serverId: ctx.guildId, channelId: ctx.channelId }, async (err, record) => {
                    if (record === null)
                        return ctx.sendMessage("Please use the `setdraft` command to setup the draft timer.");
                    // console.debug(record);
                    return resolve(record);
                });
            });
            // @ts-ignore
            return result;
        };
        this.getPokemonName = (name) => {
            return helpers_1.getNamingConvention(name);
        };
        this.invoke = async () => {
            let ctx = this._ctx;
            ctx.sendMessage(`Draft Timer has been turned on!`);
            let record = await this.getDraftData();
            //@ts-ignore
            let getUserPicks = async () => {
                var _a, _b, _c;
                setInterval(async () => {
                    record = await this.getDraftData();
                }, 1000);
                if (record.stop === true) {
                    record.stop = false;
                    record.save().catch(error => console.error(error));
                    ctx.client.runningMonitors.delete(ctx.channelId);
                    ctx.client.executingMonitors.delete(ctx.channelId);
                    ctx.sendMessage("Stopping draft. you can pick off where you last left off on using the `startdraft` command.");
                    return;
                }
                let who = (((_a = record.players.find(x => x.userId === record.currentPlayer)) === null || _a === void 0 ? void 0 : _a.leavePicks) !== "" && ((_b = record.players.find(x => x.userId === record.currentPlayer)) === null || _b === void 0 ? void 0 : _b.leavePicks) !== undefined) ? (_c = record.players.find(x => x.userId === record.currentPlayer)) === null || _c === void 0 ? void 0 : _c.leavePicks : record.currentPlayer;
                (await ctx.client.users.fetch(who)).createDM().then(async (dm) => {
                    var _a, _b, _c, _d, _e;
                    record = await this.getDraftData();
                    let filter = (m) => m.author.id === who;
                    let player = record.players.find(x => x.userId === record.currentPlayer);
                    let collector = dm.createMessageCollector(filter, { time: record.pause ? 604800000 : (player === null || player === void 0 ? void 0 : player.skips) === 0 ? record.timer : Math.floor(Math.round(record.timer / (2 * (player === null || player === void 0 ? void 0 : player.skips)))) });
                    if ((player === null || player === void 0 ? void 0 : player.queue.length) !== 0) {
                        let pokemon = player === null || player === void 0 ? void 0 : player.queue.shift();
                        pokemon = this.getPokemonName(pokemon);
                        let check = dex_1.Dex.getSpecies(pokemon.toLowerCase().trim());
                        let draftEmbed = new discord_js_1.MessageEmbed()
                            .setDescription(`<@${record.currentPlayer}> Has Drafted **${check.name}**`)
                            .setImage(`https://play.pokemonshowdown.com/sprites/ani/${check.name.toLowerCase()}.gif`)
                            .setColor("RANDOM");
                        ctx.sendMessage(draftEmbed);
                        if (record.direction === "down") {
                            console.log(player === null || player === void 0 ? void 0 : player.order);
                            console.log(record.players.length);
                            console.log((player === null || player === void 0 ? void 0 : player.order) === record.players.length);
                            if ((player === null || player === void 0 ? void 0 : player.order) === record.players.length) {
                                console.log("something");
                                record.direction = "up";
                                record.round++;
                            }
                            else
                                record.currentPlayer = (_a = record.players.find(x => x.order === (player === null || player === void 0 ? void 0 : player.order) + 1)) === null || _a === void 0 ? void 0 : _a.userId;
                        }
                        else if (record.direction === "up") {
                            if ((player === null || player === void 0 ? void 0 : player.order) === 1) {
                                record.direction = "down";
                                record.round++;
                            }
                            else
                                record.currentPlayer = (_b = record.players.find(x => x.order === (player === null || player === void 0 ? void 0 : player.order) - 1)) === null || _b === void 0 ? void 0 : _b.userId;
                            record.save().catch(error => console.error(error));
                            return await getUserPicks();
                        }
                    }
                    else if (player.skips >= record.totalSkips) {
                        if (record.direction === "down") {
                            if ((player === null || player === void 0 ? void 0 : player.order) === record.players.length) {
                                record.direction = "up";
                                record.round++;
                            }
                            else
                                record.currentPlayer = (_c = record.players.find(x => x.order === (player === null || player === void 0 ? void 0 : player.order) + 1)) === null || _c === void 0 ? void 0 : _c.userId;
                        }
                        else if (record.direction === "up") {
                            if ((player === null || player === void 0 ? void 0 : player.order) === 1) {
                                record.direction = "down";
                                record.round++;
                            }
                            else
                                record.currentPlayer = (_d = record.players.find(x => x.order === (player === null || player === void 0 ? void 0 : player.order) - 1)) === null || _d === void 0 ? void 0 : _d.userId;
                        }
                        let skipEmbed = new discord_js_1.MessageEmbed()
                            .setDescription(`<@${record.currentPlayer}> is on auto skip.`)
                            .setColor("RED");
                        ctx.sendMessage(skipEmbed);
                        record.save().catch(error => console.error(error));
                        if (record.round <= record.maxRounds)
                            return await getUserPicks();
                        else if (record.round >= record.maxRounds) {
                            let finishedEmbed = new discord_js_1.MessageEmbed();
                            finishedEmbed.setTitle('Draft has concluded');
                            finishedEmbed.setDescription(`Here is the Drafts that each player has made.`);
                            finishedEmbed.setColor("RANDOM");
                            for (let _player of record.players) {
                                let desc = "";
                                _player.pokemon.forEach(x => desc += `Round ${_player.pokemon.findIndex(y => y === x) + 1} - ${x}\n`);
                                finishedEmbed.addField(`Player ${(await ctx.client.users.fetch(_player.userId)).username}`, desc, true);
                            }
                            ctx.client.executingMonitors.delete(ctx.channelId);
                            ctx.client.runningMonitors.delete(ctx.channelId);
                            return ctx.sendMessage(finishedEmbed);
                        }
                    }
                    else {
                        let time = moment_1.default(player.skips === 0 ? record.timer : Math.floor(Math.round(record.timer / (2 * player.skips))));
                        let pickEmbed = new discord_js_1.MessageEmbed()
                            .setTitle(`Its your pick in ${(_e = ctx.guild) === null || _e === void 0 ? void 0 : _e.name}`)
                            .setDescription(`Your league's prefix is ${record.prefix}. To draft a pokemon type in \`${record.prefix} <pokemon name>\` example: \`${record.prefix} lopunny\`\nYou can apply text to the selection by adding \`-text\` at the end of the pokemon you want, then say whatever you want to say.`)
                            .setColor("RANDOM")
                            .addField("Timer:", `${record.pause ? "Timer Is off" : (time.minutes() > 60 ? `${time.hours()} hours` : `${time.minutes()} minutes`)}`)
                            .setFooter(`We are on pick ${player === null || player === void 0 ? void 0 : player.order} of round ${record.round} / ${record.maxRounds}`);
                        dm.send(pickEmbed);
                        let serverEmbed = new discord_js_1.MessageEmbed()
                            .setDescription(`<@${record.currentPlayer}> is on the Clock!\nWe are on pick ${player === null || player === void 0 ? void 0 : player.order} of round ${record.round} / ${record.maxRounds}`)
                            .addField("Timer:", `${record.pause ? "Timer Is off" : (time.minutes() > 60 ? `${time.hours()} hours` : `${time.minutes()} minutes`)}`)
                            .setColor("RANDOM");
                        ctx.sendMessage(serverEmbed);
                        collector.on("collect", async (collected) => {
                            var _a, _b;
                            if ((player === null || player === void 0 ? void 0 : player.skips) === record.totalSkips) {
                                collector.stop("skipped");
                                return;
                            }
                            let args = collected.content.trim().split(/ +/g);
                            let prefix = (_a = args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                            let pokemon = args.join(" ");
                            let text = "";
                            if (pokemon.includes("-text")) {
                                text = pokemon.split("-text")[1].trim();
                                pokemon = pokemon.split("-text")[0].trim();
                            }
                            pokemon = this.getPokemonName(pokemon);
                            if ((prefix === null || prefix === void 0 ? void 0 : prefix.length) < 1 || prefix !== record.prefix)
                                return dm.send("Please enter your league's prefix, then your pokemon. example `" + record.prefix + " lopunny`");
                            let check = dex_1.Dex.getSpecies(pokemon.toLowerCase().trim());
                            if (!check.exists)
                                return dm.send("That is not a pokemon");
                            let found = record.pokemon.find(x => x.toLowerCase() === pokemon.toLowerCase());
                            if (found) {
                                let owner = record.players.find(x => x.pokemon.includes(found));
                                return dm.send(`${check.name} has already been drafted by ${(await ctx.client.users.fetch(owner === null || owner === void 0 ? void 0 : owner.userId)).username}`);
                            }
                            player = record.players.find(x => x.userId === record.currentPlayer);
                            player === null || player === void 0 ? void 0 : player.pokemon.push(check.name);
                            (_b = record.pokemon) === null || _b === void 0 ? void 0 : _b.push(check.name);
                            console.debug(record);
                            record.save().catch(error => console.error(error));
                            record = await this.getDraftData();
                            console.debug(record);
                            dm.send(`You draft ${check.name}`);
                            let draftEmbed = new discord_js_1.MessageEmbed();
                            draftEmbed.setDescription(`<@${record.currentPlayer}> Has Drafted **${check.name}**${text !== "" ? `\n${text}` : ""}`);
                            let img = check.name.startsWith("Tapu") ? check.name.replace(" ", "") : check.name;
                            draftEmbed.setImage(`https://play.pokemonshowdown.com/sprites/ani/${img.toLowerCase()}.gif`);
                            draftEmbed.setColor("RANDOM");
                            console.log(record.sheetId);
                            if (record.sheetId !== undefined && record.sheetId !== "none") {
                                const google = new GoogleSheets_1.GoogleSheets();
                                await google.add({ spreadsheetId: record.sheetId, data: [[(await (await ctx.client.users.fetch(player === null || player === void 0 ? void 0 : player.userId)).username), check.name]] });
                            }
                            ctx.sendMessage(draftEmbed);
                            collector.stop('picked');
                        });
                        collector.on("end", async (collected, reason) => {
                            var _a, _b;
                            record = await this.getDraftData();
                            console.debug(record);
                            player = record.players.find(x => x.userId === record.currentPlayer);
                            if (reason === 'time') {
                                (player === null || player === void 0 ? void 0 : player.skips) !== undefined ? player.skips++ : 0;
                                dm.send("You were skipped.");
                                let skipEmbed = new discord_js_1.MessageEmbed()
                                    .setDescription(`<@${record.currentPlayer}> has been skipped (${player === null || player === void 0 ? void 0 : player.skips}/${record.totalSkips})`)
                                    .setColor("ORANGE");
                                ctx.sendMessage(skipEmbed);
                            }
                            if (record.direction === "down") {
                                if ((player === null || player === void 0 ? void 0 : player.order) === record.players.length) {
                                    record.direction = "up";
                                    record.round++;
                                }
                                else
                                    record.currentPlayer = (_a = record.players.find(x => x.order === (player === null || player === void 0 ? void 0 : player.order) + 1)) === null || _a === void 0 ? void 0 : _a.userId;
                            }
                            else if (record.direction === "up") {
                                if ((player === null || player === void 0 ? void 0 : player.order) === 1) {
                                    record.direction = "down";
                                    record.round++;
                                }
                                else
                                    record.currentPlayer = (_b = record.players.find(x => x.order === (player === null || player === void 0 ? void 0 : player.order) - 1)) === null || _b === void 0 ? void 0 : _b.userId;
                            }
                            console.debug(record);
                            record.save().catch(error => console.error(error));
                            if (record.round <= record.maxRounds)
                                await getUserPicks();
                            else if (record.round >= record.maxRounds) {
                                let finishedEmbed = new discord_js_1.MessageEmbed();
                                finishedEmbed.setTitle('Draft has concluded');
                                finishedEmbed.setDescription(`Here is the Drafts that each player has made.`);
                                finishedEmbed.setColor("RANDOM");
                                for (let _player of record.players) {
                                    let desc = "";
                                    _player.pokemon.forEach(x => desc += `Round ${_player.pokemon.findIndex(y => y === x) + 1} - ${x}\n`);
                                    finishedEmbed.addField(`Player ${(await ctx.client.users.fetch(_player.userId)).username}`, desc, true);
                                }
                                // await this.sendToSheet(record);
                                ctx.client.executingMonitors.delete(ctx.channelId);
                                ctx.client.runningMonitors.delete(ctx.channelId);
                                return ctx.sendMessage(finishedEmbed);
                            }
                        });
                    }
                });
            };
            let data = await getUserPicks();
        };
        this._ctx = ctx;
    }
}
exports.DraftMonitor = DraftMonitor;
