import { IEvent } from "../../types/events";
import { BillsPC } from "../../BillsPC";


export class ReadyEvent implements IEvent {
	name = "ready";
	constructor(
		private _client: BillsPC
	) {}
	invoke = () => {
		console.log(`${this._client.user?.username} is ready`);
	};
}