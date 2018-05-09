import * as Commando from "discord.js-commando";
import * as path from "path";
import * as fs from "fs";
const sqlite = require('sqlite');

process.on('unhandledRejection', console.error);

const client: Commando.CommandoClient = new Commando.CommandoClient({
  owner: ["137429565063692289", "127564963270098944"]
});

client.setProvider(
	sqlite.open(path.join(__dirname, 'database.sqlite3')).then((db: any) => new Commando.SQLiteProvider(db))
).catch(console.error);

client.registry
  .registerGroups([
    ['fun', 'Fun'],
    ['util', 'Util'],
    ['admin', 'Administration'],
    ['images', 'Images'],
  ])
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, 'commands'))
  .registerCommandsIn(path.join(__dirname, 'commands/util'));

let token: string = fs.readFileSync("tokens/discord.cfg", "utf8");

token = token.replace(/\s/g, "");

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

let listeners: string[] = ['expando', 'daydetector'];

for (let i = 0; i < listeners.length; i++) {
  const listener: any = require('./listeners/' + listeners[i]);
  listener(client);
}

client.login(token);
