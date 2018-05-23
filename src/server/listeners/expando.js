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
function expandoUpdate(oldMember, newMember) {
    return __awaiter(this, void 0, void 0, function* () {
        if (oldMember.voiceChannelID == newMember.voiceChannelID) {
            return;
        }
        let oldPrefix = oldMember.guild.settings.get('expando_name_prefix', '🎮 ');
        let newPrefix = newMember.guild.settings.get('expando_name_prefix', '🎮 ');
        if (oldMember.voiceChannel != null &&
            oldMember.voiceChannel.members.size == 0 &&
            oldMember.voiceChannel.name.substring(0, oldPrefix.length) == oldPrefix) {
            yield oldMember.voiceChannel.delete();
        }
        if (newMember.voiceChannel != null &&
            newMember.voiceChannel.members.size == 1 &&
            newMember.voiceChannel.name.substring(0, newPrefix.length) == newPrefix) {
            yield update_empty_channel(newMember.guild, newMember.voiceChannel, newPrefix);
        }
    });
}
function update_empty_channel(guild, channel, prefix) {
    return __awaiter(this, void 0, void 0, function* () {
        let lastPos = 0;
        let passedChan = false;
        guild.channels.forEach((value, key) => {
            if (value.id == channel.id) {
                passedChan = true;
            }
            if (passedChan) {
                if (value.name.substring(0, prefix.length) == prefix && value.type == 'voice') {
                    lastPos = value.position;
                }
                else {
                    return;
                }
            }
        });
        let name = guild.settings.get('expando_default_name', 'Game Room');
        let newChan = yield guild.createChannel(prefix + name, 'voice');
        if (channel.parent) {
            yield newChan.setParent(channel.parent);
        }
        if (lastPos < guild.channels.size) {
            newChan.setPosition(lastPos + 1);
        }
    });
}
module.exports = function (client) {
    client.on('voiceStateUpdate', expandoUpdate);
};
//# sourceMappingURL=expando.js.map