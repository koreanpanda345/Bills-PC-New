import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import { MessageEmbed } from "discord.js";


export class HelpCommand implements ICommand {
	name = "help"
	aliases = ["command", "commands"];
	description = "Displays a list of commands, or information about a specific command.";
	category = "Miscellaneous";
	usage = ["b!help", "b!help ping"];
	invoke = async (ctx: CommandContext) => {
		let prefix = process.env.PREFIX;
		let embed = new MessageEmbed();
		embed.setColor('RANDOM');
		if(!ctx.args[0]) {
			embed.setTitle("List of commands");
			embed.setDescription(`Prefix: ${prefix}\nTotal Commands: ${ctx.client.commands.size}`);

			const categorys = [
				"Miscellaneous",
				"Tools"
			];

			categorys.forEach(cat => {
				const cmds = ctx.client.commands.filter(cmd => cmd.category?.toLowerCase() === cat.toLowerCase());
				let desc = "";
				cmds.forEach(cmd => {
					desc += `- ${cmd.name}\n`;
				});
				embed.addField(`${cat}`, desc);
			});
		}
		else {
			let search = ctx.args[0].toLowerCase();
			const command = ctx.client.commands.get(search) || ctx.client.commands.find(cmd => cmd.aliases! && cmd.aliases!.includes(search));
			if(!command) {
				embed.setColor('RED');
				embed.setTitle("Couldn't find command.");
				embed.setDescription(`I couldn't find a command called \`${search}\` Please make sure you spelt it correctly.`);

				return ctx.sendMessage(embed);
			}

			embed.setTitle(`Information on ${command.name}`);
			embed.setDescription(`Description: ${command.description || "No Description was provided."}\nUsage: ${command.usage?.join(", ") || "No Usage was provided."}\nCategory: ${command.category || "Uncategorized."}`);
		}
		ctx.sendMessage(embed);
	}
}