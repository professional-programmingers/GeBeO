from discord.ext import commands
import discord
import os
import requests
import glob
from helpers.filecmdhelper import *
import asyncio

class Images():
    def __init__(self, bot : commands.Bot):
        print("initializing images")

        if not os.path.exists("images"):
            os.makedirs("images")

        self.bot = bot

    async def imagehandler(self, ctx, filename : str):
        print(filename)
        await ctx.channel.send(file=discord.File(filename, filename.split("/")[-1]))

    @commands.command()
    async def ilist(self, ctx):
        await filelister(ctx, "images")

    @commands.command()
    async def i(self, ctx):
        await ctx.trigger_typing()
        try:
            await filegetter(ctx, "images", self.imagehandler)
        except NoNameSpecifiedError:
            await ctx.send("No image specified! If you are looking for a list of available images, run `!ilist`")

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def iadd(self, ctx):
        await ctx.trigger_typing()
        await fileadder(ctx, "images")

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def irm(self, ctx):
        await ctx.trigger_typing()
        await fileremover(ctx, "images")

def setup(bot):
    print("setting up images")
    bot.add_cog(Images(bot))