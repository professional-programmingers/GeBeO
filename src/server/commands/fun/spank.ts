import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import * as Jimp from 'jimp';

module.exports = class SpankCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'spank',
      group: 'fun',
      memberName: 'spank',
      description: 'Have one user spank another',

      args: [
        {
          key: 'spanker',
          prompt: 'Who is doing the spanking?',
          type: 'user'
        },
        {
          key: 'spanked',
          prompt: 'Who is getting spanked?',
          type: 'user'
        }
      ]
    })
  }

  async run(msg: Commando.CommandMessage, args: any): Promise<Discord.Message | Discord.Message[]> {
    let spank: Jimp.Jimp = await Jimp.read('./resources/spank.jpg');
    let spankerLoc: string = args.spanker.displayAvatarURL;
    let spankedLoc: string = args.spanked.displayAvatarURL;
    if (spankerLoc.substring(spankerLoc.length - 4) == "webp") {
      spankerLoc = spankerLoc.slice(0, -4) + "jpg";
    }
    if (spankedLoc.substring(spankedLoc.length - 4) == "webp") {
      spankedLoc = spankedLoc.slice(0, -4) + "jpg";
    }
    let spanker: Jimp.Jimp = await Jimp.read(spankerLoc);
    let spanked: Jimp.Jimp = await Jimp.read(spankedLoc);
    spanker.resize(128, 128);
    spanked.resize(128, 128);
    await spank.composite(spanker, 310, 40);
    await spank.composite(spanked, 460, 290);
    let buffer: Buffer = await new Promise<Buffer>((resolve) => {
      spank.getBuffer(Jimp.MIME_JPEG, (err: Error, result: Buffer) => {
        resolve(result);
      });
    });
    return msg.channel.send('', new Discord.Attachment(buffer));
  }
}
