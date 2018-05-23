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
module.exports = class AvatarCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'avatar',
            group: 'util',
            memberName: 'avatar',
            description: 'Get the avatar of the given user.',
            args: [
                {
                    key: 'person',
                    prompt: 'Who do you want to get the avatar of?',
                    type: 'user'
                }
            ]
        });
    }
    run(msg, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            return msg.channel.send(arg.person.displayAvatarURL);
        });
    }
};
//# sourceMappingURL=avatar.js.map