import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
const path = require('path');
const __rootdir = path.dirname(require.main.filename);
const fh = require(__rootdir + '/helpers/file_helper');


module.exports = class ImageRemoveCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    let commandInfo: any = {
      name: 'irm',
      group: 'util',
      memberName: 'irm',
      description: 'Delete the specified file from the bot.',
      argsType: 'single',
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          key: 'name',
          prompt: 'Enter an image name!',
          type: 'string',
        }
      ]
    }
    super(client, commandInfo);


  }

  async run(msg: Commando.CommandMessage, {name}: any): Promise<Discord.Message | Discord.Message[]> {
    msg.delete();
    try {
      fh.removeFile(name, msg.guild.id, fh.FileType.Image);
    }
    catch (err) {
      return msg.reply('Error: ' + err);
    }
    return msg.reply('Done');
  }
}
