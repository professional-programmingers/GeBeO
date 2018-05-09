import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';


module.exports = class WedDetectorChannelCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'weddetectorchannel',
      group: 'admin',
      memberName: 'weddetectorchannel',
      description: 'Change the channel the wednesday detector posts to.',
      argsType: 'single'
    })
  }

  async run(msg: Commando.CommandMessage, arg: string): Promise<Discord.Message | Discord.Message[]> {    
    if (arg == 'disable' || arg == 'none' || arg == 'off' || arg == 'null') {
      (msg.guild as any).settings.set('wed_detector_channel', null)
      return msg.reply('disabled the wednesday detector!');
    } else if (arg == '') {
      (msg.guild as any).settings.set('wed_detector_channel', msg.channel.id)
      return msg.reply('set the wednesday detector to post in this channel!');
    } else {
      let channel: Discord.Channel = msg.guild.channels.get(arg);
      if (channel != undefined && channel.type == 'text') {
        let textChannel: Discord.TextChannel = channel as Discord.TextChannel;
        (msg.guild as any).settings.set('wed_detector_channel', textChannel.id)
        return msg.reply('set the wednesday detector to post in ' + textChannel.name);
      } else {
        return msg.reply('can\'t find that channel!');
      }
    }
  }
}
