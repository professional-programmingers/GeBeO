import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';

module.exports = class Rot26Command extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'rot26',
      group: 'fun',
      memberName: 'rot26',
      description: 'I\'m not sure what you were expecting.',
      argsType: 'single'
    })
  }

  async run(msg: Commando.CommandMessage, arg: string): Promise<Discord.Message | Discord.Message[]> {
    let text: string = arg;
    if (text == '') {
      text = (await msg.channel.fetchMessages({limit: 1, before: msg.id})).last().content;
    }
    return msg.channel.send(text);
  }
}
