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
module.exports = class Rot26Command extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'rot26',
            group: 'fun',
            memberName: 'rot26',
            description: 'I\'m not sure what you were expecting.',
            argsType: 'single'
        });
    }
    run(msg, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            let text = arg;
            if (text == '') {
                text = (yield msg.channel.fetchMessages({ limit: 1, before: msg.id })).last().content;
            }
            return msg.channel.send(text);
        });
    }
};
//# sourceMappingURL=rot26.js.map