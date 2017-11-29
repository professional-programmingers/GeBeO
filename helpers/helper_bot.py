import threading
import discord
from discord.ext import commands
import asyncio
import youtube_dl

class HelperBot(commands.Bot):
    """ 
    Helper bot that gets spawned in a different thread to help the main bot with various things.
    The general pattern for the class is:
    - Variables should not be modified externally. Variables should be modified by methods only. (it's OOP)
    """
    def __init__(self, **kwargs):
        super().__init__(kwargs)
        self.soundQueue = []
        self.currentVoiceClient = None


    async def join_channel(self, channel_id):
        """ Join a voice channel if not in it. """
        channel = self.get_channel(channel_id)
        if not self.currentVoiceClient:
            self.currentVoiceClient = await channel.connect()
        elif not channel_id == self.currentVoiceClient.channel.id:
            await self.currentVoiceClient.move_to(channel)


    async def disconnect(self):
        """ Disconnect from the current voice channel. """
        if self.currentVoiceClient:
            await self.currentVoiceClient.disconnect()
            self.currentVoiceClient = None
        

    async def queue_sound(self, channel_id, sound):
        """ Add a sound to the queue. If no sound in queue yet, add then start playing."""
        self.soundQueue.append(sound)
        if self.is_free():
            await self.join_channel(channel_id)
            await self.play_next_sound()


    async def play_next_sound(self):
        """ Play the next sound in queue. If none, disconnect """
        if len(self.soundQueue) != 0:
            sound = self.soundQueue[0]
            del self.soundQueue[0]
            self.currentVoiceClient.play(discord.FFmpegPCMAudio(sound.location), after=self.after_sound_clip)
        else:
            await self.disconnect()

    def after_sound_clip(self, error):
        self.loop.create_task(self.play_next_sound())


    def stop_sound(self):
        if self.currentVoiceClient:
            self.currentVoiceClient.stop()

    async def clear_sound(self):
        self.soundQueue = []
        await self.disconnect()

    def is_free(self):
        return not self.currentVoiceClient

    def get_channel_id(self):
        if not self.currentVoiceClient:
            return None
        return self.currentVoiceClient.channel.id

    def is_in_guild(self, guild_id):
        return guild_id in self.guilds

    async def on_ready(self):
        await self.change_presence(status=discord.Status.invisible)
        print("Helper bot ready!")

    def get_invite_link(self):
        return "<https://discordapp.com/oauth2/authorize?client_id=" + str(self.user.id) + "&scope=bot&permissions=2146958583>"
