import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';


module.exports = class ExpandoPrefixCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'expandoprefix',
      group: 'admin',
      memberName: 'expandoprefix',
      description: 'Change the prefix of expando channels.',
      argsType: 'single'
    })
  }

  async run(msg: Commando.CommandMessage, arg: string): Promise<Discord.Message | Discord.Message[]> {
    let oldPrefix: string = (msg.guild as any).settings.get('expando_name_prefix', '🎮 ') as string;
    let newPrefix: string;

    arg = arg.replace(/```/g, '');
    
    if (arg != "") {
      (msg.guild as any).settings.set('expando_name_prefix', arg);
      newPrefix = arg;
      await msg.reply('set the prefix for expando channels to be \`\`\`' + arg + '\`\`\`');
    } else {
      (msg.guild as any).settings.set('expando_name_prefix', '🎮 ');
      newPrefix = '🎮 ';
      await msg.reply('set the prefix for expando channels back to default, \`' + newPrefix + '\`');
    }

    msg.guild.channels.forEach((value: Discord.GuildChannel, key: string) => {
      if (value.type == 'voice' && value.name.substring(0, oldPrefix.length) == oldPrefix) {
        value.setName(newPrefix + value.name.substring(oldPrefix.length, value.name.length));
      }
    });
    return;
  }
}
