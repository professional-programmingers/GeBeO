import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import * as fh from 'utils/file_helper';
import {Sound} from 'utils/sounds';


module.exports = class SoundGetCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'sclear',
      group: 'util',
      memberName: 'sclear',
      description: 'Clear the queue and disconnect the bot from the user\'s current voice channel.',
    })
  }

  async run(msg: Commando.CommandMessage, arg: any): Promise<Discord.Message | Discord.Message[]> {
    if (msg.member.voiceChannel) {
      try {
        Sound.clearQueue(msg.member.voiceChannel);
      }
      catch(err) {
        console.log(err);
        return msg.reply(err);
      }
    } else {
      return msg.channel.send("you have to be in a voice channel to do that!");
    }
    return msg.channel.send("Queue cleared and bot disconnected!");
  }
}
