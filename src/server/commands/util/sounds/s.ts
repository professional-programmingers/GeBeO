import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import * as fh from 'utils/file_helper';
import {Sound} from 'utils/sounds';


module.exports = class SoundGetCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 's',
      group: 'util',
      memberName: 's',
      description: 'Play the specified sound file or link into the caller\'s voice channel.',
      argsType: 'single',
      args: [
        {
          key: 'input',
          prompt: 'Enter a sound name or link!',
          type: 'string',
        }
      ]
    })
  }

  async run(msg: Commando.CommandMessage, {input}: any): Promise<Discord.Message | Discord.Message[]> {
    if (msg.member.voiceChannel) {
      let respMsg: Discord.Message = await msg.channel.send('Queueing...') as Discord.Message;
      try {
        await Sound.queueSound(input, msg.member.voiceChannel, false, respMsg);
      }
      catch(err) {
        console.log(err);
        return respMsg.edit(err);
      }
    } else {
      return msg.reply("You have to be in a voice channel to do that!");
    }
  }
}
