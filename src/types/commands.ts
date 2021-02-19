import { PermissionString } from "discord.js";
import { CommandContext } from "./commandContext";


export interface ICommand {
    name: string;
    aliases?: string[];
    description?: string;
    usage?: string[];
    category?: string;
    enable?: boolean;
	permission?: {
		user?: PermissionString[];
		self?: PermissionString[];
	}
	preconditions?: [(ctx: CommandContext) => boolean | string];
    
    invoke: (ctx: CommandContext) => unknown;
};
