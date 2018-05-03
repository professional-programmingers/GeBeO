import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';

function timertask(duration: number, length: number, startTime: number, msg: Discord.Message) {
  let text: string;
  let diffTime: number = Math.floor((Date.now() - startTime) / 1000);
  let currentTime: number = diffTime > duration ? duration : diffTime;
  if (currentTime <= duration / 3) {
    text = "\`\`\`diff\n-";
  } else if (currentTime <= duration * 2/3) {
    text = "\`\`\`diff\n ";
  } else {
    text = "\`\`\`diff\n+";
  }
  text += " " + currentTime + " |";
  let progress: number = Math.round(currentTime / duration * length);
  if (progress > 0) {
    text += "-".repeat(progress);
  }
  if (length - progress > 0) {
    text += " ".repeat(length - progress);
  }
  text += "| " + duration + "\n\`\`\`";
  msg.edit(text).then((value: Discord.Message) => {
    if (diffTime <= duration) {
      setTimeout(timertask, 1000, duration, length, startTime, value);
    } else {
      value.react('⏰');
    }
  })
}

module.exports = class TimerCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'timer',
      group: 'util',
      memberName: 'timer',
      description: 'Set a timer.',
      argsType: 'single'
    })
  }

  async run(msg: Commando.CommandMessage, arg: string): Promise<Discord.Message | Discord.Message[]> {
    let args_split: string[] = arg.split(" ");
    let duration: number;
    let length: number;
    if (args_split.length == 1) {
      duration = Number(args_split[0]);
      if (duration === NaN) {
        return msg.reply("Invalid duration!");
      }
      length = 100;
    } else if (args_split.length >= 2) {
      duration = Number(args_split[0]);
      if (duration === NaN) {
        return msg.reply("Invalid duration!");
      }
      length = Number(args_split[1]);
      if (length === NaN) {
        return msg.reply("Invalid length!");
      }
    }
    if (duration < 1) {
      return msg.reply("Duration must be longer than 0!");
    }
    if (length < 1) {
      return msg.reply("Length must be longer than 0!")
    }
    let counter: number = 1;
    let text: string = "\`\`\`diff\n-  0 |" + " ".repeat(length) + "| " + duration + "\n\`\`\`";
    let message: Discord.Message = await msg.channel.send(text) as Discord.Message;
    setTimeout(timertask, 1000, duration, length, Date.now(), message);
  }
}
