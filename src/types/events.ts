

export interface IEvent {
	name: string;
	invoke: (...args: any[]) => unknown;
};