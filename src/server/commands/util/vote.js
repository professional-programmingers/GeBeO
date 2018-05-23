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
module.exports = class VoteCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'vote',
            group: 'util',
            memberName: 'vote',
            description: 'Create a vote.',
            argsType: 'single'
        });
    }
    run(msg, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            let text = arg;
            if (text == '') {
                return (yield msg.reply('You didn\'t give anything to vote over!')).delete(5000);
            }
            let voteMsg = yield msg.channel.send(text);
            yield voteMsg.react('✅');
            yield voteMsg.react('❎');
            return;
        });
    }
};
//# sourceMappingURL=vote.js.map