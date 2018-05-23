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
const sounds_1 = require("utils/sounds");
module.exports = class SoundGetCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'sq',
            group: 'util',
            memberName: 'sq',
            description: 'Print the queue for the voice channel the user is currently in.',
        });
    }
    run(msg, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (msg.member.voiceChannel) {
                try {
                    return msg.channel.send('\`\`\`' + sounds_1.Sound.getQueueMessage(msg.member.voiceChannel) + '\`\`\`');
                }
                catch (err) {
                    if (err instanceof TypeError) {
                        return msg.reply('not playing anything in your channel!');
                    }
                    console.log(err);
                    return msg.reply(err);
                }
            }
            else {
                return msg.channel.send("you have to be in a voice channel to do that!");
            }
        });
    }
};
//# sourceMappingURL=sq.js.map