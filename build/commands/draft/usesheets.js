"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsesheetsCommand = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/schemas/DraftTimerSchema"));
class UsesheetsCommand {
    constructor() {
        this.name = "usesheets";
        this.description = "Enables the automation for you draft doc.";
        this.category = "draft";
        this.usage = ["m!usesheets <google sheet url>"];
        this.permission = {
            user: ["MANAGE_GUILD"]
        };
        this.invoke = async (ctx) => {
            DraftTimerSchema_1.default.findOne({ channelId: ctx.channelId }, (error, record) => {
                if (!record)
                    return ctx.sendMessage("Please setup the draft by using the `setdraft` command.");
                let url = ctx.args[0];
                let id = "";
                if (url.startsWith("https://docs.google.com/spreadsheets/d/"))
                    id = url.split("/")[5];
                record.sheetId = id;
                record.save().catch(error => console.error(error));
                ctx.sendMessage(`I will now update the draft doc, everytime I receive a pick.`);
            });
        };
    }
}
exports.UsesheetsCommand = UsesheetsCommand;
