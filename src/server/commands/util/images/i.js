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
module.exports = class ImageGetCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'i',
            group: 'util',
            memberName: 'i',
            description: 'Send the specified image to the channel.',
            argsType: 'single',
            args: [
                {
                    key: 'name',
                    prompt: 'Enter an image name!',
                    type: 'string',
                }
            ]
        });
    }
    run(msg, { name }) {
        return __awaiter(this, void 0, void 0, function* () {
            let imageAttachment;
            try {
                imageAttachment = fh.getFile(name, msg.guild.id, fh.FileType.Image);
            }
            catch (err) {
                msg.reply(err);
            }
            return msg.channel.send({ file: { attachment: imageAttachment } });
        });
    }
};
//# sourceMappingURL=i.js.map