import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import { DraftMonitor } from "../../monitors/draft";


export class PausetimerCommand implements ICommand {
	name = "pausetimer";
	category = "draft";
	description = "Pauses the timer, if the timer is on.";
	invoke = async (ctx: CommandContext) => {
		let draft = ctx.client.runningMonitors.get(ctx.channelId) as DraftMonitor;
		if(!draft) return ctx.sendMessage("There doesn't seem like there is a draft happening.");
		ctx.client.idleMonitors.set(ctx.channelId, draft);
		await draft.pause();
		ctx.sendMessage("Paused Timer");
	}
}