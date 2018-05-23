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
            name: 'snext',
            aliases: ['sn'],
            group: 'util',
            memberName: 'snext',
            description: 'Like !s except puts the sound in front of the queue.',
            userPermissions: ['ADMINISTRATOR'],
            args: [
                {
                    key: 'input',
                    prompt: 'Enter a sound name or link!',
                    type: 'string',
                }
            ]
        });
    }
    run(msg, { input }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (msg.member.voiceChannel) {
                try {
                    yield sounds_1.Sound.queueSound(input, msg.member.voiceChannel, true);
                }
                catch (err) {
                    return msg.reply(err);
                }
            }
            else {
                return msg.reply("You have to be in a voice channel to do that!");
            }
            return msg.reply("Sound queued!");
        });
    }
};
//# sourceMappingURL=snext.js.map