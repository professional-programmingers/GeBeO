import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';


module.exports = class RenameVCCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'renamevc',
      group: 'util',
      memberName: 'renamevc',
      description: 'Rename the current expando channel.',
      argsType: 'single'
    })
  }

  async run(msg: Commando.CommandMessage, arg: string): Promise<Discord.Message | Discord.Message[]> {
    if (!msg.member) {
      return msg.reply('must be in a server voice chat to do that!');
    }

    if (!msg.member.voiceChannel || msg.member.voiceChannel.name[0] == '🎮') {
      return msg.reply('must be in an expando channel to use this command!');
    }
    
    if (arg == "") {
      let name: string = (msg.guild as any).settings.get('expando_default_name', 'Game Room') as string;
      let prefix: string = (msg.guild as any).settings.get('expando_name_prefix', '🎮') as string;
      msg.member.voiceChannel.setName(prefix + ' ' + name);
      return msg.reply('set the name of the expando channel you\'re in to \`' + prefix + ' ' + name + '\`');
    } else {
      let prefix: string = (msg.guild as any).settings.get('expando_name_prefix', '🎮') as string;
      msg.member.voiceChannel.setName(prefix + ' ' + arg);
      return msg.reply('set the name of the expando channel you\'re in to \`' + prefix + ' ' + arg + '\`');
    }

  }
}
