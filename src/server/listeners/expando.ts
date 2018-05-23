import * as Discord from 'discord.js';
import * as Commando from 'discord.js-commando';

async function expandoUpdate(oldMember: Discord.GuildMember, newMember: Discord.GuildMember) {
    if (oldMember.voiceChannelID == newMember.voiceChannelID) {
        return;
    }

    let oldPrefix: string = (oldMember.guild as any).settings.get('expando_name_prefix', '🎮 ') as string;
    let newPrefix: string = (newMember.guild as any).settings.get('expando_name_prefix', '🎮 ') as string;

    if (oldMember.voiceChannel != null &&
        oldMember.voiceChannel.members.size == 0 &&
        oldMember.voiceChannel.name.substring(0, oldPrefix.length) == oldPrefix) {
        
        await oldMember.voiceChannel.delete();
    }

    if (newMember.voiceChannel != null &&
        newMember.voiceChannel.members.size == 1 &&
        newMember.voiceChannel.name.substring(0, newPrefix.length) == newPrefix) {

        await update_empty_channel(newMember.guild, newMember.voiceChannel, newPrefix);
    }
}

async function update_empty_channel(guild: Discord.Guild, channel: Discord.VoiceChannel, prefix: string) {
    let lastPos: number = 0;
    let passedChan: boolean = false;
    
    guild.channels.forEach((value: Discord.GuildChannel, key: string) => {
        if (value.id == channel.id) {
            passedChan = true;
        }
        if (passedChan) {
            if (value.name.substring(0, prefix.length) == prefix && value.type == 'voice') {
                lastPos = value.position;
            } else {
                return;
            }    
        }
    });

    let name: string = (guild as any).settings.get('expando_default_name', 'Game Room') as string;

    let newChan = await guild.createChannel(prefix + name, 'voice');
    if (channel.parent) {
        await newChan.setParent(channel.parent);
    }
    if (lastPos < guild.channels.size) {
        newChan.setPosition(lastPos + 1);
    }
}

module.exports = function(client: Commando.CommandoClient) {
    client.on('voiceStateUpdate', expandoUpdate)
}