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
module.exports = class RenameVCCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'renamevc',
            group: 'util',
            memberName: 'renamevc',
            description: 'Rename the current expando channel.',
            argsType: 'single'
        });
    }
    run(msg, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!msg.member) {
                return msg.reply('this command must be used in a guild!');
            }
            let prefix = msg.guild.settings.get('expando_name_prefix', '🎮 ');
            if (!msg.member.voiceChannel || msg.member.voiceChannel.name.substring(0, prefix.length) != prefix) {
                return msg.reply('you must be in an expando channel to use this command!');
            }
            if (arg == "") {
                let name = msg.guild.settings.get('expando_default_name', 'Game Room');
                msg.member.voiceChannel.setName(prefix + ' ' + name);
                return msg.reply('set the name of the expando channel you\'re in to \`' + prefix + name + '\`');
            }
            else {
                msg.member.voiceChannel.setName(prefix + ' ' + arg);
                return msg.reply('set the name of the expando channel you\'re in to \`' + prefix + arg + '\`');
            }
        });
    }
};
//# sourceMappingURL=renamevc.js.map