from discord.ext import commands
import discord
from helpers.filecmdhelper import *
import asyncio
import enum
import functools
import youtube_dl

class PlayerOptions(enum.Enum):
    FILE = 1
    LINK = 2

class SoundItem():
    def __init__(self, name, location):
        self.name = name
        self.location = location

class Sounds():
    def __init__(self, bot : commands.Bot):
        print("initializing sounds")
 
        if not os.path.exists("sounds"):
            os.makedirs("sounds")

        self.bot = bot


    async def add_sound(self, ctx, source, sourcetype):
        """ Add a sound to a bot's queue. """
        if ctx.message.author.voice == None:
            await ctx.send("You're not in a voice channel!")
        else:
            # Check if any bots in guild. Warn user if not.
            # TODO: Move to Bot Manager.
            for helper in self.bot.helperList:
                if helper.is_in_guild(ctx.guild):
                    break
            else:
                await ctx.send("No helper bots in this server. Do !invite to add them.")
                return

            vchan_id = ctx.message.author.voice.channel.id
            sound = await self.parse_sound(source, sourcetype)

            # Find a bot and add to its queue.
            helper = self.choose_helper(vchan_id)
            if helper != None:
                await helper.queue_sound(vchan_id, sound)
                await ctx.send("Queueing sound!")
            else:
                await ctx.send("Sorry, there are no available bots!")


    async def parse_sound(self, source: str, sourcetype):
        """ Take a sound source and turn it into something that can be played by ffmpeg """
        if sourcetype == PlayerOptions.FILE:
            return SoundItem(source.split("/")[-1].split(".")[0], source)
        elif sourcetype == PlayerOptions.LINK:
            opts = {
                'format': 'webm[abr>0]/bestaudio/best',
                'prefer_ffmpeg': True
            }
            ydl = youtube_dl.YoutubeDL(opts)
            func = functools.partial(ydl.extract_info, source, download=False)
            info = await self.bot.loop.run_in_executor(None, func)
            print(info)
            download_url = info['url']
            video_title = info['title']
            return SoundItem(video_title, download_url)


    def choose_helper(self, channel_id):
        """ Choose an appropriate bot to play sound. """
        # Check to see if any bot is in the same channel.
        helper = self.get_helper_in_channel(channel_id)
        if helper:
            return helper

        # If not, check for free bots.
        for helper in self.bot.helperList:
            if helper.is_free() and helper.is_in_guild(self.bot.get_channel(channel_id).guild):
                return helper
        print("No helper available!")
        return None


    def get_helper_in_channel(self, channel_id):
        """ Find a bot in the given voice channel. """
        for helper in self.bot.helperList:
            if channel_id == helper.get_channel_id():
                return helper
        return None
        

    async def soundhandler(self, ctx, filename : str):
        await self.add_sound(ctx, filename, PlayerOptions.FILE)

    @commands.command()
    async def slist(self, ctx):
        """ List all available sound bites 
            USAGE: !slist
        """
        await filelister(ctx, "sounds")

    @commands.command()
    async def s(self, ctx):
        """ Play a sound bite in the voice channel. Make sure the sounds are added.
            USAGE: !s sound-name
        """
        await ctx.trigger_typing()
        try:
            await filegetter(ctx, "sounds", self.soundhandler)
        except NoNameSpecifiedError:
            await ctx.send("No sound specified! If you are looking for a list of available sounds, run `!slist`")

    @commands.command()
    async def slink(self, ctx):
        """ Play a sound link in the voice channel. Compatible with youtube, soundcloud, and almost anything.
            USAGE: !slink link
        """
        await ctx.trigger_typing()
        await self.add_sound(ctx, ctx.arg, PlayerOptions.LINK)

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def sadd(self, ctx):
        """ Add a sound bite. Admin only.
            USAGE: !sadd sound-name
            Make sure to drag the sound file onto discord!
        """
        await ctx.trigger_typing()
        await fileadder(ctx, "sounds")

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def srm(self, ctx):
        """ Remove a sound bite. Admin only.
            USAGE: !srm sound-name
        """
        await ctx.trigger_typing()
        await fileremover(ctx, "sounds")

    @commands.command()
    async def sskip(self, ctx):
        """ Skip a song or sound.
            USAGE: !sskip
        """
        await ctx.trigger_typing()
        helper = self.get_helper_in_channel(ctx.author.voice.channel.id)
        if helper:
            helper.stop_sound()
            await ctx.send("Skipped!")
        else:
            await ctx.send("You're not in a voice channel that has a bot!")

    @commands.command()
    async def sclear(self, ctx):
        """ Clear a channel's queue. 
            USAGE: !sclear
        """
        await ctx.trigger_typing()
        helper = self.get_helper_in_channel(ctx.author.voice.channel.id)
        if helper:
            await helper.clear_sound()
            await ctx.send("Cleared the queue and disconnected the bot")
        else:
            await ctx.send("You're not in a voice channel that has a bot!")

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def sclearall(self, ctx):
        """ Clear all bot's queue. Admin only.
            USAGE: !sclearall
        """
        await ctx.trigger_typing()
        for helper in self.bot.helperList:
            helper.clear_sound()
        await ctx.send("Disconnected all bots!")
    
    @commands.command(aliases=["sq"])
    async def squeue(self, ctx):
        """ Show the queue for the bot that's in your channel
            USAGE: !squeue
        """
        await ctx.trigger_typing()
        helper = self.get_helper_in_channel(ctx.author.voice.channel.id)
        if helper:
            output_message = "```"
            counter = 1
            for sound in helper.soundQueue:
                output_message += "#" + str(counter) + ": " + sound.name + "\n"
                counter += 1
            output_message += "```"
            await ctx.send(output_message)
        else:
            await ctx.send("You're not in a voice channel that has a bot!")

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def invite(self, ctx):
        # TODO: Move this code to a Bot Manager.
        """ Get all of the helper bot's permissions. """
        send_str = "Here's the helper bots' invite link!\n"
        for helper in self.bot.helperList:
            send_str += helper.get_invite_link() + '\n'
        await ctx.author.send(send_str)

def setup(bot):
    print("setting up sounds")
    bot.add_cog(Sounds(bot))
