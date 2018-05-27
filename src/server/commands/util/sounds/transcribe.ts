import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import * as fh from 'utils/file_helper';
import {Receiver} from 'utils/receiver';


module.exports = class TranscribeClass extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'transcribe',
      group: 'util',
      memberName: 'transcribe',
      description: 'Transcribe everything that\'s going on in the voice channel. Places text in the called channel.',
      aliases: ['ts', 'stt'],
    } as any)
  }

  async run(msg: Commando.CommandMessage): Promise<Discord.Message | Discord.Message[]> {
    Receiver.transcribe(msg.member.voiceChannel, msg);
    return msg.channel.send('Receiving!');
  }
}
