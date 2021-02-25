"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSheets = void 0;
const googleapis_1 = require("googleapis");
class GoogleSheets {
    constructor() { }
    async connect() {
        var _a;
        const client = new googleapis_1.google.auth.JWT(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, 
        //@ts-ignore
        null, (_a = process.env.GOOGLE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, "\n"), [
            'https://www.googleapis.com/auth/spreadsheets'
        ]);
        await client.authorize((error, tokens) => {
            if (error) {
                console.error(error);
                return;
            }
            else {
                console.log("Connected");
            }
        });
        return client;
    }
    async get() {
        const client = await this.connect();
        const opt = {
            spreadsheetId: '1bDoUvsC2ArgYk-m3n8Kw-QqfzbZZA2jsPV31F3_QKSc',
            range: "'Raw Draft Data'!A2:M2"
        };
        const gsapi = googleapis_1.google.sheets({ version: 'v4', auth: client });
        let data = await gsapi.spreadsheets.values.get(opt);
        console.log(data);
    }
    async add(data) {
        const client = await this.connect();
        const gsapi = googleapis_1.google.sheets({ version: 'v4', auth: client });
        const opt = {
            spreadsheetId: data.spreadsheetId,
            range: "'Raw Draft Data'!A2:B2",
            valueInputOption: "USER_ENTERED",
            resource: {
                range: "'Raw Draft Data'!A2:B2",
                values: data.data
            }
        };
        console.debug(opt);
        let res = await gsapi.spreadsheets.values.append(opt);
        console.log(res);
    }
}
exports.GoogleSheets = GoogleSheets;
