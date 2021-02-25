"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PausetimerCommand = void 0;
class PausetimerCommand {
    constructor() {
        this.name = "pausetimer";
        this.category = "draft";
        this.description = "Pauses the timer, if the timer is on.";
        this.invoke = async (ctx) => {
            let draft = ctx.client.runningMonitors.get(ctx.channelId);
            if (!draft)
                return ctx.sendMessage("There doesn't seem like there is a draft happening.");
            ctx.client.idleMonitors.set(ctx.channelId, draft);
            await draft.pause();
            //draft.pause = true;
            ctx.sendMessage("Paused Timer");
        };
    }
}
exports.PausetimerCommand = PausetimerCommand;
