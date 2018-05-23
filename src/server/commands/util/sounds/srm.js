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
module.exports = class SoundRemoveCommand extends Commando.Command {
    constructor(client) {
        let commandInfo = {
            name: 'srm',
            group: 'util',
            memberName: 'srm',
            description: 'Delete the specified file from the bot.',
            argsType: 'single',
            userPermissions: ['ADMINISTRATOR'],
            args: [
                {
                    key: 'name',
                    prompt: 'Enter an sound name!',
                    type: 'string',
                }
            ]
        };
        super(client, commandInfo);
    }
    run(msg, { name }) {
        return __awaiter(this, void 0, void 0, function* () {
            msg.delete();
            try {
                fh.removeFile(name, msg.guild.id, fh.FileType.Sound);
            }
            catch (err) {
                return msg.reply('Error: ' + err);
            }
            return msg.reply('Done');
        });
    }
};
//# sourceMappingURL=srm.js.map