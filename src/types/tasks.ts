

export interface ITask {
	name: string;
	invoke: (...args: any[]) => unknown;
}