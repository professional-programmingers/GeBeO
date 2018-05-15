import * as fh from 'helpers/file_helper';
import * as Discord from 'discord.js';
import * as Commando from 'discord.js-commando';
import * as fs from 'fs';
import * as ytdl from 'ytdl-core';
import {Bot} from 'helpers/bot';


enum SoundType {
  YouTube,
  File,
}

class SoundItem {
  constructor(public name: string,
              public rs: any,
              public soundType: SoundType,
              public timestamp?: number) {}
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


  addBot = (client: Discord.Client): void => {
    /* Add another bot to the bot pool. */
    this.botPool.push(new Bot(client));
  }


  private getNextBot = (): Bot => {
    for(let i = 0; i < this.botPool.length; i++){
      if(this.botPool[i].isReady()){
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
        cQueue.bot.disconnect();
      }
      // Delete this cQueue from the dict.
      this.queueDict.delete(voiceChannelId);
      return;
    }
    if(!cQueue.bot) {
      // If no bot is already picking up this queue.
      cQueue.bot = this.getNextBot();
      if(!cQueue.bot) {
        throw 'No bot is available';
      }
    }
    await cQueue.bot.connect(voiceChannelId);

    // Pop first sound item from queue and play it.
    cQueue.playing = cQueue.queue.shift();
    cQueue.dispatcher = cQueue.bot.play(cQueue.playing.rs);

    // Setup a callback for when this sound finishes playing.
    cQueue.dispatcher.on('end', () => {
      this.playNext(voiceChannelId);
    });
  }


  queueSound = (soundInput: string, voiceChannel: Discord.VoiceChannel): void => {
    /* Places sound in the prequeue, to be queued up internally.*/
    let soundPromise: Promise<SoundItem> = this.parseSoundInput(soundInput, voiceChannel);
    this.preQueue.push([soundPromise, voiceChannel.id]);
    this.queueNext();
  };


  skipSound = (voiceChannel: Discord.VoiceChannel): void => {
    this.queueDict.get(voiceChannel.id).dispatcher.end();
  }


  clearQueue = (voiceChannel: Discord.VoiceChannel): void => {
    let cQueue: ChannelQueue = this.queueDict.get(voiceChannel.id);
    if(cQueue.bot) {
      cQueue.bot.disconnect();
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
      message += '#' + (i + 1) + ': ' + cQueue.queue[i].name + '\n';
    }
    return message;
  }


  private queueNext = async (): Promise<void> => {
    /* Place the requested sound into the channel's queue. */
    if (this.preQueueLocked || this.preQueue.length == 0) {
      // Ends if function is happening already, or no more sounds to queue.
      return;
    }
    // Locks the prequeue to prevent two instances of this function from happening at the same time.
    this.preQueueLocked = true;
    let [soundPromise, voiceChannelId] = this.preQueue.shift();
    let soundItem: SoundItem = await soundPromise;

    if (this.queueDict.has(voiceChannelId)){
      // Channel has a queue already.
      console.log("Adding sound to an already existing queue.");
      this.queueDict.get(voiceChannelId).queue.push(soundItem);
    }
    else {
      // Channel doesn't already have a queue.
      console.log("Adding sound to new queue.");
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
      console.log(err);
      // getFile failed, not a file sound.
      // Code continues.
    }

    // Check if is a valid youtube-dl link.
    try {
      let info: ytdl.videoInfo = await ytdl.getInfo(soundInput);
      soundItem.soundType = SoundType.YouTube;
      soundItem.name = info.title;
      soundItem.rs = ytdl.downloadFromInfo(info);
      return soundItem;
    } catch (err) {
      // youtube-dl throws an error.
    }
  }
}



// Singleton
export let Sound: SoundClass = new SoundClass();
