import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import * as fh from 'utils/file_helper';
import {Sound} from 'utils/sounds';


module.exports = class SoundGetCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'snext',
      aliases: ['sn'],
      group: 'util',
      memberName: 'snext',
      description: 'Like !s except puts the sound in front of the queue.',
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          key: 'input',
          prompt: 'Enter a sound name or link!',
          type: 'string',
        }
      ]
    } as any)
  }

  async run(msg: Commando.CommandMessage, {input}: any): Promise<Discord.Message | Discord.Message[]> {
    if (msg.member.voiceChannel) {
      try {
        await Sound.queueSound(input, msg.member.voiceChannel, true);
      }
      catch(err) {
        return msg.reply(err);
      }
    } else {
      return msg.reply("You have to be in a voice channel to do that!");
    }
    return msg.reply("Sound queued!");
  }
}
