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
module.exports = class ReactCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'react',
            group: 'fun',
            memberName: 'react',
            description: 'React to the previous message or a specified message (by id).',
            examples: [
                '!react <comment_id> ay lmao', '!react very go0d'
            ],
            args: [
                {
                    key: 'content',
                    prompt: 'Enter in your reactions. Optional: Enter in the message id before the reactions',
                    type: 'string',
                },
            ],
        });
        this.emojitable = {
            'a': '🇦',
            'b': '🇧',
            'c': '🇨',
            'd': '🇩',
            'e': '🇪',
            'f': '🇫',
            'g': '🇬',
            'h': '🇭',
            'i': '🇮',
            'j': '🇯',
            'k': '🇰',
            'l': '🇱',
            'm': '🇲',
            'n': '🇳',
            'o': '🇴',
            'p': '🇵',
            'q': '🇶',
            'r': '🇷',
            's': '🇸',
            't': '🇹',
            'u': '🇺',
            'v': '🇻',
            'w': '🇼',
            'x': '🇽',
            'y': '🇾',
            'z': '🇿',
            '!': '❗',
            '?': '❓',
            ' ': ['⬜', '◻', '◽', '▫'],
            '0': '0⃣',
            '1': '1⃣',
            '2': '2⃣',
            '3': '3⃣',
            '4': '4⃣',
            '5': '5⃣',
            '6': '6⃣',
            '7': '7⃣',
            '8': '8⃣',
            '9': '9⃣',
        };
    }
    run(msg, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            let content = arg.content;
            let targetMessage;
            try {
                targetMessage = yield msg.channel.fetchMessage(content.split(' ')[0]);
                content = content.split(' ').slice(1).join(' ');
            }
            catch (_a) {
                targetMessage = (yield msg.channel.fetchMessages({ limit: 1, before: msg.id })).last();
            }
            let spaceCounter = 0;
            for (let i = 0; i < content.length; i++) {
                let emoji = null;
                if (content[i] == ' ') {
                    if (spaceCounter < this.emojitable[content[i]].length) {
                        emoji = this.emojitable[content[i]][spaceCounter];
                        spaceCounter++;
                    }
                }
                else {
                    emoji = this.emojitable[content[i]];
                }
                if (emoji != null) {
                    try {
                        yield targetMessage.react(emoji);
                    }
                    catch (err) {
                        if (err instanceof Discord.DiscordAPIError) {
                            return;
                        }
                    }
                }
            }
            return msg.delete();
        });
    }
};
//# sourceMappingURL=react.js.map