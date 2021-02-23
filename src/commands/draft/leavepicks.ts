import { ICommand } from "../../types/commands";
import { CommandContext } from '../../types/commandContext';
import DraftTimer, { IDraftTimer } from "../../database/schemas/DraftTimerSchema";
import { CallbackError } from "mongoose";

export class LeavepicksCommand implements ICommand {
	name = "leavepicks";
	description = "Select who will be drafting for you instead.";
	category = "draft";
	invoke = async (ctx: CommandContext) => {
		let user = ctx.message.mentions.users.first();
		if(!user) return ctx.sendMessage("Please execute this command again, but ping who you left picks with.");
		ctx.args.shift();
		let prefix = ctx.args.join(" ");
		await new Promise((resolve) => {
			DraftTimer.findOne({prefix}, (err: CallbackError, record: IDraftTimer) => {
				if(!record) return ctx.sendMessage("There doesn't seem like there is a league with that prefix.");
				let player = record.players.find(x => x.userId === ctx.userId);
				if(!player) return ctx.sendMessage("You are not in this draft.");
				player.leavePicks = user?.id!;
				record.save().catch(error => console.error(error));
				ctx.sendMessage(`${user?.username} will be drafting for you. use the \`draftpick\` command when you want to draft yourself.`);
			})
		})
	}
}