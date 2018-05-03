import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';


module.exports = class AvatarCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'avatar',
      group: 'util',
      memberName: 'avatar',
      description: 'Get the avatar of the given user.',

      args: [
        {
          key: 'person',
          prompt: 'Who do you want to get the avatar of?',
          type: 'user'
        }
      ]
    })
  }

  async run(msg: Commando.CommandMessage, arg: any): Promise<Discord.Message | Discord.Message[]> {
    return msg.channel.send(arg.person.displayAvatarURL());
  }
}
