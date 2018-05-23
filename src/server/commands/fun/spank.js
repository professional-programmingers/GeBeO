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
const Discord = require("discord.js");
const Jimp = require("jimp");
module.exports = class SpankCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'spank',
            group: 'fun',
            memberName: 'spank',
            description: 'Have one user spank another',
            args: [
                {
                    key: 'spanker',
                    prompt: 'Who is doing the spanking?',
                    type: 'user'
                },
                {
                    key: 'spanked',
                    prompt: 'Who is getting spanked?',
                    type: 'user'
                }
            ]
        });
    }
    run(msg, args) {
        return __awaiter(this, void 0, void 0, function* () {
            let spank = yield Jimp.read('./resources/spank.jpg');
            let spankerLoc = args.spanker.displayAvatarURL;
            let spankedLoc = args.spanked.displayAvatarURL;
            if (spankerLoc.substring(spankerLoc.length - 4) == "webp") {
                spankerLoc = spankerLoc.slice(0, -4) + "jpg";
            }
            if (spankedLoc.substring(spankedLoc.length - 4) == "webp") {
                spankedLoc = spankedLoc.slice(0, -4) + "jpg";
            }
            let spanker = yield Jimp.read(spankerLoc);
            let spanked = yield Jimp.read(spankedLoc);
            spanker.resize(128, 128);
            spanked.resize(128, 128);
            yield spank.composite(spanker, 310, 40);
            yield spank.composite(spanked, 460, 290);
            let buffer = yield new Promise((resolve) => {
                spank.getBuffer(Jimp.MIME_JPEG, (err, result) => {
                    resolve(result);
                });
            });
            return msg.channel.send('', new Discord.Attachment(buffer));
        });
    }
};
//# sourceMappingURL=spank.js.map