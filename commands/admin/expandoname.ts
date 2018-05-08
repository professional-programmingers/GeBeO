import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';


module.exports = class ExpandoPrefixCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'expandoname',
      group: 'admin',
      memberName: 'expandoname',
      description: 'Change the default name of expando channels.',
      argsType: 'single'
    })
  }

  async run(msg: Commando.CommandMessage, arg: string): Promise<Discord.Message | Discord.Message[]> {    
    if (arg != "") {
      (msg.guild as any).settings.set('expando_default_name', arg);
      return msg.reply('set the default name for expando channels to be \`' + arg + '\`');
    } else {
      (msg.guild as any).settings.set('expando_default_name', 'Game Room');
      return msg.reply('set the default name for expando channels back to stock, \`Game Room\`');
    }
  }
}
