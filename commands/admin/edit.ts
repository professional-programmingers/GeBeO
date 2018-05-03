import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';


module.exports = class EditCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'edit',
      group: 'admin',
      memberName: 'edit',
      description: 'Edit a message that the bot sent.',
      argsType: "single"
    })
  }

  async run(msg: Commando.CommandMessage, arg: string): Promise<Discord.Message | Discord.Message[]> {
    let messageId: string = arg.split(" ")[0]
    let content: string = arg.slice(messageId.length)
    let msgToEdit: Discord.Message;
    try {
      msgToEdit = await msg.channel.fetchMessage(messageId);
    } catch (error) {
      console.log(error);
      return (await msg.reply("I can't find that message!") as Discord.Message).delete(5000);
    }
    let replyMsg: Discord.Message;
    if (content.length == 0) {
      replyMsg = await msg.reply("Please specify what to change the message to!") as Discord.Message;
    } else {
      msgToEdit.edit(content);
      replyMsg = await msg.reply("Done!") as Discord.Message;
    }
    return replyMsg.delete(5000);
  }
}
