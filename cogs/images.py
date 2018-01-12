from discord.ext import commands
import discord
import os
import requests
import glob
import helpers.file_helper as fh
import asyncio

class Images():
    def __init__(self, bot : commands.Bot):
        print("initializing images")

        if not os.path.exists("images"):
            os.makedirs("images")

        self.bot = bot

    #async def image_handler(self, ctx, filename : str):
    #    print(filename)
    #    await ctx.channel.send(file=discord.File(filename, filename.split("/")[-1]))

    @commands.command()
    async def ilist(self, ctx):
        await fh.filelister(ctx, "images")

    @commands.command()
    async def i(self, ctx):
        await ctx.trigger_typing()
        if len(ctx.args_split) == 0:
            await ctx.send("No image specified! If you are looking for a list of available images, run `!ilist`")
            return

        file_name = fh.file_getter("images", ctx.args_split[0].lower())
        await ctx.send(file=discord.File(file_name, file_name.split("/")[-1]))

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def iadd(self, ctx):
        await ctx.trigger_typing()
        await fh.fileadder(ctx, "images")

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def irm(self, ctx):
        await ctx.trigger_typing()
        await fh.fileremover(ctx, "images")

def setup(bot):
    print("setting up images")
    bot.add_cog(Images(bot))
