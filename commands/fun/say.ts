import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';


module.exports = class SayCommand extends Commando.Command {
  constructor(client: Commando.Client) {
    super(client, {
      name: 'say',
      group: 'fun',
      memberName: 'say',
      description: 'Make the bot say something.',
      argsType: 'single'
    })
  }

  async run(msg: Commando.CommandMessage, arg: string): Promise<Discord.Message | Discord.Message[]> {
    if (arg != "") {
      return msg.channel.send(arg)
    }
  }
}
