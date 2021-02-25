"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditpokemonCommand = void 0;
const discord_js_1 = require("discord.js");
const dex_1 = require("@pkmn/dex");
const DraftTimerSchema_1 = __importDefault(require("../../database/schemas/DraftTimerSchema"));
const helpers_1 = require("./../../utils/helpers");
class EditpokemonCommand {
    constructor() {
        this.name = "editpokemon";
        this.category = "draft";
        this.description = "Edits a players draft pick";
        this.usage = ["m!editpokemon <@who> <pokemon to be changed>, <desired Pokemon>"];
        this.permission = {
            user: ["MANAGE_GUILD"]
        };
        this.invoke = async (ctx) => {
            return await new Promise((resolve) => {
                return DraftTimerSchema_1.default.findOne({ channelId: ctx.channelId }, async (err, record) => {
                    var _a;
                    if (!record)
                        return ctx.sendMessage("Please setup the draft by using the `setdraft` command!");
                    let user = ctx.message.mentions.users.first();
                    if (!user)
                        return ctx.sendMessage("Please use the command again, but ping the user that you want to wold like to change their.");
                    ctx.args.shift();
                    let pokemon = ctx.args.join(" ");
                    let oldPokemon = pokemon.split(",")[0];
                    let newPokemon = pokemon.split(",")[1];
                    if (!oldPokemon)
                        return "Please try this command again, but add what pokemon you would like to change.";
                    if (!newPokemon)
                        return "Please try this command again, but add what pokemon you would like to replace the old pokemon with.";
                    oldPokemon = helpers_1.getNamingConvention(oldPokemon);
                    newPokemon = helpers_1.getNamingConvention(newPokemon);
                    const oldCheck = dex_1.Dex.getSpecies(oldPokemon);
                    const newCheck = dex_1.Dex.getSpecies(newPokemon);
                    if (!oldCheck.exists)
                        return ctx.sendMessage(`${oldPokemon} is not a valid pokemon.`);
                    if (!newCheck.exists)
                        return ctx.sendMessage(`${newPokemon} is not a valid pokemon.`);
                    const found = record.pokemon.includes(newPokemon);
                    if (found)
                        return ctx.sendMessage(`${newCheck.name} is already drafted by ${(await ctx.client.users.fetch((_a = record.players.find(x => x.pokemon.includes(newCheck.name))) === null || _a === void 0 ? void 0 : _a.userId)).username}`);
                    let recordPokemon = record.pokemon;
                    let playerPokemon = record.players.find(x => x.userId === (user === null || user === void 0 ? void 0 : user.id)).pokemon;
                    recordPokemon[recordPokemon.findIndex(x => x === oldCheck.name)] = newCheck.name;
                    playerPokemon[playerPokemon.findIndex(x => x === oldCheck.name)] = newCheck.name;
                    record.pokemon.splice(record.pokemon.length);
                    record.players.find(x => x.userId === (user === null || user === void 0 ? void 0 : user.id)).pokemon.splice(playerPokemon.length);
                    record.players.find(x => x.userId === (user === null || user === void 0 ? void 0 : user.id)).pokemon = playerPokemon;
                    record.pokemon = recordPokemon;
                    console.debug(record.directModifiedPaths());
                    let embed = new discord_js_1.MessageEmbed();
                    embed.setTitle(`Draft Pick has Been Changed.`);
                    embed.setDescription(`Player ${user.username} has selected ${newCheck.name} instead of ${oldCheck.name}`);
                    embed.setImage(`https://play.pokemonshowdown.com/sprites/ani/${newCheck.name.toLowerCase()}.gif`);
                    embed.setColor("RANDOM");
                    ctx.sendMessage(embed);
                    record.save().catch((error) => console.error(error));
                });
            });
            // let player = ctx.message.mentions.users.first();
            // if(!player) return ctx.sendMessage("Please use the command again, but ping the user that you want to wold like to change their.");
            // ctx.args.shift();
            // let pokemon = ctx.args.join(" ");
            // let oldPokemon = pokemon.split(",")[0];
            // let newPokemon = pokemon.split(",")[1];
            // if(!oldPokemon) return "Please try this command again, but add what pokemon you would like to change.";
            // if(!newPokemon) return "Please try this command again, but add what pokemon you would like to replace the old pokemon with.";
            // let draft = ctx.client.runningMonitors.get(ctx.channelId) as DraftMonitor;
            // if(!draft) return ctx.sendMessage("The draft is not running. please run it by using the command `startdraft`");
            // let record = await draft.getDraftData();
            // //let record = await draft.getData();
            // if(!record) return ctx.sendMessage("Please setup up the draft using the `setdraft` command.");
            // if(!record.players.find(x => x.userId === player?.id)) return ctx.sendMessage("That player is not in the draft");
            // oldPokemon = getNamingConvention(oldPokemon);
            // newPokemon = getNamingConvention(newPokemon);
            // const oldCheck = Dex.getSpecies(oldPokemon);
            // const newCheck = Dex.getSpecies(newPokemon);
            // if(!oldCheck) return ctx.sendMessage(`${oldPokemon} is not a valid pokemon.`);
            // if(!newCheck) return ctx.sendMessage(`${newPokemon} is not a valid pokemon.`);
            // const found = record.pokemon.includes(newCheck.name);
            // if(found) return ctx.sendMessage(`${newCheck.name} is already drafted by ${(await ctx.client.users.fetch(record.players.find(x => x.pokemon.includes(newCheck.name))?.userId!)).username}`);
            // draft.edit({userId: player.id, old: oldCheck.name, new: newCheck.name});
            // //draft.edit = true;
            // //draft.editPick = {userId: player.id, old: oldCheck.name, new: newCheck.name};
            // let embed = new MessageEmbed();
            // embed.setTitle(`Draft Pick has Been Changed.`);
            // embed.setDescription(`Player ${(await ctx.client.users.fetch(player?.id!)).username} has selected ${newCheck.name} instead of ${oldCheck.name}`);
            // embed.setImage(`https://play.pokemonshowdown.com/sprites/ani/${newCheck.name.toLowerCase()}.gif`);
            // embed.setColor("RANDOM");
            // ctx.sendMessage(embed);
        };
    }
}
exports.EditpokemonCommand = EditpokemonCommand;
