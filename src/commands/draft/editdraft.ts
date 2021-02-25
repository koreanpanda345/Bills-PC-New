import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import DraftTimer, { IDraftTimer } from "../../database/schemas/DraftTimerSchema";
import { CallbackError } from "mongoose";
import { MessageEmbed, PermissionString } from "discord.js";

export class EditdraftCommand implements ICommand {
	name = "editdraft";
	description = "Lets you edit the properties of the draft";
	category = "draft";
	permission: {user: PermissionString[]} = {
		user: ["MANAGE_GUILD"]
	};
	invoke = async (ctx: CommandContext) => {
		return await new Promise((resolve) => {
			DraftTimer.findOne({channelId: ctx.channelId}, (error: CallbackError, record: IDraftTimer) => {
				if(!ctx.args[0]) {
					let embed = new MessageEmbed();
					embed.setTitle("ALl the Available properties that you can edit.");
					embed.setDescription(`totalSkips\nmaxRounds\nprefix\nleagueName`);
					return ctx.sendMessage(embed);
				}
				let prop = ctx.args?.shift()!.trim();
				if(!record) return ctx.sendMessage("Please setup the draft by using the `setdraft` command.");
				
				if(!record.get(prop)) return ctx.sendMessage(`There doesn't seem like there is a property named ${prop}`);
				
				let value = ctx.args.join(" ");
				record.set(prop, value);
	
				record.save().catch(error => console.error(error));
				ctx.sendMessage(`Updated ${prop} to ${value}`);
			});
		});
	}
}