import { IEvent } from "../../types/events";
import { BillsPC } from "../../BillsPC";


export class ReadyEvent implements IEvent {
	name = "ready";
	constructor(
		private _client: BillsPC
	) {}
	invoke = () => {
		console.log(`${this._client.user?.username} is ready`);
		this._client.user?.setStatus("online");
		this._client.user?.setActivity({name: `Prefix: ${process.env.PREFIX}Help | In ${this._client.guilds.cache.size} Servers`});
	};
}