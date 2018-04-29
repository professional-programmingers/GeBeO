import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';

module.exports = class DisapproveCommand extends Commando.Command {
  constructor(client: Commando.Client) {
    super(client, {
      name: 'disapprove',
      group: 'fun',
      memberName: 'disapprove',
      description: 'ಠ_ಠ',
    })
  }

  async run(msg: Commando.CommandMessage, arg: any): Promise<Discord.Message | Discord.Message[]> {
    return msg.channel.send('ಠ_ಠ');
  }
}
