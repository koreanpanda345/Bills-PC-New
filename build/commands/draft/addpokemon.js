"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddpokemonCommand = void 0;
const discord_js_1 = require("discord.js");
const DraftTimerSchema_1 = __importDefault(require("../../database/schemas/DraftTimerSchema"));
const dex_1 = require("@pkmn/dex");
const helpers_1 = require("../../utils/helpers");
class AddpokemonCommand {
    constructor() {
        this.name = "addpokemon";
        this.category = "draft";
        this.description = "Adds a pokemon to a player that has already been skipped or such. Ping the user you want to add the pokemon to, then add the pokemon.\nYou can apply text to this selection by doing `-text` at the end, and say what ever.";
        this.permission = {
            user: ["MANAGE_GUILD"]
        };
        this.usage = ["m!addpokemon <@who> <pokemon>"];
        this.invoke = async (ctx) => {
            let player = ctx.message.mentions.users.first();
            if (!player)
                return ctx.sendMessage(`Please try this command again, but provide what player you want to add the pokemon to.`);
            ctx.args.shift();
            let pokemon = ctx.args.join(" ");
            let text = "";
            if (pokemon.includes("-text")) {
                text = pokemon.split("-text")[1].trim();
                pokemon = pokemon.split("-text")[0].trim();
            }
            pokemon = helpers_1.getNamingConvention(pokemon);
            DraftTimerSchema_1.default.findOne({ channelId: ctx.channelId }, async (err, record) => {
                var _a, _b, _c;
                if (!record)
                    return ctx.sendMessage("Please setup the draft by using the `setdraft` command.");
                if (!record.players.find(x => x.userId === (player === null || player === void 0 ? void 0 : player.id)))
                    return ctx.sendMessage(`Player ${player === null || player === void 0 ? void 0 : player.username} is not in the draft.`);
                const check = dex_1.Dex.getSpecies(pokemon.toLowerCase());
                if (!check)
                    return ("That is not a valid pokemon");
                const found = record.pokemon.includes(pokemon);
                if (found)
                    return ctx.sendMessage(`${pokemon} is already drafted by ${(await ctx.client.users.fetch((_a = record.players.find(x => x.pokemon.includes(pokemon))) === null || _a === void 0 ? void 0 : _a.userId)).username}`);
                (_b = record.players.find(x => x.userId === (player === null || player === void 0 ? void 0 : player.id))) === null || _b === void 0 ? void 0 : _b.pokemon.push(pokemon);
                record.pokemon.push(pokemon);
                let embed = new discord_js_1.MessageEmbed().setDescription(`Staff Member <@${ctx.userId}> has predrafted **${pokemon.charAt(0).toUpperCase() + pokemon.slice(1)}** for <@${player === null || player === void 0 ? void 0 : player.id}>${text !== "" ? `\n${text}` : ""}`);
                embed.setColor("RANDOM");
                embed.setImage(`https://play.pokemonshowdown.com/sprites/ani/${check.name.toLowerCase()}.gif`);
                ctx.sendMessage(embed);
                if (((_c = record.players.find(x => x.userId === (player === null || player === void 0 ? void 0 : player.id))) === null || _c === void 0 ? void 0 : _c.skips) > 0) {
                    let _player = record.players.find(x => x.userId === (player === null || player === void 0 ? void 0 : player.id));
                    (_player === null || _player === void 0 ? void 0 : _player.skips) !== undefined ? _player.skips-- : 0;
                }
                record.save().catch(error => console.error(error));
            });
        };
    }
}
exports.AddpokemonCommand = AddpokemonCommand;
