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
const fs = require("fs");
const ytdl = require("ytdl-core");
const fh = require("./file_helper");
const bot_1 = require("./bot");
var SoundType;
(function (SoundType) {
    SoundType[SoundType["YouTube"] = 0] = "YouTube";
    SoundType[SoundType["File"] = 1] = "File";
})(SoundType || (SoundType = {}));
class SoundItem {
    constructor(name, rs, soundType, timeStamp) {
        this.name = name;
        this.rs = rs;
        this.soundType = soundType;
        this.timeStamp = timeStamp;
    }
}
class SoundClass {
    constructor() {
        this.addBot = (client, isMain) => {
            this.botPool.push(new bot_1.Bot(client, isMain));
        };
        this.getNextBot = (voiceChannelId) => {
            for (let i = 0; i < this.botPool.length; i++) {
                if (!this.botPool[i].isConnected(voiceChannelId) && this.botPool[i].client.channels.get(voiceChannelId) != undefined) {
                    return this.botPool[i];
                }
            }
            return null;
        };
        this.playNext = (voiceChannelId) => __awaiter(this, void 0, void 0, function* () {
            let cQueue = this.queueDict.get(voiceChannelId);
            if (cQueue.queue.length == 0) {
                if (cQueue.bot) {
                    cQueue.bot.disconnect(voiceChannelId);
                }
                this.queueDict.delete(voiceChannelId);
                return;
            }
            if (!cQueue.bot) {
                cQueue.bot = this.getNextBot(voiceChannelId);
                if (!cQueue.bot) {
                    throw 'No bot is available';
                }
            }
            yield cQueue.bot.connect(voiceChannelId);
            cQueue.playing = cQueue.queue.shift();
            cQueue.dispatcher = cQueue.bot.play(voiceChannelId, cQueue.playing.rs, cQueue.playing.timeStamp || 0);
            cQueue.dispatcher.on('end', () => {
                this.playNext(voiceChannelId);
            });
        });
        this.getQueueAndPlaying = (voiceChannel) => {
            return [this.queueDict.get(voiceChannel.id).playing].concat(this.queueDict.get(voiceChannel.id).queue);
        };
        this.chanHasBot = (voiceChannel) => {
            if (this.queueDict.get(voiceChannel.id)) {
                return true;
            }
            return false;
        };
        this.skipSound = (voiceChannel) => {
            this.queueDict.get(voiceChannel.id).dispatcher.end();
        };
        this.clearQueue = (voiceChannel) => {
            let cQueue = this.queueDict.get(voiceChannel.id);
            if (cQueue.bot) {
                cQueue.bot.disconnect(voiceChannel.id);
            }
            this.queueDict.delete(voiceChannel.id);
        };
        this.getQueueMessage = (voiceChannel) => {
            let message = '';
            let counter = 1;
            let cQueue = this.queueDict.get(voiceChannel.id);
            message += 'Playing: ' + cQueue.playing.name + '\n';
            for (let i = 0; i < cQueue.queue.length; i++) {
                if (cQueue.queue[i]) {
                    message += '#' + counter + ': ' + cQueue.queue[i].name + '\n';
                    counter++;
                }
            }
            return message;
        };
        this.queueSound = (soundInput, voiceChannel, next = false) => __awaiter(this, void 0, void 0, function* () {
            let soundPromise = this.parseSoundInput(soundInput, voiceChannel);
            this.preQueue.push([soundPromise, voiceChannel.id, next]);
            try {
                yield this.queueNext();
            }
            catch (err) {
                throw err;
            }
        });
        this.queueNext = () => __awaiter(this, void 0, void 0, function* () {
            if (this.preQueueLocked || this.preQueue.length == 0) {
                return;
            }
            this.preQueueLocked = true;
            let [soundPromise, voiceChannelId, next] = this.preQueue.shift();
            let soundItem;
            try {
                soundItem = yield soundPromise;
            }
            catch (err) {
                this.preQueueLocked = false;
                throw err;
            }
            if (this.queueDict.has(voiceChannelId)) {
                if (next) {
                    this.queueDict.get(voiceChannelId).queue.unshift(soundItem);
                }
                else {
                    this.queueDict.get(voiceChannelId).queue.push(soundItem);
                }
            }
            else {
                let soundQueue = [soundItem];
                let channelQueue = {
                    channelId: voiceChannelId,
                    queue: soundQueue,
                    bot: null,
                    playing: null,
                    dispatcher: null
                };
                this.queueDict.set(voiceChannelId, channelQueue);
                this.playNext(voiceChannelId);
            }
            this.preQueueLocked = false;
            this.queueNext();
        });
        this.parseSoundInput = (soundInput, voiceChannel) => __awaiter(this, void 0, void 0, function* () {
            let soundItem = new SoundItem(null, null, null);
            try {
                let filePath = fh.getFile(soundInput, voiceChannel.guild.id, fh.FileType.Sound);
                soundItem.rs = fs.createReadStream(filePath);
                soundItem.name = soundInput;
                soundItem.soundType = SoundType.File;
                return soundItem;
            }
            catch (err) {
            }
            try {
                let info = yield ytdl.getInfo(soundInput);
                soundItem.soundType = SoundType.YouTube;
                soundItem.name = info.title;
                soundItem.rs = ytdl.downloadFromInfo(info);
                try {
                    soundItem.timeStamp = this.parseTimeStamp(soundInput);
                }
                catch (err) {
                    console.log("Error with parseTimeStamp:\n" + err.stack);
                    soundItem.timeStamp = 0;
                }
                return soundItem;
            }
            catch (err) {
                throw 'Invalid sound file or link!';
            }
        });
        this.parseTimeStamp = (link) => {
            let match = /(t=|start=).*?(?=&|$)/.exec(link);
            if (match) {
                match = match[0];
            }
            else {
                return null;
            }
            let timeStamp = match.split('=')[1].toLowerCase();
            let ret = 0;
            if (/h/.test(timeStamp)) {
                let hour;
                [hour, timeStamp] = timeStamp.split('h');
                ret += Number(hour) * 3600;
            }
            if (/m/.test(timeStamp)) {
                let minute;
                [minute, timeStamp] = timeStamp.split('m');
                ret += Number(minute) * 60;
            }
            timeStamp = timeStamp.replace(/s/, '');
            ret += Number(timeStamp);
            return ret;
        };
        this.queueDict = new Map();
        this.botPool = [];
        this.preQueue = [];
        this.preQueueLocked = false;
    }
}
exports.SoundClass = SoundClass;
exports.Sound = new SoundClass();
//# sourceMappingURL=sounds.js.map