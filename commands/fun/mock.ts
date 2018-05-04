import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';

module.exports = class MockCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'mock',
      group: 'fun',
      memberName: 'mock',
      description: 'Make fun of some text or the previous message.',
      argsType: 'single'
    })
  }

  async run(msg: Commando.CommandMessage, arg: string): Promise<Discord.Message | Discord.Message[]> {
    let text: string = arg;
    if (text == '') {
      text = (await msg.channel.fetchMessages({limit: 1, before: msg.id})).last().content;
    }
    let mockText: string = ''
    for (let i = 0; i < text.length; i++) {
      mockText += Math.random() >= 0.5 ? text[i].toLowerCase() : text[i].toUpperCase();
    }
    return msg.channel.send(mockText);
  }
}
