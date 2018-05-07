import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
const path = require('path');
const __rootdir = path.dirname(require.main.filename);
const fh = require(__rootdir + '/helpers/file_helper');


module.exports = class ImageAddCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    let commandInfo: any = {
      name: 'iadd',
      group: 'util',
      memberName: 'iadd',
      description: 'Add an image to the bot.',
      argsType: 'single',
      userPermission: ['ADMINISTRATOR'],
      args: [
        {
          key: 'name',
          prompt: 'Enter a name for the attachment!',
          type: 'string',
        }
      ]
    };

    super(client, commandInfo);
  }

  async run(msg: Commando.CommandMessage, arg: any): Promise<Discord.Message | Discord.Message[]> {
    msg.delete();
    let attachment: Discord.MessageAttachment = msg.attachments.first();
    if (!attachment) {
      return msg.reply('Remember to attach a file!');
    }
    try{
      fh.addFile(attachment, msg.guild.id, arg.name, fh.FileType.Image);
    }
    catch (err) {
      return msg.reply(err);
    }
    return msg.reply('Done');
  }
}
