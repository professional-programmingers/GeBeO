from discord.ext import commands
import re
import discord
import helpers.file_helper as fh
import os
import asyncio
import enum
import functools
import youtube_dl
import requests
import random
import traceback

class PlayerOptions(enum.Enum):
    FILE = 1
    LINK = 2

class SoundItem():
    def __init__(self, name, location, timestamp=None):
        self.name = name
        self.location = location
        self.timestamp = timestamp

class Sounds():
    def __init__(self, bot : commands.Bot):
        print("initializing sounds")
 
        if not os.path.exists("sounds"):
            os.makedirs("sounds")

        self.bot = bot


    async def add_sound(self, ctx, source, play_next=False):
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
            sound = await self.parse_sound(source)
            if not sound:
                await ctx.send("Invalid sound name or invalid youtube link!")
                return

            # Report if there was error processing timestamp.
            if self._parse_for_timestamp(source) == -1:
                await ctx.send(":sweat: Oops! Something went wrong while processing that timestamp. Starting at the beginning.")

            # Find a bot and add to its queue.
            helper = self.choose_helper(vchan_id)
            if helper != None:
                await helper.queue_sound(vchan_id, sound, play_next)
                await ctx.send("Queueing " + sound.name + "!")
            else:
                await ctx.send("Sorry, there are no available bots!")


    async def parse_sound(self, source: str):
        """ Take a sound source and turn it into something that can be played by ffmpeg
            Returns a SoundItem if successful. None if otherwise.
        """

        file_name = fh.file_getter("sounds", source.lower())
        if file_name:
            source = file_name
            return SoundItem(source.split("/")[-1].split(".")[0], source)

        # Use youtube-dl instead.
        opts = {
            'format': 'webm[abr>0]/bestaudio/best',
            'prefer_ffmpeg': True
        }
        ydl = youtube_dl.YoutubeDL(opts)
        func = functools.partial(ydl.extract_info, source, download=False)
        try:
            info = await self.bot.loop.run_in_executor(None, func)
            download_url = info['url']
            video_title = info['title']
            return SoundItem(video_title, download_url, self._parse_for_timestamp(source))
        except youtube_dl.utils.DownloadError:
            return None
            


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
        await fh.filelister(ctx, "sounds")

    @commands.command()
    async def s(self, ctx):
        """ Play a sound bite in the voice channel. Make sure the sounds are added.
            USAGE: !s sound-name
        """
        await ctx.trigger_typing()
        if len(ctx.args_split) == 0:
            await ctx.send("No sound specified! If you are looking for a list of available sounds, run `!slist`")
            return
        await self.add_sound(ctx, ctx.arg)

    @commands.command(aliases=['sn'])
    @commands.has_permissions(administrator=True)
    async def snext(self, ctx):
        """ Play a sound bite in the voice channel. Make sure the sounds are added.
            USAGE: !s sound-name
        """
        await ctx.trigger_typing()
        if len(ctx.args_split) == 0:
            await ctx.send("No sound specified! If you are looking for a list of available sounds, run `!slist`")
            return
        await self.add_sound(ctx, ctx.arg, True)

    @commands.command()
    async def syt(self, ctx):
        await ctx.trigger_typing()
        f = open("tokens/youtube.cfg", "r")
        youtube_token = f.read().strip()
        f.close()
        if len(ctx.args_split) == 0:
            await ctx.send("No search specified")
            return
        r = requests.get("https://www.googleapis.com/youtube/v3/search", params = {"part": "snippet", "q": ctx.arg, "type": "video", "key": youtube_token})
        print(r.json())
        await self.add_sound(ctx, "https://www.youtube.com/watch?v=" + r.json()["items"][0]["id"]["videoId"])

    @commands.command(aliases=['sr'])
    async def srandom(self, ctx):
        file_list = sorted(os.listdir('sounds'))
        await self.add_sound(ctx, file_list[random.randrange(len(file_list))].split("/")[-1].split(".")[0])

    @commands.command()
    async def slink(self, ctx):
        """ Play a sound link in the voice channel. Compatible with youtube, soundcloud, and almost anything.
            USAGE: !slink link
        """
        await ctx.trigger_typing()
        await ctx.send("This command is deprecated. Use !s instead.")

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def sadd(self, ctx):
        """ Add a sound bite. Admin only.
            USAGE: !sadd sound-name
            Make sure to drag the sound file onto discord!
        """
        await ctx.trigger_typing()
        await fh.fileadder(ctx, "sounds")

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def srm(self, ctx):
        """ Remove a sound bite. Admin only.
            USAGE: !srm sound-name
        """
        await ctx.trigger_typing()
        await fh.fileremover(ctx, "sounds")

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
            await helper.clear_sound()
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
            counter = 0
            for sound in helper.soundQueue:
                num = ""
                if counter == 0:
                    num = "Now"
                else:
                    num = "#" + str(counter)
                output_message += num + ": " + sound.name + "\n"
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


    def _parse_for_timestamp(self, link):
        """ Parses a youtube link to extract timestamp.
            Returns timestamp in seconds. Returns None if no timestamp found.
            Returns -1 if something weird happened while processing timestamp.
        """
        # That regex captures the time between t= and (& or end of line), excluding those chars.
        match = re.search('(?<=t=).*?(?=&|$)', link)
        if not match:
            return None
        timestamp = link[match.start():match.end()]
        # Two possible timestamp format: '1h1m40s', or '3700'.
        try:
            ret = 0
            if 'h' in timestamp.lower():
                hour, timestamp = timestamp.lower().split('h')
                ret += int(hour) * 3600
            if 'm' in timestamp.lower():
                minute, timestamp = timestamp.lower().split('m')
                ret += int(minute) * 60
            # Remove any trailing 's'
            timestamp = timestamp.lower().rstrip('s')
            ret += int(timestamp)
            return ret
        except:  # Except all errors here and print a traceback.
            traceback.print_exc()
            return -1


def setup(bot):
    print("setting up sounds")
    bot.add_cog(Sounds(bot))
