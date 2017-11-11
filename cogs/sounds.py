from discord.ext import commands
import discord
from helpers.filecmdhelper import *
import asyncio

class Sounds():
    def __init__(self, bot : commands.Bot):
        print("initializing sounds")
 
        if not os.path.exists("sounds"):
            os.makedirs("sounds")

        self.bot = bot

    soundQueue = asyncio.Queue()
    currentVoiceClient = None

    async def play_next_sound(self):
        if not self.soundQueue.empty():
            soundItem = await self.soundQueue.get()
            if self.currentVoiceClient == None:
                self.currentVoiceClient = await soundItem[0].connect()
            if not soundItem[0].id == self.currentVoiceClient.channel.id:
                await self.currentVoiceClient.move_to(soundItem[0])
            self.currentVoiceClient.play(discord.FFmpegPCMAudio(soundItem[1]), after=self.after_sound_clip)
        else:
            await self.currentVoiceClient.disconnect()
            self.currentVoiceClient = None

    def after_sound_clip(self, error):
        self.bot.loop.create_task(self.play_next_sound())

    async def soundhandler(self, ctx, filename : str):
        vchan = ctx.message.author.voice.channel
        if vchan == None:
            await ctx.send("You're not in a voice channel!")
        else:
            await self.soundQueue.put((vchan, filename))
            if self.currentVoiceClient == None:
                await ctx.send("Playing sound!")
                await self.play_next_sound()
            else:
                await ctx.send("Queued as #" + str(self.soundQueue.qsize()))

    @commands.command()
    async def slist(self, ctx):
        await filelister(ctx, "sounds")

    @commands.command()
    async def s(self, ctx):
        try:
            await filegetter(ctx, "sounds", self.soundhandler)
        except NoNameSpecifiedError:
            await ctx.send("No sound specified! If you are looking for a list of available sounds, run `!slist`")

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def sadd(self, ctx):
        await ctx.trigger_typing()
        await fileadder(ctx, "sounds")

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def srm(self, ctx):
        await ctx.trigger_typing()
        await fileremover(ctx, "sounds")

    @commands.command()
    async def sskip(self, ctx):
        await ctx.trigger_typing()
        for vc in self.bot.voice_clients:
            for m in vc.channel.members:
                if ctx.message.author == m:
                    vc.stop()
                    await ctx.send("Skipped!")
                    return
        await ctx.send("You're not in a voice chat that the bot is in!")

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def sclear(self, ctx):
        await ctx.trigger_typing()
        self.soundQueue = asyncio.Queue()
        await self.currentVoiceClient.disconnect()
        self.currentVoiceClient = None
        await ctx.send("Cleared the queue and disconnected the bot")

    # @commands.command()
    # async def yt(self, ctx):
    #     await asyncio.sleep(0.25)
    #     await ctx.trigger_typing()
    #     vchan = ctx.message.author.voice.voice_channel
    #     if vchan == None:
    #         await self.bot.say("You're not in a voice channel!")
    #     else:
    #         voice = await self.bot.join_voice_channel(vchan)
    #         player = await voice.create_ytdl_player(ctx.arg, after=self.after_sound_clip)
    #         player.vc = voice
    #         player.start()

def setup(bot):
    print("setting up sounds")
    bot.add_cog(Sounds(bot))