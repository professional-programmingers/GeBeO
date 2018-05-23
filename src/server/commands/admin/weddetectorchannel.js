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
module.exports = class WedDetectorChannelCommand extends Commando.Command {
    constructor(client) {
        let commandInfo = {
            name: 'weddetectorchannel',
            group: 'admin',
            memberName: 'weddetectorchannel',
            description: 'Change the channel the wednesday detector posts to.',
            userPermissions: ['ADMINISTRATOR'],
            argsType: 'single',
        };
        super(client, commandInfo);
    }
    run(msg, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (arg == 'disable' || arg == 'none' || arg == 'off' || arg == 'null') {
                msg.guild.settings.set('wed_detector_channel', null);
                return msg.reply('disabled the wednesday detector!');
            }
            else if (arg == '') {
                msg.guild.settings.set('wed_detector_channel', msg.channel.id);
                return msg.reply('set the wednesday detector to post in this channel!');
            }
            else {
                let channel = msg.guild.channels.get(arg);
                if (channel != undefined && channel.type == 'text') {
                    let textChannel = channel;
                    msg.guild.settings.set('wed_detector_channel', textChannel.id);
                    return msg.reply('set the wednesday detector to post in ' + textChannel.name);
                }
                else {
                    return msg.reply('can\'t find that channel!');
                }
            }
        });
    }
};
//# sourceMappingURL=weddetectorchannel.js.map