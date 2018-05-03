import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import * as Jimp from 'jimp';
import * as request from 'request';
import * as fs from 'fs';
let webp: any = require('webp-converter');

module.exports = class SpankCommand extends Commando.Command {
  constructor(client: Commando.Client) {
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
    let spankerStream: fs.WriteStream = fs.createWriteStream('./cache/spanker.webp')
    await request(args.spanker.displayAvatarURL()).pipe(spankerStream);
    spankerStream.close();
    // if (fs.existsSync('./cache/spanker.jpg')) {
    //   fs.unlink('./cache/spanker.jpg', err => console.log(err));
    // }
    await this.convertWebP('./cache/spanker.webp');
    let spankedStream: fs.WriteStream = fs.createWriteStream('./cache/spanked.webp')
    await request(args.spanked.displayAvatarURL()).pipe(spankedStream);
    spankedStream.close();
    // if (fs.existsSync('./cache/spanked.jpg')) {
    //   fs.unlink('./cache/spanked.jpg', err => console.log(err));
    // }
    console.log(await this.convertWebP('./cache/spanked.webp'));
    let spanker: Jimp.Jimp = await Jimp.read('./cache/spanker.jpg');
    let spanked: Jimp.Jimp = await Jimp.read('./cache/spanked.jpg');
    await spank.composite(spanker, 310, 40);
    await spank.composite(spanked, 460, 290);
    let buffer: Buffer = await new Promise<Buffer>((resolve) => {
      spank.getBuffer(Jimp.MIME_JPEG, (err: Error, result: Buffer) => {
        resolve(result);
      });
    });
    return msg.channel.send('', new Discord.MessageAttachment(buffer));
  }

  async convertWebP(webploc: string): Promise<any> {
    let jpgloc: String = webploc.slice(0, -4);
    jpgloc += 'jpg';
    return new Promise(resolve => webp.dwebp(webploc, jpgloc, '-o', resolve));
  }
}
