from discord.ext import commands
import asyncio
import BotGeBeO

class DebugCmds():
    def __init__(self, bot : BotGeBeO.BotGeBeO):
        print("initializing debugcmds")
        self.bot = bot

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def headcount(self, ctx):
        await ctx.send("here!")

def setup(bot : commands.Bot):
    print("setting up debugcmds")
    bot.add_cog(DebugCmds(bot))
