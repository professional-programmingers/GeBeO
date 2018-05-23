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
const fs = require("fs");
const request = require("request");
const sounds_1 = require("utils/sounds");
module.exports = class SoundGetCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'syt',
            group: 'util',
            memberName: 'syt',
            description: 'Search youtube for the given terms and play the first result',
            argsType: 'single',
            args: [
                {
                    key: 'input',
                    prompt: 'Enter some search terms!',
                    type: 'string',
                }
            ]
        });
    }
    run(msg, { input }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (msg.member.voiceChannel) {
                try {
                    let yttoken = fs.readFileSync('tokens/youtube.cfg', 'utf8');
                    yttoken = yttoken.replace(/\s/g, '');
                    let resp = yield new Promise((resolve, reject) => {
                        request.get('https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + input + '&type=video&key=' + yttoken, (err, resp, body) => {
                            resolve(JSON.parse(body));
                        });
                    });
                    sounds_1.Sound.queueSound(resp.items[0].id.videoId, msg.member.voiceChannel);
                }
                catch (err) {
                    return msg.reply(err);
                }
            }
            else {
                return msg.channel.send("you have to be in a voice channel to do that!");
            }
            return msg.channel.send("Sound queued!");
        });
    }
};
//# sourceMappingURL=syt.js.map