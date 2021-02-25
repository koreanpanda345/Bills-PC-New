"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpCommand = void 0;
const discord_js_1 = require("discord.js");
class HelpCommand {
    constructor() {
        this.name = "help";
        this.aliases = ["command", "commands"];
        this.description = "Displays a list of commands, or information about a specific command.";
        this.category = "Miscellaneous";
        this.usage = ["b!help", "b!help ping"];
        this.invoke = async (ctx) => {
            var _a;
            let prefix = process.env.PREFIX;
            let embed = new discord_js_1.MessageEmbed();
            embed.setColor('RANDOM');
            if (!ctx.args[0]) {
                embed.setTitle("List of commands");
                embed.setDescription(`Prefix: ${prefix}\nTotal Commands: ${ctx.client.commands.size}`);
                const categorys = [
                    "Miscellaneous",
                    "Tools",
                    "Draft",
                ];
                categorys.forEach(cat => {
                    const cmds = ctx.client.commands.filter(cmd => { var _a; return ((_a = cmd.category) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === cat.toLowerCase(); });
                    let desc = "";
                    cmds.forEach(cmd => {
                        desc += `- ${cmd.name}\n`;
                    });
                    embed.addField(`${cat}`, desc);
                });
            }
            else {
                let search = ctx.args[0].toLowerCase();
                const command = ctx.client.commands.get(search) || ctx.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(search));
                if (!command) {
                    embed.setColor('RED');
                    embed.setTitle("Couldn't find command.");
                    embed.setDescription(`I couldn't find a command called \`${search}\` Please make sure you spelt it correctly.`);
                    return ctx.sendMessage(embed);
                }
                embed.setTitle(`Information on ${command.name}`);
                embed.setDescription(`Description: ${command.description || "No Description was provided."}\nUsage: ${((_a = command.usage) === null || _a === void 0 ? void 0 : _a.join(", ")) || "No Usage was provided."}\nCategory: ${command.category || "Uncategorized."}`);
            }
            ctx.sendMessage(embed);
        };
    }
}
exports.HelpCommand = HelpCommand;
