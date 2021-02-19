import { ICommand } from "../../types/commands";
import { CommandContext } from "../../types/commandContext";


export class PingCommand implements ICommand {
	name = "ping";
	aliases = ["latency"];
	category = "Miscellaneous";
	description = "Displays my current latency";
	invoke = async(ctx: CommandContext) => {
		const api = ctx.client.ws.ping;

		ctx.sendMessage(`Pong! Discord Api latency is ${api} ms.`);
	}
}