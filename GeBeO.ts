import * as Discord from 'discord.js';
import * as Commando from "discord.js-commando";
import * as path from "path";
import * as fs from "fs";
import {Sound} from 'utils/sounds';
const sqlite = require('sqlite');


process.on('unhandledRejection', console.error);

const client: Commando.CommandoClient = new Commando.CommandoClient({
  owner: ["137429565063692289", "127564963270098944", "167460739764846592"],
  restTimeOffset: 100
});

client.setProvider(
	sqlite.open(path.join(__dirname, 'guilds/database.sqlite3')).then((db: any) => new Commando.SQLiteProvider(db))
).catch(console.error);

client.registry
  .registerGroups([
    ['fun', 'Fun'],
    ['util', 'Util'],
    ['admin', 'Administration'],
    ['images', 'Images'],
    ['sounds', 'Sounds'],
  ])
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, 'commands'))
  .registerCommandsIn(path.join(__dirname, 'commands/util'));

client.on('ready', () => {
  console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
})
client.on("error", (e) => {console.error(e)});
client.on("warn", (e) => {console.warn(e)});
client.on("commandError", (command, err, message, args, pattern) => 
  {
    console.log("Error from command: " + command.name);
    console.log(err);
  });

client.on('raw', async (event: any) => {
  if (event.t !== 'MESSAGE_REACTION_ADD' && event.t !== 'MESSAGE_REACTION_REMOVE') return;

	const { d: data } = event;
	const user = client.users.get(data.user_id);
	const channel: Discord.TextChannel | Discord.DMChannel = client.channels.get(data.channel_id) as Discord.TextChannel || await user.createDM();

	// if the message is already in the cache, don't re-emit the event
	if (channel.messages.has(data.message_id)) return;

	// if you're on the master/v12 branch, use `channel.messages.fetch()`
	const message = await channel.fetchMessage(data.message_id);

	// custom emojis reactions are keyed in a `name:ID` format, while unicode emojis are keyed by names
	// if you're on the master/v12 branch, custom emojis reactions are keyed by their ID
	const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
  const reaction = message.reactions.get(emojiKey);
  
  if (event.t == 'MESSAGE_REACTION_ADD') client.emit('messageReactionAdd', reaction, user);
  if (event.t == 'MESSAGE_REACTION_REMOVE') client.emit('messageReactionRemove', reaction, user);
});

let listeners: string[] = ['expando', 'daydetector', 'soundcleanup'];

for (let i = 0; i < listeners.length; i++) {
  const listener: any = require('./listeners/' + listeners[i]);
  listener(client);
}

let token: string = fs.readFileSync('tokens/discord.cfg', 'utf8');

token = token.replace(/\s/g, '');
client.login(token);

Sound.addBot(client as Discord.Client, true);

if(fs.existsSync('tokens/helper.json')){
  let helperTokens: string[] = JSON.parse(fs.readFileSync('tokens/helper.json', 'utf8'));
  for(let i = 0; i < helperTokens.length; i++){
    let bot_client: Discord.Client = new Discord.Client();
    bot_client.login(helperTokens[i]);
    Sound.addBot(bot_client, false);
  }
}
