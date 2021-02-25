"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddplayerCommand = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/schemas/DraftTimerSchema"));
class AddplayerCommand {
    constructor() {
        this.name = "addplayer";
        this.category = "draft";
        this.description = "Adds a player or players to the draft. Must be used in the channel that the draft was setup in. Ping the players you want to be added.";
        this.usage = ["b!addplayer <@who>"];
        this.permission = {
            user: ["MANAGE_GUILD"]
        };
        this.invoke = async (ctx) => {
            DraftTimerSchema_1.default.findOne({ channelId: ctx.channelId }, (error, record) => {
                if (!record)
                    return ctx.sendMessage("Please setup the draft by using the `setdraft` command!");
                if (ctx.message.mentions.users.size === 0)
                    return ctx.sendMessage(`Please try this command again, but ping the user(s) so I know who to add.`);
                let list = [];
                ctx.message.mentions.users.forEach(user => {
                    if (!record.players.find(x => x.userId === user.id)) {
                        record.players.push({
                            userId: user.id,
                            skips: 0,
                            pokemon: [],
                            queue: [],
                            order: record.players.length + 1,
                            leavePicks: ""
                        });
                        list.push(user.username);
                    }
                    else
                        ctx.sendMessage(`${user.username} is already in the draft`);
                });
                record.save().catch(error => console.error(error));
                if (list.length)
                    return ctx.sendMessage(`Added These Players:\n${list.join("\n")}`);
            });
        };
    }
}
exports.AddplayerCommand = AddplayerCommand;
