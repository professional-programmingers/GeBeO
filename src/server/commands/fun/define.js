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
let wordDef = require('word-definition');
module.exports = class CowsayCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'define',
            group: 'fun',
            memberName: 'define',
            description: 'Prints the definition of a word',
            args: [
                {
                    key: 'word',
                    prompt: 'Word to define',
                    type: 'string'
                },
                {
                    key: 'language',
                    prompt: 'Language the word is in',
                    type: 'string',
                    default: 'en'
                }
            ]
        });
    }
    run(msg, args) {
        return __awaiter(this, void 0, void 0, function* () {
            let def = yield new Promise((fulfilled, rejected) => {
                wordDef.getDef(args.word, args.language, { exact: false }, fulfilled);
            });
            if (!def.definition) {
                return msg.channel.send(`Unable to define the word **${args.word}**`);
            }
            return msg.channel.send(`**${def.word}** *(${def.category})*\n*${def.definition}*`);
        });
    }
};
//# sourceMappingURL=define.js.map