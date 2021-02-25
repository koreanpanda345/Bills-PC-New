"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandContext = void 0;
class CommandContext {
    constructor(_message, _args, _client) {
        var _a, _b;
        this._message = _message;
        this._args = _args;
        this._client = _client;
        this._guild = this._message.guild;
        this._guildId = (_a = this._guild) === null || _a === void 0 ? void 0 : _a.id;
        this._channel = this._message.channel;
        this._channelId = this._channel.id;
        this._user = this._message.author;
        this._userId = this._user.id;
        this._member = this._message.member;
        this._me = (_b = this._guild) === null || _b === void 0 ? void 0 : _b.me;
    }
    sendMessage(content) {
        return this.channel.send(content);
    }
    get message() { return this._message; }
    get args() { return this._args; }
    get client() { return this._client; }
    get guild() { return this._guild; }
    get guildId() { return this._guildId; }
    get channel() { return this._channel; }
    get channelId() { return this._channelId; }
    get user() { return this._user; }
    get userId() { return this._userId; }
    get member() { return this._member; }
    get me() { return this._me; }
}
exports.CommandContext = CommandContext;
