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
            name: 'sclear',
            group: 'util',
            memberName: 'sclear',
            description: 'Clear the queue and disconnect the bot from the user\'s current voice channel.',
        });
    }
    run(msg, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (msg.member.voiceChannel) {
                try {
                    sounds_1.Sound.clearQueue(msg.member.voiceChannel);
                }
                catch (err) {
                    return msg.reply(err);
                }
            }
            else {
                return msg.channel.send("you have to be in a voice channel to do that!");
            }
            return msg.channel.send("Queue cleared and bot disconnected!");
        });
    }
};
//# sourceMappingURL=sclear.js.map