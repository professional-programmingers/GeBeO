import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';

module.exports = class VoteCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'vote',
      group: 'util',
      memberName: 'vote',
      description: 'Create a vote.',
      argsType: 'single'
    })
  }

  async run(msg: Commando.CommandMessage, arg: string): Promise<Discord.Message | Discord.Message[]> {
    let text: string = arg;
    if (text == '') {
      return (await msg.reply('You didn\'t give anything to vote over!') as Discord.Message).delete(5000);
    }
    let voteMsg: Discord.Message = await msg.channel.send(text) as Discord.Message;
    await voteMsg.react('✅');
    await voteMsg.react('❎');
    return;
  }
}
