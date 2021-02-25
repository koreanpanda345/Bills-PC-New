import { IEvent } from "../../types/events";
import { BillsPC } from "../../BillsPC";
import { GoogleSheets } from "../../modules/GoogleSheets";


export class ReadyEvent implements IEvent {
	name = "ready";
	constructor(
		private _client: BillsPC
	) {}
	invoke = async () => {
		this._client.user?.setStatus("online");
		this._client.user?.setActivity({name: `Prefix: ${process.env.PREFIX}Help | In ${this._client.guilds.cache.size} Servers`});
	
	};
}