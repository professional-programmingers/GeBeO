import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import {Bot, BotPool} from './bot';
import * as fs from 'fs';
import * as stream from 'stream';
import {spawn, ChildProcess} from 'child_process';

import speech = require( 'watson-developer-cloud/speech-to-text/v1');

interface recConfig {
  content_type: string;
  audio?: stream.Readable;
}

class _Receiver {

  private speechClient: any;
  private recConfig: any;

  constructor() {
    let credential: any;
    try {
      credential = JSON.parse(fs.readFileSync('tokens/watsonCred.json', 'utf8'));
    }
    catch (err) {
      console.log('Warning: No Watson token. Voice recognition will not work!');
      this.speechClient = null;
      return;
    }

    this.speechClient = new speech({
      username: credential.username,
      password: credential.password,
    });
    this.recConfig = {
      content_type: 'audio/l16; rate=44100',
    }
  }

  transcribe = async (voiceChannel: Discord.VoiceChannel, msg: Commando.CommandMessage): Promise<void> => {
    /* Gets in a voice channel and transcribe everything anyone says. 
     * Prints out result in the called channel.
     * Disconnects when someone says 'disconnect'.
     * */
    if(!this.speechClient) {
      throw Error('Voice recognition disabled!');
    }
    let bot: Bot = BotPool.getNextBot(voiceChannel);
    let connection: Discord.VoiceConnection = await bot.connect(voiceChannel.id);

    let receiver: Discord.VoiceReceiver = connection.createReceiver();

    let speakingCallback = async (user: Discord.User, speaking: boolean) => {
      if(speaking) {
        let stream: stream.Readable = this.convertPCMStream(receiver.createPCMStream(user));
        let transcript: string = await this.recognize(stream);
        if(msg && transcript) {
          msg.channel.send(`${user.username}: ${transcript}`);
          if(transcript.replace(/\s/g, '') == 'disconnect'){
            msg.channel.send('Disconnecting transcriber!');
            bot.disconnect(voiceChannel.id);
            connection.removeListener('speaking', speakingCallback);
          }
        }
      }
    }

    connection.on('speaking', speakingCallback);
  }

  convertPCMStream = (rs: stream.Readable): stream.Readable => {
    /* Convert an audio stream from discordjs and convert it to something google speech can parse.*/
    let ffmpeg: ChildProcess = spawn('node_modules/ffmpeg-binaries/bin/ffmpeg', ['-f', 's32le', '-i', 'pipe:0', '-f', 's16le', 'pipe:1']);
    rs.pipe(ffmpeg.stdin);
    return ffmpeg.stdout;
  }

  recognizeFile = async (fileName: string): Promise<string> => {
    /* Currently a debug method. Take a sound file from path and recognize it. */
    return await this.recognize(fs.createReadStream(fileName));
  }

  recognize = async (rs: stream.Readable): Promise<string> => {
    /* Take a readable stream of an audio file (Must be PCM 16 bit little-endian) and 
     *   run voice recognition over it.
     * Returns the transcript. Returns null if nothing was recognized.
     * */
    if(!this.speechClient) {
      throw Error('Voice recognition disabled!');
    }

    this.recConfig.audio = rs;
    let response: any;
    try{
      response = await new Promise ((resolve, reject) => {
        this.speechClient.recognize(this.recConfig, (err: any, response: any) => {
          if(err) reject(err);
          resolve(response);
        });
      });
    }
    catch (err) {
      console.log(err);
    } 
    try{
      return response.results[0].alternatives[0].transcript;
    }
    catch (err) {
      // Didn't recognize anything.
      return null;
    }
  }
}

export let Receiver: _Receiver = new _Receiver();
