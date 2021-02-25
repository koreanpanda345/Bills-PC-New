"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageEvent = void 0;
const commandContext_1 = require("../../types/commandContext");
class MessageEvent {
    constructor(_client) {
        this._client = _client;
        this.name = "message";
        this.invoke = async (message) => {
            var _a, _b, _c, _d, _e, _f;
            if (message.author.bot)
                return;
            let prefix = process.env.PREFIX;
            if (message.content.toLowerCase().startsWith(prefix)) {
                const args = message.content.slice(prefix.length).trim().split(/ +/g);
                const commandName = (_a = args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                const command = this._client.commands.get(commandName) || this._client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
                if (!command)
                    return;
                let run = true;
                const ctx = new commandContext_1.CommandContext(message, args, this._client);
                (_c = (_b = command.permission) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.forEach(permission => {
                    var _a;
                    if (!((_a = ctx.member) === null || _a === void 0 ? void 0 : _a.hasPermission(permission))) {
                        run = false;
                        return ctx.sendMessage(`You can not use this command. You must have the permission of \`${permission}\` to do this.`);
                    }
                    run = true;
                });
                if (!run)
                    return;
                (_e = (_d = command.permission) === null || _d === void 0 ? void 0 : _d.self) === null || _e === void 0 ? void 0 : _e.forEach(permission => {
                    var _a;
                    if (!((_a = ctx.me) === null || _a === void 0 ? void 0 : _a.hasPermission(permission))) {
                        run = false;
                        return ctx.sendMessage(`I can not do this. I must have the permission of \`${permission}\` to do this.`);
                    }
                    run = false;
                });
                if (!run)
                    return false;
                (_f = command.preconditions) === null || _f === void 0 ? void 0 : _f.forEach(async (condition) => {
                    const result = await condition(ctx);
                    if (typeof result === 'boolean' && !result) {
                        run = false;
                        return ctx.sendMessage("You can not use this command.");
                    }
                    else if (typeof result === 'string') {
                        run = false;
                        return ctx.sendMessage(result);
                    }
                    else if (typeof result === 'undefined') {
                        run = false;
                        return ctx.sendMessage(`Something Happened when checking the preconditions of command ${command.name}`);
                    }
                    run = true;
                });
                if (!run)
                    return;
                try {
                    await command.invoke(ctx);
                }
                catch (error) {
                    console.error(error);
                }
            }
        };
    }
}
exports.MessageEvent = MessageEvent;
