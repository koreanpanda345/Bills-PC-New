import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import DraftTimer from "../../database/schemas/DraftTimerSchema";
import {IDraftTimer} from "../../database/schemas/DraftTimerSchema";
import {Dex} from "@pkmn/dex";
import { TextChannel, Message, MessageEmbed, PermissionString } from "discord.js";
import moment from "moment";
import { DraftMonitor } from "../../monitors/draft";
import { Collection } from "mongoose";
export class StartdraftCommand implements ICommand {
	name = "startdraft";
	category = "draft";
	description = "Starts the draft."
	permission: {user?: PermissionString[]} = {
		user: ["MANAGE_GUILD"]
	}

	invoke = async(ctx: CommandContext) => {
		let draft = new DraftMonitor(ctx);
		ctx.sendMessage("Starting up the draft...");
		ctx.client.runningMonitors.set(ctx.channelId, draft);
	};
}