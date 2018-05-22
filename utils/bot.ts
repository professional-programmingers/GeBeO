import * as Discord from 'discord.js';
import * as Commando from 'discord.js-commando';
import * as fs from 'fs';

export class Bot {
  public client: Discord.Client;  // TODO: set to private.
  private guildConnected: string[];
  private channel: Discord.VoiceChannel;
  constructor(client: Discord.Client, isMain: boolean){
    this.client = client;
    this.guildConnected = [];

    this.client.on('ready', () => {
      console.log(`Helper ready! logged in as ${this.client.user.username}#${this.client.user.discriminator} (${this.client.user.id})`);
      if (!isMain) {
        this.client.user.setPresence({status: 'invisible'});
      }
    });
  }


  isConnected = (guildId: string): boolean => {
    /* Is this bot being used within a guild. */
    return this.guildConnected.includes(guildId);
  }


  connect = async (voiceChannelId: string) : Promise<void> => {
    let voiceChannel: Discord.VoiceChannel = this.client.channels.get(voiceChannelId) as Discord.VoiceChannel;
    await voiceChannel.join();
    this.guildConnected.push(voiceChannel.guild.id);
  }


  disconnect = (voiceChannelId: string): void => {
    // Disconnect the bot from the given voiceChannel.
    let voiceChannel: Discord.VoiceChannel = this.client.channels.get(voiceChannelId) as Discord.VoiceChannel;
    voiceChannel.connection.disconnect();
    this.guildConnected.splice(this.guildConnected.indexOf(voiceChannel.guild.id), 1);
  }


  play = (voiceChannelId: string, rs: any, timeStamp = 0): Discord.StreamDispatcher => {
    /* rs is ReadableStream of a sound file. */
    let voiceChannel: Discord.VoiceChannel = this.client.channels.get(voiceChannelId) as Discord.VoiceChannel;
    return voiceChannel.connection.playStream(rs, {seek: timeStamp});
  }
}
