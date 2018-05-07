import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
const path = require('path');
const __rootdir = path.dirname(require.main.filename);
const fh = require(__rootdir + '/helpers/file_helper');


module.exports = class ImageGetCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'i',
      group: 'util',
      memberName: 'i',
      description: 'Send the specified image to the channel.',
      argsType: 'single',
      args: [
        {
          key: 'name',
          prompt: 'Enter an image name!',
          type: 'string',
        }
      ]
    })
  }

  async run(msg: Commando.CommandMessage, {name}: any): Promise<Discord.Message | Discord.Message[]> {
    let imageAttachment: string;
    try {
      imageAttachment = fh.getFile(name, msg.guild.id, fh.FileType.Image);
    }
    catch (err) {
      msg.reply(err);
    }
    return msg.channel.send({file: {attachment: imageAttachment, name: 'file.png'}});
  }
}
