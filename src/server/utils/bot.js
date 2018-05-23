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
class Bot {
    constructor(client, isMain) {
        this.isConnected = (guildId) => {
            return this.guildConnected.includes(guildId);
        };
        this.connect = (voiceChannelId) => __awaiter(this, void 0, void 0, function* () {
            let voiceChannel = this.client.channels.get(voiceChannelId);
            yield voiceChannel.join();
            this.guildConnected.push(voiceChannel.guild.id);
        });
        this.disconnect = (voiceChannelId) => {
            let voiceChannel = this.client.channels.get(voiceChannelId);
            voiceChannel.connection.disconnect();
            this.guildConnected.splice(this.guildConnected.indexOf(voiceChannel.guild.id), 1);
        };
        this.play = (voiceChannelId, rs, timeStamp = 0) => {
            let voiceChannel = this.client.channels.get(voiceChannelId);
            return voiceChannel.connection.playStream(rs, { seek: timeStamp });
        };
        this.client = client;
        this.guildConnected = [];
        this.client.on('ready', () => {
            console.log(`Helper ready! logged in as ${this.client.user.username}#${this.client.user.discriminator} (${this.client.user.id})`);
            if (!isMain) {
                this.client.user.setPresence({ status: 'invisible' });
            }
        });
    }
}
exports.Bot = Bot;
//# sourceMappingURL=bot.js.map