import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';

module.exports = class Rot13Command extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'rot13',
      group: 'fun',
      memberName: 'rot13',
      description: 'Encrypt something in a super secret and super secure encryption method.',
      argsType: 'single'
    })
  }

  async run(msg: Commando.CommandMessage, arg: string): Promise<Discord.Message | Discord.Message[]> {
    let text: string = arg;
    if (text == '') {
      text = (await msg.channel.fetchMessages({limit: 1, before: msg.id})).last().content;
    }
    text = text.replace(/[a-zA-Z]/g,function(c: any){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);});
    return msg.channel.send(text);
  }
}
