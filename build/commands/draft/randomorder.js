"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomorderCommand = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/schemas/DraftTimerSchema"));
const discord_js_1 = require("discord.js");
class RandomorderCommand {
    constructor() {
        this.name = "randomorder";
        this.category = "draft";
        this.description = "Randomizes the Draft order";
        this.usage = ["b!randomorder"];
        this.permission = {
            user: ["MANAGE_GUILD"]
        };
        this.invoke = async (ctx) => {
            // @ts-ignore
            DraftTimerSchema_1.default.findOne({ channelId: ctx.channelId }, (err, record) => {
                var _a;
                if (!record)
                    return ctx.sendMessage(`Please set up the draft, by using the \`setdraft\` command.`);
                let players = [];
                record.players.forEach(x => players.push(x.userId));
                let shuffled = this.shuffle(players);
                shuffled.forEach(id => {
                    let player = record.players.find(x => x.userId === id);
                    // @ts-ignore
                    player === null || player === void 0 ? void 0 : player.order = shuffled.findIndex(x => x === id) + 1;
                });
                record.currentPlayer = (_a = record.players.find(x => x.order === 1)) === null || _a === void 0 ? void 0 : _a.userId;
                let embed = new discord_js_1.MessageEmbed()
                    .setTitle(`Randomized Order`)
                    .setDescription(`This is now the new draft order.`);
                record.save().catch(error => console.error(error));
                record.players.sort((a, b) => a.order - b.order).forEach(x => { var _a, _b; return embed.addField(`Player ${(_b = (_a = ctx.guild) === null || _a === void 0 ? void 0 : _a.member(x.userId)) === null || _b === void 0 ? void 0 : _b.user.username}`, `Draft Order: ${x.order}`); });
                ctx.sendMessage(embed);
            });
        };
    }
    shuffle(arr) {
        var currentIndex = arr.length, temp, random;
        while (0 !== currentIndex) {
            random = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temp = arr[currentIndex];
            arr[currentIndex] = arr[random];
            arr[random] = temp;
        }
        return arr;
    }
}
exports.RandomorderCommand = RandomorderCommand;
