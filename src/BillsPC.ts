import {Client, Collection} from "discord.js";
import {Inscriber} from "@koreanpanda/inscriber";
import { ICommand } from "./types/commands";
import { IEvent } from "./types/events";
import { readdirSync } from "fs";
export class BillsPC extends Client
{
    private readonly _commands: Collection<string, ICommand>;
    private readonly _logger: Inscriber;
    private readonly _events: Collection<string, IEvent>;
	private readonly _timers: Collection<string, number>;
    constructor() {
        super();
        this._commands = new Collection<string, any>();
        this._logger = new Inscriber();
        this._events = new Collection<string, any>();
		this._timers = new Collection<string, number>();
    }

	public start(type: "development" | "production") {
		this.loadFiles(type);
		this.login(process.env.TOKEN);
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
					console.log(`Command ${command.name} was loaded.`);
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

}
