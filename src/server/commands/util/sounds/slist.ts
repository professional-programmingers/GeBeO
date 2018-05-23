import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import * as path from 'path';
import * as fh from 'utils/file_helper';


module.exports = class SoundListCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'slist',
      group: 'util',
      memberName: 'slist',
      description: 'List all sounds added to the server.',
    })
  }

  async run(msg: Commando.CommandMessage): Promise<Discord.Message | Discord.Message[]> {
    msg.delete();
    let fileList: string[] = fh.listFile(msg.guild.id, fh.FileType.Sound);
    if (!fileList.length){
      return msg.author.send('No sounds added to this server yet! Add sounds with !sadd');
    }
    let message: string = 'Sounds available:```' + fileList.join('\n') + '```';
    return msg.author.send(message);
  }
}
