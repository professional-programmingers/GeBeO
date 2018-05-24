"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Discord = require("discord.js");
const Commando = require("discord.js-commando");
const path = require("path");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const uuid = require("uuid/v4");
const sounds_1 = require("utils/sounds");
const sqlite = require('sqlite');
const cookieSession = require('cookie-session');
process.on('unhandledRejection', console.error);
const client = new Commando.CommandoClient({
    owner: ["137429565063692289", "127564963270098944", "167460739764846592"],
    restTimeOffset: 100
});
client.setProvider(sqlite.open(path.join(__dirname, 'guilds/database.sqlite3')).then((db) => new Commando.SQLiteProvider(db))).catch(console.error);
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
});
client.on("error", (e) => { console.error(e); });
client.on("warn", (e) => { console.warn(e); });
client.on("commandError", (command, err, message, args, pattern) => {
    console.log("Error from command: " + command.name);
    console.log(err);
});
client.on('raw', (event) => __awaiter(this, void 0, void 0, function* () {
    if (event.t !== 'MESSAGE_REACTION_ADD' && event.t !== 'MESSAGE_REACTION_REMOVE')
        return;
    const { d: data } = event;
    const user = client.users.get(data.user_id);
    const channel = client.channels.get(data.channel_id) || (yield user.createDM());
    if (channel.messages.has(data.message_id))
        return;
    const message = yield channel.fetchMessage(data.message_id);
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    const reaction = message.reactions.get(emojiKey);
    if (event.t == 'MESSAGE_REACTION_ADD')
        client.emit('messageReactionAdd', reaction, user);
    if (event.t == 'MESSAGE_REACTION_REMOVE')
        client.emit('messageReactionRemove', reaction, user);
}));
let listeners = ['expando', 'daydetector', 'soundcleanup'];
for (let i = 0; i < listeners.length; i++) {
    const listener = require('./listeners/' + listeners[i]);
    listener(client);
}
let token = fs.readFileSync('tokens/discord.cfg', 'utf8');
token = token.replace(/\s/g, '');
client.login(token);
sounds_1.Sound.addBot(client, true);
if (fs.existsSync('tokens/helper.json')) {
    let helperTokens = JSON.parse(fs.readFileSync('tokens/helper.json', 'utf8'));
    for (let i = 0; i < helperTokens.length; i++) {
        let bot_client = new Discord.Client();
        bot_client.login(helperTokens[i]);
        sounds_1.Sound.addBot(bot_client, false);
    }
}
let secret = fs.readFileSync('tokens/discordsecret.cfg', 'utf8');
let tokenStore = new Map();
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
    secret: 'it\'s a secret to everybody',
    maxAge: 365 * 24 * 60 * 60 * 1000
}));
app.get('/', (req, res) => {
    if (req.session.id && tokenStore.get(req.session.id)) {
        res.sendFile(path.join(__dirname, '../../dist/client/index.html'));
    }
    else {
        res.redirect('/login');
    }
});
app.use(express.static('dist/client'));
app.get('/api/queue', (req, res) => {
    console.log(tokenStore.get(req.session.id));
    let options = {
        url: 'https://discordapp.com/api/v6/users/@me',
        headers: {
            'Authorization': 'Bearer ' + tokenStore.get(req.session.id)
        }
    };
    request.get(options, (err, resp, body) => __awaiter(this, void 0, void 0, function* () {
        console.log(body);
        if (resp.statusCode == 200) {
            let objResp = JSON.parse(body);
            let user = yield client.fetchUser(objResp.id);
            console.log('user: ' + user.id);
            let vc;
            client.guilds.forEach((guild) => {
                vc = guild.members.get(user.id).voiceChannel;
            });
            console.log('vc: ' + vc.id);
            let nameQueue = [];
            console.log(sounds_1.Sound);
            sounds_1.Sound.getQueueAndPlaying(vc).forEach(queue => { nameQueue.push(queue.name); });
            console.log('queue: ' + nameQueue);
            res.json(nameQueue);
        }
    }));
});
app.get('/redirect', (req, res) => {
    let options = {
        url: 'https://discordapp.com/api/oauth2/token',
        qs: {
            client_id: '331891933066690560',
            client_secret: secret,
            grant_type: 'authorization_code',
            code: req.query.code,
            redirect_uri: 'http://localhost/redirect'
        }
    };
    request.post(options, (err, resp, body) => {
        if (resp.statusCode == 200) {
            let id = uuid();
            let objResp = JSON.parse(body);
            if (req.session.id) {
                tokenStore.delete(req.session.id);
            }
            req.session = { id: id };
            tokenStore.set(id, objResp.access_token);
            res.redirect('/');
        }
        else {
            res.redirect('/login');
        }
    });
});
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/client/index.html'));
});
app.listen(80, () => console.log('Example app listening on port 80!'));
//# sourceMappingURL=GeBeO.js.map