

export interface IMonitors {
	name: string;
	invoke: (...args: any) => unknown;
}