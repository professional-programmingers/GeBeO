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
module.exports = class ImageListCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'ilist',
            group: 'util',
            memberName: 'ilist',
            description: 'List all images added to the server.',
        });
    }
    run(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            msg.delete();
            let fileList = fh.listFile(msg.guild.id, fh.FileType.Image);
            if (!fileList.length) {
                return msg.author.send('No files added to this server yet! Add files with !iadd');
            }
            let message = 'Images available:```' + fileList.join('\n') + '```';
            return msg.author.send(message);
        });
    }
};
//# sourceMappingURL=ilist.js.map