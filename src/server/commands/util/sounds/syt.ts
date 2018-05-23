import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import * as fs from 'fs';
import * as fh from 'utils/file_helper';
import * as request from 'request';
import {Sound} from 'utils/sounds';


module.exports = class SoundGetCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'syt',
      group: 'util',
      memberName: 'syt',
      description: 'Search youtube for the given terms and play the first result',
      argsType: 'single',
      args: [
        {
          key: 'input',
          prompt: 'Enter some search terms!',
          type: 'string',
        }
      ]
    })
  }

  async run(msg: Commando.CommandMessage, {input}: any): Promise<Discord.Message | Discord.Message[]> {
    if (msg.member.voiceChannel) {
      try {
        let yttoken: string = fs.readFileSync('tokens/youtube.cfg', 'utf8');
        yttoken = yttoken.replace(/\s/g, '');
        let resp: any = await new Promise((resolve, reject) => {
          request.get('https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + input + '&type=video&key=' + yttoken, (err, resp, body) => {
            resolve(JSON.parse(body));
          })
        });
        
        Sound.queueSound(resp.items[0].id.videoId, msg.member.voiceChannel);
      }
      catch(err) {
        return msg.reply(err);
      }
    } else {
      return msg.channel.send("you have to be in a voice channel to do that!");
    }
    return msg.channel.send("Sound queued!");
  }
}
