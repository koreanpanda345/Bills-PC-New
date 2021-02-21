import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";
import DraftTimer, { IDraftTimer } from "../../database/schemas/DraftTimerSchema";
import { PermissionString, MessageEmbed } from "discord.js";

export class RandomorderCommand implements ICommand {
	name = "randomorder";
	category = "draft";
	description = "Randomizes the Draft order";
	usage = ["b!randomorder"];
	permission: {user?: PermissionString[]} = {
		user: ["MANAGE_GUILD"]
	}
	invoke = async(ctx: CommandContext) => {
		// @ts-ignore
		DraftTimer.findOne({channelId: ctx.channelId}, (err, record: IDraftTimer) => {
			if(!record) return ctx.sendMessage(`Please set up the draft, by using the \`setdraft\` command.`);
			let players: string[] = [];
			record.players.forEach(x => players.push(x.userId));
			let shuffled = this.shuffle(players);

			shuffled.forEach(id => {
				let player =record.players.find(x => x.userId === id);
				// @ts-ignore
				player?.order = shuffled.findIndex(x => x === id) + 1;
			});
			record.currentPlayer = record.players.find(x =>x.order === 1)?.userId!;
			let embed = new MessageEmbed()
				.setTitle(`Randomized Order`)
				.setDescription(`This is now the new draft order.`);

			record.save().catch(error => console.error(error));

			record.players.sort((a, b) => a.order - b.order).forEach(x => embed.addField(`Player ${ctx.guild?.member(x.userId)?.user.username}`, `Draft Order: ${x.order}`));
			ctx.sendMessage(embed);
		});
	};

	shuffle(arr: string[]) {
		var currentIndex = arr.length, temp, random;
		while(0 !== currentIndex) {
			random = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			temp = arr[currentIndex];
			arr[currentIndex] = arr[random];
			arr[random] = temp;
		}

		return arr;
	}
}