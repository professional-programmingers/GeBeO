import * as Discord from 'discord.js';
import * as Commando from "discord.js-commando";
import * as path from "path";
import * as fs from "fs";
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as request from 'request';
import * as uuid from 'uuid/v4';
import * as socketio from 'socket.io';
import * as http from 'http';
import * as expresssession from 'express-session';
import * as sharedsession from 'express-socket.io-session';
import {Sound} from 'utils/sounds';
import { httpify } from 'caseless';
const sqlite = require('sqlite');
const lokistore = require('connect-loki');


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



let secret: string = fs.readFileSync('tokens/discordsecret.cfg', 'utf8');

let tokenStore: Map<string, string> = new Map<string, string>();

const app = express();

let server = http.createServer(app);

let io = socketio(server);

let LokiStore = lokistore(expresssession);

let session = expresssession({
  store: new LokiStore({}),
  secret: 'it\'s a secret to everybody',
  resave: true,
  saveUninitialized: true
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session);

io.use(sharedsession(session));

io.on('connection', async (socket: any) => {
  if (socket.handshake.session.discord == undefined) {
    socket.disconnect(true);
  }

  let user: Discord.User = await client.fetchUser(socket.handshake.session.discord.user);
  let vcid: string = null;
  let vcname: string = null;
  client.guilds.forEach((guild: Discord.Guild) => {
    let member = guild.members.get(user.id);
    if (member) {
      let vc = member.voiceChannel;
      if (vc) {
        vcid = vc.id;
        vcname = vc.name;
        return;
      }
    }
  })

  let queue = Sound.getQueue(vcid);
  let playing = Sound.getQueue(vcid);
  if (queue == null && playing == null) {
    socket.emit('update queue', null, null, vcname);
  } else {
    let nameQueue: string[] = [];
    Sound.getQueue(vcid).forEach((sounditem: any) => {
      nameQueue.push(sounditem.name);
    })
    socket.emit('update queue', nameQueue, Sound.getPlaying(vcid).name, vcname);  
  }

  client.on('voiceStateUpdate', (oldMember: Discord.GuildMember, newMember: Discord.GuildMember) => {
    if (oldMember.user == user) {
      vcid = newMember.voiceChannelID;
      if (vcid) {
        vcname = newMember.voiceChannel.name;
      } else {
        vcname = null;
      }
      let queue = Sound.getQueue(vcid);
      let playing = Sound.getQueue(vcid);
      if (queue == null && playing == null) {
        socket.emit('update queue', null, null, vcname);
      } else {
        let nameQueue: string[] = [];
        Sound.getQueue(vcid).forEach((sounditem: any) => {
          nameQueue.push(sounditem.name);
        })
        socket.emit('update queue', nameQueue, Sound.getPlaying(vcid).name, vcname);  
      }
    }
  })

  Sound.on('queue update', (queue, playing, qvcid) => {
    if (vcid == qvcid) {
      if (queue == null && playing == null) {
        socket.emit('update queue', null, null, vcname);
      }
      let nameQueue: string[] = [];
      queue.forEach((sounditem: any) => {
        nameQueue.push(sounditem.name);
      })
      socket.emit('update queue', nameQueue, playing.name, vcname);
    }
  })
})

app.get('/', (req: any, res: any) => {
  if (req.session.discord) {
    res.sendFile(path.join(__dirname, '../../dist/client/index.html'));
  } else {
    res.redirect('/login');
  }
})

app.use(express.static('dist/client'));

app.get('/redirect', (req: any, res: any) => {
  let options = {
    url: 'https://discordapp.com/api/oauth2/token',
    qs: {
      client_id: '331891933066690560',
      client_secret: secret,
      grant_type: 'authorization_code',
      code: req.query.code,
      redirect_uri: 'http://localhost/redirect'
    }
  }
  request.post(options, (err, resp: request.Response, body) => {
    if (resp.statusCode == 200) {
      let objResp = JSON.parse(body);
      let options: request.Options = {
        url: 'https://discordapp.com/api/v6/users/@me',
        headers: {
          'Authorization': 'Bearer ' + objResp.access_token
        }
      }
      request.get(options, async (err, resp, body) => {
        if (resp.statusCode == 200) {
          let userResp = JSON.parse(body);
          req.session.discord = {auth: objResp.access_token, user: userResp.id, refresh: objResp.refresh_token};
          res.redirect('/');
        }
      })    
    } else {
      res.redirect('/login')
    }
  })
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/client/index.html'));
});

server.listen(80, () => console.log('Example app listening on port 80!'));