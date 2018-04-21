import threading
import discord
from discord.ext import commands
import asyncio
import youtube_dl

class HelperBot(commands.Bot):
    """
    Helper bot that gets spawned by GeBeO to handle playing sounds in multiple channels in one server at once.

    Must be run using start() and NOT run() (run is blocking)
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


    async def queue_sound(self, channel_id, sound, play_next):
        """ Add a sound to the queue. If no sound in queue yet, add then start playing."""
        if play_next and not len(self.soundQueue) == 0:
            self.soundQueue.insert(1, sound)
        else:
            self.soundQueue.append(sound)
        if self.is_free():
            await self.join_channel(channel_id)
            await self.play_next_sound()


    async def play_next_sound(self):
        """ Play the next sound in queue. If none, disconnect """
        if len(self.soundQueue) != 0:
            sound = self.soundQueue[0]
            if not sound.timestamp or sound.timestamp == -1:
                self.currentVoiceClient.play(discord.FFmpegPCMAudio(
                    sound.location),
                    after=self.after_sound_clip)
            else:
                self.currentVoiceClient.play(discord.FFmpegPCMAudio(
                    sound.location,
                    before_options="-ss " + str(sound.timestamp)),
                    after=self.after_sound_clip)
        else:
            await self.disconnect()

    def after_sound_clip(self, error):
        del self.soundQueue[0]
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
