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
module.exports = class MockCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'rt',
            group: 'fun',
            memberName: 'rt',
            description: 'Send some text or the previous message as if you had temporarily forgotten how to speak.',
            argsType: 'single'
        });
    }
    run(msg, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            let text = arg;
            if (text == '') {
                text = (yield msg.channel.fetchMessages({ limit: 1, before: msg.id })).last().content;
            }
            let rtText = '';
            for (let i = 0; i < text.length; i++) {
                rtText += Math.random() >= 0.5 ? '' : text[i].toUpperCase();
            }
            return msg.channel.send(rtText);
        });
    }
};
//# sourceMappingURL=rt.js.map