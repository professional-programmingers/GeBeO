import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
let wordDef = require('word-definition');

module.exports = class CowsayCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'define',
      group: 'fun',
      memberName: 'define',
      description: 'Prints the definition of a word',
      args: [
        {
          key: 'word',
          prompt: 'Word to define',
          type: 'string'
        },
        {
          key: 'language',
          prompt: 'Language the word is in',
          type: 'string',
          default: 'en'
        }
      ]
    })
  }

  async run(msg: Commando.CommandMessage, args: any): Promise<Discord.Message | Discord.Message[]> {
    let def = await new Promise<any>((fulfilled, rejected) => {
      wordDef.getDef(args.word, args.language, {exact: false}, fulfilled)
    });

    if (!def.definition) {
      return msg.channel.send(
        `Unable to define the word **${args.word}**`
      )
    }

    return msg.channel.send(
      `**${def.word}** *(${def.category})*\n*${def.definition}*`)
  }
}
