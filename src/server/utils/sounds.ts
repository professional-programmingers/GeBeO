import * as Discord from 'discord.js';
import * as Commando from 'discord.js-commando';
import * as fs from 'fs';
import * as ytdl from 'ytdl-core';
import * as fh from './file_helper';
import {Bot} from './bot';


enum SoundType {
  YouTube,
  File,
}

class SoundItem {
  constructor(public name: string,
              public rs: any,
              public soundType: SoundType,
              public timeStamp?: number) {}
}

interface ChannelQueue {
  /* Represents a voice channel and its queue.*/
  channelId: string;
  queue: SoundItem[];
  bot: Bot;
  playing: SoundItem;
  dispatcher: Discord.StreamDispatcher;
}

export class SoundClass {
  private botPool: Bot[];
  private queueDict: Map<string, ChannelQueue>;  // dict of ChannelQueues. 
  private preQueue: any[];  // Helps queue up sounds without race conditions.
  private preQueueLocked: boolean;

  constructor(){
    this.queueDict = new Map();
    this.botPool = [];
    this.preQueue = [];
    this.preQueueLocked = false;
  }


  addBot = (client: Discord.Client, isMain: boolean): void => {
    /* Add another bot to the bot pool. */
    this.botPool.push(new Bot(client, isMain));
  }


  private getNextBot = (voiceChannelId: string): Bot => {
    for(let i = 0; i < this.botPool.length; i++){
      if(!this.botPool[i].isConnected(voiceChannelId) && this.botPool[i].client.channels.get(voiceChannelId) != undefined){
        // Check whether bot is already used in a guild and whether it's invited to the guild.
        return this.botPool[i];
      }
    }
    return null;
  }


  private playNext = async (voiceChannelId: string): Promise<void> => {
    /* Play the next sound in the voice channel. */
    let cQueue: ChannelQueue = this.queueDict.get(voiceChannelId);
    if (cQueue.queue.length == 0) {
      // No more sounds in queue.
      // Potential race condition if another sound gets queued up when code reaches this point.
      if(cQueue.bot) {
        cQueue.bot.disconnect(voiceChannelId);
      }
      // Delete this cQueue from the dict.
      this.queueDict.delete(voiceChannelId);
      return;
    }
    if(!cQueue.bot) {
      // If no bot is already picking up this queue.
      cQueue.bot = this.getNextBot(voiceChannelId);
      if(!cQueue.bot) {
        throw 'No bot is available';
      }
    }
    await cQueue.bot.connect(voiceChannelId);

    // Pop first sound item from queue and play it.
    cQueue.playing = cQueue.queue.shift();
    cQueue.dispatcher = cQueue.bot.play(voiceChannelId, cQueue.playing.rs, cQueue.playing.timeStamp || 0);

    // Setup a callback for when this sound finishes playing.
    cQueue.dispatcher.on('end', () => {
      this.playNext(voiceChannelId);
    });
  }


  getQueueAndPlaying = (voiceChannel: Discord.VoiceChannel): SoundItem[] => {
    return [this.queueDict.get(voiceChannel.id).playing].concat(this.queueDict.get(voiceChannel.id).queue);
  }


  chanHasBot = (voiceChannel: Discord.VoiceChannel): boolean => {
    if (this.queueDict.get(voiceChannel.id)) {
      return true;
    }
    return false;
  }


  skipSound = (voiceChannel: Discord.VoiceChannel): void => {
    this.queueDict.get(voiceChannel.id).dispatcher.end();
  }


  clearQueue = (voiceChannel: Discord.VoiceChannel): void => {
    let cQueue: ChannelQueue = this.queueDict.get(voiceChannel.id);
    if(cQueue.bot) {
      cQueue.bot.disconnect(voiceChannel.id);
    }
    this.queueDict.delete(voiceChannel.id);
  }


  getQueueMessage = (voiceChannel: Discord.VoiceChannel): string => {
    let message: string = '';
    let counter: number = 1;
    let cQueue: ChannelQueue = this.queueDict.get(voiceChannel.id);
    message += 'Playing: ' + cQueue.playing.name + '\n';
    for (let i = 0; i < cQueue.queue.length; i++) {
      if (cQueue.queue[i]) {
        message += '#' + counter + ': ' + cQueue.queue[i].name + '\n';
        counter++;  
      }
    }
    return message;
  }


  queueSound = async (soundInput: string, voiceChannel: Discord.VoiceChannel, next=false): Promise<void> => {
    /* Places sound in the prequeue, to be queued up internally.*/
    let soundPromise: Promise<SoundItem> = this.parseSoundInput(soundInput, voiceChannel);
    this.preQueue.push([soundPromise, voiceChannel.id, next]);
    try{
      await this.queueNext();
    }
    catch(err) {
      throw err;
    }
  };


  private queueNext = async (): Promise<void> => {
    /* Place the requested sound into the channel's queue. */
    if (this.preQueueLocked || this.preQueue.length == 0) {
      // Ends if function is happening already, or no more sounds to queue.
      return;
    }
    // Locks the prequeue to prevent two instances of this function from happening at the same time.
    this.preQueueLocked = true;
    let [soundPromise, voiceChannelId, next] = this.preQueue.shift();
    let soundItem: SoundItem;
    try{
      soundItem = await soundPromise;
    }
    catch(err) {
      // Something happened while parsing the sound input.
      this.preQueueLocked = false;
      throw err;
    }

    if (this.queueDict.has(voiceChannelId)){
      // Channel has a queue already.
      if(next) {
        // If sound is being queued for next position.
        this.queueDict.get(voiceChannelId).queue.unshift(soundItem);
      }
      else {
        this.queueDict.get(voiceChannelId).queue.push(soundItem);
      }
    }
    else {
      // Channel doesn't already have a queue.
      // Create a new sound queue and channel queue.
      let soundQueue: SoundItem[] = [soundItem];
      let channelQueue: ChannelQueue = {
        channelId: voiceChannelId,
        queue: soundQueue,
        bot: null,
        playing: null,
        dispatcher: null
      }
      this.queueDict.set(voiceChannelId, channelQueue);
      this.playNext(voiceChannelId);
    }
    this.preQueueLocked = false;
    this.queueNext();
  }


  private parseSoundInput = async (soundInput: string, voiceChannel: Discord.VoiceChannel): Promise<SoundItem> => {
    let soundItem: SoundItem = new SoundItem(null, null, null);

    try {
      let filePath: string = fh.getFile(soundInput, voiceChannel.guild.id, fh.FileType.Sound);
      soundItem.rs = fs.createReadStream(filePath) as any;
      soundItem.name = soundInput;
      soundItem.soundType = SoundType.File;
      return soundItem;
    } catch (err) {
      // getFile failed, not a file sound.
      // Code continues.
    }

    // Check if is a valid youtube-dl link.
    try {
      let info: ytdl.videoInfo = await ytdl.getInfo(soundInput);
      soundItem.soundType = SoundType.YouTube;
      soundItem.name = info.title;
      soundItem.rs = ytdl.downloadFromInfo(info);
      try {
        soundItem.timeStamp = this.parseTimeStamp(soundInput);
      }
      catch (err) {
        console.log("Error with parseTimeStamp:\n" + err.stack);
        soundItem.timeStamp = 0;
      }
      return soundItem;
    } catch (err) {
      // youtube-dl throws an error.
      throw 'Invalid sound file or link!';
    }
  }


  private parseTimeStamp = (link: string): number => {
    /* Parses a youtube link for time stamps.
     * Returns timestamp in seconds. Returns null if no timestamp was found.
     * Throws an error if something weird happens during processing.
     * (e.g. if youtube timestamp format changes)
     * */
    let match: any = /(t=|start=).*?(?=&|$)/.exec(link);
    if(match) {
      match = match[0];
    }
    else {
      return null;
    }

    let timeStamp: string = match.split('=')[1].toLowerCase();

    // Two possible timestamp format: 1h1m40s or 3700.
    let ret: number = 0;
    if(/h/.test(timeStamp)) {
      let hour: string;
      [hour, timeStamp] = timeStamp.split('h');
      ret += Number(hour) * 3600;
    }
    if(/m/.test(timeStamp)) {
      let minute: string;
      [minute, timeStamp] = timeStamp.split('m');
      ret += Number(minute) * 60;
    }
    // Remove trailing 's'.
    timeStamp = timeStamp.replace(/s/, '');
    ret += Number(timeStamp);
    return ret;
  }
}



// Singleton
export let Sound: SoundClass = new SoundClass();
