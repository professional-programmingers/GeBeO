from discord.ext import commands
import discord
import os
import requests
import glob
from helpers.filecmdhelper import *

class Images():
    def __init__(self, bot : commands.Bot):
        print("initializing images")
        self.bot = bot

    async def imagehandler(self, message : discord.Message, filename : str):
        await self.bot.upload(filename)

    @commands.command()
    async def ilist(self):
        await filelister(self.bot, "images")

    @commands.command(pass_context=True)
    async def i(self, ctx : commands.Context):
        await filegetter(self.bot, "images", ctx.message, self.imagehandler)

    @commands.command(pass_context=True)
    @commands.has_permissions(administrator=True)
    async def iadd(self, ctx : commands.Context):
        await fileadder(self.bot, "images", ctx.message)

    @commands.command(pass_context=True)
    @commands.has_permissions(administrator=True)
    async def irm(self, ctx : commands.Context):
        await fileremover(self.bot, "images", ctx.message)

def setup(bot):
    print("setting up images")

    if not os.path.exists("images"):
        os.makedirs("images")

    bot.add_cog(Images(bot))