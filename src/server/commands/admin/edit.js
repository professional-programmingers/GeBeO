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
module.exports = class EditCommand extends Commando.Command {
    constructor(client) {
        let commandInfo = {
            name: 'edit',
            group: 'admin',
            memberName: 'edit',
            description: 'Edit a message that the bot sent.',
            userPermissions: ['ADMINISTRATOR'],
            argsType: 'single',
        };
        super(client, commandInfo);
    }
    run(msg, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            let messageId = arg.split(" ")[0];
            let content = arg.slice(messageId.length);
            let msgToEdit;
            try {
                msgToEdit = yield msg.channel.fetchMessage(messageId);
            }
            catch (error) {
                console.log(error);
                return (yield msg.reply("I can't find that message!")).delete(5000);
            }
            let replyMsg;
            if (content.length == 0) {
                replyMsg = (yield msg.reply("Please specify what to change the message to!"));
            }
            else {
                msgToEdit.edit(content);
                replyMsg = (yield msg.reply("Done!"));
            }
            return replyMsg.delete(5000);
        });
    }
};
//# sourceMappingURL=edit.js.map