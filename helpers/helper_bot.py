import threading
import discord
from discord.ext import commands
import asyncio
import youtube_dl

class HelperBot(commands.Bot):
    def __init__(self, token, mainBot, **kwargs):
        super().__init__(kwargs)
        self.soundQueue = asyncio.Queue()
        self.currentVoiceClient = None
        asyncio.run_coroutine_threadsafe(self._run(token), self.loop)

    async def _run(self, token):
        self.run(token)


    def join_channel(self, channel_id):
        asyncio.run_coroutine_threadsafe(self._join_channel(channel_id), self.loop)

    async def _join_channel(self, channel_id):
        """ Join a voice channel if not in it. """
        channel = self.get_channel(channel_id)
        if not self.currentVoiceClient:
            self.currentVoiceClient = await channel.connect()
        elif not channel_id == self.currentVoiceClient.channel.id:
            await self.currentVoiceClient.move_to(channel)


    def disconnect(self):
        asyncio.run_coroutine_threadsafe(self._disconnect(), self.loop)

    async def _disconnect(self):
        if self.currentVoiceClient:
            await self.currentVoiceClient.disconnect()
            self.currentVoiceClient = None
        

    def queue_sound(self, channel_id, sound):
        print("Queueing sound!")
        asyncio.run_coroutine_threadsafe(self._queue_sound(channel_id, sound), self.loop)

    async def _queue_sound(self, channel_id, sound):
        """ Add a sound to the queue. If no sound in queue yet, add then start playing."""
        await self.soundQueue.put(sound)
        if self.is_free():
            await self._join_channel(channel_id)
            await self._play_next_sound()


    def play_next_sound(self):
        asyncio.run_coroutine_threadsafe(self._play_next_sound(), self.loop)

    async def _play_next_sound(self):
        """ Play the next sound in queue. If none, disconnect """
        if not self.soundQueue.empty():
            sound = await self.soundQueue.get()
            self.currentVoiceClient.play(discord.FFmpegPCMAudio(sound), after=self.after_sound_clip)
        else:
            self.disconnect()

    def after_sound_clip(self, error):
        self.play_next_sound()


    def stop_sound(self):
        if self.currentVoiceClient:
            self.currentVoiceClient.stop()

    def clear_sound(self):
        self.soundQueue = asyncio.Queue()
        self.disconnect()

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
