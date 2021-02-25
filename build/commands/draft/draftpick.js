"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftpickCommand = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/schemas/DraftTimerSchema"));
class DraftpickCommand {
    constructor() {
        this.name = "draftpick";
        this.description = "If you left picks with someone, you can use this command, so you can take back control of your draft.";
        this.category = "draft";
        this.invoke = async (ctx) => {
            let prefix = ctx.args.join(" ");
            await new Promise((resolve) => {
                DraftTimerSchema_1.default.findOne({ prefix }, (err, record) => {
                    if (!record)
                        return ctx.sendMessage("There doesn't seem like there is a league with that prefix.");
                    let player = record.players.find(x => x.userId === ctx.userId);
                    if (!player)
                        return ctx.sendMessage("You are not in this draft.");
                    player.leavePicks = "";
                    record.save().catch(error => console.error(error));
                    ctx.sendMessage(`Ok, you can now draft yourself next time it is your turn.`);
                });
            });
        };
    }
}
exports.DraftpickCommand = DraftpickCommand;
