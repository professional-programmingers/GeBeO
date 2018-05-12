import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import * as path from 'path';
import * as fh from 'helpers/file_helper';


module.exports = class ImageListCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'ilist',
      group: 'util',
      memberName: 'ilist',
      description: 'List all images added to the server.',
    })
  }

  async run(msg: Commando.CommandMessage): Promise<Discord.Message | Discord.Message[]> {
    msg.delete();
    let fileList: string[] = fh.listFile(msg.guild.id, fh.FileType.Image);
    if (!fileList.length){
      return msg.author.send('No files added to this server yet! Add files with !iadd');
    }
    let message: string = 'Images available:```' + fileList.join('\n') + '```';
    return msg.author.send(message);
  }
}
