import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import { PermissionString } from "discord.js";
import DraftTimer, { IDraftTimer } from "../../database/schemas/DraftTimerSchema";
import { CallbackError } from "mongoose";

export class AddplayerCommand implements ICommand {
	name = "addplayer";
	category = "draft";
	description = "Adds a player or players to the draft. Must be used in the channel that the draft was setup in. Ping the players you want to be added.";
	usage = ["b!addplayer <@who>"]
	permission: { user: PermissionString[]} = {
		user: ["MANAGE_GUILD"]
	};
	invoke = async(ctx: CommandContext) => {
		DraftTimer.findOne({channelId: ctx.channelId}, (error: CallbackError, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage("Please setup the draft by using the `setdraft` command!");
			if(ctx.message.mentions.users.size === 0) return ctx.sendMessage(`Please try this command again, but ping the user(s) so I know who to add.`);
			let list: string[] = [];			
			ctx.message.mentions.users.forEach(user => {
				if(!record.players.find(x => x.userId === user.id)) {
					record.players.push({
						userId: user.id,
						skips: 0,
						pokemon: [],
						queue: [],
						order: record.players.length + 1
					});
					list.push(user.username);
				}
				else ctx.sendMessage(`${user.username} is already in the draft`);
			});
			record.save().catch(error => console.error(error));
			if(list.length) return ctx.sendMessage(`Added These Players:\n${list.join("\n")}`);
		});
	};
}