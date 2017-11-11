from discord.ext import commands
import asyncio

class DebugCmds():
    def __init__(self, bot : commands.Bot):
        print("initializing debugcmds")
        self.bot = bot

    debugarg = False

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def d(self, ctx):
        await ctx.trigger_typing()
        if self.bot.config["debug"]:
            exec(ctx.arg)

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def headcount(self, ctx):
        await ctx.send("here!")

def setup(bot : commands.Bot):
    print("setting up debugcmds")
    bot.add_cog(DebugCmds(bot))
