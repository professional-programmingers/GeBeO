import * as Commando from "discord.js-commando";
import * as path from "path";
import * as fs from "fs";

process.on('unhandledRejection', console.error);

const client: Commando.Client = new Commando.Client({
  owner: "137429565063692289"
});

client.registry
  .registerGroups([
    ['fun', 'Fun'],
    ['util', 'Util']
  ])
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, 'commands'));

let token: string = fs.readFileSync("tokens/discord.cfg", "utf8");

token = token.replace(/\s/g, "");

client.on('ready', () => {
  console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
})

client.login(token);
