import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
var cowsay = require('cowsay');

module.exports = class CowsayCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'cowsay',
      group: 'fun',
      memberName: 'cowsay',
      description: 'Make a cow(?) say something!',
      argsType: 'single'
    })
  }

  async run(msg: Commando.CommandMessage, arg: string): Promise<Discord.Message | Discord.Message[]> {
    let text: string = arg;
    if (text == '') {
      text = (await msg.channel.fetchMessages({limit: 1, before: msg.id})).last().content;
    }
    return msg.channel.send('\`\`\`\n' + cowsay.say({text: arg, r: true}) + '\`\`\`');
  }
}
