"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillsPC = void 0;
const discord_js_1 = require("discord.js");
const inscriber_1 = require("@koreanpanda/inscriber");
const fs_1 = require("fs");
class BillsPC extends discord_js_1.Client {
    constructor() {
        super();
        this._commands = new discord_js_1.Collection();
        this._logger = new inscriber_1.Inscriber();
        this._events = new discord_js_1.Collection();
        this._timers = new discord_js_1.Collection();
        this._runningMonitors = new discord_js_1.Collection();
        this._executingMonitors = new discord_js_1.Collection();
        this._idleMonitors = new discord_js_1.Collection();
    }
    start(type) {
        //console.debug(JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT as string));
        this.loadFiles(type);
        this.login(process.env.TOKEN);
        // This is for background process, like drafts, and such.
        setInterval(async () => {
            var _a;
            for (let i = 0; i < this._runningMonitors.size; i++) {
                if (!this._executingMonitors.has(this._runningMonitors.keyArray()[i])) {
                    this._executingMonitors.set(this._runningMonitors.keyArray()[i], this._runningMonitors.get(this._runningMonitors.keyArray()[i]));
                    await ((_a = this._executingMonitors.get(this._runningMonitors.keyArray()[i])) === null || _a === void 0 ? void 0 : _a.invoke());
                }
            }
        }, 3000);
    }
    loadFiles(type) {
        this.loadCommands(type);
        this.loadEvents(type);
    }
    loadCommands(type) {
        const folder = type === "development" ? "./src/commands" : "./build/commands";
        const dirs = fs_1.readdirSync(folder);
        dirs.forEach(async (dir) => {
            const files = fs_1.readdirSync(`${folder}/${dir}`).filter(d => d.endsWith(".js") || d.endsWith(".ts"));
            for (let file of files) {
                Promise.resolve().then(() => __importStar(require(`../${folder}/${dir}/${file}`))).then(instance => {
                    const name = file.split(".")[0].charAt(0).toUpperCase() + file.split(".")[0].slice(1);
                    const command = new instance[`${name}Command`](this);
                    this._commands.set(command.name, command);
                });
            }
        });
    }
    loadEvents(type) {
        const folder = type === "development" ? "./src/events" : "./build/events";
        const dirs = fs_1.readdirSync(folder);
        dirs.forEach(async (dir) => {
            const files = fs_1.readdirSync(`${folder}/${dir}`).filter(d => d.endsWith(".js") || d.endsWith(".ts"));
            for (let file of files) {
                Promise.resolve().then(() => __importStar(require(`../${folder}/${dir}/${file}`))).then(instance => {
                    const name = file.split(".")[0].charAt(0).toUpperCase() + file.split(".")[0].slice(1);
                    const event = new instance[`${name}Event`](this);
                    this._events.set(event.name, event);
                    this.on(event.name, (...args) => event.invoke(...args));
                });
            }
        });
    }
    get commands() { return this._commands; }
    get logger() { return this._logger; }
    get events() { return this._events; }
    get timers() { return this._timers; }
    get runningMonitors() { return this._runningMonitors; }
    get executingMonitors() { return this._executingMonitors; }
    get idleMonitors() { return this._idleMonitors; }
}
exports.BillsPC = BillsPC;
