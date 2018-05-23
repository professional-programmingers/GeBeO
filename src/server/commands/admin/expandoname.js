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
            name: 'expandoname',
            group: 'admin',
            memberName: 'expandoname',
            description: 'Change the default name of expando channels.',
            userPermissions: ['ADMINISTRATOR'],
            argsType: 'single',
        };
        super(client, commandInfo);
    }
    run(msg, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (arg != "") {
                msg.guild.settings.set('expando_default_name', arg);
                return msg.reply('set the default name for expando channels to be \`' + arg + '\`');
            }
            else {
                msg.guild.settings.set('expando_default_name', 'Game Room');
                return msg.reply('set the default name for expando channels back to stock, \`Game Room\`');
            }
        });
    }
};
//# sourceMappingURL=expandoname.js.map