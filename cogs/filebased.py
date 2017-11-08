from discord.ext import commands
import discord
import os
import requests

class Debug():
    def __init__(self, bot : commands.Bot):
        print("initializing filebased")
        self.bot = bot

    async def filelister(self, dir : str):
        listoffiles = ""
        for f in sorted(os.listdir(dir)):
            listoffiles += f.split(".")[0] + "\n"
        await self.bot.say(listoffiles)

    async def filegetter(self, dir : str, message : discord.Message, handler):
        args_split = message.content.split(' ')[1:]
        for f in os.listdir(dir):
            if f.split(".")[0] == args_split[0].lower():
                await handler(message, dir + "/" + f)
                break

    async def imagehandler(self, message : discord.Message, filename : str):
        await self.bot.send_file(message.channel, filename)

    def after_sound_clip(self, player):
        player.vc.loop.create_task(player.vc.disconnect())

    async def soundhandler(self, message : discord.Message, filename : str):
        vchan = message.author.voice.voice_channel
        if vchan == None:
            await self.bot.say("You're not in a voice channel!")
        else:
            voice = await self.bot.join_voice_channel(vchan)
            player = voice.create_ffmpeg_player(filename, after=self.after_sound_clip)
            player.vc = voice
            player.start()

    async def fileadder(self, dir : str, message : discord.Message):
        args_split = message.content.split(' ')[1:]
        if len(message.attachments) == 0:
            fileerror = "Remember to attach a file"
            await self.bot.say(fileerror)
        else:
            fileattachment = message.attachments[0]
            print(fileattachment)
            if len(args_split) == 0:
                nameerror = "Please specify a name for the file"
                await self.bot.say(nameerror)
            else:
                f = open(dir + "/" + args_split[0].lower() + "." + fileattachment["url"].split(".")[-1], "wb")
                f.write(requests.get(fileattachment["url"]).content)
                f.close()
                await self.bot.say("Successfully added " + args_split[0].lower())
        await self.bot.delete_message(message)

    async def fileremover(self, dir : str, message : discord.Message):
        args_split = message.content.split(' ')[1:]
        if len(args_split) == 0:
            await self.bot.say("Which file do I rm?")
        else:
            for f in os.listdir(dir):
                if f.split(".")[0] == args_split[0]:
                    os.remove(dir + "/" + f)
                    await self.bot.say("Removed " + f.split(".")[0])
                    break

    @commands.command()
    async def ilist(self):
        await self.filelister("images")

    @commands.command(pass_context=True)
    async def i(self, ctx : commands.Context):
        await self.filegetter("images", ctx.message, self.imagehandler)

    @commands.command(pass_context=True)
    async def iadd(self, ctx : commands.Context):
        await self.fileadder("images", ctx.message)

    @commands.command(pass_context=True)
    async def irm(self, ctx : commands.Context):
        await self.fileremover("images", ctx.message)

    @commands.command()
    async def slist(self):
        await self.filelister("sounds")

    @commands.command(pass_context=True)
    async def s(self, ctx : commands.Context):
        await self.filegetter("sounds", ctx.message, self.soundhandler)

    @commands.command(pass_context=True)
    async def sadd(self, ctx : commands.Context):
        await self.fileadder("sounds", ctx.message)

    @commands.command(pass_context=True)
    async def srm(self, ctx : commands.Context):
        await self.fileremover("sounds", ctx.message)

    @commands.command(pass_context=True)
    async def sstop(self, ctx : commands.Context):
        for vc in self.bot.voice_clients:
            for m in vc.channel.voice_members:
                if ctx.message.author == m:
                    await vc.disconnect()
                    return
        await self.bot.say("You're not in a voice chat that the bot is in!")

    @commands.command(pass_context=True)
    async def yt(self, ctx : commands.Context):
        vchan = ctx.message.author.voice.voice_channel
        if vchan == None:
            await bot.send_message(message.channel, "You're not in a voice channel!")
        else:
            voice = await bot.join_voice_channel(vchan)
            player = await voice.create_ytdl_player(arg, after=self.after_sound_clip)
            player.vc = voice
            player.start()

def setup(bot):
    print("setting up filebased")
    bot.add_cog(Debug(bot))