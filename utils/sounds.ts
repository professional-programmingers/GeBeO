import * as fh from 'helpers/file_helper';
import * as Discord from 'discord.js';
import * as Commando from 'discord.js-commando';
import * as fs from 'fs';
import {Bot} from 'helpers/bot';
const youtubedl = require('youtube-dl');


enum SoundType {
  Link,
  File,
}

class SoundItem {
  constructor(public name: string,
              public location: string,
              public soundType: SoundType,
              public timestamp?: number) {}
  // rs contains the sound information. VoiceConnection.playStream will play directly from this.
  // rs is a ReadableStream. Not typed because it might store youtubedl streams, which has emitters that ReadableStream doesn't have.
}

interface ChannelQueue {
  /* Represents a voice channel and its queue.*/
  channelId: string;
  queue: SoundItem[];
  bot: Bot;
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
    let dispatcher: Discord.StreamDispatcher = cQueue.bot.play(cQueue.queue.shift().location);

    // Setup a callback for when this sound finishes playing.
    dispatcher.on('end', () => {
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
    this.playNext(voiceChannel.id);
  }


  clearQueue = (voiceChannel: Discord.VoiceChannel): void => {
    this.queueDict.get(voiceChannel.id).queue = []
    this.playNext(voiceChannel.id);
  }


  getQueueMessage = (voiceChannel: Discord.VoiceChannel): string => {
    let message: string = '';
    let queue: SoundItem[] = this.queueDict.get(voiceChannel.id).queue;
    for (let i = 0; i < queue.length; i++) {
      message += '#' + (i + 1) + ': ' + queue[i].name + '\n';
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
      }
      this.queueDict.set(voiceChannelId, channelQueue);
      this.playNext(voiceChannelId);
    }
    this.preQueueLocked = false;
    this.queueNext();
  }


  private parseSoundInput = async (soundInput: string, voiceChannel: Discord.VoiceChannel): Promise<SoundItem> => {
    /* Parse the sound input into a SoundItem. Returns a SoundItem. */
    let soundItem: SoundItem = null;

    let filePath: string = null;
    try {
      filePath = fh.getFile(soundInput, voiceChannel.guild.id, fh.FileType.Sound);
    } catch (err) {
      console.log(err);
      // getFile failed, not a file sound.
      // Code continues.
    }

    if (filePath) {
      soundItem = new SoundItem(soundInput, filePath, SoundType.File);
      return soundItem;
    }

    let output: any = null;
    try {
      output = await new Promise ((resolve, reject) => {
        youtubedl.getInfo(soundInput, [], (err: any, jsonOutput: any) => {
          if (err) throw err;
          resolve(jsonOutput);
        });
      });
    } catch (err) {
      console.log(err);
      // youtube-dl throws an error.
    }

    if (output) {
      soundItem = new SoundItem(output.title, output.url, SoundType.Link);
    }

    return soundItem;
  }
}


// Singleton
export let Sound: SoundClass = new SoundClass();
