import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import * as fh from 'utils/file_helper';
import {Sound} from 'utils/sounds';


module.exports = class SoundGetCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'sq',
      group: 'util',
      memberName: 'sq',
      description: 'Print the queue for the voice channel the user is currently in.',
    })
  }

  async run(msg: Commando.CommandMessage, arg: any): Promise<Discord.Message | Discord.Message[]> {
    if (msg.member.voiceChannel) {
      try {
        return msg.channel.send('\`\`\`' + Sound.getQueueMessage(msg.member.voiceChannel) + '\`\`\`');
      }
      catch(err) {
        if (err instanceof TypeError) {
          return msg.reply('not playing anything in your channel!');
        }
        console.log(err);
        return msg.reply(err);
      }
    } else {
      return msg.channel.send("you have to be in a voice channel to do that!");
    }
  }
}
