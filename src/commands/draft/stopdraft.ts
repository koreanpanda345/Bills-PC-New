import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import { DraftMonitor } from "../../monitors/draft";


export class StopdraftCommand implements ICommand {
	name = "stopdraft";
	category = "draft";
	description = "Stops the current draft. This will not delete the draft. it will just be put on hold untill you start it again with the `startdraft` command."
	invoke = async (ctx: CommandContext) => {
		let draft = await ctx.client.runningMonitors.get(ctx.channelId) as DraftMonitor;
		if(!draft) return ctx.sendMessage("There doesn't seem like there is a draft happening.");
		await draft.stop();
		//draft.stop = true;
		ctx.sendMessage("Draft will stop after the current player makes a selection!");
	};
}