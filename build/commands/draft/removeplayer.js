"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveplayerCommand = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/schemas/DraftTimerSchema"));
class RemoveplayerCommand {
    constructor() {
        this.name = "removeplayer";
        this.category = "draft";
        this.description = "Removes a player or players from the draft. Must be used in the channel that the draft was setup in. Ping the players you want to remove.";
        this.usage = ["b!removeplayer <@who>"];
        this.permission = {
            user: ["MANAGE_GUILD"]
        };
        this.invoke = async (ctx) => {
            DraftTimerSchema_1.default.findOne({ channelId: ctx.channelId }, (error, record) => {
                if (!record)
                    return ctx.sendMessage("Please setup the draft by using the `setdraft` command.");
                let list = [];
                ctx.message.mentions.users.forEach(user => {
                    if (!record.players.find(x => x.userId === user.id))
                        ctx.sendMessage(`Player ${user.username} is not in the draft.`);
                    else {
                        record.players.splice(record.players.findIndex(x => x.userId === user.id), 1);
                        list.push(user.username);
                    }
                });
                record.save().catch(error => console.error());
                return ctx.sendMessage(`Removed these players:\n${list.join("\n")}`);
            });
        };
    }
}
exports.RemoveplayerCommand = RemoveplayerCommand;
