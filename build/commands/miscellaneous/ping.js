"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PingCommand = void 0;
class PingCommand {
    constructor() {
        this.name = "ping";
        this.aliases = ["latency"];
        this.category = "Miscellaneous";
        this.description = "Displays my current latency";
        this.invoke = async (ctx) => {
            const api = ctx.client.ws.ping;
            ctx.sendMessage(`Pong! Discord Api latency is ${api} ms.`);
        };
    }
}
exports.PingCommand = PingCommand;
