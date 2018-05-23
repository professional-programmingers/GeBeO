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
module.exports = class TimerCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'timer',
            group: 'util',
            memberName: 'timer',
            description: 'Set a timer.',
            argsType: 'single'
        });
    }
    run(msg, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            let args_split = arg.split(" ");
            let duration;
            let length;
            if (args_split.length == 1) {
                duration = Number(args_split[0]);
                if (duration === NaN) {
                    return msg.reply("Invalid duration!");
                }
                length = 100;
            }
            else if (args_split.length >= 2) {
                duration = Number(args_split[0]);
                if (duration === NaN) {
                    return msg.reply("Invalid duration!");
                }
                length = Number(args_split[1]);
                if (length === NaN) {
                    return msg.reply("Invalid length!");
                }
            }
            if (duration < 1) {
                return msg.reply("Duration must be longer than 0!");
            }
            if (length < 1) {
                return msg.reply("Length must be longer than 0!");
            }
            yield this.timertask(duration, length, Date.now(), msg.channel);
            return msg.delete();
        });
    }
    timertask(duration, length, startTime, channel) {
        return __awaiter(this, void 0, void 0, function* () {
            let counter = 1;
            let text = "\`\`\`diff\n-  0 |" + " ".repeat(length) + "| " + duration + "\n\`\`\`";
            let message = yield channel.send(text);
            let diffTime = Math.floor((Date.now() - startTime) / 1000);
            while (diffTime < duration) {
                yield new Promise(resolve => setTimeout(resolve, 1000));
                diffTime = Math.floor((Date.now() - startTime) / 1000);
                let currentTime = diffTime > duration ? duration : diffTime;
                if (currentTime <= duration / 3) {
                    text = "\`\`\`diff\n-";
                }
                else if (currentTime <= duration * 2 / 3) {
                    text = "\`\`\`diff\n ";
                }
                else {
                    text = "\`\`\`diff\n+";
                }
                text += " " + currentTime + " |";
                let progress = Math.round(currentTime / duration * length);
                if (progress > 0) {
                    text += "-".repeat(progress);
                }
                if (length - progress > 0) {
                    text += " ".repeat(length - progress);
                }
                text += "| " + duration + "\n\`\`\`";
                yield message.edit(text);
            }
            message.react("⏰");
        });
    }
};
//# sourceMappingURL=timer.js.map