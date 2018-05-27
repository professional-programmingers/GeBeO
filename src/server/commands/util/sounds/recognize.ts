import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import * as fh from 'utils/file_helper';
import * as fs from 'fs';
import {Sound} from 'utils/sounds';
import {Receiver} from 'utils/receiver';


module.exports = class RecognizeCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'recognize',
      group: 'util',
      memberName: 'recognize',
      description: 'TEST COMMAND PLS REMOVE',
      argsType: 'single',
      aliases: ['rec'],
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          key: 'input',
          prompt: 'Enter a path!',
          type: 'string',
        }
      ]
    } as any)
  }

  async run(msg: Commando.CommandMessage, {input}: any): Promise<Discord.Message | Discord.Message[]> {
    let message: string = await Receiver.recognizeFile(input);
    return msg.channel.send(message);
  }
}
