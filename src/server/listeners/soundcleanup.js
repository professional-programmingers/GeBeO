"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sounds_1 = require("utils/sounds");
module.exports = function (client) {
    client.on('voiceStateUpdate', (oldMember, newMember) => {
        if (oldMember.voiceChannelID == newMember.voiceChannelID) {
            return;
        }
        if (oldMember.voiceChannel != null &&
            oldMember.voiceChannel.members.size == 1 &&
            sounds_1.Sound.chanHasBot(oldMember.voiceChannel)) {
            sounds_1.Sound.clearQueue(oldMember.voiceChannel);
        }
    });
};
//# sourceMappingURL=soundcleanup.js.map