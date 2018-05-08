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
      return msg.reply('this command must be used in a guild!');
    }

    let prefix: string = (msg.guild as any).settings.get('expando_name_prefix', '🎮 ') as string;

    if (!msg.member.voiceChannel || msg.member.voiceChannel.name.substring(0, prefix.length) != prefix) {
      return msg.reply('you must be in an expando channel to use this command!');
    }
    
    if (arg == "") {
      let name: string = (msg.guild as any).settings.get('expando_default_name', 'Game Room') as string;
      msg.member.voiceChannel.setName(prefix + ' ' + name);
      return msg.reply('set the name of the expando channel you\'re in to \`' + prefix + name + '\`');
    } else {
      msg.member.voiceChannel.setName(prefix + ' ' + arg);
      return msg.reply('set the name of the expando channel you\'re in to \`' + prefix + arg + '\`');
    }

  }
}
