import * as Discord from 'discord.js';
import * as Commando from 'discord.js-commando';
import * as fs from 'fs';

export class Bot {
  public client: Discord.Client;  // TODO: set to private.
  private voiceConnected: string[];
  private channel: Discord.VoiceChannel;
  constructor(client: Discord.Client, isMain: boolean){
    this.client = client;
    this.voiceConnected = [];

    this.client.on('ready', () => {
      console.log(`Helper ready! logged in as ${this.client.user.username}#${this.client.user.discriminator} (${this.client.user.id})`);
      if (!isMain) {
        this.client.user.setPresence({status: 'invisible'});
      }
    });
  }


  isConnectedGuild = (guildId: string): boolean => {
    /* Is this bot being used within a guild. */
    for(let voiceId of this.voiceConnected) {
      if((this.client.channels.get(voiceId) as Discord.VoiceChannel).guild.id == guildId) {
        return true;
      }
    }
    return false;
  }
  

  isInChannel = (voiceChannelId: string): boolean => {
    return this.voiceConnected.includes(voiceChannelId);
  }


  connect = async (voiceChannelId: string) : Promise<void> => {
    let voiceChannel: Discord.VoiceChannel = this.client.channels.get(voiceChannelId) as Discord.VoiceChannel;
    await voiceChannel.join();
    this.voiceConnected.push(voiceChannel.id);
  }


  disconnect = (voiceChannelId: string): void => {
    // Disconnect the bot from the given voiceChannel.
    let voiceChannel: Discord.VoiceChannel = this.client.channels.get(voiceChannelId) as Discord.VoiceChannel;
    voiceChannel.connection.disconnect();
    this.voiceConnected.splice(this.voiceConnected.indexOf(voiceChannel.guild.id), 1);
  }


  play = (voiceChannelId: string, rs: any, timeStamp = 0): Discord.StreamDispatcher => {
    /* rs is ReadableStream of a sound file. */
    let voiceChannel: Discord.VoiceChannel = this.client.channels.get(voiceChannelId) as Discord.VoiceChannel;
    return voiceChannel.connection.playStream(rs, {seek: timeStamp});
  }
}


class _BotPool {
  private botPool : Bot [];

  constructor() {
    this.botPool = [];
  }


  addBot = (client: Discord.Client, isMain: boolean): void => {
    /* Add another bot to the bot pool. */
    this.botPool.push(new Bot(client, isMain));
  }


  getNextBot = (voiceChannel: Discord.VoiceChannel): Bot => {
    for(let i = 0; i < this.botPool.length; i++){
      if(!this.botPool[i].isConnectedGuild(voiceChannel.guild.id) && this.botPool[i].client.channels.get(voiceChannel.id) != undefined){
        // Check whether bot is already used in a guild and whether it's invited to the guild.
        return this.botPool[i];
      }
    }
    return null;
  }


  botInChannel = (voiceChannel: Discord.VoiceChannel): Bot => {
    /* Returns a bot inside a channel, null if none. */
    for(let bot of this.botPool) {
      if(bot.isInChannel(voiceChannel.id)){
        return bot;
      }
    }
    return null;
  }
}


export let BotPool: _BotPool = new _BotPool();
