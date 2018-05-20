import * as Discord from 'discord.js';
import * as Commando from 'discord.js-commando';
import * as fs from 'fs';

export class Bot {
  public client: Discord.Client;  // TODO: set to private.
  private ready: boolean;
  private channel: Discord.VoiceChannel;
  private connection: Discord.VoiceConnection;
  constructor(client: Discord.Client, isMain: boolean){
    this.client = client;
    this.ready = true;
    this.connection = null;

    this.client.on('ready', () => {
      console.log(`Helper ready! logged in as ${this.client.user.username}#${this.client.user.discriminator} (${this.client.user.id})`);
      if (!isMain) {
        this.client.user.setPresence({status: 'invisible'});
      }
    });
  }


  isReady = (): boolean => {
    return this.ready;
  }


  connect = async (voiceChannelId: string) : Promise<void> => {
    let voiceChannel: Discord.VoiceChannel = this.client.channels.get(voiceChannelId) as Discord.VoiceChannel;
    this.connection = await voiceChannel.join();
    this.ready = false;
  }


  disconnect = (): void => {
    this.connection.disconnect();
    this.ready = true;
  }


  play = (rs: any, timeStamp = 0): Discord.StreamDispatcher => {
    /* rs is ReadableStream of a sound file. */
    return this.connection.playStream(rs, {seek: timeStamp});
  }
}
