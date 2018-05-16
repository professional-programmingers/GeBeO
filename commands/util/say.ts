import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';


module.exports = class SayCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'say',
      group: 'util',
      memberName: 'say',
      description: 'Make the bot say something.',
      argsType: 'single'
    })
  }

  async run(msg: Commando.CommandMessage, arg: string): Promise<Discord.Message | Discord.Message[]> {
    if (arg != "") {
      return msg.channel.send(arg);
    } else {
      return msg.reply("...what am I supposed to say?");
    }
  }
}
