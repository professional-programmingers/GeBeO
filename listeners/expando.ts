import * as Discord from 'discord.js';
import * as Commando from 'discord.js-commando';

async function expandoUpdate(oldMember: Discord.GuildMember, newMember: Discord.GuildMember) {
    console.log('ayy lmao');
}

module.exports = function(client: Commando.CommandoClient) {
    client.on('voiceStateUpdate', expandoUpdate)
}