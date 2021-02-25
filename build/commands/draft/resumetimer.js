"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumetimerCommand = void 0;
class ResumetimerCommand {
    constructor() {
        this.name = "resumetimer";
        this.category = "Resumes the timer, if the timer is paused.";
        this.invoke = async (ctx) => {
            let draft = ctx.client.runningMonitors.get(ctx.channelId);
            if (!draft)
                return ctx.sendMessage("There doesn't seem like there is a draft happening.");
            await draft.resume();
            //draft.pause = false;
            return ctx.sendMessage("Timer has been turn back on.");
        };
    }
}
exports.ResumetimerCommand = ResumetimerCommand;
