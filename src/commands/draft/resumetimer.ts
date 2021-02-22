import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import { DraftMonitor } from "../../monitors/draft";


export class ResumetimerCommand implements ICommand {
	name = "resumetimer";
	category = "Resumes the timer, if the timer is paused."
	invoke = async (ctx: CommandContext) => {
		let draft = ctx.client.runningMonitors.get(ctx.channelId) as DraftMonitor;
		if(!draft) return ctx.sendMessage("There doesn't seem like there is a draft happening.");
		await draft.resume();
		//draft.pause = false;
		return ctx.sendMessage("Timer has been turn back on.");
	};
}