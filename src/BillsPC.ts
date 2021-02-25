import {Client, Collection} from "discord.js";
import {Inscriber} from "@koreanpanda/inscriber";
import { ICommand } from "./types/commands";
import { IEvent } from "./types/events";
import { readdirSync } from "fs";
import { IMonitors } from "./types/monitors";
import { GoogleSheets } from "./modules/GoogleSheets";
export class BillsPC extends Client
{
    private readonly _commands: Collection<string, ICommand>;
    private readonly _logger: Inscriber;
    private readonly _events: Collection<string, IEvent>;
	private readonly _timers: Collection<string, number>;
	private readonly _runningMonitors: Collection<string, IMonitors>;
	private readonly _executingMonitors: Collection<string, IMonitors>;
	private readonly _idleMonitors: Collection<string, IMonitors>;
	constructor() {
        super();
        this._commands = new Collection<string, any>();
        this._logger = new Inscriber();
        this._events = new Collection<string, any>();
		this._timers = new Collection<string, number>();
		this._runningMonitors = new Collection<string, IMonitors>();
		this._executingMonitors = new Collection<string, IMonitors>();
		this._idleMonitors = new Collection<string, IMonitors>();
    }

	public start(type: "development" | "production") {
		//console.debug(JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT as string));

		this.loadFiles(type);
		this.login(process.env.TOKEN);

		// This is for background process, like drafts, and such.
		setInterval(async () => {
			for(let i = 0; i < this._runningMonitors.size; i++) {
				if(!this._executingMonitors.has(this._runningMonitors.keyArray()[i])) {
					this._executingMonitors.set(this._runningMonitors.keyArray()[i], this._runningMonitors.get(this._runningMonitors.keyArray()[i])!);
					await this._executingMonitors.get(this._runningMonitors.keyArray()[i])?.invoke();
				}
			}
		}, 10000);
	}

	public loadFiles(type: "development" | "production") {
		this.loadCommands(type);
		this.loadEvents(type);
	}
	private loadCommands(type: "development" | "production") {
		const folder = type === "development" ? "./src/commands" : "./build/commands";
		const dirs = readdirSync(folder);
		dirs.forEach(async dir => {
			const files = readdirSync(`${folder}/${dir}`).filter(d => d.endsWith(".js") || d.endsWith(".ts"));
			for(let file of files) {
				import(`../${folder}/${dir}/${file}`).then(instance => {
					const name = file.split(".")[0].charAt(0).toUpperCase() + file.split(".")[0].slice(1);
					const command: ICommand = new instance[`${name}Command`](this);
					this._commands.set(command.name, command);
				})
			}
		});
	}
	private loadEvents(type: "development" | "production") {
		const folder = type === "development" ? "./src/events" : "./build/events";
		const dirs = readdirSync(folder);
		dirs.forEach(async dir => {
			const files = readdirSync(`${folder}/${dir}`).filter(d => d.endsWith(".js") || d.endsWith(".ts"));
			for(let file of files) {
				import(`../${folder}/${dir}/${file}`).then(instance => {
				const name = file.split(".")[0].charAt(0).toUpperCase() + file.split(".")[0].slice(1);
					const event: IEvent = new instance[`${name}Event`](this);
					this._events.set(event.name, event);
					this.on(event.name, (...args) => event.invoke(...args));
				});
			}
		})
	}
	
    public get commands() { return this._commands; }
    public get logger() { return this._logger; }
    public get events() { return this._events; }
	public get timers() { return this._timers; }
	public get runningMonitors() { return this._runningMonitors; }
	public get executingMonitors() { return this._executingMonitors; }
	public get idleMonitors() { return this._idleMonitors; }

}
