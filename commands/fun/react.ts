import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';

module.exports = class ReactCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'react',
      group: 'fun',
      memberName: 'react',
      description: 'React to the previous message or a specified message (by id).',
      examples: [
        '!react <comment_id> ay lmao', '!react very go0d'
      ],
      args: [
        {
          key: 'content',
          prompt: 'Enter in your reactions. Optional: Enter in the message id before the reactions',
          type: 'string',
        },
      ],
    })

    this.emojitable = {
      'a': '🇦',
      'b': '🇧',
      'c': '🇨',
      'd': '🇩',
      'e': '🇪',
      'f': '🇫',
      'g': '🇬',
      'h': '🇭',
      'i': '🇮',
      'j': '🇯',
      'k': '🇰',
      'l': '🇱',
      'm': '🇲',
      'n': '🇳',
      'o': '🇴',
      'p': '🇵',
      'q': '🇶',
      'r': '🇷',
      's': '🇸',
      't': '🇹',
      'u': '🇺',
      'v': '🇻',
      'w': '🇼',
      'x': '🇽',
      'y': '🇾',
      'z': '🇿',
      '!': '❗',
      '?': '❓',
      ' ': ['⬜', '◻', '◽', '▫'],
      '0': '0⃣',
      '1': '1⃣',
      '2': '2⃣',
      '3': '3⃣',
      '4': '4⃣',
      '5': '5⃣',
      '6': '6⃣',
      '7': '7⃣',
      '8': '8⃣',
      '9': '9⃣',
    }
  }

  emojitable: any;

  async run(msg: Commando.CommandMessage, arg: any): Promise<Discord.Message | Discord.Message[]> {
    let content: any = arg.content;
    let targetMessage: Discord.Message;
    try{
      targetMessage = await msg.channel.fetchMessage(content.split(' ')[0]);
      content = content.split(' ').slice(1).join(' ');
    }
    catch{
      targetMessage = (await msg.channel.fetchMessages({limit: 1, before: msg.id})).last();
    }
    let spaceCounter: number = 0;
    for (let i = 0; i < content.length; i++) {
      let emoji: string = null;
      if (content[i] == ' ') {
        if (spaceCounter < this.emojitable[content[i]].length) {
          emoji = this.emojitable[content[i]][spaceCounter];
          spaceCounter++;
        }
      } else {
        emoji = this.emojitable[content[i]];
      }
      if (emoji != null) {
        try {
          await targetMessage.react(emoji);
        } catch (err) {
          if (err instanceof Discord.DiscordAPIError) {
            return;
          }
        }
        await targetMessage.react(emoji);
      }
    }
    return msg.delete();
  }
}
