import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import { PermissionString } from "discord.js";
import DraftTimer, { IDraftTimer } from "../../database/schemas/DraftTimerSchema";
import { CallbackError } from "mongoose";


export class DeletedraftCommand implements ICommand {
	name = "deletedraft";
	description = "Deletes the draft.";
	category = "draft";
	permission: {user: PermissionString[]} = {
		user: ["MANAGE_GUILD"]
	};
	invoke = async(ctx: CommandContext) => {
		let draft = ctx.client.runningMonitors.get(ctx.channelId);
		if(draft) return ctx.sendMessage("The draft is running. Please stop with the command `stopdraft`, then you can delete the draft.");
		return DraftTimer.findOneAndDelete({channelId: ctx.channelId}, {}, (error: any, record: IDraftTimer | null, res: any) => {
			if(error) return console.error(error);
			if(!record) return ctx.sendMessage("There doesn't seem like there is a draft made yet.");
			return ctx.sendMessage(`Deleted Draft for ${record.leagueName}`);
		});
	}
}