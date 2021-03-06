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
import {BotPool} from 'utils/bot';
import {Sound} from 'utils/sounds';
import { httpify } from 'caseless';
const sqlite = require('sqlite');
const sqlitestore = require('connect-sqlite3');


process.on('unhandledRejection', console.error);

const client: Commando.CommandoClient = new Commando.CommandoClient({
  owner: ["137429565063692289", "127564963270098944", "167460739764846592"],
  restTimeOffset: 100
});

client.setProvider(
	sqlite.open('guilds/database.sqlite3').then((db: any) => new Commando.SQLiteProvider(db))
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

BotPool.addBot(client as Discord.Client, true);

if(fs.existsSync('tokens/helper.json')){
  let helperTokens: string[] = JSON.parse(fs.readFileSync('tokens/helper.json', 'utf8'));
  for(let i = 0; i < helperTokens.length; i++){
    let bot_client: Discord.Client = new Discord.Client();
    bot_client.login(helperTokens[i]);
    BotPool.addBot(bot_client, false);
  }
}



let secret: string = fs.readFileSync('tokens/discordsecret.cfg', 'utf8');
secret = secret.replace(/\s/g, '');

let clientid: string = fs.readFileSync('tokens/discordclient.cfg', 'utf8');
clientid = clientid.replace(/\s/g, '');

const app = express();

let server = http.createServer(app);

let io = socketio(server);

let SqliteStore = sqlitestore(expresssession);

let session = expresssession({
  store: new SqliteStore({
    table: 'sessions',
    db: 'sessions.sqlite3',
    dir: 'guilds'
  }),
  secret: 'it\'s a secret to everybody',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 365
  }
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session);

io.use(sharedsession(session, {
  autoSave: true
}));

io.on('connection', async (socket: any) => {
  if (socket.handshake.session.discord == undefined) {
    socket.disconnect(true);
  }

  let user: Discord.User = await client.fetchUser(socket.handshake.session.discord.user);
  let vc: Discord.VoiceChannel = null;
  client.guilds.forEach((guild: Discord.Guild) => {
    let member = guild.members.get(user.id);
    if (member) {
      let currVc = member.voiceChannel;
      if (currVc) {
        vc = currVc;
        return;
      }
    }
  })

  if (vc) {
    let queue = Sound.getQueue(vc.id);
    let playing = Sound.getPlaying(vc.id);
    if (queue == null && playing == null) {
      socket.emit('update queue', null, null, vc.name);
    } else {
      let nameQueue: string[] = [];
      Sound.getQueue(vc.id).forEach((sounditem: any) => {
        nameQueue.push(sounditem.name);
      })
      socket.emit('update queue', nameQueue, Sound.getPlaying(vc.id).name, vc.name);  
    }  
  } else {
    socket.emit('update queue', null, null, null);
  }

  const voiceStateCallback = (oldMember: Discord.GuildMember, newMember: Discord.GuildMember) => {
    if (oldMember.user == user) {
      vc = newMember.voiceChannel;
      if (vc == null) {
        socket.emit('update queue', null, null, null);
        return;
      }
      let queue = Sound.getQueue(vc.id);
      let playing = Sound.getQueue(vc.id);
      if (queue == null && playing == null) {
        socket.emit('update queue', null, null, vc.name);
      } else {
        let nameQueue: string[] = [];
        Sound.getQueue(vc.id).forEach((sounditem: any) => {
          nameQueue.push(sounditem.name);
        })
        socket.emit('update queue', nameQueue, Sound.getPlaying(vc.id).name, vc.name || null);  
      }
    }
  }

  client.on('voiceStateUpdate', voiceStateCallback);

  const queueUpdateCallback = (queue: any, playing: any, qvcid: any) => {
    if (vc && vc.id == qvcid) {
      if (queue == null && playing == null) {
        socket.emit('update queue', null, null, vc.name || null);
        return;
      }
      let nameQueue: string[] = [];
      queue.forEach((sounditem: any) => {
        nameQueue.push(sounditem.name);
      })
      socket.emit('update queue', nameQueue, playing.name, vc.name || null);
    }
  }

  Sound.on('queue update', queueUpdateCallback)

  socket.on('queue sound', (sound: string, next: boolean) => {
    Sound.queueSound(sound, vc, next);
  })

  socket.on('skip sound', () => {
    Sound.skipSound(vc);
  })

  socket.on('clear all', () => {
    Sound.clearQueue(vc);
  })

  socket.on('disconnect', (reason: string) => {
    Sound.removeListener('queue update', queueUpdateCallback);
    client.removeListener('voiceStateUpdate', voiceStateCallback);
  })
})

app.get('/', (req: any, res: any) => {
  if (req.session.discord) {
    console.log('session found, serving html');
    res.sendFile(path.join(__dirname, '../../dist/client/index.html'));
  } else {
    console.log('session not found, redirecting to login');
    res.redirect('/login?clientid=' + clientid);
  }
})

app.get('/login', (req: any, res: any) => {
  if (req.query.clientid != clientid) {
    console.log('clientid doesn\'t match, redirecting again');
    res.redirect('/login?clientid=' + clientid);
  } else {
    console.log('serve login page');
    res.sendFile(path.join(__dirname, '../../dist/client/index.html'));
  }
})

app.get('/api/ytget', async (req: any, res: any) => {
  if (req.session.discord) {
    if (req.query.search) {
      let yttoken: string = fs.readFileSync('tokens/youtube.cfg', 'utf8');
      yttoken = yttoken.replace(/\s/g, '');
      request.get('https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + req.query.search + '&type=video&key=' + yttoken, (err, resp, body) => {
        let videos = JSON.parse(body).items;
        res.send([{
          title: videos[0].snippet.title,
          url: 'https://www.youtube.com/watch?v=' + videos[0].id.videoId,
          author: videos[0].snippet.channelTitle,
          thumbnail: videos[0].snippet.thumbnails.default.url
        }, {
          title: videos[1].snippet.title,
          url: 'https://www.youtube.com/watch?v=' + videos[1].id.videoId,
          author: videos[1].snippet.channelTitle,
          thumbnail: videos[1].snippet.thumbnails.default.url
        }, {
          title: videos[2].snippet.title,
          url: 'https://www.youtube.com/watch?v=' + videos[2].id.videoId,
          author: videos[2].snippet.channelTitle,
          thumbnail: videos[2].snippet.thumbnails.default.url
        }])  
      })

    } else {
      res.sendStatus(400);
    }
  } else {
    res.redirect('/login?clientid=' + clientid);
  }
})

app.use(express.static('dist/client'));

app.get('/redirect', (req: any, res: any) => {
  console.log(req.headers);
  let options = {
    url: 'https://discordapp.com/api/oauth2/token',
    qs: {
      client_id: clientid,
      client_secret: secret,
      grant_type: 'authorization_code',
      code: req.query.code,
      redirect_uri: req.protocol + '://' + req.get('host') + '/redirect'
    }
  }
  console.log(options);
  request.post(options, (err, resp: request.Response, body) => {
    console.log(body);
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

client.on('ready', () => {
  server.listen(8080, '0.0.0.0', () => console.log('GeBeO express server listening on port 8080!'));
})