from discord.ext import commands
import discord
import os
import requests
import glob
from helpers.filecmdhelper import *

class Images():
    def __init__(self, bot : commands.Bot):
        print("initializing images")

        if not os.path.exists("images"):
            os.makedirs("images")

        self.bot = bot

    async def imagehandler(self, message : discord.Message, filename : str):
        await self.bot.upload(filename)

    @commands.command()
    async def ilist(self):
        await filelister(self.bot, "images")

    @commands.command(pass_context=True)
    async def i(self, ctx : commands.Context):
        await self.bot.type()
        try:
            await filegetter(self.bot, "images", ctx, self.imagehandler)
        except NoNameSpecifiedError:
            await self.bot.say("No image specified! If you are looking for a list of available images, run `!ilist`")

    @commands.command(pass_context=True)
    @commands.has_permissions(administrator=True)
    async def iadd(self, ctx : commands.Context):
        await self.bot.type()
        await fileadder(self.bot, "images", ctx)

    @commands.command(pass_context=True)
    @commands.has_permissions(administrator=True)
    async def irm(self, ctx : commands.Context):
        await self.bot.type()
        await fileremover(self.bot, "images", ctx)

def setup(bot):
    print("setting up images")
    bot.add_cog(Images(bot))