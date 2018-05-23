"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Commando = require("discord.js-commando");
module.exports = class ExpandoPrefixCommand extends Commando.Command {
    constructor(client) {
        let commandInfo = {
            name: 'expandoprefix',
            group: 'admin',
            memberName: 'expandoprefix',
            description: 'Change the prefix of expando channels.',
            userPermissions: ['ADMINISTRATOR'],
            argsType: 'single',
        };
        super(client, commandInfo);
    }
    run(msg, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            let oldPrefix = msg.guild.settings.get('expando_name_prefix', '🎮 ');
            let newPrefix;
            arg = arg.replace(/```/g, '');
            if (arg != "") {
                msg.guild.settings.set('expando_name_prefix', arg);
                newPrefix = arg;
                yield msg.reply('set the prefix for expando channels to be \`\`\`' + arg + '\`\`\`');
            }
            else {
                msg.guild.settings.set('expando_name_prefix', '🎮 ');
                newPrefix = '🎮 ';
                yield msg.reply('set the prefix for expando channels back to default, \`' + newPrefix + '\`');
            }
            msg.guild.channels.forEach((value, key) => {
                if (value.type == 'voice' && value.name.substring(0, oldPrefix.length) == oldPrefix) {
                    value.setName(newPrefix + value.name.substring(oldPrefix.length, value.name.length));
                }
            });
            return;
        });
    }
};
//# sourceMappingURL=expandoprefix.js.map