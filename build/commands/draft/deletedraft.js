"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletedraftCommand = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/schemas/DraftTimerSchema"));
class DeletedraftCommand {
    constructor() {
        this.name = "deletedraft";
        this.description = "Deletes the draft.";
        this.category = "draft";
        this.permission = {
            user: ["MANAGE_GUILD"]
        };
        this.invoke = async (ctx) => {
            let draft = ctx.client.runningMonitors.get(ctx.channelId);
            if (draft)
                return ctx.sendMessage("The draft is running. Please stop with the command `stopdraft`, then you can delete the draft.");
            return DraftTimerSchema_1.default.findOneAndDelete({ channelId: ctx.channelId }, {}, (error, record, res) => {
                if (error)
                    return console.error(error);
                if (!record)
                    return ctx.sendMessage("There doesn't seem like there is a draft made yet.");
                return ctx.sendMessage(`Deleted Draft for ${record.leagueName}`);
            });
        };
    }
}
exports.DeletedraftCommand = DeletedraftCommand;
