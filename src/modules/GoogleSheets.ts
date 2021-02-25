import { CommandContext } from "../types/commandContext";
import {google} from "googleapis";

export class GoogleSheets {

	constructor() {}
	async connect() {
		const client = new google.auth.JWT(
			process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
			//@ts-ignore
			null,
			process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
			[
				'https://www.googleapis.com/auth/spreadsheets'
			]
		);
		await client.authorize((error, tokens) => {
			if(error) {
				console.error(error);
				return;
			}
			else {
				console.log("Connected");
			}
		});

		return client;
	}

	public async add(data: {spreadsheetId: string, data: Array<Array<string>>}) {
		const client = await this.connect();
		const gsapi = google.sheets({version: 'v4', auth: client});
		const opt = {
			spreadsheetId: data.spreadsheetId,
			range: "'Raw Draft Data'!A2:B2",
			valueInputOption: "USER_ENTERED",
			resource: {
				range: "'Raw Draft Data'!A2:B2",
				values: data.data
			}
		}
		console.debug(opt);
		let res = await gsapi.spreadsheets.values.append(opt);
		console.log(res);
	}

}