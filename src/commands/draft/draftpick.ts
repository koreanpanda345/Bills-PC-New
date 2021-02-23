import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import DraftTimer, { IDraftTimer } from "../../database/schemas/DraftTimerSchema";
import { CallbackError } from "mongoose";

export class DraftpickCommand implements ICommand {
	name = "draftpick";
	description = "If you left picks with someone, you can use this command, so you can take back control of your draft.";
	category = "draft";
	invoke = async(ctx: CommandContext) => {
		let prefix = ctx.args.join(" ");
		await new Promise((resolve) => {
			DraftTimer.findOne({prefix}, (err: CallbackError, record: IDraftTimer) => {
				if(!record) return ctx.sendMessage("There doesn't seem like there is a league with that prefix.");
				let player = record.players.find(x => x.userId === ctx.userId);
				if(!player) return ctx.sendMessage("You are not in this draft.");
				player.leavePicks = "";
				record.save().catch(error => console.error(error));
				ctx.sendMessage(`Ok, you can now draft yourself next time it is your turn.`);
			});
		});
	}
}