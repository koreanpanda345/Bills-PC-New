import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import DraftTimer, { IDraftTimer } from "../../database/schemas/DraftTimerSchema";
import { CallbackError } from "mongoose";
import { PermissionString } from "discord.js";

export class RemoveplayerCommand implements ICommand {
	name = "removeplayer";
	category = "draft";
	description = "Removes a player or players from the draft. Must be used in the channel that the draft was setup in. Ping the players you want to remove.";
	usage = ["b!removeplayer <@who>"]
	permission: {user: PermissionString[]} = {
		user: ["MANAGE_GUILD"]
	}
	invoke = async(ctx: CommandContext) => {
		DraftTimer.findOne({channelId: ctx.channelId}, (error: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage("Please setup the draft by using the `setdraft` command.");
			let list: string[] = [];
			ctx.message.mentions.users.forEach(user => {
				if(!record.players.find(x => x.userId === user.id)) ctx.sendMessage(`Player ${user.username} is not in the draft.`);
				else {
					record.players.splice(record.players.findIndex(x => x.userId === user.id), 1);
					list.push(user.username);
				}
			});

			record.save().catch(error => console.error());
			return ctx.sendMessage(`Removed these players:\n${list.join("\n")}`);
		});
	};
}