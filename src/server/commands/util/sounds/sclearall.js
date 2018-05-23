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
const Discord = require("discord.js");
const sounds_1 = require("utils/sounds");
module.exports = class SoundGetCommand extends Commando.Command {
    constructor(client) {
        let commandInfo = {
            name: 'sclearall',
            group: 'util',
            memberName: 'sclearall',
            description: 'Disconnect all bots and clear all queues in the server',
            userPermissions: ['ADMINISTRATOR'],
        };
        super(client, commandInfo);
    }
    run(msg, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            msg.guild.channels.forEach((channel) => {
                if (channel instanceof Discord.VoiceChannel) {
                    try {
                        sounds_1.Sound.clearQueue(channel);
                    }
                    catch (err) {
                        console.log(err);
                    }
                }
            });
            return msg.channel.send("All queues cleared and all bots disconnected!");
        });
    }
};
//# sourceMappingURL=sclearall.js.map