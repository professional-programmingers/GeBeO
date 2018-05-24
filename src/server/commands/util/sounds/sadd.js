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
const fh = require("utils/file_helper");
module.exports = class SoundAddCommand extends Commando.Command {
    constructor(client) {
        let commandInfo = {
            name: 'sadd',
            group: 'util',
            memberName: 'sadd',
            description: 'Add an image to the bot.',
            argsType: 'single',
            userPermissions: ['ADMINISTRATOR'],
            clientPermissions: ['ADMINISTRATOR'],
            args: [
                {
                    key: 'name',
                    prompt: 'Enter a name for the attachment!',
                    type: 'string',
                }
            ]
        };
        super(client, commandInfo);
    }
    run(msg, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            msg.delete();
            let attachment = msg.attachments.first();
            if (!attachment) {
                return msg.reply('Remember to attach a file!');
            }
            try {
                fh.addFile(attachment, msg.guild.id, arg.name, fh.FileType.Sound);
            }
            catch (err) {
                return msg.reply(err);
            }
            return msg.reply('Done');
        });
    }
};
//# sourceMappingURL=sadd.js.map