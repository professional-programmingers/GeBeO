import * as Discord from 'discord.js';
import * as Commando from 'discord.js-commando';
import {Sound} from 'utils/sounds';

module.exports = function(client: Commando.CommandoClient) {
    client.on('voiceStateUpdate', (oldMember: Discord.GuildMember, newMember: Discord.GuildMember) => {
        if (oldMember.voiceChannelID == newMember.voiceChannelID) {
            return;
        }

        if (oldMember.voiceChannel != null &&
            oldMember.voiceChannel.members.size == 1 &&
            Sound.chanHasBot(oldMember.voiceChannel)) {
            
            Sound.clearQueue(oldMember.voiceChannel);
        }
    });
}