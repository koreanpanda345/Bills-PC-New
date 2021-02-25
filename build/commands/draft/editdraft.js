"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditdraftCommand = void 0;
const DraftTimerSchema_1 = __importDefault(require("../../database/schemas/DraftTimerSchema"));
const discord_js_1 = require("discord.js");
class EditdraftCommand {
    constructor() {
        this.name = "editdraft";
        this.description = "Lets you edit the properties of the draft";
        this.category = "draft";
        this.permission = {
            user: ["MANAGE_GUILD"]
        };
        this.invoke = async (ctx) => {
            return await new Promise((resolve) => {
                DraftTimerSchema_1.default.findOne({ channelId: ctx.channelId }, (error, record) => {
                    var _a;
                    if (!ctx.args[0]) {
                        let embed = new discord_js_1.MessageEmbed();
                        embed.setTitle("ALl the Available properties that you can edit.");
                        embed.setDescription(`totalSkips\nmaxRounds\nprefix\nleagueName`);
                        return ctx.sendMessage(embed);
                    }
                    let prop = (_a = ctx.args) === null || _a === void 0 ? void 0 : _a.shift().trim();
                    if (!record)
                        return ctx.sendMessage("Please setup the draft by using the `setdraft` command.");
                    if (!record.get(prop))
                        return ctx.sendMessage(`There doesn't seem like there is a property named ${prop}`);
                    let value = ctx.args.join(" ");
                    record.set(prop, value);
                    record.save().catch(error => console.error(error));
                    ctx.sendMessage(`Updated ${prop} to ${value}`);
                });
            });
        };
    }
}
exports.EditdraftCommand = EditdraftCommand;
