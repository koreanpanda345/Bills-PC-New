"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeavepicksCommand = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/schemas/DraftTimerSchema"));
class LeavepicksCommand {
    constructor() {
        this.name = "leavepicks";
        this.description = "Select who will be drafting for you instead.";
        this.category = "draft";
        this.invoke = async (ctx) => {
            let user = ctx.message.mentions.users.first();
            if (!user)
                return ctx.sendMessage("Please execute this command again, but ping who you left picks with.");
            ctx.args.shift();
            let prefix = ctx.args.join(" ");
            await new Promise((resolve) => {
                DraftTimerSchema_1.default.findOne({ prefix }, (err, record) => {
                    if (!record)
                        return ctx.sendMessage("There doesn't seem like there is a league with that prefix.");
                    let player = record.players.find(x => x.userId === ctx.userId);
                    if (!player)
                        return ctx.sendMessage("You are not in this draft.");
                    player.leavePicks = user === null || user === void 0 ? void 0 : user.id;
                    record.save().catch(error => console.error(error));
                    ctx.sendMessage(`${user === null || user === void 0 ? void 0 : user.username} will be drafting for you. use the \`draftpick\` command when you want to draft yourself.`);
                });
            });
        };
    }
}
exports.LeavepicksCommand = LeavepicksCommand;
