import { IEvent } from "../../types/events";
import { BillsPC } from "../../BillsPC";
import { Message } from "discord.js";
import { CommandContext } from "../../types/commandContext";


export class MessageEvent implements IEvent {
	name = "message";
	constructor(
		private _client: BillsPC
	){}

	invoke = async (message: Message) => {
		if(message.author.bot || message.channel.type === "dm") return;
		let prefix = process.env.PREFIX;
		if(message.content.toLowerCase().startsWith(prefix!)) {
			const args = message.content.slice(prefix!.length).trim().split(/ +/g);
			const commandName = args.shift()?.toLowerCase();

			const command = this._client.commands.get(commandName!) || this._client.commands.find(cmd => cmd.aliases! && cmd.aliases!.includes(commandName!));
			
			if(!command) return;

			let run = true;
			const ctx = new CommandContext(message, args, this._client);
			command.permission?.user?.forEach(permission => {
				if(!ctx.member?.hasPermission(permission)) {
					run = false;
					return ctx.sendMessage(`You can not use this command. You must have the permission of \`${permission}\` to do this.`);
				}
				run = true;
			});
			if(!run) return;
			command.permission?.self?.forEach(permission => {
				if(!ctx.me?.hasPermission(permission)) {
					run = false;
					return ctx.sendMessage(`I can not do this. I must have the permission of \`${permission}\` to do this.`);
				}
				run = false;
			});
			if(!run) return false;
			command.preconditions?.forEach(async condition => {
				const result = await condition(ctx);
				if(typeof result === 'boolean' && !result) {
					run = false;
					return ctx.sendMessage("You can not use this command.");
				}
				else if(typeof result === 'string') {
					run = false;
					return ctx.sendMessage(result);
				}
				else if(typeof result === 'undefined') {
					run = false;
					return ctx.sendMessage(`Something Happened when checking the preconditions of command ${command.name}`);
				}
				run = true;
			});

			if(!run) return;

			try {
				await command.invoke(ctx);
			} catch(error) {
				console.error(error);
			}
		}
	};
}