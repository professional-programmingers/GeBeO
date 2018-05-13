import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import * as fh from 'helpers/file_helper';


module.exports = class SoundRemoveCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    let commandInfo: any = {
      name: 'srm',
      group: 'util',
      memberName: 'srm',
      description: 'Delete the specified file from the bot.',
      argsType: 'single',
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          key: 'name',
          prompt: 'Enter an sound name!',
          type: 'string',
        }
      ]
    }
    super(client, commandInfo);


  }

  async run(msg: Commando.CommandMessage, {name}: any): Promise<Discord.Message | Discord.Message[]> {
    msg.delete();
    try {
      fh.removeFile(name, msg.guild.id, fh.FileType.Sound);
    }
    catch (err) {
      return msg.reply('Error: ' + err);
    }
    return msg.reply('Done');
  }
}
