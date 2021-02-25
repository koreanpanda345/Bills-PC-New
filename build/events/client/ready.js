"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadyEvent = void 0;
class ReadyEvent {
    constructor(_client) {
        this._client = _client;
        this.name = "ready";
        this.invoke = async () => {
            var _a, _b;
            // const gs = new GoogleSheets();
            // await gs.get();
            // console.log(`${this._client.user?.username} is ready`);
            (_a = this._client.user) === null || _a === void 0 ? void 0 : _a.setStatus("online");
            (_b = this._client.user) === null || _b === void 0 ? void 0 : _b.setActivity({ name: `Prefix: ${process.env.PREFIX}Help | In ${this._client.guilds.cache.size} Servers` });
        };
    }
}
exports.ReadyEvent = ReadyEvent;
