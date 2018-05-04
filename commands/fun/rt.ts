import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';

module.exports = class MockCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'rt',
      group: 'fun',
      memberName: 'rt',
      description: 'Send some text or the previous message as if you had temporarily forgotten how to speak.',
      argsType: 'single'
    })
  }

  async run(msg: Commando.CommandMessage, arg: string): Promise<Discord.Message | Discord.Message[]> {
    let text: string = arg;
    if (text == '') {
      text = (await msg.channel.fetchMessages({limit: 1, before: msg.id})).last().content;
    }
    let rtText: string = ''
    for (let i = 0; i < text.length; i++) {
      rtText += Math.random() >= 0.5 ? '' : text[i].toUpperCase();
    }
    return msg.channel.send(rtText);
  }
}
