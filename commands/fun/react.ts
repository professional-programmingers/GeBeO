import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';

module.exports = class ReactCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'react',
      group: 'fun',
      memberName: 'react',
      description: 'React to the previous message with the command arguments.',
      argsType: 'single'
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

  async run(msg: Commando.CommandMessage, arg: string): Promise<Discord.Message | Discord.Message[]> {
    let lastMessage: Discord.Message = (await msg.channel.fetchMessages({limit: 1, before: msg.id})).last();
    let spaceCounter: number = 0;
    for (let i = 0; i < arg.length; i++) {
      let emoji: string = null;
      if (arg[i] == ' ') {
        if (spaceCounter < this.emojitable[arg[i]].length) {
          emoji = this.emojitable[arg[i]][spaceCounter];
          spaceCounter++;
        }
      } else {
        emoji = this.emojitable[arg[i]];
      }
      if (emoji != null) {
        try {
          await lastMessage.react(emoji);
        } catch (err) {
          if (err instanceof Discord.DiscordAPIError) {
            return;
          }
        }
        await lastMessage.react(emoji);
      }
    }
    return msg.delete();
  }
}
