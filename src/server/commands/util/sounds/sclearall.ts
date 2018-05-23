import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import * as fh from 'utils/file_helper';
import {Sound} from 'utils/sounds';


module.exports = class SoundGetCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    let commandInfo: any = {
      name: 'sclearall',
      group: 'util',
      memberName: 'sclearall',
      description: 'Disconnect all bots and clear all queues in the server',
      userPermissions: ['ADMINISTRATOR'],
    };

    super(client, commandInfo);
  }

  async run(msg: Commando.CommandMessage, arg: any): Promise<Discord.Message | Discord.Message[]> {
    msg.guild.channels.forEach((channel: Discord.Channel) => {
      if (channel instanceof Discord.VoiceChannel) {
        try {
          Sound.clearQueue(channel);
        }
        catch(err) {
          console.log(err);
        }    
      }
    })
    return msg.channel.send("All queues cleared and all bots disconnected!");
  }
}
