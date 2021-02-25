"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopdraftCommand = void 0;
class StopdraftCommand {
    constructor() {
        this.name = "stopdraft";
        this.category = "draft";
        this.description = "Stops the current draft. This will not delete the draft. it will just be put on hold untill you start it again with the `startdraft` command.";
        this.invoke = async (ctx) => {
            let draft = await ctx.client.runningMonitors.get(ctx.channelId);
            if (!draft)
                return ctx.sendMessage("There doesn't seem like there is a draft happening.");
            await draft.stop();
            //draft.stop = true;
            ctx.sendMessage("Draft will stop after the current player makes a selection!");
        };
    }
}
exports.StopdraftCommand = StopdraftCommand;
